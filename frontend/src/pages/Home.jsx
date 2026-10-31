import React from 'react';
import {
  Shield,
  Sparkles,
  ArrowRight,
  Trophy,
  Search,
  Compass,
  MapPin,
  Layers,
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
    color: '#eab308',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    ballVariant: 'standard',
  },
  {
    id: 6,
    name: 'Charizard',
    gen: 'Gen 1 • Kanto',
    type: 'Fire / Flying',
    role: 'Special Attacker',
    color: '#ea580c',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
    ballVariant: 'ultra',
  },
  {
    id: 150,
    name: 'Mewtwo',
    gen: 'Gen 1 • Kanto',
    type: 'Psychic',
    role: 'Legendary Titan',
    color: '#a855f7',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
    ballVariant: 'master',
  },
  {
    id: 448,
    name: 'Lucario',
    gen: 'Gen 4 • Sinnoh',
    type: 'Fighting / Steel',
    role: 'Aura Striker',
    color: '#2563eb',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png',
    ballVariant: 'great',
  },
  {
    id: 445,
    name: 'Garchomp',
    gen: 'Gen 4 • Sinnoh',
    type: 'Dragon / Ground',
    role: 'Physical Sweeper',
    color: '#4f46e5',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/445.png',
    ballVariant: 'ultra',
  },
  {
    id: 658,
    name: 'Greninja',
    gen: 'Gen 6 • Kalos',
    type: 'Water / Dark',
    role: 'Special Infiltrator',
    color: '#0284c7',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/658.png',
    ballVariant: 'great',
  },
  {
    id: 959,
    name: 'Tinkaton',
    gen: 'Gen 9 • Paldea',
    type: 'Fairy / Steel',
    role: 'Gigaton Wallbreaker',
    color: '#ec4899',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/959.png',
    ballVariant: 'standard',
  },
  {
    id: 133,
    name: 'Eevee',
    gen: 'Gen 1 • Kanto',
    type: 'Normal',
    role: 'Evolution Matrix',
    color: '#78716c',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png',
    ballVariant: 'standard',
  },
];

