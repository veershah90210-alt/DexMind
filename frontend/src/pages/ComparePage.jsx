import React, { useState, useEffect } from 'react';
import { GitCompare, ArrowUpDown, AlertCircle, RefreshCw } from 'lucide-react';
import { comparePokemon, fetchPokemonList } from '../services/api';
import ComparisonCard from '../components/ComparisonCard';

export default function ComparePage({ compareSelection, onCitationClick }) {
  const [allPokemon, setAllPokemon] = useState([]);
  const [p1Name, setP1Name] = useState(compareSelection?.[0]?.name || 'Charizard');
  const [p2Name, setP2Name] = useState(compareSelection?.[1]?.name || 'Blastoise');
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load available names
    const load = async () => {
      try {
        const res = await fetchPokemonList();
        setAllPokemon(res.results || []);
      } catch (e) {
        console.error(e);
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

  const handleRunComparison = async () => {
    if (!p1Name || !p2Name) return;
    setError('');
    setLoading(true);
    try {
      const data = await comparePokemon(p1Name, p2Name);
      setComparisonData(data);
    } catch (err) {
      setError(err.message || 'Comparison failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      {/* Selector Box */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-red-500" />
          <span>Head-to-Head Pokémon Comparison</span>
        </h2>
        <p className="text-xs text-zinc-400 mb-6">
          Compare any two Pokémon using deterministic stat calculations and grounded RAG evidence retrieval.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
          {/* Pokemon 1 Selector */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono text-zinc-400 mb-1">Pokémon 1</label>
            <input
              list="pokemon-list-1"
              value={p1Name}
              onChange={(e) => setP1Name(e.target.value)}
              placeholder="e.g. Charizard"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 capitalize focus:border-red-500 focus:outline-hidden font-medium"
            />
            <datalist id="pokemon-list-1">
              {allPokemon.map((p) => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>
          </div>

          {/* VS Divider */}
          <div className="text-center sm:col-span-1 flex justify-center">
            <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-400">
              VS
            </div>
          </div>

          {/* Pokemon 2 Selector */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono text-zinc-400 mb-1">Pokémon 2</label>
            <input
              list="pokemon-list-2"
              value={p2Name}
              onChange={(e) => setP2Name(e.target.value)}
              placeholder="e.g. Blastoise"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 capitalize focus:border-red-500 focus:outline-hidden font-medium"
            />
            <datalist id="pokemon-list-2">
              {allPokemon.map((p) => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleRunComparison}
            disabled={loading || !p1Name || !p2Name}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all cursor-pointer disabled:bg-zinc-800 disabled:text-zinc-600"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Retrieving & Comparing...
              </>
            ) : (
              <>
                <ArrowUpDown className="w-4 h-4" />
                Compare Pokémon
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Comparison Results Card */}
      {comparisonData && (
        <ComparisonCard data={comparisonData} onCitationClick={onCitationClick} />
      )}
    </div>
  );
}
