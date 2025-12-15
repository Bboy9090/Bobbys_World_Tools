/**
 * Reports Panel
 * Shows diagnostic reports from SQLite
 */

import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";
import type { SimpleRepairReport } from "@pandora-codex/shared-types";

export function ReportsPanel() {
  const [reports, setReports] = useState<SimpleRepairReport[]>([]);

  const refresh = async () => {
    try {
      setReports(await apiGet<SimpleRepairReport[]>("/api/reports"));
    } catch (e) {
      console.error("Failed to fetch reports:", e);
    }
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-2">
      <div className="font-semibold">Reports (SQLite)</div>
      {reports.length === 0 && <div className="text-slate-400 text-sm">No reports yet.</div>}
      {reports.map((r) => (
        <div key={r.id} className="p-3 border rounded-xl bg-slate-900/50">
          <div className="text-sm font-medium">{r.title}</div>
          <div className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleString()} • {r.source}</div>
          <ul className="mt-2 text-sm space-y-1">
            {r.findings.map((f) => (
              <li key={f.id}><span className="text-slate-400">[{f.severity}]</span> {f.code} — {f.message}</li>
            ))}
          </ul>
          {r.raw && (
            <details className="mt-2">
              <summary className="text-xs text-slate-300 cursor-pointer">Raw</summary>
              <pre className="text-xs whitespace-pre-wrap max-h-48 overflow-auto bg-black/40 p-2 rounded mt-1">{r.raw}</pre>
            </details>
          )}
        </div>
      ))}
    </div>
  );
}
