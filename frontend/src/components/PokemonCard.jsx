import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Check } from 'lucide-react';
import { getTypeStyle } from '../utils/pokemonTypes';

export default function PokemonCard({
  pokemon,
  onClick,
  onSelectCompare,
  isSelectedForCompare,
}) {
  const formatId = (id) => `#${String(id).padStart(3, '0')}`;
  const [imgSrc, setImgSrc] = useState(
    pokemon.sprite_url ||
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`
  );

  const primaryType = pokemon.types?.[0]
    ? typeof pokemon.types[0] === 'string'
      ? pokemon.types[0]
      : pokemon.types[0].name
    : 'normal';

  const typeMeta = getTypeStyle(primaryType);

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.15, ease: 'easeOut' } }}
      onClick={() => onClick && onClick(pokemon)}
      className="group relative bg-[#10131d]/90 hover:bg-[#151a27] border border-white/[0.08] hover:border-red-500/40 rounded-2xl p-4 transition-colors duration-200 flex flex-col items-center cursor-pointer shadow-lg hover:shadow-2xl overflow-hidden"
    >
      {/* Background Radial Glow based on Pokémon's primary type */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-opacity duration-300 opacity-30 group-hover:opacity-60"
        style={{ backgroundColor: typeMeta.glow }}
      />

      {/* Top Bar: ID and Compare Toggle */}
      <div className="w-full flex justify-between items-center z-10 mb-1">
        <span className="text-[11px] font-mono font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">
          {formatId(pokemon.id)}
        </span>

        {onSelectCompare && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectCompare(pokemon);
            }}
            className={`flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-md border transition-all duration-150 cursor-pointer ${
              isSelectedForCompare
                ? 'bg-red-600 border-red-500 text-white shadow-xs'
                : 'bg-white/[0.04] border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
            }`}
            title={isSelectedForCompare ? 'Remove from comparison' : 'Add to comparison'}
          >
            {isSelectedForCompare ? (
              <>
                <Check className="w-3 h-3 text-white" />
                <span>Selected</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3 text-zinc-400 group-hover:text-zinc-200" />
                <span>Compare</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Sprite Presentation with subtle hover zoom */}
      <div className="w-28 h-28 flex items-center justify-center my-2 relative z-10">
        <div className="absolute inset-0 bg-radial from-white/[0.03] to-transparent rounded-full" />
        <img
          src={imgSrc}
          alt={pokemon.name}
          loading="eager"
          decoding="sync"
          onError={() => {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`);
          }}
          className="w-24 h-24 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-md select-none"
        />
      </div>

      {/* Pokémon Name */}
      <h3 className="text-sm font-bold text-zinc-100 group-hover:text-red-400 transition-colors capitalize mb-2.5 z-10 tracking-tight">
        {pokemon.name}
      </h3>

      {/* Type Badges */}
      <div className="flex flex-wrap gap-1.5 justify-center z-10 w-full">
        {pokemon.types?.map((t) => {
          const typeName = typeof t === 'string' ? t : t.name;
          const style = getTypeStyle(typeName);
          return (
            <span
              key={typeName}
              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md tracking-wider border ${style.bg} ${style.border} ${style.text}`}
            >
              {typeName}
            </span>
          );
        })}
      </div>
    </motion.div>
  );
}
