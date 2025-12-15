import React from 'react';

interface StatusChipProps {
  status: 'detecting' | 'active' | 'warning' | 'error' | 'idle';
  label: string;
  animated?: boolean;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, label, animated = true }) => {
  const statusColors = {
    detecting: 'bg-velocity-lime/20 text-velocity-lime border-velocity-lime/50',
    active: 'bg-velocity-cyan/20 text-velocity-cyan border-velocity-cyan/50',
    warning: 'bg-velocity-warning/20 text-velocity-warning border-velocity-warning/50',
    error: 'bg-velocity-danger/20 text-velocity-danger border-velocity-danger/50',
    idle: 'bg-velocity-graphite/50 text-velocity-white border-velocity-blue/30',
  };

  return (
    <div
      className={`
        px-3 py-1.5 rounded-full text-sm font-mono border
        ${statusColors[status]}
        ${animated && (status === 'detecting' || status === 'active') ? 'animate-cyan-pulse' : ''}
      `}
    >
      {label}
    </div>
  );
};
