/**
 * Tactical Battle Analysis and Error Message Sanitizer
 * Generates canonical Pokémon comparison narratives and clean, friendly error messages.
 */

export function cleanOutOfContextText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    // Replace markdown alert blockquotes or prefixes with variations of "Out of Context / Not Understood:"
    .replace(/^\s*(?:>\s*)?(?:⚠️\s*)?\*?\*?Out of Context\s*[/|]\s*Not Understood\*?\*?:?\s*/i, '')
    // Also remove inline occurrences if any
    .replace(/(?:>\s*)?(?:⚠️\s*)?\*?\*?Out of Context\s*[/|]\s*Not Understood\*?\*?:?\s*/gi, '')
    .trim();
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

export function cleanErrorMessage(err) {
  if (!err) return 'An unexpected error occurred. Please try again.';
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

  // Strip technical JSON string formatting if present
  const cleaned = raw.replace(/^[{\[].*[}\]]$/s, '').trim();
  return cleaned || 'Specimen records temporarily unavailable. Please retry.';
}

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

  // Speed tier analysis
  let speedNarrative = '';
  if (p1Speed > p2Speed) {
    speedNarrative = `**${p1Name}** controls the speed tier with a Base Speed of **${p1Speed}** (vs **${p2Name}**'s **${p2Speed}**), giving it the decisive first-strike advantage in standard turn order.`;
  } else if (p2Speed > p1Speed) {
    speedNarrative = `**${p2Name}** holds the speed advantage with a Base Speed of **${p2Speed}** (vs **${p1Name}**'s **${p1Speed}**), dictating tempo and initiative in direct combat.`;
  } else {
    speedNarrative = `Both **${p1Name}** and **${p2Name}** share an identical Base Speed tier of **${p1Speed}**, making speed-tie RNG or priority moves the deciding turn factor.`;
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

  return `### **Tactical Head-to-Head Analysis: ${p1Name} vs ${p2Name}**

**1. Typing & Combat Profiles:**
* **${p1Name}:** ${p1Types} type • Base Stat Total: **${p1Bst}** • Primary Ability: **${p1.abilities?.[0]?.name || 'Standard'}**
* **${p2Name}:** ${p2Types} type • Base Stat Total: **${p2Bst}** • Primary Ability: **${p2.abilities?.[0]?.name || 'Standard'}**

**2. Stat Distribution & Combat Roles:**
* **${p1Name} Advantages:** ${p1Leads.length > 0 ? p1Leads.join(', ') : 'Balanced baseline across all attributes'}
* **${p2Name} Advantages:** ${p2Leads.length > 0 ? p2Leads.join(', ') : 'Balanced baseline across all attributes'}

**3. Speed Tier & Turn Initiative:**
${speedNarrative}

**4. Strategic Matchup Summary:**
* **Offensive Pressure:** ${p1Atk > p2Atk ? `**${p1Name}** exerts greater combined offensive force across physical and special vectors (${p1Atk} vs ${p2Atk}).` : `**${p2Name}** boasts higher raw offensive output across physical and special vectors (${p2Atk} vs ${p1Atk}).`}
* **Defensive Resilience:** ${p1Def > p2Def ? `**${p1Name}** demonstrates higher natural bulk (${p1Def} combined defenses).` : `**${p2Name}** holds the defensive edge (${p2Def} combined defenses), offering superior survivability against neutral hits.`}
* **Tactical Conclusion:** In a direct 1v1 battle, turn order and super-effective type coverage determine the victor. Check the complete combat profile and stat tier comparison matrix below.`;
}

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

  return `### **Canonical Tactical Dossier: ${name}**

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

**Tactical Assessment:** **${name}** operates as an official competitive specimen registered in the National Pokédex. With a ${stats.speed || 0} Base Speed tier and ${bst} BST, it fulfills strategic roles in team composition with its ${types} typing.`;
}
