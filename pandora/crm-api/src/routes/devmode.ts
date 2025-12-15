import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const router = Router();
const prisma = new PrismaClient();

const BRAND_PROFILES: Record<string, any> = {
  samsung: {
    id: "samsung",
    name: "Samsung Galaxy",
    brand: "Samsung",
    notes: "Uses Odin for flashing. No fastboot support.",
    debloatPackages: [
      "com.samsung.android.bixby.agent",
      "com.samsung.android.visionintelligence",
      "com.samsung.android.app.spage",
      "com.samsung.android.game.gamehome",
      "com.samsung.android.ardrawing",
      "com.samsung.android.aremoji",
    ],
    thermalPaths: [
      "/sys/class/thermal/thermal_zone0/temp",
      "/sys/devices/virtual/thermal/thermal_zone0/temp",
    ],
    batteryPaths: [
      "/sys/class/power_supply/battery/capacity",
      "/sys/class/power_supply/battery/health",
      "/sys/class/power_supply/battery/cycle_count",
    ],
  },
  pixel: {
    id: "pixel",
    name: "Google Pixel",
    brand: "Google",
    notes: "Full fastboot support. Use Android Flash Tool for factory images.",
    debloatPackages: [
      "com.google.android.apps.magazines",
      "com.google.android.videos",
      "com.google.android.music",
      "com.google.android.apps.docs",
      "com.google.android.apps.tachyon",
    ],
    thermalPaths: ["/sys/class/thermal/thermal_zone0/temp"],
    batteryPaths: [
      "/sys/class/power_supply/battery/capacity",
      "/sys/class/power_supply/battery/health",
    ],
  },
  motorola: {
    id: "motorola",
    name: "Motorola/Lenovo",
    brand: "Motorola",
    notes: "Bootloader unlock requires carrier approval. Use Rescue and Smart Assistant.",
    debloatPackages: [
      "com.motorola.ccc.mainplm",
      "com.motorola.genie",
      "com.motorola.help",
      "com.motorola.demo",
      "com.motorola.moto",
    ],
    thermalPaths: [
      "/sys/class/thermal/thermal_zone0/temp",
      "/sys/devices/virtual/thermal/thermal_zone*/temp",
    ],
    batteryPaths: ["/sys/class/power_supply/battery/capacity"],
  },
  xiaomi: {
    id: "xiaomi",
    name: "Xiaomi/Redmi/POCO",
    brand: "Xiaomi",
    notes: "Requires Mi Unlock Tool. 7-day waiting period for bootloader unlock.",
    debloatPackages: [
      "com.miui.analytics",
      "com.xiaomi.mipicks",
      "com.miui.cloudbackup",
      "com.miui.weather2",
      "com.miui.videoplayer",
      "com.miui.player",
    ],
    thermalPaths: ["/sys/class/thermal/thermal_zone0/temp"],
    batteryPaths: ["/sys/class/power_supply/battery/capacity"],
  },
  oneplus: {
    id: "oneplus",
    name: "OnePlus",
    brand: "OnePlus",
    notes: "Easy bootloader unlock. OxygenOS or ColorOS depending on region.",
    debloatPackages: [
      "com.oneplus.card",
      "com.oneplus.membership",
      "com.heytap.browser",
      "com.heytap.music",
    ],
    thermalPaths: ["/sys/class/thermal/thermal_zone0/temp"],
    batteryPaths: ["/sys/class/power_supply/battery/capacity"],
  },
  generic: {
    id: "generic",
    name: "Generic Android",
    brand: "AOSP",
    notes: "Standard Android device. Check manufacturer for specific tools.",
    debloatPackages: [],
    thermalPaths: ["/sys/class/thermal/thermal_zone0/temp"],
    batteryPaths: ["/sys/class/power_supply/battery/capacity"],
  },
};

const MODULES = {
  dossier: {
    name: "Device Dossier",
    description: "Identity, build info, hardware specs, battery status",
    commands: [
      "adb shell getprop ro.product.model",
      "adb shell getprop ro.product.brand",
      "adb shell getprop ro.build.fingerprint",
      "adb shell getprop ro.serialno",
      "adb shell dumpsys battery",
      "adb shell cat /proc/meminfo | head -5",
    ],
  },
  warhammer: {
    name: "Debloat Warhammer",
    description: "Remove bloatware packages",
    commands: ["adb shell pm list packages -3", "adb shell pm list packages -s"],
  },
  darklab: {
    name: "Dark Lab",
    description: "Thermal monitoring, I/O stress, CPU benchmarks",
    commands: [
      "adb shell cat /sys/class/thermal/thermal_zone0/temp",
      "adb shell dumpsys cpuinfo | head -20",
      "adb shell cat /proc/stat | head -5",
    ],
  },
  forbidden: {
    name: "Forbidden Chamber",
    description: "Security status, encryption, bootloader state",
    commands: [
      "adb shell getprop ro.boot.verifiedbootstate",
      "adb shell getprop ro.boot.flash.locked",
      "adb shell getprop ro.crypto.state",
      "adb shell settings get secure android_id",
    ],
  },
  fastboot: {
    name: "Fastboot Arsenal",
    description: "Bootloader operations and flash commands",
    commands: [
      "fastboot devices",
      "fastboot getvar all",
      "fastboot oem device-info",
    ],
  },
  recovery: {
    name: "Recovery Ops",
    description: "Recovery mode operations and sideloading",
    commands: [
      "adb reboot recovery",
      "adb sideload",
      "adb reboot bootloader",
    ],
  },
};

