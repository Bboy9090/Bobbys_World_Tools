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
  Stop,
  CheckCircle,
  XCircle,
  Warning,
  Clock,
  Flask,
  ShieldCheck,
  Bug,
  FileCode,
  GitBranch,
  Package,
  Cpu,
  Pulse,
  ArrowsClockwise,
  ListBullets,
  CloudArrowDown
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';
import { Plugin } from '@/types/plugin';

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'quality' | 'compatibility' | 'performance';
  tests: TestCase[];
  enabled: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  timeout: number;
  required: boolean;
}

export interface TestRun {
  id: string;
  pluginId: string;
  pluginName: string;
  pluginVersion: string;
  startTime: number;
  endTime?: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
}

export interface TestResult {
  testId: string;
  testName: string;
  category: string;
  status: 'pass' | 'fail' | 'skip' | 'error';
  duration: number;
  message?: string;
  details?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  findings?: SecurityFinding[];
}

export interface SecurityFinding {
  id: string;
  type: 'vulnerability' | 'malware' | 'suspicious' | 'policy-violation';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  location?: string;
  recommendation: string;
}

const TEST_SUITES: TestSuite[] = [
  {
    id: 'security-scan',
    name: 'Security Scanning',
    description: 'Malware detection, vulnerability scanning, and suspicious code analysis',
    category: 'security',
    enabled: true,
    severity: 'critical',
    tests: [
      { id: 'malware-scan', name: 'Malware Detection', description: 'Scan for known malware signatures', timeout: 30000, required: true },
      { id: 'vuln-scan', name: 'Vulnerability Assessment', description: 'Check for known vulnerabilities', timeout: 20000, required: true },
      { id: 'suspicious-code', name: 'Suspicious Code Analysis', description: 'Detect obfuscated or suspicious patterns', timeout: 15000, required: true },
      { id: 'network-analysis', name: 'Network Activity Analysis', description: 'Check for unauthorized network calls', timeout: 10000, required: true },
      { id: 'data-exfil', name: 'Data Exfiltration Check', description: 'Detect potential data theft patterns', timeout: 10000, required: true }
    ]
  },
  {
    id: 'code-quality',
    name: 'Code Quality',
    description: 'Static analysis, linting, and best practices validation',
    category: 'quality',
    enabled: true,
    severity: 'high',
    tests: [
      { id: 'syntax-check', name: 'Syntax Validation', description: 'Check for syntax errors', timeout: 5000, required: true },
      { id: 'static-analysis', name: 'Static Code Analysis', description: 'Analyze code structure and patterns', timeout: 15000, required: true },
      { id: 'dependency-audit', name: 'Dependency Audit', description: 'Check for vulnerable dependencies', timeout: 20000, required: true },
      { id: 'code-complexity', name: 'Code Complexity', description: 'Measure cyclomatic complexity', timeout: 10000, required: false },
      { id: 'best-practices', name: 'Best Practices', description: 'Validate coding standards', timeout: 10000, required: false }
    ]
  },
  {
    id: 'compatibility',
    name: 'Platform Compatibility',
    description: 'Test plugin compatibility across platforms and devices',
    category: 'compatibility',
    enabled: true,
    severity: 'high',
    tests: [
      { id: 'api-compat', name: 'API Compatibility', description: 'Check SDK API usage', timeout: 5000, required: true },
      { id: 'platform-support', name: 'Platform Support', description: 'Verify claimed platform support', timeout: 8000, required: true },
      { id: 'device-compat', name: 'Device Compatibility', description: 'Test device-specific features', timeout: 15000, required: false },
      { id: 'permission-check', name: 'Permission Validation', description: 'Verify permission requirements', timeout: 5000, required: true }
    ]
  },
  {
    id: 'performance',
    name: 'Performance Testing',
    description: 'Memory usage, CPU load, and execution speed tests',
    category: 'performance',
    enabled: true,
    severity: 'medium',
    tests: [
      { id: 'memory-usage', name: 'Memory Usage', description: 'Monitor memory consumption', timeout: 30000, required: false },
      { id: 'cpu-load', name: 'CPU Load', description: 'Measure CPU utilization', timeout: 20000, required: false },
      { id: 'execution-time', name: 'Execution Time', description: 'Measure operation speed', timeout: 15000, required: false },
      { id: 'resource-cleanup', name: 'Resource Cleanup', description: 'Verify proper cleanup', timeout: 10000, required: true }
    ]
  }
];

