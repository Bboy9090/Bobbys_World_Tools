import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Warning, 
  ArrowsClockwise, 
  Download,
  Package,
  Tree
} from '@phosphor-icons/react';
import { usePluginDependencies } from '@/hooks/use-plugin-dependencies';
import { toast } from 'sonner';

interface PluginDependencyInstallerProps {
  pluginId: string;
  pluginName: string;
  version?: string;
  onInstallComplete?: (success: boolean) => void;
  onCancel?: () => void;
}

export function PluginDependencyInstaller({
  pluginId,
  pluginName,
  version,
  onInstallComplete,
  onCancel,
}: PluginDependencyInstallerProps) {
  const {
    dependencyStatus,
    installStatus,
    resolveDependencies,
    installWithDependencies,
    reset,
  } = usePluginDependencies();

  const [step, setStep] = useState<'resolve' | 'confirm' | 'install' | 'complete'>('resolve');

  const handleResolve = async () => {
    try {
      await resolveDependencies(pluginId, version);
      setStep('confirm');
    } catch (error) {
      toast.error('Failed to resolve dependencies');
      console.error(error);
    }
  };

  const handleInstall = async () => {
    setStep('install');
    try {
      const result = await installWithDependencies(pluginId, version);
      setStep('complete');
      
      if (result.success) {
        toast.success(`${pluginName} and dependencies installed successfully`);
        onInstallComplete?.(true);
      } else {
        toast.error(`Installation completed with errors`);
        onInstallComplete?.(false);
      }
    } catch (error) {
      toast.error('Installation failed');
      setStep('complete');
      onInstallComplete?.(false);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (step === 'resolve') {
    return (
      <Card className="p-6 border-primary/20">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Tree className="text-primary" size={24} />
            <div>
              <h3 className="text-lg font-semibold">Resolve Dependencies</h3>
              <p className="text-sm text-muted-foreground">
                Checking dependencies for {pluginName}
              </p>
            </div>
          </div>

          {dependencyStatus.isResolving && (
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <ArrowsClockwise className="animate-spin text-primary" size={20} />
              <span className="text-sm">Resolving dependencies...</span>
            </div>
          )}

          {dependencyStatus.error && (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg">
              <XCircle className="text-destructive" size={20} />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Resolution failed</p>
                <p className="text-xs text-destructive/80 mt-1">{dependencyStatus.error}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleResolve} disabled={dependencyStatus.isResolving}>
              <Tree className="mr-2" size={16} />
              Resolve Dependencies
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (step === 'confirm' && dependencyStatus.resolution) {
    const { resolution } = dependencyStatus;
    const hasConflicts = resolution.conflicts.length > 0;
    const hasCircular = resolution.circularDependencies.length > 0;

    return (
      <Card className="p-6 border-primary/20">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Package className="text-primary" size={24} />
            <div>
              <h3 className="text-lg font-semibold">Confirm Installation</h3>
              <p className="text-sm text-muted-foreground">
                Review dependencies before installation
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Installation Plan</span>
                <Badge variant="outline">{resolution.installOrder.length} plugins</Badge>
              </div>
              <div className="space-y-1">
                {resolution.installOrder.map((plugin, idx) => (
                  <div key={`${plugin.pluginId}-${idx}`} className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{idx + 1}.</span>
                    <span className="font-mono">{plugin.pluginId}</span>
                    <Badge variant="secondary" className="text-xs">{plugin.version}</Badge>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total download size:</span>
                  <span className="font-medium">{formatSize(resolution.totalSize)}</span>
                </div>
              </div>
            </div>

            {hasConflicts && (
              <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg">
                <Warning className="text-destructive mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive mb-2">Dependency Conflicts</p>
                  {resolution.conflicts.map((conflict, idx) => (
                    <div key={idx} className="text-xs text-destructive/80 mb-1">
                      <span className="font-mono">{conflict.pluginId}</span> required by{' '}
                      {conflict.requiredBy.join(', ')} with versions: {conflict.versions.join(', ')}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasCircular && (
              <div className="flex items-start gap-3 p-4 bg-warning/10 rounded-lg">
                <Warning className="text-warning mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-warning mb-2">Circular Dependencies</p>
                  {resolution.circularDependencies.map((cycle, idx) => (
                    <div key={idx} className="text-xs text-warning/80 mb-1 font-mono">
                      {cycle.join(' → ')}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleInstall} 
              disabled={hasConflicts || hasCircular}
              className="flex-1"
            >
              <Download className="mr-2" size={16} />
              Install All ({resolution.installOrder.length})
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (step === 'install') {
    const progress = installStatus.progress;

    return (
      <Card className="p-6 border-primary/20">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Download className="text-primary" size={24} />
            <div>
              <h3 className="text-lg font-semibold">Installing Dependencies</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while plugins are downloaded and installed
              </p>
            </div>
          </div>

          {progress && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{progress.currentPlugin}</span>
                  <Badge variant={
                    progress.status === 'completed' ? 'default' :
                    progress.status === 'failed' ? 'destructive' :
                    'secondary'
                  }>
                    {progress.status}
                  </Badge>
                </div>
                <Progress value={(progress.current / progress.total) * 100} />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{progress.message}</span>
                  <span>{progress.current} / {progress.total}</span>
                </div>
              </div>

              {progress.error && (
                <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg">
                  <XCircle className="text-destructive mt-0.5" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">Installation error</p>
                    <p className="text-xs text-destructive/80 mt-1">{progress.error}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    );
  }

  if (step === 'complete') {
    const { success, installed, errors } = installStatus;

    return (
      <Card className="p-6 border-primary/20">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {success ? (
              <CheckCircle className="text-success" size={24} />
            ) : (
              <Warning className="text-warning" size={24} />
            )}
            <div>
              <h3 className="text-lg font-semibold">
                {success ? 'Installation Complete' : 'Installation Completed with Errors'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {installed.length} plugin{installed.length !== 1 ? 's' : ''} installed successfully
              </p>
            </div>
          </div>

          {installed.length > 0 && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Installed Plugins</p>
              <div className="space-y-1">
                {installed.map((plugin, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="text-success" size={14} />
                    <span className="font-mono text-xs">{plugin}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="p-4 bg-destructive/10 rounded-lg">
              <p className="text-sm font-medium text-destructive mb-2">Errors</p>
              <div className="space-y-1">
                {errors.map((error, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-destructive/80">
                    <XCircle className="mt-0.5" size={14} />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={() => onInstallComplete?.(success)} className="flex-1">
              Done
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return null;
}
