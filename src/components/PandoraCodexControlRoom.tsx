import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PandoraFlashPanel } from "./PandoraFlashPanel";
import { PandoraMonitorPanel } from "./PandoraMonitorPanel";
import { PandoraTestsPanel } from "./PandoraTestsPanel";
import { PandoraStandardsPanel } from "./PandoraStandardsPanel";
import { PandoraHotplugPanel } from "./PandoraHotplugPanel";
import { Lightning, Gauge, Flask, Book, Broadcast } from '@phosphor-icons/react';

export function PandoraCodexControlRoom() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Pandora Codex Control Room</h1>
        <p className="text-muted-foreground">Simple, clear, one-click device management and performance monitoring</p>
      </div>

      <Tabs defaultValue="flash" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="flash" className="gap-2">
            <Lightning className="w-4 h-4" weight="duotone" />
            Flash
          </TabsTrigger>
          <TabsTrigger value="monitor" className="gap-2">
            <Gauge className="w-4 h-4" weight="duotone" />
            Monitor
          </TabsTrigger>
          <TabsTrigger value="tests" className="gap-2">
            <Flask className="w-4 h-4" weight="duotone" />
            Tests
          </TabsTrigger>
          <TabsTrigger value="standards" className="gap-2">
            <Book className="w-4 h-4" weight="duotone" />
            Standards
          </TabsTrigger>
          <TabsTrigger value="hotplug" className="gap-2">
            <Broadcast className="w-4 h-4" weight="duotone" />
            Hotplug
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flash">
          <PandoraFlashPanel />
        </TabsContent>

        <TabsContent value="monitor">
          <PandoraMonitorPanel />
        </TabsContent>

        <TabsContent value="tests">
          <PandoraTestsPanel />
        </TabsContent>

        <TabsContent value="standards">
          <PandoraStandardsPanel />
        </TabsContent>

        <TabsContent value="hotplug">
          <PandoraHotplugPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
