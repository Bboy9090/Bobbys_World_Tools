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
  const tools = [
    { name: 'rust', command: 'rustc --version' },
    { name: 'node', command: 'node --version' },
    { name: 'python', command: 'python3 --version' },
    { name: 'adb', command: 'adb --version' },
    { name: 'fastboot', command: 'fastboot --version' },
    { name: 'docker', command: 'docker --version' },
    { name: 'git', command: 'git --version' },
  ];

  const results: SystemTool[] = [];

  for (const tool of tools) {
    try {
      const response = await fetch('/api/system/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: tool.name, command: tool.command })
      });

      if (response.ok) {
        const data = await response.json();
        results.push({
          name: tool.name,
          installed: data.installed,
          version: data.version,
          path: data.path,
          devices_raw: data.devices_raw
        });
      } else {
        results.push({
          name: tool.name,
          installed: false,
          version: null,
          path: null
        });
      }
    } catch (error) {
      results.push({
        name: tool.name,
        installed: false,
        version: null,
        path: null
      });
    }
  }

  if (results.find(t => t.name === 'adb' && t.installed)) {
    try {
      const adbDevices = await fetch('/api/system/adb-devices');
      if (adbDevices.ok) {
        const data = await adbDevices.json();
        const adbTool = results.find(t => t.name === 'adb');
        if (adbTool) {
          adbTool.devices_raw = data.devices_raw;
        }
      }
    } catch (error) {
      console.error('Failed to get ADB devices:', error);
    }
  }

  return results;
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
