# Pandora Codex - Monorepo Documentation

## 🏗️ Monorepo Structure

```
The-Pandora-Codex-/
├── apps/                          # Applications
│   ├── pandora-codex-web/         # React + Vite + TypeScript frontend
│   ├── pandora-codex-api/         # Express TypeScript API server
│   └── phoenix-key/               # Python device recovery tool
├── crates/                        # Rust workspaces
│   └── bootforge-usb/             # Rust driver layer (Cargo workspace)
├── packages/                      # Shared TypeScript packages
│   ├── shared-types/              # Common types and utilities
│   ├── ui-kit/                    # Shared React components
│   └── arsenal-scripts/           # Development utility scripts
├── .devcontainer/                 # VS Code devcontainer configuration
├── .github/workflows/             # CI/CD workflows
├── turbo.json                     # Turbo build configuration
├── pnpm-workspace.yaml            # pnpm workspace configuration
└── package.json                   # Root workspace configuration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **pnpm** 8+ (`npm install -g pnpm`)
- **Rust** (stable toolchain)
- **Python** 3.8+
- **Android Platform Tools** (optional: adb, fastboot)

### Installation

```bash
# Install all workspace dependencies
pnpm install

# Build all packages
pnpm build

# Start development
pnpm dev
```

### Development Workflow

```bash
# Start all services concurrently
pnpm dev

# Start individual services
pnpm web:dev          # Web app on :5173
pnpm api:dev          # API server on :3001

# Build all packages
pnpm build

# Run linters
pnpm lint

# Run tests
pnpm test

# Check environment status
pnpm arsenal:status

# Build Rust components
pnpm bootforge:build
pnpm bootforge:test
```

## ⛓️ Power Chains System

The Pandora Codex implements three specialized automation chains for multi-step workflows:

### 1. Phoenix Chain++ (Ship Mode)
**6-step autopilot for shipping features**

1. **PLAN** - Architecture + tasks
2. **BUILD** - Code implementation
3. **VERIFY** - Build/test/lint
4. **HARDEN** - Type guards, error codes, logging
5. **POLISH** - Docs, scripts, devcontainer
6. **PACKAGE** - PR notes + changelog

```bash
# Start Phoenix Chain
POST /api/chains/phoenix/start
{
  "target": {
    "repository": "Pandora-Codex",
    "branch": "main"
  },
  "autoAdvance": true
}

# Check status
GET /api/chains/phoenix/{chainId}
```

### 2. Overseer Chain (Repo Rescue)
**7-step repository health restoration**

1. **AUDIT** - Analyze codebase
2. **REMOVE_DEAD_CODE** - Clean unused code
3. **REFACTOR** - Improve boundaries
4. **FIX_BUILDS** - Resolve build errors
5. **ADD_TESTS** - Add test coverage
6. **DOCUMENT** - Update documentation
7. **SHIP** - Prepare release

```bash
# Start Overseer Chain
POST /api/chains/overseer/start
{
  "target": {
    "repository": "Pandora-Codex",
    "branch": "main"
  },
  "autoFix": true,
  "dryRun": false
}
```

### 3. Arsenal Chain (Tooling Platform)
**7-step tool integration pipeline**

1. **DETECT** - Scan for tools
2. **INVENTORY** - Catalog capabilities
3. **WRAP** - Create safe wrappers
4. **EXPOSE_API** - Build REST endpoints
5. **BUILD_UI** - Create user interface
6. **ADD_LOGGING** - Implement logging
7. **ADD_COMPLIANCE** - Add safety gates

```bash
# Start Arsenal Chain
POST /api/chains/arsenal/start
{
  "target": {
    "toolsDirectory": "./tools",
    "platform": "all"
  },
  "enableSafetyChecks": true
}
```

## 🎯 TITAN Features

### TITAN 1: Make Pandora Codex Actually Work
- ✅ Fixed all TypeScript builds
- ✅ Proper monorepo structure with Turbo
- ✅ Workspace scripts (dev, build, lint, test, arsenal:status)
- ✅ Devcontainer with Node/Rust/Python + adb/fastboot

### TITAN 2: Control Room UI
Complete command center dashboard with:
- **Devices List** - USB/network device management
- **Mode Detection** - Normal/recovery/fastboot/download/DFU
- **Diagnostics Runner** - Execute diagnostic tests
- **Deployment Jobs** - Track imaging progress
- **Logs Viewer** - Real-time system logs
- **Report Export** - PDF/JSON repair reports
- **Empty/Error/Loading States** - Professional UX

Access at: `http://localhost:5173/control-room`

### TITAN 3: Diagnostics Engine
Pro-tier diagnostic system:
- **Safe Log Collection** - Non-destructive data gathering
- **Pattern Detection** - Thermal, storage, battery, crash loops
- **Repair Reports** - Severity-based recommendations
- **SQLite Storage** - Timestamped report history (pending)
- **REST API** - Diagnostic endpoints (pending)

