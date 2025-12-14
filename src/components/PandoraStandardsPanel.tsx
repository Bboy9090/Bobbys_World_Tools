import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, CheckCircle, Warning, XCircle } from '@phosphor-icons/react';

interface Standard {
  category: string;
  metric: string;
  optimal: string;
  good: string;
  acceptable: string;
  poor: string;
  unit: string;
  reference: string;
}

const standards: Standard[] = [
  {
    category: 'Flash Speed',
    metric: 'USB Transfer Rate',
    optimal: '> 500',
    good: '200-500',
    acceptable: '60-200',
    poor: '< 60',
    unit: 'MB/s',
    reference: 'USB 3.2 Gen 2 / USB 3.1 / USB 3.0 / USB 2.0'
  },
  {
    category: 'Random Write IOPS',
    metric: 'Storage Performance',
    optimal: '> 10,000',
    good: '5,000-10,000',
    acceptable: '1,000-5,000',
    poor: '< 1,000',
    unit: 'IOPS',
    reference: 'NVMe / High-end eMMC / Standard eMMC / Legacy'
  },
  {
    category: 'Fastboot Flash',
    metric: 'Throughput',
    optimal: '> 150',
    good: '80-150',
    acceptable: '40-80',
    poor: '< 40',
    unit: 'MB/s',
    reference: 'Modern / Mid-range / Older / Very old devices'
  },
  {
    category: 'USB Bandwidth',
    metric: 'Bus Utilization',
    optimal: '< 70',
    good: '70-85',
    acceptable: '85-95',
    poor: '> 95',
    unit: '%',
    reference: 'USB-IF specification'
  },
  {
    category: 'CPU Efficiency',
    metric: 'Processing Load',
    optimal: '< 50',
    good: '50-70',
    acceptable: '70-85',
    poor: '> 85',
    unit: '%',
    reference: 'System performance baseline'
  },
  {
    category: 'Memory Usage',
    metric: 'RAM Consumption',
    optimal: '< 60',
    good: '60-75',
    acceptable: '75-90',
    poor: '> 90',
    unit: '%',
    reference: 'Available system memory'
  },
  {
    category: 'Latency',
    metric: 'Command Response',
    optimal: '< 50',
    good: '50-100',
    acceptable: '100-200',
    poor: '> 200',
    unit: 'ms',
    reference: 'Platform tools specification'
  },
];

export function PandoraStandardsPanel() {
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
                  <Badge variant="outline" className="text-xs">{standard.reference}</Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <PerformanceLevel 
                    level="Optimal"
                    value={standard.optimal}
                    unit={standard.unit}
                    icon={<CheckCircle weight="fill" className="w-4 h-4 text-accent" />}
                    color="accent"
                  />
                  <PerformanceLevel 
                    level="Good"
                    value={standard.good}
                    unit={standard.unit}
                    icon={<CheckCircle weight="fill" className="w-4 h-4 text-primary" />}
                    color="primary"
                  />
                  <PerformanceLevel 
                    level="Acceptable"
                    value={standard.acceptable}
                    unit={standard.unit}
                    icon={<Warning weight="fill" className="w-4 h-4 text-yellow-500" />}
                    color="yellow"
                  />
                  <PerformanceLevel 
                    level="Poor"
                    value={standard.poor}
                    unit={standard.unit}
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
  unit: string;
  icon: React.ReactNode;
  color: 'accent' | 'primary' | 'yellow' | 'destructive';
}

function PerformanceLevel({ level, value, unit, icon, color }: PerformanceLevelProps) {
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
      <div className="text-xs font-mono text-muted-foreground mt-0.5">
        {value} {unit}
      </div>
    </div>
  );
}
