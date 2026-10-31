import logging
from typing import List, Dict, Any, Optional
from app.database import get_pokemon_col
from app.services.ingestion import calculate_type_matchups
from app.rag.retrieval import retrieve_evidence
from app.rag.generator import generate_rag_response

logger = logging.getLogger("dexmind.team_advisor")

ALL_TYPES = [
    "normal", "fire", "water", "grass", "electric", "ice",
    "fighting", "poison", "ground", "flying", "psychic", "bug",
    "rock", "ghost", "dragon", "steel", "dark", "fairy"
]

def analyze_team_coverage(pokemon_list: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Deterministically evaluates offensive and defensive type coverage for a team of Pokémon."""
    offensive_covered = set()
    team_weakness_counts: Dict[str, int] = {t: 0 for t in ALL_TYPES}
    team_resistance_counts: Dict[str, int] = {t: 0 for t in ALL_TYPES}
    team_immunity_counts: Dict[str, int] = {t: 0 for t in ALL_TYPES}

    total_stats = {
        "hp": 0, "attack": 0, "defense": 0, "special_attack": 0, "special_defense": 0, "speed": 0, "total": 0
    }

    for p in pokemon_list:
        types_detailed = p.get("types_detailed", [])
        matchups = calculate_type_matchups(types_detailed)
        multipliers = matchups.get("multipliers", {})

        for t, m in multipliers.items():
            if m > 1.0:
                team_weakness_counts[t] += 1
            elif 0.0 < m < 1.0:
                team_resistance_counts[t] += 1
            elif m == 0.0:
                team_immunity_counts[t] += 1

        for td in types_detailed:
            dr = td.get("damage_relations", {})
            for super_eff in dr.get("double_damage_to", []):
                offensive_covered.add(super_eff)

        stats = p.get("stats", {})
        for k in total_stats:
            total_stats[k] += stats.get(k, 0)

    # Vulnerabilities: types that 3 or more team members are weak to
    shared_vulnerabilities = [t.capitalize() for t, c in team_weakness_counts.items() if c >= 3]
    uncovered_offensive = [t.capitalize() for t in ALL_TYPES if t not in offensive_covered]

    return {
        "team_size": len(pokemon_list),
        "total_stats": total_stats,
        "average_bst": round(total_stats["total"] / max(len(pokemon_list), 1), 1),
        "offensive_coverage_types": [t.capitalize() for t in sorted(offensive_covered)],
        "uncovered_offensive_types": uncovered_offensive,
        "shared_defensive_weaknesses": shared_vulnerabilities,
        "type_breakdown": {
            "weaknesses": {k.capitalize(): v for k, v in team_weakness_counts.items() if v > 0},
            "resistances": {k.capitalize(): v for k, v in team_resistance_counts.items() if v > 0},
            "immunities": {k.capitalize(): v for k, v in team_immunity_counts.items() if v > 0}
        }
    }

def recommend_balanced_kanto_team() -> Dict[str, Any]:
    """Recommends a competitive, balanced Generation 1 core team with diverse typing and coverage."""
    col = get_pokemon_col()
    # Archetype balanced team: Charizard (Fire/Flying), Blastoise (Water), Venusaur (Grass/Poison), Jolteon (Electric), Alakazam (Psychic), Snorlax (Normal)
    core_ids = [6, 9, 3, 135, 65, 143]
    team_docs = list(col.find({"id": {"$in": core_ids}}).sort("id", 1))

    # If database not seeded yet, return message
    if len(team_docs) < 6:
        return {
            "error": "The database needs to be seeded with Kanto Pokémon before generating team recommendations."
        }

    for p in team_docs:
        p["_id"] = str(p["_id"])

    analysis = analyze_team_coverage(team_docs)

    # Grounded RAG explanation query
    team_names = ", ".join([p["name"] for p in team_docs])
    rag_query = f"Explain the tactical synergy and type balance of a Pokémon team comprising {team_names}."
    try:
        retrieval_result = retrieve_evidence(rag_query)
        selected_chunks = retrieval_result.get("selected_chunks", [])
        rag_output = generate_rag_response(rag_query, selected_chunks)
        explanation = rag_output.get("answer")
        sources = rag_output.get("sources", [])
    except Exception as e:
        explanation = f"Recommended balanced team: {team_names}. Numerical analysis completed."
        sources = []

    return {
        "team": team_docs,
        "metrics": analysis,
        "explanation": explanation,
        "sources": sources
    }
