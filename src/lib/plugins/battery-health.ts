/**
 * Battery Health Plugin - Stub implementation
 */

export interface BatteryHealth {
  level: number;
  health: string;
  cycleCount?: number;
}

export const batteryHealthPlugin = {
  check: async (deviceId: string): Promise<BatteryHealth | null> => {
    console.warn('[BatteryHealthPlugin] Using stub implementation');
    return null;
  }
};

export default batteryHealthPlugin;
