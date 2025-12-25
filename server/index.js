import express from 'express';
import { execSync, spawn } from 'child_process';
import { randomUUID } from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Readable } from 'stream';
import cors from 'cors';
import WebSocket, { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { AuthorizationTriggers } from './authorization-triggers.js';
import trapdoorRouter from '../core/api/trapdoor.js';
import catalogRouter from './catalog.js';
import toolsInspectRouter from './tools-inspect.js';
import operationsRouter from './operations.js';
import { ensureManagedPlatformTools, getManagedPlatformToolsDir } from './platform-tools.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const authTriggers = new AuthorizationTriggers();

const server = createServer(app);

// Track open HTTP sockets so we can force-close them during shutdown.
const httpSockets = new Set();
server.on('connection', (socket) => {
  httpSockets.add(socket);
  socket.on('close', () => httpSockets.delete(socket));
});

const wss = new WebSocketServer({ server, path: '/ws/device-events' });
const wssCorrelation = new WebSocketServer({ server, path: '/ws/correlation' });
const wssAnalytics = new WebSocketServer({ server, path: '/ws/analytics' });

const clients = new Set();
const correlationClients = new Set();
const analyticsClients = new Set();

wss.on('connection', (ws) => {
  console.log('WebSocket client connected (device-events)');
  clients.add(ws);

  ws.on('close', () => {
    console.log('WebSocket client disconnected (device-events)');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

wssCorrelation.on('connection', (ws) => {
  console.log('WebSocket client connected (correlation tracking)');
  correlationClients.add(ws);
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      if (message.type === 'ping') {
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Failed to parse correlation WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected (correlation tracking)');
    correlationClients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error (correlation):', error);
    correlationClients.delete(ws);
  });
});

// Analytics WebSocket for Live Analytics Dashboard
wssAnalytics.on('connection', (ws) => {
  console.log('WebSocket client connected (live analytics)');
  analyticsClients.add(ws);

  ws.on('close', () => {
    console.log('WebSocket client disconnected (live analytics)');
    analyticsClients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('Analytics WebSocket error:', error);
    analyticsClients.delete(ws);
  });
});

function broadcastCorrelation(message) {
  const data = JSON.stringify({
    ...message,
    timestamp: Date.now()
  });
  
  for (const client of correlationClients) {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  }
}

function safeExec(cmd) {
  try {
    return execSync(cmd, { encoding: "utf-8", timeout: 5000 }).trim();
  } catch {
    return null;
  }
}

const IS_WINDOWS = process.platform === 'win32';

function uniqueNonEmptyStrings(values) {
  return [...new Set(values.filter(Boolean))];
}

function getAndroidToolDiagnostics(toolBaseName) {
  const exeName = IS_WINDOWS ? `${toolBaseName}.exe` : toolBaseName;
  const envVar = `${toolBaseName.toUpperCase()}_PATH`;

  const androidHome = process.env.ANDROID_HOME || null;
  const androidSdkRoot = process.env.ANDROID_SDK_ROOT || null;
  const explicitPath = process.env[envVar] || null;
  const localAppData = process.env.LOCALAPPDATA || null;
  const userProfile = process.env.USERPROFILE || null;

  const candidateDirs = uniqueNonEmptyStrings([
    getManagedPlatformToolsDir(),
    androidHome ? path.join(androidHome, 'platform-tools') : null,
    androidSdkRoot ? path.join(androidSdkRoot, 'platform-tools') : null,
    localAppData ? path.join(localAppData, 'Android', 'Sdk', 'platform-tools') : null,
    userProfile ? path.join(userProfile, 'AppData', 'Local', 'Android', 'Sdk', 'platform-tools') : null,
    IS_WINDOWS ? 'C:\\Android\\platform-tools' : null
  ]);

  const searchedPaths = candidateDirs.map(dir => path.join(dir, exeName));

  const resolvedFromSdk = searchedPaths.find(p => {
    try {
      return fs.existsSync(p);
    } catch {
      return false;
    }
  }) || null;

  const resolvedFromExplicit = explicitPath && (() => {
    try {
      return fs.existsSync(explicitPath) ? explicitPath : null;
    } catch {
      return null;
    }
  })();

  return {
    platform: process.platform,
    tool: toolBaseName,
    env: {
      ANDROID_HOME: androidHome,
      ANDROID_SDK_ROOT: androidSdkRoot,
      [envVar]: explicitPath
    },
    searchedPaths,
    resolvedPath: resolvedFromExplicit || resolvedFromSdk
  };
}

function resolveToolPath(toolBaseName) {
  return getAndroidToolDiagnostics(toolBaseName).resolvedPath;
}

function getToolCommand(toolBaseName) {
  const resolvedPath = resolveToolPath(toolBaseName);
  if (resolvedPath) {
    return `"${resolvedPath}"`;
  }
  return toolBaseName;
}

function parseUsbVidPidFromPnpDeviceId(pnpDeviceId) {
  if (!pnpDeviceId) return { vid: null, pid: null };
  const vidMatch = pnpDeviceId.match(/VID_([0-9A-Fa-f]{4})/);
  const pidMatch = pnpDeviceId.match(/PID_([0-9A-Fa-f]{4})/);
  return {
    vid: vidMatch ? vidMatch[1].toLowerCase() : null,
    pid: pidMatch ? pidMatch[1].toLowerCase() : null
  };
}

function getConnectedUsbDevices() {
  if (!IS_WINDOWS) {
    return [];
  }

  const ps = [
    "$ErrorActionPreference='SilentlyContinue'",
    "$devs = Get-CimInstance Win32_PnPEntity | Where-Object { $_.PNPDeviceID -like 'USB\\VID_*' -and $_.Status -eq 'OK' } | Select-Object Name, PNPDeviceID, Manufacturer",
    "$devs | ConvertTo-Json -Compress"
  ].join('; ');

  const raw = safeExec(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${ps}"`);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed) ? parsed : [parsed];
    return items
      .filter(Boolean)
      .map(d => {
        const name = d.Name || null;
        const pnpDeviceId = d.PNPDeviceID || null;
        const manufacturer = d.Manufacturer || null;
        const { vid, pid } = parseUsbVidPidFromPnpDeviceId(pnpDeviceId);
        return {
          name,
          manufacturer,
          pnpDeviceId,
          vid,
          pid
        };
      })
      .filter(d => d.pnpDeviceId || d.name);
  } catch {
    return [];
  }
}

function parseAdbDevicesList(devicesRaw) {
  const lines = devicesRaw?.split('\n').slice(1).filter(l => l.trim()) || [];
  return lines
    .map(line => {
      const parts = line.trim().split(/\s+/);
      const serial = parts[0];
      const state = parts[1];
      const infoStr = parts.slice(2).join(' ');
      return {
        serial,
        state,
        info: infoStr
      };
    })
    .filter(d => d.serial && d.state);
}

function parseFastbootDevicesList(devicesRaw) {
  const lines = devicesRaw?.split('\n').filter(l => l.trim()) || [];
  return lines
    .map(line => {
      const parts = line.trim().split(/\s+/);
      const serial = parts[0];
      const mode = parts[1] || 'fastboot';
      return {
        serial,
        mode
      };
    })
    .filter(d => d.serial);
}

function commandExists(cmd) {
  const resolvedPath = resolveToolPath(cmd);
  if (resolvedPath) {
    return true;
  }

  try {
    if (IS_WINDOWS) {
      execSync(`where ${cmd}`, { stdio: 'ignore', timeout: 2000 });
    } else {
      execSync(`command -v ${cmd}`, { stdio: "ignore", timeout: 2000 });
    }
    return true;
  } catch {
    return false;
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/system-tools', (req, res) => {
  const rustVersion = safeExec("rustc --version");
  const cargoVersion = safeExec("cargo --version");
  const nodeVersion = safeExec("node --version");
  const npmVersion = safeExec("npm --version");
  const pythonVersion = safeExec(IS_WINDOWS ? "python --version" : "python3 --version");
  const pipVersion = safeExec(IS_WINDOWS ? "pip --version" : "pip3 --version");
  const gitVersion = safeExec("git --version");
  const dockerVersion = safeExec("docker --version");
  
  const adbDiagnostics = getAndroidToolDiagnostics('adb');
  const fastbootDiagnostics = getAndroidToolDiagnostics('fastboot');
  const adbInstalled = commandExists("adb");
  const fastbootInstalled = commandExists("fastboot");
  
  let adbDevices = null;
  let adbVersion = null;
  if (adbInstalled) {
    const adbCmd = getToolCommand('adb');
    adbDevices = safeExec(`${adbCmd} devices`);
    adbVersion = safeExec(`${adbCmd} --version`);
  }
  
  let fastbootDevices = null;
  if (fastbootInstalled) {
    const fastbootCmd = getToolCommand('fastboot');
    fastbootDevices = safeExec(`${fastbootCmd} devices`);
  }

  const tools = {
    rust: {
      installed: !!rustVersion,
      version: rustVersion,
      cargo: cargoVersion
    },
    node: {
      installed: !!nodeVersion,
      version: nodeVersion,
      npm: npmVersion
    },
    python: {
      installed: !!pythonVersion,
      version: pythonVersion,
      pip: pipVersion
    },
    git: {
      installed: !!gitVersion,
      version: gitVersion
    },
    docker: {
      installed: !!dockerVersion,
      version: dockerVersion
    },
    adb: {
      installed: adbInstalled,
      version: adbVersion,
      devices_raw: adbDevices,
      resolvedPath: adbDiagnostics.resolvedPath,
      diagnostics: adbInstalled ? undefined : adbDiagnostics
    },
    fastboot: {
      installed: fastbootInstalled,
      devices_raw: fastbootDevices,
      resolvedPath: fastbootDiagnostics.resolvedPath,
      diagnostics: fastbootInstalled ? undefined : fastbootDiagnostics
    }
  };

  res.json({
    timestamp: new Date().toISOString(),
    environment: process.env.CODESPACES ? 'codespaces' : 'local',
    tools
  });
});

app.get('/api/system-tools/rust', (req, res) => {
  const rustVersion = safeExec("rustc --version");
  const cargoVersion = safeExec("cargo --version");
  const rustupVersion = safeExec("rustup --version");
  
  res.json({
    installed: !!rustVersion,
    rustc: rustVersion,
    cargo: cargoVersion,
    rustup: rustupVersion
  });
});

app.get('/api/system-tools/android', (req, res) => {
  const adbDiagnostics = getAndroidToolDiagnostics('adb');
  const fastbootDiagnostics = getAndroidToolDiagnostics('fastboot');
  const adbInstalled = commandExists("adb");
  const fastbootInstalled = commandExists("fastboot");
  
  let adbDevices = null;
  let adbVersion = null;
  if (adbInstalled) {
    const adbCmd = getToolCommand('adb');
    adbDevices = safeExec(`${adbCmd} devices`);
    adbVersion = safeExec(`${adbCmd} --version`);
  }
  
  let fastbootDevices = null;
  if (fastbootInstalled) {
    const fastbootCmd = getToolCommand('fastboot');
    fastbootDevices = safeExec(`${fastbootCmd} devices`);
  }
  
  res.json({
    adb: {
      installed: adbInstalled,
      version: adbVersion,
      devices_raw: adbDevices,
      resolvedPath: adbDiagnostics.resolvedPath,
      diagnostics: adbInstalled ? undefined : adbDiagnostics
    },
    fastboot: {
      installed: fastbootInstalled,
      devices_raw: fastbootDevices,
      resolvedPath: fastbootDiagnostics.resolvedPath,
      diagnostics: fastbootInstalled ? undefined : fastbootDiagnostics
    },
    managed: {
      platformToolsDir: getManagedPlatformToolsDir(),
      hint: (!adbInstalled || !fastbootInstalled)
        ? 'Call POST /api/system-tools/android/ensure to download Google platform-tools into the managed tools folder (no PATH required).'
        : undefined
    }
  });
});

app.post('/api/system-tools/android/ensure', async (req, res) => {
  try {
    const result = await ensureManagedPlatformTools();

    const adbDiagnostics = getAndroidToolDiagnostics('adb');
    const fastbootDiagnostics = getAndroidToolDiagnostics('fastboot');
    const adbInstalled = commandExists('adb');
    const fastbootInstalled = commandExists('fastboot');

    res.json({
      ok: true,
      result,
      adb: {
        installed: adbInstalled,
        resolvedPath: adbDiagnostics.resolvedPath,
        version: adbInstalled ? safeExec(`${getToolCommand('adb')} --version`) : null
      },
      fastboot: {
        installed: fastbootInstalled,
        resolvedPath: fastbootDiagnostics.resolvedPath
      }
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error?.message || String(error),
      managed: {
        platformToolsDir: getManagedPlatformToolsDir()
      }
    });
  }
});

app.get('/api/ios/scan', (req, res) => {
  // Truth-first: only report what we can actually detect.
  // On Windows/macOS/Linux, normal-mode iOS detection is possible if libimobiledevice tools are installed.
  const ideviceIdAvailable = commandExists('idevice_id');
  if (!ideviceIdAvailable) {
    return res.status(404).json({
      success: false,
      error: 'iOS device tools not installed (idevice_id not found)',
      hint: 'Install libimobiledevice (idevice_id, ideviceinfo) to enable iOS normal-mode detection.'
    });
  }

  const devicesRaw = safeExec(`${getToolCommand('idevice_id')} -l`);
  const udids = devicesRaw ? devicesRaw.split(/\r?\n/).map(l => l.trim()).filter(Boolean) : [];

  const devices = udids.map((udid) => {
    const infoRaw = commandExists('ideviceinfo')
      ? safeExec(`${getToolCommand('ideviceinfo')} -u ${udid}`)
      : null;

    const getInfoValue = (key) => {
      if (!infoRaw) return null;
      const match = infoRaw.split(/\r?\n/).find(line => line.startsWith(`${key}:`));
      if (!match) return null;
      return match.slice(key.length + 1).trim() || null;
    };

    const deviceName = getInfoValue('DeviceName') || getInfoValue('Device Name');
    const productType = getInfoValue('ProductType');
    const productVersion = getInfoValue('ProductVersion');

    return {
      udid,
      mode: 'normal',
      name: deviceName,
      productType,
      productVersion,
      isDetected: true
    };
  });

  res.json({
    success: true,
    devices,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/system-tools/python', (req, res) => {
  const pythonVersion = safeExec("python3 --version");
  const pipVersion = safeExec("pip3 --version");
  const python2Version = safeExec("python --version");
  
  res.json({
    installed: !!pythonVersion,
    python3: pythonVersion,
    python2: python2Version,
    pip: pipVersion
  });
});

app.get('/api/system-info', (req, res) => {
  if (IS_WINDOWS) {
    const cpuModel = os.cpus()?.[0]?.model || null;
    const totalMemBytes = os.totalmem();
    const uptimeSeconds = os.uptime();

    res.json({
      os: `Windows ${os.release()}`,
      hostname: os.hostname(),
      kernel: null,
      cpu: cpuModel,
      memory: `${Math.round((totalMemBytes / (1024 ** 3)) * 10) / 10} GB`,
      disk: null,
      uptime: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m`,
      hardware: {
        usbDevices: null,
        pciDevices: null
      }
    });
    return;
  }

  const osInfo = safeExec("uname -a");
  const cpuInfo = safeExec("lscpu | grep 'Model name' | cut -d':' -f2");
  const memInfo = safeExec("free -h | grep 'Mem:' | awk '{print $2}'");
  const diskInfo = safeExec("df -h / | tail -1 | awk '{print $2}'");
  const uptime = safeExec("uptime -p");
  const hostname = safeExec("hostname");
  const kernel = safeExec("uname -r");

  const usbDevicesCount = safeExec("lsusb 2>/dev/null | wc -l");
  const pciDevicesCount = safeExec("lspci 2>/dev/null | wc -l");

  res.json({
    os: osInfo,
    hostname: hostname,
    kernel: kernel,
    cpu: cpuInfo?.trim(),
    memory: memInfo?.trim(),
    disk: diskInfo?.trim(),
    uptime: uptime,
    hardware: {
      usbDevices: usbDevicesCount ? parseInt(usbDevicesCount) : 0,
      pciDevices: pciDevicesCount ? parseInt(pciDevicesCount) : 0
    }
  });
});

app.get('/api/adb/devices', (req, res) => {
  if (!commandExists("adb")) {
    return res.status(404).json({
      error: "ADB not installed",
      hint: "Install Android SDK Platform Tools, ensure adb is on PATH, or set ADB_PATH / ANDROID_HOME / ANDROID_SDK_ROOT.",
      diagnostics: getAndroidToolDiagnostics('adb')
    });
  }
  
  const adbCmd = getToolCommand('adb');
  const devicesRaw = safeExec(`${adbCmd} devices -l`);
  const lines = devicesRaw?.split('\n').slice(1).filter(l => l.trim()) || [];
  
  const devices = lines.map(line => {
    const parts = line.trim().split(/\s+/);
    const serial = parts[0];
    const state = parts[1];
    const infoStr = parts.slice(2).join(' ');
    
    const product = infoStr.match(/product:(\S+)/)?.[1] || null;
    const model = infoStr.match(/model:(\S+)/)?.[1] || null;
    const device = infoStr.match(/device:(\S+)/)?.[1] || null;
    const transport = infoStr.match(/transport_id:(\d+)/)?.[1] || null;
    
    let deviceMode = 'unknown';
    let bootloaderMode = null;
    let deviceProperties = {};
    
    if (state === 'device') {
      deviceMode = 'android_os';
      const props = safeExec(`${adbCmd} -s ${serial} shell getprop`);
      if (props) {
        const manufacturer = props.match(/\[ro\.product\.manufacturer\]:\s*\[(.*?)\]/)?.[1];
        const brand = props.match(/\[ro\.product\.brand\]:\s*\[(.*?)\]/)?.[1];
        const modelProp = props.match(/\[ro\.product\.model\]:\s*\[(.*?)\]/)?.[1];
        const androidVersion = props.match(/\[ro\.build\.version\.release\]:\s*\[(.*?)\]/)?.[1];
        const sdkVersion = props.match(/\[ro\.build\.version\.sdk\]:\s*\[(.*?)\]/)?.[1];
        const buildId = props.match(/\[ro\.build\.id\]:\s*\[(.*?)\]/)?.[1];
        const bootloader = props.match(/\[ro\.boot\.bootloader\]:\s*\[(.*?)\]/)?.[1];
        const secureMode = props.match(/\[ro\.secure\]:\s*\[(.*?)\]/)?.[1];
        const debuggable = props.match(/\[ro\.debuggable\]:\s*\[(.*?)\]/)?.[1];
        
        deviceProperties = {
          manufacturer,
          brand,
          model: modelProp,
          androidVersion,
          sdkVersion,
          buildId,
          bootloader,
          secure: secureMode === '1',
          debuggable: debuggable === '1'
        };
      }
    } else if (state === 'recovery') {
      deviceMode = 'recovery';
    } else if (state === 'sideload') {
      deviceMode = 'sideload';
    } else if (state === 'unauthorized') {
      deviceMode = 'unauthorized';
    } else if (state === 'offline') {
      deviceMode = 'offline';
    } else if (state === 'bootloader') {
      deviceMode = 'bootloader';
    }
    
    return {
      serial,
      state,
      deviceMode,
      bootloaderMode,
      product,
      model,
      device,
      transportId: transport,
      properties: deviceProperties,
      info: infoStr
    };
  }).filter(d => d.serial && d.state);
  
  res.json({
    count: devices.length,
    devices,
    adb: {
      installed: true,
      resolvedPath: resolveToolPath('adb'),
      command: adbCmd
    },
    devices_raw: devicesRaw,
    hint: devices.length === 0
      ? 'ADB is installed but no devices were detected. Ensure USB debugging is enabled, approve the USB debugging prompt, use a data-capable cable, and install the OEM ADB driver (Motorola/Google) so Device Manager shows an ADB Interface.'
      : undefined,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/devices/scan', (req, res) => {
  const scanned = [];
  const seenUids = new Set();

  const adbInstalled = commandExists('adb');
  const fastbootInstalled = commandExists('fastboot');

  if (adbInstalled) {
    const adbCmd = getToolCommand('adb');
    const adbRaw = safeExec(`${adbCmd} devices -l`);
    const adbDevices = parseAdbDevicesList(adbRaw);
    for (const d of adbDevices) {
      const uid = `adb-${d.serial}`;
      seenUids.add(uid);
      scanned.push({
        device_uid: uid,
        platform_hint: 'android',
        mode: d.state === 'device' ? 'Normal OS (Confirmed)' : d.state,
        confidence: d.state === 'device' ? 0.95 : (d.state === 'unauthorized' ? 0.80 : 0.70),
        evidence: {
          source: 'adb',
          serial: d.serial,
          state: d.state,
          info: d.info
        },
        matched_tool_ids: [d.serial, uid],
        correlation_badge: d.state === 'device' ? 'SYSTEM-CONFIRMED' : 'UNCONFIRMED',
        display_name: d.serial
      });
    }
  }

  if (fastbootInstalled) {
    const fastbootCmd = getToolCommand('fastboot');
    const fastbootRaw = safeExec(`${fastbootCmd} devices`);
    const fastbootDevices = parseFastbootDevicesList(fastbootRaw);
    for (const d of fastbootDevices) {
      const uid = `fastboot-${d.serial}`;
      if (seenUids.has(uid) || seenUids.has(`adb-${d.serial}`)) continue;
      seenUids.add(uid);
      scanned.push({
        device_uid: uid,
        platform_hint: 'android',
        mode: 'bootloader',
        confidence: 0.90,
        evidence: {
          source: 'fastboot',
          serial: d.serial,
          mode: d.mode
        },
        matched_tool_ids: [d.serial, uid],
        correlation_badge: 'SYSTEM-CONFIRMED',
        display_name: d.serial
      });
    }
  }

  const usbDevices = getConnectedUsbDevices();
  for (const d of usbDevices) {
    const key = d.pnpDeviceId || d.name;
    const uid = `usb-${Buffer.from(String(key)).toString('base64').replace(/=+$/g, '')}`;
    if (seenUids.has(uid)) continue;
    seenUids.add(uid);
    scanned.push({
      device_uid: uid,
      platform_hint: 'unknown',
      mode: 'usb_connected',
      confidence: 0.50,
      evidence: {
        source: 'usb',
        name: d.name,
        manufacturer: d.manufacturer,
        pnpDeviceId: d.pnpDeviceId,
        vid: d.vid,
        pid: d.pid
      },
      matched_tool_ids: [uid],
      correlation_badge: 'UNCONFIRMED',
      display_name: d.name || d.pnpDeviceId || uid
    });
  }

  res.json({
    devices: scanned,
    count: scanned.length,
    tools: {
      adb: {
        installed: adbInstalled,
        resolvedPath: resolveToolPath('adb')
      },
      fastboot: {
        installed: fastbootInstalled,
        resolvedPath: resolveToolPath('fastboot')
      }
    },
    hint: scanned.length === 0
      ? 'No devices detected. If you are on Windows and your phone shows only as a Portable Device (MTP), install the OEM ADB driver and enable USB debugging to make it appear as an ADB Interface.'
      : undefined,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/adb/trigger-auth', (req, res) => {
  if (!commandExists("adb")) {
    return res.status(404).json({ 
      success: false,
      message: "ADB not installed on system" 
    });
  }
  
  const { serial, command } = req.body || {};
  const adbCmd = getToolCommand('adb');

  // Safety: only allow a tiny allowlist of operations.
  // This endpoint exists to trigger the device-side USB debugging authorization prompt.
  const resolveTriggerCommand = (inputCommand) => {
    if (!inputCommand) return 'shell getprop ro.build.version.release';
    const normalized = String(inputCommand).trim();
    if (normalized === 'shell getprop') return 'shell getprop ro.build.version.release';
    if (normalized === 'shell getprop ro.build.version.release') return normalized;
    if (normalized === 'shell echo auth_trigger') return 'shell echo auth_trigger';
    return 'shell getprop ro.build.version.release';
  };

  const resolveSerial = (inputSerial) => {
    if (inputSerial) return inputSerial;
    const devicesRaw = safeExec(`${adbCmd} devices -l`);
    const devices = parseAdbDevicesList(devicesRaw);
    if (devices.length === 1) {
      return devices[0].serial;
    }
    return null;
  };

  const resolvedSerial = resolveSerial(serial);
  if (!resolvedSerial) {
    const devicesRaw = safeExec(`${adbCmd} devices -l`);
    const devices = parseAdbDevicesList(devicesRaw);
    return res.json({
      success: false,
      message: "Device serial is required",
      availableSerials: devices.map(d => d.serial),
      devices_raw: devicesRaw,
      hint: devices.length === 0
        ? "No ADB devices detected. If your phone shows only as a Portable Device (MTP) in Device Manager, you still need an ADB driver/interface and USB debugging enabled."
        : "Multiple devices detected. Pick a serial from availableSerials and retry."
    });
  }
  
  try {
    const triggerCmd = resolveTriggerCommand(command);
    // Any ADB command to an unauthorized device should cause Android to show the authorization prompt.
    // Using getprop is harmless and consistent.
    execSync(`${adbCmd} -s ${resolvedSerial} ${triggerCmd} 2>&1`, { 
      encoding: "utf-8", 
      timeout: 5000 
    });
    
    res.json({
      success: true,
      message: "Authorization request sent. Check your device for the USB debugging dialog.",
      serial: resolvedSerial,
      triggered: true,
      requiresUserAction: true,
      authorizationType: 'adb_usb_debugging'
    });
  } catch (error) {
    const stderr = error?.stderr?.toString?.() || '';
    const stdout = error?.stdout?.toString?.() || '';
    const errorMessage = String((stderr || stdout || error?.message || 'Unknown error')).trim();
    
    if (errorMessage.includes('unauthorized')) {
      res.json({
        success: true,
        message: "Authorization dialog triggered on device. Please check your phone and tap 'Allow'.",
        serial: resolvedSerial,
        triggered: true,
        requiresUserAction: true,
        authorizationType: 'adb_usb_debugging',
        note: "Device is unauthorized - this is expected. The prompt should appear on the device."
      });
    } else if (errorMessage.includes('device offline')) {
      res.status(400).json({
        success: false,
        message: "Device is offline. Please check USB connection.",
        serial: resolvedSerial,
        triggered: false,
        requiresUserAction: false,
        authorizationType: 'adb_usb_debugging'
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Failed to trigger authorization: ${errorMessage}`,
        serial: resolvedSerial,
        triggered: false,
        requiresUserAction: false,
        authorizationType: 'adb_usb_debugging'
      });
    }
  }
});

app.get('/api/fastboot/devices', (req, res) => {
  if (!commandExists("fastboot")) {
    return res.status(404).json({ error: "Fastboot not installed" });
  }

  const fastbootCmd = getToolCommand('fastboot');
  
  const devicesRaw = safeExec(`${fastbootCmd} devices`);
  const lines = devicesRaw?.split('\n').filter(l => l.trim()) || [];
  
  const devices = lines.map(line => {
    const parts = line.trim().split(/\s+/);
    const serial = parts[0];
    const mode = parts[1] || 'fastboot';
    
    let deviceInfo = {};
    const productOutput = safeExec(`${fastbootCmd} -s ${serial} getvar product 2>&1`);
    const variantOutput = safeExec(`${fastbootCmd} -s ${serial} getvar variant 2>&1`);
    const bootloaderOutput = safeExec(`${fastbootCmd} -s ${serial} getvar version-bootloader 2>&1`);
    const basebandOutput = safeExec(`${fastbootCmd} -s ${serial} getvar version-baseband 2>&1`);
    const serialnoOutput = safeExec(`${fastbootCmd} -s ${serial} getvar serialno 2>&1`);
    const secureOutput = safeExec(`${fastbootCmd} -s ${serial} getvar secure 2>&1`);
    const unlockStateOutput = safeExec(`${fastbootCmd} -s ${serial} getvar unlocked 2>&1`);
    
    const extractValue = (output) => {
      if (!output) return null;
      const match = output.match(/:\s*(.+)/);
      return match ? match[1].trim() : null;
    };
    
    const product = extractValue(productOutput);
    const variant = extractValue(variantOutput);
    const bootloaderVersion = extractValue(bootloaderOutput);
    const basebandVersion = extractValue(basebandOutput);
    const serialNumber = extractValue(serialnoOutput);
    const secure = extractValue(secureOutput);
    const unlocked = extractValue(unlockStateOutput);
    
    let bootloaderState = 'unknown';
    if (unlocked === 'yes' || unlocked === 'true') {
      bootloaderState = 'unlocked';
    } else if (unlocked === 'no' || unlocked === 'false') {
      bootloaderState = 'locked';
    }
    
    const isSecure = secure === 'yes' || secure === 'true';
    
    deviceInfo = {
      product,
      variant,
      bootloaderVersion,
      basebandVersion,
      serialNumber,
      secure: isSecure,
      unlocked: bootloaderState === 'unlocked',
      bootloaderState
    };
    
    return {
      serial,
      mode,
      deviceMode: 'bootloader',
      bootloaderMode: mode,
      properties: deviceInfo
    };
  }).filter(d => d.serial);
  
  res.json({
    count: devices.length,
    devices,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/android-devices/all', async (req, res) => {
  const adbInstalled = commandExists("adb");
  const fastbootInstalled = commandExists("fastboot");

  const adbCmd = getToolCommand('adb');
  const fastbootCmd = getToolCommand('fastboot');
  
  let adbDevices = [];
  let fastbootDevices = [];
  
  if (adbInstalled) {
    const devicesRaw = safeExec(`${adbCmd} devices -l`);
    const lines = devicesRaw?.split('\n').slice(1).filter(l => l.trim()) || [];
    
    adbDevices = lines.map(line => {
      const parts = line.trim().split(/\s+/);
      const serial = parts[0];
      const state = parts[1];
      const infoStr = parts.slice(2).join(' ');
      
      const product = infoStr.match(/product:(\S+)/)?.[1] || null;
      const model = infoStr.match(/model:(\S+)/)?.[1] || null;
      const device = infoStr.match(/device:(\S+)/)?.[1] || null;
      
      let deviceMode = 'unknown';
      if (state === 'device') deviceMode = 'android_os';
      else if (state === 'recovery') deviceMode = 'recovery';
      else if (state === 'sideload') deviceMode = 'sideload';
      else if (state === 'unauthorized') deviceMode = 'unauthorized';
      else if (state === 'offline') deviceMode = 'offline';
      else if (state === 'bootloader') deviceMode = 'bootloader';
      
      let deviceProperties = {};
      if (state === 'device') {
        const props = safeExec(`${adbCmd} -s ${serial} shell getprop`);
        if (props) {
          const manufacturer = props.match(/\[ro\.product\.manufacturer\]:\s*\[(.*?)\]/)?.[1];
          const brand = props.match(/\[ro\.product\.brand\]:\s*\[(.*?)\]/)?.[1];
          const modelProp = props.match(/\[ro\.product\.model\]:\s*\[(.*?)\]/)?.[1];
          const androidVersion = props.match(/\[ro\.build\.version\.release\]:\s*\[(.*?)\]/)?.[1];
          
          deviceProperties = {
            manufacturer,
            brand,
            model: modelProp,
            androidVersion
          };
        }
      }
      
      return {
        id: `adb-${serial}`,
        serial,
        state,
        deviceMode,
        source: 'adb',
        product,
        model,
        device,
        properties: deviceProperties
      };
    }).filter(d => d.serial && d.state);
  }
  
  if (fastbootInstalled) {
    const devicesRaw = safeExec(`${fastbootCmd} devices`);
    const lines = devicesRaw?.split('\n').filter(l => l.trim()) || [];
    
    fastbootDevices = lines.map(line => {
      const parts = line.trim().split(/\s+/);
      const serial = parts[0];
      const mode = parts[1] || 'fastboot';
      
      return {
        id: `fastboot-${serial}`,
        serial,
        state: mode,
        deviceMode: 'bootloader',
        bootloaderMode: mode,
        source: 'fastboot',
        properties: {}
      };
    }).filter(d => d.serial);
  }
  
  const allDevices = [...adbDevices, ...fastbootDevices];
  
  const uniqueDevices = allDevices.reduce((acc, device) => {
    const existing = acc.find(d => d.serial === device.serial);
    if (!existing) {
      acc.push(device);
    } else if (device.source === 'adb' && existing.source === 'fastboot') {
      Object.assign(existing, device);
    }
    return acc;
  }, []);
  
  res.json({
    count: uniqueDevices.length,
    devices: uniqueDevices,
    sources: {
      adb: {
        available: adbInstalled,
        count: adbDevices.length
      },
      fastboot: {
        available: fastbootInstalled,
        count: fastbootDevices.length
      }
    },
    timestamp: new Date().toISOString()
  });
});

app.post('/api/adb/command', (req, res) => {
  if (!commandExists("adb")) {
    return res.status(404).json({ error: "ADB not installed" });
  }
  
  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: "Command required" });
  }
  
  const allowedCommands = ['devices', 'shell getprop', 'get-state', 'get-serialno'];
  const isAllowed = allowedCommands.some(cmd => command.startsWith(cmd));
  
  if (!isAllowed) {
    return res.status(403).json({ error: "Command not allowed for security reasons" });
  }
  
  const output = safeExec(`adb ${command}`);
  res.json({ output });
});

app.post('/api/network/scan', async (req, res) => {
  try {
    const devices = [];
    
    if (commandExists('arp')) {
      const arpOutput = safeExec('arp -a');
      if (arpOutput) {
        const lines = arpOutput.split('\n');
        for (const line of lines) {
          const match = line.match(/\(([\d.]+)\)\s+at\s+([\w:]+)/);
          if (match) {
            devices.push({
              ip: match[1],
              mac: match[2],
              hostname: null,
              vendor: null,
              ports: [],
              services: []
            });
          }
        }
      }
    }
    
    if (commandExists('ip')) {
      const neighbors = safeExec('ip neigh show');
      if (neighbors) {
        const lines = neighbors.split('\n');
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5 && parts[0].match(/\d+\.\d+\.\d+\.\d+/)) {
            const existing = devices.find(d => d.ip === parts[0]);
            if (!existing) {
              devices.push({
                ip: parts[0],
                mac: parts[4],
                hostname: null,
                vendor: null,
                ports: [],
                services: []
              });
            }
          }
        }
      }
    }
    
    res.json({
      devices,
      count: devices.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Network scan error:', error);
    res.status(500).json({ error: 'Network scan failed' });
  }
});

app.get('/api/fastboot/device-info', (req, res) => {
  if (!commandExists("fastboot")) {
    return res.status(404).json({ error: "Fastboot not installed" });
  }

  const { serial } = req.query;
  if (!serial) {
    return res.status(400).json({ error: "Serial number required" });
  }

  try {
    const extractValue = (output) => {
      if (!output) return null;
      const match = output.match(/:\s*(.+)/);
      return match ? match[1].trim() : null;
    };

    const product = extractValue(safeExec(`fastboot -s ${serial} getvar product 2>&1`));
    const variant = extractValue(safeExec(`fastboot -s ${serial} getvar variant 2>&1`));
    const bootloaderVersion = extractValue(safeExec(`fastboot -s ${serial} getvar version-bootloader 2>&1`));
    const basebandVersion = extractValue(safeExec(`fastboot -s ${serial} getvar version-baseband 2>&1`));
    const serialNumber = extractValue(safeExec(`fastboot -s ${serial} getvar serialno 2>&1`));
    const secure = extractValue(safeExec(`fastboot -s ${serial} getvar secure 2>&1`));
    const unlocked = extractValue(safeExec(`fastboot -s ${serial} getvar unlocked 2>&1`));
    const maxDownloadSize = extractValue(safeExec(`fastboot -s ${serial} getvar max-download-size 2>&1`));
    const currentSlot = extractValue(safeExec(`fastboot -s ${serial} getvar current-slot 2>&1`));
    const slotCount = extractValue(safeExec(`fastboot -s ${serial} getvar slot-count 2>&1`));

    const bootloaderUnlocked = unlocked === 'yes' || unlocked === 'true';
    const isSecure = secure === 'yes' || secure === 'true';

    res.json({
      product,
      variant,
      bootloaderVersion,
      basebandVersion,
      serialNumber,
      secure: isSecure,
      bootloaderUnlocked,
      maxDownloadSize,
      currentSlot,
      slotCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to get device info:', error);
    res.status(500).json({ error: 'Failed to retrieve device information' });
  }
});

app.post('/api/fastboot/flash', async (req, res) => {
  if (!commandExists("fastboot")) {
    return res.status(404).json({ error: "Fastboot not installed" });
  }

  try {
    const multer = await import('multer');
    const upload = multer.default({ dest: '/tmp/fastboot-uploads/' });
    
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(500).json({ error: 'File upload failed', details: err.message });
      }

      const { serial, partition } = req.body;
      const file = req.file;

      if (!serial || !partition || !file) {
        return res.status(400).json({ error: "Serial, partition, and file are required" });
      }

      try {
        const output = execSync(
          `fastboot -s ${serial} flash ${partition} ${file.path}`,
          { encoding: 'utf-8', timeout: 120000 }
        );

        const fs = require('fs');
        fs.unlinkSync(file.path);

        res.json({
          success: true,
          output: output.trim(),
          message: `Successfully flashed ${partition}`,
          timestamp: new Date().toISOString()
        });
      } catch (flashError) {
        const fs = require('fs');
        if (file.path) {
          try { fs.unlinkSync(file.path); } catch {}
        }
        res.status(500).json({
          success: false,
          error: 'Flash operation failed',
          details: flashError.message
        });
      }
    });
  } catch (error) {
    console.error('Flash setup error:', error);
    res.status(500).json({ error: 'Flash operation setup failed', details: error.message });
  }
});

app.post('/api/fastboot/unlock', (req, res) => {
  if (!commandExists("fastboot")) {
    return res.status(404).json({ error: "Fastboot not installed" });
  }

  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ error: "Serial number required" });
  }

  try {
    const output = safeExec(`fastboot -s ${serial} oem unlock`);
    res.json({
      success: true,
      output: output,
      message: 'Bootloader unlock initiated. Follow device prompts.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Unlock operation failed',
      details: error.message
    });
  }
});

