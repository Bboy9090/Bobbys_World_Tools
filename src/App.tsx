import { useState, useEffect } from 'react';
import { DashboardLayout } from "./components/DashboardLayout";
import { DemoModeBanner } from "./components/DemoModeBanner";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider, useApp } from "./lib/app-context";
import { checkBackendHealth } from "./lib/backend-health";
// import { MockBatchDiagnosticsWebSocket } from "./lib/mock-batch-diagnostics-websocket";
// import { setupMockRegistryAPI } from "./lib/mock-plugin-registry-server";

function AppContent() {
    const { isDemoMode, setDemoMode, setBackendAvailable } = useApp();

    useEffect(() => {
        async function initializeApp() {
            const backendHealthy = await checkBackendHealth();
            setBackendAvailable(backendHealthy);

            if (!backendHealthy) {
                console.warn('[App] Backend API unavailable - enabling demo mode');
                setDemoMode(true);
                // MockBatchDiagnosticsWebSocket.initialize();
                // setupMockRegistryAPI();
                console.log('[App] Mock services initialized for demo mode');
            } else {
                console.log('[App] Backend API connected - running in production mode');
                setDemoMode(false);
            }
        }

        initializeApp();

        return () => {
            if (isDemoMode) {
                // MockBatchDiagnosticsWebSocket.cleanup();
            }
        };
    }, [setDemoMode, setBackendAvailable]);

    const handleConnectBackend = async () => {
        const backendHealthy = await checkBackendHealth();
        if (backendHealthy) {
            setBackendAvailable(true);
            setDemoMode(false);
            // MockBatchDiagnosticsWebSocket.cleanup();
            window.location.reload();
        }
    };

    return (
        <>
            {isDemoMode && <DemoModeBanner onDisable={handleConnectBackend} />}
            <DashboardLayout />
            <Toaster />
        </>
    );
}

function App() {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
}

export default App