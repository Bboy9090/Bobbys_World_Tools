import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flask, Play, ClockCounterClockwise, CheckCircle, XCircle, CircleNotch } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { MockPandoraAPI, type TestResult } from '@/lib/mockAPI';

export function PandoraTestsPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    toast.info('Running automated tests...');

    try {
      const testResults = await MockPandoraAPI.runTests();
      setResults(testResults);
      
      const passCount = testResults.filter(r => r.status === 'PASS').length;
      const totalCount = testResults.length;
      
      if (passCount === totalCount) {
        toast.success(`All tests passed! ${passCount}/${totalCount}`);
      } else {
        toast.warning(`Tests completed: ${passCount}/${totalCount} passed`);
      }
    } catch (error) {
      toast.error('Failed to run tests');
      console.error(error);
    } finally {
      setIsRunning(false);
    }
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
              <CircleNotch weight="bold" className="w-4 h-4 text-primary animate-spin" />
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
                    {result.status === 'PASS' && (
                      <CheckCircle weight="fill" className="w-4 h-4 text-accent" />
                    )}
                    {result.status === 'FAIL' && (
                      <XCircle weight="fill" className="w-4 h-4 text-destructive" />
                    )}
                    {result.status === 'SKIP' && (
                      <CircleNotch weight="bold" className="w-4 h-4 text-muted-foreground" />
                    )}
                    <div>
                      <div className="font-medium text-sm">{result.name}</div>
                      {result.message && (
                        <div className="text-xs text-muted-foreground">{result.message}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">{result.duration.toFixed(0)}ms</span>
                    {result.status === 'PASS' && (
                      <Badge variant="default" className="text-xs">PASS</Badge>
                    )}
                    {result.status === 'FAIL' && (
                      <Badge variant="destructive" className="text-xs">FAIL</Badge>
                    )}
                    {result.status === 'SKIP' && (
                      <Badge variant="outline" className="text-xs">SKIP</Badge>
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
