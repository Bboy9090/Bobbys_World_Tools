import { useEffect, useState } from 'react';

interface LoadingOverlayProps {
  message?: string;
  variant?: 'default' | 'android' | 'ios' | 'device';
}

export function LoadingOverlay({ 
  message = 'Loading...', 
  variant = 'default' 
}: LoadingOverlayProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const renderIcon = () => {
    switch (variant) {
      case 'android':
        return (
          <svg className="w-24 h-24 text-grimoire-electric-blue" viewBox="0 0 100 100" fill="none">
            <g className="animate-pulse">
              <rect x="30" y="20" width="10" height="30" rx="5" fill="currentColor" />
              <rect x="60" y="20" width="10" height="30" rx="5" fill="currentColor" />
              <rect x="20" y="50" width="60" height="40" rx="10" fill="currentColor" opacity="0.6" />
              <circle cx="40" cy="35" r="3" fill="white" />
              <circle cx="60" cy="35" r="3" fill="white" />
            </g>
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
          </svg>
        );
      case 'ios':
        return (
          <svg className="w-24 h-24 text-grimoire-abyss-purple" viewBox="0 0 100 100" fill="none">
            <path
              d="M50 10 L70 50 L90 50 L60 70 L70 90 L50 75 L30 90 L40 70 L10 50 L30 50 Z"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className="drop-shadow-glow-purple"
            />
            <animate attributeName="stroke-dasharray" values="0,300;300,0" dur="3s" repeatCount="indefinite" />
          </svg>
        );
      case 'device':
        return (
          <svg className="w-24 h-24 text-grimoire-neon-cyan" viewBox="0 0 100 100" fill="none">
            <rect x="25" y="10" width="50" height="80" rx="8" stroke="currentColor" strokeWidth="3" fill="none" />
            <circle cx="50" cy="80" r="5" fill="currentColor" className="animate-ping" />
            <line x1="35" y1="20" x2="65" y2="20" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      default:
        return (
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-grimoire-electric-blue/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-grimoire-electric-blue border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-4 border-4 border-grimoire-thunder-gold/20 rounded-full" />
            <div className="absolute inset-4 border-4 border-grimoire-thunder-gold border-r-transparent rounded-full animate-spin-slow" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        {renderIcon()}
        <div className="flex flex-col items-center gap-2">
          <p className="font-tech text-grimoire-electric-blue text-sm tracking-wider">
            {message}{dots}
          </p>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-grimoire-electric-blue animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-grimoire-thunder-gold animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-grimoire-abyss-purple animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
