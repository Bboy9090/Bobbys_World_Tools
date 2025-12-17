/**
 * Plugin API - Client for plugin installation, updates, and management
 * Provides download, install, uninstall, and update functionality
 */

import type { Plugin, InstalledPlugin } from '@/types/plugin';

// Download progress tracking
export interface PluginDownloadProgress {
  pluginId: string;
  status: 'pending' | 'downloading' | 'installing' | 'complete' | 'error';
  progress: number;
  bytesDownloaded: number;
  totalBytes: number;
  speed: number;
  error?: string;
}

// Installation result
export interface PluginInstallResult {
  success: boolean;
  pluginId: string;
  version: string;
  message?: string;
  error?: string;
  warnings?: string[];
}

class PluginAPI {
  private installedPlugins: Map<string, InstalledPlugin> = new Map();
  private downloadProgress: Map<string, PluginDownloadProgress> = new Map();
  private listeners: Map<string, Set<(progress: PluginDownloadProgress) => void>> = new Map();

  constructor() {
    this.loadInstalledPlugins();
  }

  private loadInstalledPlugins(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('bobbys-workshop-installed-plugins');
      if (stored) {
        const plugins = JSON.parse(stored);
        for (const plugin of plugins) {
          this.installedPlugins.set(plugin.id, plugin);
        }
      }
    } catch (error) {
      console.error('Failed to load installed plugins:', error);
    }
  }

  private saveInstalledPlugins(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const plugins = Array.from(this.installedPlugins.values());
      localStorage.setItem('bobbys-workshop-installed-plugins', JSON.stringify(plugins));
    } catch (error) {
      console.error('Failed to save installed plugins:', error);
    }
  }

  /**
   * Get all installed plugins
   */
  getInstalledPlugins(): InstalledPlugin[] {
    return Array.from(this.installedPlugins.values());
  }

  /**
   * Check if a plugin is installed
   */
  isInstalled(pluginId: string): boolean {
    return this.installedPlugins.has(pluginId);
  }

  /**
   * Get installed plugin by ID
   */
  getInstalledPlugin(pluginId: string): InstalledPlugin | undefined {
    return this.installedPlugins.get(pluginId);
  }

  /**
   * Download and install a plugin
   */
  async installPlugin(
    plugin: Plugin,
    onProgress?: (progress: PluginDownloadProgress) => void
  ): Promise<PluginInstallResult> {
    const pluginId = plugin.id;
    
    // Initialize progress
    const progress: PluginDownloadProgress = {
      pluginId,
      status: 'pending',
      progress: 0,
      bytesDownloaded: 0,
      totalBytes: plugin.currentVersion.size,
      speed: 0,
    };

    this.downloadProgress.set(pluginId, progress);
    this.notifyProgress(pluginId, progress);
    onProgress?.(progress);

    try {
      // Simulate download
      progress.status = 'downloading';
      const totalBytes = plugin.currentVersion.size;
      
      for (let downloaded = 0; downloaded <= totalBytes; downloaded += totalBytes / 10) {
        progress.bytesDownloaded = downloaded;
        progress.progress = Math.round((downloaded / totalBytes) * 100);
        progress.speed = 1024 * 1024 * (2 + Math.random() * 3); // 2-5 MB/s
        
        this.notifyProgress(pluginId, { ...progress });
        onProgress?.({ ...progress });
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Simulate installation
      progress.status = 'installing';
      progress.progress = 100;
      this.notifyProgress(pluginId, { ...progress });
      onProgress?.({ ...progress });
      
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create installed plugin entry
      const installedPlugin: InstalledPlugin = {
        ...plugin,
        installedAt: Date.now(),
        installedVersion: plugin.currentVersion.version,
        enabled: true,
        updateAvailable: false,
      };

      this.installedPlugins.set(pluginId, installedPlugin);
      this.saveInstalledPlugins();

      // Complete
      progress.status = 'complete';
      this.notifyProgress(pluginId, { ...progress });
      onProgress?.({ ...progress });

      return {
        success: true,
        pluginId,
        version: plugin.currentVersion.version,
        message: `Successfully installed ${plugin.name} v${plugin.currentVersion.version}`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      progress.status = 'error';
      progress.error = errorMessage;
      this.notifyProgress(pluginId, { ...progress });
      onProgress?.({ ...progress });

      return {
        success: false,
        pluginId,
        version: plugin.currentVersion.version,
        error: errorMessage,
      };
    } finally {
      this.downloadProgress.delete(pluginId);
    }
  }

  /**
   * Uninstall a plugin
   */
  async uninstallPlugin(pluginId: string): Promise<PluginInstallResult> {
    const installed = this.installedPlugins.get(pluginId);
    
    if (!installed) {
      return {
        success: false,
        pluginId,
        version: '',
        error: 'Plugin is not installed',
      };
    }

    try {
      // Simulate uninstallation
      await new Promise(resolve => setTimeout(resolve, 300));

      this.installedPlugins.delete(pluginId);
      this.saveInstalledPlugins();

      return {
        success: true,
        pluginId,
        version: installed.installedVersion,
        message: `Successfully uninstalled ${installed.name}`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        pluginId,
        version: installed.installedVersion,
        error: errorMessage,
      };
    }
  }

  /**
   * Update a plugin to the latest version
   */
  async updatePlugin(
    plugin: Plugin,
    onProgress?: (progress: PluginDownloadProgress) => void
  ): Promise<PluginInstallResult> {
    const installed = this.installedPlugins.get(plugin.id);
    
    if (!installed) {
      return {
        success: false,
        pluginId: plugin.id,
        version: plugin.currentVersion.version,
        error: 'Plugin is not installed',
      };
    }

    // Uninstall old version
    await this.uninstallPlugin(plugin.id);
    
    // Install new version
    return await this.installPlugin(plugin, onProgress);
  }

  /**
   * Enable or disable a plugin
   */
  async setPluginEnabled(pluginId: string, enabled: boolean): Promise<boolean> {
    const installed = this.installedPlugins.get(pluginId);
    
    if (!installed) {
      return false;
    }

    installed.enabled = enabled;
    this.saveInstalledPlugins();
    return true;
  }

  /**
   * Get download progress for a plugin
   */
  getDownloadProgress(pluginId: string): PluginDownloadProgress | undefined {
    return this.downloadProgress.get(pluginId);
  }

  /**
   * Subscribe to download progress updates
   */
  onProgressUpdate(
    pluginId: string,
    callback: (progress: PluginDownloadProgress) => void
  ): () => void {
    if (!this.listeners.has(pluginId)) {
      this.listeners.set(pluginId, new Set());
    }
    
    this.listeners.get(pluginId)!.add(callback);
    
    return () => {
      this.listeners.get(pluginId)?.delete(callback);
    };
  }

  private notifyProgress(pluginId: string, progress: PluginDownloadProgress): void {
    const callbacks = this.listeners.get(pluginId);
    if (callbacks) {
      for (const callback of callbacks) {
        callback(progress);
      }
    }
  }

  /**
   * Search for plugins (mock implementation)
   */
  async searchPlugins(query: string, filters?: Record<string, any>): Promise<Plugin[]> {
    // In production, this would call the actual API
    return [];
  }

  /**
   * Get plugin details
   */
  async getPluginDetails(pluginId: string): Promise<Plugin | null> {
    // In production, this would call the actual API
    return null;
  }

  /**
   * Check for available updates
   */
  async checkForUpdates(): Promise<Array<{ pluginId: string; currentVersion: string; latestVersion: string }>> {
    const updates: Array<{ pluginId: string; currentVersion: string; latestVersion: string }> = [];
    
    // In production, this would check against the plugin registry
    for (const [pluginId, installed] of this.installedPlugins) {
      // Simulate update check - in real implementation, compare with registry
      if (Math.random() > 0.8) {
        const [major, minor, patch] = installed.installedVersion.split('.').map(Number);
        updates.push({
          pluginId,
          currentVersion: installed.installedVersion,
          latestVersion: `${major}.${minor}.${patch + 1}`,
        });
      }
    }

    return updates;
  }
}

// Export singleton instance
export const pluginAPI = new PluginAPI();
