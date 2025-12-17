// Firmware API - Handles firmware discovery, version checking, and downloads
// Part of Bobby's World toolkit

import type { 
  FirmwareInfo, 
  FirmwareDatabase, 
  FirmwareCheckResult, 
  BrandFirmwareList,
  FirmwareVersion 
} from '../types/firmware';

const API_BASE = 'http://localhost:3001/api/firmware';

// Mock firmware database for development
const mockFirmwareDb: FirmwareDatabase[] = [
  {
    brand: 'Samsung',
    model: 'Galaxy S24',
    versions: [
      { version: 'S928BXXS3AXE1', buildNumber: 'AXE1', buildDate: '2024-05-01', securityPatch: '2024-05-01' },
      { version: 'S928BXXS3AXD1', buildNumber: 'AXD1', buildDate: '2024-04-01', securityPatch: '2024-04-01' },
    ],
    latestVersion: 'S928BXXS3AXE1',
    latestBuildDate: '2024-05-01',
    officialDownloadUrl: 'https://www.sammobile.com/firmwares/',
  },
  {
    brand: 'Google',
    model: 'Pixel 8',
    versions: [
      { version: 'AP2A.240605.024', buildNumber: '11867885', buildDate: '2024-06-05', securityPatch: '2024-06-05' },
      { version: 'AP1A.240505.005', buildNumber: '11762143', buildDate: '2024-05-05', securityPatch: '2024-05-05' },
    ],
    latestVersion: 'AP2A.240605.024',
    latestBuildDate: '2024-06-05',
    officialDownloadUrl: 'https://developers.google.com/android/images',
  },
  {
    brand: 'OnePlus',
    model: 'OnePlus 12',
    versions: [
      { version: 'CPH2573_14.0.0.700', buildNumber: '700', buildDate: '2024-05-15', securityPatch: '2024-05-01' },
    ],
    latestVersion: 'CPH2573_14.0.0.700',
    latestBuildDate: '2024-05-15',
    officialDownloadUrl: 'https://www.oneplus.com/support/softwareupgrade',
  },
];

export async function getAllBrandsWithFirmware(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE}/brands`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fallback to mock
  }
  
  return [...new Set(mockFirmwareDb.map(f => f.brand))];
}

export async function getBrandFirmwareList(brand: string): Promise<BrandFirmwareList> {
  try {
    const response = await fetch(`${API_BASE}/brands/${encodeURIComponent(brand)}`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fallback to mock
  }
  
  const brandFirmware = mockFirmwareDb.filter(f => f.brand.toLowerCase() === brand.toLowerCase());
  
  return {
    brand,
    models: brandFirmware.map(f => ({
      model: f.model,
      versions: f.versions,
      latestVersion: f.latestVersion,
      downloadUrls: f.officialDownloadUrl ? [f.officialDownloadUrl] : []
    }))
  };
}

export async function searchFirmware(query: string): Promise<FirmwareDatabase[]> {
  try {
    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fallback to mock
  }
  
  const lowerQuery = query.toLowerCase();
  return mockFirmwareDb.filter(f => 
    f.brand.toLowerCase().includes(lowerQuery) ||
    f.model.toLowerCase().includes(lowerQuery) ||
    f.latestVersion.toLowerCase().includes(lowerQuery)
  );
}

export async function checkDeviceFirmware(deviceSerial: string): Promise<FirmwareCheckResult> {
  try {
    const response = await fetch(`${API_BASE}/check/${encodeURIComponent(deviceSerial)}`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fallback
  }
  
  // Return mock result
  return {
    deviceSerial,
    success: true,
    firmware: {
      deviceSerial,
      deviceModel: 'Unknown Device',
      current: {
        version: 'Unknown',
      },
      updateAvailable: false,
      securityStatus: 'unknown',
      lastChecked: Date.now()
    },
    timestamp: Date.now()
  };
}

export async function checkMultipleDevicesFirmware(
  deviceSerials: string[]
): Promise<FirmwareCheckResult[]> {
  const results: FirmwareCheckResult[] = [];
  
  for (const serial of deviceSerials) {
    const result = await checkDeviceFirmware(serial);
    results.push(result);
  }
  
  return results;
}

export async function getFirmwareInfo(brand: string, model: string): Promise<FirmwareDatabase | null> {
  try {
    const response = await fetch(
      `${API_BASE}/info/${encodeURIComponent(brand)}/${encodeURIComponent(model)}`
    );
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fallback
  }
  
  return mockFirmwareDb.find(
    f => f.brand.toLowerCase() === brand.toLowerCase() && 
         f.model.toLowerCase() === model.toLowerCase()
  ) || null;
}

export async function downloadFirmware(
  brand: string, 
  model: string, 
  version: string,
  onProgress?: (progress: number) => void
): Promise<Blob | null> {
  // Simulate download progress
  for (let i = 0; i <= 100; i += 10) {
    onProgress?.(i);
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // In production, this would actually download the firmware
  return new Blob(['mock firmware data'], { type: 'application/octet-stream' });
}
