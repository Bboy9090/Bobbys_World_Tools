import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';

interface Job {
  id: number;
  device_id: number;
  customer_name?: string;
  customer_phone?: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface JobsPanelProps {
  uniqueKey?: string;
  showAll?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  intake: 'bg-blue-500',
  diagnosing: 'bg-yellow-500',
  repairing: 'bg-orange-500',
  done: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const STATUS_OPTIONS = ['intake', 'diagnosing', 'repairing', 'done', 'cancelled'];

export const JobsPanel: React.FC<JobsPanelProps> = ({ uniqueKey, showAll = false }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    description: '',
  });

  useEffect(() => {
    fetchJobs();
  }, [uniqueKey, showAll]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = showAll
        ? await apiService.getAllJobs()
        : await apiService.getJobsForDevice(uniqueKey || '');
      
      if (response.success && response.data) {
        setJobs(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async () => {
    if (!uniqueKey) return;

    try {
      const response = await apiService.createJob({
        unique_key: uniqueKey,
        ...formData,
      });

      if (response.success) {
        setFormData({ customer_name: '', customer_phone: '', description: '' });
        setShowCreateForm(false);
        fetchJobs();
      }
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  const handleUpdateStatus = async (jobId: number, newStatus: string) => {
    try {
      const response = await apiService.updateJobStatus(jobId, newStatus);
      if (response.success) {
        fetchJobs();
      }
    } catch (error) {
      console.error('Failed to update job status:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900/80 border border-grimoire-thunder-gold/30 rounded-xl p-4">
        <div className="flex items-center justify-center text-grimoire-thunder-gold">
          <span className="animate-pulse">Loading jobs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-grimoire-thunder-gold/30 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-tech text-grimoire-thunder-gold">
          {showAll ? 'All Jobs' : 'Device Jobs'}
        </h3>
        {uniqueKey && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-3 py-1 text-sm bg-grimoire-thunder-gold/20 hover:bg-grimoire-thunder-gold/30 text-grimoire-thunder-gold rounded transition-colors"
          >
            + New Job
          </button>
        )}
      </div>

      {showCreateForm && uniqueKey && (
        <div className="bg-slate-950/60 border border-slate-700 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-semibold text-slate-200">Create New Job</h4>
          <input
            type="text"
            placeholder="Customer Name"
            value={formData.customer_name}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-200 text-sm"
          />
          <input
            type="text"
            placeholder="Customer Phone"
            value={formData.customer_phone}
            onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-200 text-sm"
          />
          <textarea
            placeholder="Job Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-200 text-sm resize-none"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateJob}
              className="flex-1 py-2 bg-grimoire-thunder-gold hover:bg-grimoire-thunder-gold/80 text-grimoire-obsidian font-bold rounded transition-colors"
            >
              Create Job
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {jobs.length === 0 ? (
        <p className="text-dark-muted text-sm">No jobs recorded yet.</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-slate-950/60 border border-slate-700 rounded-lg p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[job.status] || 'bg-gray-500'}`} />
                    <span className="text-sm font-medium text-slate-200">
                      Job #{job.id}
                    </span>
                    <span className="text-xs text-slate-400 capitalize">
                      {job.status}
                    </span>
                  </div>
                  {job.customer_name && (
                    <p className="text-sm text-slate-300">{job.customer_name}</p>
                  )}
                  {job.customer_phone && (
                    <p className="text-xs text-slate-400">{job.customer_phone}</p>
                  )}
                  {job.description && (
                    <p className="text-xs text-slate-400 mt-1">{job.description}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    Created: {formatDate(job.created_at)}
                  </p>
                </div>

                <select
                  value={job.status}
                  onChange={(e) => handleUpdateStatus(job.id, e.target.value)}
                  className="px-2 py-1 text-xs bg-slate-800 border border-slate-600 rounded text-slate-200"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={fetchJobs}
        className="w-full py-2 text-sm bg-grimoire-thunder-gold/20 hover:bg-grimoire-thunder-gold/30 text-grimoire-thunder-gold rounded-lg transition-colors border border-grimoire-thunder-gold/30"
      >
        Refresh Jobs
      </button>
    </div>
  );
};
