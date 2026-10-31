import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CitationPanel from './components/CitationPanel';
import Home from './pages/Home';
import AskDex from './pages/AskDex';
import Pokedex from './pages/Pokedex';
import ComparePage from './pages/ComparePage';
import { fetchHealth } from './services/api';

export default function App() {
  const getInitialTab = () => {
    try {
      const hash = window.location.hash.replace('#', '');
      if (['dashboard', 'ask', 'pokedex', 'compare'].includes(hash)) return hash;
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (['dashboard', 'ask', 'pokedex', 'compare'].includes(tabParam)) return tabParam;
    } catch {
      // fallback
    }
    return 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState(getInitialTab);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    try {
      window.location.hash = tab;
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['dashboard', 'ask', 'pokedex', 'compare'].includes(hash)) {
        setActiveTabState(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [healthInfo, setHealthInfo] = useState(null);
  const [activeCitation, setActiveCitation] = useState(null);
  const [compareSelection, setCompareSelection] = useState([]);
  const [initialQuery, setInitialQuery] = useState('');

  const loadHealth = async () => {
    try {
      const data = await fetchHealth();
      setHealthInfo(data);
    } catch (err) {
      console.warn('Network offline:', err);
      setHealthInfo({
        status: 'disconnected',
        mongodb: { connected: false, error: err.message },
      });
    }
  };

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectForCompare = (pokemon) => {
    setCompareSelection((prev) => {
      const exists = prev.some((p) => p.id === pokemon.id);
      if (exists) {
        return prev.filter((p) => p.id !== pokemon.id);
      }
      if (prev.length >= 2) {
        return [prev[1], pokemon];
      }
      return [...prev, pokemon];
    });
  };

  const handleSelectPrompt = (prompt) => {
    setInitialQuery(prompt);
    setActiveTab('ask');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans selection:bg-yellow-400 selection:text-slate-950">
      {/* Top Pokédex Device Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        healthInfo={healthInfo}
        onQuickSearch={() => setActiveTab('pokedex')}
      />

      {/* Main Content Area - Maximizing Available Left & Right Space */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto px-3 sm:px-6 py-4">
        {activeTab === 'dashboard' && (
          <Home
            healthInfo={healthInfo}
            refreshHealth={loadHealth}
            setActiveTab={setActiveTab}
            onSelectPrompt={handleSelectPrompt}
          />
        )}

        {activeTab === 'ask' && (
          <AskDex
            initialQuery={initialQuery}
            onCitationClick={(source) => setActiveCitation(source)}
          />
        )}

        {activeTab === 'pokedex' && (
          <Pokedex
            onSelectForCompare={handleSelectForCompare}
            compareSelection={compareSelection}
            setActiveTab={setActiveTab}
            onAskAboutPokemon={(p) => {
              setInitialQuery(`Tell me about ${p.name}, its stats, and best battle strategies.`);
              setActiveTab('ask');
            }}
          />
        )}

        {activeTab === 'compare' && (
          <ComparePage
            compareSelection={compareSelection}
            onCitationClick={(source) => setActiveCitation(source)}
          />
        )}
      </main>

      {/* Global Citation Inspection Modal */}
      <CitationPanel
        source={activeCitation}
        onClose={() => setActiveCitation(null)}
      />

      {/* Pokédex Chassis Footer */}
      <footer className="border-t-2 border-red-700 py-3 mt-auto bg-[#0b1329]">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-300 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-yellow-400 border border-slate-900" />
            <span className="text-white font-black tracking-wider">DexMind</span>
            <span className="text-slate-400">— Official National Pokédex Operating System</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap justify-center font-bold">
            <span className="text-yellow-400">Gen 1–9 Unified Registry</span>
            <span>•</span>
            <span className="text-emerald-400">1,025 Pokémon Registered</span>
            <span>•</span>
            <span>Pokémon © Nintendo / Creatures Inc. / GAME FREAK inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
