# Planning Guide

A simplified, tool-style device management and performance monitoring system inspired by 3uTools and SamFW Tool, providing clear labels, simple icons, and one-click actions for Android/iOS device operations.

**Experience Qualities**: 
1. **Simple** - Clear, intuitive interface with straightforward labels and minimal jargon, modeled after popular device management utilities
2. **Efficient** - One-click actions with instant feedback, streamlined workflows that minimize complexity
3. **Transparent** - Honest device correlation status with clear policy gates showing exactly what's allowed and blocked

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a comprehensive device management system with simplified presentation - real-time monitoring, correlation tracking, performance benchmarking, automated testing, and live hotplug detection, all presented through an accessible tool-style interface.

## Essential Features

### Pandora Codex Control Room (3uTools-Style Interface)
- **Functionality**: Simplified dashboard with five clear tabs (Flash, Monitor, Tests, Standards, Hotplug) providing straightforward device management without enterprise jargon
- **Purpose**: Make powerful device operations accessible through a familiar repair-tool aesthetic with clear buttons and simple status labels
- **Trigger**: Default landing page, accessed immediately on app load
- **Progression**: App opens → Pandora Codex tab active → User selects function tab → Sees clear actions and metrics → One-click operations → Instant feedback
- **Success criteria**: All operations accessible within 2 clicks, zero technical jargon in primary UI, clear status indicators (Connected/Weak/System Confirmed/Likely/Unconfirmed), instant visual feedback on actions

### Flash Operations Panel
- **Functionality**: Start demo flash operations, view active operations queue with progress bars and transfer speeds, access operation history
- **Purpose**: Provide simple flash management without complexity of batch configurations
- **Trigger**: User navigates to Flash tab, clicks "Start Demo Flash"
- **Progression**: Click Start → Operation queued → Progress bar updates → Speed displayed → Completion notification → Added to history
- **Success criteria**: Operation starts within 500ms, progress updates every second, completion detected accurately, history persists

### Performance Monitor Panel
- **Functionality**: Real-time metrics display (Transfer Speed, CPU Usage, Memory Usage, USB Utilization, Disk I/O) with start/stop controls and export capability
- **Purpose**: Enable quick performance checks during operations without complex analysis
- **Trigger**: User navigates to Monitor tab, clicks "Start Monitoring"
- **Progression**: Click Start → Metrics stream in → Color-coded status (Good/Warning/Critical) → Visual updates → Export data if needed
- **Success criteria**: Metrics update every second, status thresholds accurate, export generates valid JSON

### Automated Tests Panel
- **Functionality**: Run comprehensive test suite with clear pass/fail results, duration tracking, and test history
- **Purpose**: Validate system health with one-click testing
- **Trigger**: User navigates to Tests tab, clicks "Run All Tests"
- **Progression**: Click Run → Tests execute sequentially → Progress shown → Results displayed → Pass/fail status clear
- **Success criteria**: All tests complete in <30 seconds, clear error messages, pass rate >85% on healthy systems

### Benchmark Standards Panel
- **Functionality**: Display industry-standard performance criteria across categories (Flash Speed, USB Bandwidth, CPU Efficiency, Memory Usage, Latency) with Optimal/Good/Acceptable/Poor ratings
- **Purpose**: Provide reference benchmarks for evaluating device performance
- **Trigger**: User navigates to Standards tab
- **Progression**: Tab opens → Standards displayed → Clear rating levels → Reference sources shown
- **Success criteria**: All standards accurately reflect USB-IF/JEDEC/Android specifications, ratings clearly explained

### Live Hotplug Monitor Panel
- **Functionality**: WebSocket-based real-time device connection/disconnection notifications with event stream, statistics counters, and audio alerts
- **Purpose**: Instant awareness of device state changes
- **Trigger**: User navigates to Hotplug tab, clicks "Connect to WebSocket"
- **Progression**: Click Connect → WebSocket establishes → Events stream in → Audio notifications play → Statistics update → Event history shown
- **Success criteria**: Connection within 1 second, events <200ms latency, auto-reconnect on disconnect, event history to 100 items

### BootForge USB Scanner Panel (Real Device Detection)
- **Functionality**: Scan real USB devices connected to the system using BootForgeUSB CLI, detect Android/iOS platforms, correlate with system tools (ADB/Fastboot/idevice_id), display device evidence and confidence scores
- **Purpose**: Enable real-time USB device detection and classification with automatic fallback to demo data when CLI not installed
- **Trigger**: User navigates to BootForge USB tab, system auto-checks CLI status on mount, user clicks "Scan Real Devices" or "View Demo Data"
- **Progression**: Page loads → Status check → CLI availability shown → User clicks scan → USB devices enumerated → Platform classification → Tool correlation → Results displayed with badges → User expands device for detailed evidence
- **Success criteria**: Status check within 500ms, scan completes within 10 seconds, all connected USB devices detected, platform classification >85% confidence for known devices, correlation badges accurate, demo mode clearly indicated, installation guide accessible

### BootForgeUSB Installation Guide
- **Functionality**: Step-by-step dialog with copy-paste commands for installing Rust, building CLI, installing optional tools (ADB, Fastboot, libimobiledevice), troubleshooting tips
- **Purpose**: Remove friction from CLI installation with clear instructions and clipboard integration
- **Trigger**: User clicks "Installation Guide" button when CLI not installed
- **Progression**: Click Guide → Dialog opens → Steps displayed → User copies commands → Executes in terminal → Refreshes status → CLI detected → Real scanning enabled
- **Success criteria**: All commands copy successfully, instructions accurate for Linux/macOS, troubleshooting covers common issues, guide accessible without CLI installed

## Edge Case Handling

