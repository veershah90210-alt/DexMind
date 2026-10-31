import React from 'react';

const TYPE_COLORS = {
  normal: 'bg-zinc-600 text-zinc-100',
  fire: 'bg-orange-600 text-white',
  water: 'bg-blue-600 text-white',
  grass: 'bg-emerald-600 text-white',
  electric: 'bg-amber-500 text-zinc-950 font-medium',
  ice: 'bg-cyan-500 text-zinc-950 font-medium',
  fighting: 'bg-red-700 text-white',
  poison: 'bg-purple-600 text-white',
  ground: 'bg-amber-700 text-white',
  flying: 'bg-indigo-400 text-zinc-950 font-medium',
  psychic: 'bg-pink-600 text-white',
  bug: 'bg-lime-600 text-white',
  rock: 'bg-stone-600 text-white',
  ghost: 'bg-purple-900 text-purple-200 border border-purple-700',
  dragon: 'bg-indigo-700 text-white',
  steel: 'bg-slate-500 text-white',
  dark: 'bg-zinc-800 text-zinc-200 border border-zinc-700',
  fairy: 'bg-rose-400 text-zinc-950 font-medium',
};

export default function PokemonCard({ pokemon, onClick, onSelectCompare, isSelectedForCompare }) {
  const formatId = (id) => `#${String(id).padStart(3, '0')}`;

  return (
    <div
      onClick={() => onClick && onClick(pokemon)}
      className="group relative bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-red-500/50 rounded-xl p-4 transition-all duration-200 flex flex-col items-center cursor-pointer shadow-lg hover:shadow-red-500/10"
    >
      {/* Pokédex ID Badge */}
      <div className="w-full flex justify-between items-center mb-1">
        <span className="text-xs font-mono font-bold text-zinc-500 group-hover:text-red-400">
          {formatId(pokemon.id)}
        </span>
        {onSelectCompare && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectCompare(pokemon);
            }}
            className={`text-xs px-2 py-0.5 rounded border transition-colors ${
              isSelectedForCompare
                ? 'bg-red-600 border-red-500 text-white'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
            }`}
          >
            {isSelectedForCompare ? 'Selected' : '+ Compare'}
          </button>
        )}
      </div>

      {/* Sprite */}
      <div className="w-28 h-28 flex items-center justify-center my-2 relative">
        <div className="absolute inset-0 bg-radial from-zinc-800/50 to-transparent rounded-full opacity-60" />
        {pokemon.sprite_url ? (
          <img
            src={pokemon.sprite_url}
            alt={pokemon.name}
            className="w-24 h-24 object-contain transition-transform duration-200 group-hover:scale-110 drop-shadow-md relative z-10"
            loading="lazy"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600 text-xs">
            No Sprite
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="text-base font-semibold text-zinc-100 group-hover:text-red-400 transition-colors capitalize mb-2">
        {pokemon.name}
      </h3>

      {/* Type Badges */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {pokemon.types?.map((t) => {
          const typeName = typeof t === 'string' ? t : t.name;
          const colorClass = TYPE_COLORS[typeName?.toLowerCase()] || 'bg-zinc-700 text-zinc-200';
          return (
            <span
              key={typeName}
              className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full tracking-wider ${colorClass}`}
            >
              {typeName}
            </span>
          );
        })}
      </div>
    </div>
  );
}
