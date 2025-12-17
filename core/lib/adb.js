// ADB Library - Android Debug Bridge command wrapper
// Provides safe execution of ADB commands with proper error handling

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
 * Check if ADB is available
 */
function isAvailable() {
  try {
    execSync('command -v adb', { stdio: 'ignore', timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get ADB version
 */
function getVersion() {
  if (!isAvailable()) return null;
  const result = safeExec('adb --version');
  return result.success ? result.stdout : null;
}

/**
 * List connected devices
 */
function listDevices() {
  if (!isAvailable()) {
    return { success: false, error: 'ADB not installed', devices: [] };
  }
  
  const result = safeExec('adb devices -l');
  if (!result.success) {
    return { success: false, error: result.error, devices: [] };
  }
  
  const lines = result.stdout.split('\n').slice(1).filter(l => l.trim());
  const devices = lines.map(line => {
    const parts = line.trim().split(/\s+/);
    const serial = parts[0];
    const state = parts[1];
    const infoStr = parts.slice(2).join(' ');
    
    return {
      serial,
      state,
      product: infoStr.match(/product:(\S+)/)?.[1] || null,
      model: infoStr.match(/model:(\S+)/)?.[1] || null,
      device: infoStr.match(/device:(\S+)/)?.[1] || null,
      transportId: infoStr.match(/transport_id:(\d+)/)?.[1] || null
    };
  }).filter(d => d.serial && d.state);
  
  return { success: true, devices };
}

/**
 * Execute ADB command for a specific device
 */
function executeCommand(serial, command, options = {}) {
  if (!isAvailable()) {
    return { success: false, error: 'ADB not installed' };
  }
  
  if (!serial) {
    return { success: false, error: 'Device serial required' };
  }
  
  const fullCommand = `adb -s ${serial} ${command}`;
  return safeExec(fullCommand, options);
}

/**
 * Get device properties
 */
function getDeviceProps(serial) {
  const result = executeCommand(serial, 'shell getprop');
  if (!result.success) {
    return { success: false, error: result.error };
  }
  
  const props = {};
  const lines = result.stdout.split('\n');
  
  for (const line of lines) {
    const match = line.match(/\[([^\]]+)\]:\s*\[([^\]]*)\]/);
    if (match) {
      props[match[1]] = match[2];
    }
  }
  
  return { success: true, props };
}

/**
 * Reboot device to different modes
 */
function reboot(serial, mode = 'system') {
  const modes = {
    system: '',
    recovery: 'recovery',
    bootloader: 'bootloader',
    sideload: 'sideload'
  };
  
  if (!modes.hasOwnProperty(mode)) {
    return { success: false, error: `Invalid reboot mode: ${mode}` };
  }
  
  const command = modes[mode] ? `reboot ${modes[mode]}` : 'reboot';
  return executeCommand(serial, command);
}

/**
 * Push file to device
 */
function push(serial, localPath, remotePath) {
  return executeCommand(serial, `push "${localPath}" "${remotePath}"`, { timeout: 120000 });
}

/**
 * Pull file from device
 */
function pull(serial, remotePath, localPath) {
  return executeCommand(serial, `pull "${remotePath}" "${localPath}"`, { timeout: 120000 });
}

/**
 * Install APK
 */
function install(serial, apkPath, options = {}) {
  const flags = [];
  if (options.replace) flags.push('-r');
  if (options.downgrade) flags.push('-d');
  if (options.grantPermissions) flags.push('-g');
  
  const flagStr = flags.join(' ');
  return executeCommand(serial, `install ${flagStr} "${apkPath}"`, { timeout: 120000 });
}

/**
 * Execute shell command
 */
function shell(serial, command) {
  return executeCommand(serial, `shell ${command}`);
}

const ADBLibrary = {
  isAvailable,
  getVersion,
  listDevices,
  executeCommand,
  getDeviceProps,
  reboot,
  push,
  pull,
  install,
  shell
};

export default ADBLibrary;
