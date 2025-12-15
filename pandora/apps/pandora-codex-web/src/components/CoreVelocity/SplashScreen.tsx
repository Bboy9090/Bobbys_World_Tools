import React, { useEffect, useState } from 'react';

interface VelocitySplashProps {
  onComplete?: () => void;
  minDuration?: number;
}

export const VelocitySplash: React.FC<VelocitySplashProps> = ({ onComplete, minDuration = 2500 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-velocity-black flex items-center justify-center z-50 overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-b from-velocity-blue via-transparent to-velocity-cyan animate-pulse" />
      </div>

      {/* Velocity rings (concentric circles) */}
      <div className="relative w-48 h-48">
        {[1, 2, 3].map((ring) => (
          <div
            key={ring}
            className={`absolute inset-0 border border-velocity-blue/${30 * ring} rounded-full animate-velocity-ring`}
            style={{
              animation: `velocity-ring ${2 + ring * 0.5}s ease-out infinite`,
              animationDelay: `${ring * 0.2}s`,
            }}
          />
        ))}

        {/* Core logo area */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl font-bold text-velocity-blue mb-4 animate-velocity-pulse">
              ◈
            </div>
            <h1 className="text-3xl font-inter font-bold text-velocity-white mb-2">
              PANDORA
            </h1>
            <p className="text-sm text-velocity-cyan font-mono">
              CORE VELOCITY
            </p>
          </div>
        </div>

        {/* Horizontal velocity pulse */}
        <div
          className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-velocity-cyan to-transparent animate-velocity-shimmer"
          style={{
            animation: 'velocity-shimmer 2s ease-in-out infinite',
          }}
        />
      </div>

      {/* Tagline */}
      <div className="absolute bottom-20 text-center">
        <p className="text-velocity-cyan font-mono text-sm tracking-widest">
          PRECISION AT THE SPEED OF POWER
        </p>
      </div>

      {/* Loading indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-velocity-cyan rounded-full animate-cyan-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
