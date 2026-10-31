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
import pokemonLogo from '../assets/pokemon-logo.svg';
import PokeBall from '../components/PokeBall';

const FEATURED_CHAMPIONS = [
  {
    id: 25,
    name: 'Pikachu',
    gen: 'Gen 1 • Kanto',
    type: 'Electric',
    role: 'Iconic Sweeper',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    glow: 'rgba(250, 204, 21, 0.4)',
    ballVariant: 'standard',
  },
  {
    id: 6,
    name: 'Charizard',
    gen: 'Gen 1 • Kanto',
    type: 'Fire / Flying',
    role: 'Special Attacker',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
    glow: 'rgba(249, 115, 22, 0.35)',
    ballVariant: 'ultra',
  },
  {
    id: 150,
    name: 'Mewtwo',
    gen: 'Gen 1 • Kanto',
    type: 'Psychic',
    role: 'Legendary Titan',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
    glow: 'rgba(168, 85, 247, 0.35)',
    ballVariant: 'master',
  },
  {
    id: 384,
    name: 'Rayquaza',
    gen: 'Gen 3 • Hoenn',
    type: 'Dragon / Flying',
    role: 'Sky High Legendary',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png',
    glow: 'rgba(16, 185, 129, 0.35)',
    ballVariant: 'ultra',
  },
  {
    id: 448,
    name: 'Lucario',
    gen: 'Gen 4 • Sinnoh',
    type: 'Fighting / Steel',
    role: 'Aura Striker',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png',
    glow: 'rgba(59, 130, 246, 0.35)',
    ballVariant: 'great',
  },
  {
    id: 658,
    name: 'Greninja',
    gen: 'Gen 6 • Kalos',
    type: 'Water / Dark',
    role: 'Speed Assassin',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/658.png',
    glow: 'rgba(37, 99, 235, 0.35)',
    ballVariant: 'great',
  },
  {
    id: 445,
    name: 'Garchomp',
    gen: 'Gen 4 • Sinnoh',
    type: 'Dragon / Ground',
    role: 'Physical Sweeper',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/445.png',
    glow: 'rgba(217, 119, 6, 0.35)',
    ballVariant: 'ultra',
  },
  {
    id: 959,
    name: 'Tinkaton',
    gen: 'Gen 9 • Paldea',
    type: 'Fairy / Steel',
    role: 'Gigaton Breaker',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/959.png',
    glow: 'rgba(244, 114, 182, 0.35)',
    ballVariant: 'standard',
  },
];

