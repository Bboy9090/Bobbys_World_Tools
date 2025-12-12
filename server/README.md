# Bobby Dev Arsenal - Backend API Server

Real-time system tool detection and device monitoring API for the Bobby Dev Arsenal.

## Features

- ✅ **Real System Tool Detection** - Detects actually installed tools (no fake data)
- 🔧 **Rust Toolchain Detection** - rustc, cargo, rustup versions
- 📱 **Android Tools** - ADB and Fastboot detection with connected device listing
- 🐍 **Python Environment** - Python 3, pip versions
- 📦 **Node.js Stack** - Node and npm versions
- 🐳 **Docker Detection** - Docker installation status
- 🔍 **System Information** - OS, CPU, memory, disk space, uptime
- 🔒 **Secure Command Execution** - Whitelisted ADB commands only

## Installation

```bash
cd server
npm install
```

## Running the Server

### Development mode (auto-reload on changes):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

Or from the root directory:
```bash
npm run server:dev    # Development with auto-reload
npm run server:start  # Production
```

The server runs on **port 3001** by default.

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and timestamp.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### Get All System Tools
```
GET /api/system-tools
```
Returns detection status for all system tools.

**Response:**
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "codespaces",
  "tools": {
    "rust": {
      "installed": true,
      "version": "rustc 1.75.0",
      "cargo": "cargo 1.75.0"
    },
    "node": {
      "installed": true,
      "version": "v20.10.0",
      "npm": "10.2.3"
    },
    "python": {
      "installed": true,
      "version": "Python 3.11.6",
      "pip": "pip 23.3.1"
    },
    "git": {
      "installed": true,
      "version": "git version 2.43.0"
    },
    "docker": {
      "installed": false,
      "version": null
    },
    "adb": {
      "installed": true,
      "version": "Android Debug Bridge version 1.0.41",
      "devices_raw": "List of devices attached\n..."
    },
    "fastboot": {
      "installed": true,
      "devices_raw": ""
    }
  }
}
```

---

### Get Rust Toolchain Info
```
GET /api/system-tools/rust
```
Returns detailed Rust toolchain information.

**Response:**
```json
{
  "installed": true,
  "rustc": "rustc 1.75.0 (82e1608df 2023-12-21)",
  "cargo": "cargo 1.75.0 (1d8b05cdd 2023-11-20)",
  "rustup": "rustup 1.26.0 (5af9b9484 2023-04-05)"
}
```

---

### Get Android Tools Info
```
GET /api/system-tools/android
```
Returns ADB and Fastboot detection with connected devices.

**Response:**
```json
{
  "adb": {
    "installed": true,
    "version": "Android Debug Bridge version 1.0.41",
    "devices_raw": "List of devices attached\nXYZ123\tdevice"
  },
  "fastboot": {
    "installed": true,
    "devices_raw": ""
  }
}
```

---

### Get Python Environment
```
GET /api/system-tools/python
```
Returns Python installation information.

**Response:**
```json
{
  "installed": true,
  "python3": "Python 3.11.6",
  "python2": null,
  "pip": "pip 23.3.1 from /usr/lib/python3/dist-packages/pip (python 3.11)"
}
```

---

### Get System Information
```
GET /api/system-info
```
Returns system hardware and OS information.

**Response:**
```json
{
  "os": "Linux codespace 6.5.0-1015-azure #15-Ubuntu SMP x86_64 GNU/Linux",
  "cpu": "AMD EPYC 7763 64-Core Processor",
  "memory": "7.7Gi",
  "disk": "32G",
  "uptime": "up 2 hours, 15 minutes"
}
```

---

### Get ADB Connected Devices
```
GET /api/adb/devices
```
Returns parsed list of ADB-connected devices.

**Response:**
```json
{
  "count": 1,
  "devices": [
    {
      "serial": "XYZ123ABC",
      "state": "device",
      "info": "product:sdk_gphone_x86_64 model:sdk_gphone_x86_64 device:generic_x86_64"
    }
  ]
}
```

---

### Execute Safe ADB Command
```
POST /api/adb/command
Content-Type: application/json

{
  "command": "devices"
}
```

Execute whitelisted ADB commands. **Security:** Only safe, read-only commands are allowed.

**Allowed commands:**
- `devices`
- `shell getprop`
- `get-state`
- `get-serialno`

**Response:**
```json
{
  "output": "List of devices attached\nXYZ123\tdevice\n"
}
```

---

## Security

- ✅ Command execution timeout (5s for exec, 2s for detection)
- ✅ Whitelisted ADB commands only
- ✅ CORS enabled for frontend integration
- ✅ Error handling for all system calls
- ✅ No shell injection vulnerabilities

## Frontend Integration

Update your frontend to call the API:

```typescript
// Fetch all system tools
const response = await fetch('http://localhost:3001/api/system-tools');
const data = await response.json();

// Fetch ADB devices
const devices = await fetch('http://localhost:3001/api/adb/devices');
const adbData = await devices.json();
```

## Development

The server uses:
- **Express** for the REST API
- **CORS** for cross-origin requests
- **child_process** for secure system command execution

## Troubleshooting

**Server won't start:**
- Check if port 3001 is available: `lsof -i :3001`
- Install dependencies: `npm install`

**Tools not detected:**
- Verify tools are installed: `rustc --version`, `adb version`, etc.
- Check PATH environment variable
- Run server with elevated permissions if needed

**CORS errors:**
- Server includes CORS middleware by default
- Frontend should target `http://localhost:3001`

## License

Part of the Bobby Dev Arsenal project.
