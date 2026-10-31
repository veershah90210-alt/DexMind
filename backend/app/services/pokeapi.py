import logging
import asyncio
from typing import Dict, Any, List, Optional
import httpx

logger = logging.getLogger("dexmind.pokeapi")

POKEAPI_BASE = "https://pokeapi.co/api/v2"

# In-memory caches to prevent redundant requests across Pokémon
_ability_cache: Dict[str, Dict[str, Any]] = {}
_species_cache: Dict[str, Dict[str, Any]] = {}
_evolution_chain_cache: Dict[str, Dict[str, Any]] = {}
_type_cache: Dict[str, Dict[str, Any]] = {}

class PokeAPIService:
    def __init__(self, client: Optional[httpx.AsyncClient] = None):
        self.client = client

    async def get_client(self) -> httpx.AsyncClient:
        if self.client is None or self.client.is_closed:
            self.client = httpx.AsyncClient(timeout=30.0, limits=httpx.Limits(max_keepalive_connections=20, max_connections=30))
        return self.client

    async def close(self):
        if self.client and not self.client.is_closed:
            await self.client.aclose()

    async def _fetch_json(self, url: str) -> Optional[Dict[str, Any]]:
        client = await self.get_client()
        for attempt in range(3):
            try:
                resp = await client.get(url)
                if resp.status_code == 200:
                    return resp.json()
                elif resp.status_code == 404:
                    return None
                else:
                    logger.warning(f"Fetch {url} returned status {resp.status_code}, attempt {attempt + 1}")
                    await asyncio.sleep(0.5 * (attempt + 1))
            except Exception as e:
                logger.warning(f"Error fetching {url}: {e}, attempt {attempt + 1}")
                await asyncio.sleep(0.5 * (attempt + 1))
        return None

    async def get_pokemon_basic(self, pokemon_id: int) -> Optional[Dict[str, Any]]:
        url = f"{POKEAPI_BASE}/pokemon/{pokemon_id}"
        return await self._fetch_json(url)

    async def get_species(self, species_url_or_id: Any) -> Optional[Dict[str, Any]]:
        url = species_url_or_id if str(species_url_or_id).startswith("http") else f"{POKEAPI_BASE}/pokemon-species/{species_url_or_id}"
        if url in _species_cache:
            return _species_cache[url]
        data = await self._fetch_json(url)
        if data:
            _species_cache[url] = data
        return data

    async def get_ability_details(self, ability_url: str) -> Optional[Dict[str, Any]]:
        if ability_url in _ability_cache:
            return _ability_cache[ability_url]
        data = await self._fetch_json(ability_url)
        if data:
            _ability_cache[ability_url] = data
        return data

    async def get_evolution_chain(self, chain_url: str) -> Optional[Dict[str, Any]]:
        if chain_url in _evolution_chain_cache:
            return _evolution_chain_cache[chain_url]
        data = await self._fetch_json(chain_url)
        if data:
            _evolution_chain_cache[chain_url] = data
        return data

    async def get_type_details(self, type_url_or_name: str) -> Optional[Dict[str, Any]]:
        url = type_url_or_name if type_url_or_name.startswith("http") else f"{POKEAPI_BASE}/type/{type_url_or_name}"
        if url in _type_cache:
            return _type_cache[url]
        data = await self._fetch_json(url)
        if data:
            _type_cache[url] = data
        return data

    def parse_evolution_chain(self, chain_node: Dict[str, Any]) -> str:
        """Parses nested PokéAPI evolution chain structure into human-readable text."""
        lines = []

        def traverse(node, from_name=None):
            species_name = node.get("species", {}).get("name", "").capitalize()
            evolution_details = node.get("evolution_details", [])

            if from_name and evolution_details:
                for detail in evolution_details:
                    trigger = detail.get("trigger", {}).get("name", "level-up")
                    min_level = detail.get("min_level")
                    item = detail.get("item")
                    held_item = detail.get("held_item")
                    known_move = detail.get("known_move")
                    time_of_day = detail.get("time_of_day")

                    conds = []
                    if min_level:
                        conds.append(f"at level {min_level}")
                    if item:
                        item_name = item.get("name", "").replace("-", " ").title()
                        conds.append(f"using {item_name}")
                    if held_item:
                        held_name = held_item.get("name", "").replace("-", " ").title()
                        conds.append(f"holding {held_name}")
                    if known_move:
                        move_name = known_move.get("name", "").replace("-", " ").title()
                        conds.append(f"knowing {move_name}")
                    if time_of_day:
                        conds.append(f"during {time_of_day}")

                    how = " " + " and ".join(conds) if conds else f" via {trigger}"
                    lines.append(f"{from_name} evolves into {species_name}{how}.")
            elif from_name:
                lines.append(f"{from_name} evolves into {species_name}.")

            for next_node in node.get("evolves_to", []):
                traverse(next_node, species_name)

        traverse(chain_node)
        return " ".join(lines) if lines else "This Pokémon does not evolve."

    async def fetch_complete_pokemon_info(self, pokemon_id: int) -> Optional[Dict[str, Any]]:
        """Fetches and enriches complete data for a Pokémon including species, abilities, evolution, and types."""
        basic = await self.get_pokemon_basic(pokemon_id)
        if not basic:
            return None

        # Fetch species
        species_info = None
        evolution_text = ""
        evolution_chain_url = ""
        if basic.get("species", {}).get("url"):
            species_url = basic["species"]["url"]
            species_info = await self.get_species(species_url)
            if species_info and species_info.get("evolution_chain", {}).get("url"):
                evolution_chain_url = species_info["evolution_chain"]["url"]
                chain_raw = await self.get_evolution_chain(evolution_chain_url)
                if chain_raw and "chain" in chain_raw:
                    evolution_text = self.parse_evolution_chain(chain_raw["chain"])

        # Fetch ability details
        abilities_detailed = []
        for ab in basic.get("abilities", []):
            ab_info = ab.get("ability", {})
            ab_name = ab_info.get("name", "")
            ab_url = ab_info.get("url", "")
            is_hidden = ab.get("is_hidden", False)
            effect_text = ""
            short_effect = ""
            if ab_url:
                ab_data = await self.get_ability_details(ab_url)
                if ab_data:
                    # English effect entry
                    for eff in ab_data.get("effect_entries", []):
                        if eff.get("language", {}).get("name") == "en":
                            short_effect = eff.get("short_effect", "").replace("\n", " ").strip()
                            effect_text = eff.get("effect", "").replace("\n", " ").strip()
                            break
                    if not short_effect:
                        # try flavor text
                        for flav in ab_data.get("flavor_text_entries", []):
                            if flav.get("language", {}).get("name") == "en":
                                short_effect = flav.get("flavor_text", "").replace("\n", " ").strip()
                                break

            abilities_detailed.append({
                "name": ab_name.replace("-", " ").title(),
                "raw_name": ab_name,
                "is_hidden": is_hidden,
                "short_effect": short_effect,
                "effect": effect_text or short_effect,
                "url": ab_url
            })

        # Fetch types and damage relations
        types_detailed = []
        for t in basic.get("types", []):
            t_info = t.get("type", {})
            t_name = t_info.get("name", "")
            t_url = t_info.get("url", "")
            damage_relations = {}
            if t_url:
                t_data = await self.get_type_details(t_url)
                if t_data and "damage_relations" in t_data:
                    dr = t_data["damage_relations"]
                    damage_relations = {
                        "double_damage_from": [x["name"] for x in dr.get("double_damage_from", [])],
                        "half_damage_from": [x["name"] for x in dr.get("half_damage_from", [])],
                        "no_damage_from": [x["name"] for x in dr.get("no_damage_from", [])],
                        "double_damage_to": [x["name"] for x in dr.get("double_damage_to", [])],
                        "half_damage_to": [x["name"] for x in dr.get("half_damage_to", [])],
                        "no_damage_to": [x["name"] for x in dr.get("no_damage_to", [])],
                    }
            types_detailed.append({
                "name": t_name.capitalize(),
                "slot": t.get("slot", 1),
                "url": t_url,
                "damage_relations": damage_relations
            })

        # English Pokédex flavor texts per version
        flavor_texts = []
        genus = ""
        generation_name = "generation-i"
        if species_info:
            for entry in species_info.get("flavor_text_entries", []):
                if entry.get("language", {}).get("name") == "en":
                    clean_text = entry.get("flavor_text", "").replace("\f", " ").replace("\n", " ").strip()
                    version = entry.get("version", {}).get("name", "unknown")
                    flavor_texts.append({
                        "version": version,
                        "text": clean_text
                    })
            for g in species_info.get("genera", []):
                if g.get("language", {}).get("name") == "en":
                    genus = g.get("genus", "")
                    break
            generation_name = species_info.get("generation", {}).get("name", "generation-i")

        # Stats
        stats_map = {}
        for s in basic.get("stats", []):
            s_name = s.get("stat", {}).get("name", "")
            stats_map[s_name] = s.get("base_stat", 0)

        formatted_stats = {
            "hp": stats_map.get("hp", 0),
            "attack": stats_map.get("attack", 0),
            "defense": stats_map.get("defense", 0),
            "special_attack": stats_map.get("special-attack", 0),
            "special_defense": stats_map.get("special-defense", 0),
            "speed": stats_map.get("speed", 0),
            "total": sum(stats_map.values())
        }

        # Sprite
        sprites = basic.get("sprites", {})
        other_sprites = sprites.get("other", {})
        official_artwork = other_sprites.get("official-artwork", {}).get("front_default")
        sprite_url = official_artwork or sprites.get("front_default") or ""

        return {
            "id": pokemon_id,
            "name": basic.get("name", "").capitalize(),
            "height": basic.get("height", 0) / 10.0, # meters
            "weight": basic.get("weight", 0) / 10.0, # kg
            "base_experience": basic.get("base_experience", 0),
            "stats": formatted_stats,
            "types": types_detailed,
            "abilities": abilities_detailed,
            "sprite_url": sprite_url,
            "generation": 1 if generation_name == "generation-i" else 1,
            "genus": genus,
            "evolution_chain_url": evolution_chain_url,
            "evolution_text": evolution_text,
            "flavor_texts": flavor_texts,
            "raw_pokemon": basic,
            "raw_species": species_info
        }
