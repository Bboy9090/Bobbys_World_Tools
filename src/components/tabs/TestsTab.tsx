import { AutomatedTestingDashboard } from "../AutomatedTestingDashboard";
import { PluginDependencyGraph } from "../PluginDependencyGraph";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
    TestTube, 
    Gauge, 
    GitBranch,
    Flask
} from '@phosphor-icons/react';

export function TestsTab() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                    <Flask weight="duotone" className="text-primary" size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-foreground">
                        Test Suite
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Automated testing, performance benchmarking, and plugin analysis
                    </p>
                </div>
            </div>

            <Tabs defaultValue="suite" className="w-full">
                <TabsList className="w-full justify-start bg-muted/20 h-9 p-1">
                    <TabsTrigger value="suite" className="gap-1.5 text-xs">
                        <TestTube weight="duotone" size={16} />
                        Automated
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="gap-1.5 text-xs">
                        <Gauge weight="duotone" size={16} />
                        Performance
                    </TabsTrigger>
                    <TabsTrigger value="dependencies" className="gap-1.5 text-xs">
                        <GitBranch weight="duotone" size={16} />
                        Dependencies
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="suite" className="mt-4">
                    <AutomatedTestingDashboard />
                </TabsContent>

                <TabsContent value="performance" className="mt-4">
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

                <TabsContent value="dependencies" className="mt-4">
                    <PluginDependencyGraph />
                </TabsContent>
            </Tabs>
        </div>
    );
}
