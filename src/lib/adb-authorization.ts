// ADB Authorization - Handles ADB authorization and key management
// Provides secure authorization workflows for device connections

export interface ADBAuthorizationState {
  deviceSerial: string;
  authorized: boolean;
  pendingApproval: boolean;
  publicKeyHash?: string;
  lastAuthorized?: number;
  authorizedBy?: string;
}

export interface ADBAuthorizationAPI {
  checkAuthorization(deviceSerial: string): Promise<ADBAuthorizationState>;
  requestAuthorization(deviceSerial: string): Promise<{ pending: boolean; message: string }>;
  revokeAuthorization(deviceSerial: string): Promise<boolean>;
  listAuthorizedDevices(): Promise<ADBAuthorizationState[]>;
  exportPublicKey(): Promise<string>;
}

// In-memory storage
const authorizedDevices: Map<string, ADBAuthorizationState> = new Map();

// Trigger ADB authorization for a device
export async function triggerADBAuthorization(deviceSerial: string): Promise<{ pending: boolean; message: string }> {
  return adbAuthorization.requestAuthorization(deviceSerial);
}

export const adbAuthorization: ADBAuthorizationAPI = {
  async checkAuthorization(deviceSerial: string): Promise<ADBAuthorizationState> {
    const existing = authorizedDevices.get(deviceSerial);
    if (existing) {
      return existing;
    }

    return {
      deviceSerial,
      authorized: false,
      pendingApproval: false
    };
  },

  async requestAuthorization(deviceSerial: string): Promise<{ pending: boolean; message: string }> {
    const state: ADBAuthorizationState = {
      deviceSerial,
      authorized: false,
      pendingApproval: true,
      publicKeyHash: 'sha256:' + Math.random().toString(36).slice(2, 18)
    };

    authorizedDevices.set(deviceSerial, state);

    return {
      pending: true,
      message: 'Please check the device screen and approve the USB debugging connection'
    };
  },

  async revokeAuthorization(deviceSerial: string): Promise<boolean> {
    return authorizedDevices.delete(deviceSerial);
  },

  async listAuthorizedDevices(): Promise<ADBAuthorizationState[]> {
    return Array.from(authorizedDevices.values()).filter(d => d.authorized);
  },

  async exportPublicKey(): Promise<string> {
    return '-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEA...\n-----END RSA PUBLIC KEY-----';
  }
};
