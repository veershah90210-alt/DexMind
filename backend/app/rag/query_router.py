import re
import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

logger = logging.getLogger("dexmind.query_router")

KANTO_POKEMON = [
    "bulbasaur", "ivysaur", "venusaur", "charmander", "charmeleon", "charizard",
    "squirtle", "wartortle", "blastoise", "caterpie", "metapod", "butterfree",
    "weedle", "kakuna", "beedrill", "pidgey", "pidgeotto", "pidgeot",
    "rattata", "raticate", "spearow", "fearow", "ekans", "arbok",
    "pikachu", "raichu", "sandshrew", "sandslash", "nidoran♀", "nidorina",
    "nidoqueen", "nidoran♂", "nidorino", "nidoking", "clefairy", "clefable",
    "vulpix", "ninetales", "jigglypuff", "wigglytuff", "zubat", "golbat",
    "oddish", "gloom", "vileplume", "paras", "parasect", "venonat",
    "venomoth", "diglett", "dugtrio", "meowth", "persian", "psyduck",
    "golduck", "mankey", "primeape", "growlithe", "arcanine", "poliwag",
    "poliwhirl", "poliwrath", "abra", "kadabra", "alakazam", "machop",
    "machoke", "machamp", "bellsprout", "weepinbell", "victreebel", "tentacool",
    "tentacruel", "geodude", "graveler", "golem", "ponyta", "rapidash",
    "slowpoke", "slowbro", "magnemite", "magneton", "farfetch'd", "doduo",
    "dodrio", "seel", "dewgong", "grimer", "muk", "shellder",
    "cloyster", "gastly", "haunter", "gengar", "onix", "drowzee",
    "hypno", "krabby", "kingler", "voltorb", "electrode", "exeggcute",
    "exeggutor", "cubone", "marowak", "hitmonlee", "hitmonchan", "lickitung",
    "koffing", "weezing", "rhyhorn", "rhydon", "chansey", "tangela",
    "kangaskhan", "horsea", "seadra", "goldeen", "seaking", "staryu",
    "starmie", "mr. mime", "scyther", "jynx", "electabuzz", "magmar",
    "pinsir", "tauros", "magikarp", "gyarados", "lapras", "ditto",
    "eevee", "vaporeon", "jolteon", "flareon", "porygon", "omanyte",
    "omastar", "kabuto", "kabutops", "aerodactyl", "snorlax", "articuno",
    "zapdos", "moltres", "dratini", "dragonair", "dragonite", "mewtwo", "mew"
]

ALL_POKEMON_SET = set(KANTO_POKEMON)
_names_file = Path(__file__).parent / "all_pokemon_names.json"
if _names_file.exists():
    try:
        with open(_names_file, "r", encoding="utf-8") as _f:
            for _name in json.load(_f):
                _n = _name.lower().strip()
                if len(_n) >= 3:
                    ALL_POKEMON_SET.add(_n)
                    ALL_POKEMON_SET.add(_n.replace("-", " "))
    except Exception as _ex:
        logger.warning(f"Could not load all_pokemon_names.json: {_ex}")

class QueryAnalysis:
    def __init__(
        self,
        category: str,
        pokemon_entities: List[str],
        sub_queries: List[Dict[str, Any]],
        is_comparison: bool = False,
        content_type_filter: Optional[str] = None
    ):
        self.category = category
        self.pokemon_entities = pokemon_entities
        self.sub_queries = sub_queries
        self.is_comparison = is_comparison
        self.content_type_filter = content_type_filter

    def to_dict(self):
        return {
            "category": self.category,
            "pokemon_entities": self.pokemon_entities,
            "sub_queries": self.sub_queries,
            "is_comparison": self.is_comparison,
            "content_type_filter": self.content_type_filter
        }

def contextualize_query(query: str, history: Optional[List[Dict[str, str]]] = None) -> str:
    """If conversational history exists and the query is anaphoric/follow-up, reformulates it into a standalone query."""
    if not history or len(history) == 0:
        return query

    cues = [
        "such", "these", "those", "them", "they", "it", "its", "both", "all of them",
        "build me", "recommend", "what about", "and what about", "how about", "their",
        "more like", "similar", "instead", "which one", "who is faster", "who is stronger",
        "another one", "other pokemon", "same"
    ]
    query_lower = query.lower()
    has_cue = any(re.search(r'\b' + re.escape(c) + r'\b', query_lower) for c in cues) or len(query.split()) <= 4

    if not has_cue:
        return query

    try:
        from app.rag.generator import get_llm_provider
        llm = get_llm_provider()
        history_lines = []
        for h in history[-4:]:
            r = h.get("role", "user")
            t = h.get("text", "")
            if t:
                history_lines.append(f"{r.capitalize()}: {t}")
        history_text = "\n".join(history_lines)

        reformulate_prompt = (
            f"Given the conversation history below and a follow-up user message, rewrite the follow-up message "
            f"into a single, complete standalone search query for a Pokémon database that preserves all context and resolves references "
            f"(such as 'such pokemon', 'it', 'them', 'both', 'these', 'team of 3').\n"
            f"Example:\n"
            f"History: User: Which Pokémon blast fire? Assistant: Charizard spits super hot fire...\n"
            f"Follow-up: Build me a team of 3 such pokemon.\n"
            f"Standalone Query: Fire-type Pokémon that blast fire in Generation 1\n\n"
            f"Conversation History:\n{history_text}\n\n"
            f"Follow-up Question: {query}\n\n"
            f"Standalone Query:"
        )
        rewritten = llm.generate(
            system_instruction="You are an expert search query reformulator for a Pokémon Pokédex database. Output ONLY the standalone search query without quotes or extra text.",
            prompt=reformulate_prompt
        ).strip().strip('"').strip("'")
        if rewritten and len(rewritten) > 3:
            logger.info(f"Contextualized query from '{query}' to '{rewritten}'")
            return rewritten
    except Exception as e:
        logger.warning(f"Query contextualization fallback: {e}")

    return query

