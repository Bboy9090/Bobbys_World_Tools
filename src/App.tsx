import React from 'react';
import { BobbyDevPanel } from "./components/BobbyDevPanel";
import { SystemToolsDetector } from "./components/SystemToolsDetector";
import { USBDeviceDetector } from "./components/USBDeviceDetector";
import { USBConnectionMonitor } from "./components/USBConnectionMonitor";
import { USBMonitoringStats } from "./components/USBMonitoringStats";
import { USBMonitoringSettings } from "./components/USBMonitoringSettings";
import { NetworkDeviceScanner } from "./components/NetworkDeviceScanner";
import { BackendAPIGuide } from "./components/BackendAPIGuide";
import { Toaster } from "@/components/ui/sonner";

function App() {
    return (
        <>
            <div className="min-h-screen bg-background p-4 md:p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <BobbyDevPanel />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <SystemToolsDetector />
                        <USBDeviceDetector />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <USBMonitoringStats />
                        <USBMonitoringSettings />
                    </div>
                    
                    <USBConnectionMonitor />
                    
                    <NetworkDeviceScanner />
                    
                    <BackendAPIGuide />
                </div>
            </div>
            <Toaster />
        </>
    );
}

export default App