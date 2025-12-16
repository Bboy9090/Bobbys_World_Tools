// WorkflowExecutionConsole.tsx - Execute and monitor workflows

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  PlayCircle, 
  StopCircle, 
  FileCode, 
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  description: string;
  platform: string;
  category: string;
  risk_level: string;
  requires_authorization: boolean;
}

interface WorkflowStep {
  stepId: string;
  stepName: string;
  success: boolean;
  output?: string;
  error?: string;
}

export function WorkflowExecutionConsole() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; results: WorkflowStep[] } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      // Note: This endpoint requires admin auth in production
      const response = await fetch('http://localhost:3001/api/trapdoor/workflows', {
        headers: {
          'X-API-Key': 'dev-admin-key' // In production, get this from auth context
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.workflows || []);
      }
    } catch (err) {
      console.error('Error fetching workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      low: { variant: 'secondary', className: '' },
      medium: { variant: 'outline', className: 'border-yellow-500 text-yellow-600' },
      high: { variant: 'outline', className: 'border-orange-500 text-orange-600' },
      destructive: { variant: 'destructive', className: '' }
    };

    const config = variants[riskLevel] || variants.low;
    return (
      <Badge variant={config.variant} className={config.className}>
        {riskLevel.toUpperCase()}
      </Badge>
    );
  };

  const getPlatformIcon = (platform: string) => {
    return <Smartphone className="h-4 w-4" />;
  };

  const getStepIcon = (step: WorkflowStep) => {
    if (step.success) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    } else if (step.error) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else {
      return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Workflow Browser */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Available Workflows
          </CardTitle>
          <CardDescription>
            Select a workflow to view details and execute
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {loading ? (
              <div className="text-center py-8">Loading workflows...</div>
            ) : workflows.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No workflows available. Ensure workflows directory is properly configured.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {workflows.map((workflow) => (
                  <Card
                    key={workflow.id}
                    className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                      selectedWorkflow?.id === workflow.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedWorkflow(workflow)}
                  >
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(workflow.platform)}
                            <h4 className="font-semibold text-sm">{workflow.name}</h4>
                          </div>
                          {getRiskBadge(workflow.risk_level)}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {workflow.description}
                        </p>

                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="outline">{workflow.platform}</Badge>
                          <Badge variant="outline">{workflow.category}</Badge>
                          {workflow.requires_authorization && (
                            <Badge variant="outline" className="border-orange-500 text-orange-600">
                              Auth Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Workflow Details & Execution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Workflow Execution
          </CardTitle>
          <CardDescription>
            View workflow details and execution results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedWorkflow ? (
            <Alert>
              <AlertDescription>
                Select a workflow from the list to view details and execute
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">{selectedWorkflow.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedWorkflow.description}
                </p>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{selectedWorkflow.platform}</Badge>
                  <Badge variant="outline">{selectedWorkflow.category}</Badge>
                  {getRiskBadge(selectedWorkflow.risk_level)}
                  {selectedWorkflow.requires_authorization && (
                    <Badge variant="outline" className="border-orange-500 text-orange-600">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Authorization Required
                    </Badge>
                  )}
                </div>
              </div>

              {selectedWorkflow.requires_authorization && (
                <Alert className="border-orange-500 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    This workflow requires explicit user authorization. Use the Trapdoor Control Panel
                    to execute workflows that require authorization.
                  </AlertDescription>
                </Alert>
              )}

              <Alert>
                <AlertDescription>
                  <strong>Workflow ID:</strong> {selectedWorkflow.id}
                  <br />
                  <strong>Category:</strong> {selectedWorkflow.category}
                  <br />
                  <strong>Platform:</strong> {selectedWorkflow.platform}
                </AlertDescription>
              </Alert>

              {result && (
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      {result.success ? (
                        <Badge variant="default" className="bg-green-500">Success</Badge>
                      ) : (
                        <Badge variant="destructive">Failed</Badge>
                      )}
                      Execution Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {result.results.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-2 bg-slate-50 rounded">
                            {getStepIcon(step)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{step.stepName}</p>
                              {step.output && (
                                <pre className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap break-words">
                                  {step.output}
                                </pre>
                              )}
                              {step.error && (
                                <p className="text-xs text-red-600 mt-1">{step.error}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="text-xs text-muted-foreground p-3 bg-slate-50 rounded">
                <p className="font-semibold mb-1">Execution via API:</p>
                <code className="block">
                  POST /api/trapdoor/workflow/execute
                  <br />
                  {JSON.stringify({
                    category: selectedWorkflow.category,
                    workflowId: selectedWorkflow.id.replace(`${selectedWorkflow.category}-`, ''),
                    deviceSerial: "DEVICE_SERIAL",
                    authorization: selectedWorkflow.requires_authorization ? {
                      confirmed: true,
                      userInput: "REQUIRED_INPUT"
                    } : null
                  }, null, 2)}
                </code>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
