# 🚀 Complete Bundle Build Guide

**Build Tauri app with Python runtime, Node.js, and all dependencies**

---

## 📦 What Gets Bundled

### Included Components:
1. ✅ **Frontend** - React + Vite build
2. ✅ **Node.js Runtime** - Embedded Node.js
3. ✅ **Node.js Server** - Complete server code
4. ✅ **Python Runtime** - Embedded Python 3.12
5. ✅ **FastAPI Backend** - Secret Rooms backend
6. ✅ **All Dependencies** - Pre-installed packages
7. ✅ **Unified Launcher** - Auto-starts all services

---

## 🪟 Windows Build (NSIS Installer)

### Prerequisites:
- Node.js 18+
- Rust (latest stable)
- Windows SDK
- Visual Studio Build Tools

### Build Command:
```powershell
npm run build:complete:windows
```

### Output:
- **Installer**: `dist-artifacts/windows/Bobbys-Workshop-4.0.1-setup.exe`
- **Type**: NSIS installer (.exe)
- **Features**:
  - One-click installation
  - Desktop shortcut
  - Start menu entry
  - Uninstaller
  - Auto-starts services on launch

### Installer Options:
- ✅ Allow installation directory selection
- ✅ Create desktop shortcut
- ✅ Create start menu entry
- ✅ Run after installation
- ✅ Multi-language support

---

## 🍎 macOS Build (DMG + PKG)

### Prerequisites:
- Node.js 18+
- Rust (latest stable)
- Xcode Command Line Tools
- macOS 10.13+

### Build Command:
```bash
npm run build:complete:macos
```

### Output:
- **DMG**: `dist-artifacts/macos/Bobbys-Workshop-4.0.1.dmg`
- **PKG**: `dist-artifacts/macos/Bobbys-Workshop-4.0.1.pkg`
- **App Bundle**: `dist-artifacts/macos/Bobbys Workshop.app`

### DMG Features:
- Drag-to-install interface
- Applications folder link
- Custom background
- Icon positioning

### PKG Features:
- System-wide installation
- Standard macOS installer
- Code signing ready

---

## 🐧 Linux Build (AppImage)

### Prerequisites:
- Node.js 18+
- Rust (latest stable)
- System dependencies

### Build Command:
```bash
npm run build:complete:macos  # Same script works for Linux
```

### Output:
- **AppImage**: `dist-artifacts/linux/Bobbys-Workshop-4.0.1.AppImage`

### AppImage Features:
- Portable (no installation needed)
- Self-contained
- Executable directly

---

## 🔧 Build Process

### Step-by-Step:

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build Frontend**
   ```bash
   npm run build
   ```

3. **Prepare Bundle**
   ```bash
   npm run prepare:bundle
   ```
   - Bundles Node.js runtime
   - Bundles server code
   - Bundles Python runtime
   - Copies unified launcher

4. **Build Tauri**
   ```bash
   npm run build:complete
   ```
   - Builds Rust code
   - Packages everything
   - Creates installer

---

## 🎯 Unified Launcher

The unified launcher automatically starts:
1. **Node.js Server** (port 3001)
2. **FastAPI Backend** (port 8000)

### Windows:
- `unified-launcher.ps1`
- Runs in background
- Logs to `%APPDATA%\BobbysWorkshop\logs\`

### macOS/Linux:
- `unified-launcher.sh`
- Runs in background
- Logs to `~/.bobbysworkshop/logs/`

---

## 📋 Python Runtime Bundling

### Windows:
- Downloads embedded Python 3.12.1
- Extracts to `python/runtime/python-embedded/`
- Installs all dependencies from `requirements.txt`
- Copies backend modules

### macOS/Linux:
- Uses system Python or creates portable bundle
- Installs dependencies
- Copies backend modules

### Command:
```bash
npm run bundle:python
```

---

## ✅ Verification

After build, verify:

1. **Installer exists** in `dist-artifacts/`
2. **File size** is reasonable (200-500MB)
3. **All services start** on launch
4. **Frontend connects** to backends
5. **Secret Rooms work** end-to-end

---

## 🚀 Distribution

### Windows:
- Distribute `.exe` installer
- Users run installer
- App auto-starts services

### macOS:
- Distribute `.dmg` or `.pkg`
- Users drag to Applications or run installer
- App auto-starts services

### Linux:
- Distribute `.AppImage`
- Users make executable and run
- App auto-starts services

---

## 🎉 Success!

**Your complete bundle is ready for distribution!**

All components are bundled, services auto-start, and everything is connected.

**No external dependencies required!** 🚀
