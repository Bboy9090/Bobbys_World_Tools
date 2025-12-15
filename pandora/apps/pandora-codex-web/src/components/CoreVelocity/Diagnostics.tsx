import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Terminal } from './Terminal';

export const VelocityDiagnostics: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (scanning) {
      const interval = setInterval(() => {
        setLogs((prev) => [
          ...prev.slice(-15),
          `[${new Date().toLocaleTimeString()}] Scanning device metrics...`,
        ]);
      }, 800);
      return () => clearInterval(interval);
    }
  }, [scanning]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-inter font-bold text-velocity-white mb-2">
          Diagnostics Engine
        </h2>
        <p className="text-velocity-cyan/70 font-mono text-sm">
          Real-time device health and performance analysis
        </p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-3 gap-4">
        {['Battery', 'Thermal', 'Storage'].map((metric) => (
          <Card key={metric} variant="default">
            <p className="text-velocity-cyan/50 font-mono text-xs mb-2">{metric.toUpperCase()}</p>
            <div className="text-3xl font-bold text-velocity-lime mb-2">85%</div>
            <div className="w-full bg-velocity-black rounded-full h-1 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-velocity-blue to-velocity-cyan animate-velocity-shimmer"
                style={{ width: '85%' }}
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Scan button */}
      <Button
        variant="primary"
        size="lg"
        onClick={() => setScanning(!scanning)}
        className="w-full"
      >
        {scanning ? '⏹️ Stop Scan' : '▶️ Run Full Scan (Velocity Mode)'}
      </Button>

      {/* Terminal output */}
      <div>
        <h3 className="text-velocity-white font-inter font-bold mb-2">Live Telemetry</h3>
        <Terminal lines={logs.length > 0 ? logs : ['Waiting for scan...']} />
      </div>
    </div>
  );
};
