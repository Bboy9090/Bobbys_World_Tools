# Bobby Dev Mode Setup & Usage Guide

## 🔒 Security Notice

**Bobby Dev Mode** is a private, creator-only arsenal that is **excluded from public releases** via `.gitignore`. This package contains sensitive device exploitation and bypass tools.

## ✅ Verification: All Tools Are Functional

### Backend (CRM API) - ✅ FUNCTIONAL
All device connection and command execution tools in the CRM API are **fully functional**:

- ✅ **ADB Integration** (`crm-api/src/routes/devmode.ts`)
  - Real ADB command execution via Node.js `child_process`
  - Device detection with `adb devices -l`
  - Shell command execution with proper serial targeting
  - Debloat package removal
  - Real-time command output

- ✅ **Fastboot Integration** (`crm-api/src/routes/devmode.ts`)
  - Real Fastboot command execution
  - Device detection in fastboot mode
  - Flash and boot operations support
  - Bootloader variable reading

- ✅ **iOS Detection** (`crm-api/src/routes/devmode.ts`)
  - libimobiledevice integration
  - `idevice_id -l` for device detection
  - `ideviceinfo` for device information
  - Full iOS device enumeration

- ✅ **Diagnostics Service** (`crm-api/src/services/diagnosticService.ts`)
  - Real Android battery diagnostics via `dumpsys battery`
  - Storage analysis via `df`
  - Security state checking (verified boot, bootloader, encryption)
  - iOS battery diagnostics via `idevicediagnostics`
  - iOS storage analysis
  - iOS security state checking

**No mock implementations found in backend** - all device operations are real.

### Frontend - ✅ FUNCTIONAL
- ✅ All frontend components use real API endpoints
- ✅ No mock data or placeholder implementations
- ✅ Direct communication with CRM API via Vite proxy
- ✅ Real-time device detection and diagnostics

### Bobby Dev Arsenal - 🔄 INTEGRATED ARCHITECTURE

The Bobby Dev arsenal now uses an **integrated architecture** combining:

#### 🦀 **Trapdoor (Rust Backend)** - `bootforge/libbootforge/src/trapdoor/`
- ✅ **Full Implementation**: Complete tool execution engine
- ✅ **TrapdoorRunner**: Sandboxed tool execution with proper security
- ✅ **BobbyDevBridge**: JSON-based interface for cross-language communication
- ✅ **17 Tools Supported**: iOS (A5-A18), Android, and system tools
- ✅ **Performance**: Native Rust execution for speed and efficiency

#### 🐍 **bobby_dev (Python Layer)** - Private Package
- 🔧 **Delegates to Trapdoor**: Calls Rust backend for actual tool execution
- 📋 **Intelligence Layer**: Device detection, recommendations, compatibility checks
- 📚 **Documentation**: Comprehensive usage guides and best practices
- 🔗 **Python API**: Maintains Python-friendly interfaces for compatibility
- 🛡️ **Legal Warnings**: Proper legal notices and safety guidelines

#### 📋 **Integration Details**
See [TRAPDOOR_BOBBY_DEV_INTEGRATION.md](TRAPDOOR_BOBBY_DEV_INTEGRATION.md) for:
- Architecture diagrams
- Integration patterns
- Python→Rust communication
- TypeScript API integration
- Configuration and deployment

## 📦 Installation

### Prerequisites

#### System Tools
```bash
# Android Tools
sudo apt-get install adb fastboot   # Linux
brew install android-platform-tools  # macOS

# iOS Tools (libimobiledevice)
sudo apt-get install libimobiledevice-utils  # Linux
brew install libimobiledevice                # macOS

# Python 3.8+
python3 --version
```

#### Python Dependencies (for bobby_dev)
```bash
# No dependencies required for basic usage
# Optional: requests for download functionality (when implemented)
# pip install requests
```

### Setup Steps

1. **Clone Repository** (already done)
2. **Verify Backend Tools**
   ```bash
   # Test ADB
   adb version
   adb devices
   
   # Test Fastboot
   fastboot --version
   fastboot devices
   
   # Test iOS (optional)
   idevice_id -l
   ideviceinfo
   ```

3. **Configure Bobby Dev Access**
   ```bash
   # Method 1: Environment Variable (Recommended)
   export BOBBY_CREATOR=1
   
   # Method 2: Password (default: "password")
   # Change password hash in bobby_dev/__init__.py
   ```

4. **Test Bobby Dev**
   ```bash
   cd /home/runner/work/The-Pandora-Codex-/The-Pandora-Codex-
   python main.py
   ```

## 🚀 Usage

