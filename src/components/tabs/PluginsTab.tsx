import { PluginMarketplace } from "../PluginMarketplace";
import { PluginManager } from "../PluginManager";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { featureFlags } from "@/lib/featureFlags";
import { 
    Storefront, 
    Package, 
    CloudArrowUp,
    Plug,
    Warning,
    CheckCircle
} from '@phosphor-icons/react';
import { useBackendHealth } from '@/lib/backend-health';

export function PluginsTab() {
<<<<<<< Updated upstream
    if (!featureFlags.experimentalToolbox) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                        <Plug weight="duotone" className="text-primary" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">
                            Plugins
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Marketplace and plugin execution are disabled by default.
                        </p>
                    </div>
                </div>

                <Alert>
                    <Plug className="h-4 w-4" />
                    <AlertTitle>Disabled</AlertTitle>
                    <AlertDescription>
                        Plugin marketplace and management are gated behind the experimental toolbox flag
                        and require a real backend registry to be available.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
=======
    const health = useBackendHealth(30000);
    const HealthBadge = () => (
        <div className="flex items-center gap-1 text-xs">
            {health.isHealthy ? (
                <span className="inline-flex items-center gap-1 text-success">
                    <CheckCircle className="w-4 h-4" /> Backend OK
                </span>
            ) : (
                <span className="inline-flex items-center gap-1 text-destructive">
                    <Warning className="w-4 h-4" /> Backend unavailable
                </span>
            )}
        </div>
    );
>>>>>>> Stashed changes

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                        <Plug weight="duotone" className="text-primary" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">
                            Plugins
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Browse marketplace, manage installed plugins, and contribute extensions
                        </p>
                    </div>
                </div>
                <HealthBadge />
            </div>

            <Tabs defaultValue="marketplace" className="w-full">
                <TabsList className="w-full justify-start bg-muted/20 h-9 p-1">
                    <TabsTrigger value="marketplace" className="gap-1.5 text-xs">
                        <Storefront weight="duotone" size={16} />
                        Marketplace
                    </TabsTrigger>
                    <TabsTrigger value="installed" className="gap-1.5 text-xs">
                        <Package weight="duotone" size={16} />
                        Installed
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="marketplace" className="mt-4">
                    <PluginMarketplace />
                </TabsContent>

                <TabsContent value="installed" className="mt-4">
                    <PluginManager onNavigate={() => {}} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
