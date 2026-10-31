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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-red-500/30 selection:text-red-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        healthInfo={healthInfo}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Home
            healthInfo={healthInfo}
            refreshHealth={loadHealth}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'ask' && (
          <AskDex
            onCitationClick={(source) => setActiveCitation(source)}
          />
        )}

        {activeTab === 'pokedex' && (
          <Pokedex
            onSelectForCompare={handleSelectForCompare}
            compareSelection={compareSelection}
            setActiveTab={setActiveTab}
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

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-900 py-4 text-center text-xs text-zinc-600 font-mono">
        DexMind MVP — Functional RAG Pokédex • PokéAPI • MongoDB Atlas Vector Search • Gemini API
      </footer>
    </div>
  );
}