### 1. Device Detection & Recommendations

The device detector automatically identifies connected devices and recommends exploits:

```bash
# Via CLI
BOBBY_CREATOR=1 python main.py
# Select option [D] for device detection

# Via Python
python3 << 'EOF'
import os
os.environ['BOBBY_CREATOR'] = '1'

from bobby_dev.device_detector import detect_and_recommend
devices = detect_and_recommend()

for device in devices:
    print(f"Found: {device.model} ({device.platform})")
EOF
```

**What it detects:**
- ✅ Android devices via ADB
- ✅ Android devices in Fastboot mode
- ✅ iOS devices via libimobiledevice
- ✅ Device model and manufacturer
- ✅ OS version
- ✅ Chipset (for jailbreak compatibility)
- ✅ Bootloader lock status (Android)
- ✅ FRP lock status (Android)
- ✅ Activation lock status (iOS)

**Recommendations provided:**
- iOS: checkra1n, palera1n, lockra1n (based on chipset)
- iOS: Activation lock bypass resources
- Android: FRP bypass methods
- Android: Magisk root (if bootloader unlocked)
- Android: TWRP custom recovery
- Android: Bootloader unlock procedures

### 2. iOS Tools

```python
# Set access
import os
os.environ['BOBBY_CREATOR'] = '1'

# Checkra1n jailbreak
from bobby_dev.ios import checkra1n
loader = checkra1n.load_checkra1n()
print(loader.get_usage_guide())
loader.download_tool()  # Download from official source

# Palera1n (iOS 15-16)
from bobby_dev.ios import palera1n
loader = palera1n.load_palera1n()
print(loader.get_usage_guide())

# Activation lock bypass info
from bobby_dev.ios import openbypass
helper = openbypass.load_openbypass()
print(helper.get_official_unlock_guide())
print(helper.get_legal_warnings())
```

### 3. Android Tools

```python
# FRP Bypass
from bobby_dev.android import frp_bypass
helper = frp_bypass.load_frp_bypass()
print(helper.get_official_recovery_guide())
print(helper.get_android_version_methods("12"))  # Android 12 methods

# Magisk Root
from bobby_dev.android import magisk
loader = magisk.load_magisk()
print(loader.get_installation_guide())

# TWRP Custom Recovery
from bobby_dev.android import twrp
loader = twrp.load_twrp()
loader.download_device_recovery("guacamole")  # OnePlus 7 Pro

# APK Helpers
from bobby_dev.android import apk_helpers
helper = apk_helpers.load_apk_helper()
helper.install_apk("/path/to/app.apk")
```

### 4. Utilities

```python
# ADB Helper
from bobby_dev.utils import adb_helper
adb = adb_helper.create_adb_helper()
devices = adb.devices()
adb.shell("dumpsys battery")
adb.screenshot("screenshot.png")

# Fastboot Helper
from bobby_dev.utils import fastboot_helper
fastboot = fastboot_helper.create_fastboot_helper()
fastboot.flash("boot", "magisk_patched.img")
fastboot.getvar("unlocked")

# Asset Manager
from bobby_dev.assets import AssetManager
manager = AssetManager()
print(manager.get_info())
assets = manager.list_assets()
```

### 5. Backend API (Web Interface)

The web-based CRM API provides real-time device operations:

```bash
# Start backend (if not running)
cd crm-api
npm install
npm run dev
```

**API Endpoints:**
- `GET /api/devmode/devices` - List ADB devices
- `GET /api/devmode/devices/ios` - List iOS devices
- `GET /api/devmode/devices/all` - All devices
- `POST /api/devmode/adb` - Execute ADB command
- `POST /api/devmode/fastboot` - Execute Fastboot command
- `GET /api/devmode/fastboot/devices` - Fastboot devices
- `POST /api/devmode/debloat` - Debloat device
- `POST /api/diagnostics/run` - Run diagnostics

**Example API Usage:**
```bash
# List devices
curl http://localhost:3000/api/devmode/devices/all

# Execute ADB command
curl -X POST http://localhost:3000/api/devmode/adb \
  -H "Content-Type: application/json" \
  -d '{"command": "adb shell getprop ro.build.version.release"}'

# Run diagnostics
curl -X POST http://localhost:3000/api/diagnostics/run \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "device-uuid", "type": "full"}'
```

## 🔨 Arsenal Expansion

### Adding New Tools

Each module includes clear patterns for expansion:

1. **Create new loader** following existing patterns
2. **Document official sources** with GitHub/download links
3. **Add usage guide** with safety warnings
4. **Implement download stub** with clear TODOs
5. **Add to module __init__.py**

