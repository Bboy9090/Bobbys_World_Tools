import { useEffect, useState } from "react";
import { Play, AlertTriangle, Shield, Wrench, Search } from "lucide-react";

interface ToolStatus {
  installed: boolean;
  version?: string | null;
  devices_raw?: string | null;
}

interface ArsenalStatus {
  env: string;
  tools: {
    rust: ToolStatus;
    node: ToolStatus;
    python: ToolStatus;
    adb: ToolStatus;
    fastboot: ToolStatus;
  };
}

const initialStatus: ArsenalStatus = {
  env: "codespaces",
  tools: {
    rust: { installed: true, version: "1.75.0" },
    node: { installed: true, version: "20.11.0" },
    python: { installed: true, version: "3.11.7" },
    adb: { installed: true, version: "1.0.41" },
    fastboot: { installed: true, version: "34.0.5" }
  }
};

export function BobbyDevArsenalDashboard() {
  const [status, setStatus] = useState<ArsenalStatus>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/dev-arsenal/status");
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = (await res.json()) as ArsenalStatus;
        setStatus(json);
      } catch (err: any) {
        setError("Unable to reach dev-arsenal API. Wire the backend when ready.");
      } finally {
        setLoading(false);
      }
    }

  }, []);

  const tools = [
    { key: "rust", label: "Rust Toolchain", icon: <Wrench className="w-4 h-4" /> },
    { key: "node", label: "Node.js", icon: <Play className="w-4 h-4" /> },
    { key: "python", label: "Python 3", icon: <Search className="w-4 h-4" /> },
    { key: "adb", label: "ADB", icon: <Shield className="w-4 h-4" /> },
    { key: "fastboot", label: "Fastboot", icon: <Shield className="w-4 h-4" /> }
  ] as const;

  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl border border-slate-700 bg-slate-900/70 p-4 md:p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-50">Bobby Dev Arsenal</h2>
          <p className="text-xs text-slate-400">
            Private Creator Arsenal • Codespaces / Spark environment overview
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-100 hover:bg-slate-800"
          onClick={() => window.location.reload()}
        >
          <Play className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-500/60 bg-amber-900/30 px-3 py-2 text-xs text-amber-100">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <p className="text-xs text-slate-400 mb-3">
          Scanning your dev arsenal inside Codespaces...
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tools.map((t) => {
          const tool = (status.tools as any)[t.key] as ToolStatus;
          const ok = tool?.installed;
          return (
            <div
              key={t.key}
              className={`rounded-xl border px-3 py-3 text-xs ${
                ok
                  ? "border-emerald-600/70 bg-emerald-900/20"
                  : "border-rose-700/70 bg-rose-900/20"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {t.icon}
                  <span className="font-medium text-slate-50">{t.label}</span>
                </div>
                <span className={ok ? "text-emerald-300" : "text-rose-300"}>
                  {ok ? "FOUND" : "MISSING"}
                </span>
              </div>
              <div className="text-slate-200/80">
                {tool?.version && <p>Version: {tool.version}</p>}
                {t.key === "adb" && tool?.devices_raw && (
                  <pre className="mt-1 max-h-20 overflow-auto rounded bg-black/30 p-1 text-[10px] text-slate-200 whitespace-pre-wrap">
                    {tool.devices_raw}
                  </pre>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
