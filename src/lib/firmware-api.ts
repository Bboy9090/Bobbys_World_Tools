/**
 * Firmware API - Device firmware checking and management
 * Provides firmware version detection, update checking, and download functionality
 */

import type { 
  FirmwareInfo, 
  FirmwareCheckResult, 
  FirmwareDatabase, 
  BrandFirmwareList 
} from '@/types/firmware';

// Mock firmware database
const MOCK_FIRMWARE_DATABASE: FirmwareDatabase[] = [
  {
    brand: 'Samsung',
    model: 'Galaxy S24',
    versions: [
      { version: 'S924BXXU2AXJB', buildNumber: 'AXJB', buildDate: '2024-10-01', securityPatch: '2024-10-01' },
      { version: 'S924BXXU1AXHA', buildNumber: 'AXHA', buildDate: '2024-08-01', securityPatch: '2024-08-01' },
    ],
    latestVersion: 'S924BXXU2AXJB',
    latestBuildDate: '2024-10-01',
    officialDownloadUrl: 'https://samsung.com/firmware',
    notes: 'Android 14 with One UI 6.1',
  },
  {
    brand: 'Samsung',
    model: 'Galaxy S23',
    versions: [
      { version: 'S911BXXU3BXJC', buildNumber: 'BXJC', buildDate: '2024-10-15', securityPatch: '2024-10-01' },
      { version: 'S911BXXU2BXHB', buildNumber: 'BXHB', buildDate: '2024-08-15', securityPatch: '2024-08-01' },
    ],
    latestVersion: 'S911BXXU3BXJC',
    latestBuildDate: '2024-10-15',
    officialDownloadUrl: 'https://samsung.com/firmware',
    notes: 'Android 14 with One UI 6.1',
  },
  {
    brand: 'Google',
    model: 'Pixel 8',
    versions: [
      { version: 'AP3A.241005.015', buildNumber: '12411833', buildDate: '2024-10-05', securityPatch: '2024-10-05' },
      { version: 'AP2A.240805.005', buildNumber: '12173711', buildDate: '2024-08-05', securityPatch: '2024-08-05' },
    ],
    latestVersion: 'AP3A.241005.015',
    latestBuildDate: '2024-10-05',
    officialDownloadUrl: 'https://developers.google.com/android/ota',
    notes: 'Android 15 October Security Update',
  },
  {
    brand: 'OnePlus',
    model: 'OnePlus 12',
    versions: [
      { version: 'CPH2573_14.0.0.800', buildNumber: '800', buildDate: '2024-10-01', securityPatch: '2024-10-01' },
      { version: 'CPH2573_14.0.0.600', buildNumber: '600', buildDate: '2024-08-01', securityPatch: '2024-08-01' },
    ],
    latestVersion: 'CPH2573_14.0.0.800',
    latestBuildDate: '2024-10-01',
    officialDownloadUrl: 'https://oneplus.com/support/firmware',
    notes: 'OxygenOS 14 with ColorOS 14 base',
  },
];

/**
 * Get all brands with available firmware
 */
export async function getAllBrandsWithFirmware(): Promise<string[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const brands = [...new Set(MOCK_FIRMWARE_DATABASE.map(fw => fw.brand))];
  return brands.sort();
}

/**
 * Get firmware list for a specific brand
 */
export async function getBrandFirmwareList(brand: string): Promise<BrandFirmwareList> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const brandFirmware = MOCK_FIRMWARE_DATABASE.filter(fw => fw.brand === brand);
  
  return {
    brand,
    models: brandFirmware.map(fw => ({
      model: fw.model,
      versions: fw.versions,
      latestVersion: fw.latestVersion,
      downloadUrls: fw.officialDownloadUrl ? [fw.officialDownloadUrl] : [],
    })),
  };
}

/**
 * Search firmware database
 */
export async function searchFirmware(query: string): Promise<FirmwareDatabase[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const lowerQuery = query.toLowerCase();
  return MOCK_FIRMWARE_DATABASE.filter(fw => 
    fw.brand.toLowerCase().includes(lowerQuery) ||
    fw.model.toLowerCase().includes(lowerQuery) ||
    fw.latestVersion.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Check firmware for a single device
 */
export async function checkDeviceFirmware(serial: string): Promise<FirmwareCheckResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    // Mock device detection
    const mockFirmware: FirmwareInfo = {
      deviceSerial: serial,
      deviceModel: 'Galaxy S24',
      deviceBrand: 'Samsung',
      current: {
        version: 'S924BXXU1AXHA',
        buildNumber: 'AXHA',
        buildDate: '2024-08-01',
        securityPatch: '2024-08-01',
      },
      latest: {
        version: 'S924BXXU2AXJB',
        buildNumber: 'AXJB',
        buildDate: '2024-10-01',
        securityPatch: '2024-10-01',
      },
      updateAvailable: true,
      securityStatus: 'outdated',
      releaseNotes: 'October 2024 security update with performance improvements',
      lastChecked: Date.now(),
    };
    
    return {
      deviceSerial: serial,
      success: true,
      firmware: mockFirmware,
      timestamp: Date.now(),
    };
  } catch (error) {
    return {
      deviceSerial: serial,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
    };
  }
}

/**
 * Check firmware for multiple devices
 */
export async function checkMultipleDevicesFirmware(
  serials: string[]
): Promise<FirmwareCheckResult[]> {
  const results = await Promise.all(
    serials.map(serial => checkDeviceFirmware(serial))
  );
  return results;
}
