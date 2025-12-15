import { PrismaClient } from "@prisma/client";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const prisma = new PrismaClient();

interface DiagnosticResult {
  level: "info" | "warning" | "critical";
  code: string;
  message: string;
  source: string;
}

async function runAdbCommand(
  command: string,
  serial?: string
): Promise<string> {
  try {
    const targetCmd = serial
      ? command.replace("adb ", `adb -s ${serial} `)
      : command;
    const { stdout, stderr } = await execAsync(targetCmd, { timeout: 10000 });
    return stdout || stderr || "";
  } catch (err: any) {
    return `[ERROR] ${err.message}`;
  }
}

async function parseAndroidBattery(serial?: string): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];
  const output = await runAdbCommand("adb shell dumpsys battery", serial);

  const levelMatch = output.match(/level:\s*(\d+)/);
  const healthMatch = output.match(/health:\s*(\d+)/);
  const tempMatch = output.match(/temperature:\s*(\d+)/);

  if (levelMatch) {
    const level = parseInt(levelMatch[1]);
    results.push({
      level: level < 20 ? "warning" : "info",
      code: "BATTERY_LEVEL",
      message: JSON.stringify({ level, unit: "%" }),
      source: "android_battery",
    });
  }

  if (healthMatch) {
    const healthCode = parseInt(healthMatch[1]);
    const healthStatus =
      healthCode === 2
        ? "GOOD"
        : healthCode === 3
          ? "OVERHEAT"
          : healthCode === 4
            ? "DEAD"
            : healthCode === 5
              ? "OVER_VOLTAGE"
              : "UNKNOWN";
    results.push({
      level: healthCode !== 2 ? "warning" : "info",
      code: "BATTERY_HEALTH",
      message: JSON.stringify({
        percent_estimate: healthCode === 2 ? 85 : 60,
        condition: healthStatus,
      }),
      source: "android_battery",
    });
  }

  if (tempMatch) {
    const temp = parseInt(tempMatch[1]) / 10;
    results.push({
      level: temp > 45 ? "critical" : temp > 40 ? "warning" : "info",
      code: "BATTERY_TEMP",
      message: JSON.stringify({ temperature: temp, unit: "C" }),
      source: "android_battery",
    });
  }

  return results;
}

async function parseAndroidStorage(serial?: string): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];
  const output = await runAdbCommand("adb shell df /data", serial);

  const lines = output.split("\n").slice(1);
  if (lines.length > 0) {
    const parts = lines[0].split(/\s+/);
    if (parts.length >= 5) {
      const usedPercent = parseInt(parts[4].replace("%", ""));
      results.push({
        level: usedPercent > 90 ? "critical" : usedPercent > 75 ? "warning" : "info",
        code: "STORAGE_USAGE",
        message: JSON.stringify({
          used: parts[2],
          available: parts[3],
          percent: usedPercent,
        }),
        source: "android_storage",
      });
    }
  }

  return results;
}

async function parseAndroidSecurity(serial?: string): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];

  const bootState = await runAdbCommand(
    "adb shell getprop ro.boot.verifiedbootstate",
    serial
  );
  const bootLocked = await runAdbCommand(
    "adb shell getprop ro.boot.flash.locked",
    serial
  );
  const cryptoState = await runAdbCommand(
    "adb shell getprop ro.crypto.state",
    serial
  );

  const isVerified = bootState.trim() === "green";
  const isLocked = bootLocked.trim() === "1";
  const isEncrypted = cryptoState.trim() === "encrypted";

  results.push({
    level: isVerified ? "info" : "warning",
    code: "VERIFIED_BOOT",
    message: JSON.stringify({ state: bootState.trim(), verified: isVerified }),
    source: "android_security",
  });

  results.push({
    level: isLocked ? "info" : "warning",
    code: "BOOTLOADER_STATE",
    message: JSON.stringify({ locked: isLocked }),
    source: "android_security",
  });

  results.push({
    level: isEncrypted ? "info" : "warning",
    code: "ENCRYPTION_STATE",
    message: JSON.stringify({ encrypted: isEncrypted }),
    source: "android_security",
  });

  return results;
}

