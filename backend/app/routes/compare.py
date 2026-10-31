import logging
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException
from app.database import get_pokemon_col
from app.rag.retrieval import retrieve_evidence, AtlasIndexError
from app.rag.generator import generate_rag_response

router = APIRouter(prefix="/api/compare", tags=["Compare"])
logger = logging.getLogger("dexmind.routes.compare")

class CompareRequest(BaseModel):
    pokemon1: str = Field(..., description="First Pokémon name or ID")
    pokemon2: str = Field(..., description="Second Pokémon name or ID")

def find_pokemon(identifier: str):
    col = get_pokemon_col()
    if identifier.isdigit():
        return col.find_one({"id": int(identifier)})
    return col.find_one({"name": {"$regex": f"^{identifier.strip()}$", "$options": "i"}})

@router.post("")
async def compare_pokemon(req: CompareRequest):
    """Compares two Pokémon using structured database metrics and retrieved RAG evidence."""
    p1 = find_pokemon(req.pokemon1)
    p2 = find_pokemon(req.pokemon2)

    if not p1 or not p2:
        missing = []
        if not p1:
            missing.append(req.pokemon1)
        if not p2:
            missing.append(req.pokemon2)
        raise HTTPException(status_code=404, detail=f"Pokémon not found: {', '.join(missing)}. Please verify spelling or ingest Kanto Pokédex first.")

    p1["_id"] = str(p1["_id"])
    p2["_id"] = str(p2["_id"])

    # Compute stat diffs
    stat_keys = ["hp", "attack", "defense", "special_attack", "special_defense", "speed", "total"]
    stat_comparison = {}
    for k in stat_keys:
        v1 = p1.get("stats", {}).get(k, 0)
        v2 = p2.get("stats", {}).get(k, 0)
        stat_comparison[k] = {
            "p1_val": v1,
            "p2_val": v2,
            "diff": v1 - v2,
            "winner": p1["name"] if v1 > v2 else (p2["name"] if v2 > v1 else "Tie")
        }

    # Generate RAG comparison narrative
    query = f"Compare {p1['name']} and {p2['name']} based on their stats, types, abilities, and battle matchups."
    rag_output = None
    try:
        retrieval_result = retrieve_evidence(query)
        selected_chunks = retrieval_result.get("selected_chunks", [])
        rag_output = generate_rag_response(query, selected_chunks)
    except AtlasIndexError as e:
        logger.warning(f"RAG retrieval skipped during compare due to Atlas index error: {e}")
        rag_output = {
            "answer": f"Structured comparison complete for {p1['name']} vs {p2['name']}. (RAG textual summary unavailable: {str(e)})",
            "sources": [],
            "is_unanswerable": False
        }
    except Exception as e:
        logger.warning(f"RAG generation failed during compare: {e}")
        rag_output = {
            "answer": f"Structured comparison complete for {p1['name']} vs {p2['name']}.",
            "sources": [],
            "is_unanswerable": False
        }

    return {
        "pokemon1": p1,
        "pokemon2": p2,
        "stat_comparison": stat_comparison,
        "analysis": rag_output.get("answer"),
        "sources": rag_output.get("sources", [])
    }
