import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MagnifyingGlass, 
  Download, 
  Star, 
  ShieldCheck, 
  Package,
  Wrench,
  Lightning,
  CloudArrowUp,
  CheckCircle,
  XCircle,
  Clock,
  Sparkle,
  ArrowsClockwise,
  Tree
} from '@phosphor-icons/react';
import { Plugin, PluginSearchFilters, InstalledPlugin, PluginSubmission } from '@/types/plugin';
import { toast } from 'sonner';
import { pluginAPI, PluginDownloadProgress } from '@/lib/plugin-api';
import { PluginRegistrySync } from './PluginRegistrySync';
import { PluginRegistryBrowser } from './PluginRegistryBrowser';
import { PluginDependencyInstaller } from './PluginDependencyInstaller';

const MOCK_PLUGINS_FALLBACK: Plugin[] = [
  {
    id: 'samsung-enhanced-diag',
    name: 'Samsung Enhanced Diagnostics',
    slug: 'samsung-enhanced-diag',
    description: 'Advanced diagnostics for Samsung Galaxy devices with Knox status checks',
    longDescription: 'Comprehensive diagnostic suite specifically designed for Samsung devices. Includes Knox warranty bit detection, bootloader status verification, and Samsung-specific sensor testing.',
    category: 'diagnostic',
    riskLevel: 'safe',
    status: 'approved',
    author: {
      id: 'user_bobby',
      username: 'bobby',
      verified: true,
      reputation: 98,
      totalDownloads: 15420
    },
    capabilities: {
      requiresUSB: true,
      requiresRoot: false,
      modifiesSystem: false,
      platforms: ['android'],
      permissions: ['USB_READ', 'DEVICE_INFO']
    },
    currentVersion: {
      version: '2.3.1',
      releaseDate: Date.now() - 604800000,
      changelog: 'Added Knox 3.9 support, improved battery health detection',
      downloadUrl: 'https://example.com/plugins/samsung-diag-2.3.1.zip',
      hash: 'sha256:abc123...',
      size: 2456789,
      minAppVersion: '1.0.0'
    },
    versions: [],
    testResults: [
      { id: 't1', testName: 'Code Quality Scan', status: 'pass', duration: 1200, timestamp: Date.now() },
      { id: 't2', testName: 'Security Audit', status: 'pass', duration: 3400, timestamp: Date.now() },
      { id: 't3', testName: 'Platform Compatibility', status: 'pass', duration: 890, timestamp: Date.now() }
    ],
    certified: true,
    certificationDate: Date.now() - 2592000000,
    downloads: 15420,
    rating: 4.8,
    reviewCount: 342,
    tags: ['samsung', 'knox', 'diagnostics', 'battery'],
    screenshots: [],
    documentation: 'https://docs.example.com/samsung-diag',
    repository: 'https://github.com/bobby/samsung-diag',
    license: 'MIT',
    createdAt: Date.now() - 7776000000,
    updatedAt: Date.now() - 604800000
  },
  {
    id: 'xiaomi-edl-helper',
    name: 'Xiaomi EDL Recovery Helper',
    slug: 'xiaomi-edl-helper',
    description: 'Automated EDL mode detection and recovery workflows for Xiaomi devices',
    longDescription: 'Streamlines emergency download (EDL) mode operations for Xiaomi devices. Automates test point detection, provides guided recovery instructions, and validates firehose loaders.',
    category: 'flashing',
    riskLevel: 'expert-only',
    status: 'approved',
    author: {
      id: 'user_tech_master',
      username: 'tech_master',
      verified: true,
      reputation: 92,
      totalDownloads: 8934
    },
    capabilities: {
      requiresUSB: true,
      requiresRoot: false,
      modifiesSystem: true,
      platforms: ['android'],
      permissions: ['USB_READ', 'USB_WRITE', 'FLASH_FIRMWARE']
    },
    currentVersion: {
      version: '1.8.2',
      releaseDate: Date.now() - 259200000,
      changelog: 'Added support for Redmi Note 12 series, improved error handling',
      downloadUrl: 'https://example.com/plugins/xiaomi-edl-1.8.2.zip',
      hash: 'sha256:def456...',
      size: 4123456,
      minAppVersion: '1.1.0'
    },
    versions: [],
    testResults: [
      { id: 't4', testName: 'Code Quality Scan', status: 'pass', duration: 1450, timestamp: Date.now() },
      { id: 't5', testName: 'Security Audit', status: 'pass', duration: 2980, timestamp: Date.now() },
      { id: 't6', testName: 'Platform Compatibility', status: 'pass', duration: 1120, timestamp: Date.now() }
    ],
    certified: true,
    certificationDate: Date.now() - 5184000000,
    downloads: 8934,
    rating: 4.6,
    reviewCount: 187,
    tags: ['xiaomi', 'edl', 'recovery', 'advanced'],
    screenshots: [],
    documentation: 'https://docs.example.com/xiaomi-edl',
    repository: 'https://github.com/techmaster/xiaomi-edl',
    license: 'GPL-3.0',
    createdAt: Date.now() - 15552000000,
    updatedAt: Date.now() - 259200000
  },
  {
    id: 'ios-checkra1n-automation',
    name: 'iOS Checkra1n Automation',
    slug: 'ios-checkra1n-automation',
    description: 'Automated checkra1n workflows for A5-A11 devices',
    longDescription: 'One-click checkra1n jailbreak automation with DFU mode helper, compatibility checking, and post-jailbreak verification. Educational resource for legitimate iOS research.',
    category: 'workflow',
    riskLevel: 'advanced',
    status: 'approved',
    author: {
      id: 'user_ios_dev',
      username: 'ios_dev',
      verified: true,
      reputation: 95,
      totalDownloads: 12203
    },
    capabilities: {
      requiresUSB: true,
      requiresRoot: false,
      modifiesSystem: true,
      platforms: ['ios'],
      permissions: ['USB_READ', 'USB_WRITE', 'BOOTROM_ACCESS']
    },
    currentVersion: {
      version: '3.1.0',
      releaseDate: Date.now() - 1209600000,
      changelog: 'Updated for checkra1n 0.12.4, improved DFU detection',
      downloadUrl: 'https://example.com/plugins/checkra1n-auto-3.1.0.zip',
      hash: 'sha256:ghi789...',
      size: 3567890,
      minAppVersion: '1.0.0'
    },
    versions: [],
    testResults: [
      { id: 't7', testName: 'Code Quality Scan', status: 'pass', duration: 1890, timestamp: Date.now() },
      { id: 't8', testName: 'Security Audit', status: 'pass', duration: 4120, timestamp: Date.now() },
      { id: 't9', testName: 'Platform Compatibility', status: 'pass', duration: 1340, timestamp: Date.now() }
    ],
    certified: true,
    certificationDate: Date.now() - 3456000000,
    downloads: 12203,
    rating: 4.9,
    reviewCount: 289,
    tags: ['ios', 'checkra1n', 'jailbreak', 'dfu'],
    screenshots: [],
    documentation: 'https://docs.example.com/checkra1n-auto',
    license: 'MIT',
    createdAt: Date.now() - 10368000000,
    updatedAt: Date.now() - 1209600000
  },
  {
    id: 'multi-brand-fastboot',
    name: 'Universal Fastboot Tools',
    slug: 'multi-brand-fastboot',
    description: 'Unified fastboot interface for Google, OnePlus, Motorola, and more',
    longDescription: 'Comprehensive fastboot toolkit supporting multiple OEMs with brand-specific optimizations. Includes partition management, variable reading, and safe flashing workflows.',
    category: 'flashing',
    riskLevel: 'moderate',
    status: 'approved',
    author: {
      id: 'user_fastboot_pro',
      username: 'fastboot_pro',
      verified: true,
      reputation: 89,
      totalDownloads: 18765
    },
    capabilities: {
      requiresUSB: true,
      requiresRoot: false,
      modifiesSystem: true,
      platforms: ['android'],
      permissions: ['USB_READ', 'USB_WRITE', 'FLASH_FIRMWARE']
    },
    currentVersion: {
      version: '4.2.3',
      releaseDate: Date.now() - 432000000,
      changelog: 'Added Nothing Phone support, improved OnePlus detection',
      downloadUrl: 'https://example.com/plugins/fastboot-4.2.3.zip',
      hash: 'sha256:jkl012...',
      size: 5678901,
      minAppVersion: '1.0.0'
    },
    versions: [],
    testResults: [
      { id: 't10', testName: 'Code Quality Scan', status: 'pass', duration: 2100, timestamp: Date.now() },
      { id: 't11', testName: 'Security Audit', status: 'pass', duration: 3890, timestamp: Date.now() },
      { id: 't12', testName: 'Platform Compatibility', status: 'pass', duration: 1560, timestamp: Date.now() }
    ],
    certified: true,
    certificationDate: Date.now() - 1728000000,
    downloads: 18765,
    rating: 4.7,
    reviewCount: 421,
    tags: ['fastboot', 'multi-brand', 'flashing', 'universal'],
    screenshots: [],
    documentation: 'https://docs.example.com/fastboot-tools',
    repository: 'https://github.com/fastbootpro/universal-fastboot',
    license: 'Apache-2.0',
    createdAt: Date.now() - 20736000000,
    updatedAt: Date.now() - 432000000
  },
  {
    id: 'battery-health-pro',
    name: 'Battery Health Pro',
    slug: 'battery-health-pro',
    description: 'Deep battery diagnostics with cycle count and degradation tracking',
    longDescription: 'Professional battery health analysis tool providing cycle count estimation, capacity degradation tracking, and charge pattern recommendations. Works across Android and iOS.',
    category: 'diagnostic',
    riskLevel: 'safe',
    status: 'testing',
    author: {
      id: 'user_battery_wizard',
      username: 'battery_wizard',
      verified: false,
      reputation: 76,
      totalDownloads: 3421
    },
    capabilities: {
      requiresUSB: true,
      requiresRoot: false,
      modifiesSystem: false,
      platforms: ['android', 'ios'],
      permissions: ['USB_READ', 'BATTERY_INFO']
    },
    currentVersion: {
      version: '1.0.0-beta.3',
      releaseDate: Date.now() - 86400000,
      changelog: 'Initial beta release, added iOS support',
      downloadUrl: 'https://example.com/plugins/battery-health-1.0.0-beta.3.zip',
      hash: 'sha256:mno345...',
      size: 1234567,
      minAppVersion: '1.2.0'
    },
    versions: [],
    testResults: [
      { id: 't13', testName: 'Code Quality Scan', status: 'pass', duration: 980, timestamp: Date.now() },
      { id: 't14', testName: 'Security Audit', status: 'pass', duration: 2340, timestamp: Date.now() },
      { id: 't15', testName: 'Platform Compatibility', status: 'fail', duration: 780, message: 'iOS 17 compatibility issues', timestamp: Date.now() }
    ],
    certified: false,
    downloads: 3421,
    rating: 4.3,
    reviewCount: 67,
    tags: ['battery', 'diagnostics', 'health', 'universal'],
    screenshots: [],
    documentation: 'https://docs.example.com/battery-health',
    repository: 'https://github.com/batterywizard/health-pro',
    license: 'MIT',
    createdAt: Date.now() - 2592000000,
    updatedAt: Date.now() - 86400000
  }
];

