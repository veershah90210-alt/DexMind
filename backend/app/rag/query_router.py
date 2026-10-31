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

def levenshtein_distance(s1: str, s2: str) -> int:
    """Calculates Levenshtein edit distance between two strings."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    prev = list(range(len(s2) + 1))
    for i, c1 in enumerate(s1):
        curr = [i + 1]
        for j, c2 in enumerate(s2):
            ins = prev[j + 1] + 1
            dele = curr[j] + 1
            sub = prev[j] + (0 if c1 == c2 else 1)
            curr.append(min(ins, dele, sub))
        prev = curr
    return prev[-1]

def match_closest_pokemon(word: str) -> Optional[str]:
    """Matches a word against all canonical Pokémon with up to 1-2 typo allowance."""
    w = word.strip().lower()
    if len(w) < 3:
        return None
    if w in ALL_POKEMON_SET:
        return w.replace("-", " ").title()
    max_dist = 1 if len(w) <= 4 else 2
    for p in ALL_POKEMON_SET:
        if abs(len(w) - len(p)) > max_dist:
            continue
        if levenshtein_distance(w, p) <= max_dist:
            return p.replace("-", " ").title()
    return None

POKEMON_TYPES = {
    "normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison", "ground",
    "flying", "psychic", "bug", "rock", "ghost", "dragon", "steel", "dark", "fairy", "stellar"
}

POKEMON_GAME_KEYWORDS = [
    "stat", "stats", "hp", "attack", "defense", "speed", "sp atk", "sp def", "special attack", "special defense",
    "bst", "base stat", "base stats", "iv", "ev", "nature", "ability", "abilities", "hidden ability",
    "move", "moves", "moveset", "type", "types", "typing", "weakness", "weaknesses", "weak to", "resist",
    "resistance", "immune", "immunity", "effective", "effectiveness", "super effective", "counter", "counters",
    "matchup", "matchups", "vs", "versus", "compare", "comparison", "team", "teams", "squad", "roster",
    "lineup", "lead", "sweeper", "tank", "pivot", "wall", "hazard", "stealth rock", "spikes", "toxic",
    "status", "burn", "paralyze", "paralysis", "sleep", "freeze", "crit", "critical hit", "damage", "stab",
    "item", "items", "held item", "mega", "mega evolution", "dynamax", "gigantamax", "terastal", "tera",
    "tier", "smogon", "ubers", "ou", "uu", "ru", "nu", "vgc", "generation", "gen 1", "gen 2", "gen 3",
    "gen 4", "gen 5", "gen 6", "gen 7", "gen 8", "gen 9", "kanto", "johto", "hoenn", "sinnoh", "unova",
    "kalos", "alola", "galar", "paldea", "hisui", "pokedex", "pokédex", "evolution", "evolve", "evolves",
    "pre-evolution", "shiny", "legendary", "mythical", "paradox", "ultra beast", "gym", "gym leader",
    "elite four", "champion", "trainer", "battle", "catch", "caught", "pokemon", "pokémon"
]

CONVERSATIONAL_KEYWORDS = [
    "hello", "hi", "hey", "greetings", "help", "who are you", "what can you do", "commands", "clear", "reset", "thanks", "thank you"
]

def is_pokemon_domain_query(query: str, found_pokemon: List[str]) -> bool:
    """Verifies whether the inquiry pertains to the Pokémon domain."""
    if found_pokemon:
        return True

    q_lower = query.lower()
    words = re.findall(r'\b[a-z0-9-]+\b', q_lower)
    if not words:
        return False

    # Check for single word or token typo match with any canonical pokemon
    for w in words:
        if len(w) >= 3 and match_closest_pokemon(w):
            return True

    # Check for elemental types
    if any(re.search(r'\b' + re.escape(t) + r'\b', q_lower) for t in POKEMON_TYPES):
        return True

    # Check for battle and game terminology
    if any(re.search(r'\b' + re.escape(k) + r'\b', q_lower) for k in POKEMON_GAME_KEYWORDS):
        return True

    # Check for conversational greeting or help command
    if any(re.search(r'\b' + re.escape(g) + r'\b', q_lower) for g in CONVERSATIONAL_KEYWORDS):
        return True

    return False

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

    query_lower = query.lower()

    # Do not contextualize if the query already explicitly mentions a canonical Pokemon name
    for p in sorted(ALL_POKEMON_SET, key=len, reverse=True):
        pattern = r'\b' + re.escape(p) + r'\b'
        if re.search(pattern, query_lower):
            return query

    cues = [
        "such", "these", "those", "them", "they", "it", "its", "both", "all of them",
        "build me", "recommend", "what about", "and what about", "how about", "their",
        "more like", "similar", "instead", "which one", "who is faster", "who is stronger",
        "another one", "other pokemon", "same", "who wins", "who is better", "how to counter",
        "what counters", "why", "what are its stats", "what is its type", "can it learn"
    ]
    has_cue = any(re.search(r'\b' + re.escape(c) + r'\b', query_lower) for c in cues)

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
            f"CRITICAL RULE: If the follow-up message is a new standalone question, an unrelated topic, slang, or nonsense (such as 'potty'), return the follow-up message EXACTLY as-is without adding prior Pokémon or context.\n\n"
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

    # If no exact entity found, check tokens for 1-2 letter typos against canonical Pokemon
    if not found_pokemon:
        words = re.findall(r'\b[a-z0-9-]+\b', query_lower)
        for w in words:
            if len(w) >= 3:
                m = match_closest_pokemon(w)
                if m and m not in found_pokemon:
                    found_pokemon.append(m)

    # 2. Domain check: If no pokemon found and query does not contain Pokemon domain terms, mark out of scope
    if not is_pokemon_domain_query(effective_query, found_pokemon):
        logger.info(f"Query '{query}' determined out of scope for Pokemon domain.")
        return QueryAnalysis(
            category="out_of_scope",
            pokemon_entities=[],
            sub_queries=[],
            is_comparison=False,
            content_type_filter=None
        )

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
