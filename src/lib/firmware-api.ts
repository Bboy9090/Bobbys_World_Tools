// Firmware API - Handles firmware discovery, version checking, and downloads
// Part of Bobby's World toolkit

import type { 
  FirmwareInfo, 
  FirmwareDatabase, 
  FirmwareCheckResult, 
  BrandFirmwareList,
  FirmwareVersion 
} from '../types/firmware';

import { getAPIUrl } from './apiConfig';

<<<<<<< Updated upstream
const API_BASE = getAPIUrl('/api/firmware');

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    const detail = body ? ` - ${body.slice(0, 300)}` : '';
    throw new Error(`Request failed (${response.status}) ${response.statusText}${detail}`);
  }
  return (await response.json()) as T;
}

export async function getAllBrandsWithFirmware(): Promise<string[]> {
  return await fetchJson<string[]>(`${API_BASE}/brands`);
}

export async function getBrandFirmwareList(brand: string): Promise<BrandFirmwareList> {
  return await fetchJson<BrandFirmwareList>(`${API_BASE}/brands/${encodeURIComponent(brand)}`);
}

export async function searchFirmware(query: string): Promise<FirmwareDatabase[]> {
  return await fetchJson<FirmwareDatabase[]>(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
=======
export async function getAllBrandsWithFirmware(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE}/brands`);
    if (!response.ok) {
      throw new Error('Firmware service unavailable');
    }
    return await response.json();
  } catch (err) {
    throw new Error('Firmware service unavailable');
  }
}

export async function getBrandFirmwareList(brand: string): Promise<BrandFirmwareList> {
  try {
    const response = await fetch(`${API_BASE}/brands/${encodeURIComponent(brand)}`);
    if (!response.ok) {
      throw new Error('Firmware service unavailable');
    }
    return await response.json();
  } catch (err) {
    throw new Error('Firmware service unavailable');
  }
}

export async function searchFirmware(query: string): Promise<FirmwareDatabase[]> {
  try {
    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Firmware service unavailable');
    }
    return await response.json();
  } catch (err) {
    throw new Error('Firmware service unavailable');
  }
>>>>>>> Stashed changes
}

export async function checkDeviceFirmware(deviceSerial: string): Promise<FirmwareCheckResult> {
  try {
<<<<<<< Updated upstream
    return await fetchJson<FirmwareCheckResult>(`${API_BASE}/check/${encodeURIComponent(deviceSerial)}`);
  } catch (error) {
    return {
      deviceSerial,
      success: false,
      error: error instanceof Error ? error.message : 'Firmware check failed',
      timestamp: Date.now(),
    };
=======
    const response = await fetch(`${API_BASE}/check/${encodeURIComponent(deviceSerial)}`);
    if (!response.ok) {
      throw new Error('Firmware check service unavailable');
    }
    return await response.json();
  } catch (err) {
    throw new Error('Firmware check service unavailable');
>>>>>>> Stashed changes
  }
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
    return await fetchJson<FirmwareDatabase>(
      `${API_BASE}/info/${encodeURIComponent(brand)}/${encodeURIComponent(model)}`
    );
<<<<<<< Updated upstream
  } catch (error) {
    if (error instanceof Error && /\(404\)/.test(error.message)) {
      return null;
    }
    throw error;
=======
    if (!response.ok) {
      throw new Error('Firmware info service unavailable');
    }
    return await response.json();
  } catch (err) {
    throw new Error('Firmware info service unavailable');
>>>>>>> Stashed changes
  }
}

export async function downloadFirmware(
  brand: string, 
  model: string, 
  version: string,
  onProgress?: (progress: number) => void
): Promise<Blob | null> {
<<<<<<< Updated upstream
  onProgress?.(0);
  const url = `${API_BASE}/download?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}&version=${encodeURIComponent(version)}`;

  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    const detail = body ? ` - ${body.slice(0, 300)}` : '';
    throw new Error(`Firmware download failed (${response.status}) ${response.statusText}${detail}`);
  }

  const totalBytesHeader = response.headers.get('content-length');
  const totalBytes = totalBytesHeader ? Number(totalBytesHeader) : undefined;
  const bodyStream = response.body;

  if (!bodyStream || !totalBytes || Number.isNaN(totalBytes)) {
    const blob = await response.blob();
    onProgress?.(100);
    return blob;
  }

  const reader = bodyStream.getReader();
  const chunks: Uint8Array[] = [];
  let bytesRead = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      bytesRead += value.byteLength;
      onProgress?.(Math.min(100, (bytesRead / totalBytes) * 100));
    }
  }

  onProgress?.(100);
  return new Blob(chunks, { type: 'application/octet-stream' });
=======
  throw new Error('Firmware downloads are disabled. Configure the firmware service to enable downloads.');
>>>>>>> Stashed changes
}
