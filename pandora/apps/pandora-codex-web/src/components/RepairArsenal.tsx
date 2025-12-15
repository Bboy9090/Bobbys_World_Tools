import React, { useState, useEffect } from 'react';
import { useDeviceStore } from '../stores/deviceStore';

interface ToolInfo {
  name: string;
  available: boolean;
  version?: string;
}

interface AdapterCapability {
  name: string;
  description: string;
  category: string;
  requires_device: boolean;
}

interface AdapterInfo {
  name: string;
  platforms: string[];
  capabilities: AdapterCapability[];
}

type ArsenalTab = 'overview' | 'samsung' | 'apple' | 'android' | 'firmware';

const getApiBase = (): string => {
  if (typeof window === 'undefined') return 'http://localhost:8000';
  const { hostname, port, protocol } = window.location;
  if ((hostname === 'localhost' || hostname === '127.0.0.1') && port === '5000') {
    return 'http://localhost:8000';
  }
  if (hostname.includes('replit') || hostname.includes('riker')) {
    return `${protocol}//${hostname.replace(':5000', '')}:8000`;
  }
  return '';
};

export const RepairArsenal: React.FC = () => {
  const devicesWithHistory = useDeviceStore((state: any) => state.devicesWithHistory);
  const [activeTab, setActiveTab] = useState<ArsenalTab>('overview');
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [adapters, setAdapters] = useState<AdapterInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [_deviceInfo, setDeviceInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [operationResult, setOperationResult] = useState<any>(null);

  const API_BASE = getApiBase();

  useEffect(() => {
    loadTools();
    loadAdapters();
  }, []);

  useEffect(() => {
    if (devicesWithHistory.length > 0 && !selectedDevice) {
      setSelectedDevice(devicesWithHistory[0].unique_key);
    }
  }, [devicesWithHistory, selectedDevice]);

  const loadTools = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/arsenal/tools`);
      const data = await response.json();
      if (data.success) {
        setTools(data.tools);
      }
    } catch (error) {
      console.error('Failed to load tools:', error);
    }
  };

  const loadAdapters = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/arsenal/adapters`);
      const data = await response.json();
      if (data.success) {
        setAdapters(data.adapters);
      }
    } catch (error) {
      console.error('Failed to load adapters:', error);
    }
  };

  const runOperation = async (endpoint: string) => {
    const serial = getDeviceSerial();
    if (!serial) {
      setOperationResult({ success: false, error: 'No device selected or device has no serial' });
      return;
    }
    
    setIsLoading(true);
    setOperationResult(null);
    try {
      // Build the full endpoint URL with proper serial substitution
      const fullEndpoint = endpoint.replace('{serial}', encodeURIComponent(serial))
                                   .replace('{udid}', encodeURIComponent(serial));
      const response = await fetch(`${API_BASE}${fullEndpoint}`);
      const data = await response.json();
      setOperationResult(data);
      if (data.info) {
        setDeviceInfo(data.info);
      }
    } catch (error: any) {
      setOperationResult({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceSerial = (): string => {
    const device = devicesWithHistory.find((d: any) => d.unique_key === selectedDevice);
    return device?.serial || device?.id || '';
  };

  const tabConfig = [
    { id: 'overview', label: 'Overview', icon: '🔧', color: 'text-grimoire-electric-blue' },
    { id: 'samsung', label: 'Samsung', icon: '📱', color: 'text-blue-400' },
    { id: 'apple', label: 'Apple', icon: '🍎', color: 'text-gray-300' },
    { id: 'android', label: 'Android', icon: '🤖', color: 'text-green-400' },
    { id: 'firmware', label: 'Firmware', icon: '💾', color: 'text-orange-400' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-grimoire-void to-grimoire-deep-shadow p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-tech font-bold text-grimoire-electric-blue mb-2">
            Repair Arsenal
          </h1>
          <p className="text-grimoire-silver/60 font-tech">
            Professional repair tools inspired by 3uTools, SamFW Tool, and UAT Pro
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-grimoire-electric-blue/20 pb-2">
          {tabConfig.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ArsenalTab)}
              className={`px-4 py-2 rounded-t-lg font-tech font-medium transition-all duration-300 flex items-center gap-2
                ${activeTab === tab.id
                  ? `${tab.color} bg-grimoire-obsidian-light border-b-2 border-current`
                  : 'text-dark-muted hover:text-dark-text'
                }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Device Selector */}
        <div className="bg-grimoire-deep-shadow/50 border border-grimoire-electric-blue/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-grimoire-silver font-tech text-sm">Target Device:</label>
            <select
              value={selectedDevice}
              onChange={(e) => {
                setSelectedDevice(e.target.value);
                setDeviceInfo(null);
                setOperationResult(null);
              }}
              className="flex-1 px-4 py-2 bg-grimoire-void border border-grimoire-electric-blue/40 rounded
                         text-grimoire-electric-blue font-tech focus:outline-none focus:border-grimoire-electric-blue"
            >
              <option value="">-- Select a device --</option>
              {devicesWithHistory.map((device: any) => (
                <option key={device.unique_key} value={device.unique_key}>
                  {device.model || device.type} ({device.serial || device.id})
                </option>
              ))}
            </select>
            {isLoading && (
              <span className="text-grimoire-electric-blue animate-pulse font-tech">
                Processing...
              </span>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in-up">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Available Tools */}
              <div className="bg-grimoire-deep-shadow/50 border border-grimoire-electric-blue/20 rounded-lg p-6">
                <h2 className="text-xl font-tech font-bold text-grimoire-electric-blue mb-4">
                  Available Tools
                </h2>
                <div className="space-y-2">
                  {tools.map((tool, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-grimoire-electric-blue/10 last:border-0">
                      <span className="font-tech text-grimoire-silver">{tool.name}</span>
                      <div className="flex items-center gap-2">
                        {tool.version && (
                          <span className="text-xs text-grimoire-silver/50 font-mono">{tool.version}</span>
                        )}
                        <span className={`w-3 h-3 rounded-full ${tool.available ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                    </div>
                  ))}
                  {tools.length === 0 && (
                    <p className="text-grimoire-silver/50 font-tech text-sm">
                      Loading tools...
                    </p>
                  )}
                </div>
              </div>

              {/* Brand Adapters */}
              <div className="bg-grimoire-deep-shadow/50 border border-grimoire-electric-blue/20 rounded-lg p-6">
                <h2 className="text-xl font-tech font-bold text-grimoire-electric-blue mb-4">
                  Brand Adapters
                </h2>
                <div className="space-y-4">
                  {adapters.map((adapter, idx) => (
                    <div key={idx} className="border-b border-grimoire-electric-blue/10 pb-4 last:border-0">
                      <h3 className="font-tech font-bold text-grimoire-silver mb-2">{adapter.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        {adapter.capabilities?.slice(0, 3).map((cap: any, capIdx: number) => (
                          <span key={capIdx} className="px-2 py-1 bg-grimoire-void/50 rounded text-xs font-tech text-grimoire-silver/70">
                            {cap.name}
                          </span>
                        ))}
                        {adapter.capabilities?.length > 3 && (
                          <span className="px-2 py-1 bg-grimoire-void/50 rounded text-xs font-tech text-grimoire-silver/50">
                            +{adapter.capabilities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="md:col-span-2 bg-grimoire-deep-shadow/50 border border-grimoire-electric-blue/20 rounded-lg p-6">
                <h2 className="text-xl font-tech font-bold text-grimoire-electric-blue mb-4">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => runOperation(`/api/arsenal/device/{serial}/info`)}
                    disabled={!selectedDevice || isLoading}
                    className="p-4 bg-grimoire-void/50 border border-grimoire-electric-blue/30 rounded-lg
                               hover:bg-grimoire-electric-blue/10 hover:border-grimoire-electric-blue/50
                               transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-2xl mb-2 block">📋</span>
                    <span className="font-tech text-sm text-grimoire-silver">Get Device Info</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('samsung')}
                    className="p-4 bg-grimoire-void/50 border border-blue-500/30 rounded-lg
                               hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-300"
                  >
                    <span className="text-2xl mb-2 block">📱</span>
                    <span className="font-tech text-sm text-grimoire-silver">Samsung Tools</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('apple')}
                    className="p-4 bg-grimoire-void/50 border border-gray-400/30 rounded-lg
                               hover:bg-gray-400/10 hover:border-gray-400/50 transition-all duration-300"
                  >
                    <span className="text-2xl mb-2 block">🍎</span>
                    <span className="font-tech text-sm text-grimoire-silver">Apple Tools</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('android')}
                    className="p-4 bg-grimoire-void/50 border border-green-500/30 rounded-lg
                               hover:bg-green-500/10 hover:border-green-500/50 transition-all duration-300"
                  >
                    <span className="text-2xl mb-2 block">🤖</span>
                    <span className="font-tech text-sm text-grimoire-silver">Android Tools</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Samsung Tab */}
          {activeTab === 'samsung' && (
            <div className="space-y-6">
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-6">
                <h2 className="text-xl font-tech font-bold text-blue-400 mb-4">
                  Samsung Tools (SamFW Style)
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => runOperation(`/api/arsenal/samsung/{serial}/info`)}
                    disabled={!selectedDevice || isLoading}
                    className="p-4 bg-grimoire-void/50 border border-blue-500/30 rounded-lg
                               hover:bg-blue-500/10 transition-all duration-300 disabled:opacity-50"
                  >
                    <span className="text-2xl mb-2 block">📋</span>
                    <span className="font-tech text-sm text-grimoire-silver">Device Info</span>
                  </button>
                  <button
                    onClick={() => runOperation(`/api/arsenal/samsung/{serial}/knox`)}
                    disabled={!selectedDevice || isLoading}
                    className="p-4 bg-grimoire-void/50 border border-blue-500/30 rounded-lg
                               hover:bg-blue-500/10 transition-all duration-300 disabled:opacity-50"
                  >
                    <span className="text-2xl mb-2 block">🛡️</span>
                    <span className="font-tech text-sm text-grimoire-silver">Knox Status</span>
                  </button>
                  <button
                    onClick={() => runOperation(`/api/arsenal/android/{serial}/frp`)}
                    disabled={!selectedDevice || isLoading}
                    className="p-4 bg-grimoire-void/50 border border-blue-500/30 rounded-lg
                               hover:bg-blue-500/10 transition-all duration-300 disabled:opacity-50"
                  >
                    <span className="text-2xl mb-2 block">🔒</span>
                    <span className="font-tech text-sm text-grimoire-silver">FRP Check</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('firmware')}
                    className="p-4 bg-grimoire-void/50 border border-blue-500/30 rounded-lg
                               hover:bg-blue-500/10 transition-all duration-300"
                  >
                    <span className="text-2xl mb-2 block">💾</span>
                    <span className="font-tech text-sm text-grimoire-silver">Firmware Lookup</span>
                  </button>
                </div>
              </div>

              {/* Samsung Regions Reference */}
              <div className="bg-grimoire-deep-shadow/50 border border-grimoire-electric-blue/20 rounded-lg p-6">
                <h3 className="text-lg font-tech font-bold text-grimoire-silver mb-4">
                  Samsung CSC Region Codes
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
                  {[
                    ['XAA', 'USA (Unlocked)'],
                    ['TMB', 'USA (T-Mobile)'],
                    ['ATT', 'USA (AT&T)'],
                    ['VZW', 'USA (Verizon)'],
                    ['BTU', 'UK'],
                    ['DBT', 'Germany'],
                    ['XEF', 'France'],
                    ['INS', 'India'],
                    ['KOO', 'Korea'],
                    ['CHN', 'China'],
                    ['TGY', 'Hong Kong'],
                    ['XSA', 'Australia'],
                  ].map(([code, name]) => (
                    <div key={code} className="bg-grimoire-void/30 px-2 py-1 rounded font-mono">
                      <span className="text-blue-400">{code}</span>
                      <span className="text-grimoire-silver/50 ml-2">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Apple Tab */}
          {activeTab === 'apple' && (
            <div className="space-y-6">
              <div className="bg-gray-500/5 border border-gray-400/20 rounded-lg p-6">
                <h2 className="text-xl font-tech font-bold text-gray-300 mb-4">
                  Apple Tools (3uTools Style)
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => runOperation(`/api/arsenal/apple/{udid}/info`)}
                    disabled={!selectedDevice || isLoading}
                    className="p-4 bg-grimoire-void/50 border border-gray-400/30 rounded-lg
                               hover:bg-gray-400/10 transition-all duration-300 disabled:opacity-50"
                  >
                    <span className="text-2xl mb-2 block">📋</span>
                    <span className="font-tech text-sm text-grimoire-silver">Device Info</span>
                  </button>
                  <button
                    onClick={() => runOperation(`/api/arsenal/apple/{udid}/activation`)}
                    disabled={!selectedDevice || isLoading}
                    className="p-4 bg-grimoire-void/50 border border-gray-400/30 rounded-lg
                               hover:bg-gray-400/10 transition-all duration-300 disabled:opacity-50"
                  >
                    <span className="text-2xl mb-2 block">🔐</span>
                    <span className="font-tech text-sm text-grimoire-silver">Activation Status</span>
                  </button>
                  <button
                    disabled
                    className="p-4 bg-grimoire-void/50 border border-gray-400/30 rounded-lg opacity-50 cursor-not-allowed"
                  >
                    <span className="text-2xl mb-2 block">🔋</span>
                    <span className="font-tech text-sm text-grimoire-silver">Battery Health</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('firmware')}
                    className="p-4 bg-grimoire-void/50 border border-gray-400/30 rounded-lg
                               hover:bg-gray-400/10 transition-all duration-300"
                  >
                    <span className="text-2xl mb-2 block">💾</span>
                    <span className="font-tech text-sm text-grimoire-silver">IPSW Lookup</span>
                  </button>
                </div>
              </div>

              {/* Apple Device Mode Info */}
              <div className="bg-grimoire-deep-shadow/50 border border-grimoire-electric-blue/20 rounded-lg p-6">
                <h3 className="text-lg font-tech font-bold text-grimoire-silver mb-4">
                  Device Modes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <h4 className="font-tech font-bold text-green-400 mb-2">Normal Mode</h4>
                    <p className="text-sm text-grimoire-silver/70">Device is booted and operational. Full diagnostics available.</p>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <h4 className="font-tech font-bold text-yellow-400 mb-2">Recovery Mode</h4>
                    <p className="text-sm text-grimoire-silver/70">Restore/update mode. iTunes logo on screen.</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <h4 className="font-tech font-bold text-red-400 mb-2">DFU Mode</h4>
                    <p className="text-sm text-grimoire-silver/70">Device Firmware Upgrade. Black screen, deep restore.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Android Tab */}
          {activeTab === 'android' && (
            <div className="space-y-6">
              <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-6">
                <h2 className="text-xl font-tech font-bold text-green-400 mb-4">
                  Universal Android Tools (UAT Style)
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => runOperation(`/api/arsenal/android/{serial}/info`)}
                    disabled={!selectedDevice || isLoading}
                    className="p-4 bg-grimoire-void/50 border border-green-500/30 rounded-lg
                               hover:bg-green-500/10 transition-all duration-300 disabled:opacity-50"
                  >
                    <span className="text-2xl mb-2 block">📋</span>
                    <span className="font-tech text-sm text-grimoire-silver">Device Info</span>
                  </button>
                  <button
                    onClick={() => runOperation(`/api/arsenal/android/{serial}/root`)}
                    disabled={!selectedDevice || isLoading}
                    className="p-4 bg-grimoire-void/50 border border-green-500/30 rounded-lg
                               hover:bg-green-500/10 transition-all duration-300 disabled:opacity-50"
                  >
                    <span className="text-2xl mb-2 block">👑</span>
                    <span className="font-tech text-sm text-grimoire-silver">Root Status</span>
                  </button>
                  <button
                    onClick={() => runOperation(`/api/arsenal/android/{serial}/frp`)}
                    disabled={!selectedDevice || isLoading}
                    className="p-4 bg-grimoire-void/50 border border-green-500/30 rounded-lg
                               hover:bg-green-500/10 transition-all duration-300 disabled:opacity-50"
                  >
                    <span className="text-2xl mb-2 block">🔒</span>
                    <span className="font-tech text-sm text-grimoire-silver">FRP Status</span>
                  </button>
                  <button
                    onClick={() => runOperation(`/api/arsenal/android/{serial}/bootloader`)}
                    disabled={!selectedDevice || isLoading}
                    className="p-4 bg-grimoire-void/50 border border-green-500/30 rounded-lg
                               hover:bg-green-500/10 transition-all duration-300 disabled:opacity-50"
                  >
                    <span className="text-2xl mb-2 block">🔓</span>
                    <span className="font-tech text-sm text-grimoire-silver">Bootloader</span>
                  </button>
                </div>
              </div>

              {/* Root Methods Info */}
              <div className="bg-grimoire-deep-shadow/50 border border-grimoire-electric-blue/20 rounded-lg p-6">
                <h3 className="text-lg font-tech font-bold text-grimoire-silver mb-4">
                  Root Detection Methods
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-grimoire-void/30 p-4 rounded-lg">
                    <h4 className="font-tech font-bold text-green-400 mb-2">Magisk</h4>
                    <p className="text-grimoire-silver/70">Modern systemless root with MagiskHide support.</p>
                  </div>
                  <div className="bg-grimoire-void/30 p-4 rounded-lg">
                    <h4 className="font-tech font-bold text-orange-400 mb-2">SuperSU</h4>
                    <p className="text-grimoire-silver/70">Legacy root solution, mostly for older devices.</p>
                  </div>
                  <div className="bg-grimoire-void/30 p-4 rounded-lg">
                    <h4 className="font-tech font-bold text-blue-400 mb-2">SU Binary</h4>
                    <p className="text-grimoire-silver/70">Generic superuser binary detection.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Firmware Tab */}
          {activeTab === 'firmware' && (
            <div className="space-y-6">
              <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-6">
                <h2 className="text-xl font-tech font-bold text-orange-400 mb-4">
                  Firmware Catalog
                </h2>
                <p className="text-grimoire-silver/70 font-tech mb-4">
                  Look up available firmware versions for Samsung and iOS devices.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Samsung Firmware */}
                  <div className="bg-grimoire-void/30 rounded-lg p-4">
                    <h3 className="font-tech font-bold text-blue-400 mb-3">Samsung Firmware</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Model (e.g., SM-G998B)"
                        className="w-full px-3 py-2 bg-grimoire-void border border-blue-500/30 rounded
                                   text-grimoire-silver font-tech focus:outline-none focus:border-blue-500"
                      />
                      <select className="w-full px-3 py-2 bg-grimoire-void border border-blue-500/30 rounded
                                        text-grimoire-silver font-tech focus:outline-none focus:border-blue-500">
                        <option value="XAA">XAA - USA (Unlocked)</option>
                        <option value="BTU">BTU - UK</option>
                        <option value="DBT">DBT - Germany</option>
                        <option value="INS">INS - India</option>
                      </select>
                      <button className="w-full px-4 py-2 bg-blue-500/20 border border-blue-500/40
                                        hover:bg-blue-500/30 text-blue-400 font-tech rounded transition-all">
                        Search Firmware
                      </button>
                    </div>
                  </div>

                  {/* iOS Firmware */}
                  <div className="bg-grimoire-void/30 rounded-lg p-4">
                    <h3 className="font-tech font-bold text-gray-300 mb-3">iOS Firmware (IPSW)</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Device (e.g., iPhone14,2)"
                        className="w-full px-3 py-2 bg-grimoire-void border border-gray-400/30 rounded
                                   text-grimoire-silver font-tech focus:outline-none focus:border-gray-400"
                      />
                      <button className="w-full px-4 py-2 bg-gray-500/20 border border-gray-400/40
                                        hover:bg-gray-500/30 text-gray-300 font-tech rounded transition-all">
                        Check Signing Status
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Operation Result Display */}
        {operationResult && (
          <div className={`mt-6 rounded-lg p-6 ${
            operationResult.success 
              ? 'bg-green-500/10 border border-green-500/30' 
              : 'bg-red-500/10 border border-red-500/30'
          }`}>
            <h3 className={`font-tech font-bold mb-4 ${
              operationResult.success ? 'text-green-400' : 'text-red-400'
            }`}>
              {operationResult.success ? 'Operation Result' : 'Operation Failed'}
            </h3>
            {operationResult.error && (
              <p className="text-red-400 font-tech mb-4">{operationResult.error}</p>
            )}
            {(operationResult.info || operationResult.knox || operationResult.root || 
              operationResult.frp || operationResult.bootloader || operationResult.activation) && (
              <pre className="bg-grimoire-void/50 rounded p-4 overflow-auto max-h-96 text-sm font-mono text-grimoire-silver">
                {JSON.stringify(
                  operationResult.info || operationResult.knox || operationResult.root || 
                  operationResult.frp || operationResult.bootloader || operationResult.activation,
                  null, 2
                )}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
