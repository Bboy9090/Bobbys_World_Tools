/**
 * ScrollPanel Component
 * 
 * Ancient scroll-styled reusable panel component for Pandora's Codex.
 * Features a grimoire-inspired design with customizable theme colors.
 */

import type { ReactNode } from 'react';

interface ScrollPanelProps {
  children: ReactNode;
  title?: string;
  theme?: 'default' | 'codex' | 'zeus' | 'hades' | 'phoenix';
  className?: string;
}

/**
 * Theme configurations for different modules
 */
const themeStyles = {
  default: {
    border: 'border-grimoire-electric-blue/30',
    glow: 'shadow-glow-blue',
    text: 'text-grimoire-electric-blue',
  },
  codex: {
    border: 'border-grimoire-electric-blue/40',
    glow: 'shadow-glow-blue',
    text: 'text-grimoire-electric-blue',
  },
  zeus: {
    border: 'border-grimoire-thunder-gold/40',
    glow: 'shadow-glow-gold',
    text: 'text-grimoire-thunder-gold',
  },
  hades: {
    border: 'border-grimoire-abyss-purple/40',
    glow: 'shadow-glow-purple',
    text: 'text-grimoire-abyss-purple',
  },
  phoenix: {
    border: 'border-grimoire-phoenix-orange/40',
    glow: 'shadow-glow-orange',
    text: 'text-grimoire-phoenix-orange',
  },
};

/**
 * ScrollPanel Component
 */
export function ScrollPanel({ 
  children, 
  title, 
  theme = 'default',
  className = '' 
}: ScrollPanelProps) {
  const styles = themeStyles[theme];

  return (
    <div 
      className={`
        scroll-panel
        ${styles.border}
        hover:${styles.glow}
        p-6 
        transition-all 
        duration-300
        ${className}
      `}
    >
      {title && (
        <div className="mb-4 pb-3 border-b border-current/20">
          <h3 className={`
            text-xl 
            font-grimoire 
            font-semibold 
            ${styles.text}
            tracking-wide
          `}>
            {title}
          </h3>
        </div>
      )}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
