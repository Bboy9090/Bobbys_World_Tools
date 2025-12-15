# The Pandora Codex - Complete Setup Guide

## 🎯 Quick Start (Recommended)

### Windows
1. **Download the package**
2. **Double-click** `START_APP.bat`
3. **Wait** for dependencies to install (first time only)
4. **Browser opens automatically** with the application

> **📘 Windows Users**: See [README_WINDOWS.md](README_WINDOWS.md) for detailed Windows-specific instructions, troubleshooting, and building without bash/WSL.

### Linux / macOS
1. **Download the package**
2. **Open terminal** in the folder
3. **Run**: `./START_APP.sh`
4. **Browser opens automatically** with the application

## 📦 What's Included

- ✅ Full web-based GUI application
- ✅ Backend API server (Express/Node.js)
- ✅ Frontend React application
- ✅ Bobby Dev Arsenal (17 tools)
- ✅ Device detection system
- ✅ iOS tools (A5-A18 chipsets)
- ✅ Android tools (all devices)
- ✅ Auto-installer for dependencies

## 🔧 Prerequisites

### Required Software
- **Python 3.8+** - [Download](https://www.python.org)
- **Node.js 18+** - [Download](https://nodejs.org)

### Optional (for device detection)
- **ADB tools** - For Android device detection
- **libimobiledevice** - For iOS device detection

## 🚀 First Time Setup

### Automatic Setup
Just run the launcher - it handles everything!

**Windows**: Double-click `START_APP.bat`
**Linux/Mac**: Run `./START_APP.sh`

The launcher will:
1. ✅ Check for Python and Node.js
2. ✅ Install backend dependencies (npm install)
3. ✅ Install frontend dependencies (npm install)
4. ✅ Start backend API server
5. ✅ Start frontend dev server
6. ✅ Open browser automatically

### Manual Setup (if needed)
```bash
# Install backend dependencies
cd crm-api
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Start application
cd ..
python launch_app.py
```

## 🌐 Accessing the Application

After starting, the application is available at:
- **Main App**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Bobby Dev Tab**: Click "bobby-dev" in navigation

## 🔐 Bobby Dev Authentication

The Bobby Dev arsenal requires authentication:

**Method 1: Environment Variable (Pre-configured)**
- The launcher automatically sets `BOBBY_CREATOR=1`
- No password needed when using launcher scripts

**Method 2: Password**
- Password: `bj0990`
- Enter when prompted in the GUI

## 📱 Features & Tabs

### Dashboard Tab
- System overview
- Device statistics
- Recent activity

### Devices Tab
- Connected device list
- Device management
- Quick actions

### Utilities Tab
- System utilities
- Helper tools
- Configuration

### Diagnostics Tab
- Device diagnostics
- Health checks
- System reports

### Arsenal Tab
- Repair tools
- Quick fixes
- Common operations

### DevMode Tab
- Developer tools
- ADB/Fastboot commands
- Advanced features

### Bobby Dev Tab 🔒
- **Private creator arsenal**
- iOS exploit tools (A5-A18)
- Android bypass tools
- Device auto-detection
- 17 specialized tools

## 🛠️ Using Bobby Dev

### 1. Device Detection
1. Click **bobby-dev** tab
2. Click **Scan for Devices**
3. View detected devices
4. See exploit recommendations

### 2. Load iOS Tool
1. Select tool from iOS section
2. View usage guide
3. Follow instructions

### 3. Load Android Tool
1. Select tool from Android section
2. View bypass methods
3. Follow instructions

## 🔍 Supported Devices

### iOS
| Chipset | Devices | Tools |
|---------|---------|-------|
| A5-A11 | iPhone 5s - iPhone X | checkra1n, palera1n, lockra1n |
| A12+ | iPhone XS/XR and newer | minacriss, iremovaltools, brique_ramdisk |

### Android
- All Android devices
- All OEM manufacturers
- FRP bypass, Magisk, TWRP, APK tools

## ⚠️ Troubleshooting

### Application won't start
**Error: Python not found**
- Install Python 3.8+ from python.org
- Add to PATH during installation

**Error: Node.js not found**
- Install Node.js 18+ from nodejs.org
- Restart terminal/command prompt

**Port already in use**
- Close other applications using ports 5000 or 5173
- Or edit `launch_app.py` to use different ports

### Dependencies won't install
**npm install fails**
- Delete `node_modules` folders
- Delete `package-lock.json` files
- Run installer again

### Browser doesn't open
- Manually open: http://localhost:5173
- Check firewall settings
- Try different browser

### Bobby Dev access denied
- Ensure `BOBBY_CREATOR=1` is set
- Or enter password: `bj0990`
- Check spelling carefully

### No devices detected
**Android**:
- Install ADB tools
- Enable USB debugging
- Accept computer authorization
- Use quality USB cable

**iOS**:
- Install libimobiledevice
- Trust computer on device
- Use Apple cable

## 🔄 Stopping the Application

**Windows**: Press `Ctrl+C` in the command window
**Linux/Mac**: Press `Ctrl+C` in the terminal

The launcher will gracefully shutdown both servers.

## 📂 Project Structure

```
The-Pandora-Codex-/
├── START_APP.bat          # Windows launcher
├── START_APP.sh           # Linux/Mac launcher
├── launch_app.py          # Python launcher script
├── main.py                # CLI version (bobby_dev)
├── bobby_dev/             # Private arsenal (gitignored)
├── crm-api/               # Backend API
│   ├── src/
│   │   ├── routes/
│   │   │   └── bobby-dev.ts  # Bobby Dev API
│   │   └── server.ts
│   └── package.json
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── BobbyDevPanel.tsx
│   │   └── App.tsx
│   └── package.json
└── docs/                  # Documentation
```

## 🔒 Security & Legal

### Legal Notice
⚠️ **CRITICAL**: Only use on devices you legally own

**Permitted**:
- ✅ Recovering your own devices
- ✅ Authorized repair work
- ✅ Security research on owned devices

**Prohibited**:
- ❌ Bypassing stolen devices
- ❌ Unauthorized access
- ❌ Violating ToS

### Security Features
- 🔒 Private arsenal (bobby_dev)
- 🔒 Authentication required
- 🔒 Excluded from git
- 🔒 Local-only operation
- 🔒 No telemetry

### Try Official Methods First
**iOS**: Contact Apple Support with proof of purchase
**Android**: Use Google Account Recovery

## 📚 Additional Documentation

- `BOBBY_DEV_SETUP.md` - Detailed Bobby Dev guide
- `BUILD_INSTRUCTIONS.md` - Build executable version
- `EXECUTABLE_README.md` - Standalone exe guide
- `bobby_dev/README.md` - Arsenal architecture
- `bobby_dev/SECURITY.md` - Security best practices

## 💡 Tips & Tricks

### Performance
- Close unused browser tabs
- Keep one device connected at a time
- Restart app if it becomes slow

### Device Detection
- Connect device before scanning
- Wait 5 seconds after connecting
- Try different USB ports if not detected

### Tool Usage
- Read usage guides carefully
- Check device compatibility
- Have backup plan ready
- Keep stock firmware for recovery

## 🆘 Support & Updates

### Getting Help
1. Read this guide completely
2. Check `BOBBY_DEV_SETUP.md`
3. Review tool-specific guides
4. Check community forums

### Updates
- Pull latest code from repository
- Rerun launcher (updates automatically)
- Check releases for new versions

## 🎉 You're Ready!

The Pandora Codex is now set up and ready to use.

**To start**: Double-click the launcher for your platform
**To stop**: Press Ctrl+C

**Remember**: Use responsibly and legally! 🔒

---

**Version**: 1.0.0
**Last Updated**: 2025-12-08
**Platform**: Windows, Linux, macOS
