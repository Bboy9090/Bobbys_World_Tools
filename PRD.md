# Planning Guide

Bobby's World - A professional repair utility dashboard (3uTools / SamFW style) featuring device diagnostics, flash monitoring, evidence reporting, and community repair guides. Redesigned from enterprise interface to streamlined workshop toolkit with compact header, device sidebar, horizontal tabs, and collapsible console.

**Experience Qualities**: 
1. **Efficient** - Compact, utility-focused interface with minimal chrome and maximum workspace
2. **Professional** - Clean tool aesthetic with proper visual hierarchy, like field equipment
3. **Technical** - Workshop-grade infrastructure that technicians trust for real work

**Complexity Level**: Complex Application (advanced functionality with multiple views)
This is a comprehensive repair utility dashboard with real-time device monitoring, batch diagnostics, flash operations, evidence management, plugin ecosystem, and community resources - all organized in a professional utility interface with streamlined sidebar + tabs layout.

## Essential Features

### Dashboard Layout (Utility-Style Interface)
- **Functionality**: Professional dashboard with compact header (48px with wrench icon, title, backend status badge), left sidebar (device list with real-time status icons), horizontal tab navigation (Diagnostics | Reports | Tests | Plugins | Community | Settings), main content area with section headers, and bottom collapsible console panel
- **Purpose**: Provide efficient access to all tools with proper visual hierarchy like 3uTools/SamFW - everything visible at a glance with no wasted space
- **Trigger**: App loads into dashboard layout with device sidebar showing real devices from backend API (connected/weak/confirmed/likely/unconfirmed) or empty state if none detected
- **Progression**: App opens → Dashboard loads → Sidebar queries real device API → Backend status badge shows "API Connected" or "Offline Mode" → User clicks tab → Content switches instantly → Console panel shows activity
- **Success criteria**: Device sidebar updates with real device data only (no ghost values), tab switching instant, console panel expandable/collapsible, no nested navigation, all tools 1-2 clicks away, backend connection status always visible

### Diagnostics Tab (Real Backend Integration)
- **Functionality**: Five sub-sections: Device Diagnostics (ADB/Fastboot/USB detection via real API), Batch Diagnostics (multi-device runs), Flash Monitoring (Pandora Codex integration with real-time WebSocket benchmarking), Multi-Brand Flash (iOS DFU, Odin, EDL, Fastboot, MTK), Authorization Triggers (comprehensive guide to 36+ device authorization triggers) - all connected to backend Express server
- **Purpose**: Centralize all device testing, flashing operations, and authorization triggers with real backend API connectivity - no mock data
- **Trigger**: User clicks Diagnostics tab → Frontend queries `/api/flash/devices` → Real device scan via ADB/Fastboot
- **Progression**: Click tab → Backend API scans devices → Real device list populates → User selects flash operation → POST to `/api/flash/start` → WebSocket streams progress → Operation completes → History stored
- **Success criteria**: Backend server running on port 3001, real device detection working, WebSocket progress streaming functional, flash history persisted, all operations use backend API endpoints (no mock responses), authorization triggers guide fully comprehensive with 36+ triggers documented

### Reports Tab (Evidence & Backups)
- **Functionality**: Four sub-sections: Evidence Bundles (signed reports with chain-of-custody), Backups (snapshot retention with auto-cleanup), Evidence Dashboard (authority signing, correlation tracking), Repair Library (teardown guides, tutorials)
- **Purpose**: Consolidate all reporting, evidence management, and repair documentation - simpler naming, clearer purpose
- **Trigger**: User clicks Reports tab
- **Progression**: Click tab → Sub-tabs show → User views/creates evidence bundles → Automatic snapshots visible → Authority dashboard accessible → Repair guides browsable
- **Success criteria**: Evidence bundles exportable, snapshots auto-created during operations, retention policies enforced, signing/verification working, repair guides organized by device type

### Tests Tab (Test Suite & Performance)
- **Functionality**: Three sub-sections: Test Suite (automated security scans, quality checks, compatibility validation), Performance (CPU/memory/execution benchmarking), Plugin Map (dependency graph, conflict detection)
- **Purpose**: Group all testing and validation tools together - security, performance, and plugin health
- **Trigger**: User clicks Tests tab
- **Progression**: Click tab → Sub-tabs visible → User runs automated tests → Results show pass/fail badges → Performance metrics display → Dependency conflicts highlighted
- **Success criteria**: Automated test pipeline runs correctly, security scans complete, performance benchmarks accurate, dependency graph visualizes conflicts

### Plugins Tab (Marketplace & Management)
- **Functionality**: Three sub-sections: Marketplace (browse, search, filter by certification/risk), Installed (manage enabled plugins), Submit Plugin (community contribution portal)
- **Purpose**: Centralize plugin discovery, installation, and submission with certification badges
- **Trigger**: User clicks Plugins tab
- **Progression**: Click tab → Marketplace loads → User browses/searches → Views plugin details → Sees automated test results → Installs plugin → Manages in Installed tab
- **Success criteria**: Plugin marketplace searchable/filterable, installation works, certification badges visible, installed plugins manageable, submission form validates

