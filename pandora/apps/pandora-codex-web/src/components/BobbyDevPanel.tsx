/**
 * Bobby Dev Panel - Private Creator Arsenal GUI
 *
 * SECURITY: Access controlled via backend authentication
 * Only visible and functional for authorized creator
 */

import { useState, useEffect } from 'react';
import { Play, Lock, Unlock, Search, Shield, AlertTriangle, Wrench } from 'lucide-react';

interface DeviceInfo {
  serial: string;
  platform: string;
  model: string;
  version?: string;
  chipset?: string;
  bootloader_locked?: boolean;
  frp_locked?: boolean;
  activation_locked?: boolean;
  connection_type?: string;
}

interface Recommendation {
  tool: string;
  category: string;
  reason: string;
  priority: 'high' | 'medium' | 'low' | 'info';
  warning?: string;
  compatibility?: string;
  module?: string;
}

interface ToolInfo {
  id: string;
  name: string;
  category: 'ios' | 'android' | 'utility';
  description: string;
  icon: string;
}

const BOBBY_DEV_TOOLS: ToolInfo[] = [
  { id: 'checkra1n', name: 'Checkra1n', category: 'ios', description: 'Official checkm8 jailbreak (A5-A11, iOS 12-14)', icon: '📱' },
  { id: 'palera1n', name: 'Palera1n', category: 'ios', description: 'iOS 15-16 jailbreak (A8-A11)', icon: '🔓' },
  { id: 'lockra1n', name: 'Lockra1n', category: 'ios', description: 'Checkm8-based jailbreak (A5-A11)', icon: '🔐' },
  { id: 'openbypass', name: 'OpenBypass', category: 'ios', description: 'Activation lock bypass resources', icon: '🆘' },
  { id: 'minacriss', name: 'MinaCriss', category: 'ios', description: 'Advanced bypass for A12+ (iPhone XS and newer)', icon: '⚡' },
  { id: 'iremovaltools', name: 'iRemovalTools', category: 'ios', description: 'Comprehensive bypass suite (All chipsets)', icon: '🔧' },
  { id: 'broque_ramdisk', name: 'Broque Ramdisk', category: 'ios', description: 'Ramdisk-based bypass (A12-A17)', icon: '💿' },

  // Android
  { id: 'frp_bypass', name: 'FRP Bypass', category: 'android', description: 'Factory Reset Protection bypass', icon: '🛡️' },
  { id: 'magisk', name: 'Magisk', category: 'android', description: 'Universal Android root manager', icon: '⚡' },
  { id: 'twrp', name: 'TWRP', category: 'android', description: 'Custom recovery loader', icon: '💾' },
  { id: 'apk_helpers', name: 'APK Helpers', category: 'android', description: 'APK manipulation utilities', icon: '📦' },

  // Utilities
  { id: 'device_detect', name: 'Device Detector', category: 'utility', description: 'Auto-detect and recommend exploits', icon: '🔍' },
  { id: 'asset_manager', name: 'Asset Manager', category: 'utility', description: 'Manage tools and payloads', icon: '🗂️' }
];

