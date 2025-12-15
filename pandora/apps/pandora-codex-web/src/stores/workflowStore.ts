import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type {
  WorkflowListItem,
  WorkflowDetail,
  ExecutionProgress,
  ProbeResult,
  TrialRecord,
  SuccessRate,
  Platform,
  WorkflowCategory,
  UserPrompt,
} from '../types/workflows';

interface WorkflowState {
  workflows: WorkflowListItem[];
  currentWorkflow: WorkflowDetail | null;
  currentExecution: ExecutionProgress | null;
  probeResult: ProbeResult | null;
  trialRecords: TrialRecord[];
  successRates: SuccessRate[];
  userPrompt: UserPrompt | null;
  isLoading: boolean;
  error: string | null;
  
  fetchWorkflows: (platform?: Platform, category?: WorkflowCategory) => Promise<void>;
  fetchWorkflowDetail: (workflowId: string) => Promise<void>;
  startExecution: (workflowId: string, deviceId: string, deviceInfo: Record<string, string>) => Promise<string>;
  getExecutionProgress: (executionId: string) => Promise<void>;
  cancelExecution: (executionId: string) => Promise<void>;
  provideUserInput: (executionId: string, stepId: string, choice: string) => Promise<void>;
  probeDevice: (deviceId: string, deviceInfo: Record<string, string>) => Promise<void>;
  fetchTrialRecords: (limit?: number) => Promise<void>;
  fetchSuccessRates: (workflowId: string) => Promise<void>;
  clearError: () => void;
  clearProbeResult: () => void;
  clearUserPrompt: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflows: [],
  currentWorkflow: null,
  currentExecution: null,
  probeResult: null,
  trialRecords: [],
  successRates: [],
  userPrompt: null,
  isLoading: false,
  error: null,

  fetchWorkflows: async (platform, category) => {
    set({ isLoading: true, error: null });
    try {
      const workflows = await invoke<WorkflowListItem[]>('list_workflows', {
        platform,
        category,
      });
      set({ workflows, isLoading: false });
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },

  fetchWorkflowDetail: async (workflowId: string) => {
    set({ isLoading: true, error: null });
    try {
      const detail = await invoke<WorkflowDetail>('get_workflow_detail', { workflowId });
      set({ currentWorkflow: detail, isLoading: false });
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },

  startExecution: async (workflowId, deviceId, deviceInfo) => {
    set({ isLoading: true, error: null });
    try {
      const executionId = await invoke<string>('start_workflow_execution', {
        workflowId,
        deviceId,
        deviceInfo,
      });
      set({ isLoading: false });
      return executionId;
    } catch (err) {
      set({ error: String(err), isLoading: false });
      throw err;
    }
  },

  getExecutionProgress: async (executionId: string) => {
    try {
      const progress = await invoke<ExecutionProgress>('get_execution_progress', { executionId });
      set({ currentExecution: progress });
      
      if (progress.state === 'waiting_for_user') {
        const step = progress.stepResults.find(s => s.state === 'running' || s.stepId === progress.currentStep);
        if (step && step.output?.startsWith('WAIT_FOR_USER:')) {
          const parts = step.output.split(':');
          const message = parts[1] || '';
          const options = parts[2]?.split('|') || [];
          set({
            userPrompt: {
              executionId,
              stepId: step.stepId,
              message,
              options,
            },
          });
        }
      } else {
        set({ userPrompt: null });
      }
    } catch (err) {
      set({ error: String(err) });
    }
  },

  cancelExecution: async (executionId: string) => {
    try {
      await invoke('cancel_workflow_execution', { executionId });
      set({ currentExecution: null, userPrompt: null });
    } catch (err) {
      set({ error: String(err) });
    }
  },

  provideUserInput: async (executionId, stepId, choice) => {
    set({ isLoading: true, userPrompt: null });
    try {
      await invoke('provide_user_input', { executionId, stepId, userChoice: choice });
      set({ isLoading: false });
      await get().getExecutionProgress(executionId);
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },

  probeDevice: async (deviceId, deviceInfo) => {
    set({ isLoading: true, error: null });
    try {
      const result = await invoke<ProbeResult>('probe_device_for_workflows', {
        deviceId,
        deviceInfo,
      });
      set({ probeResult: result, isLoading: false });
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },

  fetchTrialRecords: async (limit = 50) => {
    try {
      const records = await invoke<TrialRecord[]>('get_trial_records', { limit });
      set({ trialRecords: records });
    } catch (err) {
      set({ error: String(err) });
    }
  },

  fetchSuccessRates: async (workflowId: string) => {
    try {
      const rates = await invoke<SuccessRate[]>('get_workflow_success_rates', { workflowId });
      set({ successRates: rates });
    } catch (err) {
      set({ error: String(err) });
    }
  },

  clearError: () => set({ error: null }),
  clearProbeResult: () => set({ probeResult: null }),
  clearUserPrompt: () => set({ userPrompt: null }),
}));
