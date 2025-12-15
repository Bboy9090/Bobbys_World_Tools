import { Router } from "express";
import { getDeviceHealthScore, getTicketHealthScore } from "../services/healthService";

const router = Router();

router.get("/device/:deviceId", async (req, res, next) => {
  try {
    const healthScore = await getDeviceHealthScore(req.params.deviceId);
    if (!healthScore) {
      return res.status(404).json({ error: "Device or diagnostics not found" });
    }
    res.json(healthScore);
  } catch (err) {
    next(err);
  }
});

router.get("/ticket/:ticketId", async (req, res, next) => {
  try {
    const healthScore = await getTicketHealthScore(req.params.ticketId);
    if (!healthScore) {
      return res.status(404).json({ error: "Ticket or diagnostics not found" });
    }
    res.json(healthScore);
  } catch (err) {
    next(err);
  }
});

export default router;
