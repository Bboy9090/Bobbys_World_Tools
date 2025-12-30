import { useState, useEffect } from 'react';
import { DashboardLayout } from "./components/DashboardLayout";
import { DemoModeBanner } from "./components/DemoModeBanner";
import { LoadingPage } from "./components/core/LoadingPage";
import { SplashPage } from "./components/core/SplashPage";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider, useApp } from "./lib/app-context";
import { GlobalDeviceProvider } from "./lib/global-device-state";
import { checkBackendHealth } from "./lib/backend-health";
import { soundManager } from "./lib/soundManager";
import { setupGlobalErrorHandler } from "./lib/error-handler";
import { initOfflineStorage, networkStatus } from "./lib/offline-storage";
import { initializeWebSockets, cleanupWebSockets } from "./lib/websocket-hub";
import { createLogger } from "./lib/debug-logger";

const logger = createLogger('App');

function AppContent() {
    const { isDemoMode, setDemoMode, setBackendAvailable } = useApp();
    const [isLoading, setIsLoading] = useState(true);
    const [showSplash, setShowSplash] = useState(true);
    const [initError, setInitError] = useState<Error | null>(null);

    useEffect(() => {
        async function initializeApp() {
            try {
                setIsLoading(true);
                setInitError(null);
                logger.info('Initializing Bobby\'s Workshop...');
                
                // Setup global error handler
                setupGlobalErrorHandler();
                logger.debug('Error handler initialized');
                
                // Initialize offline storage
                await initOfflineStorage();
                logger.debug('Offline storage ready');
                
                // Simulate system boot
                await new Promise(resolve => setTimeout(resolve, 800));
                
                const backendHealthy = await checkBackendHealth();
                setBackendAvailable(backendHealthy.isHealthy);

                if (!backendHealthy.isHealthy) {
                    logger.info('Backend offline - running in demo mode');
                    setDemoMode(true);
                } else {
                    logger.info('Backend connected - production mode');
                    setDemoMode(false);
                    // Initialize WebSocket connections
                    initializeWebSockets();
                    logger.debug('WebSocket connections initialized');
                }
                
                // Listen for network status changes
                networkStatus.subscribe((online) => {
                    if (online && !backendHealthy.isHealthy) {
                        // Re-check backend when coming online
                        checkBackendHealth().then(result => {
                            if (result.isHealthy) {
                                setBackendAvailable(true);
                                setDemoMode(false);
                                initializeWebSockets();
                            }
                        });
                    }
                });
                
                setIsLoading(false);
                logger.info('Initialization complete - Workshop ready!');
            } catch (error) {
                logger.error('Initialization error:', error);
                setInitError(error instanceof Error ? error : new Error(String(error)));
                setIsLoading(false);
                setDemoMode(true);
            }
        }

        initializeApp();

        return () => {
            cleanupWebSockets();
        };
    }, [setDemoMode, setBackendAvailable]);

    useEffect(() => {
        soundManager.init();
        return () => soundManager.destroy();
    }, []);

    const handleConnectBackend = async () => {
        const backendHealthy = await checkBackendHealth();
        if (backendHealthy.isHealthy) {
            setBackendAvailable(true);
            setDemoMode(false);
            initializeWebSockets();
            logger.info('Backend connected - production mode');
        } else {
            logger.warn('Backend still unavailable:', backendHealthy.error);
        }
    };

    // Show error if initialization failed
    if (initError) {
        return (
            <div className="min-h-screen bg-midnight-room flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-workbench-steel border border-panel rounded-lg p-6">
                    <h1 className="text-xl font-bold text-ink-primary mb-2 font-mono">Initialization Error</h1>
                    <p className="text-sm text-ink-muted mb-4">Failed to initialize the application.</p>
                    <pre className="text-xs text-state-danger bg-midnight-room p-3 rounded border overflow-auto max-h-32 font-mono">
                        {initError.message}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-spray-cyan/20 text-spray-cyan border border-spray-cyan/50 rounded hover:bg-spray-cyan/30 transition-colors"
                    >
                        Reload App
                    </button>
                </div>
            </div>
        );
    }

    // Show loading page during initialization
    if (isLoading) {
        return <LoadingPage />;
    }

    // Show splash page (auto-dismisses)
    if (showSplash) {
        return <SplashPage onComplete={() => setShowSplash(false)} />;
    }

    try {
        return (
            <>
                {isDemoMode && <DemoModeBanner onDisable={handleConnectBackend} />}
                <DashboardLayout />
                <Toaster />
            </>
        );
    } catch (error) {
        console.error('[AppContent] Render error:', error);
        return (
            <div className="min-h-screen bg-midnight-room flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-workbench-steel border border-panel rounded-lg p-6">
                    <h1 className="text-xl font-bold text-ink-primary mb-2 font-mono">Render Error</h1>
                    <p className="text-sm text-ink-muted mb-4">Failed to render the application.</p>
                    <pre className="text-xs text-state-danger bg-midnight-room p-3 rounded border overflow-auto max-h-32 font-mono">
                        {error instanceof Error ? error.message : String(error)}
                    </pre>
                </div>
            </div>
        );
    }
}

function App() {
    return (
        <AppProvider>
            <GlobalDeviceProvider>
                <AppContent />
            </GlobalDeviceProvider>
        </AppProvider>
    );
}

export default App