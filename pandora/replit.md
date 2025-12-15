# The Pandora Codex - Device Diagnostics & Repair Shop Management

## Overview
The Pandora Codex is a web-based device diagnostics and repair shop management application. It provides robust tools for analyzing Android (ADB) and iOS devices, offering real-time detection, battery diagnostics, device history tracking, and job/ticket management for repair workflows. The project delivers legitimate diagnostics and business workflow solutions with a clean architecture, consistent design, and production-ready code.

## User Preferences
- Fast, decisive implementation style
- Clean, organized codebase structure
- Production-ready code quality
- Focus on legitimate diagnostics and business workflow
- ZERO ILLUSIONS principle - real database-backed data only, no placeholders

## System Architecture

### Two-Service Architecture (Current)
1. **CRM API (Node.js/TypeScript)**: Business logic, PostgreSQL database, diagnostics, estimates (port 3000)
2. **Web Console (React/Vite)**: Technical UI with Core Velocity design system (port 5000)

### Frontend-Backend Communication
- Development: Vite proxy routes `/api/*` from port 5000 to CRM API on port 3000
- Production: Static frontend served alongside Node.js API server
- All API calls use relative URLs through `apiService.ts`

### Database Schema (PostgreSQL via Prisma)
- **Customer**: Name, email, phone, notes
- **Device**: Serial, model, platform (ios/android), status, customerId
- **Ticket**: Title, status, priority, deviceId, customerId
- **DiagnosticRun**: Type, status, startedAt, completedAt, ticketId
- **DiagnosticFinding**: Category, severity, title, description, runId
- **Part**: Name, SKU, cost, price, quantity
- **TicketPart**: Links parts to tickets with quantity
- **TicketLabor**: Labor entries with description and cost

### Core Velocity UI System
The UI is built with **Core Velocity**, a design system emphasizing motion, clarity, and authority:
- **Color System**: Velocity Blue, Deep Core Black, Hypergraphite, Signal Cyan, Pulse White, Neon Vector Lime
- **Component Library**: Buttons, Cards, Inputs, StatusChips, Terminal displays, VelocitySplash
- **Typography**: Inter, JetBrains Mono, Orbitron font families
- **Animations**: velocity-shimmer, velocity-pulse, cyan-scan, cyan-pulse, velocity-ring, glyph-float

## API Endpoints

### Dashboard
- `GET /api/dashboard/stats` - Live metrics (devices, diagnostics, completion rate, active jobs)

### Devices
- `GET /api/devices` - List all devices
- `GET /api/devices/poll` - Poll for device updates
- `POST /api/devices` - Register new device
- `GET /api/devices/:id` - Get device details
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Remove device

### Tickets
- `GET /api/tickets` - List all tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/:id` - Get ticket details
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Remove ticket

### Diagnostics
- `POST /api/diagnostics/run` - Run diagnostic on device
- `GET /api/diagnostics/:id` - Get diagnostic results
- `GET /api/diagnostics/device/:deviceId` - Get diagnostics for device

### Health Scores
- `GET /api/health/device/:deviceId` - Computed health score from latest diagnostics
- `GET /api/health/ticket/:ticketId` - Device health score via ticket

### DevMode
- `GET /api/devmode/profiles` - Brand-specific profiles (Samsung, Pixel, Motorola, etc.)
- `GET /api/devmode/modules` - Available modules (Dossier, Warhammer, Dark Lab, etc.)
- `POST /api/devmode/run` - Execute module on device
- `POST /api/devmode/adb` - Execute ADB command (real execution via android-tools)
- `GET /api/devmode/devices` - Scan for connected Android devices (ADB)
- `GET /api/devmode/devices/ios` - Scan for connected iOS devices (libimobiledevice)
- `GET /api/devmode/devices/all` - Scan all connected devices (Android + iOS)
- `POST /api/devmode/fastboot` - Execute Fastboot command
- `GET /api/devmode/fastboot/devices` - Scan for devices in fastboot mode
- `POST /api/devmode/debloat` - Remove bloatware packages from device

### AI Integration
- `POST /api/ai/analyze` - AI analysis of diagnostic findings
- `POST /api/ai/estimate` - Generate repair estimate from diagnostics

## Health Score Calculation
```
Weighted Formula:
  overall = (battery × 0.35) + (security × 0.30) + (performance × 0.20) + (sensors × 0.15)

