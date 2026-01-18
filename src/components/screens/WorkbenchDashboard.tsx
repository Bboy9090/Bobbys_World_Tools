/**
 * PHOENIX FORGE - Dashboard
 * 
 * Command center overview with legendary statistics,
 * quick actions, and real-time system monitoring.
 */

import { useState, useEffect, useCallback } from 'react';
import { WorkbenchQuickActions } from '../workbench/WorkbenchQuickActions';
import { WorkbenchSystemStatus } from '../workbench/WorkbenchSystemStatus';
import { TerminalLogStream, LogEntry } from '../core/TerminalLogStream';
import { useApp } from '@/lib/app-context';
import { StatCard, Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Smartphone, 
  Zap, 
  Shield, 
  Activity, 
  Flame,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
} from 'lucide-react';

export function WorkbenchDashboard() {
  const { backendAvailable } = useApp();
  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([
    {
      id: 'init-1',
      timestamp: new Date().toISOString(),
      level: 'info',
      message: '[PHOENIX] Forge systems online',
      source: 'dashboard',
    },
  ]);

  // Mock statistics (would come from backend in production)
  const [stats] = useState({
    devicesRepaired: 1247,
    activeDevices: 3,
    successRate: 98.7,
    avgRepairTime: '12m',
  });

  // Add log entry helper
  const addLog = useCallback((level: LogEntry['level'], message: string, source = 'dashboard') => {
    setRecentLogs(prev => {
      const newLog: LogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        level,
        message,
        source,
      };
      return [...prev, newLog].slice(-50);
    });
  }, []);

  // Log backend status on mount
  useEffect(() => {
    if (backendAvailable) {
      addLog('info', '[PHOENIX] Backend forge connected - full power mode');
    } else {
      addLog('warn', '[PHOENIX] Backend offline - limited functionality');
    }
  }, [backendAvailable, addLog]);

  // Action handlers
  const handleScanDevices = useCallback(async () => {
    addLog('info', '[SCAN] Detecting connected devices...');
    
    if (!backendAvailable) {
      setTimeout(() => addLog('warn', '[SCAN] Backend offline - cannot scan'), 500);
      return;
    }

    try {
      const response = await fetch('/api/v1/adb/devices');
      const data = await response.json();
      
      if (data.ok && data.data?.devices) {
        const count = data.data.devices.length;
        addLog('info', `[SCAN] Detected ${count} device(s)`);
        data.data.devices.forEach((d: { serial: string; state: string }) => {
          addLog('debug', `  → ${d.serial} (${d.state})`);
        });
      } else {
        addLog('info', '[SCAN] No devices detected');
      }
    } catch (error) {
      addLog('error', `[SCAN] Detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [backendAvailable, addLog]);

  const handleFlashDevice = useCallback(() => {
    addLog('info', '[FORGE] Initializing flash sequence...');
  }, [addLog]);

  const handleSearchFirmware = useCallback(() => {
    addLog('info', '[FORGE] Opening firmware repository...');
  }, [addLog]);

  const handleRefresh = useCallback(() => {
    addLog('info', '[SYSTEM] Refreshing dashboard...');
    window.location.reload();
  }, [addLog]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F1F5F9] flex items-center gap-3">
            <Flame className="w-7 h-7 text-[#FF6B2C]" />
            Command Center
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Phoenix Forge operational dashboard
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={backendAvailable ? 'success' : 'warning'}>
            {backendAvailable ? 'Forge Online' : 'Limited Mode'}
          </Badge>
        </div>
      </div>

      {/* Legendary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Devices Reborn"
          value={stats.devicesRepaired.toLocaleString()}
          icon={CheckCircle}
          trend="up"
          trendValue="12%"
          description="Total repairs completed"
          variant="phoenix"
        />
        
        <StatCard
          title="Active Devices"
          value={stats.activeDevices}
          icon={Smartphone}
          description="Currently connected"
          variant="cosmic"
        />
        
        <StatCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          icon={TrendingUp}
          trend="up"
          trendValue="2.3%"
          description="Repair success ratio"
          variant="success"
        />
        
        <StatCard
          title="Avg Repair Time"
          value={stats.avgRepairTime}
          icon={Clock}
          description="Per device average"
          variant="default"
        />
      </div>

      {/* Main Grid - Actions & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WorkbenchQuickActions
          onScanDevices={handleScanDevices}
          onFlashDevice={handleFlashDevice}
          onSearchFirmware={handleSearchFirmware}
          onRefresh={handleRefresh}
        />
        
        <WorkbenchSystemStatus />
      </div>

      {/* Activity Log */}
      <Card variant="glass">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#06B6D4]" />
              Activity Stream
            </CardTitle>
            <Badge variant="ghost" size="sm">
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-48 rounded-lg bg-[#0A0A12] border border-white/5 overflow-hidden">
            <TerminalLogStream
              logs={recentLogs}
              maxLines={10}
              autoScroll={true}
              className="h-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card variant="phoenix" className="overflow-hidden">
        <div className="p-4 flex items-start gap-4">
          <div className="p-2 rounded-lg bg-[rgba(255,77,0,0.1)]">
            <Zap className="w-5 h-5 text-[#FF6B2C]" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#F1F5F9] mb-1">Quick Tip</h3>
            <p className="text-sm text-[#94A3B8]">
              Use the Quick Actions panel to jump into common operations. The System Status card shows real-time backend health and catalog state.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
