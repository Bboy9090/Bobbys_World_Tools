/**
 * Authorization Triggers - Stub implementation
 */

export interface AuthorizationTrigger {
  id: string;
  name: string;
  description: string;
  category: string;
  riskLevel: 'low' | 'medium' | 'high';
  requiresConfirmation: boolean;
}

export const AUTHORIZATION_TRIGGERS: AuthorizationTrigger[] = [
  {
    id: 'frp-bypass',
    name: 'FRP Bypass',
    description: 'Factory Reset Protection bypass operation',
    category: 'security',
    riskLevel: 'high',
    requiresConfirmation: true,
  },
  {
    id: 'bootloader-unlock',
    name: 'Bootloader Unlock',
    description: 'Unlock device bootloader',
    category: 'bootloader',
    riskLevel: 'high',
    requiresConfirmation: true,
  },
  {
    id: 'firmware-flash',
    name: 'Firmware Flash',
    description: 'Flash custom firmware to device',
    category: 'firmware',
    riskLevel: 'medium',
    requiresConfirmation: true,
  },
];

export function getTriggers(): AuthorizationTrigger[] {
  return AUTHORIZATION_TRIGGERS;
}

export function getTriggerById(id: string): AuthorizationTrigger | undefined {
  return AUTHORIZATION_TRIGGERS.find(t => t.id === id);
}

export function getTriggersByCategory(category: string): AuthorizationTrigger[] {
  return AUTHORIZATION_TRIGGERS.filter(t => t.category === category);
}

export interface TriggerExecutionResult {
  success: boolean;
  triggerId: string;
  timestamp: number;
  message?: string;
  error?: string;
}

export interface TriggerAction {
  triggerId: string;
  deviceSerial: string;
  action: 'execute' | 'cancel' | 'timeout';
  timestamp: number;
  userId: string;
  result?: TriggerExecutionResult;
}

// In-memory action log
const triggerActionLog: TriggerAction[] = [];

export async function executeTrigger(
  triggerId: string, 
  deviceSerial: string, 
  userConfirmation?: string
): Promise<TriggerExecutionResult> {
  const trigger = getTriggerById(triggerId);
  
  if (!trigger) {
    return {
      success: false,
      triggerId,
      timestamp: Date.now(),
      error: 'Trigger not found'
    };
  }

  if (trigger.requiresConfirmation && !userConfirmation) {
    return {
      success: false,
      triggerId,
      timestamp: Date.now(),
      error: 'User confirmation required'
    };
  }

  // Log the action
  const action: TriggerAction = {
    triggerId,
    deviceSerial,
    action: 'execute',
    timestamp: Date.now(),
    userId: 'current-user'
  };

  triggerActionLog.push(action);

  // Simulate trigger execution
  return {
    success: true,
    triggerId,
    timestamp: Date.now(),
    message: `Trigger ${trigger.name} executed successfully`
  };
}

export async function logTriggerAction(action: TriggerAction): Promise<void> {
  triggerActionLog.push(action);
}

export function getTriggerActionLog(): TriggerAction[] {
  return [...triggerActionLog].sort((a, b) => b.timestamp - a.timestamp);
}
