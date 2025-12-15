/**
 * Diagnostics Engine Types - TITAN 3
 */

export type DiagnosticSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type DiagnosticCategory = 'thermal' | 'storage' | 'battery' | 'crash_loop' | 'network' | 'hardware' | 'software';

export interface DiagnosticPattern {
  id: string;
  name: string;
  category: DiagnosticCategory;
  severity: DiagnosticSeverity;
  pattern: string | RegExp;
  description: string;
  recommendations: string[];
}

export interface DiagnosticFinding {
  id: string;
  patternId: string;
  category: DiagnosticCategory;
  severity: DiagnosticSeverity;
  title: string;
  description: string;
  evidence: string[];
  recommendations: string[];
  timestamp: string;
}

export interface RepairReport {
  id: string;
  deviceId: string;
  generatedAt: string;
  duration: number;
  findings: DiagnosticFinding[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  recommendations: string[];
  nextSteps: string[];
  reportData: {
    deviceInfo: {
      model: string;
      os: string;
      osVersion: string;
      serialNumber?: string;
    };
    logs: {
      system: string[];
      kernel: string[];
      application: string[];
    };
    metrics: {
      temperature?: number;
      batteryHealth?: number;
      storageUsed?: number;
      storageTotal?: number;
      memoryUsed?: number;
      memoryTotal?: number;
    };
  };
}

export interface DiagnosticEngineRequest {
  deviceId: string;
  collectLogs?: boolean;
  categories?: DiagnosticCategory[];
  timeout?: number;
}

export interface DiagnosticEngineResponse {
  reportId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  message: string;
}

/**
 * BootForge Deployment Core Types - TITAN 4
 */

export interface ImageMetadata {
  id: string;
  name: string;
  version: string;
  type: 'firmware' | 'rom' | 'recovery' | 'bootloader' | 'kernel';
  platform: 'android' | 'ios' | 'universal';
  size: number;
  checksum: {
    algorithm: 'sha256' | 'md5';
    value: string;
  };
  uploadedAt: string;
  uploadedBy: string;
  verified: boolean;
}

export interface TargetDisk {
  id: string;
  deviceId: string;
  name: string;
  path: string;
  size: number;
  used: number;
  filesystem?: string;
  mountPoint?: string;
  isSystemDisk: boolean;
}

export interface DeploymentConfirmation {
  confirmationId: string;
  action: string;
  target: {
    deviceId: string;
    diskId?: string;
  };
  warnings: string[];
  requiredConfirmations: {
    dataLoss: boolean;
    destructive: boolean;
    noUndo: boolean;
  };
  expiresAt: string;
}

export interface DeploymentJob {
  id: string;
  imageId: string;
  deviceId: string;
  diskId?: string;
  status: 'pending' | 'verifying' | 'preparing' | 'imaging' | 'validating' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentStep: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
  logs: string[];
  auditTrail: Array<{
    timestamp: string;
    action: string;
    details: string;
  }>;
  mockMode: boolean;
}

export interface BootForgeDeploymentRequest {
  imageId: string;
  deviceId: string;
  diskId?: string;
  confirmationToken: string;
  options: {
    verify: boolean;
    backup: boolean;
    mockMode: boolean;
  };
}

/**
 * Compliance & Guardrails Types - TITAN 5
 */

export interface ComplianceBoundary {
  id: string;
  name: string;
  description: string;
  scope: 'global' | 'module' | 'function';
  rules: string[];
  enforcementLevel: 'error' | 'warning' | 'info';
}

export interface ComplianceViolation {
  id: string;
  boundaryId: string;
  filePath: string;
  lineNumber: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  suggestion?: string;
  timestamp: string;
}

export interface ComplianceReport {
  id: string;
  scanId: string;
  generatedAt: string;
  scope: string[];
  violations: ComplianceViolation[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  passed: boolean;
}

export interface ComplianceCheckRequest {
  scope?: string[];
  rules?: string[];
  autoFix?: boolean;
}
