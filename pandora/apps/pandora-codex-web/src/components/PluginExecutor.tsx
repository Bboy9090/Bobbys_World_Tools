/**
 * Pandora Codex - Plugin Executor Component
 * 
 * Provides a UI for selecting and executing plugins with device serial number input.
 */

import { useState } from 'react';
import { apiService } from '../services/apiService';

interface PluginExecutorProps {
  onExecute?: (pluginName: string, deviceSerial: string) => void;
  loading?: boolean;
}

/**
 * PluginExecutor Component
 * 
 * Allows users to select a plugin from a dropdown and provide a device serial number
 * for execution.
 */
export function PluginExecutor({ onExecute, loading = false }: PluginExecutorProps) {
  const [selectedPlugin, setSelectedPlugin] = useState<string>('python-example');
  const [deviceSerial, setDeviceSerial] = useState<string>('');
  const [executing, setExecuting] = useState(false);

  /**
   * Available plugins
   */
  const plugins = [
    { value: 'python-example', label: 'Python Example Plugin' },
    { value: 'python-mdm-bypass', label: 'MDM Bypass Plugin' },
    { value: 'nodejs-example', label: 'Node.js Example Plugin' },
    { value: 'rust-example', label: 'Rust Example Plugin' },
  ];

  /**
   * Handle plugin execution
   */
  const handleExecute = async () => {
    if (!deviceSerial.trim()) {
      alert('Please enter a device serial number');
      return;
    }

    setExecuting(true);
    try {
      if (onExecute) {
        onExecute(selectedPlugin, deviceSerial);
      } else {
        // Default execution through API service
        await apiService.executePlugin(selectedPlugin);
      }
    } catch (error) {
      console.error('Plugin execution failed:', error);
      alert('Plugin execution failed. Check logs for details.');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6 space-y-4">
      <h3 className="text-xl font-semibold">Execute Plugin</h3>

      {/* Plugin Selection Dropdown */}
      <div className="space-y-2">
        <label htmlFor="plugin-select" className="block text-sm font-medium text-dark-muted">
          Select Plugin
        </label>
        <select
          id="plugin-select"
          value={selectedPlugin}
          onChange={(e) => setSelectedPlugin(e.target.value)}
          className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={loading || executing}
        >
          {plugins.map((plugin) => (
            <option key={plugin.value} value={plugin.value}>
              {plugin.label}
            </option>
          ))}
        </select>
      </div>

      {/* Device Serial Input */}
      <div className="space-y-2">
        <label htmlFor="device-serial" className="block text-sm font-medium text-dark-muted">
          Device Serial Number
        </label>
        <input
          id="device-serial"
          type="text"
          value={deviceSerial}
          onChange={(e) => setDeviceSerial(e.target.value)}
          placeholder="Enter device serial (e.g., ABC123DEF456)"
          className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={loading || executing}
        />
      </div>

      {/* Execute Button */}
      <button
        onClick={handleExecute}
        disabled={loading || executing || !deviceSerial.trim()}
        className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
      >
        {executing ? 'Executing...' : 'Execute Plugin'}
      </button>

      {/* Info Text */}
      <p className="text-sm text-dark-muted">
        Select a plugin and provide a device serial number to execute device operations.
      </p>
    </div>
  );
}
