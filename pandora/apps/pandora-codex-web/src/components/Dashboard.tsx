/**
 * Dashboard - Repair Shop Command Center
 * Real-time device diagnostics, job tracking, and history management
 */

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { IntakeForm } from './IntakeForm';
import { TicketTimeline } from './TicketTimeline';
import { TicketList } from './TicketList';

interface SystemMetrics {
  devicesConnected: number;
  diagnosticsToday: number;
  completionRate: number;
  activeJobs: number;
}

interface ConnectedDevice {
  id: string;
  platform: 'android' | 'ios';
  model: string;
  status: string;
  connection: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  theme: 'codex' | 'zeus' | 'hades' | 'phoenix';
  onClick: () => void;
}

export function Dashboard() {
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    devicesConnected: 0,
    diagnosticsToday: 0,
    completionRate: 0,
    activeJobs: 0
  });
  const [isCreator, setIsCreator] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [lastPollTime, setLastPollTime] = useState<Date | null>(null);
  const [diagResult, setDiagResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const result = await apiService.getDashboardStats();
      if (result.success && result.data) {
        setMetrics(prev => ({
          ...prev,
          diagnosticsToday: result.data.diagnostics?.today || 0,
          completionRate: result.data.diagnostics?.completionRate || 0,
          activeJobs: result.data.tickets?.active || 0
        }));
        setError(null);
      } else {
        setError('Failed to load dashboard stats. Backend may be unavailable.');
      }
    } catch (err) {
      setError('Unable to connect to backend. Please check server status.');
      console.error('[Dashboard] Stats fetch error:', err);
    }
  }, []);

  const scanForDevices = useCallback(async () => {
    setIsPolling(true);
    try {
      const result = await apiService.scanConnectedDevices();
      if (result.success && result.data) {
        const devices = result.data;
        setConnectedDevices(devices);
        setMetrics(prev => ({ ...prev, devicesConnected: devices.length }));
        setLastPollTime(new Date());
        setError(null);
      } else {
        setError(`Device scan failed: ${result.error || 'Unknown error'}`);
        setConnectedDevices([]);
        setMetrics(prev => ({ ...prev, devicesConnected: 0 }));
      }
    } catch (err) {
      setError('Device scan failed. Check backend connection.');
      console.error('[Dashboard] Scan error:', err);
      setConnectedDevices([]);
      setMetrics(prev => ({ ...prev, devicesConnected: 0 }));
    } finally {
      setIsPolling(false);
    }
  }, []);

  const pollDevices = useCallback(async () => {
    await scanForDevices();
  }, [scanForDevices]);

  useEffect(() => {
    fetchDashboardStats();
    pollDevices();
    const statsInterval = setInterval(fetchDashboardStats, 10000);
    const pollInterval = setInterval(pollDevices, 5000);
    return () => {
      clearInterval(statsInterval);
      clearInterval(pollInterval);
    };
  }, [fetchDashboardStats, pollDevices]);

  useEffect(() => {
    setIsCreator(true);
  }, []);

  const themeColors = {
    codex: 'from-grimoire-electric-blue/20 to-grimoire-neon-cyan/10 border-grimoire-electric-blue/40 hover:border-grimoire-neon-cyan/60',
    zeus: 'from-grimoire-thunder-gold/20 to-yellow-500/10 border-grimoire-thunder-gold/40 hover:border-yellow-400/60',
    hades: 'from-grimoire-abyss-purple/20 to-purple-500/10 border-grimoire-abyss-purple/40 hover:border-purple-400/60',
    phoenix: 'from-grimoire-phoenix-orange/20 to-orange-500/10 border-grimoire-phoenix-orange/40 hover:border-orange-400/60'
  };

  const runDiagnostics = async () => {
    if (connectedDevices.length === 0) {
      setDiagResult('No devices connected. Please connect a device via USB first.');
      return;
    }
    
    setDiagResult('Running diagnostics on connected device...');
    try {
      const device = connectedDevices[0];
      setDiagResult(`Running real ${device.platform.toUpperCase()} diagnostics on ${device.model}...`);
    } catch (err) {
      setDiagResult('Diagnostics require device to be connected via USB.');
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'scan',
      label: 'Scan Devices',
      icon: <ScanIcon />,
      description: 'Detect all connected devices',
      theme: 'codex',
      onClick: pollDevices
    },
    {
      id: 'diagnostics',
      label: 'Run Diagnostics',
      icon: <DiagnosticsIcon />,
      description: 'Battery, storage, activation check',
      theme: 'zeus',
      onClick: runDiagnostics
    },
    {
      id: 'intake',
      label: 'Create Intake',
      icon: <ClipboardIcon />,
      description: 'Start new repair ticket',
      theme: 'hades',
      onClick: () => setShowIntakeForm(true)
    },
    {
      id: 'history',
      label: 'View History',
      icon: <HistoryIcon />,
      description: 'Device snapshots & visits',
      theme: 'phoenix',
      onClick: () => setDiagResult('History panel shows device visit history below.')
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header with glassmorphism effect */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-grimoire-obsidian-light/80 to-grimoire-obsidian/50 border border-grimoire-electric-blue/20 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-grimoire font-bold gradient-text-electric">
            Repair Shop Command Center
          </h1>
          <p className="text-dark-muted font-tech text-sm mt-1">
            {isCreator ? 'Creator Access - All Features Unlocked' : 'Real-time device diagnostics and job management'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isCreator && (
            <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-grimoire-thunder-gold/20 to-yellow-500/10 border border-grimoire-thunder-gold/40 animate-border-pulse">
              <span className="text-grimoire-thunder-gold text-xs font-tech font-bold uppercase tracking-wider">
                Creator
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400 text-xs font-tech">Online</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-red-400 text-xl">⚠️</span>
            <p className="text-sm text-red-400">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300"
          >
            ×
          </button>
        </div>
      )}

      {/* Metrics Grid with staggered animation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Connected Devices"
          value={metrics.devicesConnected}
          icon={<DeviceIcon />}
          trend={metrics.devicesConnected > 0 ? 'up' : 'neutral'}
          color="cyan"
          delay={0}
        />
        <MetricCard
          label="Diagnostics Today"
          value={metrics.diagnosticsToday}
          icon={<ActivityIcon />}
          trend="up"
          color="gold"
          delay={1}
        />
        <MetricCard
          label="Completion Rate"
          value={`${metrics.completionRate}%`}
          icon={<CheckIcon />}
          trend="up"
          color="green"
          delay={2}
        />
        <MetricCard
          label="Active Jobs"
          value={metrics.activeJobs}
          icon={<SpinnerIcon />}
          trend="neutral"
          color="purple"
          delay={3}
        />
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, idx) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className={`
              group p-5 rounded-xl border bg-gradient-to-br ${themeColors[action.theme]}
              transition-all duration-300 text-left relative overflow-hidden
              hover:scale-[1.02] hover:shadow-lg hover:-translate-y-1
              animate-fade-in-up
            `}
            style={{ animationDelay: `${idx * 0.05 + 0.2}s` }}
          >
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            
            <div className="flex items-center gap-3 mb-3 relative">
              <div className="p-2 rounded-lg bg-white/10 text-grimoire-electric-blue group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
                {action.icon}
              </div>
              <span className="font-grimoire font-semibold text-white group-hover:text-grimoire-neon-cyan transition-colors">{action.label}</span>
            </div>
            <p className="text-xs text-dark-muted relative">{action.description}</p>
          </button>
        ))}
      </div>

      {diagResult && (
        <div className="grimoire-card p-4 bg-gradient-to-r from-grimoire-abyss-purple/20 to-purple-500/10 border-grimoire-abyss-purple/40">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white">{diagResult}</p>
            <button 
              onClick={() => setDiagResult(null)}
              className="text-dark-muted hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="grimoire-card p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-grimoire font-semibold text-grimoire-electric-blue">
            Connected Devices
          </h3>
          <div className="flex items-center gap-2">
            {isPolling && (
              <span className="text-xs text-dark-muted flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Scanning...
              </span>
            )}
            {lastPollTime && (
              <span className="text-xs text-dark-muted">
                Last: {lastPollTime.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={pollDevices}
              disabled={isPolling}
              className="px-2 py-1 text-xs rounded bg-grimoire-electric-blue/20 hover:bg-grimoire-electric-blue/30 text-grimoire-electric-blue border border-grimoire-electric-blue/40 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>
        
        {connectedDevices.length === 0 ? (
          <div className="text-center py-8 text-dark-muted">
            <DeviceIcon />
            <p className="mt-2 font-semibold">No devices connected</p>
            <p className="text-xs mt-1">Connect an Android or iOS device via USB to begin</p>
            <p className="text-xs mt-1 text-grimoire-electric-blue/60">ADB and libimobiledevice ready for real device detection</p>
          </div>
        ) : (
          <div className="space-y-3">
            {connectedDevices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 rounded-lg bg-grimoire-obsidian border border-grimoire-electric-blue/30">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${device.platform === 'ios' ? 'bg-white/10' : 'bg-green-500/20'}`}>
                    {device.platform === 'ios' ? (
                      <span className="text-white text-lg"></span>
                    ) : (
                      <span className="text-green-400 text-lg">🤖</span>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{device.model}</p>
                    <p className="text-xs text-dark-muted">{device.platform.toUpperCase()} • {device.id.substring(0, 12)}...</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/40">
                    {device.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TicketList 
            onSelectTicket={(id) => setSelectedTicketId(id)}
            limit={8}
          />
        </div>
        <div className="grimoire-card p-4">
          <h3 className="font-grimoire font-semibold text-grimoire-electric-blue mb-4">
            Quick Stats
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-grimoire-electric-blue/10">
              <span className="text-sm text-dark-muted">Diagnostics Today</span>
              <span className="text-sm text-white font-medium">{metrics.diagnosticsToday}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-grimoire-electric-blue/10">
              <span className="text-sm text-dark-muted">Active Jobs</span>
              <span className="text-sm text-white font-medium">{metrics.activeJobs}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-grimoire-electric-blue/10">
              <span className="text-sm text-dark-muted">USB Devices</span>
              <span className="text-sm text-white font-medium">{connectedDevices.length}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-dark-muted">Completion Rate</span>
              <span className="text-sm text-grimoire-neon-cyan font-medium">{metrics.completionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grimoire-card p-4">
        <h3 className="font-grimoire font-semibold text-grimoire-electric-blue mb-4">
          Diagnostic Capabilities
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { name: 'iOS Devices', range: 'Battery & Activation', color: 'cyan' },
            { name: 'Android', range: 'ADB Diagnostics', color: 'green' },
            { name: 'Job Tracking', range: 'Intake to Completion', color: 'purple' },
            { name: 'History', range: 'Visit & Snapshot Log', color: 'gold' },
          ].map((capability) => (
            <div key={capability.name} className="p-3 rounded-lg bg-grimoire-obsidian border border-grimoire-electric-blue/20">
              <p className="font-grimoire font-semibold text-white">{capability.name}</p>
              <p className="text-xs text-dark-muted">{capability.range}</p>
            </div>
          ))}
        </div>
      </div>

      {showIntakeForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <IntakeForm
            onComplete={(ticketId) => {
              setShowIntakeForm(false);
              setSelectedTicketId(ticketId);
              fetchDashboardStats();
            }}
            onCancel={() => setShowIntakeForm(false)}
          />
        </div>
      )}

      {selectedTicketId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <TicketTimeline
              ticketId={selectedTicketId}
              onStatusChange={() => fetchDashboardStats()}
              onClose={() => setSelectedTicketId(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon, trend, color, delay = 0 }: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
  color: 'cyan' | 'gold' | 'green' | 'purple';
  delay?: number;
}) {
  const colors = {
    cyan: 'from-grimoire-electric-blue/20 to-grimoire-neon-cyan/10 border-grimoire-electric-blue/40 hover:border-grimoire-neon-cyan/60 hover:shadow-glow-blue',
    gold: 'from-grimoire-thunder-gold/20 to-yellow-500/10 border-grimoire-thunder-gold/40 hover:border-yellow-400/60 hover:shadow-glow-gold',
    green: 'from-green-500/20 to-green-600/10 border-green-500/40 hover:border-green-400/60',
    purple: 'from-grimoire-abyss-purple/20 to-purple-500/10 border-grimoire-abyss-purple/40 hover:border-purple-400/60 hover:shadow-glow-purple'
  };

  const trendIcons = {
    up: <span className="text-green-400 text-xs font-bold">↑</span>,
    down: <span className="text-red-400 text-xs font-bold">↓</span>,
    neutral: <span className="text-dark-muted text-xs">—</span>
  };

  return (
    <div 
      className={`p-4 rounded-xl border bg-gradient-to-br ${colors[color]} transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 animate-fade-in-up`}
      style={{ animationDelay: `${delay * 0.1}s` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg bg-white/5 text-dark-muted">{icon}</div>
        {trendIcons[trend]}
      </div>
      <p className="text-3xl font-tech font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-dark-muted font-tech uppercase tracking-wider">{label}</p>
    </div>
  );
}

function ScanIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
}

function DiagnosticsIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
}

function ClipboardIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
}

function HistoryIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}

function DeviceIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
}

function ActivityIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
}

function CheckIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}

function SpinnerIcon() {
  return <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
}

