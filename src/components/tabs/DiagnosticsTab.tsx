import { RealTimeUSBDiagnostics } from "../RealTimeUSBDiagnostics";
import { BatchDiagnosticsPanel } from "../BatchDiagnosticsPanel";
import { PandoraCodexControlRoom } from "../PandoraCodexControlRoom";
import { MultiBrandFlashDashboard } from "../MultiBrandFlashDashboard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
    Scan, 
    Lightning, 
    Gauge, 
    DeviceMobile 
} from '@phosphor-icons/react';

export function DiagnosticsTab() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-display tracking-tight text-foreground mb-1">
                    DIAGNOSTICS
                </h2>
                <p className="text-sm text-muted-foreground">
                    Device detection, batch testing, flash monitoring, and multi-brand flashing
                </p>
            </div>

            <Tabs defaultValue="device" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-muted/30">
                    <TabsTrigger value="device" className="gap-2">
                        <Scan weight="duotone" />
                        Device Diagnostics
                    </TabsTrigger>
                    <TabsTrigger value="batch" className="gap-2">
                        <Lightning weight="duotone" />
                        Batch Diagnostics
                    </TabsTrigger>
                    <TabsTrigger value="monitoring" className="gap-2">
                        <Gauge weight="duotone" />
                        Flash Monitoring
                    </TabsTrigger>
                    <TabsTrigger value="flash" className="gap-2">
                        <DeviceMobile weight="duotone" />
                        Multi-Brand Flash
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="device" className="mt-6">
                    <RealTimeUSBDiagnostics />
                </TabsContent>

                <TabsContent value="batch" className="mt-6">
                    <BatchDiagnosticsPanel />
                </TabsContent>

                <TabsContent value="monitoring" className="mt-6">
                    <PandoraCodexControlRoom />
                </TabsContent>

                <TabsContent value="flash" className="mt-6">
                    <MultiBrandFlashDashboard />
                </TabsContent>
            </Tabs>
        </div>
    );
}
