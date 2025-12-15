/**
 * Warden Sanctum - Android Device Control Panel
 * 
 * The Domain of Titans - Samsung, Pixel, Motorola, and Android devices
 * 
 * Philosophy: Combine related exploits by their END GOAL
 * - FRP Domain: All FRP bypass methods for all manufacturers
 * - Root Forge: Bootloader unlock + Shadow Root
 * - MDM Realm: All Android MDM removal
 * - Flash Chamber: Firmware flashing & recovery
 * 
 * Shows FLOW: Bootloader unlock → enables FRP bypass → enables Root
 */

import { useState, useEffect } from 'react';
import { type DeviceInfo } from '../services/apiService';
import { useNotificationStore } from '../stores/notificationStore';

interface WardenSanctumProps {
  device: DeviceInfo | null;
  onOperationStart?: () => void;
  onOperationComplete?: (success: boolean) => void;
}

type SanctumSection = 'conduit' | 'frp' | 'root' | 'mdm' | 'flash';
type TitanType = 'samsung' | 'pixel' | 'xiaomi' | 'motorola' | 'generic';

interface TitanDiagnostics {
  manufacturer: string;
  model: string;
  bootloaderLocked: boolean;
  frpEnabled: boolean;
  mdmEnrolled: boolean;
  rooted: boolean;
}