const STARTER_SHOWCASE = [
  { id: 1, name: 'Bulbasaur', region: 'Kanto', gen: 'Gen 1', type: 'Grass', color: '#16a34a', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' },
  { id: 4, name: 'Charmander', region: 'Kanto', gen: 'Gen 1', type: 'Fire', color: '#ea580c', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png' },
  { id: 7, name: 'Squirtle', region: 'Kanto', gen: 'Gen 1', type: 'Water', color: '#0284c7', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' },
  { id: 152, name: 'Chikorita', region: 'Johto', gen: 'Gen 2', type: 'Grass', color: '#16a34a', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/152.png' },
  { id: 155, name: 'Cyndaquil', region: 'Johto', gen: 'Gen 2', type: 'Fire', color: '#ea580c', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/155.png' },
  { id: 158, name: 'Totodile', region: 'Johto', gen: 'Gen 2', type: 'Water', color: '#0284c7', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/158.png' },
  { id: 252, name: 'Treecko', region: 'Hoenn', gen: 'Gen 3', type: 'Grass', color: '#16a34a', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/252.png' },
  { id: 255, name: 'Torchic', region: 'Hoenn', gen: 'Gen 3', type: 'Fire', color: '#ea580c', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/255.png' },
  { id: 258, name: 'Mudkip', region: 'Hoenn', gen: 'Gen 3', type: 'Water', color: '#0284c7', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/258.png' },
  { id: 906, name: 'Sprigatito', region: 'Paldea', gen: 'Gen 9', type: 'Grass', color: '#16a34a', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/906.png' },
  { id: 909, name: 'Fuecoco', region: 'Paldea', gen: 'Gen 9', type: 'Fire', color: '#ea580c', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/909.png' },
  { id: 912, name: 'Quaxly', region: 'Paldea', gen: 'Gen 9', type: 'Water', color: '#0284c7', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/912.png' },
];

const REGIONAL_ATLAS = [
  { gen: 1, region: 'Kanto', range: '#0001–#0151', starters: 'Bulbasaur, Charmander, Squirtle', themeColor: '#dc2626', highlight: 'Birthplace of the League' },
  { gen: 2, region: 'Johto', range: '#0152–#0251', starters: 'Chikorita, Cyndaquil, Totodile', themeColor: '#ca8a04', highlight: 'Ancient Tradition & Lore' },
  { gen: 3, region: 'Hoenn', range: '#0252–#0386', starters: 'Treecko, Torchic, Mudkip', themeColor: '#0284c7', highlight: 'Land, Sea & Weather Legends' },
  { gen: 4, region: 'Sinnoh', range: '#0387–#0493', starters: 'Turtwig, Chimchar, Piplup', themeColor: '#4f46e5', highlight: 'Mythology of Space & Time' },
  { gen: 5, region: 'Unova', range: '#0494–#0649', starters: 'Snivy, Tepig, Oshawott', themeColor: '#059669', highlight: 'Metropolitan Modern Era' },
  { gen: 6, region: 'Kalos', range: '#0650–#0721', starters: 'Chespin, Fennekin, Froakie', themeColor: '#2563eb', highlight: 'Mega Evolution & Beauty' },
  { gen: 7, region: 'Alola', range: '#0722–#0809', starters: 'Rowlet, Litten, Popplio', themeColor: '#d97706', highlight: 'Island Challenge & Regional Forms' },
  { gen: 8, region: 'Galar', range: '#0810–#0905', starters: 'Grookey, Scorbunny, Sobble', themeColor: '#e11d48', highlight: 'Dynamax Stadium Battles' },
  { gen: 9, region: 'Paldea', range: '#0906–#1025', starters: 'Sprigatito, Fuecoco, Quaxly', themeColor: '#9333ea', highlight: 'Terastallization & Paradox Forms' },
];

export default function Home({ healthInfo, setActiveTab }) {
  const pokemonCount = healthInfo?.mongodb?.pokemon_count || 1025;

  return (
    <div className="space-y-8 w-full py-2">
      {/* Pokédex System Hero Terminal - Spacious, Powerful, High-Contrast Console */}
      <div className="bg-[#1e293b] border-2 border-[#334155] border-t-4 border-t-[#dc2626] p-6 sm:p-8 lg:p-10 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Pokédex Terminal Title, Stats & Direct Keys */}
          <div className="lg:col-span-8 space-y-5">
            <div className="flex items-center gap-3.5">
              <img
                src={pokemonLogo}
                alt="Pokémon"
                className="h-10 sm:h-11 w-auto object-contain select-none"
              />
              <div className="h-7 w-0.5 bg-yellow-400" />
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400 text-slate-950 font-mono font-black text-xs sm:text-sm uppercase tracking-wider border border-slate-950">
                <Sparkles className="w-4 h-4 text-slate-950" />
                National Pokédex Terminal OS
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase leading-tight font-sans">
              Kanto to Paldea <span className="text-yellow-400 font-extrabold">Complete Battle Index</span>
            </h1>

            <p className="text-slate-200 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
              DexMind is your comprehensive Pokémon field database. Discover official base statistics, dual-type damage calculators, evolution pathways, and battle intelligence across all 1,025 canonical species.
            </p>

            <div className="pt-2 flex flex-wrap gap-3.5">
              <button
                onClick={() => setActiveTab('pokedex')}
                className="flex items-center gap-2.5 px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-slate-950 transition-colors cursor-pointer shadow-sm"
              >
                <Compass className="w-4 h-4 stroke-[3]" />
                <span>Launch National Pokédex ({pokemonCount})</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                onClick={() => setActiveTab('ask')}
                className="flex items-center gap-2.5 px-6 py-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-slate-950 transition-colors cursor-pointer shadow-sm"
              >
                <PokeBall variant="standard" size={16} />
                <span>Pokédex AI Assistant</span>
              </button>

              <button
                onClick={() => setActiveTab('compare')}
                className="flex items-center gap-2.5 px-6 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-slate-950 transition-colors cursor-pointer shadow-sm"
              >
                <Trophy className="w-4 h-4 stroke-[2.5]" />
                <span>Matchup Simulator</span>
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Sugimori Artwork Showcase with Pokédex Screen Frame */}
          <div className="lg:col-span-4 relative hidden lg:flex items-center justify-center bg-[#0f172a] border-2 border-[#334155] p-6 min-h-[260px]">
            {/* Top Pokédex Screen status label */}
            <div className="absolute top-3 left-3 z-20 bg-[#dc2626] text-white text-xs font-mono font-bold px-2.5 py-1 border border-slate-950 uppercase tracking-wider">
              No. 0006 & No. 0025
            </div>

            {/* Official Charizard Artwork */}
            <img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png"
              alt="Charizard"
              className="w-48 h-48 object-contain absolute -top-4 -right-1 select-none pointer-events-none drop-shadow-lg"
            />

            {/* Official Pikachu Artwork */}
            <img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
              alt="Pikachu"
              className="w-36 h-36 object-contain absolute bottom-1 left-3 z-10 select-none pointer-events-none drop-shadow-md"
            />
          </div>
        </div>
      </div>

      {/* Featured Pokémon Champions - Balanced 4-Column Showcase (Spacious & Clean) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-[#334155] pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 bg-yellow-400 border border-slate-950" />
            <h2 className="text-sm sm:text-base font-mono uppercase tracking-wider text-white font-black">
              Featured League Champions & Titans
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('pokedex')}
            className="text-xs sm:text-sm font-mono text-yellow-400 hover:text-yellow-300 flex items-center gap-1.5 cursor-pointer font-bold transition-colors uppercase tracking-wider"
          >
            <span>Catalogue ({pokemonCount})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          {FEATURED_CHAMPIONS.map((p) => (
            <div
              key={p.id}
              onClick={() => setActiveTab('pokedex')}
              className="group bg-[#1e293b] hover:bg-[#28354e] border-2 border-[#334155] hover:border-yellow-400 p-4 sm:p-5 flex flex-col items-center text-center cursor-pointer transition-all duration-150 relative shadow-sm"
              style={{ borderTopColor: p.color, borderTopWidth: '4px' }}
            >
              {/* Pokédex ID & Gen */}
              <div className="flex items-center justify-between w-full text-xs font-mono text-slate-300 mb-2 z-10">
                <div className="flex items-center gap-1.5">
                  <PokeBall variant={p.ballVariant} size={13} />
                  <span className="text-yellow-400 font-bold">#{String(p.id).padStart(4, '0')}</span>
                </div>
                <span className="text-xs text-white bg-[#0f172a] px-2 py-0.5 border border-[#334155] font-bold">
                  {p.gen.split('•')[0].trim()}
                </span>
              </div>

              {/* Artwork */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center my-2 relative z-10 bg-[#0f172a]/40 border border-[#334155]/50 p-2">
                <img
                  src={p.sprite}
                  alt={p.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-contain group-hover:scale-110 transition-transform duration-200 select-none drop-shadow-md"
                />
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-yellow-400 transition-colors capitalize z-10 truncate w-full tracking-tight font-sans mt-1">
                {p.name}
              </h3>
              <span className="text-xs text-slate-300 font-semibold z-10 truncate w-full mt-0.5">
                {p.type}
              </span>
              <span className="text-xs font-mono text-slate-950 bg-yellow-400 px-2.5 py-0.5 mt-2.5 font-black uppercase tracking-wider z-10 border border-yellow-300">
                {p.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Iconic First-Partner Starters Row Across Generations */}
      <div className="bg-[#1e293b] border-2 border-[#334155] p-5 sm:p-6 space-y-3.5 shadow-md">
        <div className="flex items-center justify-between border-b border-[#334155] pb-2.5">
          <div className="flex items-center gap-2.5">
            <PokeBall variant="standard" size={16} />
            <h2 className="text-xs sm:text-sm font-mono uppercase tracking-wider text-white font-black">
              First-Partner Pokémon • Generations 1 to 9
            </h2>
          </div>
          <span className="text-xs font-mono text-yellow-400 font-bold uppercase tracking-wider">
            Official Starter Species
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3 pt-1">
          {STARTER_SHOWCASE.map((s) => (
            <div
              key={s.id}
              onClick={() => setActiveTab('pokedex')}
              className="group bg-[#0f172a] hover:bg-[#28354e] border-2 border-[#334155] hover:border-yellow-400 p-2.5 flex flex-col items-center cursor-pointer transition-all text-center"
              style={{ borderBottomColor: s.color, borderBottomWidth: '4px' }}
              title={`${s.name} (${s.region} • ${s.gen})`}
            >
              <img
                src={s.sprite}
                alt={s.name}
                className="w-12 h-12 object-contain group-hover:scale-115 transition-transform select-none drop-shadow-sm"
              />
              <span className="text-xs font-bold text-white group-hover:text-yellow-400 truncate w-full mt-1.5 font-sans">
                {s.name}
              </span>
              <span className="text-[11px] font-mono text-slate-400 mt-0.5">
                {s.region}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pokémon Generation Regional Atlas - 3x3 Card Grid (Aesthetic, Spacious, Uncluttered) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-[#334155] pb-2.5">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-red-500" />
            <h2 className="text-sm sm:text-base font-mono uppercase tracking-wider text-white font-black">
              Pokémon League Regional Atlas
            </h2>
          </div>
          <span className="text-xs sm:text-sm font-mono text-slate-400 font-semibold">
            9 Canonical Regions • 1,025 Registered Species
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {REGIONAL_ATLAS.map((reg) => (
            <div
              key={reg.gen}
              onClick={() => setActiveTab('pokedex')}
              className="group bg-[#1e293b] hover:bg-[#28354e] border-2 border-[#334155] hover:border-yellow-400 p-5 flex flex-col justify-between cursor-pointer transition-all shadow-sm"
              style={{ borderLeftColor: reg.themeColor, borderLeftWidth: '5px' }}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="font-black text-yellow-400 tracking-wider">GEN 0{reg.gen}</span>
                  <span className="text-slate-300 font-bold bg-[#0f172a] px-2 py-0.5 border border-[#334155]">
                    {reg.range}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-yellow-400 transition-colors font-sans">
                  {reg.region} Region
                </h3>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wide block mt-0.5">
                  {reg.highlight}
                </span>
                <p className="text-xs sm:text-sm text-slate-200 mt-2.5 leading-relaxed font-sans">
                  <strong className="text-slate-400 font-semibold">Starters:</strong> {reg.starters}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-[#334155] flex items-center justify-between text-xs font-mono text-yellow-400 font-black uppercase tracking-wider">
                <span>Explore Region</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* National Pokédex Telemetry & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-[#1e293b] border-2 border-[#334155] border-t-4 border-t-[#dc2626] p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-300 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">National Dex</span>
            <PokeBall variant="gold" size={16} />
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-white font-sans">1,025</div>
            <div className="text-xs sm:text-sm font-mono text-slate-300 mt-1">Pokémon Species Indexed</div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-[#334155] flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-slate-400">Coverage</span>
            <span className="text-yellow-400">Gen 1–9 Complete</span>
          </div>
        </div>

        <div className="bg-[#1e293b] border-2 border-[#334155] border-t-4 border-t-[#eab308] p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-300 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">Battle Evidence</span>
            <Trophy className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-yellow-400 font-sans">8,226</div>
            <div className="text-xs sm:text-sm font-mono text-slate-300 mt-1">Verified Battle Records</div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-[#334155] flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-slate-400">Evidence</span>
            <span className="text-sky-400">Official Data</span>
          </div>
        </div>

        <div className="bg-[#1e293b] border-2 border-[#334155] border-t-4 border-t-[#16a34a] p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-300 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">Type Matrix</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-white font-sans">18 Types</div>
            <div className="text-xs sm:text-sm font-mono text-slate-300 mt-1">Dual-Type Multipliers</div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-[#334155] flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-slate-400">Relations</span>
            <span className="text-emerald-400">Weaknesses & Immunities</span>
          </div>
        </div>

        <div className="bg-[#1e293b] border-2 border-[#334155] border-t-4 border-t-[#2563eb] p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-300 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">Battle Coach</span>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-sky-400 font-sans">Online</div>
            <div className="text-xs sm:text-sm font-mono text-slate-300 mt-1">Tactical Reasoner</div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-[#334155] flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-slate-400">Status</span>
            <span className="text-yellow-400">Matchup Ready</span>
          </div>
        </div>
      </div>

      {/* Pokédex System Command Strip */}
      <div className="bg-[#1e293b] border-2 border-[#334155] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 bg-emerald-400" />
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider font-sans">
              Official Pokémon League Network Ready
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Cataloging 1,025 Pokémon across Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar, and Paldea with official base stats and typing.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('pokedex')}
          className="flex items-center justify-center gap-2.5 px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-slate-950 transition-colors cursor-pointer shrink-0"
        >
          <Search className="w-4 h-4 stroke-[3]" />
          <span>Launch National Dex</span>
        </button>
      </div>
    </div>
  );
}
