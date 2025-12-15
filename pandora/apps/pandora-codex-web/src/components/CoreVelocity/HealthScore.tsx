/**
 * HealthScore - Visual health score display with ring gauge
 * Part of Core Velocity Design System
 */

import React from "react";

interface HealthScoreData {
  overall: number;
  battery: number;
  security: number;
  performance: number;
  sensors: number;
  timestamp: string;
}

interface HealthScoreProps {
  score: HealthScoreData;
  compact?: boolean;
}

export const HealthScore: React.FC<HealthScoreProps> = ({ score, compact = false }) => {
  const getHealthColor = (value: number): string => {
    if (value >= 85) return "#00ff88";
    if (value >= 70) return "#15E2FF";
    if (value >= 55) return "#eab308";
    return "#ef4444";
  };

  const getHealthBadge = (value: number): { label: string; class: string } => {
    if (value >= 85) return { label: "EXCELLENT", class: "bg-green-500/20 text-green-400 border-green-500/40" };
    if (value >= 70) return { label: "GOOD", class: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40" };
    if (value >= 55) return { label: "FAIR", class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40" };
    return { label: "CRITICAL", class: "bg-red-500/20 text-red-400 border-red-500/40" };
  };

  const badge = getHealthBadge(score.overall);
  const ringColor = getHealthColor(score.overall);
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = `${(score.overall / 100) * circumference} ${circumference}`;

  const subScores = [
    { label: "Battery", value: score.battery, icon: "🔋" },
    { label: "Security", value: score.security, icon: "🛡️" },
    { label: "Performance", value: score.performance, icon: "⚡" },
    { label: "Sensors", value: score.sensors, icon: "📡" },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={ringColor}
              strokeWidth="6"
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-white">{score.overall}%</span>
          </div>
        </div>
        <div>
          <span className={`px-2 py-1 rounded text-xs font-bold border ${badge.class}`}>
            {badge.label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Health Ring */}
      <div className="flex justify-center py-2">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
            />
            {/* Progress ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={ringColor}
              strokeWidth="8"
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
              style={{
                filter: `drop-shadow(0 0 6px ${ringColor})`,
              }}
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{score.overall}%</span>
            <span className="text-xs text-dark-muted font-tech mt-1">HEALTH</span>
          </div>
        </div>
      </div>

      {/* Badge */}
      <div className="flex justify-center">
        <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${badge.class}`}>
          {badge.label}
        </span>
      </div>

      {/* Sub-scores Grid */}
      <div className="grid grid-cols-2 gap-2">
        {subScores.map((sub) => (
          <div
            key={sub.label}
            className="bg-grimoire-obsidian/50 border border-grimoire-electric-blue/20 rounded-lg p-3 hover:border-grimoire-electric-blue/40 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{sub.icon}</span>
              <span className="text-xs text-dark-muted font-tech">{sub.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-grimoire-obsidian rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${sub.value}%`,
                    backgroundColor: getHealthColor(sub.value),
                  }}
                />
              </div>
              <span className="text-sm font-bold text-white w-10 text-right">{sub.value}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Timestamp */}
      <div className="text-xs text-dark-muted text-center font-tech">
        Last checked: {new Date(score.timestamp).toLocaleString()}
      </div>
    </div>
  );
};

export default HealthScore;