app.post('/api/fastboot/reboot', (req, res) => {
  if (!commandExists("fastboot")) {
    return res.status(404).json({ error: "Fastboot not installed" });
  }

  const { serial, mode } = req.body;
  if (!serial) {
    return res.status(400).json({ error: "Serial number required" });
  }

  const validModes = ['system', 'bootloader', 'recovery'];
  if (!validModes.includes(mode)) {
    return res.status(400).json({ error: "Invalid reboot mode" });
  }

  try {
    let command;
    if (mode === 'system') {
      command = `fastboot -s ${serial} reboot`;
    } else if (mode === 'bootloader') {
      command = `fastboot -s ${serial} reboot-bootloader`;
    } else if (mode === 'recovery') {
      command = `fastboot -s ${serial} reboot recovery`;
    }

    const output = safeExec(command);
    res.json({
      success: true,
      output: output,
      message: `Rebooting to ${mode}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Reboot operation failed',
      details: error.message
    });
  }
});

app.post('/api/fastboot/erase', (req, res) => {
  if (!commandExists("fastboot")) {
    return res.status(404).json({ error: "Fastboot not installed" });
  }

  const { serial, partition } = req.body;
  if (!serial || !partition) {
    return res.status(400).json({ error: "Serial and partition required" });
  }

  const criticalPartitions = ['boot', 'system', 'vendor', 'bootloader', 'radio', 'aboot', 'vbmeta'];
  if (criticalPartitions.includes(partition)) {
    return res.status(403).json({ error: "Cannot erase critical system partitions for safety" });
  }

  try {
    const output = safeExec(`fastboot -s ${serial} erase ${partition}`);
    res.json({
      success: true,
      output: output,
      message: `Partition ${partition} erased`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erase operation failed',
      details: error.message
    });
  }
});

app.get('/api/bootforgeusb/scan', (req, res) => {
  const useDemoData = req.query.demo === 'true';
  
  if (!commandExists("bootforgeusb-cli")) {
    if (useDemoData) {
      return res.json(generateDemoBootForgeData());
    }
    
    return res.status(503).json({ 
      error: "BootForgeUSB not available",
      message: "BootForgeUSB CLI tool is not installed or not in PATH",
      installInstructions: "Build and install from libs/bootforgeusb: cargo build --release && cargo install --path .",
      available: false
    });
  }

  try {
    const output = execSync('bootforgeusb-cli', { 
      encoding: 'utf-8', 
      timeout: 10000,
      maxBuffer: 10 * 1024 * 1024
    });
    
    const devices = JSON.parse(output);
    
    res.json({
      success: true,
      count: devices.length,
      devices,
      timestamp: new Date().toISOString(),
      available: true
    });
  } catch (error) {
    if (error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        error: 'BootForgeUSB scan timeout',
        message: 'Device scan took too long to complete',
        available: true
      });
    }
    
    console.error('BootForgeUSB scan error:', error);
    
    if (useDemoData) {
      return res.json(generateDemoBootForgeData());
    }
    
    res.status(500).json({
      error: 'BootForgeUSB scan failed',
      details: error.message,
      stderr: error.stderr?.toString() || null,
      available: true
    });
  }
});

function generateDemoBootForgeData() {
  const demoDevices = [
    {
      device_uid: "usb-18d1:4ee7-3-2",
      platform_hint: "android",
      mode: "Normal OS (Confirmed)",
      confidence: 0.95,
      evidence: {
        usb: {
          vid: "0x18d1",
          pid: "0x4ee7",
          manufacturer: "Google Inc.",
          product: "Pixel 6",
          serial: "1A2B3C4D5E6F",
          bus: 3,
          address: 2,
          interface_hints: [
            { class: 255, subclass: 66, protocol: 1 },
            { class: 255, subclass: 66, protocol: 3 }
          ]
        },
        tools: {
          adb: {
            present: true,
            seen: true,
            raw: "1A2B3C4D5E6F device",
            device_ids: ["1A2B3C4D5E6F"]
          },
          fastboot: {
            present: true,
            seen: false,
            raw: "",
            device_ids: []
          },
          idevice_id: {
            present: false,
            seen: false,
            raw: "",
            device_ids: []
          }
        }
      },
      notes: [
        "USB VID/PID matches Google Android Debug Bridge",
        "ADB tool detected device with serial 1A2B3C4D5E6F",
        "USB interface class 0xFF (Vendor Specific) with ADB-standard protocol",
        "Device confirmed in normal Android OS mode via ADB"
      ],
      matched_tool_ids: ["1A2B3C4D5E6F"],
      correlation_badge: "CORRELATED",
      correlation_notes: ["Per-device correlation present (matched tool ID(s))."]
    },
    {
      device_uid: "usb-05ac:12a8-1-5",
      platform_hint: "ios",
      mode: "Normal OS (Likely)",
      confidence: 0.88,
      evidence: {
        usb: {
          vid: "0x05ac",
          pid: "0x12a8",
          manufacturer: "Apple Inc.",
          product: "iPhone",
          serial: null,
          bus: 1,
          address: 5,
          interface_hints: [
            { class: 255, subclass: 254, protocol: 2 }
          ]
        },
        tools: {
          adb: {
            present: true,
            seen: false,
            raw: "",
            device_ids: []
          },
          fastboot: {
            present: true,
            seen: false,
            raw: "",
            device_ids: []
          },
          idevice_id: {
            present: false,
            seen: false,
            raw: "",
            device_ids: []
          }
        }
      },
      notes: [
        "USB VID matches Apple Inc. (0x05ac)",
        "PID 0x12a8 is standard iPhone enumeration",
        "No idevice_id tool available to confirm",
        "Classification based on USB evidence only"
      ],
      matched_tool_ids: [],
      correlation_badge: "LIKELY",
      correlation_notes: []
    },
    {
      device_uid: "usb-18d1:d00d-2-7",
      platform_hint: "android",
      mode: "Fastboot (Confirmed)",
      confidence: 0.92,
      evidence: {
        usb: {
          vid: "0x18d1",
          pid: "0xd00d",
          manufacturer: "Google Inc.",
          product: "Fastboot Device",
          serial: "FASTBOOT123ABC",
          bus: 2,
          address: 7,
          interface_hints: [
            { class: 255, subclass: 66, protocol: 3 }
          ]
        },
        tools: {
          adb: {
            present: true,
            seen: false,
            raw: "",
            device_ids: []
          },
          fastboot: {
            present: true,
            seen: true,
            raw: "FASTBOOT123ABC fastboot",
            device_ids: ["FASTBOOT123ABC"]
          },
          idevice_id: {
            present: false,
            seen: false,
            raw: "",
            device_ids: []
          }
        }
      },
      notes: [
        "USB VID/PID matches Google Fastboot protocol",
        "Fastboot tool detected device with serial FASTBOOT123ABC",
        "Device is in bootloader/fastboot mode",
        "Ready for flashing operations"
      ],
      matched_tool_ids: ["FASTBOOT123ABC"],
      correlation_badge: "CORRELATED",
      correlation_notes: ["Per-device correlation present (matched tool ID(s))."]
    },
    {
      device_uid: "usb-2717:ff48-3-4",
      platform_hint: "android",
      mode: "Normal OS (Likely)",
      confidence: 0.78,
      evidence: {
        usb: {
          vid: "0x2717",
          pid: "0xff48",
          manufacturer: "Xiaomi",
          product: "Mi Device",
          serial: "XIAOMI987654",
          bus: 3,
          address: 4,
          interface_hints: [
            { class: 255, subclass: 66, protocol: 1 }
          ]
        },
        tools: {
          adb: {
            present: true,
            seen: false,
            raw: "",
            device_ids: []
          },
          fastboot: {
            present: true,
            seen: false,
            raw: "",
            device_ids: []
          },
          idevice_id: {
            present: false,
            seen: false,
            raw: "",
            device_ids: []
          }
        }
      },
      notes: [
        "USB VID matches Xiaomi manufacturer code",
        "Interface class suggests Android ADB protocol",
        "ADB tool present but device not visible (possible USB authorization pending)",
        "Classification confidence reduced due to lack of tool confirmation"
      ],
      matched_tool_ids: [],
      correlation_badge: "LIKELY",
      correlation_notes: []
    }
  ];

  return {
    success: true,
    count: demoDevices.length,
    devices: demoDevices,
    timestamp: new Date().toISOString(),
    available: false,
    demo: true,
    message: "Showing demo data - BootForgeUSB CLI not available"
  };
}

app.get('/api/bootforgeusb/status', (req, res) => {
  const cliAvailable = commandExists("bootforgeusb-cli");
  const rustcAvailable = commandExists("rustc");
  const cargoAvailable = commandExists("cargo");
  
  let buildPath = null;
  let libInfo = null;
  
  if (rustcAvailable && cargoAvailable) {
    try {
      const manifestPath = '../libs/bootforgeusb/Cargo.toml';
      const fs = require('fs');
      if (fs.existsSync(manifestPath)) {
        buildPath = '../libs/bootforgeusb';
        const manifest = fs.readFileSync(manifestPath, 'utf-8');
        const versionMatch = manifest.match(/version\s*=\s*"([^"]+)"/);
        libInfo = {
          path: buildPath,
          version: versionMatch ? versionMatch[1] : null
        };
      }
    } catch (e) {
    }
  }
  
  const adbAvailable = commandExists("adb");
  const fastbootAvailable = commandExists("fastboot");
  const ideviceAvailable = commandExists("idevice_id");
  
  res.json({
    available: cliAvailable,
    cli: {
      installed: cliAvailable,
      command: 'bootforgeusb-cli'
    },
    buildEnvironment: {
      rust: rustcAvailable,
      cargo: cargoAvailable,
      canBuild: rustcAvailable && cargoAvailable
    },
    library: libInfo,
    systemTools: {
      adb: adbAvailable,
      fastboot: fastbootAvailable,
      idevice_id: ideviceAvailable
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/bootforgeusb/devices/:uid', (req, res) => {
  if (!commandExists("bootforgeusb-cli")) {
    return res.status(503).json({ 
      error: "BootForgeUSB not available",
      available: false
    });
  }

  try {
    const output = execSync('bootforgeusb-cli', { 
      encoding: 'utf-8', 
      timeout: 10000 
    });
    
    const devices = JSON.parse(output);
    const device = devices.find(d => d.device_uid === req.params.uid);
    
    if (!device) {
      return res.status(404).json({
        error: 'Device not found',
        uid: req.params.uid
      });
    }
    
    res.json({
      success: true,
      device,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('BootForgeUSB device lookup error:', error);
    res.status(500).json({
      error: 'Failed to look up device',
      details: error.message
    });
  }
});

app.get('/api/bootforgeusb/correlate', (req, res) => {
  if (!commandExists("bootforgeusb-cli")) {
    return res.status(503).json({ 
      error: "BootForgeUSB not available",
      available: false
    });
  }

  const adbAvailable = commandExists("adb");
  const fastbootAvailable = commandExists("fastboot");

  try {
    const bootforgeOutput = execSync('bootforgeusb-cli', { 
      encoding: 'utf-8', 
      timeout: 10000 
    });
    
    const devices = JSON.parse(bootforgeOutput);
    
    const correlationResults = devices.map(device => {
      const result = {
        device_uid: device.device_uid,
        platform: device.platform_hint,
        mode: device.mode,
        confidence: device.confidence,
        correlation: {
          method: 'none',
          confidence_boost: 0,
          matched_ids: device.matched_tool_ids || [],
          details: []
        }
      };
      
      if (device.matched_tool_ids && device.matched_tool_ids.length > 0) {
        result.correlation.method = 'tool_confirmed';
        result.correlation.confidence_boost = 0.15;
        result.correlation.details.push(`Correlated via ${device.matched_tool_ids.length} tool ID(s)`);
      } else if (device.mode.includes('likely')) {
        result.correlation.method = 'usb_heuristic';
        result.correlation.details.push('USB-only classification, tool confirmation unavailable');
      } else if (device.mode.includes('confirmed')) {
        result.correlation.method = 'system_level';
        result.correlation.details.push('System-level tool confirmation');
      }
      
      return result;
    });
    
    res.json({
      success: true,
      count: correlationResults.length,
      devices: correlationResults,
      tools_available: {
        adb: adbAvailable,
        fastboot: fastbootAvailable
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('BootForgeUSB correlation error:', error);
    res.status(500).json({
      error: 'Correlation analysis failed',
      details: error.message
    });
  }
});

app.post('/api/bootforgeusb/build', async (req, res) => {
  if (!commandExists("cargo")) {
    return res.status(503).json({
      error: "Rust toolchain not available",
      message: "cargo command not found in PATH"
    });
  }

  const buildPath = '../libs/bootforgeusb';
  const fs = require('fs');
  
  if (!fs.existsSync(buildPath)) {
    return res.status(404).json({
      error: "BootForgeUSB source not found",
      message: `Expected path: ${buildPath}`
    });
  }

  try {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked'
    });

    res.write(JSON.stringify({ 
      status: 'starting',
      message: 'Building BootForgeUSB CLI...',
      timestamp: new Date().toISOString()
    }) + '\n');

    const buildOutput = execSync(
      'cargo build --release --bin bootforgeusb-cli',
      {
        cwd: buildPath,
        encoding: 'utf-8',
        timeout: 300000,
        maxBuffer: 50 * 1024 * 1024
      }
    );

    res.write(JSON.stringify({
      status: 'installing',
      message: 'Installing CLI tool...',
      timestamp: new Date().toISOString()
    }) + '\n');

    const installOutput = execSync(
      'cargo install --path . --bin bootforgeusb-cli',
      {
        cwd: buildPath,
        encoding: 'utf-8',
        timeout: 60000
      }
    );

    res.write(JSON.stringify({
      status: 'complete',
      message: 'BootForgeUSB CLI built and installed successfully',
      buildOutput: buildOutput.trim(),
      installOutput: installOutput.trim(),
      timestamp: new Date().toISOString()
    }) + '\n');

    res.end();
  } catch (error) {
    res.write(JSON.stringify({
      status: 'failed',
      error: 'Build failed',
      details: error.message,
      stderr: error.stderr?.toString() || null,
      timestamp: new Date().toISOString()
    }) + '\n');
    res.end();
  }
});


// Flashing operations are intentionally disabled until they are backed by real tooling.
// "Truth-first" policy: no simulated flashing, no fake progress.
let monitoringActive = false;
let testHistory = [];

let lastCpuSample = null;

function sampleCpuTimes() {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;
  for (const cpu of cpus) {
    idle += cpu.times.idle;
    total += cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq;
  }
  return { idle, total };
}

function getCpuPercent() {
  try {
    const now = sampleCpuTimes();
    if (!lastCpuSample) {
      lastCpuSample = now;
      return null;
    }
    const idleDiff = now.idle - lastCpuSample.idle;
    const totalDiff = now.total - lastCpuSample.total;
    lastCpuSample = now;
    if (totalDiff <= 0) return null;
    const busy = 1 - idleDiff / totalDiff;
    const pct = Math.round(Math.max(0, Math.min(1, busy)) * 100);
    return pct;
  } catch {
    return null;
  }
}

async function measureDiskWriteMBps(bytesToWrite = 4 * 1024 * 1024) {
  const tmpPath = path.join(os.tmpdir(), `bw-monitor-bench-${process.pid}-${Date.now()}.tmp`);
  const buffer = Buffer.alloc(bytesToWrite, 0);
  const start = process.hrtime.bigint();
  try {
    await fs.promises.writeFile(tmpPath, buffer);
  } finally {
    await fs.promises.unlink(tmpPath).catch(() => {});
  }
  const end = process.hrtime.bigint();
  const seconds = Number(end - start) / 1e9;
  if (!seconds || seconds <= 0) return null;
  const mb = bytesToWrite / (1024 * 1024);
  const mbps = mb / seconds;
  if (!Number.isFinite(mbps)) return null;
  return Number(mbps.toFixed(2));
}

function getDiskUsedPercent() {
  try {
    if (typeof fs.statfsSync !== 'function') return null;
    const stat = fs.statfsSync(process.cwd());
    const total = stat.bsize * stat.blocks;
    const free = stat.bsize * stat.bavail;
    if (!total || total <= 0) return null;
    const used = total - free;
    const pct = Math.round((used / total) * 100);
    return Math.max(0, Math.min(100, pct));
  } catch {
    return null;
  }
}

const wssFlashProgress = new WebSocketServer({ server, path: '/ws/flash-progress' });
const flashProgressClients = new Map();
const flashProgressMonitorClients = new Set();

wssFlashProgress.on('connection', (ws, req) => {
  const rawUrl = req.url || '';
  const parts = rawUrl.split('/').filter(Boolean);
  const maybeJobId = parts.length ? parts[parts.length - 1] : null;

  // Two supported patterns:
  // - /ws/flash-progress            -> monitor (all jobs)
  // - /ws/flash-progress/{jobId}    -> job-specific
  const isMonitor = !maybeJobId || maybeJobId === 'flash-progress';

  if (isMonitor) {
    console.log('[Flash WS] Monitor client connected');
    flashProgressMonitorClients.add(ws);

    ws.on('message', (data) => {
      try {
        const text = typeof data === 'string' ? data : data.toString();
        const message = JSON.parse(text);
        if (message?.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }
      } catch {
        // ignore
      }
    });

    ws.on('close', () => {
      console.log('[Flash WS] Monitor client disconnected');
      flashProgressMonitorClients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('[Flash WS] Monitor error:', error);
      flashProgressMonitorClients.delete(ws);
    });

    return;
  }

  const jobId = maybeJobId;
  console.log(`[Flash WS] Client connected for job ${jobId}`);
  flashProgressClients.set(jobId, ws);

  ws.on('message', (data) => {
    try {
      const text = typeof data === 'string' ? data : data.toString();
      const message = JSON.parse(text);
      if (message?.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      }
    } catch {
      // ignore
    }
  });

  ws.on('close', () => {
    console.log(`[Flash WS] Client disconnected for job ${jobId}`);
    flashProgressClients.delete(jobId);
  });

  ws.on('error', (error) => {
    console.error(`[Flash WS] Error for job ${jobId}:`, error);
    flashProgressClients.delete(jobId);
  });
});

function broadcastFlashProgress(jobId, data) {
  const payload = JSON.stringify(data);

  const ws = flashProgressClients.get(jobId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(payload);
  }

  for (const client of flashProgressMonitorClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

// -----------------------------
// Flash execution (truth-first)
// -----------------------------

// In-memory job registry. This is intentionally ephemeral (dev-tool workflow).
const flashJobs = new Map();
const flashHistory = [];

function nowIso() {
  return new Date().toISOString();
}

function safePartitionName(name) {
  return typeof name === 'string' && /^[a-zA-Z0-9._-]{1,32}$/.test(name);
}

function emitFlashUpdate(jobId, type, data) {
  broadcastFlashProgress(jobId, {
    type,
    jobId,
    timestamp: Date.now(),
    data,
  });
}

function pushFlashLog(job, message) {
  const line = `[${new Date().toLocaleTimeString()}] ${message}`;
  job.logs.push(line);
  emitFlashUpdate(job.id, 'log', { message });
}

function setFlashStatus(job, status, stage) {
  job.progress.status = status;
  if (typeof stage === 'string') job.progress.currentStage = stage;
  emitFlashUpdate(job.id, 'status', { status });
}

function finalizeJob(job, status, errorMessage) {
  job.progress.status = status;
  job.progress.completedAt = Date.now();
  if (errorMessage) job.progress.error = errorMessage;
  emitFlashUpdate(job.id, 'status', { status });

  // Move to history and remove from active map.
  flashJobs.delete(job.id);
  flashHistory.unshift({
    id: job.id,
    jobConfig: job.jobConfig,
    progress: job.progress,
    logs: job.logs,
    endedAt: nowIso(),
  });
  if (flashHistory.length > 200) flashHistory.length = 200;
}

function getFastbootCmd() {
  // Prefer managed tool path if available.
  return getToolCommand('fastboot') || 'fastboot';
}

async function runFastbootJob(job) {
  const { deviceSerial, partitions, autoReboot, wipeUserData } = job.jobConfig;
  const fastbootCmd = getFastbootCmd();

  setFlashStatus(job, 'preparing', 'Preparing fastboot session');
  pushFlashLog(job, `Starting fastboot flash job for ${deviceSerial}`);

  // Basic sanity check: device present in fastboot list.
  const fastbootList = safeExec(`${fastbootCmd} devices`);
  if (!fastbootList || !fastbootList.includes(deviceSerial)) {
    const msg = `Device ${deviceSerial} not detected by fastboot. Ensure the device is in fastboot/bootloader mode.`;
    pushFlashLog(job, msg);
    finalizeJob(job, 'failed', msg);
    return;
  }

  setFlashStatus(job, 'flashing', 'Flashing partitions');

  for (let i = 0; i < partitions.length; i++) {
    if (job.cancelRequested) {
      pushFlashLog(job, 'Cancel requested. Stopping before next partition.');
      finalizeJob(job, 'cancelled');
      return;
    }

    const part = partitions[i];
    job.progress.currentPartition = part.name;
    job.progress.currentStage = `Flashing ${part.name}`;

    pushFlashLog(job, `Flashing partition '${part.name}' from ${part.imagePath}`);

    const args = ['-s', deviceSerial, 'flash', part.name, part.imagePath];
    const child = spawn(fastbootCmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    job.activeChild = child;

    child.stdout.on('data', (buf) => {
      const text = buf.toString();
      text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .forEach((line) => pushFlashLog(job, `[fastboot] ${line}`));
    });
    child.stderr.on('data', (buf) => {
      const text = buf.toString();
      text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .forEach((line) => pushFlashLog(job, `[fastboot:err] ${line}`));
    });

    const exitCode = await new Promise((resolve) => {
      child.on('close', (code) => resolve(typeof code === 'number' ? code : 1));
      child.on('error', () => resolve(1));
    });

    job.activeChild = null;

    if (job.cancelRequested) {
      pushFlashLog(job, 'Cancel requested. Marking job cancelled.');
      finalizeJob(job, 'cancelled');
      return;
    }

    if (exitCode !== 0) {
      const msg = `Fastboot flash failed for partition '${part.name}' (exit ${exitCode}).`;
      pushFlashLog(job, msg);
      finalizeJob(job, 'failed', msg);
      return;
    }

    const overall = Math.round(((i + 1) / partitions.length) * 100);
    job.progress.overallProgress = overall;
    job.progress.partitionProgress = 100;
    emitFlashUpdate(job.id, 'progress', { progress: overall });
  }

  if (wipeUserData) {
    if (job.cancelRequested) {
      pushFlashLog(job, 'Cancel requested before wipe. Skipping wipe.');
      finalizeJob(job, 'cancelled');
      return;
    }
    job.progress.currentStage = 'Wiping user data (-w)';
    pushFlashLog(job, 'Running fastboot wipe (-w)');

    const wipeArgs = ['-s', deviceSerial, '-w'];
    const wipe = spawn(fastbootCmd, wipeArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
    job.activeChild = wipe;
    wipe.stdout.on('data', (buf) => {
      const text = buf.toString();
      text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .forEach((line) => pushFlashLog(job, `[fastboot] ${line}`));
    });
    wipe.stderr.on('data', (buf) => {
      const text = buf.toString();
      text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .forEach((line) => pushFlashLog(job, `[fastboot:err] ${line}`));
    });

    const wipeExit = await new Promise((resolve) => {
      wipe.on('close', (code) => resolve(typeof code === 'number' ? code : 1));
      wipe.on('error', () => resolve(1));
    });
    job.activeChild = null;

    if (wipeExit !== 0) {
      const msg = `Fastboot wipe failed (exit ${wipeExit}).`;
      pushFlashLog(job, msg);
      finalizeJob(job, 'failed', msg);
      return;
    }
  }

  if (autoReboot) {
    if (job.cancelRequested) {
      pushFlashLog(job, 'Cancel requested before reboot. Skipping reboot.');
      finalizeJob(job, 'cancelled');
      return;
    }
    job.progress.currentStage = 'Rebooting device';
    pushFlashLog(job, 'Rebooting via fastboot reboot');

    const rebootArgs = ['-s', deviceSerial, 'reboot'];
    const reboot = spawn(fastbootCmd, rebootArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
    job.activeChild = reboot;
    reboot.stdout.on('data', (buf) => {
      const text = buf.toString();
      text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .forEach((line) => pushFlashLog(job, `[fastboot] ${line}`));
    });
    reboot.stderr.on('data', (buf) => {
      const text = buf.toString();
      text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .forEach((line) => pushFlashLog(job, `[fastboot:err] ${line}`));
    });

    await new Promise((resolve) => {
      reboot.on('close', () => resolve(true));
      reboot.on('error', () => resolve(true));
    });
    job.activeChild = null;
  }

  job.progress.currentStage = 'Completed';
  job.progress.overallProgress = 100;
  emitFlashUpdate(job.id, 'progress', { progress: 100 });
  finalizeJob(job, 'completed');
}

app.get('/api/flash/devices', async (req, res) => {
  try {
    const devices = [];
    
    if (commandExists('adb')) {
      const adbOutput = safeExec('adb devices -l');
      if (adbOutput) {
        const lines = adbOutput.split('\n').slice(1).filter(l => l.trim());
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          const serial = parts[0];
          const state = parts[1];
          const infoStr = parts.slice(2).join(' ');
          
          if (serial && state && state !== 'unauthorized' && state !== 'offline') {
            const model = infoStr.match(/model:(\S+)/)?.[1] || 'Unknown';
            const product = infoStr.match(/product:(\S+)/)?.[1] || 'Unknown';
            
            devices.push({
              serial,
              brand: 'Android',
              model: model.replace(/_/g, ' '),
              mode: state === 'device' ? 'Normal OS' : state,
              capabilities: state === 'device' 
                ? ['adb-sideload'] 
                : state === 'recovery' 
                ? ['adb-sideload'] 
                : [],
              connectionType: 'usb',
              isBootloader: state === 'bootloader',
              isRecovery: state === 'recovery',
              isDFU: false,
              isEDL: false
            });
          }
        }
      }
    }
    
    if (commandExists('fastboot')) {
      const fastbootOutput = safeExec('fastboot devices');
      if (fastbootOutput) {
        const lines = fastbootOutput.split('\n').filter(l => l.trim());
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          const serial = parts[0];
          const mode = parts[1] || 'fastboot';
          
          if (serial) {
            const existing = devices.find(d => d.serial === serial);
            if (existing) {
              existing.isBootloader = true;
              existing.capabilities.push('fastboot');
            } else {
              devices.push({
                serial,
                brand: 'Android',
                model: 'Unknown',
                mode: 'Fastboot',
                capabilities: ['fastboot'],
                connectionType: 'usb',
                isBootloader: true,
                isRecovery: false,
                isDFU: false,
                isEDL: false
              });
            }
          }
        }
      }
    }
    
    res.json({
      success: true,
      count: devices.length,
      devices,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Flash API] Device scan failed:', error);
    res.status(500).json({
      success: false,
      error: 'Device scan failed',
      devices: [],
      count: 0
    });
  }
});

app.get('/api/flash/devices/:serial', async (req, res) => {
  const { serial } = req.params;
  
  try {
    const adbCmd = getToolCommand('adb');
    const fastbootCmd = getToolCommand('fastboot');

    let deviceInfo = {
      serial,
      found: false
    };
    
    if (commandExists('adb')) {
      const adbDevices = safeExec(`${adbCmd} devices`);
      if (adbDevices && adbDevices.includes(serial)) {
        const props = safeExec(`${adbCmd} -s ${serial} shell getprop`);
        if (props) {
          deviceInfo = {
            serial,
            found: true,
            source: 'adb',
            manufacturer: props.match(/\[ro\.product\.manufacturer\]:\s*\[(.*?)\]/)?.[1],
            brand: props.match(/\[ro\.product\.brand\]:\s*\[(.*?)\]/)?.[1],
            model: props.match(/\[ro\.product\.model\]:\s*\[(.*?)\]/)?.[1],
            androidVersion: props.match(/\[ro\.build\.version\.release\]:\s*\[(.*?)\]/)?.[1],
            sdkVersion: props.match(/\[ro\.build\.version\.sdk\]:\s*\[(.*?)\]/)?.[1],
            buildId: props.match(/\[ro\.build\.id\]:\s*\[(.*?)\]/)?.[1]
          };
        }
      }
    }
    
    if (!deviceInfo.found && commandExists('fastboot')) {
      const fastbootDevices = safeExec(`${fastbootCmd} devices`);
      if (fastbootDevices && fastbootDevices.includes(serial)) {
        const extractValue = (output) => {
          if (!output) return null;
          const match = output.match(/:\s*(.+)/);
          return match ? match[1].trim() : null;
        };
        
        deviceInfo = {
          serial,
          found: true,
          source: 'fastboot',
          product: extractValue(safeExec(`fastboot -s ${serial} getvar product 2>&1`)),
          variant: extractValue(safeExec(`fastboot -s ${serial} getvar variant 2>&1`)),
          bootloaderVersion: extractValue(safeExec(`fastboot -s ${serial} getvar version-bootloader 2>&1`)),
          unlocked: extractValue(safeExec(`fastboot -s ${serial} getvar unlocked 2>&1`))
        };
      }
    }
    
    if (!deviceInfo.found) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
        serial
      });
    }
    
    res.json({
      success: true,
      device: deviceInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Flash API] Get device info failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get device info'
    });
  }
});

app.get('/api/flash/devices/:serial/partitions', async (req, res) => {
  const { serial } = req.params;
  
  try {
    res.status(501).json({
      success: false,
      error: 'Partition enumeration is not implemented',
      serial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get partitions'
    });
  }
});

app.get('/api/flash/capabilities', (req, res) => {
  const adbAvailable = commandExists('adb');
  const fastbootAvailable = commandExists('fastboot');

  const supportedMethods = [];
  if (fastbootAvailable) supportedMethods.push('fastboot');
  if (adbAvailable) supportedMethods.push('adb-sideload');

  res.json({
    success: true,
    enabled: fastbootAvailable,
    supportedMethods,
    requirements: {
      fastboot: fastbootAvailable ? 'available' : 'missing',
      adb: adbAvailable ? 'available' : 'missing',
    },
    timestamp: nowIso(),
  });
});

app.post('/api/flash/validate-image', async (req, res) => {
  const { filePath } = req.body;
  
  if (!filePath) {
    return res.status(400).json({
      valid: false,
      error: 'File path required'
    });
  }
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    if (!fs.existsSync(filePath)) {
      return res.json({
        valid: false,
        error: 'File does not exist'
      });
    }
    
    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    const validExtensions = ['.img', '.zip', '.tar', '.bin'];
    if (!validExtensions.includes(ext)) {
      return res.json({
        valid: false,
        error: 'Invalid file type'
      });
    }
    
    res.json({
      valid: true,
      type: ext.substring(1),
      size: stats.size,
      path: filePath
    });
  } catch (error) {
    res.json({
      valid: false,
      error: error.message
    });
  }
});

app.post('/api/flash/start', async (req, res) => {
  try {
    const config = req.body;
    const deviceSerial = typeof config?.deviceSerial === 'string' ? config.deviceSerial : '';
    const flashMethod = config?.flashMethod;
    const partitions = Array.isArray(config?.partitions) ? config.partitions : [];

    if (!deviceSerial) {
      return res.status(400).json({
        success: false,
        error: 'deviceSerial is required',
      });
    }

    if (flashMethod !== 'fastboot') {
      return res.status(501).json({
        success: false,
        error: `Flash method '${flashMethod}' is not supported yet`,
        supportedMethods: ['fastboot'],
      });
    }

    if (!commandExists('fastboot')) {
      return res.status(412).json({
        success: false,
        error: 'fastboot not available',
        message: 'Install Android platform-tools (fastboot) and ensure it is available in PATH.',
      });
    }

    if (!partitions.length) {
      return res.status(400).json({
        success: false,
        error: 'At least one partition is required',
      });
    }

    for (const p of partitions) {
      if (!safePartitionName(p?.name)) {
        return res.status(400).json({
          success: false,
          error: `Invalid partition name: ${String(p?.name)}`,
        });
      }
      if (typeof p?.imagePath !== 'string' || !p.imagePath) {
        return res.status(400).json({
          success: false,
          error: `Missing imagePath for partition '${p?.name}'`,
        });
      }
      if (!fs.existsSync(p.imagePath)) {
        return res.status(400).json({
          success: false,
          error: `Image file not found: ${p.imagePath}`,
        });
      }
    }

    const jobId = randomUUID();

    const job = {
      id: jobId,
      jobConfig: config,
      createdAt: Date.now(),
      cancelRequested: false,
      activeChild: null,
      logs: [],
      progress: {
        jobId,
        deviceSerial,
        deviceBrand: config?.deviceBrand || 'unknown',
        status: 'preparing',
        currentPartition: undefined,
        overallProgress: 0,
        partitionProgress: 0,
        bytesTransferred: 0,
        totalBytes: 0,
        transferSpeed: 0,
        estimatedTimeRemaining: 0,
        currentStage: 'Queued',
        startedAt: Date.now(),
        warnings: [],
      },
    };

    flashJobs.set(jobId, job);

    // Respond immediately so the UI can connect job-specific WS.
    res.json({ jobId });

    // Fire and forget.
    runFastbootJob(job).catch((error) => {
      const msg = error instanceof Error ? error.message : 'Unknown flash error';
      pushFlashLog(job, `Unhandled error: ${msg}`);
      finalizeJob(job, 'failed', msg);
    });
  } catch (error) {
    console.error('[Flash API] Start failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start flash operation',
    });
  }
});
app.post('/api/flash/pause/:jobId', async (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Pause is not supported for fastboot flashing',
  });
});

app.post('/api/flash/resume/:jobId', async (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Resume is not supported for fastboot flashing',
  });
});

app.post('/api/flash/cancel/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const job = flashJobs.get(jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Job not found',
      jobId,
    });
  }

  job.cancelRequested = true;
  pushFlashLog(job, 'Cancel requested via API');

  try {
    if (job.activeChild && typeof job.activeChild.kill === 'function') {
      job.activeChild.kill('SIGTERM');
    }
  } catch {
    // best-effort
  }

  // If the runner is between partitions it will finalize as cancelled.
  // If the child exits non-zero due to kill, runner will mark failed; we prefer cancelled.
  job.progress.status = 'cancelled';
  emitFlashUpdate(jobId, 'status', { status: 'cancelled' });

  return res.json({ success: true, jobId, message: 'Cancel requested' });
});

app.get('/api/flash/status/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const job = flashJobs.get(jobId);
  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Job not found',
      jobId,
    });
  }

  res.json({
    success: true,
    jobId,
    progress: job.progress,
    logs: job.logs,
    timestamp: nowIso(),
  });
});

app.get('/api/flash/operations/active', async (req, res) => {
  const operations = Array.from(flashJobs.values()).map((job) => ({
    id: job.id,
    jobConfig: job.jobConfig,
    progress: job.progress,
    logs: job.logs,
    canPause: false,
    canResume: false,
    canCancel: true,
  }));

  res.json({
    success: true,
    operations,
    count: operations.length,
    timestamp: nowIso(),
  });
});

app.get('/api/flash/history', (req, res) => {
  const limitRaw = req.query?.limit;
  const limit = Math.max(1, Math.min(200, Number(limitRaw) || 50));
  const history = flashHistory.slice(0, limit);
  res.json({
    success: true,
    history,
    count: history.length,
    timestamp: nowIso(),
  });
});

app.post('/api/monitor/start', (req, res) => {
  monitoringActive = true;
  res.json({ status: 'monitoring started', active: true, timestamp: new Date().toISOString() });
});

app.post('/api/monitor/stop', (req, res) => {
  monitoringActive = false;
  res.json({ status: 'monitoring stopped', active: false, timestamp: new Date().toISOString() });
});

app.get('/api/monitor/live', async (req, res) => {
  if (!monitoringActive) {
    return res.json({ 
      status: 'not monitoring',
      active: false 
    });
  }

  const cpuPercent = getCpuPercent();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memoryPercent = totalMem ? Math.round(((totalMem - freeMem) / totalMem) * 100) : null;

  let speedMBps = null;
  try {
    speedMBps = await measureDiskWriteMBps();
  } catch {
    speedMBps = null;
  }

  const diskUsedPercent = getDiskUsedPercent();

  res.json({
    speed: speedMBps,
    cpu: cpuPercent,
    memory: memoryPercent,
    usb: null,
    disk: diskUsedPercent,
    timestamp: new Date().toISOString(),
    active: true
  });
});

app.post('/api/tests/run', async (req, res) => {
  const results = [];

  const addResult = (name, status, details, durationMs) => {
    results.push({
      name,
      status,
      duration: typeof durationMs === 'number' ? Math.max(0, Math.round(durationMs)) : undefined,
      details
    });
  };

  // Backend health
  addResult('Backend API Health', 'PASS', 'API is responding', 0);

  // Filesystem write sanity check (temp dir)
  {
    const start = process.hrtime.bigint();
    const testPath = path.join(os.tmpdir(), `bw-selftest-${process.pid}-${Date.now()}.tmp`);
    try {
      await fs.promises.writeFile(testPath, 'ok', { encoding: 'utf8' });
      await fs.promises.unlink(testPath).catch(() => {});
      const end = process.hrtime.bigint();
      addResult('Filesystem Write Test', 'PASS', `Wrote temp file in ${os.tmpdir()}`, Number(end - start) / 1e6);
    } catch (error) {
      const end = process.hrtime.bigint();
      addResult('Filesystem Write Test', 'FAIL', `Failed to write temp file in ${os.tmpdir()}: ${error?.message || String(error)}`, Number(end - start) / 1e6);
    }
  }

  // Tool checks
  {
    const start = process.hrtime.bigint();
    const adbInstalled = commandExists('adb');
    const adbVersion = adbInstalled ? safeExec(`${getToolCommand('adb')} --version`) : null;
    const end = process.hrtime.bigint();

    if (adbInstalled) {
      addResult('ADB Tool Check', 'PASS', adbVersion ? adbVersion.split('\n')[0] : 'adb found', Number(end - start) / 1e6);
    } else {
      addResult('ADB Tool Check', 'WARNING', 'adb not found on PATH (Android features limited)', Number(end - start) / 1e6);
    }
  }

  {
    const start = process.hrtime.bigint();
    const fastbootInstalled = commandExists('fastboot');
    const fastbootVersion = fastbootInstalled ? safeExec(`${getToolCommand('fastboot')} --version`) : null;
    const end = process.hrtime.bigint();

    if (fastbootInstalled) {
      addResult('Fastboot Tool Check', 'PASS', fastbootVersion ? fastbootVersion.split('\n')[0] : 'fastboot found', Number(end - start) / 1e6);
    } else {
      addResult('Fastboot Tool Check', 'WARNING', 'fastboot not found on PATH (Android bootloader features limited)', Number(end - start) / 1e6);
    }
  }

  // Managed platform-tools directory (if available)
  {
    const start = process.hrtime.bigint();
    try {
      const dir = getManagedPlatformToolsDir();
      const exists = !!dir && fs.existsSync(dir);
      const end = process.hrtime.bigint();
      if (exists) {
        addResult('Managed Platform-Tools Directory', 'PASS', `Found: ${dir}`, Number(end - start) / 1e6);
      } else {
        addResult('Managed Platform-Tools Directory', 'SKIPPED', 'Managed platform-tools not present (run system-tools ensure to install)', Number(end - start) / 1e6);
      }
    } catch (error) {
      const end = process.hrtime.bigint();
      addResult('Managed Platform-Tools Directory', 'WARNING', `Could not determine managed platform-tools directory: ${error?.message || String(error)}`, Number(end - start) / 1e6);
    }
  }
  
  const testRun = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.status === 'PASS').length,
      failed: results.filter(r => r.status === 'FAIL').length,
      warnings: results.filter(r => r.status === 'WARNING').length,
      skipped: results.filter(r => r.status === 'SKIPPED').length
    }
  };
  
  testHistory.unshift(testRun);
  if (testHistory.length > 20) testHistory = testHistory.slice(0, 20);
  
  res.json(testRun);
});

app.get('/api/tests/results', (req, res) => {
  res.json(testHistory);
});

app.get('/api/standards', (req, res) => {
  const standards = [
    {
      category: 'flash_speed',
      metric: 'Flash Speed',
      levels: [
        { level: 'Optimal', threshold: '> 500 MB/s', description: 'USB 3.2 Gen 2 (Best-in-class)' },
        { level: 'Good', threshold: '200-500 MB/s', description: 'USB 3.1 (Meets standards)' },
        { level: 'Acceptable', threshold: '50-200 MB/s', description: 'USB 3.0 (Below average)' },
        { level: 'Poor', threshold: '< 50 MB/s', description: 'USB 2.0 (Action required)' }
      ]
    },
    {
      category: 'usb_bandwidth',
      metric: 'USB Bandwidth Utilization',
      levels: [
        { level: 'Optimal', threshold: '> 80%', description: 'Maximum throughput achieved' },
        { level: 'Good', threshold: '60-80%', description: 'Efficient bandwidth usage' },
        { level: 'Acceptable', threshold: '40-60%', description: 'Moderate efficiency' },
        { level: 'Poor', threshold: '< 40%', description: 'Bandwidth underutilized' }
      ]
    },
    {
      category: 'random_write_iops',
      metric: 'Random Write IOPS',
      levels: [
        { level: 'Optimal', threshold: '> 10000', description: 'NVMe-class performance' },
        { level: 'Good', threshold: '5000-10000', description: 'High-end eMMC' },
        { level: 'Acceptable', threshold: '1000-5000', description: 'Standard eMMC' },
        { level: 'Poor', threshold: '< 1000', description: 'Legacy storage' }
      ]
    },
    {
      category: 'fastboot_throughput',
      metric: 'Fastboot Flash Throughput',
      levels: [
        { level: 'Optimal', threshold: '> 40 MB/s', description: 'Modern devices' },
        { level: 'Good', threshold: '25-40 MB/s', description: 'Mid-range devices' },
        { level: 'Acceptable', threshold: '15-25 MB/s', description: 'Older devices' },
        { level: 'Poor', threshold: '< 15 MB/s', description: 'Very old/throttled' }
      ]
    }
  ];
  
  res.json({
    standards,
    reference: 'USB-IF, JEDEC, Android Platform Tools',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/hotplug/events', (req, res) => {
  res.json({
    events: [],
    timestamp: new Date().toISOString()
  });
});

app.post('/api/authorization/adb/trigger-usb-debugging', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.triggerADBUSBDebugging(serial);
  res.json(result);
});

app.post('/api/authorization/adb/trigger-file-transfer', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.triggerFileTransferAuth(serial);
  res.json(result);
});

app.post('/api/authorization/adb/trigger-backup', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.triggerBackupAuth(serial);
  res.json(result);
});

app.post('/api/authorization/adb/trigger-screen-capture', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.triggerScreenCaptureAuth(serial);
  res.json(result);
});

app.post('/api/authorization/adb/trigger-install', async (req, res) => {
  const { serial, apkPath } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.triggerADBInstallAuth(serial, apkPath);
  res.json(result);
});

app.post('/api/authorization/adb/trigger-wifi-adb', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.triggerWiFiADBAuth(serial);
  res.json(result);
});

app.post('/api/authorization/adb/verify-developer-options', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.verifyDeveloperOptions(serial);
  res.json(result);
});

app.post('/api/authorization/adb/check-debugging-status', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.checkUSBDebuggingStatus(serial);
  res.json(result);
});

app.post('/api/authorization/adb/reboot-recovery', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.rebootToRecovery(serial);
  res.json(result);
});

app.post('/api/authorization/adb/reboot-bootloader', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.rebootToBootloader(serial);
  res.json(result);
});

app.post('/api/authorization/adb/reboot-edl', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.rebootToEDL(serial);
  res.json(result);
});

app.post('/api/authorization/ios/trigger-trust-computer', async (req, res) => {
  const { udid } = req.body;
  if (!udid) {
    return res.status(400).json({ success: false, error: 'Device UDID required' });
  }
  const result = await AuthorizationTriggers.triggerIOSTrustComputer(udid);
  res.json(result);
});

app.post('/api/authorization/ios/trigger-pairing', async (req, res) => {
  const { udid } = req.body;
  if (!udid) {
    return res.status(400).json({ success: false, error: 'Device UDID required' });
  }
  const result = await AuthorizationTriggers.triggerIOSPairing(udid);
  res.json(result);
});

app.post('/api/authorization/ios/trigger-backup-encryption', async (req, res) => {
  const { udid } = req.body;
  if (!udid) {
    return res.status(400).json({ success: false, error: 'Device UDID required' });
  }
  const result = await AuthorizationTriggers.triggerIOSBackupEncryption(udid);
  res.json(result);
});

app.post('/api/authorization/ios/trigger-dfu', async (req, res) => {
  const { udid } = req.body;
  if (!udid) {
    return res.status(400).json({ success: false, error: 'Device UDID required' });
  }
  const result = await AuthorizationTriggers.triggerDFURecoveryMode(udid);
  res.json(result);
});

app.post('/api/authorization/ios/trigger-app-install', async (req, res) => {
  const { udid } = req.body;
  if (!udid) {
    return res.status(400).json({ success: false, error: 'Device UDID required' });
  }
  const result = await AuthorizationTriggers.triggerIOSAppInstallAuth(udid);
  res.json(result);
});

app.post('/api/authorization/ios/trigger-developer-trust', async (req, res) => {
  const { udid } = req.body;
  if (!udid) {
    return res.status(400).json({ success: false, error: 'Device UDID required' });
  }
  const result = await AuthorizationTriggers.triggerIOSDeveloperTrust(udid);
  res.json(result);
});

app.post('/api/authorization/fastboot/verify-unlock', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.verifyFastbootUnlock(serial);
  res.json(result);
});

app.post('/api/authorization/fastboot/trigger-oem-unlock', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.triggerFastbootOEMUnlock(serial);
  res.json(result);
});

app.post('/api/authorization/samsung/trigger-download-mode', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.triggerSamsungDownloadMode(serial);
  res.json(result);
});

app.post('/api/authorization/qualcomm/verify-edl', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.verifyQualcommEDL(serial);
  res.json(result);
});

app.post('/api/authorization/mediatek/verify-flash', async (req, res) => {
  const { serial } = req.body;
  if (!serial) {
    return res.status(400).json({ success: false, error: 'Device serial required' });
  }
  const result = await AuthorizationTriggers.verifyMediatekFlash(serial);
  res.json(result);
});

app.get('/api/authorization/triggers', async (req, res) => {
  const { platform } = req.query;
  const result = await AuthorizationTriggers.getAllAvailableTriggers(platform || 'all');
  res.json(result);
});

app.post('/api/authorization/trigger-all', async (req, res) => {
  const { deviceId, platform } = req.body;
  if (!deviceId || !platform) {
    return res.status(400).json({ 
      success: false, 
      error: 'Device ID and platform required' 
    });
  }
  const result = await AuthorizationTriggers.triggerAllAvailableAuthorizations(deviceId, platform);
  res.json(result);
});

// Firmware Hub API (truth-first): start with Apple IPSW discovery via ipsw.me public API.
const firmwareCache = {
  appleDevices: { fetchedAt: 0, data: null },
  appleIpswByIdentifier: new Map()
};

async function fetchJsonWithTimeout(url, timeoutMs = 10_000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { 'accept': 'application/json' },
      signal: controller.signal
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status} ${response.statusText}${body ? ` - ${body.slice(0, 200)}` : ''}`);
    }
    return await response.json();
  } finally {
    clearTimeout(id);
  }
}

function parseAppleIdentifierFromModelString(model) {
  // Accept either "iPhone14,2" or "iPhone 13 Pro (iPhone14,2)".
  const match = typeof model === 'string' ? model.match(/\(([^()\s]+)\)\s*$/) : null;
  return match ? match[1] : model;
}

async function getAppleDevicesList() {
  const now = Date.now();
  if (firmwareCache.appleDevices.data && now - firmwareCache.appleDevices.fetchedAt < 60 * 60 * 1000) {
    return firmwareCache.appleDevices.data;
  }

  const devices = await fetchJsonWithTimeout('https://api.ipsw.me/v4/devices', 12_000);
  firmwareCache.appleDevices = { fetchedAt: now, data: devices };
  return devices;
}

async function getAppleIpswForIdentifier(identifier) {
  const cached = firmwareCache.appleIpswByIdentifier.get(identifier);
  const now = Date.now();
  if (cached && now - cached.fetchedAt < 30 * 60 * 1000) {
    return cached.data;
  }
  const data = await fetchJsonWithTimeout(`https://api.ipsw.me/v4/device/${encodeURIComponent(identifier)}?type=ipsw`, 15_000);
  firmwareCache.appleIpswByIdentifier.set(identifier, { fetchedAt: now, data });
  return data;
}

app.get('/api/firmware/brands', async (req, res) => {
  // Only return brands we can service with real data.
  res.json(['apple']);
});

app.get('/api/firmware/brands/:brand', async (req, res) => {
  try {
    const brand = String(req.params.brand || '').toLowerCase();
    if (brand !== 'apple') {
      return res.status(404).json({ error: `Brand not supported: ${brand}` });
    }

    const allDevices = await getAppleDevicesList();
    const appleDevices = Array.isArray(allDevices)
      ? allDevices.filter(d => typeof d?.identifier === 'string' && typeof d?.name === 'string')
      : [];

    // Keep payload size reasonable: only return a curated, deterministic slice.
    const limit = 25;
    const subset = appleDevices
      .filter(d => /^(iPhone|iPad|iPod)/.test(d.name))
      .slice(0, limit);

    const models = [];
    for (const dev of subset) {
      const ipsw = await getAppleIpswForIdentifier(dev.identifier).catch(() => null);
      const firmwares = ipsw?.firmwares && Array.isArray(ipsw.firmwares) ? ipsw.firmwares : [];

      // newest first
      const versions = firmwares
        .slice()
        .sort((a, b) => {
          const ad = a?.releasedate ? Date.parse(a.releasedate) : 0;
          const bd = b?.releasedate ? Date.parse(b.releasedate) : 0;
          return bd - ad;
        })
        .slice(0, 10)
        .map(fw => ({
          version: String(fw.version),
          buildNumber: fw.buildid ? String(fw.buildid) : undefined,
          buildDate: fw.releasedate ? String(fw.releasedate) : undefined
        }));

      const latest = versions[0]?.version || 'unknown';
      const downloadUrls = firmwares[0]?.url ? [String(firmwares[0].url)] : [];

      models.push({
        model: `${dev.name} (${dev.identifier})`,
        codename: dev.identifier,
        versions,
        latestVersion: latest,
        downloadUrls
      });
    }

    res.json({ brand: 'apple', models });
  } catch (error) {
    console.error('[Firmware API] brands/:brand error:', error);
    res.status(500).json({ error: error?.message || String(error) });
  }
});

app.get('/api/firmware/search', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim().toLowerCase();
    if (!q) return res.json([]);

    const allDevices = await getAppleDevicesList();
    const appleDevices = Array.isArray(allDevices)
      ? allDevices.filter(d => typeof d?.identifier === 'string' && typeof d?.name === 'string')
      : [];

    const matches = appleDevices
      .filter(d => d.name.toLowerCase().includes(q) || d.identifier.toLowerCase().includes(q))
      .slice(0, 20);

    const results = [];
    for (const dev of matches) {
      const ipsw = await getAppleIpswForIdentifier(dev.identifier).catch(() => null);
      const firmwares = ipsw?.firmwares && Array.isArray(ipsw.firmwares) ? ipsw.firmwares : [];
      const versions = firmwares
        .slice()
        .sort((a, b) => {
          const ad = a?.releasedate ? Date.parse(a.releasedate) : 0;
          const bd = b?.releasedate ? Date.parse(b.releasedate) : 0;
          return bd - ad;
        })
        .slice(0, 10)
        .map(fw => ({
          version: String(fw.version),
          buildNumber: fw.buildid ? String(fw.buildid) : undefined,
          buildDate: fw.releasedate ? String(fw.releasedate) : undefined
        }));
      results.push({
        brand: 'apple',
        model: `${dev.name} (${dev.identifier})`,
        versions,
        latestVersion: versions[0]?.version || 'unknown',
        latestBuildDate: versions[0]?.buildDate,
        officialDownloadUrl: firmwares[0]?.url ? String(firmwares[0].url) : undefined,
        notes: 'IPSW metadata via ipsw.me; download is served from Apple CDNs when available.'
      });
    }

    res.json(results);
  } catch (error) {
    console.error('[Firmware API] search error:', error);
    res.status(500).json({ error: error?.message || String(error) });
  }
});

