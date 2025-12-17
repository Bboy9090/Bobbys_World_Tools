// Shadow Logger - Encrypted, append-only audit logs
// Provides AES-256 encryption for sensitive operations

import crypto from 'crypto';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Shadow Logger for encrypted audit logging
 */
class ShadowLogger {
  constructor(options = {}) {
    this.logsDir = options.logsDir || path.join(process.cwd(), 'logs');
    this.shadowLogsDir = path.join(this.logsDir, 'shadow');
    this.publicLogsDir = path.join(this.logsDir, 'public');
    this.encryptionKey = options.encryptionKey || this.getEncryptionKey();
    this.retentionDays = options.retentionDays || 90;
    
    this.initializeDirectories();
  }

  /**
   * Get or generate encryption key
   */
  getEncryptionKey() {
    const keyEnv = process.env.SHADOW_LOG_KEY;
    
    if (keyEnv) {
      return Buffer.from(keyEnv, 'hex');
    }

    // Generate a new key (in production, this should be stored securely)
    const key = crypto.randomBytes(32);
    console.warn('Generated new shadow log encryption key. Set SHADOW_LOG_KEY environment variable for persistence.');
    return key;
  }

  /**
   * Initialize log directories
   */
  async initializeDirectories() {
    try {
      await fs.mkdir(this.logsDir, { recursive: true });
      await fs.mkdir(this.shadowLogsDir, { recursive: true });
      await fs.mkdir(this.publicLogsDir, { recursive: true });
    } catch (error) {
      console.error('Error initializing log directories:', error);
    }
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  encrypt(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  decrypt(encrypted, iv, authTag) {
    try {
      const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        this.encryptionKey,
        Buffer.from(iv, 'hex')
      );
      
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  /**
   * Log to shadow logs (encrypted)
   */
  async logShadow(entry) {
    try {
      const timestamp = new Date().toISOString();
      const date = timestamp.split('T')[0];
      
      const logEntry = {
        timestamp,
        ...entry
      };

      // Encrypt the entry
      const { encrypted, iv, authTag } = this.encrypt(logEntry);
      
      const encryptedEntry = {
        encrypted,
        iv,
        authTag,
        timestamp // Keep timestamp unencrypted for indexing
      };

      // Append to daily log file
      const logFile = path.join(this.shadowLogsDir, `shadow-${date}.log`);
      await fs.appendFile(
        logFile,
        JSON.stringify(encryptedEntry) + '\n',
        'utf8'
      );

      return { success: true };
    } catch (error) {
      console.error('Shadow log error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Log to public logs (unencrypted)
   */
  async logPublic(entry) {
    try {
      const timestamp = new Date().toISOString();
      const date = timestamp.split('T')[0];
      
      const logEntry = {
        timestamp,
        ...entry
      };

      // Append to daily log file
      const logFile = path.join(this.publicLogsDir, `public-${date}.log`);
      await fs.appendFile(
        logFile,
        JSON.stringify(logEntry) + '\n',
        'utf8'
      );

      return { success: true };
    } catch (error) {
      console.error('Public log error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Read shadow logs (requires decryption)
   */
  async readShadowLogs(date = null) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const logFile = path.join(this.shadowLogsDir, `shadow-${targetDate}.log`);

      if (!existsSync(logFile)) {
        return {
          success: false,
          error: 'Log file not found',
          entries: []
        };
      }

      const content = await fs.readFile(logFile, 'utf8');
      const lines = content.trim().split('\n').filter(line => line);

      const entries = lines
        .map(line => {
          try {
            const encryptedEntry = JSON.parse(line);
            const decrypted = this.decrypt(
              encryptedEntry.encrypted,
              encryptedEntry.iv,
              encryptedEntry.authTag
            );
            return decrypted;
          } catch (error) {
            console.error('Error decrypting entry:', error);
            return null;
          }
        })
        .filter(entry => entry !== null);

      return {
        success: true,
        date: targetDate,
        entries,
        count: entries.length
      };
    } catch (error) {
      console.error('Error reading shadow logs:', error);
      return {
        success: false,
        error: error.message,
        entries: []
      };
    }
  }

  /**
   * Read public logs
   */
  async readPublicLogs(date = null) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const logFile = path.join(this.publicLogsDir, `public-${targetDate}.log`);

      if (!existsSync(logFile)) {
        return {
          success: false,
          error: 'Log file not found',
          entries: []
        };
      }

      const content = await fs.readFile(logFile, 'utf8');
      const lines = content.trim().split('\n').filter(line => line);

      const entries = lines
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (error) {
            console.error('Error parsing entry:', error);
            return null;
          }
        })
        .filter(entry => entry !== null);

      return {
        success: true,
        date: targetDate,
        entries,
        count: entries.length
      };
    } catch (error) {
      console.error('Error reading public logs:', error);
      return {
        success: false,
        error: error.message,
        entries: []
      };
    }
  }

  /**
   * Clean up old logs (retention policy)
   */
  async cleanupOldLogs() {
    try {
      const now = Date.now();
      const retentionMs = this.retentionDays * 24 * 60 * 60 * 1000;

      // Clean shadow logs
      const shadowFiles = await fs.readdir(this.shadowLogsDir);
      for (const file of shadowFiles) {
        const filePath = path.join(this.shadowLogsDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtimeMs > retentionMs) {
          await fs.unlink(filePath);
          console.log(`Deleted old shadow log: ${file}`);
        }
      }

      // Clean public logs
      const publicFiles = await fs.readdir(this.publicLogsDir);
      for (const file of publicFiles) {
        const filePath = path.join(this.publicLogsDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtimeMs > retentionMs) {
          await fs.unlink(filePath);
          console.log(`Deleted old public log: ${file}`);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error cleaning up logs:', error);
      return { success: false, error: error.message };
    }
  }
}

export default ShadowLogger;
