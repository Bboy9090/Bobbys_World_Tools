import { Router, Request, Response } from "express";
import type { Router as ExpressRouter } from "express";
import { listReports } from "../db/store";

export const reportsRouter: ExpressRouter = Router();

reportsRouter.get("/", (_req: Request, res: Response) => {
  res.json(listReports());
});