API Endpoints:
```bash
POST /api/diagnostics/run
GET /api/diagnostics/reports/:id
GET /api/diagnostics/reports/device/:deviceId
```

### TITAN 4: BootForge Deployment Core (Pending)
Safe OS imaging subsystem:
- Image registry with checksum verification
- Target disk inventory
- Explicit confirmations for destructive actions
- Progress reporting with audit trail
- Mock mode for testing

### TITAN 5: Compliance & Guardrails (Pending)
Repository-wide safety system:
- Compliance module with boundary documentation
- CI checks to block disallowed keywords
- Policy documentation
- In-app compliance screen

## 📦 Packages

### @pandora-codex/shared-types
Common TypeScript types used across the monorepo:
- Device types
- Diagnostic types
- Deployment types
- Power Chains types
- TITAN feature types

```typescript
import { Device, DiagnosticFinding, PhoenixChain } from '@pandora-codex/shared-types';
```

### @pandora-codex/ui-kit
Shared React components:
- Button, Card, Badge
- LoadingSpinner
- EmptyState, ErrorState
- And more...

```typescript
import { Button, Card, LoadingSpinner } from '@pandora-codex/ui-kit';
```

### @pandora-codex/arsenal-scripts
Development utility scripts:
- Environment status checking
- Android tools verification
- Rust toolchain validation

## 🐳 Devcontainer

The repository includes a complete devcontainer configuration:

```json
{
  "name": "Pandora Codex Development",
  "features": {
    "node": "18",
    "rust": "latest",
    "python": "3.11"
  }
}
```

**Includes:**
- Node.js 18+ with pnpm
- Rust stable toolchain
- Python 3.11+
- adb/fastboot (where permitted)
- VS Code extensions for TypeScript, Rust, Python
- Automatic dependency installation on create

### Using Codespaces

1. Click **Code** → **Codespaces** → **Create codespace**
2. Wait for container to build (2-3 minutes)
3. Post-create script runs automatically
4. Start developing with `pnpm dev`

## 🔧 Scripts Reference

### Workspace Level
```bash
pnpm dev              # Start all services
pnpm build            # Build all packages with Turbo
pnpm lint             # Lint all packages
pnpm test             # Run all tests
pnpm type-check       # TypeScript type checking
pnpm clean            # Clean all build outputs
```

### Application Specific
```bash
pnpm web:dev          # Start web app (port 5173)
pnpm api:dev          # Start API server (port 3001)
pnpm bootforge:build  # Build Rust components
pnpm bootforge:test   # Test Rust components
pnpm phoenix:dev      # Run Phoenix Key tool
```

### Utilities
```bash
pnpm arsenal:status        # Check dev environment
pnpm check:android-tools   # Verify adb/fastboot
pnpm check:rust            # Verify Rust toolchain
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Test specific package
pnpm --filter @pandora-codex/shared-types test
pnpm --filter pandora-codex-web test

# Rust tests
cd crates/bootforge-usb && cargo test

# Python tests
cd apps/phoenix-key && pytest
```

## 📝 CI/CD

GitHub Actions workflow runs on push/PR:
1. Lint & type check all TypeScript
2. Build all packages with Turbo
3. Build Rust with Cargo
4. Run Python checks (flake8, pytest)
5. Validate scripts

## 🤝 Contributing

1. Create feature branch from `main`
2. Make focused changes
3. Ensure builds pass: `pnpm build`
4. Run linters: `pnpm lint`
5. Submit pull request

## 📊 Build Performance

With Turbo, the monorepo benefits from:
- **Caching** - Never rebuild the same code twice
- **Parallel Execution** - Build independent packages simultaneously
- **Remote Caching** - Share cache across team (optional)

Typical build times:
- Cold build: ~20s
- Cached build: ~2s
- Single package rebuild: ~1-3s

## 🔗 API Endpoints

### Devices
- `GET /api/devices/connected` - List connected devices
- `POST /api/devices/refresh` - Scan for devices

### Diagnostics
- `POST /api/diagnostics/run` - Run diagnostics
- `GET /api/diagnostics/status/:id` - Get run status

### Deployment
- `POST /api/deployment/start` - Start deployment
- `GET /api/deployment/status/:id` - Get deployment status
- `POST /api/deployment/cancel/:id` - Cancel deployment

### Power Chains
- `POST /api/chains/phoenix/start` - Start Phoenix Chain++
- `GET /api/chains/phoenix/:id` - Get Phoenix status
- `POST /api/chains/overseer/start` - Start Overseer Chain
- `GET /api/chains/overseer/:id` - Get Overseer status
- `POST /api/chains/arsenal/start` - Start Arsenal Chain
- `GET /api/chains/arsenal/:id` - Get Arsenal status
- `GET /api/chains/` - List all chains

## 📄 License

MIT License - See LICENSE file for details

---

**Built with**: TypeScript • React • Express • Rust • Python • Vite • Tailwind • Turbo • pnpm

**Status**: Active Development 🚧
