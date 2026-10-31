import asyncio
import logging
from fastapi import APIRouter, HTTPException
from app.services.ingestion import ingest_pokemon_range, get_ingestion_status
from app.database import check_connection

router = APIRouter(prefix="/api/ingest", tags=["Ingestion"])
logger = logging.getLogger("dexmind.routes.ingest")

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

@router.get("/status")
async def ingestion_status():
    """Returns current ingestion progress, errors, and indexing statistics."""
    return get_ingestion_status()
