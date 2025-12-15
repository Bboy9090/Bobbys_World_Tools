/**
 * Control Room - TITAN 2
 * Central command center for device management, diagnostics, and deployment
 */

import React, { useState, useEffect } from 'react';
import { Button, ErrorState, LoadingSpinner } from '@pandora-codex/ui-kit';
import type { Device } from '@pandora-codex/shared-types';
import { Smartphone, Activity, Upload, FileText, Wrench } from 'lucide-react';
import { DevicesList } from './DevicesList';
import { DiagnosticsRunner } from './DiagnosticsRunner';
import { DeploymentJobs } from './DeploymentJobs';
import { LogsViewer } from './LogsViewer';
import { RepairReportExport } from './RepairReportExport';
import { DevicesAndDiagnostics } from '../DevicesAndDiagnostics';
import { JobsPanel } from '../JobsPanel';
import { ReportsPanel } from '../ReportsPanel';

export const ControlRoom: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'devices' | 'diagnostics' | 'deployment' | 'logs' | 'phase-c'>('devices');
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDevices();
    const interval = setInterval(loadDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDevices = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/devices/connected');
      if (!response.ok) throw new Error('Failed to load devices');
      const data = await response.json();
      setDevices(data.data.devices || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'devices', name: 'Devices', icon: Smartphone },
    { id: 'diagnostics', name: 'Diagnostics', icon: Activity },
    { id: 'deployment', name: 'Deployment', icon: Upload },
    { id: 'logs', name: 'Logs', icon: FileText },
    { id: 'phase-c', name: 'Phase C', icon: Wrench },
  ] as const;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Control Room</h1>
              <p className="text-sm text-gray-600 mt-1">
                {devices.length} device{devices.length !== 1 ? 's' : ''} connected
              </p>
            </div>
            <div className="flex items-center gap-3">
              <RepairReportExport />
              <Button onClick={loadDevices} variant="secondary" size="sm">
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6">
            <ErrorState message={error} action={
              <Button onClick={loadDevices} variant="primary" size="sm">Retry</Button>
            } />
          </div>
        )}

        {activeTab === 'devices' && <DevicesList devices={devices} onRefresh={loadDevices} />}
        {activeTab === 'diagnostics' && <DiagnosticsRunner devices={devices} />}
        {activeTab === 'deployment' && <DeploymentJobs devices={devices} />}
        {activeTab === 'logs' && <LogsViewer />}
        {activeTab === 'phase-c' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <DevicesAndDiagnostics />
              </div>
              <div>
                <JobsPanel />
              </div>
            </div>
            <div>
              <ReportsPanel />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
