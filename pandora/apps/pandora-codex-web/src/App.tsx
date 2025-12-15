/**
 * Pandora Codex - Main Application Component
 * 
 * Multi-tab UI for device management, plugin execution, logs, and settings.
 * Features a dark theme with Tailwind CSS and tab-based navigation.
 */

import { useState, useEffect } from 'react';
import { apiService } from './services/apiService';
import { tetherScryerManager } from './services/tetherScryerManager';
import { useDeviceStore } from './stores/deviceStore';
import type { LogEntry } from './services/apiService';
import { DeviceList } from './components/DeviceList';
import { LogViewer } from './components/LogViewer';
import { ScrollPanel } from './components/ScrollPanel';
import { UnlockIcon } from './components/Icons';
import { LoadingOverlay } from './components/LoadingOverlay';
import { NotificationToast } from './components/NotificationToast';
import { Dashboard } from './components/Dashboard';
import { VelocitySplash } from './components/CoreVelocity';
import { VesselSanctum } from './components/VesselSanctum';
import { WardenSanctum } from './components/WardenSanctum';
import { ObeliskSanctum } from './components/ObeliskSanctum';
import { Utilities } from './components/Utilities';
import { Diagnostics } from './components/Diagnostics';
import { RepairArsenal } from './components/RepairArsenal';
import { DevModePanel } from './components/DevModePanel';
import BobbyDevPanel from './components/BobbyDevPanel';
import { OfflineIndicator } from './components/OfflineIndicator';

/**
 * Tab type definition
 */
type Tab = 'dashboard' | 'devices' | 'utilities' | 'diagnostics' | 'arsenal' | 'devmode' | 'bobby-dev' | 'stormstrike' | 'logs' | 'settings';

/**
 * Main App Component
 */
