import React from 'react';
import { Bot, BookOpen, GitCompare, LayoutDashboard, Database } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, healthInfo }) {
  const isConnected = healthInfo?.mongodb?.connected;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ask', label: 'Ask the Dex', icon: Bot },
    { id: 'pokedex', label: 'Pokédex Explorer', icon: BookOpen },
    { id: 'compare', label: 'Compare', icon: GitCompare },
  ];

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-8 h-8 rounded-full bg-red-600 flex items-center justify-center border-2 border-white/80 shadow-md group-hover:scale-105 transition-transform">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-950" />
            <div className="w-2.5 h-2.5 rounded-full bg-white border border-zinc-950 z-10 shadow-xs" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
              Dex<span className="text-red-500">Mind</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-mono tracking-widest block -mt-1">
              RAG POKÉDEX
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* MongoDB Status Pill */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-colors ${
              isConnected
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-950/40 border-amber-500/30 text-amber-400'
            }`}
            title={isConnected ? 'Connected to MongoDB Atlas' : healthInfo?.mongodb?.error || 'Database disconnected'}
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
            <Database className="w-3.5 h-3.5 hidden sm:inline" />
            <span className="text-[11px] font-bold">
              {isConnected ? 'Atlas Connected' : 'Atlas Offline'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
