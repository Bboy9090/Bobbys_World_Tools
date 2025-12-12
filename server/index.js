import express from 'express';
import { execSync } from 'child_process';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

function safeExec(cmd) {
  try {
    return execSync(cmd, { encoding: "utf-8", timeout: 5000 }).trim();
  } catch {
    return null;
  }
}

function commandExists(cmd) {
  try {
    execSync(`command -v ${cmd}`, { stdio: "ignore", timeout: 2000 });
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
  const pythonVersion = safeExec("python3 --version");
  const pipVersion = safeExec("pip3 --version");
  const gitVersion = safeExec("git --version");
  const dockerVersion = safeExec("docker --version");
  
  const adbInstalled = commandExists("adb");
  const fastbootInstalled = commandExists("fastboot");
  
  let adbDevices = null;
  let adbVersion = null;
  if (adbInstalled) {
    adbDevices = safeExec("adb devices");
    adbVersion = safeExec("adb --version");
  }
  
  let fastbootDevices = null;
  if (fastbootInstalled) {
    fastbootDevices = safeExec("fastboot devices");
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
      devices_raw: adbDevices
    },
    fastboot: {
      installed: fastbootInstalled,
      devices_raw: fastbootDevices
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
  const adbInstalled = commandExists("adb");
  const fastbootInstalled = commandExists("fastboot");
  
  let adbDevices = null;
  let adbVersion = null;
  if (adbInstalled) {
    adbDevices = safeExec("adb devices");
    adbVersion = safeExec("adb --version");
  }
  
  let fastbootDevices = null;
  if (fastbootInstalled) {
    fastbootDevices = safeExec("fastboot devices");
  }
  
  res.json({
    adb: {
      installed: adbInstalled,
      version: adbVersion,
      devices_raw: adbDevices
    },
    fastboot: {
      installed: fastbootInstalled,
      devices_raw: fastbootDevices
    }
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
    return res.status(404).json({ error: "ADB not installed" });
  }
  
  const devicesRaw = safeExec("adb devices -l");
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
      const props = safeExec(`adb -s ${serial} shell getprop 2>/dev/null`);
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
    timestamp: new Date().toISOString()
  });
});

app.get('/api/fastboot/devices', (req, res) => {
  if (!commandExists("fastboot")) {
    return res.status(404).json({ error: "Fastboot not installed" });
  }
  
  const devicesRaw = safeExec("fastboot devices");
  const lines = devicesRaw?.split('\n').filter(l => l.trim()) || [];
  
  const devices = lines.map(line => {
    const parts = line.trim().split(/\s+/);
    const serial = parts[0];
    const mode = parts[1] || 'fastboot';
    
    let deviceInfo = {};
    const productOutput = safeExec(`fastboot -s ${serial} getvar product 2>&1`);
    const variantOutput = safeExec(`fastboot -s ${serial} getvar variant 2>&1`);
    const bootloaderOutput = safeExec(`fastboot -s ${serial} getvar version-bootloader 2>&1`);
    const basebandOutput = safeExec(`fastboot -s ${serial} getvar version-baseband 2>&1`);
    const serialnoOutput = safeExec(`fastboot -s ${serial} getvar serialno 2>&1`);
    const secureOutput = safeExec(`fastboot -s ${serial} getvar secure 2>&1`);
    const unlockStateOutput = safeExec(`fastboot -s ${serial} getvar unlocked 2>&1`);
    
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
  
  let adbDevices = [];
  let fastbootDevices = [];
  
  if (adbInstalled) {
    const devicesRaw = safeExec("adb devices -l");
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
        const props = safeExec(`adb -s ${serial} shell getprop 2>/dev/null`);
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
    const devicesRaw = safeExec("fastboot devices");
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
  }, [] as any[]);
  
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


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🔧 Bobby Dev Arsenal API Server running on port ${PORT}`);
  console.log(`📡 System tools detection endpoint: http://localhost:${PORT}/api/system-tools`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});
