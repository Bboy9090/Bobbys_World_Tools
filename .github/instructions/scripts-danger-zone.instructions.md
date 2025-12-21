---
applyTo:
  - "scripts/**"
  - ".pandora_private/scripts/**"
  - "**/arsenal-scripts/**"
---

# Scripts Danger Zone Rules

## Prime Directive

**SCRIPTS HAVE SYSTEM ACCESS. AUDIT EVERY COMMAND. NEVER TRUST INPUT.**

## Core Requirements

### 1. Command Allowlist

**ONLY these command categories are allowed without explicit approval:**

- **File operations**: `ls`, `cat`, `grep`, `find`, `mkdir`, `cp`, `mv`
- **Git operations**: `git status`, `git diff`, `git log`, `git show`
- **Package managers**: `npm`, `pnpm`, `yarn`, `pip`, `cargo` (with specific subcommands)
- **Build tools**: `tsc`, `vite`, `webpack`, `esbuild`
- **Linters/Formatters**: `eslint`, `prettier`, `cargo fmt`, `cargo clippy`
- **Test runners**: `vitest`, `jest`, `pytest`, `cargo test`

**FORBIDDEN without security review:**

- **System commands**: `rm -rf`, `dd`, `mkfs`, `fdisk`, `format`
- **Process operations**: `kill -9`, `pkill`, `killall` (unless targeting specific owned process)
- **Network operations**: `curl`, `wget`, `nc` (unless read-only and to known endpoints)
- **Privilege escalation**: `sudo`, `su`, `runas`
- **Execution**: `eval`, `exec`, `source` with user input
- **Shell operators**: `;`, `&&`, `||`, `|` with untrusted input

### 2. Input Validation

**ALL external input must be validated before use:**

```javascript
// ❌ BAD - Direct command injection vulnerability
const deviceName = process.argv[2];
execSync(`adb devices | grep ${deviceName}`);

// ✅ GOOD - Validate and sanitize
const deviceName = process.argv[2];
if (!/^[a-zA-Z0-9_-]+$/.test(deviceName)) {
  throw new Error(`Invalid device name: ${deviceName}`);
}
// Use parameterized execution (not shell interpolation)
const result = execFileSync('adb', ['devices'], { encoding: 'utf8' });
if (result.includes(deviceName)) {
  // Process safely
}
```

```python
# ❌ BAD - Shell injection vulnerability
import os
device_name = sys.argv[1]
os.system(f"adb devices | grep {device_name}")

# ✅ GOOD - Use subprocess with list (no shell)
import subprocess
device_name = sys.argv[1]
if not re.match(r'^[a-zA-Z0-9_-]+$', device_name):
    raise ValueError(f"Invalid device name: {device_name}")
result = subprocess.run(['adb', 'devices'], capture_output=True, text=True)
if device_name in result.stdout:
    # Process safely
```

### 3. Audit Logging

**ALL script executions must be logged:**

```javascript
const fs = require('fs');
const path = require('path');

function auditLog(action, details) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    action,
    details,
    user: process.env.USER || 'unknown',
    script: __filename
  };
  
  const logFile = path.join(__dirname, '../logs/script-audit.log');
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  
  console.log(`[AUDIT] ${action}:`, details);
}

// Usage
auditLog('DEVICE_FLASH', { device: 'USB0', firmware: 'v1.2.3' });
```

### 4. Error Handling

**Never swallow errors. Always fail loudly:**

```javascript
// ❌ BAD - Silent failure
try {
  execSync('some-command');
} catch (e) {
  // Ignoring error
}

// ✅ GOOD - Explicit error handling
try {
  execSync('some-command', { stdio: 'inherit' });
} catch (error) {
  console.error(`Command failed: ${error.message}`);
  auditLog('COMMAND_FAILED', { command: 'some-command', error: error.message });
  process.exit(1);
}
```

### 5. Path Safety

**Always validate and sanitize file paths:**

```javascript
const path = require('path');

// ❌ BAD - Path traversal vulnerability
const filename = req.query.file;
const content = fs.readFileSync(`./uploads/${filename}`);

// ✅ GOOD - Validate path stays in allowed directory
const filename = req.query.file;
const uploadDir = path.resolve(__dirname, './uploads');
const filePath = path.resolve(uploadDir, filename);

if (!filePath.startsWith(uploadDir)) {
  throw new Error('Path traversal attempt detected');
}

const content = fs.readFileSync(filePath);
```

### 6. Subprocess Execution

**Prefer `execFile` over `exec` (no shell interpretation):**

```javascript
const { execFile } = require('child_process');

// ❌ BAD - Shell injection risk
const userInput = getUserInput();
exec(`echo ${userInput}`, callback);

// ✅ GOOD - No shell, parameterized
execFile('echo', [userInput], (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  console.log(stdout);
});
```

```python
import subprocess

# ❌ BAD - Shell injection risk
user_input = get_user_input()
subprocess.run(f"echo {user_input}", shell=True)

# ✅ GOOD - No shell, list arguments
subprocess.run(['echo', user_input], check=True)
```

