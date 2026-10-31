import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CitationPanel from './components/CitationPanel';
import Home from './pages/Home';
import AskDex from './pages/AskDex';
import Pokedex from './pages/Pokedex';
import ComparePage from './pages/ComparePage';
import { fetchHealth } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
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
    <div className="min-h-screen bg-[#060b19] text-slate-100 flex flex-col font-sans selection:bg-yellow-400/30 selection:text-yellow-200 bg-grid-pattern">
      {/* Top Floating / Blurred Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        healthInfo={healthInfo}
        onQuickSearch={() => setActiveTab('pokedex')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
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

      {/* Official League Footer */}
      <footer className="border-t border-blue-500/15 py-6 mt-auto bg-[#060b19]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-300/70 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-xs shadow-yellow-400" />
            <span className="text-white font-bold">DexMind</span>
            <span>— The Definitive National Pokédex & Battle Intelligence Platform</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-blue-400/60 flex-wrap justify-center">
            <span>Gen 1 through Gen 9</span>
            <span>•</span>
            <span>1,025 Pokémon Registered</span>
            <span>•</span>
            <span>Pokémon © Nintendo / Creatures Inc. / GAME FREAK inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
