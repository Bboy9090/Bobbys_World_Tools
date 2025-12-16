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
