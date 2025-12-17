// iOS Library - iOS device operations
// Provides core iOS functionality using libimobiledevice

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * iOS Library for iOS device operations
 */
class IOSLibrary {
  /**
   * Check if libimobiledevice is available
   */
  async isAvailable() {
    try {
      const { stdout } = await execAsync('idevice_id --version');
      return { success: true, version: stdout.trim() };
    } catch (error) {
      return { 
        success: false, 
        error: 'libimobiledevice not found. Please install iOS support tools.' 
      };
    }
  }

  /**
   * List connected iOS devices
   */
  async listDevices() {
    try {
      const { stdout } = await execAsync('idevice_id -l');
      const lines = stdout.trim().split('\n');
      
      const devices = lines
        .filter(line => line.trim())
        .map(udid => ({
          udid: udid.trim(),
          platform: 'ios'
        }));

      return { success: true, devices };
    } catch (error) {
      return { success: false, error: error.message, devices: [] };
    }
  }

  /**
   * Get device information
   */
  async getDeviceInfo(udid) {
    try {
      const command = udid ? `ideviceinfo -u ${udid}` : 'ideviceinfo';
      const { stdout } = await execAsync(command);
      
      const info = {};
      stdout.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
          info[key.trim()] = valueParts.join(':').trim();
        }
      });

      return {
        success: true,
        udid: info.UniqueDeviceID || udid,
        deviceName: info.DeviceName,
        productType: info.ProductType,
        productVersion: info.ProductVersion,
        serialNumber: info.SerialNumber,
        info
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Check device mode (normal, recovery, DFU)
   */
  async getDeviceMode(udid) {
    try {
      // Check for normal mode
      const normalCheck = await this.listDevices();
      if (normalCheck.success && normalCheck.devices.some(d => d.udid === udid)) {
        return { success: true, mode: 'normal', udid };
      }

      // Check for recovery mode
      const { stdout: recoveryOutput } = await execAsync('irecovery -q').catch(() => ({ stdout: '' }));
      if (recoveryOutput.includes('MODE')) {
        if (recoveryOutput.includes('Recovery')) {
          return { success: true, mode: 'recovery', udid };
        }
        if (recoveryOutput.includes('DFU')) {
          return { success: true, mode: 'dfu', udid };
        }
      }

      return { success: false, error: 'Device mode unknown or device not connected' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute iOS command
   */
  async executeCommand(udid, command) {
    try {
      const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
      
      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr.trim()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stdout: error.stdout || '',
        stderr: error.stderr || ''
      };
    }
  }

  /**
   * Enter recovery mode
   */
  async enterRecovery(udid) {
    try {
      const command = udid 
        ? `ideviceenterrecovery ${udid}` 
        : 'ideviceenterrecovery';
      
      const result = await this.executeCommand(udid, command);
      
      return {
        success: result.success,
        mode: 'recovery',
        output: result.stdout
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Reboot device
   */
  async reboot(udid) {
    try {
      const command = udid 
        ? `idevicediagnostics restart -u ${udid}` 
        : 'idevicediagnostics restart';
      
      const result = await this.executeCommand(udid, command);
      
      return {
        success: result.success,
        output: result.stdout
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new IOSLibrary();
