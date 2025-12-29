/**
 * WorkbenchSecretRooms
 * 
 * Trapdoor entry gate + room navigation + room workbenches
 */

import React, { useState } from 'react';
import { TrapdoorEntryGate } from '../trapdoor/TrapdoorEntryGate';
import { TrapdoorRoomNavigation, type SecretRoomId } from '../trapdoor/TrapdoorRoomNavigation';
import { TrapdoorUnlockChamber } from '../trapdoor/TrapdoorUnlockChamber';
import { TrapdoorShadowArchive } from '../trapdoor/TrapdoorShadowArchive';

export function WorkbenchSecretRooms() {
  const [passcode, setPasscode] = useState<string | null>(null);
  const [activeRoom, setActiveRoom] = useState<SecretRoomId | null>(null);

  const handleUnlock = (enteredPasscode: string) => {
    setPasscode(enteredPasscode);
    // Default to Unlock Chamber
    setActiveRoom('unlock-chamber');
  };

  const handleCancel = () => {
    setPasscode(null);
    setActiveRoom(null);
  };

  // Show gate if not unlocked
  if (!passcode) {
    return <TrapdoorEntryGate onUnlock={handleUnlock} onCancel={handleCancel} />;
  }

  // Show rooms interface
  return (
    <div className="h-full flex bg-basement-concrete">
      <TrapdoorRoomNavigation
        activeRoom={activeRoom || undefined}
        onSelectRoom={setActiveRoom}
      />
      
      <div className="flex-1 overflow-hidden">
        {activeRoom === 'unlock-chamber' && (
          <TrapdoorUnlockChamber
            passcode={passcode}
            devices={[]} // TODO: Wire up real devices
          />
        )}
        {activeRoom === 'shadow-archive' && (
          <TrapdoorShadowArchive passcode={passcode} />
        )}
        {activeRoom && activeRoom !== 'unlock-chamber' && activeRoom !== 'shadow-archive' && (
          <div className="h-full flex items-center justify-center text-ink-muted">
            <p className="text-sm font-mono">
              {activeRoom} — Coming soon
            </p>
          </div>
        )}
        {!activeRoom && (
          <div className="h-full flex items-center justify-center text-ink-muted">
            <p className="text-sm font-mono">
              Select a room from the navigation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
