# ✅ Windows Desktop Shortcut Created

## 📋 Summary

A Windows desktop shortcut has been created for **Bobby's Workshop**.

---

## 🎯 Shortcut Details

**Location:** Desktop  
**Name:** `Bobby's Workshop.lnk`  
**Target:** 
- Production build (if available): `src-tauri/target/release/bobbys-workshop.exe`
- Development mode (if no production build): `npm run tauri:dev`

---

## 📂 Shortcut Creation Script

**Script:** `scripts/create-desktop-shortcut.ps1`

**Features:**
- ✅ Automatically detects production vs development build
- ✅ Creates shortcut on Windows desktop
- ✅ Sets working directory correctly
- ✅ Uses application icon
- ✅ Configures proper window style

---

## 🚀 Usage

### Launch the Application

1. **Double-click** the "Bobby's Workshop" shortcut on your desktop
2. The application will launch:
   - **Production mode** (if built): Launches the standalone app directly
   - **Development mode** (if not built): Launches `npm run tauri:dev`

### Recreate Shortcut

If you need to recreate the shortcut:

```powershell
# From project root
powershell -ExecutionPolicy Bypass -File scripts/create-desktop-shortcut.ps1
```

Or using npm script (if added):

```powershell
npm run shortcut:create
```

---

## 🔧 How It Works

The script:

1. **Detects Build Type:**
   - Checks for production build in `src-tauri/target/release/`
   - Falls back to development mode if no build found

2. **Creates Shortcut:**
   - Uses Windows COM object (`WScript.Shell`)
   - Sets target path, working directory, and icon
   - Saves to desktop

3. **Configuration:**
   - Icon: `src-tauri/icons/icon.ico`
   - Description: "Bobby's Workshop - Professional Device Repair Toolkit"
   - Window Style: Normal window

---

## 📝 Notes

- **Production Build:** After running `npm run tauri:build:windows`, the shortcut will automatically use the production executable
- **Development Build:** If no production build exists, the shortcut launches development mode
- **Icon:** Uses the application icon from `src-tauri/icons/icon.ico`

---

## ✅ Status

**Shortcut Created:** ✅  
**Location:** Desktop  
**Ready to Use:** Yes
