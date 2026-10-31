import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Sparkles, BookOpen, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { askQuestion } from '../services/api';

const SUGGESTED_QUESTIONS = [
  'Compare Charizard and Blastoise.',
  "Explain Eevee's evolution chain.",
  'What makes Gengar special?',
  'Which type of pokemon can pikachu beat easily?',
  'Which Pokémon blast super hot fire?',
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
            <p className="mb-2 last:mb-0 leading-relaxed">
              {React.Children.map(children, renderWithCitations)}
            </p>
          ),
          li: ({ children }) => (
            <li className="my-1.5 leading-relaxed list-disc ml-5 text-zinc-200">
              {React.Children.map(children, renderWithCitations)}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-white text-zinc-100 underline-offset-2">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-zinc-300">
              {children}
            </em>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-mono uppercase tracking-wider text-red-400 font-bold mt-3 mb-1.5">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold mt-2 mb-1">
              {children}
            </h4>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1 my-2">
              {children}
            </ul>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

export default function AskDex({ onCitationClick }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello! I am DexMind, your RAG-powered Pokémon research assistant. Ask me anything about Pokémon stats, abilities, evolution chains, or type matchups. Every claim I make is cited directly from indexed PokéAPI records.",
      sources: [],
      is_unanswerable: false
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState({});
  const messagesEndRef = useRef(null);

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
      text: query
    };

    // Extract recent conversation history for context memory
    const historyPayload = messages
      .filter((m) => m.id !== 'welcome' && !m.is_error && m.text)
      .slice(-6)
      .map((m) => ({
        role: m.role,
        text: m.text
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
        retrieval_meta: data.retrieval_meta
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const isIndexError = err.type === 'AtlasIndexMissing' || err.message?.includes('dex_vector_index') || err.message?.includes('dex_text_index');
      const errorMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: isIndexError
          ? `⚠️ Atlas Search Index Error: ${err.message}`
          : `⚠️ ${err.message || 'Error communicating with DexMind backend.'}`,
        sources: [],
        is_error: true
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSourceExpand = (msgId) => {
    setExpandedSources((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8.5rem)]">
      {/* Suggested Questions Carousel */}
      <div className="py-2 flex items-center gap-2 overflow-x-auto pb-3 text-xs border-b border-zinc-800/80">
        <span className="text-zinc-500 shrink-0 font-mono flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-red-400" /> Suggested:
        </span>
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="shrink-0 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-red-500/40 text-zinc-300 transition-colors cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-2">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0 mt-0.5 text-red-400">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 sm:p-5 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-red-600 text-white rounded-tr-xs'
                    : m.is_error
                    ? 'bg-red-950/30 border border-red-500/40 text-red-200 rounded-tl-xs'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-tl-xs shadow-md'
                }`}
              >
                {/* Unanswerable Question Abstention Banner */}
                {m.is_unanswerable && (
                  <div className="mb-3 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2 font-medium">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Insufficient Grounded Evidence in Indexed PokéAPI Data</span>
                  </div>
                )}

                {/* Formatted Message Body with Markdown & Clickable Citations */}
                {isUser ? (
                  <div className="whitespace-pre-line font-sans">{m.text}</div>
                ) : (
                  <FormattedMessage
                    text={m.text}
                    sources={m.sources}
                    onCitationClick={onCitationClick}
                  />
                )}

                {/* Retrieved Sources Accordion */}
                {!isUser && m.sources && m.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-zinc-800/80">
                    <button
                      onClick={() => toggleSourceExpand(m.id)}
                      className="flex items-center justify-between w-full text-xs text-zinc-400 hover:text-zinc-200 font-mono py-1 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-red-400" />
                        Grounded Sources ({m.sources.length} retrieved passages)
                      </span>
                      {expandedSources[m.id] ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {expandedSources[m.id] && (
                      <div className="mt-2 space-y-2 pt-1 animate-in fade-in duration-200">
                        {m.sources.map((src, idx) => (
                          <div
                            key={idx}
                            onClick={() => onCitationClick && onCitationClick(src)}
                            className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 hover:border-red-500/40 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono font-bold text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-500/30">
                                  {src.citation_tag}
                                </span>
                                <span className="font-semibold text-zinc-200 capitalize text-xs">
                                  {src.pokemon_name}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-mono uppercase bg-zinc-800 px-1.5 py-0.2 rounded">
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
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mt-0.5 text-zinc-300">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3.5 items-start">
            <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0 text-red-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-xs p-4 text-xs font-mono text-zinc-400 flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span>Vector Search & Evidence Grounding in Progress...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="pt-2 pb-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask anything about Pokémon stats, abilities, types, or evolution chains..."
            disabled={loading}
            className="w-full bg-zinc-900 border border-zinc-850 focus:border-red-500 rounded-2xl px-5 py-3.5 pr-14 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-hidden transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className={`absolute right-2.5 p-2 rounded-xl transition-all ${
              inputQuery.trim() && !loading
                ? 'bg-red-600 text-white hover:bg-red-500 shadow-md cursor-pointer'
                : 'text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[11px] text-zinc-500 text-center mt-2 font-mono">
          DexMind RAG with conversational context memory • Citations verified against indexed records.
        </p>
      </div>
    </div>
  );
}
