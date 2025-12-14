import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Stop, FileArrowDown, Wrench, ClockCounterClockwise } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { MockPandoraAPI, type PerformanceMetrics } from '@/lib/mockAPI';

export function PandoraMonitorPanel() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [cleanupFn, setCleanupFn] = useState<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, [cleanupFn]);

  const startMonitoring = () => {
    setIsMonitoring(true);
    const cleanup = MockPandoraAPI.startMonitoring((newMetrics) => {
      setMetrics(newMetrics);
    });
    setCleanupFn(() => cleanup);
    toast.success('Performance monitoring started');
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setMetrics(null);
    if (cleanupFn) {
      cleanupFn();
      setCleanupFn(null);
    }
    MockPandoraAPI.stopMonitoring();
    toast.info('Performance monitoring stopped');
  };

  const exportReport = () => {
    if (!metrics) {
      toast.error('No data to export');
      return;
    }
    const data = JSON.stringify(metrics, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Performance report exported');
  };

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench weight="duotone" className="w-5 h-5" />
            Real-Time Performance Monitor
          </CardTitle>
          <CardDescription>Live system metrics and resource utilization tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            {!isMonitoring ? (
              <Button onClick={startMonitoring} className="gap-2">
                <Play weight="fill" className="w-4 h-4" />
                Start Monitoring
              </Button>
            ) : (
              <Button onClick={stopMonitoring} variant="destructive" className="gap-2">
                <Stop weight="fill" className="w-4 h-4" />
                Stop Monitoring
              </Button>
            )}
            <Button variant="outline" onClick={exportReport} disabled={!metrics} className="gap-2">
              <FileArrowDown weight="duotone" className="w-4 h-4" />
              Export Report
            </Button>
            <Button variant="outline" className="gap-2">
              <Wrench weight="duotone" className="w-4 h-4" />
              Optimizer
            </Button>
            <Button variant="outline" className="gap-2">
              <ClockCounterClockwise weight="duotone" className="w-4 h-4" />
              History
            </Button>
          </div>

          {isMonitoring && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-muted-foreground">Live monitoring active</span>
            </div>
          )}

          {metrics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <MetricCard 
                label="Transfer Speed" 
                value={`${metrics.speed.toFixed(2)} MB/s`}
                baseline={`Baseline: ${metrics.baseline} MB/s`}
                status={metrics.speed > metrics.baseline ? 'good' : 'warning'}
              />
              <MetricCard 
                label="CPU Usage" 
                value={`${metrics.cpu.toFixed(0)}%`}
                status={metrics.cpu < 70 ? 'good' : metrics.cpu < 90 ? 'warning' : 'critical'}
              />
              <MetricCard 
                label="Memory Usage" 
                value={`${metrics.memory.toFixed(0)}%`}
                status={metrics.memory < 70 ? 'good' : metrics.memory < 90 ? 'warning' : 'critical'}
              />
              <MetricCard 
                label="USB Utilization" 
                value={`${metrics.usb.toFixed(0)}%`}
                status={metrics.usb < 70 ? 'good' : metrics.usb < 90 ? 'warning' : 'critical'}
              />
              <MetricCard 
                label="Disk I/O" 
                value={`${metrics.disk.toFixed(0)}%`}
                status={metrics.disk < 70 ? 'good' : metrics.disk < 90 ? 'warning' : 'critical'}
              />
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">Start monitoring to see live performance metrics</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  baseline?: string;
  status: 'good' | 'warning' | 'critical';
}

function MetricCard({ label, value, baseline, status }: MetricCardProps) {
  const statusColors = {
    good: 'border-accent/30 bg-accent/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    critical: 'border-destructive/30 bg-destructive/5'
  };

  const badgeVariants = {
    good: 'default' as const,
    warning: 'secondary' as const,
    critical: 'destructive' as const
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${statusColors[status]} transition-colors`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        <Badge variant={badgeVariants[status]} className="text-xs">
          {status === 'good' ? '✓ Good' : status === 'warning' ? '⚠ Warning' : '✕ Critical'}
        </Badge>
      </div>
      <div className="text-2xl font-bold font-mono">{value}</div>
      {baseline && (
        <div className="text-xs text-muted-foreground mt-1">{baseline}</div>
      )}
    </div>
  );
}
