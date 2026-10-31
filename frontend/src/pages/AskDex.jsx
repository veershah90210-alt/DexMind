import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import {
  Send,
  User,
  Sparkles,
  BookOpen,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
import { askQuestion } from '../services/api';

const SUGGESTED_QUESTIONS = [
  'Which Pokémon blast super hot fire?',
  'Which type of pokemon can pikachu beat easily?',
  'Compare Charizard and Blastoise.',
  "Explain Eevee's evolution chain.",
  'What makes Gengar special?',
  'Who voiced Pikachu in the anime?' // Unanswerable test case
];

function FormattedMessage({ text, sources, onCitationClick }) {
  if (!text) return null;

  const renderWithCitations = (children) => {
    if (typeof children !== 'string') return children;
    const parts = children.split(/(\[S\d+\])/g);
    return parts.map((part, index) => {
      const match = part.match(/\[S(\d+)\]/);
      if (match) {
        const citationTag = part;
        const sourceObj = sources?.find((s) => s.citation_tag === citationTag);
        return (
          <button
            key={index}
            onClick={() => sourceObj && onCitationClick && onCitationClick(sourceObj)}
            className="inline-flex items-center px-1.5 py-0.2 mx-0.5 rounded text-[11px] font-mono font-bold bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 transition-colors cursor-pointer align-baseline"
            title={`View evidence: ${sourceObj?.pokemon_name || 'source'}`}
          >
            {citationTag}
          </button>
        );
      }
      return part;
    });
  };

  return (
    <div className="text-sm leading-relaxed text-zinc-100">
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="mb-2.5 last:mb-0 leading-relaxed text-zinc-200">
              {React.Children.map(children, renderWithCitations)}
            </p>
          ),
          li: ({ children }) => (
            <li className="my-1.5 leading-relaxed list-disc ml-5 text-zinc-300">
              {React.Children.map(children, renderWithCitations)}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-white underline-offset-2">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-zinc-300">{children}</em>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-mono uppercase tracking-wider text-red-400 font-bold mt-4 mb-2">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold mt-3 mb-1.5">
              {children}
            </h4>
          ),
          ul: ({ children }) => <ul className="space-y-1 my-2">{children}</ul>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

export default function AskDex({ onCitationClick, initialQuery }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello! I am DexMind, your RAG-powered Pokémon research intelligence platform. Ask me anything about Pokémon stats, competitive battle matchups, abilities, or evolution chains. Every response is strictly grounded with verifiable PokéAPI citations.",
      sources: [],
      is_unanswerable: false,
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState({});
  const [copiedMsgId, setCopiedMsgId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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

      const botMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: data.answer,
        sources: data.sources || [],
        is_unanswerable: data.is_unanswerable,
        retrieval_meta: data.retrieval_meta,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const isIndexError =
        err.type === 'AtlasIndexMissing' ||
        err.message?.includes('dex_vector_index') ||
        err.message?.includes('dex_text_index');
      const errorMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: isIndexError
          ? `⚠️ Atlas Search Index Error: ${err.message}`
          : `⚠️ ${err.message || 'Error communicating with DexMind backend.'}`,
        sources: [],
        is_error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // If an initialQuery is passed (from dashboard chip), send it automatically
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: "Conversation cleared. Memory reset. Ask me anything about Pokémon stats, battle matchups, abilities, or lore.",
        sources: [],
        is_unanswerable: false,
      },
    ]);
  };

  const handleCopyMessage = async (msgId, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId(null), 2000);
    } catch (e) {
      console.error('Failed to copy message', e);
    }
  };

  const toggleSourceExpand = (msgId) => {
    setExpandedSources((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-7.5rem)]">
      {/* Top Bar: Suggestions & Control */}
      <div className="py-2 border-b border-white/[0.08] flex items-center justify-between gap-4">
        {/* Suggested Queries */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar flex-1">
          <span className="text-zinc-500 shrink-0 font-mono flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3 h-3 text-red-400" /> Suggestions:
          </span>
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="shrink-0 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-red-500/40 text-zinc-300 text-[11px] transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Reset Chat Button */}
        {messages.length > 1 && (
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-zinc-200 text-xs font-mono transition-colors cursor-pointer shrink-0"
            title="Reset conversation context"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-1">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {/* Bot Avatar */}
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-rose-700 p-0.5 shrink-0 mt-0.5 shadow-md shadow-red-600/20">
                  <div className="w-full h-full rounded-full bg-[#10131d] flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-xs animate-pulse-subtle" />
                  </div>
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-4 sm:p-5 text-sm leading-relaxed relative group ${
                  isUser
                    ? 'bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-tr-xs shadow-lg shadow-red-600/10'
                    : m.is_error
                    ? 'bg-red-950/30 border border-red-500/40 text-red-200 rounded-tl-xs'
                    : 'bg-[#10131d] border border-white/[0.08] text-zinc-100 rounded-tl-xs shadow-xl'
                }`}
              >
                {/* Unanswerable Question Abstention Banner */}
                {m.is_unanswerable && (
                  <div className="mb-3.5 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2 font-medium">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Insufficient Grounded Evidence in Indexed PokéAPI Data</span>
                  </div>
                )}

                {/* Formatted Message Body */}
                {isUser ? (
                  <div className="whitespace-pre-line font-medium">{m.text}</div>
                ) : (
                  <FormattedMessage
                    text={m.text}
                    sources={m.sources}
                    onCitationClick={onCitationClick}
                  />
                )}

                {/* Actions Footer for Bot Messages */}
                {!isUser && !m.is_error && (
                  <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      {m.sources && m.sources.length > 0 && (
                        <button
                          onClick={() => toggleSourceExpand(m.id)}
                          className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors cursor-pointer text-zinc-400"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-red-400" />
                          <span>Sources ({m.sources.length})</span>
                          {expandedSources[m.id] ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopyMessage(m.id, m.text)}
                      className="flex items-center gap-1 hover:text-zinc-200 transition-colors cursor-pointer text-zinc-400 text-[11px] font-mono"
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

                {/* Retrieved Sources Accordion Drawer */}
                {!isUser && m.sources && m.sources.length > 0 && expandedSources[m.id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 space-y-2 pt-2 border-t border-white/[0.06]"
                  >
                    {m.sources.map((src, idx) => (
                      <div
                        key={idx}
                        onClick={() => onCitationClick && onCitationClick(src)}
                        className="bg-[#090a10] p-3 rounded-xl border border-white/[0.06] hover:border-red-500/40 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-500/30">
                              {src.citation_tag}
                            </span>
                            <span className="font-semibold text-zinc-200 capitalize text-xs">
                              {src.pokemon_name}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono uppercase bg-white/[0.04] px-1.5 py-0.2 rounded">
                              {src.content_type}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            Click to inspect
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-2 italic">
                          "{src.content}"
                        </p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* User Avatar */}
              {isUser && (
                <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center shrink-0 mt-0.5 text-zinc-200 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3.5 items-start"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-rose-700 p-0.5 shrink-0 mt-0.5">
              <div className="w-full h-full rounded-full bg-[#10131d] flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              </div>
            </div>

            <div className="bg-[#10131d] border border-white/[0.08] rounded-2xl rounded-tl-xs p-4 text-xs font-mono text-zinc-300 flex items-center gap-3 shadow-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span>Vector Search & Evidence Grounding in Progress...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Area */}
      <div className="pt-2 pb-3">
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
            placeholder="Ask anything about Pokémon stats, abilities, types, or evolution chains..."
            disabled={loading}
            className="w-full bg-[#10131d] border border-white/[0.1] focus:border-red-500 rounded-2xl px-5 py-3.5 pr-14 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-hidden transition-all shadow-xl"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className={`absolute right-2.5 p-2 rounded-xl transition-all ${
              inputQuery.trim() && !loading
                ? 'bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-600/30 cursor-pointer'
                : 'text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2 font-mono px-2">
          <span>Context Memory Active • Last 6 Turns Retained</span>
          <span>Verified against MongoDB Atlas PokéAPI Chunks</span>
        </div>
      </div>
    </div>
  );
}