### 7. Environment Variables

**Validate environment variables before use:**

```javascript
// ❌ BAD - Trust environment blindly
const apiKey = process.env.API_KEY;
makeRequest(apiKey);

// ✅ GOOD - Validate format
const apiKey = process.env.API_KEY;
if (!apiKey || !/^[A-Za-z0-9_-]{32,}$/.test(apiKey)) {
  throw new Error('Invalid or missing API_KEY environment variable');
}
makeRequest(apiKey);
```

### 8. File Operations

**Always check file existence and permissions:**

```javascript
const fs = require('fs');

// ❌ BAD - Assumes file exists
const content = fs.readFileSync('./config.json', 'utf8');

// ✅ GOOD - Check first
if (!fs.existsSync('./config.json')) {
  console.error('config.json not found');
  process.exit(1);
}

try {
  const content = fs.readFileSync('./config.json', 'utf8');
  const config = JSON.parse(content);
} catch (error) {
  console.error(`Failed to read config: ${error.message}`);
  process.exit(1);
}
```

### 9. Timeouts

**Set timeouts for long-running operations:**

```javascript
const { execFile } = require('child_process');

// ✅ GOOD - Timeout prevents hanging
execFile('long-running-command', [], {
  timeout: 30000  // 30 seconds
}, (error, stdout, stderr) => {
  if (error) {
    if (error.killed) {
      console.error('Command timed out after 30s');
    } else {
      console.error(`Command failed: ${error.message}`);
    }
    process.exit(1);
  }
  console.log(stdout);
});
```

### 10. Dry Run Mode

**Support dry-run mode for testing:**

```javascript
const DRY_RUN = process.env.DRY_RUN === 'true';

function executeCommand(cmd, args) {
  if (DRY_RUN) {
    console.log(`[DRY RUN] Would execute: ${cmd} ${args.join(' ')}`);
    return;
  }
  
  auditLog('EXECUTE_COMMAND', { cmd, args });
  return execFileSync(cmd, args, { encoding: 'utf8' });
}

// Usage
executeCommand('adb', ['devices']);
```

## Pre-Commit Checklist

- [ ] All user inputs are validated
- [ ] No shell=True / no direct `exec()` with interpolation
- [ ] Paths are sanitized (no traversal)
- [ ] Commands are allowlisted
- [ ] Audit logging implemented
- [ ] Error handling is explicit (no silent failures)
- [ ] Timeouts set for long operations
- [ ] Environment variables validated
- [ ] Dry-run mode supported (if applicable)
- [ ] Script tested in isolated environment

## Security Review Required For

- New network operations
- New file system operations outside known paths
- New system commands
- Any use of `sudo` or elevated privileges
- Scripts that modify production systems
- Scripts that handle sensitive data

## Examples of Good vs Bad

### Bad: Shell Injection
```javascript
const deviceId = req.params.deviceId;
exec(`adb -s ${deviceId} reboot`);
```

### Good: Parameterized Execution
```javascript
const deviceId = req.params.deviceId;
if (!/^[a-f0-9]+$/.test(deviceId)) {
  throw new Error('Invalid device ID format');
}
execFile('adb', ['-s', deviceId, 'reboot'], (error) => {
  if (error) {
    auditLog('DEVICE_REBOOT_FAILED', { deviceId, error: error.message });
    throw error;
  }
  auditLog('DEVICE_REBOOTED', { deviceId });
});
```

### Bad: Path Traversal
```bash
#!/bin/bash
FILE=$1
cat "/var/www/uploads/$FILE"  # Can access ../../etc/passwd
```

### Good: Path Validation
```bash
#!/bin/bash
FILE=$1

# Validate filename format
if [[ ! "$FILE" =~ ^[a-zA-Z0-9_.-]+$ ]]; then
  echo "Invalid filename format"
  exit 1
fi

# Ensure no path traversal
UPLOAD_DIR="/var/www/uploads"
FULL_PATH="$UPLOAD_DIR/$FILE"

# Resolve real path and check it's within upload dir
REAL_PATH=$(realpath "$FULL_PATH" 2>/dev/null)
if [[ ! "$REAL_PATH" == "$UPLOAD_DIR"/* ]]; then
  echo "Path traversal attempt detected"
  exit 1
fi

cat "$REAL_PATH"
```

## Incident Response

### If Security Incident Detected

1. **Immediately halt script execution**
2. **Preserve logs** (don't delete evidence)
3. **Notify security team**
4. **Assess impact** (what was accessed/modified)
5. **Patch vulnerability**
6. **Post-mortem** (document and learn)

### If Script Causes Production Issue

1. **Stop the script**
2. **Assess damage** (what changed)
3. **Rollback if possible** (undo changes)
4. **Notify team**
5. **Fix the bug**
6. **Add tests to prevent recurrence**

## Additional Resources

- [OWASP Command Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Python subprocess security](https://docs.python.org/3/library/subprocess.html#security-considerations)
