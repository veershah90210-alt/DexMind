import React from 'react';

/**
 * Authentic Pokémon Stat Gauge Meter
 * - Canonical Pokémon stat colors (HP Green, Atk Red, Def Blue, SpA Magenta, SpD Cyan, Spe Yellow)
 * - Recessed dark instrument track with high-visibility illuminated segments
 * - IBM Plex Mono numerical telemetry readout
 */
export default function SegmentedLedMeter({
  label,
  value = 0,
  max = 255,
  segments = 16,
  color,
  suffix = '',
  icon: Icon,
  className = '',
  _onField = true,
}) {
  const numericValue = typeof value === 'number' ? value : Number(value) || 0;
  const clamped = Math.max(0, Math.min(numericValue, max));
  const activeCount = Math.round((clamped / max) * segments);

  // Canonical Pokémon stat color map
  const getStatColor = (lbl) => {
    const l = (lbl || '').toLowerCase();
    if (l.includes('hp')) return '#22c55e'; // Emerald HP Green
    if (l.includes('attack') || l.includes('atk')) return '#ef4444'; // Crimson Atk Red
    if (l.includes('defense') || l.includes('def')) return '#3b82f6'; // Royal Def Blue
    if (l.includes('speed') || l.includes('spe')) return '#ffcb05'; // Pikachu Lightning Yellow
    return '#00b4d8'; // Sensor Cyan default
  };

  const activeColor = color || getStatColor(label);

  return (
    <div className={`flex flex-col gap-1.5 font-mono ${className}`}>
      {/* Label and Monospace Numeric Readout */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className="w-3.5 h-3.5" style={{ color: activeColor }} />}
          <span className="uppercase text-[11px] font-bold tracking-wider text-[#94a3b8]">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-bold text-xs text-[#f8fafc]">
            {clamped}{suffix}
          </span>
          <span className="text-[10px] text-[#64748b]">
            /{max}{suffix}
          </span>
        </div>
      </div>

      {/* Recessed Pokémon Segmented LED Track */}
      <div className="flex gap-[3px] h-[6px] w-full bg-[#090d14] p-[1.5px] border border-[#1e293b] rounded-[2px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
        {Array.from({ length: segments }).map((_, index) => {
          const isActive = index < activeCount;
          return (
            <div
              key={index}
              className="flex-1 h-full rounded-[1px] transition-colors duration-100"
              style={{
                backgroundColor: isActive ? activeColor : '#162032',
                boxShadow: isActive ? `0 0 5px ${activeColor}99` : 'none',
                opacity: isActive ? 1 : 0.3,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