async function runTestSuite(
  plugin: Plugin,
  suite: TestSuite,
  onProgress: (testId: string, status: string) => void
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (const test of suite.tests) {
    onProgress(test.id, 'running');
    
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
    
    const passRate = suite.category === 'security' ? 0.85 : 0.92;
    const willPass = Math.random() > (1 - passRate);
    
    const result: TestResult = {
      testId: test.id,
      testName: test.name,
      category: suite.category,
      status: willPass ? 'pass' : 'fail',
      duration: Math.random() * 5000 + 500,
      message: willPass ? 'Test passed successfully' : 'Test failed - issues detected'
    };

    if (!willPass && suite.category === 'security') {
      result.findings = [
        {
          id: `finding-${Date.now()}`,
          type: Math.random() > 0.5 ? 'suspicious' : 'policy-violation',
          severity: Math.random() > 0.7 ? 'high' : 'medium',
          title: 'Potential security concern detected',
          description: `Found suspicious pattern in plugin code that requires review`,
          location: `line ${Math.floor(Math.random() * 100) + 1}`,
          recommendation: 'Manual code review recommended before certification'
        }
      ];
    }

    results.push(result);
    onProgress(test.id, willPass ? 'pass' : 'fail');
  }

  return results;
}

export function AutomatedTestingDashboard() {
  const [testRuns = [], setTestRuns] = useKV<TestRun[]>('bobby-test-runs', []);
  const [currentRun, setCurrentRun] = useState<TestRun | null>(null);
  const [selectedRun, setSelectedRun] = useState<TestRun | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [enabledSuites, setEnabledSuites] = useState<string[]>(
    TEST_SUITES.filter(s => s.enabled).map(s => s.id)
  );

  const mockPlugin: Plugin = {
    id: 'test-plugin-' + Date.now(),
    name: 'Test Plugin',
    slug: 'test-plugin',
    description: 'Sample plugin for testing',
    longDescription: 'A sample plugin used for automated testing',
    category: 'diagnostic',
    riskLevel: 'safe',
    status: 'pending',
    author: {
      id: 'test-author',
      username: 'test_user',
      verified: false,
      reputation: 50,
      totalDownloads: 0
    },
    capabilities: {
      requiresUSB: true,
      requiresRoot: false,
      modifiesSystem: false,
      platforms: ['android'],
      permissions: ['USB_READ']
    },
    currentVersion: {
      version: '1.0.0',
      releaseDate: Date.now(),
      changelog: 'Initial release',
      downloadUrl: 'https://example.com/plugin.zip',
      hash: 'sha256:test',
      size: 1024000,
      minAppVersion: '1.0.0'
    },
    versions: [],
    testResults: [],
    certified: false,
    downloads: 0,
    rating: 0,
    reviewCount: 0,
    tags: ['test'],
    screenshots: [],
    documentation: 'https://example.com/docs',
    license: 'MIT',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const startTestRun = async () => {
    const testRun: TestRun = {
      id: `run-${Date.now()}`,
      pluginId: mockPlugin.id,
      pluginName: mockPlugin.name,
      pluginVersion: mockPlugin.currentVersion.version,
      startTime: Date.now(),
      status: 'running',
      results: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      }
    };

    setCurrentRun(testRun);
    setIsRunning(true);
    setProgress(0);

    const activeSuites = TEST_SUITES.filter(s => enabledSuites.includes(s.id));
    const totalTests = activeSuites.reduce((sum, s) => sum + (s.tests?.length || 0), 0);
    let completedTests = 0;

    const allResults: TestResult[] = [];

    for (const suite of activeSuites) {
      const results = await runTestSuite(
        mockPlugin,
        suite,
        (testId, status) => {
          if (status === 'pass' || status === 'fail') {
            completedTests++;
            setProgress((completedTests / totalTests) * 100);
          }
        }
      );
      allResults.push(...results);
    }

    const passed = allResults.filter(r => r.status === 'pass').length;
    const failed = allResults.filter(r => r.status === 'fail').length;
    const skipped = allResults.filter(r => r.status === 'skip').length;

    const completedRun: TestRun = {
      ...testRun,
      endTime: Date.now(),
      status: failed > 0 ? 'failed' : 'completed',
      results: allResults,
      summary: {
        total: allResults.length,
        passed,
        failed,
        skipped,
        duration: Date.now() - testRun.startTime
      }
    };

    setTestRuns(prev => [completedRun, ...(prev || [])]);
    setCurrentRun(null);
    setIsRunning(false);
    setProgress(0);
    setSelectedRun(completedRun);

    if (failed === 0) {
      toast.success('All tests passed!', {
        description: `Completed ${passed} tests successfully`
      });
    } else {
      toast.error('Some tests failed', {
        description: `${failed} test(s) failed, ${passed} passed`
      });
    }
  };

  const cancelTestRun = () => {
    if (currentRun) {
      setTestRuns(prev => [{
        ...currentRun,
        endTime: Date.now(),
        status: 'cancelled',
        summary: {
          ...currentRun.summary,
          duration: Date.now() - currentRun.startTime
        }
      }, ...(prev || [])]);
    }
    setCurrentRun(null);
    setIsRunning(false);
    setProgress(0);
    toast.info('Test run cancelled');
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="text-success" />;
      case 'fail':
        return <XCircle className="text-destructive" />;
      case 'skip':
        return <Warning className="text-warning" />;
      default:
        return <Clock className="text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-destructive';
      case 'high':
        return 'text-accent';
      case 'medium':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl tracking-tight text-foreground">
            Automated Testing Pipeline
          </h2>
          <p className="text-muted-foreground mt-1">
            Security scanning, quality checks, and compatibility validation
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isRunning ? (
            <Button
              onClick={startTestRun}
              disabled={enabledSuites.length === 0}
              className="bg-primary hover:bg-primary/90"
            >
              <Play className="mr-2" />
              Run Full Test Suite
            </Button>
          ) : (
            <Button
              onClick={cancelTestRun}
              variant="destructive"
            >
              <Stop className="mr-2" />
              Cancel Tests
            </Button>
          )}
        </div>
      </div>

      {isRunning && currentRun && (
        <Alert className="border-primary bg-primary/5">
          <Pulse className="h-4 w-4 text-primary animate-pulse" />
          <AlertTitle>Test Run In Progress</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Running {enabledSuites.length} test suites...</span>
              <span className="font-mono">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="suites" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="suites">
            <ListBullets className="mr-2" />
            Test Suites
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="mr-2" />
            Test History
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!selectedRun}>
            <Flask className="mr-2" />
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suites" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {TEST_SUITES.map(suite => (
              <Card key={suite.id} className="border-border bg-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{suite.name}</CardTitle>
                        <Badge variant={suite.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {suite.severity}
                        </Badge>
                      </div>
                      <CardDescription className="mt-1">
                        {suite.description}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEnabledSuites(prev =>
                          prev.includes(suite.id)
                            ? prev.filter(id => id !== suite.id)
                            : [...prev, suite.id]
                        );
                      }}
                    >
                      {enabledSuites.includes(suite.id) ? (
                        <CheckCircle className="text-success" />
                      ) : (
                        <XCircle className="text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {suite.tests.length} tests
                      </span>
                      <span className="text-muted-foreground">
                        {suite.tests.filter(t => t.required).length} required
                      </span>
                    </div>
                    <ScrollArea className="h-32">
                      <div className="space-y-1">
                        {suite.tests.map(test => (
                          <div
                            key={test.id}
                            className="flex items-center gap-2 text-sm py-1"
                          >
                            <div className={`w-1 h-1 rounded-full ${test.required ? 'bg-primary' : 'bg-muted'}`} />
                            <span className="text-foreground">{test.name}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {testRuns.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Flask className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No test runs yet. Start a test run to see results here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {testRuns.map(run => (
                <Card
                  key={run.id}
                  className="border-border bg-card cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setSelectedRun(run)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">{run.pluginName}</h4>
                          <Badge variant="outline" className="font-mono text-xs">
                            v{run.pluginVersion}
                          </Badge>
                          <Badge
                            variant={
                              run.status === 'completed'
                                ? 'default'
                                : run.status === 'failed'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {run.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(run.startTime).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-success">
                            {run.summary.passed}
                          </div>
                          <div className="text-xs text-muted-foreground">Passed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-destructive">
                            {run.summary.failed}
                          </div>
                          <div className="text-xs text-muted-foreground">Failed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-muted-foreground">
                            {run.summary.total}
                          </div>
                          <div className="text-xs text-muted-foreground">Total</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {selectedRun ? (
            <>
              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedRun.pluginName}</CardTitle>
                      <CardDescription className="mt-1">
                        Test run from {new Date(selectedRun.startTime).toLocaleString()}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        selectedRun.status === 'completed'
                          ? 'default'
                          : selectedRun.status === 'failed'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className="text-lg px-4 py-2"
                    >
                      {selectedRun.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Total Tests</div>
                      <div className="text-2xl font-bold">{selectedRun.summary.total}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-success">Passed</div>
                      <div className="text-2xl font-bold text-success">
                        {selectedRun.summary.passed}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-destructive">Failed</div>
                      <div className="text-2xl font-bold text-destructive">
                        {selectedRun.summary.failed}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Duration</div>
                      <div className="text-2xl font-bold">
                        {(selectedRun.summary.duration / 1000).toFixed(1)}s
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {selectedRun.results.map(result => (
                  <Card key={result.testId} className="border-border bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getStatusIcon(result.status)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{result.testName}</h4>
                              <Badge variant="outline" className="text-xs">
                                {result.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {result.message}
                            </p>
                            {result.findings && result.findings.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {result.findings.map(finding => (
                                  <Alert key={finding.id} variant="destructive" className="py-2">
                                    <ShieldCheck className="h-4 w-4" />
                                    <AlertTitle className="text-sm font-semibold">
                                      {finding.title}
                                    </AlertTitle>
                                    <AlertDescription className="text-xs mt-1">
                                      <div className="space-y-1">
                                        <p>{finding.description}</p>
                                        {finding.location && (
                                          <p className="font-mono text-xs opacity-70">
                                            Location: {finding.location}
                                          </p>
                                        )}
                                        <p className="italic">
                                          Recommendation: {finding.recommendation}
                                        </p>
                                      </div>
                                    </AlertDescription>
                                  </Alert>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono text-muted-foreground">
                            {(result.duration / 1000).toFixed(2)}s
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Flask className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Select a test run from history to view detailed results
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
