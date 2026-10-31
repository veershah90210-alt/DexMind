/**
 * Tactical Battle Analysis, Levenshtein Spelling Matcher, and Error Sanitizer.
 * Provides high-personality Battle Coach intelligence and canonical Pokémon validation.
 */
import POKEMON_CATALOG from './pokemonNames.json';

/**
 * Strips citation tags (e.g., [S1], [S2], (S1), S1, S2, S3, S4) and (context) markers.
 */
export function stripCitationsAndContext(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    // Remove (context), [context], (context: ...), [context: ...]
    .replace(/\s*[\(\[]\s*context(?:\s*:[^\)\]]*)?\s*[\)\]]/gi, '')
    // Remove bracketed citations: [S1], [S2], [S1, S2], [S1-S4]
    .replace(/\s*\[\s*S\d+(?:\s*(?:,\s*S\d+|-S\d+))*\s*\]/gi, '')
    // Remove parenthesized citations: (S1), (S2), (S1, S2)
    .replace(/\s*\(\s*S\d+(?:\s*(?:,\s*S\d+|-S\d+))*\s*\)/gi, '')
    // Remove standalone citation token sequences: S1, S2, S3, S4
    .replace(/\bS\d+\b(?:\s*,\s*\bS\d+\b)*/g, '')
    // Remove individual standalone S1..S99 markers
    .replace(/\bS\d+\b/g, '')
    // Fix punctuation spacing resulting from removed citations
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/[ ]{2,}/g, ' ')
    .trim();
}

/**
 * Completely removes any "Out of Context/Not Understood:" prefix and citation artifacts.
 */
export function cleanOutOfContextText(text) {
  if (!text || typeof text !== 'string') return '';
  const noPrefix = text
    .replace(/^\s*(?:>\s*)?(?:⚠️\s*)?\*?\*?Out of Context\s*[/|]\s*Not Understood\*?\*?:?\s*/i, '')
    .replace(/(?:>\s*)?(?:⚠️\s*)?\*?\*?Out of Context\s*[/|]\s*Not Understood\*?\*?:?\s*/gi, '')
    .trim();
  return stripCitationsAndContext(noPrefix);
}

export function isAbstentionText(text) {
  if (!text || typeof text !== 'string') return true;
  const lower = text.toLowerCase();
  return (
    lower.includes("couldn't verify this information") ||
    lower.includes("cannot verify this information") ||
    lower.includes("does not contain the required") ||
    lower.includes("outside the indexed") ||
    lower.includes("outside the canonical") ||
    lower.includes("outside the national pokédex")
  );
}

/**
 * Levenshtein edit distance between two strings.
 */
export function levenshteinDistance(a, b) {
  if (!a || !b) return (a || b || '').length;
  const s1 = a.toLowerCase();
  const s2 = b.toLowerCase();
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Uint8Array(n + 1));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // deletion
          dp[i][j - 1],     // insertion
          dp[i - 1][j - 1]  // substitution
        );
      }
    }
  }
  return dp[m][n];
}

/**
 * Searches the 1,025 canonical Pokémon catalog allowing ONLY 1 or 2 letter spelling mistakes.
 * Words of length <= 4: max 1 letter mistake.
 * Words of length > 4: max 2 letter mistakes.
 * Returns { id, name, distance } if within threshold, otherwise null.
 */
const EXCLUDED_COMMON_WORDS = new Set([
  'hello', 'hi', 'hey', 'heya', 'howdy', 'hola', 'greetings', 'help', 'who', 'what', 'where', 'when', 'why',
  'how', 'good', 'morning', 'afternoon', 'evening', 'night', 'thanks', 'thank', 'you', 'commands', 'clear',
  'reset', 'yo', 'sup', 'bye', 'goodbye', 'cool', 'nice', 'okay', 'sure', 'well', 'yes', 'yeah', 'nah', 'nope',
  'the', 'and', 'for', 'with', 'about', 'give', 'tell', 'show', 'can', 'could', 'would', 'will', 'are', 'is',
  'was', 'were', 'this', 'that', 'some', 'all', 'any', 'best', 'most', 'more', 'like', 'other', 'another',
  'does', 'have', 'has', 'had', 'name', 'names', 'need', 'play', 'make', 'take', 'find', 'look', 'from',
  'into', 'over', 'under', 'than', 'then', 'just', 'very', 'much', 'many', 'such', 'both', 'each', 'every',
  'stat', 'stats', 'rule', 'rules', 'game', 'play', 'type', 'types', 'weak', 'move', 'moves', 'item', 'items',
  'team', 'teams', 'lead', 'tank', 'wall', 'buff', 'nerf', 'tier', 'meta', 'turn', 'turns', 'crit', 'hits',
  'damage', 'speed', 'power', 'level', 'form', 'forms', 'mode', 'modes', 'rank', 'ball', 'zone'
]);

