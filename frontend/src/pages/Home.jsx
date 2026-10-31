import React from 'react';
import {
  Shield,
  Sparkles,
  ArrowRight,
  GitCompare,
  Flame,
  Zap,
  Trophy,
  Swords,
  Layers,
  Search,
  CheckCircle2,
  Compass,
} from 'lucide-react';

const FEATURED_POKEMON = [
  {
    id: 25,
    name: 'Pikachu',
    gen: 'Gen 1',
    type: 'Electric',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    glow: 'rgba(250, 204, 21, 0.35)',
  },
  {
    id: 6,
    name: 'Charizard',
    gen: 'Gen 1',
    type: 'Fire / Flying',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
    glow: 'rgba(249, 115, 22, 0.3)',
  },
  {
    id: 448,
    name: 'Lucario',
    gen: 'Gen 4',
    type: 'Fighting / Steel',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png',
    glow: 'rgba(59, 130, 246, 0.35)',
  },
  {
    id: 658,
    name: 'Greninja',
    gen: 'Gen 6',
    type: 'Water / Dark',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/658.png',
    glow: 'rgba(37, 99, 235, 0.35)',
  },
  {
    id: 445,
    name: 'Garchomp',
    gen: 'Gen 4',
    type: 'Dragon / Ground',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/445.png',
    glow: 'rgba(217, 119, 6, 0.3)',
  },
  {
    id: 959,
    name: 'Tinkaton',
    gen: 'Gen 9',
    type: 'Fairy / Steel',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/959.png',
    glow: 'rgba(244, 114, 182, 0.3)',
  },
];

const SAMPLE_PROMPTS = [
  {
    icon: Flame,
    title: 'Countering Fire Giants',
    query: 'Who counters Charizard in battle and what moves beat it?',
  },
  {
    icon: Zap,
    title: 'Pikachu Matchups',
    query: 'Which types of Pokémon can Pikachu beat easily and why?',
  },
  {
    icon: GitCompare,
    title: 'Champions Showdown',
    query: 'Compare Greninja and Lucario for competitive battle.',
  },
  {
    icon: Swords,
    title: 'Paldea Team Strategy',
    query: 'Build me a balanced 3-Pokémon team to beat Garchomp, Charizard, and Tinkaton.',
  },
];

