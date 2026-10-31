import React from 'react';
import PokeBall from './PokeBall';

/**
 * Large, low-opacity rotating SVG Pokéball CAD wireframe blueprint
 * Placed in the background of the active RAG terminal and Pokémon inspection pane.
 */
export default function CadWireframeBackground({
  size = 520,
  opacity = 0.08,
  className = '',
}) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none flex items-center justify-center ${className}`}
      style={{ opacity }}
    >
      <div className="animate-cad-rotate text-[#FFCB05]">
        <PokeBall variant="cad" size={size} />
      </div>
    </div>
  );
}