app.get('/api/firmware/info/:brand/:model', async (req, res) => {
  try {
    const brand = String(req.params.brand || '').toLowerCase();
    const model = String(req.params.model || '');
    if (brand !== 'apple') {
      return res.status(404).json({ error: `Brand not supported: ${brand}` });
    }
    const identifier = parseAppleIdentifierFromModelString(decodeURIComponent(model));
    const ipsw = await getAppleIpswForIdentifier(identifier);
    const firmwares = ipsw?.firmwares && Array.isArray(ipsw.firmwares) ? ipsw.firmwares : [];
    if (!firmwares.length) {
      return res.status(404).json({ error: 'No firmware found for this device identifier' });
    }

    const versions = firmwares
      .slice()
      .sort((a, b) => {
        const ad = a?.releasedate ? Date.parse(a.releasedate) : 0;
        const bd = b?.releasedate ? Date.parse(b.releasedate) : 0;
        return bd - ad;
      })
      .slice(0, 25)
      .map(fw => ({
        version: String(fw.version),
        buildNumber: fw.buildid ? String(fw.buildid) : undefined,
        buildDate: fw.releasedate ? String(fw.releasedate) : undefined
      }));

    res.json({
      brand: 'apple',
      model: `${ipsw.name || identifier} (${identifier})`,
      versions,
      latestVersion: versions[0]?.version || 'unknown',
      latestBuildDate: versions[0]?.buildDate,
      officialDownloadUrl: firmwares[0]?.url ? String(firmwares[0].url) : undefined,
      notes: 'IPSW metadata via ipsw.me; download is served from Apple CDNs when available.'
    });
  } catch (error) {
    console.error('[Firmware API] info error:', error);
    res.status(500).json({ error: error?.message || String(error) });
  }
});

