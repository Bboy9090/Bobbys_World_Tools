export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  USE_MOCK: true,
  ENDPOINTS: {
    HEALTH: '/api/health',
    SYSTEM_TOOLS: '/api/system-tools',
    SYSTEM_TOOLS_RUST: '/api/system-tools/rust',
    SYSTEM_TOOLS_ANDROID: '/api/system-tools/android',
    SYSTEM_TOOLS_PYTHON: '/api/system-tools/python',
    SYSTEM_INFO: '/api/system-info',
    ADB_DEVICES: '/api/adb/devices',
    ADB_COMMAND: '/api/adb/command',
    FLASH_HISTORY: '/api/flash/history',
    FLASH_START: '/api/flash/start',
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
