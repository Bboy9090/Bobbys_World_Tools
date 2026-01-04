import { useState, useEffect } from 'react';
import { DashboardLayout } from "./components/DashboardLayout";
// DemoModeBanner removed - production mode only
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
import { startBackendSync, stopBackendSync } from "./lib/backend-sync";

const logger = createLogger('App');

function AppContent() {
    const { setBackendAvailable } = useApp();
    const [isLoading, setIsLoading] = useState(true);
    const [showSplash, setShowSplash] = useState(true);
    const [initError, setInitError] = useState<Error | null>(null);

    useEffect(() => {
        let unsubscribeNetwork: (() => void) | undefined;

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
                    logger.warn('Backend offline - some features may be unavailable');
                    cleanupWebSockets(); // Ensure WebSockets are closed when backend is offline
                } else {
                    logger.info('Backend connected - production mode');
                    // Initialize WebSocket connections (only if backend is available)
                    initializeWebSockets().catch(err => {
                        logger.warn('Failed to initialize WebSockets:', err);
                    });
                }
                
                // Start continuous backend sync monitoring
                // This keeps frontend and backend in sync at all times
                startBackendSync({
                    checkInterval: 10000, // Check every 10 seconds
                    onBackendAvailable: () => {
                        setBackendAvailable(true);
                        initializeWebSockets().catch(err => {
                            logger.warn('Failed to initialize WebSockets:', err);
                        });
                        logger.debug('Backend available - frontend and backend in sync');
                    },
                    onBackendUnavailable: () => {
                        setBackendAvailable(false);
                        cleanupWebSockets(); // Close WebSockets when backend becomes unavailable
                        logger.warn('Backend unavailable - connection lost');
                    },
                    onBackendRestored: () => {
                        setBackendAvailable(true);
                        initializeWebSockets().catch(err => {
                            logger.warn('Failed to initialize WebSockets:', err);
                        });
                        logger.info('Backend restored - frontend and backend back in sync');
                    },
                });
                
                // Listen for network status changes with proper cleanup
                unsubscribeNetwork = networkStatus.subscribe((online) => {
                    if (!online) {
                        setBackendAvailable(false);
                        cleanupWebSockets(); // Close WebSockets when network goes offline
                        return;
                    }

                    // Re-check backend when coming online (debounced to prevent spam)
                    checkBackendHealth().then(result => {
                        setBackendAvailable(result.isHealthy);
                        if (result.isHealthy) {
                            initializeWebSockets().catch(err => {
                                logger.warn('Failed to initialize WebSockets:', err);
                            });
                        } else {
                            cleanupWebSockets();
                        }
                    });
                });
                
                setIsLoading(false);
                logger.info('Initialization complete - Workshop ready!');
            } catch (error) {
                logger.error('Initialization error:', error);
                setInitError(error instanceof Error ? error : new Error(String(error)));
                setIsLoading(false);
            }
        }

        initializeApp();

        return () => {
            cleanupWebSockets();
            stopBackendSync(); // Stop sync monitoring on unmount
            unsubscribeNetwork?.(); // Clean up network subscription
        };
    }, [setBackendAvailable]);

    useEffect(() => {
        soundManager.init();
        return () => soundManager.destroy();
    }, []);

    const handleConnectBackend = async () => {
        const backendHealthy = await checkBackendHealth();
        if (backendHealthy.isHealthy) {
            setBackendAvailable(true);
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
                {/* Demo mode disabled in production */}
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