app.get('/api/firmware/check/:deviceSerial', async (req, res) => {
  const deviceSerial = String(req.params.deviceSerial || '').trim();
  if (!deviceSerial) {
    return res.status(400).json({ deviceSerial, success: false, error: 'Device serial required', timestamp: Date.now() });
  }

  // Truth-first firmware check: only for Android devices reachable via ADB.
  if (!commandExists('adb')) {
    return res.json({
      deviceSerial,
      success: false,
      error: 'ADB not available; cannot query device firmware properties',
      timestamp: Date.now()
    });
  }

  try {
    const adbCmd = getToolCommand('adb');
    const getProp = (prop) => safeExec(`${adbCmd} -s ${deviceSerial} shell getprop ${prop}`) || null;

    const androidVersion = getProp('ro.build.version.release');
    const buildNumber = getProp('ro.build.display.id') || getProp('ro.build.id');
    const securityPatch = getProp('ro.build.version.security_patch');
    const product = getProp('ro.product.model') || getProp('ro.product.device');

    const firmware = {
      deviceSerial,
      deviceModel: product || undefined,
      deviceBrand: 'android',
      current: {
        version: androidVersion || 'unknown',
        buildNumber: buildNumber || undefined,
        securityPatch: securityPatch || undefined
      },
      updateAvailable: false,
      securityStatus: 'unknown',
      lastChecked: Date.now()
    };

    res.json({ deviceSerial, success: true, firmware, timestamp: Date.now() });
  } catch (error) {
    res.json({
      deviceSerial,
      success: false,
      error: error?.message || String(error),
      timestamp: Date.now()
    });
  }
});

