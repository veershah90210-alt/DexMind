import React, { useState, useEffect } from 'react';
import { ArrowUpDown, AlertCircle, RefreshCw, Sparkles, Swords } from 'lucide-react';
import { comparePokemon, fetchPokemonList } from '../services/api';
import ComparisonCard from '../components/ComparisonCard';

const COMPARISON_PRESETS = [
  { p1: 'Charizard', p2: 'Blastoise' },
  { p1: 'Lucario', p2: 'Greninja' },
  { p1: 'Garchomp', p2: 'Dragonite' },
  { p1: 'Tinkaton', p2: 'Gengar' },
  { p1: 'Pikachu', p2: 'Raichu' },
];

export default function ComparePage({ compareSelection, onCitationClick }) {
  const [allPokemon, setAllPokemon] = useState([]);
  const [p1Name, setP1Name] = useState(compareSelection?.[0]?.name || 'Charizard');
  const [p2Name, setP2Name] = useState(compareSelection?.[1]?.name || 'Blastoise');
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [error, setError] = useState('');

  // Fetch list of available Pokémon for autocomplete
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchPokemonList();
        setAllPokemon(res.results || []);
      } catch (e) {
        console.error('Failed to load Pokémon list for comparison autocomplete:', e);
      }
    };
    load();
  }, []);

  // Update names if compareSelection changes externally
  useEffect(() => {
    if (compareSelection && compareSelection.length > 0) {
      if (compareSelection[0]) setP1Name(compareSelection[0].name);
      if (compareSelection[1]) setP2Name(compareSelection[1].name);
    }
  }, [compareSelection]);

  const executeComparison = async (pokemonA, pokemonB) => {
    const a = (pokemonA || p1Name).trim();
    const b = (pokemonB || p2Name).trim();
    if (!a || !b) return;

    setError('');
    setLoading(true);
    try {
      const data = await comparePokemon(a, b);
      setComparisonData(data);
    } catch (err) {
      setError(err.message || 'Comparison failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    const temp = p1Name;
    setP1Name(p2Name);
    setP2Name(temp);
  };

  const handlePresetClick = (preset) => {
    setP1Name(preset.p1);
    setP2Name(preset.p2);
    executeComparison(preset.p1, preset.p2);
  };

  return (
    <div className="max-w-4xl mx-auto py-2 space-y-8">
      {/* Selector Box */}
      <div className="bg-[#0b142b] border border-blue-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-400/15 border border-yellow-400/30 text-yellow-300 text-xs font-mono font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              Official League Matchup Simulator
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Swords className="w-6 h-6 text-yellow-400" />
              <span>Head-to-Head Battle Lab</span>
            </h2>
            <p className="text-xs text-blue-200/80 mt-1 max-w-lg">
              Simulate head-to-head tactical matchups between any two Pokémon across all 9 Generations with stat differential analysis, type coverage calculations, and battle coach verdicts.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-mono text-blue-300 uppercase font-bold">Presets:</span>
            {COMPARISON_PRESETS.slice(0, 3).map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetClick(preset)}
                className="px-2.5 py-1 rounded-lg bg-[#060b19] hover:bg-[#162850] border border-blue-500/20 text-[11px] font-mono text-blue-200 hover:text-white transition-colors cursor-pointer font-semibold"
              >
                {preset.p1} vs {preset.p2}
              </button>
            ))}
          </div>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
          {/* Pokemon 1 Selector */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono text-blue-300 mb-1.5 font-bold">
              First Combatant
            </label>
            <input
              list="pokemon-list-1"
              value={p1Name}
              onChange={(e) => setP1Name(e.target.value)}
              placeholder="e.g. Charizard"
              className="w-full bg-[#060b19] border border-blue-500/25 focus:border-yellow-400 rounded-xl px-4 py-3 text-sm text-white capitalize font-semibold placeholder-blue-300/40 focus:outline-hidden transition-all shadow-inner"
            />
            <datalist id="pokemon-list-1">
              {allPokemon.map((p) => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>
          </div>

          {/* Swap Button */}
          <div className="text-center sm:col-span-1 flex justify-center pb-1">
            <button
              type="button"
              onClick={handleSwap}
              className="w-10 h-10 rounded-full bg-[#060b19] hover:bg-[#162850] border border-blue-500/30 flex items-center justify-center text-yellow-400 hover:text-yellow-300 transition-all cursor-pointer shadow-xs"
              title="Swap Pokémon"
            >
              <ArrowUpDown className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Pokemon 2 Selector */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono text-blue-300 mb-1.5 font-bold">
              Opponent Pokémon
            </label>
            <input
              list="pokemon-list-2"
              value={p2Name}
              onChange={(e) => setP2Name(e.target.value)}
              placeholder="e.g. Blastoise"
              className="w-full bg-[#060b19] border border-blue-500/25 focus:border-yellow-400 rounded-xl px-4 py-3 text-sm text-white capitalize font-semibold placeholder-blue-300/40 focus:outline-hidden transition-all shadow-inner"
            />
            <datalist id="pokemon-list-2">
              {allPokemon.map((p) => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={() => executeComparison()}
            disabled={loading || !p1Name.trim() || !p2Name.trim()}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer ${
              loading || !p1Name.trim() || !p2Name.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black shadow-lg shadow-yellow-400/25'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                Simulating Matchup...
              </>
            ) : (
              <>
                <Swords className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                Simulate Head-to-Head Battle
              </>
            )}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Comparison Results Card */}
      {comparisonData && (
        <ComparisonCard
          data={comparisonData}
          onCitationClick={onCitationClick}
        />
      )}
    </div>
  );
}
