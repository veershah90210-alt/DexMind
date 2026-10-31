import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Filter,
  X,
  ArrowUpDown,
  Shield,
  Heart,
  Zap,
  Sparkles,
  Trophy,
  Gauge,
} from 'lucide-react';
import { fetchPokemonList, fetchPokemonDetail } from '../services/api';
import PokemonCard from '../components/PokemonCard';
import { getTypeStyle } from '../utils/pokemonTypes';

const ALL_TYPES = [
  'All',
  'Normal',
  'Fire',
  'Water',
  'Grass',
  'Electric',
  'Ice',
  'Fighting',
  'Poison',
  'Ground',
  'Flying',
  'Psychic',
  'Bug',
  'Rock',
  'Ghost',
  'Dragon',
  'Steel',
  'Fairy',
];

const STAT_CONFIG = {
  hp: { name: 'HP', icon: Heart, max: 255 },
  attack: { name: 'Attack', icon: Zap, max: 255 },
  defense: { name: 'Defense', icon: Shield, max: 255 },
  special_attack: { name: 'Sp. Atk', icon: Sparkles, max: 255 },
  special_defense: { name: 'Sp. Def', icon: Shield, max: 255 },
  speed: { name: 'Speed', icon: Gauge, max: 255 },
  total: { name: 'Total BST', icon: Trophy, max: 800 },
};

