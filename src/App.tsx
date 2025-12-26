import { useState, useEffect } from 'react';
import { DashboardLayout } from "./components/DashboardLayout";
import { DemoModeBanner } from "./components/DemoModeBanner";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider, useApp } from "./lib/app-context";
import { checkBackendHealth } from "./lib/backend-health";
import { soundManager } from "./lib/soundManager";

function AppContent() {
    const { isDemoMode, setDemoMode, setBackendAvailable } = useApp();

    useEffect(() => {
        async function initializeApp() {
            const backendHealthy = await checkBackendHealth();
            setBackendAvailable(backendHealthy);

            if (!backendHealthy) {
                console.warn('[App] Backend API unavailable - enabling demo mode');
                setDemoMode(true);
                console.log('[App] Demo mode enabled - no mock services, just empty states');
            } else {
                console.log('[App] Backend API connected - running in production mode');
                setDemoMode(false);
            }
        }

        initializeApp();

        // No cleanup needed - mock services removed
    }, [setDemoMode, setBackendAvailable]);

    useEffect(() => {
        soundManager.init();
        return () => soundManager.destroy();
    }, []);

    const handleConnectBackend = async () => {
        const backendHealthy = await checkBackendHealth();
        if (backendHealthy) {
            setBackendAvailable(true);
            setDemoMode(false);
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