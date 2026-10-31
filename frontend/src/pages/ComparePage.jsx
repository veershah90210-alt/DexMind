import React, { useState, useEffect } from 'react';
import { ArrowUpDown, AlertCircle, RefreshCw, Sparkles, Swords, Zap } from 'lucide-react';
import { comparePokemon, fetchPokemonList } from '../services/api';
import ComparisonCard from '../components/ComparisonCard';
import { cleanErrorMessage, findClosestPokemon } from '../utils/battleAnalysis';

const COMPARISON_PRESETS = [
  { p1: 'Charizard', p2: 'Blastoise', label: 'Gen 1 Kanto Icons' },
  { p1: 'Lucario', p2: 'Greninja', label: 'Fan Favorites' },
  { p1: 'Garchomp', p2: 'Dragonite', label: 'Dragon Titans' },
  { p1: 'Mewtwo', p2: 'Mew', label: 'Legendary Clash' },
  { p1: 'Kyogre', p2: 'Groudon', label: 'Ancient Weather Gods' },
  { p1: 'Miraidon', p2: 'Koraidon', label: 'Paldean Paradox' },
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
    const rawA = (pokemonA || p1Name).trim();
    const rawB = (pokemonB || p2Name).trim();
    if (!rawA || !rawB) return;

    setError('');

    // Allow 1 or 2 letter spelling mistakes against canonical catalog
    const matchA = findClosestPokemon(rawA);
    if (!matchA) {
      setError(`"${rawA}" is outside the canonical Pokémon game records.`);
      return;
    }

    const matchB = findClosestPokemon(rawB);
    if (!matchB) {
      setError(`"${rawB}" is outside the canonical Pokémon game records.`);
      return;
    }

    const a = matchA.name;
    const b = matchB.name;
    setP1Name(a);
    setP2Name(b);

    setLoading(true);
    try {
      const data = await comparePokemon(a, b);
      setComparisonData(data);
    } catch (err) {
      setError(cleanErrorMessage(err.message || 'Comparison failed.'));
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
    <div className="w-full max-w-[1720px] mx-auto py-1 space-y-4">
      {/* Pokédex Arena Staging Control Center */}
      <div className="bg-[#1e293b] border-2 border-[#334155] border-t-4 border-t-[#dc2626] p-4 sm:p-5 relative overflow-hidden shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#334155]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-400 text-slate-950 font-black text-xs font-mono mb-2 border border-yellow-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              Pokédex Matchup Arena
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5 font-sans">
              <Swords className="w-6 h-6 text-yellow-400 stroke-[2.5]" />
              <span>Head-to-Head Battle Simulator</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-200 mt-1.5 max-w-2xl leading-relaxed">
              Compare any two Pokémon across all 9 Generations with side-by-side base statistics, stat differential advantages, type coverage analysis, and battle verdicts.
            </p>
          </div>

          {/* Quick Rivalry Presets */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <span className="text-xs font-mono text-amber-400 uppercase font-bold tracking-wider shrink-0">
              Classic Rivalries:
            </span>
            <div className="flex flex-wrap gap-2 items-center">
              {COMPARISON_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetClick(preset)}
                  className="px-3 py-1.5 bg-[#0f172a] hover:bg-[#334155] border border-[#475569] hover:border-yellow-400 text-xs font-mono text-slate-200 hover:text-white transition-colors cursor-pointer font-bold"
                >
                  {preset.p1} <span className="text-yellow-400 font-black">VS</span> {preset.p2}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Combatants Control Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          {/* Combatant 1 Selector (Red Corner) */}
          <div className="md:col-span-2 bg-[#0f172a] p-4 border-2 border-red-500/60 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs sm:text-sm font-mono text-red-400 font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-500 inline-block" />
                Red Corner (Combatant 1)
              </label>
              <span className="text-xs font-mono text-slate-400">Searchable</span>
            </div>
            <input
              list="pokemon-list-1"
              value={p1Name}
              onChange={(e) => setP1Name(e.target.value)}
              placeholder="e.g. Charizard"
              className="w-full bg-[#1e293b] border-2 border-[#475569] focus:border-red-400 px-3.5 py-2.5 text-sm sm:text-base text-white capitalize font-bold placeholder-slate-400 focus:outline-hidden transition-colors"
            />
            <datalist id="pokemon-list-1">
              {allPokemon.map((p) => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>
          </div>

          {/* Swap Combatants Center Button */}
          <div className="text-center md:col-span-1 flex flex-col items-center justify-center gap-1.5 pb-2">
            <button
              type="button"
              onClick={handleSwap}
              className="w-11 h-11 bg-[#0f172a] hover:bg-yellow-400 text-yellow-400 hover:text-slate-950 border-2 border-[#475569] hover:border-yellow-400 flex items-center justify-center transition-colors cursor-pointer shadow-sm"
              title="Swap Pokémon Corners"
            >
              <ArrowUpDown className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="text-[10px] font-mono font-bold uppercase text-slate-300 tracking-wider">
              Swap Corners
            </span>
          </div>

          {/* Combatant 2 Selector (Blue Corner) */}
          <div className="md:col-span-2 bg-[#0f172a] p-4 border-2 border-blue-500/60 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs sm:text-sm font-mono text-sky-400 font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-sky-500 inline-block" />
                Blue Corner (Combatant 2)
              </label>
              <span className="text-xs font-mono text-slate-400">Searchable</span>
            </div>
            <input
              list="pokemon-list-2"
              value={p2Name}
              onChange={(e) => setP2Name(e.target.value)}
              placeholder="e.g. Blastoise"
              className="w-full bg-[#1e293b] border-2 border-[#475569] focus:border-sky-400 px-3.5 py-2.5 text-sm sm:text-base text-white capitalize font-bold placeholder-slate-400 focus:outline-hidden transition-colors"
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
            className={`flex items-center gap-2.5 px-7 py-3 font-black text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer border-2 ${
              loading || !p1Name.trim() || !p2Name.trim()
                ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                : 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 border-yellow-300 shadow-sm'
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
          <div className="mt-4 p-3 bg-red-950/50 border-2 border-red-500 text-red-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="font-semibold">{error}</span>
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
