import { execSync } from "node:child_process";
import { createJob, patchJob } from "./jobService";
import { insertReport } from "../db/store";
import type { SimpleRepairReport } from "@pandora-codex/shared-types";

function safe(cmd: string): string {
  return execSync(cmd, { encoding: "utf-8" });
}

export function startAndroidLogcatJob(deviceId: string) {
  const job = createJob("diagnostic", `android_logcat:${deviceId}`);

  patchJob(job.id, { status: "running", startedAt: new Date().toISOString(), progress: 10 });

  try {
    const raw = safe(`adb -s ${deviceId} logcat -d -t 200`);
    const report: SimpleRepairReport = {
      id: `report-${Date.now()}`,
      createdAt: new Date().toISOString(),
      source: "device",
      title: `Android Logcat Snapshot (${deviceId})`,
      findings: [{
        id: "LOGCAT_COLLECTED",
        severity: "info",
        code: "LOGCAT_OK",
        message: "Collected Android logcat (last 200 lines).",
        hint: "Use this to triage crashes, thermal spam, storage errors."
      }],
      raw: raw.slice(-12000),
    };

    insertReport(report);

    patchJob(job.id, { status: "completed", finishedAt: new Date().toISOString(), progress: 100, message: "Report saved to SQLite." });
    return job;
  } catch (e: any) {
    patchJob(job.id, { status: "failed", finishedAt: new Date().toISOString(), error: e?.message ?? "diagnostic failed" });
    return job;
  }
}
