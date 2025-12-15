/**
 * Arsenal API Client
 * Provides type-safe API calls to the backend
 */

import type {
  ConnectedDevicesResponse,
  DiagnosticRunRequest,
  DiagnosticRunResponse,
  DeploymentRequest,
  DeploymentResponse,
  DeploymentStatus,
  ApiResponse
} from '@pandora-codex/shared-types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ArsenalApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse<T> = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Request failed');
      }

      return data.data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
    }
  }

  // Devices API
  async getConnectedDevices(): Promise<ConnectedDevicesResponse> {
    return this.request<ConnectedDevicesResponse>('/api/devices/connected');
  }

  async refreshDevices(): Promise<{ message: string; devicesFound: number }> {
    return this.request('/api/devices/refresh', {
      method: 'POST',
    });
  }

  // Diagnostics API
  async runDiagnostics(
    deviceId: string,
    tests?: string[]
  ): Promise<DiagnosticRunResponse> {
    const body: DiagnosticRunRequest = { deviceId, tests };
    return this.request<DiagnosticRunResponse>('/api/diagnostics/run', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getDiagnosticStatus(runId: string): Promise<DiagnosticRunResponse> {
    return this.request<DiagnosticRunResponse>(`/api/diagnostics/status/${runId}`);
  }

  async listDiagnosticRuns(): Promise<DiagnosticRunResponse[]> {
    return this.request<DiagnosticRunResponse[]>('/api/diagnostics/runs');
  }

  // Deployment API
  async startDeployment(
    request: DeploymentRequest
  ): Promise<DeploymentResponse> {
    return this.request<DeploymentResponse>('/api/deployment/start', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getDeploymentStatus(id: string): Promise<DeploymentStatus> {
    return this.request<DeploymentStatus>(`/api/deployment/status/${id}`);
  }

  async cancelDeployment(id: string): Promise<DeploymentStatus> {
    return this.request<DeploymentStatus>(`/api/deployment/cancel/${id}`, {
      method: 'POST',
    });
  }

  async listDeployments(): Promise<DeploymentStatus[]> {
    return this.request<DeploymentStatus[]>('/api/deployment/list');
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    return this.request('/health');
  }
}

// Export singleton instance
export const arsenalApi = new ArsenalApiClient();

// Export class for testing
export { ArsenalApiClient };
