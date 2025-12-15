import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { StatusChip } from './StatusChip';

export const VelocityDashboard: React.FC = () => {
  const connections = [
    { name: 'ADB', status: 'active' as const },
    { name: 'Fastboot', status: 'idle' as const },
    { name: 'iDevice', status: 'idle' as const },
    { name: 'Samsung', status: 'detecting' as const },
    { name: 'MTK', status: 'idle' as const },
  ];

  return (
    <div className="space-y-6">
      {/* Main header */}
      <div>
        <h2 className="text-3xl font-inter font-bold text-velocity-white mb-2">
          Device Dashboard
        </h2>
        <p className="text-velocity-cyan/70 font-mono text-sm">
          Real-time device status and connection modules
        </p>
      </div>

      {/* Device info card */}
      <Card variant="accent">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-velocity-cyan/50 font-mono text-sm mb-2">MODEL</p>
            <p className="text-velocity-white font-inter font-bold text-lg">iPhone 15 Pro</p>
          </div>
          <div>
            <p className="text-velocity-cyan/50 font-mono text-sm mb-2">STATUS</p>
            <StatusChip status="active" label="Connected" />
          </div>
          <div>
            <p className="text-velocity-cyan/50 font-mono text-sm mb-2">CHIPSET</p>
            <p className="text-velocity-white font-mono text-sm">A17 Pro</p>
          </div>
          <div>
            <p className="text-velocity-cyan/50 font-mono text-sm mb-2">OS</p>
            <p className="text-velocity-white font-mono text-sm">iOS 17.1.2</p>
          </div>
        </div>
      </Card>

      {/* Connection modules */}
      <div>
        <h3 className="text-velocity-white font-inter font-bold mb-4">Connection Modules</h3>
        <div className="grid grid-cols-2 gap-4">
          {connections.map((conn) => (
            <Card key={conn.name} variant="default">
              <div className="flex items-center justify-between">
                <span className="text-velocity-white font-mono">{conn.name}</span>
                <StatusChip status={conn.status} label={conn.status} animated />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <Button variant="primary" size="lg">
          ⚡ Diagnostics
        </Button>
        <Button variant="secondary" size="lg">
          🔧 Advanced Tools
        </Button>
        <Button variant="primary" size="lg">
          💾 Flash & Restore
        </Button>
        <Button variant="secondary" size="lg">
          📋 Logs & Terminal
        </Button>
      </div>
    </div>
  );
};
