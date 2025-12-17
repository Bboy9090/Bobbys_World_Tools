// Device Authorization Triggers - Handles device-specific authorization workflows
// Triggered by specific device actions or operations

import type { DetectedDevice } from '@/types/plugin-sdk';

export type AuthorizationTriggerType = 
  | 'high-risk-operation'
  | 'first-connection'
  | 'bootloader-unlock'
  | 'data-wipe'
  | 'flash-operation'
  | 'frp-bypass'
  | 'root-operation';

export interface AuthorizationTrigger {
  type: AuthorizationTriggerType;
  deviceSerial: string;
  operation: string;
  requiredLevel: 'user' | 'admin' | 'owner';
  prompt: string;
  expectedResponse?: string;
  timeout?: number;
}

export interface AuthorizationResult {
  granted: boolean;
  userId: string;
  timestamp: number;
  expiresAt?: number;
  reason?: string;
}

export interface DeviceAuthorizationTriggersAPI {
  checkRequired(deviceSerial: string, operation: string): Promise<AuthorizationTrigger | null>;
  requestAuthorization(trigger: AuthorizationTrigger, userResponse: string): Promise<AuthorizationResult>;
  getActiveAuthorizations(deviceSerial: string): Promise<AuthorizationResult[]>;
  revokeAuthorization(deviceSerial: string, operation: string): Promise<boolean>;
}

// In-memory storage
const activeAuthorizations: Map<string, AuthorizationResult[]> = new Map();

// Operations that require authorization
const AUTHORIZATION_REQUIRED: Record<string, AuthorizationTriggerType> = {
  'bootloader-unlock': 'bootloader-unlock',
  'factory-reset': 'data-wipe',
  'flash-system': 'flash-operation',
  'flash-boot': 'flash-operation',
  'frp-bypass': 'frp-bypass',
  'root-install': 'root-operation',
};

export const deviceAuthorizationTriggers: DeviceAuthorizationTriggersAPI = {
  async checkRequired(deviceSerial: string, operation: string): Promise<AuthorizationTrigger | null> {
    const triggerType = AUTHORIZATION_REQUIRED[operation];
    
    if (!triggerType) {
      return null;
    }

    // Check if already authorized
    const auths = activeAuthorizations.get(deviceSerial) || [];
    const existingAuth = auths.find(a => a.granted && (!a.expiresAt || a.expiresAt > Date.now()));
    
    if (existingAuth) {
      return null; // Already authorized
    }

    return {
      type: triggerType,
      deviceSerial,
      operation,
      requiredLevel: triggerType === 'bootloader-unlock' || triggerType === 'frp-bypass' ? 'owner' : 'admin',
      prompt: getPromptForTrigger(triggerType),
      expectedResponse: getExpectedResponse(triggerType),
      timeout: 60000 // 1 minute
    };
  },

  async requestAuthorization(trigger: AuthorizationTrigger, userResponse: string): Promise<AuthorizationResult> {
    const isValid = !trigger.expectedResponse || 
      userResponse.toLowerCase() === trigger.expectedResponse.toLowerCase();

    const result: AuthorizationResult = {
      granted: isValid,
      userId: 'current-user',
      timestamp: Date.now(),
      expiresAt: isValid ? Date.now() + 3600000 : undefined, // 1 hour
      reason: isValid ? undefined : 'Invalid response'
    };

    if (isValid) {
      if (!activeAuthorizations.has(trigger.deviceSerial)) {
        activeAuthorizations.set(trigger.deviceSerial, []);
      }
      activeAuthorizations.get(trigger.deviceSerial)!.push(result);
    }

    return result;
  },

  async getActiveAuthorizations(deviceSerial: string): Promise<AuthorizationResult[]> {
    const auths = activeAuthorizations.get(deviceSerial) || [];
    return auths.filter(a => a.granted && (!a.expiresAt || a.expiresAt > Date.now()));
  },

  async revokeAuthorization(deviceSerial: string, _operation: string): Promise<boolean> {
    const auths = activeAuthorizations.get(deviceSerial);
    if (!auths) return false;
    
    // Revoke all for device
    activeAuthorizations.set(deviceSerial, auths.map(a => ({ ...a, granted: false })));
    return true;
  }
};

function getPromptForTrigger(type: AuthorizationTriggerType): string {
  switch (type) {
    case 'bootloader-unlock':
      return "Type 'UNLOCK' to confirm bootloader unlock. WARNING: This will erase all data.";
    case 'data-wipe':
      return "Type 'ERASE' to confirm data wipe. All user data will be permanently deleted.";
    case 'flash-operation':
      return "Type 'FLASH' to confirm flashing operation.";
    case 'frp-bypass':
      return "Type 'I OWN THIS DEVICE' to confirm FRP bypass authorization.";
    case 'root-operation':
      return "Type 'ROOT' to confirm root installation.";
    default:
      return "Type 'CONFIRM' to proceed.";
  }
}

function getExpectedResponse(type: AuthorizationTriggerType): string {
  switch (type) {
    case 'bootloader-unlock': return 'UNLOCK';
    case 'data-wipe': return 'ERASE';
    case 'flash-operation': return 'FLASH';
    case 'frp-bypass': return 'I OWN THIS DEVICE';
    case 'root-operation': return 'ROOT';
    default: return 'CONFIRM';
  }
}