- **BootForgeUSB CLI Not Installed**: Show installation guide button, display demo data with clear "DEMO MODE" badge, provide step-by-step setup instructions
- **CLI Installed But No Devices**: Show helpful connection instructions for Android (USB debugging) and iOS (trust computer), display empty state with clear guidance
- **Real Scan vs Demo Mode**: Use distinct badges and colors (emerald for "LIVE USB SCAN", amber for "DEMO MODE"), clear messaging about data source
- **USB Permission Denied**: Show Linux-specific udev rules setup in installation guide, link to troubleshooting documentation
- **Scan Timeout**: Display timeout error with retry button, suggest disconnecting unnecessary USB devices
- **WebSocket Connection Failed**: Show clear error with reconnect button, degrade to manual refresh, display connection status
- **WebSocket Disconnected Mid-Stream**: Auto-reconnect with exponential backoff, preserve event history, show status indicator
- **No Test Data Available**: Display empty state with clear call-to-action to run tests
- **Monitoring Not Started**: Show placeholder metrics encouraging user to start monitoring
- **Flash Operation Fails**: Clear error message, preserve partial history, allow retry
- **Export With No Data**: Prevent export action, show toast explaining no data available
- **Rapid Sequential Operations**: Queue operations properly, maintain separate progress tracking
- **Browser Tab Backgrounded**: Continue operations but warn about potential timer throttling
- **Multiple Matched IDs**: Display all IDs clearly in correlation view
- **Audio Unavailable**: Gracefully degrade to visual-only notifications
- **Standards Data Loading**: Show skeleton loaders during initial data fetch
- **Event Stream Overflow**: Maintain only last 100 events, auto-prune oldest entries

## Design Direction

The interface should feel like a professional device management tool (3uTools, SamFW Tool) - technical yet approachable, with clear labels and simple actions. No enterprise jargon, just straightforward buttons and status indicators. The "repair utility" aesthetic prioritizes immediate clarity over sophistication, with one-click operations and instant visual feedback. Color-coded status badges (green for connected, yellow for weak, red for unconfirmed) provide at-a-glance understanding. The overall feel should be efficient and trustworthy, like a well-designed system utility.

## Color Selection

A clean tool-style theme with high contrast and clear status indicators.

- **Primary Color**: `oklch(0.65 0.25 250)` - Electric blue for primary actions and healthy states, conveying reliability
- **Secondary Colors**: `oklch(0.30 0.08 250)` - Deep navy for card backgrounds, `oklch(0.25 0.04 250)` - Muted backgrounds for secondary areas
- **Accent Color**: `oklch(0.75 0.20 150)` - Vibrant cyan for connected status and positive indicators
- **Foreground/Background Pairings**: 
  - Background (Deep Navy #252847): White text (#FFFFFF) - Ratio 13.2:1 ✓
  - Primary (Electric Blue #4A9EFF): White text (#FFFFFF) - Ratio 5.2:1 ✓
  - Accent (Cyan #3DD68C): Dark text (#0F1117) - Ratio 9.8:1 ✓
  - Warning (Yellow #FFA940): Dark text (#0F1117) - Ratio 8.7:1 ✓
  - Destructive (Red #FF5C5C): White text (#FFFFFF) - Ratio 4.9:1 ✓

## Font Selection

Clear, readable typefaces for technical information and metrics.

- **Primary**: Source Code Pro for metrics, device IDs, and technical data
- **Secondary**: Montserrat for labels, buttons, and body text
- **Typographic Hierarchy**: 
  - Panel Titles: Montserrat Bold/20px/normal spacing
  - Metric Values: Source Code Pro Bold/24px/tight spacing
  - Button Labels: Montserrat Medium/14px/normal spacing
  - Status Labels: Montserrat Medium/11px/wide spacing/uppercase
  - Device IDs: Source Code Pro Regular/12px/normal spacing
  - Body Text: Montserrat Regular/14px/normal spacing

## Animations

Purposeful, utility-style animations focused on feedback. Button clicks should feel immediate. Progress bars should update smoothly. Status indicators should pulse when active. Metric values should update with subtle transitions (not counting animations). Connection status changes should be instant. The overall feel should be responsive and snappy, like a native desktop utility.

## Component Selection

- **Components**: 
  - Card for all main panels with clear borders
  - Button for all actions (Start, Stop, Connect, Export, etc.)
  - Badge for status indicators (Pass/Fail, Connected/Disconnected, rating levels)
  - Tabs for top-level navigation between function areas
  - Progress for operation status tracking
  - ScrollArea for event logs and history
  - Separator for visual grouping within panels
  
- **Customizations**: 
  - Larger, more prominent action buttons
  - Color-coded status badges matching semantic meaning
  - Grid layouts for metric cards with clear borders
  - Simple progress bars without complexity
  
- **States**: 
  - Buttons: Enabled (blue), Disabled (gray), Active (darker blue), Hover (lighter blue)
  - Status: Good (green border/bg), Warning (yellow), Critical (red), Neutral (gray)
  - Connection: Connected (green pulse), Disconnected (gray), Connecting (blue pulse)
  
- **Icon Selection**: 
  - Lightning for Flash operations
  - Gauge for Performance monitoring  
  - Flask for Tests
  - Book for Standards reference
  - Broadcast for Hotplug monitoring
  - Play/Stop for start/stop actions
  - PlugsConnected/Plug for device events
  - CheckCircle/XCircle for pass/fail
  - FileArrowDown for export
  - Wrench for tools/settings
  - ClockCounterClockwise for history
  
- **Spacing**: Standard spacing (gap-4) between elements, generous padding (p-4) on cards, tight spacing (gap-2) within button groups
- **Mobile**: Single column layout, full-width cards, larger touch targets, collapsible sections for space efficiency
