# Bobby Dev Arsenal - Standalone Executable

**Private Creator Tool for Device Exploitation and Bypass**

## 📦 Download

Get the latest pre-built executable from the [Releases](../../releases) page:

- **Windows**: `BobbyDevArsenal.exe`
- **Linux**: `BobbyDevArsenal`
- **macOS**: `BobbyDevArsenal`

No Python installation required! The executable is completely standalone.

## 🚀 Quick Start

### Windows

1. **Download** `BobbyDevArsenal.exe` from releases
2. **Run** the executable (double-click or from command line)
3. **Enter password** when prompted
4. **Select tools** from the interactive menu

```cmd
# Method 1: Run with password prompt
BobbyDevArsenal.exe

# Method 2: Set environment variable (bypass password)
set BOBBY_CREATOR=1
BobbyDevArsenal.exe
```

### Linux / macOS

1. **Download** `BobbyDevArsenal`
2. **Make executable**: `chmod +x BobbyDevArsenal`
3. **Run**: `./BobbyDevArsenal`
4. **Enter password** when prompted

```bash
# Method 1: Run with password prompt
./BobbyDevArsenal

# Method 2: Set environment variable
export BOBBY_CREATOR=1
./BobbyDevArsenal
```

## 🔐 Authentication

The tool requires authentication to access the private arsenal:

- **Password**: Contact creator for password
- **Environment Variable**: `BOBBY_CREATOR=1` (alternative to password)

## 🛠️ Features

### iOS Tools (iPhone 5s - iPhone 16)

**A5-A11 Chipsets (iPhone 5s to iPhone X)**:
- [1] Lockra1n - Checkm8 jailbreak
- [2] Checkra1n - Official checkm8 tool
- [3] Palera1n - iOS 15-16 jailbreak
- [4] OpenBypass - Activation lock resources

**A12-A18 Chipsets (iPhone XS/XR and newer)**:
- [15] MinaCriss - Modern bypass tool
- [16] iRemovalTools - Comprehensive suite
- [17] Brique Ramdisk - Ramdisk-based bypass

### Android Tools

- [5] FRP Bypass - Factory Reset Protection bypass
- [6] Magisk - Universal root manager
- [7] TWRP - Custom recovery loader
- [8] APK Helpers - APK manipulation utilities

### Device Detection

- [D] **Auto-detect connected devices**
  - Detects Android via ADB and Fastboot
  - Detects iOS via libimobiledevice
  - Shows device model, OS version, chipset
  - Provides exploit recommendations
  - Checks lock status (bootloader, FRP, activation)

### Utilities

- [9] Asset Manager - Manage tools and payloads
- [10] ADB Helper - Android Debug Bridge commands
- [11] Fastboot Helper - Fastboot operations
- [12] Download Utilities - Tool fetching

## 📋 Prerequisites

### Required

- **Windows 10/11** (for Windows executable)
- **Linux** / **macOS** (for respective executables)

### Optional (for device detection)

**For Android devices**:
```bash
# Windows
# Download Android Platform Tools from developer.android.com
# Add to PATH

# Linux
sudo apt-get install adb fastboot

# macOS
brew install android-platform-tools
```

**For iOS devices**:
```bash
# Linux
sudo apt-get install libimobiledevice-utils

# macOS
brew install libimobiledevice
```

## 💡 Usage Examples

### Detect Connected Devices

```
1. Connect device via USB
2. Enable USB debugging (Android) or Trust Computer (iOS)
3. Run BobbyDevArsenal
4. Select [D] for device detection
5. View device info and recommendations
```

### Load iOS Tool

```
1. Run BobbyDevArsenal
2. Select tool number (e.g., [15] for MinaCriss)
3. Read usage guide and instructions
4. Follow on-screen prompts
```

### Load Android Tool

```
1. Run BobbyDevArsenal
2. Select tool number (e.g., [5] for FRP Bypass)
3. Read bypass methods
4. Follow instructions for your device
```

## 🔍 Device Support

### iOS Devices

| Device | Chipset | Tools |
|--------|---------|-------|
| iPhone 5s - iPhone 6s Plus | A7-A9 | checkra1n, palera1n, iremovaltools |
| iPhone SE (1st), 7, 7 Plus | A9-A10 | checkra1n, palera1n, iremovaltools |
| iPhone 8, 8 Plus, X | A11 | checkra1n, palera1n, iremovaltools |
| iPhone XS, XS Max, XR | A12 | minacriss, iremovaltools, brique ramdisk |
| iPhone 11, 11 Pro, 11 Pro Max | A13 | minacriss, iremovaltools, brique ramdisk |
| iPhone 12, 12 Mini, Pro, Pro Max | A14 | minacriss, iremovaltools, brique ramdisk |
| iPhone 13, 13 Mini, Pro, Pro Max | A15 | minacriss, iremovaltools, brique ramdisk |
| iPhone 14, 14 Plus, Pro, Pro Max | A15/A16 | minacriss, iremovaltools, brique ramdisk |
| iPhone 15, 15 Plus, Pro, Pro Max | A16/A17 | minacriss, iremovaltools, brique ramdisk |
| iPhone 16, 16 Pro, 16 Pro Max | A17/A18 | minacriss, iremovaltools, brique ramdisk |

