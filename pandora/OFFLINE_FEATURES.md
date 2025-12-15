# Offline Functionality

The Pandora Codex now supports offline functionality through Progressive Web App (PWA) features.

## Features

### 1. Service Worker
- Automatically generated and registered by vite-plugin-pwa
- Handles caching of static assets (JS, CSS, HTML, fonts)
- Provides runtime caching for API calls

### 2. Caching Strategies

#### Static Assets (Precaching)
- Application code (JavaScript, CSS)
- HTML pages
- Icons and SVG files
- Font files (woff, woff2)

**Strategy:** Precache + Cache First
- All critical assets are cached during service worker installation
- Assets are served from cache for instant loading

#### Google Fonts
**Strategy:** Cache First
- Fonts from fonts.googleapis.com and fonts.gstatic.com
- Cached for 1 year
- Maximum 10 font entries

#### API Calls
**Strategy:** Network First with 10-second timeout
- Attempts network request first
- Falls back to cache if network fails or timeout
- Cached for 5 minutes
- Maximum 50 cached responses

### 3. Offline Indicator
- Visual feedback when the app goes offline
- Shows "Offline - Using cached content" banner
- Displays "Back online" notification when connection restored
- Auto-dismisses after 3 seconds when back online

### 4. PWA Manifest
The app can be installed on devices with the following metadata:
- **Name:** The Pandora Codex
- **Short Name:** Pandora Codex
- **Theme Color:** #00d4ff (electric blue)
- **Background Color:** #0a0e1a (dark obsidian)
- **Display Mode:** Standalone (full-screen app experience)

## Building for Offline

### Development
```bash
cd frontend
npm install
npm run dev
```

Note: PWA features are disabled in development mode to avoid interfering with hot module reloading.

### Production Build
```bash
# Build everything (frontend + backend)
npm run build

# Or build frontend only
cd frontend
npm run build
```

The build process:
1. Compiles TypeScript and React components
2. Generates optimized bundles
3. Creates service worker with precache manifest
4. Generates PWA manifest
5. Copies all files to crm-api/public for deployment

### Running Production Build
```bash
npm start
```

This starts the CRM API server which serves:
- Backend API at `/api/*` and `/health`
- Frontend static files and SPA routing for all other paths
- Service worker at `/sw.js`
- PWA manifest at `/manifest.webmanifest`

## Testing Offline Mode

### In Browser DevTools
1. Open the application in Chrome/Edge
2. Open DevTools (F12)
3. Go to Application tab
4. Check "Service Workers" to see registration
5. Go to Network tab
6. Check "Offline" checkbox to simulate offline mode
7. Refresh the page - it should still load from cache
8. The offline indicator banner should appear

### On Mobile Device
1. Install the app using "Add to Home Screen" option
2. Open the installed app
3. Enable airplane mode
4. The app should still work with cached content
5. The offline indicator will show connection status

## Cache Management

### Automatic Cache Updates
- Service worker automatically updates when new versions are deployed
- Old caches are cleaned up automatically
- Users don't need to manually clear cache

### Cache Limits
- Maximum file size for precaching: 5 MB
- API cache: 50 entries, 5 minutes each
- Font cache: 10 entries, 1 year each
- Large assets (>5MB) are excluded from precaching but can still be cached at runtime

### Excluded from Precaching
- Files in `/branding/` directory (typically large images)
- Files in `/attached_assets/` directory
- Large PNG files (will be fetched on-demand)

## Browser Support

The PWA features work in:
- ✅ Chrome/Chromium (full support)
- ✅ Edge (full support)
- ✅ Firefox (partial support - service worker works, install prompt may not)
- ✅ Safari (partial support - requires iOS 11.3+ or macOS 11.3+)
- ✅ Opera (full support)

## Troubleshooting

### Service Worker Not Registering
1. Ensure you're accessing via HTTPS or localhost
2. Check browser console for errors
3. Clear browser cache and reload

### Old Content Showing
1. The service worker automatically updates
2. Refresh the page to get latest content
3. Close all tabs and reopen to force update

### Offline Mode Not Working
1. Check Service Worker is registered (DevTools > Application > Service Workers)
2. Verify cache entries exist (DevTools > Application > Cache Storage)
3. Ensure you accessed the app at least once while online to populate cache

## Implementation Details

### Dependencies
- `vite-plugin-pwa`: Vite plugin for PWA generation
- `workbox-window`: Workbox library for service worker management

### Configuration
See `frontend/vite.config.ts` for complete PWA configuration including:
- Service worker generation mode
- Cache strategies
- Precache patterns
- Runtime caching rules

### Components
- `OfflineIndicator.tsx`: React component for offline/online status display
- Service worker automatically injected by vite-plugin-pwa

## Security Considerations

- Service workers only work over HTTPS (or localhost for development)
- Cache is isolated per origin (domain)
- No sensitive data is cached by default
- API responses are cached for only 5 minutes
- Users can clear cache through browser settings