function App() {
  // State management
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [exploitTab, setExploitTab] = useState<'ios' | 'android' | 'mac'>('ios');

  /**
   * Load initial data and initialize Tether Scryer monitoring
   */
  useEffect(() => {
    // Start Tether Scryer device monitor
    const initializeMonitoring = async () => {
      try {
        // Start backend device monitor (skip if not in Tauri)
        try {
          await apiService.startDeviceMonitor();
        } catch (e) {
          console.warn('Device monitor unavailable (browser preview mode)', e);
        }
        // Initialize Tether Scryer event listeners
        try {
          await tetherScryerManager.initialize();
        } catch (e) {
          console.warn('Tether Scryer unavailable', e);
        }
      } catch (error) {
        console.error('Failed to initialize device monitoring:', error);
        // Don't crash - app continues even if monitoring fails
      }
    };

    // Run initialization but catch any errors to prevent app crash
    initializeMonitoring().catch(err => {
      console.error('[App] Init error (non-fatal):', err);
    });

    // Refresh logs every 2 seconds
    const interval = setInterval(() => {
      setLogs(apiService.getLogs());
    }, 2000);

    return () => {
      clearInterval(interval);
      // Cleanup on unmount - catch dispose errors to ensure cleanup always runs
      tetherScryerManager.dispose().catch(err => {
        console.error('[Tether Scryer] Dispose error:', err);
      });
    };
  }, []);

  /**
   * Load devices from API and update Zustand store
   * Used for manual refresh after device operations (e.g., unlock, recovery mode)
   */
  const loadDevices = async () => {
    try {
      const response = await apiService.listDevices();
      if (response.success && response.data) {
        // Update Zustand store to trigger UI refresh
        useDeviceStore.getState().setDevices(response.data);
        console.log('[App] Manually refreshed devices:', response.data.length, 'devices');
      }
    } catch (error) {
      console.error('Failed to load devices:', error);
    }
  };

  /**
   * Unlock a device
   */
  const handleUnlockDevice = async (deviceId: string, exploitType: string = 'complete_unlock') => {
    setLoading(true);
    try {
      await apiService.unlockDevice(deviceId, exploitType);
      // Refresh devices after unlock
      await loadDevices();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Enter recovery mode on iOS device
   */
  const handleEnterRecoveryMode = async (_deviceId: string, udid: string) => {
    setLoading(true);
    try {
      const response = await apiService.enterRecoveryMode(udid);
      if (response.success) {
        setLogs(apiService.getLogs());
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear logs
   */
  const handleClearLogs = () => {
    apiService.clearLogs();
    setLogs(apiService.getLogs());
  };

  /**
   * Toggle dark mode
   */
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  // Show splash screen on first load
  if (showSplash) {
    return <VelocitySplash onComplete={() => setShowSplash(false)} minDuration={2500} />;
  }

  return (
    <>
      {loading && <LoadingOverlay message="Processing" variant="device" />}
      
      <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
        <div className="min-h-screen bg-grimoire-obsidian text-dark-text">
        {/* Header with cinematic styling */}
        <header className="bg-grimoire-obsidian-light border-b-2 border-grimoire-electric-blue/30 px-6 py-4 shadow-glow-blue/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UnlockIcon size={32} className="text-grimoire-electric-blue animate-pulse-glow" />
              <div>
                <h1 className="text-3xl font-grimoire font-bold text-grimoire-electric-blue">
                  The Pandora Codex
                </h1>
                <p className="text-sm text-grimoire-neon-cyan font-tech mt-1">
                  Ancient Secrets. Modern Power. One Grimoire.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-dark-muted font-tech">v0.1.0</span>
              {loading && (
                <span className="text-sm text-grimoire-electric-blue animate-pulse font-tech">
                  ⚡ Processing...
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Tab Navigation - Cinematic Style */}
        <nav className="bg-grimoire-obsidian-light border-b border-grimoire-electric-blue/20 px-6">
          <div className="flex gap-1">
            {(['dashboard', 'devices', 'utilities', 'diagnostics', 'arsenal', 'devmode', 'bobby-dev', 'stormstrike', 'logs', 'settings'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-6 py-3 font-tech font-medium capitalize transition-all duration-300 border-b-2
                  ${activeTab === tab
                    ? 'border-grimoire-electric-blue text-grimoire-electric-blue shadow-glow-blue/30'
                    : 'border-transparent text-dark-muted hover:text-grimoire-neon-cyan hover:border-grimoire-neon-cyan/50'
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <Dashboard />
          )}

          {/* Devices Tab */}
          {activeTab === 'devices' && (
            <DeviceList 
              onUnlockDevice={handleUnlockDevice} 
              onEnterRecoveryMode={handleEnterRecoveryMode}
              loading={loading} 
            />
          )}

          {/* Utilities Tab */}
          {activeTab === 'utilities' && (
            <Utilities />
          )}

          {/* Diagnostics Tab */}
          {activeTab === 'diagnostics' && (
            <Diagnostics />
          )}

          {/* Repair Arsenal Tab */}
          {activeTab === 'arsenal' && (
            <RepairArsenal />
          )}

          {/* Dev Mode Tab - Bobby Dev Mode Panel */}
          {activeTab === 'devmode' && (
            <DevModePanel />
          )}

          {/* Bobby Dev Tab - Private Creator Arsenal */}
          {activeTab === 'bobby-dev' && (
            <BobbyDevPanel />
          )}

          {/* Stormstrike Actions Tab - Exploit Operations */}
          {activeTab === 'stormstrike' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-grimoire font-bold text-grimoire-electric-blue mb-2">
                    Stormstrike Operations
                  </h2>
                  <p className="text-dark-muted font-tech">
                    Exploit orchestration for iOS, Android, and Mac devices
                  </p>
                </div>
              </div>

              {/* Sanctum Realm Tabs */}
              <div className="flex gap-2 border-b border-grimoire-electric-blue/20 pb-2">
                {[
                  { id: 'ios', label: 'Vessel Sanctum (iOS)', color: 'text-grimoire-electric-blue' },
                  { id: 'android', label: 'Warden Sanctum (Android)', color: 'text-green-400' },
                  { id: 'mac', label: 'Obelisk Sanctum (Mac)', color: 'text-grimoire-abyss-purple' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setExploitTab(tab.id as typeof exploitTab)}
                    className={`
                      px-4 py-2 rounded-t-lg font-tech font-medium transition-all duration-300
                      ${exploitTab === tab.id
                        ? `${tab.color} bg-grimoire-obsidian-light border-b-2 border-current`
                        : 'text-dark-muted hover:text-dark-text'
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Vessel Sanctum (iOS) */}
              {exploitTab === 'ios' && (
                <div className="animate-fade-in-up">
                  <VesselSanctum
                    device={null}
                    onOperationStart={() => setLoading(true)}
                    onOperationComplete={() => setLoading(false)}
                  />
                </div>
              )}

              {/* Warden Sanctum (Android) */}
              {exploitTab === 'android' && (
                <div className="animate-fade-in-up">
                  <WardenSanctum
                    device={null}
                    onOperationStart={() => setLoading(true)}
                    onOperationComplete={() => setLoading(false)}
                  />
                </div>
              )}

              {/* Obelisk Sanctum (Mac) */}
              {exploitTab === 'mac' && (
                <div className="animate-fade-in-up">
                  <ObeliskSanctum
                    device={null}
                    onOperationStart={() => setLoading(true)}
                    onOperationComplete={() => setLoading(false)}
                  />
                </div>
              )}

            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <LogViewer logs={logs} onClear={handleClearLogs} />
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h2 className="text-xl font-grimoire font-semibold text-grimoire-electric-blue">Settings</h2>

              <ScrollPanel theme="default" title="Preferences">
                <div className="space-y-6">
                  {/* Theme Setting */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-grimoire font-semibold text-grimoire-electric-blue">Dark Mode</h3>
                      <p className="text-sm text-dark-muted">Toggle dark theme</p>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                        darkMode ? 'bg-grimoire-electric-blue shadow-glow-blue/50' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                          darkMode ? 'transform translate-x-7' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* About Section */}
                  <div className="pt-6 border-t border-grimoire-electric-blue/20">
                    <h3 className="font-grimoire font-semibold text-grimoire-electric-blue mb-3">About</h3>
                    <div className="space-y-2 text-sm text-dark-muted">
                      <p>
                        <span className="font-medium">Version:</span> 0.1.0
                      </p>
                      <p>
                        <span className="font-medium">License:</span> MIT
                      </p>
                      <p>
                        <span className="font-medium">Repository:</span>{' '}
                        <a
                          href="https://github.com/Bboy9090/The-Pandora-Codex-"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-grimoire-neon-cyan hover:text-grimoire-electric-blue transition-colors duration-300"
                        >
                          GitHub
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="pt-6 border-t border-grimoire-electric-blue/20">
                    <h3 className="font-grimoire font-semibold text-grimoire-electric-blue mb-3">System Information</h3>
                    <div className="space-y-2 text-sm text-dark-muted">
                      <p>
                        <span className="font-medium">Backend:</span> Rust + Tokio
                      </p>
                      <p>
                        <span className="font-medium">Frontend:</span> React + TypeScript + Tauri
                      </p>
                      <p>
                        <span className="font-medium">UI Framework:</span> Tailwind CSS + Cinematic Theme
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollPanel>
            </div>
          )}
        </main>
      </div>
      </div>
      <NotificationToast />
      <OfflineIndicator />
    </>
  );
}

export default App;
