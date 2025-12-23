// BootForge API - Client wrapper used by the universal flash UI.
// Truth-first: no mock devices, no fabricated flash jobs.

import { API_CONFIG, getAPIUrl, getWSUrl } from '@/lib/apiConfig';
import type {
  BootForgeDevice,
  FlashJobConfig,
  FlashOperation,
  FlashProgress,
  FlashMethod,
  DeviceBrand,
} from '@/types/flash-operations';
import { DEVICE_BRAND_CAPABILITIES } from '@/types/flash-operations';

type JsonValue = unknown;

async function readErrorBody(response: Response): Promise<string> {
  try {
    const text = await response.text();
    return text || `${response.status} ${response.statusText}`;
  } catch {
    return `${response.status} ${response.statusText}`;
  }
}

function toFlashMethod(value: unknown): FlashMethod | null {
  switch (value) {
    case 'fastboot':
    case 'odin':
    case 'edl':
    case 'dfu':
    case 'recovery':
    case 'adb-sideload':
    case 'heimdall':
      return value;
    default:
      return null;
  }
}

function mapBackendDeviceToBootForgeDevice(raw: any): BootForgeDevice {
  const serial = typeof raw?.serial === 'string' ? raw.serial : 'unknown';
  const capabilitiesList: FlashMethod[] = Array.isArray(raw?.capabilities)
    ? raw.capabilities
        .map((c: unknown) => toFlashMethod(c))
        .filter((m: FlashMethod | null): m is FlashMethod => Boolean(m))
    : [];

  const brand: DeviceBrand = 'unknown';
  const baseCaps = DEVICE_BRAND_CAPABILITIES[brand];
  const supportedMethods = capabilitiesList.length > 0 ? capabilitiesList : baseCaps.supportedMethods;

  const currentMode: BootForgeDevice['currentMode'] =
    raw?.isDFU ? 'dfu' : raw?.isEDL ? 'edl' : raw?.isBootloader ? 'fastboot' : raw?.isRecovery ? 'recovery' : 'normal';

  const model = typeof raw?.model === 'string' ? raw.model : undefined;
  const manufacturer = typeof raw?.brand === 'string' ? raw.brand : undefined;

  return {
    serial,
    usbPath: 'unknown',
    vendorId: 'unknown',
    productId: 'unknown',
    manufacturer,
    model,
    brand,
    platform: 'android',
    currentMode,
    capabilities: {
      ...baseCaps,
      supportedMethods,
    },
    confidence: 0.9,
    lastSeen: Date.now(),
  };
}

export interface BootForgeAPI {
  scanDevices(): Promise<BootForgeDevice[]>;
  getFlashHistory(limit?: number): Promise<FlashOperation[]>;
  getActiveFlashOperations(): Promise<FlashOperation[]>;
  startFlashOperation(config: FlashJobConfig): Promise<FlashOperation>;
  pauseFlashOperation(jobId: string): Promise<{ success: boolean; message?: string }>;
  resumeFlashOperation(jobId: string): Promise<{ success: boolean; message?: string }>;
  cancelFlashOperation(jobId: string): Promise<{ success: boolean; message?: string }>;
  createFlashWebSocket(jobId: string): WebSocket;
  createDeviceMonitorWebSocket(): WebSocket;
}

export const bootForgeAPI: BootForgeAPI = {
  async scanDevices(): Promise<BootForgeDevice[]> {
    const response = await fetch(getAPIUrl(API_CONFIG.ENDPOINTS.FLASH_DEVICES));
    if (!response.ok) {
      throw new Error(`Device scan failed: ${await readErrorBody(response)}`);
    }

    const data: any = await response.json();
    const devices = Array.isArray(data?.devices) ? data.devices : [];
    return devices.map(mapBackendDeviceToBootForgeDevice);
  },

  async getFlashHistory(limit: number = 50): Promise<FlashOperation[]> {
    const url = getAPIUrl(`${API_CONFIG.ENDPOINTS.FLASH_HISTORY}?limit=${encodeURIComponent(String(limit))}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Flash history unavailable: ${await readErrorBody(response)}`);
    }

    const data: any = await response.json();
    if (Array.isArray(data?.history)) return data.history;
    if (Array.isArray(data)) return data;
    return [];
  },

  async getActiveFlashOperations(): Promise<FlashOperation[]> {
    const response = await fetch(getAPIUrl(API_CONFIG.ENDPOINTS.FLASH_ACTIVE_OPERATIONS));
    if (!response.ok) {
      throw new Error(`Active operations unavailable: ${await readErrorBody(response)}`);
    }

    const data: any = await response.json();
    if (Array.isArray(data?.operations)) return data.operations;
    if (Array.isArray(data)) return data;
    return [];
  },

  async startFlashOperation(config: FlashJobConfig): Promise<FlashOperation> {
    const response = await fetch(getAPIUrl(API_CONFIG.ENDPOINTS.FLASH_START), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error(`Flash start failed: ${await readErrorBody(response)}`);
    }

    const payload: any = await response.json();
    const jobId = typeof payload?.jobId === 'string' ? payload.jobId : null;
    if (!jobId) {
      throw new Error('Flash start failed: missing jobId in response');
    }

    const totalBytes = config.partitions.reduce((sum, p) => sum + (p.size || 0), 0);

    const progress: FlashProgress = {
      jobId,
      deviceSerial: config.deviceSerial,
      deviceBrand: config.deviceBrand,
      status: 'preparing',
      overallProgress: 0,
      partitionProgress: 0,
      bytesTransferred: 0,
      totalBytes,
      transferSpeed: 0,
      estimatedTimeRemaining: 0,
      currentStage: 'Queued',
      startedAt: Date.now(),
      warnings: [],
    };

    return {
      id: jobId,
      jobConfig: config,
      progress,
      logs: [],
      canPause: true,
      canResume: false,
      canCancel: true,
    };
  },

  async pauseFlashOperation(jobId: string): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(getAPIUrl(`${API_CONFIG.ENDPOINTS.FLASH_PAUSE}/${encodeURIComponent(jobId)}`), {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Pause failed: ${await readErrorBody(response)}`);
    }
    const data: any = await response.json().catch(() => ({}));
    return { success: true, message: data?.message };
  },

  async resumeFlashOperation(jobId: string): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(getAPIUrl(`${API_CONFIG.ENDPOINTS.FLASH_RESUME}/${encodeURIComponent(jobId)}`), {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Resume failed: ${await readErrorBody(response)}`);
    }
    const data: any = await response.json().catch(() => ({}));
    return { success: true, message: data?.message };
  },

  async cancelFlashOperation(jobId: string): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(getAPIUrl(`${API_CONFIG.ENDPOINTS.FLASH_CANCEL}/${encodeURIComponent(jobId)}`), {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Cancel failed: ${await readErrorBody(response)}`);
    }
    const data: any = await response.json().catch(() => ({}));
    return { success: true, message: data?.message };
  },

  createFlashWebSocket(jobId: string): WebSocket {
    return new WebSocket(getWSUrl(`/ws/flash-progress/${encodeURIComponent(jobId)}`));
  },

  createDeviceMonitorWebSocket(): WebSocket {
    return new WebSocket(getWSUrl('/ws/device-events'));
  },
};
