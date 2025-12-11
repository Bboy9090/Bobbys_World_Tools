import { useState, useEffect, useCallback } from 'react';
import { detectSystemTools, detectUSBDevices, scanLocalNetwork, requestUSBDevice, type SystemTool, type USBDeviceInfo, type NetworkDevice } from '@/lib/deviceDetection';

export function useSystemTools() {
  const [tools, setTools] = useState<SystemTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const detected = await detectSystemTools();
      setTools(detected);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect system tools');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { tools, loading, error, refresh };
}

export function useUSBDevices() {
  const [devices, setDevices] = useState<USBDeviceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);

  const refresh = useCallback(async () => {
    const nav = navigator as any;
    if (!nav.usb) {
      setSupported(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const detected = await detectUSBDevices();
      setDevices(detected);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect USB devices');
    } finally {
      setLoading(false);
    }
  }, []);

  const requestDevice = useCallback(async () => {
    const nav = navigator as any;
    if (!nav.usb) {
      setError('WebUSB not supported in this browser');
      return null;
    }

    try {
      const device = await requestUSBDevice();
      if (device) {
        await refresh();
      }
      return device;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request USB device');
      return null;
    }
  }, [refresh]);

  useEffect(() => {
    refresh();

    const nav = navigator as any;
    if (nav.usb) {
      const handleConnect = () => refresh();
      const handleDisconnect = () => refresh();

      nav.usb.addEventListener('connect', handleConnect);
      nav.usb.addEventListener('disconnect', handleDisconnect);

      return () => {
        nav.usb?.removeEventListener('connect', handleConnect);
        nav.usb?.removeEventListener('disconnect', handleDisconnect);
      };
    }
  }, [refresh]);

  return { devices, loading, error, supported, refresh, requestDevice };
}

export function useNetworkDevices() {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const scan = useCallback(async () => {
    setScanning(true);
    setLoading(true);
    setError(null);
    try {
      const detected = await scanLocalNetwork();
      setDevices(detected);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan network');
    } finally {
      setLoading(false);
      setScanning(false);
    }
  }, []);

  return { devices, loading, error, scanning, scan };
}

export function useAllDevices() {
  const systemTools = useSystemTools();
  const usbDevices = useUSBDevices();
  const networkDevices = useNetworkDevices();

  const refreshAll = useCallback(async () => {
    await Promise.all([
      systemTools.refresh(),
      usbDevices.refresh(),
      networkDevices.scan()
    ]);
  }, [systemTools, usbDevices, networkDevices]);

  const isLoading = systemTools.loading || usbDevices.loading || networkDevices.loading;
  const hasError = systemTools.error || usbDevices.error || networkDevices.error;

  return {
    systemTools,
    usbDevices,
    networkDevices,
    isLoading,
    hasError,
    refreshAll
  };
}
