import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  ShieldCheck,
  LockKey,
  Warning,
  Info,
  CheckCircle,
  Question,
  BookOpen,
  Path,
  Phone,
  DeviceMobile,
  Cpu,
} from '@phosphor-icons/react';

interface SecurityLockStatus {
  device: string;
  frpStatus: 'active' | 'inactive' | 'unknown';
  mdmStatus: 'enrolled' | 'not_enrolled' | 'unknown';
  carrierLock: 'locked' | 'unlocked' | 'unknown';
  bootloaderLock: 'locked' | 'unlocked' | 'unknown';
}

export function SecurityLockEducationPanel() {
  const [deviceStatus, setDeviceStatus] = useState<SecurityLockStatus | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const scanDevice = async () => {
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setDeviceStatus({
      device: 'Samsung Galaxy A52',
      frpStatus: 'active',
      mdmStatus: 'not_enrolled',
      carrierLock: 'unlocked',
      bootloaderLock: 'locked',
    });
    setIsScanning(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-accent/30 bg-gradient-to-br from-card/90 to-card/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-10 h-10 text-accent" weight="duotone" />
              <div>
                <CardTitle className="text-2xl font-display">Security Lock Education Center</CardTitle>
                <CardDescription className="text-base mt-1">
                  Understanding device security features and legitimate recovery paths
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Info className="w-4 h-4" />
            <AlertTitle>What This Panel Provides</AlertTitle>
            <AlertDescription>
              This panel helps you understand device security features (FRP, MDM, carrier locks) and provides
              <strong className="text-foreground"> legitimate, legal recovery methods only</strong>. We do not provide
              or support bypass tools, hacks, or workarounds.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="detect" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="detect">Detect</TabsTrigger>
              <TabsTrigger value="learn">Learn</TabsTrigger>
              <TabsTrigger value="recovery">Recovery</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="detect" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Scan your device to detect security lock status
                </p>
                <Button onClick={scanDevice} disabled={isScanning}>
                  {isScanning ? 'Scanning...' : 'Scan Device'}
                </Button>
              </div>

              {deviceStatus ? (
                <div className="space-y-3">
                  <Card className="border-secondary/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-medium flex items-center gap-2">
                          <Phone className="w-5 h-5 text-primary" weight="duotone" />
                          {deviceStatus.device}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Factory Reset Protection (FRP)</span>
                          <Badge variant={deviceStatus.frpStatus === 'active' ? 'destructive' : 'default'}>
                            {deviceStatus.frpStatus}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Mobile Device Management (MDM)</span>
                          <Badge variant={deviceStatus.mdmStatus === 'enrolled' ? 'secondary' : 'default'}>
                            {deviceStatus.mdmStatus}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Carrier Lock</span>
                          <Badge variant={deviceStatus.carrierLock === 'locked' ? 'secondary' : 'default'}>
                            {deviceStatus.carrierLock}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Bootloader Lock</span>
                          <Badge variant={deviceStatus.bootloaderLock === 'locked' ? 'secondary' : 'default'}>
                            {deviceStatus.bootloaderLock}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {deviceStatus.frpStatus === 'active' && (
                    <Alert>
                      <Warning className="w-4 h-4" />
                      <AlertTitle>FRP Active</AlertTitle>
                      <AlertDescription>
                        This device has Factory Reset Protection enabled. See the "Recovery" tab for legitimate
                        recovery methods.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <Alert>
                  <DeviceMobile className="w-4 h-4" />
                  <AlertTitle>No device scanned</AlertTitle>
                  <AlertDescription>
                    Connect a device and click "Scan Device" to detect security lock status
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="learn" className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="frp">
                  <AccordionTrigger className="text-base font-medium">
                    <div className="flex items-center gap-2">
                      <LockKey className="w-5 h-5 text-primary" weight="duotone" />
                      What is Factory Reset Protection (FRP)?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>
                        Factory Reset Protection (FRP) is a security feature introduced by Google in Android 5.1 (Lollipop).
                        When you set up a Google account on your device, FRP is automatically activated.
                      </p>
                      <p className="font-medium text-foreground">Why FRP Exists:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Protects your device from unauthorized factory resets</li>
                        <li>Deters theft by making stolen devices unusable</li>
                        <li>Ensures only the rightful owner can set up the device after a reset</li>
                        <li>Requires the original Google account credentials to proceed</li>
                      </ul>
                      <p className="text-xs text-warning mt-3">
                        ⚠️ FRP is a critical anti-theft feature. Attempting to bypass it without proper authorization
                        may violate laws in your jurisdiction.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="mdm">
                  <AccordionTrigger className="text-base font-medium">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-secondary" weight="duotone" />
                      What is Mobile Device Management (MDM)?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>
                        Mobile Device Management (MDM) is software that allows organizations (employers, schools)
                        to manage and secure mobile devices used by their employees or students.
                      </p>
                      <p className="font-medium text-foreground">Common MDM Features:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Remote device configuration and policy enforcement</li>
                        <li>App installation and restriction controls</li>
                        <li>Device location tracking and remote wipe</li>
                        <li>Network and data usage monitoring</li>
                      </ul>
                      <p className="font-medium text-foreground mt-3">Apple Business Manager / iOS MDM:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Devices enrolled in Apple Business Manager cannot be removed from MDM without admin authorization</li>
                        <li>Attempting to bypass MDM on organization-owned devices is illegal</li>
                        <li>Contact your IT administrator for legitimate device removal</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="carrier">
                  <AccordionTrigger className="text-base font-medium">
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-accent" weight="duotone" />
                      What is a Carrier Lock?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>
                        A carrier lock (SIM lock) restricts your device to work only with a specific mobile carrier
                        until the device is paid off or unlocked by the carrier.
                      </p>
                      <p className="font-medium text-foreground">Why Carrier Locks Exist:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Carriers subsidize phone costs with contracts</li>
                        <li>Locks ensure contract fulfillment before device can be used elsewhere</li>
                        <li>Prevents resale of subsidized devices before payment completion</li>
                      </ul>
                      <p className="font-medium text-foreground mt-3">Legal Unlock Methods:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Contact your carrier's customer service after contract completion</li>
                        <li>Pay off remaining device balance if on payment plan</li>
                        <li>Request unlock code (usually provided within 2-5 business days)</li>
                        <li>Use official carrier unlock request websites</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="bootloader">
                  <AccordionTrigger className="text-base font-medium">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-primary" weight="duotone" />
                      What is a Bootloader Lock?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>
                        A bootloader lock prevents unauthorized firmware from being installed on your device,
                        ensuring only verified software from the manufacturer can run.
                      </p>
                      <p className="font-medium text-foreground">Why Bootloader Locks Exist:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Protects device integrity and security</li>
                        <li>Prevents installation of malicious or unstable firmware</li>
                        <li>Maintains warranty and support eligibility</li>
                      </ul>
                      <p className="font-medium text-foreground mt-3">Legal Unlock Methods:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Google Pixel: Use official fastboot unlock commands (voids warranty)</li>
                        <li>OnePlus: Request unlock token from official website</li>
                        <li>Motorola: Generate unlock code via official Motorola unlock site</li>
                        <li>Samsung: Generally locked; only developer editions support unlock</li>
                      </ul>
                      <p className="text-xs text-warning mt-3">
                        ⚠️ Unlocking bootloader typically voids warranty and may compromise device security.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            <TabsContent value="recovery" className="space-y-4">
              <Alert>
                <Path className="w-4 h-4" />
                <AlertTitle>Legitimate Recovery Paths Only</AlertTitle>
                <AlertDescription>
                  These are the only legal and ethical methods to recover access to a security-locked device.
                  Any method not listed here is likely illegal and/or will damage your device.
                </AlertDescription>
              </Alert>

              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" weight="fill" />
                    FRP Recovery Methods
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">Method 1: Sign in with Original Google Account</p>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                      <li>Enter the email address that was signed in before the factory reset</li>
                      <li>Enter the password for that account</li>
                      <li>This is the intended and fastest recovery method</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-foreground">Method 2: Google Account Recovery</p>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                      <li>If you forgot your password, use Google Account Recovery</li>
                      <li>Visit: accounts.google.com/signin/recovery</li>
                      <li>Follow the prompts to verify your identity (phone, email, security questions)</li>
                      <li>Reset your password and use it to bypass FRP</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-foreground">Method 3: Wait 72 Hours (Some Devices)</p>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                      <li>Some Samsung devices allow FRP bypass after 72 hours of inactivity</li>
                      <li>This is a built-in feature for legitimate owners who lost account access</li>
                      <li>Not available on all models; check manufacturer documentation</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-foreground">Method 4: Proof of Purchase with Manufacturer</p>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                      <li>Contact manufacturer support (Samsung, Google, etc.) with proof of purchase</li>
                      <li>Provide original receipt, IMEI, and government-issued ID</li>
                      <li>Manufacturer may assist with FRP removal verification process</li>
                      <li>This process can take 5-10 business days</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-foreground">Method 5: Contact Previous Owner</p>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                      <li>If you purchased a used device, contact the previous owner</li>
                      <li>Ask them to remove the Google account from their account settings remotely</li>
                      <li>Visit: myaccount.google.com → Security → Manage Devices</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-secondary/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-secondary" weight="fill" />
                    MDM Recovery Methods
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">For Organization-Owned Devices:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                      <li>Contact your IT administrator or company's device management team</li>
                      <li>Provide device serial number and employee ID</li>
                      <li>Follow internal procedures for device return or MDM removal</li>
                      <li>If you left the organization, return the device as it's company property</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-foreground">For Personal Devices Enrolled in MDM:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                      <li>Go to device Settings → General → VPN & Device Management</li>
                      <li>Select the MDM profile and tap "Remove Management"</li>
                      <li>If password-protected, contact your organization's IT department</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-accent/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent" weight="fill" />
                    Carrier Unlock Recovery
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">Official Carrier Unlock Request:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                      <li>Contact customer service: AT&T, Verizon, T-Mobile, etc.</li>
                      <li>Ensure device is fully paid off and account is in good standing</li>
                      <li>Provide IMEI number (dial *#06# to find it)</li>
                      <li>Wait 2-5 business days for unlock code or confirmation</li>
                    </ul>
                  </div>

                  <p className="text-xs text-warning mt-3">
                    ⚠️ Third-party "unlock services" are often scams or use illegal methods. Always use official carrier channels.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" weight="duotone" />
                    Official Support Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">Google / Android:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                      <li>Google Account Recovery: accounts.google.com/signin/recovery</li>
                      <li>Android Device Manager: android.com/find</li>
                      <li>Google Support: support.google.com/android</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-foreground">Apple / iOS:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                      <li>Apple ID Account Recovery: iforgot.apple.com</li>
                      <li>Find My iPhone: icloud.com/find</li>
                      <li>Apple Business Manager Support: business.apple.com</li>
                      <li>Apple Support: support.apple.com</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-foreground">Samsung:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                      <li>Find My Mobile: findmymobile.samsung.com</li>
                      <li>Samsung Account Recovery: account.samsung.com</li>
                      <li>Samsung Support: samsung.com/us/support</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-foreground">US Carriers:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                      <li>AT&T Unlock: att.com/deviceunlock</li>
                      <li>Verizon Unlock: verizon.com/support/unlocking-device</li>
                      <li>T-Mobile Unlock: t-mobile.com/support/devices/unlock-your-device</li>
                      <li>Sprint (now T-Mobile): sprint.com/unlock</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <Warning className="w-4 h-4" />
                <AlertTitle>Legal Disclaimer</AlertTitle>
                <AlertDescription>
                  Bobby's World provides educational information only. We do not offer, support, or endorse any
                  bypass tools, exploits, or unofficial methods to circumvent device security features.
                  Attempting to bypass security features on devices you do not own or do not have authorization
                  to modify may violate federal and state laws, including the Computer Fraud and Abuse Act (CFAA).
                  Always seek legal methods first.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
