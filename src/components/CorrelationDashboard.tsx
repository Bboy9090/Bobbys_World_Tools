import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeviceDossierPanel } from './DeviceDossierPanel';
import { CorrelationBadgeDisplay } from './CorrelationBadgeDisplay';
import { useCorrelationTracking } from '@/hooks/use-correlation-tracking';
import { normalizeScan, normalizeBootForgeUSBRecord } from '@/lib/dossier-normalizer';
import type { DeviceRecord } from '@/types/correlation';
import { 
  MagnifyingGlass, 
  DeviceMobile, 
  Sparkle, 
  ArrowsClockwise,
  ChartBar,
  Link
} from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from '@phosphor-icons/react';

export function CorrelationDashboard() {
  const [demoDevices, setDemoDevices] = useState<DeviceRecord[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { updateDevice, isTracking } = useCorrelationTracking();

  const generateDemoDevices = () => {
    const devices: DeviceRecord[] = [
      {
        id: '[DEMO] device-1',
        serial: '[DEMO] ABC123XYZ',
        vendorId: 0x18d1,
        productId: 0x4ee7,
        platform: 'android',
        mode: 'confirmed_android_os',
        confidence: 0.95,
        matched_tool_ids: ['ABC123XYZ', 'adb-ABC123XYZ'],
      },
      {
        id: '[DEMO] device-2',
        serial: '[DEMO] DEF456UVW',
        vendorId: 0x05ac,
        productId: 0x12a8,
        platform: 'ios',
        mode: 'confirmed_ios',
        confidence: 0.92,
        matched_tool_ids: ['00008030-001A1B2C3D4E567F'],
      },
      {
        id: '[DEMO] device-3',
        serial: '[DEMO] GHI789RST',
        vendorId: 0x18d1,
        productId: 0x4ee2,
        platform: 'android',
        mode: 'bootloader',
        confidence: 0.88,
        matched_tool_ids: ['GHI789RST'],
      },
      {
        id: '[DEMO] device-4',
        vendorId: 0x2717,
        productId: 0xff48,
        platform: 'android',
        mode: 'confirmed_android_os',
        confidence: 0.93,
        matched_tool_ids: [],
      },
      {
        id: '[DEMO] device-5',
        serial: '[DEMO] JKL012MNO',
        vendorId: 0x18d1,
        productId: 0x4ee1,
        platform: 'android',
        mode: 'likely_android',
        confidence: 0.75,
        matched_tool_ids: [],
      },
      {
        id: '[DEMO] device-6',
        vendorId: 0x0bb4,
        productId: 0x0c02,
        platform: 'unknown',
        mode: 'unconfirmed',
        confidence: 0.45,
        matched_tool_ids: [],
      },
    ];

    setDemoDevices(devices);
    setIsDemoMode(true);
    if (devices.length > 0) {
      setSelectedDevice(devices[0].id);
    }
    
    if (isTracking) {
      const { devices: normalizedDevices } = normalizeScan(devices);
      normalizedDevices.forEach((device) => {
        updateDevice(device.id, {
          id: device.id,
          serial: device.detection_evidence.usb_evidence.find(e => e.includes('Serial'))?.split(': ')[1],
          platform: device.platform,
          mode: device.device_mode,
          confidence: device.confidence,
          correlationBadge: device.correlation_badge,
          matchedIds: device.matched_ids,
          correlationNotes: device.correlation_notes,
          vendorId: demoDevices.find(d => d.id === device.id)?.vendorId,
          productId: demoDevices.find(d => d.id === device.id)?.productId,
        });
      });
      toast.success(`[DEMO] Pushed ${normalizedDevices.length} demo devices to correlation tracker`);
    }
  };

  const { devices: normalizedDevices, summary } = normalizeScan(demoDevices);

  const selectedDossier = normalizedDevices.find(d => d.id === selectedDevice);

  return (
    <div className="space-y-6">
      {isDemoMode && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <Info className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-600 dark:text-amber-400">Demo Mode</AlertTitle>
          <AlertDescription className="text-amber-600/90 dark:text-amber-400/90">
            Showing demonstration data to illustrate correlation tracking features. Connect real devices to see live correlation.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Sparkle className="w-8 h-8 text-accent" weight="duotone" />
            Correlation Tracking Dashboard
            {isTracking && (
              <Badge className="bg-accent/20 text-accent border-accent/30">
                <Link className="w-3 h-3 mr-1" weight="bold" />
                Feeding Live Tracker
              </Badge>
            )}
          </h2>
          <p className="text-muted-foreground mt-1">
            Per-device correlation with enhanced policy gates
          </p>
        </div>
        <Button onClick={generateDemoDevices} variant="outline" className="gap-2">
          <ArrowsClockwise className="w-4 h-4" weight="bold" />
          Load Demo Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Devices</CardDescription>
            <CardTitle className="text-3xl">{summary.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-accent">
          <CardHeader className="pb-3">
            <CardDescription>Correlated</CardDescription>
            <CardTitle className="text-3xl text-accent">{summary.correlated}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress 
              value={(summary.correlated / summary.total) * 100} 
              className="h-2"
            />
          </CardContent>
        </Card>

        <Card className="border-primary">
          <CardHeader className="pb-3">
            <CardDescription>System Confirmed</CardDescription>
            <CardTitle className="text-3xl text-primary">{summary.system_confirmed}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress 
              value={(summary.system_confirmed / summary.total) * 100} 
              className="h-2"
            />
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader className="pb-3">
            <CardDescription>Unconfirmed</CardDescription>
            <CardTitle className="text-3xl text-destructive">{summary.unconfirmed}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress 
              value={(summary.unconfirmed / summary.total) * 100} 
              className="h-2"
            />
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedDevice || undefined} onValueChange={setSelectedDevice} className="w-full">
        <TabsList className="w-full grid grid-cols-6 mb-6">
          {normalizedDevices.map((device, idx) => (
            <TabsTrigger key={device.id} value={device.id} className="gap-2 flex-col py-3">
              <DeviceMobile className="w-4 h-4" weight="duotone" />
              <span className="text-xs">Device {idx + 1}</span>
              <CorrelationBadgeDisplay 
                badge={device.correlation_badge} 
                className="scale-75"
              />
            </TabsTrigger>
          ))}
        </TabsList>

        {normalizedDevices.map((device) => (
          <TabsContent key={device.id} value={device.id}>
            <DeviceDossierPanel dossier={device} />
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBar className="w-5 h-5 text-primary" weight="duotone" />
            Correlation Distribution
          </CardTitle>
          <CardDescription>
            Device correlation status breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {normalizedDevices.map((device, idx) => (
              <div key={device.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">Device {idx + 1}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {device.platform}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CorrelationBadgeDisplay 
                    badge={device.correlation_badge}
                    matchedIds={device.matched_ids}
                  />
                  <Badge variant="outline">
                    {(device.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MagnifyingGlass className="w-5 h-5 text-primary" weight="duotone" />
            About Correlation Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">CORRELATED:</strong> Per-device correlation with matched tool IDs. 
            High confidence (≥90%) with confirmed mode.
          </p>
          <p>
            <strong className="text-foreground">CORRELATED (WEAK):</strong> Matched tool IDs present, 
            but mode not strongly confirmed or lower confidence.
          </p>
          <p>
            <strong className="text-foreground">SYSTEM-CONFIRMED:</strong> System-level confirmation exists, 
            but not mapped to specific USB record.
          </p>
          <p>
            <strong className="text-foreground">LIKELY:</strong> Detection suggests probable platform/mode 
            but lacks strong confirmation.
          </p>
          <p>
            <strong className="text-foreground">UNCONFIRMED:</strong> Insufficient evidence for confident classification.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
