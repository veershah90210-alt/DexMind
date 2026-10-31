import logging
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException
from app.rag.retrieval import retrieve_evidence, AtlasIndexError
from app.rag.generator import generate_rag_response

router = APIRouter(prefix="/api/ask", tags=["RAG QA"])
logger = logging.getLogger("dexmind.routes.ask")

class AskRequest(BaseModel):
    question: str = Field(..., description="Natural language question about Pokémon", min_length=2)
    filters: Optional[Dict[str, Any]] = Field(None, description="Optional metadata filters (e.g. content_type, pokemon_name)")
    history: Optional[List[Dict[str, str]]] = Field(None, description="Recent conversation history for conversational context")

@router.post("")
async def ask_question(req: AskRequest):
    """Executes the complete RAG pipeline with conversation memory:

    1. Contextualizes follow-up questions using prior turns.
    2. Performs hybrid retrieval (MongoDB Vector Search + Atlas Search).
    3. Fuses & reranks with RRF.
    4. Generates grounded answer via Gemini API with citations.
    5. Validates citations and detects unanswerable queries.
    """
    try:
        # Retrieve evidence with context awareness
        retrieval_result = retrieve_evidence(req.question, metadata_filters=req.filters, history=req.history)
        selected_chunks = retrieval_result.get("selected_chunks", [])

        # Generate grounded answer with conversation history
        category = retrieval_result.get("analysis", {}).get("category")
        rag_output = generate_rag_response(req.question, selected_chunks, history=req.history, category=category)

        return {
            "question": req.question,
            "answer": rag_output["answer"],
            "sources": rag_output["sources"],
            "is_unanswerable": rag_output["is_unanswerable"],
            "retrieval_meta": {
                "category": retrieval_result.get("analysis", {}).get("category"),
                "entities_detected": retrieval_result.get("analysis", {}).get("pokemon_entities", []),
                "total_candidates": retrieval_result.get("total_candidates", 0),
                "chunks_used": len(selected_chunks)
            }
        }
    except AtlasIndexError as e:
        logger.error(f"Atlas index missing error: {e}")
        raise HTTPException(
            status_code=400,
            detail={
                "error_type": "AtlasIndexMissing",
                "message": str(e)
            }
        )
    except ValueError as e:
        logger.error(f"Configuration or validation error: {e}")
        raise HTTPException(
            status_code=400,
            detail={
                "error_type": "ConfigurationError",
                "message": str(e)
            }
        )
    except Exception as e:
        logger.error(f"Error during RAG execution: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error_type": "InternalServerError",
                "message": f"An error occurred while answering your question: {str(e)}"
            }
        )
