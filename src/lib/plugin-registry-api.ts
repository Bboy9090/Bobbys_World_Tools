// Plugin Registry API - Client for Bobby's World plugin registry
// Handles plugin discovery, download, updates, and synchronization

import type { 
  RegistryPlugin, 
  RegistrySyncStatus, 
  RegistryManifest, 
  PluginUpdate,
  RegistryConfig 
} from '@/types/plugin-registry';

const DEFAULT_CONFIG: RegistryConfig = {
  apiUrl: 'http://localhost:3001/api/plugins',
  syncInterval: 3600000, // 1 hour
  autoSync: true,
  allowUncertified: false,
  cacheExpiry: 300000 // 5 minutes
};

interface PluginRegistryAPI {
  config: RegistryConfig;
  getSyncStatus(): RegistrySyncStatus;
  syncWithRegistry(): Promise<RegistrySyncStatus>;
  fetchManifest(): Promise<RegistryManifest>;
  fetchPluginDetails(pluginId: string): Promise<RegistryPlugin | null>;
  searchPlugins(query: string, filters?: { category?: string; platform?: string; certified?: boolean }): Promise<RegistryPlugin[]>;
  checkForUpdates(installedPlugins: Array<{ id: string; version: string }>): Promise<PluginUpdate[]>;
  downloadPlugin(pluginId: string, onProgress?: (progress: number) => void): Promise<Blob>;
  verifyPluginSignature(pluginId: string, signatureHash: string): Promise<boolean>;
  getDependencies(pluginId: string): Promise<RegistryPlugin[]>;
}

// In-memory cache for plugin data
const pluginCache: Map<string, { data: RegistryPlugin; timestamp: number }> = new Map();
let manifestCache: { data: RegistryManifest | null; timestamp: number } = { data: null, timestamp: 0 };
let currentSyncStatus: RegistrySyncStatus = {
  lastSync: null,
  status: 'idle',
  pluginsUpdated: 0,
  pluginsAdded: 0,
  pluginsRemoved: 0
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    const detail = body ? ` - ${body.slice(0, 300)}` : '';
    throw new Error(`Request failed (${response.status}) ${response.statusText}${detail}`);
  }
  return (await response.json()) as T;
}

