export type Platform = 'ios' | 'android' | 'mac' | 'universal';

export type WorkflowCategory = 
  | 'icloud_bypass'
  | 'mdm_bypass'
  | 'frp_bypass'
  | 'passcode_unlock'
  | 'bootloader_unlock'
  | 'knox_removal'
  | 'activation_lock'
  | 'carrier_unlock'
  | 'jailbreak'
  | 'root'
  | 'data_extraction'
  | 'custom';

export type WorkflowType = 'sequential' | 'decision_tree' | 'race_condition' | 'mega';

export type WorkflowState = 
  | 'pending'
  | 'running'
  | 'paused'
  | 'waiting_for_user'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type StepState = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface WorkflowListItem {
  id: string;
  name: string;
  description: string;
  platform: Platform;
  category: WorkflowCategory;
  workflowType: WorkflowType;
  successRateEstimate: number;
  estimatedDurationSecs: number;
  tags: string[];
  isMega: boolean;
}

export interface WorkflowStepInfo {
  id: string;
  name: string;
  description: string;
  actionType: string;
  estimatedDurationSecs: number;
}

export interface WorkflowDetail extends WorkflowListItem {
  steps: WorkflowStepInfo[];
  requiredTools: string[];
  componentWorkflows: string[];
}

export interface StepResultInfo {
  stepId: string;
  stepName: string;
  state: StepState;
  output?: string;
  error?: string;
  durationMs: number;
}

export interface ExecutionProgress {
  executionId: string;
  workflowName: string;
  state: WorkflowState;
  currentStep?: string;
  currentStepIndex: number;
  totalSteps: number;
  progressPercent: number;
  elapsedSecs: number;
  stepResults: StepResultInfo[];
}

export interface UserPrompt {
  executionId: string;
  stepId: string;
  message: string;
  options: string[];
}

export interface AttackSurface {
  id: string;
  name: string;
  description: string;
  available: boolean;
  confidence: number;
  requiredTools: string[];
}

export interface WorkflowRecommendation {
  workflowId: string;
  workflowName: string;
  estimatedSuccessRate: number;
  reasons: string[];
  warnings: string[];
  missingTools: string[];
}

export interface ProbeResult {
  deviceId: string;
  platform: Platform;
  manufacturer?: string;
  model?: string;
  chipset?: string;
  osVersion?: string;
  securityPatch?: string;
  deviceState: string;
  availableAttackSurfaces: AttackSurface[];
  recommendedWorkflows: WorkflowRecommendation[];
}

export interface TrialRecord {
  id: string;
  workflowId: string;
  workflowName: string;
  deviceManufacturer: string;
  deviceModel: string;
  deviceChipset?: string;
  osVersion?: string;
  securityPatch?: string;
  success: boolean;
  failureReason?: string;
  failedAtStep?: string;
  totalDurationMs: number;
  notes?: string;
  recordedAt: string;
}

export interface SuccessRate {
  workflowId: string;
  deviceKey: string;
  totalAttempts: number;
  successfulAttempts: number;
  successRate: number;
  averageDurationMs: number;
  lastSuccess?: string;
  lastFailure?: string;
  commonFailureReasons: string[];
}

export const CATEGORY_LABELS: Record<WorkflowCategory, string> = {
  icloud_bypass: 'iCloud Bypass',
  mdm_bypass: 'MDM Bypass',
  frp_bypass: 'FRP Bypass',
  passcode_unlock: 'Passcode Unlock',
  bootloader_unlock: 'Bootloader Unlock',
  knox_removal: 'Knox Removal',
  activation_lock: 'Activation Lock',
  carrier_unlock: 'Carrier Unlock',
  jailbreak: 'Jailbreak',
  root: 'Root',
  data_extraction: 'Data Extraction',
  custom: 'Custom',
};

export const PLATFORM_LABELS: Record<Platform, string> = {
  ios: 'iOS',
  android: 'Android',
  mac: 'Mac',
  universal: 'Universal',
};

export const STATE_LABELS: Record<WorkflowState, string> = {
  pending: 'Pending',
  running: 'Running',
  paused: 'Paused',
  waiting_for_user: 'Waiting for Input',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
};
