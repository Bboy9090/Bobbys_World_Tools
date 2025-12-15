/**
 * Bobby Dev Routes - Private Creator Arsenal API
 * 
 * SECURITY: Protected by authentication middleware
 * Bridges Python bobby_dev package with frontend GUI
 */

import { Router } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import crypto from "crypto";

const execAsync = promisify(exec);
const router = Router();

// Get project root for file paths
const projectRoot = process.env.BOBBY_DEV_PATH || process.cwd();

/**
 * Handle tool execution via Rust trapdoor backend
 */
async function handleTrapdoorRustBackend(
  tool: string, 
  action: string, 
  params: any, 
  res: any
): Promise<void> {
  try {
    const trapdoorCli = process.env.TRAPDOOR_CLI_PATH || 
      `${projectRoot}/bootforge/target/release/trapdoor_cli`;
    
    // Validate tool name to prevent command injection
    if (!/^[a-z0-9_]+$/.test(tool)) {
      return res.status(400).json({ 
        error: "Invalid tool name",
        hint: "Tool name must contain only lowercase letters, numbers, and underscores"
      });
    }
    
    if (action === 'check') {
      // Check if tool is available
      const childProcess = require('child_process');
      const result = childProcess.spawnSync(trapdoorCli, ['check', tool], {
        timeout: 5000,
        encoding: 'utf8'
      });
      
      if (result.status === 0) {
        res.json({
          success: true,
          output: `Tool ${tool} is available`
        });
      } else {
        res.status(404).json({
          success: false,
          output: '',
          error: `Tool ${tool} not available`
        });
      }
    } else if (action === 'download') {
      // Execute download via trapdoor
      const request = {
        tool: tool,
        args: ['--download'],
        env_path: null
      };
      
      const childProcess = require('child_process');
      const child = childProcess.spawn(trapdoorCli, ['execute']);
      
      // Set up timeout (5 minutes for downloads)
      const timeout = setTimeout(() => {
        child.kill('SIGTERM');
      }, 300000);
      
      // Set encoding on streams
      child.stdout.setEncoding('utf8');
      child.stderr.setEncoding('utf8');
      
      child.stdin.write(JSON.stringify(request));
      child.stdin.end();
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data: any) => {
        stdout += data;
      });
      
      child.stderr.on('data', (data: any) => {
        stderr += data;
      });
      
      await new Promise((resolve, reject) => {
        child.on('close', (code: number) => {
          clearTimeout(timeout);
          if (code === 0) {
            resolve(null);
          } else {
            reject(new Error(`Process exited with code ${code}: ${stderr}`));
          }
        });
        child.on('error', (err: any) => {
          clearTimeout(timeout);
          reject(err);
        });
      });
      
      try {
        const response = JSON.parse(stdout);
        
        if (response.success) {
          res.json({
            success: true,
            output: response.output
          });
        } else {
          res.status(500).json({
            error: "Tool download failed",
            message: response.error || "Unknown error"
          });
        }
      } catch (e) {
        res.status(500).json({
          error: "Failed to parse response",
          message: stdout || stderr
        });
      }
    } else {
      res.status(400).json({ 
        error: "Action not supported by Rust backend",
        hint: "Use Python backend for this action"
      });
    }
  } catch (err: any) {
    console.error("Rust backend error:", err);
    res.status(500).json({
      error: "Rust backend execution failed",
      message: err.message
    });
  }
}

// Session storage for authenticated users (in production, use Redis or database)
const authenticatedSessions = new Set<string>();

// Creator password hash - SHA-256 of creator's password
// Can be overridden with BOBBY_PASSWORD_HASH environment variable
const CREATOR_PASSWORD_HASH = process.env.BOBBY_PASSWORD_HASH || 
  "7643d45dba47371c2f6266ffbfe6993753cd152b74f594aba54dc757adf91b62";

/**
 * Authentication middleware
 */
function requireAuth(req: any, res: any, next: any) {
  const sessionId = req.cookies?.bobby_session || req.headers['x-bobby-session'];
  
  // Check environment variable
  if (process.env.BOBBY_CREATOR === "1") {
    return next();
  }
  
  // Check session
  if (sessionId && authenticatedSessions.has(sessionId)) {
    return next();
  }
  
  res.status(401).json({ 
    error: "Unauthorized - Creator access required",
    hint: "Set BOBBY_CREATOR=1 or authenticate with password" 
  });
}

/**
 * Check authentication status
 */
