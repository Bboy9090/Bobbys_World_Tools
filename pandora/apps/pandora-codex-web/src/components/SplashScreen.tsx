import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

export function SplashScreen({ onComplete, minDuration = 2000 }: SplashScreenProps) {
  const [opacity, setOpacity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(0);
      setTimeout(onComplete, 500);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-grimoire-obsidian transition-opacity duration-500"
      style={{ opacity }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {!imageError ? (
          <img 
            src="/splash-screen.png"
            alt="Pandora's Codex"
            className={`w-full h-full object-cover animate-pulse-slow ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="text-6xl font-grimoire text-grimoire-electric-blue animate-pulse">
              ⚡ The Pandora Codex ⚡
            </div>
            <div className="text-xl font-tech text-grimoire-neon-cyan">
              Ancient Secrets. Modern Power.
            </div>
          </div>
        )}
        
        <div className="absolute bottom-24 left-0 right-0 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-grimoire-electric-blue animate-ping" />
          <span className="font-tech text-xs text-grimoire-electric-blue/80 tracking-wider">
            Initializing Tether Scryer
          </span>
        </div>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.95;
          }
          50% {
            opacity: 1;
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
