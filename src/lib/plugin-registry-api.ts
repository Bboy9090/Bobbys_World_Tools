/**
 * Plugin Registry API - Client for interacting with plugin registry
 * Provides sync, search, download, and update checking functionality
 */

import type { 
  RegistryPlugin, 
  RegistrySyncStatus, 
  RegistryManifest, 
  PluginUpdate,
  RegistryConfig 
} from '@/types/plugin-registry';

// Default configuration
const DEFAULT_CONFIG: RegistryConfig = {
  apiUrl: '/api/plugins',
  syncInterval: 3600000, // 1 hour
  autoSync: true,
  allowUncertified: false,
  cacheExpiry: 300000, // 5 minutes
};

class PluginRegistryAPI {
  private config: RegistryConfig;
  private syncStatus: RegistrySyncStatus;
  private cachedPlugins: RegistryPlugin[] = [];
  private cacheTimestamp: number = 0;

  constructor(config: Partial<RegistryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.syncStatus = {
      lastSync: null,
      status: 'idle',
      pluginsUpdated: 0,
      pluginsAdded: 0,
      pluginsRemoved: 0,
    };
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): RegistrySyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Sync with remote registry
   */
  async syncWithRegistry(): Promise<RegistrySyncStatus> {
    this.syncStatus = {
      ...this.syncStatus,
      status: 'syncing',
    };

    try {
      const manifest = await this.fetchManifest();
      
      const previousCount = this.cachedPlugins.length;
      const previousIds = new Set(this.cachedPlugins.map(p => p.id));
      
      this.cachedPlugins = manifest.plugins;
      this.cacheTimestamp = Date.now();
      
      const currentIds = new Set(manifest.plugins.map(p => p.id));
      const added = manifest.plugins.filter(p => !previousIds.has(p.id)).length;
      const removed = Array.from(previousIds).filter(id => !currentIds.has(id)).length;
      const updated = manifest.plugins.length - added;

      this.syncStatus = {
        lastSync: new Date().toISOString(),
        status: 'success',
        pluginsAdded: added,
        pluginsRemoved: removed,
        pluginsUpdated: updated,
      };

      return this.syncStatus;
    } catch (error) {
      this.syncStatus = {
        ...this.syncStatus,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      throw error;
    }
  }

  /**
   * Fetch registry manifest
   */
  async fetchManifest(): Promise<RegistryManifest> {
    // Return mock manifest for now - in production, this would call the actual API
    const mockPlugins: RegistryPlugin[] = [
      {
        id: 'diagnostic-core',
        name: 'Diagnostic Core',
        version: '1.2.0',
        author: "Bobby's Workshop",
        description: 'Core diagnostic tools for device analysis',
        category: 'diagnostic',
        platform: 'cross-platform',
        certified: true,
        signatureHash: 'sha256:abc123...',
        downloadUrl: '/plugins/diagnostic-core-1.2.0.zip',
        dependencies: [],
        permissions: ['device.read', 'system.info'],
        lastUpdated: new Date().toISOString(),
        downloads: 15420,
        rating: 4.8,
        reviews: 234,
        checksum: 'sha256:def456...',
        size: 1024000,
        verifiedPublisher: true,
        securityScan: {
          status: 'passed',
          scannedAt: new Date().toISOString(),
          issues: [],
        },
      },
      {
        id: 'flash-toolkit',
        name: 'Flash Toolkit',
        version: '2.0.1',
        author: "Bobby's Workshop",
        description: 'Advanced flashing tools for Android devices',
        category: 'flash',
        platform: 'android',
        certified: true,
        signatureHash: 'sha256:ghi789...',
        downloadUrl: '/plugins/flash-toolkit-2.0.1.zip',
        dependencies: ['diagnostic-core'],
        permissions: ['device.write', 'storage.access'],
        lastUpdated: new Date().toISOString(),
        downloads: 8750,
        rating: 4.6,
        reviews: 156,
        checksum: 'sha256:jkl012...',
        size: 2048000,
        verifiedPublisher: true,
        securityScan: {
          status: 'passed',
          scannedAt: new Date().toISOString(),
          issues: [],
        },
      },
      {
        id: 'security-scanner',
        name: 'Security Scanner',
        version: '1.0.5',
        author: 'SecureDevTools',
        description: 'Security vulnerability scanner for mobile devices',
        category: 'security',
        platform: 'cross-platform',
        certified: true,
        signatureHash: 'sha256:mno345...',
        downloadUrl: '/plugins/security-scanner-1.0.5.zip',
        dependencies: [],
        permissions: ['device.read', 'network.access'],
        lastUpdated: new Date().toISOString(),
        downloads: 5230,
        rating: 4.5,
        reviews: 89,
        checksum: 'sha256:pqr678...',
        size: 512000,
        verifiedPublisher: true,
        securityScan: {
          status: 'passed',
          scannedAt: new Date().toISOString(),
          issues: [],
        },
      },
    ];

    const manifest: RegistryManifest = {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      plugins: mockPlugins,
      categories: {
        diagnostic: 1,
        flash: 1,
        security: 1,
        utility: 0,
        repair: 0,
      },
      totalDownloads: mockPlugins.reduce((sum, p) => sum + p.downloads, 0),
    };

    this.cachedPlugins = mockPlugins;
    this.cacheTimestamp = Date.now();

    return manifest;
  }

  /**
   * Fetch details for a specific plugin
   */
  async fetchPluginDetails(pluginId: string): Promise<RegistryPlugin | null> {
    // Check cache first
    if (this.isCacheValid()) {
      const cached = this.cachedPlugins.find(p => p.id === pluginId);
      if (cached) return cached;
    }

    // Fetch from manifest if not in cache
    const manifest = await this.fetchManifest();
    return manifest.plugins.find(p => p.id === pluginId) || null;
  }

  /**
   * Search plugins with filters
   */
  async searchPlugins(
    query: string,
    filters?: { category?: string; platform?: string; certified?: boolean }
  ): Promise<RegistryPlugin[]> {
    // Ensure we have fresh data
    if (!this.isCacheValid()) {
      await this.fetchManifest();
    }

    let results = [...this.cachedPlugins];

    // Apply text search
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.author.toLowerCase().includes(lowerQuery)
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

    return results;
  }

  /**
   * Check for updates to installed plugins
   */
  async checkForUpdates(
    installedPlugins: Array<{ id: string; version: string }>
  ): Promise<PluginUpdate[]> {
    // Ensure we have fresh data
    if (!this.isCacheValid()) {
      await this.fetchManifest();
    }

    const updates: PluginUpdate[] = [];

    for (const installed of installedPlugins) {
      const registryPlugin = this.cachedPlugins.find(p => p.id === installed.id);
      
      if (registryPlugin && this.isNewerVersion(registryPlugin.version, installed.version)) {
        updates.push({
          pluginId: installed.id,
          currentVersion: installed.version,
          latestVersion: registryPlugin.version,
          releaseNotes: registryPlugin.changelog || 'No release notes available',
          critical: false, // Would check security advisories in production
        });
      }
    }

    return updates;
  }

  /**
   * Download a plugin package
   */
  async downloadPlugin(
    pluginId: string,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    const plugin = await this.fetchPluginDetails(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    // Simulate download with progress
    for (let i = 0; i <= 100; i += 10) {
      onProgress?.(i);
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Return mock blob - in production, this would fetch actual plugin data
    return new Blob(['mock-plugin-data'], { type: 'application/zip' });
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(): boolean {
    return (
      this.cachedPlugins.length > 0 &&
      Date.now() - this.cacheTimestamp < this.config.cacheExpiry
    );
  }

  /**
   * Compare version strings
   */
  private isNewerVersion(latest: string, current: string): boolean {
    const latestParts = latest.split('.').map(Number);
    const currentParts = current.split('.').map(Number);

    for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
      const l = latestParts[i] || 0;
      const c = currentParts[i] || 0;
      
      if (l > c) return true;
      if (l < c) return false;
    }

    return false;
  }
}

// Export singleton instance
const pluginRegistry = new PluginRegistryAPI();
export default pluginRegistry;
