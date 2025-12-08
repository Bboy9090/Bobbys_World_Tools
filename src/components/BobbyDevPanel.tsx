import { Play, Lock, Unlock, Search, Wrench, Shield, AlertTriangle } from 'lucide-react';

export function BobbyDevPanel() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl border border-slate-700 bg-slate-900/70 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 flex items-center gap-2">
            <Wrench className="w-5 h-5 inline mr-2" />
            Bobby Dev Panel
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Private Creator Arsenal • Pandora Codex Development Environment
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Play className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-slate-100">Quick Actions</h3>
          </div>
          <div className="space-y-2 text-sm text-slate-300">
            <p>• Development server ready</p>
            <p>• Arsenal tools detected</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-slate-100">Security Status</h3>
          </div>
          <div className="space-y-2 text-sm text-slate-300">
            <p>• Environment isolated</p>
            <p>• Tools initialized</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-purple-400" />
            <h3 className="font-semibold text-slate-100">Analysis Tools</h3>
          </div>
          <div className="space-y-2 text-sm text-slate-300">
            <p>• Code scanning ready</p>
            <p>• Diagnostics available</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-slate-100">System Alerts</h3>
          </div>
          <div className="space-y-2 text-sm text-slate-300">
            <p>• No critical issues</p>
            <p>• All systems nominal</p>
          </div>
        </div>
      </div>
    </div>
  );
}
