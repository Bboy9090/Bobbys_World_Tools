/**
 * DashboardLayout - Main application layout
 * 
 * Migrated to new design system:
 * - Design tokens (midnight-room, workbench-steel, etc.)
 * - "What's up, doc?" greeting
 * - WorkbenchSystemStatus
 * - New navigation structure
 */

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { DeviceSidebar } from "./DeviceSidebar";
import { BackendStatusIndicator } from "./BackendStatusIndicator";
import { WorkbenchSystemStatus } from "./workbench/WorkbenchSystemStatus";
import { OrnamentBugsGreeting } from "./ornaments/OrnamentBugsGreeting";
import { useApp } from "@/lib/app-context";
import { useBugsGreeting } from "@/hooks/useBugsGreeting";
import { 
    LayoutDashboard,
    Smartphone,
    Flashlight,
    Apple,
    Shield,
    Activity,
    Package,
    Workflow,
    Lock,
    Settings,
    FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpaceJamHeader } from './space-jam/SpaceJamHeader';
import { SpaceJamNav } from './space-jam/SpaceJamNav';

// Screen imports
import { WorkbenchDashboard } from './screens/WorkbenchDashboard';
import { WorkbenchDevices } from './screens/WorkbenchDevices';
import { WorkbenchFlashing } from './screens/WorkbenchFlashing';
import { WorkbenchIOS } from './screens/WorkbenchIOS';
import { WorkbenchSecurity } from './screens/WorkbenchSecurity';
import { WorkbenchMonitoring } from './screens/WorkbenchMonitoring';
import { WorkbenchFirmware } from './screens/WorkbenchFirmware';
import { WorkbenchWorkflows } from './screens/WorkbenchWorkflows';
import { WorkbenchCases } from './screens/WorkbenchCases';
import { useBackendHealth } from '@/hooks/use-backend-health';
import { WorkbenchSecretRooms } from './screens/WorkbenchSecretRooms';
import { WorkbenchSettings } from './screens/WorkbenchSettings';

export function DashboardLayout() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { backendAvailable } = useApp();
    const { showGreeting, dismiss } = useBugsGreeting({ enabled: true });
    const backendHealth = useBackendHealth();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'devices', label: 'Devices', icon: Smartphone },
        { id: 'cases', label: 'Cases', icon: FileText },
        { id: 'flashing', label: 'Flashing', icon: Flashlight },
        { id: 'ios', label: 'iOS', icon: Apple },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'monitoring', label: 'Monitoring', icon: Activity },
        { id: 'firmware', label: 'Firmware', icon: Package },
        { id: 'workflows', label: 'Workflows', icon: Workflow },
        { id: 'secret-rooms', label: 'Secret Rooms', icon: Lock, locked: true },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="h-screen flex flex-col bg-trap-house">
            {/* Header - Space Jam Style */}
            <header className="h-16 border-b-2 border-space-jam bg-gradient-space-jam flex items-center px-6 gap-4 glow-purple">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl border-2 border-jordan bg-hare-jordan-red flex items-center justify-center animate-bounce-jordan shadow-jordan">
                        <span className="text-legendary font-display font-black text-xl">🐰</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-space-jam font-display tracking-wider animate-graffiti">
                            HARE JORDAN'S PLAYGROUND
                        </h1>
                        <p className="text-sm text-legendary font-display tracking-wide">
                            NYC TRAP HOUSE WORKSHOP • SPACE JAM LEGENDARY
                        </p>
                    </div>
                </div>
                
                <div className="flex-1" />
                
                {/* Greeting - Only show once per session */}
                {showGreeting && (
                    <div className="px-4 py-2 bg-trap-walls border-2 border-neon-cyan rounded-lg glow-cyan animate-graffiti">
                        <OrnamentBugsGreeting 
                            variant={backendAvailable ? 'devices' : 'warning'}
                            onDismiss={dismiss}
                            autoHide={true}
                            autoHideDuration={4000}
                        />
                    </div>
                )}
                
                <div className="flex items-center gap-3">
                    <BackendStatusIndicator />
                    {backendHealth.status === 'booting' && (
                        <div className="text-xs font-mono text-ink-muted animate-pulse">
                            Initializing...
                        </div>
                    )}
                    {backendHealth.status === 'failed' && (
                        <div className="text-xs font-mono text-state-danger">
                            Backend Error
                        </div>
                    )}
                    <div className="text-xs font-mono text-ink-muted">
                        v3.0.0
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Device Sidebar */}
                <DeviceSidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden min-h-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                        {/* Navigation Tabs - Space Jam Style */}
                        <div className="border-b-2 border-space-jam bg-trap-walls">
                            <TabsList className="h-14 bg-transparent w-full justify-start rounded-none border-0 px-4 gap-2 overflow-x-auto">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeTab === item.id;
                                    
                                    return (
                                        <TabsTrigger
                                            key={item.id}
                                            value={item.id}
                                            className={cn(
                                                "gap-2 px-5 h-12 rounded-xl transition-all duration-300 font-display font-bold text-sm tracking-wide uppercase",
                                                isActive
                                                    ? "btn-space-jam text-legendary shadow-playground"
                                                    : item.locked
                                                    ? "bg-trap-basement border-2 border-trap-border text-ink-muted opacity-50 cursor-not-allowed"
                                                    : "bg-trap-walls border-2 border-trap-border text-ink-primary hover:border-neon-cyan hover:text-graffiti hover:glow-cyan"
                                            )}
                                        >
                                            <Icon className={cn("w-5 h-5", isActive && "animate-bounce")} />
                                            <span>{item.label}</span>
                                            {item.locked && (
                                                <Lock className="w-4 h-4" />
                                            )}
                                        </TabsTrigger>
                                    );
                                })}
                            </TabsList>
                        </div>

                        {/* Content Area - Playground Style */}
                        <ScrollArea className="flex-1 min-h-0 bg-playground">
                            <div className="p-8 min-h-0 bg-gradient-playground">
                                <TabsContent value="dashboard" className="mt-0">
                                    <WorkbenchDashboard />
                                </TabsContent>
                                <TabsContent value="devices" className="mt-0">
                                    <WorkbenchDevices />
                                </TabsContent>
                                <TabsContent value="cases" className="mt-0">
                                    <WorkbenchCases />
                                </TabsContent>
                                <TabsContent value="flashing" className="mt-0">
                                    <WorkbenchFlashing />
                                </TabsContent>
                                <TabsContent value="ios" className="mt-0">
                                    <WorkbenchIOS />
                                </TabsContent>
                                <TabsContent value="security" className="mt-0">
                                    <WorkbenchSecurity />
                                </TabsContent>
                                <TabsContent value="monitoring" className="mt-0">
                                    <WorkbenchMonitoring />
                                </TabsContent>
                                <TabsContent value="firmware" className="mt-0">
                                    <WorkbenchFirmware />
                                </TabsContent>
                                <TabsContent value="workflows" className="mt-0">
                                    <WorkbenchWorkflows />
                                </TabsContent>
                                <TabsContent value="secret-rooms" className="mt-0 p-0">
                                    <WorkbenchSecretRooms />
                                </TabsContent>
                                <TabsContent value="settings" className="mt-0">
                                    <WorkbenchSettings />
                                </TabsContent>
                            </div>
                        </ScrollArea>
                    </Tabs>
                </main>
            </div>
        </div>
    );
}
