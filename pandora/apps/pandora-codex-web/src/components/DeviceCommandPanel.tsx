/**
 * Device Command Panel Component
 * 
 * Provides interactive device control capabilities:
 * - USB enumeration and classification
 * - ADB command execution
 * - Fastboot operations
 * - MDM bypass code generation
 */

import { useState } from 'react';
import { apiService } from '../services/apiService';
import type { DeviceInfo } from '../services/apiService';

interface DeviceCommandPanelProps {
  device: DeviceInfo;
  onCommandExecuted?: (result: any) => void;
}

type CommandTab = 'info' | 'adb' | 'fastboot' | 'mdm';

export function DeviceCommandPanel({ device, onCommandExecuted }: DeviceCommandPanelProps) {
  const [activeTab, setActiveTab] = useState<CommandTab>('info');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<string>('');
  const [adbCommand, setAdbCommand] = useState('getprop ro.product.model');
  const [fastbootCommand, setFastbootCommand] = useState('getvar product');

  const handleExecuteAdb = async () => {
    if (!device.serial) return;
    setExecuting(true);
    try {
      const response = await apiService.executeAdbCommand(device.serial, adbCommand);
      if (response.success && response.data) {
        setResult(response.data.stdout || 'No output');
        onCommandExecuted?.(response.data);
      } else {
        setResult(`Error: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      setResult(`Error: ${String(error)}`);
    } finally {
      setExecuting(false);
    }
  };

  const handleExecuteFastboot = async () => {
    if (!device.serial) return;
    setExecuting(true);
    try {
      const response = await apiService.executeFastbootCommand(device.serial, fastbootCommand);
      if (response.success && response.data) {
        const resultText = response.data.value || response.data.response || JSON.stringify(response.data);
        setResult(resultText);
        onCommandExecuted?.(response.data);
      } else {
        setResult(`Error: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      setResult(`Error: ${String(error)}`);
    } finally {
      setExecuting(false);
    }
  };

  const handleGenerateMdmCode = async () => {
    const udid = device.properties?.udid || device.id;
    const serial = device.serial || device.id;
    setExecuting(true);
    try {
      const response = await apiService.generateMdmBypassCode(serial, udid);
      if (response.success && response.data) {
        setResult(`Bypass Code: ${response.data.bypassCode}\nCharset: ${response.data.charset}\nLength: ${response.data.length}`);
        onCommandExecuted?.(response.data);
      } else {
        setResult(`Error: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      setResult(`Error: ${String(error)}`);
    } finally {
      setExecuting(false);
    }
  };

  const isAndroid = device.deviceType === 'Android';
  const isIos = device.deviceType === 'Ios';

  return (
    <div className="space-y-3">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-grimoire-electric-blue/20">
        <button
          onClick={() => { setActiveTab('info'); setResult(''); }}
          className={`px-3 py-2 text-xs font-tech uppercase transition-colors ${
            activeTab === 'info'
              ? 'text-grimoire-electric-blue border-b-2 border-grimoire-electric-blue'
              : 'text-dark-muted hover:text-grimoire-electric-blue/70'
          }`}
        >
          Info
        </button>
        {isAndroid && (
          <>
            <button
              onClick={() => { setActiveTab('adb'); setResult(''); }}
              className={`px-3 py-2 text-xs font-tech uppercase transition-colors ${
                activeTab === 'adb'
                  ? 'text-grimoire-electric-blue border-b-2 border-grimoire-electric-blue'
                  : 'text-dark-muted hover:text-grimoire-electric-blue/70'
              }`}
            >
              ADB Shell
            </button>
            <button
              onClick={() => { setActiveTab('fastboot'); setResult(''); }}
              className={`px-3 py-2 text-xs font-tech uppercase transition-colors ${
                activeTab === 'fastboot'
                  ? 'text-grimoire-electric-blue border-b-2 border-grimoire-electric-blue'
                  : 'text-dark-muted hover:text-grimoire-electric-blue/70'
              }`}
            >
              Fastboot
            </button>
          </>
        )}
        {isIos && (
          <button
            onClick={() => { setActiveTab('mdm'); setResult(''); }}
            className={`px-3 py-2 text-xs font-tech uppercase transition-colors ${
              activeTab === 'mdm'
                ? 'text-grimoire-electric-blue border-b-2 border-grimoire-electric-blue'
                : 'text-dark-muted hover:text-grimoire-electric-blue/70'
            }`}
          >
            MDM Bypass
          </button>
        )}
      </div>

      {/* Info Tab */}
      {activeTab === 'info' && (
        <div className="space-y-2 text-sm">
          <p className="text-dark-muted">
            <span className="text-grimoire-neon-cyan font-medium">Device Type:</span> {device.deviceType}
          </p>
          <p className="text-dark-muted">
            <span className="text-grimoire-neon-cyan font-medium">Model:</span> {device.model || 'N/A'}
          </p>
          <p className="text-dark-muted">
            <span className="text-grimoire-neon-cyan font-medium">Serial:</span> {device.serial || 'N/A'}
          </p>
          <p className="text-dark-muted">
            <span className="text-grimoire-neon-cyan font-medium">Status:</span>{' '}
            <span className={device.locked ? 'text-yellow-400' : 'text-green-400'}>
              {device.locked ? 'Locked' : 'Unlocked'}
            </span>
          </p>
          {device.properties && Object.keys(device.properties).length > 0 && (
            <div className="mt-3 pt-3 border-t border-grimoire-electric-blue/20">
              <p className="text-grimoire-neon-cyan font-medium mb-2">Properties:</p>
              <div className="space-y-1">
                {Object.entries(device.properties).map(([key, value]) => (
                  <p key={key} className="text-xs text-dark-muted">
                    <span className="text-grimoire-neon-cyan">{key}:</span> {value}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADB Tab */}
      {activeTab === 'adb' && isAndroid && (
        <div className="space-y-2">
          <label className="block text-xs font-tech text-grimoire-neon-cyan uppercase">ADB Command</label>
          <input
            type="text"
            value={adbCommand}
            onChange={(e) => setAdbCommand(e.target.value)}
            placeholder="e.g., getprop ro.product.model"
            className="w-full px-3 py-2 bg-grimoire-obsidian/50 border border-grimoire-electric-blue/30 rounded text-sm text-white placeholder-dark-muted focus:outline-none focus:border-grimoire-electric-blue/70 font-mono"
            disabled={executing}
          />
          <button
            onClick={handleExecuteAdb}
            disabled={executing || !device.serial}
            className="w-full px-3 py-2 bg-grimoire-neon-cyan/20 hover:bg-grimoire-neon-cyan/30 disabled:bg-gray-600/30 text-grimoire-neon-cyan disabled:text-gray-400 text-xs font-tech rounded transition-colors"
          >
            {executing ? 'Executing...' : 'Execute Command'}
          </button>
          {result && (
            <div className="bg-grimoire-obsidian/30 border border-grimoire-electric-blue/20 rounded p-2">
              <p className="text-xs text-dark-muted font-mono whitespace-pre-wrap break-words">{result}</p>
            </div>
          )}
        </div>
      )}

      {/* Fastboot Tab */}
      {activeTab === 'fastboot' && isAndroid && (
        <div className="space-y-2">
          <label className="block text-xs font-tech text-grimoire-neon-cyan uppercase">Fastboot Command</label>
          <input
            type="text"
            value={fastbootCommand}
            onChange={(e) => setFastbootCommand(e.target.value)}
            placeholder="e.g., getvar product"
            className="w-full px-3 py-2 bg-grimoire-obsidian/50 border border-grimoire-electric-blue/30 rounded text-sm text-white placeholder-dark-muted focus:outline-none focus:border-grimoire-electric-blue/70 font-mono"
            disabled={executing}
          />
          <button
            onClick={handleExecuteFastboot}
            disabled={executing || !device.serial}
            className="w-full px-3 py-2 bg-grimoire-thunder-gold/20 hover:bg-grimoire-thunder-gold/30 disabled:bg-gray-600/30 text-grimoire-thunder-gold disabled:text-gray-400 text-xs font-tech rounded transition-colors"
          >
            {executing ? 'Executing...' : 'Execute Command'}
          </button>
          {result && (
            <div className="bg-grimoire-obsidian/30 border border-grimoire-electric-blue/20 rounded p-2">
              <p className="text-xs text-dark-muted font-mono whitespace-pre-wrap break-words">{result}</p>
            </div>
          )}
        </div>
      )}

      {/* MDM Bypass Tab */}
      {activeTab === 'mdm' && isIos && (
        <div className="space-y-2">
          <p className="text-xs text-dark-muted">Generate Apple MDM bypass activation lock code</p>
          <button
            onClick={handleGenerateMdmCode}
            disabled={executing}
            className="w-full px-3 py-2 bg-red-900/30 hover:bg-red-900/50 disabled:bg-gray-600/30 text-red-400 disabled:text-gray-400 text-xs font-tech rounded transition-colors border border-red-500/30"
          >
            {executing ? 'Generating...' : 'Generate MDM Bypass Code'}
          </button>
          {result && (
            <div className="bg-grimoire-obsidian/30 border border-red-500/20 rounded p-3">
              <p className="text-xs text-red-300 font-mono whitespace-pre-wrap break-words">{result}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
