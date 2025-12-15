import 'dotenv/config';
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import diagnosticsRouter from "./routes/diagnostics";
import aiRouter from "./routes/ai";
import ticketsRouter from "./routes/tickets";
import healthRouter from "./routes/health";
import devicesRouter from "./routes/devices";
import customersRouter from "./routes/customers";
import jobsRouter from "./routes/jobs";
import dashboardRouter from "./routes/dashboard";
import devmodeRouter from "./routes/devmode";
import bobbyDevRouter from "./routes/bobby-dev";

const app = express();

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/diagnostics", diagnosticsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/tickets", ticketsRouter);
app.use("/api/health", healthRouter);
app.use("/api/devices", devicesRouter);
app.use("/api/customers", customersRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/devmode", devmodeRouter);
app.use("/api/bobby-dev", bobbyDevRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "crm-api", version: "1.0.0" });
});

const frontendPath = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, "../public")
  : path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendPath));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[CRM API Error]", err.message);
  res.status(500).json({ 
    error: err.message || "Internal server error",
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(Number(PORT), HOST, () => {
  console.log(`[CRM API] Listening on ${HOST}:${PORT}`);
  console.log(`[CRM API] Serving frontend from: ${frontendPath}`);
  console.log(`[CRM API] Routes: /api/diagnostics, /api/devices, /api/customers, /api/jobs, /api/dashboard, /api/devmode, /api/bobby-dev, /api/health, /api/ai, /api/tickets`);
  console.log(`[Bobby Dev] Private arsenal API available at /api/bobby-dev/*`);
});