app.get('/api/firmware/download', async (req, res) => {
  // NOTE: This endpoint is intended for controlled, direct downloads.
  // For Apple, we proxy the IPSW URL for the requested device/version.
  const brand = String(req.query.brand || '').toLowerCase();
  const model = String(req.query.model || '');
  const version = String(req.query.version || '');

  if (!brand || !model || !version) {
    return res.status(400).send('Missing brand/model/version');
  }

  if (brand !== 'apple') {
    return res.status(404).send('Download not supported for this brand');
  }

  try {
    const identifier = parseAppleIdentifierFromModelString(model);
    const ipsw = await getAppleIpswForIdentifier(identifier);
    const firmwares = ipsw?.firmwares && Array.isArray(ipsw.firmwares) ? ipsw.firmwares : [];
    const match = firmwares.find(fw => String(fw.version) === version);
    if (!match?.url) {
      return res.status(404).send('Firmware version not found for this device');
    }

    const upstreamUrl = String(match.url);
    const controller = new AbortController();
    req.on('close', () => {
      try {
        controller.abort();
      } catch (_) {
        // ignore
      }
    });

    const upstream = await fetch(upstreamUrl, { signal: controller.signal });
    if (!upstream.ok) {
      const body = await upstream.text().catch(() => '');
      return res
        .status(502)
        .send(`Upstream download failed (${upstream.status}) ${upstream.statusText}${body ? ` - ${body.slice(0, 300)}` : ''}`);
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const contentLength = upstream.headers.get('content-length');
    const suggestedFilename = (() => {
      try {
        return path.basename(new URL(upstreamUrl).pathname) || `${identifier}_${version}.ipsw`;
      } catch {
        return `${identifier}_${version}.ipsw`;
      }
    })();

    res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    res.setHeader('Content-Disposition', `attachment; filename="${suggestedFilename}"`);
    res.setHeader('Cache-Control', 'no-store');

    if (!upstream.body) {
      const buf = Buffer.from(await upstream.arrayBuffer());
      return res.end(buf);
    }

    const nodeStream = Readable.fromWeb(upstream.body);
    nodeStream.on('error', (err) => {
      console.error('[Firmware API] upstream stream error:', err);
      if (!res.headersSent) res.status(502);
      res.end();
    });
    nodeStream.pipe(res);
  } catch (error) {
    res.status(500).send(error?.message || String(error));
  }
});

// Trapdoor API - Secure endpoints for sensitive operations (Bobby's Secret Workshop)
app.use('/api/trapdoor', trapdoorRouter);
app.use('/api/catalog', catalogRouter);
app.use('/api/tools', toolsInspectRouter);
app.use('/api/operations', operationsRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

function closeWebSocketClients(clientSet) {
  for (const client of clientSet) {
    try {
      if (client.readyState === WebSocket.OPEN) {
        client.close(1001, 'server shutdown');
      } else {
        client.terminate?.();
      }
    } catch {
      // ignore
    }
  }
}

let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[Shutdown] ${signal} received; closing server...`);

  // Stop accepting new WS connections.
  try {
    wss.close();
    wssCorrelation.close();
    wssAnalytics.close();
    wssFlashProgress?.close?.();
  } catch {
    // ignore
  }

  // Close existing WS connections.
  try {
    closeWebSocketClients(clients);
    closeWebSocketClients(correlationClients);
    closeWebSocketClients(analyticsClients);
    if (typeof flashProgressClients?.values === 'function') {
      closeWebSocketClients(new Set(flashProgressClients.values()));
    }
    closeWebSocketClients(flashProgressMonitorClients ?? new Set());
  } catch {
    // ignore
  }

  // Stop accepting new HTTP connections.
  server.close(() => {
    console.log('[Shutdown] HTTP server closed');
    process.exit(0);
  });

  // Force close any open keep-alive sockets so server.close() can finish.
  for (const socket of httpSockets) {
    try {
      socket.destroy();
    } catch {
      // ignore
    }
  }

  // Fallback: force exit if something is stuck.
  setTimeout(() => {
    console.error('[Shutdown] Force exiting after timeout');
    process.exit(1);
  }, 5000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

server.listen(PORT, () => {
  console.log(`🔧 Pandora Codex API Server running on port ${PORT}`);
  console.log(`📡 System tools detection: http://localhost:${PORT}/api/system-tools`);
  console.log(`⚡ Flash operations: http://localhost:${PORT}/api/flash/*`);
  console.log(`📊 Performance monitor: http://localhost:${PORT}/api/monitor/*`);
  console.log(`🧪 Automated testing: http://localhost:${PORT}/api/tests/*`);
  console.log(`📐 Standards reference: http://localhost:${PORT}/api/standards`);
  console.log(`🔌 Hotplug events: http://localhost:${PORT}/api/hotplug/*`);
  console.log(`🔐 Authorization triggers (27 endpoints): http://localhost:${PORT}/api/authorization/*`);
  console.log(`📦 Firmware library: http://localhost:${PORT}/api/firmware/*`);
  console.log(`🔓 Trapdoor API (Bobby's Secret Workshop): http://localhost:${PORT}/api/trapdoor/*`);
  console.log(`🌐 WebSocket hotplug: ws://localhost:${PORT}/ws/device-events`);
  console.log(`🔗 WebSocket correlation: ws://localhost:${PORT}/ws/correlation`);
  console.log(`📊 WebSocket analytics: ws://localhost:${PORT}/ws/analytics`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`\n✅ All 27 authorization triggers ready for real device probe execution`);
  console.log(`✅ Firmware Library with brand-organized downloads available`);
  console.log(`✅ Trapdoor API with workflow execution and shadow logging enabled`);
});