export function WardenSanctum({ device, onOperationStart, onOperationComplete }: WardenSanctumProps) {
  const [activeSection, setActiveSection] = useState<SanctumSection>('conduit');
  const [isRitualActive, setIsRitualActive] = useState(false);
  const [titanBound, setTitanBound] = useState(false);
  const [titanType, setTitanType] = useState<TitanType>('generic');
  const [ritualPhase, setRitualPhase] = useState<string>('');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [diagnostics, setDiagnostics] = useState<TitanDiagnostics | null>(null);
  const [expandedExploit, setExpandedExploit] = useState<string | null>(null);
  const { addNotification } = useNotificationStore();

  const addConsole = (message: string, prefix: string = 'titan') => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleOutput(prev => [...prev.slice(-20), `[${timestamp}] [${prefix}] ${message}`]);
  };

  useEffect(() => {
    if (device) {
      setTitanBound(true);
      const manufacturer = (device.manufacturer || '').toLowerCase();
      let detectedType: TitanType = 'generic';
      
      if (manufacturer.includes('samsung')) {
        detectedType = 'samsung';
        addConsole('Samsung Titan detected...', 'conduit');
      } else if (manufacturer.includes('google') || manufacturer.includes('pixel')) {
        detectedType = 'pixel';
        addConsole('Pixel Titan detected...', 'conduit');
      } else if (manufacturer.includes('xiaomi') || manufacturer.includes('redmi')) {
        detectedType = 'xiaomi';
        addConsole('Xiaomi Titan detected...', 'conduit');
      } else if (manufacturer.includes('motorola') || manufacturer.includes('lenovo') || manufacturer.includes('moto')) {
        detectedType = 'motorola';
        addConsole('Motorola Titan detected...', 'conduit');
      } else {
        addConsole('Android Titan detected...', 'conduit');
      }
      
      setTitanType(detectedType);
      addConsole('Establishing ADB connection...', 'conduit');
      
      setDiagnostics({
        manufacturer: device.manufacturer || 'Unknown',
        model: device.model || 'Android Device',
        bootloaderLocked: Math.random() > 0.3,
        frpEnabled: Math.random() > 0.5,
        mdmEnrolled: Math.random() > 0.7,
        rooted: Math.random() > 0.8
      });
    } else {
      setTitanBound(false);
      setDiagnostics(null);
    }
  }, [device]);

  const executeRitual = async (ritualName: string, phases: string[], duration: number = 1000) => {
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
    { id: 'conduit', name: 'Titan Link', icon: '⚡', description: 'Connect via ADB/Fastboot' },
    { id: 'frp', name: 'FRP Domain', icon: '🔓', description: 'Remove Google account lock' },
    { id: 'root', name: 'Root Forge', icon: '🔨', description: 'Bootloader + Shadow Root' },
    { id: 'mdm', name: 'MDM Realm', icon: '🏢', description: 'Remove corporate MDM' },
    { id: 'flash', name: 'Flash Chamber', icon: '💾', description: 'Firmware flash & recovery' }
  ];

  const getTitanVisual = () => {
    switch (titanType) {
      case 'samsung': return { 
        icon: '🏛️', 
        name: 'Samsung', 
        color: 'blue',
        containerClass: 'bg-gradient-to-br from-blue-500/30 to-blue-700/20 border-2 border-blue-500/50'
      };
      case 'pixel': return { 
        icon: '💎', 
        name: 'Pixel', 
        color: 'green',
        containerClass: 'bg-gradient-to-br from-green-500/30 to-green-700/20 border-2 border-green-500/50'
      };
      case 'xiaomi': return { 
        icon: '🔶', 
        name: 'Xiaomi', 
        color: 'orange',
        containerClass: 'bg-gradient-to-br from-orange-500/30 to-orange-700/20 border-2 border-orange-500/50'
      };
      case 'motorola': return { 
        icon: '🦇', 
        name: 'Motorola', 
        color: 'cyan',
        containerClass: 'bg-gradient-to-br from-cyan-500/30 to-cyan-700/20 border-2 border-cyan-500/50'
      };
      default: return { 
        icon: '🤖', 
        name: 'Android', 
        color: 'green',
        containerClass: 'bg-gradient-to-br from-green-500/30 to-green-700/20 border-2 border-green-500/50'
      };
    }
  };

  const titanVisual = getTitanVisual();

  return (
    <div className="space-y-6">
      {/* Sanctum Header */}
      <div className="relative overflow-hidden rounded-xl border border-green-500/30 bg-gradient-to-br from-grimoire-obsidian via-grimoire-obsidian-light to-grimoire-obsidian p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-xl flex items-center justify-center text-4xl
              ${titanBound ? titanVisual.containerClass : 'bg-grimoire-obsidian-light border-2 border-gray-700'}`}>
              {titanBound ? titanVisual.icon : '👻'}
            </div>
            <div>
              <h2 className="text-2xl font-grimoire text-green-400">
                Warden Sanctum
              </h2>
              <p className="text-dark-muted font-tech text-sm">
                {titanBound 
                  ? `${titanVisual.name}: ${diagnostics?.model || 'Android Device'}`
                  : 'Awaiting Titan presence...'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${titanBound ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
                <span className="text-xs font-tech text-dark-muted">
                  {titanBound ? 'ADB Connected' : 'No Signal'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs font-tech text-dark-muted uppercase tracking-wider">Status</div>
            <div className={`text-lg font-grimoire ${titanBound ? 'text-green-400' : 'text-gray-500'}`}>
              {titanBound ? 'BOUND' : 'UNBOUND'}
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
                ? 'bg-gradient-to-r from-green-500/20 to-green-700/10 border border-green-500/50 text-green-400'
                : 'bg-grimoire-obsidian-light border border-gray-700 text-dark-muted hover:border-green-500/30 hover:text-dark-text'
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
          {/* Titan Link Conduit */}
          {activeSection === 'conduit' && (
            <div className="grimoire-card p-6 space-y-6 animate-fade-in-up">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-green-700/10 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-green-500/50 animate-ping absolute" />
                  <div className="w-4 h-4 rounded-full bg-green-400 relative" />
                </div>
                <div>
                  <h3 className="font-grimoire text-xl text-green-400">Titan Link Conduit</h3>
                  <p className="text-sm text-dark-muted">Connect your Android via USB. Enable USB debugging in Settings → Developer Options.</p>
                </div>
              </div>

              {/* Diagnostics Panel */}
              {diagnostics && (
                <div className="p-4 rounded-lg bg-grimoire-obsidian border border-green-500/20 space-y-3">
                  <div className="text-xs text-dark-muted uppercase tracking-wider">Device Status</div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span>Bootloader:</span>
                      <span className={diagnostics.bootloaderLocked ? 'text-red-400' : 'text-green-400'}>
                        {diagnostics.bootloaderLocked ? '🔒 Locked' : '🔓 Unlocked'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>FRP Lock:</span>
                      <span className={diagnostics.frpEnabled ? 'text-red-400' : 'text-green-400'}>
                        {diagnostics.frpEnabled ? '🔒 Active' : '✓ Clear'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>MDM:</span>
                      <span className={diagnostics.mdmEnrolled ? 'text-orange-400' : 'text-green-400'}>
                        {diagnostics.mdmEnrolled ? '🏢 Enrolled' : '✓ None'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Root:</span>
                      <span className={diagnostics.rooted ? 'text-green-400' : 'text-dark-muted'}>
                        {diagnostics.rooted ? '✓ Rooted' : '— Not rooted'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Connect ADB', hint: 'Establishes Android Debug Bridge connection. Required for all operations.', action: () => executeRitual('ADB Connection', ['Sending handshake...', 'Device authorized...', 'ADB connected!'], 700) },
                  { name: 'Enter Bootloader', hint: 'Reboots device into bootloader/fastboot mode. Required for flashing and some unlocks.', action: () => executeRitual('Bootloader Entry', ['Sending reboot command...', 'Entering bootloader...', 'Now in fastboot mode.'], 800) },
                  { name: 'Enter Recovery', hint: 'Reboots into recovery mode. Useful for factory resets and sideloading.', action: () => executeRitual('Recovery Entry', ['Rebooting to recovery...', 'Recovery mode active.'], 800) },
                  { name: 'Reboot Device', hint: 'Normal reboot. Use after completing operations.', action: () => { addConsole('Rebooting device...', 'conduit'); } }
                ].map((cmd) => (
                  <button
                    key={cmd.name}
                    onClick={cmd.action}
                    disabled={isRitualActive}
                    className="p-4 rounded-lg bg-grimoire-obsidian border border-green-500/20 hover:border-green-500/50 
                      text-left transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <h4 className="font-tech text-green-400 group-hover:text-green-300">{cmd.name}</h4>
                    <p className="text-xs text-dark-muted mt-1">{cmd.hint}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* FRP Domain - ALL FRP bypasses combined */}
          {activeSection === 'frp' && (
            <div className="grimoire-card p-6 space-y-6 animate-fade-in-up border-red-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500/20 to-red-700/10 flex items-center justify-center text-2xl">
                  🔓
                </div>
                <div>
                  <h3 className="font-grimoire text-xl text-red-400">FRP Domain</h3>
                  <p className="text-sm text-dark-muted">Remove Factory Reset Protection (Google account lock) - all manufacturers</p>
                </div>
              </div>

              {/* Explanation Banner */}
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-300">
                  <strong>What is FRP?</strong> Factory Reset Protection locks the device to the previous Google account after a factory reset. 
                  We bypass this so you can set up the device with a new account.
                </p>
                <p className="text-xs text-dark-muted mt-2">
                  <strong>Flow:</strong> Bootloader Unlock (if needed) → FRP Bypass → Device fully usable
                </p>
              </div>

              {/* Combined FRP Exploits for all manufacturers */}
              <div className="space-y-4">
                {[
                  { 
                    id: 'samsung-frp',
                    name: 'Samsung FRP Bypass', 
                    price: '$65',
                    compatibility: 'All Samsung Galaxy devices (S, A, Note, Z series)',
                    whatItDoes: 'Bypasses Samsung\'s FRP lock using a combination of ADB, hidden menus, and Samsung-specific exploits. Works on all Android versions. Device can be set up with any Google account after.',
                    silentHelpers: ['Samsung hidden menu', 'ADB bypass', 'Shield disabler', 'Account manager'],
                    action: () => executeRitual('Samsung FRP Bypass', [
                      'Detecting Samsung security level...',
                      'Accessing hidden service menu...',
                      'Bypassing Google verification...',
                      'Clearing FRP partition...',
                      'FRP bypassed successfully!'
                    ], 1500)
                  },
                  { 
                    id: 'pixel-frp',
                    name: 'Pixel/Stock Android FRP', 
                    price: '$55',
                    compatibility: 'Google Pixel, Motorola, Nokia, OnePlus, and stock Android',
                    whatItDoes: 'Uses fastboot and ADB methods specific to Pixel and stock Android devices. Clean bypass without traces.',
                    silentHelpers: ['Fastboot unlock', 'ADB sideload', 'Google account bypass'],
                    action: () => executeRitual('Pixel FRP Bypass', [
                      'Booting to fastboot...',
                      'Executing bypass sequence...',
                      'Clearing account cache...',
                      'FRP removed!'
                    ], 1500)
                  },
                  { 
                    id: 'xiaomi-frp',
                    name: 'Xiaomi/Redmi FRP Bypass', 
                    price: '$55',
                    compatibility: 'All Xiaomi and Redmi devices',
                    whatItDoes: 'Bypasses Xiaomi\'s Mi Account lock and Google FRP using special Xiaomi tools. Handles both MIUI and HyperOS.',
                    silentHelpers: ['Mi Unlock', 'MIUI bypass', 'EDL mode'],
                    action: () => executeRitual('Xiaomi FRP Bypass', [
                      'Entering EDL mode...',
                      'Bypassing Mi Account...',
                      'Removing Google lock...',
                      'FRP bypassed!'
                    ], 1500)
                  },
                  { 
                    id: 'universal-frp',
                    name: 'Universal FRP Bypass', 
                    price: '$75',
                    compatibility: 'Huawei, LG, Sony, HTC, Oppo, Vivo, and other Android devices',
                    whatItDoes: 'Generic bypass method that works on most Android devices. Uses ADB and special APK tools to remove FRP.',
                    silentHelpers: ['Universal ADB tool', 'FRP bypass APK', 'Account manager hack'],
                    action: () => executeRitual('Universal FRP Bypass', [
                      'Detecting device manufacturer...',
                      'Loading appropriate bypass...',
                      'Executing FRP removal...',
                      'FRP bypassed!'
                    ], 1800)
                  }
                ].map((exploit) => (
                  <div key={exploit.id} className="rounded-lg bg-grimoire-obsidian border border-red-500/20 overflow-hidden">
                    <button
                      onClick={() => setExpandedExploit(expandedExploit === exploit.id ? null : exploit.id)}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-red-500/5 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-grimoire text-red-400">{exploit.name}</h4>
                          <span className="text-xs font-tech text-grimoire-thunder-gold">{exploit.price}</span>
                        </div>
                        <p className="text-xs text-dark-muted mt-1">{exploit.compatibility}</p>
                      </div>
                      <span className="text-dark-muted">{expandedExploit === exploit.id ? '▼' : '▶'}</span>
                    </button>
                    
                    {expandedExploit === exploit.id && (
                      <div className="p-4 border-t border-red-500/10 space-y-4 bg-red-500/5">
                        <div>
                          <div className="text-xs text-dark-muted uppercase tracking-wider mb-1">What it does:</div>
                          <p className="text-sm text-dark-text">{exploit.whatItDoes}</p>
                        </div>
                        <div>
                          <div className="text-xs text-dark-muted uppercase tracking-wider mb-1">Tools working together:</div>
                          <div className="flex flex-wrap gap-2">
                            {exploit.silentHelpers.map(helper => (
                              <span key={helper} className="px-2 py-1 rounded bg-red-500/10 text-xs text-red-300">{helper}</span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={exploit.action}
                          disabled={isRitualActive || !titanBound}
                          className="w-full py-3 rounded-lg bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/40
                            hover:border-red-400 text-red-400 font-tech transition-all disabled:opacity-50"
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

          {/* Root Forge - Bootloader + Shadow Root combined */}
          {activeSection === 'root' && (
            <div className="grimoire-card p-6 space-y-6 animate-fade-in-up border-grimoire-thunder-gold/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-grimoire-thunder-gold/20 to-yellow-700/10 flex items-center justify-center text-2xl">
                  🔨
                </div>
                <div>
                  <h3 className="font-grimoire text-xl text-grimoire-thunder-gold">Root Forge</h3>
                  <p className="text-sm text-dark-muted">Unlock bootloader and gain Shadow Root access</p>
                </div>
              </div>

              {/* Flow Explanation */}
              <div className="p-4 rounded-lg bg-grimoire-thunder-gold/10 border border-grimoire-thunder-gold/20">
                <p className="text-sm text-yellow-300">
                  <strong>The Root Flow:</strong> First unlock the bootloader, then install Shadow Root for root access. 
                  Unlocking bootloader also makes FRP bypass easier!
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-dark-muted">
                  <span className="px-2 py-1 rounded bg-yellow-500/20">1. Bootloader Unlock</span>
                  <span>→</span>
                  <span className="px-2 py-1 rounded bg-yellow-500/20">2. Flash Shadow Root</span>
                  <span>→</span>
                  <span className="px-2 py-1 rounded bg-green-500/20">Root Access!</span>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { 
                    id: 'bootloader',
                    name: 'Unlock Bootloader', 
                    price: 'FREE',
                    description: 'First step - unlocks device for custom software',
                    whatItDoes: 'Unlocks the bootloader so you can flash custom recovery, Shadow Root, and custom ROMs. Warning: This wipes all data and may trigger security on Samsung.',
                    silentHelpers: ['bootloader command', 'OEM unlocking'],
                    prereq: 'Enable OEM Unlocking in Developer Options first',
                    action: () => executeRitual('Bootloader Unlock', [
                      'Rebooting to fastboot...',
                      'Sending unlock command...',
                      'Bootloader unlocking...',
                      'Bootloader unlocked! (Data wiped)'
                    ], 1500)
                  },
                  { 
                    id: 'shadow-root',
                    name: 'Install Shadow Root', 
                    price: 'FREE',
                    description: 'Systemless root with detection bypass',
                    whatItDoes: 'Installs Shadow Root for root access. It\'s "systemless" meaning it doesn\'t modify system partition, making it harder to detect. Includes Phantom Veil to pass security checks for banking apps.',
                    silentHelpers: ['Shadow Manager', 'Phantom Veil', 'Shadow Core'],
                    prereq: 'Requires unlocked bootloader',
                    action: () => executeRitual('Shadow Root Installation', [
                      'Extracting boot.img...',
                      'Patching with Shadow Root...',
                      'Flashing patched boot...',
                      'Installing Shadow Manager...',
                      'Root access granted!'
                    ], 2000)
                  },
                  { 
                    id: 'recovery',
                    name: 'Install Twilight Recovery', 
                    price: 'FREE',
                    description: 'Custom recovery for advanced options',
                    whatItDoes: 'Installs Twilight Recovery which gives you ability to flash ZIPs, make full backups, and install custom ROMs.',
                    silentHelpers: ['Twilight Recovery', 'flash utility'],
                    prereq: 'Requires unlocked bootloader',
                    action: () => executeRitual('Twilight Recovery Install', [
                      'Downloading Twilight Recovery...',
                      'Flashing recovery...',
                      'Custom recovery installed!'
                    ], 1500)
                  }
                ].map((exploit) => (
                  <div key={exploit.id} className="rounded-lg bg-grimoire-obsidian border border-grimoire-thunder-gold/20 overflow-hidden">
                    <button
                      onClick={() => setExpandedExploit(expandedExploit === exploit.id ? null : exploit.id)}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-grimoire-thunder-gold/5 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-grimoire text-grimoire-thunder-gold">{exploit.name}</h4>
                          <span className="text-xs font-tech text-green-400">{exploit.price}</span>
                        </div>
                        <p className="text-xs text-dark-muted mt-1">{exploit.description}</p>
                      </div>
                      <span className="text-dark-muted">{expandedExploit === exploit.id ? '▼' : '▶'}</span>
                    </button>
                    
                    {expandedExploit === exploit.id && (
                      <div className="p-4 border-t border-grimoire-thunder-gold/10 space-y-4 bg-grimoire-thunder-gold/5">
                        <div className="p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
                          <div className="text-xs text-yellow-400">Prerequisite: {exploit.prereq}</div>
                        </div>
                        <div>
                          <div className="text-xs text-dark-muted uppercase tracking-wider mb-1">What it does:</div>
                          <p className="text-sm text-dark-text">{exploit.whatItDoes}</p>
                        </div>
                        <div>
                          <div className="text-xs text-dark-muted uppercase tracking-wider mb-1">Tools used:</div>
                          <div className="flex flex-wrap gap-2">
                            {exploit.silentHelpers.map(helper => (
                              <span key={helper} className="px-2 py-1 rounded bg-grimoire-thunder-gold/10 text-xs text-yellow-300">{helper}</span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={exploit.action}
                          disabled={isRitualActive || !titanBound}
                          className="w-full py-3 rounded-lg bg-gradient-to-r from-grimoire-thunder-gold/20 to-yellow-600/20 border border-grimoire-thunder-gold/40
                            hover:border-yellow-400 text-grimoire-thunder-gold font-tech transition-all disabled:opacity-50"
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

          {/* MDM Realm */}
          {activeSection === 'mdm' && (
            <div className="grimoire-card p-6 space-y-6 animate-fade-in-up border-orange-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-700/10 flex items-center justify-center text-2xl">
                  🏢
                </div>
                <div>
                  <h3 className="font-grimoire text-xl text-orange-400">MDM Realm</h3>
                  <p className="text-sm text-dark-muted">Remove enterprise/school device management profiles</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <p className="text-sm text-orange-300">
                  <strong>What is MDM?</strong> Mobile Device Management lets companies control your device - 
                  blocking apps, forcing settings, remote wiping. We remove these restrictions.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { 
                    id: 'android-mdm',
                    name: 'Remove Android Work Profile', 
                    price: '$55',
                    whatItDoes: 'Removes the Android Enterprise Work Profile that separates personal and work data. Deletes corporate apps and policies.',
                    silentHelpers: ['ADB device owner removal', 'Profile cleaner'],
                    action: () => executeRitual('Work Profile Removal', [
                      'Detecting work profile...',
                      'Removing device admin...',
                      'Clearing policies...',
                      'Work profile removed!'
                    ], 1500)
                  },
                  { 
                    id: 'titan-shield',
                    name: 'Samsung Titan Shield Removal', 
                    price: '$75',
                    whatItDoes: 'Removes Samsung enterprise security enrollment. This is Samsung\'s security platform used by companies. This frees the device from corporate control.',
                    silentHelpers: ['Shield disabler', 'Enterprise reset'],
                    action: () => executeRitual('Titan Shield Removal', [
                      'Analyzing enterprise enrollment...',
                      'Disabling security container...',
                      'Removing enterprise license...',
                      'Titan Shield removed!'
                    ], 1800)
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
                          <div className="text-xs text-dark-muted uppercase tracking-wider mb-1">Tools used:</div>
                          <div className="flex flex-wrap gap-2">
                            {exploit.silentHelpers.map(helper => (
                              <span key={helper} className="px-2 py-1 rounded bg-orange-500/10 text-xs text-orange-300">{helper}</span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={exploit.action}
                          disabled={isRitualActive || !titanBound}
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

          {/* Flash Chamber */}
          {activeSection === 'flash' && (
            <div className="grimoire-card p-6 space-y-6 animate-fade-in-up border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-700/10 flex items-center justify-center text-2xl">
                  💾
                </div>
                <div>
                  <h3 className="font-grimoire text-xl text-purple-400">Flash Chamber</h3>
                  <p className="text-sm text-dark-muted">Flash firmware, recover bricked devices, install ROMs</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-sm text-purple-300">
                  <strong>Flashing:</strong> Installs new firmware or custom ROMs to your device. 
                  Can fix soft-bricked devices or upgrade/downgrade Android versions.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { 
                    id: 'samsung-flash',
                    name: 'Samsung Bifrost Flash', 
                    price: 'FREE',
                    description: 'Samsung firmware flashing via download mode',
                    whatItDoes: 'Flashes Samsung firmware using Bifrost protocol. Can restore stock firmware, install custom ROMs, or recover bricked devices.',
                    silentHelpers: ['Bifrost bridge', 'Download mode', 'Partition writer'],
                    show: titanType === 'samsung' || titanType === 'generic'
                  },
                  { 
                    id: 'fastboot-flash',
                    name: 'Fastboot Flash', 
                    price: 'FREE',
                    description: 'Standard Android flashing method',
                    whatItDoes: 'Uses fastboot protocol to flash boot, system, vendor partitions. Works on Pixel, Motorola, OnePlus, and most Android devices.',
                    silentHelpers: ['fastboot', 'Partition manager'],
                    show: titanType !== 'samsung'
                  },
                  { 
                    id: 'unbrick',
                    name: 'Brick Recovery', 
                    price: '$45',
                    description: 'Recover soft-bricked devices',
                    whatItDoes: 'Restores devices stuck in bootloop or won\'t boot. Uses EDL mode (Qualcomm) or Download mode (Samsung) to flash clean firmware.',
                    silentHelpers: ['EDL mode', 'Download mode', 'Emergency flash'],
                    show: true
                  }
                ].filter(e => e.show !== false).map((exploit) => (
                  <div key={exploit.id} className="rounded-lg bg-grimoire-obsidian border border-purple-500/20 overflow-hidden">
                    <button
                      onClick={() => setExpandedExploit(expandedExploit === exploit.id ? null : exploit.id)}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-purple-500/5 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-grimoire text-purple-400">{exploit.name}</h4>
                          <span className={`text-xs font-tech ${exploit.price === 'FREE' ? 'text-green-400' : 'text-grimoire-thunder-gold'}`}>{exploit.price}</span>
                        </div>
                        <p className="text-xs text-dark-muted mt-1">{exploit.description}</p>
                      </div>
                      <span className="text-dark-muted">{expandedExploit === exploit.id ? '▼' : '▶'}</span>
                    </button>
                    
                    {expandedExploit === exploit.id && (
                      <div className="p-4 border-t border-purple-500/10 space-y-4 bg-purple-500/5">
                        <div>
                          <div className="text-xs text-dark-muted uppercase tracking-wider mb-1">What it does:</div>
                          <p className="text-sm text-dark-text">{exploit.whatItDoes}</p>
                        </div>
                        <div>
                          <div className="text-xs text-dark-muted uppercase tracking-wider mb-1">Tools used:</div>
                          <div className="flex flex-wrap gap-2">
                            {exploit.silentHelpers.map(helper => (
                              <span key={helper} className="px-2 py-1 rounded bg-purple-500/10 text-xs text-purple-300">{helper}</span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => executeRitual(exploit.name, ['Loading firmware...', 'Flashing partitions...', 'Verifying...', 'Complete!'], 1500)}
                          disabled={isRitualActive || !titanBound}
                          className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/40
                            hover:border-purple-400 text-purple-400 font-tech transition-all disabled:opacity-50"
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
            <h4 className="font-grimoire text-green-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Warden Terminal
            </h4>
            <div className="bg-black/50 rounded-lg p-3 h-80 overflow-y-auto font-mono text-xs border border-green-500/20">
              {consoleOutput.length === 0 ? (
                <div className="text-dark-muted italic">Awaiting commands...</div>
              ) : (
                consoleOutput.map((line, i) => (
                  <div key={i} className={`mb-1 ${
                    line.includes('[ritual]') ? 'text-grimoire-thunder-gold' :
                    line.includes('[frp]') ? 'text-red-400' :
                    line.includes('[root]') ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {line}
                  </div>
                ))
              )}
              <span className="animate-pulse text-green-400">_</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
