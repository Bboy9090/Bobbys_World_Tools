import { API_CONFIG, getAPIUrl } from './apiConfig';

export interface SystemTool {
  name: string;
  installed: boolean;
  version?: string | null;
  path?: string | null;
  devices_raw?: string | null;
}

export interface USBDeviceInfo {
  id: string;
  vendorId: number;
  productId: number;
  manufacturerName?: string;
  productName?: string;
  serialNumber?: string;
}

export interface NetworkDevice {
  ip: string;
  hostname?: string;
  mac?: string;
  vendor?: string;
  ports?: number[];
  services?: string[];
}

export interface DetectionResult {
  systemTools: SystemTool[];
  usbDevices: USBDeviceInfo[];
  networkDevices: NetworkDevice[];
  timestamp: number;
}

export async function detectSystemTools(): Promise<SystemTool[]> {
  try {
    const response = await fetch(getAPIUrl(API_CONFIG.ENDPOINTS.SYSTEM_TOOLS), {
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const results: SystemTool[] = [];

    const toolMapping = [
      { key: 'rust', name: 'rust' },
      { key: 'node', name: 'node' },
      { key: 'python', name: 'python' },
      { key: 'git', name: 'git' },
      { key: 'docker', name: 'docker' },
      { key: 'adb', name: 'adb' },
      { key: 'fastboot', name: 'fastboot' },
    ];

    for (const { key, name } of toolMapping) {
      const toolData = data.tools[key];
      if (toolData) {
        results.push({
          name,
          installed: toolData.installed || false,
          version: toolData.version || null,
          path: null,
          devices_raw: toolData.devices_raw || null
        });
      } else {
        results.push({
          name,
          installed: false,
          version: null,
          path: null
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Failed to detect system tools:', error);
    throw new Error(`Backend API not available. Start the server with: npm run server:dev`);
  }
}

export async function detectUSBDevices(): Promise<USBDeviceInfo[]> {
  const nav = navigator as any;
  if (!nav.usb) {
    console.warn('WebUSB API not supported in this browser');
    return [];
  }

  try {
    const devices = await nav.usb.getDevices();
    return devices.map((device: any) => ({
      id: `${device.vendorId}-${device.productId}-${device.serialNumber || 'unknown'}`,
      vendorId: device.vendorId,
      productId: device.productId,
      manufacturerName: device.manufacturerName,
      productName: device.productName,
      serialNumber: device.serialNumber
    }));
  } catch (error) {
    console.error('Failed to get USB devices:', error);
    return [];
  }
}

export async function requestUSBDevice(): Promise<USBDeviceInfo | null> {
  const nav = navigator as any;
  if (!nav.usb) {
    throw new Error('WebUSB API not supported in this browser');
  }

  try {
    const device = await nav.usb.requestDevice({ filters: [] });
    return {
      id: `${device.vendorId}-${device.productId}-${device.serialNumber || 'unknown'}`,
      vendorId: device.vendorId,
      productId: device.productId,
      manufacturerName: device.manufacturerName,
      productName: device.productName,
      serialNumber: device.serialNumber
    };
  } catch (error) {
    console.error('Failed to request USB device:', error);
    return null;
  }
}

export async function scanLocalNetwork(): Promise<NetworkDevice[]> {
  try {
    const response = await fetch('/api/network/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      const data = await response.json();
      return data.devices || [];
    }
  } catch (error) {
    console.error('Failed to scan local network:', error);
  }

  const mockDevices: NetworkDevice[] = [
    {
      ip: '192.168.1.1',
      hostname: 'router.local',
      mac: '00:11:22:33:44:55',
      vendor: 'Router Manufacturer',
      ports: [80, 443],
      services: ['http', 'https']
    }
  ];

  return mockDevices;
}

export async function detectAllDevices(): Promise<DetectionResult> {
  const [systemTools, usbDevices, networkDevices] = await Promise.all([
    detectSystemTools(),
    detectUSBDevices(),
    scanLocalNetwork()
  ]);

  return {
    systemTools,
    usbDevices,
    networkDevices,
    timestamp: Date.now()
  };
}

export function getUSBVendorName(vendorId: number): string {
  const vendors: Record<number, string> = {
    0x2341: 'Arduino',
    0x1a86: 'QinHeng Electronics',
    0x0403: 'FTDI',
    0x10c4: 'Silicon Labs',
    0x239a: 'Adafruit',
    0xcafe: 'Teensyduino',
    0x16c0: 'Van Ooijen Technische Informatica',
    0x04d8: 'Microchip',
    0x18d1: 'Google Inc.',
    0x05ac: 'Apple Inc.',
    0x045e: 'Microsoft',
    0x046d: 'Logitech',
    0x054c: 'Sony',
    0x04b8: 'Seiko Epson',
    0x0bb4: 'HTC',
    0x22b8: 'Motorola',
    0x04e8: 'Samsung'
  };

  return vendors[vendorId] || `Unknown (0x${vendorId.toString(16).padStart(4, '0')})`;
}
