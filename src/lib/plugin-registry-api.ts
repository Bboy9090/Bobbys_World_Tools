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

// Mock registry data for development/testing
const mockPlugins: RegistryPlugin[] = [
  {
    id: 'bobby.diagnostics.battery-health',
    name: 'Battery Health Analyzer',
    version: '1.0.0',
    author: 'Bobby\'s Workshop',
    description: 'Comprehensive battery health analysis for Android and iOS devices',
    category: 'diagnostic',
    platform: 'cross-platform',
    certified: true,
    signatureHash: 'sha256:abc123...',
    downloadUrl: '/plugins/battery-health-1.0.0.zip',
    dependencies: [],
    permissions: ['diagnostics:read', 'device:read'],
    lastUpdated: new Date().toISOString(),
    downloads: 15420,
    rating: 4.8,
    reviews: 342,
    checksum: 'sha256:def456...',
    size: 45678,
    verifiedPublisher: true,
    securityScan: {
      status: 'passed',
      scannedAt: new Date().toISOString(),
      issues: []
    }
  },
  {
    id: 'bobby.diagnostics.storage-analyzer',
    name: 'Storage Health Analyzer',
    version: '1.0.0',
    author: 'Bobby\'s Workshop',
    description: 'Comprehensive storage health analysis with wear level detection',
    category: 'diagnostic',
    platform: 'cross-platform',
    certified: true,
    signatureHash: 'sha256:ghi789...',
    downloadUrl: '/plugins/storage-analyzer-1.0.0.zip',
    dependencies: [],
    permissions: ['diagnostics:read', 'device:read'],
    lastUpdated: new Date().toISOString(),
    downloads: 12350,
    rating: 4.7,
    reviews: 287,
    checksum: 'sha256:jkl012...',
    size: 52340,
    verifiedPublisher: true,
    securityScan: {
      status: 'passed',
      scannedAt: new Date().toISOString(),
      issues: []
    }
  },
  {
    id: 'bobby.diagnostics.thermal-monitor',
    name: 'Thermal Monitor',
    version: '1.0.0',
    author: 'Bobby\'s Workshop',
    description: 'Real-time thermal monitoring and health analysis for mobile devices',
    category: 'diagnostic',
    platform: 'cross-platform',
    certified: true,
    signatureHash: 'sha256:mno345...',
    downloadUrl: '/plugins/thermal-monitor-1.0.0.zip',
    dependencies: [],
    permissions: ['diagnostics:read', 'device:read'],
    lastUpdated: new Date().toISOString(),
    downloads: 8920,
    rating: 4.6,
    reviews: 198,
    checksum: 'sha256:pqr678...',
    size: 38900,
    verifiedPublisher: true,
    securityScan: {
      status: 'passed',
      scannedAt: new Date().toISOString(),
      issues: []
    }
  }
];

const pluginRegistry: PluginRegistryAPI = {
  config: { ...DEFAULT_CONFIG },

  getSyncStatus(): RegistrySyncStatus {
    return { ...currentSyncStatus };
  },

  async syncWithRegistry(): Promise<RegistrySyncStatus> {
    currentSyncStatus = { ...currentSyncStatus, status: 'syncing' };

    try {
      // In production, this would fetch from the actual registry API
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

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
      // In production, fetch from API
      // const response = await fetch(`${this.config.apiUrl}/manifest`);
      // const data = await response.json();

      // For development, use mock data
      const manifest: RegistryManifest = {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        plugins: mockPlugins,
        categories: {
          diagnostic: mockPlugins.filter(p => p.category === 'diagnostic').length,
          flash: 0,
          utility: 0,
          security: 0,
          repair: 0
        },
        totalDownloads: mockPlugins.reduce((sum, p) => sum + p.downloads, 0)
      };

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
      // In production, fetch from API
      // const response = await fetch(`${this.config.apiUrl}/plugins/${pluginId}`);
      // const data = await response.json();

      // For development, find in mock data
      const plugin = mockPlugins.find(p => p.id === pluginId) || null;
      
      if (plugin) {
        pluginCache.set(pluginId, { data: plugin, timestamp: now });
      }

      return plugin;
    } catch (error) {
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

    // Simulate download progress
    for (let i = 0; i <= 100; i += 10) {
      onProgress?.(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // In production, this would actually download the plugin
    // const response = await fetch(plugin.downloadUrl);
    // return await response.blob();

    // For development, return empty blob
    return new Blob(['mock plugin content'], { type: 'application/zip' });
  },

  async verifyPluginSignature(pluginId: string, signatureHash: string): Promise<boolean> {
    const plugin = await this.fetchPluginDetails(pluginId);
    
    if (!plugin) {
      return false;
    }

    // In production, this would verify the cryptographic signature
    return plugin.signatureHash === signatureHash;
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
