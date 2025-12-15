import React from 'react';
import { Card } from '@pandora-codex/ui-kit';
import { useWs } from '../../lib/useWs';

export const LogsViewer: React.FC = () => {
  const { bootforgeTail } = useWs();

  return (
    <div className="space-y-4">
      <Card title="BootForge Live Logs" className="font-mono">
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto">
          {bootforgeTail ? (
            <pre className="text-xs whitespace-pre-wrap">{bootforgeTail}</pre>
          ) : (
            <div className="text-sm text-gray-500">
              Waiting for BootForge logs...
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
