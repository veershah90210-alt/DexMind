import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'motion/react';
import {
  Send,
  User,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  FileText,
  Swords,
} from 'lucide-react';
import { askQuestion, comparePokemon, fetchPokemonList } from '../services/api';
import PokeBall from '../components/PokeBall';
import {
  cleanOutOfContextText,
  isAbstentionText,
  cleanErrorMessage,
  generateComparisonAnalysis,
  generatePokemonDossier,
  findClosestPokemon,
  stripCitationsAndContext,
} from '../utils/battleAnalysis';
import POKEMON_CATALOG from '../utils/pokemonNames.json';

const SUGGESTED_QUESTIONS = [
  'Who counters Charizard in battle?',
  'Which types can Pikachu beat easily?',
  'Compare Greninja and Lucario.',
  'Build me a 3-Pokémon team to beat Garchomp, Charizard, and Tinkaton.',
  "Explain Eevee's evolution branches.",
  'What are the strongest Dragon-type Pokémon in Paldea?',
];

const POKEMON_BY_NAME = new Map(
  POKEMON_CATALOG.map((p) => [p.name.toLowerCase().replace(/[^a-z0-9]/g, ''), p.id])
);

function getPokemonIdByName(name, sources = []) {
  if (!name) return null;
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (sources && Array.isArray(sources)) {
    for (const s of sources) {
      if (s.pokemon_name && s.pokemon_name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanName.slice(0, 4))) {
        const m = s.source_url?.match(/\/pokemon\/(\d+)/);
        if (m) return parseInt(m[1], 10);
      }
    }
  }

  // Exact catalog lookup across all 1,025 canonical species
  if (POKEMON_BY_NAME.has(cleanName)) {
    return POKEMON_BY_NAME.get(cleanName);
  }

  // Allow 1 or 2 letter spelling mistakes against canonical catalog
  const match = findClosestPokemon(cleanName, POKEMON_CATALOG);
  if (match) return match.id;

  return null;
}

function extractMessagePokemon(m) {
  const result = [];
  const seen = new Set();

  const entities = m.detected_entities || m.retrieval_meta?.entities_detected || [];
  for (const name of entities) {
    const lower = name.toLowerCase().trim();
    if (!seen.has(lower)) {
      seen.add(lower);
      const id = getPokemonIdByName(name, m.sources);
      if (id) {
        result.push({
          id,
          name: name.charAt(0).toUpperCase() + name.slice(1),
          sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
        });
      }
    }
  }

  if (result.length === 0 && m.sources && Array.isArray(m.sources)) {
    for (const s of m.sources) {
      if (s.pokemon_name) {
        const lower = s.pokemon_name.toLowerCase().trim();
        if (!seen.has(lower)) {
          seen.add(lower);
          const id = getPokemonIdByName(s.pokemon_name, m.sources);
          if (id) {
            result.push({
              id,
              name: s.pokemon_name.charAt(0).toUpperCase() + s.pokemon_name.slice(1),
              sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
            });
          }
        }
      }
    }
  }

  return result;
}

function isKeyboardSmashOrGibberish(str) {
  const clean = str.trim().toLowerCase();
  if (clean.length <= 1) return true;
  // Pure punctuation or non-alphanumeric symbols
  if (/^[^a-z0-9]+$/i.test(clean)) return true;
  // Repeated sequence of identical characters (e.g. "aaaaa", ".....", "????", "11111")
  if (/^(.)\1{2,}$/.test(clean)) return true;
  // No spaces, >= 4 chars, and 0 vowels (e.g. "sdfghj", "qwrtyp", "bcdfg")
  if (clean.length >= 4 && !/[aeiouy]/i.test(clean) && !clean.includes(' ')) return true;
  // Consecutive consonant cluster >= 5 without spaces (e.g. "asdfgh", "sdfghjkl", "zxvbnm")
  if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(clean)) return true;
  // Common keyboard row smashes
  const smashPatterns = [
    'asdf', 'sdfg', 'dfgh', 'fghj', 'ghjk', 'hjkl',
    'qwerty', 'werty', 'ertyu', 'rtyui', 'tyuio',
    'zxcv', 'xcvb', 'cvbn', 'vbnm', 'qazwsx', 'edcrfv',
    'poiuy', 'lkjhg', 'mnbvc'
  ];
  if (clean.length >= 4 && !clean.includes(' ') && smashPatterns.some((p) => clean.includes(p))) {
    const knownWords = ['pikachu', 'charizard', 'squirtle', 'bulbasaur', 'gengar', 'mewtwo', 'pokemon', 'pokedex', 'battle', 'stats', 'type', 'counter', 'best', 'versus', 'compare'];
    if (!knownWords.some((w) => clean.includes(w))) {
      return true;
    }
  }
  return false;
}

