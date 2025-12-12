export const API_CONFIG = {
  BASE_URL: process.env.VITE_API_URL || 'http://localhost:3001',
  ENDPOINTS: {
    HEALTH: '/api/health',
    SYSTEM_TOOLS: '/api/system-tools',
    SYSTEM_TOOLS_RUST: '/api/system-tools/rust',
    SYSTEM_TOOLS_ANDROID: '/api/system-tools/android',
    SYSTEM_TOOLS_PYTHON: '/api/system-tools/python',
    SYSTEM_INFO: '/api/system-info',
    ADB_DEVICES: '/api/adb/devices',
    ADB_COMMAND: '/api/adb/command',
  },
  TIMEOUT: 10000,
};

export async function checkAPIHealth(): Promise<boolean> {
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
