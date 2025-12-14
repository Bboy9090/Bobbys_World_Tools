import { useState, useEffect } from 'react';
import { DashboardLayout } from "./components/DashboardLayout";
import { Toaster } from "@/components/ui/sonner";
import { MockBatchDiagnosticsWebSocket } from "./lib/mock-batch-diagnostics-websocket";
import { setupMockRegistryAPI } from "./lib/mock-plugin-registry-server";

function App() {
    useEffect(() => {
        MockBatchDiagnosticsWebSocket.initialize();
        setupMockRegistryAPI();
        console.log('[App] Mock Batch Diagnostics Server initialized');
        console.log('[App] Mock Plugin Registry API initialized');

        return () => {
            MockBatchDiagnosticsWebSocket.cleanup();
        };
    }, []);

    return (
        <>
            <DashboardLayout />
            <Toaster />
        </>
    );
}

export default App