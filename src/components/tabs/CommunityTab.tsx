import { CommunityResources } from "../CommunityResources";
import { RepairLibrary } from "../RepairLibrary";
import { MyWorkspace } from "../MyWorkspace";
import { BobbysVault } from "../BobbysVault";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
    ChatsCircle, 
    Books, 
    Briefcase, 
    Vault 
} from '@phosphor-icons/react';

export function CommunityTab() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-display tracking-tight text-foreground mb-1">
                    COMMUNITY
                </h2>
                <p className="text-sm text-muted-foreground">
                    Community forums, repair library, personal workspace, and educational resources
                </p>
            </div>

            <Tabs defaultValue="forums" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-muted/30">
                    <TabsTrigger value="forums" className="gap-2">
                        <ChatsCircle weight="duotone" />
                        Forums
                    </TabsTrigger>
                    <TabsTrigger value="library" className="gap-2">
                        <Books weight="duotone" />
                        Repair Library
                    </TabsTrigger>
                    <TabsTrigger value="workspace" className="gap-2">
                        <Briefcase weight="duotone" />
                        My Workspace
                    </TabsTrigger>
                    <TabsTrigger value="vault" className="gap-2">
                        <Vault weight="duotone" />
                        Bobby's Vault
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="forums" className="mt-6">
                    <CommunityResources />
                </TabsContent>

                <TabsContent value="library" className="mt-6">
                    <RepairLibrary />
                </TabsContent>

                <TabsContent value="workspace" className="mt-6">
                    <MyWorkspace />
                </TabsContent>

                <TabsContent value="vault" className="mt-6">
                    <BobbysVault />
                </TabsContent>
            </Tabs>
        </div>
    );
}
