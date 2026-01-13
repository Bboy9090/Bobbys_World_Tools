/**
 * Room Transition Animation
 * 
 * Smooth UI transition when entering secret room.
 */

import React, { useEffect, useState } from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomTransitionProps {
  roomName: string;
  onComplete: () => void;
}

export function RoomTransition({ roomName, onComplete }: RoomTransitionProps) {
  const [phase, setPhase] = useState<'handshake' | 'loading' | 'complete'>('handshake');

  useEffect(() => {
    // Phase 1: Secure handshake (1 second)
    const handshakeTimer = setTimeout(() => {
      setPhase('loading');
    }, 1000);

    // Phase 2: Loading (1 second)
    const loadingTimer = setTimeout(() => {
      setPhase('complete');
    }, 2000);

    // Phase 3: Complete and transition
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(handshakeTimer);
      clearTimeout(loadingTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-drawer-hidden flex items-center justify-center z-50">
      <div className="text-center space-y-6">
        {phase === 'handshake' && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-spray-magenta/50 bg-spray-magenta/20 animate-pulse">
              <Lock className="w-10 h-10 text-spray-magenta" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ink-primary mb-2">Secure Handshake</h2>
              <p className="text-sm text-ink-muted">Establishing secure connection...</p>
            </div>
          </>
        )}

        {phase === 'loading' && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-spray-cyan/50 bg-spray-cyan/20">
              <div className="w-10 h-10 border-2 border-spray-cyan border-t-transparent rounded-full animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ink-primary mb-2">Loading {roomName}</h2>
              <p className="text-sm text-ink-muted">Initializing room...</p>
            </div>
          </>
        )}

        {phase === 'complete' && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-state-ready/50 bg-state-ready/20">
              <CheckCircle2 className="w-10 h-10 text-state-ready" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ink-primary mb-2">Access Granted</h2>
              <p className="text-sm text-ink-muted">Entering {roomName}...</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
