import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import {
  Send,
  User,
  Sparkles,
  AlertTriangle,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { askQuestion } from '../services/api';
import PokeBall from '../components/PokeBall';

const SUGGESTED_QUESTIONS = [
  'Who counters Charizard in battle?',
  'Which types can Pikachu beat easily?',
  'Compare Greninja and Lucario.',
  'Build me a 3-Pokémon team to beat Garchomp, Charizard, and Tinkaton.',
  "Explain Eevee's evolution branches.",
  'What are the strongest Dragon-type Pokémon in Paldea?',
];

function formatContentType(type) {
  if (!type) return 'Field Record';
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function FormattedMessage({ text }) {
  if (!text) return null;

  // Intelligently strip raw [S1], [S2] citation markers from the rendered prose
  const cleanedText = text.replace(/\s*\[S\d+\]/g, '');

  return (
    <div className="text-sm sm:text-base leading-relaxed text-slate-100 font-sans">
      <ReactMarkdown
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
  text: "Greetings Trainer. I am DexMind, your Battle Strategist and National Pokédex Intelligence. Inquire about base statistics, competitive battle matchups, counters, abilities, or team compositions across all 9 Generations.",
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
          return parsed;
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

    // 1. Single letter query check: Never throw error, gracefully explain message was not understood
    if (query.length <= 1) {
      setMessages((prev) => [
        ...prev,
        userMessage,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: "Transmission incomplete or not understood. Single-character inputs are too short to identify a Pokémon record. Please specify a Pokémon name, move, type matchup, or battle inquiry (e.g., **Charizard**, **Pikachu counters**, or **Best Water types**).",
          sources: [],
          is_unanswerable: false,
        },
      ]);
      setInputQuery('');
      return;
    }

    // Extract recent conversation history for context memory (last 6 valid turns)
    const historyPayload = messages
      .filter((m) => m.id !== 'welcome' && !m.is_error && m.text)
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

      // 2. Mixed Query Handling: Part of chat is correct, other half is wrong/out of context
      const detectedEntities = data.retrieval_meta?.entities_detected || [];
      const hasAbstention =
        finalText.toLowerCase().includes("couldn't verify this information") ||
        finalText.toLowerCase().includes("cannot verify this information") ||
        finalText.toLowerCase().includes("does not contain the required");

      if (detectedEntities.length > 0 && hasAbstention) {
        // Extract the out-of-context or unrecognized subject name
        const matchWrong = finalText.match(/does not contain the required\s+([^.\n]+?)\s+information/i);
        const wrongTopic = matchWrong ? matchWrong[1].replace(/^\[|\]$/g, '').trim() : 'the non-canonical topic';

        // Check if the backend already generated the valid Pokémon response after the abstention
        const howeverIndex = finalText.indexOf('\n\nHowever,');
        const secondaryHeaderIndex = howeverIndex !== -1 ? howeverIndex : finalText.indexOf('\n\n###');

        if (secondaryHeaderIndex !== -1) {
          // Backend already answered the valid Pokémon part; clean and emphasize out-of-context note
          const validPart = finalText.slice(secondaryHeaderIndex).trim();
          finalText = `> ⚠️ **Out of Context / Not Understood**: "${wrongTopic}" is outside the National Pokédex database.\n\n${validPart.replace(/^However,\s*/i, '')}`;
          finalUnanswerable = false;
        } else {
          // Backend only output the abstention; query the valid detected Pokémon directly
          try {
            const entityDossier = await askQuestion(
              `Provide battle overview, stats, type matchups, and abilities for ${detectedEntities.join(' and ')}`,
              null,
              historyPayload
            );

            if (entityDossier?.answer && !entityDossier.is_unanswerable) {
              finalText = `> ⚠️ **Out of Context / Not Understood**: "${wrongTopic}" is outside the canonical Pokémon game records.\n\nHere is the verified tactical dossier for **${detectedEntities.join(' & ')}**:\n\n${entityDossier.answer}`;
              finalSources = entityDossier.sources || [];
              finalUnanswerable = false;
            }
          } catch (recoveryErr) {
            console.warn('Entity follow-up recovery note:', recoveryErr);
          }
        }
      }

      const botMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: finalText,
        sources: finalSources,
        is_unanswerable: finalUnanswerable,
        retrieval_meta: data.retrieval_meta,
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
            text: "Your message was not understood or too short. Please enter a more complete inquiry (e.g., 'Tell me about Pikachu' or 'Who counters Charizard?').",
            sources: [],
            is_unanswerable: false,
          },
        ]);
      } else {
        // Check if query had a recognizable Pokémon entity that can still be answered
        const knownKanto = [
          'pikachu', 'charizard', 'blastoise', 'venusaur', 'mewtwo', 'mew', 'gengar',
          'lucario', 'garchomp', 'eevee', 'snorlax', 'dragonite', 'gyarados', 'alakazam',
          'machamp', 'arcanine', 'lapras', 'zapdos', 'articuno', 'moltres', 'raichu'
        ];
        const lowerQ = query.toLowerCase();
        const foundPokemon = knownKanto.filter((p) => lowerQ.includes(p));

        if (foundPokemon.length > 0) {
          try {
            const fallbackData = await askQuestion(
              `Provide battle overview, stats, and type matchups for ${foundPokemon.join(' and ')}`
            );
            setMessages((prev) => [
              ...prev,
              {
                id: `a-${Date.now()}`,
                role: 'assistant',
                text: `> ⚠️ **Out of Context / Not Understood**: Part of your query could not be processed.\n\nHere is the verified tactical record for **${foundPokemon.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' & ')}**:\n\n${fallbackData.answer}`,
                sources: fallbackData.sources || [],
                is_unanswerable: false,
              },
            ]);
            return;
          } catch (fallbackErr) {
            // fallback to friendly response below
          }
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            text: `Transmission not understood or temporarily unavailable: ${err.message || 'Please clarify your question and try again.'}`,
            sources: [],
            is_error: true,
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
        text: "Battle session reset. Memory cleared. What Pokémon matchup or team strategy would you like to explore next?",
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
                      : m.is_error
                      ? 'bg-red-950/40 border-2 border-red-500 text-red-200 p-4 sm:p-5'
                      : 'bg-[#0f172a] border-2 border-[#334155] border-l-4 border-l-yellow-400 text-slate-100 p-4 sm:p-5 shadow-sm'
                  }`}
                >
                  {/* Out of Scope Lore Banner */}
                  {m.is_unanswerable && (
                    <div className="mb-3.5 p-3 bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs sm:text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Topic Outside Canonical Game Battle Records & Pokédex Database</span>
                    </div>
                  )}

                  {/* Formatted Message Body */}
                  {isUser ? (
                    <div className="whitespace-pre-line text-sm sm:text-base text-slate-100 font-sans">{m.text}</div>
                  ) : (
                    <FormattedMessage text={m.text} />
                  )}

                  {/* Clean Sources Section */}
                  {!isUser && !m.is_error && uniqueSources.length > 0 && (
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative flex items-center"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask Pokédex AI about matchups, counters, stats, or team composition across Gen 1–9..."
              disabled={loading}
              className="w-full bg-[#0f172a] border-2 border-[#475569] focus:border-yellow-400 px-5 py-3.5 pr-16 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-hidden transition-colors font-sans"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className={`absolute right-2 px-4 py-2 transition-colors font-black text-xs sm:text-sm uppercase tracking-wider ${
                inputQuery.trim() && !loading
                  ? 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 cursor-pointer border border-yellow-300'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600'
              }`}
              title="Send query (Enter)"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </button>
          </form>

          <div className="flex items-center justify-between text-xs text-slate-400 mt-2.5 font-mono px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400" />
              Trainer Memory Active • 6-Turn Context Retention
            </span>
            <span>Press Enter to Submit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