router.get("/profiles", async (req, res, next) => {
  try {
    const profiles = Object.values(BRAND_PROFILES).map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      notes: p.notes,
    }));
    res.json({ profiles });
  } catch (err) {
    next(err);
  }
});

router.get("/profiles/:id", async (req, res, next) => {
  try {
    const profile = BRAND_PROFILES[req.params.id];
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

router.get("/modules", async (req, res, next) => {
  try {
    const modules = Object.entries(MODULES).map(([id, m]) => ({
      id,
      name: m.name,
      description: m.description,
    }));
    res.json({ modules });
  } catch (err) {
    next(err);
  }
});

router.post("/run", async (req, res, next) => {
  try {
    const { profileId, moduleId, deviceSerial } = req.body;

    const profile = BRAND_PROFILES[profileId] || BRAND_PROFILES.generic;
    const module = MODULES[moduleId as keyof typeof MODULES];

    if (!module) {
      return res.status(400).json({ error: "Invalid module" });
    }

    const output: string[] = [];
    output.push(`=== BOBBY DEV MODE ===`);
    output.push(`Profile: ${profile.name}`);
    output.push(`Brand: ${profile.brand}`);
    output.push(`Notes: ${profile.notes}`);
    output.push(``);
    output.push(`########## MODULE: ${module.name.toUpperCase()} ##########`);
    output.push(``);

    for (const cmd of module.commands) {
      output.push(`$ ${cmd}`);

      if (deviceSerial) {
        try {
          const targetCmd = cmd.replace("adb ", `adb -s ${deviceSerial} `);
          const { stdout, stderr } = await execAsync(targetCmd, {
            timeout: 10000,
          });
          output.push(stdout || stderr || "(no output)");
        } catch (err: any) {
          output.push(`[ERROR] ${err.message || "Command failed"}`);
        }
      } else {
        output.push(`[SIMULATION] No device connected - showing command only`);
      }
      output.push(``);
    }

    if (moduleId === "warhammer" && profile.debloatPackages.length > 0) {
      output.push(`\n--- Debloat Targets for ${profile.brand} ---`);
      for (const pkg of profile.debloatPackages) {
        output.push(`  pm uninstall -k --user 0 ${pkg}`);
      }
    }

    res.json({
      profile: profileId,
      module: moduleId,
      output: output.join("\n"),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

router.post("/adb", async (req, res, next) => {
  try {
    const { command, deviceSerial } = req.body;

    if (!command) {
      return res.status(400).json({ error: "Command is required" });
    }

    const sanitized = command
      .replace(/[;&|`$]/g, "")
      .replace(/\.\./g, "")
      .trim();

    if (!sanitized.startsWith("adb") && !sanitized.startsWith("fastboot")) {
      return res.status(400).json({ error: "Only adb/fastboot commands allowed" });
    }

    let targetCmd = sanitized;
    if (deviceSerial && sanitized.startsWith("adb ")) {
      targetCmd = sanitized.replace("adb ", `adb -s ${deviceSerial} `);
    }

    try {
      const { stdout, stderr } = await execAsync(targetCmd, { timeout: 30000 });
      res.json({
        success: true,
        command: targetCmd,
        output: stdout || stderr || "(no output)",
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.json({
        success: false,
        command: targetCmd,
        error: err.message || "Command failed",
        output: err.stderr || "",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    next(err);
  }
});

router.post("/debloat", async (req, res, next) => {
  try {
    const { profileId, deviceSerial, packages } = req.body;

    const profile = BRAND_PROFILES[profileId] || BRAND_PROFILES.generic;
    const targetPackages = packages || profile.debloatPackages;

    const results: { pkg: string; success: boolean; message: string }[] = [];

    for (const pkg of targetPackages) {
      const cmd = deviceSerial
        ? `adb -s ${deviceSerial} shell pm uninstall -k --user 0 ${pkg}`
        : `adb shell pm uninstall -k --user 0 ${pkg}`;

      try {
        const { stdout, stderr } = await execAsync(cmd, { timeout: 10000 });
        results.push({
          pkg,
          success: true,
          message: stdout || stderr || "Success",
        });
      } catch (err: any) {
        results.push({
          pkg,
          success: false,
          message: err.message || "Failed",
        });
      }
    }

    res.json({
      profile: profileId,
      results,
      successCount: results.filter((r) => r.success).length,
      failCount: results.filter((r) => !r.success).length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/devices", async (req, res, next) => {
  try {
    const { stdout } = await execAsync("adb devices -l", { timeout: 5000 });

    const lines = stdout.split("\n").slice(1);
    const devices = lines
      .filter((l) => l.trim() && !l.includes("offline"))
      .map((line) => {
        const parts = line.split(/\s+/);
        const serial = parts[0];
        const props: Record<string, string> = {};

        for (const p of parts.slice(2)) {
          const [key, val] = p.split(":");
          if (key && val) props[key] = val;
        }

        return {
          serial,
          status: parts[1],
          model: props.model || "Unknown",
          device: props.device || "Unknown",
          product: props.product || "Unknown",
        };
      });

    res.json({ devices });
  } catch (err: any) {
    res.json({
      devices: [],
      error: err.message || "ADB not available",
    });
  }
});

router.get("/devices/ios", async (req, res, next) => {
  try {
    const { stdout } = await execAsync("idevice_id -l", { timeout: 5000 });
    const udids = stdout.split("\n").filter((l) => l.trim());

    const devices = [];
    for (const udid of udids) {
      try {
        const { stdout: info } = await execAsync(`ideviceinfo -u ${udid} -k ProductType`, { timeout: 3000 });
        const { stdout: name } = await execAsync(`ideviceinfo -u ${udid} -k DeviceName`, { timeout: 3000 });
        devices.push({
          udid: udid.trim(),
          platform: "ios",
          model: info.trim() || "Unknown",
          name: name.trim() || "Unknown",
          status: "connected",
        });
      } catch {
        devices.push({
          udid: udid.trim(),
          platform: "ios",
          model: "Unknown",
          name: "Unknown",
          status: "connected",
        });
      }
    }

    res.json({ devices });
  } catch (err: any) {
    res.json({
      devices: [],
      error: err.message || "libimobiledevice not available",
    });
  }
});

router.get("/devices/all", async (req, res, next) => {
  try {
    const allDevices: any[] = [];

    try {
      const { stdout: adbOut } = await execAsync("adb devices -l", { timeout: 5000 });
      const lines = adbOut.split("\n").slice(1);
      for (const line of lines) {
        if (!line.trim() || line.includes("offline")) continue;
        const parts = line.split(/\s+/);
        const serial = parts[0];
        const props: Record<string, string> = {};
        for (const p of parts.slice(2)) {
          const [key, val] = p.split(":");
          if (key && val) props[key] = val;
        }
        allDevices.push({
          id: serial,
          platform: "android",
          model: props.model || "Unknown",
          status: parts[1] === "device" ? "connected" : parts[1],
          connection: "usb",
        });
      }
    } catch {}

    try {
      const { stdout: iosOut } = await execAsync("idevice_id -l", { timeout: 5000 });
      const udids = iosOut.split("\n").filter((l) => l.trim());
      for (const udid of udids) {
        try {
          const { stdout: model } = await execAsync(`ideviceinfo -u ${udid} -k ProductType`, { timeout: 3000 });
          allDevices.push({
            id: udid.trim(),
            platform: "ios",
            model: model.trim() || "Unknown",
            status: "connected",
            connection: "usb",
          });
        } catch {
          allDevices.push({
            id: udid.trim(),
            platform: "ios",
            model: "Unknown",
            status: "connected",
            connection: "usb",
          });
        }
      }
    } catch {}

    res.json({
      devices: allDevices,
      count: allDevices.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.json({
      devices: [],
      count: 0,
      error: err.message,
    });
  }
});

router.post("/fastboot", async (req, res, next) => {
  try {
    const { command, serial } = req.body;

    if (!command) {
      return res.status(400).json({ error: "Command is required" });
    }

    const sanitized = command
      .replace(/[;&|`$]/g, "")
      .replace(/\.\./g, "")
      .trim();

    if (!sanitized.startsWith("fastboot")) {
      return res.status(400).json({ error: "Only fastboot commands allowed" });
    }

    let targetCmd = sanitized;
    if (serial) {
      targetCmd = sanitized.replace("fastboot ", `fastboot -s ${serial} `);
    }

    try {
      const { stdout, stderr } = await execAsync(targetCmd, { timeout: 60000 });
      res.json({
        success: true,
        command: targetCmd,
        output: stdout || stderr || "(no output)",
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.json({
        success: false,
        command: targetCmd,
        error: err.message || "Command failed",
        output: err.stderr || "",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    next(err);
  }
});

router.get("/fastboot/devices", async (req, res, next) => {
  try {
    const { stdout } = await execAsync("fastboot devices", { timeout: 5000 });

    const devices = stdout
      .split("\n")
      .filter((l) => l.trim())
      .map((line) => {
        const [serial, mode] = line.split(/\s+/);
        return { serial, mode: mode || "fastboot" };
      });

    res.json({ devices });
  } catch (err: any) {
    res.json({
      devices: [],
      error: err.message || "Fastboot not available",
    });
  }
});

export default router;
