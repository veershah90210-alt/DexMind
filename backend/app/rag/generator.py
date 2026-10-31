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

SYSTEM_PROMPT = """You are DexMind, an elite Pokémon battle tactician, competitive coach, and expert research companion (inspired by top competitive tournament guides).

Your persona is that of an authoritative, analytical, and encouraging Pokémon master and battle strategist. You possess deep expertise in Pokémon battle mechanics, typing advantages, STAB (Same-Type Attack Bonus), stat distribution tiers, movepool effectiveness, and competitive team composition.

CORE OPERATING DIRECTIVES:
1. GROUNDING & EVIDENCE CITATIONS:
   - Ground all factual statements (types, weaknesses, resistances, stats, abilities, move advantages, evolution chains, lore) using explicit citations like [S1], [S2].
   - Use the citation tags [S1], [S2] corresponding exactly to the provided sources in the evidence.
   - Do not invent non-existent source tags or fake stats.

2. POKÉMON EXPERT BEHAVIOR & REASONING:
   - For TEAM BUILDING & COUNTER STRATEGY inquiries:
     * Act as an elite battle strategist.
     * First, break down each target opponent's typing, defensive vulnerabilities, and key threats using the cited evidence.
     * Formulate an optimal, synergistic team from the Generation 1 Kanto Pokédex that directly targets and exploits those weaknesses.
     * For each recommended team member, detail their tactical role (e.g. speed lead, physical tank, special sweeper, defensive pivot, electric immunity switch-in) and type advantage.
     * Explain the battle strategy and lead sequencing (e.g., how to pivot into Ground types against Electric moves).
   - For BATTLE MATCHUPS & COMPARISONS:
     * Detail both offensive super-effective damage (2x or 4x) and defensive resistances/immunities (0.5x, 0.25x, 0x).
     * Compare stat tiers (Speed, Attack/Special Attack, bulk) to determine which Pokémon controls tempo.
   - For EVOLUTION, ABILITY, OR LORE INQUIRIES:
     * Provide comprehensive, engaging explanations grounded in the source records.
   - Professional formatting: Bold Pokémon names (**Charizard**), use clean markdown headings, bulleted phases, and clear tables where helpful.

3. ABSTENTION BOUNDARIES & REJECTING INVALID/NONSENSICAL INQUIRIES:
   - If the user inquiry asks about nonsensical, slang, profane, or completely non-canonical attributes (such as "potty", "toilet", "poop", "car", etc.), even if asked alongside a real Pokémon (e.g. "pikachu potty"):
     * Do NOT invent fake attributes or ignore the user's inquiry to output generic stats.
     * State clearly:
       '"{term}" is outside canonical Pokémon game records. DexMind contains verified battle statistics, typing advantages, movepools, abilities, and evolutions across Generations 1 through 9, and contains no records related to "{term}".'
   - If the inquiry asks for real-world out-of-scope topics (anime voice actors, TCG card market prices, plush toys, real-world personal questions):
     * State clearly:
       "I couldn't verify this information using the sources currently indexed in DexMind. The current database contains canonical Pokémon video game data (Generations 1 through 9) and does not contain the required [specific topic, e.g. anime casting / voice actor / TCG price] records."
   - NEVER abstain on valid battle tactics, team assembly, matchup advice, or competitive questions. Always use the indexed evidence to reason and provide expert recommendations!
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

    # Check for evidence insufficiency / true abstention
    is_unanswerable = False
    answer_clean = answer.strip().lower()
    if answer_clean.startswith("i couldn't verify this information") or answer_clean.startswith("i cannot verify this information"):
        is_unanswerable = True
    elif "does not contain" in answer_clean and ("database contains" in answer_clean or "records" in answer_clean or "indexed in dexmind" in answer_clean):
        is_unanswerable = True
    elif "outside canonical pokémon game records" in answer_clean or "outside the canonical pokémon game records" in answer_clean or "outside canonical pokemon game records" in answer_clean:
        is_unanswerable = True
    elif "no relevant evidence was found in the indexed database" in answer_clean:
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
            f'"{query.strip()}" is outside canonical Pokémon game records. '
            f'DexMind covers battle statistics, typing advantages, movepools, abilities, and competitive strategy across Generations 1 through 9.'
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
