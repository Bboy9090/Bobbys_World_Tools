import React from 'react';
import { Card, Badge, EmptyState, Button } from '@pandora-codex/ui-kit';
import type { Device } from '@pandora-codex/shared-types';
import { Smartphone, Usb, Wifi, Battery } from 'lucide-react';

interface DevicesListProps {
  devices: Device[];
  onRefresh: () => void;
}

export const DevicesList: React.FC<DevicesListProps> = ({ devices, onRefresh }) => {
  if (devices.length === 0) {
    return (
      <EmptyState
        icon={<Smartphone className="h-12 w-12" />}
        title="No devices connected"
        description="Connect a device via USB or network to get started"
        action={<Button onClick={onRefresh}>Scan for Devices</Button>}
      />
    );
  }

  const getStatusColor = (status: Device['status']) => {
    switch (status) {
      case 'connected': return 'success';
      case 'offline': return 'error';
      default: return 'warning';
    }
  };

  const getModeIcon = (device: Device) => {
    if (device.connectionType === 'usb') return <Usb className="h-4 w-4" />;
    if (device.connectionType === 'wifi') return <Wifi className="h-4 w-4" />;
    return <Smartphone className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      {devices.map((device) => (
        <Card key={device.id} className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                {getModeIcon(device)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{device.name}</h3>
                  <Badge variant={getStatusColor(device.status)}>
                    {device.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {device.manufacturer} {device.model} • {device.os} {device.osVersion}
                </p>
                {device.serialNumber && (
                  <p className="text-xs text-gray-500 mt-1">SN: {device.serialNumber}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {device.batteryLevel !== undefined && (
                <div className="flex items-center gap-2 text-sm">
                  <Battery className="h-4 w-4" />
                  <span>{device.batteryLevel}%</span>
                </div>
              )}
              <Badge variant="default">{device.connectionType}</Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
