import React from 'react';
import { Card, Badge, EmptyState } from '@pandora-codex/ui-kit';
import type { Device } from '@pandora-codex/shared-types';
import { Upload } from 'lucide-react';

interface DeploymentJobsProps {
  devices: Device[];
}

export const DeploymentJobs: React.FC<DeploymentJobsProps> = () => {
  const jobs: any[] = []; // Would fetch from API in real implementation

  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={<Upload className="h-12 w-12" />}
        title="No deployment jobs"
        description="Start a deployment to see jobs here"
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card title="Deployment Jobs">
        <div className="space-y-3">
          {jobs.map((job: any) => (
            <div key={job.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{job.name}</h4>
                  <p className="text-sm text-gray-600">{job.device}</p>
                </div>
                <Badge variant={job.status === 'completed' ? 'success' : 'info'}>
                  {job.status}
                </Badge>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{job.progress}% complete</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
