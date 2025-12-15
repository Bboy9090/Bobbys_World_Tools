import { Router } from "express";
import { PrismaClient } from "@prisma/client";

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
    const { status, customerId, deviceId } = req.query;

    const tickets = await prisma.ticket.findMany({
      where: {
        ...(status && { status: String(status) }),
        ...(customerId && { customerId: String(customerId) }),
        ...(deviceId && { deviceId: String(deviceId) }),
      },
      include: {
        customer: true,
        device: true,
        diagnosticRuns: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    res.json({ tickets });
  } catch (err) {
    next(err);
  }
});

router.get("/active", async (req, res, next) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        status: { notIn: ["done", "cancelled"] },
      },
      include: {
        customer: true,
        device: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    res.json({ tickets });
  } catch (err) {
    next(err);
  }
});

router.get("/stats", async (req, res, next) => {
  try {
    const [total, active, completed, intake, diagnosing, repairing] =
      await Promise.all([
        prisma.ticket.count(),
        prisma.ticket.count({
          where: { status: { notIn: ["done", "cancelled"] } },
        }),
        prisma.ticket.count({ where: { status: "done" } }),
        prisma.ticket.count({ where: { status: "intake" } }),
        prisma.ticket.count({ where: { status: "diagnosing" } }),
        prisma.ticket.count({ where: { status: "repairing" } }),
      ]);

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      total,
      active,
      completed,
      intake,
      diagnosing,
      repairing,
      completionRate,
    });
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

router.post("/:id/transition", async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: { status },
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

router.post("/:id/parts", async (req, res, next) => {
  try {
    const { partId, quantity, linePriceCents } = req.body;

    const ticketPart = await prisma.ticketPart.create({
      data: {
        ticketId: req.params.id,
        partId,
        quantity: quantity || 1,
        linePriceCents,
      },
      include: { part: true },
    });

    res.status(201).json(ticketPart);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/labor", async (req, res, next) => {
  try {
    const { description, minutes, rateCents, linePriceCents } = req.body;

    const ticketLabor = await prisma.ticketLabor.create({
      data: {
        ticketId: req.params.id,
        description,
        minutes,
        rateCents,
        linePriceCents,
      },
    });

    res.status(201).json(ticketLabor);
  } catch (err) {
    next(err);
  }
});

export default router;
