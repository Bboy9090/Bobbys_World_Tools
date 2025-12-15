/**
 * DevModePanel - Bobby Dev Mode Style Diagnostics
 * 
 * Modules: Dossier, Warhammer, Dark Lab, Forbidden Chamber, Fastboot, Recovery
 * Brand profiles: Samsung, Pixel, Motorola, Xiaomi, OnePlus, Generic AOSP
 */

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';

type DevModule = 'dossier' | 'warhammer' | 'darklab' | 'forbidden' | 'fastboot' | 'recovery';
type BrandProfile = 'samsung' | 'pixel' | 'motorola' | 'xiaomi' | 'oneplus' | 'generic';

interface DeviceProfile {
  id: BrandProfile;
  name: string;
  brand: string;
  icon: string;
  color: string;
  notes: string;
}

const PROFILE_ICONS: Record<string, string> = {
  samsung: '🏛️',
  pixel: '💎',
  motorola: '🦇',
  xiaomi: '🔶',
  oneplus: '🔴',
  generic: '🤖',
};

const PROFILE_COLORS: Record<string, string> = {
  samsung: 'blue',
  pixel: 'green',
  motorola: 'cyan',
  xiaomi: 'orange',
  oneplus: 'red',
  generic: 'green',
};

const MODULE_ICONS: Record<string, string> = {
  dossier: '📋',
  warhammer: '🪓',
  darklab: '🔬',
  forbidden: '🔮',
  fastboot: '⚙️',
  recovery: '💾',
};

