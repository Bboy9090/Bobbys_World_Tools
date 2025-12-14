import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Broadcast, PlugsConnected, Plug, Trash, ArrowClockwise } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { MockPandoraAPI, type HotplugEvent } from '@/lib/mockAPI';

export function PandoraHotplugPanel() {
  const [events, setEvents] = useState<HotplugEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState(0);
  const [disconnectedDevices, setDisconnectedDevices] = useState(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  const connectHotplugMonitor = () => {
    if (isConnected) return;
    
    const cleanup = MockPandoraAPI.startHotplugMonitoring((event) => {
      setEvents(prev => [event, ...prev].slice(0, 100));
      
      if (event.type === 'connected') {
        setConnectedDevices(prev => prev + 1);
        toast.info(`Device connected: ${event.deviceId}`);
      } else {
        setDisconnectedDevices(prev => prev + 1);
        toast.info(`Device disconnected: ${event.deviceId}`);
      }
    });
    
    cleanupRef.current = cleanup;
    setIsConnected(true);
    toast.success('Connected to hotplug monitor');
  };

  const disconnect = () => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    MockPandoraAPI.stopHotplugMonitoring();
    setIsConnected(false);
    toast.info('Disconnected from hotplug monitor');
  };

  const clearEvents = () => {
    setEvents([]);
    setConnectedDevices(0);
    setDisconnectedDevices(0);
    toast.info('Event history cleared');
  };

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Broadcast weight="duotone" className="w-5 h-5" />
            Live Device Hotplug Monitor
          </CardTitle>
          <CardDescription>Real-time USB device connection and disconnection events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            {!isConnected ? (
              <Button onClick={connectHotplugMonitor} className="gap-2">
                <PlugsConnected weight="duotone" className="w-4 h-4" />
                Start Monitoring
              </Button>
            ) : (
              <Button onClick={disconnect} variant="destructive" className="gap-2">
                <Plug weight="duotone" className="w-4 h-4" />
                Stop Monitoring
              </Button>
            )}
            <Button variant="outline" onClick={clearEvents} className="gap-2">
              <Trash weight="duotone" className="w-4 h-4" />
              Clear All
            </Button>
            <Button variant="outline" onClick={connectHotplugMonitor} disabled={isConnected} className="gap-2">
              <ArrowClockwise weight="duotone" className="w-4 h-4" />
              Restart
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground">Monitoring active</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                <span className="text-sm text-muted-foreground">Not monitoring</span>
              </>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-secondary rounded-lg border border-border">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Connected
              </div>
              <div className="text-2xl font-bold font-mono text-accent">{connectedDevices}</div>
            </div>
            <div className="p-4 bg-secondary rounded-lg border border-border">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Disconnected
              </div>
              <div className="text-2xl font-bold font-mono text-muted-foreground">{disconnectedDevices}</div>
            </div>
            <div className="p-4 bg-secondary rounded-lg border border-border">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Total Events
              </div>
              <div className="text-2xl font-bold font-mono">{events.length}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Event Stream</h3>
            {events.length > 0 ? (
              <ScrollArea className="h-[400px] border border-border rounded-lg p-4 bg-secondary/30">
                <div className="space-y-2">
                  {events.map(event => (
                    <div 
                      key={event.id}
                      className="flex items-start justify-between p-3 bg-card rounded border border-border"
                    >
                      <div className="flex items-start gap-3">
                        {event.type === 'connected' ? (
                          <PlugsConnected weight="fill" className="w-5 h-5 text-accent mt-0.5" />
                        ) : (
                          <Plug weight="fill" className="w-5 h-5 text-muted-foreground mt-0.5" />
                        )}
                        <div>
                          <div className="font-medium text-sm">
                            {event.type === 'connected' ? 'Device Connected' : 'Device Disconnected'}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">{event.deviceId}</div>
                          {event.platform && (
                            <Badge variant="outline" className="text-xs mt-1">{event.platform}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12 border border-border rounded-lg bg-secondary/30 text-muted-foreground">
                <p className="text-sm">No events yet</p>
                <p className="text-xs mt-1">Start monitoring to see device events</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
