# The Pandora Codex - Windows Installation & Usage Guide

This guide provides Windows-specific instructions for installing, building, and running The Pandora Codex without requiring bash, Git Bash, or WSL (Windows Subsystem for Linux).

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Available Scripts](#available-scripts)
- [Troubleshooting](#troubleshooting)
- [Advanced Topics](#advanced-topics)

---

## Prerequisites

### Required Software

1. **Node.js 18 or higher**
   - Download from: https://nodejs.org
   - Choose the LTS (Long Term Support) version
   - **Important**: During installation, check "Add to PATH" option
   - Verify installation:
     ```cmd
     node --version
     npm --version
     ```

2. **Python 3.8 or higher**
   - Download from: https://www.python.org
   - **Important**: During installation, check "Add Python to PATH" option
   - Verify installation:
     ```cmd
     python --version
     ```

### Optional Software

- **Git for Windows** (for cloning the repository)
  - Download from: https://git-scm.com/download/win
  - Required only if you're cloning from GitHub

---

## Installation

### Step 1: Get the Code

**Option A: Clone with Git** (Recommended)
```cmd
git clone https://github.com/Bboy9090/The-Pandora-Codex-.git
cd The-Pandora-Codex-
```

**Option B: Download ZIP**
1. Go to the GitHub repository
2. Click "Code" → "Download ZIP"
3. Extract the ZIP file
4. Open Command Prompt and navigate to the extracted folder

### Step 2: Build the Project

Double-click `build.bat` or run from Command Prompt:
```cmd
build.bat
```

This script will:
- Detect Node.js installation automatically
- Install frontend dependencies
- Build the frontend application
- Copy frontend files to backend
- Install backend dependencies
- Build the backend API

**Note**: The build process may take 5-15 minutes depending on your system and internet connection.

---

## Quick Start

### Method 1: Using START_APP.bat (Recommended)

Simply double-click `START_APP.bat` in the project root folder.

This launcher will:
- ✅ Check for Python and Node.js
- ✅ Provide clear error messages if prerequisites are missing
- ✅ Start both backend and frontend
- ✅ Open your browser automatically

### Method 2: Using start.bat (Production Mode)

If you've already built the project and want to run only the backend server:

```cmd
start.bat
```

Then manually open your browser to: http://localhost:5000

---

## Available Scripts

All scripts are located in the project root directory and can be run by double-clicking or from Command Prompt.

### START_APP.bat
**Purpose**: Main launcher for the application (development mode)

**What it does**:
- Detects Python and Node.js installations
- Starts the full application with frontend dev server and backend
- Opens browser automatically
- Handles authentication automatically (Bobby Creator mode)

**Usage**:
```cmd
START_APP.bat
```

### build.bat
**Purpose**: Build the entire project for production

**What it does**:
- Installs all dependencies (frontend + backend)
- Builds frontend static files
- Generates Prisma database client
- Builds backend TypeScript to JavaScript

**Usage**:
```cmd
build.bat
```

**When to run**:
- First time setup
- After pulling updates from Git
- After modifying frontend or backend code
- Before deploying to production

### start.bat
**Purpose**: Start the production server

**What it does**:
- Detects Node.js installation
- Starts the built backend server on port 5000
- Serves the frontend from backend's public folder

**Usage**:
```cmd
start.bat
```

**Prerequisites**:
- Must run `build.bat` first

---

## Troubleshooting

### Problem: "Python not found!" or "Node.js not found!"

**Solution**:

1. **Check if installed**:
   ```cmd
   python --version
   node --version
   ```

2. **If not found, install from official websites**:
   - Python: https://www.python.org
   - Node.js: https://nodejs.org
   - **Remember to check "Add to PATH" during installation**

3. **If already installed but not detected**:
   
   The batch scripts check these locations automatically:
   
   **Python**:
   - `C:\Program Files\Python3X\python.exe`
   - `%LOCALAPPDATA%\Programs\Python\Python3X\python.exe`
   - System PATH
   
   **Node.js**:
   - `C:\Program Files\nodejs\node.exe`
   - `C:\Program Files (x86)\nodejs\node.exe`
   - `%LOCALAPPDATA%\Programs\nodejs\node.exe`
   - System PATH

4. **Manual override** (if needed):
   
   If you have Python/Node.js in a custom location, you can edit the .bat files to add your specific path. Look for the detection section and add your path at the beginning of the checks.

### Problem: Build fails with "npm install" errors

**Solution**:

1. **Clear npm cache**:
   ```cmd
   npm cache clean --force
   ```

2. **Delete node_modules and reinstall**:
   ```cmd
   cd frontend
   rmdir /s /q node_modules
   npm install
   
   cd ..\crm-api
   rmdir /s /q node_modules
   npm install
   ```

3. **Check internet connection**: npm needs to download packages

4. **Try with elevated permissions**: Right-click Command Prompt → "Run as Administrator"

### Problem: Port 5000 already in use

**Solution**:

1. **Find what's using the port**:
   ```cmd
   netstat -ano | findstr :5000
   ```

2. **Kill the process** (use the PID from above):
   ```cmd
   taskkill /PID <pid_number> /F
   ```

3. **Or change the port**: Edit `start.bat` and change:
   ```batch
   set PORT=5000
   ```
   to another port like:
   ```batch
   set PORT=3000
   ```

### Problem: "The term 'npm' is not recognized"

**Solution**:

This usually means Node.js wasn't added to PATH during installation.

1. **Reinstall Node.js** and check "Add to PATH"
2. **Or add manually** to PATH:
   - Open System Properties → Advanced → Environment Variables
   - Add to PATH: `C:\Program Files\nodejs\`
   - Restart Command Prompt

### Problem: Scripts open and close immediately

**Solution**:

1. **Run from Command Prompt** instead of double-clicking to see errors:
   ```cmd
   cd path\to\The-Pandora-Codex-
   START_APP.bat
   ```

2. **Check the error messages** - they will tell you what's wrong

3. **All scripts have pause commands** built in, so they should wait for you to press a key before closing

### Problem: Browser doesn't open automatically

**Solution**:

START_APP.bat relies on the Python launcher script to open the browser. If it doesn't open:

1. **Manually open**: http://localhost:5000 (for start.bat)
2. **Or**: Check the console output for the correct URL and port

---

## Advanced Topics

### Running in Development Mode

If you want to run the frontend with hot-reload during development:

1. **Terminal 1 - Backend**:
   ```cmd
   cd crm-api
   npm install
   npm run dev
   ```

2. **Terminal 2 - Frontend**:
   ```cmd
   cd frontend
   npm install
   npm run dev
   ```

### Building for Production Deployment

1. Run `build.bat` to create production builds
2. The built files will be in:
   - Frontend: `frontend/dist/`
   - Backend: `crm-api/dist/`
3. Use `start.bat` to run the production server

### Environment Variables

The batch scripts set some environment variables automatically:

- `BOBBY_CREATOR=1` - Bypasses password authentication
- `NODE_ENV=production` - Sets Node.js to production mode (start.bat)
- `PORT=5000` - Sets the server port (start.bat)

To customize, edit the respective .bat files.

### Using Without Administrator Rights

All batch scripts are designed to work without administrator privileges. They:
- Use relative paths (`%~dp0`) to refer to project files
- Don't modify system settings
- Don't require registry access
- Store all files within the project directory

### Uninstalling

Simply delete the project folder. The Pandora Codex doesn't install anything system-wide.

---

## Technical Details

### How Node.js Detection Works

The batch scripts detect Node.js using this priority order:

1. **Common installation paths**:
   - `C:\Program Files\nodejs\node.exe`
   - `C:\Program Files (x86)\nodejs\node.exe`
   - `%LOCALAPPDATA%\Programs\nodejs\node.exe`

2. **Fallback to PATH**: If not found in common locations, tries `node` command

3. **Error if not found**: Clear error message with installation instructions

### Why Absolute Paths?

The batch scripts use absolute paths to executables to ensure they work even when:
- System PATH is not inherited (e.g., when double-clicking)
- Running from scheduled tasks
- Running from other automation tools
- PATH is corrupted or misconfigured

This makes the scripts more reliable on various Windows configurations.

### Portable Path References

All batch scripts use `%~dp0` to refer to the project directory. This means:
- Scripts work regardless of where the project is located
- No hard-coded paths
- Can be moved to any drive or folder
- Works on USB drives

---

## Getting Help

If you encounter issues not covered in this guide:

1. **Check the console output** - error messages usually explain the problem
2. **Verify prerequisites** - ensure Python and Node.js are properly installed
3. **Try running build.bat again** - some issues are temporary
4. **Check GitHub Issues** - others may have encountered the same problem
5. **Open a new issue** on GitHub with:
   - Windows version
   - Python version (`python --version`)
   - Node.js version (`node --version`)
   - Full error message or screenshot
   - Which .bat file you were running

---

## Comparison with Linux/Mac

| Task | Windows | Linux/Mac |
|------|---------|-----------|
| Build | `build.bat` | `./build.sh` or `npm run build` |
| Start App | `START_APP.bat` | `./START_APP.sh` |
| Start Server | `start.bat` | `./start.sh` or `npm start` |

The batch files provide the same functionality as the shell scripts, just adapted for Windows.

---

## Notes

- All .bat files are safe to run and don't require administrator privileges
- The scripts don't modify system settings or install anything globally
- They only work with files in the project directory
- You can safely run them multiple times
- They include error checking and clear messages at every step

---

**Enjoy using The Pandora Codex on Windows!** 🚀
