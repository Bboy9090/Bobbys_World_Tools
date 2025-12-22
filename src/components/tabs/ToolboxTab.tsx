import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Toolbox } from "@phosphor-icons/react";

import { BatchActivationPanel } from "../BatchActivationPanel";
import { CleanGarbagePanel } from "../CleanGarbagePanel";
import { ConvertHEICPanel } from "../ConvertHEICPanel";
import { EraseAllDataPanel } from "../EraseAllDataPanel";
import { StopIOSUpdatePanel } from "../StopIOSUpdatePanel";
import { VirtualLocationPanel } from "../VirtualLocationPanel";

export function ToolboxTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
          <Toolbox weight="duotone" className="text-primary" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Toolbox</h2>
          <p className="text-xs text-muted-foreground">
            Utility tools and quick actions
          </p>
        </div>
      </div>

      <Tabs defaultValue="activation" className="w-full">
        <TabsList className="w-full justify-start bg-muted/20 h-9 p-1">
          <TabsTrigger value="activation" className="gap-1.5 text-xs">
            Batch Activation
          </TabsTrigger>
          <TabsTrigger value="cleanup" className="gap-1.5 text-xs">
            Clean Garbage
          </TabsTrigger>
          <TabsTrigger value="heic" className="gap-1.5 text-xs">
            Convert HEIC
          </TabsTrigger>
          <TabsTrigger value="erase" className="gap-1.5 text-xs">
            Erase All Data
          </TabsTrigger>
          <TabsTrigger value="ios-update" className="gap-1.5 text-xs">
            Stop iOS Update
          </TabsTrigger>
          <TabsTrigger value="location" className="gap-1.5 text-xs">
            Virtual Location
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activation" className="mt-4">
          <BatchActivationPanel />
        </TabsContent>

        <TabsContent value="cleanup" className="mt-4">
          <CleanGarbagePanel />
        </TabsContent>

        <TabsContent value="heic" className="mt-4">
          <ConvertHEICPanel />
        </TabsContent>

        <TabsContent value="erase" className="mt-4">
          <EraseAllDataPanel />
        </TabsContent>

        <TabsContent value="ios-update" className="mt-4">
          <StopIOSUpdatePanel />
        </TabsContent>

        <TabsContent value="location" className="mt-4">
          <VirtualLocationPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