router.get("/check-auth", (req, res) => {
  const sessionId = req.cookies?.bobby_session;
  
  if (process.env.BOBBY_CREATOR === "1") {
    return res.json({ authenticated: true, method: "env_var" });
  }
  
  if (sessionId && authenticatedSessions.has(sessionId)) {
    return res.json({ authenticated: true, method: "session" });
  }
  
  res.json({ authenticated: false });
});

/**
 * Authenticate with password
 */
router.post("/authenticate", (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: "Password required" });
  }
  
  // Hash provided password
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  
  if (hash === CREATOR_PASSWORD_HASH) {
    // Create session
    const sessionId = crypto.randomBytes(32).toString('hex');
    authenticatedSessions.add(sessionId);
    
    // Set cookie (httpOnly for security)
    res.cookie('bobby_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.json({ 
      success: true, 
      message: "Authentication successful",
      sessionId 
    });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

/**
 * Logout
 */
router.post("/logout", requireAuth, (req, res) => {
  const sessionId = req.cookies?.bobby_session;
  if (sessionId) {
    authenticatedSessions.delete(sessionId);
    res.clearCookie('bobby_session');
  }
  res.json({ success: true });
});

/**
 * Detect devices using Python device_detector
 */
router.get("/detect-devices", requireAuth, async (req, res, next) => {
  try {
    // Use environment variable or fallback to relative path
    const projectRoot = process.env.BOBBY_DEV_PATH || process.cwd();
    
    const pythonScript = `
import sys
import json
import os
os.environ['BOBBY_CREATOR'] = '1'

sys.path.insert(0, '${projectRoot}')

from bobby_dev.device_detector import DeviceDetector

detector = DeviceDetector()
devices = detector.detect_all_devices()

result = {
  'devices': [],
  'recommendations': {}
}

for device in devices:
    device_dict = {
        'serial': device.serial,
        'platform': device.platform,
        'model': device.model or 'Unknown',
        'manufacturer': device.manufacturer,
        'version': device.version,
        'chipset': device.chipset,
        'bootloader_locked': device.bootloader_locked,
        'frp_locked': device.frp_locked,
        'activation_locked': device.activation_locked,
        'connection_type': device.connection_type
    }
    result['devices'].append(device_dict)
    
    # Get recommendations
    recommendations = detector.get_exploit_recommendations(device)
    result['recommendations'][device.serial] = [
        {
            'tool': rec['tool'],
            'category': rec['category'],
            'reason': rec['reason'],
            'priority': rec.get('priority', 'info'),
            'warning': rec.get('warning'),
            'compatibility': rec.get('compatibility'),
            'module': rec.get('module')
        }
        for rec in recommendations
    ]

print(json.dumps(result))
`;

    const { stdout, stderr } = await execAsync('python3 -c ' + JSON.stringify(pythonScript), {
      timeout: 30000,
      env: { ...process.env, BOBBY_CREATOR: "1" }
    });

    if (stderr && !stdout) {
      throw new Error(stderr);
    }

    const result = JSON.parse(stdout);
    res.json(result);
  } catch (err: any) {
    console.error("Device detection error:", err);
    res.status(500).json({ 
      error: "Device detection failed",
      message: err.message,
      devices: [],
      recommendations: {}
    });
  }
});

/**
 * Get tool information and usage guide
 */
