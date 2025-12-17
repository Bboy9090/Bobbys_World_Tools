// Shadow Logger - AES-256-GCM encrypted logging for sensitive operations
// Used for audit trails of FRP bypass, bootloader unlock, and other sensitive operations

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits

class ShadowLogger {
  constructor(options = {}) {
    this.logsDir = options.logsDir || path.join(process.cwd(), 'logs');
    this.shadowDir = path.join(this.logsDir, 'shadow');
    this.publicDir = path.join(this.logsDir, 'public');
    this.retentionDays = options.retentionDays || 90;
    
    // Generate or load encryption key
    // In production, this should be stored securely (e.g., environment variable, secrets manager)
    this.encryptionKey = options.encryptionKey || 
      crypto.createHash('sha256')
        .update(process.env.SHADOW_LOG_KEY || 'default-dev-key-do-not-use-in-production')
        .digest();

    // Ensure directories exist
    this._ensureDirectories();
  }

  _ensureDirectories() {
    if (!existsSync(this.logsDir)) {
      mkdirSync(this.logsDir, { recursive: true });
    }
    if (!existsSync(this.shadowDir)) {
      mkdirSync(this.shadowDir, { recursive: true });
    }
    if (!existsSync(this.publicDir)) {
      mkdirSync(this.publicDir, { recursive: true });
    }
  }

  /**
   * Encrypt data using AES-256-GCM
   * @param {string} data - The data to encrypt
   * @returns {string} - JSON string containing IV, encrypted data, and auth tag
   */
  encrypt(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, this.encryptionKey, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      iv: iv.toString('hex'),
      data: encrypted,
      authTag: authTag.toString('hex')
    });
  }

  /**
   * Decrypt data using AES-256-GCM
   * @param {string} encryptedJson - JSON string from encrypt()
   * @returns {string} - Decrypted data
   */
  decrypt(encryptedJson) {
    const { iv, data, authTag } = JSON.parse(encryptedJson);
    
    const decipher = crypto.createDecipheriv(
      ENCRYPTION_ALGORITHM, 
      this.encryptionKey, 
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Log to encrypted shadow log
   * @param {object} entry - Log entry
   * @returns {Promise<{ success: boolean, encrypted: boolean }>}
   */
  async logShadow(entry) {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = {
        ...entry,
        timestamp,
        logType: 'shadow'
      };

      const encrypted = this.encrypt(JSON.stringify(logEntry));
      const date = timestamp.split('T')[0];
      const logFile = path.join(this.shadowDir, `shadow-${date}.enc`);

      await fs.appendFile(logFile, encrypted + '\n', 'utf8');

      return { success: true, encrypted: true };
    } catch (error) {
      console.error('Shadow log error:', error);
      return { success: false, encrypted: false, error: error.message };
    }
  }

  /**
   * Log to public (non-encrypted) log
   * @param {object} entry - Log entry
   * @returns {Promise<{ success: boolean, encrypted: boolean }>}
   */
  async logPublic(entry) {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = {
        ...entry,
        timestamp,
        logType: 'public'
      };

      const date = timestamp.split('T')[0];
      const logFile = path.join(this.publicDir, `public-${date}.log`);

      await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n', 'utf8');

      return { success: true, encrypted: false };
    } catch (error) {
      console.error('Public log error:', error);
      return { success: false, encrypted: false, error: error.message };
    }
  }

  /**
   * Read shadow logs for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<{ success: boolean, entries?: Array }>}
   */
  async readShadowLogs(date) {
    try {
      const logDate = date || new Date().toISOString().split('T')[0];
      const logFile = path.join(this.shadowDir, `shadow-${logDate}.enc`);

      if (!existsSync(logFile)) {
        return { success: false, error: 'Log file not found' };
      }

      const content = await fs.readFile(logFile, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      const entries = lines.map(line => {
        try {
          return JSON.parse(this.decrypt(line));
        } catch {
          return { error: 'Failed to decrypt entry' };
        }
      });

      return { success: true, entries };
    } catch (error) {
      console.error('Error reading shadow logs:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get log statistics
   * @returns {Promise<{ success: boolean, stats?: object }>}
   */
  async getLogStats() {
    try {
      const shadowFiles = existsSync(this.shadowDir) 
        ? await fs.readdir(this.shadowDir) 
        : [];
      const publicFiles = existsSync(this.publicDir) 
        ? await fs.readdir(this.publicDir) 
        : [];

      let shadowSize = 0;
      let publicSize = 0;

      for (const file of shadowFiles) {
        const stat = await fs.stat(path.join(this.shadowDir, file));
        shadowSize += stat.size;
      }

      for (const file of publicFiles) {
        const stat = await fs.stat(path.join(this.publicDir, file));
        publicSize += stat.size;
      }

      return {
        success: true,
        stats: {
          shadowLogCount: shadowFiles.length,
          publicLogCount: publicFiles.length,
          shadowSizeBytes: shadowSize,
          publicSizeBytes: publicSize,
          totalSizeBytes: shadowSize + publicSize,
          encryptionAlgorithm: 'AES-256-GCM',
          retentionDays: this.retentionDays
        }
      };
    } catch (error) {
      console.error('Error getting log stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clean up old logs based on retention policy
   * @returns {Promise<{ success: boolean, deletedCount?: number }>}
   */
  async cleanupOldLogs() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);
      
      let deletedCount = 0;

      const processDirectory = async (dir) => {
        if (!existsSync(dir)) return;
        
        const files = await fs.readdir(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stat = await fs.stat(filePath);
          
          if (stat.mtime < cutoffDate) {
            await fs.unlink(filePath);
            deletedCount++;
          }
        }
      };

      await processDirectory(this.shadowDir);
      await processDirectory(this.publicDir);

      return { success: true, deletedCount };
    } catch (error) {
      console.error('Error cleaning up logs:', error);
      return { success: false, error: error.message };
    }
  }
}

export default ShadowLogger;
