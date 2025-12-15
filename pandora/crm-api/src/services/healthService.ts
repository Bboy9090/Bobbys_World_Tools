import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface HealthScore {
  overall: number;
  battery: number;
  security: number;
  performance: number;
  sensors: number;
  timestamp: string;
}

export async function getDeviceHealthScore(deviceId: string): Promise<HealthScore | null> {
  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    include: {
      diagnosticRuns: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { findings: true },
      },
    },
  });

  if (!device || device.diagnosticRuns.length === 0) {
    return null;
  }

  const run = device.diagnosticRuns[0];
  const findings = run.findings;

  let batteryScore = 75;
  let securityScore = 85;
  let performanceScore = 80;
  let sensorScore = 80;

  // Battery scoring from findings
  const batteryHealthFinding = findings.find(f => f.code === "BATTERY_HEALTH");
  if (batteryHealthFinding) {
    try {
      const data = JSON.parse(batteryHealthFinding.message);
      if (data.percent_estimate) {
        batteryScore = Math.max(20, Math.min(data.percent_estimate, 100));
      }
    } catch (e) {
      // Use default
    }
  }

  // Security scoring
  const securityIssues = findings.filter(f => f.level === "error" && f.source?.includes("security"));
  if (securityIssues.length > 0) {
    securityScore = Math.max(60, 85 - securityIssues.length * 10);
  }

  // Performance scoring
  const perfDegraded = findings.some(f => f.code === "PERF_DEGRADED");
  if (perfDegraded) {
    performanceScore = 65;
  }

  // Sensor scoring
  const deadSensors = findings.filter(f => f.code === "SENSOR_DEAD").length;
  if (deadSensors > 0) {
    sensorScore = Math.max(60, 90 - deadSensors * 15);
  }

  // Weighted overall
  const weights = {
    battery: 0.35,
    security: 0.30,
    performance: 0.20,
    sensors: 0.15,
  };

  const overall = Math.round(
    batteryScore * weights.battery +
    securityScore * weights.security +
    performanceScore * weights.performance +
    sensorScore * weights.sensors
  );

  return {
    overall,
    battery: batteryScore,
    security: securityScore,
    performance: performanceScore,
    sensors: sensorScore,
    timestamp: run.createdAt.toISOString(),
  };
}

export async function getTicketHealthScore(ticketId: string): Promise<HealthScore | null> {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { device: true },
  });

  if (!ticket || !ticket.device) {
    return null;
  }

  return getDeviceHealthScore(ticket.device.id);
}
