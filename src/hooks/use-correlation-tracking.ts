import { useEffect, useState } from 'react';

export type CorrelationBadge = 'CORRELATED' | 'SYSTEM-CONFIRMED' | 'LIKELY' | 'UNCONFIRMED' | 'CORRELATED (WEAK)';

export interface CorrelationData {
  badge: CorrelationBadge;
  matchedIds: string[];
  correlationNotes: string[];
  confidenceScore: number;
  lastUpdated: string;
  confidenceHistory: Array<{
    timestamp: string;
    score: number;
    trigger: string;
  }>;
}

export interface DeviceCorrelation {
  deviceId: string;
  platform: string;
  mode: string;
  correlation: CorrelationData;
}

interface CorrelationWebSocketMessage {
  type: 'correlation.update' | 'correlation.initial' | 'device.detected' | 'device.lost';
  deviceId?: string;
  payload?: any;
}

export function useCorrelationTracking(wsUrl: string = 'ws://localhost:3001/correlation') {
  const [devices, setDevices] = useState<Map<string, DeviceCorrelation>>(new Map());
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setConnected(true);
          setError(null);
          console.log('[Correlation] WebSocket connected');
        };

        ws.onmessage = (event) => {
          try {
            const message: CorrelationWebSocketMessage = JSON.parse(event.data);
            
            switch (message.type) {
              case 'correlation.initial':
                if (message.payload?.devices) {
                  const deviceMap = new Map<string, DeviceCorrelation>();
                  message.payload.devices.forEach((device: DeviceCorrelation) => {
                    deviceMap.set(device.deviceId, device);
                  });
                  setDevices(deviceMap);
                }
                break;

              case 'correlation.update':
                if (message.deviceId && message.payload) {
                  setDevices(prev => {
                    const updated = new Map(prev);
                    const existing = updated.get(message.deviceId!);
                    
                    if (existing) {
                      updated.set(message.deviceId!, {
                        ...existing,
                        correlation: {
                          ...existing.correlation,
                          ...message.payload,
                          lastUpdated: new Date().toISOString(),
                        }
                      });
                    }
                    
                    return updated;
                  });
                }
                break;

              case 'device.detected':
                if (message.deviceId && message.payload) {
                  setDevices(prev => {
                    const updated = new Map(prev);
                    updated.set(message.deviceId!, message.payload);
                    return updated;
                  });
                }
                break;

              case 'device.lost':
                if (message.deviceId) {
                  setDevices(prev => {
                    const updated = new Map(prev);
                    updated.delete(message.deviceId!);
                    return updated;
                  });
                }
                break;
            }
          } catch (err) {
            console.error('[Correlation] Failed to parse message:', err);
          }
        };

        ws.onerror = (event) => {
          console.error('[Correlation] WebSocket error:', event);
          setError('WebSocket connection error');
        };

        ws.onclose = () => {
          setConnected(false);
          console.log('[Correlation] WebSocket closed, reconnecting in 5s...');
          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch (err) {
        console.error('[Correlation] Failed to create WebSocket:', err);
        setError('Failed to connect');
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [wsUrl]);

  const getDeviceCorrelation = (deviceId: string): DeviceCorrelation | undefined => {
    return devices.get(deviceId);
  };

  const getAllDevices = (): DeviceCorrelation[] => {
    return Array.from(devices.values());
  };

  return {
    devices: getAllDevices(),
    getDeviceCorrelation,
    connected,
    error,
  };
}
