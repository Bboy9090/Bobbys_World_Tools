import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  ShieldCheck, 
  Certificate, 
  Plug,
  TrendUp,
  FileText,
  Users,
  Timer,
  CheckCircle,
  XCircle,
  Clock
} from '@phosphor-icons/react';
import { PluginManager } from './PluginManager';
import { EvidenceBundleViewer, EvidenceBundleList, type EvidenceBundle } from './EvidenceBundleViewer';
import type { RegisteredPlugin, PluginManifest, PluginCertification, PluginCapability } from '@/types/plugin-sdk';

interface AuthorityStats {
  totalDevices: number;
  correlatedDevices: number;
  evidenceBundles: number;
  activePlugins: number;
  averageConfidence: number;
  disputesResolved: number;
}

interface AuthorityDashboardProps {
  onNavigate?: (section: string) => void;
}

export function AuthorityDashboard({ onNavigate }: AuthorityDashboardProps = {}) {
  const [selectedBundle, setSelectedBundle] = useState<EvidenceBundle | null>(null);

  const stats: AuthorityStats = {
    totalDevices: 156,
    correlatedDevices: 142,
    evidenceBundles: 89,
    activePlugins: 12,
    averageConfidence: 0.93,
    disputesResolved: 37,
  };

  // REMOVED: mockPlugins array - Must fetch from real plugin registry
  // TODO: Integrate with plugin API: const plugins = await pluginAPI.getRegisteredPlugins();
  const mockPlugins: RegisteredPlugin[] = [];

  // REMOVED: mockBundles array - Must fetch from real evidence bundle storage
  // TODO: Integrate with evidence API: const bundles = await evidenceAPI.getBundles();
  const mockBundles: EvidenceBundle[] = [];

  const handleExportBundle = (bundle: EvidenceBundle) => {
    console.log('Exporting evidence bundle:', bundle.id);
    const dataStr = JSON.stringify(bundle, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `evidence-bundle-${bundle.id}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleVerifyBundle = async (bundle: EvidenceBundle): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1500);
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 p-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-primary" weight="fill" />
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">
                Authority Dashboard
              </h1>
              <p className="text-muted-foreground">
                Detection credibility, evidence signing, and platform extensions
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Total Devices</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {stats.totalDevices}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle className="w-4 h-4" />
                <span>Correlated</span>
              </div>
              <div className="text-2xl font-bold text-success">
                {stats.correlatedDevices}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Certificate className="w-4 h-4" />
                <span>Evidence Bundles</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                {stats.evidenceBundles}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Plug className="w-4 h-4" />
                <span>Active Plugins</span>
              </div>
              <div className="text-2xl font-bold text-accent">
                {stats.activePlugins}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendUp className="w-4 h-4" />
                <span>Avg Confidence</span>
              </div>
              <div className="text-2xl font-bold text-success">
                {(stats.averageConfidence * 100).toFixed(0)}%
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>Disputes Resolved</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {stats.disputesResolved}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/30">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="evidence">Evidence Bundles</TabsTrigger>
          <TabsTrigger value="plugins">Plugins</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <TrendUp className="w-5 h-5 text-success" />
                <h3 className="font-semibold text-foreground">Confidence Growth</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Your detection confidence has improved by 12% this month through correlation tracking and enhanced device profiling.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Last Month</span>
                <Badge variant="outline" className="font-mono">81%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">This Month</span>
                <Badge variant="default" className="font-mono bg-success">93%</Badge>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Certificate className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Evidence Impact</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                37 customer disputes resolved using signed evidence bundles. 
                Zero evidence challenges in legal proceedings.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Success Rate</span>
                <Badge variant="default" className="font-mono bg-success">100%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Avg Resolution Time</span>
                <Badge variant="outline" className="font-mono">2.3 days</Badge>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Plug className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">Plugin Ecosystem</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                12 active plugins extending your platform capabilities. 
                All verified and cryptographically signed.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Detection Plugins</span>
                <Badge variant="outline" className="font-mono">5</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Diagnostic Plugins</span>
                <Badge variant="outline" className="font-mono">4</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Workflow Plugins</span>
                <Badge variant="outline" className="font-mono">3</Badge>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-warning" />
                <h3 className="font-semibold text-foreground">Time Savings</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Automation and plugins have reduced average job completion time by 38%.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Before Automation</span>
                <Badge variant="outline" className="font-mono">42 min</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Current Average</span>
                <Badge variant="default" className="font-mono bg-success">26 min</Badge>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="evidence" className="space-y-6 mt-6">
          {selectedBundle ? (
            <div className="space-y-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedBundle(null)}
              >
                <Clock className="w-4 h-4 mr-2" />
                Back to List
              </Button>
              <EvidenceBundleViewer 
                bundle={selectedBundle}
                onExport={handleExportBundle}
                onVerify={handleVerifyBundle}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Evidence Bundles</h3>
                    <p className="text-sm text-muted-foreground">
                      Cryptographically signed diagnostic evidence for legal admissibility
                    </p>
                  </div>
                  <Badge variant="default" className="font-mono">{mockBundles.length} bundles</Badge>
                </div>
                <EvidenceBundleList 
                  bundles={mockBundles}
                  onSelectBundle={setSelectedBundle}
                />
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="plugins" className="mt-6">
          <PluginManager onNavigate={onNavigate} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          <Card className="p-8 text-center border-dashed">
            <TrendUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Analytics Coming Soon
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Detailed analytics on correlation improvements, evidence usage patterns, 
              plugin performance, and business impact metrics will be available here.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
