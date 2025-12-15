import { DiagnosticFinding } from "@prisma/client";

interface AIInput {
  platform: "android" | "ios";
  findings: DiagnosticFinding[];
}

interface AIOutput {
  likely_root_cause: string;
  secondary_causes: string[];
  confidence: number;
  recommended_actions: string[];
  notes_for_technician: string;
}

export async function aiDiagnoseAndroid(input: AIInput): Promise<AIOutput> {
  const findings = input.findings;
  const hasStorageFull = findings.some(f => f.code === "STORAGE_NEAR_FULL");
  const hasStorageHigh = findings.some(f => f.code === "STORAGE_HIGH_USAGE");
  const hasBatteryOverheat = findings.some(f => f.code === "BATTERY_OVERHEATING");
  const hasBatteryHot = findings.some(f => f.code === "BATTERY_HOT");

  let root = "unknown";
  const secondary: string[] = [];
  let confidence = 0.4;
  const actions: string[] = [];

  if (hasStorageFull) {
    root = "storage_full";
    confidence = 0.85;
    actions.push(
      "Advise full backup of user data.",
      "Free up storage or perform factory reset.",
      "If system is unstable, reflash stock firmware after backup."
    );
  } else if (hasStorageHigh) {
    root = "storage_congestion";
    confidence = 0.7;
    actions.push(
      "Remove unused apps and media.",
      "Clear app caches / temp data.",
      "Educate customer about storage thresholds."
    );
  }

  if (hasBatteryOverheat || hasBatteryHot) {
    if (root === "unknown") {
      root = "battery_overheating";
      confidence = 0.8;
    } else {
      secondary.push("battery_overheating");
    }
    actions.push(
      "Test device off-case on a flat surface.",
      "Run without heavy apps to see if overheating persists.",
      "Recommend battery replacement if temps stay high."
    );
  }

  if (root === "unknown") {
    actions.push("Run additional diagnostics (logs, CPU, apps).");
  }

  return {
    likely_root_cause: root,
    secondary_causes: secondary,
    confidence,
    recommended_actions: actions,
    notes_for_technician: "Rules-based AI stub. Replace with real model later using same format."
  };
}
