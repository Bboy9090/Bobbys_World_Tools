# BootForgeUSB

Evidence-based USB device detection for Pandora Codex.

## Philosophy

**No fake outputs. No simulated success.**

BootForgeUSB provides device detection with:
- **Confidence scores** - Never claim 100% certainty without proof
- **Evidence bundles** - Raw USB descriptors + tool outputs
- **Conservative classification** - "likely" vs "confirmed"
- **Tool confirmers** - Only run if tools are installed
- **No stealth** - All operations are explicit and logged

## Architecture

### Rust Core Library
- `usb_scan.rs` - USB enumeration via rusb/libusb
- `classify.rs` - Classification rules with confidence scoring
- `model.rs` - Type definitions (Device, Evidence, Classification)
- `tools/confirmers.rs` - Tool validation (adb, fastboot, idevice_id)

### Python Binding (pyo3)
```python
import bootforgeusb

devices = bootforgeusb.scan()
# Returns list of Device dicts with confidence + evidence
```

### CLI
```bash
bootforgeusb scan --json
```

## Device Classification

### iOS Modes
- `ios_normal_likely` - VID:05AC + not DFU/Recovery PIDs
- `ios_recovery_likely` - VID:05AC + PID:1281
- `ios_dfu_likely` - VID:05AC + PID:1227

### Android Modes
- `android_adb_confirmed` - Seen in `adb devices` output
- `android_fastboot_confirmed` - Seen in `fastboot devices` output
- `android_recovery_adb_confirmed` - ADB + interface class hints

### Unknown
- `unknown_usb` - Connected but not classified

## Evidence Structure

```json
{
  "usb": {
    "vid": "05ac",
    "pid": "12a8",
    "manufacturer": "Apple Inc.",
    "product": "iPhone",
    "serial": "XXXXXXXXXXXX",
    "bus": 3,
    "address": 12,
    "interface_class": null
  },
  "tools": {
    "adb": {
      "present": true,
      "seen": false,
      "raw": ""
    },
    "fastboot": {
      "present": true,
      "seen": false,
      "raw": ""
    },
    "idevice_id": {
      "present": false,
      "seen": false,
      "raw": "missing"
    }
  }
}
```

## Tool Confirmers

Confirmers **only run if the tool is installed**. They:
1. Check tool availability (`which adb`)
2. If present, run safe read-only commands
3. Parse output to match USB devices
4. Return `present`, `seen`, and `raw` evidence

### ADB Confirmer
```bash
adb devices -l
```
Matches by serial number.

### Fastboot Confirmer
```bash
fastboot devices
```
Matches by serial number.

### iOS Confirmer
```bash
idevice_id -l
# or check for usbmuxd socket
```
Matches by UDID.

## Confidence Scoring

- **0.5-0.7** - USB signature matches known pattern
- **0.7-0.85** - USB + interface class hints
- **0.85-0.95** - Tool confirmer saw device
- **0.95-1.0** - Multiple confirmers + full evidence

## Building

### Rust Library + CLI
```bash
cd libs/bootforgeusb
cargo build --release
./target/release/bootforgeusb scan --json
```

### Python Binding
```bash
cd libs/bootforgeusb
pip install maturin
maturin develop
python3 -c "import bootforgeusb; print(bootforgeusb.scan())"
```

## Requirements

### System Dependencies
- **libusb** (Linux: `apt-get install libusb-1.0-0-dev`)
- **macOS** - Included in Xcode Command Line Tools
- **Windows** - libusb-win32 or WinUSB drivers

### Optional Tools (for confirmers)
- `adb` - Android SDK Platform Tools
- `fastboot` - Android SDK Platform Tools
- `idevice_id` - libimobiledevice

## Safety Features

1. **Read-only operations** - No device modifications
2. **Timeout protection** - Tools have execution limits
3. **Error handling** - All errors captured and logged
4. **Privilege separation** - No root/admin required for scanning
5. **Explicit permissions** - USB access requires user approval

## Integration with Pandora Agent

```python
import bootforgeusb

# Scan all devices
devices = bootforgeusb.scan()

for device in devices:
    print(f"UID: {device['device_uid']}")
    print(f"Platform: {device['platform_hint']}")
    print(f"Mode: {device['mode']}")
    print(f"Confidence: {device['confidence']}")
    print(f"Evidence: {device['evidence']}")
```

## Development

### Run Tests
```bash
cargo test
```

### Enable Logging
```bash
RUST_LOG=debug ./target/release/bootforgeusb scan
```

## Roadmap

### v0.1 (MVP)
- [x] USB enumeration with rusb
- [x] Basic classification rules
- [x] Tool confirmers (adb/fastboot/idevice)
- [x] Python binding via pyo3
- [x] CLI with JSON output
- [x] Confidence scoring

### v0.2
- [ ] Hotplug monitoring (watch mode)
- [ ] Advanced vendor modes (Samsung Odin, Qualcomm EDL, MTK)
- [ ] Windows driver binding inspection
- [ ] Device state transitions tracking

### v0.3
- [ ] Performance profiling
- [ ] Device fingerprinting
- [ ] Risk assessment integration

## License

MIT - See LICENSE file for details

---

**Part of the Pandora Codex Enterprise Framework. Built with Rust for safety, speed, and truth.**
