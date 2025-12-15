# The Pandora Codex

> Ancient Secrets. Modern Power. One Grimoire.

A comprehensive device management and diagnostics platform with monorepo architecture supporting TypeScript, Rust, and Python components.

## 🏗️ Repository Structure

This is a **monorepo** containing multiple packages and services:

```
The-Pandora-Codex-/
├── frontend/              # React + Vite + TypeScript frontend
├── backend/               # Express TypeScript API server
├── packages/
│   └── shared/           # Shared TypeScript types and utilities
├── tools/
│   └── bootforge/        # Rust driver layer (Cargo workspace)
├── phoenix-key/          # Python device recovery tool
├── .devcontainer/        # VS Code devcontainer configuration
├── .vscode/              # VS Code workspace settings
├── .github/workflows/    # CI/CD workflows
└── scripts/              # Development utility scripts
```

### 📦 Packages

- **Frontend** (`frontend/`) - React application with Bobby Dev Arsenal Dashboard
  - Built with Vite, TypeScript, and Tailwind CSS
  - Device management UI with real-time updates
  - Diagnostics and deployment interfaces

- **Backend** (`backend/`) - Express TypeScript API
  - RESTful API for device operations
  - Secure routes with input validation
  - Placeholder implementations for safety

- **Shared** (`packages/shared/`) - Common types and utilities
  - TypeScript definitions for devices, diagnostics, deployments
  - Shared utility functions
  - Used by both frontend and backend

- **BootForge** (`tools/bootforge/`) - Rust driver layer
  - USB device communication
  - Low-level device operations
  - Cargo workspace with multiple crates

- **Phoenix Key** (`phoenix-key/`) - Python recovery tool
  - Device diagnostic utilities
  - Command-line interface
  - Structured with pyproject.toml

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm** 8+
- **Rust** (stable toolchain)
- **Python** 3.8+
- **Android Platform Tools** (adb, fastboot)

### Installation

```bash
# Clone the repository
git clone https://github.com/Bboy9090/The-Pandora-Codex-.git
cd The-Pandora-Codex-

# Install all workspace dependencies
pnpm install

# Build shared packages
pnpm --filter "@pandora-codex/shared" build

# Install Python dependencies
cd phoenix-key && pip install -r requirements.txt && cd ..
```

### Development

```bash
# Start both frontend and backend
pnpm dev

# Or start individually:
pnpm frontend:start    # Starts Vite dev server on :5173
pnpm backend:start     # Starts Express API on :3001

# Build Rust components
pnpm bootforge:build

# Run Python tool
pnpm phoenix:dev
```

### Verification

```bash
# Check development environment status
pnpm arsenal:status

# Verify Android tools
pnpm check:android-tools

# Verify Rust toolchain
pnpm check:rust
```

## 🔧 Available Scripts

### Workspace-Level Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start frontend and backend concurrently |
| `pnpm frontend:start` | Start frontend dev server |
| `pnpm backend:start` | Start backend API server |
| `pnpm build:all` | Build all TypeScript packages |
| `pnpm arsenal:status` | Check development environment status |
| `pnpm check:android-tools` | Verify ADB/Fastboot installation |
| `pnpm check:rust` | Verify Rust toolchain |
| `pnpm bootforge:build` | Build Rust components |
| `pnpm bootforge:test` | Test Rust components |
| `pnpm phoenix:dev` | Run Phoenix Key tool |

### Package-Specific Commands

```bash
# Frontend
cd frontend
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # Lint code

# Backend
cd backend
pnpm dev          # Start with hot reload
pnpm build        # Compile TypeScript
pnpm start        # Run compiled server

# Shared
cd packages/shared
pnpm build        # Build types
pnpm dev          # Watch mode

# BootForge
cd tools/bootforge
cargo build       # Build all crates
cargo test        # Run tests
cargo run --bin bootforge-cli  # Run CLI
```

## 🐳 GitHub Codespaces / Devcontainer

This repository is configured for GitHub Codespaces and VS Code devcontainers.

### Using Codespaces

