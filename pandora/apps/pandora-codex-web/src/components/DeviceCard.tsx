/**
 * DeviceCard Component
 *
 * Displays a single device with state badges and action buttons.
 * Shows ADB/Fastboot/Unauthorized badges based on device mode.
 */

import { useState } from 'react';
import { apiService } from '../services/apiService';
import { DeviceCommandPanel } from './DeviceCommandPanel';
import { LockdownPanel } from './LockdownPanel';
import type { DeviceInfo } from '../services/apiService';

interface DeviceCardProps {
  device: DeviceInfo;
  onUnlockDevice: (deviceId: string) => Promise<void>;
  loading: boolean;
}

/**
 * Device Badge Component
 * Shows the appropriate badge based on device status
 */
function DeviceBadge({ device }: { device: DeviceInfo }) {
  const status = device.properties?.status || '';
  const isUnauthorized = device.locked || status === 'unauthorized';
  const isFastboot = device.id.startsWith('fastboot-') || status === 'Fastboot';
  const isOnline = status === 'Online' || status === 'device';
  const isIos = device.id.startsWith('ios-') || status === 'iOS' || device.deviceType === 'Ios';

  if (isUnauthorized) {
    return (
      <span className="px-2 py-1 rounded text-xs font-tech tracking-wide bg-red-900/40 border border-red-500/50 text-red-300">
        ⚠ Unauthorized
      </span>
    );
  }

  if (isFastboot) {
    return (
      <span className="px-2 py-1 rounded text-xs font-tech tracking-wide bg-grimoire-thunder-gold/20 border border-grimoire-thunder-gold/40 text-grimoire-thunder-gold">
        ⚡ Fastboot
      </span>
    );
  }

  if (isIos) {
    return (
      <span className="px-2 py-1 rounded text-xs font-tech tracking-wide bg-white/10 border border-white/30 text-white">
        🍎 iOS
      </span>
    );
  }

  if (isOnline) {
    return (
      <span className="px-2 py-1 rounded text-xs font-tech tracking-wide bg-emerald-500/20 border border-emerald-400/50 text-emerald-300">
        ✓ ADB
      </span>
    );
  }

  return (
    <span className="px-2 py-1 rounded text-xs font-tech tracking-wide bg-gray-700/60 text-gray-300 border border-gray-500/50">
      Unknown
    </span>
  );
}

/**
 * Connection Status Indicator Component
 */
