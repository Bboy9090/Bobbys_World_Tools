/**
 * TicketTimeline - Visual ticket progression from intake to closure
 * Shows status stages with diagnostic findings and estimate details
 */

import { useState, useEffect } from 'react';

interface DiagnosticFinding {
  id: string;
  level: 'info' | 'warning' | 'critical';
  code: string;
  message: string;
  source: string;
}

interface DiagnosticRun {
  id: string;
  status: string;
  summary: string;
  createdAt: string;
  findings: DiagnosticFinding[];
}

interface Part {
  id: string;
  name: string;
  sku: string;
  category: string;
}

interface TicketPart {
  id: string;
  quantity: number;
  linePriceCents: number;
  part: Part;
}

interface TicketLabor {
  id: string;
  description: string;
  minutes: number;
  rateCents: number;
  linePriceCents: number;
}

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface Device {
  id: string;
  platform: string;
  oem?: string;
  model?: string;
  serial?: string;
}

interface Ticket {
  id: string;
  status: string;
  issueSummary?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  device: Device;
  diagnosticRuns: DiagnosticRun[];
  parts: TicketPart[];
  labor: TicketLabor[];
}

interface TicketTimelineProps {
  ticketId: string;
  onStatusChange?: (status: string) => void;
  onClose?: () => void;
}

const STATUSES = [
  { key: 'intake', label: 'Intake', icon: '📋' },
  { key: 'diagnosing', label: 'Diagnosing', icon: '🔍' },
  { key: 'estimating', label: 'Estimating', icon: '📊' },
  { key: 'approved', label: 'Approved', icon: '✓' },
  { key: 'repairing', label: 'Repairing', icon: '🔧' },
  { key: 'done', label: 'Complete', icon: '✅' },
];