Sub-scores (0-100):
  - battery: Direct map from capacity %
  - security: Verified boot + bootloader lock status
  - performance: I/O latency, thermals
  - sensors: Dead/suspect sensor count
```

## Project Structure
```
/
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/    # UI components (Dashboard, DevModePanel, etc.)
│   │   ├── services/      # API service, tether manager
│   │   ├── stores/        # Zustand state management
│   │   └── types/         # TypeScript interfaces
│   └── vite.config.ts     # Vite config with API proxy
├── crm-api/               # Node.js/TypeScript backend
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── services/      # Business logic (diagnostics, health, AI)
│   │   └── server.ts      # Express server entry
│   └── prisma/
│       ├── schema.prisma  # Database schema
│       └── seed.ts        # Seed data
├── bootforge/             # Rust USB imaging library (future)
└── attached_assets/       # Reference documents
```

## System Dependencies
- **android-tools**: ADB and Fastboot for Android device communication
- **libimobiledevice**: iOS device communication (ideviceinfo, idevice_id, idevicediagnostics)
- **jq**: JSON processing for shell scripts

## Deployment Configuration
- **Target**: Autoscale
- **Build**: `(cd frontend && npm install && npm run build) && (cd crm-api && npm install && npx prisma generate && npm run build)`
- **Run**: `(cd crm-api && node dist/server.js) & (cd frontend && npx serve dist -l 5000)`
- **Public Dir**: `frontend/dist`

## Recent Changes (Dec 2025)
- Migrated from Tauri desktop to web-only architecture
- Full database integration with PostgreSQL (no more mock data)
- Dashboard shows live metrics from database
- DevModePanel connected to real backend API
- Fixed deployment commands for autoscale
- CRM API binds to 0.0.0.0 for production

### Intake-to-Closure Workflow (Dec 5, 2025)
- **IntakeForm**: Multi-step wizard for customer + device + ticket creation
  - Step 1: Customer info (name, phone, email)
  - Step 2: Device info (platform, OEM, model, serial, IMEI)
  - Step 3: Issue description (common issues dropdown + custom)
  - Step 4: Confirmation and submission
- **TicketTimeline**: Visual progression view (intake → diagnosing → estimating → approved → repairing → done)
  - Status-aware action buttons
  - Diagnostic findings display
  - Estimate breakdown (parts + labor)
- **TicketList**: Real-time ticket overview with 5-second polling
  - Status filters (active/all/done)
  - Quick ticket selection for timeline view
- **Dashboard Integration**: Modal system for intake and ticket management

### libBootForge USB Detection (Dec 5, 2025)
- Real USB detection via `nusb` crate
- 30+ vendor support (Apple, Samsung, Google, Xiaomi, OnePlus, etc.)
- Device state machine: Attached → Identified → Probed → Ready
- Protocol detection: ADB, Fastboot, DFU, iOS Lockdown, MTP, PTP, Odin, EDL
- Real-time event streaming via DeviceWatcher
- Bridge API for WebSocket/HTTP transport

### Thermal Monitoring Module (Dec 5, 2025)
- ThermalMonitor with configurable thresholds
- ThermalState classification: Normal, Warm, Hot, Critical, Shutdown
- Safe-for-imaging detection
- Android thermal output parsing
- Temperature trend analysis

### Storage Health Module (Dec 5, 2025)
- SMART data parsing and analysis
- HealthStatus: Excellent, Good, Fair, Degraded, Critical, Failed
- Critical SMART attribute detection
- StorageHealthReport with recommendations
- Estimated remaining life calculation

## ZERO ILLUSIONS Principle
This application follows a strict "no placeholders" policy:
- All diagnostic data comes from real ADB/iOS commands or database records
- All device detection uses real USB scanning via android-tools and libimobiledevice
- All API endpoints execute real operations (no simulation mode)
- All estimates are generated from actual diagnostic findings in the database
- All tickets, customers, and devices are stored in PostgreSQL

## Next Steps
- Dark Lab performance testing integration
- BootForge drive imaging tools (libbootforge Rust integration)
- Admin dashboard for parts inventory
- Customer portal for ticket status
