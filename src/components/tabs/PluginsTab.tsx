import { PluginMarketplace } from "../PluginMarketplace";
import { PluginManager } from "../PluginManager";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
    Storefront, 
    Package, 
    CloudArrowUp 
} from '@phosphor-icons/react';

export function PluginsTab() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-display tracking-tight text-foreground mb-1">
                    PLUGINS
                </h2>
                <p className="text-sm text-muted-foreground">
                    Browse marketplace, manage installed plugins, and submit your own extensions
                </p>
            </div>

            <Tabs defaultValue="marketplace" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-muted/30">
                    <TabsTrigger value="marketplace" className="gap-2">
                        <Storefront weight="duotone" />
                        Marketplace
                    </TabsTrigger>
                    <TabsTrigger value="installed" className="gap-2">
                        <Package weight="duotone" />
                        Installed
                    </TabsTrigger>
                    <TabsTrigger value="submit" className="gap-2">
                        <CloudArrowUp weight="duotone" />
                        Submit Plugin
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="marketplace" className="mt-6">
                    <PluginMarketplace />
                </TabsContent>

                <TabsContent value="installed" className="mt-6">
                    <PluginManager onNavigate={() => {}} />
                </TabsContent>

                <TabsContent value="submit" className="mt-6">
                    <div className="p-8 text-center">
                        <CloudArrowUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            Submit Your Plugin
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Share your tools with the community. All plugins are automatically tested for security and quality.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Submission portal coming soon
                        </p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
