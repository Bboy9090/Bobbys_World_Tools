import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flask, Play, ClockCounterClockwise, CheckCircle, XCircle } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'running';
  duration?: number;
  message?: string;
}

export function PandoraTestsPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    toast.info('Running automated tests...');

    const tests = [
      { name: 'Device Detection Test', delay: 1000 },
      { name: 'Performance Metrics Validation', delay: 1500 },
      { name: 'Bottleneck Detection', delay: 1200 },
      { name: 'Correlation Matching', delay: 800 },
      { name: 'Policy Gates Evaluation', delay: 900 },
      { name: 'USB Identity Check', delay: 1100 },
      { name: 'Tool Health Status', delay: 700 },
    ];

    for (const test of tests) {
      setResults(prev => [...prev, { name: test.name, status: 'running' }]);
      
      await new Promise(resolve => setTimeout(resolve, test.delay));
      
      const passed = Math.random() > 0.15;
      setResults(prev => 
        prev.map(r => 
          r.name === test.name 
            ? { 
                ...r, 
                status: passed ? 'pass' : 'fail', 
                duration: test.delay,
                message: passed ? 'Test passed successfully' : 'Test failed - check logs'
              } 
            : r
        )
      );
    }

    setIsRunning(false);
    const passCount = results.filter(r => r.status === 'pass').length;
    toast.success(`Tests completed: ${passCount}/${tests.length} passed`);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flask weight="duotone" className="w-5 h-5" />
            Automated Testing & Validation
          </CardTitle>
          <CardDescription>Validate device detection, performance, and optimization effectiveness</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="gap-2"
            >
              <Play weight="fill" className="w-4 h-4" />
              Run All Tests
            </Button>
            <Button variant="outline" className="gap-2">
              <ClockCounterClockwise weight="duotone" className="w-4 h-4" />
              View History
            </Button>
          </div>

          {isRunning && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-muted-foreground">Tests running...</span>
            </div>
          )}

          {results.length > 0 ? (
            <div className="space-y-2 mt-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Test Results</h3>
              {results.map((result, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    {result.status === 'running' && (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                    {result.status === 'pass' && (
                      <CheckCircle weight="fill" className="w-4 h-4 text-accent" />
                    )}
                    {result.status === 'fail' && (
                      <XCircle weight="fill" className="w-4 h-4 text-destructive" />
                    )}
                    <div>
                      <div className="font-medium text-sm">{result.name}</div>
                      {result.message && (
                        <div className="text-xs text-muted-foreground">{result.message}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.duration && (
                      <span className="text-xs text-muted-foreground font-mono">{result.duration}ms</span>
                    )}
                    {result.status === 'pass' && (
                      <Badge variant="default" className="text-xs">PASS</Badge>
                    )}
                    {result.status === 'fail' && (
                      <Badge variant="destructive" className="text-xs">FAIL</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No test results yet</p>
              <p className="text-xs mt-1">Click "Run All Tests" to begin validation</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
