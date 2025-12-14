import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RealTimeFlashMonitor } from "./components/RealTimeFlashMonitor";
import { AutomatedTestingDashboard } from "./components/AutomatedTestingDashboard";
import { BenchmarkStandardsGuide } from "./components/BenchmarkStandardsGuide";
import { BenchmarkedFlashingPanel } from "./components/BenchmarkedFlashingPanel";
import { BootForgeUSBScanner } from "./components/BootForgeUSBScanner";
import { LiveDeviceHotplugMonitor } from "./components/LiveDeviceHotplugMonitor";
import { AudioNotificationSettings } from "./components/AudioNotificationSettings";
import { CorrelationDashboard } from "./components/CorrelationDashboard";
import { RealTimeCorrelationTracker } from "./components/RealTimeCorrelationTracker";
import { PandoraCodexControlRoom } from "./components/PandoraCodexControlRoom";
import { Toaster } from "@/components/ui/sonner";
import { Pulse, Flask, Book, Gauge, Lightning, Broadcast, Gear, LinkSimple, Wrench, ChartLineUp } from '@phosphor-icons/react';

function App() {
    return (
        <>
            <div className="min-h-screen bg-background p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
                    <Tabs defaultValue="pandora" className="w-full">
                        <TabsList className="grid w-full grid-cols-10 mb-6">
                            <TabsTrigger value="pandora" className="gap-2">
                                <Wrench className="w-4 h-4" weight="duotone" />
                                Pandora Codex
                            </TabsTrigger>
                            <TabsTrigger value="realtime-correlation" className="gap-2">
                                <ChartLineUp className="w-4 h-4" weight="duotone" />
                                Live Tracking
                            </TabsTrigger>
                            <TabsTrigger value="correlation" className="gap-2">
                                <LinkSimple className="w-4 h-4" weight="duotone" />
                                Correlation
                            </TabsTrigger>
                            <TabsTrigger value="live-benchmark" className="gap-2">
                                <Gauge className="w-4 h-4" weight="duotone" />
                                Live Benchmark
                            </TabsTrigger>
                            <TabsTrigger value="monitor" className="gap-2">
                                <Pulse className="w-4 h-4" weight="duotone" />
                                Performance Monitor
                            </TabsTrigger>
                            <TabsTrigger value="testing" className="gap-2">
                                <Flask className="w-4 h-4" weight="duotone" />
                                Automated Testing
                            </TabsTrigger>
                            <TabsTrigger value="standards" className="gap-2">
                                <Book className="w-4 h-4" weight="duotone" />
                                Benchmark Standards
                            </TabsTrigger>
                            <TabsTrigger value="bootforgeusb" className="gap-2">
                                <Lightning className="w-4 h-4" weight="duotone" />
                                BootForge USB
                            </TabsTrigger>
                            <TabsTrigger value="hotplug" className="gap-2">
                                <Broadcast className="w-4 h-4" weight="duotone" />
                                Live Hotplug
                            </TabsTrigger>
                            <TabsTrigger value="settings" className="gap-2">
                                <Gear className="w-4 h-4" weight="duotone" />
                                Settings
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="pandora">
                            <PandoraCodexControlRoom />
                        </TabsContent>

                        <TabsContent value="realtime-correlation">
                            <RealTimeCorrelationTracker />
                        </TabsContent>

                        <TabsContent value="correlation">
                            <CorrelationDashboard />
                        </TabsContent>

                        <TabsContent value="live-benchmark">
                            <BenchmarkedFlashingPanel />
                        </TabsContent>

                        <TabsContent value="monitor">
                            <RealTimeFlashMonitor />
                        </TabsContent>

                        <TabsContent value="testing">
                            <AutomatedTestingDashboard />
                        </TabsContent>

                        <TabsContent value="standards">
                            <BenchmarkStandardsGuide />
                        </TabsContent>

                        <TabsContent value="bootforgeusb">
                            <BootForgeUSBScanner />
                        </TabsContent>

                        <TabsContent value="hotplug">
                            <LiveDeviceHotplugMonitor />
                        </TabsContent>

                        <TabsContent value="settings">
                            <AudioNotificationSettings />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
            <Toaster />
        </>
    );
}

export default App