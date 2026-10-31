import React, { useState, useEffect } from 'react';
import { GitCompare, ArrowUpDown, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { comparePokemon, fetchPokemonList } from '../services/api';
import ComparisonCard from '../components/ComparisonCard';

const COMPARISON_PRESETS = [
  { p1: 'Charizard', p2: 'Blastoise' },
  { p1: 'Gengar', p2: 'Alakazam' },
  { p1: 'Pikachu', p2: 'Raichu' },
  { p1: 'Mewtwo', p2: 'Dragonite' },
  { p1: 'Venusaur', p2: 'Gyarados' },
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
      <div className="bg-[#10131d] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Determinism + Grounded RAG
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <GitCompare className="w-6 h-6 text-red-500" />
              <span>Head-to-Head Comparison</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-lg">
              Compare any two Pokémon using deterministic stat calculations and grounded evidence from PokéAPI canonical records.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Presets:</span>
            {COMPARISON_PRESETS.slice(0, 3).map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetClick(preset)}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
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
            <label className="block text-xs font-mono text-zinc-400 mb-1.5">
              First Pokémon
            </label>
            <input
              list="pokemon-list-1"
              value={p1Name}
              onChange={(e) => setP1Name(e.target.value)}
              placeholder="e.g. Charizard"
              className="w-full bg-[#090a10] border border-white/[0.1] focus:border-red-500 rounded-xl px-4 py-3 text-sm text-zinc-100 capitalize font-medium placeholder-zinc-600 focus:outline-hidden transition-all shadow-inner"
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
              className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer shadow-xs"
              title="Swap Pokémon"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* Pokemon 2 Selector */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono text-zinc-400 mb-1.5">
              Second Pokémon
            </label>
            <input
              list="pokemon-list-2"
              value={p2Name}
              onChange={(e) => setP2Name(e.target.value)}
              placeholder="e.g. Blastoise"
              className="w-full bg-[#090a10] border border-white/[0.1] focus:border-red-500 rounded-xl px-4 py-3 text-sm text-zinc-100 capitalize font-medium placeholder-zinc-600 focus:outline-hidden transition-all shadow-inner"
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
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing Matchup...
              </>
            ) : (
              <>
                <GitCompare className="w-4 h-4" />
                Run Head-to-Head Comparison
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