async function getDeviceInfo(serial?: string): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];

  const model = await runAdbCommand("adb shell getprop ro.product.model", serial);
  const brand = await runAdbCommand("adb shell getprop ro.product.brand", serial);
  const version = await runAdbCommand(
    "adb shell getprop ro.build.version.release",
    serial
  );

  results.push({
    level: "info",
    code: "DEVICE_INFO",
    message: JSON.stringify({
      model: model.trim(),
      brand: brand.trim(),
      androidVersion: version.trim(),
    }),
    source: "android_info",
  });

  return results;
}

async function runIosCommand(command: string, udid?: string): Promise<string> {
  try {
    const targetCmd = udid ? `${command} -u ${udid}` : command;
    const { stdout, stderr } = await execAsync(targetCmd, { timeout: 15000 });
    return stdout || stderr || "";
  } catch (err: any) {
    return `[ERROR] ${err.message}`;
  }
}

async function parseIosBattery(udid?: string): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];
  const output = await runIosCommand("idevicediagnostics ioregentry IOPMPowerSource", udid);

  const capacityMatch = output.match(/CurrentCapacity.*?(\d+)/);
  const maxCapacityMatch = output.match(/MaxCapacity.*?(\d+)/);
  const cycleCountMatch = output.match(/CycleCount.*?(\d+)/);
  const tempMatch = output.match(/Temperature.*?(\d+)/);

  if (capacityMatch && maxCapacityMatch) {
    const current = parseInt(capacityMatch[1]);
    const max = parseInt(maxCapacityMatch[1]);
    const healthPercent = Math.round((max / 100) * 100);
    
    results.push({
      level: healthPercent < 80 ? "warning" : "info",
      code: "BATTERY_HEALTH",
      message: JSON.stringify({
        percent_estimate: healthPercent,
        condition: healthPercent >= 80 ? "GOOD" : healthPercent >= 60 ? "FAIR" : "POOR",
        current_charge: current,
        max_capacity: max,
      }),
      source: "ios_battery",
    });
  }

  if (cycleCountMatch) {
    const cycles = parseInt(cycleCountMatch[1]);
    results.push({
      level: cycles > 500 ? "warning" : "info",
      code: "BATTERY_CYCLES",
      message: JSON.stringify({ cycle_count: cycles }),
      source: "ios_battery",
    });
  }

  if (tempMatch) {
    const tempCelsius = parseInt(tempMatch[1]) / 100;
    results.push({
      level: tempCelsius > 40 ? "warning" : "info",
      code: "BATTERY_TEMP",
      message: JSON.stringify({ temperature: tempCelsius, unit: "C" }),
      source: "ios_battery",
    });
  }

  return results;
}

async function parseIosDeviceInfo(udid?: string): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];
  const output = await runIosCommand("ideviceinfo", udid);

  const productType = output.match(/ProductType:\s*(.+)/);
  const productVersion = output.match(/ProductVersion:\s*(.+)/);
  const serialNumber = output.match(/SerialNumber:\s*(.+)/);
  const deviceName = output.match(/DeviceName:\s*(.+)/);

  results.push({
    level: "info",
    code: "DEVICE_INFO",
    message: JSON.stringify({
      model: productType ? productType[1].trim() : "Unknown",
      brand: "Apple",
      iosVersion: productVersion ? productVersion[1].trim() : "Unknown",
      serial: serialNumber ? serialNumber[1].trim() : "Unknown",
      name: deviceName ? deviceName[1].trim() : "Unknown",
    }),
    source: "ios_info",
  });

  return results;
}

async function parseIosStorage(udid?: string): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];
  const output = await runIosCommand("ideviceinfo -q com.apple.disk_usage", udid);

  const totalMatch = output.match(/TotalDataCapacity:\s*(\d+)/);
  const availableMatch = output.match(/TotalDataAvailable:\s*(\d+)/);

  if (totalMatch && availableMatch) {
    const total = parseInt(totalMatch[1]);
    const available = parseInt(availableMatch[1]);
    const used = total - available;
    const usedPercent = Math.round((used / total) * 100);

    results.push({
      level: usedPercent > 90 ? "critical" : usedPercent > 75 ? "warning" : "info",
      code: "STORAGE_USAGE",
      message: JSON.stringify({
        total: `${Math.round(total / 1024 / 1024 / 1024)}GB`,
        available: `${Math.round(available / 1024 / 1024 / 1024)}GB`,
        used: `${Math.round(used / 1024 / 1024 / 1024)}GB`,
        percent: usedPercent,
      }),
      source: "ios_storage",
    });
  }

  return results;
}

