import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { DiagnosticsTab } from "./tabs/DiagnosticsTab";
import { ReportsTab } from "./tabs/ReportsTab";
import { TestsTab } from "./tabs/TestsTab";
import { PluginsTab } from "./tabs/PluginsTab";
import { CommunityTab } from "./tabs/CommunityTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { ToolboxTab } from "./tabs/ToolboxTab";
import { PandorasRoom } from "./SecretRoom";
import { BobbysTraproom } from "./SecretRoom/BobbysTraproom";
import { BobbysDevCorner } from "./SecretRoom/BobbysDevCorner";
import { LiveAnalyticsDashboard } from "./LiveAnalyticsDashboard";
import { DeviceSidebar } from "./DeviceSidebar";
import { LogsPanel } from "./LogsPanel";
import { BackendStatusIndicator } from "./BackendStatusIndicator";
import { useApp } from "@/lib/app-context";
import { useAudioNotifications } from "@/hooks/use-audio-notifications";
import { 
    Cpu, 
    FileText, 
    Flask, 
    Plug, 
    Users, 
    Gear,
    Wrench,
    LockKey,
    ChartLine,
    Skull,
    Code,
    Toolbox
} from '@phosphor-icons/react';

export function DashboardLayout() {
    const [activeTab, setActiveTab] = useState('diagnostics');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { backendAvailable } = useApp();
    const audio = useAudioNotifications();

    return (
        <div className="h-screen flex flex-col workshop-bg">
            <header className="h-12 border-b border-border sneaker-box-card flex items-center px-4 gap-3 swoosh-accent">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-primary rounded flex items-center justify-center ambient-glow-cyan">
                        <Wrench className="text-primary-foreground" size={16} weight="bold" />
                    </div>
                    <div className="flex items-center gap-2">
                        <h1 className="street-sign-text text-xl text-foreground">
                            BOBBY'S WORLD
                        </h1>
                        <span className="text-xs text-muted-foreground font-mono">🎮 Workshop Toolkit 👟</span>
                    </div>
                </div>
                <div className="flex-1" />
                <div className="flex items-center gap-3">
                    <BackendStatusIndicator />
                    <div className="text-xs font-mono text-muted-foreground">
                        v2.0.0
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <DeviceSidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />

                <main className="flex-1 flex flex-col overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                        <div className="border-b border-border bg-card/30 street-gradient">
                            <TabsList className="h-11 bg-transparent w-full justify-start rounded-none border-0 px-3 gap-1">
                                <TabsTrigger 
                                    value="diagnostics" 
                                    className="gap-1.5 px-4 data-[state=active]:btn-sneaker data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                                >
                                    <Cpu weight="duotone" size={18} />
                                    <span className="font-medium">Diagnostics</span>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="analytics" 
                                    className="gap-1.5 px-4 data-[state=active]:btn-sneaker data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                                >
                                    <ChartLine weight="duotone" size={18} />
                                    <span className="font-medium">Live Analytics</span>
                                    <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0 candy-shimmer">📊 NEW</Badge>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="pandoras-room" 
                                    className="gap-1.5 px-4 data-[state=active]:btn-sneaker data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                                >
                                    <LockKey weight="duotone" size={18} />
                                    <span className="font-medium">Pandora's Room</span>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="traproom" 
                                    className="gap-1.5 px-4 data-[state=active]:btn-sneaker data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                                >
                                    <Skull weight="duotone" size={18} />
                                    <span className="font-medium">💀 Traproom</span>
                                    <Badge variant="destructive" className="ml-1.5 text-[10px] px-1.5 py-0">HOT</Badge>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="dev-corner" 
                                    className="gap-1.5 px-4 data-[state=active]:btn-sneaker data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                                >
                                    <Code weight="duotone" size={18} />
                                    <span className="font-medium">💻 Dev Corner</span>
                                    <Badge variant="outline" className="ml-1.5 text-[10px] px-1.5 py-0">EXP</Badge>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="reports" 
                                    className="gap-1.5 px-4 data-[state=active]:btn-sneaker data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                                >
                                    <FileText weight="duotone" size={18} />
                                    <span className="font-medium">Reports</span>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="toolbox" 
                                    className="gap-1.5 px-4 data-[state=active]:btn-sneaker data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                                >
                                    <Toolbox weight="duotone" size={18} />
                                    <span className="font-medium">🛠️ Toolbox</span>
                                    <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0 candy-shimmer">NEW</Badge>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="tests" 
                                    className="gap-1.5 px-4 data-[state=active]:btn-sneaker data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                                >
                                    <Flask weight="duotone" size={18} />
                                    <span className="font-medium">Tests</span>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="plugins" 
                                    className="gap-1.5 px-4 data-[state=active]:btn-sneaker data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                                >
                                    <Plug weight="duotone" size={18} />
                                    <span className="font-medium">Plugins</span>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="community" 
                                    className="gap-1.5 px-4 data-[state=active]:btn-sneaker data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                                >
                                    <Users weight="duotone" size={18} />
                                    <span className="font-medium">Community</span>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="settings" 
                                    className="gap-1.5 px-4 data-[state=active]:btn-sneaker data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                                >
                                    <Gear weight="duotone" size={18} />
                                    <span className="font-medium">Settings</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1 floor-grid">
                            <div className="p-4 repair-table">
                                <TabsContent value="diagnostics" className="mt-0">
                                    <DiagnosticsTab />
                                </TabsContent>
                                <TabsContent value="analytics" className="mt-0">
                                    <LiveAnalyticsDashboard />
                                </TabsContent>
                                <TabsContent value="pandoras-room" className="mt-0 p-0">
                                    <PandorasRoom />
                                </TabsContent>
                                <TabsContent value="traproom" className="mt-0 p-0">
                                    <BobbysTraproom />
                                </TabsContent>
                                <TabsContent value="dev-corner" className="mt-0 p-0">
                                    <BobbysDevCorner />
                                </TabsContent>
                                <TabsContent value="reports" className="mt-0">
                                    <ReportsTab />
                                </TabsContent>
                                <TabsContent value="toolbox" className="mt-0">
                                    <ToolboxTab />
                                </TabsContent>
                                <TabsContent value="tests" className="mt-0">
                                    <TestsTab />
                                </TabsContent>
                                <TabsContent value="plugins" className="mt-0">
                                    <PluginsTab />
                                </TabsContent>
                                <TabsContent value="community" className="mt-0">
                                    <CommunityTab />
                                </TabsContent>
                                <TabsContent value="settings" className="mt-0">
                                    <SettingsTab />
                                </TabsContent>
                            </div>
                        </ScrollArea>
                    </Tabs>

                    <LogsPanel />
                </main>
            </div>
        </div>
    );
}
