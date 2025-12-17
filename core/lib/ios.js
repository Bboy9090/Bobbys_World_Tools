// iOS Library - iOS device command wrapper using libimobiledevice tools
// Provides safe execution of iOS device commands with proper error handling

import { execSync } from 'child_process';

/**
 * Safe execution helper with timeout
 */
function safeExec(cmd, options = {}) {
  try {
    return {
      success: true,
      stdout: execSync(cmd, { 
        encoding: 'utf-8', 
        timeout: options.timeout || 30000,
        ...options
      }).trim()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stderr: error.stderr?.toString() || ''
    };
  }
}

/**
 * Check if libimobiledevice tools are available
 */
function isAvailable() {
  try {
    execSync('command -v idevice_id', { stdio: 'ignore', timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check which tools are installed
 */
function getAvailableTools() {
  const tools = ['idevice_id', 'ideviceinfo', 'idevicepair', 'ideviceimagemounter', 
                 'ideviceinstaller', 'idevicebackup2', 'idevicediagnostics'];
  const available = {};
  
  for (const tool of tools) {
    try {
      execSync(`command -v ${tool}`, { stdio: 'ignore', timeout: 2000 });
      available[tool] = true;
    } catch {
      available[tool] = false;
    }
  }
  
  return available;
}

/**
 * List connected iOS devices
 */
function listDevices() {
  if (!isAvailable()) {
    return { success: false, error: 'libimobiledevice not installed', devices: [] };
  }
  
  const result = safeExec('idevice_id -l');
  if (!result.success) {
    return { success: false, error: result.error, devices: [] };
  }
  
  const udids = result.stdout.split('\n').filter(l => l.trim());
  const devices = udids.map(udid => ({
    udid,
    type: 'ios'
  }));
  
  return { success: true, devices };
}

/**
 * Get device info
 */
function getDeviceInfo(udid) {
  if (!isAvailable()) {
    return { success: false, error: 'libimobiledevice not installed' };
  }
  
  const result = safeExec(`ideviceinfo -u ${udid}`);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  
  const info = {};
  const lines = result.stdout.split('\n');
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      info[key] = value;
    }
  }
  
  return { success: true, info };
}

/**
 * Pair with device
 */
function pair(udid) {
  if (!isAvailable()) {
    return { success: false, error: 'libimobiledevice not installed' };
  }
  
  const result = safeExec(`idevicepair -u ${udid} pair`);
  return result;
}

/**
 * Validate pairing
 */
function validatePairing(udid) {
  if (!isAvailable()) {
    return { success: false, error: 'libimobiledevice not installed' };
  }
  
  const result = safeExec(`idevicepair -u ${udid} validate`);
  return result;
}

/**
 * Unpair from device
 */
function unpair(udid) {
  if (!isAvailable()) {
    return { success: false, error: 'libimobiledevice not installed' };
  }
  
  const result = safeExec(`idevicepair -u ${udid} unpair`);
  return result;
}

/**
 * Install app
 */
function installApp(udid, ipaPath) {
  try {
    execSync('command -v ideviceinstaller', { stdio: 'ignore', timeout: 2000 });
  } catch {
    return { success: false, error: 'ideviceinstaller not installed' };
  }
  
  const result = safeExec(`ideviceinstaller -u ${udid} -i "${ipaPath}"`, { timeout: 300000 });
  return result;
}

/**
 * Uninstall app
 */
function uninstallApp(udid, bundleId) {
  try {
    execSync('command -v ideviceinstaller', { stdio: 'ignore', timeout: 2000 });
  } catch {
    return { success: false, error: 'ideviceinstaller not installed' };
  }
  
  const result = safeExec(`ideviceinstaller -u ${udid} -U ${bundleId}`);
  return result;
}

/**
 * List installed apps
 */
function listApps(udid) {
  try {
    execSync('command -v ideviceinstaller', { stdio: 'ignore', timeout: 2000 });
  } catch {
    return { success: false, error: 'ideviceinstaller not installed' };
  }
  
  const result = safeExec(`ideviceinstaller -u ${udid} -l`);
  if (!result.success) {
    return result;
  }
  
  const apps = result.stdout.split('\n').filter(l => l.trim()).map(line => {
    const parts = line.split(' - ');
    return {
      bundleId: parts[0]?.trim(),
      name: parts[1]?.trim() || parts[0]?.trim()
    };
  });
  
  return { success: true, apps };
}

/**
 * Restart device
 */
function restart(udid) {
  try {
    execSync('command -v idevicediagnostics', { stdio: 'ignore', timeout: 2000 });
  } catch {
    return { success: false, error: 'idevicediagnostics not installed' };
  }
  
  const result = safeExec(`idevicediagnostics -u ${udid} restart`);
  return result;
}

/**
 * Enter recovery mode
 */
function enterRecovery(udid) {
  try {
    execSync('command -v ideviceenterrecovery', { stdio: 'ignore', timeout: 2000 });
  } catch {
    return { success: false, error: 'ideviceenterrecovery not installed' };
  }
  
  const result = safeExec(`ideviceenterrecovery ${udid}`);
  return result;
}

const IOSLibrary = {
  isAvailable,
  getAvailableTools,
  listDevices,
  getDeviceInfo,
  pair,
  validatePairing,
  unpair,
  installApp,
  uninstallApp,
  listApps,
  restart,
  enterRecovery
};

export default IOSLibrary;
