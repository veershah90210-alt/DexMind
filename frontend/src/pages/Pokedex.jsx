import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ArrowUpDown, Shield, Heart, Zap, Sparkles } from 'lucide-react';
import { fetchPokemonList, fetchPokemonDetail } from '../services/api';
import PokemonCard from '../components/PokemonCard';

const TYPES = [
  'All', 'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice',
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
  'Rock', 'Ghost', 'Dragon', 'Steel', 'Fairy'
];

export default function Pokedex({ onSelectForCompare, compareSelection, setActiveTab }) {
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadPokemon();
  }, [selectedType]);

  const loadPokemon = async () => {
    setLoading(true);
    try {
      const typeFilter = selectedType === 'All' ? null : selectedType;
      const res = await fetchPokemonList({ type: typeFilter });
      setPokemonList(res.results || []);
    } catch (err) {
      console.error('Failed to load Pokémon', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (p) => {
    setModalLoading(true);
    setSelectedPokemon(p);
    try {
      const detail = await fetchPokemonDetail(p.id);
      setSelectedPokemon(detail);
    } catch (err) {
      console.error('Failed to load detail', err);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredList = pokemonList.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4">
      {/* Top Controls: Search, Type filter, Compare bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Kanto Pokémon by name..."
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-hidden"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <Filter className="w-4 h-4 text-zinc-500 shrink-0" />
          <div className="flex gap-1.5">
            {TYPES.slice(0, 10).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedType === t
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Compare Drawer Trigger if items selected */}
        {compareSelection && compareSelection.length > 0 && (
          <button
            onClick={() => setActiveTab('compare')}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>Compare ({compareSelection.length}/2)</span>
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-zinc-500 font-mono text-xs">
          Loading Pokémon database...
        </div>
      ) : filteredList.length === 0 ? (
        <div className="py-20 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800/60 p-8 space-y-3">
          <p className="text-zinc-400 text-sm">No Pokémon match your filter or database is not yet seeded.</p>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
          >
            Go to Dashboard & Seed Kanto Pokédex
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredList.map((p) => {
            const isSelected = compareSelection?.some((sel) => sel.id === p.id);
            return (
              <PokemonCard
                key={p.id}
                pokemon={p}
                onClick={handleCardClick}
                onSelectCompare={onSelectForCompare}
                isSelectedForCompare={isSelected}
              />
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPokemon && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-zinc-900 border border-zinc-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-zinc-850 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-zinc-400 text-sm font-bold">
                  #{String(selectedPokemon.id).padStart(3, '0')}
                </span>
                <h2 className="text-xl font-black text-white capitalize">
                  {selectedPokemon.name}
                </h2>
                <span className="text-xs text-zinc-400 italic">
                  ({selectedPokemon.genus || 'Pokémon'})
                </span>
              </div>
              <button
                onClick={() => setSelectedPokemon(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80">
                <img
                  src={selectedPokemon.sprite_url}
                  alt={selectedPokemon.name}
                  className="w-32 h-32 object-contain drop-shadow-md"
                />
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                    {selectedPokemon.types?.map((t) => (
                      <span
                        key={typeof t === 'string' ? t : t.name}
                        className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700"
                      >
                        {typeof t === 'string' ? t : t.name}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-zinc-400 space-y-1">
                    <div>Height: <span className="text-zinc-200 font-semibold">{selectedPokemon.height || 'N/A'} m</span></div>
                    <div>Weight: <span className="text-zinc-200 font-semibold">{selectedPokemon.weight || 'N/A'} kg</span></div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              {selectedPokemon.stats && (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    Base Statistics
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {Object.entries(selectedPokemon.stats).map(([k, v]) => (
                      <div key={k} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-850 flex justify-between">
                        <span className="text-zinc-400 uppercase">{k.replace('_', ' ')}</span>
                        <span className="text-white font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evolution Chain */}
              {selectedPokemon.evolution_text && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold mb-1">
                    Evolution Chain
                  </h4>
                  <p className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 text-xs text-zinc-300 leading-relaxed">
                    {selectedPokemon.evolution_text}
                  </p>
                </div>
              )}

              {/* Abilities */}
              {selectedPokemon.abilities && selectedPokemon.abilities.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    Abilities
                  </h4>
                  <div className="space-y-1.5">
                    {selectedPokemon.abilities.map((ab, idx) => (
                      <div key={idx} className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-zinc-200">{ab.name}</span>
                          {ab.is_hidden && (
                            <span className="text-[10px] bg-red-950/60 border border-red-500/30 text-red-400 px-1.5 py-0.2 rounded font-mono">
                              Hidden
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-400 text-[11px] leading-relaxed">
                          {ab.effect || ab.short_effect || 'No description.'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-zinc-850 px-6 py-3 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setSelectedPokemon(null)}
                className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
