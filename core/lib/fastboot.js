// Fastboot Library - Fastboot device management
// Provides core Fastboot functionality for bootloader operations

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Fastboot Library for bootloader operations
 */
class FastbootLibrary {
  /**
   * Check if Fastboot is available on the system
   */
  async isAvailable() {
    try {
      const { stdout } = await execAsync('fastboot --version');
      return { success: true, version: stdout.trim() };
    } catch (error) {
      return { success: false, error: 'Fastboot not found. Please install Android platform tools.' };
    }
  }

  /**
   * List connected Fastboot devices
   */
  async listDevices() {
    try {
      const { stdout } = await execAsync('fastboot devices');
      const lines = stdout.trim().split('\n');
      
      const devices = lines
        .filter(line => line.trim())
        .map(line => {
          const parts = line.trim().split(/\s+/);
          return {
            serial: parts[0],
            state: parts[1] || 'fastboot'
          };
        });

      return { success: true, devices };
    } catch (error) {
      return { success: false, error: error.message, devices: [] };
    }
  }

  /**
   * Execute Fastboot command on a specific device
   */
  async executeCommand(serial, command) {
    try {
      const fastbootCommand = serial 
        ? `fastboot -s ${serial} ${command}` 
        : `fastboot ${command}`;
      
      const { stdout, stderr } = await execAsync(fastbootCommand, { timeout: 60000 });
      
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
   * Get device variables
   */
  async getVariable(serial, variable) {
    try {
      const result = await this.executeCommand(serial, `getvar ${variable}`);
      
      // Fastboot outputs to stderr
      const output = result.stderr || result.stdout;
      const match = output.match(new RegExp(`${variable}:\\s*(.+)`));
      
      if (match) {
        return {
          success: true,
          variable,
          value: match[1].trim()
        };
      }

      return { success: false, error: `Variable ${variable} not found` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Check bootloader lock status
   */
  async getBootloaderStatus(serial) {
    try {
      const result = await this.getVariable(serial, 'unlocked');
      
      return {
        success: true,
        unlocked: result.value === 'yes',
        status: result.value
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Flash partition
   */
  async flash(serial, partition, image) {
    try {
      const result = await this.executeCommand(serial, `flash ${partition} ${image}`);
      
      return {
        success: result.success,
        partition,
        output: result.stdout || result.stderr
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Unlock bootloader (destructive - erases all data)
   */
  async unlock(serial) {
    try {
      // Try modern unlock command first (Pixel devices)
      let result = await this.executeCommand(serial, 'flashing unlock');
      
      // If that fails, try legacy command
      if (!result.success) {
        result = await this.executeCommand(serial, 'oem unlock');
      }

      return {
        success: result.success,
        output: result.stdout || result.stderr,
        warning: 'This operation erased all data on the device'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Reboot device
   */
  async reboot(serial, mode = 'system') {
    const modes = {
      system: 'reboot',
      bootloader: 'reboot-bootloader',
      recovery: 'reboot-recovery'
    };

    const command = modes[mode] || modes.system;
    return await this.executeCommand(serial, command);
  }
}

export default new FastbootLibrary();
