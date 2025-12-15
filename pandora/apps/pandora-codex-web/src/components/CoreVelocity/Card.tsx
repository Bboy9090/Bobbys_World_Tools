import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'dark' | 'accent';
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-velocity-graphite border border-velocity-blue/30 shadow-lg',
    dark: 'bg-velocity-black border border-velocity-cyan/20 shadow-cyan-glow/10',
    accent: 'bg-gradient-to-br from-velocity-graphite to-velocity-black border border-velocity-blue/50',
  };

  return (
    <div className={`${variants[variant]} rounded-lg p-6 ${className}`}>
      {children}
    </div>
  );
};
