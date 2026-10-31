import logging
from typing import List, Optional
from app.config import EMBEDDING_MODEL

logger = logging.getLogger("dexmind.embeddings")

_model = None

def get_embedding_model():
    global _model
    if _model is None:
        try:
            logger.info(f"Loading local embedding model: {EMBEDDING_MODEL} (low memory CPU mode)...")
            import torch
            torch.set_num_threads(1)
            torch.set_grad_enabled(False)
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer(EMBEDDING_MODEL, device="cpu")
            logger.info("Local embedding model loaded successfully.")
        except Exception as e:
            logger.error(f"Error initializing embedding model: {e}")
            raise
    return _model

def embed_text(text: str) -> Optional[List[float]]:
    """Generates a 384-dimensional embedding for a single text with memory safety."""
    try:
        model = get_embedding_model()
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
    try:
        model = get_embedding_model()
        import torch
        with torch.no_grad():
            vectors = model.encode(texts, batch_size=batch_size, convert_to_numpy=True, normalize_embeddings=True)
            return [v.tolist() for v in vectors]
    except Exception as e:
        logger.warning(f"Batch embedding generation failed: {e}")
        return []
