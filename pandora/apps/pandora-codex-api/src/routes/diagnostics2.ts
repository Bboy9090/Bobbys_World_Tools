import { Router, Request, Response } from "express";
import type { Router as ExpressRouter } from "express";
import { startAndroidLogcatJob } from "../jobs/diagnosticJobs";

export const diagnosticsRouter2: ExpressRouter = Router();

diagnosticsRouter2.post("/android/logcat", (req: Request, res: Response) => {
  const { deviceId } = req.body as { deviceId: string };
  if (!deviceId) return res.status(400).json({ error: "deviceId required" });
  res.json(startAndroidLogcatJob(deviceId));
});
