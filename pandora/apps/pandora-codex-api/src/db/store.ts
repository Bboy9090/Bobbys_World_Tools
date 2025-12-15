import { db } from "./sqlite";
import type { Job } from "@pandora-codex/shared-types";
import type { SimpleRepairReport } from "@pandora-codex/shared-types";

export function upsertJob(job: Job) {
  const stmt = db.prepare(`
    INSERT INTO jobs (id,type,action,status,createdAt,startedAt,finishedAt,progress,message,error)
    VALUES (@id,@type,@action,@status,@createdAt,@startedAt,@finishedAt,@progress,@message,@error)
    ON CONFLICT(id) DO UPDATE SET
      status=excluded.status,
      startedAt=excluded.startedAt,
      finishedAt=excluded.finishedAt,
      progress=excluded.progress,
      message=excluded.message,
      error=excluded.error
  `);
  stmt.run(job as any);
}

export function listJobs(): Job[] {
  return db.prepare(`SELECT * FROM jobs ORDER BY createdAt DESC LIMIT 200`).all() as Job[];
}

export function getJob(id: string): Job | undefined {
  return db.prepare(`SELECT * FROM jobs WHERE id = ?`).get(id) as Job | undefined;
}

export function insertReport(report: SimpleRepairReport) {
  db.prepare(`
    INSERT INTO reports (id, createdAt, source, title, findingsJson, raw)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    report.id,
    report.createdAt,
    report.source,
    report.title,
    JSON.stringify(report.findings),
    report.raw ?? null
  );
}

export function listReports(): SimpleRepairReport[] {
  const rows = db.prepare(`SELECT * FROM reports ORDER BY createdAt DESC LIMIT 100`).all() as any[];
  return rows.map((r) => ({
    id: r.id,
    createdAt: r.createdAt,
    source: r.source,
    title: r.title,
    findings: JSON.parse(r.findingsJson),
    raw: r.raw ?? undefined,
  }));
}
