export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  USE_MOCK: false,
  ENDPOINTS: {
    HEALTH: '/api/health',
    SYSTEM_TOOLS: '/api/system-tools',
    SYSTEM_TOOLS_RUST: '/api/system-tools/rust',
    SYSTEM_TOOLS_ANDROID: '/api/system-tools/android',
    SYSTEM_TOOLS_PYTHON: '/api/system-tools/python',
    SYSTEM_INFO: '/api/system-info',
    ADB_DEVICES: '/api/adb/devices',
    ADB_COMMAND: '/api/adb/command',
    FASTBOOT_DEVICES: '/api/fastboot/devices',
    FASTBOOT_DEVICE_INFO: '/api/fastboot/device-info',
    FASTBOOT_FLASH: '/api/fastboot/flash',
    FASTBOOT_UNLOCK: '/api/fastboot/unlock',
    FASTBOOT_REBOOT: '/api/fastboot/reboot',
    FASTBOOT_ERASE: '/api/fastboot/erase',
    FLASH_DEVICES: '/api/flash/devices',
    FLASH_DEVICE_INFO: '/api/flash/devices',
    FLASH_DEVICE_PARTITIONS: '/api/flash/devices',
    FLASH_VALIDATE_IMAGE: '/api/flash/validate-image',
    FLASH_START: '/api/flash/start',
    FLASH_PAUSE: '/api/flash/pause',
    FLASH_RESUME: '/api/flash/resume',
    FLASH_CANCEL: '/api/flash/cancel',
    FLASH_STATUS: '/api/flash/status',
    FLASH_ACTIVE_OPERATIONS: '/api/flash/operations/active',
    FLASH_HISTORY: '/api/flash/history',
    MONITOR_START: '/api/monitor/start',
    MONITOR_STOP: '/api/monitor/stop',
    MONITOR_LIVE: '/api/monitor/live',
    TESTS_RUN: '/api/tests/run',
    TESTS_RESULTS: '/api/tests/results',
    STANDARDS: '/api/standards',
    HOTPLUG_EVENTS: '/api/hotplug/events',
  },
  TIMEOUT: 10000,
};

export async function checkAPIHealth(): Promise<boolean> {
  if (API_CONFIG.USE_MOCK) return true;
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`, {
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function getAPIUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}
