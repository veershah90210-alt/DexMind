import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Swords,
  Shield,
  Heart,
  Zap,
  Gauge,
  Trophy,
  X,
} from 'lucide-react';
import { fetchPokemonDetail } from '../services/api';
import PokemonTypeBadge from './PokemonTypeBadge';
import SegmentedLedMeter from './SegmentedLedMeter';
import PokemonCryButton from './PokemonCryButton';
import PokeBall from './PokeBall';

const STAT_LABELS = {
  hp: { label: 'HP', icon: Heart, max: 255 },
  attack: { label: 'Attack', icon: Zap, max: 255 },
  defense: { label: 'Defense', icon: Shield, max: 255 },
  special_attack: { label: 'Sp. Atk', icon: Sparkles, max: 255 },
  special_defense: { label: 'Sp. Def', icon: Shield, max: 255 },
  speed: { label: 'Speed', icon: Gauge, max: 255 },
};

/**
 * Authentic Pokémon Pokédex Inspector Deck
 * - Deep Pokédex glass telemetry deck with cyan & crimson highlights
 * - Pokémon Yellow (#FFCB05) & Pokéball Red (#DC2626) mode selectors
 * - Canonical segmented LED meters & official artwork viewer
 */
export default function PokemonInspectorPane({
  pokemon,
  onClose,
  onAskAboutPokemon,
  onSelectForCompare,
  isSelectedForCompare = false,
  className = '',
}) {
  const [fetchedDetail, setFetchedDetail] = useState(null);
  const [artMode, setArtMode] = useState('sugimori'); // 'sugimori' | 'shiny' | 'dream'

  useEffect(() => {
    if (!pokemon?.id) return;
    if (!pokemon.stats || !pokemon.abilities) {
      fetchPokemonDetail(pokemon.id)
        .then((data) => {
          setFetchedDetail(data);
        })
        .catch((err) => {
          console.warn('Inspector failed to fetch full detail:', err);
        });
    } else {
      setFetchedDetail(null);
    }
  }, [pokemon?.id, pokemon?.stats, pokemon?.abilities]);

  const p = fetchedDetail || pokemon;

  if (!p) {
    return (
      <div className={`relative screen-recessed p-8 flex flex-col items-center justify-center text-center text-[#94a3b8] min-h-[380px] overflow-hidden ${className}`}>
        <PokeBall variant="standard" size={40} className="opacity-40 mb-3" />
        <h4 className="font-sans text-xs font-bold text-[#f8fafc] mb-1 tracking-wide uppercase">
          Pokédex Telemetry Deck
        </h4>
        <p className="font-sans text-[11px] max-w-xs leading-relaxed text-[#cbd5e1]">
          Select any specimen or tap a [S#] verified citation to load canonical battle telemetry and stats.
        </p>
      </div>
    );
  }

  const sugimoriUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;
  const shinyUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${p.id}.png`;
  const dreamWorldUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${p.id}.svg`;

  let currentSprite = sugimoriUrl;
  if (artMode === 'shiny') currentSprite = shinyUrl;
  if (artMode === 'dream') currentSprite = dreamWorldUrl;

  const bstTotal = p.stats?.total || (p.stats ? Object.values(p.stats).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0) : 0);

  return (
    <div className={`relative screen-recessed flex flex-col h-full overflow-hidden border-2 border-[#1e293b] ${className}`}>
      {/* Top Header with Pokédex Species Index & Cry Player */}
      <div className="relative z-10 flex items-center justify-between p-3.5 bg-[#0f172a] border-b border-[#1e293b]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1e293b] border border-[#334155] rounded-[4px] font-mono text-xs shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
            <span className="w-2 h-2 rounded-full bg-[#dc2626] shadow-[0_0_6px_#dc2626]" />
            <span className="text-[#ffcb05] font-bold">#{String(p.id).padStart(4, '0')}</span>
          </div>
          <div>
            <h3 className="text-sm font-extrabold capitalize text-[#f8fafc] leading-tight font-sans">
              {p.name}
            </h3>
            <span className="text-[10px] text-[#94a3b8] font-mono block uppercase tracking-wider">
              {p.genus || 'SPECIMEN ENTRY'} • GEN {p.generation || 1}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PokemonCryButton pokemonId={p.id} size="sm" />
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-[#94a3b8] hover:text-[#ffffff] bg-[#1e293b] hover:bg-[#334155] border border-[#334155] rounded-[4px] cursor-pointer"
              title="Close Deck"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Inspector Body */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-3.5 text-xs font-sans">
        {/* Artwork Showcase Box with Mode Toggles */}
        <div className="bg-gradient-to-b from-[#090d14] to-[#131d2e] border border-[#1e293b] rounded-[6px] p-3 flex flex-col items-center relative shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
          <div className="w-full flex items-center justify-between border-b border-[#1e293b] pb-2 mb-2.5">
            <div className="flex gap-1.5">
              <button
                onClick={() => setArtMode('sugimori')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-[4px] border transition-all cursor-pointer font-mono ${
                  artMode === 'sugimori'
                    ? 'bg-[#dc2626] text-white border-[#ef4444] shadow-[0_0_8px_rgba(220,38,38,0.7)]'
                    : 'bg-[#1e293b] text-[#cbd5e1] hover:text-white border-[#334155]'
                }`}
              >
                STANDARD
              </button>
              <button
                onClick={() => setArtMode('shiny')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-[4px] border transition-all cursor-pointer font-mono flex items-center gap-1 ${
                  artMode === 'shiny'
                    ? 'bg-[#ca8a04] text-[#0f172a] border-[#ffcb05] shadow-[0_0_8px_rgba(255,203,5,0.7)]'
                    : 'bg-[#1e293b] text-[#cbd5e1] hover:text-white border-[#334155]'
                }`}
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>SHINY</span>
              </button>
              <button
                onClick={() => setArtMode('dream')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-[4px] border transition-all cursor-pointer font-mono ${
                  artMode === 'dream'
                    ? 'bg-[#00b4d8] text-[#0f172a] border-[#38bdf8] shadow-[0_0_8px_rgba(0,180,216,0.7)]'
                    : 'bg-[#1e293b] text-[#cbd5e1] hover:text-white border-[#334155]'
                }`}
              >
                VECTOR
              </button>
            </div>

            <span className="text-[10px] text-[#ffcb05] font-mono tracking-wider font-bold">
              {artMode === 'shiny' ? 'SHINY PALETTE' : artMode === 'dream' ? 'DREAM WORLD' : 'OFFICIAL SUGIMORI'}
            </span>
          </div>

          <div className="w-36 h-36 flex items-center justify-center p-2 relative my-1">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,180,216,0.15),transparent_70%)] pointer-events-none" />
            <img
              src={currentSprite}
              alt={p.name}
              onError={(e) => {
                e.currentTarget.src = sugimoriUrl;
              }}
              className="max-h-full max-w-full object-contain select-none filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 justify-center mt-2 w-full pt-2 border-t border-[#1e293b]">
            {p.types?.map((t) => (
              <PokemonTypeBadge key={typeof t === 'string' ? t : t.name} type={t} size="sm" variant="raised" />
            ))}
          </div>
        </div>

        {/* Physical Facts Row */}
        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="bg-[#111827] border border-[#1e293b] rounded-[4px] p-2 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]">
            <span className="text-[10px] text-[#94a3b8] block uppercase tracking-wider">Height</span>
            <span className="text-[#f8fafc] font-bold text-xs">{p.height || 'N/A'} m</span>
          </div>
          <div className="bg-[#111827] border border-[#1e293b] rounded-[4px] p-2 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]">
            <span className="text-[10px] text-[#94a3b8] block uppercase tracking-wider">Weight</span>
            <span className="text-[#f8fafc] font-bold text-xs">{p.weight || 'N/A'} kg</span>
          </div>
          <div className="bg-[#111827] border border-[#1e293b] rounded-[4px] p-2 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]">
            <span className="text-[10px] text-[#94a3b8] block uppercase tracking-wider">Base BST</span>
            <span className="text-[#ffcb05] font-extrabold text-xs">{bstTotal}</span>
          </div>
        </div>

        {/* Base Stat Meters */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-[6px] p-3 space-y-2.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-1.5 font-mono text-xs">
            <span className="text-[#f8fafc] font-bold flex items-center gap-1.5 tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-[#ffcb05]" />
              BASE COMBAT STATISTICS
            </span>
            <span className="text-[10px] text-[#94a3b8]">SCALE 0–255</span>
          </div>

          <div className="space-y-2 pt-1">
            {p.stats && Object.entries(STAT_LABELS).map(([key, cfg]) => {
              const val = p.stats[key] || 0;
              return (
                <SegmentedLedMeter
                  key={key}
                  label={cfg.label}
                  value={val}
                  max={cfg.max}
                  segments={14}
                  icon={cfg.icon}
                  onField={true}
                />
              );
            })}
          </div>
        </div>

        {/* Abilities */}
        {p.abilities && p.abilities.length > 0 && (
          <div className="bg-[#111827] border border-[#1e293b] rounded-[6px] p-3 space-y-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
            <span className="text-xs font-bold text-[#f8fafc] block border-b border-[#1e293b] pb-1.5 uppercase font-mono tracking-wider">
              BATTLE TRAITS & ABILITIES
            </span>
            <div className="space-y-2 pt-1">
              {p.abilities.map((ab, idx) => (
                <div key={idx} className="bg-[#0b0f17] p-2.5 border border-[#1e293b] rounded-[4px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#f8fafc] capitalize text-[11px] font-sans">{ab.name}</span>
                    {ab.is_hidden && (
                      <span className="px-1.5 py-0.2 bg-[#7f1d1d] border border-[#dc2626] text-[#fca5a5] text-[9px] font-mono rounded-[2px] font-bold">
                        HIDDEN
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#cbd5e1] leading-relaxed">
                    {ab.effect || ab.short_effect || 'No operational record available.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evolution Pathway */}
        {p.evolution_text && (
          <div className="bg-[#111827] border border-[#1e293b] rounded-[6px] p-3 space-y-1.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
            <span className="text-xs font-bold text-[#f8fafc] block border-b border-[#1e293b] pb-1.5 uppercase font-mono tracking-wider">
              EVOLUTION CHAIN
            </span>
            <p className="text-[11px] text-[#cbd5e1] leading-relaxed pt-1">
              {p.evolution_text}
            </p>
          </div>
        )}
      </div>

      {/* Pane Footer Action Bar - Pokéball Red & Pikachu Yellow Keys */}
      <div className="relative z-10 p-3 bg-[#0f172a] border-t border-[#1e293b] grid grid-cols-2 gap-2 text-xs">
        {onAskAboutPokemon && (
          <button
            onClick={() => onAskAboutPokemon(p)}
            className="key-raised-primary w-full"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#ffcb05]" />
            <span className="font-bold">QUERY RAG</span>
          </button>
        )}

        {onSelectForCompare && (
          <button
            onClick={() => onSelectForCompare(p)}
            className="key-raised-yellow w-full"
          >
            <Swords className="w-3.5 h-3.5 text-[#0f172a]" />
            <span className="font-bold">{isSelectedForCompare ? 'STAGED' : 'COMPARE'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
