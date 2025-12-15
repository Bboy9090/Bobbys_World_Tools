import { Router, Request, Response } from "express";
import type { Router as ExpressRouter } from "express";
import { execSync } from "node:child_process";

export const devicesRouter2: ExpressRouter = Router();

function safeExec(cmd: string): string | null {
  try { return execSync(cmd, { encoding: "utf-8" }); } catch { return null; }
}

interface SimpleDevice {
  id: string;
  platform: "android" | "ios";
  mode: "normal" | "fastboot" | "recovery";
}

devicesRouter2.get("/", (_req: Request, res: Response) => {
  const out: SimpleDevice[] = [];

  const adb = safeExec("adb devices -l");
  if (adb) {
    adb.split("\n").forEach((line) => {
      if (!line.includes("\tdevice")) return;
      const id = line.split(/\s+/)[0];
      out.push({ id, platform: "android", mode: "normal" });
    });
  }

  const fb = safeExec("fastboot devices");
  if (fb) {
    fb.split("\n").forEach((line) => {
      if (!line.trim()) return;
      const id = line.split(/\s+/)[0];
      out.push({ id, platform: "android", mode: "fastboot" });
    });
  }

  res.json(out);
});
