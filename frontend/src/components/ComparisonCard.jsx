import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import {
  Trophy,
  Zap,
  Shield,
  Heart,
  Gauge,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Crosshair,
} from 'lucide-react';
import { getTypeStyle } from '../utils/pokemonTypes';

const STAT_CONFIG = {
  hp: { name: 'HP', icon: Heart, color: 'text-emerald-400', bg: 'bg-emerald-500' },
  attack: { name: 'Attack', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500' },
  defense: { name: 'Defense', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500' },
  special_attack: { name: 'Sp. Atk', icon: Sparkles, color: 'text-red-400', bg: 'bg-red-500' },
  special_defense: { name: 'Sp. Def', icon: Shield, color: 'text-indigo-400', bg: 'bg-indigo-500' },
  speed: { name: 'Speed', icon: Gauge, color: 'text-amber-400', bg: 'bg-amber-500' },
  total: { name: 'Total BST', icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-500' },
};

export default function ComparisonCard({ data, onCitationClick }) {
  const [sourcesOpen, setSourcesOpen] = useState(false);

  if (!data) return null;

  const { pokemon1: p1, pokemon2: p2, stat_comparison, analysis, sources } = data;

  const p1PrimaryType = p1.types?.[0]
    ? typeof p1.types[0] === 'string'
      ? p1.types[0]
      : p1.types[0].name
    : 'normal';
  const p2PrimaryType = p2.types?.[0]
    ? typeof p2.types[0] === 'string'
      ? p2.types[0]
      : p2.types[0].name
    : 'normal';

  const p1TypeStyle = getTypeStyle(p1PrimaryType);
  const p2TypeStyle = getTypeStyle(p2PrimaryType);

  const p1Total = p1.stats?.total || 0;
  const p2Total = p2.stats?.total || 0;

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
            title={`View evidence passage from ${sourceObj?.pokemon_name || 'source'}`}
          >
            {citationTag}
          </button>
        );
      }
      return part;
    });
  };

  return (
    <div className="bg-[#10131d] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
      {/* Head-to-Head Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Center VS Badge for Desktop */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-[#151a27] border-2 border-red-500/60 flex items-center justify-center shadow-lg shadow-red-500/20 font-black text-xs text-white">
            VS
          </div>
        </div>

        {/* Pokemon 1 Card */}
        <div className="relative overflow-hidden rounded-2xl bg-[#151a27]/90 border border-white/[0.08] p-6 flex flex-col items-center text-center">
          <div
            className="absolute -top-16 -left-16 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-40"
            style={{ backgroundColor: p1TypeStyle.glow }}
          />

          <div className="w-28 h-28 rounded-2xl bg-[#090a10]/80 p-2 border border-white/[0.08] mb-3 flex items-center justify-center relative shadow-inner">
            <img
              src={p1.sprite_url}
              alt={p1.name}
              className="w-24 h-24 object-contain drop-shadow-md select-none"
            />
            {p1Total > p2Total && (
              <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-bold font-mono flex items-center gap-1 shadow-xs">
                <Trophy className="w-3 h-3" /> Winner
              </span>
            )}
          </div>

          <span className="text-xs font-mono font-bold text-zinc-500">
            #{String(p1.id).padStart(3, '0')}
          </span>
          <h3 className="text-2xl font-black text-white capitalize tracking-tight mt-0.5">
            {p1.name}
          </h3>

          <div className="flex gap-1.5 mt-2 justify-center">
            {p1.types?.map((t) => {
              const name = typeof t === 'string' ? t : t.name;
              const style = getTypeStyle(name);
              return (
                <span
                  key={name}
                  className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-md tracking-wider border ${style.bg} ${style.border} ${style.text}`}
                >
                  {name}
                </span>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.06] w-full flex justify-around text-xs font-mono text-zinc-400">
            <div>
              BST: <span className="font-bold text-white">{p1Total}</span>
            </div>
            <div>
              Height: <span className="font-bold text-zinc-200">{p1.height || 'N/A'}m</span>
            </div>
            <div>
              Weight: <span className="font-bold text-zinc-200">{p1.weight || 'N/A'}kg</span>
            </div>
          </div>
        </div>

        {/* Pokemon 2 Card */}
        <div className="relative overflow-hidden rounded-2xl bg-[#151a27]/90 border border-white/[0.08] p-6 flex flex-col items-center text-center">
          <div
            className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-40"
            style={{ backgroundColor: p2TypeStyle.glow }}
          />

          <div className="w-28 h-28 rounded-2xl bg-[#090a10]/80 p-2 border border-white/[0.08] mb-3 flex items-center justify-center relative shadow-inner">
            <img
              src={p2.sprite_url}
              alt={p2.name}
              className="w-24 h-24 object-contain drop-shadow-md select-none"
            />
            {p2Total > p1Total && (
              <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-bold font-mono flex items-center gap-1 shadow-xs">
                <Trophy className="w-3 h-3" /> Winner
              </span>
            )}
          </div>

          <span className="text-xs font-mono font-bold text-zinc-500">
            #{String(p2.id).padStart(3, '0')}
          </span>
          <h3 className="text-2xl font-black text-white capitalize tracking-tight mt-0.5">
            {p2.name}
          </h3>

          <div className="flex gap-1.5 mt-2 justify-center">
            {p2.types?.map((t) => {
              const name = typeof t === 'string' ? t : t.name;
              const style = getTypeStyle(name);
              return (
                <span
                  key={name}
                  className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-md tracking-wider border ${style.bg} ${style.border} ${style.text}`}
                >
                  {name}
                </span>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.06] w-full flex justify-around text-xs font-mono text-zinc-400">
            <div>
              BST: <span className="font-bold text-white">{p2Total}</span>
            </div>
            <div>
              Height: <span className="font-bold text-zinc-200">{p2.height || 'N/A'}m</span>
            </div>
            <div>
              Weight: <span className="font-bold text-zinc-200">{p2.weight || 'N/A'}kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Numerical Base Stats Comparison Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-red-400" />
            Base Stats Comparison Matrix
          </h4>
          <span className="text-[11px] font-mono text-zinc-500">
            {p1.name} (Left) vs {p2.name} (Right)
          </span>
        </div>

        <div className="space-y-2">
          {Object.entries(stat_comparison || {}).map(([key, stat]) => {
            const config = STAT_CONFIG[key] || {
              name: key,
              icon: Zap,
              color: 'text-zinc-400',
              bg: 'bg-zinc-600',
            };
            const Icon = config.icon;

            const p1Val = stat.p1_val ?? 0;
            const p2Val = stat.p2_val ?? 0;
            const diff = stat.diff ?? 0;
            const p1Wins = diff > 0;
            const p2Wins = diff < 0;

            const maxRef = key === 'total' ? 800 : 255;
            const p1Pct = Math.min(Math.round((p1Val / maxRef) * 100), 100);
            const p2Pct = Math.min(Math.round((p2Val / maxRef) * 100), 100);

            return (
              <div
                key={key}
                className="bg-[#090a10] p-3.5 rounded-xl border border-white/[0.06] flex flex-col gap-2"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  {/* Left (P1) Stat */}
                  <div className="flex items-center gap-2 w-28">
                    <span
                      className={`text-sm font-bold ${
                        p1Wins ? 'text-emerald-400 font-black' : 'text-zinc-400'
                      }`}
                    >
                      {p1Val}
                    </span>
                    {p1Wins && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-500/30">
                        +{diff}
                      </span>
                    )}
                  </div>

                  {/* Stat Center Label */}
                  <div className="flex items-center justify-center gap-1.5 font-semibold text-zinc-200">
                    <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                    <span>{config.name}</span>
                  </div>

                  {/* Right (P2) Stat */}
                  <div className="flex items-center justify-end gap-2 w-28">
                    {p2Wins && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-500/30">
                        +{Math.abs(diff)}
                      </span>
                    )}
                    <span
                      className={`text-sm font-bold ${
                        p2Wins ? 'text-emerald-400 font-black' : 'text-zinc-400'
                      }`}
                    >
                      {p2Val}
                    </span>
                  </div>
                </div>

                {/* Dual Visual Comparative Progress Bar */}
                <div className="grid grid-cols-2 gap-2 h-2 rounded-full overflow-hidden bg-white/[0.04] p-0.5">
                  {/* P1 bar (fills from right to left) */}
                  <div className="flex justify-end">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p1Pct}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        p1Wins ? 'bg-gradient-to-l from-emerald-500 to-teal-400' : 'bg-zinc-600'
                      }`}
                    />
                  </div>

                  {/* P2 bar (fills from left to right) */}
                  <div className="flex justify-start">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p2Pct}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        p2Wins ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-zinc-600'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RAG Synthesis Narrative */}
      {analysis && (
        <div className="bg-[#090a10] border border-white/[0.08] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-red-400 font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Retrieval-Grounded Matchup Synthesis
            </h4>
            <span className="text-[11px] font-mono text-zinc-500">
              Gemini + PokéAPI Grounding
            </span>
          </div>

          <div className="text-sm leading-relaxed text-zinc-200">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0 leading-relaxed">
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
                ul: ({ children }) => (
                  <ul className="space-y-1 my-2">{children}</ul>
                ),
              }}
            >
              {analysis}
            </ReactMarkdown>
          </div>

          {/* Collapsible Source Evidence */}
          {sources && sources.length > 0 && (
            <div className="pt-3 border-t border-white/[0.06]">
              <button
                onClick={() => setSourcesOpen(!sourcesOpen)}
                className="flex items-center justify-between w-full text-xs text-zinc-400 hover:text-zinc-200 font-mono py-1 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-red-400" />
                  Grounded Evidence ({sources.length} retrieved chunks)
                </span>
                {sourcesOpen ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {sourcesOpen && (
                <div className="mt-3 space-y-2">
                  {sources.map((src, idx) => (
                    <div
                      key={idx}
                      onClick={() => onCitationClick && onCitationClick(src)}
                      className="bg-[#10131d] p-3 rounded-xl border border-white/[0.06] hover:border-red-500/40 cursor-pointer transition-colors"
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
                          Inspect passage
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
      )}
    </div>
  );
}
