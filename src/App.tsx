import { useState, useEffect } from 'react';
import { DashboardLayout } from "./components/DashboardLayout";
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
    const { setBackendAvailable } = useApp();
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

<<<<<<< HEAD
                if (backendHealthy.isHealthy) {
                    logger.info('Backend connected - production mode');
                    // Initialize WebSocket connections
                    initializeWebSockets();
                    logger.debug('WebSocket connections initialized');
                } else {
                    logger.warn('Backend offline - some features may be unavailable');
=======
                if (!backendHealthy.isHealthy) {
                    logger.info('Backend offline - running in demo mode');
                    setDemoMode(true);
                } else {
                    logger.info('Backend connected - production mode');
                    setDemoMode(false);
                    // Initialize WebSocket connections
                    initializeWebSockets();
                    logger.debug('WebSocket connections initialized');
>>>>>>> 15f56e9d046f8b90a8c21821f5db9289d589f6a7
                }
                
                // Listen for network status changes
                networkStatus.subscribe((online) => {
                    if (online && !backendHealthy.isHealthy) {
                        // Re-check backend when coming online
                        checkBackendHealth().then(result => {
                            if (result.isHealthy) {
                                setBackendAvailable(true);
<<<<<<< HEAD
=======
                                setDemoMode(false);
>>>>>>> 15f56e9d046f8b90a8c21821f5db9289d589f6a7
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
<<<<<<< HEAD
=======
                setDemoMode(true);
>>>>>>> 15f56e9d046f8b90a8c21821f5db9289d589f6a7
            }
        }

        initializeApp();

        return () => {
            cleanupWebSockets();
        };
<<<<<<< HEAD
    }, [setBackendAvailable]);
=======
    }, [setDemoMode, setBackendAvailable]);
>>>>>>> 15f56e9d046f8b90a8c21821f5db9289d589f6a7

    useEffect(() => {
        soundManager.init();
        return () => soundManager.destroy();
    }, []);


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