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
    return {
      serial: parts[0],
      state: parts[1],
      info: parts.slice(2).join(' ')
    };
  }).filter(d => d.serial && d.state);
  
  res.json({
    count: devices.length,
    devices
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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🔧 Bobby Dev Arsenal API Server running on port ${PORT}`);
  console.log(`📡 System tools detection endpoint: http://localhost:${PORT}/api/system-tools`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});