### Community Tab
- **Functionality**: Three sub-sections: Forums (advocacy, repair network), My Workspace (personal notes, repair history), Bobby's Vault (educational resources)
- **Purpose**: Group all community engagement and educational content together
- **Trigger**: User clicks Community tab
- **Progression**: Click tab → Sub-tabs show → User accesses forums → Manages workspace → Explores vault
- **Success criteria**: All community resources accessible, workspace data persists, forum discussions organized by topic

### Settings Tab
- **Functionality**: Four sub-sections: Preferences (audio notifications, workshop atmosphere), Device Modes (BootForge support matrix), Legal Notice (authorized repair compliance), About (mission, right-to-repair advocacy)
- **Purpose**: Consolidate configuration, device specs, legal info, and about into one location
- **Trigger**: User clicks Settings tab
- **Progression**: Click tab → Sub-tabs visible → User adjusts preferences → Views device mode specifications → Reads legal compliance → Views about info
- **Success criteria**: Settings persist via useKV, audio preferences work, device mode matrix displays correctly, legal disclaimers present

### Authorization Triggers System (Comprehensive Device Prompts)
- **Functionality**: Comprehensive system with 27+ device authorization triggers mapped to real backend endpoints - categorized into Trust & Security (USB debugging, trust computer, file transfer), Flash Operations (flash firmware with typed CONFIRM, bootloader unlock with typed UNLOCK, factory reset with typed RESET, reboot modes), Diagnostics (run diagnostics, collect logs, benchmarks), Evidence & Reports (export bundles, sign evidence, create snapshots), Policy & Compliance (destructive action confirmations with typed YES, RBAC gates, audit consent), Hotplug Events (USB attach authorization, driver prompts), and Plugin Actions (install/update/uninstall) - all with full audit logging producing structured JSON entries
- **Purpose**: Provide complete interactive trigger system where every user prompt is backed by a real backend API endpoint with audit trail - enables explicit user confirmation before any sensitive operation with truth-first design (no ghost values, no simulated responses)
- **Trigger**: User initiates sensitive operation (flash, unlock, reset, trust device) → System opens AuthorizationTriggerModal → User sees device ID, modal text, risk level badge → For destructive actions, user must type confirmation text exactly → On confirm, frontend executes trigger via backend API → Audit log entry created → Success/error toast shown
- **Progression**: Operation initiated → Modal opens with trigger details → User reviews device ID, risk level, modal text → If destructive, types confirmation (CONFIRM/UNLOCK/RESET/YES) → Clicks Confirm → Backend API executes real command → Audit log written to /api/audit/log → Modal closes → Success/error feedback shown → Operation result visible in UI
- **Success criteria**: All 27 triggers documented in TRIGGER_CATALOG_API.md, each trigger has real backend endpoint (no mocks), AuthorizationTriggerModal component validates typed confirmations, risk level badges visible (Low=green/Medium=amber/High=orange/Destructive=red), audit logging working for every trigger execution with structured JSON (action/triggerId/deviceId/userResponse/timestamp/metadata), TriggerCatalog component displays all triggers with search/filter by category, ComprehensiveAuthorizationTriggersGuide shows implementation details, useAuthorizationTrigger hook manages modal state, empty states shown if no devices (no ghost values), typed confirmation required for destructive actions, backend returns only real probe results

## Edge Case Handling

- **No Devices Connected**: Sidebar shows "No devices connected" with dimmed icon, main panels still accessible but show empty states
- **Backend API Unavailable**: Automatic demo mode with persistent banner, all fake data clearly labeled as "[DEMO]"
- **Device Sidebar Collapsed**: Toggle button collapses sidebar to icon-only view, more screen space for content
- **Logs Panel Collapsed**: Console minimized by default, click to expand for detailed activity
- **Tab Switching**: Instant tab changes, no loading states, content preserved when switching back
- **Legal Disclaimer Not Accepted**: Block access to advanced diagnostic tools until disclaimer acknowledged
- **Browser Storage Full**: Gracefully handle useKV storage limits, prompt user to export/clear old data
- **Unsupported Device Detected**: Show "Unknown Device" in sidebar with generic diagnostic options, never auto-promote to "Connected"
- **Mobile Browser Access**: Responsive layout with bottom nav instead of sidebar, collapsible sections
- **WebSocket Disconnection**: Auto-reconnect for live monitoring, show connection status in logs
- **Plugin Installation Failure**: Clear error messages with troubleshooting steps, rollback support
- **Tool Not Installed (ADB/Fastboot/etc.)**: Show clear "Tool not available" error state, provide installation guidance
- **Empty Evidence Bundles**: Show "No evidence bundles created yet" instead of fake data
- **No Test Results**: Show "No test results yet - run tests to see results" not hardcoded PASS/FAIL
- **Registry Sync Failed**: Display "Unable to connect to plugin registry" error with retry action
- **No Flash History**: Show "No flash operations performed yet" not simulated history entries

## Design Direction