const POKEMON_TYPES_SET = new Set([
  'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground',
  'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'steel', 'dark', 'fairy', 'stellar'
]);

const POKEMON_KEYWORDS_SET = new Set([
  'stat', 'stats', 'hp', 'attack', 'defense', 'speed', 'bst', 'nature', 'iv', 'ev',
  'ability', 'abilities', 'move', 'moves', 'moveset', 'type', 'types', 'typing',
  'weakness', 'weaknesses', 'resist', 'resistance', 'immune', 'immunity', 'effective',
  'counter', 'counters', 'matchup', 'matchups', 'vs', 'versus', 'compare', 'comparison',
  'team', 'squad', 'lineup', 'lead', 'sweeper', 'tank', 'pivot', 'wall', 'hazard',
  'evolution', 'evolve', 'evolves', 'pre-evolution', 'pokedex', 'dex', 'lore', 'species',
  'shiny', 'legendary', 'mythical', 'paradox', 'gym', 'trainer', 'battle', 'catch',
  'generation', 'gen', 'kanto', 'johto', 'hoenn', 'sinnoh', 'unova', 'kalos', 'alola', 'galar', 'paldea',
  'hello', 'hi', 'hey', 'greetings', 'help', 'who are you', 'what can you do'
]);

function isInvalidOrOutOfScopeQuery(str) {
  if (!str || typeof str !== 'string') return true;
  const clean = str.trim().toLowerCase();
  if (clean.length < 2) return true;

  // Keyboard smash or noise patterns
  if (isKeyboardSmashOrGibberish(clean)) return true;

  // Extract alphanumeric words
  const tokens = clean.match(/[a-z0-9-]+/g) || [];
  if (tokens.length === 0) return true;

  // Check if any word matches a canonical Pokemon (or 1-2 typo allowance)
  const hasPokemon = tokens.some((t) => t.length >= 3 && findClosestPokemon(t) !== null);
  if (hasPokemon) return false;

  // Check if any word is a Pokemon type
  const hasType = tokens.some((t) => POKEMON_TYPES_SET.has(t));
  if (hasType) return false;

  // Check if any word matches battle/game keywords
  const hasKeyword = tokens.some((t) => POKEMON_KEYWORDS_SET.has(t));
  if (hasKeyword) return false;

  // If the query mentions no Pokemon, no types, and no game mechanics, it is outside scope
  return true;
}

function formatContentType(type) {
  if (!type) return 'Field Record';
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function FormattedMessage({ text }) {
  if (!text) return null;

  // Intelligently strip raw [S1], [S2] citation markers and any Out of Context prefix from the rendered prose
  const cleanedText = cleanOutOfContextText(text).replace(/\s*\[S\d+\]/g, '');

  return (
    <div className="text-sm sm:text-base leading-relaxed text-slate-100 font-sans">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="mb-3 last:mb-0 leading-relaxed text-slate-200">
              {children}
            </p>
          ),
          li: ({ children }) => (
            <li className="my-1.5 leading-relaxed list-disc ml-5 text-slate-300">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-yellow-300">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-yellow-200">{children}</em>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-amber-400 mt-4 mb-2">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200 mt-3 mb-1.5">
              {children}
            </h4>
          ),
          ul: ({ children }) => <ul className="space-y-1.5 my-2.5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal ml-5 space-y-1.5 my-2.5">{children}</ol>,
          // GFM Tactical Table Styling
          table: ({ children }) => (
            <div className="overflow-x-auto my-3.5 border border-[#334155] bg-[#0b1329] shadow-sm">
              <table className="w-full text-left font-mono border-collapse text-xs sm:text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#0f172a] border-b-2 border-yellow-400 text-yellow-400 font-bold uppercase tracking-wider">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2 font-black text-xs uppercase tracking-wider border-r border-[#334155] last:border-r-0">
              {children}
            </th>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-[#334155]/80">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-[#1e293b]/70 transition-colors">{children}</tr>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2 text-slate-200 border-r border-[#334155]/60 last:border-r-0">
              {children}
            </td>
          ),
        }}
      >
        {cleanedText}
      </ReactMarkdown>
    </div>
  );
}

