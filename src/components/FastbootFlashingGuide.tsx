import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Lightning, 
  Warning, 
  ShieldCheck, 
  CheckCircle,
  Info,
  LockKey,
  ArrowRight
} from '@phosphor-icons/react';

export function FastbootFlashingGuide() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Info size={20} className="text-primary" />
          <CardTitle>Fastboot Flashing Quick Start</CardTitle>
        </div>
        <CardDescription>
          Essential guide for safe firmware deployment and bootloader operations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Warning size={16} />
          <AlertTitle>Important Safety Notice</AlertTitle>
          <AlertDescription>
            Firmware flashing and bootloader operations can permanently damage your device if done incorrectly. 
            Always verify you have the correct firmware files for your specific device model.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Lightning size={18} weight="fill" className="text-amber-500" />
              Before You Start
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle size={16} weight="fill" className="text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Backup Your Data:</span> All data will be erased during bootloader unlock and may be lost if flashing fails
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} weight="fill" className="text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Battery Charge:</span> Ensure device has at least 50% battery to prevent interruption
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} weight="fill" className="text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">USB Cable:</span> Use a high-quality USB cable and avoid USB hubs
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} weight="fill" className="text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Correct Firmware:</span> Verify firmware files match your exact device model and variant
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} weight="fill" className="text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Stock Firmware Ready:</span> Have official stock firmware available in case recovery is needed
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <ArrowRight size={18} weight="bold" className="text-blue-500" />
              Getting Device into Fastboot Mode
            </h3>
            <div className="bg-muted rounded-lg p-4 space-y-3 text-sm">
              <div>
                <span className="font-medium text-primary">Method 1: Hardware Buttons</span>
                <ol className="list-decimal list-inside mt-1 space-y-1 ml-2">
                  <li>Power off the device completely</li>
                  <li>Hold Volume Down + Power button simultaneously</li>
                  <li>Release when fastboot/bootloader screen appears</li>
                </ol>
              </div>
              <div>
                <span className="font-medium text-primary">Method 2: ADB Command</span>
                <div className="bg-background rounded border p-2 mt-1 font-mono text-xs">
                  adb reboot bootloader
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <LockKey size={18} weight="fill" className="text-purple-500" />
              Bootloader Unlock Process
            </h3>
            <Alert variant="destructive" className="mb-3">
              <Warning size={16} />
              <AlertDescription>
                <strong>This will erase all data on your device and void the warranty!</strong>
              </AlertDescription>
            </Alert>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground font-medium min-w-6">1.</span>
                <div>Enable <strong>OEM unlocking</strong> in Settings → Developer Options before rebooting to fastboot</div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground font-medium min-w-6">2.</span>
                <div>Boot device into fastboot mode using methods above</div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground font-medium min-w-6">3.</span>
                <div>Navigate to the <strong>Bootloader</strong> tab in the Fastboot Flashing Panel</div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground font-medium min-w-6">4.</span>
                <div>Select your device and click <strong>Unlock Bootloader</strong></div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground font-medium min-w-6">5.</span>
                <div>Confirm the operation and follow on-screen device prompts</div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground font-medium min-w-6">6.</span>
                <div>Device will erase all data and reboot automatically</div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Partition Categories</h3>
            <div className="grid gap-2">
              <div className="flex items-start gap-2 text-sm">
                <Badge variant="destructive" className="mt-0.5">Critical</Badge>
                <div>
                  <strong>boot, system, vendor, bootloader, radio, aboot, vbmeta</strong> - 
                  Flashing incorrect images to these partitions can brick your device
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Badge variant="outline" className="mt-0.5">Safe</Badge>
                <div>
                  <strong>cache, userdata</strong> - 
                  Safe to erase; userdata erasure = factory reset
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Badge variant="secondary" className="mt-0.5">Other</Badge>
                <div>
                  <strong>recovery, dtbo, persist</strong> - 
                  Important but less critical; proceed with caution
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <ShieldCheck size={18} weight="fill" className="text-green-500" />
              Safety Features
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} weight="fill" className="text-green-500" />
                <span>Multiple confirmation prompts for critical operations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} weight="fill" className="text-green-500" />
                <span>Critical partition protection prevents accidental erasure</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} weight="fill" className="text-green-500" />
                <span>File type validation (.img and .bin only)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} weight="fill" className="text-green-500" />
                <span>Complete operation history for audit trail</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} weight="fill" className="text-green-500" />
                <span>Detailed error messages for troubleshooting</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Common Use Cases</h3>
            <div className="space-y-3">
              <div className="rounded-lg border p-3 text-sm">
                <div className="font-medium mb-1">Install Custom ROM</div>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                  <li>Unlock bootloader</li>
                  <li>Flash custom recovery (recovery partition)</li>
                  <li>Flash ROM through recovery or fastboot</li>
                </ol>
              </div>
              <div className="rounded-lg border p-3 text-sm">
                <div className="font-medium mb-1">Update Firmware</div>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                  <li>Download official firmware for your device</li>
                  <li>Extract .img files from package</li>
                  <li>Flash each partition individually or use flash-all script</li>
                </ol>
              </div>
              <div className="rounded-lg border p-3 text-sm">
                <div className="font-medium mb-1">Fix Boot Issues</div>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                  <li>Flash stock boot.img to restore kernel</li>
                  <li>Erase cache partition</li>
                  <li>Optionally factory reset via userdata erase</li>
                </ol>
              </div>
            </div>
          </div>

          <Alert>
            <Info size={16} />
            <AlertTitle>Need Help?</AlertTitle>
            <AlertDescription>
              Consult your device's XDA Developers forum thread for device-specific instructions and troubleshooting.
              Always read the complete installation guide before proceeding.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}
