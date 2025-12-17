// Fastboot Library - Fastboot command wrapper for bootloader operations
// Provides safe execution of fastboot commands with proper error handling

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
 * Check if fastboot is available
 */
function isAvailable() {
  try {
    execSync('command -v fastboot', { stdio: 'ignore', timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get fastboot version
 */
function getVersion() {
  if (!isAvailable()) return null;
  const result = safeExec('fastboot --version');
  return result.success ? result.stdout : null;
}

/**
 * List connected devices in fastboot mode
 */
function listDevices() {
  if (!isAvailable()) {
    return { success: false, error: 'Fastboot not installed', devices: [] };
  }
  
  const result = safeExec('fastboot devices');
  if (!result.success) {
    return { success: false, error: result.error, devices: [] };
  }
  
  const lines = result.stdout.split('\n').filter(l => l.trim());
  const devices = lines.map(line => {
    const parts = line.trim().split(/\s+/);
    return {
      serial: parts[0],
      mode: parts[1] || 'fastboot'
    };
  }).filter(d => d.serial);
  
  return { success: true, devices };
}

/**
 * Execute fastboot command for a specific device
 */
function executeCommand(serial, command, options = {}) {
  if (!isAvailable()) {
    return { success: false, error: 'Fastboot not installed' };
  }
  
  if (!serial) {
    return { success: false, error: 'Device serial required' };
  }
  
  const fullCommand = `fastboot -s ${serial} ${command}`;
  return safeExec(fullCommand, options);
}

/**
 * Get device variable
 */
function getVar(serial, varName) {
  const result = executeCommand(serial, `getvar ${varName} 2>&1`);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  
  const match = result.stdout.match(new RegExp(`${varName}:\\s*(.+)`, 'i'));
  return { 
    success: true, 
    value: match ? match[1].trim() : null 
  };
}

/**
 * Get all device info
 */
function getDeviceInfo(serial) {
  const info = {};
  const vars = ['product', 'variant', 'version-bootloader', 'version-baseband', 
                'serialno', 'secure', 'unlocked', 'max-download-size', 
                'current-slot', 'slot-count'];
  
  for (const varName of vars) {
    const result = getVar(serial, varName);
    if (result.success && result.value) {
      info[varName.replace(/-/g, '_')] = result.value;
    }
  }
  
  return { success: true, info };
}

/**
 * Flash a partition
 */
function flash(serial, partition, imagePath, options = {}) {
  return executeCommand(serial, `flash ${partition} "${imagePath}"`, { 
    timeout: options.timeout || 300000 // 5 minute default for flash
  });
}

/**
 * Erase a partition
 */
function erase(serial, partition) {
  return executeCommand(serial, `erase ${partition}`, { timeout: 60000 });
}

/**
 * Reboot device
 */
function reboot(serial, mode = 'system') {
  const modeMap = {
    system: '',
    bootloader: '-bootloader',
    recovery: 'recovery'
  };
  
  const flag = modeMap[mode];
  if (flag === undefined) {
    return { success: false, error: `Invalid reboot mode: ${mode}` };
  }
  
  const command = flag ? `reboot ${flag}` : 'reboot';
  return executeCommand(serial, command);
}

/**
 * OEM unlock command
 */
function oemUnlock(serial) {
  return executeCommand(serial, 'oem unlock', { timeout: 60000 });
}

/**
 * Flashing unlock command (newer devices)
 */
function flashingUnlock(serial) {
  return executeCommand(serial, 'flashing unlock', { timeout: 60000 });
}

/**
 * Update from zip file
 */
function update(serial, zipPath) {
  return executeCommand(serial, `update "${zipPath}"`, { timeout: 600000 }); // 10 minute timeout
}

const FastbootLibrary = {
  isAvailable,
  getVersion,
  listDevices,
  executeCommand,
  getVar,
  getDeviceInfo,
  flash,
  erase,
  reboot,
  oemUnlock,
  flashingUnlock,
  update
};

export default FastbootLibrary;
