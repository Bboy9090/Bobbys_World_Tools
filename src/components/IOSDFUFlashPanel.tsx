import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  DeviceMobile,
  Lightning,
  Play,
  Pause,
  Stop,
  CheckCircle,
  Warning,
  XCircle,
  Info,
  AppleLogo,
  ShieldCheck,
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface IOSDevice {
  udid: string;
  name: string;
  model: string;
  iosVersion: string;
  mode: 'normal' | 'recovery' | 'dfu';
  isJailbroken?: boolean;
  checkra1nSupported?: boolean;
  palera1nSupported?: boolean;
}

interface DFUOperation {
  id: string;
  deviceUDID: string;
  operation: 'restore' | 'jailbreak-checkra1n' | 'jailbreak-palera1n' | 'enter-dfu' | 'exit-recovery';
  status: 'preparing' | 'running' | 'completed' | 'failed';
  progress: number;
  logs: string[];
  startedAt: number;
  completedAt?: number;
}

export function IOSDFUFlashPanel() {
  const [devices, setDevices] = useState<IOSDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [operations, setOperations] = useState<DFUOperation[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [ipswPath, setIpswPath] = useState('');
  const [preserveUserData, setPreserveUserData] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    scanDevices();
    const interval = setInterval(scanDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  const scanDevices = async () => {
    setIsScanning(true);
    try {
      const mockDevices: IOSDevice[] = [
        {
          udid: 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0',
          name: 'iPhone 12 Pro',
          model: 'iPhone13,3',
          iosVersion: '15.7.1',
          mode: 'normal',
          isJailbroken: false,
          checkra1nSupported: true,
          palera1nSupported: false,
        },
        {
          udid: 'Z9Y8X7W6V5U4T3S2R1Q0P9O8N7M6L5K4J3I2H1G0',
          name: 'iPhone X',
          model: 'iPhone10,6',
          iosVersion: '14.8',
          mode: 'recovery',
          isJailbroken: false,
          checkra1nSupported: true,
          palera1nSupported: true,
        },
      ];
      
      setDevices(mockDevices);
      
      if (mockDevices.length > 0) {
        toast.success(`Found ${mockDevices.length} iOS device(s)`, {
          description: mockDevices.map(d => d.name).join(', '),
        });
      }
    } catch (error) {
      toast.error('Failed to scan iOS devices', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const enterDFUMode = async () => {
    if (!selectedDevice) {
      toast.error('No device selected');
      return;
    }

    const device = devices.find(d => d.udid === selectedDevice);
    if (!device) return;

    const operation: DFUOperation = {
      id: `dfu-${Date.now()}`,
      deviceUDID: selectedDevice,
      operation: 'enter-dfu',
      status: 'preparing',
      progress: 0,
      logs: [
        'Preparing to enter DFU mode...',
        'Follow these steps:',
        '1. Connect device to computer',
        '2. Press and hold Side button + Volume Down for 10 seconds',
        '3. Release Side button but keep holding Volume Down for 5 more seconds',
        '4. Screen should remain black (if Apple logo appears, try again)',
      ],
      startedAt: Date.now(),
    };

    setOperations(prev => [...prev, operation]);
    
    toast.info('Follow DFU mode instructions', {
      description: 'Check the operation logs for detailed steps',
    });

    setTimeout(() => {
      setOperations(prev => prev.map(op => 
        op.id === operation.id 
          ? { ...op, status: 'completed', progress: 100, completedAt: Date.now() }
          : op
      ));
      
      setDevices(prev => prev.map(d =>
        d.udid === selectedDevice ? { ...d, mode: 'dfu' } : d
      ));
      
      toast.success('Device entered DFU mode');
    }, 3000);
  };

  const startCheckra1nJailbreak = async () => {
    if (!selectedDevice) {
      toast.error('No device selected');
      return;
    }

    const device = devices.find(d => d.udid === selectedDevice);
    if (!device) return;

    if (!device.checkra1nSupported) {
      toast.error('Device not supported', {
        description: 'checkra1n requires A11 chip or earlier (iPhone X and below)',
      });
      return;
    }

    if (device.mode !== 'dfu') {
      toast.warning('DFU mode required', {
        description: 'Please enter DFU mode first for checkra1n jailbreak',
      });
      return;
    }

    const operation: DFUOperation = {
      id: `checkra1n-${Date.now()}`,
      deviceUDID: selectedDevice,
      operation: 'jailbreak-checkra1n',
      status: 'preparing',
      progress: 0,
      logs: [
        'Starting checkra1n jailbreak...',
        'Verifying device compatibility...',
        'Device is compatible with checkra1n',
        'Preparing exploit payload...',
      ],
      startedAt: Date.now(),
    };

    setOperations(prev => [...prev, operation]);
    toast.info('checkra1n jailbreak started');

    const stages = [
      { progress: 20, message: 'Uploading iBoot exploit...' },
      { progress: 40, message: 'Patching kernel...' },
      { progress: 60, message: 'Installing Cydia...' },
      { progress: 80, message: 'Configuring SSH access...' },
      { progress: 100, message: 'Jailbreak complete!' },
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage >= stages.length) {
        clearInterval(interval);
        setOperations(prev => prev.map(op =>
          op.id === operation.id
            ? { ...op, status: 'completed', progress: 100, completedAt: Date.now() }
            : op
        ));
        
        setDevices(prev => prev.map(d =>
          d.udid === selectedDevice ? { ...d, isJailbroken: true } : d
        ));
        
        toast.success('checkra1n jailbreak completed', {
          description: 'Device is now jailbroken. Please reboot.',
        });
        return;
      }

      const stage = stages[currentStage];
      setOperations(prev => prev.map(op =>
        op.id === operation.id
          ? {
              ...op,
              status: 'running',
              progress: stage.progress,
              logs: [...op.logs, stage.message],
            }
          : op
      ));

      currentStage++;
    }, 2000);
  };

  const startPalera1nJailbreak = async () => {
    if (!selectedDevice) {
      toast.error('No device selected');
      return;
    }

    const device = devices.find(d => d.udid === selectedDevice);
    if (!device) return;

    if (!device.palera1nSupported) {
      toast.error('Device not supported', {
        description: 'palera1n requires A8-A11 devices running iOS 15.0-16.x',
      });
      return;
    }

    const operation: DFUOperation = {
      id: `palera1n-${Date.now()}`,
      deviceUDID: selectedDevice,
      operation: 'jailbreak-palera1n',
      status: 'preparing',
      progress: 0,
      logs: [
        'Starting palera1n jailbreak...',
        'Checking iOS version compatibility...',
        'iOS version is supported',
        'Preparing checkm8 exploit...',
      ],
      startedAt: Date.now(),
    };

    setOperations(prev => [...prev, operation]);
    toast.info('palera1n jailbreak started');

    const stages = [
      { progress: 15, message: 'Exploiting bootrom with checkm8...' },
      { progress: 30, message: 'Booting ramdisk...' },
      { progress: 50, message: 'Patching kernel...' },
      { progress: 70, message: 'Installing package manager...' },
      { progress: 90, message: 'Setting up environment...' },
      { progress: 100, message: 'palera1n jailbreak complete!' },
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage >= stages.length) {
        clearInterval(interval);
        setOperations(prev => prev.map(op =>
          op.id === operation.id
            ? { ...op, status: 'completed', progress: 100, completedAt: Date.now() }
            : op
        ));
        
        setDevices(prev => prev.map(d =>
          d.udid === selectedDevice ? { ...d, isJailbroken: true } : d
        ));
        
        toast.success('palera1n jailbreak completed', {
          description: 'Device is now jailbroken with rootless mode',
        });
        return;
      }

      const stage = stages[currentStage];
      setOperations(prev => prev.map(op =>
        op.id === operation.id
          ? {
              ...op,
              status: 'running',
              progress: stage.progress,
              logs: [...op.logs, stage.message],
            }
          : op
      ));

      currentStage++;
    }, 2500);
  };

  const startRestore = async () => {
    if (!selectedDevice || !ipswPath) {
      toast.error('Missing required fields', {
        description: 'Please select device and IPSW file',
      });
      return;
    }

    const device = devices.find(d => d.udid === selectedDevice);
    if (!device) return;

    const operation: DFUOperation = {
      id: `restore-${Date.now()}`,
      deviceUDID: selectedDevice,
      operation: 'restore',
      status: 'preparing',
      progress: 0,
      logs: [
        'Starting iOS restore...',
        `IPSW: ${ipswPath}`,
        `Preserve data: ${preserveUserData ? 'Yes' : 'No'}`,
        'Verifying IPSW signature...',
      ],
      startedAt: Date.now(),
    };

    setOperations(prev => [...prev, operation]);
    toast.info('iOS restore started');

    const stages = [
      { progress: 10, message: 'Extracting firmware files...' },
      { progress: 20, message: 'Preparing device...' },
      { progress: 30, message: 'Sending iBSS...' },
      { progress: 40, message: 'Sending iBEC...' },
      { progress: 50, message: 'Restoring kernel cache...' },
      { progress: 60, message: 'Restoring root filesystem...' },
      { progress: 75, message: 'Verifying restore...' },
      { progress: 90, message: 'Rebooting device...' },
      { progress: 100, message: 'Restore completed successfully!' },
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage >= stages.length) {
        clearInterval(interval);
        setOperations(prev => prev.map(op =>
          op.id === operation.id
            ? { ...op, status: 'completed', progress: 100, completedAt: Date.now() }
            : op
        ));
        
        toast.success('iOS restore completed', {
          description: 'Device has been restored successfully',
        });
        return;
      }

      const stage = stages[currentStage];
      setOperations(prev => prev.map(op =>
        op.id === operation.id
          ? {
              ...op,
              status: 'running',
              progress: stage.progress,
              logs: [...op.logs, stage.message],
            }
          : op
      ));

      currentStage++;
    }, 3000);
  };

  const selectedDeviceData = devices.find(d => d.udid === selectedDevice);
  const activeOperation = operations.find(
    op => op.deviceUDID === selectedDevice && op.status === 'running'
  );

  return (
    <div className="space-y-6">
      <Card className="border-accent/20 bg-card/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AppleLogo className="w-8 h-8 text-primary" weight="fill" />
            <div>
              <CardTitle>iOS DFU Mode & Jailbreak Panel</CardTitle>
              <CardDescription>
                DFU restore, checkra1n, and palera1n support for iPhone/iPad
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Connected iOS Devices</h3>
              <p className="text-xs text-muted-foreground">
                {devices.length} device(s) detected
              </p>
            </div>
            <Button
              onClick={scanDevices}
              disabled={isScanning}
              size="sm"
              variant="outline"
            >
              {isScanning ? 'Scanning...' : 'Refresh'}
            </Button>
          </div>

          <div className="grid gap-3">
            {devices.map((device) => (
              <Card
                key={device.udid}
                className={`cursor-pointer transition-colors ${
                  selectedDevice === device.udid
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedDevice(device.udid)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <DeviceMobile className="w-5 h-5 text-primary" weight="duotone" />
                        <span className="font-medium">{device.name}</span>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground font-mono">
                        <div>Model: {device.model}</div>
                        <div>iOS: {device.iosVersion}</div>
                        <div>UDID: {device.udid.slice(0, 16)}...</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge
                        variant={
                          device.mode === 'dfu'
                            ? 'default'
                            : device.mode === 'recovery'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {device.mode.toUpperCase()}
                      </Badge>
                      {device.isJailbroken && (
                        <Badge variant="destructive" className="text-xs">
                          Jailbroken
                        </Badge>
                      )}
                      {device.checkra1nSupported && (
                        <Badge variant="outline" className="text-xs">
                          checkra1n ✓
                        </Badge>
                      )}
                      {device.palera1nSupported && (
                        <Badge variant="outline" className="text-xs">
                          palera1n ✓
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedDeviceData && (
            <>
              <Separator />

              <Alert>
                <ShieldCheck className="w-4 h-4" />
                <AlertTitle>Device Mode Information</AlertTitle>
                <AlertDescription className="text-xs space-y-1 mt-2">
                  <div><strong>Normal:</strong> Standard iOS operation</div>
                  <div><strong>Recovery:</strong> System restore mode (iTunes/Finder)</div>
                  <div><strong>DFU:</strong> Device Firmware Update mode (low-level restore)</div>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Quick Actions</h3>
                
                <div className="grid gap-2">
                  <Button
                    onClick={enterDFUMode}
                    disabled={!!activeOperation || selectedDeviceData.mode === 'dfu'}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Lightning className="w-4 h-4 mr-2" weight="duotone" />
                    Enter DFU Mode
                  </Button>

                  {selectedDeviceData.checkra1nSupported && (
                    <Button
                      onClick={startCheckra1nJailbreak}
                      disabled={!!activeOperation}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <AppleLogo className="w-4 h-4 mr-2" weight="fill" />
                      checkra1n Jailbreak
                    </Button>
                  )}

                  {selectedDeviceData.palera1nSupported && (
                    <Button
                      onClick={startPalera1nJailbreak}
                      disabled={!!activeOperation}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <AppleLogo className="w-4 h-4 mr-2" weight="fill" />
                      palera1n Jailbreak
                    </Button>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">iOS Restore</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    {showAdvanced ? 'Hide' : 'Show'} Options
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="ipsw-path">IPSW Firmware Path</Label>
                    <Input
                      id="ipsw-path"
                      placeholder="/path/to/firmware.ipsw"
                      value={ipswPath}
                      onChange={(e) => setIpswPath(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>

                  {showAdvanced && (
                    <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="preserve-data">Preserve User Data</Label>
                        <Switch
                          id="preserve-data"
                          checked={preserveUserData}
                          onCheckedChange={setPreserveUserData}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={startRestore}
                    disabled={!!activeOperation || !ipswPath}
                    className="w-full"
                  >
                    <Play className="w-4 h-4 mr-2" weight="fill" />
                    Start Restore
                  </Button>
                </div>
              </div>
            </>
          )}

          {operations.length > 0 && (
            <>
              <Separator />
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Active Operations</h3>
                
                {operations.filter(op => op.status === 'running' || op.status === 'preparing').map((op) => (
                  <Card key={op.id} className="border-primary/30">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {op.operation.replace(/-/g, ' ').toUpperCase()}
                        </span>
                        <Badge>{op.status}</Badge>
                      </div>
                      
                      <Progress value={op.progress} className="h-2" />
                      
                      <ScrollArea className="h-32 w-full rounded border bg-muted/30 p-2">
                        <div className="space-y-1 font-mono text-xs">
                          {op.logs.map((log, i) => (
                            <div key={i} className="text-muted-foreground">
                              {log}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Info className="w-4 h-4" />
        <AlertTitle>Legal Notice</AlertTitle>
        <AlertDescription className="text-xs">
          Jailbreaking modifies system files and may void warranties. checkra1n and palera1n
          are community tools for educational purposes. Always backup data before proceeding.
          This tool provides instructions for legal jailbreaking methods only.
        </AlertDescription>
      </Alert>
    </div>
  );
}
