/**
 * Power Chains - Multi-step Autopilot System Types
 * 
 * Three chain systems:
 * 1. Phoenix Chain++ - Ship Mode (6 steps)
 * 2. Overseer Chain - Repo Rescue (7 steps)
 * 3. Arsenal Chain - Tooling Platform (7 steps)
 */

// Base Chain Types
export type ChainStatus = 'pending' | 'running' | 'completed' | 'failed' | 'paused';
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface ChainStep {
  id: string;
  name: string;
  description: string;
  status: StepStatus;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  logs: string[];
  artifacts?: Record<string, any>;
}

export interface BaseChain {
  id: string;
  type: 'phoenix' | 'overseer' | 'arsenal';
  status: ChainStatus;
  currentStep: number;
  steps: ChainStep[];
  startedAt: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

// Phoenix Chain++ (Ship Mode) - 6 steps
export interface PhoenixChainStep extends ChainStep {
  phase: 'PLAN' | 'BUILD' | 'VERIFY' | 'HARDEN' | 'POLISH' | 'PACKAGE';
}

export interface PhoenixChain extends BaseChain {
  type: 'phoenix';
  steps: PhoenixChainStep[];
  target: {
    repository?: string;
    branch?: string;
    modules?: string[];
  };
}

export interface PhoenixChainRequest {
  target: PhoenixChain['target'];
  autoAdvance?: boolean;
  skipSteps?: string[];
}

// Overseer Chain (Repo Rescue) - 7 steps
export interface OverseerChainStep extends ChainStep {
  phase: 'AUDIT' | 'REMOVE_DEAD_CODE' | 'REFACTOR' | 'FIX_BUILDS' | 'ADD_TESTS' | 'DOCUMENT' | 'SHIP';
}

export interface OverseerChain extends BaseChain {
  type: 'overseer';
  steps: OverseerChainStep[];
  target: {
    repository: string;
    branch: string;
    modules?: string[];
  };
  findings: {
    deadCode: string[];
    brokenBuilds: string[];
    missingTests: string[];
    missingDocs: string[];
  };
}

export interface OverseerChainRequest {
  target: OverseerChain['target'];
  autoFix?: boolean;
  dryRun?: boolean;
}

// Arsenal Chain (Tooling Platform) - 7 steps
export interface ArsenalChainStep extends ChainStep {
  phase: 'DETECT' | 'INVENTORY' | 'WRAP' | 'EXPOSE_API' | 'BUILD_UI' | 'ADD_LOGGING' | 'ADD_COMPLIANCE';
}

export interface ArsenalChain extends BaseChain {
  type: 'arsenal';
  steps: ArsenalChainStep[];
  target: {
    toolsDirectory: string;
    platform?: 'node' | 'python' | 'rust' | 'all';
  };
  inventory: {
    tools: Array<{
      name: string;
      type: string;
      path: string;
      capabilities: string[];
    }>;
  };
}

export interface ArsenalChainRequest {
  target: ArsenalChain['target'];
  enableSafetyChecks?: boolean;
}

// Chain Execution Results
export interface ChainExecutionResult {
  chainId: string;
  status: ChainStatus;
  completedSteps: number;
  totalSteps: number;
  duration: number;
  artifacts: Record<string, any>;
  summary: string;
}

// API Response Types
export interface ChainStartResponse {
  chainId: string;
  type: 'phoenix' | 'overseer' | 'arsenal';
  status: ChainStatus;
  message: string;
}

export interface ChainStatusResponse {
  chain: PhoenixChain | OverseerChain | ArsenalChain;
  currentStepLogs: string[];
}
