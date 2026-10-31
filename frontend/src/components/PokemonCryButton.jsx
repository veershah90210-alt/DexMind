import React, { useState, useRef } from 'react';
import { Volume2 } from 'lucide-react';

/**
 * Authentic Pokémon Cry Audio Playback Key
 * - Pokédex slate button with Pikachu Yellow (#FFCB05) acoustic pulse
 * - Official PokeAPI cry audio streaming
 */
export default function PokemonCryButton({
  pokemonId,
  size = 'sm',
  className = '',
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemonId}.ogg`;

  const handlePlay = (e) => {
    e.stopPropagation();
    if (!pokemonId) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(cryUrl);
    audioRef.current = audio;

    audio.volume = 0.55;
    setIsPlaying(true);

    audio.play().catch((err) => {
      console.warn(`Failed to play cry for Pokémon #${pokemonId}:`, err);
      setIsPlaying(false);
    });

    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
  };

  const isSmall = size === 'sm';

  return (
    <button
      type="button"
      onClick={handlePlay}
      title={`Play Official Pokémon #${pokemonId} Cry Audio`}
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider rounded-[4px] border transition-all cursor-pointer select-none ${
        isPlaying
          ? 'bg-gradient-to-b from-[#ca8a04] to-[#a16207] text-[#0f172a] border-t-[#fef08a] border-l-[#fef08a] border-r-[#854d0e] border-b-[#713f12] shadow-[0_0_10px_rgba(255,203,5,0.6)] translate-y-0.5'
          : 'bg-gradient-to-b from-[#1e293b] to-[#0f172a] text-[#ffcb05] hover:text-[#ffffff] hover:-translate-y-0.5 border-t-[#475569] border-l-[#475569] border-r-[#0f172a] border-b-[#090d15] shadow-[0_2px_4px_rgba(0,0,0,0.4)]'
      } ${isSmall ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full transition-all ${
          isPlaying
            ? 'bg-[#ffffff] shadow-[0_0_6px_#ffffff] animate-ping'
            : 'bg-[#ffcb05] shadow-[0_0_4px_rgba(255,203,5,0.8)]'
        }`}
      />
      <Volume2 className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${isPlaying ? 'text-[#0f172a]' : 'text-[#ffcb05]'}`} />
      <span className="font-bold">{isPlaying ? 'PLAYING' : 'CRY'}</span>
    </button>
  );
}
