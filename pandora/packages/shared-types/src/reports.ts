/**
 * Report types for Pandora Codex - Simple repair reports
 */

export type Severity = "info" | "warning" | "error" | "critical";

export interface RepairFinding {
  id: string;
  severity: Severity;
  code: string;
  message: string;
  hint?: string;
}

export interface SimpleRepairReport {
  id: string;
  createdAt: string;
  source: "device" | "bootforge" | "manual";
  title: string;
  findings: RepairFinding[];
  raw?: string;
}
