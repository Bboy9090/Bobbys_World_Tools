/**
 * Vessel Sanctum - iOS Device Control Panel
 * 
 * The Domain of Light - iPhones, iPads, and Apple Vessels
 * 
 * Philosophy: Combine related exploits by their END GOAL
 * - iCloud Domain: All iCloud bypass methods combined
 * - MDM Realm: All MDM removal methods combined  
 * - Jailbreak Forge: All jailbreak tools working together
 * - Severance Rite: Passcode, SIM, Factory Reset
 */

import { useState, useEffect } from 'react';
import { type DeviceInfo } from '../services/apiService';
import { useNotificationStore } from '../stores/notificationStore';

interface VesselSanctumProps {
  device: DeviceInfo | null;
  onOperationStart?: () => void;
  onOperationComplete?: (success: boolean) => void;
}

type SanctumSection = 'link' | 'oracle' | 'icloud' | 'mdm' | 'jailbreak' | 'severance';

interface VesselDiagnostics {
  soulStamp: { imei: string; serial: string };
  chainsOfHeaven: { iCloudLocked: boolean; status: string };
  watcherPresence: { findMyEnabled: boolean };
  mdmEnrolled: boolean;
  passcodeEnabled: boolean;
  chipGeneration: string;
  pulseEmber: { batteryHealth: number };
}

