import re
import logging
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from app.config import GEMINI_API_KEY, LLM_MODEL

logger = logging.getLogger("dexmind.generator")

class BaseLLMProvider(ABC):
    @abstractmethod
    def generate(self, system_instruction: str, prompt: str) -> str:
        pass

class GeminiProvider(BaseLLMProvider):
    def __init__(self, api_key: str = GEMINI_API_KEY, model_name: str = LLM_MODEL):
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY in backend/.env.")
        from google import genai
        self.client = genai.Client(api_key=api_key)
        self.model_name = model_name

    def generate(self, system_instruction: str, prompt: str) -> str:
        from google.genai import types
        candidate_models = [self.model_name, "gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.8-flash"]
        seen_models = []
        for m in candidate_models:
            if m and m not in seen_models:
                seen_models.append(m)

        last_error = None
        for model_to_try in seen_models:
            try:
                response = self.client.models.generate_content(
                    model=model_to_try,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.1,
                    )
                )
                return response.text or ""
            except Exception as e:
                logger.warning(f"Error calling Gemini model {model_to_try}: {e}")
                last_error = e

        raise last_error

_llm_provider: Optional[BaseLLMProvider] = None

def get_llm_provider() -> BaseLLMProvider:
    global _llm_provider
    if _llm_provider is None:
        _llm_provider = GeminiProvider()
    return _llm_provider

SYSTEM_PROMPT = """You are DexMind, a Pokémon research assistant.

Answer using ONLY the supplied retrieved evidence.
Never invent facts or use outside knowledge.
Every important factual claim must include a citation such as [S1], [S2], etc., corresponding to the provided sources.
If the supplied evidence does not contain sufficient information to answer the question, explicitly state that the answer cannot be verified from the indexed sources.
When sources refer to different game versions, distinguish them clearly.
Do not produce unsupported predictions or assumptions.

If the question is unanswerable from the provided sources (such as anime voice actors, real-world merchandise, trading card prices, non-indexed Pokémon, or personal trivia), you MUST respond in this format:
"I couldn't verify this information using the sources currently indexed in DexMind. The current database contains Generation 1 Pokémon game statistics, abilities, type matchups, evolution chains, and Pokédex descriptions, and does not contain the required [specific topic, e.g. anime casting / voice actor] information."
"""

def build_rag_prompt(
    query: str,
    retrieved_chunks: List[Dict[str, Any]],
    history: Optional[List[Dict[str, str]]] = None
) -> str:
    """Builds the context string with explicit [S1], [S2] source markers and conversation history."""
    history_str = ""
    if history and len(history) > 0:
        history_lines = []
        for h in history[-4:]:
            r = h.get("role", "user")
            t = h.get("text", "")
            if t:
                history_lines.append(f"{r.capitalize()}: {t}")
        if history_lines:
            history_str = "Prior Conversation History:\n" + "\n".join(history_lines) + "\n\n"

    if not retrieved_chunks:
        return f"{history_str}User Question: {query}\n\nRetrieved Evidence: No relevant sources found in the database."

    evidence_parts = []
    for chunk in retrieved_chunks:
        tag = chunk.get("citation_tag", "[S?]")
        name = chunk.get("pokemon_name", "Unknown")
        c_type = chunk.get("content_type", "general")
        version = chunk.get("version_group", "all")
        content = chunk.get("content", "").strip()

        evidence_parts.append(
            f"Source {tag} (Pokémon: {name}, Type: {c_type}, Version: {version}):\n\"{content}\""
        )

    context_str = "\n\n".join(evidence_parts)
    return (
        f"{history_str}Retrieved Evidence:\n{context_str}\n\n"
        f"User Question: {query}\n\n"
        f"Answer the question using ONLY the evidence above. Build upon any prior conversation context naturally while citing sources like [S1]."
    )

def validate_citations(answer: str, retrieved_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Validates citations in the answer against actual retrieved documents.

    Prevents LLM hallucinations of invalid source IDs.
    """
    valid_tags_map = {c.get("citation_tag"): c for c in retrieved_chunks if "citation_tag" in c}

    # Find all citations of form [S1], [S2], etc.
    found_tags = re.findall(r'\[S(\d+)\]', answer)
    cited_keys = [f"[S{t}]" for t in found_tags]

    verified_sources = []
    invalid_citations = []
    seen_keys = set()

    for k in cited_keys:
        if k in seen_keys:
            continue
        seen_keys.add(k)
        if k in valid_tags_map:
            verified_sources.append(valid_tags_map[k])
        else:
            invalid_citations.append(k)

    # Check for evidence insufficiency / abstention
    is_unanswerable = False
    unanswerable_phrases = [
        "couldn't verify this information",
        "cannot be verified",
        "insufficient information",
        "not contain sufficient information",
        "does not contain"
    ]
    if any(phrase in answer.lower() for phrase in unanswerable_phrases):
        is_unanswerable = True

    return {
        "verified_sources": verified_sources,
        "invalid_citations": invalid_citations,
        "is_unanswerable": is_unanswerable
    }

def generate_rag_response(
    query: str,
    retrieved_chunks: List[Dict[str, Any]],
    history: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    """Coordinates context construction, LLM generation, citation validation, and evidence sufficiency checking."""
    if not retrieved_chunks:
        answer = (
            "I couldn't verify this information using the sources currently indexed in DexMind. "
            "No relevant evidence was found in the indexed database."
        )
        return {
            "answer": answer,
            "citations": [],
            "sources": [],
            "is_unanswerable": True
        }

    prompt = build_rag_prompt(query, retrieved_chunks, history=history)
    llm = get_llm_provider()
    raw_answer = llm.generate(system_instruction=SYSTEM_PROMPT, prompt=prompt)

    validation = validate_citations(raw_answer, retrieved_chunks)

    # Format sources for frontend
    formatted_sources = []
    for s in validation["verified_sources"]:
        formatted_sources.append({
            "citation_tag": s.get("citation_tag"),
            "pokemon_name": s.get("pokemon_name"),
            "content_type": s.get("content_type"),
            "version_group": s.get("version_group"),
            "content": s.get("content"),
            "source_url": s.get("source_url")
        })

    # If answer didn't cite anything but also wasn't unanswerable, provide the top retrieved chunks as reference
    if not formatted_sources and not validation["is_unanswerable"] and retrieved_chunks:
        for s in retrieved_chunks[:3]:
            formatted_sources.append({
                "citation_tag": s.get("citation_tag"),
                "pokemon_name": s.get("pokemon_name"),
                "content_type": s.get("content_type"),
                "version_group": s.get("version_group"),
                "content": s.get("content"),
                "source_url": s.get("source_url")
            })

    return {
        "answer": raw_answer,
        "sources": formatted_sources,
        "is_unanswerable": validation["is_unanswerable"],
        "retrieved_count": len(retrieved_chunks)
    }
