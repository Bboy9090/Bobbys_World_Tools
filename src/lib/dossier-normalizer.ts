/**
 * Dossier Normalizer
 * 
 * Normalizes device detection data into standardized dossier format.
 * TODO: Implement real normalization logic
 */

export interface DeviceRecord {
  id: string;
  serial?: string;
  vendorId?: number;
  productId?: number;
  platform?: string;
  mode?: string;
  confidence?: number;
  matched_tool_ids?: string[];
}

export interface NormalizedDevice {
  id: string;
  platform: string;
  device_mode: string;
  confidence: number;
  correlation_badge: string;
  matched_ids: string[];
  correlation_notes: string[];
  detection_evidence: {
    usb_evidence: string[];
    tool_evidence: string[];
  };
}

export interface ScanSummary {
  total: number;
  correlated: number;
  system_confirmed: number;
  uncorrelated: number;
}

/**
 * Normalize scan results into standardized format
 * Currently returns minimal normalized data
 */
export function normalizeScan(devices: DeviceRecord[]): { 
  devices: NormalizedDevice[]; 
  summary: ScanSummary 
} {
  const normalized: NormalizedDevice[] = devices.map(dev => ({
    id: dev.id,
    platform: dev.platform || 'unknown',
    device_mode: dev.mode || 'unconfirmed',
    confidence: dev.confidence || 0,
    correlation_badge: dev.confidence && dev.confidence > 0.9 ? 'HIGH_CONFIDENCE' : 'LOW_CONFIDENCE',
    matched_ids: dev.matched_tool_ids || [],
    correlation_notes: [],
    detection_evidence: {
      usb_evidence: dev.serial ? [`Serial: ${dev.serial}`] : [],
      tool_evidence: [],
    },
  }));

  const correlated = normalized.filter(d => d.matched_ids.length > 0).length;
  const system_confirmed = normalized.filter(d => d.device_mode.includes('confirmed')).length;

  return {
    devices: normalized,
    summary: {
      total: devices.length,
      correlated,
      system_confirmed,
      uncorrelated: devices.length - correlated,
    },
  };
}

/**
 * Normalize BootForge USB record
 * Stub implementation - returns empty normalized device
 */
export function normalizeBootForgeUSBRecord(record: unknown): NormalizedDevice {
  console.log('[Normalizer] Processing BootForge USB record', record);
  
  return {
    id: 'unknown',
    platform: 'unknown',
    device_mode: 'unconfirmed',
    confidence: 0,
    correlation_badge: 'UNKNOWN',
    matched_ids: [],
    correlation_notes: ['BootForge normalization not yet implemented'],
    detection_evidence: {
      usb_evidence: [],
      tool_evidence: [],
    },
  };
}
