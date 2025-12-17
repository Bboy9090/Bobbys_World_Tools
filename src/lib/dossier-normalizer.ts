/**
 * Dossier Normalizer - Device information normalization
 * Normalizes and standardizes device data from various sources
 */

export interface RawDeviceData {
  [key: string]: any;
}

export interface NormalizedDossier {
  deviceSerial: string;
  platform: 'android' | 'ios' | 'unknown';
  brand: string;
  model: string;
  codename?: string;
  marketingName?: string;
  osVersion?: string;
  buildNumber?: string;
  securityPatch?: string;
  bootloaderVersion?: string;
  basebandVersion?: string;
  kernelVersion?: string;
  hardwareSpecs?: {
    cpu?: string;
    ram?: string;
    storage?: string;
    display?: string;
    battery?: string;
  };
  connectivity?: {
    wifi?: boolean;
    bluetooth?: boolean;
    nfc?: boolean;
    cellular?: string[];
  };
  security?: {
    bootloaderLocked?: boolean;
    encryptionEnabled?: boolean;
    frpEnabled?: boolean;
    knoxTripped?: boolean;
  };
  normalized: boolean;
  normalizedAt: number;
  source: string;
}

/**
 * Normalize raw device data into a standard format
 */
export function normalizeDossier(
  rawData: RawDeviceData,
  source: string = 'unknown'
): NormalizedDossier {
  const serial = rawData.serial || rawData.serialNumber || rawData.device_uid || 'unknown';
  
  return {
    deviceSerial: serial,
    platform: detectPlatform(rawData),
    brand: extractBrand(rawData),
    model: extractModel(rawData),
    codename: rawData.codename || rawData.device || undefined,
    marketingName: rawData.marketingName || rawData.displayName || undefined,
    osVersion: rawData.version?.release || rawData.osVersion || undefined,
    buildNumber: rawData.version?.sdk || rawData.buildNumber || undefined,
    securityPatch: rawData.securityPatch || undefined,
    bootloaderVersion: rawData.bootloaderVersion || undefined,
    basebandVersion: rawData.basebandVersion || undefined,
    kernelVersion: rawData.kernelVersion || undefined,
    hardwareSpecs: extractHardwareSpecs(rawData),
    connectivity: extractConnectivity(rawData),
    security: extractSecurityInfo(rawData),
    normalized: true,
    normalizedAt: Date.now(),
    source,
  };
}

function detectPlatform(data: RawDeviceData): 'android' | 'ios' | 'unknown' {
  if (data.platform) return data.platform;
  if (data.os?.toLowerCase().includes('android')) return 'android';
  if (data.os?.toLowerCase().includes('ios')) return 'ios';
  if (data.ro?.build?.version) return 'android';
  if (data.ProductType) return 'ios';
  return 'unknown';
}

function extractBrand(data: RawDeviceData): string {
  return data.brand || 
         data.manufacturer || 
         data['ro.product.brand'] || 
         data.DeviceClass || 
         'Unknown';
}

function extractModel(data: RawDeviceData): string {
  return data.model || 
         data['ro.product.model'] || 
         data.ProductType || 
         data.device || 
         'Unknown';
}

function extractHardwareSpecs(data: RawDeviceData): NormalizedDossier['hardwareSpecs'] {
  return {
    cpu: data.cpu || data.hardware || undefined,
    ram: data.ram || data.totalMemory || undefined,
    storage: data.storage || data.totalStorage || undefined,
    display: data.display || data.screenResolution || undefined,
    battery: data.battery || data.batteryCapacity || undefined,
  };
}

function extractConnectivity(data: RawDeviceData): NormalizedDossier['connectivity'] {
  return {
    wifi: data.wifi !== false,
    bluetooth: data.bluetooth !== false,
    nfc: data.nfc ?? undefined,
    cellular: data.cellular || data.networks || undefined,
  };
}

function extractSecurityInfo(data: RawDeviceData): NormalizedDossier['security'] {
  return {
    bootloaderLocked: data.bootloaderLocked ?? data.bootloader !== 'unlocked',
    encryptionEnabled: data.encrypted ?? data.encryptionEnabled ?? undefined,
    frpEnabled: data.frpEnabled ?? data.frp ?? undefined,
    knoxTripped: data.knoxTripped ?? data.knox ?? undefined,
  };
}

/**
 * Merge multiple dossiers
 */
export function mergeDossiers(dossiers: NormalizedDossier[]): NormalizedDossier {
  if (dossiers.length === 0) {
    throw new Error('Cannot merge empty dossier list');
  }
  
  if (dossiers.length === 1) {
    return dossiers[0];
  }
  
  // Use the most recent as base
  const sorted = [...dossiers].sort((a, b) => b.normalizedAt - a.normalizedAt);
  const base = { ...sorted[0] };
  
  // Merge in data from older entries where base is missing
  for (const dossier of sorted.slice(1)) {
    Object.keys(dossier).forEach(key => {
      const typedKey = key as keyof NormalizedDossier;
      if (base[typedKey] === undefined && dossier[typedKey] !== undefined) {
        (base as any)[typedKey] = dossier[typedKey];
      }
    });
  }
  
  return base;
}

export default {
  normalizeDossier,
  mergeDossiers,
};
