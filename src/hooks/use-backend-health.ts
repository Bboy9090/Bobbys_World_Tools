/**
 * Backend Health Hook
 * Monitors Python backend health and readiness
 */

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export interface BackendHealth {
  status: 'booting' | 'ready' | 'failed';
  pythonBackend?: {
    port: number;
    version: string;
    uptime_ms: number;
  };
  nodeBackend?: {
    status: string;
  };
  error?: string;
}

export function useBackendHealth() {
  const [health, setHealth] = useState<BackendHealth>({
    status: 'booting'
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let mounted = true;

    const checkHealth = async () => {
      try {
        // Check Node backend status
        const nodeStatus = await invoke<string>('get_backend_status');
        
        // TODO: Add Python backend health check via Tauri command
        // For now, assume Python backend is optional
        
        if (mounted) {
          setHealth({
            status: 'ready',
            nodeBackend: {
              status: nodeStatus
            }
          });
        }
      } catch (error) {
        if (mounted) {
          setHealth({
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    };

    // Initial check
    checkHealth();

    // Poll every 2 seconds
    interval = setInterval(checkHealth, 2000);

    return () => {
      mounted = false;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  return health;
}