const DEFAULT_WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  text: "Hey Trainer! ⚔️ Welcome to the Battle Coach war room. I'm DexMind, your personal battle strategist and competitive Pokédex analyst.\n\nWhether you need deep head-to-head matchup breakdowns, counter picks, team synergy audits, or movepool strategies across all 1,025 canonical species — I'm locked in and ready. Who's stepping into the arena today?",
  sources: [],
  is_unanswerable: false,
};

export default function AskDex({ onCitationClick, initialQuery }) {
  // Store and restore conversation when going to a different section and coming back
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('dexmind_active_conversation');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((m) => ({
            ...m,
            text: cleanOutOfContextText(m.text),
          }));
        }
      }
    } catch (err) {
      console.warn('Failed to restore conversation:', err);
    }
    return [DEFAULT_WELCOME_MESSAGE];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const lastProcessedInitialQuery = useRef('');

  // Persist conversation updates
  useEffect(() => {
    try {
      localStorage.setItem('dexmind_active_conversation', JSON.stringify(messages));
    } catch (err) {
      console.warn('Failed to save conversation:', err);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryToSend) => {
    const query = (queryToSend || inputQuery).trim();
    if (!query || loading) return;

    const userMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: query,
    };

    // 1. Keyboard Smash / Gibberish / Out-of-Scope Noise Check:
    if (isInvalidOrOutOfScopeQuery(query)) {
      setMessages((prev) => [
        ...prev,
        userMessage,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: `"${query}" is outside the canonical Pokémon game records. Please enter a valid Pokémon name, battle matchup, or strategy question.`,
          sources: [],
          is_unanswerable: true,
          is_gibberish: true,
          detected_entities: [],
          comparison_data: null,
        },
      ]);
      setInputQuery('');
      return;
    }

    // Extract recent conversation history for context memory (only valid turns, exclude unanswerable/errors)
    const historyPayload = messages
      .filter((m) => m.id !== 'welcome' && !m.is_error && !m.is_gibberish && !m.is_unanswerable && m.text)
      .slice(-6)
      .map((m) => ({
        role: m.role,
        text: m.text,
      }));

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setLoading(true);

    try {
      const data = await askQuestion(query, null, historyPayload);

      let finalText = data.answer || '';
      let finalSources = data.sources || [];
      let finalUnanswerable = Boolean(data.is_unanswerable);

      // Check if comparison/versus was asked
      const isVsQuery = Boolean(
        query.match(/\b(vs|versus|compare|comparison|matchup|between)\b/i) ||
        data.retrieval_meta?.category === 'comparison'
      );

      // Extract raw candidate entities
      let rawCandidates = [...(data.retrieval_meta?.entities_detected || [])];
      if (isVsQuery && rawCandidates.length < 2) {
        const vsRegex = /(?:compare|between|matchup)\s+([a-zA-Z0-9-]+)\s+(?:and|with|vs|versus|to)\s+([a-zA-Z0-9-]+)/i;
        const directVsRegex = /([a-zA-Z0-9-]+)\s+(?:vs|versus)\s+([a-zA-Z0-9-]+)/i;
        const match = query.match(vsRegex) || query.match(directVsRegex);
        if (match && match[1] && match[2]) {
          rawCandidates = [match[1].trim(), match[2].trim()];
        }
      }

      // Enforce 1 or 2 letter spelling mistakes tolerance against canonical catalog
      let detectedEntities = [];
      if (isVsQuery) {
        if (rawCandidates.length >= 2) {
          const validated = [];
          let spellingFailure = null;
          for (const cand of rawCandidates.slice(0, 2)) {
            const matched = findClosestPokemon(cand);
            if (matched) {
              validated.push(matched.name);
            } else {
              // More than 2 letter mistakes or completely unrecognized entity
              spellingFailure = cand;
              break;
            }
          }

          if (spellingFailure) {
            // Formal error as requested: "only allow one or two letter spelling mistakes when you compare them with the correct spelling mistakes, or else give error formally as we are doing it now."
            setMessages((prev) => [
              ...prev,
              {
                id: `a-${Date.now()}`,
                role: 'assistant',
                text: `"${spellingFailure}" is outside the canonical Pokémon game records.`,
                sources: [],
                is_unanswerable: false,
                is_gibberish: true,
                detected_entities: [],
                comparison_data: null,
              },
            ]);
            return;
          }
          detectedEntities = validated;
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `a-${Date.now()}`,
              role: 'assistant',
              text: `"${query}" is outside the canonical Pokémon game records.`,
              sources: [],
              is_unanswerable: false,
              is_gibberish: true,
              detected_entities: [],
              comparison_data: null,
            },
          ]);
          return;
        }
      } else {
        // Non-versus query: normalize recognized entities
        detectedEntities = rawCandidates.map((c) => {
          const m = findClosestPokemon(c);
          return m ? m.name : c;
        });
      }

      // 2. Comparison / Versus Structured Table Fetching & Synthesis
      let comparisonPayload = null;
      if (isVsQuery && detectedEntities.length >= 2) {
        try {
          comparisonPayload = await comparePokemon(detectedEntities[0], detectedEntities[1]);
          if (comparisonPayload) {
            if (comparisonPayload.analysis && !isAbstentionText(comparisonPayload.analysis)) {
              finalText = cleanOutOfContextText(comparisonPayload.analysis);
            } else {
              // Synthesize full tactical head-to-head analysis without any abstention or error text
              const synthesized = generateComparisonAnalysis(
                comparisonPayload.pokemon1,
                comparisonPayload.pokemon2,
                comparisonPayload.stat_comparison
              );
              finalText = synthesized;
              comparisonPayload.analysis = synthesized;
            }
            if (comparisonPayload.sources && comparisonPayload.sources.length > 0) {
              finalSources = comparisonPayload.sources;
            }
            finalUnanswerable = false;
          }
        } catch (compErr) {
          console.warn('Could not load comparison matrix:', compErr);
        }
      }

      // 3. Single Pokémon / Lore Query Handling when Backend Abstains
      const hasAbstention = isAbstentionText(finalText);
      if (hasAbstention || finalUnanswerable) {
        finalUnanswerable = true;
        finalSources = [];
        // If backend already generated a valid Pokémon response after the abstention
        const howeverIndex = finalText.indexOf('\n\nHowever,');
        const secondaryHeaderIndex = howeverIndex !== -1 ? howeverIndex : finalText.indexOf('\n\n###');

        if (secondaryHeaderIndex !== -1) {
          const validPart = finalText.slice(secondaryHeaderIndex).trim();
          finalText = validPart.replace(/^However,\s*/i, '');
          finalUnanswerable = false;
        }
      }

      // Ensure any out-of-context prefix, citations, and context markers are stripped
      finalText = cleanOutOfContextText(finalText);

      const botMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: finalText,
        sources: finalSources,
        is_unanswerable: finalUnanswerable,
        is_vs_query: isVsQuery,
        retrieval_meta: data.retrieval_meta,
        comparison_data: comparisonPayload,
        detected_entities: detectedEntities,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errStr = String(err.message || '');
      const isShortQueryError = errStr.includes('string_too_short') || errStr.includes('at least 2 characters');

      if (isShortQueryError) {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            text: `"${query}" is outside the canonical Pokémon game records. Please enter a valid Pokémon name, battle matchup, or strategy question.`,
            sources: [],
            is_unanswerable: true,
            is_gibberish: true,
            detected_entities: [],
            comparison_data: null,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            text: cleanErrorMessage(err),
            sources: [],
            is_error: true,
            is_unanswerable: true,
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  // If an initialQuery is passed (from dashboard chip or Pokedex), send it automatically
  useEffect(() => {
    if (initialQuery && initialQuery.trim() && initialQuery !== lastProcessedInitialQuery.current) {
      lastProcessedInitialQuery.current = initialQuery;
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const handleClearChat = () => {
    const resetSession = [
      {
        id: 'welcome',
        role: 'assistant',
        text: "Chalkboard wiped clean, Trainer! 📝 Fresh battle session initiated. Which Pokémon matchup or team strategy are we scouting next?",
        sources: [],
        is_unanswerable: false,
      },
    ];
    setMessages(resetSession);
    try {
      localStorage.setItem('dexmind_active_conversation', JSON.stringify(resetSession));
    } catch (err) {}
  };

  const handleCopyMessage = async (msgId, text) => {
    if (!text) return;
    try {
      const cleaned = text.replace(/\s*\[S\d+\]/g, '');
      await navigator.clipboard.writeText(cleaned);
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId(null), 2000);
    } catch (e) {
      console.error('Failed to copy message', e);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-2 flex flex-col h-[calc(100vh-6.5rem)]">
      {/* Pokédex Intelligence Terminal Chassis */}
      <div className="flex-1 min-w-0 flex flex-col bg-[#1e293b] border-2 border-[#334155] border-t-4 border-t-[#dc2626] shadow-md p-4 sm:p-6 overflow-hidden">
        {/* Top Hardware Header & Suggested Prompts */}
        <div className="pb-4 border-b border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Suggested Queries */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm no-scrollbar flex-1">
            <span className="text-amber-400 shrink-0 font-mono flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-yellow-400" /> Inquiries:
            </span>
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="shrink-0 px-3 py-1.5 bg-[#0f172a] hover:bg-[#334155] border border-[#334155] hover:border-yellow-400 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Reset Chat Button */}
          {messages.length > 1 && (
            <button
              onClick={handleClearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f172a] hover:bg-[#334155] border border-[#334155] text-slate-300 hover:text-white text-xs font-mono transition-colors cursor-pointer shrink-0 font-bold uppercase"
              title="Reset conversation session"
            >
              <RotateCcw className="w-3.5 h-3.5 text-yellow-400" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 pr-2">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            const isGibberish = Boolean(m.is_gibberish);
            const isUnanswerable = Boolean(m.is_unanswerable);
            const isError = Boolean(m.is_error);
            const discussedPokemon = !isUser && !isError && !isGibberish && !isUnanswerable ? extractMessagePokemon(m) : [];

            // Deduplicate sources by pokemon_name and content_type
            const uniqueSources = [];
            const seenSourceKeys = new Set();
            if (m.sources && Array.isArray(m.sources)) {
              for (const s of m.sources) {
                const key = `${s.pokemon_name || ''}-${s.content_type || ''}`;
                if (!seenSourceKeys.has(key)) {
                  seenSourceKeys.add(key);
                  uniqueSources.push(s);
                }
              }
            }

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Bot Avatar */}
                {!isUser && (
                  <div className="w-9 h-9 bg-[#dc2626] border border-white p-1 shrink-0 mt-0.5 flex items-center justify-center shadow-xs">
                    <PokeBall variant="standard" size={20} />
                  </div>
                )}

                {/* Message Bubble Container */}
                <div
                  className={`max-w-[85%] text-sm sm:text-base leading-relaxed relative ${
                    isUser
                      ? 'bg-[#0f172a] text-slate-100 p-4 sm:p-5 border-2 border-sky-500/60 font-medium shadow-sm'
                      : isError || isGibberish
                      ? 'bg-red-950/40 border-2 border-red-500 text-red-200 p-4 sm:p-5'
                      : isUnanswerable
                      ? 'bg-amber-950/30 border-2 border-amber-500/80 text-amber-200 p-4 sm:p-5'
                      : 'bg-[#0f172a] border-2 border-[#334155] border-l-4 border-l-yellow-400 text-slate-100 p-4 sm:p-5 shadow-sm'
                  }`}
                >
                  {/* Pokémon Visual Banner in Battle Coach */}
                  {!isUser && !m.is_error && !isGibberish && discussedPokemon.length > 0 && (
                    <div className="mb-4 p-3 bg-[#0b1329] border border-[#334155]">
                      {discussedPokemon.length === 1 ? (
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-[#1e293b] border border-[#334155] p-1 flex items-center justify-center">
                            <img
                              src={discussedPokemon[0].sprite}
                              alt={discussedPokemon[0].name}
                              className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-md select-none"
                            />
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-yellow-400">
                                #{String(discussedPokemon[0].id).padStart(4, '0')}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                                Canonical Tactical Dossier
                              </span>
                            </div>
                            <h4 className="text-lg sm:text-xl font-black text-white capitalize font-sans tracking-tight">
                              {discussedPokemon[0].name}
                            </h4>
                          </div>
                        </div>
                      ) : m.is_vs_query ? (
                        /* Only show versus clash image when explicitly asked! */
                        <div className="flex items-center justify-around gap-2 py-1">
                          {discussedPokemon.slice(0, 2).map((pk, pIdx) => (
                            <React.Fragment key={pk.name}>
                              {pIdx === 1 && (
                                <div className="w-7 h-7 rounded-full bg-[#1e293b] border border-yellow-400 text-yellow-400 font-black text-xs flex items-center justify-center shrink-0">
                                  VS
                                </div>
                              )}
                              <div className="flex items-center gap-2.5">
                                <div className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 bg-[#1e293b] border p-1 flex items-center justify-center ${pIdx === 0 ? 'border-red-500/70' : 'border-sky-500/70'}`}>
                                  <img
                                    src={pk.sprite}
                                    alt={pk.name}
                                    className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-md select-none"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span className={`text-[10px] font-mono font-bold ${pIdx === 0 ? 'text-red-400' : 'text-sky-400'}`}>
                                    #{String(pk.id).padStart(4, '0')}
                                  </span>
                                  <span className="text-sm sm:text-base font-black text-white capitalize font-sans">
                                    {pk.name}
                                  </span>
                                </div>
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      ) : (
                        /* Non-versus multi-pokemon queries show clean scouted squad cards */
                        <div className="flex flex-wrap items-center gap-2.5 py-1">
                          <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-bold shrink-0">
                            Scouted Squad:
                          </span>
                          {discussedPokemon.map((pk) => (
                            <div key={pk.name} className="flex items-center gap-2 bg-[#1e293b] border border-[#334155] px-2.5 py-1 shadow-xs">
                              <img
                                src={pk.sprite}
                                alt={pk.name}
                                className="w-6 h-6 object-contain drop-shadow-xs select-none"
                              />
                              <span className="text-[10px] font-mono font-bold text-yellow-400">
                                #{String(pk.id).padStart(4, '0')}
                              </span>
                              <span className="text-xs font-black text-white capitalize font-sans">
                                {pk.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stat Tier & Combat Profile Comparison Table Widget */}
                  {!isUser && !m.is_error && !isGibberish && m.comparison_data && (
                    <div className="my-4 space-y-3 border border-[#334155] bg-[#0b1329] p-3.5 shadow-sm">
                      <div className="flex items-center justify-between border-b border-[#334155] pb-2">
                        <div className="flex items-center gap-2 text-xs font-mono font-black text-yellow-400 uppercase tracking-wider">
                          <Swords className="w-4 h-4 text-yellow-400" />
                          Head-to-Head Stat Tier Matrix
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">
                          {m.comparison_data.pokemon1?.name} vs {m.comparison_data.pokemon2?.name}
                        </span>
                      </div>

                      {/* Stat Matrix Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono border-collapse text-xs">
                          <thead className="bg-[#0f172a] text-yellow-400 border-b border-[#334155]">
                            <tr>
                              <th className="px-3 py-1.5 uppercase text-[11px] text-slate-400">Combat Metric</th>
                              <th className="px-3 py-1.5 uppercase text-[11px] text-red-400">{m.comparison_data.pokemon1?.name}</th>
                              <th className="px-3 py-1.5 uppercase text-[11px] text-sky-400">{m.comparison_data.pokemon2?.name}</th>
                              <th className="px-3 py-1.5 uppercase text-[11px] text-slate-400">Advantage</th>
                              <th className="px-3 py-1.5 uppercase text-[11px] text-amber-400">Winner</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#334155]/60">
                            {m.comparison_data.stat_comparison &&
                              Object.entries(m.comparison_data.stat_comparison).map(([statKey, s]) => {
                                const p1Val = s.p1_val ?? s.pokemon1 ?? m.comparison_data.pokemon1?.stats?.[statKey] ?? 0;
                                const p2Val = s.p2_val ?? s.pokemon2 ?? m.comparison_data.pokemon2?.stats?.[statKey] ?? 0;
                                const diff = s.diff !== undefined ? s.diff : (p1Val - p2Val);
                                const winner = s.winner || (diff > 0 ? m.comparison_data.pokemon1?.name : diff < 0 ? m.comparison_data.pokemon2?.name : 'Tied');
                                const statLabel = statKey === 'total' ? 'BST Total' : statKey.replace(/_/g, ' ').toUpperCase();

                                return (
                                  <tr key={statKey} className="hover:bg-[#1e293b]/50">
                                    <td className="px-3 py-1.5 font-bold text-white uppercase text-xs">{statLabel}</td>
                                    <td className={`px-3 py-1.5 font-black ${diff > 0 ? 'text-red-400' : 'text-slate-300'}`}>{p1Val}</td>
                                    <td className={`px-3 py-1.5 font-black ${diff < 0 ? 'text-sky-400' : 'text-slate-300'}`}>{p2Val}</td>
                                    <td className="px-3 py-1.5 text-slate-300 font-bold">
                                      {diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '0'}
                                    </td>
                                    <td className="px-3 py-1.5">
                                      <span
                                        className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                                          winner === m.comparison_data.pokemon1?.name
                                            ? 'text-red-300 bg-red-950/60 border-red-500/40'
                                            : winner === m.comparison_data.pokemon2?.name
                                            ? 'text-sky-300 bg-sky-950/60 border-sky-500/40'
                                            : 'text-slate-400 bg-slate-800 border-slate-700'
                                        }`}
                                      >
                                        {winner}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>

                      {/* Combat Profile Table */}
                      <div className="overflow-x-auto pt-1">
                        <table className="w-full text-left font-mono border-collapse text-xs">
                          <thead className="bg-[#0f172a] text-amber-400 border-b border-[#334155]">
                            <tr>
                              <th className="px-3 py-1.5 uppercase text-[11px] text-slate-400">Combat Profile</th>
                              <th className="px-3 py-1.5 uppercase text-[11px] text-red-400">{m.comparison_data.pokemon1?.name}</th>
                              <th className="px-3 py-1.5 uppercase text-[11px] text-sky-400">{m.comparison_data.pokemon2?.name}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#334155]/60 text-slate-200">
                            <tr>
                              <td className="px-3 py-1.5 font-bold text-white">Elemental Typing</td>
                              <td className="px-3 py-1.5 text-amber-300 font-semibold">{m.comparison_data.pokemon1?.types?.map(t => typeof t === 'string' ? t : t.name).join(' / ')}</td>
                              <td className="px-3 py-1.5 text-amber-300 font-semibold">{m.comparison_data.pokemon2?.types?.map(t => typeof t === 'string' ? t : t.name).join(' / ')}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-1.5 font-bold text-white">Primary Ability</td>
                              <td className="px-3 py-1.5">{m.comparison_data.pokemon1?.abilities?.[0]?.name || 'N/A'}</td>
                              <td className="px-3 py-1.5">{m.comparison_data.pokemon2?.abilities?.[0]?.name || 'N/A'}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-1.5 font-bold text-white">Size (Height / Weight)</td>
                              <td className="px-3 py-1.5">{m.comparison_data.pokemon1?.height}m • {m.comparison_data.pokemon1?.weight}kg</td>
                              <td className="px-3 py-1.5">{m.comparison_data.pokemon2?.height}m • {m.comparison_data.pokemon2?.weight}kg</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Formatted Message Body */}
                  {isUser ? (
                    <div className="whitespace-pre-line text-sm sm:text-base text-slate-100 font-sans">{m.text}</div>
                  ) : (
                    <FormattedMessage text={m.text} />
                  )}

                  {/* Clean Sources Section */}
                  {!isUser && !isError && !isGibberish && !isUnanswerable && uniqueSources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#334155]">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          <span>Sources ({uniqueSources.length})</span>
                        </div>
                        <span className="text-xs font-mono text-slate-400">
                          Verified Game Evidence
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {uniqueSources.map((src, sIdx) => {
                          const title = src.pokemon_name
                            ? `${src.pokemon_name} • ${formatContentType(src.content_type)}`
                            : formatContentType(src.content_type);
                          const hasUrl =
                            src.source_url &&
                            (src.source_url.startsWith('http://') || src.source_url.startsWith('https://'));

                          return hasUrl ? (
                            <a
                              key={sIdx}
                              href={src.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] hover:border-slate-400 text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
                              title={`Open source: ${src.source_url}`}
                            >
                              <span>{title}</span>
                              <ExternalLink className="w-3 h-3 text-sky-400" />
                            </a>
                          ) : (
                            <button
                              key={sIdx}
                              onClick={() => onCitationClick && onCitationClick(src)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] hover:border-slate-400 text-xs text-slate-200 hover:text-white font-medium transition-colors cursor-pointer"
                              title="Inspect verified field document"
                            >
                              <span>{title}</span>
                              {src.version_group && src.version_group !== 'all' && (
                                <span className="text-xs text-amber-400 font-mono">
                                  ({src.version_group})
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Footer Copy Action */}
                  {!isUser && !m.is_error && (
                    <div className="mt-3 pt-2.5 border-t border-[#334155] flex items-center justify-between text-xs text-slate-400">
                      <span className="text-xs font-mono text-slate-400 uppercase font-semibold">
                        DexMind National Intelligence
                      </span>

                      <button
                        onClick={() => handleCopyMessage(m.id, m.text)}
                        className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-slate-400 text-xs font-mono font-bold"
                        title="Copy response"
                      >
                        {copiedMsgId === m.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-9 h-9 bg-[#0284c7] border border-white flex items-center justify-center shrink-0 mt-0.5 text-white shadow-xs">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Loading Indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 sm:gap-4 items-start"
            >
              <div className="w-9 h-9 bg-[#dc2626] border border-white p-1 shrink-0 mt-0.5 flex items-center justify-center shadow-xs">
                <PokeBall variant="ultra" size={20} />
              </div>

              <div className="bg-[#0f172a] border-2 border-yellow-400/50 p-4 text-xs sm:text-sm font-mono text-amber-400 flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-yellow-400 animate-pulse" />
                <span className="font-bold uppercase tracking-wider">Analyzing National Pokédex records...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Box Area */}
        <div className="pt-4 border-t border-[#334155]">
          <div className="relative flex items-center">
            <textarea
              ref={inputRef}
              rows={2}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (e.shiftKey) {
                    return;
                  }
                  e.preventDefault();
                  if (inputQuery.trim() && !loading) {
                    handleSend();
                  }
                }
              }}
              placeholder="Ask Pokédex AI about matchups, counters, stats, or team composition across Gen 1–9..."
              disabled={loading}
              className="w-full bg-[#0f172a] border-2 border-[#475569] focus:border-yellow-400 p-3.5 pr-16 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-hidden transition-colors font-sans resize-none rounded-none leading-relaxed"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputQuery.trim() || loading}
              className={`absolute right-3.5 top-3.5 px-3.5 py-2 transition-colors font-black text-xs sm:text-sm uppercase tracking-wider ${
                inputQuery.trim() && !loading
                  ? 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 cursor-pointer border border-yellow-300'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600'
              }`}
              title="Send query (Enter)"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 font-mono px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400" />
              Trainer Memory Active • 6-Turn Context Retention
            </span>
            <span>Enter to send • Shift+Enter for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
}
