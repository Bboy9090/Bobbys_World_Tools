/**
 * Plugin Registry API - Stub implementation
 * 
 * This file provides a stub API for the plugin registry.
 * In production, this should be replaced with actual backend API calls.
 */

export interface RegistryPlugin {
  id: string;
  name: string;
  version: string;
  dependencies?: Record<string, string>;
}

export interface PluginManifest {
  plugins: RegistryPlugin[];
  timestamp: number;
}

/**
 * Stub plugin registry that returns empty data
 * This prevents build errors while the real plugin registry API is being developed
 */
const pluginRegistry = {
  /**
   * Get all plugins from the registry
   * @returns Empty array (stub implementation)
   */
  getAll: async (): Promise<RegistryPlugin[]> => {
    console.warn('[PluginRegistryAPI] Using stub implementation - returns empty data');
    return [];
  },

  /**
   * Get a specific plugin by ID
   * @param id Plugin ID
   * @returns null (stub implementation)
   */
  getById: async (id: string): Promise<RegistryPlugin | null> => {
    console.warn('[PluginRegistryAPI] Using stub implementation - returns null');
    return null;
  },

  /**
   * Search plugins
   * @param query Search query
   * @returns Empty array (stub implementation)
   */
  search: async (query: string): Promise<RegistryPlugin[]> => {
    console.warn('[PluginRegistryAPI] Using stub implementation - returns empty data');
    return [];
  },

  /**
   * Fetch plugin manifest
   * @returns Empty manifest (stub implementation)
   */
  fetchManifest: async (): Promise<PluginManifest> => {
    console.warn('[PluginRegistryAPI] Using stub implementation - returns empty manifest');
    return {
      plugins: [],
      timestamp: Date.now()
    };
  },

  /**
   * Fetch plugin details
   * @param id Plugin ID
   * @returns null (stub implementation)
   */
  fetchPluginDetails: async (id: string): Promise<RegistryPlugin | null> => {
    console.warn('[PluginRegistryAPI] Using stub implementation - returns null');
    return null;
  }
};

export default pluginRegistry;
