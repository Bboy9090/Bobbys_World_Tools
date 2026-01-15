# 🐍 Python Backend Architecture
## Bundled Python Service for Bobby's Workshop

**Status:** ✅ Architecture Complete - Ready for Implementation

---

## 📋 Overview

The Python backend is a **stateless worker** that handles:
- Device inspection (read-only)
- Log collection
- Report formatting
- **Never mutates devices** - observations only

**Authority:** Rust (Pandora/Crucible) owns all policy and decisions.

---

## 🏗️ Architecture

```
[Tauri UI]
   │
   │ HTTP / IPC
   ▼
[Local Python Service] ← Bundled Python Runtime
   │
   │ Calls
   ▼
[Device Inspection / Logs / Reports]
```

**Key Principles:**
- ✅ Python runs only while app runs
- ✅ Binds to 127.0.0.1 only
- ✅ No external network access
- ✅ Stateless handlers
- ✅ Policy mirror-only (never escalation)

---

## 📁 File Structure

```
python/
├── app/
│   ├── __init__.py
│   ├── main.py          # Server + lifecycle
│   ├── health.py         # Health check handler
│   ├── inspect.py        # Device inspection handlers
│   ├── logs.py           # Log collection handler
│   ├── report.py         # Report formatting handler
│   └── policy.py         # Policy mode (mirror-only)
├── requirements.txt      # Minimal dependencies
└── runtime/              # Embedded Python (to be bundled)
```

---

## 🔌 API Endpoints

### GET /health
**Response:**
```json
{
  "status": "ok",
  "version": "py-worker-1.0.0",
  "uptime_ms": 12345
}
```

### POST /inspect/basic
**Request:**
```json
{
  "device_id": "dev_001",
  "platform": "ios",
  "hints": {
    "connection": "usb"
  }
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "activation_locked": true,
    "mdm_enrolled": false,
    "frp_locked": null,
    "efi_locked": null
  },
  "warnings": []
}
```

### POST /inspect/deep
**Request:**
```json
{
  "device_id": "dev_001",
  "platform": "ios"
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "signals": ["battery_state", "storage_health"],
    "notes": "deep probe completed"
  },
  "warnings": ["partial_data"]
}
```

### POST /logs/collect
**Request:**
```json
{
  "device_id": "dev_001",
  "scope": "default"
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "log_count": 12
  },
  "warnings": []
}
```

### POST /report/format
**Request:**
```json
{
  "report_id": "rep_abc123",
  "format": "pdf"
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "artifact": "report.pdf"
  },
  "warnings": []
}
```

---

## 🚀 Rust Integration

### Python Backend Launcher

**File:** `src-tauri/src/python_backend.rs`

**Functions:**
- `launch_python_backend(app_dir)` - Spawns Python service
- `shutdown_python_backend()` - Kills Python process
- `find_python_executable(app_dir)` - Locates bundled Python
- `pick_free_port()` - Selects available port

**Lifecycle:**
1. Tauri starts → Launches Python backend
2. Python prints port to stdout
3. Rust reads port
4. Rust stores port for API client
5. App closes → Python process killed

---

## 🔒 Security Rules

**Python Service:**
- ❌ No device mutation
- ❌ No persistent state
- ❌ No external network
- ❌ No shell access
- ✅ Read-only operations
- ✅ Stateless handlers
- ✅ Policy mirror-only

**Rust Authority:**
- ✅ Policy enforcement before Python calls
- ✅ Evidence logging after Python calls
- ✅ Workflow decisions
- ✅ Authorization checks

---

## 📦 Bundling Python Runtime

**Status:** ⏳ TODO

**Approach:** Embedded Python Runtime

**Steps:**
1. Download Python embedded distribution
2. Extract to `python/runtime/`
3. Install required packages
4. Bundle in Tauri resources
5. Update launcher to use bundled Python

**Location:** `src-tauri/bundle/resources/python/`

---

## 🔧 Implementation Status

### ✅ Completed
- [x] Python service structure
- [x] API endpoint handlers
- [x] Health check endpoint
- [x] Policy mode system
- [x] Rust launcher module
- [x] Tauri lifecycle integration

### ⏳ Pending
- [ ] Bundle Python runtime
- [ ] Implement actual device inspection
- [ ] Rust HTTP client for Python
- [ ] Frontend health gating
- [ ] Error handling
- [ ] Logging integration

---

## 🎯 Next Steps

1. **Bundle Python Runtime**
   - Download embedded Python
   - Install to `python/runtime/`
   - Update Tauri resources

2. **Implement Device Inspection**
   - iOS: libimobiledevice bindings
   - Android: ADB libraries
   - Parse device state

3. **Rust HTTP Client**
   - Create `PyWorkerClient` struct
   - Implement health check
   - Implement inspect calls

4. **Frontend Health Gating**
   - Add backend health state
   - Block UI until healthy
   - Show error on failure

---

## 📚 References

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [Python Embedded Distribution](https://www.python.org/downloads/windows/)
- [Rust reqwest](https://docs.rs/reqwest/)

---

**Status:** Architecture complete, ready for implementation ✅