1. Click **Code** → **Codespaces** → **Create codespace on [branch]**
2. Wait for container to build (installs Node, Rust, Python, adb/fastboot)
3. Post-create script automatically:
   - Installs pnpm dependencies
   - Builds shared packages
   - Installs Python dependencies
   - Runs status check

### Manual Setup in Codespace

```bash
# If post-create didn't run
bash .devcontainer/post-create.sh

# Verify setup
pnpm arsenal:status

# Start development
pnpm dev
```

### Ports

The devcontainer forwards these ports:
- **3001** - Backend API
- **5173** - Frontend dev server

## 🏛️ Architecture

### Frontend → Backend Communication

```
Frontend (React)
    ↓ (fetch/axios)
arsenalApi.ts (API Client)
    ↓ (HTTP/JSON)
Backend (Express)
    ↓
Routes: /api/devices, /api/diagnostics, /api/deployment
    ↓
Services (placeholder implementations)
```

### Bobby Dev Arsenal Dashboard

The main dashboard component (`BobbyDevArsenalDashboard.tsx`) provides:
- Real-time device status
- Diagnostic test execution
- Deployment management (with safety confirmations)
- System health monitoring

Access via: Frontend → `http://localhost:5173` → Bobby Dev tab

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/devices/connected` | List connected devices |
| POST | `/api/devices/refresh` | Scan for new devices |
| POST | `/api/diagnostics/run` | Start diagnostic run |
| GET | `/api/diagnostics/status/:id` | Get diagnostic status |
| POST | `/api/deployment/start` | Start deployment (requires confirmation) |
| GET | `/api/deployment/status/:id` | Get deployment status |
| POST | `/api/deployment/cancel/:id` | Cancel deployment |

## 🔒 Security & Safety

### Safety Features

1. **Deployment Confirmations**: All destructive operations require explicit confirmation
2. **Input Validation**: Backend routes validate all inputs with express-validator
3. **Placeholder Implementations**: Actual device operations are stubbed for safety
4. **Audit Logging**: All deployment requests are logged

### Environment Variables

Backend configuration (`.env`):
```env
PORT=3001
REQUIRE_DEPLOYMENT_CONFIRMATION=true
MAX_CONCURRENT_DEPLOYMENTS=3
```

## 🧪 Testing

### TypeScript Projects

```bash
# Frontend tests
pnpm --filter frontend test

# Backend type checking
pnpm --filter backend run type-check
```

### Rust

```bash
cd tools/bootforge
cargo test
```

### Python

```bash
cd phoenix-key
pytest
flake8 .
```

## 📝 CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs:

1. **Lint & Type Check** - ESLint and TypeScript checks
2. **Build TypeScript** - Compile all TS packages
3. **Build Rust** - Cargo build and test
4. **Python Checks** - flake8 and pytest
5. **Script Validation** - Test utility scripts

Runs on: Push to main/develop, Pull requests

## 🛠️ Development Workflow

1. **Make changes** in respective package directories
2. **Test locally**:
   ```bash
   pnpm dev          # Run services
   pnpm arsenal:status  # Verify environment
   ```
3. **Build before committing**:
   ```bash
   pnpm build:all
   pnpm bootforge:build
   ```
4. **Commit and push** - CI will run automatically

## 📚 Documentation

- [Bobby Dev Setup](./BOBBY_DEV_SETUP.md) - Detailed setup guide
- [Build Instructions](./BUILD_INSTRUCTIONS.md) - Build and release instructions
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Technical details
- [Frontend README](./frontend/README.md) - Frontend-specific docs
- [BootForge README](./tools/bootforge/README.md) - Rust components docs

## 🤝 Contributing

1. Create a feature branch
2. Make minimal, focused changes
3. Ensure all tests pass: `pnpm build:all && pnpm bootforge:test`
4. Run linters: `pnpm --filter frontend lint`
5. Submit pull request

## 📄 License

MIT License - See LICENSE file for details

## 🔗 Links

- [GitHub Repository](https://github.com/Bboy9090/The-Pandora-Codex-)
- [Issues](https://github.com/Bboy9090/The-Pandora-Codex-/issues)

---

**Built with**: TypeScript • React • Express • Rust • Python • Vite • Tailwind CSS • Cargo • pnpm

**Status**: Active Development 🚧