router.post("/tool-info", requireAuth, async (req, res, next) => {
  try {
    const { tool } = req.body;
    
    if (!tool) {
      return res.status(400).json({ error: "Tool name required" });
    }

    const toolMap: Record<string, string> = {
      // iOS Tools (A5-A11)
      'checkra1n': 'from bobby_dev.ios import checkra1n; loader = checkra1n.load_checkra1n(); print(loader.get_usage_guide())',
      'palera1n': 'from bobby_dev.ios import palera1n; loader = palera1n.load_palera1n(); print(loader.get_usage_guide())',
      'lockra1n': 'from bobby_dev.ios import lockra1n; loader = lockra1n.load_lockra1n(); print(loader.get_usage_guide())',
      'openbypass': 'from bobby_dev.ios import openbypass; helper = openbypass.load_openbypass(); print(helper.get_official_unlock_guide())',
      // iOS Tools (A12+)
      'minacriss': 'from bobby_dev.ios import minacriss; loader = minacriss.load_minacriss(); print(loader.get_usage_guide())',
      'iremovaltools': 'from bobby_dev.ios import iremovaltools; loader = iremovaltools.load_iremovaltools(); print(loader.get_usage_guide())',
      'brique_ramdisk': 'from bobby_dev.ios import brique_ramdisk; loader = brique_ramdisk.load_brique_ramdisk(); print(loader.get_usage_guide())',
      // Android Tools
      'frp_bypass': 'from bobby_dev.android import frp_bypass; helper = frp_bypass.load_frp_bypass(); print(helper.get_official_recovery_guide())',
      'magisk': 'from bobby_dev.android import magisk; loader = magisk.load_magisk(); print(loader.get_installation_guide())',
      'twrp': 'from bobby_dev.android import twrp; loader = twrp.load_twrp(); print(loader.get_installation_guide())',
      'apk_helpers': 'from bobby_dev.android import apk_helpers; helper = apk_helpers.load_apk_helper(); print(helper.get_usage_guide())',
      // Utilities
      'device_detect': 'from bobby_dev.device_detector import print_info; print_info()',
      'asset_manager': 'from bobby_dev.assets import AssetManager; mgr = AssetManager(); print(mgr.get_info())'
    };

    const pythonCode = toolMap[tool];
    if (!pythonCode) {
      return res.status(400).json({ error: "Unknown tool" });
    }

    const pythonScript = `
import sys
import os
os.environ['BOBBY_CREATOR'] = '1'
sys.path.insert(0, '${projectRoot}')

${pythonCode}
`;

    const { stdout, stderr } = await execAsync('python3 -c ' + JSON.stringify(pythonScript), {
      timeout: 10000,
      env: { ...process.env, BOBBY_CREATOR: "1" }
    });

    if (stderr && !stdout) {
      throw new Error(stderr);
    }

    res.json({ 
      tool,
      usage_guide: stdout || "Tool loaded successfully"
    });
  } catch (err: any) {
    res.status(500).json({ 
      error: "Failed to load tool",
      message: err.message
    });
  }
});

/**
 * Run specific tool action
 */
router.post("/run-tool", requireAuth, async (req, res, next) => {
  try {
    const { tool, action, params } = req.body;
    
    if (!tool || !action) {
      return res.status(400).json({ error: "Tool and action required" });
    }

    // Validate tool against allowlist
    const validTools = ['checkra1n', 'palera1n', 'lockra1n', 'magisk', 'twrp', 'frp_bypass'];
    if (!validTools.includes(tool)) {
      return res.status(400).json({ error: "Invalid tool" });
    }
    
    // Validate action against allowlist
    const validActions = ['download', 'check', 'methods', 'oem'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    // Check if Rust backend should be used
    const useRustBackend = process.env.USE_TRAPDOOR_RUST === "1";
    
    if (useRustBackend && (action === 'check' || action === 'download')) {
      // Use Rust trapdoor backend for supported actions
      return await handleTrapdoorRustBackend(tool, action, params, res);
    }

    // Sanitize params
    const sanitizeParam = (param: string | undefined, maxLength: number = 50): string => {
      if (!param) return '';
      // Only allow alphanumeric, dash, underscore
      return param.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, maxLength);
    };
    
    const safeDevice = sanitizeParam(params?.device);
    const safeVersion = sanitizeParam(params?.version);
    const safeOem = sanitizeParam(params?.oem);

    // Build Python script based on tool and action
    let pythonCode = '';
    
    switch (tool) {
      case 'checkra1n':
      case 'palera1n':
      case 'lockra1n':
        if (action === 'download') {
          pythonCode = `
from bobby_dev.ios import ${tool}
loader = ${tool}.load_${tool}()
result = loader.download_tool()
print(str(result))
`;
        } else if (action === 'check') {
          pythonCode = `
from bobby_dev.ios import ${tool}
loader = ${tool}.load_${tool}()
result = loader.is_installed()
print(str(result))
`;
        }
        break;
        
      case 'magisk':
        if (action === 'download') {
          pythonCode = `
from bobby_dev.android import magisk
loader = magisk.load_magisk()
result = loader.download_latest_apk()
print(str(result))
`;
        }
        break;
        
      case 'twrp':
        if (action === 'download' && safeDevice) {
          pythonCode = `
from bobby_dev.android import twrp
loader = twrp.load_twrp()
result = loader.download_device_recovery('${safeDevice}')
print(str(result))
`;
        }
        break;
        
      case 'frp_bypass':
        if (action === 'methods' && safeVersion) {
          pythonCode = `
from bobby_dev.android import frp_bypass
helper = frp_bypass.load_frp_bypass()
result = helper.get_android_version_methods('${safeVersion}')
print('\\n'.join(result) if isinstance(result, list) else result)
`;
        } else if (action === 'oem' && safeOem) {
          pythonCode = `
from bobby_dev.android import frp_bypass
helper = frp_bypass.load_frp_bypass()
result = helper.get_oem_specific_info('${safeOem}')
print('\\n'.join(result) if isinstance(result, list) else result)
`;
        }
        break;
        
      default:
        return res.status(400).json({ error: "Unsupported tool" });
    }
    
    if (!pythonCode) {
      return res.status(400).json({ error: "Invalid tool/action combination" });
    }

    const pythonScript = `
import sys
import os
os.environ['BOBBY_CREATOR'] = '1'
sys.path.insert(0, '${projectRoot}')

${pythonCode}
`;

    const { stdout, stderr } = await execAsync('python3 -c ' + JSON.stringify(pythonScript), {
      timeout: 30000,
      env: { ...process.env, BOBBY_CREATOR: "1" }
    });

    res.json({ 
      success: true,
      output: stdout || stderr || "Action completed"
    });
  } catch (err: any) {
    res.status(500).json({ 
      error: "Tool execution failed",
      message: err.message
    });
  }
});

