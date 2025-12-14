import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CorrelationBadgeDisplay } from './CorrelationBadgeDisplay';
import { useCorrelationTracking } from '@/hooks/use-correlation-tracking';
import {
  Pulse,
  DeviceMobile,
  CheckCircle,
  XCircle,
  Clock,
  TrendUp,
  Broadcast,
  Link,
  Play,
  Pause,
  Trash
} from '@phosphor-icons/react';
import { toast } from 'sonner';

export function RealTimeCorrelationTracker() {
  const {
    devices,
    isTracking,
    lastUpdate,
    updateDevice,
    removeDevice,
    clearAllDevices,
    getStats,
    startTracking,
    stopTracking
  } = useCorrelationTracking();

  const [elapsedTime, setElapsedTime] = useState(0);
  const stats = getStats();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isTracking) {
      const startTime = Date.now();
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking]);

  const handleStartTracking = () => {
    startTracking();
    toast.success('Real-time correlation tracking started');
  };

  const handleStopTracking = () => {
    stopTracking();
    toast.info('Real-time correlation tracking stopped');
  };

  const handleClearAll = () => {
    clearAllDevices();
    toast.success('All tracked devices cleared');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const deviceList = devices || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Pulse className="w-8 h-8 text-accent" weight="duotone" />
            Real-Time Correlation Tracker
          </h2>
          <p className="text-muted-foreground mt-1">
            Live monitoring of device correlation status with badge display
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isTracking ? (
            <Button onClick={handleStopTracking} variant="destructive" className="gap-2">
              <Pause className="w-4 h-4" weight="bold" />
              Stop Tracking
            </Button>
          ) : (
            <Button onClick={handleStartTracking} className="gap-2">
              <Play className="w-4 h-4" weight="bold" />
              Start Tracking
            </Button>
          )}
          {deviceList.length > 0 && (
            <Button onClick={handleClearAll} variant="outline" className="gap-2">
              <Trash className="w-4 h-4" weight="bold" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={isTracking ? 'border-accent' : ''}>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Broadcast className="w-4 h-4" weight="duotone" />
              Tracking Status
            </CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              {isTracking ? (
                <>
                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  Active
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-muted-foreground rounded-full" />
                  Idle
                </>
              )}
            </CardTitle>
          </CardHeader>
          {isTracking && (
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {formatTime(elapsedTime)}
              </div>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Devices</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Last update: {new Date(lastUpdate).toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" weight="fill" />
              Correlated
            </CardDescription>
            <CardTitle className="text-3xl text-accent">
              {stats.correlated + stats.weakCorrelated}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress
              value={stats.total > 0 ? ((stats.correlated + stats.weakCorrelated) / stats.total) * 100 : 0}
              className="h-2"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Strong: {stats.correlated} | Weak: {stats.weakCorrelated}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <TrendUp className="w-3 h-3" weight="duotone" />
              Avg Confidence
            </CardDescription>
            <CardTitle className="text-3xl">
              {(stats.averageConfidence * 100).toFixed(0)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={stats.averageConfidence * 100} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary">
          <CardHeader className="pb-2">
            <CardDescription>System Confirmed</CardDescription>
            <CardTitle className="text-2xl text-primary">{stats.systemConfirmed}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-muted-foreground">
          <CardHeader className="pb-2">
            <CardDescription>Likely</CardDescription>
            <CardTitle className="text-2xl text-muted-foreground">{stats.likely}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-destructive">
          <CardHeader className="pb-2">
            <CardDescription>Unconfirmed</CardDescription>
            <CardTitle className="text-2xl text-destructive">{stats.unconfirmed}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-accent">
          <CardHeader className="pb-2">
            <CardDescription>Correlation Rate</CardDescription>
            <CardTitle className="text-2xl text-accent">
              {stats.total > 0
                ? (((stats.correlated + stats.weakCorrelated) / stats.total) * 100).toFixed(0)
                : 0}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DeviceMobile className="w-5 h-5 text-primary" weight="duotone" />
            Tracked Devices ({deviceList.length})
          </CardTitle>
          <CardDescription>
            Real-time correlation status for all detected devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deviceList.length === 0 ? (
            <div className="text-center py-12">
              <DeviceMobile className="w-12 h-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground font-medium">No devices tracked yet</p>
              <p className="text-xs text-muted-foreground mt-2">
                {isTracking
                  ? 'Waiting for device connections...'
                  : 'Start tracking to monitor device correlations'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {deviceList
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((device) => (
                  <Card
                    key={device.id}
                    className="p-4 bg-muted/30 border-border hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant="outline" className="font-mono text-xs">
                            {device.id}
                          </Badge>
                          {device.serial && (
                            <Badge variant="secondary" className="font-mono text-xs">
                              SN: {device.serial}
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className={
                              device.platform === 'android'
                                ? 'bg-green-600/20 text-green-300 border-green-500/30'
                                : device.platform === 'ios'
                                ? 'bg-blue-600/20 text-blue-300 border-blue-500/30'
                                : 'bg-gray-600/20 text-gray-300 border-gray-500/30'
                            }
                          >
                            {device.platform.toUpperCase()}
                          </Badge>
                          {device.vendorId && device.productId && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {device.vendorId.toString(16).padStart(4, '0')}:
                              {device.productId.toString(16).padStart(4, '0')}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 flex-wrap">
                          <CorrelationBadgeDisplay
                            badge={device.correlationBadge}
                            matchedIds={device.matchedIds}
                          />
                          <div className="flex items-center gap-2">
                            <TrendUp className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Confidence: {(device.confidence * 100).toFixed(0)}%
                            </span>
                            <Progress
                              value={device.confidence * 100}
                              className="h-1 w-20"
                            />
                          </div>
                        </div>

                        {device.matchedIds.length > 0 && (
                          <div className="flex items-start gap-2 text-xs">
                            <Link className="w-3 h-3 text-accent mt-0.5" weight="bold" />
                            <div className="flex-1">
                              <span className="text-muted-foreground">Matched Tool IDs: </span>
                              <span className="font-mono text-foreground">
                                {device.matchedIds.join(', ')}
                              </span>
                            </div>
                          </div>
                        )}

                        {device.correlationNotes.length > 0 && (
                          <div className="space-y-1">
                            {device.correlationNotes.map((note, idx) => (
                              <div key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                <span className="text-accent">•</span>
                                <span>{note}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          Updated: {new Date(device.timestamp).toLocaleString()}
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          removeDevice(device.id);
                          toast.success('Device removed from tracking');
                        }}
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                      >
                        <XCircle className="w-4 h-4" weight="bold" />
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/50 border-primary">
        <CardHeader>
          <CardTitle className="text-lg">Real-Time Correlation Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            This dashboard tracks device correlation status in real-time, displaying correlation badges
            that indicate the strength of device identification and tool correlation.
          </p>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="font-semibold text-foreground mb-1">Correlation Badges:</p>
              <ul className="space-y-1 text-xs">
                <li>• <strong>CORRELATED:</strong> Per-device correlation with matched tool IDs (≥90% confidence)</li>
                <li>• <strong>CORRELATED (WEAK):</strong> Matched tool IDs with lower confidence</li>
                <li>• <strong>SYSTEM-CONFIRMED:</strong> System-level confirmation without USB record mapping</li>
                <li>• <strong>LIKELY:</strong> Probable platform detection without strong confirmation</li>
                <li>• <strong>UNCONFIRMED:</strong> Insufficient evidence for classification</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Features:</p>
              <ul className="space-y-1 text-xs">
                <li>• Real-time badge updates as device states change</li>
                <li>• Persistent tracking across sessions (stored locally)</li>
                <li>• Correlation statistics and distribution metrics</li>
                <li>• Per-device matched tool ID display</li>
                <li>• Confidence scoring with visual indicators</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