export default function Pokedex({
  onSelectForCompare,
  compareSelection,
  setActiveTab,
  onAskAboutPokemon,
}) {
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  const searchInputRef = useRef(null);

  // Keyboard shortcut listener: press '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && selectedPokemon) {
        setSelectedPokemon(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPokemon]);

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

  useEffect(() => {
    loadPokemon();
  }, [selectedType]);

  const handleCardClick = async (p) => {
    setSelectedPokemon(p);
    try {
      const detail = await fetchPokemonDetail(p.id);
      setSelectedPokemon(detail);
    } catch (err) {
      console.error('Failed to load Pokémon detail', err);
    }
  };

  const filteredList = pokemonList.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const modalPrimaryType = selectedPokemon?.types?.[0]
    ? typeof selectedPokemon.types[0] === 'string'
      ? selectedPokemon.types[0]
      : selectedPokemon.types[0].name
    : 'normal';
  const modalTypeStyle = getTypeStyle(modalPrimaryType);

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Top Controls: Search, Type filter, Compare bar */}
      <div className="bg-[#10131d] border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Kanto Pokémon by name... (Press /)"
              className="w-full bg-[#090a10] border border-white/[0.1] focus:border-red-500 rounded-xl pl-10 pr-9 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-hidden transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Compare Trigger Floating Button if items selected */}
          {compareSelection && compareSelection.length > 0 && (
            <button
              onClick={() => setActiveTab('compare')}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span>Launch Compare ({compareSelection.length}/2)</span>
            </button>
          )}
        </div>

        {/* Type Filter Pills Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <div className="flex items-center gap-1 text-zinc-400 font-mono text-[11px] shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5 text-red-400" />
            <span>Type:</span>
          </div>
          <div className="flex gap-1.5 flex-nowrap">
            {ALL_TYPES.map((t) => {
              const isSelected = selectedType === t;
              return (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 border border-white/[0.06]'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1 border-t border-white/[0.04]">
          <span>
            Showing <strong className="text-zinc-300">{filteredList.length}</strong> of{' '}
            <strong className="text-zinc-300">151</strong> Kanto Pokémon
          </span>
          {selectedType !== 'All' && (
            <span className="text-red-400">Filtered by: {selectedType}</span>
          )}
        </div>
      </div>

      {/* Grid of Pokémon */}
      {loading ? (
        <div className="py-24 text-center text-zinc-400 font-mono text-xs flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
          <span>Querying MongoDB Atlas Pokémon collection...</span>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="py-20 text-center bg-[#10131d] rounded-2xl border border-white/[0.08] p-8 space-y-4">
          <p className="text-zinc-400 text-sm">
            No Pokémon found matching "{searchTerm}".
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedType('All');
            }}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 text-xs font-semibold border border-white/[0.08] cursor-pointer"
          >
            Clear Filters
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

      {/* Detail Modal Dialog */}
      <AnimatePresence>
        {selectedPokemon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPokemon(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-[#10131d] border border-white/[0.12] w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
            >
              {/* Header */}
              <div className="bg-[#151a27] px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-zinc-400 text-xs font-bold px-2 py-0.5 rounded bg-white/[0.06]">
                    #{String(selectedPokemon.id).padStart(3, '0')}
                  </span>
                  <h2 className="text-xl font-black text-white capitalize tracking-tight">
                    {selectedPokemon.name}
                  </h2>
                  <span className="text-xs text-zinc-400 italic">
                    ({selectedPokemon.genus || 'Pokémon'})
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPokemon(null)}
                  className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-sm">
                {/* Hero Showcase */}
                <div className="relative overflow-hidden flex flex-col sm:flex-row items-center gap-6 bg-[#090a10] p-5 rounded-2xl border border-white/[0.06]">
                  <div
                    className="absolute -top-12 -left-12 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-40"
                    style={{ backgroundColor: modalTypeStyle.glow }}
                  />

                  <img
                    src={selectedPokemon.sprite_url}
                    alt={selectedPokemon.name}
                    className="w-32 h-32 object-contain drop-shadow-lg relative z-10 select-none"
                  />
                  <div className="flex-1 space-y-2.5 text-center sm:text-left relative z-10">
                    <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                      {selectedPokemon.types?.map((t) => {
                        const typeName = typeof t === 'string' ? t : t.name;
                        const style = getTypeStyle(typeName);
                        return (
                          <span
                            key={typeName}
                            className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-md tracking-wider border ${style.bg} ${style.border} ${style.text}`}
                          >
                            {typeName}
                          </span>
                        );
                      })}
                    </div>
                    <div className="text-xs font-mono text-zinc-400 grid grid-cols-2 gap-2 pt-1">
                      <div>
                        Height:{' '}
                        <span className="text-white font-bold">
                          {selectedPokemon.height || 'N/A'} m
                        </span>
                      </div>
                      <div>
                        Weight:{' '}
                        <span className="text-white font-bold">
                          {selectedPokemon.weight || 'N/A'} kg
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Base Stats with Animated Progress Bars */}
                {selectedPokemon.stats && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                        Base Statistics
                      </h4>
                      <span className="text-xs font-mono text-zinc-400">
                        Total BST:{' '}
                        <strong className="text-white">
                          {selectedPokemon.stats.total || 'N/A'}
                        </strong>
                      </span>
                    </div>

                    <div className="space-y-2">
                      {Object.entries(selectedPokemon.stats).map(([k, v]) => {
                        const config = STAT_CONFIG[k] || { name: k, max: 255 };
                        const pct = Math.min(Math.round((v / config.max) * 100), 100);
                        const isHigh = v >= 100;
                        const isMid = v >= 70 && v < 100;

                        return (
                          <div
                            key={k}
                            className="bg-[#090a10] p-2.5 px-3 rounded-xl border border-white/[0.06] flex items-center justify-between gap-4 text-xs font-mono"
                          >
                            <span className="w-24 text-zinc-400 uppercase text-[11px] truncate">
                              {k.replace('_', ' ')}
                            </span>
                            <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                              <div
                                style={{ width: `${pct}%` }}
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isHigh
                                    ? 'bg-emerald-500'
                                    : isMid
                                    ? 'bg-amber-500'
                                    : 'bg-zinc-500'
                                }`}
                              />
                            </div>
                            <span className="w-8 text-right text-white font-bold">{v}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Evolution Chain */}
                {selectedPokemon.evolution_text && (
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold mb-1.5">
                      Evolution Chain
                    </h4>
                    <p className="bg-[#090a10] p-3.5 rounded-xl border border-white/[0.06] text-xs text-zinc-300 leading-relaxed font-sans">
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
                    <div className="space-y-2">
                      {selectedPokemon.abilities.map((ab, idx) => (
                        <div
                          key={idx}
                          className="bg-[#090a10] p-3 rounded-xl border border-white/[0.06] text-xs"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white capitalize">
                              {ab.name}
                            </span>
                            {ab.is_hidden && (
                              <span className="text-[10px] bg-red-500/20 border border-red-500/30 text-red-400 px-1.5 py-0.2 rounded font-mono font-bold">
                                Hidden Ability
                              </span>
                            )}
                          </div>
                          <p className="text-zinc-400 text-[11px] leading-relaxed">
                            {ab.effect || ab.short_effect || 'No description available.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer with Actions */}
              <div className="bg-[#151a27] px-6 py-3.5 border-t border-white/[0.08] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectForCompare(selectedPokemon);
                      setSelectedPokemon(null);
                      setActiveTab('compare');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 text-xs font-semibold border border-white/[0.08] transition-colors cursor-pointer"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    Compare
                  </button>

                  {onAskAboutPokemon && (
                    <button
                      onClick={() => {
                        const target = selectedPokemon;
                        setSelectedPokemon(null);
                        onAskAboutPokemon(target);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-semibold border border-red-500/30 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-red-400" />
                      Ask AI
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setSelectedPokemon(null)}
                  className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
