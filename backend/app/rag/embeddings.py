import os
import logging
from typing import List, Optional
from app.config import EMBEDDING_MODEL

logger = logging.getLogger("dexmind.embeddings")

_model = None
_model_attempted = False

def get_embedding_model():
    global _model, _model_attempted
    if _model_attempted:
        return _model

    _model_attempted = True

    # Check if local PyTorch embedding model is disabled for memory safety on cloud containers
    if os.getenv("DISABLE_LOCAL_EMBEDDINGS", "false").lower() in ("true", "1", "yes"):
        logger.info("Local PyTorch embeddings disabled by configuration for memory safety.")
        _model = None
        return None

    try:
        import torch
        torch.set_num_threads(1)
        torch.set_grad_enabled(False)
        from sentence_transformers import SentenceTransformer
        logger.info(f"Loading local embedding model: {EMBEDDING_MODEL} (low memory CPU mode)...")
        _model = SentenceTransformer(EMBEDDING_MODEL, device="cpu")
        logger.info("Local embedding model loaded successfully.")
    except ImportError:
        logger.info("sentence_transformers/torch not installed. Running in ultra-lightweight cloud mode using MongoDB Atlas Search.")
        _model = None
    except Exception as e:
        logger.warning(f"Embedding model initialization skipped ({e}). Falling back to MongoDB Atlas Search.")
        _model = None

    return _model

def embed_text(text: str) -> Optional[List[float]]:
    """Generates a 384-dimensional embedding for a single text with memory safety."""
    model = get_embedding_model()
    if not model:
        return None
    try:
        import torch
        with torch.no_grad():
            vector = model.encode(text, convert_to_numpy=True, normalize_embeddings=True)
            return vector.tolist()
    except Exception as e:
        logger.warning(f"Embedding generation failed: {e}")
        return None

def embed_texts(texts: List[str], batch_size: int = 16) -> List[List[float]]:
    """Generates 384-dimensional embeddings for a batch of texts with memory safety."""
    if not texts:
        return []
    model = get_embedding_model()
    if not model:
        return []
    try:
        import torch
        with torch.no_grad():
            vectors = model.encode(texts, batch_size=batch_size, convert_to_numpy=True, normalize_embeddings=True)
            return [v.tolist() for v in vectors]
    except Exception as e:
        logger.warning(f"Batch embedding generation failed: {e}")
        return []
