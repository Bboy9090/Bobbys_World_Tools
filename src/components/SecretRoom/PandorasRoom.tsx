/**
 * Pandora's Room (Bobby's Secret Room)
 * Advanced device management, diagnostics, and trapdoor tool execution
 * Merged from The-Pandora-Codex Control Room (TITAN 2)
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';
import { Smartphone, Activity, Upload, FileText, Wrench, Shield, Lock } from 'lucide-react';
import { TrapdoorControlPanel } from '../TrapdoorControlPanel';
import { ShadowLogsViewer } from '../ShadowLogsViewer';
import { WorkflowExecutionConsole } from '../WorkflowExecutionConsole';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useSoundEffect } from '@/lib/soundManager';
import { DeviceStateGuide } from '../DeviceStateGuide';
import { SECRET_ROOM_PASSWORD } from '@/lib/secrets';

interface Device {
  id: string;
  name: string;
  type: string;
  status: string;
}

export const PandorasRoom: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'trapdoor' | 'diagnostics' | 'deployment'>('overview');
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const playUnlock = useSoundEffect('cd-tray-open');
  const playTabSwitch = useSoundEffect('cassette-click');
  const playError = useSoundEffect('vinyl-scratch');

  const tabs = [
    { id: 'overview' as const, name: 'Overview', icon: Smartphone },
    { id: 'trapdoor' as const, name: 'Trapdoor Tools', icon: Shield },
    { id: 'diagnostics' as const, name: 'Advanced Diagnostics', icon: Activity },
    { id: 'deployment' as const, name: 'Deployment', icon: Upload },
  ];

  const handlePasswordSubmit = () => {
    if (passwordInput === SECRET_ROOM_PASSWORD) {
      playUnlock();
      setIsAuthenticated(true);
      setPasswordError(false);
      setPasswordInput('');
    } else {
      playError();
      setPasswordError(true);
      setPasswordInput('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen workshop-bg text-white p-6 flex items-center justify-center">
        <Card className="w-full max-w-md cd-jewel-case">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#FF6B9D]">
              <Lock className="h-5 w-5" />
              Pandora's Room
            </CardTitle>
            <CardDescription>Enter password to access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setPasswordError(false);
              }}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              className="bg-[#1A1F2C] border-[#2FD3FF]/30 text-white"
            />
            {passwordError && (
              <Alert className="bg-red-500/20 border-red-500">
                <AlertDescription className="text-red-300">Invalid password</AlertDescription>
              </Alert>
            )}
            <Button 
              onClick={handlePasswordSubmit}
              className="w-full btn-sneaker"
            >
              🔓 Unlock Pandora's Room
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen workshop-bg text-white p-6 repair-table">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 graffiti-tag">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="h-8 w-8 text-[#2FD3FF]" />
            <h1 className="street-sign-text text-3xl">
              🔐 PANDORA'S ROOM 🔐
            </h1>
          </div>
          <p className="text-gray-400">
            Bobby's Secret Room - Advanced device management, diagnostics, and trapdoor tool execution
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Merged from The-Pandora-Codex Control Room (TITAN 2)
          </p>
        </header>

        <Alert className="mb-6 sneaker-box-card ambient-glow-gold">
          <Shield className="h-4 w-4 text-[#FF6B9D]" />
          <AlertDescription className="text-gray-300">
            <strong className="text-[#FF6B9D]">⚖️ Legal Notice:</strong> Trapdoor tools are for authorized use only on devices you own or have explicit permission to access. 
            Unauthorized device access is illegal under CFAA and similar laws worldwide.
          </AlertDescription>
        </Alert>

        {/* Tab Navigation */}
        <div className="boom-bap-panel rounded-lg p-1 mb-6 flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playTabSwitch();
                  setActiveTab(tab.id);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium text-sm transition-all ${
                  isActive
                    ? 'btn-sneaker'
                    : 'boom-bap-button'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#141922] border-[#2FD3FF]/20">
                <CardHeader>
                  <CardTitle className="text-white">Trapdoor Module</CardTitle>
                  <CardDescription className="text-gray-400">
                    Sandboxed execution of iOS/Android bypass tools
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-gray-300">
                  <ul className="space-y-2 text-sm mb-4">
                    <li>✓ iOS Tools (A5-A11): checkra1n, palera1n, lockra1n</li>
                    <li>✓ iOS Tools (A12+): MinaCriss, iRemovalTools</li>
                    <li>✓ Android Tools: FRP helpers, Magisk, TWRP</li>
                    <li>✓ Firejail sandboxing with security isolation</li>
                    <li>✓ Tool signature verification (SHA-256)</li>
                  </ul>
                  <Alert className="bg-blue-500/10 border-blue-500/30">
                    <AlertDescription className="text-blue-300 text-xs">
                      <strong>Device States Required:</strong> DFU (iOS), Fastboot/ADB (Android), Recovery mode for some operations
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card className="bg-[#141922] border-[#2FD3FF]/20">
                <CardHeader>
                  <CardTitle className="text-white">Advanced Diagnostics</CardTitle>
                  <CardDescription className="text-gray-400">
                    Enhanced device diagnostics from TITAN 3 engine
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-gray-300">
                  <ul className="space-y-2 text-sm mb-4">
                    <li>✓ Deep hardware diagnostics</li>
                    <li>✓ Thermal monitoring and imaging</li>
                    <li>✓ Storage health analysis</li>
                    <li>✓ USB transport layer diagnostics</li>
                    <li>✓ Deployment job management</li>
                  </ul>
                  <Alert className="bg-green-500/10 border-green-500/30">
                    <AlertDescription className="text-green-300 text-xs">
                      <strong>Preferred State:</strong> Normal mode with ADB enabled (Android) or Developer Mode (iOS)
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'trapdoor' && (
            <div className="space-y-6">
              <Alert className="bg-[#0B0F14] border-[#FF6B9D]/50">
                <Shield className="h-4 w-4 text-[#FF6B9D]" />
                <AlertDescription className="text-gray-300">
                  <strong className="text-[#FF6B9D]">Bobby's Secret Workshop Integration</strong>
                  <br />
                  Full Trapdoor API with workflow execution, shadow logging, and secure operations.
                </AlertDescription>
              </Alert>

              <Tabs defaultValue="control" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-[#141922]">
                  <TabsTrigger value="control" className="data-[state=active]:bg-[#2FD3FF] data-[state=active]:text-black">
                    Control Panel
                  </TabsTrigger>
                  <TabsTrigger value="workflows" className="data-[state=active]:bg-[#2FD3FF] data-[state=active]:text-black">
                    Workflows
                  </TabsTrigger>
                  <TabsTrigger value="logs" className="data-[state=active]:bg-[#2FD3FF] data-[state=active]:text-black">
                    Shadow Logs
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="control" className="mt-6">
                  <Card className="bg-[#141922] border-[#2FD3FF]/20">
                    <CardHeader>
                      <CardTitle className="text-white">Trapdoor Control Panel</CardTitle>
                      <CardDescription className="text-gray-400">
                        Execute sensitive operations with proper authorization
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TrapdoorControlPanel />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="workflows" className="mt-6">
                  <Card className="bg-[#141922] border-[#2FD3FF]/20">
                    <CardHeader>
                      <CardTitle className="text-white">Workflow Execution Console</CardTitle>
                      <CardDescription className="text-gray-400">
                        Browse and execute available workflows
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <WorkflowExecutionConsole />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="logs" className="mt-6">
                  <Card className="bg-[#141922] border-[#2FD3FF]/20">
                    <CardHeader>
                      <CardTitle className="text-white">Shadow Logs Viewer</CardTitle>
                      <CardDescription className="text-gray-400">
                        View encrypted audit logs (admin only)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ShadowLogsViewer />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <Card className="bg-[#141922] border-[#2FD3FF]/20">
                <CardHeader>
                  <CardTitle className="text-white">Implementation Details</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Documentation</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• BOBBY_SECRET_WORKSHOP.md - Complete integration guide</li>
                        <li>• TRAPDOOR_CLI_USAGE.md - Command-line interface guide</li>
                        <li>• TRAPDOOR_IMPLEMENTATION_SUMMARY.md - Technical implementation</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">API Endpoints</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• POST /api/trapdoor/frp - Execute FRP bypass</li>
                        <li>• POST /api/trapdoor/unlock - Execute bootloader unlock</li>
                        <li>• POST /api/trapdoor/workflow/execute - Execute custom workflow</li>
                        <li>• GET /api/trapdoor/workflows - List available workflows</li>
                        <li>• GET /api/trapdoor/logs/shadow - View shadow logs</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Location</h4>
                      <p className="text-sm text-gray-400">
                        Core API: <code className="text-[#2FD3FF]">core/api/trapdoor.js</code>
                      </p>
                      <p className="text-sm text-gray-400">
                        Workflows: <code className="text-[#2FD3FF]">workflows/</code>
                      </p>
                      <p className="text-sm text-gray-400">
                        Shadow Logs: <code className="text-[#2FD3FF]">logs/shadow/</code>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'diagnostics' && (
            <Card className="bg-[#141922] border-[#2FD3FF]/20">
              <CardHeader>
                <CardTitle className="text-white">Advanced Diagnostics Engine</CardTitle>
                <CardDescription className="text-gray-400">
                  Enhanced diagnostic capabilities from Pandora Codex TITAN 3
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p className="text-sm mb-4">
                  This module integrates advanced diagnostic features from The-Pandora-Codex, including:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#0B0F14] p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Imaging Engine</h4>
                    <p className="text-sm text-gray-400">
                      Advanced disk imaging and forensic capabilities
                    </p>
                  </div>
                  <div className="bg-[#0B0F14] p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Thermal Monitoring</h4>
                    <p className="text-sm text-gray-400">
                      Real-time temperature tracking and thermal analysis
                    </p>
                  </div>
                  <div className="bg-[#0B0F14] p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Storage Analysis</h4>
                    <p className="text-sm text-gray-400">
                      SMART data analysis and health monitoring
                    </p>
                  </div>
                  <div className="bg-[#0B0F14] p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">USB Transport</h4>
                    <p className="text-sm text-gray-400">
                      Low-level USB diagnostics and vendor detection
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'deployment' && (
            <Card className="bg-[#141922] border-[#2FD3FF]/20">
              <CardHeader>
                <CardTitle className="text-white">Deployment Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Job-based deployment and execution tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p className="text-sm">
                  Deployment features from Pandora Codex are available in the integrated BootForge USB crates.
                  Future enhancements will provide a full UI for managing deployment jobs.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
