import React from 'react';

interface TerminalProps {
  lines: string[];
  className?: string;
}

export const Terminal: React.FC<TerminalProps> = ({ lines, className = '' }) => {
  return (
    <div className={`
      bg-velocity-black border border-velocity-cyan/30 rounded-lg p-4
      font-mono text-sm text-velocity-cyan overflow-y-auto max-h-96
      bg-scanlines relative
      ${className}
    `}>
      {lines.map((line, i) => (
        <div key={i} className="text-velocity-cyan/90 mb-1">
          <span className="text-velocity-cyan/50">{'>'}</span> {line}
        </div>
      ))}
    </div>
  );
};