def route_query(query: str, history: Optional[List[Dict[str, str]]] = None) -> QueryAnalysis:
    """Understands user query intent, extracts entities, and creates targeted sub-queries with context awareness."""
    effective_query = contextualize_query(query, history)
    query_lower = effective_query.lower()

    # 1. Extract Pokémon entities mentioned
    found_pokemon = []
    # Sort by length descending to match e.g. "victreebel" before "bell" or multi-word
    for p in sorted(ALL_POKEMON_SET, key=len, reverse=True):
        pattern = r'\b' + re.escape(p) + r'\b'
        if re.search(pattern, query_lower):
            canonical = p.replace("-", " ").title()
            if canonical not in found_pokemon:
                found_pokemon.append(canonical)

    # Detect team building and counter strategy intents
    team_keywords = ["team", "assemble", "build a team", "build me a team", "squad", "roster", "lineup"]
    counter_keywords = ["beat", "counter", "counters", "defeat", "win against", "best against", "counters for", "who can beat", "how to defeat", "matchup against", "take down", "deal with", "check"]
    is_team = any(k in query_lower for k in team_keywords)
    is_counter = any(k in query_lower for k in counter_keywords)

    # Check for comparison (only when NOT team building or counter strategy)
    comparison_keywords = ["compare", "vs", "versus", "better than", "difference between", "stronger than"]
    has_comparison_keyword = any(k in query_lower for k in comparison_keywords)
    is_comparison = not (is_team or is_counter) and (has_comparison_keyword or (len(found_pokemon) == 2 and (" or " in query_lower or " vs " in query_lower)))

    # Detect category and content type filter
    category = "general"
    content_type_filter = None

    matches = []
    if any(k in query_lower for k in ["evolv", "evolution", "evolves into", "pre-evolution", "evolution chain"]):
        matches.append(("evolution", "evolution"))
    if any(k in query_lower for k in ["ability", "abilities", "hidden ability", "effect of"]):
        matches.append(("ability", "ability"))
    if any(k in query_lower for k in ["type", "weakness", "weak to", "resist", "immune", "effectiveness", "damage from", "super effective", "double damage", "half damage"]):
        matches.append(("type_analysis", "type_matchup"))
    if any(k in query_lower for k in ["stat", "stats", "base stat", "hp", "attack", "defense", "speed", "special attack", "bst"]):
        matches.append(("stats", "overview_stats"))

    if is_team:
        category = "team_building"
        content_type_filter = None
    elif is_counter:
        category = "counter_strategy"
        content_type_filter = None
    elif is_comparison and len(found_pokemon) >= 2:
        category = "comparison"
        content_type_filter = None
    elif len(matches) == 1:
        category, content_type_filter = matches[0]
    elif len(matches) > 1:
        category = "multi_attribute"
        content_type_filter = None
    elif found_pokemon:
        category = "pokemon_lookup"
        content_type_filter = None

    # Construct targeted sub-queries
    sub_queries = []
    if category in ["team_building", "counter_strategy"] and found_pokemon:
        # 1. Targeted sub-query for each opponent's weaknesses and stats
        for p in found_pokemon:
            sub_queries.append({
                "entity": p,
                "text": f"{p} type weaknesses battle matchups stats",
                "filter": {"pokemon_name": p}
            })
        # 2. General counter search query across Kanto
        sub_queries.append({
            "entity": None,
            "text": f"Pokemon battle counter offensive advantages against {' '.join(found_pokemon)}",
            "filter": {"content_type": "type_matchup"}
        })
    elif category == "comparison" and len(found_pokemon) >= 2:
        # Entity-independent sub-queries for multi-entity comparison
        for p in found_pokemon:
            sub_queries.append({
                "entity": p,
                "text": f"{p} base stats, types, and weaknesses",
                "filter": {"pokemon_name": p}
            })
    elif found_pokemon:
        for p in found_pokemon:
            filter_dict = {"pokemon_name": p}
            if content_type_filter:
                filter_dict["content_type"] = content_type_filter
            sub_queries.append({
                "entity": p,
                "text": effective_query,
                "filter": filter_dict
            })
    else:
        # General query
        sub_queries.append({
            "entity": None,
            "text": effective_query,
            "filter": {}
        })

    return QueryAnalysis(
        category=category,
        pokemon_entities=found_pokemon,
        sub_queries=sub_queries,
        is_comparison=(category == "comparison"),
        content_type_filter=content_type_filter
    )
