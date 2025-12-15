import { RealTimeUSBDiagnostics } from "../RealTimeUSBDiagnostics";
import { BatchDiagnosticsPanel } from "../BatchDiagnosticsPanel";
import { PandoraCodexControlRoom } from "../PandoraCodexControlRoom";
import { MultiBrandFlashDashboard } from "../MultiBrandFlashDashboard";
import { DeviceAuthorizationTriggersPanel } from "../DeviceAuthorizationTriggersPanel";
import { ComprehensiveAuthorizationTriggersGuide } from "../ComprehensiveAuthorizationTriggersGuide";
import { TriggerCatalog } from "../TriggerCatalog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
    Scan, 
    Lightning, 
    Gauge, 
    DeviceMobile,
    Cpu,
    ShieldCheck,
    ListChecks
} from '@phosphor-icons/react';

export function DiagnosticsTab() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                    <Cpu weight="duotone" className="text-primary" size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-foreground">
                        Diagnostics
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Device detection, batch testing, and flash operations
                    </p>
                </div>
            </div>

            <Tabs defaultValue="device" className="w-full">
                <TabsList className="w-full justify-start bg-muted/20 h-9 p-1">
                    <TabsTrigger value="device" className="gap-1.5 text-xs">
                        <Scan weight="duotone" size={16} />
                        Device Scan
                    </TabsTrigger>
                    <TabsTrigger value="batch" className="gap-1.5 text-xs">
                        <Lightning weight="duotone" size={16} />
                        Batch Tests
                    </TabsTrigger>
                    <TabsTrigger value="monitoring" className="gap-1.5 text-xs">
                        <Gauge weight="duotone" size={16} />
                        Flash Monitor
                    </TabsTrigger>
                    <TabsTrigger value="flash" className="gap-1.5 text-xs">
                        <DeviceMobile weight="duotone" size={16} />
                        Multi-Brand
                    </TabsTrigger>
                    <TabsTrigger value="catalog" className="gap-1.5 text-xs">
                        <ListChecks weight="duotone" size={16} />
                        Trigger Catalog
                    </TabsTrigger>
                    <TabsTrigger value="auth" className="gap-1.5 text-xs">
                        <ShieldCheck weight="duotone" size={16} />
                        Auth Guide
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="device" className="mt-4">
                    <RealTimeUSBDiagnostics />
                </TabsContent>

                <TabsContent value="batch" className="mt-4">
                    <BatchDiagnosticsPanel />
                </TabsContent>

                <TabsContent value="monitoring" className="mt-4">
                    <PandoraCodexControlRoom />
                </TabsContent>

                <TabsContent value="flash" className="mt-4">
                    <MultiBrandFlashDashboard />
                </TabsContent>

                <TabsContent value="catalog" className="mt-4">
                    <TriggerCatalog />
                </TabsContent>

                <TabsContent value="auth" className="mt-4">
                    <ComprehensiveAuthorizationTriggersGuide />
                </TabsContent>
            </Tabs>
        </div>
    );
}
