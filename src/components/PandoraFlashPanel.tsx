import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, FileText, ClockCounterClockwise } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { MockPandoraAPI, type FlashOperation } from '@/lib/mockAPI';

export function PandoraFlashPanel() {
  const [operations, setOperations] = useState<FlashOperation[]>([]);
  const [history, setHistory] = useState<FlashOperation[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await MockPandoraAPI.getFlashHistory();
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch flash history:', error);
    }
  };

  const startDemoFlash = async () => {
    setIsRunning(true);
    
    try {
      const operation = await MockPandoraAPI.startFlash();
      
      setOperations([operation]);
      toast.success('Demo flash started');

      const interval = setInterval(() => {
        setOperations(ops => {
          const updated = ops.map(op => {
            if (op.id === operation.id && op.progress < 100) {
              return {
                ...op,
                progress: Math.min(op.progress + 10, 100),
                speed: `${(Math.random() * 30 + 10).toFixed(2)} MB/s`,
                status: 'running' as const,
              };
            }
            return op;
          });
          
          if (updated[0]?.progress === 100) {
            clearInterval(interval);
            setIsRunning(false);
            fetchHistory();
            setOperations([]);
            toast.success('Demo flash completed');
          }
          
          return updated;
        });
      }, 1000);
    } catch (error) {
      console.error('Failed to start flash:', error);
      toast.error('Failed to start flash operation');
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play weight="duotone" className="w-5 h-5" />
            Flash Operations Panel
          </CardTitle>
          <CardDescription>Start demo flash operations and manage flashing queue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button 
              onClick={startDemoFlash} 
              disabled={isRunning}
              className="gap-2"
            >
              <Play weight="fill" className="w-4 h-4" />
              Start Demo Flash
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText weight="duotone" className="w-4 h-4" />
              View History
            </Button>
          </div>

          {operations.length > 0 ? (
            <div className="space-y-3 mt-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Operations Queue</h3>
              {operations.map(op => (
                <div key={op.id} className="p-4 bg-secondary rounded-lg border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{op.device || 'Unknown Device'}</span>
                    <Badge variant="secondary">{op.status}</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${op.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{op.progress}%</span>
                    <span>{op.speed}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-4">
              No operations queued
            </div>
          )}

          {history.length > 0 && (
            <div className="space-y-3 mt-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <ClockCounterClockwise weight="duotone" className="w-4 h-4" />
                Recent History
              </h3>
              <div className="space-y-2">
                {history.slice(-3).reverse().map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm">
                    <span className="text-foreground">{item.device}</span>
                    <Badge variant="outline" className="text-xs">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {history.length === 0 && operations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No operations history</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
