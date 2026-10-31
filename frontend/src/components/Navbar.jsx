import React from 'react';
import { BookOpen, GitCompare, LayoutDashboard, Sparkles, Command } from 'lucide-react';
import pokemonLogo from '../assets/pokemon-logo.svg';
import PokeBall from './PokeBall';

export default function Navbar({ activeTab, setActiveTab, healthInfo, onQuickSearch }) {
  const isConnected = healthInfo?.mongodb?.connected;
  const pokemonCount = healthInfo?.mongodb?.pokemon_count || 1025;

  const navItems = [
    { id: 'dashboard', label: 'Command Hub', icon: LayoutDashboard },
    { id: 'ask', label: 'Battle Coach', icon: Sparkles, badge: 'AI' },
    { id: 'pokedex', label: 'National Dex', icon: BookOpen },
    { id: 'compare', label: 'Matchup Lab', icon: GitCompare },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#c0262d] border-b-4 border-[#8e1920] shadow-md">
      <div className="max-w-[1720px] mx-auto px-3 sm:px-6 h-15 flex items-center justify-between gap-3">
        {/* Left Section: Iconic Pokédex Sensor Lens & Indicators + Brand */}
        <div className="flex items-center gap-3 shrink-0 select-none">
          {/* Authentic Pokédex Sensor Array */}
          <div className="flex items-center gap-2 pr-2 border-r border-[#9b1d23]">
            {/* Main Blue Sensor Lens */}
            <div className="w-8 h-8 bg-sky-400 border-2 border-white flex items-center justify-center shadow-inner">
              <div className="w-2.5 h-2.5 bg-white/80" />
            </div>

            {/* Indicator Trio: Ruby, Amber, Jade */}
            <div className="hidden sm:flex items-center gap-1.5 pl-1">
              <div className="w-3 h-3 bg-red-400 border border-red-950" title="Power" />
              <div className="w-3 h-3 bg-yellow-300 border border-yellow-950" title="Data Bus" />
              <div className="w-3 h-3 bg-emerald-400 border border-emerald-950" title="Network Link" />
            </div>
          </div>

          {/* Pokémon Logo & App Name */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <img
              src={pokemonLogo}
              alt="Pokémon"
              className="h-7 w-auto object-contain select-none"
            />
            <div className="hidden md:flex items-center gap-1.5 pl-1">
              <span className="text-sm font-black tracking-wider text-white uppercase">
                Dex<span className="text-yellow-300">Mind</span>
              </span>
              <span className="px-1.5 py-0.2 text-[10px] font-mono font-black bg-yellow-400 text-slate-950 border border-black">
                GEN 1–9
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Pokédex Hardware Keys */}
        <nav className="flex items-center bg-[#8f1920] p-1 border-2 border-[#691116]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 sm:px-5 py-2 text-xs sm:text-sm font-black uppercase tracking-wider transition-colors cursor-pointer border ${
                  isActive
                    ? 'bg-yellow-400 text-slate-950 border-slate-950 shadow-inner'
                    : 'bg-[#a31d24] text-white hover:bg-[#b8222a] border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950 stroke-[2.5]' : 'text-yellow-300'}`} />
                <span className="hidden sm:inline font-sans">{item.label}</span>
                {item.badge && !isActive && (
                  <span className="hidden md:inline text-[10px] font-mono px-1 bg-yellow-400 text-slate-950 font-black border border-black">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Fast Search & Pokédex Telemetry */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Search Key */}
          <button
            onClick={() => (onQuickSearch ? onQuickSearch() : setActiveTab('pokedex'))}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#8f1920] hover:bg-[#7a141b] border border-[#691116] text-white text-xs font-mono font-bold transition-colors cursor-pointer"
            title="Fast Pokédex Search (Press /)"
          >
            <Command className="w-3.5 h-3.5 text-yellow-300" />
            <span>Search</span>
            <kbd className="bg-slate-950 text-yellow-300 px-1 py-0.2 border border-slate-800 text-[10px]">
              /
            </kbd>
          </button>

          {/* Database Link Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 border text-xs font-mono font-bold ${
              isConnected
                ? 'bg-[#1e293b] border-slate-700 text-white'
                : 'bg-amber-950 border-amber-500 text-amber-300'
            }`}
            title={
              isConnected
                ? `National Pokédex Active: ${pokemonCount} Pokémon Registered`
                : 'National Pokédex Offline'
            }
          >
            <PokeBall variant={isConnected ? 'standard' : 'ultra'} size={14} />
            <span className="hidden xl:inline">
              {isConnected ? `${pokemonCount} POKÉMON` : 'OFFLINE'}
            </span>
            <span
              className={`w-2 h-2 ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
