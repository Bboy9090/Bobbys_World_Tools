import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RealTimeFlashMonitor } from "./components/RealTimeFlashMonitor";
import { AutomatedTestingDashboard } from "./components/AutomatedTestingDashboard";
import { Toaster } from "@/components/ui/sonner";
import { Pulse, Flask } from '@phosphor-icons/react';

function App() {
    return (
        <>
            <div className="min-h-screen bg-background p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
                    <Tabs defaultValue="monitor" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="monitor" className="gap-2">
                                <Pulse className="w-4 h-4" weight="duotone" />
                                Performance Monitor
                            </TabsTrigger>
                            <TabsTrigger value="testing" className="gap-2">
                                <Flask className="w-4 h-4" weight="duotone" />
                                Automated Testing
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="monitor">
                            <RealTimeFlashMonitor />
                        </TabsContent>

                        <TabsContent value="testing">
                            <AutomatedTestingDashboard />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
            <Toaster />
        </>
    );
}

export default App