import { AutomatedTestingDashboard } from "../AutomatedTestingDashboard";
import { PluginDependencyGraph } from "../PluginDependencyGraph";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
    TestTube, 
    Gauge, 
    GitBranch 
} from '@phosphor-icons/react';

export function TestsTab() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-display tracking-tight text-foreground mb-1">
                    TESTS
                </h2>
                <p className="text-sm text-muted-foreground">
                    Automated testing pipeline, performance benchmarking, and dependency analysis
                </p>
            </div>

            <Tabs defaultValue="suite" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-muted/30">
                    <TabsTrigger value="suite" className="gap-2">
                        <TestTube weight="duotone" />
                        Test Suite
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="gap-2">
                        <Gauge weight="duotone" />
                        Performance
                    </TabsTrigger>
                    <TabsTrigger value="dependencies" className="gap-2">
                        <GitBranch weight="duotone" />
                        Plugin Map
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="suite" className="mt-6">
                    <AutomatedTestingDashboard />
                </TabsContent>

                <TabsContent value="performance" className="mt-6">
                    <div className="p-8 text-center">
                        <Gauge className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            Performance Testing
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            CPU, memory, and execution speed benchmarking coming soon
                        </p>
                    </div>
                </TabsContent>

                <TabsContent value="dependencies" className="mt-6">
                    <PluginDependencyGraph />
                </TabsContent>
            </Tabs>
        </div>
    );
}
