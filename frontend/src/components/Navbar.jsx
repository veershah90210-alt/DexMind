import React from 'react';
import { BookOpen, GitCompare, LayoutDashboard, Sparkles, Command, Radio } from 'lucide-react';

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
    <header className="sticky top-0 z-40 w-full border-b border-blue-500/15 bg-[#060b19]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
        >
          {/* Electric Blue & Yellow Core Emblem */}
          <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-blue-600 p-0.5 shadow-lg shadow-yellow-400/20 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full rounded-full bg-[#060b19] flex items-center justify-center relative overflow-hidden border border-white/20">
              {/* Inner Optical Core */}
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-blue-500 shadow-inner flex items-center justify-center animate-pulse-subtle">
                <div className="w-1.5 h-1.5 rounded-full bg-white opacity-90" />
              </div>
              {/* Sensor Highlight */}
              <div className="absolute top-1 left-2 w-1.5 h-0.5 rounded-full bg-white/60 rotate-[-20deg]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-white">
                Dex<span className="text-yellow-400">Mind</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-yellow-400/15 text-yellow-300 border border-yellow-400/30">
                GEN 1–9
              </span>
            </div>
            <span className="text-[10px] text-blue-300/80 font-mono tracking-wider block -mt-0.5 uppercase font-semibold">
              National Pokédex & Battle Intel
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center p-1 rounded-xl bg-[#0b142b] border border-blue-500/20 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'text-slate-950 bg-gradient-to-r from-yellow-400 to-amber-400 shadow-md shadow-yellow-400/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-blue-400'}`} />
                <span className="hidden sm:inline">{item.label}</span>
                {item.badge && !isActive && (
                  <span className="hidden md:inline text-[9px] font-mono px-1 py-0.2 rounded bg-yellow-400/20 text-yellow-300 font-bold border border-yellow-400/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Status / Telemetry & Quick Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick Search Shortcut Pill */}
          <button
            onClick={() => onQuickSearch ? onQuickSearch() : setActiveTab('pokedex')}
            className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#0b142b] hover:bg-[#101e3d] border border-blue-500/20 text-blue-200 text-xs transition-colors cursor-pointer"
            title="Quick Pokédex Search (Press /)"
          >
            <Command className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs font-medium">Search Dex</span>
            <kbd className="font-mono text-[10px] bg-white/[0.08] px-1.5 py-0.5 rounded text-yellow-300 font-bold">
              /
            </kbd>
          </button>

          {/* National Dex Network Status Pill */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-colors shadow-xs ${
              isConnected
                ? 'bg-blue-950/40 border-blue-400/30 text-blue-300'
                : 'bg-amber-950/40 border-amber-500/30 text-amber-400'
            }`}
            title={
              isConnected
                ? `National Pokédex Network Active: ${pokemonCount} Pokémon Registered`
                : 'National Pokédex Network Offline'
            }
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isConnected ? 'bg-yellow-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isConnected ? 'bg-yellow-400' : 'bg-amber-500'
                }`}
              />
            </span>
            <Radio className="w-3.5 h-3.5 hidden sm:inline text-yellow-400" />
            <span className="text-[11px] font-bold tracking-wide">
              {isConnected ? `Dex Online (${pokemonCount})` : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
