/**
 * Jobs Panel
 * Shows current and recent jobs with their status
 */

import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";
import type { Job } from "@pandora-codex/shared-types";

export function JobsPanel() {
  const [jobs, setJobs] = useState<Job[]>([]);

  const refresh = async () => {
    try {
      setJobs(await apiGet<Job[]>("/api/jobs"));
    } catch (e) {
      console.error("Failed to fetch jobs:", e);
    }
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 2000);
    return () => clearInterval(t);
  }, []);

  const getStatusColor = (status: Job["status"]) => {
    switch (status) {
      case "queued": return "text-yellow-400";
      case "running": return "text-blue-400";
      case "completed": return "text-green-400";
      case "failed": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="space-y-2">
      <div className="font-semibold">Jobs</div>
      {jobs.length === 0 && <div className="text-slate-400 text-sm">No jobs yet.</div>}
      {jobs.map((job) => (
        <div key={job.id} className="p-3 border rounded-xl bg-slate-900/50">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium">{job.action}</div>
              <div className="text-xs text-slate-400">{job.type} • {job.id}</div>
            </div>
            <div className={`text-sm font-medium ${getStatusColor(job.status)}`}>
              {job.status}
            </div>
          </div>
          {job.progress !== undefined && (
            <div className="mt-2">
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${job.progress}%` }}></div>
              </div>
            </div>
          )}
          {job.message && <div className="mt-2 text-xs text-slate-300">{job.message}</div>}
          {job.error && <div className="mt-2 text-xs text-red-400">{job.error}</div>}
          <div className="mt-1 text-xs text-slate-500">Created: {new Date(job.createdAt).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
