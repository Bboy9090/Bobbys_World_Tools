import { useEffect, useState } from 'react';
import { Wrench, Monitor } from 'lucide-react';

export function BobbyDevPanel() {
  const [browserInfo, setBrowserInfo] = useState({
    name: '',
    version: '',
    platform: ''
  });

  useEffect(() => {
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = '';

    if (userAgent.indexOf('Firefox') > -1) {
      browserName = 'Firefox';
      browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || '';
    } else if (userAgent.indexOf('Chrome') > -1) {
      browserName = 'Chrome';
      browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || '';
    } else if (userAgent.indexOf('Safari') > -1) {
      browserName = 'Safari';
      browserVersion = userAgent.match(/Version\/([0-9.]+)/)?.[1] || '';
    } else if (userAgent.indexOf('Edge') > -1) {
      browserName = 'Edge';
      browserVersion = userAgent.match(/Edg\/([0-9.]+)/)?.[1] || '';
    }

    setBrowserInfo({
      name: browserName,
      version: browserVersion,
      platform: navigator.platform
    });
  }, []);

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
            <Monitor className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-slate-100">Browser Environment</h3>
          </div>
          <div className="space-y-2 text-sm text-slate-300">
            {browserInfo.name && <p>• Browser: {browserInfo.name} {browserInfo.version}</p>}
            {browserInfo.platform && <p>• Platform: {browserInfo.platform}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