export function TicketTimeline({ ticketId, onStatusChange, onClose }: TicketTimelineProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`);
      if (!res.ok) throw new Error('Failed to load ticket');
      const data = await res.json();
      setTicket(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!ticket || updating) return;
    
    setUpdating(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!res.ok) throw new Error('Failed to update status');
      
      setTicket(prev => prev ? { ...prev, status: newStatus } : null);
      onStatusChange?.(newStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  const runDiagnostics = async () => {
    if (!ticket) return;
    
    setUpdating(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/diagnose`, {
        method: 'POST',
      });
      
      if (!res.ok) throw new Error('Failed to run diagnostics');
      
      await fetchTicket();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run diagnostics');
    } finally {
      setUpdating(false);
    }
  };

  const generateEstimate = async () => {
    if (!ticket) return;
    
    setUpdating(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/estimate`, {
        method: 'POST',
      });
      
      if (!res.ok) throw new Error('Failed to generate estimate');
      
      await updateStatus('estimating');
      await fetchTicket();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate estimate');
    } finally {
      setUpdating(false);
    }
  };

  const getCurrentStageIndex = () => {
    if (!ticket) return 0;
    return STATUSES.findIndex(s => s.key === ticket.status);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getEstimateTotal = () => {
    if (!ticket) return 0;
    const partsTotal = ticket.parts.reduce((sum, p) => sum + p.linePriceCents, 0);
    const laborTotal = ticket.labor.reduce((sum, l) => sum + l.linePriceCents, 0);
    return partsTotal + laborTotal;
  };

  if (loading) {
    return (
      <div className="bg-gray-900/95 border border-cyan-500/20 rounded-lg p-8 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="bg-gray-900/95 border border-red-500/20 rounded-lg p-8 text-center">
        <p className="text-red-400">{error || 'Ticket not found'}</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  const currentIndex = getCurrentStageIndex();

  return (
    <div className="bg-gray-900/95 border border-cyan-500/20 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div>
          <h2 className="text-lg font-bold text-cyan-400 font-mono">
            TICKET #{ticket.id.slice(0, 8).toUpperCase()}
          </h2>
          <p className="text-gray-500 text-sm">
            {ticket.customer.name} • {ticket.device.oem} {ticket.device.model}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          {STATUSES.map((stage, index) => (
            <div key={stage.key} className="flex items-center flex-1">
              <div
                className={`flex flex-col items-center ${
                  index <= currentIndex ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
                onClick={() => index <= currentIndex && updateStatus(stage.key)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                  index < currentIndex
                    ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                    : index === currentIndex
                      ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400 animate-pulse'
                      : 'bg-gray-800 border-2 border-gray-700 text-gray-600'
                }`}>
                  {stage.icon}
                </div>
                <span className={`text-xs mt-1 ${
                  index <= currentIndex ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {stage.label}
                </span>
              </div>
              {index < STATUSES.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  index < currentIndex ? 'bg-green-500/50' : 'bg-gray-800'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-gray-400 font-mono text-sm uppercase tracking-wider mb-2">Issue</h3>
          <p className="text-white">{ticket.issueSummary || 'No issue description'}</p>
          {ticket.notes && (
            <p className="text-gray-400 text-sm mt-2">{ticket.notes}</p>
          )}
        </div>

        {ticket.diagnosticRuns.length > 0 && (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-gray-400 font-mono text-sm uppercase tracking-wider mb-3">Diagnostics</h3>
            {ticket.diagnosticRuns.map((run) => (
              <div key={run.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{run.summary}</span>
                  <span className="text-gray-500">
                    {new Date(run.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {run.findings.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {run.findings.map((finding) => (
                      <div
                        key={finding.id}
                        className={`px-3 py-2 rounded text-sm flex items-start gap-2 ${
                          finding.level === 'critical'
                            ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                            : finding.level === 'warning'
                              ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
                              : 'bg-gray-700/50 border border-gray-600/30 text-gray-300'
                        }`}
                      >
                        <span className="font-mono text-xs opacity-70">[{finding.source}]</span>
                        <span>{finding.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {(ticket.parts.length > 0 || ticket.labor.length > 0) && (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-gray-400 font-mono text-sm uppercase tracking-wider mb-3">Estimate</h3>
            
            {ticket.parts.length > 0 && (
              <div className="mb-4">
                <h4 className="text-gray-500 text-xs uppercase mb-2">Parts</h4>
                {ticket.parts.map((tp) => (
                  <div key={tp.id} className="flex justify-between text-sm py-1">
                    <span className="text-gray-300">
                      {tp.part.name} {tp.quantity > 1 && `x${tp.quantity}`}
                    </span>
                    <span className="text-white font-mono">
                      {formatCurrency(tp.linePriceCents)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {ticket.labor.length > 0 && (
              <div className="mb-4">
                <h4 className="text-gray-500 text-xs uppercase mb-2">Labor</h4>
                {ticket.labor.map((tl) => (
                  <div key={tl.id} className="flex justify-between text-sm py-1">
                    <span className="text-gray-300">
                      {tl.description} ({tl.minutes} min)
                    </span>
                    <span className="text-white font-mono">
                      {formatCurrency(tl.linePriceCents)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-gray-700 pt-2 flex justify-between">
              <span className="text-gray-400 font-bold">Total</span>
              <span className="text-cyan-400 font-mono font-bold text-lg">
                {formatCurrency(getEstimateTotal())}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {ticket.status === 'intake' && (
            <button
              onClick={runDiagnostics}
              disabled={updating}
              className="flex-1 px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 rounded hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
            >
              {updating ? 'Running...' : 'Run Diagnostics'}
            </button>
          )}

          {ticket.status === 'diagnosing' && (
            <button
              onClick={generateEstimate}
              disabled={updating}
              className="flex-1 px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 rounded hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
            >
              {updating ? 'Generating...' : 'Generate Estimate'}
            </button>
          )}

          {ticket.status === 'estimating' && (
            <button
              onClick={() => updateStatus('approved')}
              disabled={updating}
              className="flex-1 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/40 rounded hover:bg-green-500/30 transition-colors disabled:opacity-50"
            >
              Approve Estimate
            </button>
          )}

          {ticket.status === 'approved' && (
            <button
              onClick={() => updateStatus('repairing')}
              disabled={updating}
              className="flex-1 px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 rounded hover:bg-yellow-500/30 transition-colors disabled:opacity-50"
            >
              Start Repair
            </button>
          )}

          {ticket.status === 'repairing' && (
            <button
              onClick={() => updateStatus('done')}
              disabled={updating}
              className="flex-1 px-4 py-2 bg-green-500 text-black font-bold rounded hover:bg-green-400 transition-colors disabled:opacity-50"
            >
              Mark Complete
            </button>
          )}

          {ticket.status !== 'done' && ticket.status !== 'cancelled' && (
            <button
              onClick={() => updateStatus('cancelled')}
              disabled={updating}
              className="px-4 py-2 text-red-400 border border-red-500/40 rounded hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TicketTimeline;
