# 🚀 Standalone App Build Instructions
## Windows & macOS Installers

**Bobby's Workshop** can be built as standalone installers for Windows and macOS using Tauri.

---

## ✅ Configuration Complete

The Tauri configuration has been updated to support both platforms:
- **Windows**: `.msi` and `.exe` (NSIS) installers
- **macOS**: `.app` bundle and `.dmg` disk image

---

## 📋 Prerequisites

### Windows Build Requirements

1. **Rust Toolchain**
   ```powershell
   # Install Rust
   winget install Rustlang.Rustup
   # Or download from: https://rustup.rs/
   ```

2. **Visual Studio Build Tools**
   ```powershell
   winget install Microsoft.VisualStudio.2022.BuildTools
   ```

3. **Tauri CLI**
   ```powershell
   cargo install tauri-cli --locked
   ```

4. **Node.js** (v18+)
   ```powershell
   # Verify installation
   node --version
   npm --version
   ```

5. **NSIS** (for NSIS installer)
   ```powershell
   winget install NSIS.NSIS
   ```

6. **WiX Toolset** (optional, for MSI installer)
   - Download from: https://wixtoolset.org/releases/

### macOS Build Requirements

1. **Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

2. **Rust Toolchain**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source $HOME/.cargo/env
   ```

3. **Tauri CLI**
   ```bash
   cargo install tauri-cli --locked
   ```

4. **Node.js** (v18+)
   ```bash
   # Install via Homebrew
   brew install node
   ```

5. **macOS Version**: 10.13 (High Sierra) or later

---

## 🔨 Building the Installers

### Windows Build

```powershell
# Build Windows installer (creates .msi and .exe)
npm run tauri:build:windows

# Output location:
# src-tauri/target/x86_64-pc-windows-msvc/release/bundle/
#   - MSI installer: *.msi
#   - NSIS installer: *.exe
```

**Expected Output:**
- `Bobbys Workshop_4.0.1_x64_en-US.msi` (MSI installer)
- `Bobbys Workshop_4.0.1_x64-setup.exe` (NSIS installer)

### macOS Build

```bash
# Build macOS installer (creates .app and .dmg)
npm run tauri:build:macos

# Output location:
# src-tauri/target/x86_64-apple-darwin/release/bundle/
#   - App bundle: Bobbys Workshop.app
#   - DMG disk image: *.dmg
```

**Expected Output:**
- `Bobbys Workshop.app` (Application bundle)
- `Bobbys Workshop_4.0.1_x64.dmg` (Disk image installer)

### Build All Platforms

```bash
# Build for current platform
npm run tauri:build

# Note: Cross-platform builds require the target platform's build tools
```

---

## 📦 Build Scripts

The following npm scripts are available:

```json
{
  "tauri:dev": "cargo tauri dev",
  "tauri:build": "npm run build && npm run prepare:bundle && cargo tauri build",
  "tauri:build:windows": "npm run build && npm run prepare:bundle && cargo tauri build --target x86_64-pc-windows-msvc",
  "tauri:build:macos": "npm run build && npm run prepare:bundle && cargo tauri build --target x86_64-apple-darwin",
  "tauri:build:linux": "npm run build && npm run prepare:bundle && cargo tauri build --target x86_64-unknown-linux-gnu"
}
```

---

## 🎯 Build Process

1. **Frontend Build**: Compiles React/TypeScript to optimized production build
2. **Bundle Preparation**: Packages server, runtime, and resources
3. **Tauri Build**: Compiles Rust backend and creates native installer

**Total Build Time**: ~5-15 minutes (depending on hardware)

---

## 📂 Output Locations

### Windows
```
src-tauri/target/x86_64-pc-windows-msvc/release/bundle/
├── msi/
│   └── Bobbys Workshop_4.0.1_x64_en-US.msi
└── nsis/
    └── Bobbys Workshop_4.0.1_x64-setup.exe
```

### macOS
```
src-tauri/target/x86_64-apple-darwin/release/bundle/
├── macos/
│   └── Bobbys Workshop.app
└── dmg/
    └── Bobbys Workshop_4.0.1_x64.dmg
```

---

## 🚀 Distribution

### Windows

**For End Users:**
1. Download the `.msi` or `.exe` installer
2. Double-click to run installer
3. Follow installation wizard
4. Launch from Start Menu

**MSI Installer:**
- Silent installation support
- Windows Installer integration
- Standard Windows installation experience

**NSIS Installer (.exe):**
- Custom installation wizard
- More customization options
- Single executable file

### macOS

**For End Users:**
1. Download the `.dmg` file
2. Open the DMG (may need to allow in Security settings)
3. Drag "Bobby's Workshop" to Applications folder
4. Launch from Applications

**First Launch:**
- macOS may show security warning
- Go to **System Preferences → Security & Privacy**
- Click "Open Anyway" to allow the app

---

## 🔐 Code Signing (Optional)

### Windows Code Signing

For production releases, you can sign Windows installers:

1. Obtain a code signing certificate
2. Update `tauri.conf.json`:
   ```json
   "windows": {
     "certificateThumbprint": "YOUR_CERT_THUMBPRINT"
   }
   ```

### macOS Code Signing

For distribution outside the App Store:

1. Join Apple Developer Program
2. Create Developer ID certificates
3. Update `tauri.conf.json`:
   ```json
   "macOS": {
     "signingIdentity": "Developer ID Application: Your Name"
   }
   ```

**Note**: Code signing is optional for local builds and testing.

---

## ⚠️ Troubleshooting

### Windows Build Issues

**Error: "cargo: command not found"**
- Install Rust: `winget install Rustlang.Rustup`
- Restart terminal after installation

**Error: "link.exe not found"**
- Install Visual Studio Build Tools
- Or install Visual Studio Community with C++ workload

**Error: "NSIS not found"**
- Install NSIS: `winget install NSIS.NSIS`
- Add NSIS to PATH

### macOS Build Issues

**Error: "xcode-select: error"**
- Install Xcode Command Line Tools: `xcode-select --install`

**Error: "cannot find -lSystem"**
- Update Xcode: `xcode-select --switch /Applications/Xcode.app/Contents/Developer`

**Error: "framework not found"**
- Ensure macOS SDK is installed
- Check Xcode installation

---

## 📚 Additional Resources

- [Tauri Documentation](https://tauri.app/v1/guides/building/)
- [Windows Build Guide](./BUILD.md)
- [macOS Build Guide](./MACOS_BUILD_GUIDE.md)
- [Tauri Build Guide](./TAURI_BUILD_GUIDE.md)

---

## ✅ Quick Start Summary

**Windows:**
```powershell
npm install
npm run tauri:build:windows
```

**macOS:**
```bash
npm install
npm run tauri:build:macos
```

**Output:** Installers ready for distribution! 🎉
