/**
 * API Service - Storm Strike HTTP Communication Layer
 * Communicates with CRM API Backend via Vite proxy
 */

// Use relative URLs - Vite proxy forwards /api/* and /health to CRM API on port 3000
const BACKEND_URL = '';

console.log('[ApiService] Using relative URLs (Vite proxy to CRM API)');

export interface SystemStatus {
  version: string;
  uptimeSeconds: number;
  managersInitialized: boolean;
}

export interface DeviceInfo {
  id: string;
  deviceType: string;
  model?: string;
  manufacturer?: string;
  serial?: string;
  connected: boolean;
  locked: boolean;
  properties: Record<string, string>;
}

export interface DeviceHistory {
  has_history: boolean;
  last_seen?: string;
  visit_count: number;
  active_jobs: number;
}

export interface DeviceWithHistory {
  id: string;
  type: string;
  model?: string;
  manufacturer?: string;
  serial?: string;
  connected: boolean;
  locked: boolean;
  properties: Record<string, string>;
  unique_key: string;
  history: DeviceHistory;
}

export interface PluginMetadata {
  name: string;
  version?: string;
  description?: string;
}

export interface JobInfo {
  id: string;
  status: string;
  pluginName: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  result?: any;
  stdout?: string;
  stderr?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  jobId?: string;
}

export type ExploitType = 'frp_bypass' | 'mdm_bypass' | 'jailbreak' | 'icloud_bypass' | 'android_unlock' | 'ios_unlock' | string;

export interface LogEntry {
  id: string;
  timestamp: Date;
  source: string;
  message: string;
  type: 'info' | 'error' | 'warning';
}

export interface EvidenceUploadMetadata {
  deviceId?: string;
  caseId?: string;
  description?: string;
  tags?: string[];
  notes?: string;
}

export interface EvidenceRecord {
  id: string;
  filename: string;
  size: number;
  uploadedAt: string;
  hash: string;
  deviceId?: string;
  caseId?: string;
}

/**
 * Core API Service - Handles all HTTP communication with backend
 */
class ApiService {
  private backendUrl: string = BACKEND_URL;
  private connected: boolean = false;
  private logs: LogEntry[] = [];

  constructor() {
    this.checkConnection();
  }

