import { Router } from "express";
import {
  runAndroidDiagnosticForDevice,
  getDiagnosticRun,
} from "../services/diagnosticService";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.post("/run", async (req, res, next) => {
  try {
    const { deviceId, ticketId } = req.body;

    if (!deviceId) {
      return res.status(400).json({ error: "deviceId is required" });
    }

    const result = await runAndroidDiagnosticForDevice(deviceId, ticketId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:runId", async (req, res, next) => {
  try {
    const run = await getDiagnosticRun(req.params.runId);
    if (!run) return res.status(404).json({ error: "Not found" });
    res.json(run);
  } catch (err) {
    next(err);
  }
});

router.get("/device/:deviceId", async (req, res, next) => {
  try {
    const runs = await prisma.diagnosticRun.findMany({
      where: { deviceId: req.params.deviceId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { findings: true },
    });

    res.json({ runs });
  } catch (err) {
    next(err);
  }
});

router.get("/device/:deviceId/latest", async (req, res, next) => {
  try {
    const run = await prisma.diagnosticRun.findFirst({
      where: { deviceId: req.params.deviceId },
      orderBy: { createdAt: "desc" },
      include: { findings: true, device: true },
    });

    if (!run) {
      return res.status(404).json({ error: "No diagnostics found for device" });
    }

    res.json(run);
  } catch (err) {
    next(err);
  }
});

export default router;
