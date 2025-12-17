/**
 * Storage Analyzer Plugin - Stub implementation
 */

export interface StorageInfo {
  total: number;
  used: number;
  free: number;
}

export const storageAnalyzerPlugin = {
  analyze: async (deviceId: string): Promise<StorageInfo | null> => {
    console.warn('[StorageAnalyzerPlugin] Using stub implementation');
    return null;
  }
};

export default storageAnalyzerPlugin;
