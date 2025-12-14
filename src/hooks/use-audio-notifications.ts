import { useEffect, useRef } from 'react';
import { useKV } from '@github/spark/hooks';
import { useAtmosphere, AtmosphereMode } from './use-atmosphere';

export function useAudioNotifications() {
  const [enabled] = useKV<boolean>("atmosphere-enabled", false);
  const [mode] = useKV<AtmosphereMode>("atmosphere-mode", "instrumental");
  const [intensity] = useKV<number>("atmosphere-intensity", 0.08);
  const [autoMuteOnErrors] = useKV<boolean>("atmosphere-auto-mute", true);
  const [pauseOnComplete] = useKV<boolean>("atmosphere-pause-complete", true);

  const atmosphere = useAtmosphere();
  const currentJobRef = useRef<string | null>(null);

  const pickTrack = (selectedMode: AtmosphereMode): string => {
    if (selectedMode === "external") return "";
    
    const base = selectedMode === "instrumental" ? "/audio/instrumental" : "/audio/ambient";
    const n = 1 + Math.floor(Math.random() * 6);
    return `${base}/loop_${n}.mp3`;
  };

  const handleJobStart = (jobId?: string) => {
    if (!enabled || mode === "external") return;
    
    currentJobRef.current = jobId || `job-${Date.now()}`;
    const track = pickTrack(mode || "instrumental");
    if (track) {
      atmosphere.playLoop(track, intensity || 0.08);
    }
  };

  const handleJobError = () => {
    if (!enabled || !autoMuteOnErrors) return;
    atmosphere.fadeOutAndStop(200);
  };

  const handleJobComplete = () => {
    if (!enabled || !pauseOnComplete) return;
    atmosphere.fadeOutAndStop(300);
    currentJobRef.current = null;
  };

  const handleJobProgress = () => {
  };

  useEffect(() => {
    if (enabled && mode !== "external") {
      atmosphere.setVolume(intensity || 0.08);
    }
  }, [intensity, enabled, mode]);

  useEffect(() => {
    return () => {
      atmosphere.stop();
    };
  }, []);

  return {
    handleJobStart,
    handleJobError,
    handleJobComplete,
    handleJobProgress,
    stopAtmosphere: atmosphere.stop,
  };
}
