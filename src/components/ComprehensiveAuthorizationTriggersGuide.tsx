import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  ShieldCheck,
  ShieldWarning,
  DeviceMobile,
  Lightning,
  LockKey,
  FileArrowUp,
  Database,
  Fingerprint,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  Warning,
  AndroidLogo,
  AppleLogo,
  Terminal,
  Cpu,
  HardDrive,
  UserCircle,
  Eye,
  Fire
} from '@phosphor-icons/react';

interface TriggerInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  command: string;
  userSees: string;
  requiresUserAction: boolean;
  destructive: boolean;
  platforms: string[];
  category: 'trust' | 'operation' | 'diagnostic' | 'policy' | 'connection' | 'advanced';
}

const ALL_TRIGGERS: TriggerInfo[] = [
  {
    id: 'adb_usb_debug',
    name: 'USB Debugging Authorization',
    description: 'Triggers the "Allow USB debugging?" dialog on Android device with computer fingerprint',
    icon: <AndroidLogo className="w-4 h-4" />,
    command: 'adb -s {serial} shell getprop',
    userSees: '"Allow USB debugging?" dialog with RSA key fingerprint',
    requiresUserAction: true,
    destructive: false,
    platforms: ['Android', 'Samsung'],
    category: 'trust',
  },
  {
    id: 'adb_file_transfer',
    name: 'File Transfer Permission',
    description: 'Triggers file transfer permission dialog by attempting to push a test file',
    icon: <FileArrowUp className="w-4 h-4" />,
    command: 'adb -s {serial} push test.txt /sdcard/',
    userSees: '"Allow access to device files?" prompt',
    requiresUserAction: true,
    destructive: false,
    platforms: ['Android', 'Samsung'],
    category: 'trust',
  },
  {
    id: 'adb_backup_auth',
    name: 'Backup Authorization',
    description: 'Triggers backup authorization and optional encryption password dialog',
    icon: <Database className="w-4 h-4" />,
    command: 'adb -s {serial} backup -noapk com.android.settings',
    userSees: '"Allow backup?" with optional encryption password field',
    requiresUserAction: true,
    destructive: false,
    platforms: ['Android', 'Samsung'],
    category: 'trust',
  },
  {
    id: 'adb_install_confirm',
    name: 'App Installation Confirmation',
    description: 'Triggers app installation confirmation dialog from computer',
    icon: <AndroidLogo className="w-4 h-4" />,
    command: 'adb -s {serial} install -r app.apk',
    userSees: '"Install this app from your computer?" prompt',
    requiresUserAction: true,
    destructive: false,
    platforms: ['Android', 'Samsung'],
    category: 'operation',
  },
  {
    id: 'ios_trust_computer',
    name: 'Trust This Computer',
    description: 'Triggers the iOS "Trust This Computer?" dialog requiring passcode entry',
    icon: <AppleLogo className="w-4 h-4" />,
    command: 'ideviceinfo -u {udid}',
    userSees: '"Trust This Computer?" dialog + passcode entry',
    requiresUserAction: true,
    destructive: false,
    platforms: ['iOS'],
    category: 'trust',
  },
  {
    id: 'ios_pairing',
    name: 'iOS Pairing Request',
    description: 'Sends pairing request requiring user to enter device passcode',
    icon: <Fingerprint className="w-4 h-4" />,
    command: 'idevicepair -u {udid} pair',
    userSees: 'Pairing notification + passcode entry requirement',
    requiresUserAction: true,
    destructive: false,
    platforms: ['iOS'],
    category: 'trust',
  },
  {
    id: 'ios_backup_encryption',
    name: 'iOS Backup Encryption',
    description: 'Triggers backup encryption setup dialog on iOS device',
    icon: <LockKey className="w-4 h-4" />,
    command: 'idevicebackup2 -u {udid} info',
    userSees: '"Would you like to encrypt your backups?" with password setup',
    requiresUserAction: true,
    destructive: false,
    platforms: ['iOS'],
    category: 'trust',
  },
  {
    id: 'ios_app_install_trust',
    name: 'iOS App Installation Trust',
    description: 'Prompts user to trust developer for non-App Store app installation',
    icon: <AppleLogo className="w-4 h-4" />,
    command: 'ideviceinstaller -u {udid} -i app.ipa',
    userSees: '"Do you want to install this app?" on device',
    requiresUserAction: true,
    destructive: false,
    platforms: ['iOS'],
    category: 'trust',
  },
  {
    id: 'flash_firmware',
    name: 'Flash Firmware Partition',
    description: 'Flashes firmware to specific partition - CANNOT BE UNDONE',
    icon: <Fire className="w-4 h-4" />,
    command: 'fastboot -s {serial} flash system system.img',
    userSees: 'Confirmation dialog: "Flash system partition? This cannot be undone"',
    requiresUserAction: true,
    destructive: true,
    platforms: ['Android', 'Samsung'],
    category: 'operation',
  },
  {
    id: 'batch_flash',
    name: 'Batch Flash Multiple Partitions',
    description: 'Flashes multiple partitions sequentially - DESTRUCTIVE',
    icon: <Lightning className="w-4 h-4" />,
    command: 'fastboot flash {partition1} {img1} && fastboot flash {partition2} {img2}',
    userSees: 'Partition list + "Type CONFIRM to proceed"',
    requiresUserAction: true,
    destructive: true,
    platforms: ['Android', 'Samsung'],
    category: 'operation',
  },
  {
    id: 'factory_reset',
    name: 'Factory Reset Device',
    description: 'Completely erases all user data - PERMANENT DATA LOSS',
    icon: <ShieldWarning className="w-4 h-4" />,
    command: 'fastboot -w',
    userSees: '"Type FACTORY RESET to confirm data erasure"',
    requiresUserAction: true,
    destructive: true,
    platforms: ['Android', 'Samsung', 'iOS'],
    category: 'operation',
  },
  {
    id: 'bootloader_unlock',
    name: 'Unlock Bootloader',
    description: 'Unlocks bootloader - ERASES ALL DATA and voids warranty',
    icon: <LockKey className="w-4 h-4" />,
    command: 'fastboot oem unlock',
    userSees: '"This will ERASE ALL DATA. Type UNLOCK to confirm"',
    requiresUserAction: true,
    destructive: true,
    platforms: ['Android', 'Samsung'],
    category: 'operation',
  },
  {
    id: 'format_userdata',
    name: 'Format Userdata Partition',
    description: 'Formats userdata partition - ALL USER DATA PERMANENTLY ERASED',
    icon: <HardDrive className="w-4 h-4" />,
    command: 'fastboot format:ext4 userdata',
    userSees: '"All user data will be permanently erased"',
    requiresUserAction: true,
    destructive: true,
    platforms: ['Android', 'Samsung'],
    category: 'operation',
  },
  {
    id: 'reboot_recovery',
    name: 'Reboot to Recovery Mode',
    description: 'Reboots device into recovery menu for advanced operations',
    icon: <Terminal className="w-4 h-4" />,
    command: 'adb reboot recovery',
    userSees: 'Device automatically reboots into recovery menu',
    requiresUserAction: false,
    destructive: false,
    platforms: ['Android', 'Samsung'],
    category: 'operation',
  },
  {
    id: 'reboot_bootloader',
    name: 'Reboot to Bootloader',
    description: 'Reboots device into fastboot/bootloader mode',
    icon: <Cpu className="w-4 h-4" />,
    command: 'adb reboot bootloader',
    userSees: 'Device reboots into fastboot mode (shows fastboot logo)',
    requiresUserAction: false,
    destructive: false,
    platforms: ['Android', 'Samsung'],
    category: 'operation',
  },
  {
    id: 'reboot_edl',
    name: 'Reboot to EDL Mode',
    description: 'Reboots Qualcomm device into Emergency Download Mode',
    icon: <Lightning className="w-4 h-4" />,
    command: 'adb reboot edl',
    userSees: 'Device screen goes black (EDL mode - low-level flash)',
    requiresUserAction: false,
    destructive: false,
    platforms: ['Qualcomm'],
    category: 'operation',
  },
  {
    id: 'ios_dfu_mode',
    name: 'iOS DFU Mode Entry',
    description: 'Guides user into DFU mode for device restore',
    icon: <AppleLogo className="w-4 h-4" />,
    command: 'ideviceenterrecovery {udid}',
    userSees: 'On-screen instructions: "Hold Power + Home for 10 seconds..."',
    requiresUserAction: true,
    destructive: false,
    platforms: ['iOS'],
    category: 'operation',
  },
  {
    id: 'run_diagnostics',
    name: 'Run Full Device Diagnostics',
    description: 'Executes comprehensive health check (battery, storage, sensors, connectivity)',
    icon: <CheckCircle className="w-4 h-4" />,
    command: 'Multiple diagnostic probes',
    userSees: '"Run diagnostics on {device}?" confirmation',
    requiresUserAction: true,
    destructive: false,
    platforms: ['Android', 'Samsung', 'iOS'],
    category: 'diagnostic',
  },
  {
    id: 'export_evidence',
    name: 'Export Evidence Bundle',
    description: 'Generates signed diagnostic report with chain-of-custody',
    icon: <FileArrowUp className="w-4 h-4" />,
    command: 'Generate + GPG sign evidence bundle',
    userSees: '"Export evidence for {device}?" with recipient email',
    requiresUserAction: true,
    destructive: false,
    platforms: ['All'],
    category: 'diagnostic',
  },
  {
    id: 'collect_adb_logs',
    name: 'Collect ADB Logs',
    description: 'Captures system logs via ADB logcat',
    icon: <Terminal className="w-4 h-4" />,
    command: 'adb logcat -d > logs.txt',
    userSees: 'No prompt (automatic log collection)',
    requiresUserAction: false,
    destructive: false,
    platforms: ['Android', 'Samsung'],
    category: 'diagnostic',
  },
  {
    id: 'collect_ios_crash_logs',
    name: 'Capture iOS Crash Logs',
    description: 'Retrieves crash reports from iOS device',
    icon: <AppleLogo className="w-4 h-4" />,
    command: 'idevicecrashreport -e',
    userSees: 'No prompt (automatic crash log extraction)',
    requiresUserAction: false,
    destructive: false,
    platforms: ['iOS'],
    category: 'diagnostic',
  },
  {
    id: 'benchmark_flash_speed',
    name: 'Benchmark Flash Speed',
    description: 'Runs timed flash operations to profile device performance',
    icon: <Lightning className="w-4 h-4" />,
    command: 'Timed fastboot flash operations',
    userSees: '"Start benchmark?" with warning about test duration',
    requiresUserAction: true,
    destructive: false,
    platforms: ['Android', 'Samsung'],
    category: 'diagnostic',
  },
  {
    id: 'auto_snapshot',
    name: 'Automatic Snapshot After Diagnostics',
    description: 'Automatically saves diagnostic results to snapshots',
    icon: <Database className="w-4 h-4" />,
    command: 'Save to .pandora_private/snapshots/',
    userSees: 'No prompt (automatic after diagnostic completion)',
    requiresUserAction: false,
    destructive: false,
    platforms: ['All'],
    category: 'diagnostic',
  },
  {
    id: 'manual_snapshot',
    name: 'Manual Device Snapshot',
    description: 'Creates timestamped snapshot of current device state',
    icon: <Database className="w-4 h-4" />,
    command: 'Create snapshot with metadata',
    userSees: '"Save current device state?" confirmation',
    requiresUserAction: true,
    destructive: false,
    platforms: ['All'],
    category: 'diagnostic',
  },
  {
    id: 'workspace_backup',
    name: 'Workspace Backup',
    description: 'Archives entire workspace including evidence bundles',
    icon: <FileArrowUp className="w-4 h-4" />,
    command: 'tar + compress workspace directory',
    userSees: '"Backup workspace now?" with destination path',
    requiresUserAction: true,
    destructive: false,
    platforms: ['All'],
    category: 'diagnostic',
  },
  {
    id: 'bootloader_unlock_policy',
    name: 'Bootloader Unlock (Policy Enforced)',
    description: 'Bootloader unlock with RBAC policy and typed confirmation',
    icon: <UserCircle className="w-4 h-4" />,
    command: 'fastboot oem unlock',
    userSees: 'Role check + "Type UNLOCK to confirm" + audit log',
    requiresUserAction: true,
    destructive: true,
    platforms: ['Android', 'Samsung'],
    category: 'policy',
  },
  {
    id: 'supervisor_approval',
    name: 'Supervisor Approval Required',
    description: 'High-risk operation requiring supervisor PIN entry',
    icon: <LockKey className="w-4 h-4" />,
    command: 'Any high-risk operation',
    userSees: '"Supervisor approval required. Enter supervisor PIN"',
    requiresUserAction: true,
    destructive: true,
    platforms: ['All'],
    category: 'policy',
  },
  {
    id: 'evidence_audit_consent',
    name: 'Evidence Recording Consent',
    description: 'Confirms user consent for operation to be recorded and audited',
    icon: <Eye className="w-4 h-4" />,
    command: 'Any auditable operation',
    userSees: '"This operation will be recorded and signed. Continue?"',
    requiresUserAction: true,
    destructive: false,
    platforms: ['All'],
    category: 'policy',
  },
  {
    id: 'hotplug_connect',
    name: 'USB Device Attached',
    description: 'New USB device detected via hotplug event',
    icon: <DeviceMobile className="w-4 h-4" />,
    command: 'USB hotplug detection',
    userSees: 'Toast: "New device detected. Do you want to connect?"',
    requiresUserAction: true,
    destructive: false,
    platforms: ['All'],
    category: 'connection',
  },
  {
    id: 'driver_install_prompt',
    name: 'Driver Installation Prompt',
    description: 'Device detected but driver missing',
    icon: <Warning className="w-4 h-4" />,
    command: 'USB device enumeration',
    userSees: 'Alert: "Driver not found. Install driver for {device}?"',
    requiresUserAction: true,
    destructive: false,
    platforms: ['All'],
    category: 'connection',
  },
  {
    id: 'samsung_download_mode',
    name: 'Samsung Download Mode Verification',
    description: 'Verifies Samsung device in Odin/Download mode',
    icon: <DeviceMobile className="w-4 h-4" />,
    command: 'heimdall detect',
    userSees: '"Samsung device in Download Mode detected"',
    requiresUserAction: false,
    destructive: false,
    platforms: ['Samsung'],
    category: 'advanced',
  },
  {
    id: 'samsung_pit_read',
    name: 'Samsung PIT Partition Table Read',
    description: 'Reads Samsung partition layout via Heimdall',
    icon: <HardDrive className="w-4 h-4" />,
    command: 'heimdall print-pit',
    userSees: 'Partition table displayed in UI',
    requiresUserAction: false,
    destructive: false,
    platforms: ['Samsung'],
    category: 'advanced',
  },
  {
    id: 'edl_verify',
    name: 'Qualcomm EDL Mode Verification',
    description: 'Verifies Qualcomm device in Emergency Download Mode',
    icon: <Lightning className="w-4 h-4" />,
    command: 'edl printgpt',
    userSees: '"EDL mode verified. Partition table:"',
    requiresUserAction: false,
    destructive: false,
    platforms: ['Qualcomm'],
    category: 'advanced',
  },
  {
    id: 'edl_full_erase',
    name: 'EDL Full Device Erase',
    description: 'DESTRUCTIVE: Erases all partitions via EDL mode',
    icon: <ShieldWarning className="w-4 h-4" />,
    command: 'edl e',
    userSees: '"DESTRUCTIVE: Erase all partitions? Type ERASE to confirm"',
    requiresUserAction: true,
    destructive: true,
    platforms: ['Qualcomm'],
    category: 'advanced',
  },
  {
    id: 'mtk_connection',
    name: 'MediaTek Connection Verification',
    description: 'Verifies MediaTek device connection via mtkclient',
    icon: <Cpu className="w-4 h-4" />,
    command: 'python3 mtk_cli.py printgpt',
    userSees: '"MediaTek device detected. Chip: MT6765"',
    requiresUserAction: false,
    destructive: false,
    platforms: ['MediaTek'],
    category: 'advanced',
  },
  {
    id: 'mtk_bootloader_unlock',
    name: 'MediaTek Bootloader Unlock',
    description: 'Unlocks MediaTek bootloader - voids warranty',
    icon: <LockKey className="w-4 h-4" />,
    command: 'python3 mtk_cli.py da seccfg unlock',
    userSees: '"Unlock bootloader? This voids warranty"',
    requiresUserAction: true,
    destructive: true,
    platforms: ['MediaTek'],
    category: 'advanced',
  },
];

