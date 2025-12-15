/**
 * Diagnostics Engine - TITAN 3
 * Safe log collection, pattern detection, and repair report generation
 */

import {
  DiagnosticPattern,
  DiagnosticFinding,
  RepairReport,
} from '@pandora-codex/shared-types';

const DIAGNOSTIC_PATTERNS: DiagnosticPattern[] = [
  {
    id: 'thermal-001',
    name: 'High Temperature Warning',
    category: 'thermal',
    severity: 'high',
    pattern: /temperature.*(?:critical|high|overheat)/i,
    description: 'Device is experiencing thermal issues',
    recommendations: [
      'Allow device to cool down',
      'Check for blocked ventilation',
      'Inspect thermal paste and cooling system',
    ],
  },
  {
    id: 'storage-001',
    name: 'Low Storage Space',
    category: 'storage',
    severity: 'medium',
    pattern: /storage.*(?:full|low|critical)/i,
    description: 'Device storage is nearly full',
    recommendations: ['Delete unnecessary files', 'Clear cache', 'Move data to external storage'],
  },
  {
    id: 'battery-001',
    name: 'Battery Health Degraded',
    category: 'battery',
    severity: 'medium',
    pattern: /battery.*(?:degraded|health|worn)/i,
    description: 'Battery capacity has degraded',
    recommendations: ['Replace battery if health < 80%', 'Calibrate battery'],
  },
  {
    id: 'crash-001',
    name: 'Boot Loop Detected',
    category: 'crash_loop',
    severity: 'critical',
    pattern: /(?:boot.*loop|restart.*cycle|panic.*reboot)/i,
    description: 'Device is stuck in a boot loop',
    recommendations: ['Boot into safe mode', 'Clear cache partition', 'Factory reset if necessary'],
  },
];

export class DiagnosticsEngine {
  private reports: Map<string, RepairReport> = new Map();

  analyzeLogs(deviceId: string, logs: string[]): DiagnosticFinding[] {
    const findings: DiagnosticFinding[] = [];

    for (const pattern of DIAGNOSTIC_PATTERNS) {
      const matches = logs.filter((log) => {
        if (typeof pattern.pattern === 'string') {
          return log.includes(pattern.pattern);
        }
        return pattern.pattern.test(log);
      });

      if (matches.length > 0) {
        findings.push({
          id: `finding-${pattern.id}-${Date.now()}`,
          patternId: pattern.id,
          category: pattern.category,
          severity: pattern.severity,
          title: pattern.name,
          description: pattern.description,
          evidence: matches.slice(0, 5),
          recommendations: pattern.recommendations,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return findings;
  }

  generateReport(deviceId: string, findings: DiagnosticFinding[], deviceInfo: any, metrics: any): RepairReport {
    const reportId = `report-${Date.now()}-${deviceId}`;

    const summary = {
      total: findings.length,
      critical: findings.filter((f) => f.severity === 'critical').length,
      high: findings.filter((f) => f.severity === 'high').length,
      medium: findings.filter((f) => f.severity === 'medium').length,
      low: findings.filter((f) => f.severity === 'low').length,
      info: findings.filter((f) => f.severity === 'info').length,
    };

    const allRecommendations = new Set<string>();
    findings.forEach((f) => f.recommendations.forEach((r) => allRecommendations.add(r)));

    const nextSteps: string[] = [];
    if (summary.critical > 0) {
      nextSteps.push('URGENT: Address critical issues immediately');
    }
    if (summary.total === 0) {
      nextSteps.push('No issues detected - device is healthy');
    }

    const report: RepairReport = {
      id: reportId,
      deviceId,
      generatedAt: new Date().toISOString(),
      duration: 0,
      findings,
      summary,
      recommendations: Array.from(allRecommendations),
      nextSteps,
      reportData: {
        deviceInfo,
        logs: { system: [], kernel: [], application: [] },
        metrics,
      },
    };

    this.reports.set(reportId, report);
    return report;
  }

  getReport(reportId: string): RepairReport | undefined {
    return this.reports.get(reportId);
  }

  async collectLogs(deviceId: string): Promise<string[]> {
    // Mock implementation for safety
    return [
      '[INFO] Device initialized',
      '[WARN] Temperature reading: 85°C (high)',
      '[INFO] Storage: 95% used',
      '[ERROR] Battery health: 78% (degraded)',
      '[INFO] System uptime: 48 hours',
    ];
  }
}

export const diagnosticsEngine = new DiagnosticsEngine();
