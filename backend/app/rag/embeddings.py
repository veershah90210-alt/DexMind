import logging
from typing import List
from app.config import EMBEDDING_MODEL

logger = logging.getLogger("dexmind.embeddings")

_model = None

def get_embedding_model():
    global _model
    if _model is None:
        logger.info(f"Loading local embedding model: {EMBEDDING_MODEL} ...")
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer(EMBEDDING_MODEL)
        logger.info("Local embedding model loaded successfully.")
    return _model

def embed_text(text: str) -> List[float]:
    """Generates a 384-dimensional embedding for a single text."""
    model = get_embedding_model()
    # Normalize embeddings for cosine similarity
    vector = model.encode(text, convert_to_numpy=True, normalize_embeddings=True)
    return vector.tolist()

def embed_texts(texts: List[str], batch_size: int = 32) -> List[List[float]]:
    """Generates 384-dimensional embeddings for a batch of texts."""
    if not texts:
        return []
    model = get_embedding_model()
    vectors = model.encode(texts, batch_size=batch_size, convert_to_numpy=True, normalize_embeddings=True)
    return [v.tolist() for v in vectors]