export function ComprehensiveAuthorizationTriggersGuide() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All Triggers', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'trust', label: 'Trust & Security', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'operation', label: 'Device Operations', icon: <Lightning className="w-4 h-4" /> },
    { id: 'diagnostic', label: 'Diagnostics & Evidence', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'policy', label: 'Policy & Compliance', icon: <UserCircle className="w-4 h-4" /> },
    { id: 'connection', label: 'Connection & Hotplug', icon: <DeviceMobile className="w-4 h-4" /> },
    { id: 'advanced', label: 'Advanced Platform-Specific', icon: <Cpu className="w-4 h-4" /> },
  ];

  const filteredTriggers = ALL_TRIGGERS.filter((trigger) => {
    const matchesCategory = selectedCategory === 'all' || trigger.category === selectedCategory;
    const matchesSearch = trigger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          trigger.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const destructiveCount = filteredTriggers.filter(t => t.destructive).length;
  const requiresUserActionCount = filteredTriggers.filter(t => t.requiresUserAction).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <ShieldCheck className="w-6 h-6" />
                Comprehensive Authorization Triggers Guide
              </CardTitle>
              <CardDescription className="mt-2">
                Every possible trigger that prompts user interaction, device authorization, or system-level confirmations
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {ALL_TRIGGERS.length} Triggers
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert>
            <Info className="w-4 h-4" />
            <AlertTitle>Real Commands Only</AlertTitle>
            <AlertDescription>
              All triggers execute <strong>real commands</strong> that result in <strong>real device prompts</strong> or <strong>real system checks</strong>. 
              No simulated responses, no ghost values, no placeholders.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{ALL_TRIGGERS.length}</p>
                    <p className="text-sm text-muted-foreground">Total Triggers</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-destructive/10 rounded-lg">
                    <ShieldWarning className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{ALL_TRIGGERS.filter(t => t.destructive).length}</p>
                    <p className="text-sm text-muted-foreground">Destructive Operations</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <UserCircle className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{ALL_TRIGGERS.filter(t => t.requiresUserAction).length}</p>
                    <p className="text-sm text-muted-foreground">Require User Action</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search triggers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-input rounded-lg bg-background"
              />
            </div>

            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid w-full grid-cols-7">
                {categories.map((cat) => (
                  <TabsTrigger key={cat.id} value={cat.id} className="flex items-center gap-2">
                    {cat.icon}
                    <span className="hidden lg:inline">{cat.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedCategory} className="mt-6">
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {filteredTriggers.map((trigger) => (
                      <Card key={trigger.id} className={trigger.destructive ? 'border-destructive/50' : ''}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                trigger.destructive 
                                  ? 'bg-destructive/10 text-destructive'
                                  : 'bg-primary/10 text-primary'
                              }`}>
                                {trigger.icon}
                              </div>
                              <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                  {trigger.name}
                                  {trigger.destructive && (
                                    <Badge variant="destructive" className="text-xs">
                                      DESTRUCTIVE
                                    </Badge>
                                  )}
                                  {trigger.requiresUserAction && (
                                    <Badge variant="outline" className="text-xs">
                                      User Action Required
                                    </Badge>
                                  )}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                  {trigger.description}
                                </CardDescription>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="text-sm font-medium flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-muted-foreground" />
                                Command Executed
                              </p>
                              <code className="block text-xs bg-muted p-2 rounded font-mono">
                                {trigger.command}
                              </code>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium flex items-center gap-2">
                                <Eye className="w-4 h-4 text-muted-foreground" />
                                User Sees
                              </p>
                              <p className="text-xs bg-muted p-2 rounded">
                                {trigger.userSees}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {trigger.platforms.join(', ')}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {trigger.category}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {filteredTriggers.length === 0 && (
                      <Card>
                        <CardContent className="py-12 text-center">
                          <p className="text-muted-foreground">
                            No triggers found matching your search.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          <Alert>
            <Warning className="w-4 h-4" />
            <AlertTitle>Security Best Practices</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                <li><strong>Destructive operations</strong> require typed confirmation (e.g., "Type UNLOCK to confirm")</li>
                <li><strong>High-risk actions</strong> may require supervisor approval or role-based access control</li>
                <li><strong>All operations</strong> are audit-logged with timestamp, device serial, and user identity</li>
                <li><strong>Evidence bundles</strong> are GPG-signed for chain-of-custody verification</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileArrowUp className="w-5 h-5" />
            Implementation Resources
          </CardTitle>
          <CardDescription>
            Backend API documentation and frontend integration guides
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <p className="font-medium">Backend API Guide</p>
                <p className="text-xs text-muted-foreground mt-1">
                  AUTHORIZATION_TRIGGERS_API.md
                </p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <p className="font-medium">Comprehensive Triggers Guide</p>
                <p className="text-xs text-muted-foreground mt-1">
                  COMPREHENSIVE_AUTHORIZATION_TRIGGERS.md
                </p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <p className="font-medium">ADB Authorization Example</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ADB_AUTHORIZATION_TRIGGER.md
                </p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <p className="font-medium">Backend Authorization Guide</p>
                <p className="text-xs text-muted-foreground mt-1">
                  BACKEND_AUTHORIZATION_API_GUIDE.md
                </p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
