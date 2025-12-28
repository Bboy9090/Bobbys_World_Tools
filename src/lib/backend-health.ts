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
    const response = await fetch(getAPIUrl('/api/v1/ready'), {
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      return {
        isHealthy: false,
        lastCheck: Date.now(),
        error: `HTTP ${response.status}`,
      };
    }
    
    const data = await response.json();
    // Handle envelope format
    const envelope = data.ok !== undefined ? data : { ok: true, data };
    
    return {
      isHealthy: envelope.ok === true,
      lastCheck: Date.now(),
      error: envelope.ok === false ? envelope.error?.message : undefined,
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
        const response = await fetch(getAPIUrl('/api/v1/ready'), {
          signal: AbortSignal.timeout(5000),
        });
        
        if (!response.ok) {
          setHealth({
            isHealthy: false,
            lastCheck: Date.now(),
            error: `HTTP ${response.status}`,
          });
          return;
        }
        
        const data = await response.json();
        // Handle envelope format
        const envelope = data.ok !== undefined ? data : { ok: true, data };
        
        setHealth({
          isHealthy: envelope.ok === true,
          lastCheck: Date.now(),
          error: envelope.ok === false ? envelope.error?.message : undefined,
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
