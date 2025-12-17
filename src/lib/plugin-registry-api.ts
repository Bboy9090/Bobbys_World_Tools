/**
 * Plugin Registry API
 * 
 * This module provides the API interface for interacting with the plugin registry.
 * Currently returns empty data - should be connected to real backend when available.
 */

import type { RegistryPlugin } from '@/types/plugin-registry';

class PluginRegistryAPI {
  /**
   * Fetch the plugin manifest from the registry
   * Returns empty array until real backend is connected
   */
  async fetchManifest(): Promise<RegistryPlugin[]> {
    // TODO: Connect to real plugin registry backend
    // For now, return empty array to show truth (no fake plugins)
    return [];
  }

  /**
   * Fetch details for a specific plugin
   * Returns null until real backend is connected
   */
  async fetchPluginDetails(pluginId: string): Promise<RegistryPlugin | null> {
    // TODO: Connect to real plugin registry backend
    console.log(`Fetching plugin details for: ${pluginId}`);
    return null;
  }

  /**
   * Search plugins in the registry
   * Returns empty array until real backend is connected
   */
  async searchPlugins(query: string): Promise<RegistryPlugin[]> {
    // TODO: Connect to real plugin registry backend
    console.log(`Searching plugins with query: ${query}`);
    return [];
  }
}

// Export singleton instance
const pluginRegistry = new PluginRegistryAPI();
export default pluginRegistry;