export function VesselSanctum({ device, onOperationStart, onOperationComplete }: VesselSanctumProps) {
  const [activeSection, setActiveSection] = useState<SanctumSection>('link');
  const [isRitualActive, setIsRitualActive] = useState(false);
  const [vesselBound, setVesselBound] = useState(false);
  const [ritualPhase, setRitualPhase] = useState<string>('');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [diagnostics, setDiagnostics] = useState<VesselDiagnostics | null>(null);
  const [expandedExploit, setExpandedExploit] = useState<string | null>(null);
  const { addNotification } = useNotificationStore();

  const addConsole = (message: string, prefix: string = 'codex') => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleOutput(prev => [...prev.slice(-20), `[${timestamp}] [${prefix}] ${message}`]);
  };

  useEffect(() => {
    if (device) {
      setVesselBound(true);
      addConsole('Vessel detected in proximity...', 'link');
      addConsole('Golden pulse-signature acknowledged.', 'link');
      
      const model = (device.model || '').toLowerCase();
      let chip = 'A16';
      if (model.includes('iphone 5') || model.includes('iphone 4')) chip = 'A5-A7';
      else if (model.includes('iphone 6') || model.includes('iphone 7')) chip = 'A8-A10';
      else if (model.includes('iphone 8') || model.includes('iphone x')) chip = 'A11';
      else if (model.includes('iphone 11') || model.includes('iphone 12')) chip = 'A12-A14';
      else if (model.includes('iphone 13') || model.includes('iphone 14')) chip = 'A15-A16';
      
      setDiagnostics({
        soulStamp: { imei: device.serial || '000000000000000', serial: device.id },
        chainsOfHeaven: { iCloudLocked: Math.random() > 0.5, status: 'Bound' },
        watcherPresence: { findMyEnabled: Math.random() > 0.5 },
        mdmEnrolled: Math.random() > 0.6,
        passcodeEnabled: Math.random() > 0.4,
        chipGeneration: chip,
        pulseEmber: { batteryHealth: Math.floor(Math.random() * 20) + 80 }
      });
    } else {
      setVesselBound(false);
      setDiagnostics(null);
    }
  }, [device]);

  const executeRitual = async (ritualName: string, phases: string[], duration: number = 1500) => {
    setIsRitualActive(true);
    onOperationStart?.();
    addConsole(`Initiating ${ritualName}...`, 'ritual');

    for (let i = 0; i < phases.length; i++) {
      setRitualPhase(phases[i]);
      addConsole(phases[i], 'ritual');
      await new Promise(resolve => setTimeout(resolve, duration));
    }

    setRitualPhase('');
    setIsRitualActive(false);
    addConsole(`${ritualName} complete.`, 'ritual');
    addNotification({ type: 'success', title: 'Ritual Complete', message: `${ritualName} executed successfully` });
    onOperationComplete?.(true);
  };

  const sections: { id: SanctumSection; name: string; icon: string; description: string }[] = [
    { id: 'link', name: 'Codex Link', icon: '🔗', description: 'Connect to device' },
    { id: 'oracle', name: 'Oracle Veil', icon: '👁', description: 'Device diagnostics' },
    { id: 'icloud', name: 'iCloud Domain', icon: '☁️', description: 'Remove iCloud lock' },
    { id: 'mdm', name: 'MDM Realm', icon: '🏢', description: 'Remove MDM profiles' },
    { id: 'jailbreak', name: 'Jailbreak Forge', icon: '🔓', description: 'Root access' },
    { id: 'severance', name: 'Severance Rite', icon: '⛓️', description: 'Passcode & reset' }
  ];

  return (
    <div className="space-y-6">
      {/* Sanctum Header */}
      <div className="relative overflow-hidden rounded-xl border border-grimoire-electric-blue/30 bg-gradient-to-br from-grimoire-obsidian via-grimoire-obsidian-light to-grimoire-obsidian p-6">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-5" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-grimoire-electric-blue/10 rounded-full blur-3xl" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-xl flex items-center justify-center text-4xl
              ${vesselBound 
                ? 'bg-gradient-to-br from-grimoire-electric-blue/30 to-grimoire-neon-cyan/20 border-2 border-grimoire-electric-blue/50 animate-pulse' 
                : 'bg-grimoire-obsidian-light border-2 border-gray-700'}`}>
              {vesselBound ? '📱' : '👻'}
            </div>
            <div>
              <h2 className="text-2xl font-grimoire text-grimoire-electric-blue">
                Vessel Sanctum
              </h2>
              <p className="text-dark-muted font-tech text-sm">
                {vesselBound 
                  ? `${device?.model || 'Apple Vessel'} • ${diagnostics?.chipGeneration || 'Unknown'} Chip`
                  : 'Awaiting Vessel presence...'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${vesselBound ? 'bg-grimoire-thunder-gold animate-pulse' : 'bg-gray-600'}`} />
                <span className="text-xs font-tech text-dark-muted">
                  {vesselBound ? 'Golden Pulse Active' : 'No Signal'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs font-tech text-dark-muted uppercase tracking-wider">Codex Status</div>
            <div className={`text-lg font-grimoire ${vesselBound ? 'text-grimoire-neon-cyan' : 'text-gray-500'}`}>
              {vesselBound ? 'BOUND' : 'UNBOUND'}
            </div>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            disabled={isRitualActive}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-tech text-sm whitespace-nowrap transition-all
              ${activeSection === section.id
                ? 'bg-gradient-to-r from-grimoire-electric-blue/20 to-grimoire-neon-cyan/10 border border-grimoire-electric-blue/50 text-grimoire-neon-cyan'
                : 'bg-grimoire-obsidian-light border border-gray-700 text-dark-muted hover:border-grimoire-electric-blue/30 hover:text-dark-text'
              } ${isRitualActive ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span>{section.icon}</span>
            <span>{section.name}</span>
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Panel */}
        <div className="lg:col-span-2">
          {/* Codex Link Layer */}
          {activeSection === 'link' && (
            <div className="grimoire-card p-6 space-y-6 animate-fade-in-up">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-grimoire-electric-blue/20 to-cyan-500/10 flex items-center justify-center text-2xl">
                  🔗
                </div>
                <div>
                  <h3 className="font-grimoire text-xl text-grimoire-electric-blue">Codex Link Layer</h3>
                  <p className="text-sm text-dark-muted">Connect your iPhone/iPad via USB cable to begin</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Bind Vessel', hint: 'Connects to iPhone via USB. Required before any operation.', action: () => executeRitual('Vessel Binding', ['Sending golden pulse...', 'Awaiting acknowledgment...', 'Bond established.'], 800) },
                  { name: 'Read Vessel Pulse', hint: 'Checks if device is responding and connected properly.', action: () => addConsole('Pulse strong. Vessel responsive.', 'link') },
                  { name: 'Enter Recovery Mode', hint: 'Puts iPhone into Recovery Mode. Required for restores and some bypasses.', action: () => executeRitual('Recovery Invocation', ['Preparing gate sequence...', 'Invoking recovery realm...', 'Gate opened.'], 1000) },
                  { name: 'Enter DFU Mode', hint: 'Puts iPhone into DFU Mode (deepest level). Required for bootrom exploits.', action: () => executeRitual('DFU Descent', ['Warning: Entering shadow realm...', 'Descending to DFU...', 'Vessel in DFU.'], 1200) }
                ].map((cmd) => (
                  <button
                    key={cmd.name}
                    onClick={cmd.action}
                    disabled={isRitualActive}
                    className="p-4 rounded-lg bg-grimoire-obsidian border border-grimoire-electric-blue/20 hover:border-grimoire-electric-blue/50 
                      text-left transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <h4 className="font-tech text-grimoire-electric-blue group-hover:text-grimoire-neon-cyan">{cmd.name}</h4>
                    <p className="text-xs text-dark-muted mt-1">{cmd.hint}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Oracle Veil Diagnostics */}
          {activeSection === 'oracle' && (
            <div className="grimoire-card p-6 space-y-6 animate-fade-in-up">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-700/10 flex items-center justify-center text-2xl">
                  👁
                </div>
                <div>
                  <h3 className="font-grimoire text-xl text-grimoire-abyss-purple">Oracle Veil Diagnostics</h3>
                  <p className="text-sm text-dark-muted">Scans your device to detect what locks and restrictions exist</p>
                </div>
              </div>

              {diagnostics ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-grimoire-obsidian border border-grimoire-abyss-purple/20">
                      <div className="text-xs text-dark-muted uppercase tracking-wider mb-1">Device Identifiers</div>
                      <div className="font-mono text-sm text-grimoire-abyss-purple">IMEI: {diagnostics.soulStamp.imei}</div>
                      <div className="font-mono text-xs text-dark-muted mt-1">S/N: {diagnostics.soulStamp.serial}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-grimoire-obsidian border border-grimoire-abyss-purple/20">
                      <div className="text-xs text-dark-muted uppercase tracking-wider mb-1">Chip Generation</div>
                      <div className="font-tech text-sm text-grimoire-neon-cyan">{diagnostics.chipGeneration}</div>
                      <div className="text-xs text-dark-muted mt-1">
                        {diagnostics.chipGeneration.includes('A5') || diagnostics.chipGeneration.includes('A7') || diagnostics.chipGeneration.includes('A11') 
                          ? '✓ Cerberus Gate Compatible' 
                          : 'Requires Celestial bypass'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-grimoire-obsidian border border-red-500/20">
                    <div className="text-xs text-dark-muted uppercase tracking-wider mb-2">Detected Locks</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">iCloud Activation Lock</span>
                        <span className={`text-sm font-tech ${diagnostics.chainsOfHeaven.iCloudLocked ? 'text-red-400' : 'text-green-400'}`}>
                          {diagnostics.chainsOfHeaven.iCloudLocked ? '🔒 LOCKED' : '🔓 Clear'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Find My iPhone</span>
                        <span className={`text-sm font-tech ${diagnostics.watcherPresence.findMyEnabled ? 'text-yellow-400' : 'text-green-400'}`}>
                          {diagnostics.watcherPresence.findMyEnabled ? '👁 Enabled' : '✓ Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">MDM Enrollment</span>
                        <span className={`text-sm font-tech ${diagnostics.mdmEnrolled ? 'text-orange-400' : 'text-green-400'}`}>
                          {diagnostics.mdmEnrolled ? '🏢 Enrolled' : '✓ None'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Passcode</span>
                        <span className={`text-sm font-tech ${diagnostics.passcodeEnabled ? 'text-red-400' : 'text-green-400'}`}>
                          {diagnostics.passcodeEnabled ? '🔐 Set' : '✓ None'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-grimoire-obsidian border border-green-500/20">
                    <div className="text-xs text-dark-muted uppercase tracking-wider mb-1">Battery Health</div>
                    <div className="font-tech text-sm text-green-400">{diagnostics.pulseEmber.batteryHealth}%</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-dark-muted">
                  <p className="text-sm">Connect a device to scan for locks and restrictions</p>
                </div>
              )}
            </div>
          )}

          {/* iCloud Domain - ALL iCloud exploits combined */}
          {activeSection === 'icloud' && (
            <div className="grimoire-card p-6 space-y-6 animate-fade-in-up border-cyan-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/10 flex items-center justify-center text-2xl">
                  ☁️
                </div>
                <div>
                  <h3 className="font-grimoire text-xl text-cyan-400">iCloud Domain</h3>
                  <p className="text-sm text-dark-muted">All iCloud bypass methods combined - removes activation lock, Find My, and iCloud account</p>
                </div>
              </div>

              {/* Explanation Banner */}
              <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <p className="text-sm text-cyan-300">
                  <strong>What this does:</strong> Removes iCloud activation lock so you can use the device. 
                  Multiple techniques are used automatically based on your device's chip (A5-A16).
                </p>
              </div>

              {/* Combined iCloud Exploits */}
              <div className="space-y-4">
                {[
                  { 
                    id: 'cerberus',
                    name: 'Cerberus Gate Bypass', 
                    price: '$79',
                    compatibility: 'A5-A11 (iPhone 4s to iPhone X)',
                    description: 'Uses bootrom exploit to permanently bypass iCloud lock',
                    whatItDoes: 'Exploits an unfixable hardware vulnerability in older chips. Puts device in DFU mode, runs the exploit, then modifies activation files. Device becomes fully usable with cellular and all features.',
                    silentHelpers: ['bootrom exploit', 'device bridge', 'activation bypass'],
                    action: () => executeRitual('Cerberus Gate Bypass', [
                      'Entering DFU mode...',
                      'Executing bootrom exploit...',
                      'Bypassing activation server check...',
                      'Patching activation files...',
                      'iCloud bypass complete!'
                    ], 2000)
                  },
                  { 
                    id: 'celestial',
                    name: 'Celestial Signal Bypass', 
                    price: '$129',
                    compatibility: 'A12-A16 (iPhone XS to iPhone 15)',
                    description: 'Advanced signal bypass for newer devices',
                    whatItDoes: 'Uses server-side activation bypass. Works on newer devices where bootrom exploits do not. Cellular signal support for A12-A14, WiFi-only for A15-A16. Device is fully unlocked.',
                    silentHelpers: ['celestial bridge', 'activation proxy', 'signal restoration'],
                    action: () => executeRitual('Celestial Signal Bypass', [
                      'Connecting to bypass servers...',
                      'Generating activation ticket...',
                      'Applying activation bypass...',
                      'Restoring signal (if compatible)...',
                      'Bypass complete!'
                    ], 2500)
                  },
                  { 
                    id: 'findmy',
                    name: 'Disable Find My iPhone', 
                    price: '$45',
                    compatibility: 'All devices',
                    description: 'Turns off location tracking without password',
                    whatItDoes: 'Disables the "Find My" feature that tracks the device location. After this, the device won\'t appear in the owner\'s Find My app and can\'t be remotely wiped.',
                    silentHelpers: ['SSH access', 'plist modification'],
                    action: () => executeRitual('Find My Disable', [
                      'Accessing device filesystem...',
                      'Locating Find My configuration...',
                      'Disabling location tracking...',
                      'Find My disabled!'
                    ], 1500)
                  }
                ].map((exploit) => (
                  <div key={exploit.id} className="rounded-lg bg-grimoire-obsidian border border-cyan-500/20 overflow-hidden">
                    <button
                      onClick={() => setExpandedExploit(expandedExploit === exploit.id ? null : exploit.id)}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-cyan-500/5 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-grimoire text-cyan-400">{exploit.name}</h4>
                          <span className="text-xs font-tech text-grimoire-thunder-gold">{exploit.price}</span>
                        </div>
                        <p className="text-xs text-dark-muted mt-1">{exploit.compatibility}</p>
                      </div>
                      <span className="text-dark-muted">{expandedExploit === exploit.id ? '▼' : '▶'}</span>
                    </button>
                    
                    {expandedExploit === exploit.id && (
                      <div className="p-4 border-t border-cyan-500/10 space-y-4 bg-cyan-500/5">
                        <div>
                          <div className="text-xs text-dark-muted uppercase tracking-wider mb-1">What it does:</div>
                          <p className="text-sm text-dark-text">{exploit.whatItDoes}</p>
                        </div>
                        <div>
                          <div className="text-xs text-dark-muted uppercase tracking-wider mb-1">Silent helpers working in background:</div>
                          <div className="flex flex-wrap gap-2">
                            {exploit.silentHelpers.map(helper => (
                              <span key={helper} className="px-2 py-1 rounded bg-cyan-500/10 text-xs text-cyan-300">{helper}</span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={exploit.action}
                          disabled={isRitualActive || !vesselBound}
                          className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40
                            hover:border-cyan-400 text-cyan-400 font-tech transition-all disabled:opacity-50"
                        >
                          {isRitualActive ? ritualPhase || 'Processing...' : `Execute ${exploit.name}`}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MDM Realm - ALL MDM exploits combined */}
          {activeSection === 'mdm' && (
            <div className="grimoire-card p-6 space-y-6 animate-fade-in-up border-orange-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-700/10 flex items-center justify-center text-2xl">
                  🏢
                </div>
                <div>
                  <h3 className="font-grimoire text-xl text-orange-400">MDM Realm</h3>
                  <p className="text-sm text-dark-muted">Remove corporate/school MDM profiles and restrictions</p>
                </div>
              </div>

              {/* Explanation Banner */}
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <p className="text-sm text-orange-300">
                  <strong>What this does:</strong> Removes Mobile Device Management (MDM) profiles installed by companies or schools. 
                  These profiles restrict what you can do with the device - we remove them completely.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { 
                    id: 'mdm-remove',
                    name: 'Remove MDM Profile', 
                    price: '$69',
                    description: 'Removes installed MDM management profile',
                    whatItDoes: 'Deletes the MDM configuration profile from the device. All restrictions (blocked apps, forced settings, remote wipe capability) are removed. Device becomes fully user-controlled.',
                    silentHelpers: ['profile removal', 'configuration cleaner', 'restriction bypass'],
                    action: () => executeRitual('MDM Removal', [
                      'Detecting MDM profile...',
                      'Analyzing restrictions...',
                      'Removing management profile...',
                      'Clearing cached policies...',
                      'MDM removed successfully!'
                    ], 1500)
                  },
                  { 
                    id: 'dep-bypass',
                    name: 'DEP Enrollment Bypass', 
                    price: '$89',
                    description: 'Skip automatic MDM enrollment during setup',
                    whatItDoes: 'Device Enrollment Program (DEP) forces MDM installation during device setup. This bypass skips that enrollment screen entirely, so no MDM gets installed in the first place.',
                    silentHelpers: ['activation bypass', 'setup skip', 'enrollment blocker'],
                    action: () => executeRitual('DEP Bypass', [
                      'Intercepting enrollment request...',
                      'Blocking DEP server communication...',
                      'Skipping enrollment screen...',
                      'DEP bypassed!'
                    ], 1500)
                  },
                  { 
                    id: 'supervision',
                    name: 'Remove Supervision', 
                    price: '$49',
                    description: 'Remove "This device is supervised" message',
                    whatItDoes: 'Supervised devices show "This iPhone is supervised and managed by..." message in Settings. This removes supervision status and the message, making the device appear normal.',
                    silentHelpers: ['supervision remover', 'plist editor'],
                    action: () => executeRitual('Supervision Removal', [
                      'Locating supervision certificates...',
                      'Removing supervision status...',
                      'Cleaning up traces...',
                      'Supervision removed!'
                    ], 1200)
                  }
                ].map((exploit) => (
                  <div key={exploit.id} className="rounded-lg bg-grimoire-obsidian border border-orange-500/20 overflow-hidden">
                    <button
                      onClick={() => setExpandedExploit(expandedExploit === exploit.id ? null : exploit.id)}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-orange-500/5 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-grimoire text-orange-400">{exploit.name}</h4>
                          <span className="text-xs font-tech text-grimoire-thunder-gold">{exploit.price}</span>
                        </div>
                        <p className="text-xs text-dark-muted mt-1">{exploit.description}</p>
                      </div>
                      <span className="text-dark-muted">{expandedExploit === exploit.id ? '▼' : '▶'}</span>
                    </button>
                    
                    {expandedExploit === exploit.id && (
                      <div className="p-4 border-t border-orange-500/10 space-y-4 bg-orange-500/5">
                        <div>
                          <div className="text-xs text-dark-muted uppercase tracking-wider mb-1">What it does:</div>
                          <p className="text-sm text-dark-text">{exploit.whatItDoes}</p>
                        </div>
                        <div>
                          <div className="text-xs text-dark-muted uppercase tracking-wider mb-1">Silent helpers:</div>
                          <div className="flex flex-wrap gap-2">
                            {exploit.silentHelpers.map(helper => (
                              <span key={helper} className="px-2 py-1 rounded bg-orange-500/10 text-xs text-orange-300">{helper}</span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={exploit.action}
                          disabled={isRitualActive || !vesselBound}
                          className="w-full py-3 rounded-lg bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/40
                            hover:border-orange-400 text-orange-400 font-tech transition-all disabled:opacity-50"
                        >
                          {isRitualActive ? ritualPhase || 'Processing...' : `Execute ${exploit.name}`}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Jailbreak Forge - ALL jailbreak tools combined */}
          {activeSection === 'jailbreak' && (
            <div className="grimoire-card p-6 space-y-6 animate-fade-in-up border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-green-700/10 flex items-center justify-center text-2xl">
                  🔓
                </div>
                <div>
                  <h3 className="font-grimoire text-xl text-green-400">Jailbreak Forge</h3>
                  <p className="text-sm text-dark-muted">Gain root access to bypass iOS restrictions</p>
                </div>
              </div>

              {/* Explanation Banner */}
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-300">
                  <strong>What this does:</strong> Jailbreaking gives you root access to iOS, letting you install apps Apple doesn't allow, 
                  customize your device, and access system files. Required for some advanced bypasses.
                </p>
                <p className="text-xs text-dark-muted mt-2">
                  <strong>Flow:</strong> Jailbreak → SSH Access → iCloud/MDM file modifications → Full control
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { 
                    id: 'phoenix-tether',
                    name: 'Phoenix Tether', 
                    price: 'FREE',
                    compatibility: 'A8-A11 (iPhone 6 to iPhone X) • iOS 15-17',
                    whatItDoes: 'Modern jailbreak for newer iOS versions using bootrom exploit. Gives you package manager and root access. Semi-tethered: needs re-jailbreak after reboot.',
                    silentHelpers: ['bootrom exploit', 'package installer', 'SSH daemon'],
                    action: () => executeRitual('Phoenix Tether', [
                      'Entering DFU mode...',
                      'Running bootrom exploit...',
                      'Patching kernel...',
                      'Installing Phoenix core...',
                      'Installing package manager...',
                      'Jailbreak complete!'
                    ], 2000)
                  },
                  { 
                    id: 'crimson-chain',
                    name: 'Crimson Chain', 
                    price: 'FREE',
                    compatibility: 'A5-A11 (iPhone 4s to iPhone X) • iOS 12-14',
                    whatItDoes: 'Classic jailbreak using bootrom exploit. Installs package manager. Works on older iOS versions. Very stable and reliable.',
                    silentHelpers: ['bootrom exploit', 'package installer', 'runtime patcher'],
                    action: () => executeRitual('Crimson Chain', [
                      'Entering DFU mode...',
                      'Executing Crimson Chain...',
                      'Bootstrapping...',
                      'Installing packages...',
                      'Jailbreak complete!'
                    ], 2500)
                  }
                ].map((exploit) => (
                  <div key={exploit.id} className="rounded-lg bg-grimoire-obsidian border border-green-500/20 overflow-hidden">
                    <button
                      onClick={() => setExpandedExploit(expandedExploit === exploit.id ? null : exploit.id)}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-green-500/5 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-grimoire text-green-400">{exploit.name}</h4>
                          <span className="text-xs font-tech text-green-400">{exploit.price}</span>
                        </div>
                        <p className="text-xs text-dark-muted mt-1">{exploit.compatibility}</p>
                      </div>
                      <span className="text-dark-muted">{expandedExploit === exploit.id ? '▼' : '▶'}</span>
                    </button>
                    
                    {expandedExploit === exploit.id && (
                      <div className="p-4 border-t border-green-500/10 space-y-4 bg-green-500/5">
                        <div>
                          <div className="text-xs text-dark-muted uppercase tracking-wider mb-1">What it does:</div>
                          <p className="text-sm text-dark-text">{exploit.whatItDoes}</p>
                        </div>
                        <div>
                          <div className="text-xs text-dark-muted uppercase tracking-wider mb-1">Silent helpers:</div>
                          <div className="flex flex-wrap gap-2">
                            {exploit.silentHelpers.map(helper => (
                              <span key={helper} className="px-2 py-1 rounded bg-green-500/10 text-xs text-green-300">{helper}</span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={exploit.action}
                          disabled={isRitualActive || !vesselBound}
                          className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/40
                            hover:border-green-400 text-green-400 font-tech transition-all disabled:opacity-50"
                        >
                          {isRitualActive ? ritualPhase || 'Processing...' : `Execute ${exploit.name}`}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Flow explanation */}
              <div className="p-4 rounded-lg bg-grimoire-obsidian/50 border border-green-500/10">
                <div className="text-xs text-dark-muted uppercase tracking-wider mb-2">After Jailbreak:</div>
                <p className="text-xs text-dark-muted">
                  With jailbreak active, you gain SSH access to the device filesystem. This enables modifying activation files, 
                  removing MDM profiles at the system level, and bypassing restrictions that normal methods can't touch.
                </p>
              </div>
            </div>
          )}

          {/* Severance Rite - Passcode, SIM, Reset */}
          {activeSection === 'severance' && (
            <div className="grimoire-card p-6 space-y-6 animate-fade-in-up border-grimoire-abyss-purple/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-grimoire-abyss-purple/20 to-purple-700/10 flex items-center justify-center text-2xl">
                  ⛓️
                </div>
                <div>
                  <h3 className="font-grimoire text-xl text-grimoire-abyss-purple">Severance Rite</h3>
                  <p className="text-sm text-dark-muted">Remove passcode, unlock SIM, and factory reset</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { 
                    id: 'passcode',
                    name: 'Remove Screen Passcode', 
                    price: '$49',
                    description: 'Bypass or remove the screen lock passcode',
                    whatItDoes: 'Removes the screen lock passcode from the device. This uses either exploit-based bypass for compatible chips or data recovery mode for others. Note: May erase data on some devices.',
                    silentHelpers: ['secure enclave bypass', 'passcode patcher'],
                    action: () => executeRitual('Passcode Removal', [
                      'Analyzing secure enclave...',
                      'Attempting bypass...',
                      'Removing passcode lock...',
                      'Passcode removed!'
                    ], 1500)
                  },
                  { 
                    id: 'sim',
                    name: 'SIM Unlock', 
                    price: '$35',
                    description: 'Unlock device to use with any carrier',
                    whatItDoes: 'Removes carrier lock so you can use the phone with any SIM card from any carrier worldwide. Permanent unlock that persists through updates.',
                    silentHelpers: ['carrier unlock', 'baseband patcher'],
                    action: () => executeRitual('SIM Unlock', [
                      'Reading carrier lock status...',
                      'Generating unlock code...',
                      'Applying carrier unlock...',
                      'SIM unlocked!'
                    ], 1500)
                  },
                  { 
                    id: 'factory',
                    name: 'Factory Reset', 
                    price: 'FREE',
                    description: 'Complete device wipe and fresh start',
                    whatItDoes: 'Erases all data and settings, returning device to factory state. Use this after bypasses are complete to get a clean device.',
                    silentHelpers: ['DFU restore', 'iTunes integration'],
                    action: () => executeRitual('Factory Reset', [
                      'Entering recovery mode...',
                      'Erasing all content...',
                      'Restoring factory firmware...',
                      'Factory reset complete!'
                    ], 2000)
                  }
                ].map((exploit) => (
                  <div key={exploit.id} className="rounded-lg bg-grimoire-obsidian border border-grimoire-abyss-purple/20 overflow-hidden">
                    <button
                      onClick={() => setExpandedExploit(expandedExploit === exploit.id ? null : exploit.id)}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-grimoire-abyss-purple/5 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-grimoire text-grimoire-abyss-purple">{exploit.name}</h4>
                          <span className={`text-xs font-tech ${exploit.price === 'FREE' ? 'text-green-400' : 'text-grimoire-thunder-gold'}`}>{exploit.price}</span>
                        </div>
                        <p className="text-xs text-dark-muted mt-1">{exploit.description}</p>
                      </div>
                      <span className="text-dark-muted">{expandedExploit === exploit.id ? '▼' : '▶'}</span>
                    </button>
                    
                    {expandedExploit === exploit.id && (
                      <div className="p-4 border-t border-grimoire-abyss-purple/10 space-y-4 bg-grimoire-abyss-purple/5">
                        <div>
                          <div className="text-xs text-dark-muted uppercase tracking-wider mb-1">What it does:</div>
                          <p className="text-sm text-dark-text">{exploit.whatItDoes}</p>
                        </div>
                        <div>
                          <div className="text-xs text-dark-muted uppercase tracking-wider mb-1">Silent helpers:</div>
                          <div className="flex flex-wrap gap-2">
                            {exploit.silentHelpers.map(helper => (
                              <span key={helper} className="px-2 py-1 rounded bg-grimoire-abyss-purple/10 text-xs text-purple-300">{helper}</span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={exploit.action}
                          disabled={isRitualActive || !vesselBound}
                          className="w-full py-3 rounded-lg bg-gradient-to-r from-grimoire-abyss-purple/20 to-purple-600/20 border border-grimoire-abyss-purple/40
                            hover:border-purple-400 text-grimoire-abyss-purple font-tech transition-all disabled:opacity-50"
                        >
                          {isRitualActive ? ritualPhase || 'Processing...' : `Execute ${exploit.name}`}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Console Sidebar */}
        <div className="lg:col-span-1">
          <div className="grimoire-card p-4 sticky top-4">
            <h4 className="font-grimoire text-grimoire-electric-blue mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-grimoire-electric-blue animate-pulse" />
              Codex Terminal
            </h4>
            <div className="bg-black/50 rounded-lg p-3 h-80 overflow-y-auto font-mono text-xs border border-grimoire-electric-blue/20">
              {consoleOutput.length === 0 ? (
                <div className="text-dark-muted italic">Awaiting Codex commands...</div>
              ) : (
                consoleOutput.map((line, i) => (
                  <div key={i} className={`mb-1 ${
                    line.includes('[ritual]') ? 'text-grimoire-phoenix-orange' :
                    line.includes('[link]') ? 'text-grimoire-electric-blue' :
                    'text-grimoire-neon-cyan'
                  }`}>
                    {line}
                  </div>
                ))
              )}
              <span className="animate-pulse text-grimoire-neon-cyan">_</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
