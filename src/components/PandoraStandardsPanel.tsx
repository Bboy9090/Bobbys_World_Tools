import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, CheckCircle, Warning, XCircle, CircleNotch } from '@phosphor-icons/react';
import { MockPandoraAPI, type BenchmarkStandard } from '@/lib/mockAPI';

export function PandoraStandardsPanel() {
  const [standards, setStandards] = useState<BenchmarkStandard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStandards();
  }, []);

  const loadStandards = async () => {
    try {
      const data = await MockPandoraAPI.getBenchmarkStandards();
      setStandards(data);
    } catch (error) {
      console.error('Failed to load standards:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <CircleNotch weight="bold" className="w-8 h-8 text-primary animate-spin" />
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book weight="duotone" className="w-5 h-5" />
            Industry Benchmark Standards
          </CardTitle>
          <CardDescription>Reference performance criteria from USB-IF, JEDEC, and Android Platform Tools</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {standards.map((standard, idx) => (
              <div key={idx} className="border border-border rounded-lg p-4 space-y-3 bg-secondary/30">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-base">{standard.category}</h3>
                    <p className="text-sm text-muted-foreground">{standard.metric}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <PerformanceLevel 
                    level="Optimal"
                    value={standard.optimal}
                    icon={<CheckCircle weight="fill" className="w-4 h-4 text-accent" />}
                    color="accent"
                  />
                  <PerformanceLevel 
                    level="Good"
                    value={standard.good}
                    icon={<CheckCircle weight="fill" className="w-4 h-4 text-primary" />}
                    color="primary"
                  />
                  <PerformanceLevel 
                    level="Acceptable"
                    value={standard.acceptable}
                    icon={<Warning weight="fill" className="w-4 h-4 text-yellow-500" />}
                    color="yellow"
                  />
                  <PerformanceLevel 
                    level="Poor"
                    value={standard.poor}
                    icon={<XCircle weight="fill" className="w-4 h-4 text-destructive" />}
                    color="destructive"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
            <h4 className="font-semibold text-sm mb-2">Reference Standards</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• <strong>USB-IF:</strong> USB Implementers Forum specifications</li>
              <li>• <strong>JEDEC:</strong> Solid State Technology Association standards</li>
              <li>• <strong>Android Platform Tools:</strong> Google's official benchmarks</li>
              <li>• <strong>System Baseline:</strong> Platform-specific performance metrics</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface PerformanceLevelProps {
  level: string;
  value: string;
  icon: React.ReactNode;
  color: 'accent' | 'primary' | 'yellow' | 'destructive';
}

function PerformanceLevel({ level, value, icon, color }: PerformanceLevelProps) {
  const colorClasses = {
    accent: 'border-accent/30 bg-accent/5',
    primary: 'border-primary/30 bg-primary/5',
    yellow: 'border-yellow-500/30 bg-yellow-500/5',
    destructive: 'border-destructive/30 bg-destructive/5'
  };

  return (
    <div className={`p-3 rounded border ${colorClasses[color]} flex flex-col items-center text-center`}>
      {icon}
      <div className="text-xs font-semibold mt-1">{level}</div>
      <div className="text-xs text-muted-foreground mt-0.5">
        {value}
      </div>
    </div>
  );
}
