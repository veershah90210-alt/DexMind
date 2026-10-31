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
  Swords,
} from 'lucide-react';
import { getTypeStyle } from '../utils/pokemonTypes';

const STAT_CONFIG = {
  hp: { name: 'HP', icon: Heart },
  attack: { name: 'Attack', icon: Zap },
  defense: { name: 'Defense', icon: Shield },
  special_attack: { name: 'Sp. Atk', icon: Sparkles },
  special_defense: { name: 'Sp. Def', icon: Shield },
  speed: { name: 'Speed', icon: Gauge },
  total: { name: 'Total BST', icon: Trophy },
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
            className="inline-flex items-center px-1.5 py-0.2 mx-0.5 rounded text-[11px] font-mono font-bold bg-yellow-400/15 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-300 transition-colors cursor-pointer align-baseline"
            title={`View battle lore: ${sourceObj?.pokemon_name || 'source'}`}
          >
            {citationTag}
          </button>
        );
      }
      return part;
    });
  };

  return (
    <div className="bg-[#0b142b] border border-blue-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
      {/* Head-to-Head Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Center VS Badge for Desktop */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#060b19] border-2 border-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/30 font-black text-xs text-yellow-300">
            VS
          </div>
        </div>

        {/* Pokemon 1 Card */}
        <div className="relative overflow-hidden rounded-2xl bg-[#0d1733] border border-blue-500/20 p-6 flex flex-col items-center text-center">
          <div
            className="absolute -top-16 -left-16 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-40"
            style={{ backgroundColor: p1TypeStyle.glow }}
          />

          <div className="w-28 h-28 rounded-2xl bg-[#060b19] p-2 border border-blue-500/20 mb-3 flex items-center justify-center relative shadow-inner">
            <img
              src={p1.sprite_url}
              alt={p1.name}
              className="w-24 h-24 object-contain drop-shadow-md select-none"
            />
            {p1Total > p2Total && (
              <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-[10px] font-bold font-mono flex items-center gap-1 shadow-xs">
                <Trophy className="w-3 h-3 text-yellow-400" /> Lead BST
              </span>
            )}
          </div>

          <span className="text-xs font-mono font-bold text-blue-300">
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

          <div className="mt-4 pt-3 border-t border-blue-500/15 w-full flex justify-around text-xs font-mono text-blue-200">
            <div>
              BST: <span className="font-bold text-yellow-400">{p1Total}</span>
            </div>
            <div>
              Height: <span className="font-bold text-white">{p1.height || 'N/A'}m</span>
            </div>
            <div>
              Weight: <span className="font-bold text-white">{p1.weight || 'N/A'}kg</span>
            </div>
          </div>
        </div>

        {/* Pokemon 2 Card */}
        <div className="relative overflow-hidden rounded-2xl bg-[#0d1733] border border-blue-500/20 p-6 flex flex-col items-center text-center">
          <div
            className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-40"
            style={{ backgroundColor: p2TypeStyle.glow }}
          />

          <div className="w-28 h-28 rounded-2xl bg-[#060b19] p-2 border border-blue-500/20 mb-3 flex items-center justify-center relative shadow-inner">
            <img
              src={p2.sprite_url}
              alt={p2.name}
              className="w-24 h-24 object-contain drop-shadow-md select-none"
            />
            {p2Total > p1Total && (
              <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-[10px] font-bold font-mono flex items-center gap-1 shadow-xs">
                <Trophy className="w-3 h-3 text-yellow-400" /> Lead BST
              </span>
            )}
          </div>

          <span className="text-xs font-mono font-bold text-blue-300">
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

          <div className="mt-4 pt-3 border-t border-blue-500/15 w-full flex justify-around text-xs font-mono text-blue-200">
            <div>
              BST: <span className="font-bold text-yellow-400">{p2Total}</span>
            </div>
            <div>
              Height: <span className="font-bold text-white">{p2.height || 'N/A'}m</span>
            </div>
            <div>
              Weight: <span className="font-bold text-white">{p2.weight || 'N/A'}kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Numerical Base Stats Comparison Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-blue-500/15 pb-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-blue-300 font-bold flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-yellow-400" />
            Base Stats Comparison Matrix
          </h4>
          <span className="text-[11px] font-mono text-blue-300/70">
            Official Pokémon Base Stats
          </span>
        </div>

        <div className="space-y-2">
          {stat_comparison && Object.entries(stat_comparison).map(([statKey, comp]) => {
            const config = STAT_CONFIG[statKey] || { name: statKey };
            const p1Val = comp.pokemon1;
            const p2Val = comp.pokemon2;
            const diff = comp.diff;
            const p1Wins = diff > 0;
            const p2Wins = diff < 0;

            const maxRef = statKey === 'total' ? 800 : 255;
            const p1Pct = Math.min(Math.round((p1Val / maxRef) * 100), 100);
            const p2Pct = Math.min(Math.round((p2Val / maxRef) * 100), 100);

            return (
              <div
                key={statKey}
                className="bg-[#060b19] border border-blue-500/15 rounded-xl p-3 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={`w-12 font-bold ${p1Wins ? 'text-yellow-400' : 'text-slate-300'}`}>
                    {p1Val}
                  </span>
                  <span className="text-blue-300 font-bold uppercase text-[11px] flex items-center gap-1.5">
                    {config.name}
                    {diff !== 0 && (
                      <span className={`text-[10px] px-1 py-0.2 rounded font-mono font-bold ${
                        p1Wins ? 'text-yellow-400 bg-yellow-400/10' : 'text-blue-400 bg-blue-500/10'
                      }`}>
                        {diff > 0 ? `+${diff} (${p1.name})` : `${diff} (${p2.name})`}
                      </span>
                    )}
                  </span>
                  <span className={`w-12 text-right font-bold ${p2Wins ? 'text-blue-400' : 'text-slate-300'}`}>
                    {p2Val}
                  </span>
                </div>

                {/* Comparative Double Progress Bar */}
                <div className="grid grid-cols-2 gap-2 h-2">
                  {/* P1 Bar (flows right to left) */}
                  <div className="bg-blue-950/50 rounded-full h-full overflow-hidden flex justify-end">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p1Pct}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        p1Wins ? 'bg-gradient-to-l from-yellow-400 to-amber-500' : 'bg-slate-600'
                      }`}
                    />
                  </div>

                  {/* P2 Bar (flows left to right) */}
                  <div className="bg-blue-950/50 rounded-full h-full overflow-hidden flex justify-start">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p2Pct}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        p2Wins ? 'bg-gradient-to-r from-blue-500 to-blue-400' : 'bg-slate-600'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Battle Strategist Analysis Narrative */}
      {analysis && (
        <div className="bg-[#060b19] border border-blue-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-blue-500/15 pb-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-yellow-400 font-bold flex items-center gap-2">
              <Swords className="w-4 h-4 text-yellow-400" />
              Tactical Battle Strategist Analysis
            </h4>
            <span className="text-[11px] font-mono text-blue-300">
              Official League Battle Simulation
            </span>
          </div>

          <div className="text-sm leading-relaxed text-blue-100">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0 leading-relaxed text-blue-100/90">
                    {React.Children.map(children, renderWithCitations)}
                  </p>
                ),
                li: ({ children }) => (
                  <li className="my-1.5 leading-relaxed list-disc ml-5 text-blue-200/90">
                    {React.Children.map(children, renderWithCitations)}
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-extrabold text-white">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-yellow-300/90">{children}</em>
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
            <div className="pt-3 border-t border-blue-500/15">
              <button
                onClick={() => setSourcesOpen(!sourcesOpen)}
                className="flex items-center justify-between w-full text-xs text-yellow-400 hover:text-yellow-300 font-mono py-1 transition-colors cursor-pointer font-bold"
              >
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Verified Battle Records ({sources.length} field lore citations)
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
                      className="bg-[#0b142b] p-3 rounded-xl border border-blue-500/20 hover:border-yellow-400/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-yellow-400 bg-yellow-400/15 px-1.5 py-0.5 rounded border border-yellow-400/30">
                            {src.citation_tag}
                          </span>
                          <span className="font-bold text-white capitalize text-xs">
                            {src.pokemon_name}
                          </span>
                          <span className="text-[10px] text-blue-300 font-mono uppercase bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20">
                            {src.content_type?.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-[10px] text-blue-300/70 font-mono">
                          Inspect passage
                        </span>
                      </div>
                      <p className="text-xs text-blue-200/75 line-clamp-2 italic">
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
