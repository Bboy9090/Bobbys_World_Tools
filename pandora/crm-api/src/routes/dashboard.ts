import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/stats", async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalDevices,
      totalCustomers,
      totalTickets,
      activeTickets,
      completedTickets,
      diagnosticsToday,
      ticketsToday,
      recentDiagnostics,
    ] = await Promise.all([
      prisma.device.count(),
      prisma.customer.count(),
      prisma.ticket.count(),
      prisma.ticket.count({
        where: { status: { notIn: ["done", "cancelled"] } },
      }),
      prisma.ticket.count({ where: { status: "done" } }),
      prisma.diagnosticRun.count({
        where: { createdAt: { gte: today } },
      }),
      prisma.ticket.count({
        where: { createdAt: { gte: today } },
      }),
      prisma.diagnosticRun.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          device: true,
          findings: true,
        },
      }),
    ]);

    const completionRate =
      totalTickets > 0
        ? Math.round((completedTickets / totalTickets) * 1000) / 10
        : 0;

    res.json({
      devices: {
        total: totalDevices,
        connected: 0,
      },
      customers: {
        total: totalCustomers,
      },
      tickets: {
        total: totalTickets,
        active: activeTickets,
        completed: completedTickets,
        today: ticketsToday,
      },
      diagnostics: {
        today: diagnosticsToday,
        completionRate,
      },
      recentDiagnostics: recentDiagnostics.map((d) => ({
        id: d.id,
        deviceModel: d.device?.model || "Unknown",
        platform: d.device?.platform || "unknown",
        findingsCount: d.findings.length,
        criticalCount: d.findings.filter((f) => f.level === "critical").length,
        createdAt: d.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/recent-activity", async (req, res, next) => {
  try {
    const [recentTickets, recentDiagnostics] = await Promise.all([
      prisma.ticket.findMany({
        orderBy: { updatedAt: "desc" },
        take: 10,
        include: {
          customer: true,
          device: true,
        },
      }),
      prisma.diagnosticRun.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          device: true,
          ticket: true,
        },
      }),
    ]);

    const activity = [
      ...recentTickets.map((t) => ({
        type: "ticket",
        id: t.id,
        status: t.status,
        customer: t.customer?.name,
        device: t.device?.model,
        timestamp: t.updatedAt,
      })),
      ...recentDiagnostics.map((d) => ({
        type: "diagnostic",
        id: d.id,
        device: d.device?.model,
        ticketId: d.ticketId,
        timestamp: d.createdAt,
      })),
    ].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    res.json({ activity: activity.slice(0, 15) });
  } catch (err) {
    next(err);
  }
});

export default router;
