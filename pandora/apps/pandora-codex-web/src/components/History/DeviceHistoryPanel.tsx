import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';

interface DeviceSnapshot {
  id: number;
  device_id: number;
  captured_at: string;
  os_kind: string;
  mode_kind: string;
  diag_json: any;
  note?: string;
}

interface DeviceHistoryPanelProps {
  uniqueKey: string;
  deviceName?: string;
}

export const DeviceHistoryPanel: React.FC<DeviceHistoryPanelProps> = ({ uniqueKey, deviceName: _deviceName }) => {
  const [snapshots, setSnapshots] = useState<DeviceSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [uniqueKey]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await apiService.getDeviceHistory(uniqueKey);
      if (response.success && response.data) {
        setSnapshots(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch device history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="bg-slate-900/80 border border-grimoire-electric-blue/30 rounded-xl p-4">
        <div className="flex items-center justify-center text-grimoire-neon-cyan">
          <span className="animate-pulse">Loading history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-grimoire-electric-blue/30 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-tech text-grimoire-neon-cyan">
          Device History
        </h3>
        <span className="text-xs text-dark-muted">
          {snapshots.length} snapshots
        </span>
      </div>

      {snapshots.length === 0 ? (
        <p className="text-dark-muted text-sm">No history recorded yet.</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {snapshots.map((snapshot) => (
            <div
              key={snapshot.id}
              className="bg-slate-950/60 border border-slate-700 rounded-lg p-3 transition-all"
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpand(snapshot.id)}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    snapshot.os_kind === 'IOS' ? 'bg-blue-400' : 'bg-green-400'
                  }`} />
                  <div>
                    <p className="text-sm text-slate-200">
                      {formatDate(snapshot.captured_at)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {snapshot.os_kind} • {snapshot.mode_kind}
                    </p>
                  </div>
                </div>
                <span className="text-slate-400 text-sm">
                  {expandedId === snapshot.id ? '▼' : '▶'}
                </span>
              </div>

              {expandedId === snapshot.id && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <pre className="text-xs text-slate-300 overflow-x-auto bg-slate-900 p-2 rounded max-h-48 overflow-y-auto">
                    {JSON.stringify(snapshot.diag_json, null, 2)}
                  </pre>
                  {snapshot.note && (
                    <p className="mt-2 text-xs text-slate-400">
                      Note: {snapshot.note}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={fetchHistory}
        className="w-full py-2 text-sm bg-grimoire-electric-blue/20 hover:bg-grimoire-electric-blue/30 text-grimoire-neon-cyan rounded-lg transition-colors border border-grimoire-electric-blue/30"
      >
        Refresh History
      </button>
    </div>
  );
};
