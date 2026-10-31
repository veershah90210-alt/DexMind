import React from 'react';

/**
 * Authentic Poké Ball SVG Component - Solid Minimalist Vector Edition
 * Variants:
 *  - 'standard' (Classic Red & White)
 *  - 'ultra' (Black, Gold & White)
 *  - 'great' (Blue, Red accents & White)
 *  - 'master' (Purple, Pink accents & White)
 *  - 'watermark' (Subtle monochromatic transparent silhouette for backgrounds)
 *  - 'gold' (Solid Electric Yellow / Gold badge)
 */
export default function PokeBall({
  variant = 'standard',
  size = 24,
  className = '',
}) {
  if (variant === 'watermark') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`pointer-events-none select-none ${className}`}
      >
        <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="5" opacity="0.12" />
        <line x1="4" y1="50" x2="35" y2="50" stroke="currentColor" strokeWidth="5" opacity="0.12" />
        <line x1="65" y1="50" x2="96" y2="50" stroke="currentColor" strokeWidth="5" opacity="0.12" />
        <circle cx="50" cy="50" r="16" stroke="currentColor" strokeWidth="5" opacity="0.12" />
        <circle cx="50" cy="50" r="7" stroke="currentColor" strokeWidth="3" opacity="0.2" />
      </svg>
    );
  }

  if (variant === 'gold') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`select-none ${className}`}
      >
        <circle cx="50" cy="50" r="47" fill="#0A0F1D" stroke="#EAB308" strokeWidth="3" />
        {/* Top Half */}
        <path d="M 6,50 A 44,44 0 0,1 94,50 Z" fill="#FACC15" />
        {/* Bottom Half */}
        <path d="M 6,50 A 44,44 0 0,0 94,50 Z" fill="#1E293B" />
        {/* Center Divider */}
        <rect x="4" y="46" width="92" height="8" fill="#0A0F1D" />
        {/* Outer Ring */}
        <circle cx="50" cy="50" r="16" fill="#0A0F1D" stroke="#EAB308" strokeWidth="2.5" />
        {/* Inner Button */}
        <circle cx="50" cy="50" r="7.5" fill="#FEF08A" />
      </svg>
    );
  }

  if (variant === 'great') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`select-none ${className}`}
      >
        <circle cx="50" cy="50" r="47" fill="#18181B" stroke="#09090B" strokeWidth="3" />
        {/* Top Half */}
        <path d="M 6,50 A 44,44 0 0,1 94,50 Z" fill="#2563EB" />
        {/* Red Wings */}
        <path d="M 22,20 L 32,50 L 16,50 Z" fill="#DC2626" />
        <path d="M 78,20 L 68,50 L 84,50 Z" fill="#DC2626" />
        {/* Bottom Half */}
        <path d="M 6,50 A 44,44 0 0,0 94,50 Z" fill="#F8FAFC" />
        {/* Center Divider */}
        <rect x="4" y="46" width="92" height="8" fill="#09090B" />
        {/* Outer Ring */}
        <circle cx="50" cy="50" r="16" fill="#09090B" />
        {/* Inner Button */}
        <circle cx="50" cy="50" r="7.5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
      </svg>
    );
  }

  if (variant === 'ultra') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`select-none ${className}`}
      >
        <circle cx="50" cy="50" r="47" fill="#18181B" stroke="#09090B" strokeWidth="3" />
        {/* Top Half */}
        <path d="M 6,50 A 44,44 0 0,1 94,50 Z" fill="#18181B" />
        {/* Yellow H-stripes */}
        <path d="M 25,12 A 44,44 0 0,1 75,12 L 68,26 A 32,32 0 0,0 32,26 Z" fill="#FACC15" />
        <rect x="24" y="24" width="8" height="26" fill="#FACC15" />
        <rect x="68" y="24" width="8" height="26" fill="#FACC15" />
        {/* Bottom Half */}
        <path d="M 6,50 A 44,44 0 0,0 94,50 Z" fill="#F8FAFC" />
        {/* Center Divider */}
        <rect x="4" y="46" width="92" height="8" fill="#09090B" />
        {/* Outer Ring */}
        <circle cx="50" cy="50" r="16" fill="#09090B" />
        {/* Inner Button */}
        <circle cx="50" cy="50" r="7.5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
      </svg>
    );
  }

  // Default Standard Poké Ball - Solid Colors
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
    >
      <circle cx="50" cy="50" r="47" fill="#0F172A" stroke="#0F172A" strokeWidth="3" />
      {/* Top Dome (Solid Red) */}
      <path d="M 6,50 A 44,44 0 0,1 94,50 Z" fill="#EF4444" />
      {/* Bottom Dome (Solid White) */}
      <path d="M 6,50 A 44,44 0 0,0 94,50 Z" fill="#F8FAFC" />
      {/* Center Black Seam */}
      <rect x="4" y="46" width="92" height="8" fill="#0F172A" />
      {/* Outer Button Ring */}
      <circle cx="50" cy="50" r="15" fill="#0F172A" />
      {/* Inner Push Button */}
      <circle cx="50" cy="50" r="7.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
    </svg>
  );
}
