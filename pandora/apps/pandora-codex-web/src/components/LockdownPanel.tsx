import React from 'react';

interface LockdownIdentity {
  device_name?: string;
  product_type?: string;
  product_version?: string;
  build_version?: string;
  serial_number?: string;
  udid?: string;
}

interface LockdownActivation {
  activation_state?: string;
  activation_acked?: boolean;
}

interface LockdownBattery {
  current_capacity_pct?: number;
  is_charging?: boolean;
  cycle_count?: number;
  design_capacity_mah?: number;
  full_charge_capacity_mah?: number;
}

interface LockdownData {
  identity?: LockdownIdentity;
  activation?: LockdownActivation;
  battery?: LockdownBattery;
}

export const LockdownPanel: React.FC<{ lockdown: LockdownData }> = ({ lockdown }) => {
  const identity = lockdown.identity ?? {};
  const activation = lockdown.activation ?? {};
  const battery = lockdown.battery ?? {};

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {/* Identity */}
      <div className="bg-slate-900 border border-cyan-500/30 rounded-lg p-4">
        <h3 className="text-sm font-bold text-cyan-400 mb-3 uppercase tracking-wide">
          iOS Identity
        </h3>
        <div className="text-xs space-y-2 text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">Device Name:</span>
            <span className="text-cyan-300">{identity.device_name ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Product Type:</span>
            <span className="text-cyan-300">{identity.product_type ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">iOS Version:</span>
            <span className="text-cyan-300">{identity.product_version ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Build:</span>
            <span className="text-cyan-300">{identity.build_version ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Serial:</span>
            <span className="text-cyan-300 font-mono text-xs">{identity.serial_number ?? '—'}</span>
          </div>
          <div className="pt-2 border-t border-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-400">UDID:</span>
              <span className="text-cyan-300 font-mono text-xs break-all">{identity.udid ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activation */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-lg p-4">
        <h3 className="text-sm font-bold text-amber-400 mb-3 uppercase tracking-wide">
          Activation State
        </h3>
        <div className="text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">State:</span>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              activation.activation_state === 'Activated'
                ? 'bg-green-900/40 text-green-300'
                : activation.activation_state === 'Unactivated'
                ? 'bg-orange-900/40 text-orange-300'
                : 'bg-slate-700/40 text-slate-300'
            }`}>
              {activation.activation_state ?? '—'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Acknowledged:</span>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              activation.activation_acked === true
                ? 'bg-emerald-900/40 text-emerald-300'
                : activation.activation_acked === false
                ? 'bg-red-900/40 text-red-300'
                : 'bg-slate-700/40 text-slate-300'
            }`}>
              {activation.activation_acked != null ? String(activation.activation_acked) : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Battery */}
      <div className="bg-slate-900 border border-green-500/30 rounded-lg p-4">
        <h3 className="text-sm font-bold text-green-400 mb-3 uppercase tracking-wide">
          Battery Health
        </h3>
        <div className="text-xs space-y-2 text-slate-300">
          {battery.current_capacity_pct != null && (
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Level:</span>
                <span className="text-green-300 font-semibold">{battery.current_capacity_pct}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-400 h-1.5 rounded-full"
                  style={{ width: `${battery.current_capacity_pct}%` }}
                />
              </div>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-400">Charging:</span>
            <span className={battery.is_charging ? 'text-yellow-300' : 'text-slate-400'}>
              {battery.is_charging ? '⚡ Yes' : 'No'}
            </span>
          </div>
          {battery.cycle_count != null && (
            <div className="flex justify-between">
              <span className="text-slate-400">Cycles:</span>
              <span className="text-green-300">{battery.cycle_count}</span>
            </div>
          )}
          {battery.design_capacity_mah != null && (
            <div className="flex justify-between">
              <span className="text-slate-400">Design:</span>
              <span className="text-green-300">{battery.design_capacity_mah} mAh</span>
            </div>
          )}
          {battery.full_charge_capacity_mah != null && (
            <div className="flex justify-between">
              <span className="text-slate-400">Full Charge:</span>
              <span className="text-green-300">{battery.full_charge_capacity_mah} mAh</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
