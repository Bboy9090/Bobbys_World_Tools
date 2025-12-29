/**
 * Device Lock Manager
 * Prevents multiple operations on the same device simultaneously
 */

const deviceLocks = new Map();

export const LOCK_TIMEOUT = 300000; // 5 minutes in milliseconds

/**
 * Acquire a lock for a device
 * @param {string} deviceSerial - Device serial number
 * @param {string} operation - Operation identifier
 * @returns {{acquired: boolean, reason?: string, lockedBy?: string, lockedAt?: number}}
 */
export function acquireDeviceLock(deviceSerial, operation) {
  if (!deviceSerial || typeof deviceSerial !== 'string') {
    return { acquired: false, reason: 'Invalid device serial' };
  }

  const existingLock = deviceLocks.get(deviceSerial);
  
  if (existingLock) {
    // Check if lock expired
    if (Date.now() - existingLock.lockedAt > LOCK_TIMEOUT) {
      deviceLocks.delete(deviceSerial);
    } else {
      return {
        acquired: false,
        reason: `Device locked by operation: ${existingLock.operation}`,
        lockedBy: existingLock.operation,
        lockedAt: existingLock.lockedAt
      };
    }
  }

  deviceLocks.set(deviceSerial, {
    lockedAt: Date.now(),
    operation,
    deviceSerial
  });

  return { acquired: true };
}

/**
 * Release a lock for a device
 * @param {string} deviceSerial - Device serial number
 */
export function releaseDeviceLock(deviceSerial) {
  deviceLocks.delete(deviceSerial);
}

/**
 * Get lock status for a device
 * @param {string} deviceSerial - Device serial number
 * @returns {{locked: boolean, operation?: string, lockedAt?: number}}
 */
export function getDeviceLockStatus(deviceSerial) {
  const lock = deviceLocks.get(deviceSerial);
  
  if (!lock) {
    return { locked: false };
  }

  // Check if expired
  if (Date.now() - lock.lockedAt > LOCK_TIMEOUT) {
    deviceLocks.delete(deviceSerial);
    return { locked: false };
  }

  return {
    locked: true,
    operation: lock.operation,
    lockedAt: lock.lockedAt
  };
}

/**
 * Clear all locks (for cleanup/testing)
 */
export function clearAllLocks() {
  deviceLocks.clear();
}

/**
 * Get all active locks
 * @returns {Array<{deviceSerial: string, operation: string, lockedAt: number, ageMs: number}>}
 */
export function getAllActiveLocks() {
  const now = Date.now();
  const activeLocks = [];
  
  // Clean up expired locks and collect active ones
  for (const [serial, lock] of deviceLocks.entries()) {
    if (now - lock.lockedAt > LOCK_TIMEOUT) {
      deviceLocks.delete(serial);
    } else {
      activeLocks.push({
        deviceSerial: serial,
        operation: lock.operation,
        lockedAt: lock.lockedAt,
        ageMs: now - lock.lockedAt,
        expiresAt: lock.lockedAt + LOCK_TIMEOUT,
        expiresInMs: (lock.lockedAt + LOCK_TIMEOUT) - now
      });
    }
  }
  
  return activeLocks;
}

/**
 * Get lock count
 * @returns {number}
 */
export function getActiveLockCount() {
  return getAllActiveLocks().length;
}