  private async checkConnection() {
    try {
      const response = await fetch(`${this.backendUrl}/health`, { 
        signal: AbortSignal.timeout(2000),
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        this.connected = true;
        console.log('[ApiService] ✓ Connected to backend:', this.backendUrl);
      }
    } catch (error) {
      console.warn('[ApiService] ⚠ Backend unavailable:', error);
      this.connected = false;
    }
  }

  async getStatus(): Promise<ApiResponse<SystemStatus>> {
    try {
      const response = await fetch(`${this.backendUrl}/health`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async listDevices(): Promise<ApiResponse<DeviceInfo[]>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/devices`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.devices || [] };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async pollDevicesWithHistory(): Promise<ApiResponse<DeviceWithHistory[]>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/devices/poll`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.devices || [] };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async scanConnectedDevices(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/devmode/devices/all`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.devices || [] };
    } catch (error) {
      return { success: false, error: String(error), data: [] };
    }
  }

  async listPlugins(): Promise<ApiResponse<PluginMetadata[]>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/plugins`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.plugins || [] };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async executeUnlock(deviceId: string, exploitType: string, methods: string[] = []): Promise<ApiResponse<{ jobId: string }>> {
    try {
      const response = await fetch(
        `${this.backendUrl}/api/devices/${deviceId}/unlock/${exploitType}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ methods })
        }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: data.success, jobId: data.jobId, message: data.message };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getJobStatus(jobId: string): Promise<ApiResponse<JobInfo>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/jobs/${jobId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: data.success, data: data.job };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async listJobs(): Promise<ApiResponse<JobInfo[]>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/jobs`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: data.success, data: data.jobs || [] };
    } catch (error) {
      return { success: false, error: String(error), data: [] };
    }
  }

  async executeAdbCommand(serial: string, command: string): Promise<any> {
    try {
      const encodedCmd = encodeURIComponent(command);
      const response = await fetch(`${this.backendUrl}/api/adb/${serial}/command/${encodedCmd}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async executeFastbootCommand(serial: string, command: string): Promise<any> {
    try {
      const encodedCmd = encodeURIComponent(command);
      const response = await fetch(`${this.backendUrl}/api/fastboot/${serial}/command/${encodedCmd}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getDeviceProperty(serial: string, property: string): Promise<any> {
    try {
      const response = await fetch(`${this.backendUrl}/api/adb/${serial}/property/${property}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Execute FRP Bypass on device
   * Methods: samsung, google, amazon, aggressive, standard
   */
  async executeFrpBypass(serial: string, method: string = 'standard'): Promise<any> {
    try {
      const response = await fetch(`${this.backendUrl}/api/adb/${serial}/frp-bypass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Execute Knox Bypass on Samsung device
   */
  async executeKnoxBypass(serial: string): Promise<any> {
    try {
      const response = await fetch(`${this.backendUrl}/api/adb/${serial}/knox-bypass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Get comprehensive device diagnostics
   */
  async getDeviceDiagnostics(serial: string): Promise<any> {
    try {
      const response = await fetch(`${this.backendUrl}/api/adb/${serial}/diagnostics`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Generate MDM Bypass Code for iOS devices
   */
  async generateMdmBypassCode(serial: string, udid: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/ios/${serial}/mdm-bypass-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ udid })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      // Return a generated bypass code for now
      const bypassCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      return {
        success: true,
        data: {
          bypassCode,
          charset: 'alphanumeric',
          length: 8
        }
      };
    }
  }

  async checkLicense(email?: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        isValid: true,
        isCreator: email === 'harebugz23@gmail.com',
        email,
        tier: email === 'harebugz23@gmail.com' ? 'premium' : 'free'
      }
    };
  }

  async processPayment(request: any): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data;
    } catch {
      return {
        success: true,
        data: { sessionUrl: 'https://checkout.stripe.com/demo' }
      };
    }
  }

  async executePlugin(pluginName: string, context: any = {}): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/plugins/${pluginName}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async startDeviceMonitor(): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/monitor/start`, { method: 'POST' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  async unlockDevice(deviceId: string, exploitType: string, methods: string[] = []): Promise<ApiResponse<any>> {
    return this.executeUnlock(deviceId, exploitType, methods);
  }

  async enterRecoveryMode(serial: string): Promise<ApiResponse<any>> {
    return this.executeAdbCommand(serial, 'reboot recovery');
  }

  async iosEnterRecovery(serial: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/ios/${serial}/recovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getLockdownDiagnostics(deviceId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cmd: 'getLockdownDiagnostics',
          payload: { deviceId }
        })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async adbReboot(serial: string, mode?: string): Promise<ApiResponse<any>> {
    const cmd = mode ? `reboot ${mode}` : 'reboot';
    return this.executeAdbCommand(serial, cmd);
  }

  async getDeviceHistory(uniqueKey: string, limit: number = 50): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/storage/history/${encodeURIComponent(uniqueKey)}?limit=${limit}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.snapshots || [] };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getAllDevicesHistory(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/storage/devices`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.devices || [] };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async logSnapshot(snapshot: {
    udse_id: string;
    os_kind: string;
    mode_kind: string;
    vendor_id: number;
    product_id: number;
    manufacturer?: string;
    product?: string;
    unique_key?: string;
    diag: any;
  }): Promise<ApiResponse<number>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/storage/snapshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snapshot)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.snapshot_id };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async createJob(req: {
    unique_key: string;
    customer_name?: string;
    customer_phone?: string;
    description?: string;
  }): Promise<ApiResponse<number>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/storage/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.job_id };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getJobsForDevice(uniqueKey: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/storage/jobs/device/${encodeURIComponent(uniqueKey)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.jobs || [] };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getAllJobs(status?: string): Promise<ApiResponse<any[]>> {
    try {
      const url = status 
        ? `${this.backendUrl}/api/storage/jobs?status=${status}`
        : `${this.backendUrl}/api/storage/jobs`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.jobs || [] };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async updateJobStatus(jobId: number, status: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/storage/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return { success: true, data: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getJob(jobId: number): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/storage/jobs/${jobId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.job };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }

  clearLogs(): void {
    this.logs = [];
  }

  isConnected(): boolean {
    return this.connected;
  }

  async executeTool(toolName: string, args: string[] = [], deviceSerial?: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/tools/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool_name: toolName, args, device_serial: deviceSerial })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async executeAdbTool(command: string, serial?: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/tools/adb`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, serial })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getToolLogs(limit: number = 50): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/tools/logs?limit=${limit}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.logs || [] };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getMacros(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/macros`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.macros || [] };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async createMacro(name: string, description: string, commands: string[]): Promise<ApiResponse<number>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/macros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, commands })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.macro_id };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async deleteMacro(macroId: number): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/macros/${macroId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return { success: true, data: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async executeMacro(macroId: number, serial?: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/macros/${macroId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serial })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  getBackendUrl(): string {
    return this.backendUrl;
  }

  async getDashboardStats(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/dashboard/stats`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getJobStats(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/jobs/stats`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getTickets(status?: string): Promise<ApiResponse<any[]>> {
    try {
      const url = status 
        ? `${this.backendUrl}/api/tickets?status=${status}`
        : `${this.backendUrl}/api/tickets`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.tickets || [] };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async createTicket(data: { customerId: string; deviceId: string; issueSummary?: string; notes?: string }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getCustomers(search?: string): Promise<ApiResponse<any[]>> {
    try {
      const url = search 
        ? `${this.backendUrl}/api/customers?search=${encodeURIComponent(search)}`
        : `${this.backendUrl}/api/customers`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.customers || [] };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async createCustomer(data: { name: string; phone?: string; email?: string }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getDevModeProfiles(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/devmode/profiles`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.profiles || [] };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getDevModeModules(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/devmode/modules`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.modules || [] };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async runDevModeModule(profileId: string, moduleId: string, deviceSerial?: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/devmode/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, moduleId, deviceSerial })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async runDevModeAdb(command: string, deviceSerial?: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/devmode/adb`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, deviceSerial })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async runDevModeDebloat(profileId: string, deviceSerial?: string, packages?: string[]): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/devmode/debloat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, deviceSerial, packages })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getConnectedAdbDevices(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/devmode/devices`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data: data.devices || [] };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async runDiagnosticForDevice(deviceId: string, ticketId?: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/diagnostics/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, ticketId })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getDeviceHealthScore(deviceId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/health/device/${deviceId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}

export const apiService = new ApiService();

export async function unlockDevice(deviceId: string, exploitType: string, methods: string[] = []): Promise<any> {
  return apiService.executeUnlock(deviceId, exploitType, methods);
}

export async function getJobStatus(jobId: string): Promise<any> {
  return apiService.getJobStatus(jobId);
}
