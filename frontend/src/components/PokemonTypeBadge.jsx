import React from 'react';
import { getTypeConfig } from '../utils/pokemonTypes';

/**
 * Authentic Pokémon Type Badge
 * - Rich elemental color tags with canonical type palettes
 * - Glowing elemental indicator dot
 */
export default function PokemonTypeBadge({
  type,
  size = 'md', // 'sm' | 'md' | 'lg'
  showCode = false,
  className = '',
  _variant = 'raised',
}) {
  const normalized = (typeof type === 'string' ? type : type?.name || 'normal').toLowerCase();
  const config = getTypeConfig(normalized);

  const sizeClasses = {
    sm: 'text-[9px] px-2 py-0.5 tracking-wider',
    md: 'text-[10px] px-2.5 py-0.5 tracking-wider',
    lg: 'text-xs px-3 py-1 tracking-wider',
  }[size] || 'text-[10px] px-2.5 py-0.5';

  return (
    <span
      className={`inline-flex items-center justify-center font-mono uppercase text-[#f8fafc] bg-[#111827] border border-[#374151] hover:border-[#60a5fa] rounded-[4px] select-none shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-all hover:-translate-y-0.5 ${sizeClasses} ${className}`}
      style={{
        borderLeftColor: config.hex,
        borderLeftWidth: '3px',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full mr-1.5 shadow-[0_0_5px_currentColor]"
        style={{ backgroundColor: config.hex, color: config.hex }}
      />
      <span className="font-bold tracking-wider">{showCode ? config.code : normalized}</span>
    </span>
  );
}
