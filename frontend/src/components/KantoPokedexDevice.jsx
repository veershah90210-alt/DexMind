import React, { useState } from 'react';

/**
 * Authentic Kanto Pokédex Hardware Device
 * Matches the iconic Red Kanto Pokédex specification:
 * - Red outer shell with top contour seam
 * - Large Cyan Sensor Lens with white border & RGB status LEDs
 * - Chamfered screen frame with dual sensor dots, red button & speaker grill
 * - Circular tactile button, red & cyan pill keys, green LCD screen, and D-Pad
 */
export default function KantoPokedexDevice({ className = '' }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const POKEMON_ENTRIES = [
    {
      id: 6,
      name: 'Charizard',
      type: 'Fire / Flying',
      number: 'No. 0006',
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
      height: '1.7 m',
      weight: '90.5 kg',
    },
    {
      id: 25,
      name: 'Pikachu',
      type: 'Electric',
      number: 'No. 0025',
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
      height: '0.4 m',
      weight: '6.0 kg',
    },
    {
      id: 150,
      name: 'Mewtwo',
      type: 'Psychic',
      number: 'No. 0150',
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
      height: '2.0 m',
      weight: '122.0 kg',
    },
    {
      id: 448,
      name: 'Lucario',
      type: 'Fighting / Steel',
      number: 'No. 0448',
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png',
      height: '1.2 m',
      weight: '54.0 kg',
    },
  ];

  const current = POKEMON_ENTRIES[selectedIdx];

  const handleNext = () => {
    setSelectedIdx((prev) => (prev + 1) % POKEMON_ENTRIES.length);
  };

  const handlePrev = () => {
    setSelectedIdx((prev) => (prev - 1 + POKEMON_ENTRIES.length) % POKEMON_ENTRIES.length);
  };

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 320 480"
        className="w-full max-w-[310px] sm:max-w-[340px] drop-shadow-2xl h-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Red Pokédex Body */}
        <rect
          x="12"
          y="12"
          width="296"
          height="456"
          rx="24"
          fill="#DC2626"
          stroke="#18181B"
          strokeWidth="6"
        />

        {/* Left Hinge Detail */}
        <rect
          x="12"
          y="42"
          width="8"
          height="396"
          rx="3"
          fill="#B91C1C"
          stroke="#18181B"
          strokeWidth="3"
        />

        {/* Top Diagonal Contour Fold Line */}
        <path
          d="M 12 96 L 142 96 L 182 56 L 308 56"
          fill="none"
          stroke="#18181B"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        {/* Top Sensor Cluster */}
        {/* Large Blue Sensor Lens */}
        <g className="cursor-pointer" onClick={handleNext}>
          <circle cx="62" cy="56" r="28" fill="#FFFFFF" stroke="#18181B" strokeWidth="5" />
          <circle cx="62" cy="56" r="21" fill="#00A8E8" stroke="#18181B" strokeWidth="3.5" />
          <ellipse cx="55" cy="49" rx="8" ry="5" fill="#FFFFFF" opacity="0.85" transform="rotate(-30 55 49)" />
        </g>

        {/* 3 Status LEDs: Red, Yellow, Green */}
        <circle cx="118" cy="38" r="7" fill="#EF4444" stroke="#18181B" strokeWidth="2.5" />
        <circle cx="138" cy="38" r="7" fill="#FACC15" stroke="#18181B" strokeWidth="2.5" />
        <circle cx="158" cy="38" r="7" fill="#22C55E" stroke="#18181B" strokeWidth="2.5" />

        {/* White Screen Frame with Chamfered Bottom-Left Corner */}
        <path
          d="M 52 136 H 268 Q 282 136 282 150 V 328 Q 282 342 268 342 H 78 L 38 302 V 150 Q 38 136 52 136 Z"
          fill="#F1F5F9"
          stroke="#18181B"
          strokeWidth="5.5"
          strokeLinejoin="round"
        />

        {/* Dual Red Dots at Top Center of Screen Bezel */}
        <circle cx="154" cy="146" r="3.5" fill="#DC2626" />
        <circle cx="166" cy="146" r="3.5" fill="#DC2626" />

        {/* Red Circular Button on Screen Bezel */}
        <circle
          cx="66"
          cy="322"
          r="9"
          fill="#DC2626"
          stroke="#18181B"
          strokeWidth="3"
          className="cursor-pointer hover:brightness-110 active:scale-95 transition-transform"
          onClick={handleNext}
        />

        {/* Speaker Grill Slits (4 horizontal bars) */}
        <line x1="236" y1="312" x2="270" y2="312" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
        <line x1="236" y1="319" x2="270" y2="319" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
        <line x1="236" y1="326" x2="270" y2="326" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
        <line x1="236" y1="333" x2="270" y2="333" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />

        {/* Inner Screen Display (Grey/Dark Canvas with Pokémon Sprite) */}
        <rect
          x="54"
          y="158"
          width="212"
          height="142"
          rx="4"
          fill="#334155"
          stroke="#18181B"
          strokeWidth="3.5"
        />

        {/* Screen Content Rendered via ForeignObject */}
        <foreignObject x="56" y="160" width="208" height="138">
          <div className="w-full h-full flex flex-col justify-between p-2 font-mono relative overflow-hidden select-none bg-gradient-to-b from-[#334155] to-[#1e293b]">
            {/* Top Info Bar inside Screen */}
            <div className="flex items-center justify-between z-10 text-[10px] leading-none">
              <span className="bg-red-600 text-white font-black px-1.5 py-0.5 rounded-[2px] tracking-wider">
                {current.number}
              </span>
              <span className="text-yellow-400 font-bold uppercase tracking-wide truncate max-w-[100px]">
                {current.name}
              </span>
            </div>

            {/* Pokémon Sprite Centerpiece */}
            <div className="flex-1 flex items-center justify-center relative my-0.5">
              <img
                src={current.sprite}
                alt={current.name}
                className="max-h-[88px] max-w-[110px] object-contain drop-shadow-lg transition-transform duration-200 hover:scale-108"
              />
            </div>

            {/* Bottom Info Bar inside Screen */}
            <div className="flex items-center justify-between z-10 text-[9px] text-slate-300 border-t border-slate-600/60 pt-1 leading-none font-bold">
              <span className="text-cyan-300 truncate">{current.type}</span>
              <span className="text-slate-400">{current.height}</span>
            </div>
          </div>
        </foreignObject>

        {/* Bottom Hardware Controls */}
        {/* Large Circular Black Button */}
        <circle
          cx="60"
          cy="392"
          r="16"
          fill="#1E293B"
          stroke="#18181B"
          strokeWidth="4.5"
          className="cursor-pointer hover:brightness-125 active:scale-95 transition-transform"
          onClick={handlePrev}
        />

        {/* Two Horizontal Pill Buttons (Red & Cyan) */}
        <rect
          x="100"
          y="378"
          width="32"
          height="9"
          rx="4.5"
          fill="#DC2626"
          stroke="#18181B"
          strokeWidth="2.5"
          className="cursor-pointer hover:brightness-110 active:scale-95 transition-transform"
          onClick={handlePrev}
        />
        <rect
          x="142"
          y="378"
          width="32"
          height="9"
          rx="4.5"
          fill="#00A8E8"
          stroke="#18181B"
          strokeWidth="2.5"
          className="cursor-pointer hover:brightness-110 active:scale-95 transition-transform"
          onClick={handleNext}
        />

        {/* Green Rectangular Key / Secondary LCD */}
        <g className="cursor-pointer" onClick={handleNext}>
          <rect
            x="96"
            y="402"
            width="82"
            height="40"
            rx="5"
            fill="#22C55E"
            stroke="#18181B"
            strokeWidth="3.5"
            className="hover:brightness-110 active:scale-95 transition-transform"
          />
          <text
            x="137"
            y="426"
            textAnchor="middle"
            fill="#064E3B"
            fontFamily="monospace"
            fontSize="10"
            fontWeight="bold"
            letterSpacing="1"
          >
            DATA // NEXT
          </text>
        </g>

        {/* Black D-Pad Cross */}
        <g className="cursor-pointer" onClick={handleNext}>
          {/* Vertical Bar */}
          <rect
            x="238"
            y="374"
            width="22"
            height="62"
            rx="4"
            fill="#1E293B"
            stroke="#18181B"
            strokeWidth="4"
          />
          {/* Horizontal Bar */}
          <rect
            x="218"
            y="394"
            width="62"
            height="22"
            rx="4"
            fill="#1E293B"
            stroke="#18181B"
            strokeWidth="4"
          />
          {/* Center Indent */}
          <circle cx="249" cy="405" r="5" fill="#0F172A" />
        </g>
      </svg>
    </div>
  );
}