/**
 * List assets
 */
router.get("/assets", requireAuth, async (req, res, next) => {
  try {
    const { category } = req.query;
    
    const pythonScript = `
import sys
import json
import os
os.environ['BOBBY_CREATOR'] = '1'
sys.path.insert(0, '${projectRoot}')

from bobby_dev.assets import AssetManager

manager = AssetManager()
assets = manager.list_assets(${category ? `'${category}'` : 'None'})
print(json.dumps(assets))
`;

    const { stdout, stderr } = await execAsync('python3 -c ' + JSON.stringify(pythonScript), {
      timeout: 10000,
      env: { ...process.env, BOBBY_CREATOR: "1" }
    });

    if (stderr && !stdout) {
      throw new Error(stderr);
    }

    const assets = JSON.parse(stdout || '{}');
    res.json({ assets });
  } catch (err: any) {
    res.status(500).json({ 
      error: "Failed to list assets",
      message: err.message,
      assets: {}
    });
  }
});

/**
 * Execute ADB helper command
 */
router.post("/adb-helper", requireAuth, async (req, res, next) => {
  try {
    const { command, serial } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: "Command required" });
    }

    const pythonScript = `
import sys
import os
os.environ['BOBBY_CREATOR'] = '1'
sys.path.insert(0, '${projectRoot}')

from bobby_dev.utils import adb_helper

adb = adb_helper.create_adb_helper(${serial ? `'${serial}'` : 'None'})

if '${command}' == 'devices':
    result = adb.devices()
elif '${command}' == 'shell':
    result = adb.shell('${req.body.shell_cmd || 'whoami'}')
else:
    result = "Unknown command"
    
print(str(result))
`;

    const { stdout, stderr } = await execAsync('python3 -c ' + JSON.stringify(pythonScript), {
      timeout: 15000,
      env: { ...process.env, BOBBY_CREATOR: "1" }
    });

    res.json({ 
      success: true,
      output: stdout || stderr || "Command executed"
    });
  } catch (err: any) {
    res.status(500).json({ 
      error: "ADB helper failed",
      message: err.message
    });
  }
});

/**
 * Execute Fastboot helper command
 */
router.post("/fastboot-helper", requireAuth, async (req, res, next) => {
  try {
    const { command, serial } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: "Command required" });
    }

    const pythonScript = `
import sys
import os
os.environ['BOBBY_CREATOR'] = '1'
sys.path.insert(0, '${projectRoot}')

from bobby_dev.utils import fastboot_helper

fastboot = fastboot_helper.create_fastboot_helper(${serial ? `'${serial}'` : 'None'})

if '${command}' == 'devices':
    result = fastboot.devices()
elif '${command}' == 'getvar':
    result = fastboot.getvar('${req.body.var || 'unlocked'}')
else:
    result = "Unknown command"
    
print(str(result))
`;

    const { stdout, stderr } = await execAsync('python3 -c ' + JSON.stringify(pythonScript), {
      timeout: 15000,
      env: { ...process.env, BOBBY_CREATOR: "1" }
    });

    res.json({ 
      success: true,
      output: stdout || stderr || "Command executed"
    });
  } catch (err: any) {
    res.status(500).json({ 
      error: "Fastboot helper failed",
      message: err.message
    });
  }
});

/**
 * Health check
 */
router.get("/health", (req, res) => {
  res.json({ 
    status: "ok",
    python_available: true,
    bobby_dev_installed: true,
    timestamp: new Date().toISOString()
  });
});

export default router;
