import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import {
  Trophy,
  Zap,
  Shield,
  Heart,
  Gauge,
  Sparkles,
  Crosshair,
  Swords,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { getTypeStyle } from '../utils/pokemonTypes';
import PokeBall from './PokeBall';

const STAT_CONFIG = {
  hp: { name: 'HP', icon: Heart },
  attack: { name: 'Attack', icon: Zap },
  defense: { name: 'Defense', icon: Shield },
  special_attack: { name: 'Sp. Atk', icon: Sparkles },
  special_defense: { name: 'Sp. Def', icon: Shield },
  speed: { name: 'Speed', icon: Gauge },
  total: { name: 'Total BST', icon: Trophy },
};

function formatContentType(type) {
  if (!type) return 'Field Record';
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ComparisonCard({ data, onCitationClick }) {
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

  const p1Total = p1.stats?.total || 0;
  const p2Total = p2.stats?.total || 0;

  // Clean raw [S1], [S2] tags from rendered analysis
  const cleanAnalysis = analysis ? analysis.replace(/\s*\[S\d+\]/g, '') : '';

  // Deduplicate sources
  const uniqueSources = [];
  const seenSourceKeys = new Set();
  if (sources && Array.isArray(sources)) {
    for (const s of sources) {
      const key = `${s.pokemon_name || ''}-${s.content_type || ''}`;
      if (!seenSourceKeys.has(key)) {
        seenSourceKeys.add(key);
        uniqueSources.push(s);
      }
    }
  }

  return (
    <div className="bg-[#1e293b] border-2 border-[#334155] border-t-4 border-t-yellow-400 p-5 sm:p-7 space-y-6 shadow-md">
      {/* Head-to-Head Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
        {/* Center VS Badge */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center">
          <div className="w-12 h-12 bg-[#0f172a] border-2 border-yellow-400 flex items-center justify-center font-black text-sm text-yellow-400 shadow-lg">
            VS
          </div>
        </div>

        {/* Pokemon 1 Card (Red Corner) */}
        <div className="relative overflow-hidden bg-[#0f172a] border-2 border-red-500/60 p-6 flex flex-col items-center text-center shadow-sm">
          <div className="absolute -bottom-5 -right-5 pointer-events-none opacity-5">
            <PokeBall variant="watermark" size={100} />
          </div>

          <div className="w-32 h-32 sm:w-36 sm:h-36 bg-[#1e293b] p-3 border-2 border-[#334155] mb-3 flex items-center justify-center relative">
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p1.id}.png`}
              onError={(e) => {
                e.currentTarget.src = p1.sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p1.id}.png`;
              }}
              alt={p1.name}
              className="w-28 h-28 sm:w-32 sm:h-32 object-contain select-none drop-shadow-md"
            />
            {p1Total > p2Total && (
              <span className="absolute -top-3 -right-2 px-2.5 py-0.5 bg-yellow-400 text-slate-950 text-xs font-black font-mono flex items-center gap-1 border border-yellow-300 uppercase shadow-xs">
                <Trophy className="w-3.5 h-3.5 text-slate-950" /> Lead BST
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600/20 text-red-400 border border-red-500/30">
            <PokeBall variant="standard" size={13} />
            <span className="text-xs sm:text-sm font-mono font-bold">
              #{String(p1.id).padStart(4, '0')}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white capitalize tracking-tight mt-1.5 font-sans">
            {p1.name}
          </h3>

          <div className="flex gap-2 mt-2 justify-center">
            {p1.types?.map((t) => {
              const name = typeof t === 'string' ? t : t.name;
              const style = getTypeStyle(name);
              return (
                <span
                  key={name}
                  className={`text-xs font-black uppercase px-3 py-1 tracking-wider border ${style.bg} ${style.border} ${style.text}`}
                >
                  {name}
                </span>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-[#334155] w-full flex justify-around text-xs sm:text-sm font-mono text-slate-300">
            <div>
              BST: <span className="font-black text-yellow-400">{p1Total}</span>
            </div>
            <div>
              Height: <span className="font-bold text-white">{p1.height || 'N/A'}m</span>
            </div>
            <div>
              Weight: <span className="font-bold text-white">{p1.weight || 'N/A'}kg</span>
            </div>
          </div>
        </div>

        {/* Pokemon 2 Card (Blue Corner) */}
        <div className="relative overflow-hidden bg-[#0f172a] border-2 border-blue-500/60 p-6 flex flex-col items-center text-center shadow-sm">
          <div className="absolute -bottom-5 -left-5 pointer-events-none opacity-5">
            <PokeBall variant="watermark" size={100} />
          </div>

          <div className="w-32 h-32 sm:w-36 sm:h-36 bg-[#1e293b] p-3 border-2 border-[#334155] mb-3 flex items-center justify-center relative">
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p2.id}.png`}
              onError={(e) => {
                e.currentTarget.src = p2.sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p2.id}.png`;
              }}
              alt={p2.name}
              className="w-28 h-28 sm:w-32 sm:h-32 object-contain select-none drop-shadow-md"
            />
            {p2Total > p1Total && (
              <span className="absolute -top-3 -right-2 px-2.5 py-0.5 bg-yellow-400 text-slate-950 text-xs font-black font-mono flex items-center gap-1 border border-yellow-300 uppercase shadow-xs">
                <Trophy className="w-3.5 h-3.5 text-slate-950" /> Lead BST
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600/20 text-sky-400 border border-blue-500/30">
            <PokeBall variant="standard" size={13} />
            <span className="text-xs sm:text-sm font-mono font-bold">
              #{String(p2.id).padStart(4, '0')}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white capitalize tracking-tight mt-1.5 font-sans">
            {p2.name}
          </h3>

          <div className="flex gap-2 mt-2 justify-center">
            {p2.types?.map((t) => {
              const name = typeof t === 'string' ? t : t.name;
              const style = getTypeStyle(name);
              return (
                <span
                  key={name}
                  className={`text-xs font-black uppercase px-3 py-1 tracking-wider border ${style.bg} ${style.border} ${style.text}`}
                >
                  {name}
                </span>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-[#334155] w-full flex justify-around text-xs sm:text-sm font-mono text-slate-300">
            <div>
              BST: <span className="font-black text-yellow-400">{p2Total}</span>
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

      {/* Numerical Base Stats Comparison Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#334155] pb-2.5">
          <h4 className="text-xs sm:text-sm font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-yellow-400" />
            Base Stats Comparison Matrix
          </h4>
          <span className="text-xs font-mono text-slate-300">
            Canonical Game Stats
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
                className="bg-[#0f172a] border border-[#334155] p-3 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between text-xs sm:text-sm font-mono">
                  <span className={`w-14 font-black ${p1Wins ? 'text-amber-400' : 'text-slate-400'}`}>
                    {p1Val}
                  </span>
                  <span className="text-white font-bold uppercase text-xs sm:text-sm flex items-center gap-2">
                    {config.name}
                    {diff !== 0 && (
                      <span className={`text-xs px-2 py-0.5 font-mono font-bold ${
                        p1Wins ? 'text-red-400 bg-red-500/20 border border-red-500/30' : 'text-sky-400 bg-sky-500/20 border border-sky-500/30'
                      }`}>
                        {diff > 0 ? `+${diff} (${p1.name})` : `${diff} (${p2.name})`}
                      </span>
                    )}
                  </span>
                  <span className={`w-14 text-right font-black ${p2Wins ? 'text-sky-400' : 'text-slate-400'}`}>
                    {p2Val}
                  </span>
                </div>

                {/* Solid Comparative Progress Bars */}
                <div className="grid grid-cols-2 gap-2.5 h-2.5">
                  <div className="bg-[#1e293b] border border-[#334155] h-full overflow-hidden flex justify-end">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p1Pct}%` }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className={`h-full ${p1Wins ? 'bg-red-500' : 'bg-slate-600'}`}
                    />
                  </div>
                  <div className="bg-[#1e293b] border border-[#334155] h-full overflow-hidden flex justify-start">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p2Pct}%` }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className={`h-full ${p2Wins ? 'bg-sky-500' : 'bg-slate-600'}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Battle Strategist Analysis Narrative */}
      {cleanAnalysis && (
        <div className="bg-[#0f172a] border-2 border-[#334155] border-l-4 border-l-yellow-400 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#334155] pb-2.5">
            <h4 className="text-xs sm:text-sm font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-2">
              <Swords className="w-4 h-4 text-yellow-400 stroke-[2.5]" />
              Battle Strategist Tactical Analysis
            </h4>
            <span className="text-xs font-mono text-slate-300">
              League Simulation
            </span>
          </div>

          <div className="text-sm sm:text-base leading-relaxed text-slate-100 font-sans">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-2.5 last:mb-0 leading-relaxed text-slate-200">
                    {children}
                  </p>
                ),
                li: ({ children }) => (
                  <li className="my-1 leading-relaxed list-disc ml-5 text-slate-300 text-sm">
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
                ul: ({ children }) => <ul className="space-y-1 my-2">{children}</ul>,
              }}
            >
              {cleanAnalysis}
            </ReactMarkdown>
          </div>

          {/* Clean Sources Section */}
          {uniqueSources.length > 0 && (
            <div className="pt-3 border-t border-[#334155]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sources ({uniqueSources.length})</span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Verified Combat Records
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
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
                      title={`Open source: ${src.source_url}`}
                    >
                      <span>{title}</span>
                      <ExternalLink className="w-3 h-3 text-sky-400" />
                    </a>
                  ) : (
                    <button
                      key={sIdx}
                      onClick={() => onCitationClick && onCitationClick(src)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] hover:border-slate-400 text-xs text-slate-200 hover:text-white font-medium transition-colors cursor-pointer"
                      title="Inspect verified field document"
                    >
                      <span>{title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
