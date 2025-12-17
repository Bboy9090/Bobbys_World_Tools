// ADB Library - Android Debug Bridge operations
// Provides core ADB functionality for device management

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * ADB Library for Android device operations
 */
class ADBLibrary {
  /**
   * Check if ADB is available on the system
   */
  async isAvailable() {
    try {
      const { stdout } = await execAsync('adb version');
      return { success: true, version: stdout.trim() };
    } catch (error) {
      return { success: false, error: 'ADB not found. Please install Android platform tools.' };
    }
  }

  /**
   * List connected ADB devices
   */
  async listDevices() {
    try {
      const { stdout } = await execAsync('adb devices -l');
      const lines = stdout.trim().split('\n').slice(1); // Skip header
      
      const devices = lines
        .filter(line => line.trim() && !line.includes('List of devices'))
        .map(line => {
          const parts = line.trim().split(/\s+/);
          return {
            serial: parts[0],
            state: parts[1],
            info: parts.slice(2).join(' ')
          };
        });

      return { success: true, devices };
    } catch (error) {
      return { success: false, error: error.message, devices: [] };
    }
  }

  /**
   * Execute ADB command on a specific device
   */
  async executeCommand(serial, command) {
    try {
      const adbCommand = serial ? `adb -s ${serial} ${command}` : `adb ${command}`;
      const { stdout, stderr } = await execAsync(adbCommand, { timeout: 30000 });
      
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
   * Get device properties
   */
  async getDeviceInfo(serial) {
    try {
      const props = await Promise.all([
        this.executeCommand(serial, 'shell getprop ro.product.manufacturer'),
        this.executeCommand(serial, 'shell getprop ro.product.model'),
        this.executeCommand(serial, 'shell getprop ro.build.version.release'),
        this.executeCommand(serial, 'shell getprop ro.serialno')
      ]);

      return {
        success: true,
        manufacturer: props[0].stdout,
        model: props[1].stdout,
        androidVersion: props[2].stdout,
        deviceSerial: props[3].stdout
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Check FRP lock status
   */
  async checkFRPStatus(serial) {
    try {
      const result = await this.executeCommand(serial, 'shell settings get secure android_id');
      
      if (result.success && result.stdout) {
        return {
          success: true,
          hasFRP: result.stdout.length < 10,
          androidId: result.stdout,
          confidence: result.stdout.length < 10 ? 'high' : 'low'
        };
      }

      return { success: false, error: 'Unable to determine FRP status' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Reboot device to different modes
   */
  async reboot(serial, mode = 'system') {
    const modes = {
      system: 'adb reboot',
      bootloader: 'adb reboot bootloader',
      recovery: 'adb reboot recovery',
      fastboot: 'adb reboot bootloader'
    };

    const command = modes[mode] || modes.system;
    return await this.executeCommand(serial, command.replace('adb ', ''));
  }
}

export default new ADBLibrary();