### Android Devices

All Android devices supported:
- FRP Bypass (all OEMs)
- Magisk Root (bootloader unlocked)
- TWRP Recovery (compatible devices)
- APK Management (all devices)

## ⚠️ Legal Notice

**READ CAREFULLY BEFORE USE**

### Legal Use Only

✅ **PERMITTED**:
- Recovering your own locked devices
- Authorized repair work with customer consent
- Security research on owned devices
- Educational purposes on owned devices

❌ **PROHIBITED**:
- Bypassing security on stolen devices
- Unauthorized access to others' devices
- Violating manufacturer terms of service
- Facilitating theft or fraud

### Official Unlock First

**ALWAYS** try official unlock methods before using bypass tools:

**iOS (Apple)**:
1. Contact Apple Support
2. Provide proof of purchase (receipt with serial number)
3. Request activation lock removal
4. Wait 3-5 business days
5. **FREE** for legitimate owners!

**Android (Google)**:
1. Use Google Account Recovery
2. Provide account information
3. Follow verification steps
4. Free for account owners

### Your Responsibility

- ⚠️ You are **SOLELY RESPONSIBLE** for your use of these tools
- ⚠️ Unauthorized use may result in **CRIMINAL CHARGES**
- ⚠️ Respect all **LAWS** and **TERMS OF SERVICE**
- ⚠️ Use only on devices you **LEGALLY OWN**

## 🛡️ Security & Privacy

### Data Privacy

- ✅ All operations are local (no data sent to servers)
- ✅ No telemetry or analytics
- ✅ No internet connection required (except for downloading tools)
- ✅ Your data stays on your computer

### Antivirus Warnings

Some antivirus software may flag PyInstaller executables as suspicious. This is a **false positive** common with all PyInstaller applications.

**Why this happens**:
- PyInstaller bundles Python runtime
- Executable unpacks itself at runtime
- Behavior similar to packers/compressors
- Many legitimate tools built with PyInstaller

**What to do**:
1. Download from official releases only
2. Verify file hash (provided in releases)
3. Add exception in antivirus if needed
4. Scan with VirusTotal for peace of mind

## 🆘 Troubleshooting

### "Access Denied" error
- Enter correct password
- Or set `BOBBY_CREATOR=1` environment variable

### "No devices detected"
- Install ADB tools (Android) or libimobiledevice (iOS)
- Enable USB debugging / Trust Computer
- Try different USB cable or port
- Restart ADB: `adb kill-server && adb start-server`

### Executable won't run
- **Windows**: Right-click → Properties → Unblock
- **Linux/Mac**: `chmod +x BobbyDevArsenal`
- Check antivirus isn't blocking it

### Tool not working
- Read the usage guide carefully
- Check device compatibility
- Ensure device is in correct mode (DFU, recovery, etc.)
- Review community forums for device-specific issues

## 📚 Documentation

Additional documentation:
- `BOBBY_DEV_SETUP.md` - Detailed setup guide
- `BUILD_INSTRUCTIONS.md` - How to build from source
- `bobby_dev/SECURITY.md` - Security best practices
- `bobby_dev/README.md` - Tool architecture

## 🔄 Updates

Check [Releases](../../releases) page for updates:
- New tool versions
- Bug fixes
- New device support
- Additional features

To update:
1. Download latest executable
2. Replace old executable
3. Password remains the same

## 💬 Support

For issues or questions:
1. Read this README completely
2. Check `BOBBY_DEV_SETUP.md` for detailed info
3. Review tool-specific usage guides (option [13] in menu)
4. Search community forums for similar issues

## 📄 License

Private creator tool - not for public distribution or commercial use.

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-08  
**Platform**: Windows, Linux, macOS  
**Size**: ~15-30 MB (varies by platform)

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│           BOBBY DEV ARSENAL - QUICK REFERENCE           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🔐 AUTH: Password or BOBBY_CREATOR=1                   │
│                                                         │
│  📱 iOS (A5-A11): Tools 1-4                            │
│  📱 iOS (A12+):   Tools 15-17                          │
│  🤖 Android:      Tools 5-8                            │
│  🔍 Detect:       Option D                             │
│  🛠️ Utils:        Tools 9-12                           │
│                                                         │
│  ⚠️ LEGAL: Only use on devices you legally own        │
│  ⚠️ TRY: Official unlock methods first                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Stay safe. Use responsibly. 🔒**
