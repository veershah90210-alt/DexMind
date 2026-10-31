import re
import logging
from typing import List, Dict, Any, Optional
from pymongo.errors import OperationFailure
from app.config import VECTOR_INDEX_NAME, TEXT_INDEX_NAME
from app.database import get_dex_chunks_col, get_pokemon_col
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

    For team building & counter queries, retrieves both opponent profiles and candidate counter Pokémon.
    For multi-entity queries, uses balanced entity sampling to prevent starvation.
    """
    analysis: QueryAnalysis = route_query(query, history=history)

    if analysis.category == "out_of_scope":
        return {
            "analysis": analysis.to_dict(),
            "total_candidates": 0,
            "selected_chunks": []
        }

    selected_chunks = []
    seen_ids = set()

    # Case 1: Team building or counter strategy with specific target opponents
    if analysis.category in ["team_building", "counter_strategy"] and analysis.pokemon_entities:
        logger.info(f"Team building / counter query for opponents: {analysis.pokemon_entities}")
        col = get_dex_chunks_col()
        pcol = get_pokemon_col()

        # Step 1: Balanced retrieval for each target opponent
        opponent_chunks = []
        for p in analysis.pokemon_entities:
            p_filter = {"pokemon_name": p}
            if metadata_filters:
                p_filter = {**p_filter, **metadata_filters}
            p_candidates = retrieve_for_subquery(f"{p} type weaknesses battle matchups stats", filter_dict=p_filter, candidate_limit=4)
            # Prioritize type_matchup and overview_stats
            p_candidates.sort(key=lambda x: (0 if x.get("content_type") == "type_matchup" else (1 if x.get("content_type") == "overview_stats" else 2)))
            for c in p_candidates[:2]:
                cid = str(c["_id"])
                if cid not in seen_ids:
                    seen_ids.add(cid)
                    opponent_chunks.append(c)

        # Step 2: Extract weakness types across all opponents
        weakness_types = set()
        for c in opponent_chunks:
            if c.get("content_type") == "type_matchup":
                m = re.search(r'Weak to.*?:\s*([^.\n]+)', c.get("content", ""))
                if m:
                    found_types = re.findall(
                        r'\b(Normal|Fire|Water|Grass|Electric|Ice|Fighting|Poison|Ground|Flying|Psychic|Bug|Rock|Ghost|Dragon|Steel|Dark|Fairy)\b',
                        m.group(1),
                        re.I
                    )
                    for t in found_types:
                        weakness_types.add(t.capitalize())

        # Step 3: Find top candidate counter Pokémon for extracted weaknesses
        counter_chunks = []
        if weakness_types:
            # Score weaknesses by how many opponents they threaten
            type_hit_counts = {}
            for w in weakness_types:
                type_hit_counts[w] = 0
                for c in opponent_chunks:
                    if c.get("content_type") == "type_matchup" and w in c.get("content", ""):
                        type_hit_counts[w] += 1
            sorted_weaknesses = sorted(weakness_types, key=lambda w: type_hit_counts.get(w, 0), reverse=True)

            for w in sorted_weaknesses:
                matching_pokes = list(pcol.find({'types': w}, {'name': 1, 'stats.total': 1}).sort('stats.total', -1).limit(4))
                for mp in matching_pokes:
                    pname = mp['name']
                    if pname not in analysis.pokemon_entities:
                        c_chunk = col.find_one({'pokemon_name': pname, 'content_type': 'type_matchup'})
                        if c_chunk and str(c_chunk["_id"]) not in seen_ids:
                            seen_ids.add(str(c_chunk["_id"]))
                            counter_chunks.append(c_chunk)
                            break
                if len(counter_chunks) >= 4:
                    break

        selected_chunks = opponent_chunks + counter_chunks

    # Case 2: Multi-entity comparison or multi-pokemon lookup (balanced round-robin)
    elif len(analysis.pokemon_entities) >= 2:
        logger.info(f"Multi-entity query detected for {analysis.pokemon_entities}. Using balanced entity allocation.")
        entity_buckets = {p: [] for p in analysis.pokemon_entities}
        for sq in analysis.sub_queries:
            sub_filter = sq["filter"]
            if metadata_filters:
                sub_filter = {**sub_filter, **metadata_filters}
            entity_name = sq.get("entity")
            candidates = retrieve_for_subquery(sq["text"], filter_dict=sub_filter, candidate_limit=4)
            if entity_name and entity_name in entity_buckets:
                entity_buckets[entity_name].extend(candidates)
            else:
                for c in candidates:
                    pname = c.get("pokemon_name")
                    if pname in entity_buckets:
                        entity_buckets[pname].append(c)

        # Round-robin take top 2-3 per entity
        for round_idx in range(3):
            for p in analysis.pokemon_entities:
                bucket = entity_buckets.get(p, [])
                if round_idx < len(bucket):
                    c = bucket[round_idx]
                    cid = str(c["_id"])
                    if cid not in seen_ids:
                        seen_ids.add(cid)
                        selected_chunks.append(c)
            if len(selected_chunks) >= 10:
                break

    # Case 3: Standard single entity or general query
    else:
        sub_filter = analysis.sub_queries[0]["filter"] if analysis.sub_queries else {}
        if metadata_filters:
            sub_filter = {**sub_filter, **metadata_filters}
        query_text = analysis.sub_queries[0]["text"] if analysis.sub_queries else query

        candidates = retrieve_for_subquery(query_text, filter_dict=sub_filter, candidate_limit=10)
        for c in candidates:
            cid = str(c["_id"])
            if cid not in seen_ids:
                seen_ids.add(cid)
                selected_chunks.append(c)
                if len(selected_chunks) >= 8:
                    break

    # Assign clear source identifiers [S1], [S2], ...
    for idx, c in enumerate(selected_chunks, start=1):
        c["citation_tag"] = f"[S{idx}]"

    return {
        "analysis": analysis.to_dict(),
        "total_candidates": len(selected_chunks),
        "selected_chunks": selected_chunks
    }
