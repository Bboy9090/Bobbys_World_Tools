/**
 * TicketList - Active and recent tickets overview
 * Quick access to ticket management with status filters
 */

import { useState, useEffect } from 'react';

interface Ticket {
  id: string;
  status: string;
  issueSummary?: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
  };
  device: {
    id: string;
    platform: string;
    oem?: string;
    model?: string;
  };
}

interface TicketListProps {
  onSelectTicket?: (ticketId: string) => void;
  limit?: number;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  intake: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  diagnosing: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  estimating: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  approved: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  repairing: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  done: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' },
  cancelled: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
};

export function TicketList({ onSelectTicket, limit = 10 }: TicketListProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('active');

  useEffect(() => {
    fetchTickets();
    const pollInterval = setInterval(fetchTickets, 5000);
    return () => clearInterval(pollInterval);
  }, [filter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const statusParam = filter === 'active' 
        ? '' 
        : filter === 'all' 
          ? '' 
          : `?status=${filter}`;
      
      const res = await fetch(`/api/tickets${statusParam}`);
      if (!res.ok) throw new Error('Failed to fetch tickets');
      const data = await res.json();
      
      let filtered = data.tickets || [];
      
      if (filter === 'active') {
        filtered = filtered.filter((t: Ticket) => 
          !['done', 'cancelled'].includes(t.status)
        );
      }
      
      setTickets(filtered.slice(0, limit));
      setError(null);
    } catch (err) {
      setError('Failed to load tickets. Check backend connection.');
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    return STATUS_COLORS[status] || STATUS_COLORS.intake;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-gray-900/95 border border-cyan-500/20 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h2 className="text-lg font-bold text-cyan-400 font-mono">TICKETS</h2>
        <div className="flex gap-1">
          {['active', 'all', 'done'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                filter === f
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border-b border-red-500/30">
          <p className="text-sm text-red-400 flex items-center gap-2">
            <span>⚠️</span> {error}
          </p>
        </div>
      )}

      {loading ? (
        <div className="p-8 flex justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full" />
        </div>
      ) : tickets.length === 0 && !error ? (
        <div className="p-8 text-center text-gray-500">
          No tickets found
        </div>
      ) : (
        <div className="divide-y divide-gray-800">
          {tickets.map((ticket) => {
            const style = getStatusStyle(ticket.status);
            return (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket?.(ticket.id)}
                className="p-4 hover:bg-gray-800/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium truncate">
                        {ticket.customer.name}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded border ${style.bg} ${style.text} ${style.border}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 truncate">
                      {ticket.device.oem} {ticket.device.model || ticket.device.platform}
                      {ticket.issueSummary && ` • ${ticket.issueSummary}`}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                    {formatDate(ticket.updatedAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="p-3 border-t border-gray-800">
        <button
          onClick={() => fetchTickets()}
          className="w-full text-center text-sm text-gray-500 hover:text-cyan-400 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}

export default TicketList;
