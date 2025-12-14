import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plug, 
  Shield, 
  Download,
  Play,
  Pause,
  Trash,
  CheckCircle,
  XCircle,
  Warning,
  Info,
  Fingerprint,
  Package
} from '@phosphor-icons/react';

export type PluginRiskLevel = 'safe' | 'moderate' | 'destructive';
export type PluginType = 'detection' | 'diagnostic' | 'workflow' | 'integration';
export type PluginStatus = 'active' | 'inactive' | 'error';

export interface Plugin {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  type: PluginType;
  riskLevel: PluginRiskLevel;
  status: PluginStatus;
  capabilities: string[];
  hash: string;
  signature: string;
  verified: boolean;
  installed: boolean;
  enabled: boolean;
}

interface PluginCardProps {
  plugin: Plugin;
  onInstall?: (plugin: Plugin) => void;
  onUninstall?: (plugin: Plugin) => void;
  onEnable?: (plugin: Plugin) => void;
  onDisable?: (plugin: Plugin) => void;
}

const riskConfig: Record<PluginRiskLevel, {
  icon: typeof Shield;
  color: string;
  bgColor: string;
  label: string;
}> = {
  safe: {
    icon: Shield,
    color: 'text-success',
    bgColor: 'bg-success/10 border-success/20',
    label: 'SAFE',
  },
  moderate: {
    icon: Warning,
    color: 'text-warning',
    bgColor: 'bg-warning/10 border-warning/20',
    label: 'MODERATE',
  },
  destructive: {
    icon: XCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10 border-destructive/20',
    label: 'DESTRUCTIVE',
  },
};

const typeConfig: Record<PluginType, {
  color: string;
  label: string;
}> = {
  detection: {
    color: 'bg-primary/10 text-primary',
    label: 'Detection',
  },
  diagnostic: {
    color: 'bg-accent/10 text-accent',
    label: 'Diagnostic',
  },
  workflow: {
    color: 'bg-secondary/10 text-secondary-foreground',
    label: 'Workflow',
  },
  integration: {
    color: 'bg-muted text-muted-foreground',
    label: 'Integration',
  },
};

export function PluginCard({ plugin, onInstall, onUninstall, onEnable, onDisable }: PluginCardProps) {
  const risk = riskConfig[plugin.riskLevel];
  const type = typeConfig[plugin.type];
  const RiskIcon = risk.icon;

  return (
    <Card className="p-5 space-y-4 border-border hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" weight="fill" />
            <h4 className="font-semibold text-foreground">{plugin.name}</h4>
            <Badge variant="outline" className="font-mono text-xs">
              v{plugin.version}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {plugin.description}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>by {plugin.author}</span>
          </div>
        </div>

        {plugin.verified && (
          <CheckCircle className="w-5 h-5 text-success" weight="fill" />
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <Badge variant="outline" className={`${type.color} font-medium text-xs`}>
          {type.label}
        </Badge>
        
        <Badge variant="outline" className={`${risk.bgColor} ${risk.color} border font-mono font-semibold text-xs flex items-center gap-1`}>
          <RiskIcon className="w-3 h-3" weight="bold" />
          {risk.label}
        </Badge>
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Capabilities
        </p>
        <div className="flex gap-2 flex-wrap">
          {plugin.capabilities.map((cap, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs font-mono">
              {cap}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <Fingerprint className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground font-medium">Signature Hash:</span>
        </div>
        <div className="font-mono text-xs text-foreground bg-muted/30 p-2 rounded break-all">
          {plugin.hash.substring(0, 32)}...
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        {!plugin.installed && onInstall && (
          <Button onClick={() => onInstall(plugin)} size="sm" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Install
          </Button>
        )}
        
        {plugin.installed && !plugin.enabled && onEnable && (
          <Button onClick={() => onEnable(plugin)} size="sm" className="flex-1" variant="outline">
            <Play className="w-4 h-4 mr-2" />
            Enable
          </Button>
        )}
        
        {plugin.installed && plugin.enabled && onDisable && (
          <Button onClick={() => onDisable(plugin)} size="sm" className="flex-1" variant="outline">
            <Pause className="w-4 h-4 mr-2" />
            Disable
          </Button>
        )}
        
        {plugin.installed && onUninstall && (
          <Button onClick={() => onUninstall(plugin)} size="sm" variant="destructive">
            <Trash className="w-4 h-4 mr-2" />
            Uninstall
          </Button>
        )}
      </div>

      {plugin.riskLevel === 'destructive' && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-xs text-destructive">
          <Warning className="w-4 h-4 inline mr-2" weight="fill" />
          This plugin can perform destructive operations. Use with caution.
        </div>
      )}
    </Card>
  );
}

interface PluginManagerProps {
  plugins: Plugin[];
  onInstall?: (plugin: Plugin) => void;
  onUninstall?: (plugin: Plugin) => void;
  onEnable?: (plugin: Plugin) => void;
  onDisable?: (plugin: Plugin) => void;
}

export function PluginManager({ 
  plugins, 
  onInstall, 
  onUninstall, 
  onEnable, 
  onDisable 
}: PluginManagerProps) {
  const [filterType, setFilterType] = useState<PluginType | 'all'>('all');

  const filteredPlugins = filterType === 'all' 
    ? plugins 
    : plugins.filter(p => p.type === filterType);

  const installedCount = plugins.filter(p => p.installed).length;
  const activeCount = plugins.filter(p => p.enabled).length;

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 border-border p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Plug className="w-6 h-6 text-primary" weight="fill" />
              <h2 className="text-2xl font-display font-bold text-foreground">
                Plugin Manager
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Extend Bobby's World with verified, safe plugins
            </p>
          </div>
          
          <div className="flex gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{installedCount}</div>
              <div className="text-xs text-muted-foreground">Installed</div>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{activeCount}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="all" onValueChange={(v) => setFilterType(v as PluginType | 'all')}>
        <TabsList className="grid w-full grid-cols-5 bg-muted/30">
          <TabsTrigger value="all">All ({plugins.length})</TabsTrigger>
          <TabsTrigger value="detection">Detection</TabsTrigger>
          <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        <TabsContent value={filterType} className="mt-6 space-y-4">
          {filteredPlugins.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No plugins found in this category</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPlugins.map((plugin) => (
                <PluginCard
                  key={plugin.id}
                  plugin={plugin}
                  onInstall={onInstall}
                  onUninstall={onUninstall}
                  onEnable={onEnable}
                  onDisable={onDisable}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Card className="bg-muted/10 border border-border p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary mt-0.5" weight="fill" />
          <div className="space-y-2 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Plugin Security</p>
            <p>
              All plugins are cryptographically signed and hash-verified. 
              Only install plugins from trusted sources.
            </p>
            <p>
              Plugins with <span className="text-destructive font-semibold">DESTRUCTIVE</span> risk 
              levels require explicit user confirmation before executing operations.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
