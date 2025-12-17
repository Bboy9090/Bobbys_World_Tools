// Fastboot Library - Fastboot device management
// Provides core Fastboot functionality for bootloader operations

import { execFile } from 'child_process';
import { promisify } from 'util';
import shellQuote from 'shell-quote';

const execFileAsync = promisify(execFile);

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
      // Sanitize serial (allow only alphanum + dot, colon, dash, underscore)
      let args = [];
      if (serial) {
        if (!/^[\w.\-:]+$/.test(serial)) {
          throw new Error('Invalid device serial');
        }
        args.push('-s', serial);
      }
      // Parse command string into args using shell-quote (handles quoting/escaping)
      if (typeof command === 'string') {
        args = args.concat(shellQuote.parse(command).filter(a => typeof a === 'string'));
      } else if (Array.isArray(command)) {
        args = args.concat(command);
      } else {
        throw new Error('Invalid fastboot command');
      }
      // Run execFileAsync instead of execAsync (shell not used)
      const { stdout, stderr } = await execFileAsync('fastboot', args, { timeout: 60000 });
      
      return {
        success: true,
        stdout: stdout ? stdout.toString().trim() : '',
        stderr: stderr ? stderr.toString().trim() : ''
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
