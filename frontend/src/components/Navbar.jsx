import React from 'react';
import { BookOpen, GitCompare, LayoutDashboard, Database, Sparkles, Command } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, healthInfo, onQuickSearch }) {
  const isConnected = healthInfo?.mongodb?.connected;
  const pokemonCount = healthInfo?.mongodb?.pokemon_count || 0;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ask', label: 'Ask the Dex', icon: Sparkles, badge: 'AI' },
    { id: 'pokedex', label: 'Pokédex Explorer', icon: BookOpen },
    { id: 'compare', label: 'Compare', icon: GitCompare },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#090a10]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
        >
          {/* Pokédex Sensor Lens */}
          <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-rose-700 p-0.5 shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center relative overflow-hidden border border-white/20">
              {/* Inner Optical Core */}
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 shadow-inner flex items-center justify-center animate-pulse-subtle">
                <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
              </div>
              {/* Subtle Sensor Highlights */}
              <div className="absolute top-1 left-2 w-1.5 h-0.5 rounded-full bg-white/40 rotate-[-20deg]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-white">
                Dex<span className="text-red-500">Mind</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                v1.0
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono tracking-wider block -mt-0.5 uppercase">
              RAG Pokémon Intelligence
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'text-white bg-red-600/90 shadow-sm shadow-red-600/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span className="hidden sm:inline">{item.label}</span>
                {item.badge && !isActive && (
                  <span className="hidden md:inline text-[9px] font-mono px-1 py-0.2 rounded bg-red-500/20 text-red-400 font-bold">
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
            className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-zinc-400 hover:text-zinc-200 text-xs transition-colors cursor-pointer"
            title="Quick search (Press /)"
          >
            <Command className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs">Search</span>
            <kbd className="font-mono text-[10px] bg-white/[0.08] px-1.5 py-0.5 rounded text-zinc-300">
              /
            </kbd>
          </button>

          {/* MongoDB Atlas Status Pill */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-colors shadow-xs ${
              isConnected
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-950/40 border-amber-500/30 text-amber-400'
            }`}
            title={
              isConnected
                ? `Connected to MongoDB Atlas: ${pokemonCount} Pokémon indexed`
                : healthInfo?.mongodb?.error || 'Database disconnected'
            }
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isConnected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <Database className="w-3.5 h-3.5 hidden sm:inline opacity-80" />
            <span className="text-[11px] font-semibold tracking-wide">
              {isConnected ? 'Atlas Online' : 'Atlas Offline'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
