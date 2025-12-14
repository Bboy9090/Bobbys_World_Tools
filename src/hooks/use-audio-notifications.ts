import { useCallback, useEffect, useRef } from 'react';
import { useKV } from '@github/spark/hooks';
import { audioNotificationManager, NotificationType } from '@/lib/audio-notifications';

interface AudioSettings {
  enabled: boolean;
  volume: number;
  deviceConnected: boolean;
  deviceDisconnected: boolean;
  bottleneckDetected: boolean;
  performanceCritical: boolean;
  testFailed: boolean;
  benchmarkComplete: boolean;
}

const DEFAULT_SETTINGS: AudioSettings = {
  enabled: true,
  volume: 0.3,
  deviceConnected: true,
  deviceDisconnected: true,
  bottleneckDetected: true,
  performanceCritical: true,
  testFailed: true,
  benchmarkComplete: true,
};

export function useAudioNotifications() {
  const [settings, setSettings] = useKV<AudioSettings>('audio-notification-settings', DEFAULT_SETTINGS);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current && settings) {
      audioNotificationManager.setEnabled(settings.enabled);
      audioNotificationManager.setVolume(settings.volume);
      hasInitialized.current = true;
    }
  }, [settings]);

  const play = useCallback(async (type: NotificationType) => {
    if (!settings) return;
    
    if (!settings.enabled) return;

    const typeMap: Record<NotificationType, keyof AudioSettings> = {
      'device-connected': 'deviceConnected',
      'device-disconnected': 'deviceDisconnected',
      'bottleneck-detected': 'bottleneckDetected',
      'performance-critical': 'performanceCritical',
      'test-failed': 'testFailed',
      'benchmark-complete': 'benchmarkComplete',
    };

    const settingKey = typeMap[type];
    if (!settings[settingKey]) return;

    await audioNotificationManager.play(type);
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AudioSettings>) => {
    setSettings((current) => {
      const base = current || DEFAULT_SETTINGS;
      const newSettings: AudioSettings = { ...base, ...updates };
      
      if ('enabled' in updates && updates.enabled !== undefined) {
        audioNotificationManager.setEnabled(updates.enabled);
      }
      
      if ('volume' in updates && updates.volume !== undefined) {
        audioNotificationManager.setVolume(updates.volume);
      }
      
      return newSettings;
    });
  }, [setSettings]);

  const toggleEnabled = useCallback(() => {
    updateSettings({ enabled: !settings?.enabled });
  }, [settings, updateSettings]);

  const setVolume = useCallback((volume: number) => {
    updateSettings({ volume });
  }, [updateSettings]);

  const toggleNotificationType = useCallback((type: NotificationType) => {
    const typeMap: Record<NotificationType, keyof AudioSettings> = {
      'device-connected': 'deviceConnected',
      'device-disconnected': 'deviceDisconnected',
      'bottleneck-detected': 'bottleneckDetected',
      'performance-critical': 'performanceCritical',
      'test-failed': 'testFailed',
      'benchmark-complete': 'benchmarkComplete',
    };

    const settingKey = typeMap[type];
    if (settings) {
      updateSettings({ [settingKey]: !settings[settingKey] });
    }
  }, [settings, updateSettings]);

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    audioNotificationManager.setEnabled(DEFAULT_SETTINGS.enabled);
    audioNotificationManager.setVolume(DEFAULT_SETTINGS.volume);
  }, [setSettings]);

  return {
    settings: settings || DEFAULT_SETTINGS,
    play,
    updateSettings,
    toggleEnabled,
    setVolume,
    toggleNotificationType,
    resetToDefaults,
  };
}