async function parseIosSecurity(udid?: string): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];
  const output = await runIosCommand("ideviceinfo -q com.apple.mobile.lockdown", udid);

  const activatedMatch = output.match(/ActivationState:\s*(.+)/);
  const passcodeMatch = output.match(/PasswordProtected:\s*(.+)/);

  const isActivated = activatedMatch && activatedMatch[1].trim() === "Activated";
  const hasPasscode = passcodeMatch && passcodeMatch[1].trim() === "true";

  results.push({
    level: "info",
    code: "ACTIVATION_STATE",
    message: JSON.stringify({ activated: isActivated }),
    source: "ios_security",
  });

  results.push({
    level: hasPasscode ? "info" : "warning",
    code: "PASSCODE_STATE",
    message: JSON.stringify({ passcode_enabled: hasPasscode }),
    source: "ios_security",
  });

  return results;
}

export async function runDeviceDiagnostic(deviceId: string, ticketId?: string) {
  const device = await prisma.device.findUnique({ where: { id: deviceId } });
  if (!device) throw new Error("Device not found");

  const serial = device.serial || device.imei || undefined;

  const run = await prisma.diagnosticRun.create({
    data: {
      deviceId,
      ticketId: ticketId ?? null,
      status: "running",
      summary: `Running ${device.platform} diagnostics...`,
    },
  });

  try {
    let findings: DiagnosticResult[] = [];

    if (device.platform === "android") {
      const [battery, storage, security, info] = await Promise.all([
        parseAndroidBattery(serial),
        parseAndroidStorage(serial),
        parseAndroidSecurity(serial),
        getDeviceInfo(serial),
      ]);
      findings = [...battery, ...storage, ...security, ...info];
    } else if (device.platform === "ios") {
      const udid = serial;
      const [battery, storage, security, info] = await Promise.all([
        parseIosBattery(udid),
        parseIosStorage(udid),
        parseIosSecurity(udid),
        parseIosDeviceInfo(udid),
      ]);
      findings = [...battery, ...storage, ...security, ...info];
    } else {
      findings = [
        {
          level: "warning",
          code: "PLATFORM_UNSUPPORTED",
          message: `Platform ${device.platform} diagnostics require manual inspection`,
          source: "system",
        },
      ];
    }

    for (const f of findings) {
      await prisma.diagnosticFinding.create({
        data: {
          runId: run.id,
          level: f.level,
          code: f.code,
          message: f.message,
          source: f.source,
        },
      });
    }

    const criticalCount = findings.filter((f) => f.level === "critical").length;
    const warningCount = findings.filter((f) => f.level === "warning").length;

    await prisma.diagnosticRun.update({
      where: { id: run.id },
      data: {
        status: "completed",
        summary: `Diagnostics complete: ${findings.length} findings (${criticalCount} critical, ${warningCount} warnings)`,
      },
    });

    return {
      runId: run.id,
      summary: `Diagnostics complete`,
      platform: device.platform,
      findingsCount: findings.length,
      criticalCount,
      warningCount,
    };
  } catch (err) {
    await prisma.diagnosticRun.update({
      where: { id: run.id },
      data: {
        status: "failed",
        summary: `Diagnostic failed: ${(err as any).message}`,
      },
    });
    throw err;
  }
}

export async function runAndroidDiagnosticForDevice(
  deviceId: string,
  ticketId?: string
) {
  return runDeviceDiagnostic(deviceId, ticketId);
}

export async function getDiagnosticRun(runId: string) {
  return prisma.diagnosticRun.findUnique({
    where: { id: runId },
    include: { findings: true, device: true },
  });
}