export default function Home({
  healthInfo,
  setActiveTab,
  onSelectPrompt,
}) {
  const pokemonCount = healthInfo?.mongodb?.pokemon_count || 1025;

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-2">
      {/* Hero Showcase Section with Electric Yellow & Pokémon Blue theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b142b] via-[#0d1733] to-[#122247] border border-blue-500/20 p-8 sm:p-12 shadow-2xl">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-xs font-mono font-bold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            Official Pokémon League Intelligence • All 9 Generations
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Master the Arena with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-blue-400">
              Next-Gen Pokédex
            </span>{' '}
            Intelligence.
          </h1>

          <p className="mt-4 text-blue-100/80 text-sm sm:text-base leading-relaxed">
            DexMind is the definitive tactical companion for Pokémon trainers. Analyze base stats, calculate elemental type weaknesses, discover counters, and assemble unbeatable tournament teams across all 1,025 Pokémon from Kanto to Paldea.
          </p>

          <div className="mt-8 flex flex-wrap gap-3.5">
            <button
              onClick={() => setActiveTab('pokedex')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-sm transition-all shadow-lg shadow-yellow-400/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Compass className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>Explore National Dex ({pokemonCount})</span>
              <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            </button>

            <button
              onClick={() => setActiveTab('ask')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0b142b] hover:bg-[#101e3d] text-blue-200 font-bold text-sm border border-blue-400/30 transition-all cursor-pointer shadow-md hover:border-blue-400/60"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Consult Battle Coach</span>
            </button>
          </div>
        </div>
      </div>

      {/* Featured Pokémon Champions Row */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-blue-300 font-bold flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            Featured League Champions
          </h3>
          <button
            onClick={() => setActiveTab('pokedex')}
            className="text-[11px] font-mono text-yellow-400 hover:text-yellow-300 flex items-center gap-1 cursor-pointer font-bold transition-colors"
          >
            <span>Browse All 1,025</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {FEATURED_POKEMON.map((p) => (
            <div
              key={p.id}
              onClick={() => setActiveTab('pokedex')}
              className="group bg-[#0b142b] hover:bg-[#101e3d] border border-blue-500/15 hover:border-yellow-400/50 p-4 rounded-2xl flex flex-col items-center text-center cursor-pointer transition-all duration-200 relative overflow-hidden shadow-lg hover:shadow-yellow-400/10 hover:-translate-y-1"
            >
              <div
                className="absolute -top-8 -right-8 w-20 h-20 rounded-full blur-xl pointer-events-none opacity-20 group-hover:opacity-70 transition-opacity"
                style={{ backgroundColor: p.glow }}
              />
              <div className="flex items-center justify-between w-full text-[10px] font-mono font-bold text-slate-400 mb-1">
                <span>#{String(p.id).padStart(3, '0')}</span>
                <span className="text-blue-300 bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20">{p.gen}</span>
              </div>
              <img
                src={p.sprite}
                alt={p.name}
                className="w-20 h-20 object-contain drop-shadow my-1 group-hover:scale-110 transition-transform duration-200"
              />
              <h4 className="text-sm font-black text-white group-hover:text-yellow-400 transition-colors capitalize">
                {p.name}
              </h4>
              <span className="text-[10px] font-mono text-blue-300/80 mt-0.5">
                {p.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Launch Tactical Inquiries */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-blue-300 font-bold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            Popular Battle Coach Queries
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Click to launch instant tactical breakdown
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {SAMPLE_PROMPTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={() => {
                  if (onSelectPrompt) onSelectPrompt(item.query);
                  else setActiveTab('ask');
                }}
                className="group bg-[#0b142b] hover:bg-[#101e3d] border border-blue-500/15 hover:border-yellow-400/40 p-4 rounded-2xl cursor-pointer transition-all duration-150 flex flex-col justify-between shadow-md hover:-translate-y-0.5"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center text-yellow-400 mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-blue-200/70 mt-1 line-clamp-2">
                    "{item.query}"
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-blue-500/10 flex items-center justify-between text-[11px] font-mono text-blue-300/70 group-hover:text-yellow-300">
                  <span>Ask Battle Coach</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* National Pokédex Live Archives & League Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#0b142b] border border-blue-500/20 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-blue-300 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">National Dex</span>
            <Layers className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-white">
              1,025
            </div>
            <div className="text-xs font-mono text-blue-200/70 mt-1">Pokémon Registered</div>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-500/10 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Coverage</span>
            <span className="text-yellow-400 font-bold">Gen 1 through Gen 9</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#0b142b] border border-blue-500/20 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-blue-300 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">Battle Archives</span>
            <Trophy className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-yellow-400">
              8,200+
            </div>
            <div className="text-xs font-mono text-blue-200/70 mt-1">Field Research Entries</div>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-500/10 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Grounding</span>
            <span className="text-blue-300 font-bold">Official Game Lore</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#0b142b] border border-blue-500/20 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-blue-300 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">Type Matrix</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-white">
              18 Types
            </div>
            <div className="text-xs font-mono text-blue-200/70 mt-1">Dynamic Coverage Calculator</div>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-500/10 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Multipliers</span>
            <span className="text-emerald-400 font-bold">Dual-Type Formulas</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#0b142b] border border-blue-500/20 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-blue-300 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">Tactical Coach</span>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-blue-400">
              Active
            </div>
            <div className="text-xs font-mono text-blue-200/70 mt-1">Real-Time Team Advisor</div>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-500/10 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Intelligence</span>
            <span className="text-yellow-300 font-bold">Adaptive Strategy</span>
          </div>
        </div>
      </div>

      {/* Trainer Command Banner */}
      <div className="bg-[#0b142b] border border-blue-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-black text-white">
              National Pokédex Archives Synchronized
            </h3>
          </div>
          <p className="text-sm text-blue-200/80 max-w-xl">
            All 1,025 Pokémon across Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar, and Paldea are fully cataloged with base stats, official artwork, and verified damage matchups.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('pokedex')}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all cursor-pointer shrink-0"
        >
          <Search className="w-4 h-4" />
          <span>Search the Pokédex</span>
        </button>
      </div>
    </div>
  );
}
