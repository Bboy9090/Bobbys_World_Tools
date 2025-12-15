/**
 * Bobby Dev Arsenal Dashboard
 * Main dashboard for device management, diagnostics, and deployment
 */

import React, { useState, useEffect } from 'react';
import type { 
  Device, 
  ArsenalStatus 
} from '@pandora-codex/shared-types';
import { arsenalApi } from '../services/arsenalApi';

export const BobbyDevArsenalDashboard: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [status, setStatus] = useState<ArsenalStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load devices
      const devicesData = await arsenalApi.getConnectedDevices();
      setDevices(devicesData.devices);
      
      // Update status
      setStatus({
        services: {
          backend: true,
          frontend: true,
          adb: devicesData.devices.some(d => d.connectionType === 'adb'),
          fastboot: devicesData.devices.some(d => d.connectionType === 'usb'),
        },
        connectedDevices: devicesData.count,
        activeDeployments: 0,
        systemHealth: 'healthy'
      });
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const runDiagnostic = async (deviceId: string) => {
    try {
      const result = await arsenalApi.runDiagnostics(deviceId);
      alert(`Diagnostic run started: ${result.runId}\nStatus: ${result.status}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run diagnostics');
    }
  };

  const startDeployment = async (deviceId: string, type: string) => {
    try {
      const result = await arsenalApi.startDeployment({ deviceId, type: type as any });
      alert(`Deployment started: ${result.message}`);
      if (result.requiresConfirmation) {
        alert('⚠️ This deployment requires explicit confirmation before proceeding.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start deployment');
    }
  };

  if (loading && devices.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading Arsenal Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          🛡️ Bobby Dev Arsenal Dashboard
        </h1>
        <p className="text-gray-400">Device Management, Diagnostics & Deployment</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
          <p className="text-red-200">⚠️ {error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-sm text-red-300 underline mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Status Cards */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Connected Devices</span>
              <span className="text-2xl font-bold text-blue-400">
                {status.connectedDevices}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">System Health</span>
              <span className={`text-xl font-bold ${
                status.systemHealth === 'healthy' ? 'text-green-400' :
                status.systemHealth === 'warning' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {status.systemHealth === 'healthy' ? '✓' : '⚠️'}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">ADB Status</span>
              <span className={`text-xl ${status.services.adb ? 'text-green-400' : 'text-gray-500'}`}>
                {status.services.adb ? '✓ Active' : '○ Idle'}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Active Deployments</span>
              <span className="text-2xl font-bold text-purple-400">
                {status.activeDeployments}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Devices List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 mb-8">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">Connected Devices</h2>
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
        
        <div className="p-4">
          {devices.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-4xl mb-4">📱</p>
              <p>No devices connected</p>
              <p className="text-sm mt-2">Connect a device via USB or ADB</p>
            </div>
          ) : (
            <div className="space-y-4">
              {devices.map(device => (
                <div 
                  key={device.id}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{device.name}</h3>
                      <p className="text-sm text-gray-400">
                        {device.manufacturer} {device.model} • {device.os.toUpperCase()} {device.osVersion}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      device.status === 'connected' ? 'bg-green-600' :
                      device.status === 'disconnected' ? 'bg-red-600' :
                      'bg-gray-600'
                    }`}>
                      {device.status}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => runDiagnostic(device.id)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm"
                    >
                      🔍 Run Diagnostics
                    </button>
                    <button 
                      onClick={() => startDeployment(device.id, 'firmware')}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors text-sm"
                    >
                      ⚡ Deploy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            📊 System Status
          </button>
          <button className="p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
            🔧 Tools
          </button>
          <button className="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
            📚 Docs
          </button>
          <button className="p-4 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors">
            ⚙️ Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default BobbyDevArsenalDashboard;
