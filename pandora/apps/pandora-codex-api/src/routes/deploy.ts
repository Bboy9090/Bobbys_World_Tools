import { Router, Request, Response } from "express";
import type { Router as ExpressRouter } from "express";
import { createJob, patchJob } from "../jobs/jobService";

export const deployRouter: ExpressRouter = Router();

// In-memory plans for now (SQLite later if you want)
const plans = new Map<string, any>();

deployRouter.post("/plan", (req: Request, res: Response) => {
  const { imageId, targetId } = req.body as { imageId: string; targetId: string };
  if (!imageId || !targetId) return res.status(400).json({ error: "imageId and targetId required" });

  const planId = `plan-${Date.now()}`;
  const plan = {
    planId,
    imageId,
    targetId,
    warning: "This operation may erase the target disk. You must confirm to execute.",
    requiredConfirm: "ERASE_AND_INSTALL"
  };
  plans.set(planId, plan);
  res.json(plan);
});

deployRouter.post("/execute", (req: Request, res: Response) => {
  const { planId, confirm } = req.body as { planId: string; confirm: string };
  const plan = plans.get(planId);
  if (!plan) return res.status(404).json({ error: "plan not found" });
  if (confirm !== "ERASE_AND_INSTALL") {
    return res.status(400).json({ error: "confirmation required", requiredConfirm: "ERASE_AND_INSTALL" });
  }

  // Framework job now; wire to BootForge later when you decide exact safe operation APIs.
  const job = createJob("bootforge", `deploy:${plan.imageId}->${plan.targetId}`);
  patchJob(job.id, { status: "running", startedAt: new Date().toISOString(), progress: 15, message: "Deployment framework started (wire to BootForge next)." });

  // No fake success: mark manual intervention until bridged to real BootForge deploy.
  patchJob(job.id, { status: "failed", finishedAt: new Date().toISOString(), error: "manual_intervention_required: connect this job to a BootForge allowlisted deploy command." });

  res.json(job);
});