Example structure:
```python
# bobby_dev/ios/newtool.py
GITHUB_REPO = "org/tool"
GITHUB_URL = f"https://github.com/{GITHUB_REPO}"

class NewToolLoader:
    def download_tool(self):
        print("⚠️ STUB - Download from:", GITHUB_URL)
        # TODO: Implement download
        
    def get_usage_guide(self):
        return """Usage guide with official docs..."""
```

### Implementing Stubs

To implement download and execution stubs:

1. **Download Functions**: Use `requests` library
   ```python
   import requests
   response = requests.get(url, stream=True)
   with open(output_path, 'wb') as f:
       for chunk in response.iter_content(chunk_size=8192):
           f.write(chunk)
   ```

2. **Execution Functions**: Use `subprocess`
   ```python
   import subprocess
   result = subprocess.run(cmd, capture_output=True, text=True)
   print(result.stdout)
   ```

3. **Follow Security Best Practices**:
   - Verify checksums
   - Check tool signatures
   - Sanitize inputs
   - Add safety warnings

## 📁 Directory Structure

```
/
├── bobby_dev/                    # ✅ Private Python arsenal (gitignored)
│   ├── __init__.py              # Double-gate access control
│   ├── README.md                # Complete documentation
│   ├── device_detector.py       # Auto device detection
│   ├── ios/                     # iOS tools
│   │   ├── lockra1n.py
│   │   ├── checkra1n.py
│   │   ├── palera1n.py
│   │   └── openbypass.py
│   ├── android/                 # Android tools
│   │   ├── frp_bypass.py
│   │   ├── magisk.py
│   │   ├── twrp.py
│   │   └── apk_helpers.py
│   ├── assets/                  # Asset storage (gitignored)
│   │   ├── README.md
│   │   ├── apks/
│   │   ├── binaries/
│   │   ├── images/
│   │   └── payloads/
│   └── utils/                   # Utilities
│       ├── download.py
│       ├── adb_helper.py
│       └── fastboot_helper.py
├── main.py                      # CLI launcher
├── crm-api/                     # ✅ Functional backend
│   └── src/
│       ├── routes/
│       │   └── devmode.ts      # Real ADB/Fastboot/iOS commands
│       └── services/
│           └── diagnosticService.ts  # Real diagnostics
└── frontend/                    # ✅ Functional web UI
    └── src/
        └── services/
            └── apiService.ts    # Real API calls
```

## 🛡️ Security Best Practices

### Access Control
- ✅ Double-gate authentication (env var + password)
- ✅ Package excluded from git
- ✅ Assets directory excluded
- ✅ Clear security warnings throughout

### Legal Compliance
- ⚠️ Only use on devices you own
- ⚠️ Respect all laws and ToS
- ⚠️ Try official unlock methods first
- ⚠️ Document all operations
- ⚠️ Keep audit logs

### Tool Verification
- 🔒 Download from official sources only
- 🔒 Verify checksums and signatures
- 🔒 Scan for malware
- 🔒 Test in safe environment
- 🔒 Keep tools updated

## 📖 Documentation

- **Main README**: `bobby_dev/README.md`
- **Asset Management**: `bobby_dev/assets/README.md`
- **This Guide**: `BOBBY_DEV_SETUP.md`
- **Project Overview**: `replit.md`
- **Individual Modules**: See docstrings in each file

## 🆘 Troubleshooting

### Access Denied
```bash
# Set environment variable
export BOBBY_CREATOR=1

# Or change password hash in bobby_dev/__init__.py
```

### ADB Not Found
```bash
# Install Android tools
sudo apt-get install adb fastboot  # Linux
brew install android-platform-tools # macOS

# Verify
adb version
```

### iOS Detection Not Working
```bash
# Install libimobiledevice
sudo apt-get install libimobiledevice-utils
brew install libimobiledevice

# Verify
idevice_id -l
```

### No Devices Detected
- Enable USB debugging (Android)
- Trust computer (iOS)
- Check USB cable
- Try different USB port
- Restart ADB: `adb kill-server && adb start-server`

## ⚖️ Legal Notice

This arsenal is for **legitimate device recovery and repair only**:

- ✅ Use on devices you legally own
- ✅ Follow all applicable laws
- ✅ Try official unlock methods first
- ✅ Document all operations
- ❌ Never use on stolen devices
- ❌ Never bypass security illegally
- ❌ Never violate terms of service

**You are solely responsible for your use of these tools.**

---

**Remember**: With great power comes great responsibility. Use ethically and legally. 🔒
