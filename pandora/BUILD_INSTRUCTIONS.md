# Building Bobby Dev Arsenal Executable

This guide shows how to build a standalone executable (.exe) of Bobby Dev Arsenal that can be easily distributed and used without requiring Python installation.

## Prerequisites

### For Building
- Python 3.8 or higher
- pip (Python package manager)
- PyInstaller (will be installed automatically by build script)

### For Running the Built Executable
- **No Python required!** The executable is standalone
- Windows 10/11 (for .exe)
- ADB tools (for Android device detection)
- libimobiledevice (for iOS device detection) - optional

## Quick Build

### Option 1: Automated Build Script (Recommended)

```bash
# Navigate to project directory
cd /path/to/The-Pandora-Codex-

# Run build script
python build_exe.py
```

The script will:
1. ✅ Check for PyInstaller (install if needed)
2. ✅ Collect all bobby_dev modules
3. ✅ Build single-file executable
4. ✅ Output to `dist/BobbyDevArsenal.exe`

### Option 2: Manual PyInstaller Build

```bash
# Install PyInstaller
pip install pyinstaller

# Build using spec file
pyinstaller BobbyDevArsenal.spec

# OR build with command line
pyinstaller --onefile --name=BobbyDevArsenal \
    --add-data "bobby_dev:bobby_dev" \
    --hidden-import=bobby_dev \
    --hidden-import=bobby_dev.ios \
    --hidden-import=bobby_dev.android \
    --hidden-import=bobby_dev.utils \
    --hidden-import=bobby_dev.assets \
    --hidden-import=bobby_dev.device_detector \
    main.py
```

## Output Location

After successful build:
- **Executable**: `dist/BobbyDevArsenal.exe` (Windows)
- **Executable**: `dist/BobbyDevArsenal` (Linux/Mac)
- **Size**: Approximately 15-30 MB (includes Python runtime)

## Distribution

### What to Share
```
BobbyDevArsenal.exe  (the standalone executable)
README.md            (optional: usage instructions)
```

### What NOT to Share
- `bobby_dev/` directory (private, for development only)
- `build/` directory (temporary build files)
- `__pycache__/` directories
- `.pyc` files
- Source code (unless you want to)

## Running the Executable

### End User Instructions

1. **Download** `BobbyDevArsenal.exe`

2. **Run** the executable:
   ```cmd
   # Double-click BobbyDevArsenal.exe
   # OR from command line:
   BobbyDevArsenal.exe
   ```

3. **Authenticate**:
   - Password: `bj0990`
   - OR set environment variable:
     ```cmd
     set BOBBY_CREATOR=1
     BobbyDevArsenal.exe
     ```

4. **Use the Arsenal**:
   - Select `[D]` to detect devices
   - Select tool numbers (1-17) to load tools
   - Follow on-screen instructions

## Features Included in Executable

✅ All iOS tools (A5-A18 support)
  - Lockra1n, Checkra1n, Palera1n, OpenBypass
  - MinaCriss, iRemovalTools, Brique Ramdisk

✅ All Android tools
  - FRP Bypass, Magisk, TWRP, APK Helpers

✅ Device detection
  - Auto-detect Android (ADB/Fastboot)
  - Auto-detect iOS (libimobiledevice)
  - Automatic exploit recommendations

✅ Utilities
  - Asset Manager
  - ADB Helper
  - Fastboot Helper
  - Download utilities

✅ Security
  - Password authentication
  - Creator-only access
  - Legal warnings

## Troubleshooting

### Build Issues

**"PyInstaller not found"**
```bash
pip install pyinstaller
```

**"Module not found" errors during build**
```bash
# Ensure bobby_dev package is in same directory as main.py
ls bobby_dev/  # Should show __init__.py and subfolders
```

**"Failed to execute script" when running**
- Make sure all dependencies are included in spec file
- Check that bobby_dev package is bundled correctly
- Run with `--debug` flag: `pyinstaller --debug all BobbyDevArsenal.spec`

### Runtime Issues

**"Access Denied"**
- Enter password: `bj0990`
- OR set `BOBBY_CREATOR=1` environment variable

**"No devices detected"**
- Install ADB tools for Android detection
- Install libimobiledevice for iOS detection
- Enable USB debugging (Android) or Trust Computer (iOS)

**"Permission denied" errors**
- Run as Administrator (Windows)
- Check antivirus isn't blocking the executable

## Advanced Build Options

### Customize Build

Edit `BobbyDevArsenal.spec` to:
- Add custom icon: `icon='path/to/icon.ico'`
- Change console visibility: `console=False` for no console window
- Add version info: `version='version_info.txt'`
- Compress with UPX: `upx=True` (default)

### Cross-Platform Builds

**Windows executable on Windows**:
```bash
python build_exe.py
# Creates: dist/BobbyDevArsenal.exe
```

**Linux binary on Linux**:
```bash
python3 build_exe.py
# Creates: dist/BobbyDevArsenal
```

**Mac app on macOS**:
```bash
python3 build_exe.py
# Creates: dist/BobbyDevArsenal
# Optionally convert to .app bundle
```

**Note**: Cross-compilation (e.g., building Windows .exe on Linux) is not supported by PyInstaller. Build on the target platform.

## Code Signing (Optional)

### Windows Code Signing

```bash
# After building, sign the executable
signtool sign /f certificate.pfx /p password /t http://timestamp.server.com dist/BobbyDevArsenal.exe
```

### Benefits of Code Signing
- Prevents "Unknown Publisher" warnings
- Trusted by Windows SmartScreen
- Professional appearance
- Cost: ~$100-500/year for certificate

## Testing the Executable

### Before Distribution

1. **Test on clean system** (no Python installed)
2. **Test all tools load correctly**
3. **Test device detection works**
4. **Test authentication works**
5. **Scan with antivirus** (some AV flag PyInstaller exes)

### Test Commands
```cmd
# Test authentication
BobbyDevArsenal.exe
# Enter password: bj0990

# Test with env var
set BOBBY_CREATOR=1
BobbyDevArsenal.exe

# Test device detection (with device connected)
# Select option [D]
```

## Security Notes

⚠️ **Important**:
- The password hash is embedded in the executable
- Anyone with the executable can reverse-engineer it
- For maximum security, use environment variable authentication
- Don't distribute to untrusted parties
- Keep source code private

## File Sizes

Typical sizes:
- **Source code**: ~200 KB
- **Executable**: ~15-30 MB (includes Python interpreter)
- **Compressed (ZIP)**: ~10-20 MB

## Alternative: Portable Python Bundle

Instead of single executable, you can create a portable Python bundle:

```bash
# Create portable directory
mkdir BobbyDevArsenal-Portable
cd BobbyDevArsenal-Portable

# Copy files
cp -r ../bobby_dev .
cp ../main.py .
cp ../README.md .

# Create launcher script (launcher.bat for Windows)
echo @echo off > launcher.bat
echo set BOBBY_CREATOR=1 >> launcher.bat
echo python main.py >> launcher.bat

# Package with portable Python (download from python.org)
# Total size: ~50-100 MB but more flexible
```

## Support

For issues or questions:
1. Check this documentation
2. Review `BOBBY_DEV_SETUP.md` for usage help
3. Check `bobby_dev/SECURITY.md` for security info

---

**Last Updated**: 2025-12-08
**Build Tool**: PyInstaller 5.x+
**Python Version**: 3.8+
