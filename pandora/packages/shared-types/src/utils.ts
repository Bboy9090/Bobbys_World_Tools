/**
 * Shared utility functions
 */

/**
 * Format timestamp to ISO string
 */
export function formatTimestamp(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Validate device ID format
 */
export function isValidDeviceId(id: string): boolean {
  return /^[a-zA-Z0-9-_]{8,64}$/.test(id);
}

/**
 * Sanitize device serial number for logging
 */
export function sanitizeSerialNumber(serial: string): string {
  if (serial.length <= 8) return serial;
  return `${serial.slice(0, 4)}****${serial.slice(-4)}`;
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.max(0, Math.round((current / total) * 100)));
}

/**
 * Generate a unique ID
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}
