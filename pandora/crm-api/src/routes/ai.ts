import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { aiDiagnoseAndroid } from "../services/aiService";

const router = Router();
const prisma = new PrismaClient();

router.post("/diagnose", async (req, res, next) => {
  try {
    const { diagnosticRunId } = req.body;
    const run = await prisma.diagnosticRun.findUnique({
      where: { id: diagnosticRunId },
      include: { findings: true, device: true },
    });
    if (!run || !run.device) throw new Error("Run or device not found");
    if (run.device.platform !== "android") {
      return res.status(400).json({ error: "Only android supported" });
    }
    const aiResult = await aiDiagnoseAndroid({
      platform: "android",
      findings: run.findings,
    });
    res.json(aiResult);
  } catch (err) {
    next(err);
  }
});

export default router;
