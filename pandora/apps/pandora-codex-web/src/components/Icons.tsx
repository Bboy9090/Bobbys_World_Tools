/**
 * Icon Components for Pandora's Codex
 * 
 * SVG-based icon set featuring:
 * - Titan silhouettes
 * - Lightning glyphs (Zeus)
 * - Cracked stone (Hades)
 * - Phoenix feather
 * - Neon glyphs
 */

import type { CSSProperties } from 'react';

interface IconProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Lightning Bolt Icon (Zeus Forge)
 */
export function LightningIcon({ size = 24, className = '', style }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      className={className}
      style={style}
    >
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  );
}

/**
 * Cracked Stone Icon (Hades Gate)
 */
export function CrackedStoneIcon({ size = 24, className = '', style }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9 L21 9" />
      <path d="M9 3 L9 21" />
      <path d="M12 9 L12 21" />
      <path d="M15 3 L15 21" />
      <path d="M3 15 L21 15" />
      <path d="M6 3 L18 21" />
    </svg>
  );
}

/**
 * Phoenix Feather Icon
 */
export function PhoenixFeatherIcon({ size = 24, className = '', style }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      className={className}
      style={style}
    >
      <path d="M12 2c-1.5 3-2 6-2 9 0 2 .5 4 2 5v6l-1-1c-2-2-4-5-4-9 0-4 1.5-8 5-10zm0 0c1.5 3 2 6 2 9 0 2-.5 4-2 5m0-14c3.5 2 5 6 5 10 0 4-2 7-4 9l-1 1" />
    </svg>
  );
}

/**
 * Titan Silhouette Icon
 */
export function TitanIcon({ size = 24, className = '', style }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      className={className}
      style={style}
    >
      <circle cx="12" cy="6" r="3" />
      <path d="M12 10c-4 0-7 2-7 5v7h3v-6h2v6h4v-6h2v6h3v-7c0-3-3-5-7-5z" />
    </svg>
  );
}

/**
 * Neon Glyph Icon (Codex Link Layer)
 */
export function NeonGlyphIcon({ size = 24, className = '', style }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`neon-glyph ${className}`}
      style={style}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M3 12h18" />
      <circle cx="12" cy="12" r="3" />
      <path d="M16.2 7.8l-8.4 8.4M7.8 7.8l8.4 8.4" />
    </svg>
  );
}

/**
 * Chain Icon (for Hades Gate breaking chains effect)
 */
export function ChainIcon({ size = 24, className = '', style }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <rect x="2" y="7" width="6" height="10" rx="2" />
      <rect x="16" y="7" width="6" height="10" rx="2" />
      <path d="M8 12h8" />
    </svg>
  );
}

/**
 * Smoke/Abyss Icon
 */
export function SmokeIcon({ size = 24, className = '', style }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      className={className}
      style={style}
    >
      <path d="M12 2C9 2 7 4 7 7c0 2 1 3 2 4-2 0-4 2-4 5s2 5 4 5h10c2 0 4-2 4-5s-2-5-4-5c1-1 2-2 2-4 0-3-2-5-5-5z" opacity="0.7" />
      <path d="M8 12c-1.5 0-3 1.5-3 3.5S6.5 19 8 19h8c1.5 0 3-1.5 3-3.5S17.5 12 16 12H8z" opacity="0.5" />
    </svg>
  );
}

/**
 * Unlock/Codex Icon
 */
export function UnlockIcon({ size = 24, className = '', style }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}
