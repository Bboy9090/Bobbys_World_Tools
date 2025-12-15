/**
 * Tether Scryer Manager - Singleton service for device event listeners
 * 
 * Manages the lifecycle of Tauri device event subscriptions.
 * Designed for single-shot initialization (desktop app mounts once).
 * Gracefully handles browser-only mode (no Tauri runtime).
 */

import { useDeviceStore } from '../stores/deviceStore';
import type { DeviceInfo } from './apiService';

type UnlistenFn = () => void;

interface DeviceEvent {
  event_type: string;
  device: DeviceInfo;
  timestamp: string;
}

const isTauriAvailable = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

class TetherScryerManager {
  private unlisteners: UnlistenFn[] = [];
  private initialized: boolean = false;
  private initializingPromise: Promise<void> | null = null;
  private abortController: AbortController | null = null;

  /**
   * Initialize listeners (idempotent - only runs once)
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('[Tether Scryer Manager] Already initialized');
      return;
    }

    if (this.initializingPromise) {
      console.log('[Tether Scryer Manager] Initialization in progress');
      return this.initializingPromise;
    }

    if (!isTauriAvailable()) {
      console.log('[Tether Scryer Manager] Running in browser mode (no Tauri runtime)');
      this.initialized = true;
      return;
    }

    this.abortController = new AbortController();
    this.initializingPromise = this._doInitialize(this.abortController.signal);
    
    try {
      await this.initializingPromise;
    } finally {
      this.initializingPromise = null;
      this.abortController = null;
    }
  }

  private async _doInitialize(signal: AbortSignal): Promise<void> {
    console.log('[Tether Scryer Manager] Starting event listeners...');

    const tempUnlisteners: UnlistenFn[] = [];

    try {
      const { listen } = await import('@tauri-apps/api/event');
      
      if (signal.aborted) throw new Error('Initialization aborted');

      const unlistenConnected = await listen<DeviceEvent>('device:connected', (event) => {
        try {
          console.log('[Tether Scryer] Device connected:', event.payload);
          const payload = event.payload;
          if (payload && typeof payload === 'object' && 'device' in payload) {
            const device = payload.device;
            if (device && typeof device === 'object' && typeof device.id === 'string') {
              useDeviceStore.getState().updateDevice(device);
            } else {
              console.warn('[Tether Scryer] Invalid device in connected event:', device);
            }
          } else {
            console.warn('[Tether Scryer] Invalid connected event payload:', payload);
          }
        } catch (err) {
          console.error('[Tether Scryer] Error handling device:connected event:', err);
        }
      });
      tempUnlisteners.push(unlistenConnected);
      if (signal.aborted) throw new Error('Initialization aborted');

      const unlistenDisconnected = await listen<DeviceEvent>('device:disconnected', (event) => {
        try {
          console.log('[Tether Scryer] Device disconnected:', event.payload);
          const payload = event.payload;
          if (payload && typeof payload === 'object' && 'device' in payload) {
            const device = payload.device;
            if (device && typeof device === 'object' && typeof device.id === 'string') {
              useDeviceStore.getState().removeDevice(device.id);
            } else {
              console.warn('[Tether Scryer] Invalid device in disconnected event:', device);
            }
          } else {
            console.warn('[Tether Scryer] Invalid disconnected event payload:', payload);
          }
        } catch (err) {
          console.error('[Tether Scryer] Error handling device:disconnected event:', err);
        }
      });
      tempUnlisteners.push(unlistenDisconnected);
      if (signal.aborted) throw new Error('Initialization aborted');

      const unlistenUpdated = await listen<DeviceInfo[]>('device:list_updated', (event) => {
        try {
          const payload = event.payload;
          if (Array.isArray(payload)) {
            const validDevices = payload.filter(
              (d): d is DeviceInfo => d && typeof d === 'object' && typeof d.id === 'string'
            );
            console.log('[Tether Scryer] Device list updated:', validDevices.length, 'devices');
            useDeviceStore.getState().setDevices(validDevices);
          } else {
            console.warn('[Tether Scryer] Invalid list_updated payload (not an array):', payload);
          }
        } catch (err) {
          console.error('[Tether Scryer] Error handling device:list_updated event:', err);
        }
      });
      tempUnlisteners.push(unlistenUpdated);
      if (signal.aborted) throw new Error('Initialization aborted');

      this.unlisteners = tempUnlisteners;
      this.initialized = true;
      console.log('[Tether Scryer Manager] Event listeners started successfully');
    } catch (error) {
      console.error('[Tether Scryer Manager] Failed to initialize:', error);
      throw error;
    } finally {
      if (!this.initialized && tempUnlisteners.length > 0) {
        console.log('[Tether Scryer Manager] Cleaning up partial listeners');
        tempUnlisteners.forEach(unlisten => unlisten());
      }
    }
  }

  /**
   * Dispose all listeners (cleanup on shutdown)
   */
  async dispose(): Promise<void> {
    console.log('[Tether Scryer Manager] Disposing event listeners...');
    
    // Abort any in-flight initialization
    if (this.abortController) {
      this.abortController.abort();
    }
    
    // Wait for initialization to complete (with error handling)
    if (this.initializingPromise) {
      try {
        await this.initializingPromise;
      } catch (error) {
        // Ignore initialization errors - we're cleaning up anyway
        console.log('[Tether Scryer Manager] Initialization rejected during dispose (expected)', error);
      } finally {
        this.initializingPromise = null;
      }
    }
    
    // CRITICAL: This cleanup MUST run even if initialize() rejected
    this.unlisteners.forEach(unlisten => unlisten());
    this.unlisteners = [];
    this.initialized = false;
    
    console.log('[Tether Scryer Manager] Event listeners disposed');
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance
export const tetherScryerManager = new TetherScryerManager();
