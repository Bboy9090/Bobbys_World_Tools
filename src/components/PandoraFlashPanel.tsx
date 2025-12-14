import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Pause, 
  Stop, 
  Lightning, 
  CheckCircle,
  XCircle,
  Clock,
  CircleNotch
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface FlashOperation {
  id: string;
  device: string;
  firmware: string;
  status: 'queued' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  startTime?: number;
  endTime?: number;
}

const API_BASE = 'http://localhost:3001';

export function PandoraFlashPanel() {
  const [operations, setOperations] = useState<FlashOperation[]>([]);
  const [history, setHistory] = useState<FlashOperation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/flash/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to load flash history:', err);
    }
  };

  const startDemoFlash = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/flash/start`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        toast.success('Demo flash operation started');
        
        const newOp: FlashOperation = {
          id: Date.now().toString(),
          device: 'Demo Device',
          firmware: 'Demo Firmware v1.0',
          status: 'running',
          progress: 0,
          startTime: Date.now(),
        };
        
        setOperations(prev => [...prev, newOp]);
        simulateProgress(newOp.id);
        await loadHistory();
      }
    } catch (err) {
      toast.error('Failed to start flash operation');
    } finally {
      setLoading(false);
    }
  };

  const simulateProgress = (opId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setOperations(prev => 
          prev.map(op => 
            op.id === opId 
              ? { ...op, status: 'completed' as const, progress: 100, endTime: Date.now() }
              : op
          )
        );
        toast.success('Flash operation completed');
      } else {
        setOperations(prev => 
          prev.map(op => op.id === opId ? { ...op, progress } : op)
        );
      }
    }, 500);
  };

  const pauseOperation = (opId: string) => {
    setOperations(prev => 
      prev.map(op => op.id === opId ? { ...op, status: 'paused' as const } : op)
    );
    toast.info('Operation paused');
  };

  const resumeOperation = (opId: string) => {
    setOperations(prev => 
      prev.map(op => op.id === opId ? { ...op, status: 'running' as const } : op)
    );
    toast.info('Operation resumed');
  };

  const cancelOperation = (opId: string) => {
    setOperations(prev => prev.filter(op => op.id !== opId));
    toast.warning('Operation cancelled');
  };

  const formatDuration = (startTime: number, endTime?: number) => {
    const duration = (endTime || Date.now()) - startTime;
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lightning className="w-5 h-5 text-primary" weight="duotone" />
                Flash Operations
              </CardTitle>
              <CardDescription>Manage device firmware flashing operations</CardDescription>
            </div>
            <Button onClick={startDemoFlash} disabled={loading}>
              {loading ? (
                <CircleNotch className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" weight="fill" />
              )}
              Start Demo Flash
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {operations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Lightning className="w-12 h-12 mx-auto mb-3 opacity-50" weight="duotone" />
              <p className="font-medium">No active operations</p>
              <p className="text-sm mt-1">Click "Start Demo Flash" to begin</p>
            </div>
          ) : (
            <div className="space-y-3">
              {operations.map((op) => (
                <Card key={op.id} className="border-primary/30">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold">{op.device}</div>
                          <div className="text-sm text-muted-foreground">{op.firmware}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {op.status === 'running' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => pauseOperation(op.id)}>
                                <Pause className="w-4 h-4" weight="fill" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => cancelOperation(op.id)}>
                                <Stop className="w-4 h-4" weight="fill" />
                              </Button>
                            </>
                          )}
                          {op.status === 'paused' && (
                            <>
                              <Button size="sm" onClick={() => resumeOperation(op.id)}>
                                <Play className="w-4 h-4" weight="fill" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => cancelOperation(op.id)}>
                                <Stop className="w-4 h-4" weight="fill" />
                              </Button>
                            </>
                          )}
                          {op.status === 'completed' && (
                            <CheckCircle className="w-5 h-5 text-emerald-400" weight="fill" />
                          )}
                          {op.status === 'failed' && (
                            <XCircle className="w-5 h-5 text-rose-400" weight="fill" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-mono">{Math.floor(op.progress)}%</span>
                        </div>
                        <Progress value={op.progress} />
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <Badge variant={
                          op.status === 'completed' ? 'default' :
                          op.status === 'failed' ? 'destructive' :
                          op.status === 'paused' ? 'secondary' : 'outline'
                        }>
                          {op.status.toUpperCase()}
                        </Badge>
                        {op.startTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(op.startTime, op.endTime)}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Flash History</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No flash history available</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((entry: any, idx) => (
                  <div key={idx} className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-3 py-1">
                    {entry.entry || entry}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
