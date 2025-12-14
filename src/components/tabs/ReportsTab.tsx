import { EvidenceBundleManager } from "../EvidenceBundleManager";
import { SnapshotRetentionPanel } from "../SnapshotRetentionPanel";
import { AuthorityDashboard } from "../AuthorityDashboard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
    Archive, 
    ClockCounterClockwise, 
    ShieldCheck 
} from '@phosphor-icons/react';

export function ReportsTab() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-display tracking-tight text-foreground mb-1">
                    REPORTS
                </h2>
                <p className="text-sm text-muted-foreground">
                    Evidence bundles, automatic backups, and signed reports with chain-of-custody
                </p>
            </div>

            <Tabs defaultValue="evidence" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-muted/30">
                    <TabsTrigger value="evidence" className="gap-2">
                        <Archive weight="duotone" />
                        Evidence Bundles
                    </TabsTrigger>
                    <TabsTrigger value="backups" className="gap-2">
                        <ClockCounterClockwise weight="duotone" />
                        Backups
                    </TabsTrigger>
                    <TabsTrigger value="dashboard" className="gap-2">
                        <ShieldCheck weight="duotone" />
                        Evidence Dashboard
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="evidence" className="mt-6">
                    <EvidenceBundleManager />
                </TabsContent>

                <TabsContent value="backups" className="mt-6">
                    <SnapshotRetentionPanel />
                </TabsContent>

                <TabsContent value="dashboard" className="mt-6">
                    <AuthorityDashboard />
                </TabsContent>
            </Tabs>
        </div>
    );
}
