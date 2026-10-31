import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend directory or project root
backend_dir = Path(__file__).resolve().parent.parent
env_path = backend_dir / ".env"
if env_path.exists():
    load_dotenv(env_path)
else:
    load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "dexmind")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-3.5-flash-lite")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
VECTOR_INDEX_NAME = os.getenv("VECTOR_INDEX_NAME", "dex_vector_index")
TEXT_INDEX_NAME = os.getenv("TEXT_INDEX_NAME", "dex_text_index")
if TEXT_INDEX_NAME == VECTOR_INDEX_NAME and TEXT_INDEX_NAME == "dex_vector_index":
    # Prevent accidental duplicate vector index being used for text search
    TEXT_INDEX_NAME = "dex_text_index"
PORT = int(os.getenv("PORT", "8000"))
