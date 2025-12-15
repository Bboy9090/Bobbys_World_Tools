/**
 * Shared TypeScript types for Pandora Codex
 * Used by both frontend and backend
 */

// Device Types
export interface Device {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  os: 'android' | 'ios';
  osVersion: string;
  status: 'connected' | 'disconnected' | 'offline';
  serialNumber?: string;
  batteryLevel?: number;
  connectionType?: 'usb' | 'wifi' | 'adb';
  lastSeen?: Date;
}

export interface ConnectedDevicesResponse {
  devices: Device[];
  count: number;
  timestamp: string;
}

// Diagnostic Types
export interface DiagnosticTest {
  id: string;
  name: string;
  description: string;
  category: 'hardware' | 'software' | 'network' | 'battery' | 'storage';
  estimatedDuration?: number; // in seconds
}

export interface DiagnosticResult {
  testId: string;
  status: 'passed' | 'failed' | 'warning' | 'skipped';
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface DiagnosticRunRequest {
  deviceId: string;
  tests?: string[]; // Optional: specific test IDs to run, or all if not provided
}

export interface DiagnosticRunResponse {
  runId: string;
  deviceId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  results: DiagnosticResult[];
  startedAt: string;
  completedAt?: string;
}

// Deployment Types
export interface DeploymentRequest {
  deviceId: string;
  type: 'firmware' | 'rom' | 'recovery' | 'bootloader';
  imageUrl?: string;
  imageFile?: string;
  options?: {
    wipeData?: boolean;
    wipeCache?: boolean;
    verifyOnly?: boolean;
  };
}

export interface DeploymentStatus {
  id: string;
  deviceId: string;
  type: string;
  status: 'queued' | 'preparing' | 'flashing' | 'verifying' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  message: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface DeploymentResponse {
  id: string;
  message: string;
  requiresConfirmation: boolean;
  confirmationToken?: string;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Arsenal Status Types
export interface ArsenalStatus {
  services: {
    backend: boolean;
    frontend: boolean;
    adb: boolean;
    fastboot: boolean;
  };
  connectedDevices: number;
  activeDeployments: number;
  systemHealth: 'healthy' | 'warning' | 'error';
}
