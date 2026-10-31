import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import MONGODB_DATABASE, LLM_MODEL, EMBEDDING_MODEL, VECTOR_INDEX_NAME, TEXT_INDEX_NAME
from app.database import check_connection
from app.routes.ingest import router as ingest_router
from app.routes.pokemon import router as pokemon_router
from app.routes.ask import router as ask_router
from app.routes.compare import router as compare_router
from app.routes.team import router as team_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("dexmind.main")

app = FastAPI(
    title="DexMind API",
    description="Functional RAG-Powered Pokédex MVP API",
    version="1.0.0"
)

# Enable CORS for local Vite dev server and production frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include route modules
app.include_router(ingest_router)
app.include_router(pokemon_router)
app.include_router(ask_router)
app.include_router(compare_router)
app.include_router(team_router)

@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health_check():
    """Checks backend, MongoDB connectivity, and configuration status."""
    conn_info = check_connection()
    return {
        "status": "healthy" if conn_info["connected"] else "degraded",
        "mongodb": conn_info,
        "config": {
            "database": MONGODB_DATABASE,
            "llm_model": LLM_MODEL,
            "embedding_model": EMBEDDING_MODEL,
            "vector_index": VECTOR_INDEX_NAME,
            "text_index": TEXT_INDEX_NAME
        }
    }

from pathlib import Path
from fastapi.staticfiles import StaticFiles

# If compiled frontend assets exist, serve them as static files
static_dir = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if not static_dir.exists():
    static_dir = Path(__file__).resolve().parent.parent / "dist"

if static_dir.exists():
    app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")
else:
    @app.get("/")
    def root():
        return {
            "app": "DexMind",
            "description": "Functional RAG-Powered Pokédex API",
            "docs": "/docs",
            "health": "/api/health"
        }
