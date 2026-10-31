import re
import math
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
    generation: Optional[int] = Query(None, description="Filter by generation (1 to 9)"),
    page: Optional[int] = Query(None, description="Page number (1-based)", ge=1),
    limit: Optional[int] = Query(None, description="Items per page", ge=1, le=100)
):
    """Returns a list of Pokémon with optional search, filters, and pagination."""
    try:
        col = get_pokemon_col()
        query = {}

        if search and isinstance(search, str):
            escaped = re.escape(search.strip())
            query["name"] = {"$regex": escaped, "$options": "i"}

        if type and isinstance(type, str) and type.lower() != "all":
            query["types"] = {"$regex": f"^{re.escape(type.strip())}$", "$options": "i"}

        if generation and isinstance(generation, int) and generation > 0:
            query["generation"] = generation

        projection = {
            "id": 1,
            "name": 1,
            "types": 1,
            "stats": 1,
            "sprite_url": 1,
            "generation": 1,
            "genus": 1
        }

        # If pagination parameters are supplied
        if page is not None and isinstance(page, int) and limit is not None and isinstance(limit, int):
            total_count = col.count_documents(query)
            skip = (page - 1) * limit
            cursor = col.find(query, projection).sort("id", 1).skip(skip).limit(limit)

            pokemon_list = list(cursor)
            for p in pokemon_list:
                p["_id"] = str(p["_id"])

            total_pages = math.ceil(total_count / limit) if limit > 0 else 1
            return {
                "count": total_count,
                "page": page,
                "limit": limit,
                "total_pages": total_pages,
                "results": pokemon_list
            }

        # Exclude large raw subdocuments if any, sort by id ascending
        cursor = col.find(query, projection).sort("id", 1)

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
