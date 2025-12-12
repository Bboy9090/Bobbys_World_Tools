import { API_CONFIG, getAPIUrl } from './apiConfig';
import { detectUSBDevicesWithClasses, analyzeUSBDevice, type EnhancedUSBDeviceInfo } from './usbClassDetection';

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

export type { EnhancedUSBDeviceInfo } from './usbClassDetection';

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

export async function detectUSBDevicesEnhanced(): Promise<EnhancedUSBDeviceInfo[]> {
  return await detectUSBDevicesWithClasses();
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
    0x03e7: 'Intel',
    0x03eb: 'Atmel',
    0x03f0: 'HP',
    0x0403: 'FTDI',
    0x0424: 'SMSC',
    0x045b: 'Hitachi',
    0x045e: 'Microsoft',
    0x046a: 'Cherry',
    0x046d: 'Logitech',
    0x0451: 'Texas Instruments',
    0x0483: 'STMicroelectronics',
    0x0489: 'Foxconn',
    0x04b3: 'IBM',
    0x04b4: 'Cypress Semiconductor',
    0x04b8: 'Seiko Epson',
    0x04ca: 'Lite-On',
    0x04d8: 'Microchip',
    0x04d9: 'Holtek',
    0x04dd: 'Sharp',
    0x04e8: 'Samsung',
    0x04f2: 'Chicony Electronics',
    0x0502: 'Acer',
    0x050d: 'Belkin',
    0x0525: 'Netchip Technology',
    0x054c: 'Sony',
    0x058f: 'Alcor Micro',
    0x059b: 'Iomega',
    0x05ac: 'Apple Inc.',
    0x05c6: 'Qualcomm',
    0x05e3: 'Genesys Logic',
    0x067b: 'Prolific',
    0x0781: 'SanDisk',
    0x0846: 'NetGear',
    0x090c: 'Silicon Motion',
    0x091e: 'Garmin',
    0x0930: 'Toshiba',
    0x0955: 'NVIDIA',
    0x0a46: 'Davicom',
    0x0a5c: 'Broadcom',
    0x0b05: 'ASUSTeK',
    0x0b95: 'ASIX Electronics',
    0x0bb4: 'HTC',
    0x0bda: 'Realtek',
    0x0c2e: 'Honeywell',
    0x0c45: 'Microdia',
    0x0c76: 'JMTek',
    0x0cf3: 'Qualcomm Atheros',
    0x0d28: 'ARM',
    0x0db0: 'Micro Star International',
    0x0e0f: 'VMware',
    0x0e66: 'Hawking Technologies',
    0x0e79: 'Archos',
    0x0e8d: 'MediaTek',
    0x0fca: 'Research In Motion (BlackBerry)',
    0x0fce: 'Sony Ericsson',
    0x0fcf: 'Dynastream Innovations',
    0x1002: 'AMD',
    0x1004: 'LG Electronics',
    0x1050: 'Yubico',
    0x1058: 'Western Digital',
    0x10c4: 'Silicon Labs',
    0x10de: 'NVIDIA Graphics',
    0x1209: 'pid.codes',
    0x12d1: 'Huawei',
    0x1366: 'SEGGER',
    0x13b1: 'Linksys',
    0x13d3: 'IMC Networks',
    0x13fe: 'Kingston Technology',
    0x1462: 'MSI',
    0x148f: 'Ralink Technology',
    0x14cd: 'Super Top',
    0x152d: 'JMicron',
    0x1532: 'Razer USA',
    0x15a2: 'Freescale Semiconductor',
    0x1690: 'Askey Computer',
    0x16c0: 'Van Ooijen Technische Informatica',
    0x16d0: 'MCS',
    0x174c: 'ASMedia Technology',
    0x174f: 'Syntek',
    0x17ef: 'Lenovo',
    0x1782: 'Spreadtrum',
    0x18d1: 'Google Inc.',
    0x1908: 'GEMBIRD',
    0x1915: 'Nordic Semiconductor',
    0x19d2: 'ZTE',
    0x1a40: 'Terminus Technology',
    0x1a86: 'QinHeng Electronics',
    0x1b1c: 'Corsair',
    0x1b3f: 'Generalplus Technology',
    0x1bbb: 'T&A Mobile Phones',
    0x1bcf: 'Sunplus Innovation',
    0x1d6b: 'Linux Foundation',
    0x1ebf: 'Vodafone',
    0x1f3a: 'Onda',
    0x1f75: 'Innostor Technology',
    0x1fc9: 'NXP Semiconductors',
    0x1ffb: 'Pololu',
    0x2001: 'D-Link',
    0x2080: 'Nook',
    0x2109: 'VIA Labs',
    0x2207: 'Fuzhou Rockchip',
    0x2237: 'Kobo',
    0x22b8: 'Motorola',
    0x22d9: 'OPPO Electronics',
    0x239a: 'Adafruit',
    0x2341: 'Arduino',
    0x25a7: 'Areson Technology',
    0x258a: 'SINO WEALTH',
    0x2717: 'Xiaomi',
    0x27b8: 'ThingM',
    0x2833: 'Oculus VR',
    0x2886: 'Seeed Technology',
    0x2916: 'Android',
    0x2a45: 'Meizu',
    0x2a47: 'BQ',
    0x2a70: 'OnePlus',
    0x2ae5: 'Fairphone',
    0x2d95: 'vivo',
    0x2e8a: 'Raspberry Pi',
    0x2fe3: 'Particle',
    0x303a: 'Espressif',
    0x3434: 'Keychron',
    0x413c: 'Dell',
    0x5986: 'Acer Crystal Eye',
    0x80ee: 'VirtualBox',
    0x8087: 'Intel Bluetooth',
    0x8564: 'Transcend',
    0xcafe: 'Teensyduino',
    0xfeed: 'QMK',
    0x20a0: 'Clay Logic'
  };

  return vendors[vendorId] || `Unknown (0x${vendorId.toString(16).padStart(4, '0')})`;
}
