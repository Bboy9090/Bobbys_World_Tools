import type { Job } from "@pandora-codex/shared-types";
import { upsertJob, listJobs as dbListJobs, getJob as dbGetJob } from "../db/store";
import { broadcast } from "../ws/hub";

export function createJob(type: Job["type"], action: string): Job {
  const job: Job = {
    id: `job-${Date.now()}`,
    type,
    action,
    status: "queued",
    createdAt: new Date().toISOString(),
  };
  upsertJob(job);
  broadcast({ kind: "job", job });
  return job;
}

export function patchJob(id: string, patch: Partial<Job>) {
  const existing = dbGetJob(id);
  if (!existing) return;
  const next: Job = { ...existing, ...patch };
  upsertJob(next);
  broadcast({ kind: "job", job: next });
}

export const listJobs = dbListJobs;
export const getJob = dbGetJob;
