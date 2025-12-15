/**
 * StormstrikeButton Component
 * 
 * Dynamic action button with cinematic effects for commanding operations.
 * Features lightning strike animations, glow effects, and module-specific theming.
 */

import type { ReactNode } from 'react';

interface StormstrikeButtonProps {
  children: ReactNode;
  onClick?: () => void;
  theme?: 'codex' | 'zeus' | 'hades' | 'phoenix' | 'default';
  icon?: ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Theme configurations for buttons
 */
const buttonThemes = {
  default: {
    base: 'bg-gradient-to-r from-grimoire-electric-blue to-blue-500',
    hover: 'hover:from-grimoire-electric-blue hover:to-blue-400',
    glow: 'shadow-glow-blue',
    text: 'text-white',
  },
  codex: {
    base: 'bg-gradient-to-r from-grimoire-electric-blue to-grimoire-neon-cyan',
    hover: 'hover:from-grimoire-neon-cyan hover:to-grimoire-electric-blue',
    glow: 'shadow-glow-blue',
    text: 'text-grimoire-obsidian',
  },
  zeus: {
    base: 'bg-gradient-to-r from-grimoire-thunder-gold to-yellow-400',
    hover: 'hover:from-yellow-400 hover:to-grimoire-thunder-gold',
    glow: 'shadow-glow-gold',
    text: 'text-grimoire-obsidian',
  },
  hades: {
    base: 'bg-gradient-to-r from-grimoire-abyss-purple to-purple-500',
    hover: 'hover:from-purple-500 hover:to-grimoire-abyss-purple',
    glow: 'shadow-glow-purple',
    text: 'text-white',
  },
  phoenix: {
    base: 'bg-gradient-to-r from-grimoire-phoenix-orange to-orange-500',
    hover: 'hover:from-orange-500 hover:to-grimoire-phoenix-orange',
    glow: 'shadow-glow-orange',
    text: 'text-white',
  },
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

/**
 * StormstrikeButton Component
 */
export function StormstrikeButton({
  children,
  onClick,
  theme = 'default',
  icon,
  disabled = false,
  size = 'md',
  className = '',
}: StormstrikeButtonProps) {
  const styles = buttonThemes[theme];
  const sizeClass = sizeStyles[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative
        group
        overflow-hidden
        ${styles.base}
        ${styles.hover}
        ${styles.glow}
        ${styles.text}
        ${sizeClass}
        font-tech
        font-bold
        rounded-lg
        transition-all
        duration-300
        disabled:opacity-50
        disabled:cursor-not-allowed
        hover:scale-105
        active:scale-95
        flex
        items-center
        gap-2
        justify-center
        ${className}
      `}
    >
      {/* Lightning strike effect overlay */}
      <span 
        className="
          absolute 
          inset-0 
          bg-gradient-to-r 
          from-transparent 
          via-white/30 
          to-transparent 
          -translate-x-full
          group-hover:translate-x-full
          transition-transform
          duration-500
        "
        style={{
          transform: 'skewX(-20deg)',
        }}
      />
      
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {icon && <span className="inline-block">{icon}</span>}
        {children}
      </span>
    </button>
  );
}
