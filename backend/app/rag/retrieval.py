import logging
from typing import List, Dict, Any, Optional
from pymongo.errors import OperationFailure
from app.config import VECTOR_INDEX_NAME, TEXT_INDEX_NAME
from app.database import get_dex_chunks_col
from app.rag.embeddings import embed_text
from app.rag.reranking import reciprocal_rank_fusion
from app.rag.query_router import route_query, QueryAnalysis

logger = logging.getLogger("dexmind.retrieval")

class AtlasIndexError(Exception):
    """Raised when required MongoDB Atlas search or vector indexes are missing."""
    pass

def execute_vector_search(
    query_vector: List[float],
    filter_dict: Optional[Dict[str, Any]] = None,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """Performs MongoDB Atlas Vector Search on dex_chunks."""
    col = get_dex_chunks_col()

    search_stage: Dict[str, Any] = {
        "index": VECTOR_INDEX_NAME,
        "path": "embedding",
        "queryVector": query_vector,
        "numCandidates": limit * 10,
        "limit": limit
    }

    if filter_dict:
        # Atlas Vector Search filter format
        vector_filter = {}
        for k, v in filter_dict.items():
            if v is not None:
                vector_filter[k] = {"$eq": v}
        if vector_filter:
            search_stage["filter"] = vector_filter

    pipeline = [
        {"$vectorSearch": search_stage},
        {
            "$project": {
                "_id": 1,
                "source_id": 1,
                "pokemon_id": 1,
                "pokemon_name": 1,
                "generation": 1,
                "content_type": 1,
                "language": 1,
                "version_group": 1,
                "content": 1,
                "source_url": 1,
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ]

    try:
        results = list(col.aggregate(pipeline))
        return results
    except OperationFailure as e:
        err_msg = str(e)
        logger.error(f"Vector search failed: {err_msg}")
        if "index not found" in err_msg.lower() or "vectorsearch" in err_msg.lower() or "unrecognized pipeline stage" in err_msg.lower():
            raise AtlasIndexError(
                f"MongoDB Atlas Vector Search index '{VECTOR_INDEX_NAME}' is not configured on collection 'dex_chunks'. "
                f"Please create the Vector Search index in MongoDB Atlas with dimensions=384, similarity=cosine, "
                f"and vector field='embedding'. Original error: {err_msg}"
            ) from e
        raise

def execute_keyword_search(
    query_text: str,
    filter_dict: Optional[Dict[str, Any]] = None,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """Performs MongoDB Atlas Search keyword retrieval on dex_chunks."""
    col = get_dex_chunks_col()

    search_compound: Dict[str, Any] = {
        "must": [
            {
                "text": {
                    "query": query_text,
                    "path": ["content", "pokemon_name"]
                }
            }
        ]
    }

    if filter_dict:
        filter_clauses = []
        for k, v in filter_dict.items():
            if v is not None:
                if k == "pokemon_name":
                    filter_clauses.append({"text": {"query": v, "path": "pokemon_name"}})
                elif k == "content_type":
                    filter_clauses.append({"text": {"query": v, "path": "content_type"}})
        if filter_clauses:
            search_compound["filter"] = filter_clauses

    pipeline = [
        {
            "$search": {
                "index": TEXT_INDEX_NAME,
                "compound": search_compound
            }
        },
        {"$limit": limit},
        {
            "$project": {
                "_id": 1,
                "source_id": 1,
                "pokemon_id": 1,
                "pokemon_name": 1,
                "generation": 1,
                "content_type": 1,
                "language": 1,
                "version_group": 1,
                "content": 1,
                "source_url": 1,
                "score": {"$meta": "searchScore"}
            }
        }
    ]

    try:
        results = list(col.aggregate(pipeline))
        return results
    except OperationFailure as e:
        err_msg = str(e)
        logger.error(f"Atlas Search failed: {err_msg}")
        if "index not found" in err_msg.lower() or "$search" in err_msg.lower() or "unrecognized pipeline stage" in err_msg.lower():
            raise AtlasIndexError(
                f"MongoDB Atlas Search index '{TEXT_INDEX_NAME}' is not configured on collection 'dex_chunks'. "
                f"Please create the Atlas Search index in MongoDB Atlas on 'content' and 'pokemon_name'. "
                f"Original error: {err_msg}"
            ) from e
        raise

def retrieve_for_subquery(
    query_text: str,
    filter_dict: Optional[Dict[str, Any]] = None,
    candidate_limit: int = 8
) -> List[Dict[str, Any]]:
    """Runs vector search + keyword search and fuses via RRF for a single subquery."""
    query_vector = embed_text(query_text)

    vector_results = execute_vector_search(query_vector, filter_dict=filter_dict, limit=candidate_limit)
    text_results = execute_keyword_search(query_text, filter_dict=filter_dict, limit=candidate_limit)

    fused = reciprocal_rank_fusion(vector_results, text_results, k=60, top_n=candidate_limit)
    return fused

def retrieve_evidence(
    query: str,
    metadata_filters: Optional[Dict[str, Any]] = None,
    history: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    """Orchestrates query understanding, multi-entity splitting, retrieval, and deduplication.

    Returns structured evidence containing candidates and selected chunks.
    """
    analysis: QueryAnalysis = route_query(query, history=history)

    all_retrieved = []
    seen_ids = set()

    if analysis.is_comparison and len(analysis.sub_queries) >= 2:
        # Multi-entity independent retrieval
        logger.info(f"Comparison query detected between {analysis.pokemon_entities}. Retrieving evidence for each entity independently.")
        for sq in analysis.sub_queries:
            sub_filter = sq["filter"]
            if metadata_filters:
                sub_filter = {**sub_filter, **metadata_filters}
            # Retrieve 4-5 top chunks per entity
            entity_chunks = retrieve_for_subquery(sq["text"], filter_dict=sub_filter, candidate_limit=5)
            for c in entity_chunks:
                cid = str(c["_id"])
                if cid not in seen_ids:
                    seen_ids.add(cid)
                    all_retrieved.append(c)
    else:
        # Standard query
        sub_filter = analysis.sub_queries[0]["filter"] if analysis.sub_queries else {}
        if metadata_filters:
            sub_filter = {**sub_filter, **metadata_filters}
        query_text = analysis.sub_queries[0]["text"] if analysis.sub_queries else query

        # Retrieve 10 candidates
        candidates = retrieve_for_subquery(query_text, filter_dict=sub_filter, candidate_limit=10)
        for c in candidates:
            cid = str(c["_id"])
            if cid not in seen_ids:
                seen_ids.add(cid)
                all_retrieved.append(c)

    # Select approximately 5-8 relevant chunks
    selected_chunks = all_retrieved[:8]

    # Assign clear source identifiers [S1], [S2], ...
    for idx, c in enumerate(selected_chunks, start=1):
        c["citation_tag"] = f"[S{idx}]"

    return {
        "analysis": analysis.to_dict(),
        "total_candidates": len(all_retrieved),
        "selected_chunks": selected_chunks
    }