const STARTER_SHOWCASE = [
  { id: 1, name: 'Bulbasaur', region: 'Kanto', gen: 'Gen 1', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png' },
  { id: 4, name: 'Charmander', region: 'Kanto', gen: 'Gen 1', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png' },
  { id: 7, name: 'Squirtle', region: 'Kanto', gen: 'Gen 1', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png' },
  { id: 152, name: 'Chikorita', region: 'Johto', gen: 'Gen 2', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/152.png' },
  { id: 155, name: 'Cyndaquil', region: 'Johto', gen: 'Gen 2', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/155.png' },
  { id: 158, name: 'Totodile', region: 'Johto', gen: 'Gen 2', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/158.png' },
  { id: 252, name: 'Treecko', region: 'Hoenn', gen: 'Gen 3', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/252.png' },
  { id: 255, name: 'Torchic', region: 'Hoenn', gen: 'Gen 3', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/255.png' },
  { id: 258, name: 'Mudkip', region: 'Hoenn', gen: 'Gen 3', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/258.png' },
  { id: 906, name: 'Sprigatito', region: 'Paldea', gen: 'Gen 9', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/906.png' },
  { id: 909, name: 'Fuecoco', region: 'Paldea', gen: 'Gen 9', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/909.png' },
  { id: 912, name: 'Quaxly', region: 'Paldea', gen: 'Gen 9', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/912.png' },
];

const SAMPLE_PROMPTS = [
  {
    icon: Flame,
    title: 'Countering Fire Giants',
    query: 'Who counters Charizard in battle and what moves beat it?',
  },
  {
    icon: Zap,
    title: 'Pikachu Battle Lore',
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
      {/* Hero Showcase Section with Official Pokémon Artwork & Branding */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#070e22] via-[#0b1736] to-[#12234f] border border-blue-500/25 p-8 sm:p-12 shadow-2xl">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Subtle Background Watermark Poké Ball */}
        <div className="absolute -right-12 -top-12 opacity-10 pointer-events-none">
          <PokeBall variant="watermark" size={420} className="text-yellow-400" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Official Pokémon Logo, Headline, CTAs */}
          <div className="lg:col-span-7 space-y-5">
            {/* Official Logo Presentation */}
            <div className="flex items-center gap-3">
              <img
                src={pokemonLogo}
                alt="Pokémon"
                className="h-10 sm:h-12 w-auto object-contain select-none filter drop-shadow-[0_4px_16px_rgba(250,204,21,0.4)]"
              />
              <div className="h-6 w-px bg-blue-400/30" />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/15 border border-yellow-400/30 text-yellow-300 text-xs font-mono font-extrabold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                National Dex & Battle Intel
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Master the Arena with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-blue-400">
                Official Pokémon
              </span>{' '}
              Intelligence.
            </h1>

            <p className="text-blue-100/80 text-sm sm:text-base leading-relaxed max-w-xl">
              DexMind is your comprehensive companion for competitive Pokémon discovery. Explore base stats, elemental damage relations, evolutionary trees, and verified battle matchups across all 1,025 Pokémon from Kanto to Paldea.
            </p>

            <div className="pt-2 flex flex-wrap gap-3.5">
              <button
                onClick={() => setActiveTab('pokedex')}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-sm transition-all shadow-lg shadow-yellow-400/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Compass className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>Open National Dex ({pokemonCount})</span>
                <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              </button>

              <button
                onClick={() => setActiveTab('ask')}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#0b142b] hover:bg-[#101e3d] text-blue-100 font-bold text-sm border border-blue-400/30 transition-all cursor-pointer shadow-md hover:border-yellow-400/50"
              >
                <PokeBall variant="gold" size={16} />
                <span>Consult Battle Coach</span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero High-Resolution Artwork Composition */}
          <div className="lg:col-span-5 relative hidden lg:flex items-center justify-center min-h-[300px]">
            {/* Center Aura Glow */}
            <div className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-yellow-400/20 to-blue-600/30 blur-2xl pointer-events-none" />

            {/* Official Charizard Artwork */}
            <img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png"
              alt="Charizard"
              className="w-60 h-60 object-contain absolute -top-8 -right-4 filter drop-shadow-[0_16px_32px_rgba(249,115,22,0.4)] opacity-90 hover:scale-105 transition-transform duration-300 z-10 select-none pointer-events-none"
            />

            {/* Official Pikachu Artwork */}
            <img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
              alt="Pikachu"
              className="w-44 h-44 object-contain absolute bottom-0 left-2 filter drop-shadow-[0_16px_32px_rgba(250,204,21,0.5)] hover:scale-110 transition-transform duration-300 z-20 select-none pointer-events-none"
            />

            {/* Floating Ultra Ball badge */}
            <div className="absolute top-2 left-6 z-30 bg-[#060b19]/90 border border-yellow-400/40 rounded-xl px-3 py-1.5 shadow-xl flex items-center gap-2 backdrop-blur-md">
              <PokeBall variant="ultra" size={18} />
              <span className="text-[11px] font-mono font-bold text-yellow-300">1,025 Registered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Pokémon Champions Row with Authentic Artwork */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-blue-300 font-bold flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            Official League Champions
          </h3>
          <button
            onClick={() => setActiveTab('pokedex')}
            className="text-[11px] font-mono text-yellow-400 hover:text-yellow-300 flex items-center gap-1 cursor-pointer font-bold transition-colors"
          >
            <span>Browse All 1,025</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
          {FEATURED_CHAMPIONS.map((p) => (
            <div
              key={p.id}
              onClick={() => setActiveTab('pokedex')}
              className="group bg-[#0b142b] hover:bg-[#101e3d] border border-blue-500/20 hover:border-yellow-400/50 p-4 rounded-2xl flex flex-col items-center text-center cursor-pointer transition-all duration-200 relative overflow-hidden shadow-lg hover:shadow-yellow-400/10 hover:-translate-y-1"
            >
              {/* Type Glow */}
              <div
                className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-xl pointer-events-none opacity-20 group-hover:opacity-70 transition-opacity"
                style={{ backgroundColor: p.glow }}
              />

              {/* Poké Ball Watermark in Card Background */}
              <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-15 transition-opacity pointer-events-none">
                <PokeBall variant="watermark" size={80} className="text-white" />
              </div>

              {/* Top Meta: Poké Ball & Number */}
              <div className="flex items-center justify-between w-full text-[10px] font-mono font-bold text-slate-400 mb-1 z-10">
                <div className="flex items-center gap-1.5">
                  <PokeBall variant={p.ballVariant} size={14} />
                  <span className="text-yellow-400">#{String(p.id).padStart(3, '0')}</span>
                </div>
                <span className="text-blue-300 bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20">{p.gen}</span>
              </div>

              {/* High-Resolution Artwork */}
              <div className="w-28 h-28 flex items-center justify-center my-1 relative z-10">
                <img
                  src={p.sprite}
                  alt={p.name}
                  className="w-24 h-24 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-200 select-none"
                />
              </div>

              <h4 className="text-base font-black text-white group-hover:text-yellow-400 transition-colors capitalize z-10">
                {p.name}
              </h4>
              <span className="text-[11px] font-mono text-blue-200/80 mt-0.5 z-10 font-medium">
                {p.type}
              </span>
              <span className="text-[10px] font-mono text-yellow-400/90 bg-yellow-400/10 px-2 py-0.5 rounded-full mt-2 border border-yellow-400/20 z-10 font-bold">
                {p.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Iconic Starters Strip across Generations */}
      <div className="bg-[#0b142b] border border-blue-500/20 rounded-3xl p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PokeBall variant="standard" size={18} />
            <h4 className="text-xs font-mono uppercase tracking-wider text-blue-200 font-bold">
              Iconic First-Partner Pokémon • Generations 1 to 9
            </h4>
          </div>
          <span className="text-[11px] font-mono text-yellow-400 font-semibold">
            Choose Your Partner
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 pt-2">
          {STARTER_SHOWCASE.map((s) => (
            <div
              key={s.id}
              onClick={() => setActiveTab('pokedex')}
              className="group bg-[#060b19] hover:bg-[#101e3d] border border-blue-500/15 hover:border-yellow-400/50 rounded-xl p-2 flex flex-col items-center cursor-pointer transition-all duration-150 text-center"
              title={`${s.name} (${s.region} • ${s.gen})`}
            >
              <img
                src={s.sprite}
                alt={s.name}
                className="w-12 h-12 object-contain group-hover:scale-110 transition-transform select-none"
              />
              <span className="text-[10px] font-bold text-slate-300 group-hover:text-yellow-300 truncate w-full mt-1">
                {s.name}
              </span>
              <span className="text-[9px] font-mono text-blue-400/70">
                {s.gen}
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
                className="group bg-[#0b142b] hover:bg-[#101e3d] border border-blue-500/20 hover:border-yellow-400/40 p-4 rounded-2xl cursor-pointer transition-all duration-150 flex flex-col justify-between shadow-md hover:-translate-y-0.5"
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

                <div className="mt-3 pt-2.5 border-t border-blue-500/10 flex items-center justify-between text-[11px] font-mono text-blue-300/70 group-hover:text-yellow-300 font-semibold">
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
        <div className="bg-[#0b142b] border border-blue-500/20 rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
            <PokeBall variant="watermark" size={80} />
          </div>
          <div className="flex items-center justify-between text-blue-300 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">National Dex</span>
            <PokeBall variant="gold" size={18} />
          </div>
          <div>
            <div className="text-3xl font-black text-white">
              1,025
            </div>
            <div className="text-xs font-mono text-blue-200/70 mt-1">Official Pokémon Indexed</div>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-500/10 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Coverage</span>
            <span className="text-yellow-400 font-bold">Gen 1 through Gen 9</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#0b142b] border border-blue-500/20 rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
            <PokeBall variant="watermark" size={80} />
          </div>
          <div className="flex items-center justify-between text-blue-300 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">Battle Lore</span>
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
        <div className="bg-[#0b142b] border border-blue-500/20 rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
            <PokeBall variant="watermark" size={80} />
          </div>
          <div className="flex items-center justify-between text-blue-300 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">Type Matrix</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-white">
              18 Types
            </div>
            <div className="text-xs font-mono text-blue-200/70 mt-1">Dual-Type Multipliers</div>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-500/10 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Coverage</span>
            <span className="text-emerald-400 font-bold">Weaknesses & Immunities</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#0b142b] border border-blue-500/20 rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
            <PokeBall variant="watermark" size={80} />
          </div>
          <div className="flex items-center justify-between text-blue-300 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">Tactical Coach</span>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-blue-400">
              Active
            </div>
            <div className="text-xs font-mono text-blue-200/70 mt-1">Competitive Advisor</div>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-500/10 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Intelligence</span>
            <span className="text-yellow-300 font-bold">Adaptive Counter Strategy</span>
          </div>
        </div>
      </div>

      {/* Trainer Command Banner */}
      <div className="bg-[#0b142b] border border-blue-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
          <PokeBall variant="watermark" size={160} />
        </div>

        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-black text-white">
              Official Pokémon League Network Connected
            </h3>
          </div>
          <p className="text-sm text-blue-200/80 max-w-xl">
            All 1,025 Pokémon across Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar, and Paldea are fully cataloged with base stats, official Sugimori artwork, and verified damage matchups.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('pokedex')}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-sm shadow-lg shadow-yellow-400/25 transition-all cursor-pointer shrink-0 z-10"
        >
          <Search className="w-4 h-4 stroke-[2.5]" />
          <span>Launch National Dex</span>
        </button>
      </div>
    </div>
  );
}
