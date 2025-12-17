// ADB Library - Android Debug Bridge operations
// Provides safe wrappers around ADB commands

import { execSync } from 'child_process';

function safeExec(cmd, options = {}) {
  try {
    return {
      success: true,
      stdout: execSync(cmd, { 
        encoding: 'utf-8', 
        timeout: options.timeout || 10000,
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

function commandExists(cmd) {
  try {
    execSync(`command -v ${cmd}`, { stdio: 'ignore', timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

const ADBLibrary = {
  /**
   * Check if ADB is installed
   */
  isInstalled() {
    return commandExists('adb');
  },

  /**
   * Get ADB version
   */
  getVersion() {
    if (!this.isInstalled()) {
      return { success: false, error: 'ADB not installed' };
    }
    return safeExec('adb --version');
  },

  /**
   * List connected devices
   */
  listDevices() {
    if (!this.isInstalled()) {
      return { success: false, error: 'ADB not installed', devices: [] };
    }
    
    const result = safeExec('adb devices -l');
    if (!result.success) {
      return { ...result, devices: [] };
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
        device: infoStr.match(/device:(\S+)/)?.[1] || null
      };
    }).filter(d => d.serial && d.state);
    
    return { success: true, devices };
  },

  /**
   * Execute ADB command for a specific device
   * @param {string} serial - Device serial number
   * @param {string} command - ADB command to execute (without 'adb' prefix)
   */
  executeCommand(serial, command) {
    if (!this.isInstalled()) {
      return { success: false, error: 'ADB not installed' };
    }
    
    // Sanitize command to prevent injection
    if (command.includes(';') || command.includes('|') || command.includes('&')) {
      return { success: false, error: 'Command contains invalid characters' };
    }
    
    return safeExec(`adb -s ${serial} ${command}`, { timeout: 30000 });
  },

  /**
   * Execute shell command on device
   * @param {string} serial - Device serial number
   * @param {string} shellCommand - Shell command to execute
   */
  shell(serial, shellCommand) {
    return this.executeCommand(serial, `shell "${shellCommand}"`);
  },

  /**
   * Get device properties
   * @param {string} serial - Device serial number
   */
  getProperties(serial) {
    const result = this.shell(serial, 'getprop');
    if (!result.success) {
      return result;
    }
    
    const props = {};
    const lines = result.stdout.split('\n');
    lines.forEach(line => {
      const match = line.match(/\[(.*?)\]:\s*\[(.*?)\]/);
      if (match) {
        props[match[1]] = match[2];
      }
    });
    
    return { success: true, properties: props };
  },

  /**
   * Get device mode (normal, recovery, sideload, etc.)
   * @param {string} serial - Device serial number
   */
  getDeviceMode(serial) {
    const devices = this.listDevices();
    if (!devices.success) {
      return devices;
    }
    
    const device = devices.devices.find(d => d.serial === serial);
    if (!device) {
      return { success: false, error: 'Device not found' };
    }
    
    let mode = 'unknown';
    switch (device.state) {
      case 'device':
        mode = 'android_os';
        break;
      case 'recovery':
        mode = 'recovery';
        break;
      case 'sideload':
        mode = 'sideload';
        break;
      case 'unauthorized':
        mode = 'unauthorized';
        break;
      case 'offline':
        mode = 'offline';
        break;
    }
    
    return { success: true, mode, state: device.state };
  },

  /**
   * Reboot device
   * @param {string} serial - Device serial number
   * @param {string} mode - Reboot mode: 'system', 'recovery', 'bootloader'
   */
  reboot(serial, mode = 'system') {
    const validModes = ['system', 'recovery', 'bootloader'];
    if (!validModes.includes(mode)) {
      return { success: false, error: `Invalid mode. Must be one of: ${validModes.join(', ')}` };
    }
    
    const command = mode === 'system' ? 'reboot' : `reboot ${mode}`;
    return this.executeCommand(serial, command);
  }
};

export default ADBLibrary;
