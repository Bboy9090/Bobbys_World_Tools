/**
 * CommandExecutor - Direct ADB/Fastboot command execution for Android devices
 */

import { useState } from 'react';
import { apiService } from '../services/apiService';

interface Props {
  deviceSerial: string;
  deviceModel: string;
  onCommandExecute?: (result: any) => void;
}

export function CommandExecutor({ deviceSerial, deviceModel, onCommandExecute }: Props) {
  const [command, setCommand] = useState('getprop ro.product.model');
  const [commandType, setCommandType] = useState<'adb' | 'fastboot'>('adb');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    setLoading(true);
    setOutput('Executing...');
    
    try {
      let result;
      if (commandType === 'adb') {
        result = await apiService.executeAdbCommand(deviceSerial, command);
      } else {
        result = await apiService.executeFastbootCommand(deviceSerial, command);
      }
      
      if (result.success) {
        const out = result.stdout || result.output || 'Command executed successfully';
        setOutput(out);
        onCommandExecute?.(result);
      } else {
        setOutput(`Error: ${result.error}`);
      }
    } catch (error) {
      setOutput(`Exception: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const presetCommands = {
    adb: [
      { label: 'Model', cmd: 'getprop ro.product.model' },
      { label: 'Android Version', cmd: 'getprop ro.build.version.release' },
      { label: 'Build Number', cmd: 'getprop ro.build.id' },
      { label: 'Device Info', cmd: 'adb shell getprop' },
      { label: 'FRP Status', cmd: 'settings get global device_provisioned' },
      { label: 'List Packages', cmd: 'pm list packages' },
    ],
    fastboot: [
      { label: 'Bootloader Info', cmd: 'getvar all' },
      { label: 'Unlock Status', cmd: 'getvar unlocked' },
      { label: 'Devices', cmd: 'devices' },
    ]
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 border border-grimoire-abyss-purple/30">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-grimoire-neon-cyan mb-2">🔧 Command Executor</h3>
        <p className="text-sm text-slate-400">{deviceModel} ({deviceSerial})</p>
      </div>

      <div className="space-y-4">
        {/* Command Type Selector */}
        <div className="flex gap-3">
          <button
            onClick={() => setCommandType('adb')}
            className={`flex-1 py-2 rounded font-semibold transition ${
              commandType === 'adb'
                ? 'bg-grimoire-neon-cyan text-black'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            ADB Shell
          </button>
          <button
            onClick={() => setCommandType('fastboot')}
            className={`flex-1 py-2 rounded font-semibold transition ${
              commandType === 'fastboot'
                ? 'bg-grimoire-thunder-gold text-black'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Fastboot
          </button>
        </div>

        {/* Command Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Command</label>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Enter command..."
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-grimoire-neon-cyan"
          />
        </div>

        {/* Preset Commands */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Quick Commands</label>
          <div className="grid grid-cols-2 gap-2">
            {presetCommands[commandType].map((preset) => (
              <button
                key={preset.cmd}
                onClick={() => setCommand(preset.cmd)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm py-1 px-2 rounded transition"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Execute Button */}
        <button
          onClick={handleExecute}
          disabled={loading}
          className="w-full bg-gradient-to-r from-grimoire-neon-cyan to-grimoire-electric-blue text-black font-bold py-3 rounded hover:opacity-90 disabled:opacity-50 transition"
        >
          {loading ? 'Executing...' : 'Execute Command'}
        </button>

        {/* Output */}
        {output && (
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Output</label>
            <div className="bg-black rounded p-3 border border-grimoire-neon-cyan/30 max-h-48 overflow-y-auto">
              <pre className="text-grimoire-neon-cyan text-xs font-mono whitespace-pre-wrap break-words">
                {output}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
