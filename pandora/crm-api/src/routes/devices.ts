import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req, res, next) => {
  try {
    const devices = await prisma.device.findMany({
      include: {
        customer: true,
        diagnosticRuns: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const devicesWithHistory = devices.map((d) => ({
      id: d.id,
      platform: d.platform,
      oem: d.oem,
      model: d.model,
      serial: d.serial,
      imei: d.imei,
      label: d.label,
      customer: d.customer
        ? { id: d.customer.id, name: d.customer.name }
        : null,
      lastDiagnostic: d.diagnosticRuns[0]?.createdAt || null,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));

    res.json({ devices: devicesWithHistory });
  } catch (err) {
    next(err);
  }
});

router.get("/poll", async (req, res, next) => {
  try {
    const devices = await prisma.device.findMany({
      include: {
        customer: true,
        tickets: {
          where: {
            status: { notIn: ["done", "cancelled"] },
          },
        },
        diagnosticRuns: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const devicesWithHistory = devices.map((d) => ({
      id: d.id,
      type: d.platform,
      model: d.model,
      manufacturer: d.oem,
      serial: d.serial,
      connected: true,
      locked: false,
      properties: {
        imei: d.imei || "",
        label: d.label || "",
      },
      unique_key: d.serial || d.imei || d.id,
      history: {
        has_history: d.diagnosticRuns.length > 0,
        last_seen: d.updatedAt.toISOString(),
        visit_count: d.diagnosticRuns.length,
        active_jobs: d.tickets.length,
      },
    }));

    res.json({ devices: devicesWithHistory });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const device = await prisma.device.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        diagnosticRuns: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { findings: true },
        },
        tickets: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    res.json(device);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { customerId, platform, oem, model, serial, imei, label } = req.body;

    if (!customerId || !platform) {
      return res
        .status(400)
        .json({ error: "customerId and platform are required" });
    }

    const device = await prisma.device.create({
      data: {
        customerId,
        platform,
        oem,
        model,
        serial,
        imei,
        label,
      },
      include: { customer: true },
    });

    res.status(201).json(device);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { platform, oem, model, serial, imei, label } = req.body;

    const device = await prisma.device.update({
      where: { id: req.params.id },
      data: {
        platform,
        oem,
        model,
        serial,
        imei,
        label,
      },
      include: { customer: true },
    });

    res.json(device);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.device.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/history", async (req, res, next) => {
  try {
    const diagnosticRuns = await prisma.diagnosticRun.findMany({
      where: { deviceId: req.params.id },
      orderBy: { createdAt: "desc" },
      include: { findings: true, ticket: true },
    });

    res.json({ history: diagnosticRuns });
  } catch (err) {
    next(err);
  }
});

export default router;
