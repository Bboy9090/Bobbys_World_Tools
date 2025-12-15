import { useCallback, useEffect, useState } from 'react';
import { apiService, type JobInfo } from '../services/apiService';

interface JobListProps {
  onCancelJob: (jobId: string) => Promise<void>;
}

function StatusBadge({ status }: { status: JobInfo['status'] }) {
  const base = 'px-2 py-1 rounded text-xs font-tech font-semibold';
  switch (status) {
    case 'Running':
      return <span className={`${base} bg-grimoire-electric-blue/20 text-grimoire-neon-cyan border border-grimoire-electric-blue/40 shadow-glow-blue/30`}>Running</span>;
    case 'Completed':
      return <span className={`${base} bg-emerald-900/40 text-emerald-300 border border-emerald-500/40`}>Completed</span>;
    case 'Failed':
      return <span className={`${base} bg-grimoire-phoenix-orange/20 text-grimoire-phoenix-orange border border-grimoire-phoenix-orange/40 shadow-glow-orange/30`}>Failed</span>;
    case 'Cancelled':
      return <span className={`${base} bg-grimoire-thunder-gold/20 text-grimoire-thunder-gold border border-grimoire-thunder-gold/40`}>Cancelled</span>;
    default:
      return <span className={`${base} bg-grimoire-smoke-gray text-gray-200`}>{status}</span>;
  }
}

export function JobList({ onCancelJob }: JobListProps) {
  const [jobs, setJobs] = useState<JobInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.listJobs();
      if (response.success && response.data) {
        setJobs(response.data);
        setError(null);
      } else {
        setError(response.error || 'Failed to load jobs');
      }
    } catch (err) {
      console.error('Failed to load jobs', err);
      setError('Unable to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
    const interval = setInterval(() => {
      loadJobs();
    }, 2000);
    return () => clearInterval(interval);
  }, [loadJobs]);

  const handleCancel = async (jobId: string) => {
    setCancellingId(jobId);
    try {
      await onCancelJob(jobId);
    } finally {
      setCancellingId(null);
      await loadJobs();
    }
  };

  return (
    <div className="bg-grimoire-obsidian-light border border-grimoire-electric-blue/30 rounded-lg p-4 space-y-4 shadow-glow-blue/10">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-grimoire font-semibold text-grimoire-electric-blue">Background Jobs</h3>
          <p className="text-sm text-dark-muted font-tech">Live view of plugin executions</p>
        </div>
        <button
          onClick={loadJobs}
          className="px-3 py-2 text-sm font-tech bg-grimoire-obsidian border border-grimoire-electric-blue/40 rounded hover:border-grimoire-neon-cyan hover:shadow-glow-blue/30 transition-all duration-300 text-grimoire-neon-cyan"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="text-sm text-grimoire-phoenix-orange bg-grimoire-phoenix-orange/10 border border-grimoire-phoenix-orange/40 rounded p-3 shadow-glow-orange/20 font-tech">{error}</div>
      )}

      {jobs.length === 0 && !loading && !error && (
        <div className="text-sm text-dark-muted font-tech">No jobs yet. Execute a plugin to see it appear.</div>
      )}

      <div className="space-y-3">
        {jobs.map(job => (
          <div key={job.id} className="grimoire-card p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-grimoire font-semibold text-grimoire-electric-blue">{job.pluginName}</p>
                <p className="text-xs text-dark-muted font-tech">Job ID: {job.id}</p>
              </div>
              <StatusBadge status={job.status} />
            </div>

            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 text-xs text-dark-muted gap-2 font-tech">
              <p>
                <span className="font-medium text-grimoire-neon-cyan">Started:</span>{' '}
                {job.startedAt ? new Date(job.startedAt).toLocaleTimeString() : '—'}
              </p>
              <p>
                <span className="font-medium text-grimoire-neon-cyan">Finished:</span>{' '}
                {job.completedAt ? new Date(job.completedAt).toLocaleTimeString() : '—'}
              </p>
              <p>
                <span className="font-medium text-grimoire-neon-cyan">Stdout:</span> {job.stdout || 'None'}
              </p>
            </div>

            {(job.status === 'Running' || job.status === 'Pending') && (
              <button
                onClick={() => handleCancel(job.id)}
                disabled={cancellingId === job.id}
                className="mt-3 w-full px-3 py-2 text-sm font-tech font-bold bg-gradient-to-r from-grimoire-phoenix-orange to-orange-500 hover:from-orange-500 hover:to-grimoire-phoenix-orange disabled:from-gray-700 disabled:to-gray-800 rounded text-white transition-all duration-300 shadow-glow-orange/40"
              >
                {cancellingId === job.id ? 'Cancelling…' : 'Cancel Job'}
              </button>
            )}
          </div>
        ))}
      </div>

      {loading && (
        <p className="text-xs text-grimoire-neon-cyan font-tech animate-pulse">Updating job list…</p>
      )}
    </div>
  );
}
