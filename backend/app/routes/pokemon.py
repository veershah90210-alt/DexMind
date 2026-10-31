import re
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.database import get_pokemon_col

router = APIRouter(prefix="/api/pokemon", tags=["Pokemon"])
logger = logging.getLogger("dexmind.routes.pokemon")

@router.get("")
async def list_pokemon(
    search: Optional[str] = Query(None, description="Search by Pokémon name"),
    type: Optional[str] = Query(None, description="Filter by Pokémon type (e.g. Fire, Water)"),
    generation: Optional[int] = Query(None, description="Filter by generation (1 for Kanto)")
):
    """Returns a list of Pokémon with optional search and filters."""
    try:
        col = get_pokemon_col()
        query = {}

        if search:
            escaped = re.escape(search.strip())
            query["name"] = {"$regex": escaped, "$options": "i"}

        if type:
            query["types"] = {"$regex": f"^{re.escape(type.strip())}$", "$options": "i"}

        if generation:
            query["generation"] = generation

        # Exclude large raw subdocuments if any, sort by id ascending
        cursor = col.find(
            query,
            {
                "id": 1,
                "name": 1,
                "types": 1,
                "stats": 1,
                "sprite_url": 1,
                "generation": 1,
                "genus": 1
            }
        ).sort("id", 1)

        pokemon_list = list(cursor)
        for p in pokemon_list:
            p["_id"] = str(p["_id"])

        return {
            "count": len(pokemon_list),
            "results": pokemon_list
        }
    except Exception as e:
        logger.error(f"Error fetching Pokémon list: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{id}")
async def get_pokemon_detail(id: int):
    """Returns detailed Pokémon information."""
    try:
        col = get_pokemon_col()
        pokemon = col.find_one({"id": id})
        if not pokemon:
            raise HTTPException(status_code=404, detail=f"Pokémon with ID {id} not found.")

        pokemon["_id"] = str(pokemon["_id"])
        return pokemon
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching Pokémon {id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
