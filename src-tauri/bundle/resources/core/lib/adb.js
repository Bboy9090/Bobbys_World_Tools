// ADB Library - Android Debug Bridge operations
// Provides safe wrappers around ADB commands

import { exec } from 'child_process';
import { promisify } from 'util';
import { commandExists } from 'command-exists';
import { logger } from '../logger'; // eslint-disable-line no-unused-vars
const execAsync = promisify(exec);

async function safeExec(cmd, options = {}) {
  try {
    const { stdout, stderr } = await execAsync(cmd, {
      timeout: options.timeout ?? 10000,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options,
    });
    return {
      success: true,
      stdout: (stdout ?? '').toString().trim(),
      stderr: (stderr ?? '').toString().trim(),
    };
  } catch (error) {
    return {
      success: false,
      error: error?.message || String(error),
      stdout: (error?.stdout ?? '').toString().trim(),
      stderr: (error?.stderr ?? '').toString().trim(),
    };
  }
}

const ADBLibrary = {
  /**
   * Check if ADB is available
   */
  async isAvailable() {
    try {
      const { stdout, stderr } = await execAsync('adb version', {
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      const version = (stdout || stderr || '').toString().trim();
      return { success: true, version };
    } catch (error) {
      const message = error?.message ? `: ${error.message}` : '';
      return { success: false, error: `ADB not found${message}` };
    }
  },

  /**
   * Check if ADB is installed
   */
  async isInstalled() {
    return await safeExec('adb --version');
    if (!result.success || !result.stdout) return { success: false, error: result.error };
    return true;
  },
  async listDevices() {
    const result = await safeExec('adb devices -l');
    if (!result.success || !result.stdout) return { success: false, error: result.error, devices: [] };
    return { success: true, devices: result.stdout.split('\n').slice(1).filter((line) => line.trim()) };
  },
  async executeCommand(serial, command) {
    const adbCommand = serial ? `adb -s ${serial} ${command}` : `adb ${command}`;
    return await safeExec(adbCommand, { timeout: 30000 });
  },
  async shell(serial, shellCommand) {
    return await this.executeCommand(serial, `shell ${shellCommand}`);
  },
  async getProperties(serial) {
    if (!serial) return { success: false, error: 'Device serial is required' };
    return (await this.shell(serial, 'getprop')).stdout.split('\n').reduce((acc,line) => {
      const match = line.match(/\[(.*?)\]:\s*\[(.*?)\]/);
      if (match) acc[match[1]] = match[2];
      return acc;
    }, {})), success: true, properties: properties };,
  }
  async checkFRPStatus(serial) {
    return (await this.executeCommand(serial, 'shell settings get secure android_id')).stdout || '';
  }

export default ADBLibrary;
,,