export default function BobbyDevPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'tools' | 'detect' | 'assets'>('detect');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [toolOutput, setToolOutput] = useState('');

  const [detectedDevices, setDetectedDevices] = useState<DeviceInfo[]>([]);
  const [recommendations, setRecommendations] = useState<Record<string, Recommendation[]>>({});
  const [detecting, setDetecting] = useState(false);

  // Authentication check
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/bobby-dev/check-auth', { credentials: 'include' });
      if (response.ok) setAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      const response = await fetch('/api/bobby-dev/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok) {
        setAuthenticated(true);
        setPassword('');
      } else {
        setAuthError(data.error || 'Authentication failed');
      }
    } catch (error) {
      setAuthError('Connection error. Check backend.');
    } finally {
      setLoading(false);
    }
  };

  const detectDevices = async () => {
    setDetecting(true);
    setToolOutput('🔍 Scanning for connected devices...\n');

    try {
      const response = await fetch('/api/bobby-dev/detect-devices', { credentials: 'include' });
      const data = await response.json();

      if (response.ok && data.devices) {
        setDetectedDevices(data.devices);
        setRecommendations(data.recommendations || {});

        let output = `✅ Found ${data.devices.length} device(s)\n\n`;

        data.devices.forEach((device: DeviceInfo) => {
          output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          output += `📱 ${device.platform.toUpperCase()} Device\n`;
          output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          output += `Serial: ${device.serial}\n`;
          output += `Model: ${device.model}\n`;
          if (device.version) output += `Version: ${device.version}\n`;
          if (device.chipset) output += `Chipset: ${device.chipset}\n`;

          output += `\nSecurity Status:\n`;
          if (device.bootloader_locked !== undefined)
            output += `  Bootloader: ${device.bootloader_locked ? '🔒 Locked' : '🔓 Unlocked'}\n`;
          if (device.frp_locked !== undefined)
            output += `  FRP: ${device.frp_locked ? '🔒 Locked' : '🔓 Unlocked'}\n`;
          if (device.activation_locked !== undefined)
            output += `  Activation: ${device.activation_locked ? '🔒 Locked' : '🔓 Unlocked'}\n`;

          const recs = data.recommendations[device.serial] || [];
          if (recs.length > 0) {
            output += `\n📋 Recommendations:\n`;

            recs.forEach((rec: Recommendation, idx: number) => {
              const priorityIcon = { high: '🔴', medium: '🟡', low: '🟢', info: 'ℹ️' }[rec.priority];
              output += `\n${idx + 1}. ${priorityIcon} ${rec.tool.toUpperCase()}\n`;
              output += `   Reason: ${rec.reason}\n`;
              if (rec.warning) output += `   ⚠️ ${rec.warning}\n`;
            });
          }

          output += `\n`;
        });

        setToolOutput(output);
      } else {
        setToolOutput(
          '❌ No devices detected or detection failed\n\nTroubleshooting:\n- Enable USB debugging (Android)\n- Trust computer (iOS)\n- Check USB cable\n- Install device drivers'
        );
      }
    } catch (error) {
      setToolOutput(`❌ Error: ${error}\n\nMake sure backend is running.`);
    } finally {
      setDetecting(false);
    }
  };

  const runTool = async (toolId: string) => {
    setSelectedTool(toolId);
    setToolOutput(`🔧 Loading ${toolId}...\n`);

    try {
      const response = await fetch('/api/bobby-dev/tool-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tool: toolId })
      });

      const data = await response.json();

      if (response.ok) {
        setToolOutput(data.usage_guide || data.info || 'Tool loaded successfully');
      } else {
        setToolOutput(`❌ Error: ${data.error || 'Failed to load tool'}`);
      }
    } catch (error) {
      setToolOutput(`❌ Error: ${error}`);
    }
  };

  // --- AUTH SCREEN ---
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">

          {/* Banner */}
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-200">
                <p className="font-semibold mb-1">PRIVATE CREATOR ACCESS</p>
                <p>This area contains device exploitation tools. Unauthorized access is prohibited.</p>
              </div>
            </div>
          </div>

          {/* Auth Card */}
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/20 rounded-full mb-4">
                <Lock className="w-8 h-8 text-cyan-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Bobby Dev Arsenal</h1>
              <p className="text-slate-400">Creator Authentication Required</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Creator Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  placeholder="Enter password"
                  required
                />
              </div>

              {authError && (
                <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 text-sm text-red-200">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 text-white font-semibold py-3 rounded-lg flex justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Unlock className="w-5 h-5" />
                    Authenticate
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-700 text-xs text-slate-500 text-center">
              Environment variable BOBBY_CREATOR=1 also grants access
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-slate-800 rounded-xl shadow-2xl border border-cyan-500/30 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-7 h-7 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Bobby Dev Arsenal</h1>
                <p className="text-slate-400">Private Creator Tools — Device Exploitation & Bypass</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Authenticated
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 mb-6">
          <div className="flex border-b border-slate-700">

            <button
              onClick={() => setActiveTab('detect')}
              className={`flex-1 px-6 py-4 ${
                activeTab === 'detect'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-900/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
              }`}
            >
              <Search className="w-5 h-5 inline mr-2" />
              Device Detection
            </button>

            <button
              onClick={() => setActiveTab('tools')}
              className={`flex-1 px-6 py-4 ${
                activeTab === 'tools'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-900/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
              }`}
            >
              <Wrench className="w-5 h-5 inline mr-2" />
              Tools & Exploits
            </button>

            <button
              onClick={() => setActiveTab('assets')}
              className={`flex-1 px-6 py-4 ${
                activeTab === 'assets'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-900/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
              }`}
            >
              <Play className="w-5 h-5 inline mr-2" />
              Asset Manager
            </button>

          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-12 gap-6">

          {/* LEFT PANEL */}
          <div className="col-span-4 space-y-4">
            {activeTab === 'detect' && (
              <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Device Scanner</h2>

                <button
                  onClick={detectDevices}
                  disabled={detecting}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 text-white font-semibold py-3 rounded-lg flex justify-center gap-2"
                >
                  {detecting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Scan for Devices
                    </>
                  )}
                </button>

                {detectedDevices.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-slate-400 mb-3">Detected Devices</h3>
                    <div className="space-y-2">
                      {detectedDevices.map((device, idx) => (
                        <div key={idx} className="bg-slate-900 rounded-lg p-3 border border-slate-700">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">{device.platform.toUpperCase()}</span>
                            <span className="text-xs text-slate-400">{device.connection_type}</span>
                          </div>
                          <div className="text-xs text-slate-400">{device.model}</div>
                          {recommendations[device.serial]?.length > 0 && (
                            <div className="mt-2 text-xs text-cyan-400">
                              {recommendations[device.serial].length} recommendation(s)
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tools' && (
              <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Available Tools</h2>

                {/* iOS */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-400 mb-3">iOS Exploits</h3>
                  <div className="space-y-2">
                    {BOBBY_DEV_TOOLS.filter(t => t.category === 'ios').map(tool => (
                      <button
                        key={tool.id}
                        onClick={() => runTool(tool.id)}
                        className={`w-full text-left p-3 rounded-lg ${
                          selectedTool === tool.id ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{tool.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{tool.name}</div>
                            <div className="text-xs opacity-75">{tool.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Android */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-400 mb-3">Android Tools</h3>
                  <div className="space-y-2">
                    {BOBBY_DEV_TOOLS.filter(t => t.category === 'android').map(tool => (
                      <button
                        key={tool.id}
                        onClick={() => runTool(tool.id)}
                        className={`w-full text-left p-3 rounded-lg ${
                          selectedTool === tool.id ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{tool.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{tool.name}</div>
                            <div className="text-xs opacity-75">{tool.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Utilities */}
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-3">Utilities</h3>
                  <div className="space-y-2">
                    {BOBBY_DEV_TOOLS.filter(t => t.category === 'utility').map(tool => (
                      <button
                        key={tool.id}
                        onClick={() => runTool(tool.id)}
                        className={`w-full text-left p-3 rounded-lg ${
                          selectedTool === tool.id ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{tool.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{tool.name}</div>
                            <div className="text-xs opacity-75">{tool.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'assets' && (
              <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Asset Categories</h2>
                <div className="space-y-2">
                  {['APKs', 'Binaries', 'Images', 'Firmware', 'Scripts', 'Payloads'].map(category => (
                    <button
                      key={category}
                      className="w-full text-left p-3 rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-700"
                    >
                      <div className="font-medium text-sm">{category}</div>
                      <div className="text-xs text-slate-500 mt-1">0 items</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="col-span-8">
            <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700 p-6 h-[600px] flex flex-col">
              <h2 className="text-lg font-semibold text-white mb-4">Output Terminal</h2>

              <div className="flex-1 bg-slate-900 rounded-lg p-4 overflow-y-auto font-mono text-sm text-slate-300">
                <pre className="whitespace-pre-wrap">
                  {toolOutput || 'Select a tool or scan for devices to get started...'}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-200">
              <p className="font-semibold mb-1">⚠️ LEGAL NOTICE</p>
              <p>Only use these tools on devices you legally own. Unauthorized use may violate laws. You are responsible for your actions.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
