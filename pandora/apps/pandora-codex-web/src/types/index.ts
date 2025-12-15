// Device types
export const DeviceType = {
  Android: 'Android' as const,
  Ios: 'iOS' as const,
  IosDFU: 'IosDFU' as const,
  IosRecovery: 'IosRecovery' as const,
  Mac: 'Mac' as const,
  USB: 'USB' as const,
  Unknown: 'Unknown' as const,
} as const;

export type DeviceType = typeof DeviceType[keyof typeof DeviceType];

export interface Device {
  id: string;
  deviceType: DeviceType | string;
  model?: string;
  manufacturer?: string;
  serial?: string;
  connected: boolean;
  locked: boolean;
  properties?: Record<string, string>;
}

export interface DeviceInfo {
  id: string;
  deviceType: DeviceType | string;
  model?: string;
  manufacturer?: string;
  serial?: string;
  connected: boolean;
  locked: boolean;
}

export interface JobStatus {
  jobId: string;
  status: 'Running' | 'Completed' | 'Failed' | 'Cancelled';
  stderr?: string;
  stdout?: string;
  result?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export * from './workflows';
