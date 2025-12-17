/**
 * Firmware API - Stub implementation
 */

export interface FirmwareInfo {
  id: string;
  version: string;
  deviceModel: string;
  size: number;
}

export const firmwareAPI = {
  search: async (query: string): Promise<FirmwareInfo[]> => {
    console.warn('[FirmwareAPI] Using stub implementation');
    return [];
  },

  download: async (firmwareId: string): Promise<{ success: boolean }> => {
    console.warn('[FirmwareAPI] Using stub implementation');
    return { success: false };
  }
};

export default firmwareAPI;