export function findClosestPokemon(inputWord, catalog = POKEMON_CATALOG) {
  if (!inputWord || typeof inputWord !== 'string') return null;
  const clean = inputWord.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (clean.length < 2) return null;
  if (EXCLUDED_COMMON_WORDS.has(clean)) return null;

  const maxAllowed = clean.length <= 4 ? 1 : 2;

  let bestMatch = null;
  let minDistance = Infinity;

  for (const entry of catalog) {
    const candidate = (entry.name || '').toLowerCase();
    const candidateClean = candidate.replace(/[^a-z0-9-]/g, '');

    // Exact match
    if (clean === candidateClean) {
      return { id: entry.id, name: entry.name, distance: 0 };
    }

    // Quick length filter
    if (Math.abs(clean.length - candidateClean.length) > maxAllowed) {
      continue;
    }

    const dist = levenshteinDistance(clean, candidateClean);
    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = { id: entry.id, name: entry.name, distance: dist };
    }
  }

  if (bestMatch && bestMatch.distance <= maxAllowed) {
    return bestMatch;
  }
  return null;
}

export function cleanErrorMessage(err) {
  if (!err) return 'An unexpected battle telemetry error occurred. Please try again.';
  const raw = typeof err === 'string' ? err : err.message || String(err);
  const msg = raw.toLowerCase();

  if (msg.includes('string_too_short') || msg.includes('at least 2 characters')) {
    return 'Please enter at least 2 characters to search canonical battle records.';
  }
  if (msg.includes('not found') || msg.includes('404')) {
    return 'Specimen records not found. Please verify spelling or specimen number.';
  }
  if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('connection failed')) {
    return 'Unable to establish connection with the Pokédex service. Please verify the server is running.';
  }
  if (msg.includes('json decode') || msg.includes('json_invalid')) {
    return 'The request could not be processed. Please rephrase your query.';
  }

  const cleaned = raw.replace(/^[{\[].*[}\]]$/s, '').trim();
  return cleaned || 'Specimen records temporarily unavailable. Please retry.';
}

/**
 * Generates an engaging, high-personality battle comparison analysis.
 */
