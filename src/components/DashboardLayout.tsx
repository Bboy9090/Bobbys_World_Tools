import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DiagnosticsTab } from "./tabs/DiagnosticsTab";
import { ReportsTab } from "./tabs/ReportsTab";
import { TestsTab } from "./tabs/TestsTab";
import { PluginsTab } from "./tabs/PluginsTab";
import { CommunityTab } from "./tabs/CommunityTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { DeviceSidebar } from "./DeviceSidebar";
import { LogsPanel } from "./LogsPanel";
import { 
    Cpu, 
    FileText, 
    Flask, 
    Plug, 
    Users, 
    Gear 
} from '@phosphor-icons/react';

export function DashboardLayout() {
    const [activeTab, setActiveTab] = useState('diagnostics');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="h-screen flex flex-col bg-background">
            <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                        <span className="font-display text-primary-foreground text-xl">B</span>
                    </div>
                    <h1 className="font-display text-2xl text-foreground tracking-tight">
                        BOBBY'S WORLD
                    </h1>
                </div>
                <div className="flex-1" />
                <div className="text-xs font-mono text-muted-foreground">
                    v2.0.0 • Workshop Edition
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <DeviceSidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />

                <main className="flex-1 flex flex-col overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                        <div className="border-b border-border bg-card/50">
                            <TabsList className="h-12 bg-transparent w-full justify-start rounded-none border-0 px-4">
                                <TabsTrigger 
                                    value="diagnostics" 
                                    className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    <Cpu weight="duotone" />
                                    Diagnostics
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="reports" 
                                    className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    <FileText weight="duotone" />
                                    Reports
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="tests" 
                                    className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    <Flask weight="duotone" />
                                    Tests
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="plugins" 
                                    className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    <Plug weight="duotone" />
                                    Plugins
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="community" 
                                    className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    <Users weight="duotone" />
                                    Community
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="settings" 
                                    className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    <Gear weight="duotone" />
                                    Settings
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-6">
                                <TabsContent value="diagnostics" className="mt-0">
                                    <DiagnosticsTab />
                                </TabsContent>
                                <TabsContent value="reports" className="mt-0">
                                    <ReportsTab />
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
