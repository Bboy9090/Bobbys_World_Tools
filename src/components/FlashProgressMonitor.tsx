import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUp,
  ArrowDown,
  Clock,
  HardDrive,
  Lightning,
  CheckCircle,
  Warning,
  TrendUp,
  CircleNotch
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKV } from '@github/spark/hooks';
import type { FlashSpeedProfile } from './FlashSpeedProfiler';

export interface FlashProgress {
  partition: string;
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  transferSpeed: number;
  averageSpeed: number;
  peakSpeed: number;
  eta: number;
  status: 'preparing' | 'flashing' | 'verifying' | 'completed' | 'error';
  startTime: number;
  currentTime: number;
  error?: string;
  deviceSerial?: string;
  deviceModel?: string;
}

interface FlashProgressMonitorProps {
  progress: FlashProgress | null;
  onCancel?: () => void;
  onComplete?: (profile: FlashSpeedProfile) => void;
}

export function FlashProgressMonitor({ progress, onCancel, onComplete }: FlashProgressMonitorProps) {
  const [speedHistory, setSpeedHistory] = useState<number[]>([]);
  const [profiles, setProfiles] = useKV<FlashSpeedProfile[]>('flash-speed-profiles', []);
  const [profileCreated, setProfileCreated] = useState(false);
  const speedSamplesRef = useRef<Array<{ time: number; speed: number }>>([]);
  const minSpeedRef = useRef<number>(Infinity);
  const maxHistoryLength = 30;

  useEffect(() => {
    if (progress && progress.status === 'flashing') {
      setSpeedHistory(prev => {
        const newHistory = [...prev, progress.transferSpeed];
        return newHistory.slice(-maxHistoryLength);
      });

      speedSamplesRef.current.push({
        time: (progress.currentTime - progress.startTime) / 1000,
        speed: progress.transferSpeed
      });

      if (progress.transferSpeed < minSpeedRef.current) {
        minSpeedRef.current = progress.transferSpeed;
      }
    } else if (!progress || progress.status === 'completed') {
      setSpeedHistory([]);
    }
  }, [progress?.transferSpeed, progress?.status]);

  useEffect(() => {
    if (progress?.status === 'completed' && !profileCreated) {
      createSpeedProfile();
      setProfileCreated(true);
    } else if (!progress || progress.status === 'preparing') {
      setProfileCreated(false);
      speedSamplesRef.current = [];
      minSpeedRef.current = Infinity;
    }
  }, [progress?.status]);

  const createSpeedProfile = () => {
    if (!progress) return;

    const duration = progress.currentTime - progress.startTime;
    const speeds = speedSamplesRef.current.map(s => s.speed);
    if (speeds.length === 0) return;
    
    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const variance = speeds.length > 1 
      ? (Math.sqrt(speeds.reduce((sum, speed) => sum + Math.pow(speed - avgSpeed, 2), 0) / speeds.length) / avgSpeed) * 100
      : 0;

    const profile: FlashSpeedProfile = {
      id: `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      deviceSerial: progress.deviceSerial || 'unknown',
      deviceModel: progress.deviceModel,
      partition: progress.partition,
      fileSize: progress.totalBytes,
      timestamp: progress.startTime,
      duration,
      averageSpeed: avgSpeed,
      peakSpeed: progress.peakSpeed,
      minSpeed: minSpeedRef.current === Infinity ? avgSpeed : minSpeedRef.current,
      speedVariance: variance,
      transferEfficiency: Math.min(100, (progress.totalBytes / (avgSpeed * (duration / 1000))) * 100),
      speedProfile: speedSamplesRef.current.slice(0, 100),
      errors: progress.error ? 1 : 0,
      retries: 0
    };

    setProfiles(prev => [profile, ...(prev || [])].slice(0, 100));

    if (onComplete) {
      onComplete(profile);
    }
  };

  if (!progress) {
    return null;
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatSpeed = (bytesPerSecond: number) => {
    return `${formatBytes(bytesPerSecond)}/s`;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.round(seconds % 60);
      return `${mins}m ${secs}s`;
    }
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const elapsedTime = (progress.currentTime - progress.startTime) / 1000;
  const isActive = progress.status === 'flashing' || progress.status === 'verifying';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightning size={20} weight="fill" className="text-primary animate-pulse" />
                <CardTitle className="text-lg">Flash Progress</CardTitle>
              </div>
              <Badge variant={
                progress.status === 'completed' ? 'default' :
                progress.status === 'error' ? 'destructive' :
                'secondary'
              }>
                {progress.status.toUpperCase()}
              </Badge>
            </div>
            <CardDescription>
              {progress.partition} • {formatBytes(progress.bytesTransferred)} / {formatBytes(progress.totalBytes)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Progress</span>
                <span className="text-muted-foreground">{progress.percentage.toFixed(1)}%</span>
              </div>
              <Progress 
                value={progress.percentage} 
                className="h-3"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CircleNotch size={14} />
                  <span>Current Speed</span>
                </div>
                <p className="text-lg font-semibold">
                  {formatSpeed(progress.transferSpeed)}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <TrendUp size={14} />
                  <span>Average Speed</span>
                </div>
                <p className="text-lg font-semibold">
                  {formatSpeed(progress.averageSpeed)}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock size={14} />
                  <span>Time Elapsed</span>
                </div>
                <p className="text-lg font-semibold">
                  {formatTime(elapsedTime)}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock size={14} weight="fill" />
                  <span>ETA</span>
                </div>
                <p className="text-lg font-semibold">
                  {progress.eta > 0 ? formatTime(progress.eta) : '--'}
                </p>
              </div>
            </div>

            {speedHistory.length > 0 && isActive && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Transfer Speed History</span>
                  <span>Peak: {formatSpeed(progress.peakSpeed)}</span>
                </div>
                <SpeedGraph speeds={speedHistory} peakSpeed={progress.peakSpeed} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  isActive ? 'bg-green-500 animate-pulse' : 'bg-muted'
                }`} />
                <span className="text-xs text-muted-foreground">
                  {progress.status === 'flashing' ? 'Writing data...' :
                   progress.status === 'verifying' ? 'Verifying...' :
                   progress.status === 'preparing' ? 'Preparing...' :
                   progress.status === 'completed' ? 'Flash completed' :
                   'Error occurred'}
                </span>
              </div>
              {progress.status === 'completed' && (
                <div className="flex items-center justify-end gap-2 text-green-500">
                  <CheckCircle size={16} weight="fill" />
                  <span className="text-xs font-medium">Success</span>
                </div>
              )}
              {progress.status === 'error' && (
                <div className="flex items-center justify-end gap-2 text-destructive">
                  <Warning size={16} weight="fill" />
                  <span className="text-xs font-medium">Failed</span>
                </div>
              )}
            </div>

            {progress.error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-xs text-destructive">{progress.error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

interface SpeedGraphProps {
  speeds: number[];
  peakSpeed: number;
}

function SpeedGraph({ speeds, peakSpeed }: SpeedGraphProps) {
  const maxSpeed = Math.max(peakSpeed, ...speeds);
  const normalizedSpeeds = speeds.map(speed => (speed / maxSpeed) * 100);

  return (
    <div className="h-16 flex items-end gap-0.5 bg-muted/30 rounded-lg p-2">
      {normalizedSpeeds.map((height, index) => (
        <motion.div
          key={index}
          className="flex-1 bg-primary rounded-sm min-w-[2px]"
          initial={{ height: 0 }}
          animate={{ height: `${height}%` }}
          transition={{ duration: 0.2 }}
        />
      ))}
    </div>
  );
}

export function useFlashProgressSimulator() {
  const [progress, setProgress] = useState<FlashProgress | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const startTimeRef = useRef<number>(0);
  const bytesRef = useRef<number>(0);
  const speedHistoryRef = useRef<number[]>([]);

  const startFlashing = (partition: string, totalBytes: number) => {
    startTimeRef.current = Date.now();
    bytesRef.current = 0;
    speedHistoryRef.current = [];

    setProgress({
      partition,
      bytesTransferred: 0,
      totalBytes,
      percentage: 0,
      transferSpeed: 0,
      averageSpeed: 0,
      peakSpeed: 0,
      eta: 0,
      status: 'preparing',
      startTime: startTimeRef.current,
      currentTime: startTimeRef.current
    });

    setTimeout(() => {
      setProgress(prev => prev ? { ...prev, status: 'flashing' } : null);
      startProgressSimulation(totalBytes);
    }, 1000);
  };

  const startProgressSimulation = (totalBytes: number) => {
    intervalRef.current = setInterval(() => {
      const currentTime = Date.now();
      const elapsedSeconds = (currentTime - startTimeRef.current) / 1000;

      const baseSpeed = 5 * 1024 * 1024;
      const speedVariation = Math.sin(Date.now() / 1000) * 2 * 1024 * 1024;
      const randomVariation = (Math.random() - 0.5) * 1024 * 1024;
      const currentSpeed = Math.max(1024 * 1024, baseSpeed + speedVariation + randomVariation);

      const increment = (currentSpeed * 0.1);
      bytesRef.current = Math.min(bytesRef.current + increment, totalBytes);
      
      speedHistoryRef.current.push(currentSpeed);
      if (speedHistoryRef.current.length > 50) {
        speedHistoryRef.current.shift();
      }

      const averageSpeed = speedHistoryRef.current.reduce((a, b) => a + b, 0) / speedHistoryRef.current.length;
      const peakSpeed = Math.max(...speedHistoryRef.current);
      const percentage = (bytesRef.current / totalBytes) * 100;
      const remainingBytes = totalBytes - bytesRef.current;
      const eta = averageSpeed > 0 ? remainingBytes / averageSpeed : 0;

      const currentPartition = progress?.partition || 'unknown';
      
      setProgress({
        partition: currentPartition,
        bytesTransferred: bytesRef.current,
        totalBytes,
        percentage,
        transferSpeed: currentSpeed,
        averageSpeed,
        peakSpeed,
        eta,
        status: bytesRef.current >= totalBytes ? 'verifying' : 'flashing',
        startTime: startTimeRef.current,
        currentTime
      });

      if (bytesRef.current >= totalBytes) {
        clearInterval(intervalRef.current);
        setTimeout(() => {
          setProgress(prev => prev ? { ...prev, status: 'completed' } : null);
        }, 1500);
      }
    }, 100);
  };

  const stopFlashing = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setProgress(null);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { progress, startFlashing, stopFlashing };
}