**Professional Utility Dashboard** - This interface channels 3uTools and SamFW style: clean, compact, efficient, technical. No unnecessary decoration - just proper visual hierarchy and intuitive grouping. Compact header (48px) with wrench icon, title, backend status, and version. Device sidebar on left with real-time status icons showing only actual detected devices (no ghost values). Horizontal tab navigation with duotone icons and active state highlighting. Bottom collapsible console panel for activity monitoring.

The UI captures repair utility professionalism: field-tested equipment aesthetic, technical credibility, workshop-grade infrastructure. Cyan accents for active states and primary actions. Amber highlights for warnings. Dark background reduces eye strain during long repair sessions. Status indicators use color + icon for quick scanning. Compact spacing maximizes workspace while maintaining clarity.

This is operator-grade tooling with proper information architecture - everything visible at a glance, no wasted vertical space, 1-2 clicks to any feature. Tab sub-navigation uses compact horizontal pills instead of full-width grids. Section headers include icon badges for visual identity. All data shown is truth-first: no simulated values, no placeholder content.

## Color Selection

**Utility Dashboard Aesthetic** - Professional repair tool interface with technical credibility.

The colorway evokes field-tested equipment: dark backgrounds for reduced eye strain, cyan accents for clarity, amber warnings for attention. Clean, functional, efficient.

- **Background**: `#0A0A0A` - Deep black, reduces eye strain
- **Card/Panel**: `#121212` - Elevated surfaces
- **Border**: `#1F2632` - Subtle divisions
- **Primary Color**: `#1ECAD3` - Cyan accent for active states, buttons, selected tabs
- **Accent**: `#CFA24D` - Amber for warnings, highlights
- **Rust Red** (destructive): `#8B2E2E` - Error states, dangerous actions
- **Success**: `#2ECC71` - Successful operations, connected devices
- **Muted**: `#8C8C8C` - Secondary text, inactive states
- **Foreground**: `#EDEDED` - Primary text, high contrast
- **Foreground/Background Pairings**: 
  - Background (#0A0A0A): Chalk white (#EDEDED) - Ratio 18.2:1 ✓
  - Primary Cyan (#1ECAD3): Dark text (#0A0A0A) - Ratio 10.8:1 ✓
  - Accent Amber (#CFA24D): Dark text (#0A0A0A) - Ratio 7.2:1 ✓
  - Rust Red (#8B2E2E): Chalk white (#EDEDED) - Ratio 6.1:1 ✓
  - Card Surface (#121212): Chalk white (#EDEDED) - Ratio 16.5:1 ✓

## Font Selection

Clean, technical typography for professional repair utility interface.

- **Primary**: Outfit (geometric sans) for headers and UI text - technical yet approachable
- **Secondary**: Space Mono for device IDs, serials, technical data, logs
- **Accent**: Bebas Neue for large headers and branding
- **Typographic Hierarchy**: 
  - Logo/Branding: Bebas Neue Bold/24px/tight spacing
  - Section Headers: Outfit Bold/24px/tight tracking
  - Tab Labels: Outfit Medium/14px/normal spacing  
  - Body Text: Outfit Regular/14px/relaxed spacing (1.5)
  - Technical Data: Space Mono Regular/12px/normal spacing
  - Labels: Outfit Medium/11px/wide spacing/uppercase

## Animations

Minimal, purposeful animations for utility interface - instant feedback without distraction. Tab switching should be instant. Device sidebar status icons pulse subtly on state change. Logs panel expands/collapses with smooth 200ms transition. Active tab highlights with quick 150ms underline animation. Status badges fade in on device detection. Success states show brief checkmark animation. Keep everything snappy and professional - this is a working tool, not a showcase.

## Component Selection

- **Components**: 
  - Tabs for main navigation (Diagnostics, Reports, Tests, Plugins, Community, Settings)
  - Sidebar with collapsible device list
  - Card components for content sections
  - Badge for status indicators (connected, weak, confirmed, etc.)
  - Button for actions (primary cyan, ghost for secondary)
  - ScrollArea for device list, logs panel, content areas
  - Tooltip for additional info without cluttering UI
  
- **Customizations**: 
  - Custom device sidebar with collapsible state
  - Logs panel with expand/collapse animation
  - Status icons with color coding (green=connected, amber=weak, cyan=confirmed)
  - Tab indicators with active state highlighting
  
- **States**: 
  - Buttons: Rest (default), Hover (slight brightness), Active (pressed), Disabled (faded)
  - Tabs: Inactive (muted), Active (primary background), Hover (subtle highlight)
  - Devices: Connected (green), Weak (amber), Confirmed (cyan), Unconfirmed (gray)
  - Logs: Info (cyan), Success (green), Warning (amber), Error (red)
  
- **Icon Selection**: 
  - Cpu, Scan for diagnostics
  - FileText, Archive for reports/evidence
  - Flask, TestTube for testing
  - Plug, Package for plugins
  - Users, ChatsCircle for community
  - Gear, SlidersHorizontal for settings
  - DeviceMobile for devices
  - Lightning, Gauge for performance
  
- **Spacing**: Tight spacing in sidebar (gap-1), standard in tabs (gap-4), generous in content (gap-6)
- **Mobile**: Sidebar becomes bottom sheet, tabs become horizontal scroll, logs panel always collapsed by default
