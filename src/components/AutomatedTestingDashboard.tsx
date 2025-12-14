import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Play,
  CheckCircle,
  XCircle,
  Warning,
  Flask,
  ChartLine,
  Download,
  ArrowsClockwise,
  ClipboardText,
  Timer,
  TrendUp
} from '@phosphor-icons/react';
import { OptimizationTestRunner, createOptimizationTestSuite } from '@/lib/optimization-test-runner';
import { TestResult, OptimizationTestResult } from '@/lib/test-utils';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

export function AutomatedTestingDashboard() {
  const [runner] = useState(() => new OptimizationTestRunner());
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [testHistory, setTestHistory] = useKV<Array<{ timestamp: number; results: TestResult[] }>>('test-history', []);

  const runTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setTestResults([]);

    try {
      const response = await fetch('http://localhost:3001/api/tests/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to run tests');
      }

      const data = await response.json();
      
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      setTimeout(() => {
        clearInterval(progressInterval);
        setProgress(100);
        
        const mappedResults: TestResult[] = data.results.map((r: any) => ({
          id: `test-${Date.now()}-${Math.random()}`,
          testName: r.name,
          passed: r.status === 'PASS',
          duration: r.duration || 0,
          error: r.status !== 'PASS' ? r.details : undefined,
          timestamp: Date.now()
        }));
        
        setTestResults(mappedResults);

        setTestHistory(current => [
          ...(current || []),
          { timestamp: data.timestamp || Date.now(), results: mappedResults }
        ].slice(-10));

        const passed = mappedResults.filter(r => r.passed).length;
        const total = mappedResults.length;
        
        if (passed === total) {
          toast.success(`All tests passed! (${passed}/${total})`);
        } else {
          toast.warning(`${passed}/${total} tests passed`);
        }
      }, 1500);
    } catch (error) {
      toast.error('Test execution failed - backend may be offline');
      console.error(error);
    } finally {
      setTimeout(() => setIsRunning(false), 1500);
    }
  };

  const exportResults = () => {
    const data = {
      timestamp: new Date().toISOString(),
      summary: runner.getSummary(),
      results: testResults,
      history: testHistory
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimization-tests-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Test results exported');
  };

  const clearHistory = () => {
    setTestHistory([]);
    toast.success('Test history cleared');
  };

  const summary = runner.getSummary();
  const hasResults = testResults.length > 0;

  return (
    <div className="w-full space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Flask className="w-6 h-6 text-primary" weight="duotone" />
                Automated Testing & Optimization Validation
              </CardTitle>
              <CardDescription className="mt-2">
                Comprehensive test suite for validating device detection, performance improvements, and optimization effectiveness
              </CardDescription>
            </div>
            <Button
              onClick={runTests}
              disabled={isRunning}
              size="lg"
              className="gap-2"
            >
              {isRunning ? (
                <>
                  <ArrowsClockwise className="w-4 h-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" weight="fill" />
                  Run All Tests
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Test Execution Progress</span>
                <span className="font-mono font-medium">{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {hasResults && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Total Tests</CardDescription>
                    <CardTitle className="text-3xl font-mono">{summary.total}</CardTitle>
                  </CardHeader>
                </Card>

                <Card className="border-emerald-500/30 bg-emerald-950/20">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" weight="fill" />
                      Passed
                    </CardDescription>
                    <CardTitle className="text-3xl font-mono text-emerald-400">{summary.passed}</CardTitle>
                  </CardHeader>
                </Card>

                <Card className="border-rose-500/30 bg-rose-950/20">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs flex items-center gap-1">
                      <XCircle className="w-3 h-3" weight="fill" />
                      Failed
                    </CardDescription>
                    <CardTitle className="text-3xl font-mono text-rose-400">{summary.failed}</CardTitle>
                  </CardHeader>
                </Card>

                <Card className="border-accent/30 bg-accent/10">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Pass Rate</CardDescription>
                    <CardTitle className="text-3xl font-mono text-accent">{summary.passRate.toFixed(1)}%</CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <Button onClick={exportResults} variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export Results
                </Button>
                <Button onClick={clearHistory} variant="outline" size="sm" className="gap-2">
                  <ClipboardText className="w-4 h-4" />
                  Clear History
                </Button>
              </div>
            </>
          )}

          <Tabs defaultValue="results" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="results">Test Results</TabsTrigger>
              <TabsTrigger value="optimizations">Optimization Tests</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-4">
              {hasResults ? (
                <ScrollArea className="h-[500px] rounded-lg border border-border/50 p-4">
                  <div className="space-y-3">
                    {testResults.map((result) => (
                      <Card key={result.id} className={`
                        ${result.passed ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-rose-500/30 bg-rose-950/10'}
                      `}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {result.passed ? (
                                <CheckCircle className="w-5 h-5 text-emerald-400" weight="fill" />
                              ) : (
                                <XCircle className="w-5 h-5 text-rose-400" weight="fill" />
                              )}
                              <div>
                                <CardTitle className="text-base">{result.testName}</CardTitle>
                                <CardDescription className="text-xs flex items-center gap-2 mt-1">
                                  <Timer className="w-3 h-3" />
                                  {result.duration}ms
                                  <span className="text-muted-foreground/60">•</span>
                                  {new Date(result.timestamp).toLocaleTimeString()}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge variant={result.passed ? 'default' : 'destructive'}>
                              {result.passed ? 'PASS' : 'FAIL'}
                            </Badge>
                          </div>
                        </CardHeader>

                        {(result.error || result.details || result.metrics) && (
                          <CardContent className="pt-0">
                            {result.error && (
                              <Alert variant="destructive" className="mb-3">
                                <Warning className="w-4 h-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription className="font-mono text-xs">
                                  {result.error}
                                </AlertDescription>
                              </Alert>
                            )}

                            {result.metrics && (
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Metrics</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                  <div className="flex flex-col gap-1 rounded-md bg-muted/30 p-2">
                                    <span className="text-muted-foreground">Transfer Speed</span>
                                    <span className="font-mono font-medium">{result.metrics.transferSpeed.toFixed(2)} MB/s</span>
                                  </div>
                                  <div className="flex flex-col gap-1 rounded-md bg-muted/30 p-2">
                                    <span className="text-muted-foreground">CPU Usage</span>
                                    <span className="font-mono font-medium">{result.metrics.cpuUsage.toFixed(1)}%</span>
                                  </div>
                                  <div className="flex flex-col gap-1 rounded-md bg-muted/30 p-2">
                                    <span className="text-muted-foreground">Memory Usage</span>
                                    <span className="font-mono font-medium">{result.metrics.memoryUsage.toFixed(1)}%</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {result.details && (
                              <div className="mt-3">
                                <p className="text-xs font-medium text-muted-foreground mb-2">Details</p>
                                <pre className="text-xs bg-muted/20 p-3 rounded-md overflow-auto max-h-40">
                                  {JSON.stringify(result.details, null, 2)}
                                </pre>
                              </div>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Flask className="w-12 h-12 text-muted-foreground/50 mb-4" weight="duotone" />
                  <p className="text-muted-foreground">No test results yet</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Click "Run All Tests" to start validation</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="optimizations" className="space-y-4">
              {hasResults ? (
                <ScrollArea className="h-[500px] rounded-lg border border-border/50 p-4">
                  <div className="space-y-3">
                    {testResults.filter(r => 'improvement' in r).map((result) => {
                      const optResult = result as OptimizationTestResult;
                      return (
                        <Card key={result.id} className="border-accent/30 bg-accent/5">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <TrendUp className="w-5 h-5 text-accent" weight="duotone" />
                                <CardTitle className="text-base">{result.testName}</CardTitle>
                              </div>
                              <Badge variant={result.passed ? 'default' : 'secondary'}>
                                {optResult.improvement.overallScore.toFixed(1)}% improvement
                              </Badge>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Baseline Metrics</p>
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span>Transfer Speed:</span>
                                    <span className="font-mono">{optResult.baseline.transferSpeed.toFixed(2)} MB/s</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>CPU Usage:</span>
                                    <span className="font-mono">{optResult.baseline.cpuUsage.toFixed(1)}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Memory Usage:</span>
                                    <span className="font-mono">{optResult.baseline.memoryUsage.toFixed(1)}%</span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Optimized Metrics</p>
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span>Transfer Speed:</span>
                                    <span className="font-mono text-emerald-400">{optResult.optimized.transferSpeed.toFixed(2)} MB/s</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>CPU Usage:</span>
                                    <span className="font-mono text-emerald-400">{optResult.optimized.cpuUsage.toFixed(1)}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Memory Usage:</span>
                                    <span className="font-mono text-emerald-400">{optResult.optimized.memoryUsage.toFixed(1)}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Speed Improvement</p>
                                <p className="text-lg font-mono font-medium text-accent">
                                  +{optResult.improvement.transferSpeed.toFixed(1)}%
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">CPU Reduction</p>
                                <p className="text-lg font-mono font-medium text-emerald-400">
                                  -{optResult.improvement.cpuUsage.toFixed(1)}%
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Memory Reduction</p>
                                <p className="text-lg font-mono font-medium text-emerald-400">
                                  -{optResult.improvement.memoryUsage.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ChartLine className="w-12 h-12 text-muted-foreground/50 mb-4" weight="duotone" />
                  <p className="text-muted-foreground">No optimization test results</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Run tests to see performance improvements</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {testHistory && testHistory.length > 0 ? (
                <ScrollArea className="h-[500px] rounded-lg border border-border/50 p-4">
                  <div className="space-y-3">
                    {testHistory.slice().reverse().map((session, idx) => {
                      const sessionPassed = session.results.filter(r => r.passed).length;
                      const sessionTotal = session.results.length;
                      const passRate = (sessionPassed / sessionTotal) * 100;

                      return (
                        <Card key={`session-${idx}`}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-sm">
                                  Test Session - {new Date(session.timestamp).toLocaleString()}
                                </CardTitle>
                                <CardDescription className="text-xs mt-1">
                                  {sessionPassed}/{sessionTotal} tests passed ({passRate.toFixed(1)}%)
                                </CardDescription>
                              </div>
                              <Badge variant={passRate === 100 ? 'default' : 'secondary'}>
                                {passRate.toFixed(0)}%
                              </Badge>
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ClipboardText className="w-12 h-12 text-muted-foreground/50 mb-4" weight="duotone" />
                  <p className="text-muted-foreground">No test history</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Previous test runs will appear here</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
