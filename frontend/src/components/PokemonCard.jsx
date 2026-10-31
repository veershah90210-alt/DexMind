import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Check } from 'lucide-react';
import { getTypeStyle } from '../utils/pokemonTypes';
import PokeBall from './PokeBall';

export default function PokemonCard({
  pokemon,
  onClick,
  onSelectCompare,
  isSelectedForCompare,
}) {
  const formatId = (id) => `#${String(id).padStart(4, '0')}`;
  const [imgSrc, setImgSrc] = useState(
    pokemon.sprite_url ||
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`
  );

  const primaryType = pokemon.types?.[0]
    ? typeof pokemon.types[0] === 'string'
      ? pokemon.types[0]
      : pokemon.types[0].name
    : 'normal';

  const typeMeta = getTypeStyle(primaryType);

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.18, ease: 'easeOut' } }}
      onClick={() => onClick && onClick(pokemon)}
      className="group relative bg-[#0b142b] hover:bg-[#101e3d] border border-blue-500/15 hover:border-yellow-400/50 rounded-2xl p-4 transition-all duration-200 flex flex-col items-center cursor-pointer shadow-lg hover:shadow-yellow-400/10 overflow-hidden"
    >
      {/* Background Radial Glow based on Pokémon's primary type */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-opacity duration-300 opacity-25 group-hover:opacity-60"
        style={{ backgroundColor: typeMeta.glow }}
      />

      {/* Subtle Poké Ball Watermark in Card Background that rotates on hover */}
      <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:opacity-15 transition-all duration-300 group-hover:rotate-45 pointer-events-none">
        <PokeBall variant="watermark" size={90} className="text-white" />
      </div>

      {/* Top Bar: ID and Matchup Toggle */}
      <div className="w-full flex justify-between items-center z-10 mb-1">
        <div className="flex items-center gap-1.5">
          <PokeBall variant="standard" size={13} />
          <span className="text-[11px] font-mono font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors">
            {formatId(pokemon.id)}
          </span>
        </div>

        {onSelectCompare && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectCompare(pokemon);
            }}
            className={`flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border transition-all duration-150 cursor-pointer ${
              isSelectedForCompare
                ? 'bg-yellow-400 border-yellow-400 text-slate-950 shadow-xs'
                : 'bg-blue-950/40 border-blue-500/20 text-blue-300 hover:text-white hover:bg-blue-600/20'
            }`}
            title={isSelectedForCompare ? 'Remove from Matchup Lab' : 'Add to Matchup Lab'}
          >
            {isSelectedForCompare ? (
              <>
                <Check className="w-3 h-3 text-slate-950 stroke-[3]" />
                <span>Selected</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3 text-blue-300 group-hover:text-yellow-400" />
                <span>Compare</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Official Artwork Presentation with subtle hover zoom */}
      <div className="w-28 h-28 flex items-center justify-center my-2 relative z-10">
        <div className="absolute inset-0 bg-radial from-white/[0.04] to-transparent rounded-full" />
        <img
          src={imgSrc}
          alt={pokemon.name}
          loading="lazy"
          decoding="async"
          onError={() => {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`);
          }}
          className="w-24 h-24 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-md select-none"
        />
      </div>

      {/* Pokémon Name */}
      <h3 className="text-sm font-black text-white group-hover:text-yellow-400 transition-colors capitalize mb-2.5 z-10 tracking-tight">
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
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md tracking-wider border ${style.bg} ${style.border} ${style.text}`}
            >
              {typeName}
            </span>
          );
        })}
      </div>
    </motion.div>
  );
}
