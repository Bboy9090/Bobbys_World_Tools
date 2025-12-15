# Pandora Codex Frontend

Modern React + TypeScript + Tauri desktop application for The Pandora Codex toolkit.

## Features

- **Multi-Tab Interface**: Devices, Plugins, Logs, and Settings tabs
- **Device Management**: View and manage connected devices
- **Plugin Integration**: Execute plugins directly from the UI
- **System Logs**: Real-time log viewing and monitoring
- **Dark Theme**: Beautiful dark mode interface with Tailwind CSS
- **Cross-platform**: Windows, macOS, and Linux support via Tauri

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tauri** - Desktop application framework
- **Tailwind CSS** - Utility-first CSS framework

## Development

### Prerequisites

- Node.js 18+
- Rust 1.70+ (for Tauri)

### Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run Tauri in development
npm run tauri:dev

# Build Tauri app
npm run tauri:build
```

### Project Structure

```
frontend/
├── src/
│   ├── App.tsx              # Main application component with tabs
│   ├── main.tsx             # Application entry point
│   ├── index.css            # Global styles with Tailwind
│   └── services/
│       └── apiService.ts    # Mock API service for IPC simulation
├── src-tauri/               # Tauri configuration
│   ├── src/                 # Tauri backend (Rust)
│   ├── Cargo.toml           # Rust dependencies
│   └── tauri.conf.json      # Tauri configuration
├── public/                  # Static assets
├── package.json             # Node dependencies
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
└── tsconfig.json            # TypeScript configuration
```

## API Integration

For this initial implementation, the frontend uses a mock API service that simulates
IPC calls to the backend. In a production system, this would be replaced with Tauri's
IPC system using `@tauri-apps/api`.

The mock API service provides:
- `listDevices()` - List connected devices
- `unlockDevice(deviceId)` - Attempt to unlock a device
- `listPlugins()` - List available plugins
- `executePlugin(pluginName)` - Execute a plugin
- `getStatus()` - Get system status
- `getLogs()` - Get system logs

## Building

### Development Build
```bash
npm run build
```

### Production Build with Tauri
```bash
npm run tauri:build
```

This will create platform-specific installers in `src-tauri/target/release/bundle/`.

## Testing

```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

## UI Features

### Devices Tab
- View all connected devices
- See device information (model, manufacturer, serial, etc.)
- Unlock locked devices
- Refresh device list

### Plugins Tab
- View all available plugins
- See plugin metadata (version, author, language)
- Execute plugins with one click
- Refresh plugin list

### Logs Tab
- Real-time system log viewing
- Color-coded log levels (info, warn, error, debug)
- Clear logs functionality
- Automatic log updates

### Settings Tab
- Toggle dark mode
- View system information
- About section with project details

## License

MIT License - See [LICENSE](../LICENSE) for details.
