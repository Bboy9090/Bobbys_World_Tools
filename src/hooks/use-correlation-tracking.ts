import { useState, useEffect, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';
import type { CorrelationBadge } from '@/types/correlation';

export interface CorrelatedDevice {
  id: string;
  serial?: string;
  platform: string;
  mode: string;
  confidence: number;
  correlationBadge: CorrelationBadge;
  matchedIds: string[];
  correlationNotes: string[];
  timestamp: number;
  vendorId?: number;
  productId?: number;
}

export interface CorrelationStats {
  total: number;
  correlated: number;
  weakCorrelated: number;
  systemConfirmed: number;
  likely: number;
  unconfirmed: number;
  averageConfidence: number;
}

export function useCorrelationTracking() {
  const [devices, setDevices] = useKV<CorrelatedDevice[]>('correlation-devices', []);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  const updateDevice = useCallback((deviceId: string, updates: Partial<CorrelatedDevice>) => {
    setDevices((current) => {
      const currentDevices = current || [];
      const existingIndex = currentDevices.findIndex(d => d.id === deviceId);
      const updatedDevice = {
        ...(existingIndex >= 0 ? currentDevices[existingIndex] : { id: deviceId }),
        ...updates,
        timestamp: Date.now(),
      } as CorrelatedDevice;

      if (existingIndex >= 0) {
        const newDevices = [...currentDevices];
        newDevices[existingIndex] = updatedDevice;
        return newDevices;
      }
      return [...currentDevices, updatedDevice];
    });
    setLastUpdate(Date.now());
  }, [setDevices]);

  const removeDevice = useCallback((deviceId: string) => {
    setDevices((current) => (current || []).filter(d => d.id !== deviceId));
    setLastUpdate(Date.now());
  }, [setDevices]);

  const clearAllDevices = useCallback(() => {
    setDevices([]);
    setLastUpdate(Date.now());
  }, [setDevices]);

  const getStats = useCallback((): CorrelationStats => {
    const deviceList = devices || [];
    const total = deviceList.length;
    const correlated = deviceList.filter(d => d.correlationBadge === 'CORRELATED').length;
    const weakCorrelated = deviceList.filter(d => d.correlationBadge === 'CORRELATED (WEAK)').length;
    const systemConfirmed = deviceList.filter(d => d.correlationBadge === 'SYSTEM-CONFIRMED').length;
    const likely = deviceList.filter(d => d.correlationBadge === 'LIKELY').length;
    const unconfirmed = deviceList.filter(d => d.correlationBadge === 'UNCONFIRMED').length;
    const averageConfidence = total > 0
      ? deviceList.reduce((sum, d) => sum + d.confidence, 0) / total
      : 0;

    return {
      total,
      correlated,
      weakCorrelated,
      systemConfirmed,
      likely,
      unconfirmed,
      averageConfidence,
    };
  }, [devices]);

  const startTracking = useCallback(() => {
    setIsTracking(true);
  }, []);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
  }, []);

  return {
    devices,
    isTracking,
    lastUpdate,
    updateDevice,
    removeDevice,
    clearAllDevices,
    getStats,
    startTracking,
    stopTracking,
  };
}
