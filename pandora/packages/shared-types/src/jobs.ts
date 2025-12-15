/**
 * Job types for Pandora Codex
 */

export interface Job {
  id: string;
  type: "diagnostic" | "bootforge" | "deployment";
  action: string;
  status: "queued" | "running" | "completed" | "failed";
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  progress?: number;
  message?: string;
  error?: string;
}
