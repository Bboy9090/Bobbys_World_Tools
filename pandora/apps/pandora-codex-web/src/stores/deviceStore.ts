/**
 * Device Store - Pure data store for device state
 * 
 * Managed by tetherScryerManager for lifecycle.
 */

import { create } from 'zustand';
import type { DeviceInfo, DeviceWithHistory } from '../services/apiService';

interface DeviceState {
  devices: DeviceInfo[];
  devicesWithHistory: DeviceWithHistory[];
  lastUpdate: Date | null;
  
  // Actions (called by tetherScryerManager)
  setDevices: (devices: DeviceInfo[]) => void;
  setDevicesWithHistory: (devices: DeviceWithHistory[]) => void;
  updateDevice: (device: DeviceInfo) => void;
  removeDevice: (deviceId: string) => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  devices: [],
  devicesWithHistory: [],
  lastUpdate: null,

  setDevices: (devices) => set({ devices, lastUpdate: new Date() }),

  setDevicesWithHistory: (devicesWithHistory) => set({ 
    devicesWithHistory, 
    lastUpdate: new Date() 
  }),

  updateDevice: (device) => set((state) => {
    const index = state.devices.findIndex(d => d.id === device.id);
    const newDevices = index >= 0
      ? [...state.devices.slice(0, index), device, ...state.devices.slice(index + 1)]
      : [...state.devices, device];
    return { devices: newDevices, lastUpdate: new Date() };
  }),

  removeDevice: (deviceId) => set((state) => ({
    devices: state.devices.filter(d => d.id !== deviceId),
    devicesWithHistory: state.devicesWithHistory.filter(d => d.id !== deviceId),
    lastUpdate: new Date()
  })),
}));
