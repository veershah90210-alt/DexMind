import logging
import asyncio
from typing import Dict, Any, List, Optional
from pymongo import UpdateOne
from app.services.pokeapi import PokeAPIService
from app.rag.embeddings import embed_texts
from app.database import get_source_docs_col, get_pokemon_col, get_dex_chunks_col

logger = logging.getLogger("dexmind.ingestion")

# Ingestion progress tracking
ingestion_state = {
    "is_ingesting": False,
    "progress": 0,
    "total": 151,
    "current_pokemon": "",
    "error": None,
    "stats": {
        "pokemon_indexed": 0,
        "chunks_indexed": 0,
        "source_docs_indexed": 0
    }
}

def calculate_type_matchups(types_detailed: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Computes combined type multipliers for dual typing and offensive super-effective coverage."""
    all_types = [
        "normal", "fire", "water", "grass", "electric", "ice",
        "fighting", "poison", "ground", "flying", "psychic", "bug",
        "rock", "ghost", "dragon", "steel", "dark", "fairy"
    ]
    multipliers = {t: 1.0 for t in all_types}
    super_effective_against = set()

    for t in types_detailed:
        if not isinstance(t, dict):
            continue
        dr = t.get("damage_relations", {})
        for double_type in dr.get("double_damage_from", []):
            if double_type in multipliers:
                multipliers[double_type] *= 2.0
        for half_type in dr.get("half_damage_from", []):
            if half_type in multipliers:
                multipliers[half_type] *= 0.5
        for no_type in dr.get("no_damage_from", []):
            if no_type in multipliers:
                multipliers[no_type] *= 0.0

        for super_eff in dr.get("double_damage_to", []):
            super_effective_against.add(super_eff.capitalize())

    weaknesses = [f"{t.capitalize()} (2x)" if m == 2.0 else f"{t.capitalize()} (4x)" for t, m in multipliers.items() if m > 1.0]
    resistances = [f"{t.capitalize()} (0.5x)" if m == 0.5 else f"{t.capitalize()} (0.25x)" for t, m in multipliers.items() if 0.0 < m < 1.0]
    immunities = [t.capitalize() for t, m in multipliers.items() if m == 0.0]

    return {
        "multipliers": multipliers,
        "super_effective_against": sorted(list(super_effective_against)),
        "weaknesses": weaknesses,
        "resistances": resistances,
        "immunities": immunities
    }

def create_chunks_for_pokemon(p: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generates granular text chunks for a Pokémon."""
    p_id = p["id"]
    p_name = p["name"]
    p_gen = p.get("generation", 1)
    type_names = [t["name"] for t in p["types"]]
    type_str = " and ".join(type_names) if type_names else "Unknown"
    source_url = f"https://pokeapi.co/api/v2/pokemon/{p_id}"
    genus = p.get("genus", "")

    chunks = []

    # 1. Overview & Stats Chunk
    stats = p["stats"]
    ability_names = [ab["name"] + (" (Hidden)" if ab.get("is_hidden") else "") for ab in p["abilities"]]
    abilities_str = ", ".join(ability_names) if ability_names else "None"
    overview_text = (
        f"{p_name} is a {type_str}-type Pokémon ({genus}). "
        f"Its base HP is {stats['hp']}, Attack is {stats['attack']}, Defense is {stats['defense']}, "
        f"Special Attack is {stats['special_attack']}, Special Defense is {stats['special_defense']}, "
        f"and Speed is {stats['speed']} (Base Stat Total: {stats['total']}). "
        f"Its abilities include {abilities_str}. "
        f"Height is {p.get('height')} m, weight is {p.get('weight')} kg."
    )
    chunks.append({
        "_id": f"chunk_{p_id}_overview",
        "source_id": f"pokeapi_pokemon_{p_id}",
        "pokemon_id": p_id,
        "pokemon_name": p_name,
        "generation": p_gen,
        "content_type": "overview_stats",
        "language": "en",
        "version_group": "all",
        "content": overview_text,
        "source_url": source_url
    })

    # 2. Abilities Chunk
    for idx, ab in enumerate(p["abilities"]):
        effect = ab.get("effect") or ab.get("short_effect") or "No description available."
        hidden_str = "Hidden Ability" if ab.get("is_hidden") else "Standard Ability"
        ab_text = f"{p_name} has the {hidden_str} '{ab['name']}': {effect}"
        chunks.append({
            "_id": f"chunk_{p_id}_ability_{idx}",
            "source_id": f"pokeapi_pokemon_{p_id}",
            "pokemon_id": p_id,
            "pokemon_name": p_name,
            "generation": p_gen,
            "content_type": "ability",
            "language": "en",
            "version_group": "all",
            "content": ab_text,
            "source_url": ab.get("url") or source_url
        })

    # 3. Evolution Chain Chunk
    if p.get("evolution_text"):
        evo_text = f"Evolution chain for {p_name}: {p['evolution_text']}"
        chunks.append({
            "_id": f"chunk_{p_id}_evolution",
            "source_id": f"pokeapi_pokemon_{p_id}",
            "pokemon_id": p_id,
            "pokemon_name": p_name,
            "generation": p_gen,
            "content_type": "evolution",
            "language": "en",
            "version_group": "all",
            "content": evo_text,
            "source_url": p.get("evolution_chain_url") or source_url
        })

    # 4. Type Matchup Chunk
    types_for_matchup = p.get("types_detailed") or p.get("types", [])
    matchups = calculate_type_matchups(types_for_matchup)
    super_eff_str = ", ".join(matchups["super_effective_against"]) if matchups["super_effective_against"] else "None"
    weakness_str = ", ".join(matchups["weaknesses"]) if matchups["weaknesses"] else "None"
    resistance_str = ", ".join(matchups["resistances"]) if matchups["resistances"] else "None"
    immunity_str = ", ".join(matchups["immunities"]) if matchups["immunities"] else "None"
    type_text = (
        f"Type matchups, battle strengths, and weaknesses for {p_name} ({type_str}-type): "
        f"Offensive strengths (deals 2x super-effective damage to / beats easily): {super_eff_str}. "
        f"Weak to (takes 2x or 4x damage from): {weakness_str}. "
        f"Resistant to (takes 0.5x or 0.25x damage from): {resistance_str}. "
        f"Immune to (takes 0x damage from): {immunity_str}."
    )
    chunks.append({
        "_id": f"chunk_{p_id}_types",
        "source_id": f"pokeapi_pokemon_{p_id}",
        "pokemon_id": p_id,
        "pokemon_name": p_name,
        "generation": p_gen,
        "content_type": "type_matchup",
        "language": "en",
        "version_group": "all",
        "content": type_text,
        "source_url": source_url
    })

    # 5. Pokedex entries (top distinct game entries: red, blue, yellow, etc.)
    seen_flavors = set()
    for entry in p.get("flavor_texts", []):
        text = entry.get("text", "").strip()
        version = entry.get("version", "unknown")
        # Keep distinct and representative Gen 1 / modern entries
        if text and text not in seen_flavors and len(seen_flavors) < 3:
            seen_flavors.add(text)
            pokedex_text = f"{p_name} Pokédex entry ({version} version): {text}"
            chunks.append({
                "_id": f"chunk_{p_id}_entry_{version}",
                "source_id": f"pokeapi_pokemon_{p_id}",
                "pokemon_id": p_id,
                "pokemon_name": p_name,
                "generation": p_gen,
                "content_type": "pokedex_entry",
                "language": "en",
                "version_group": version,
                "content": pokedex_text,
                "source_url": source_url
            })

    return chunks

async def ingest_pokemon_range(start_id: int = 1, end_id: int = 1025, skip_existing: bool = True):
    """Main ingestion pipeline for Pokémon (Gen 1 through Gen 9)."""
    global ingestion_state
    if ingestion_state["is_ingesting"]:
        return {"status": "already_running"}

    source_col = get_source_docs_col()
    pokemon_col = get_pokemon_col()
    chunks_col = get_dex_chunks_col()

    if skip_existing:
        existing_ids = set(pokemon_col.distinct("id"))
    else:
        existing_ids = set()

    needed_ids = [pid for pid in range(start_id, end_id + 1) if pid not in existing_ids]

    ingestion_state["is_ingesting"] = True
    ingestion_state["progress"] = 0
    ingestion_state["total"] = len(needed_ids)
    ingestion_state["error"] = None

    if not needed_ids:
        logger.info(f"All Pokémon in range #{start_id} to #{end_id} are already indexed.")
        ingestion_state["is_ingesting"] = False
        return {"status": "already_indexed", "total": 0}

    pokeapi = PokeAPIService()
    semaphore = asyncio.Semaphore(20)

    try:
        async def fetch_one(pid):
            async with semaphore:
                try:
                    data = await pokeapi.fetch_complete_pokemon_info(pid)
                    return data
                except Exception as ex:
                    logger.error(f"Error fetching Pokémon {pid}: {ex}")
                    return None

        # Fetch in concurrent batches
        batch_size = 25
        for i in range(0, len(needed_ids), batch_size):
            batch_ids = needed_ids[i:i + batch_size]
            tasks = [fetch_one(pid) for pid in batch_ids]
            results = await asyncio.gather(*tasks)

            valid_pokemon = [r for r in results if r is not None]
            all_chunks = []
            chunk_texts = []

            pokemon_ops = []
            source_ops = []

            for p in valid_pokemon:
                ingestion_state["current_pokemon"] = p["name"]

                # 1. Normalized Pokémon record
                pokemon_record = {
                    "_id": p["id"],
                    "id": p["id"],
                    "name": p["name"],
                    "height": p["height"],
                    "weight": p["weight"],
                    "stats": p["stats"],
                    "types": [t["name"] for t in p["types"]],
                    "types_detailed": p["types"],
                    "abilities": p["abilities"],
                    "sprite_url": p["sprite_url"],
                    "generation": p["generation"],
                    "genus": p["genus"],
                    "evolution_text": p["evolution_text"],
                    "evolution_chain_url": p["evolution_chain_url"]
                }
                pokemon_ops.append(UpdateOne({"_id": p["id"]}, {"$set": pokemon_record}, upsert=True))

                # 2. Source document record (write individually to avoid large payload timeout)
                try:
                    source_record = {
                        "_id": f"pokeapi_pokemon_{p['id']}",
                        "pokemon_id": p["id"],
                        "name": p["name"],
                        "raw_pokemon": p["raw_pokemon"],
                        "raw_species": p["raw_species"]
                    }
                    source_col.update_one({"_id": source_record["_id"]}, {"$set": source_record}, upsert=True)
                except Exception as sex:
                    logger.warning(f"Error saving raw source doc for #{p['id']}: {sex}")

                # 3. Generate chunks
                p_chunks = create_chunks_for_pokemon(p)
                for c in p_chunks:
                    all_chunks.append(c)
                    chunk_texts.append(c["content"])

            if pokemon_ops:
                pokemon_col.bulk_write(pokemon_ops, ordered=False)

            # 4. Generate embeddings locally for chunks batch
            if chunk_texts:
                embeddings = embed_texts(chunk_texts, batch_size=64)
                chunk_ops = []
                for idx, emb in enumerate(embeddings):
                    all_chunks[idx]["embedding"] = emb
                    chunk_ops.append(
                        UpdateOne(
                            {"_id": all_chunks[idx]["_id"]},
                            {"$set": all_chunks[idx]},
                            upsert=True
                        )
                    )
                if chunk_ops:
                    chunks_col.bulk_write(chunk_ops, ordered=False)

            ingestion_state["progress"] += len(batch_ids)
            ingestion_state["stats"]["pokemon_indexed"] = pokemon_col.count_documents({})
            ingestion_state["stats"]["chunks_indexed"] = chunks_col.count_documents({})
            ingestion_state["stats"]["source_docs_indexed"] = source_col.count_documents({})

        logger.info("Ingestion completed successfully.")
    except Exception as e:
        logger.error(f"Ingestion failed: {e}", exc_info=True)
        ingestion_state["error"] = str(e)
    finally:
        ingestion_state["is_ingesting"] = False
        await pokeapi.close()

def get_ingestion_status():
    return ingestion_state
