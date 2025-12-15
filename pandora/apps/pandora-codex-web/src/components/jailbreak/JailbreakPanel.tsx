import React, { useState, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { Device, JobStatus } from '../../types';
import { DeviceType } from '../../types';
import './JailbreakPanel.css';

interface JailbreakPanelProps {
  device: Device;
  onComplete?: (result: JobStatus) => void;
  onError?: (error: string) => void;
}

type JailbreakTool = 'palera1n' | 'checkra1n';

// Map device models to their chip generation
const DEVICE_CHIP_MAP: Record<string, string> = {
  'iPhone 5s': 'A5s',
  'iPhone 6': 'A8',
  'iPhone 6 Plus': 'A8',
  'iPhone 6s': 'A9',
  'iPhone 6s Plus': 'A9',
  'iPhone 7': 'A10',
  'iPhone 7 Plus': 'A10',
  'iPhone 8': 'A11',
  'iPhone 8 Plus': 'A11',
  'iPhone X': 'A11',
  'iPhone XR': 'A12',
  'iPhone XS': 'A12',
  'iPhone XS Max': 'A12',
  'iPhone 11': 'A13',
  'iPhone 12': 'A14',
  'iPhone 13': 'A15',
  'iPhone 14': 'A16',
  'iPhone 15': 'A17',
  'iPad Air': 'A5X',
  'iPad Air 2': 'A8X',
  'iPad mini 2': 'A7',
  'iPad mini 3': 'A7',
  'iPad mini 4': 'A8',
};

// Chips compatible with palera1n (A5s-A11)
const PALERA1N_COMPATIBLE_CHIPS = new Set(['A5s', 'A6', 'A6X', 'A7', 'A7X', 'A8', 'A8X', 'A9', 'A9X', 'A10', 'A10X', 'A11']);

export const JailbreakPanel: React.FC<JailbreakPanelProps> = ({
  device,
  onComplete,
  onError,
}) => {
  const [activeTool, setActiveTool] = useState<JailbreakTool | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [force, setForce] = useState(false);
  const [verbose, setVerbose] = useState(true);
  const [experimental, setExperimental] = useState(false);

  const isCompatibleDevice = device.deviceType === DeviceType.Ios || 
                             device.deviceType === DeviceType.IosDFU ||
                             device.deviceType === DeviceType.IosRecovery;

  if (!isCompatibleDevice) {
    return null;
  }

  // Determine compatible tools based on device chip
  const compatibleTools = useMemo(() => {
    const chip = device.model ? DEVICE_CHIP_MAP[device.model] : '';
    const palera1nCompatible = PALERA1N_COMPATIBLE_CHIPS.has(chip || '');
    
    return {
      palera1n: palera1nCompatible,
      checkra1n: true, // checkra1n works on all iOS devices
    };
  }, [device.model]);

  // Only show one tool if only one is compatible; otherwise show both
  const shouldShowPalera1n = compatibleTools.palera1n;
  const shouldShowCheckra1n = compatibleTools.checkra1n && !compatibleTools.palera1n;

  const handlePalera1n = async () => {
    if (!device.id) return;
    
    try {
      setActiveTool('palera1n');
      setIsExecuting(true);
      setProgress('Starting palera1n jailbreak...');

      const result = await invoke('execute_palera1n', {
        deviceId: device.id,
        force,
        verbose,
      });
      
      const response = result as Record<string, unknown>;
      if (response.jobId && typeof response.jobId === 'string') {
        setProgress('Jailbreak in progress. Keep device connected to USB...');
        pollJobStatus(response.jobId);
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      setProgress(`Error: ${error}`);
      onError?.(error);
    }
  };

  const handleCheckra1n = async () => {
    if (!device.id) return;
    
    try {
      setActiveTool('checkra1n');
      setIsExecuting(true);
      setProgress('Starting checkra1n jailbreak...');

      const result = await invoke('execute_checkra1n', {
        deviceId: device.id,
        force,
        verbose,
        experimental,
      });
      
      const response = result as Record<string, unknown>;
      if (response.jobId && typeof response.jobId === 'string') {
        setProgress('Jailbreak in progress. This may take several minutes...');
        pollJobStatus(response.jobId);
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      setProgress(`Error: ${error}`);
      onError?.(error);
    }
  };

  const pollJobStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const result = await invoke('get_job_status', { jobId: id });
        const status = result as Record<string, unknown>;
        
        if (status.stderr && typeof status.stderr === 'string') {
          setProgress(status.stderr);
        }
        
        if (String(status.status) !== 'Running') {
          clearInterval(interval);
          setIsExecuting(false);
          
          if (String(status.status) === 'Completed') {
            setProgress('Jailbreak completed successfully!');
            onComplete?.(status as unknown as JobStatus);
          } else if (String(status.status) === 'Failed') {
            const errorResult = (status.result as Record<string, unknown>) || {};
            setProgress(`Jailbreak failed: ${errorResult.message || 'Unknown error'}`);
            onError?.(String(errorResult.message) || 'Jailbreak failed');
          }
        }
      } catch (err) {
        console.error('Error polling job status:', err);
      }
    }, 1000);
  };

  return (
    <div className="jailbreak-panel">
      <div className="jailbreak-header">
        <h3>iOS Jailbreak Tools</h3>
        <p className="device-info">Device: {device.model}</p>
      </div>

      {!isExecuting && (
        <div className="jailbreak-tools">
          {shouldShowPalera1n && (
            <div className="tool-card">
              <div className="tool-info">
                <h4>palera1n</h4>
                <p className="tool-desc">checkm8 exploit (A5s-A11 devices, iOS 5.0-17.x)</p>
                <p className="tool-devices">iPhone 5s-X, iPad Air, iPad mini 2-4</p>
              </div>
              <button
                className="tool-btn palera1n-btn"
                onClick={handlePalera1n}
                disabled={isExecuting || !device.id}
              >
                Start palera1n
              </button>
            </div>
          )}

          {shouldShowCheckra1n && (
            <div className="tool-card">
              <div className="tool-info">
                <h4>checkra1n</h4>
                <p className="tool-desc">All iOS versions via bootrom exploit</p>
                <p className="tool-devices">iPhone 5s-14, iPad Air, iPad mini</p>
              </div>
              <button
                className="tool-btn checkra1n-btn"
                onClick={handleCheckra1n}
                disabled={isExecuting || !device.id}
              >
                Start checkra1n
              </button>
            </div>
          )}
        </div>
      )}

      {!isExecuting && (
        <div className="jailbreak-options">
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={force}
              onChange={(e) => setForce(e.target.checked)}
              disabled={isExecuting}
            />
            <span>Force (re-jailbreak if already jailbroken)</span>
          </label>
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={verbose}
              onChange={(e) => setVerbose(e.target.checked)}
              disabled={isExecuting}
            />
            <span>Verbose output</span>
          </label>
          {(shouldShowCheckra1n || (activeTool === 'checkra1n' && shouldShowPalera1n === false)) && (
            <label className="option-checkbox">
              <input
                type="checkbox"
                checked={experimental}
                onChange={(e) => setExperimental(e.target.checked)}
                disabled={isExecuting}
              />
              <span>Experimental features</span>
            </label>
          )}
        </div>
      )}

      {isExecuting && (
        <div className="jailbreak-execution">
          <div className="spinner"></div>
          <p className="status-message">{progress}</p>
          <div className="device-instructions">
            <p><strong>Instructions:</strong></p>
            <ol>
              <li>Connect your device via USB</li>
              <li>Put device in DFU mode (follow on-screen prompts)</li>
              <li>Keep device connected until process completes</li>
              <li>Device will reboot when finished</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default JailbreakPanel;
