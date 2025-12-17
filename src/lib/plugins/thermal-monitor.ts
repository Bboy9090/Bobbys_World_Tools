/**
 * Thermal Monitor Plugin - Stub implementation
 */

export interface ThermalInfo {
  temperature: number;
  status: 'normal' | 'warm' | 'hot' | 'critical';
}

export const thermalMonitorPlugin = {
  monitor: async (deviceId: string): Promise<ThermalInfo | null> => {
    console.warn('[ThermalMonitorPlugin] Using stub implementation');
    return null;
  }
};

export default thermalMonitorPlugin;
