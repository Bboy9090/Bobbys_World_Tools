/**
 * Obelisk Sanctum - Mac Device Control Panel
 * 
 * The Domain of Obelisks - MacBook, iMac, Mac Mini, Mac Pro
 * 
 * Philosophy: Combine related exploits by their END GOAL
 * - Activation Lock Domain: All activation bypass methods
 * - EFI/Firmware Realm: EFI password, firmware locks
 * - MDM Realm: Corporate management removal
 * - Recovery Chamber: PIN unlock, data recovery
 */

import { useState, useEffect } from 'react';
import { type DeviceInfo } from '../services/apiService';
import { useNotificationStore } from '../stores/notificationStore';

interface ObeliskSanctumProps {
  device: DeviceInfo | null;
  onOperationStart?: () => void;
  onOperationComplete?: (success: boolean) => void;
}

type SanctumSection = 'link' | 'activation' | 'efi' | 'mdm' | 'recovery';
type ChipType = 't2' | 'silicon' | 'intel' | 'unknown';

interface MacDiagnostics {
  serialNumber: string;
  chipType: ChipType;
  activationLocked: boolean;
  efiLocked: boolean;
  mdmEnrolled: boolean;
  pinLocked: boolean;
}

export function ObeliskSanctum({ device, onOperationStart, onOperationComplete }: ObeliskSanctumProps) {
  const [activeSection, setActiveSection] = useState<SanctumSection>('link');
  const [isRitualActive, setIsRitualActive] = useState(false);
  const [obeliskBound, setObeliskBound] = useState(false);
  const [chipType, setChipType] = useState<ChipType>('unknown');
  const [ritualPhase, setRitualPhase] = useState<string>('');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [diagnostics, setDiagnostics] = useState<MacDiagnostics | null>(null);
  const [expandedExploit, setExpandedExploit] = useState<string | null>(null);
  const { addNotification } = useNotificationStore();

  const addConsole = (message: string, prefix: string = 'obelisk') => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleOutput(prev => [...prev.slice(-20), `[${timestamp}] [${prefix}] ${message}`]);
  };

  useEffect(() => {
    if (device) {
      setObeliskBound(true);
      const model = (device.model || '').toLowerCase();
      let detectedChipType: ChipType = 'intel';
      
      if (model.includes('m1') || model.includes('m2') || model.includes('m3') || model.includes('m4')) {
        detectedChipType = 'silicon';
        addConsole('Apple Silicon Mac detected...', 'link');
      } else if (model.includes('t2')) {
        detectedChipType = 't2';
        addConsole('Intel Mac with T2 Security Chip detected...', 'link');
      } else {
        addConsole('Intel Mac detected...', 'link');
      }
      
      setChipType(detectedChipType);
      addConsole('Establishing connection...', 'link');
      setDiagnostics({
        serialNumber: device.serial || 'C02XXXXXXXXX',
        chipType: detectedChipType,
        activationLocked: Math.random() > 0.5,
        efiLocked: Math.random() > 0.7,
        mdmEnrolled: Math.random() > 0.6,
        pinLocked: Math.random() > 0.8
      });
    } else {
      setObeliskBound(false);
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
    { id: 'link', name: 'Obelisk Link', icon: '🖥️', description: 'Connect Mac device' },
    { id: 'activation', name: 'Activation Lock', icon: '🔐', description: 'Remove iCloud activation' },
    { id: 'efi', name: 'EFI/Firmware', icon: '🛡️', description: 'Remove EFI password' },
    { id: 'mdm', name: 'MDM Realm', icon: '🏢', description: 'Remove enterprise MDM' },
    { id: 'recovery', name: 'Recovery', icon: '🔧', description: 'PIN unlock & data recovery' }
  ];

  const getChipVisual = () => {
    switch (chipType) {
      case 'silicon': return { 
        icon: '🍎', 
        name: 'Apple Silicon', 
        description: 'M1/M2/M3/M4 chip',
        containerClass: 'bg-gradient-to-br from-purple-500/30 to-purple-700/20 border-2 border-purple-500/50'
      };
      case 't2': return { 
        icon: '🛡️', 
        name: 'T2 Security Chip', 
        description: 'Intel Mac with T2',
        containerClass: 'bg-gradient-to-br from-blue-500/30 to-blue-700/20 border-2 border-blue-500/50'
      };
      case 'intel': return { 
        icon: '🔷', 
        name: 'Intel Mac', 
        description: 'No T2 security chip',
        containerClass: 'bg-gradient-to-br from-cyan-500/30 to-cyan-700/20 border-2 border-cyan-500/50'
      };
      default: return { 
        icon: '❓', 
        name: 'Unknown', 
        description: 'Connect a Mac to detect',
        containerClass: 'bg-grimoire-obsidian-light border-2 border-gray-700'
      };
    }
  };

  const chipVisual = getChipVisual();

  return (
    <div className="space-y-6">
      {/* Sanctum Header */}
      <div className="relative overflow-hidden rounded-xl border border-grimoire-abyss-purple/30 bg-gradient-to-br from-grimoire-obsidian via-grimoire-obsidian-light to-grimoire-obsidian p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-grimoire-abyss-purple/10 rounded-full blur-3xl" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-xl flex items-center justify-center text-4xl
              ${obeliskBound ? chipVisual.containerClass : 'bg-grimoire-obsidian-light border-2 border-gray-700'}`}>
              {obeliskBound ? chipVisual.icon : '👻'}
            </div>
            <div>
              <h2 className="text-2xl font-grimoire text-grimoire-abyss-purple">
                Obelisk Sanctum
              </h2>
              <p className="text-dark-muted font-tech text-sm">
                {obeliskBound 
                  ? `${chipVisual.name}: ${device?.model || 'Mac'}`
                  : 'Awaiting Mac presence...'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${obeliskBound ? 'bg-purple-400 animate-pulse' : 'bg-gray-600'}`} />
                <span className="text-xs font-tech text-dark-muted">
                  {obeliskBound ? chipVisual.description : 'No Signal'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs font-tech text-dark-muted uppercase tracking-wider">Status</div>
            <div className={`text-lg font-grimoire ${obeliskBound ? 'text-purple-400' : 'text-gray-500'}`}>
              {obeliskBound ? 'CONNECTED' : 'DISCONNECTED'}
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
                ? 'bg-gradient-to-r from-grimoire-abyss-purple/20 to-purple-700/10 border border-grimoire-abyss-purple/50 text-purple-400'
                : 'bg-grimoire-obsidian-light border border-gray-700 text-dark-muted hover:border-purple-500/30 hover:text-dark-text'
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
          {/* Obelisk Link */}
          {activeSection === 'link' && (
            <div className="grimoire-card p-6 space-y-6 animate-fade-in-up">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-700/10 flex items-center justify-center text-2xl">
                  🖥️
                </div>
                <div>
                  <h3 className="font-grimoire text-xl text-purple-400">Obelisk Link</h3>
                  <p className="text-sm text-dark-muted">Connect your Mac via USB-C cable or put it in DFU mode</p>
                </div>
              </div>

              {/* Diagnostics Panel */}
              {diagnostics && (
                <div className="p-4 rounded-lg bg-grimoire-obsidian border border-purple-500/20 space-y-3">
                  <div className="text-xs text-dark-muted uppercase tracking-wider">Mac Status</div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span>Serial:</span>
                      <span className="font-mono text-purple-400">{diagnostics.serialNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chip:</span>
                      <span className="text-purple-400">{chipVisual.name}</span>
                    </div>
                  </div>
                  <div className="border-t border-purple-500/10 pt-3 space-y-2">
                    <div className="text-xs text-dark-muted uppercase tracking-wider">Detected Locks</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Activation Lock:</span>
                        <span className={diagnostics.activationLocked ? 'text-red-400' : 'text-green-400'}>
                          {diagnostics.activationLocked ? '🔒 Locked' : '✓ Clear'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>EFI Password:</span>
                        <span className={diagnostics.efiLocked ? 'text-red-400' : 'text-green-400'}>
                          {diagnostics.efiLocked ? '🔒 Set' : '✓ None'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>MDM Enrolled:</span>
                        <span className={diagnostics.mdmEnrolled ? 'text-orange-400' : 'text-green-400'}>
                          {diagnostics.mdmEnrolled ? '🏢 Yes' : '✓ No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>PIN Lock:</span>
                        <span className={diagnostics.pinLocked ? 'text-red-400' : 'text-green-400'}>
                          {diagnostics.pinLocked ? '🔐 Set' : '✓ None'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Connect Mac', hint: 'Establishes connection via Apple Configurator or DFU mode', action: () => executeRitual('Mac Connection', ['Detecting Mac...', 'Establishing link...', 'Connected!'], 800) },
                  { name: 'Enter DFU Mode', hint: 'Puts Mac into DFU mode for low-level access. Hold power + specific keys.', action: () => executeRitual('DFU Entry', ['Follow on-screen instructions...', 'Entering DFU...', 'DFU mode active!'], 1000) },
                  { name: 'Enter Recovery', hint: 'Boots to macOS Recovery for reinstall and utilities', action: () => executeRitual('Recovery Entry', ['Rebooting to recovery...', 'Recovery mode active.'], 800) },
                  { name: 'Scan Diagnostics', hint: 'Checks for all security locks and restrictions', action: () => addConsole('Scanning Mac security status...', 'link') }
                ].map((cmd) => (
                  <button
                    key={cmd.name}
                    onClick={cmd.action}
                    disabled={isRitualActive}
                    className="p-4 rounded-lg bg-grimoire-obsidian border border-purple-500/20 hover:border-purple-500/50 
                      text-left transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <h4 className="font-tech text-purple-400 group-hover:text-purple-300">{cmd.name}</h4>
                    <p className="text-xs text-dark-muted mt-1">{cmd.hint}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Activation Lock Domain */}
          {activeSection === 'activation' && (
            <div className="grimoire-card p-6 space-y-6 animate-fade-in-up border-cyan-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-700/10 flex items-center justify-center text-2xl">
                  🔐
                </div>
                <div>
                  <h3 className="font-grimoire text-xl text-cyan-400">Activation Lock Domain</h3>
                  <p className="text-sm text-dark-muted">Remove iCloud activation lock from Mac</p>
                </div>
              </div>

              {/* Explanation Banner */}
              <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <p className="text-sm text-cyan-300">
                  <strong>What is Mac Activation Lock?</strong> When Find My Mac is enabled, the Mac is locked to the owner's iCloud account. 
                  We bypass this so the Mac can be set up with a new Apple ID.
                </p>
                <p className="text-xs text-dark-muted mt-2">
                  Different methods for: Intel Macs (older), T2 Macs (2018-2020), Apple Silicon (M1+)
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { 
                    id: 'intel-activation',
                    name: 'Intel Mac Activation Bypass', 
                    price: '$149',
                    compatibility: 'MacBook/iMac/Mac Mini 2012-2017 (no T2)',
                    whatItDoes: 'Uses NVRAM modification and serial number techniques to bypass activation on older Intel Macs without T2 security chip. Permanent bypass.',
                    silentHelpers: ['NVRAM editor', 'Serial modifier', 'Activation patcher'],
                    show: chipType === 'intel' || chipType === 'unknown',
                    action: () => executeRitual('Intel Activation Bypass', [
                      'Accessing NVRAM...',
                      'Modifying activation records...',
                      'Patching serial validation...',
                      'Activation lock bypassed!'
                    ], 2000)
                  },
                  { 
                    id: 't2-activation',
                    name: 'T2 Mac Activation Bypass', 
                    price: '$199',
                    compatibility: 'MacBook Pro/Air 2018-2020, iMac Pro, Mac Mini 2018',
                    whatItDoes: 'Bypasses T2 chip security to remove activation lock. Uses checkm8-style exploit on the T2\'s A10 processor to modify activation state.',
                    silentHelpers: ['T2 checkm8', 'DFU exploit', 'Activation bypass'],
                    show: chipType === 't2' || chipType === 'unknown',
                    action: () => executeRitual('T2 Activation Bypass', [
                      'Entering T2 DFU mode...',
                      'Exploiting T2 bootrom...',
                      'Bypassing secure enclave...',
                      'Patching activation...',
                      'Activation lock bypassed!'
                    ], 2500)
                  },
                  { 
                    id: 'silicon-activation',
                    name: 'Apple Silicon Activation Bypass', 
                    price: '$229',
                    compatibility: 'MacBook Air/Pro M1-M4, iMac M1-M4, Mac Mini M1-M4, Mac Studio',
                    whatItDoes: 'Advanced bypass for Apple Silicon Macs. Uses combination of DFU mode exploitation and activation server proxy. Most complex but fully effective.',
                    silentHelpers: ['Silicon DFU', 'Activation proxy', 'Restore bypass'],
                    show: chipType === 'silicon' || chipType === 'unknown',
                    action: () => executeRitual('Silicon Activation Bypass', [
                      'Putting Mac in DFU mode...',
                      'Establishing secure connection...',
                      'Bypassing activation check...',
                      'Restoring macOS with bypass...',
                      'Activation lock removed!'
                    ], 3000)
                  }
                ].filter(e => e.show).map((exploit) => (
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
                          <div className="text-xs text-dark-muted uppercase tracking-wider mb-1">Tools working together:</div>
                          <div className="flex flex-wrap gap-2">
                            {exploit.silentHelpers.map(helper => (
                              <span key={helper} className="px-2 py-1 rounded bg-cyan-500/10 text-xs text-cyan-300">{helper}</span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={exploit.action}
                          disabled={isRitualActive || !obeliskBound}
                          className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 border border-cyan-500/40
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

          {/* EFI/Firmware Domain */}
          {activeSection === 'efi' && (
            <div className="grimoire-card p-6 space-y-6 animate-fade-in-up border-yellow-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-700/10 flex items-center justify-center text-2xl">
                  🛡️
                </div>
                <div>
                  <h3 className="font-grimoire text-xl text-yellow-400">EFI/Firmware Domain</h3>
                  <p className="text-sm text-dark-muted">Remove EFI password and firmware locks</p>
                </div>
              </div>

              {/* Explanation Banner */}
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-yellow-300">
                  <strong>What is EFI Password?</strong> A firmware-level password that prevents booting from external drives, 
                  accessing Recovery mode, or changing startup disk. We remove this completely.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { 
                    id: 'efi-intel',
                    name: 'Intel Mac EFI Unlock', 
                    price: '$129',
                    compatibility: 'All Intel Macs (2006-2020)',
                    whatItDoes: 'Removes EFI firmware password from Intel Macs. Uses hardware-level techniques to clear the password from NVRAM/PRAM. Mac will boot normally without password prompts.',
                    silentHelpers: ['NVRAM reset', 'Firmware patcher', 'EFI cleaner'],
                    action: () => executeRitual('EFI Unlock', [
                      'Accessing firmware...',
                      'Locating password hash...',
                      'Clearing EFI password...',
                      'EFI password removed!'
                    ], 1800)
                  },
                  { 
                    id: 'efi-t2',
                    name: 'T2 Firmware Bypass', 
                    price: '$169',
                    compatibility: 'T2 Macs (2018-2020)',
                    whatItDoes: 'Exploits T2 security chip to remove firmware restrictions. The T2 chip controls EFI security - we bypass it at the hardware level.',
                    silentHelpers: ['T2 exploit', 'Secure enclave bypass', 'Firmware reset'],
                    action: () => executeRitual('T2 Firmware Bypass', [
                      'Entering T2 DFU...',
                      'Running T2 exploit...',
                      'Clearing firmware lock...',
                      'T2 firmware unlocked!'
                    ], 2200)
                  }
                ].map((exploit) => (
                  <div key={exploit.id} className="rounded-lg bg-grimoire-obsidian border border-yellow-500/20 overflow-hidden">
                    <button
                      onClick={() => setExpandedExploit(expandedExploit === exploit.id ? null : exploit.id)}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-yellow-500/5 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-grimoire text-yellow-400">{exploit.name}</h4>
                          <span className="text-xs font-tech text-grimoire-thunder-gold">{exploit.price}</span>
                        </div>
                        <p className="text-xs text-dark-muted mt-1">{exploit.compatibility}</p>
                      </div>
                      <span className="text-dark-muted">{expandedExploit === exploit.id ? '▼' : '▶'}</span>
                    </button>
                    
                    {expandedExploit === exploit.id && (
                      <div className="p-4 border-t border-yellow-500/10 space-y-4 bg-yellow-500/5">
                        <div>
                          <div className="text-xs text-dark-muted uppercase tracking-wider mb-1">What it does:</div>
                          <p className="text-sm text-dark-text">{exploit.whatItDoes}</p>
                        </div>
                        <div>
                          <div className="text-xs text-dark-muted uppercase tracking-wider mb-1">Tools working together:</div>
                          <div className="flex flex-wrap gap-2">
                            {exploit.silentHelpers.map(helper => (
                              <span key={helper} className="px-2 py-1 rounded bg-yellow-500/10 text-xs text-yellow-300">{helper}</span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={exploit.action}
                          disabled={isRitualActive || !obeliskBound}
                          className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/40
                            hover:border-yellow-400 text-yellow-400 font-tech transition-all disabled:opacity-50"
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
                  <p className="text-sm text-dark-muted">Remove corporate/school device management from Mac</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <p className="text-sm text-orange-300">
                  <strong>What is Mac MDM?</strong> Mobile Device Management lets organizations control your Mac - 
                  forcing settings, restricting apps, tracking location. We remove these restrictions completely.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { 
                    id: 'mac-mdm',
                    name: 'Remove Mac MDM Profile', 
                    price: '$89',
                    whatItDoes: 'Removes the MDM configuration profile from macOS. All corporate restrictions are removed - you regain full control. Works on all macOS versions.',
                    silentHelpers: ['Profile remover', 'Enrollment blocker', 'Restriction cleaner'],
                    action: () => executeRitual('MDM Removal', [
                      'Detecting MDM profile...',
                      'Analyzing restrictions...',
                      'Removing management profile...',
                      'Clearing enrollment records...',
                      'MDM removed!'
                    ], 1800)
                  },
                  { 
                    id: 'dep-mac',
                    name: 'DEP Enrollment Bypass', 
                    price: '$99',
                    whatItDoes: 'Skips Apple Business Manager / Device Enrollment Program. Normally forces MDM during setup - we bypass it so you can set up as a personal Mac.',
                    silentHelpers: ['DEP blocker', 'Setup skip', 'Enrollment bypass'],
                    action: () => executeRitual('DEP Bypass', [
                      'Intercepting enrollment...',
                      'Blocking DEP server...',
                      'Skipping enrollment screen...',
                      'DEP bypassed!'
                    ], 1500)
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
                          <div className="text-xs text-dark-muted uppercase tracking-wider mb-1">Tools working together:</div>
                          <div className="flex flex-wrap gap-2">
                            {exploit.silentHelpers.map(helper => (
                              <span key={helper} className="px-2 py-1 rounded bg-orange-500/10 text-xs text-orange-300">{helper}</span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={exploit.action}
                          disabled={isRitualActive || !obeliskBound}
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

          {/* Recovery Chamber */}
          {activeSection === 'recovery' && (
            <div className="grimoire-card p-6 space-y-6 animate-fade-in-up border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-green-700/10 flex items-center justify-center text-2xl">
                  🔧
                </div>
                <div>
                  <h3 className="font-grimoire text-xl text-green-400">Recovery Chamber</h3>
                  <p className="text-sm text-dark-muted">PIN unlock, data recovery, and system restore</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { 
                    id: 'pin-unlock',
                    name: 'Mac PIN/Password Unlock', 
                    price: '$79',
                    whatItDoes: 'Removes or resets the macOS user password/PIN. Gives you access to the Mac without knowing the original password. Works on all macOS versions.',
                    silentHelpers: ['Recovery mode', 'Password reset', 'FileVault bypass'],
                    action: () => executeRitual('PIN Unlock', [
                      'Booting to recovery...',
                      'Accessing user database...',
                      'Resetting password...',
                      'Password cleared!'
                    ], 1500)
                  },
                  { 
                    id: 'data-recovery',
                    name: 'Data Recovery', 
                    price: '$59',
                    whatItDoes: 'Recovers data from Macs that won\'t boot, have corrupted drives, or accidentally deleted files. Uses Time Machine backups or direct disk access.',
                    silentHelpers: ['Disk utility', 'Time Machine', 'File recovery'],
                    action: () => executeRitual('Data Recovery', [
                      'Mounting disk...',
                      'Scanning for files...',
                      'Recovering data...',
                      'Data recovered!'
                    ], 2000)
                  },
                  { 
                    id: 'reinstall',
                    name: 'Clean macOS Install', 
                    price: 'FREE',
                    whatItDoes: 'Erases the Mac and installs a fresh copy of macOS. Use this after removing all locks to get a completely clean Mac.',
                    silentHelpers: ['Internet Recovery', 'Disk erase', 'macOS installer'],
                    action: () => executeRitual('macOS Reinstall', [
                      'Erasing disk...',
                      'Downloading macOS...',
                      'Installing macOS...',
                      'Setup complete!'
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
                          <span className={`text-xs font-tech ${exploit.price === 'FREE' ? 'text-green-400' : 'text-grimoire-thunder-gold'}`}>{exploit.price}</span>
                        </div>
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
                          <div className="text-xs text-dark-muted uppercase tracking-wider mb-1">Tools working together:</div>
                          <div className="flex flex-wrap gap-2">
                            {exploit.silentHelpers.map(helper => (
                              <span key={helper} className="px-2 py-1 rounded bg-green-500/10 text-xs text-green-300">{helper}</span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={exploit.action}
                          disabled={isRitualActive || !obeliskBound}
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
            </div>
          )}
        </div>

        {/* Console Sidebar */}
        <div className="lg:col-span-1">
          <div className="grimoire-card p-4 sticky top-4">
            <h4 className="font-grimoire text-purple-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              Obelisk Terminal
            </h4>
            <div className="bg-black/50 rounded-lg p-3 h-80 overflow-y-auto font-mono text-xs border border-purple-500/20">
              {consoleOutput.length === 0 ? (
                <div className="text-dark-muted italic">Awaiting commands...</div>
              ) : (
                consoleOutput.map((line, i) => (
                  <div key={i} className={`mb-1 ${
                    line.includes('[ritual]') ? 'text-grimoire-phoenix-orange' :
                    line.includes('[link]') ? 'text-purple-400' :
                    'text-grimoire-neon-cyan'
                  }`}>
                    {line}
                  </div>
                ))
              )}
              <span className="animate-pulse text-purple-400">_</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
