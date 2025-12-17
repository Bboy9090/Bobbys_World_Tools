// BootForge API - Client for the BootForge USB Flash service
// Handles device scanning, flash operations, and real-time updates

import type {
  BootForgeDevice,
  FlashJobConfig,
  FlashOperation,
  FlashProgress,
  FlashStatus,
  DeviceBrand,
  DEVICE_BRAND_CAPABILITIES
} from '@/types/flash-operations';

const API_BASE = 'http://localhost:3001/api/bootforge';

// Mock data for development
const mockDevices: BootForgeDevice[] = [];
const mockOperations: Map<string, FlashOperation> = new Map();
const mockHistory: FlashOperation[] = [];

function generateJobId(): string {
  return `flash-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export interface BootForgeAPI {
  scanDevices(): Promise<BootForgeDevice[]>;
  getDeviceInfo(serial: string): Promise<BootForgeDevice | null>;
  startFlashJob(config: FlashJobConfig): Promise<string>;
  pauseFlashJob(jobId: string): Promise<boolean>;
  resumeFlashJob(jobId: string): Promise<boolean>;
  cancelFlashJob(jobId: string): Promise<boolean>;
  getFlashProgress(jobId: string): Promise<FlashProgress | null>;
  getActiveFlashOperations(): Promise<FlashOperation[]>;
  getFlashHistory(limit?: number): Promise<FlashOperation[]>;
  verifyFlashResult(jobId: string): Promise<{ success: boolean; errors: string[] }>;
  getWebSocketUrl(jobId?: string): string;
  checkServerHealth(): Promise<{ healthy: boolean; version: string }>;
}

export const bootForgeAPI: BootForgeAPI = {
  async scanDevices(): Promise<BootForgeDevice[]> {
    try {
      const response = await fetch(`${API_BASE}/devices/scan`);
      if (response.ok) {
        const data = await response.json();
        return data.devices || [];
      }
    } catch {
      // Fallback to mock data
    }
    
    // Return mock/empty for development
    return mockDevices;
  },

  async getDeviceInfo(serial: string): Promise<BootForgeDevice | null> {
    try {
      const response = await fetch(`${API_BASE}/devices/${serial}`);
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }
    
    return mockDevices.find(d => d.serial === serial) || null;
  },

  async startFlashJob(config: FlashJobConfig): Promise<string> {
    const jobId = generateJobId();
    
    try {
      const response = await fetch(`${API_BASE}/flash/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.jobId;
      }
    } catch {
      // Create mock operation
    }
    
    const mockProgress: FlashProgress = {
      jobId,
      deviceSerial: config.deviceSerial,
      deviceBrand: config.deviceBrand,
      status: 'preparing',
      overallProgress: 0,
      partitionProgress: 0,
      bytesTransferred: 0,
      totalBytes: config.partitions.reduce((sum, p) => sum + p.size, 0),
      transferSpeed: 0,
      estimatedTimeRemaining: 0,
      currentStage: 'Initializing...',
      startedAt: Date.now(),
      warnings: []
    };
    
    const mockOp: FlashOperation = {
      id: jobId,
      jobConfig: config,
      progress: mockProgress,
      logs: ['Flash job created'],
      canPause: true,
      canResume: false,
      canCancel: true
    };
    
    mockOperations.set(jobId, mockOp);
    return jobId;
  },

  async pauseFlashJob(jobId: string): Promise<boolean> {
    const op = mockOperations.get(jobId);
    if (op && op.canPause) {
      op.progress.status = 'paused';
      op.progress.pausedAt = Date.now();
      op.canPause = false;
      op.canResume = true;
      return true;
    }
    return false;
  },

  async resumeFlashJob(jobId: string): Promise<boolean> {
    const op = mockOperations.get(jobId);
    if (op && op.canResume) {
      op.progress.status = 'flashing';
      op.progress.pausedAt = undefined;
      op.canPause = true;
      op.canResume = false;
      return true;
    }
    return false;
  },

  async cancelFlashJob(jobId: string): Promise<boolean> {
    const op = mockOperations.get(jobId);
    if (op && op.canCancel) {
      op.progress.status = 'cancelled';
      op.progress.completedAt = Date.now();
      op.canPause = false;
      op.canResume = false;
      op.canCancel = false;
      mockHistory.unshift(op);
      mockOperations.delete(jobId);
      return true;
    }
    return false;
  },

  async getFlashProgress(jobId: string): Promise<FlashProgress | null> {
    const op = mockOperations.get(jobId);
    return op?.progress || null;
  },

  async getActiveFlashOperations(): Promise<FlashOperation[]> {
    try {
      const response = await fetch(`${API_BASE}/flash/active`);
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }
    
    return Array.from(mockOperations.values());
  },

  async getFlashHistory(limit: number = 50): Promise<FlashOperation[]> {
    try {
      const response = await fetch(`${API_BASE}/flash/history?limit=${limit}`);
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }
    
    return mockHistory.slice(0, limit);
  },

  async verifyFlashResult(jobId: string): Promise<{ success: boolean; errors: string[] }> {
    const op = mockOperations.get(jobId) || mockHistory.find(h => h.id === jobId);
    
    if (!op) {
      return { success: false, errors: ['Job not found'] };
    }
    
    if (op.progress.status === 'completed') {
      return { success: true, errors: [] };
    }
    
    return { 
      success: false, 
      errors: op.progress.error ? [op.progress.error] : ['Flash operation did not complete'] 
    };
  },

  getWebSocketUrl(jobId?: string): string {
    const wsBase = API_BASE.replace('http', 'ws');
    return jobId ? `${wsBase}/flash/ws/${jobId}` : `${wsBase}/devices/ws`;
  },

  async checkServerHealth(): Promise<{ healthy: boolean; version: string }> {
    try {
      const response = await fetch(`${API_BASE}/health`);
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Server unavailable
    }
    
    return { healthy: false, version: 'unknown' };
  }
};
