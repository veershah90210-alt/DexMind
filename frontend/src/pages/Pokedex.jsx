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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Layers,
} from 'lucide-react';
import { fetchPokemonList, fetchPokemonDetail } from '../services/api';
import PokemonCard from '../components/PokemonCard';
import PokeBall from '../components/PokeBall';
import { getTypeStyle } from '../utils/pokemonTypes';

const GENERATIONS = [
  { id: 'All', label: 'All Gens', region: 'All', range: '1–1025' },
  { id: 1, label: 'Gen 1', region: 'Kanto', range: '1–151' },
  { id: 2, label: 'Gen 2', region: 'Johto', range: '152–251' },
  { id: 3, label: 'Gen 3', region: 'Hoenn', range: '252–386' },
  { id: 4, label: 'Gen 4', region: 'Sinnoh', range: '387–493' },
  { id: 5, label: 'Gen 5', region: 'Unova', range: '494–649' },
  { id: 6, label: 'Gen 6', region: 'Kalos', range: '650–721' },
  { id: 7, label: 'Gen 7', region: 'Alola', range: '722–809' },
  { id: 8, label: 'Gen 8', region: 'Galar', range: '810–905' },
  { id: 9, label: 'Gen 9', region: 'Paldea', range: '906–1025' },
];

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
  const [selectedGen, setSelectedGen] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(60);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
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

  // Reset to page 1 on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGen, selectedType, searchTerm, pageSize]);

  const loadPokemon = async () => {
    setLoading(true);
    try {
      const typeFilter = selectedType === 'All' ? null : selectedType;
      const genFilter = selectedGen === 'All' ? null : Number(selectedGen);
      const res = await fetchPokemonList({
        search: searchTerm.trim() || null,
        type: typeFilter,
        generation: genFilter,
        page: currentPage,
        limit: pageSize,
      });

      const list = res.results || [];
      setPokemonList(list);
      setTotalCount(res.count ?? list.length);
      setTotalPages(res.total_pages || Math.max(1, Math.ceil((res.count || list.length) / pageSize)));
    } catch (err) {
      console.error('Failed to load Pokémon', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadPokemon();
    }, 200);
    return () => clearTimeout(debounceTimer);
  }, [selectedGen, selectedType, searchTerm, currentPage, pageSize]);

  const handleCardClick = async (p) => {
    setSelectedPokemon(p);
    try {
      const detail = await fetchPokemonDetail(p.id);
      setSelectedPokemon(detail);
    } catch (err) {
      console.error('Failed to load Pokémon detail', err);
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate pagination buttons with smart ellipsis
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  const modalPrimaryType = selectedPokemon?.types?.[0]
    ? typeof selectedPokemon.types[0] === 'string'
      ? selectedPokemon.types[0]
      : selectedPokemon.types[0].name
    : 'normal';
  const modalTypeStyle = getTypeStyle(modalPrimaryType);

  return (
    <div className="space-y-5 w-full max-w-[1720px] mx-auto py-2">
      {/* Top Controls: Pokédex Hardware Toolbar */}
      <div className="bg-[#1e293b] border-2 border-[#334155] border-t-4 border-t-[#dc2626] p-4 sm:p-5 space-y-4 shadow-md">
        {/* Row 1: Search & Matchup Lab Trigger */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Pokémon by name or ID (Gen 1–9)... (Press /)"
              className="w-full bg-[#0f172a] border-2 border-[#475569] focus:border-yellow-400 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-hidden transition-colors font-sans"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Compare Trigger Button */}
          {compareSelection && compareSelection.length > 0 && (
            <button
              onClick={() => setActiveTab('compare')}
              className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 border border-yellow-300 uppercase tracking-wider"
            >
              <ArrowUpDown className="w-4 h-4 stroke-[2.5]" />
              <span>Launch Matchup Lab ({compareSelection.length}/2)</span>
            </button>
          )}
        </div>

        {/* Row 2: Generation Filter Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <div className="flex items-center gap-1.5 text-amber-400 font-mono text-xs shrink-0 mr-1 font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4 text-yellow-400" />
            <span>Gen:</span>
          </div>
          <div className="flex gap-1.5 flex-nowrap">
            {GENERATIONS.map((g) => {
              const isSelected = selectedGen === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setSelectedGen(g.id)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors duration-150 cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-yellow-400 text-slate-950 font-black border-yellow-300 shadow-xs'
                      : 'bg-[#0f172a] hover:bg-[#334155] text-slate-200 hover:text-white border-[#334155]'
                  }`}
                >
                  <span>{g.label}</span>
                  {g.region !== 'All' && (
                    <span className={`text-xs font-mono ${isSelected ? 'text-slate-950 font-bold' : 'text-amber-400'}`}>
                      {g.region}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Type Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <div className="flex items-center gap-1.5 text-amber-400 font-mono text-xs shrink-0 mr-1 font-bold uppercase tracking-wider">
            <Filter className="w-4 h-4 text-yellow-400" />
            <span>Type:</span>
          </div>
          <div className="flex gap-1.5 flex-nowrap">
            {ALL_TYPES.map((t) => {
              const isSelected = selectedType === t;
              return (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-2.5 py-1 text-xs font-bold whitespace-nowrap transition-colors duration-150 cursor-pointer border uppercase tracking-wider ${
                    isSelected
                      ? 'bg-yellow-400 text-slate-950 border-yellow-300 shadow-xs'
                      : 'bg-[#0f172a] hover:bg-[#334155] text-slate-300 hover:text-white border-[#334155]'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 4: Results Counter & Per Page */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono text-slate-300 pt-3 border-t border-[#334155] gap-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span>
              Showing <strong className="text-yellow-400 font-bold">{startRecord}–{endRecord}</strong> of{' '}
              <strong className="text-white font-bold">{totalCount}</strong> Pokémon
            </span>
            {selectedGen !== 'All' && (
              <span className="text-sky-400 font-bold">• Gen {selectedGen}</span>
            )}
            {selectedType !== 'All' && (
              <span className="text-amber-400 font-bold">• {selectedType} type</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-xs uppercase font-bold text-slate-400">Per page:</span>
              {[24, 36, 48, 72].map((size) => (
                <button
                  key={size}
                  onClick={() => setPageSize(size)}
                  className={`px-2 py-0.5 text-xs font-mono font-bold cursor-pointer border ${
                    pageSize === size
                      ? 'bg-yellow-400 text-slate-950 border-yellow-300'
                      : 'bg-[#0f172a] border-[#334155] text-slate-300 hover:text-white hover:border-slate-500'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            {(selectedGen !== 'All' || selectedType !== 'All' || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedGen('All');
                  setSelectedType('All');
                  setSearchTerm('');
                }}
                className="text-amber-400 hover:text-amber-300 underline cursor-pointer text-xs font-bold uppercase tracking-wider"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Pokémon - Generously Spaced 2 to 6 Columns */}
      {loading ? (
        <div className="py-28 text-center text-amber-400 font-mono text-sm flex flex-col items-center justify-center gap-4 bg-[#1e293b] border-2 border-[#334155]">
          <div className="w-10 h-10 border-3 border-yellow-400 border-t-transparent animate-spin" />
          <span className="tracking-wider uppercase font-bold">Scanning National Pokédex Archives...</span>
        </div>
      ) : pokemonList.length === 0 ? (
        <div className="py-24 text-center bg-[#1e293b] border-2 border-[#334155] p-8 space-y-4">
          <p className="text-slate-200 text-base font-semibold">
            {searchTerm ? (
              <>
                No Pokémon found matching &ldquo;<span className="text-yellow-400 font-mono">{searchTerm}</span>&rdquo; in canonical records. Please verify spelling or search by ID (1–1025).
              </>
            ) : (
              'No Pokémon found matching your filters.'
            )}
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedType('All');
              setSelectedGen('All');
            }}
            className="px-5 py-2.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs sm:text-sm font-bold border border-red-500 cursor-pointer uppercase tracking-wider"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
            {pokemonList.map((p) => {
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

          {/* Pagination Navigation Bar */}
          {totalPages > 1 && (
            <div className="bg-[#1e293b] border-2 border-[#334155] border-b-4 border-b-[#dc2626] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm shadow-sm">
              <span className="font-mono text-slate-300 text-xs sm:text-sm">
                Page <strong className="text-yellow-400 font-bold">{currentPage}</strong> of{' '}
                <strong className="text-white font-bold">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-1.5 font-mono">
                {/* First Page Button */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-[#475569] bg-[#0f172a] text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-[#334155] transition-colors cursor-pointer"
                  title="First Page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Prev Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-[#475569] bg-[#0f172a] text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-[#334155] transition-colors cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Numbered Page Buttons */}
                <div className="flex items-center gap-1 px-1">
                  {getPageNumbers().map((item, idx) => {
                    if (item === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400 font-mono text-sm">
                          ...
                        </span>
                      );
                    }
                    const isCurrent = item === currentPage;
                    return (
                      <button
                        key={item}
                        onClick={() => handlePageChange(item)}
                        className={`min-w-8 h-8 px-2.5 text-xs sm:text-sm font-mono font-bold transition-colors cursor-pointer border ${
                          isCurrent
                            ? 'bg-yellow-400 text-slate-950 font-black border-yellow-300'
                            : 'border-[#475569] bg-[#0f172a] text-slate-300 hover:text-white hover:bg-[#334155]'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-[#475569] bg-[#0f172a] text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-[#334155] transition-colors cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last Page Button */}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-[#475569] bg-[#0f172a] text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-[#334155] transition-colors cursor-pointer"
                  title="Last Page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
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
              className="fixed inset-0 bg-[#060b19]/80 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-[#1e293b] border-2 border-[#475569] border-t-4 border-t-[#dc2626] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[88vh] z-10"
            >
              {/* Pokédex Device Header */}
              <div className="bg-[#c0262d] px-5 py-3 border-b-2 border-[#8e1920] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {/* Blue camera sensor lens dot */}
                  <div className="w-3.5 h-3.5 bg-sky-400 border border-white shrink-0" />
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-400 text-slate-950 font-black text-xs font-mono border border-yellow-300">
                    <PokeBall variant="standard" size={13} />
                    <span>#{String(selectedPokemon.id).padStart(4, '0')}</span>
                  </div>
                  <h2 className="text-base font-black text-white capitalize tracking-tight font-sans">
                    {selectedPokemon.name}
                  </h2>
                  <span className="text-xs text-red-100 font-mono">
                    ({selectedPokemon.genus || 'Pokémon'})
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPokemon(null)}
                  className="text-white hover:text-yellow-300 p-1 bg-red-800 hover:bg-red-700 transition-colors cursor-pointer border border-red-900"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-4 text-sm bg-[#1e293b]">
                {/* Hero Showcase */}
                <div className="relative overflow-hidden flex flex-col sm:flex-row items-center gap-5 bg-[#0f172a] p-4 border border-[#334155]">
                  <div className="absolute -right-6 -bottom-6 pointer-events-none opacity-5">
                    <PokeBall variant="watermark" size={120} />
                  </div>

                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selectedPokemon.id}.png`}
                    onError={(e) => {
                      e.currentTarget.src = selectedPokemon.sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemon.id}.png`;
                    }}
                    alt={selectedPokemon.name}
                    className="w-28 h-28 object-contain relative z-10 select-none"
                  />
                  <div className="flex-1 space-y-2 text-center sm:text-left relative z-10">
                    <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                      {selectedPokemon.types?.map((t) => {
                        const typeName = typeof t === 'string' ? t : t.name;
                        const style = getTypeStyle(typeName);
                        return (
                          <span
                            key={typeName}
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 tracking-wider border ${style.bg} ${style.border} ${style.text}`}
                          >
                            {typeName}
                          </span>
                        );
                      })}
                    </div>
                    <div className="text-xs font-mono text-slate-300 grid grid-cols-2 gap-2 pt-0.5">
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

                {/* Base Stats */}
                {selectedPokemon.stats && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                        Base Statistics
                      </h4>
                      <span className="text-xs font-mono text-slate-300">
                        Total BST:{' '}
                        <strong className="text-yellow-400 font-bold">
                          {selectedPokemon.stats.total || 'N/A'}
                        </strong>
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {Object.entries(selectedPokemon.stats).map(([k, v]) => {
                        const config = STAT_CONFIG[k] || { name: k, max: 255 };
                        const pct = Math.min(Math.round((v / config.max) * 100), 100);
                        const isHigh = v >= 100;
                        const isMid = v >= 70 && v < 100;

                        return (
                          <div
                            key={k}
                            className="bg-[#0f172a] p-2 px-2.5 border border-[#334155] flex items-center justify-between gap-3 text-xs font-mono"
                          >
                            <span className="w-24 text-slate-300 uppercase text-[10px] truncate font-bold">
                              {k.replace('_', ' ')}
                            </span>
                            <div className="flex-1 h-2 bg-[#1e293b] border border-[#334155] overflow-hidden">
                              <div
                                style={{ width: `${pct}%` }}
                                className={`h-full ${
                                  isHigh
                                    ? 'bg-amber-400'
                                    : isMid
                                    ? 'bg-sky-400'
                                    : 'bg-emerald-500'
                                }`}
                              />
                            </div>
                            <span className="w-8 text-right text-white font-bold text-xs">{v}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Evolution Chain */}
                {selectedPokemon.evolution_text && (
                  <div>
                    <h4 className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold mb-1">
                      Evolution Path
                    </h4>
                    <p className="bg-[#0f172a] p-3 border border-[#334155] text-xs text-slate-200 leading-relaxed font-sans">
                      {selectedPokemon.evolution_text}
                    </p>
                  </div>
                )}

                {/* Abilities */}
                {selectedPokemon.abilities && selectedPokemon.abilities.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                      Abilities
                    </h4>
                    <div className="space-y-1.5">
                      {selectedPokemon.abilities.map((ab, idx) => (
                        <div
                          key={idx}
                          className="bg-[#0f172a] p-2.5 border border-[#334155] text-xs"
                        >
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-white capitalize text-xs">
                              {ab.name}
                            </span>
                            {ab.is_hidden && (
                              <span className="text-[9px] bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 px-1 py-0.2 font-mono font-bold uppercase">
                                Hidden
                              </span>
                            )}
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {ab.effect || ab.short_effect || 'No description available.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer with Actions */}
              <div className="bg-[#0f172a] px-5 py-3 border-t-2 border-[#334155] flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectForCompare(selectedPokemon);
                      setSelectedPokemon(null);
                      setActiveTab('compare');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e293b] hover:bg-[#334155] text-slate-200 hover:text-white text-xs font-bold border border-[#475569] transition-colors cursor-pointer uppercase tracking-wider"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-yellow-400 stroke-[2.5]" />
                    Matchup Lab
                  </button>

                  {onAskAboutPokemon && (
                    <button
                      onClick={() => {
                        const target = selectedPokemon;
                        setSelectedPokemon(null);
                        onAskAboutPokemon(target);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black transition-colors cursor-pointer uppercase tracking-wider border border-yellow-500"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      Pokédex Research AI
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setSelectedPokemon(null)}
                  className="px-3 py-1.5 bg-[#334155] hover:bg-slate-600 text-white text-xs font-bold border border-slate-500 cursor-pointer uppercase tracking-wider"
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
