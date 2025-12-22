import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Devices, 
  Lightning,
  CheckCircle,
  Warning,
  DeviceMobile,
  ClockCounterClockwise,
  Play
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useApp } from '@/lib/app-context';

interface Device {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  activationStatus: 'locked' | 'unlocked' | 'unknown';
  selected: boolean;
}

interface ActivationProgress {
  deviceId: string;
  progress: number;
  status: 'pending' | 'activating' | 'complete' | 'error';
  message: string;
}

export function BatchActivationPanel() {
  const { backendAvailable } = useApp();
  const [devices, setDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState(false);
  const [activating, setActivating] = useState(false);
  const [progressMap, setProgressMap] = useState<Map<string, ActivationProgress>>(new Map());

  const mockDevices: Device[] = [
    { id: 'dev1', name: 'iPhone 14 Pro', model: 'A2890', serialNumber: 'F17ABC123DEF', activationStatus: 'locked', selected: false },
    { id: 'dev2', name: 'iPhone 13', model: 'A2482', serialNumber: 'C02XYZ789GHI', activationStatus: 'locked', selected: false },
    { id: 'dev3', name: 'iPhone 12', model: 'A2172', serialNumber: 'D03MNO456JKL', activationStatus: 'unlocked', selected: false },
    { id: 'dev4', name: 'iPad Pro', model: 'A2379', serialNumber: 'DMPQRS234TUV', activationStatus: 'locked', selected: false },
    { id: 'dev5', name: 'iPhone SE', model: 'A2595', serialNumber: 'F18WXY567ABC', activationStatus: 'locked', selected: false },
  ];

  const handleScan = async () => {
    setScanning(true);
    
    if (!backendAvailable) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setDevices(mockDevices);
      setScanning(false);
      toast.success(`Found ${mockDevices.length} devices (demo data)`);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/device/scan-multiple');
      const data = await response.json();
      setDevices(data.devices || mockDevices);
      toast.success(`Found ${data.devices?.length || 0} devices`);
    } catch (error) {
      setDevices(mockDevices);
      toast.error('Scan failed - showing demo data');
    } finally {
      setScanning(false);
    }
  };

  const handleActivate = async () => {
    const selected = devices.filter(d => d.selected && d.activationStatus === 'locked');
    
    if (selected.length === 0) {
      toast.error('No locked devices selected');
      return;
    }

    if (!backendAvailable) {
      toast.error('Backend required for activation');
      return;
    }

    setActivating(true);
    const newProgressMap = new Map<string, ActivationProgress>();

    // Initialize progress
    selected.forEach(device => {
      newProgressMap.set(device.id, {
        deviceId: device.id,
        progress: 0,
        status: 'pending',
        message: 'Waiting...'
      });
    });
    setProgressMap(newProgressMap);

    // Simulate activation process
    for (const device of selected) {
      setProgressMap(prev => {
        const next = new Map(prev);
        next.set(device.id, {
          deviceId: device.id,
          progress: 0,
          status: 'activating',
          message: 'Activating device...'
        });
        return next;
      });

      // Simulate progress
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setProgressMap(prev => {
          const next = new Map(prev);
          const current = next.get(device.id);
          if (current) {
            next.set(device.id, {
              ...current,
              progress: i,
              message: i < 100 ? `Activating... ${i}%` : 'Activation complete'
            });
          }
          return next;
        });
      }

      setProgressMap(prev => {
        const next = new Map(prev);
        next.set(device.id, {
          deviceId: device.id,
          progress: 100,
          status: 'complete',
          message: 'Activated successfully'
        });
        return next;
      });

      // Update device status
      setDevices(prevDevices => prevDevices.map(d =>
        d.id === device.id ? { ...d, activationStatus: 'unlocked' as const } : d
      ));
    }

    setActivating(false);
    toast.success(`Activated ${selected.length} device(s)`);
  };

  const toggleDevice = (deviceId: string) => {
    setDevices(prev => prev.map(d =>
      d.id === deviceId ? { ...d, selected: !d.selected } : d
    ));
  };

  const selectAll = () => {
    setDevices(prev => prev.map(d => ({ ...d, selected: d.activationStatus === 'locked' })));
  };

  const deselectAll = () => {
    setDevices(prev => prev.map(d => ({ ...d, selected: false })));
  };

  const selectedCount = devices.filter(d => d.selected).length;
  const lockedCount = devices.filter(d => d.activationStatus === 'locked').length;
  const unlockedCount = devices.filter(d => d.activationStatus === 'unlocked').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display text-primary mb-2">Batch Activation</h1>
        <p className="text-muted-foreground">
          Activate multiple iOS devices simultaneously
        </p>
      </div>

      <Alert>
        <Warning className="h-4 w-4" />
        <AlertDescription>
          <strong>Legal Notice:</strong> Only activate devices you legally own or have authorization to activate.
          Bypassing activation locks on stolen devices is illegal.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Devices className="w-4 h-4" />
              Total Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display text-primary">{devices.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Connected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Warning className="w-4 h-4" />
              Locked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display text-destructive">{lockedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Need activation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Unlocked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display text-success">{unlockedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Already active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lightning className="w-4 h-4" />
              Selected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display text-primary">{selectedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">For activation</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Devices />
            Connected Devices
          </CardTitle>
          <CardDescription>
            Select devices to activate in batch
          </CardDescription>
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleScan}
              disabled={scanning || activating}
              variant="outline"
              size="sm"
            >
              {scanning ? 'Scanning...' : 'Scan Devices'}
            </Button>
            {devices.length > 0 && (
              <>
                <Button onClick={selectAll} variant="outline" size="sm" disabled={activating}>
                  Select Locked
                </Button>
                <Button onClick={deselectAll} variant="outline" size="sm" disabled={activating}>
                  Deselect All
                </Button>
                <Button
                  onClick={handleActivate}
                  disabled={activating || selectedCount === 0}
                  size="sm"
                >
                  <Play className="mr-2" />
                  Activate Selected ({selectedCount})
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DeviceMobile className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No devices found</p>
              <p className="text-sm mt-2">Connect devices and click "Scan Devices"</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {devices.map((device) => {
                  const progress = progressMap.get(device.id);
                  return (
                    <div
                      key={device.id}
                      className="p-3 bg-card/50 border border-border rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={device.selected}
                          onCheckedChange={() => toggleDevice(device.id)}
                          disabled={activating || device.activationStatus === 'unlocked'}
                        />
                        <DeviceMobile className="w-8 h-8 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{device.name}</span>
                            <Badge
                              variant={device.activationStatus === 'unlocked' ? 'outline' : 'destructive'}
                              className={device.activationStatus === 'unlocked' ? 'bg-green-500/10 text-green-500' : ''}
                            >
                              {device.activationStatus === 'unlocked' ? (
                                <>
                                  <CheckCircle className="mr-1" size={12} />
                                  Unlocked
                                </>
                              ) : (
                                <>
                                  <Warning className="mr-1" size={12} />
                                  Locked
                                </>
                              )}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            <div>Model: {device.model} • SN: {device.serialNumber}</div>
                          </div>
                          {progress && progress.status !== 'pending' && (
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">{progress.message}</span>
                                <span className="font-mono">{progress.progress}%</span>
                              </div>
                              <Progress value={progress.progress} className="h-1" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {!backendAvailable && (
        <Alert>
          <Warning className="h-4 w-4" />
          <AlertDescription>
            Backend API required for batch activation. Showing demo data only.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
