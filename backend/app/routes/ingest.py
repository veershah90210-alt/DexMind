import asyncio
import logging
from fastapi import APIRouter, HTTPException
from app.services.ingestion import ingest_pokemon_range, get_ingestion_status
from app.database import check_connection

router = APIRouter(prefix="/api/ingest", tags=["Ingestion"])
logger = logging.getLogger("dexmind.routes.ingest")

GEN_RANGES = {
    1: (1, 151),
    2: (152, 251),
    3: (252, 386),
    4: (387, 493),
    5: (494, 649),
    6: (650, 721),
    7: (722, 809),
    8: (810, 905),
    9: (906, 1025)
}

@router.post("/kanto")
async def start_kanto_ingestion():
    """Starts the Generation 1 (first 151 Pokémon) data import pipeline."""
    # Check MongoDB connectivity first
    conn = check_connection()
    if not conn["connected"]:
        raise HTTPException(
            status_code=503,
            detail=f"Cannot start ingestion: MongoDB Atlas is not connected ({conn.get('error')}). Please verify MONGODB_URI in backend/.env."
        )

    status = get_ingestion_status()
    if status["is_ingesting"]:
        return {
            "status": "already_running",
            "message": "Ingestion is already in progress.",
            "progress": status["progress"],
            "total": status["total"]
        }

    # Start background ingestion task
    asyncio.create_task(ingest_pokemon_range(1, 151))

    return {
        "status": "started",
        "message": "Generation 1 ingestion started for 151 Pokémon.",
        "total": 151
    }

@router.post("/all")
async def start_all_generations_ingestion():
    """Starts the complete Gen 1 through Gen 9 (1,025 Pokémon) data import pipeline."""
    conn = check_connection()
    if not conn["connected"]:
        raise HTTPException(
            status_code=503,
            detail=f"Cannot start ingestion: MongoDB Atlas is not connected ({conn.get('error')})."
        )

    status = get_ingestion_status()
    if status["is_ingesting"]:
        return {
            "status": "already_running",
            "message": "Ingestion is already in progress.",
            "progress": status["progress"],
            "total": status["total"]
        }

    asyncio.create_task(ingest_pokemon_range(1, 1025, skip_existing=True))

    return {
        "status": "started",
        "message": "Complete Gen 1–9 ingestion started for Pokémon #1 to #1025.",
        "total": 1025
    }

@router.post("/generation/{gen_id}")
async def start_generation_ingestion(gen_id: int):
    """Starts ingestion for a specific Generation (1 to 9)."""
    if gen_id not in GEN_RANGES:
        raise HTTPException(status_code=400, detail="Invalid generation ID. Must be between 1 and 9.")

    conn = check_connection()
    if not conn["connected"]:
        raise HTTPException(status_code=503, detail="MongoDB Atlas is not connected.")

    status = get_ingestion_status()
    if status["is_ingesting"]:
        return {
            "status": "already_running",
            "message": "Ingestion is already in progress.",
            "progress": status["progress"],
            "total": status["total"]
        }

    start_id, end_id = GEN_RANGES[gen_id]
    asyncio.create_task(ingest_pokemon_range(start_id, end_id, skip_existing=True))

    return {
        "status": "started",
        "message": f"Generation {gen_id} ingestion started (#{start_id} to #{end_id}).",
        "start": start_id,
        "end": end_id
    }

@router.get("/status")
async def ingestion_status():
    """Returns current ingestion progress, errors, and indexing statistics."""
    return get_ingestion_status()
