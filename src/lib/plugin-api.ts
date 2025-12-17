// Plugin API - Generic plugin management API
// Handles plugin lifecycle, permissions, and execution

import type { PluginManifest, PluginResult, PluginContext } from '@/types/plugin-sdk';

export interface InstalledPlugin {
  manifest: PluginManifest;
  installedAt: number;
  enabled: boolean;
  lastUsed?: number;
}

export interface PluginAPI {
  listInstalled(): Promise<InstalledPlugin[]>;
  install(pluginId: string): Promise<boolean>;
  uninstall(pluginId: string): Promise<boolean>;
  enable(pluginId: string): Promise<boolean>;
  disable(pluginId: string): Promise<boolean>;
  execute<T>(pluginId: string, operation: string, params: Record<string, any>): Promise<PluginResult<T>>;
  getManifest(pluginId: string): Promise<PluginManifest | null>;
  checkPermissions(pluginId: string): Promise<string[]>;
  requestPermission(pluginId: string, permission: string): Promise<boolean>;
}

// In-memory storage for development
const installedPlugins: Map<string, InstalledPlugin> = new Map();

export const pluginAPI: PluginAPI = {
  async listInstalled(): Promise<InstalledPlugin[]> {
    return Array.from(installedPlugins.values());
  },

  async install(pluginId: string): Promise<boolean> {
    // In production, this would download and install the plugin
    const mockManifest: PluginManifest = {
      id: pluginId,
      name: pluginId.split('.').pop() || pluginId,
      version: '1.0.0',
      author: 'Bobby\'s Workshop',
      description: 'Installed plugin',
      category: 'utility',
      capabilities: ['diagnostics'],
      riskLevel: 'safe',
      requiredPermissions: ['device:read'],
      supportedPlatforms: ['android', 'ios'],
      minimumSDKVersion: '1.0.0',
      entryPoint: `${pluginId}.ts`,
      license: 'MIT'
    };

    installedPlugins.set(pluginId, {
      manifest: mockManifest,
      installedAt: Date.now(),
      enabled: true
    });

    return true;
  },

  async uninstall(pluginId: string): Promise<boolean> {
    return installedPlugins.delete(pluginId);
  },

  async enable(pluginId: string): Promise<boolean> {
    const plugin = installedPlugins.get(pluginId);
    if (plugin) {
      plugin.enabled = true;
      return true;
    }
    return false;
  },

  async disable(pluginId: string): Promise<boolean> {
    const plugin = installedPlugins.get(pluginId);
    if (plugin) {
      plugin.enabled = false;
      return true;
    }
    return false;
  },

  async execute<T>(
    pluginId: string, 
    operation: string, 
    params: Record<string, any>
  ): Promise<PluginResult<T>> {
    const plugin = installedPlugins.get(pluginId);
    
    if (!plugin) {
      return { success: false, error: 'Plugin not installed' };
    }
    
    if (!plugin.enabled) {
      return { success: false, error: 'Plugin is disabled' };
    }

    plugin.lastUsed = Date.now();

    // In production, this would actually execute the plugin
    return { 
      success: true, 
      message: `Executed ${operation} on ${pluginId}`,
      data: {} as T
    };
  },

  async getManifest(pluginId: string): Promise<PluginManifest | null> {
    const plugin = installedPlugins.get(pluginId);
    return plugin?.manifest || null;
  },

  async checkPermissions(pluginId: string): Promise<string[]> {
    const plugin = installedPlugins.get(pluginId);
    return plugin?.manifest.requiredPermissions || [];
  },

  async requestPermission(pluginId: string, permission: string): Promise<boolean> {
    // In production, this would prompt the user
    return true;
  }
};