export function PluginMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PluginSearchFilters>({
    sortBy: 'popular'
  });
  const [installedPlugins, setInstalledPlugins] = useKV<InstalledPlugin[]>('installed-plugins', []);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'installed' | 'submit'>('browse');
  const [plugins, setPlugins] = useState<Plugin[]>(MOCK_PLUGINS_FALLBACK);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<Map<string, PluginDownloadProgress>>(new Map());
  const [dependencyInstallDialog, setDependencyInstallDialog] = useState<{
    open: boolean;
    pluginId: string;
    pluginName: string;
    version?: string;
  } | null>(null);

  const installed = installedPlugins || [];

  useEffect(() => {
    loadPlugins();
  }, [filters]);

  const loadPlugins = async () => {
    setLoading(true);
    try {
      const results = await pluginAPI.searchPlugins(filters);
      setPlugins(results);
    } catch (error) {
      console.error('Failed to load plugins:', error);
      toast.error('Failed to load plugins, showing local cache');
      setPlugins(MOCK_PLUGINS_FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlugins = plugins.filter(plugin => {
    if (searchQuery && !plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !plugin.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'popular': return b.downloads - a.downloads;
      case 'recent': return b.updatedAt - a.updatedAt;
      case 'rating': return b.rating - a.rating;
      case 'name': return a.name.localeCompare(b.name);
      default: return 0;
    }
  });

  const handleInstall = async (plugin: Plugin) => {
    const existing = installed.find(p => p.plugin.id === plugin.id);
    if (existing) {
      toast.error('Plugin already installed');
      return;
    }

    setDependencyInstallDialog({
      open: true,
      pluginId: plugin.id,
      pluginName: plugin.name,
      version: plugin.currentVersion.version,
    });
  };

  const handleDependencyInstallComplete = async (success: boolean) => {
    if (success && dependencyInstallDialog) {
      await loadPlugins();
      const installedList = await pluginAPI.getInstalledPlugins();
      setInstalledPlugins(installedList);
    }
    setDependencyInstallDialog(null);
  };

  const handleUninstall = async (pluginId: string) => {
    try {
      await pluginAPI.uninstallPlugin(pluginId);
      setInstalledPlugins(current => (current || []).filter(p => p.plugin.id !== pluginId));
      toast.success('Plugin uninstalled');
    } catch (error) {
      toast.error('Failed to uninstall plugin');
    }
  };

  const handleToggleEnabled = (pluginId: string) => {
    setInstalledPlugins(current => 
      (current || []).map(p => 
        p.plugin.id === pluginId 
          ? { ...p, enabled: !p.enabled }
          : p
      )
    );
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'safe': return 'bg-success/10 text-success border-success/20';
      case 'moderate': return 'bg-accent/10 text-accent border-accent/20';
      case 'advanced': return 'bg-warning/10 text-warning border-warning/20';
      case 'expert-only': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-success';
      case 'testing': return 'text-warning';
      case 'rejected': return 'text-destructive';
      case 'pending': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-primary">Plugin Marketplace</h1>
          <p className="text-muted-foreground mt-1">Extend Bobby's World with community-built tools</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadPlugins}
            disabled={loading}
          >
            <ArrowsClockwise className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Badge variant="outline" className="gap-1.5">
            <Package className="w-3.5 h-3.5" />
            {plugins.length} Available
          </Badge>
          <Badge variant="outline" className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            {installed.length} Installed
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="installed">Installed ({installed.length})</TabsTrigger>
          <TabsTrigger value="submit">Submit Plugin</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6 mt-6">
          <PluginRegistrySync />
          
          <PluginRegistryBrowser />
          
          <div className="flex gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search plugins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filters.sortBy} onValueChange={(v) => setFilters(f => ({ ...f, sortBy: v as any }))}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="recent">Recently Updated</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.certified === undefined ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters(f => ({ ...f, certified: undefined }))}
            >
              All Plugins
            </Button>
            <Button
              variant={filters.certified === true ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters(f => ({ ...f, certified: true }))}
              className="gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Certified Only
            </Button>
            {(['diagnostic', 'flashing', 'detection', 'workflow', 'automation', 'utility'] as const).map(cat => (
              <Button
                key={cat}
                variant={filters.category === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters(f => ({ ...f, category: f.category === cat ? undefined : cat }))}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredPlugins.map(plugin => {
              const isInstalled = installed.some(p => p.plugin.id === plugin.id);
              const downloadProgress = downloading.get(plugin.id);
              
              return (
                <Card key={plugin.id} className="p-5 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setSelectedPlugin(plugin)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{plugin.name}</h3>
                        {plugin.certified && (
                          <ShieldCheck className="w-4 h-4 text-primary" weight="fill" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{plugin.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {plugin.downloads.toLocaleString()}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" weight="fill" />
                          {plugin.rating.toFixed(1)} ({plugin.reviewCount})
                        </span>
                        <span>•</span>
                        <span>v{plugin.currentVersion.version}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className={getRiskLevelColor(plugin.riskLevel)}>
                      {plugin.riskLevel}
                    </Badge>
                    <Badge variant="outline">
                      {plugin.category}
                    </Badge>
                    {plugin.capabilities.platforms.map(platform => (
                      <Badge key={platform} variant="outline" className="text-xs">
                        {platform}
                      </Badge>
                    ))}
                  </div>

                  {downloadProgress && (
                    <div className="mb-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground capitalize">{downloadProgress.stage}</span>
                        {downloadProgress.progress > 0 && (
                          <span className="text-muted-foreground">{Math.round(downloadProgress.progress)}%</span>
                        )}
                      </div>
                      <Progress value={downloadProgress.progress} />
                      {downloadProgress.bytesDownloaded && downloadProgress.totalBytes && (
                        <div className="text-xs text-muted-foreground">
                          {(downloadProgress.bytesDownloaded / 1024 / 1024).toFixed(1)} MB / {(downloadProgress.totalBytes / 1024 / 1024).toFixed(1)} MB
                        </div>
                      )}
                      {downloadProgress.error && (
                        <div className="text-xs text-destructive">{downloadProgress.error}</div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      disabled={isInstalled || !!downloadProgress}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInstall(plugin);
                      }}
                      className="flex-1"
                    >
                      {downloadProgress ? (
                        <>
                          <ArrowsClockwise className="w-4 h-4 mr-1.5 animate-spin" />
                          {downloadProgress.stage === 'downloading' ? 'Downloading' : 'Installing'}
                        </>
                      ) : isInstalled ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1.5" />
                          Installed
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-1.5" />
                          Install
                        </>
                      )}
                    </Button>
                    <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
                      Details
                    </Button>
                  </div>

                  {plugin.status !== 'approved' && (
                    <div className={`flex items-center gap-1.5 text-xs mt-3 pt-3 border-t ${getStatusColor(plugin.status)}`}>
                      {plugin.status === 'testing' && <Clock className="w-3.5 h-3.5" />}
                      {plugin.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                      Status: {plugin.status.toUpperCase()}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {filteredPlugins.length === 0 && (
            <Card className="p-12 text-center">
              <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No plugins found matching your criteria</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="installed" className="space-y-4 mt-6">
          {installed.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No plugins installed yet</p>
              <Button onClick={() => setActiveTab('browse')}>Browse Marketplace</Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {installed.map(({ plugin, installedVersion, installedAt, enabled }) => (
                <Card key={plugin.id} className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{plugin.name}</h3>
                        {plugin.certified && (
                          <ShieldCheck className="w-4 h-4 text-primary" weight="fill" />
                        )}
                        <Badge variant={enabled ? 'default' : 'outline'} className="text-xs">
                          {enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{plugin.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Version: {installedVersion}</span>
                        <span>•</span>
                        <span>Installed: {new Date(installedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={enabled ? 'outline' : 'default'}
                        onClick={() => handleToggleEnabled(plugin.id)}
                      >
                        {enabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUninstall(plugin.id)}
                      >
                        Uninstall
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="submit" className="space-y-6 mt-6">
          <PluginSubmissionForm />
        </TabsContent>
      </Tabs>

      {selectedPlugin && (
        <PluginDetailsModal
          plugin={selectedPlugin}
          onClose={() => setSelectedPlugin(null)}
          onInstall={handleInstall}
          isInstalled={installed.some(p => p.plugin.id === selectedPlugin.id)}
        />
      )}

      <Dialog open={dependencyInstallDialog?.open || false} onOpenChange={(open) => {
        if (!open) setDependencyInstallDialog(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tree className="text-primary" />
              Install with Dependencies
            </DialogTitle>
          </DialogHeader>
          {dependencyInstallDialog && (
            <PluginDependencyInstaller
              pluginId={dependencyInstallDialog.pluginId}
              pluginName={dependencyInstallDialog.pluginName}
              version={dependencyInstallDialog.version}
              onInstallComplete={handleDependencyInstallComplete}
              onCancel={() => setDependencyInstallDialog(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PluginSubmissionForm() {
  const [submission, setSubmission] = useState<Partial<PluginSubmission>>({
    category: 'diagnostic',
    riskLevel: 'safe',
    license: 'MIT'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSubmitting(false);
    toast.success('Plugin submitted for review! You\'ll receive updates via email.');
    setSubmission({
      category: 'diagnostic',
      riskLevel: 'safe',
      license: 'MIT'
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary/10">
            <CloudArrowUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Submit Your Plugin</h2>
            <p className="text-sm text-muted-foreground">Share your tools with the Bobby's World community</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Plugin Name</label>
            <Input
              placeholder="My Awesome Plugin"
              value={submission.name || ''}
              onChange={(e) => setSubmission(s => ({ ...s, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Short Description</label>
            <Input
              placeholder="Brief description of what your plugin does"
              value={submission.description || ''}
              onChange={(e) => setSubmission(s => ({ ...s, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Category</label>
              <Select value={submission.category} onValueChange={(v) => setSubmission(s => ({ ...s, category: v as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diagnostic">Diagnostic</SelectItem>
                  <SelectItem value="flashing">Flashing</SelectItem>
                  <SelectItem value="detection">Detection</SelectItem>
                  <SelectItem value="workflow">Workflow</SelectItem>
                  <SelectItem value="automation">Automation</SelectItem>
                  <SelectItem value="utility">Utility</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Risk Level</label>
              <Select value={submission.riskLevel} onValueChange={(v) => setSubmission(s => ({ ...s, riskLevel: v as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="safe">Safe</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert-only">Expert Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Repository URL (optional)</label>
            <Input
              placeholder="https://github.com/yourusername/plugin"
              value={submission.repository || ''}
              onChange={(e) => setSubmission(s => ({ ...s, repository: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">License</label>
            <Select value={submission.license} onValueChange={(v) => setSubmission(s => ({ ...s, license: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MIT">MIT</SelectItem>
                <SelectItem value="Apache-2.0">Apache 2.0</SelectItem>
                <SelectItem value="GPL-3.0">GPL 3.0</SelectItem>
                <SelectItem value="BSD-3-Clause">BSD 3-Clause</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="p-4 bg-muted/50">
            <div className="flex gap-3">
              <Sparkle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-2">
                <p className="font-medium">Plugin Certification Process</p>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Automated security scan</li>
                  <li>Code quality analysis</li>
                  <li>Platform compatibility tests</li>
                  <li>Manual review by Bobby's team</li>
                  <li>Community testing period</li>
                </ul>
              </div>
            </div>
          </Card>

          <Button
            className="w-full"
            size="lg"
            disabled={!submission.name || !submission.description || submitting}
            onClick={handleSubmit}
          >
            {submitting ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CloudArrowUp className="w-4 h-4 mr-2" />
                Submit for Review
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function PluginDetailsModal({ plugin, onClose, onInstall, isInstalled }: {
  plugin: Plugin;
  onClose: () => void;
  onInstall: (plugin: Plugin) => void;
  isInstalled: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">{plugin.name}</h2>
                {plugin.certified && (
                  <ShieldCheck className="w-5 h-5 text-primary" weight="fill" />
                )}
              </div>
              <p className="text-muted-foreground">{plugin.description}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={`${plugin.riskLevel === 'safe' ? 'bg-success/10 text-success' : plugin.riskLevel === 'expert-only' ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent'}`}>
              {plugin.riskLevel}
            </Badge>
            <Badge variant="outline">{plugin.category}</Badge>
            {plugin.capabilities.platforms.map(platform => (
              <Badge key={platform} variant="outline">{platform}</Badge>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{plugin.downloads.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Downloads</div>
            </div>
            <div>
              <div className="text-2xl font-bold flex items-center justify-center gap-1">
                {plugin.rating.toFixed(1)}
                <Star className="w-5 h-5 text-accent" weight="fill" />
              </div>
              <div className="text-sm text-muted-foreground">{plugin.reviewCount} Reviews</div>
            </div>
            <div>
              <div className="text-2xl font-bold">v{plugin.currentVersion.version}</div>
              <div className="text-sm text-muted-foreground">Current Version</div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-sm text-muted-foreground">{plugin.longDescription}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Author</h3>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-mono">
                {plugin.author.username.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium">{plugin.author.username}</span>
                  {plugin.author.verified && (
                    <CheckCircle className="w-3.5 h-3.5 text-primary" weight="fill" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {plugin.author.reputation}% reputation • {plugin.author.totalDownloads.toLocaleString()} total downloads
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Automated Test Results</h3>
            <div className="space-y-2">
              {plugin.testResults.map(test => (
                <div key={test.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    {test.status === 'pass' && <CheckCircle className="w-4 h-4 text-success" weight="fill" />}
                    {test.status === 'fail' && <XCircle className="w-4 h-4 text-destructive" weight="fill" />}
                    {test.status === 'skip' && <Clock className="w-4 h-4 text-muted-foreground" />}
                    <span className="text-sm font-medium">{test.testName}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{(test.duration / 1000).toFixed(1)}s</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Capabilities</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${plugin.capabilities.requiresUSB ? 'bg-primary' : 'bg-muted'}`} />
                USB Access {plugin.capabilities.requiresUSB ? 'Required' : 'Not Required'}
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${plugin.capabilities.requiresRoot ? 'bg-destructive' : 'bg-muted'}`} />
                Root {plugin.capabilities.requiresRoot ? 'Required' : 'Not Required'}
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${plugin.capabilities.modifiesSystem ? 'bg-warning' : 'bg-muted'}`} />
                {plugin.capabilities.modifiesSystem ? 'Modifies System' : 'Read-Only'}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              className="flex-1"
              size="lg"
              disabled={isInstalled}
              onClick={() => {
                onInstall(plugin);
                onClose();
              }}
            >
              {isInstalled ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Already Installed
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Install Plugin
                </>
              )}
            </Button>
            {plugin.repository && (
              <Button variant="outline" size="lg" asChild>
                <a href={plugin.repository} target="_blank" rel="noopener noreferrer">
                  View Source
                </a>
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
