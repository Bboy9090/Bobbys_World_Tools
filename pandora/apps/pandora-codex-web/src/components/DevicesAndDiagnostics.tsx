/**
 * Devices and Diagnostics Panel
 * Shows detected devices and allows running diagnostic jobs
 */

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import type { Job } from "@pandora-codex/shared-types";

interface SimpleDevice {
  id: string;
  platform: "android" | "ios";
  mode: "normal" | "fastboot" | "recovery";
}

export function DevicesAndDiagnostics() {
  const [devices, setDevices] = useState<SimpleDevice[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setErr(null);
      setDevices(await apiGet<SimpleDevice[]>("/api/devices2"));
    } catch (e: any) {
      setErr(e?.message ?? "device refresh failed");
    }
  };

  const logcat = async (deviceId: string) => {
    try {
      await apiPost<Job>("/api/diagnostics2/android/logcat", { deviceId });
    } catch (e: any) {
      setErr(e?.message ?? "logcat failed");
    }
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-2">
      <div className="font-semibold">Devices</div>
      {err && <div className="text-amber-300 text-sm">{err}</div>}
      {devices.length === 0 && <div className="text-slate-400 text-sm">No devices detected.</div>}
      {devices.map((d) => (
        <div key={d.id} className="p-3 border rounded-xl bg-slate-900/50">
          <div className="text-sm">ID: {d.id}</div>
          <div className="text-sm">Platform: {d.platform} • Mode: {d.mode}</div>
          {d.platform === "android" && d.mode === "normal" && (
            <button className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm" onClick={() => void logcat(d.id)}>
              Run Logcat Diagnostic Job
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
