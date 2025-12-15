/**
 * GrimoireCard Component
 * 
 * Cinematic card component styled as pages from an ancient digital grimoire.
 * Features dynamic glow effects and module-specific theming.
 */

import type { ReactNode } from 'react';

interface GrimoireCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  theme?: 'default' | 'codex' | 'zeus' | 'hades' | 'phoenix';
  icon?: ReactNode;
  onClick?: () => void;
  className?: string;
  hoverable?: boolean;
}

/**
 * Theme configurations
 */
const cardThemes = {
  default: {
    border: 'border-grimoire-electric-blue/30',
    hoverBorder: 'hover:border-grimoire-electric-blue/60',
    glow: 'hover:shadow-glow-blue',
    accent: 'text-grimoire-electric-blue',
  },
  codex: {
    border: 'border-grimoire-electric-blue/30',
    hoverBorder: 'hover:border-grimoire-electric-blue/60',
    glow: 'hover:shadow-glow-blue',
    accent: 'text-grimoire-neon-cyan',
  },
  zeus: {
    border: 'border-grimoire-thunder-gold/30',
    hoverBorder: 'hover:border-grimoire-thunder-gold/60',
    glow: 'hover:shadow-glow-gold',
    accent: 'text-grimoire-thunder-gold',
  },
  hades: {
    border: 'border-grimoire-abyss-purple/30',
    hoverBorder: 'hover:border-grimoire-abyss-purple/60',
    glow: 'hover:shadow-glow-purple',
    accent: 'text-grimoire-abyss-purple',
  },
  phoenix: {
    border: 'border-grimoire-phoenix-orange/30',
    hoverBorder: 'hover:border-grimoire-phoenix-orange/60',
    glow: 'hover:shadow-glow-orange',
    accent: 'text-grimoire-phoenix-orange',
  },
};

/**
 * GrimoireCard Component
 */
export function GrimoireCard({
  children,
  title,
  subtitle,
  theme = 'default',
  icon,
  onClick,
  className = '',
  hoverable = true,
}: GrimoireCardProps) {
  const styles = cardThemes[theme];
  
  const cardClasses = `
    grimoire-card
    ${styles.border}
    ${hoverable ? styles.hoverBorder : ''}
    ${hoverable ? styles.glow : ''}
    p-5
    transition-all
    duration-300
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  return (
    <div className={cardClasses} onClick={onClick}>
      {(title || icon) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {title && (
              <h4 className={`
                text-lg 
                font-grimoire 
                font-semibold 
                ${styles.accent}
                mb-1
              `}>
                {title}
              </h4>
            )}
            {subtitle && (
              <p className="text-sm text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
          {icon && (
            <div className={`ml-3 ${styles.accent}`}>
              {icon}
            </div>
          )}
        </div>
      )}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
