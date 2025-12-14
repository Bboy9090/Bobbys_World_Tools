import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RealTimeFlashMonitor } from "./components/RealTimeFlashMonitor";
import { AutomatedTestingDashboard } from "./components/AutomatedTestingDashboard";
import { BenchmarkStandardsGuide } from "./components/BenchmarkStandardsGuide";
import { BenchmarkedFlashingPanel } from "./components/BenchmarkedFlashingPanel";
import { BootForgeUSBScanner } from "./components/BootForgeUSBScanner";
import { LiveDeviceHotplugMonitor } from "./components/LiveDeviceHotplugMonitor";
import { Toaster } from "@/components/ui/sonner";
import { Pulse, Flask, Book, Gauge, Lightning, Broadcast } from '@phosphor-icons/react';

function App() {
    return (
        <>
            <div className="min-h-screen bg-background p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
                    <Tabs defaultValue="live-benchmark" className="w-full">
                        <TabsList className="grid w-full grid-cols-6 mb-6">
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
                        </TabsList>

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
                    </Tabs>
                </div>
            </div>
            <Toaster />
        </>
    );
}

export default App