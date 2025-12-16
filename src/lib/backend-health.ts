/**
 * Backend Health - Monitor backend API health status
 */

import { useState, useEffect } from 'react';
import { getAPIUrl } from './apiConfig';

export interface BackendHealthStatus {
  isHealthy: boolean;
  lastCheck: number;
  error?: string;
}

export async function checkBackendHealth(): Promise<BackendHealthStatus> {
  try {
    const response = await fetch(getAPIUrl('/api/health'), {
      signal: AbortSignal.timeout(5000),
    });
    
    return {
      isHealthy: response.ok,
      lastCheck: Date.now(),
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      isHealthy: false,
      lastCheck: Date.now(),
      error: error instanceof Error ? error.message : 'Backend unavailable',
    };
  }
}

export function useBackendHealth(checkInterval: number = 30000): BackendHealthStatus {
  const [health, setHealth] = useState<BackendHealthStatus>({
    isHealthy: false,
    lastCheck: 0,
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(getAPIUrl('/api/health'), {
          signal: AbortSignal.timeout(5000),
        });
        
        setHealth({
          isHealthy: response.ok,
          lastCheck: Date.now(),
          error: response.ok ? undefined : `HTTP ${response.status}`,
        });
      } catch (error) {
        setHealth({
          isHealthy: false,
          lastCheck: Date.now(),
          error: error instanceof Error ? error.message : 'Backend unavailable',
        });
      }
    };

    // Check immediately
    checkHealth();

    // Set up interval
    const interval = setInterval(checkHealth, checkInterval);

    return () => clearInterval(interval);
  }, [checkInterval]);

  return health;
}
