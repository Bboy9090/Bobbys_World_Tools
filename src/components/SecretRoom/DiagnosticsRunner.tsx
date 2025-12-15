import React, { useState } from 'react';
import { Card, Button, Badge, EmptyState } from '@pandora-codex/ui-kit';
import type { Device } from '@pandora-codex/shared-types';
import { Activity, Play, AlertCircle } from 'lucide-react';

interface DiagnosticsRunnerProps {
  devices: Device[];
}

export const DiagnosticsRunner: React.FC<DiagnosticsRunnerProps> = ({ devices }) => {
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runDiagnostics = async () => {
    if (!selectedDevice) return;
    
    setIsRunning(true);
    try {
      const response = await fetch('http://localhost:3001/api/diagnostics/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: selectedDevice }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to run diagnostics' });
    } finally {
      setIsRunning(false);
    }
  };

  if (devices.length === 0) {
    return (
      <EmptyState
        icon={<Activity className="h-12 w-12" />}
        title="No devices available"
        description="Connect a device to run diagnostics"
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card title="Run Diagnostics">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Device
            </label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a device...</option>
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name} ({device.model})
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={runDiagnostics}
            disabled={!selectedDevice || isRunning}
            isLoading={isRunning}
          >
            <Play className="h-4 w-4 mr-2" />
            Run Diagnostics
          </Button>
        </div>
      </Card>

      {result && (
        <Card title="Diagnostics Results">
          {result.error ? (
            <div className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {result.error}
            </div>
          ) : (
            <div className="space-y-2">
              <p><strong>Run ID:</strong> {result.data?.runId}</p>
              <Badge variant="success">Diagnostics started</Badge>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
