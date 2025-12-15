import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { generateEstimateForTicket } from "../services/estimateService";

const router = Router();
const prisma = new PrismaClient();

const VALID_STATUSES = [
  "intake",
  "diagnosing",
  "estimating",
  "approved",
  "repairing",
  "done",
  "cancelled",
];

router.get("/", async (req, res, next) => {
  try {
    const { status, limit } = req.query;

    const tickets = await prisma.ticket.findMany({
      where: status ? { status: String(status) } : undefined,
      include: {
        customer: true,
        device: true,
        diagnosticRuns: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
      take: limit ? parseInt(String(limit)) : 50,
    });

    res.json({ tickets });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        device: true,
        diagnosticRuns: {
          orderBy: { createdAt: "desc" },
          include: { findings: true },
        },
        parts: {
          include: { part: true },
        },
        labor: true,
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json(ticket);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { customerId, deviceId, issueSummary, notes } = req.body;

    if (!customerId || !deviceId) {
      return res
        .status(400)
        .json({ error: "customerId and deviceId are required" });
    }

    const ticket = await prisma.ticket.create({
      data: {
        customerId,
        deviceId,
        issueSummary,
        notes,
        status: "intake",
      },
      include: {
        customer: true,
        device: true,
      },
    });

    res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { status, issueSummary, notes } = req.body;

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(issueSummary !== undefined && { issueSummary }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        customer: true,
        device: true,
      },
    });

    res.json(ticket);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.ticket.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post("/:ticketId/estimate", async (req, res, next) => {
  try {
    const estimate = await generateEstimateForTicket(req.params.ticketId);
    res.json(estimate);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/diagnose", async (req, res, next) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: { device: true },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    if (!ticket.deviceId) {
      return res.status(400).json({ error: "No device attached to ticket" });
    }

    await prisma.ticket.update({
      where: { id: req.params.id },
      data: { status: "diagnosing" },
    });

    const { runAndroidDiagnosticForDevice } = await import("../services/diagnosticService");
    const result = await runAndroidDiagnosticForDevice(ticket.deviceId, ticket.id);

    res.json({
      runId: result.runId,
      ticketId: ticket.id,
      status: "completed",
      summary: result.summary,
      findingsCount: result.findingsCount,
      criticalCount: result.criticalCount,
      warningCount: result.warningCount,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
