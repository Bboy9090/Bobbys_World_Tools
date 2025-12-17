/**
 * Plugin API - Stub implementation
 * 
 * This file provides a stub API for plugin operations.
 * In production, this should connect to the real backend API.
 */

import type { Plugin, PluginSearchFilters, InstalledPlugin } from '@/types/plugin';

export interface PluginDownloadProgress {
  pluginId: string;
  progress: number;
  status: 'downloading' | 'installing' | 'completed' | 'failed';
  message?: string;
}

/**
 * Stub plugin API that returns empty data
 * This prevents build errors while the real plugin API is being developed
 */
export const pluginAPI = {
  /**
   * Search for plugins in the registry
   * @param filters Search filters
   * @returns Empty array (stub implementation)
   */
  searchPlugins: async (filters: PluginSearchFilters): Promise<Plugin[]> => {
    console.warn('[PluginAPI] Using stub implementation - returns empty results');
    return [];
  },

  /**
   * Get list of installed plugins
   * @returns Empty array (stub implementation)
   */
  getInstalledPlugins: async (): Promise<InstalledPlugin[]> => {
    console.warn('[PluginAPI] Using stub implementation - returns empty list');
    return [];
  },

  /**
   * Install a plugin
   * @param pluginId Plugin ID to install
   * @param onProgress Progress callback
   * @returns Success: false (stub implementation)
   */
  installPlugin: async (
    pluginId: string, 
    onProgress?: (progress: PluginDownloadProgress) => void
  ): Promise<{ success: boolean; error?: string }> => {
    console.warn('[PluginAPI] Using stub implementation - installation not available');
    return { 
      success: false, 
      error: 'Plugin installation not yet implemented - backend API required' 
    };
  },

  /**
   * Uninstall a plugin
   * @param pluginId Plugin ID to uninstall
   * @returns Success: false (stub implementation)
   */
  uninstallPlugin: async (pluginId: string): Promise<{ success: boolean; error?: string }> => {
    console.warn('[PluginAPI] Using stub implementation - uninstallation not available');
    return { 
      success: false, 
      error: 'Plugin uninstallation not yet implemented - backend API required' 
    };
  },

  /**
   * Get plugin details
   * @param pluginId Plugin ID
   * @returns null (stub implementation)
   */
  getPluginDetails: async (pluginId: string): Promise<Plugin | null> => {
    console.warn('[PluginAPI] Using stub implementation - returns null');
    return null;
  }
};

export default pluginAPI;
