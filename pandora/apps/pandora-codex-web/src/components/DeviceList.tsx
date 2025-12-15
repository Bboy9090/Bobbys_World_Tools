/**
 * DeviceList Component
 * 
 * Displays connected devices with real-time updates from Tether Scryer via Zustand store.
 * Subscribes to device events for live connection/disconnection updates.
 */

import { useState } from 'react';
import { useDeviceStore } from '../stores/deviceStore';
import { tetherScryerManager } from '../services/tetherScryerManager';
import { apiService } from '../services/apiService';
import { DeviceCard } from './DeviceCard';
import { ScrollPanel } from './ScrollPanel';
import { StormstrikeButton } from './StormstrikeButton';
import { NeonGlyphIcon } from './Icons';

interface DeviceListProps {
  onUnlockDevice: (deviceId: string) => Promise<void>;
  onEnterRecoveryMode: (deviceId: string, udid: string) => Promise<void>;
  loading: boolean;
}

/**
 * DeviceList Component
 * 
 * Note: Event listener initialization is handled in App.tsx via tetherScryerManager.
 */
export function DeviceList({ onUnlockDevice, loading }: DeviceListProps) {
  const { devices, lastUpdate } = useDeviceStore();
  const [scanning, setScanning] = useState(false);
  const isMonitoring = tetherScryerManager.isInitialized();

  /**
   * Manual scan trigger for backwards compatibility
   */
  const handleManualScan = async () => {
    setScanning(true);
    try {
      const response = await apiService.listDevices();
      if (response.success) {
        useDeviceStore.getState().setDevices(response.data ?? []);
      } else {
        console.error('[Tether Scryer] Manual scan failed:', response.error ?? 'Unknown error');
        useDeviceStore.getState().setDevices([]);
      }
    } catch (err) {
      console.error('[Tether Scryer] Manual scan failed:', err);
    } finally {
      setScanning(false);
    }
  };

  return (
    <ScrollPanel theme="codex" title="Codex Link Layer Diagnostics">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-tech uppercase tracking-[0.3em] text-dark-muted">
              Tether Scryer Pulse Monitor
            </p>
            <p className="text-lg font-grimoire text-grimoire-electric-blue">
              {devices.length} Active Node{devices.length !== 1 ? 's' : ''}
            </p>
            {lastUpdate && (
              <p className="text-xs text-dark-muted font-tech mt-1">
                Last update: {lastUpdate.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-dark-muted font-tech">
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-grimoire-neon-cyan animate-pulse' : 'bg-gray-500'}`} />
              {isMonitoring ? 'Live monitoring active' : 'Monitoring offline'}
            </span>
            <StormstrikeButton
              onClick={handleManualScan}
              theme="codex"
              size="sm"
              icon={<NeonGlyphIcon size={16} />}
              disabled={scanning}
            >
              {scanning ? 'Scanning...' : 'Pulse Scan'}
            </StormstrikeButton>
          </div>
        </div>

        {/* Device Grid or Empty State */}
        {devices.length === 0 ? (
          <div className="text-center py-12 text-dark-muted">
            <p className="font-grimoire text-xl text-grimoire-electric-blue">Awaiting Link</p>
            <p className="text-sm mt-2 font-tech">
              Connect a device to let the Codex chronicle its presence
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-dark-muted">
              <span className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-grimoire-neon-cyan animate-pulse' : 'bg-gray-500'}`} />
              <span>{isMonitoring ? 'Monitoring for devices...' : 'Monitoring offline'}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onUnlockDevice={onUnlockDevice}
                loading={loading}
              />
            ))}
          </div>
        )}
      </div>
    </ScrollPanel>
  );
}