const pluginRegistry: PluginRegistryAPI = {
  config: { ...DEFAULT_CONFIG },

  getSyncStatus(): RegistrySyncStatus {
    return { ...currentSyncStatus };
  },

  async syncWithRegistry(): Promise<RegistrySyncStatus> {
    currentSyncStatus = { ...currentSyncStatus, status: 'syncing' };

    try {
      const manifest = await this.fetchManifest();
      
      currentSyncStatus = {
        lastSync: new Date().toISOString(),
        status: 'success',
        pluginsUpdated: 0,
        pluginsAdded: manifest.plugins.length,
        pluginsRemoved: 0
      };

      return currentSyncStatus;
    } catch (error) {
      currentSyncStatus = {
        ...currentSyncStatus,
        status: 'error',
        error: error instanceof Error ? error.message : 'Sync failed'
      };
      throw error;
    }
  },

  async fetchManifest(): Promise<RegistryManifest> {
    const now = Date.now();
    
    // Return cached manifest if still valid
    if (manifestCache.data && (now - manifestCache.timestamp) < this.config.cacheExpiry) {
      return manifestCache.data;
    }

    try {
      const manifest = await fetchJson<RegistryManifest>(`${this.config.apiUrl}/manifest`);
      manifestCache = { data: manifest, timestamp: now };
      return manifest;
    } catch (error) {
      console.error('[PluginRegistry] Failed to fetch manifest:', error);
      throw error;
    }
  },

  async fetchPluginDetails(pluginId: string): Promise<RegistryPlugin | null> {
    const now = Date.now();
    const cached = pluginCache.get(pluginId);
    
    if (cached && (now - cached.timestamp) < this.config.cacheExpiry) {
      return cached.data;
    }

    try {
      const plugin = await fetchJson<RegistryPlugin>(`${this.config.apiUrl}/plugins/${encodeURIComponent(pluginId)}`);
      pluginCache.set(pluginId, { data: plugin, timestamp: now });
      return plugin;
    } catch (error) {
      // If backend returns 404, treat as not found (not an exception for the UI).
      if (error instanceof Error && /\(404\)/.test(error.message)) {
        return null;
      }
      console.error(`[PluginRegistry] Failed to fetch plugin ${pluginId}:`, error);
      throw error;
    }
  },

  async searchPlugins(
    query: string, 
    filters?: { category?: string; platform?: string; certified?: boolean }
  ): Promise<RegistryPlugin[]> {
    const manifest = await this.fetchManifest();
    
    let results = manifest.plugins;

    // Text search
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.id.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply filters
    if (filters) {
      if (filters.category) {
        results = results.filter(p => p.category === filters.category);
      }
      if (filters.platform) {
        results = results.filter(p => 
          p.platform === filters.platform || p.platform === 'cross-platform'
        );
      }
      if (filters.certified !== undefined) {
        results = results.filter(p => p.certified === filters.certified);
      }
    }

    // Filter uncertified if not allowed
    if (!this.config.allowUncertified) {
      results = results.filter(p => p.certified);
    }

    return results;
  },

  async checkForUpdates(
    installedPlugins: Array<{ id: string; version: string }>
  ): Promise<PluginUpdate[]> {
    const updates: PluginUpdate[] = [];
    const manifest = await this.fetchManifest();

    for (const installed of installedPlugins) {
      const registryPlugin = manifest.plugins.find(p => p.id === installed.id);
      
      if (registryPlugin && registryPlugin.version !== installed.version) {
        // Simple version comparison - in production use semver
        const isNewer = registryPlugin.version > installed.version;
        
        if (isNewer) {
          updates.push({
            pluginId: installed.id,
            currentVersion: installed.version,
            latestVersion: registryPlugin.version,
            releaseNotes: registryPlugin.changelog || 'No release notes available',
            critical: false
          });
        }
      }
    }

    return updates;
  },

  async downloadPlugin(
    pluginId: string, 
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    const plugin = await this.fetchPluginDetails(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    onProgress?.(0);

    const downloadUrl = (() => {
      try {
        return new URL(plugin.downloadUrl).toString();
      } catch {
        return new URL(plugin.downloadUrl, `${this.config.apiUrl}/`).toString();
      }
    })();

    const response = await fetch(downloadUrl);
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      const detail = body ? ` - ${body.slice(0, 300)}` : '';
      throw new Error(`Download failed (${response.status}) ${response.statusText}${detail}`);
    }

    const totalBytesHeader = response.headers.get('content-length');
    const totalBytes = totalBytesHeader ? Number(totalBytesHeader) : undefined;
    const bodyStream = response.body;

    if (!bodyStream || !totalBytes || Number.isNaN(totalBytes)) {
      const blob = await response.blob();
      onProgress?.(100);
      return blob;
    }

    const reader = bodyStream.getReader();
    const chunks: Uint8Array[] = [];
    let bytesRead = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        bytesRead += value.byteLength;
        onProgress?.(Math.min(100, (bytesRead / totalBytes) * 100));
      }
    }

    onProgress?.(100);
    return new Blob(chunks, { type: 'application/zip' });
  },

  async verifyPluginSignature(pluginId: string, signatureHash: string): Promise<boolean> {
    // Cryptographic verification must be done by the registry/backend.
    const url = `${this.config.apiUrl}/plugins/${encodeURIComponent(pluginId)}/verify?signatureHash=${encodeURIComponent(signatureHash)}`;
    const result = await fetchJson<{ valid: boolean }>(url);
    return result.valid;
  },

  async getDependencies(pluginId: string): Promise<RegistryPlugin[]> {
    const plugin = await this.fetchPluginDetails(pluginId);
    
    if (!plugin || plugin.dependencies.length === 0) {
      return [];
    }

    const dependencies: RegistryPlugin[] = [];
    
    for (const depId of plugin.dependencies) {
      const dep = await this.fetchPluginDetails(depId);
      if (dep) {
        dependencies.push(dep);
      }
    }

    return dependencies;
  }
};

export default pluginRegistry;
