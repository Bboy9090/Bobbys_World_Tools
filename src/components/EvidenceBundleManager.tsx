import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText,
  Shield,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  Trash,
  Copy,
  Eye,
  Clock,
  User,
  DeviceMobile
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { evidenceBundle, type EvidenceBundle, type SignatureVerification } from '@/lib/evidence-bundle';

export function EvidenceBundleManager() {
  const [bundles, setBundles] = useState<EvidenceBundle[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<EvidenceBundle | null>(null);
  const [verification, setVerification] = useState<SignatureVerification | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterSerial, setFilterSerial] = useState('');

  useEffect(() => {
    loadBundles();
  }, []);

  const loadBundles = async () => {
    setLoading(true);
    try {
      const all = await evidenceBundle.listBundles();
      setBundles(all);
    } catch (error) {
      toast.error('Failed to load evidence bundles');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBundle = async (bundle: EvidenceBundle) => {
    setSelectedBundle(bundle);
    
    const verif = await evidenceBundle.verifyBundle(bundle);
    setVerification(verif);
  };

  const handleExport = async (bundleId: string) => {
    try {
      const json = await evidenceBundle.exportBundle(bundleId);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evidence-${bundleId}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Evidence bundle exported');
    } catch (error) {
      toast.error('Failed to export bundle');
      console.error(error);
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        await evidenceBundle.importBundle(text);
        await loadBundles();
        toast.success('Evidence bundle imported and verified');
      } catch (error) {
        toast.error('Failed to import bundle: Invalid signature');
        console.error(error);
      }
    };
    input.click();
  };

  const handleCopySignature = () => {
    if (selectedBundle?.signature?.hash) {
      navigator.clipboard.writeText(selectedBundle.signature.hash);
      toast.success('Signature hash copied');
    }
  };

  const filteredBundles = filterSerial
    ? bundles.filter(b => b.device.serial.toLowerCase().includes(filterSerial.toLowerCase()))
    : bundles;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-display uppercase tracking-tight text-foreground">
          Evidence Bundle Manager
        </h2>
        <p className="text-muted-foreground mt-2">
          Cryptographically signed diagnostic reports with chain-of-custody
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bundles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{bundles.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Signed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {bundles.filter(b => b.signature).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Devices Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">
              {new Set(bundles.map(b => b.device.serial)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Evidence Bundles</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleImport}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
            <CardDescription>
              <Input
                placeholder="Filter by device serial..."
                value={filterSerial}
                onChange={(e) => setFilterSerial(e.target.value)}
                className="mt-2"
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : filteredBundles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No evidence bundles found
                  </div>
                ) : (
                  filteredBundles.map((bundle) => (
                    <div
                      key={bundle.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedBundle?.id === bundle.id
                          ? 'bg-primary/10 border-primary'
                          : 'bg-secondary/50 border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleSelectBundle(bundle)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="font-mono text-sm truncate">{bundle.id}</span>
                            {bundle.signature && (
                              <Shield className="w-4 h-4 text-success flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <DeviceMobile className="w-3 h-3" />
                              <span className="truncate">{bundle.device.serial}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {bundle.device.correlationBadge}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(bundle.timestamp).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="mt-2 text-sm">
                            <span className="text-foreground font-medium">{bundle.operation}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExport(bundle.id);
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Bundle Details</CardTitle>
            <CardDescription>
              {selectedBundle ? 'Signed evidence with verification' : 'Select a bundle to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedBundle ? (
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="signature">Signature</TabsTrigger>
                  <TabsTrigger value="data">Data</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Bundle ID</div>
                      <div className="font-mono text-sm">{selectedBundle.id}</div>
                    </div>

                    <Separator />

                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Device Serial</div>
                      <div className="font-mono text-sm">{selectedBundle.device.serial}</div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Platform</div>
                      <Badge variant="outline">{selectedBundle.device.platform}</Badge>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Correlation Badge</div>
                      <Badge variant={
                        selectedBundle.device.correlationBadge === 'CORRELATED' ? 'default' :
                        selectedBundle.device.correlationBadge === 'SYSTEM-CONFIRMED' ? 'secondary' :
                        'outline'
                      }>
                        {selectedBundle.device.correlationBadge}
                      </Badge>
                    </div>

                    {selectedBundle.device.matchedIds.length > 0 && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Matched IDs</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedBundle.device.matchedIds.map((id, idx) => (
                            <Badge key={idx} variant="outline" className="font-mono text-xs">
                              {id}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Operation</div>
                      <div className="text-sm">{selectedBundle.operation}</div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Timestamp</div>
                      <div className="text-sm">{new Date(selectedBundle.timestamp).toLocaleString()}</div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Created By</div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4" />
                        {selectedBundle.metadata.createdBy}
                      </div>
                    </div>

                    {selectedBundle.chain?.previousBundleId && (
                      <>
                        <Separator />
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Chain: Previous Bundle</div>
                          <div className="font-mono text-xs truncate">{selectedBundle.chain.previousBundleId}</div>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="signature" className="space-y-4 mt-4">
                  {selectedBundle.signature ? (
                    <div className="space-y-4">
                      {verification && (
                        <div className={`p-4 rounded-lg border-2 ${
                          verification.valid
                            ? 'bg-success/10 border-success'
                            : 'bg-destructive/10 border-destructive'
                        }`}>
                          <div className="flex items-center gap-2">
                            {verification.valid ? (
                              <>
                                <CheckCircle className="w-5 h-5 text-success" weight="fill" />
                                <span className="font-semibold text-success">Signature Valid</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5 text-destructive" weight="fill" />
                                <span className="font-semibold text-destructive">Signature Invalid</span>
                              </>
                            )}
                          </div>
                          {verification.error && (
                            <div className="text-xs text-muted-foreground mt-2">{verification.error}</div>
                          )}
                        </div>
                      )}

                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Algorithm</div>
                        <Badge variant="outline">{selectedBundle.signature.algorithm}</Badge>
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Hash</div>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs bg-secondary p-2 rounded overflow-x-auto">
                            {selectedBundle.signature.hash}
                          </code>
                          <Button size="sm" variant="ghost" onClick={handleCopySignature}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Signed By</div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4" />
                          {selectedBundle.signature.signedBy}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Signed At</div>
                        <div className="text-sm">
                          {new Date(selectedBundle.signature.signedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      This bundle is not signed
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="data" className="mt-4">
                  <ScrollArea className="h-[450px]">
                    <pre className="text-xs bg-secondary p-4 rounded overflow-x-auto">
                      {JSON.stringify(selectedBundle.data, null, 2)}
                    </pre>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Eye className="w-12 h-12 mb-4 opacity-50" />
                <p>Select a bundle to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
