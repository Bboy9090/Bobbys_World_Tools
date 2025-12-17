/**
 * BootForge API
 * 
 * Provides API interface for BootForge USB device operations.
 * TODO: Implement real BootForge backend integration
 */

export interface BootForgeDevice {
  id: string;
  name: string;
  vendor: string;
  product: string;
  mode: string;
}

export interface ScanResult {
  devices: BootForgeDevice[];
  timestamp: number;
}

class BootForgeAPI {
  /**
   * Scan for USB devices
   * Returns empty array until real backend is connected
   */
  async scanDevices(): Promise<ScanResult> {
    console.log('[BootForgeAPI] Scanning for USB devices');
    
    // TODO: Connect to real BootForge backend/CLI
    return {
      devices: [],
      timestamp: Date.now(),
    };
  }

  /**
   * Get device details
   * Returns null until real backend is connected
   */
  async getDeviceDetails(deviceId: string): Promise<BootForgeDevice | null> {
    console.log(`[BootForgeAPI] Fetching device details: ${deviceId}`);
    
    // TODO: Connect to real BootForge backend/CLI
    return null;
  }
}

// Export singleton instance
export const bootforgeAPI = new BootForgeAPI();

// Alias for backwards compatibility  
export const bootForgeAPI = bootforgeAPI;
