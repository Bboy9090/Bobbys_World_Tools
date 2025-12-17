// Flash API - Generic flash operations API
// Provides unified interface for different flash methods

import type { 
  FlashJobConfig, 
  FlashProgress, 
  FlashOperation,
  BootForgeDevice 
} from '@/types/flash-operations';

const API_BASE = 'http://localhost:3001/api/flash';

export interface FlashAPI {
  startFlash(config: FlashJobConfig): Promise<string>;
  getProgress(jobId: string): Promise<FlashProgress | null>;
  pauseFlash(jobId: string): Promise<boolean>;
  resumeFlash(jobId: string): Promise<boolean>;
  cancelFlash(jobId: string): Promise<boolean>;
  verifyFlash(jobId: string): Promise<{ success: boolean; errors: string[] }>;
  getHistory(limit?: number): Promise<FlashOperation[]>;
}

export const flashAPI: FlashAPI = {
  async startFlash(config: FlashJobConfig): Promise<string> {
    try {
      const response = await fetch(`${API_BASE}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.jobId;
      }
    } catch {
      // Fallback
    }
    
    return `flash-${Date.now()}`;
  },

  async getProgress(jobId: string): Promise<FlashProgress | null> {
    try {
      const response = await fetch(`${API_BASE}/progress/${jobId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }
    
    return null;
  },

  async pauseFlash(jobId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/pause/${jobId}`, { method: 'POST' });
      return response.ok;
    } catch {
      return false;
    }
  },

  async resumeFlash(jobId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/resume/${jobId}`, { method: 'POST' });
      return response.ok;
    } catch {
      return false;
    }
  },

  async cancelFlash(jobId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/cancel/${jobId}`, { method: 'POST' });
      return response.ok;
    } catch {
      return false;
    }
  },

  async verifyFlash(jobId: string): Promise<{ success: boolean; errors: string[] }> {
    try {
      const response = await fetch(`${API_BASE}/verify/${jobId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }
    
    return { success: false, errors: ['Verification unavailable'] };
  },

  async getHistory(limit: number = 50): Promise<FlashOperation[]> {
    try {
      const response = await fetch(`${API_BASE}/history?limit=${limit}`);
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }
    
    return [];
  }
};
