import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Check } from 'lucide-react';
import { getTypeStyle } from '../utils/pokemonTypes';
import PokeBall from './PokeBall';

const TYPE_BORDER_COLORS = {
  normal: '#78716c',
  fire: '#ea580c',
  water: '#0284c7',
  grass: '#16a34a',
  electric: '#eab308',
  ice: '#06b6d4',
  fighting: '#b91c1c',
  poison: '#9333ea',
  ground: '#d97706',
  flying: '#6366f1',
  psychic: '#ec4899',
  bug: '#65a30d',
  rock: '#b45309',
  ghost: '#7c3aed',
  dragon: '#4338ca',
  steel: '#64748b',
  fairy: '#f43f5e',
};

export default function PokemonCard({
  pokemon,
  onClick,
  onSelectCompare,
  isSelectedForCompare,
}) {
  const formatId = (id) => `No. ${String(id).padStart(4, '0')}`;
  const [imgSrc, setImgSrc] = useState(
    pokemon.sprite_url ||
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`
  );

  const primaryType = pokemon.types?.[0]
    ? typeof pokemon.types[0] === 'string'
      ? pokemon.types[0].toLowerCase()
      : pokemon.types[0].name.toLowerCase()
    : 'normal';

  const typeBorderColor = TYPE_BORDER_COLORS[primaryType] || '#dc2626';

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.15, ease: 'easeOut' } }}
      onClick={() => onClick && onClick(pokemon)}
      className="group relative bg-[#1e293b] hover:bg-[#28354e] border-2 border-[#334155] hover:border-yellow-400 p-3 sm:p-4 transition-all duration-150 flex flex-col items-center cursor-pointer select-none shadow-sm"
      style={{ borderTopColor: typeBorderColor, borderTopWidth: '4px' }}
    >
      {/* Top Bar: ID and Matchup Toggle */}
      <div className="w-full flex justify-between items-center z-10 mb-2">
        <div className="flex items-center gap-1.5">
          <PokeBall variant="standard" size={13} />
          <span className="text-xs font-mono font-bold text-amber-400 tracking-wider">
            {formatId(pokemon.id)}
          </span>
        </div>

        {onSelectCompare && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectCompare(pokemon);
            }}
            className={`flex items-center gap-1 text-xs font-mono font-bold uppercase px-2 py-0.5 border transition-colors cursor-pointer ${
              isSelectedForCompare
                ? 'bg-yellow-400 border-yellow-300 text-slate-950 font-black'
                : 'bg-[#0f172a] border-[#334155] text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title={isSelectedForCompare ? 'Remove from Matchup Lab' : 'Add to Matchup Lab'}
          >
            {isSelectedForCompare ? (
              <>
                <Check className="w-3 h-3 text-slate-950 stroke-[3]" />
                <span>VS Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3 text-amber-400 stroke-[2.5]" />
                <span>VS</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Official Artwork Display - Prominent & Large */}
      <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center my-2 relative z-10">
        <img
          src={imgSrc}
          alt={pokemon.name}
          loading="lazy"
          decoding="async"
          onError={() => {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`);
          }}
          className="w-24 h-24 sm:w-28 sm:h-28 object-contain transition-transform duration-200 group-hover:scale-108 drop-shadow-md select-none"
        />
      </div>

      {/* Name */}
      <h3 className="text-sm sm:text-base font-bold capitalize text-white tracking-tight text-center z-10 mt-1 mb-2 font-sans truncate w-full">
        {pokemon.name}
      </h3>

      {/* Dual Type Pills */}
      <div className="flex flex-wrap gap-1.5 justify-center z-10 w-full mt-auto">
        {pokemon.types?.map((t) => {
          const typeName = typeof t === 'string' ? t : t.name;
          const style = getTypeStyle(typeName);
          return (
            <span
              key={typeName}
              className={`text-[11px] sm:text-xs font-black uppercase px-2.5 py-0.5 tracking-wider border ${style.bg} ${style.border} ${style.text}`}
            >
              {typeName}
            </span>
          );
        })}
      </div>
    </motion.div>
  );
}
