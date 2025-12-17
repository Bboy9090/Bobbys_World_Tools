/**
 * Dossier Normalizer - Normalize device scan data
 */

import type { DeviceRecord } from '@/types/correlation';

export interface NormalizedScanResult {
  devices: DeviceRecord[];
  summary?: {
    total: number;
    platforms: Record<string, number>;
    modes: Record<string, number>;
  };
}

/**
 * Normalize a scan of devices
 */
export function normalizeScan(devices: any[]): NormalizedScanResult {
  // Mock implementation - just passes through devices
  const normalized: DeviceRecord[] = devices.map((device, index) => ({
    id: device.id || device.serial || `device-${index}`,
    serial: device.serial || device.device_uid,
    vendorId: device.vendorId || device.vendor_id,
    productId: device.productId || device.product_id,
    platform: device.platform || device.platform_hint,
    mode: device.mode || device.device_mode,
    confidence: device.confidence || 0.8,
    matched_tool_ids: device.matched_tool_ids || [],
    ...device,
  }));

  const summary = {
    total: normalized.length,
    platforms: normalized.reduce((acc, d) => {
      if (d.platform) {
        acc[d.platform] = (acc[d.platform] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
    modes: normalized.reduce((acc, d) => {
      if (d.mode) {
        acc[d.mode] = (acc[d.mode] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
  };

  return {
    devices: normalized,
    summary,
  };
}

/**
 * Normalize a BootForgeUSB record
 */
export function normalizeBootForgeUSBRecord(record: any): DeviceRecord {
  // Mock implementation
  return {
    id: record.id || record.serial || 'unknown',
    serial: record.serial,
    vendorId: record.vendor_id,
    productId: record.product_id,
    platform: record.platform,
    mode: record.mode,
    confidence: record.confidence || 0.8,
    ...record,
  };
}