function ConnectionStatus({ connected }: { connected: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-2.5 h-2.5 rounded-full ${
          connected ? 'bg-grimoire-neon-cyan shadow-glow-blue animate-pulse' : 'bg-gray-600'
        }`}
        title={connected ? 'Connected' : 'Disconnected'}
      />
      <span
        className={`text-xs font-medium ${
          connected ? 'text-grimoire-electric-blue' : 'text-gray-400'
        }`}
      >
        {connected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
}

/**
 * DeviceCard Component
 */
export function DeviceCard({ device, onUnlockDevice, loading }: DeviceCardProps) {
  const [actionLoading, setActionLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [lockdownData, setLockdownData] = useState<any>(null);
  
  const status = device.properties?.status || '';
  const isOnline = status === 'Online' || status === 'device';
  const isIos = device.id.startsWith('ios-') || device.deviceType === 'Ios';

  /**
   * Fetch lockdown diagnostics for iOS device
   */
  const fetchLockdownDiagnostics = async () => {
    try {
      const response = await apiService.getLockdownDiagnostics(device.id);
      if (response.data) {
        setLockdownData(response.data.lockdown);
      }
    } catch (error) {
      console.error('Failed to fetch lockdown diagnostics:', error);
    }
  };

  /**
   * Handle iOS enter recovery
   */
  const handleEnterRecovery = async () => {
    const udid = device.properties?.udid || device.id.replace(/^ios-/, '');
    
    setActionLoading(true);
    try {
      await apiService.iosEnterRecovery(udid);
    } catch (error) {
      console.error('Failed to enter recovery mode:', error);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle reboot to bootloader
   */
  const handleRebootToBootloader = async () => {
    if (!device.serial) return;

    setActionLoading(true);
    try {
      await apiService.adbReboot(device.id, 'bootloader');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle unlock device
   */
  const handleUnlockDevice = async () => {
    try {
      await onUnlockDevice(device.id);
    } catch (error) {
      console.error('Failed to unlock device:', error);
    }
  };

  return (
    <div className="grimoire-card border-2 border-transparent bg-gradient-to-br from-grimoire-obsidian via-grimoire-obsidian-light to-grimoire-obsidian/80 p-5 space-y-4 transition-all duration-300 hover:border-grimoire-electric-blue/60">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-grimoire text-lg font-semibold text-grimoire-electric-blue">
            {device.model || 'Unknown Model'}
          </h3>
          {device.manufacturer && (
            <p className="text-sm text-dark-muted font-tech tracking-wide uppercase">
              {device.manufacturer}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <DeviceBadge device={device} />
          <ConnectionStatus connected={device.connected} />
        </div>
      </div>

      {/* Device Info */}
      <div className="space-y-1 text-sm">
        <p className="text-dark-muted">
          <span className="font-medium text-grimoire-neon-cyan">Type:</span> {device.deviceType}
        </p>
        <p className="text-dark-muted">
          <span className="font-medium text-grimoire-neon-cyan">Serial:</span>{' '}
          {device.serial || 'N/A'}
        </p>
        <p className="text-dark-muted">
          <span className="font-medium text-grimoire-neon-cyan">Status:</span>{' '}
          <span className={device.locked ? 'text-yellow-400' : 'text-green-400'}>
            {device.locked ? '🔒 Locked' : '🔓 Unlocked'}
          </span>
        </p>
        
        {/* Quick properties preview */}
        {device.properties && Object.keys(device.properties).length > 0 && (
          <div className="text-xs space-y-1 mt-2">
            {Object.entries(device.properties).slice(0, 3).map(([key, value]) => (
              <p key={key} className="text-dark-muted">
                <span className="font-medium text-grimoire-neon-cyan">{key}:</span> {value}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Details Section (Expandable) */}
      {showDetails && device.properties && Object.keys(device.properties).length > 0 && (
        <div className="pt-3 border-t border-grimoire-electric-blue/20 space-y-1 text-sm">
          {Object.entries(device.properties).map(([key, value]) => (
            <p key={key} className="text-dark-muted">
              <span className="font-medium text-grimoire-neon-cyan">{key}:</span> {value}
            </p>
          ))}
        </div>
      )}

      {/* Lockdown Diagnostics Panel (iOS) */}
      {isIos && lockdownData && (
        <div className="pt-3 border-t border-grimoire-electric-blue/20">
          <LockdownPanel lockdown={lockdownData} />
        </div>
      )}

      {/* Device Command Panel */}
      <div className="pt-3 border-t border-grimoire-electric-blue/20">
        <DeviceCommandPanel device={device} onCommandExecuted={(result) => {
          console.log('Command executed:', result);
        }} />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-3">
        {/* Toggle Details Button */}
        {device.properties && Object.keys(device.properties).length > 0 && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1.5 text-xs bg-grimoire-electric-blue/10 hover:bg-grimoire-electric-blue/20 text-grimoire-neon-cyan rounded transition-colors border border-grimoire-electric-blue/30"
          >
            {showDetails ? 'Hide' : 'Show'} Full Details
          </button>
        )}

        {/* Unlock Button - Only for locked devices */}
        {device.locked && (
          <button
            onClick={handleUnlockDevice}
            disabled={loading || actionLoading}
            className="w-full px-4 py-2 bg-grimoire-thunder-gold hover:bg-grimoire-thunder-gold/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-grimoire-obsidian font-tech font-bold rounded-lg transition-colors shadow-glow-gold"
          >
            {loading ? '⚡ Processing...' : '🔓 Attempt Unlock'}
          </button>
        )}

        {/* Device-specific action buttons */}
        <div className="flex gap-2">
          {/* iOS Actions */}
          {isIos && (
            <>
              <button
                onClick={fetchLockdownDiagnostics}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-tech"
              >
                {actionLoading ? 'Loading...' : '📊 iOS Diagnostics'}
              </button>
              <button
                onClick={handleEnterRecovery}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-tech"
              >
                {actionLoading ? 'Entering...' : '🍎 Enter Recovery'}
              </button>
            </>
          )}

          {/* ADB Actions */}
          {isOnline && (
            <button
              onClick={handleRebootToBootloader}
              disabled={actionLoading}
              className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-tech"
            >
              {actionLoading ? 'Rebooting...' : '⚡ Reboot to Bootloader'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
