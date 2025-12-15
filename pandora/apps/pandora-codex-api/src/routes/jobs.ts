import { Router, Request, Response } from "express";
import type { Router as ExpressRouter } from "express";
import { listJobs } from "../jobs/jobService";

export const jobsRouter: ExpressRouter = Router();

jobsRouter.get("/", (_req: Request, res: Response) => {
  res.json(listJobs());
});