export function DevModePanel() {
  const [profiles, setProfiles] = useState<DeviceProfile[]>([]);
  const [modules, setModules] = useState<{ id: string; name: string; description: string }[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<BrandProfile>('generic');
  const [activeModule, setActiveModule] = useState<DevModule>('dossier');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([
    '[BOBBY] Dev Mode initialized...',
    '[BOBBY] Loading profiles from server...'
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');

  const addConsole = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleOutput(prev => [...prev.slice(-100), `[${timestamp}] ${msg}`]);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profilesRes, modulesRes, devicesRes] = await Promise.all([
          apiService.getDevModeProfiles(),
          apiService.getDevModeModules(),
          apiService.getConnectedAdbDevices(),
        ]);

        if (profilesRes.success && profilesRes.data) {
          const enrichedProfiles = profilesRes.data.map(p => ({
            ...p,
            icon: PROFILE_ICONS[p.id] || '🤖',
            color: PROFILE_COLORS[p.id] || 'green',
          }));
          setProfiles(enrichedProfiles);
          addConsole(`[BOBBY] Loaded ${enrichedProfiles.length} device profiles.`);
        }

        if (modulesRes.success && modulesRes.data) {
          setModules(modulesRes.data);
          addConsole(`[BOBBY] Loaded ${modulesRes.data.length} diagnostic modules.`);
        }

        if (devicesRes.success && devicesRes.data) {
          setConnectedDevices(devicesRes.data);
          if (devicesRes.data.length > 0) {
            setSelectedDevice(devicesRes.data[0].serial);
            addConsole(`[BOBBY] Found ${devicesRes.data.length} connected device(s).`);
          } else {
            addConsole('[BOBBY] No ADB devices connected. Connect a device via USB to run commands.');
          }
        } else {
          addConsole('[ERROR] Failed to scan for devices. Check backend connection.');
        }

        addConsole('[BOBBY] Ready. Select a profile and module to begin.');
      } catch (err) {
        addConsole('[ERROR] Failed to load configuration from server.');
      }
    };

    loadData();
  }, [addConsole]);

  const refreshDevices = async () => {
    addConsole('[BOBBY] Scanning for connected devices...');
    try {
      const res = await apiService.getConnectedAdbDevices();
      if (res.success && res.data) {
        setConnectedDevices(res.data);
        if (res.data.length > 0) {
          if (!selectedDevice) {
            setSelectedDevice(res.data[0].serial);
          }
          addConsole(`[BOBBY] Found ${res.data.length} device(s): ${res.data.map(d => d.model || d.serial).join(', ')}`);
        } else {
          addConsole('[BOBBY] No devices found. Connect a device via USB and enable ADB.');
        }
      }
    } catch (err) {
      addConsole('[ERROR] Device scan failed.');
    }
  };

  const runModule = async () => {
    const profile = profiles.find(p => p.id === selectedProfile);
    const module = modules.find(m => m.id === activeModule);
    
    if (!profile || !module) {
      addConsole('[ERROR] Profile or module not found.');
      return;
    }

    if (!selectedDevice && connectedDevices.length === 0) {
      addConsole('[ERROR] No device connected. Connect an Android device via USB first.');
      return;
    }

    setIsRunning(true);
    addConsole(`[RUN] ${module.name} on ${profile.name}${selectedDevice ? ` (${selectedDevice})` : ''}`);

    try {
      const result = await apiService.runDevModeModule(
        selectedProfile,
        activeModule,
        selectedDevice || undefined
      );

      if (result.success && result.data) {
        const lines: string[] = result.data.output?.split('\n') || [];
        lines.forEach((line: string) => {
          if (line.trim()) {
            addConsole(line);
          }
        });
        addConsole(`[COMPLETE] ${module.name} finished at ${result.data.timestamp}`);
      } else {
        addConsole(`[ERROR] Module execution failed: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      addConsole(`[ERROR] Failed to execute module: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runAdbCommand = async (command: string) => {
    addConsole(`$ ${command}`);
    setIsRunning(true);
    try {
      const result = await apiService.runDevModeAdb(command, selectedDevice || undefined);
      if (result.success && result.data) {
        if (result.data.output) {
          const lines: string[] = result.data.output.split('\n');
          lines.forEach((line: string) => {
            if (line.trim()) addConsole(line);
          });
        }
        if (result.data.error) {
          addConsole(`[ERROR] ${result.data.error}`);
        }
      }
    } catch (err) {
      addConsole(`[ERROR] ${err}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runDebloat = async () => {
    const profile = profiles.find(p => p.id === selectedProfile);
    if (!profile) return;

    setIsRunning(true);
    addConsole(`[WARHAMMER] Running debloat for ${profile.name}...`);

    try {
      const result = await apiService.runDevModeDebloat(
        selectedProfile,
        selectedDevice || undefined
      );

      if (result.success && result.data) {
        addConsole(`[WARHAMMER] Debloat complete: ${result.data.successCount} succeeded, ${result.data.failCount} failed.`);
        result.data.results?.forEach((r: any) => {
          const status = r.success ? '✓' : '✗';
          addConsole(`  ${status} ${r.pkg}: ${r.message}`);
        });
      }
    } catch (err) {
      addConsole(`[ERROR] ${err}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getProfileColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'from-blue-500/30 to-blue-700/20 border-blue-500/50 hover:border-blue-400',
      green: 'from-green-500/30 to-green-700/20 border-green-500/50 hover:border-green-400',
      cyan: 'from-cyan-500/30 to-cyan-700/20 border-cyan-500/50 hover:border-cyan-400',
      orange: 'from-orange-500/30 to-orange-700/20 border-orange-500/50 hover:border-orange-400',
      red: 'from-red-500/30 to-red-700/20 border-red-500/50 hover:border-red-400',
    };
    return colors[color] || colors.green;
  };

  const profile = profiles.find(p => p.id === selectedProfile);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-grimoire-obsidian-light/80 to-grimoire-obsidian/50 border border-green-500/30">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🔧</div>
          <div>
            <h2 className="text-xl font-grimoire font-bold text-green-400">Bobby Dev Mode</h2>
            <p className="text-xs text-dark-muted font-tech">Android Device Development Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {connectedDevices.length > 0 && (
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="bg-black/30 border border-green-500/30 rounded-lg px-3 py-1 text-xs text-white font-tech"
            >
              {connectedDevices.map((d) => (
                <option key={d.serial} value={d.serial}>
                  {d.model || d.device || d.serial}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={refreshDevices}
            className="px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-tech hover:bg-green-500/30 transition-colors"
          >
            Scan Devices
          </button>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isRunning ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-green-500/10 border-green-500/30'} border`}>
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`} />
            <span className={`${isRunning ? 'text-yellow-400' : 'text-green-400'} text-xs font-tech`}>
              {isRunning ? 'Running...' : connectedDevices.length > 0 ? 'Connected' : 'No Device'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
        {profiles.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedProfile(p.id as BrandProfile)}
            className={`p-3 rounded-xl border-2 transition-all duration-300 text-center
              ${selectedProfile === p.id 
                ? `bg-gradient-to-br ${getProfileColorClass(p.color)} scale-105` 
                : 'bg-grimoire-obsidian-light/50 border-gray-700 hover:border-gray-500'}`}
          >
            <div className="text-2xl mb-1">{p.icon}</div>
            <div className="text-xs font-tech text-white truncate">{p.name.split(' ')[0]}</div>
          </button>
        ))}
      </div>

      {profile && (
        <div className={`p-3 rounded-xl border bg-gradient-to-br ${getProfileColorClass(profile.color)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{profile.icon}</span>
              <span className="font-grimoire font-semibold text-white">{profile.name}</span>
            </div>
            <span className="text-xs text-dark-muted font-tech px-2 py-1 rounded bg-black/20">
              {profile.brand}
            </span>
          </div>
          <p className="text-xs text-dark-muted mt-2">{profile.notes}</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {modules.map((mod) => (
          <button
            key={mod.id}
            onClick={() => setActiveModule(mod.id as DevModule)}
            className={`p-3 rounded-xl border transition-all duration-300 text-left
              ${activeModule === mod.id 
                ? 'bg-gradient-to-br from-green-500/30 to-green-700/20 border-green-500 shadow-lg shadow-green-500/20' 
                : 'bg-grimoire-obsidian-light/50 border-gray-700 hover:border-green-500/50'}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{MODULE_ICONS[mod.id] || '📦'}</span>
              <span className="font-tech text-sm text-white">{mod.name}</span>
            </div>
            <p className="text-xs text-dark-muted">{mod.description}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={runModule}
          disabled={isRunning}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-500 text-white font-tech font-bold
            hover:from-green-500 hover:to-green-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
            shadow-lg shadow-green-500/30"
        >
          {isRunning ? '⏳ Running...' : '▶ Run Module'}
        </button>
        {activeModule === 'warhammer' && (
          <button
            onClick={runDebloat}
            disabled={isRunning}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-tech font-bold
              hover:from-red-500 hover:to-orange-400 transition-all duration-300 disabled:opacity-50"
          >
            🪓 Execute Debloat
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={() => runAdbCommand('adb devices -l')} className="px-3 py-1 rounded bg-gray-700 text-xs text-white hover:bg-gray-600 font-tech">devices</button>
        <button onClick={() => runAdbCommand('adb shell getprop ro.product.model')} className="px-3 py-1 rounded bg-gray-700 text-xs text-white hover:bg-gray-600 font-tech">model</button>
        <button onClick={() => runAdbCommand('adb shell dumpsys battery')} className="px-3 py-1 rounded bg-gray-700 text-xs text-white hover:bg-gray-600 font-tech">battery</button>
        <button onClick={() => runAdbCommand('adb reboot')} className="px-3 py-1 rounded bg-red-700 text-xs text-white hover:bg-red-600 font-tech">reboot</button>
      </div>

      <div className="rounded-xl border border-gray-700 bg-black/50 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-gray-800/50 border-b border-gray-700">
          <span className="text-xs font-tech text-green-400">Console Output</span>
          <button
            onClick={() => setConsoleOutput(['[BOBBY] Console cleared.'])}
            className="text-xs text-dark-muted hover:text-white font-tech"
          >
            Clear
          </button>
        </div>
        <div className="h-64 overflow-y-auto p-3 font-mono text-xs text-green-300 space-y-0.5">
          {consoleOutput.map((line, i) => (
            <div key={i} className={`
              ${line.includes('[ERROR]') ? 'text-red-400' : ''}
              ${line.includes('[RUN]') || line.includes('[COMPLETE]') ? 'text-cyan-400' : ''}
              ${line.includes('[BOBBY]') ? 'text-yellow-400' : ''}
              ${line.startsWith('$') ? 'text-blue-400' : ''}
            `}>
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
