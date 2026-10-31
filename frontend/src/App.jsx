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
      console.warn('Backend or database offline:', err);
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
    <div className="min-h-screen bg-[#090a10] text-zinc-100 flex flex-col font-sans selection:bg-red-500/25 selection:text-red-200">
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

      {/* Minimal Tech Stack Footer */}
      <footer className="border-t border-white/[0.06] py-5 mt-auto bg-[#090a10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500/80" />
            <span className="text-zinc-400 font-bold">DexMind</span>
            <span>— Canonical Retrieval-Augmented Generation Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>MongoDB Atlas Vector Search</span>
            <span>•</span>
            <span>all-MiniLM-L6-v2 (384-d)</span>
            <span>•</span>
            <span>Gemini API</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
