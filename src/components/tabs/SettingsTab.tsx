import { SettingsPanel } from "../SettingsPanel";
import { BootForgeUSBSupportMatrix } from "../BootForgeUSBSupportMatrix";
import { SecurityLockEducationPanel } from "../SecurityLockEducationPanel";
import { AboutBobby } from "../AboutBobby";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
    SlidersHorizontal, 
    DeviceTablet, 
    ShieldWarning, 
    Info 
} from '@phosphor-icons/react';

export function SettingsTab() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-display tracking-tight text-foreground mb-1">
                    SETTINGS
                </h2>
                <p className="text-sm text-muted-foreground">
                    Audio notifications, workshop preferences, device modes, legal compliance, and about
                </p>
            </div>

            <Tabs defaultValue="preferences" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-muted/30">
                    <TabsTrigger value="preferences" className="gap-2">
                        <SlidersHorizontal weight="duotone" />
                        Preferences
                    </TabsTrigger>
                    <TabsTrigger value="devices" className="gap-2">
                        <DeviceTablet weight="duotone" />
                        Device Modes
                    </TabsTrigger>
                    <TabsTrigger value="legal" className="gap-2">
                        <ShieldWarning weight="duotone" />
                        Legal Notice
                    </TabsTrigger>
                    <TabsTrigger value="about" className="gap-2">
                        <Info weight="duotone" />
                        About
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="preferences" className="mt-6">
                    <SettingsPanel />
                </TabsContent>

                <TabsContent value="devices" className="mt-6">
                    <BootForgeUSBSupportMatrix />
                </TabsContent>

                <TabsContent value="legal" className="mt-6">
                    <SecurityLockEducationPanel />
                </TabsContent>

                <TabsContent value="about" className="mt-6">
                    <AboutBobby />
                </TabsContent>
            </Tabs>
        </div>
    );
}
