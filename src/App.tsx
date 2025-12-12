import React from 'react';
import { BobbyDevPanel } from "./components/BobbyDevPanel";
import { PandoraCodexIntegrationGuide } from "./components/PandoraCodexIntegrationGuide";
import { BobbyDevArsenalDashboard } from "./components/BobbyDevArsenalDashboard";
import { DeviceAnalyticsDashboard } from "./components/DeviceAnalyticsDashboard";
import { DeviceInsightsPanel } from "./components/DeviceInsightsPanel";
import { DeviceHealthMonitor } from "./components/DeviceHealthMonitor";
import { DeviceTimelineVisualizer } from "./components/DeviceTimelineVisualizer";
import { SystemToolsDetector } from "./components/SystemToolsDetector";
import { USBDeviceDetector } from "./components/USBDeviceDetector";
import { USBDeviceClassDetector } from "./components/USBDeviceClassDetector";
import { USBConnectionMonitor } from "./components/USBConnectionMonitor";
import { USBMonitoringStats } from "./components/USBMonitoringStats";
import { USBMonitoringSettings } from "./components/USBMonitoringSettings";
import { NetworkDeviceScanner } from "./components/NetworkDeviceScanner";
import { BackendAPIGuide } from "./components/BackendAPIGuide";
import { ADBFastbootDetector } from "./components/ADBFastbootDetector";
import { Toaster } from "@/components/ui/sonner";

function App() {
    return (
        <>
            <div className="min-h-screen bg-background p-4 md:p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <BobbyDevPanel />
                    
                    <PandoraCodexIntegrationGuide />
                    
                    <BobbyDevArsenalDashboard />
                    
                    <ADBFastbootDetector />
                    
                    <DeviceAnalyticsDashboard />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <SystemToolsDetector />
                        <USBDeviceDetector />
                    </div>
                    
                    <USBDeviceClassDetector />
                    
                    <DeviceHealthMonitor />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DeviceTimelineVisualizer />
                        <DeviceInsightsPanel />
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