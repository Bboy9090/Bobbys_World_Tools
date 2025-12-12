import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RealTimeFlashMonitor } from "./components/RealTimeFlashMonitor";
import { AutomatedTestingDashboard } from "./components/AutomatedTestingDashboard";
import { BenchmarkStandardsGuide } from "./components/BenchmarkStandardsGuide";
import { Toaster } from "@/components/ui/sonner";
import { Pulse, Flask, Book } from '@phosphor-icons/react';

function App() {
    return (
        <>
            <div className="min-h-screen bg-background p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
                    <Tabs defaultValue="monitor" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6">
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
                        </TabsList>

                        <TabsContent value="monitor">
                            <RealTimeFlashMonitor />
                        </TabsContent>

                        <TabsContent value="testing">
                            <AutomatedTestingDashboard />
                        </TabsContent>

                        <TabsContent value="standards">
                            <BenchmarkStandardsGuide />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
            <Toaster />
        </>
    );
}

export default App