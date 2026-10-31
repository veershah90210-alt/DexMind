import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowRight, Trophy, Zap, Shield, Heart, Gauge } from 'lucide-react';

const STAT_LABELS = {
  hp: { name: 'HP', icon: Heart, color: 'bg-emerald-500' },
  attack: { name: 'Attack', icon: Zap, color: 'bg-orange-500' },
  defense: { name: 'Defense', icon: Shield, color: 'bg-blue-500' },
  special_attack: { name: 'Sp. Atk', icon: Zap, color: 'bg-red-500' },
  special_defense: { name: 'Sp. Def', icon: Shield, color: 'bg-indigo-500' },
  speed: { name: 'Speed', icon: Gauge, color: 'bg-amber-500' },
  total: { name: 'Total BST', icon: Trophy, color: 'bg-purple-500' }
};

export default function ComparisonCard({ data, onCitationClick }) {
  if (!data) return null;

  const { pokemon1: p1, pokemon2: p2, stat_comparison, analysis, sources } = data;

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
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Pokémon Head-to-Head Header */}
      <div className="grid grid-cols-2 gap-4 items-center border-b border-zinc-800 pb-6">
        {/* Pokemon 1 */}
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-zinc-800/80 p-2 border border-zinc-700/60 mb-2 relative">
            <img
              src={p1.sprite_url}
              alt={p1.name}
              className="w-full h-full object-contain drop-shadow"
            />
          </div>
          <span className="text-xs font-mono text-zinc-500">#{String(p1.id).padStart(3, '0')}</span>
          <h3 className="text-xl font-bold text-zinc-100 capitalize">{p1.name}</h3>
          <div className="flex gap-1 mt-1 justify-center">
            {p1.types?.map((t) => (
              <span key={t} className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Pokemon 2 */}
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-zinc-800/80 p-2 border border-zinc-700/60 mb-2 relative">
            <img
              src={p2.sprite_url}
              alt={p2.name}
              className="w-full h-full object-contain drop-shadow"
            />
          </div>
          <span className="text-xs font-mono text-zinc-500">#{String(p2.id).padStart(3, '0')}</span>
          <h3 className="text-xl font-bold text-zinc-100 capitalize">{p2.name}</h3>
          <div className="flex gap-1 mt-1 justify-center">
            {p2.types?.map((t) => (
              <span key={t} className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Numerical Base Stats Comparison Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-2">
          Base Statistics Comparison
        </h4>
        {Object.entries(stat_comparison || {}).map(([key, stat]) => {
          const meta = STAT_LABELS[key] || { name: key, color: 'bg-zinc-500' };
          const p1Wins = stat.winner === p1.name;
          const p2Wins = stat.winner === p2.name;

          return (
            <div key={key} className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60 flex items-center justify-between text-xs font-mono">
              <span className={`w-12 text-center font-bold ${p1Wins ? 'text-emerald-400' : 'text-zinc-400'}`}>
                {stat.p1_val}
              </span>

              <div className="flex-1 mx-4">
                <div className="flex justify-between text-zinc-400 text-[11px] font-sans mb-1">
                  <span>{meta.name}</span>
                  <span className="text-zinc-500 font-mono">
                    {stat.diff !== 0 ? `${stat.diff > 0 ? '+' : ''}${stat.diff} for ${stat.winner}` : 'Equal'}
                  </span>
                </div>
                {/* Visual dual bar */}
                <div className="flex h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${p1Wins ? 'bg-red-500' : 'bg-zinc-600'}`}
                    style={{ width: `${Math.min(100, (stat.p1_val / 200) * 100)}%` }}
                  />
                  <div className="w-1 bg-zinc-900" />
                  <div
                    className={`h-full ${p2Wins ? 'bg-cyan-500' : 'bg-zinc-600'}`}
                    style={{ width: `${Math.min(100, (stat.p2_val / 200) * 100)}%` }}
                  />
                </div>
              </div>

              <span className={`w-12 text-center font-bold ${p2Wins ? 'text-cyan-400' : 'text-zinc-400'}`}>
                {stat.p2_val}
              </span>
            </div>
          );
        })}
      </div>

      {/* RAG Grounded Analysis */}
      {analysis && (
        <div className="mt-6 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
          <h4 className="text-xs font-mono uppercase tracking-wider text-red-400 font-semibold mb-2 flex items-center gap-2">
            <span>Grounded RAG Comparative Breakdown</span>
          </h4>
          <div className="text-sm text-zinc-200 leading-relaxed font-sans">
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
                  <strong className="font-bold text-white">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-zinc-300">
                    {children}
                  </em>
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
              {analysis}
            </ReactMarkdown>
          </div>

          {/* Sources button list */}
          {sources && sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-zinc-800 flex flex-wrap gap-2 items-center text-xs">
              <span className="text-zinc-500 font-mono">Retrieved Evidence:</span>
              {sources.map((s) => (
                <button
                  key={s.citation_tag}
                  onClick={() => onCitationClick && onCitationClick(s)}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs border border-zinc-700 transition-colors flex items-center gap-1"
                >
                  <span className="text-red-400">{s.citation_tag}</span>
                  <span className="capitalize">{s.pokemon_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