export function generateComparisonAnalysis(p1, p2, statComparison) {
  if (!p1 || !p2) return 'Comparative telemetry complete. Review the stat tier breakdown above.';

  const p1Name = p1.name ? p1.name.charAt(0).toUpperCase() + p1.name.slice(1) : 'Specimen 1';
  const p2Name = p2.name ? p2.name.charAt(0).toUpperCase() + p2.name.slice(1) : 'Specimen 2';

  const formatTypes = (types) =>
    (types || [])
      .map((t) => (typeof t === 'string' ? t : t.name))
      .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
      .join(' / ') || 'Normal';

  const p1Types = formatTypes(p1.types);
  const p2Types = formatTypes(p2.types);

  const p1Stats = p1.stats || {};
  const p2Stats = p2.stats || {};

  const p1Bst = p1Stats.total || Object.entries(p1Stats).reduce((a, [k, v]) => (k !== 'total' && typeof v === 'number' ? a + v : a), 0);
  const p2Bst = p2Stats.total || Object.entries(p2Stats).reduce((a, [k, v]) => (k !== 'total' && typeof v === 'number' ? a + v : a), 0);

  const p1Speed = p1Stats.speed || 0;
  const p2Speed = p2Stats.speed || 0;

  const p1Atk = (p1Stats.attack || 0) + (p1Stats.special_attack || 0);
  const p2Atk = (p2Stats.attack || 0) + (p2Stats.special_attack || 0);

  const p1Def = (p1Stats.defense || 0) + (p1Stats.special_defense || 0);
  const p2Def = (p2Stats.defense || 0) + (p2Stats.special_defense || 0);

  // Speed tier narrative with personality
  let speedNarrative = '';
  if (p1Speed > p2Speed) {
    speedNarrative = `* **Speed & Turn Control:** **${p1Name}** dominates the speed tier with a blazing **${p1Speed}** Base Speed (compared to **${p2Name}**'s **${p2Speed}**). Speed wins games in competitive play, and ${p1Name} commands instant turn initiative to land the first blow.`;
  } else if (p2Speed > p1Speed) {
    speedNarrative = `* **Speed & Turn Control:** **${p2Name}** holds the speed edge with **${p2Speed}** Base Speed (against **${p1Name}**'s **${p1Speed}**). This gives ${p2Name} attack initiative and the ability to dictate turn rhythm.`;
  } else {
    speedNarrative = `* **Speed & Turn Control:** Both titans share an identical Base Speed of **${p1Speed}**! Turn priority will come down to Speed-tie rolls or clutch priority move selection.`;
  }

  // Stat Advantages
  const p1Leads = [];
  const p2Leads = [];
  const statLabels = {
    hp: 'HP',
    attack: 'Attack',
    defense: 'Defense',
    special_attack: 'Sp. Atk',
    special_defense: 'Sp. Def',
    speed: 'Speed',
  };

  for (const [key, label] of Object.entries(statLabels)) {
    const v1 = p1Stats[key] || 0;
    const v2 = p2Stats[key] || 0;
    if (v1 > v2) p1Leads.push(`**${label}** (${v1} vs ${v2})`);
    else if (v2 > v1) p2Leads.push(`**${label}** (${v2} vs ${v1})`);
  }

  return `### **⚔️ Coach's Matchup Breakdown: ${p1Name} vs ${p2Name}**

Alright Trainer, let's break down this head-to-head clash! Both Pokémon bring distinct win conditions to the battlefield. Here is how the numbers and tactical dynamics shake out:

**1. Combat Profiles & Elemental Typing:**
* **${p1Name}:** ${p1Types} • Base Stat Total: **${p1Bst}** • Ability: **${p1.abilities?.[0]?.name || 'Standard'}**
* **${p2Name}:** ${p2Types} • Base Stat Total: **${p2Bst}** • Ability: **${p2.abilities?.[0]?.name || 'Standard'}**

**2. Stat Distribution & Key Advantages:**
* **${p1Name} Leads:** ${p1Leads.length > 0 ? p1Leads.join(', ') : 'Evenly balanced across baseline stats'}
* **${p2Name} Leads:** ${p2Leads.length > 0 ? p2Leads.join(', ') : 'Evenly balanced across baseline stats'}

**3. Tactical Dynamics:**
${speedNarrative}
* **Offensive Output:** ${p1Atk > p2Atk ? `**${p1Name}** generates higher combined offensive pressure (${p1Atk} vs ${p2Atk}), allowing versatile physical or special sets.` : `**${p2Name}** brings greater raw offensive power (${p2Atk} vs ${p1Atk}) to punish neutral targets.`}
* **Defensive Bulk:** ${p1Def > p2Def ? `**${p1Name}** has superior natural bulk (${p1Def} combined defenses).` : `**${p2Name}** holds the defensive resilience edge (${p2Def} combined defenses).`}

**4. Coach's Tactical Playbook:**
* **If you are fielding ${p1Name}:** Leverage your ${p1Speed > p2Speed ? 'speed advantage' : 'typing flexibility'} to pivot into advantageous matchups and pressure early turns.
* **If you are fielding ${p2Name}:** Capitalize on your ${p2Atk > p1Atk ? 'offensive wall-breaking power' : 'defensive stability'} and watch for super-effective opportunities to take momentum.

*Check the complete Head-to-Head Stat Tier Matrix and Combat Profile tables below for exact attribute deltas!*`;
}

/**
 * Generates an engaging single-specimen tactical dossier with Battle Coach personality.
 */
export function generatePokemonDossier(pokemon) {
  if (!pokemon) return 'Specimen telemetry complete.';

  const name = pokemon.name ? pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1) : 'Specimen';
  const genus = pokemon.genus || 'Canonical Pokémon';
  const gen = pokemon.generation ? `Generation ${pokemon.generation}` : 'Canonical Specimen';
  const types = (pokemon.types || [])
    .map((t) => (typeof t === 'string' ? t : t.name))
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .join(' / ') || 'Normal';

  const stats = pokemon.stats || {};
  const bst = stats.total || Object.entries(stats).reduce((a, [k, v]) => (k !== 'total' && typeof v === 'number' ? a + v : a), 0);

  return `### **⚡ Coach's Tactical Dossier: ${name}**

Hey Trainer! Here is the tactical scouting report on **${name}** straight from the canonical records:

* **Classification:** #${String(pokemon.id || 0).padStart(4, '0')} • ${genus} • ${gen}
* **Elemental Typing:** **${types}**
* **Base Stat Total (BST):** **${bst}**

### **Base Stat Matrix**
* **HP:** ${stats.hp || 0}
* **Attack:** ${stats.attack || 0}
* **Defense:** ${stats.defense || 0}
* **Special Attack:** ${stats.special_attack || 0}
* **Special Defense:** ${stats.special_defense || 0}
* **Speed:** ${stats.speed || 0}

**Coach's Tactical Takeaway:** With a **${stats.speed || 0}** Base Speed tier and **${bst}** BST, **${name}** fills key strategic roles on a competitive squad. Its **${types}** typing provides essential resistances and offensive coverage against meta staples.

*Coach's Pro Tip: Keep track of its primary abilities and speed tier when slotting it into your battle rotation!*`;
}
