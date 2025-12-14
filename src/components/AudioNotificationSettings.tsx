import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAudioNotifications } from '@/hooks/use-audio-notifications';
import { 
  SpeakerHigh, 
  SpeakerSlash, 
  PlugsConnected, 
  Plug,
  Lightning,
  WarningCircle,
  XCircle,
  CheckCircle,
  ArrowCounterClockwise
} from '@phosphor-icons/react';
import { NotificationType } from '@/lib/audio-notifications';

interface NotificationTypeConfig {
  key: NotificationType;
  label: string;
  description: string;
  icon: React.ReactNode;
  settingKey: 'deviceConnected' | 'deviceDisconnected' | 'bottleneckDetected' | 'performanceCritical' | 'testFailed' | 'benchmarkComplete';
}

const notificationTypes: NotificationTypeConfig[] = [
  {
    key: 'device-connected',
    label: 'Device Connected',
    description: 'Play sound when a device is connected',
    icon: <PlugsConnected className="w-4 h-4" weight="fill" />,
    settingKey: 'deviceConnected',
  },
  {
    key: 'device-disconnected',
    label: 'Device Disconnected',
    description: 'Play sound when a device is disconnected',
    icon: <Plug className="w-4 h-4" weight="fill" />,
    settingKey: 'deviceDisconnected',
  },
  {
    key: 'bottleneck-detected',
    label: 'Bottleneck Detected',
    description: 'Alert when performance bottleneck is detected',
    icon: <Lightning className="w-4 h-4" weight="fill" />,
    settingKey: 'bottleneckDetected',
  },
  {
    key: 'performance-critical',
    label: 'Critical Performance',
    description: 'Alert for critical performance issues',
    icon: <WarningCircle className="w-4 h-4" weight="fill" />,
    settingKey: 'performanceCritical',
  },
  {
    key: 'test-failed',
    label: 'Test Failed',
    description: 'Notify when automated tests fail',
    icon: <XCircle className="w-4 h-4" weight="fill" />,
    settingKey: 'testFailed',
  },
  {
    key: 'benchmark-complete',
    label: 'Benchmark Complete',
    description: 'Sound when benchmark completes',
    icon: <CheckCircle className="w-4 h-4" weight="fill" />,
    settingKey: 'benchmarkComplete',
  },
];

export function AudioNotificationSettings() {
  const { settings, toggleEnabled, setVolume, toggleNotificationType, resetToDefaults, play } = useAudioNotifications();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {settings.enabled ? (
                <SpeakerHigh className="w-5 h-5 text-primary" weight="fill" />
              ) : (
                <SpeakerSlash className="w-5 h-5 text-muted-foreground" weight="fill" />
              )}
              Audio Notifications
            </CardTitle>
            <CardDescription>
              Configure audio alerts for critical device events
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
            >
              <ArrowCounterClockwise className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="audio-enabled" className="text-base">Enable Audio Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Master control for all audio alerts
            </p>
          </div>
          <Switch
            id="audio-enabled"
            checked={settings.enabled}
            onCheckedChange={toggleEnabled}
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <Label htmlFor="volume-slider" className="text-base">Volume</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="volume-slider"
              value={[settings.volume * 100]}
              onValueChange={(value) => setVolume(value[0] / 100)}
              max={100}
              step={5}
              disabled={!settings.enabled}
              className="flex-1"
            />
            <span className="text-sm font-mono text-muted-foreground w-12 text-right">
              {Math.round(settings.volume * 100)}%
            </span>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <Label className="text-base">Notification Types</Label>
          <div className="space-y-3">
            {notificationTypes.map((type) => (
              <div key={type.key} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-primary">{type.icon}</div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={type.key} className="text-sm font-medium">
                        {type.label}
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => play(type.key)}
                        disabled={!settings.enabled || !settings[type.settingKey]}
                      >
                        Test
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </div>
                <Switch
                  id={type.key}
                  checked={settings[type.settingKey]}
                  onCheckedChange={() => toggleNotificationType(type.key)}
                  disabled={!settings.enabled}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
