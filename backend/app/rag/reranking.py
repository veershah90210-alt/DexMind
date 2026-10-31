from typing import List, Dict, Any

def reciprocal_rank_fusion(
    vector_results: List[Dict[str, Any]],
    text_results: List[Dict[str, Any]],
    k: int = 60,
    top_n: int = 10
) -> List[Dict[str, Any]]:
    """Combines vector search and text search results using Reciprocal Rank Fusion (RRF).

    Formula: RRF_Score = sum(1 / (k + rank)) across ranking systems.
    """
    scores: Dict[str, float] = {}
    doc_map: Dict[str, Dict[str, Any]] = {}

    # Process vector rankings
    for rank, doc in enumerate(vector_results, start=1):
        doc_id = str(doc["_id"])
        doc_map[doc_id] = doc
        scores[doc_id] = scores.get(doc_id, 0.0) + (1.0 / (k + rank))

    # Process text rankings
    for rank, doc in enumerate(text_results, start=1):
        doc_id = str(doc["_id"])
        if doc_id not in doc_map:
            doc_map[doc_id] = doc
        scores[doc_id] = scores.get(doc_id, 0.0) + (1.0 / (k + rank))

    # Sort descending by RRF score
    sorted_ids = sorted(scores.keys(), key=lambda did: scores[did], reverse=True)

    fused_results = []
    for did in sorted_ids[:top_n]:
        doc = doc_map[did].copy()
        doc["rrf_score"] = scores[did]
        fused_results.append(doc)

    return fused_results
