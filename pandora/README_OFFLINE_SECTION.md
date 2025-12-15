# Section to Add to Main README.md

## 🌐 Offline Support & PWA Features

The Pandora Codex is a **Progressive Web App (PWA)** that works offline with intelligent caching.

### Key Features
- ⚡ **Instant Loading** - Assets cached for offline access
- 📡 **Network-First API** - Automatic fallback to cache when offline
- 📱 **Installable** - Add to home screen on mobile/desktop
- 🔔 **Offline Indicator** - Visual feedback for connection status
- 🔄 **Auto-Updates** - Service worker updates automatically

### Quick Start

#### Build for Production
```bash
npm run build
```
This will:
1. Build the frontend with PWA features
2. Generate service worker and manifest
3. Compile the backend API
4. Copy frontend to backend/public

#### Run Production Server
```bash
npm start
```
Server starts on port 5000 with:
- API at `/api/*` and `/health`
- Frontend SPA at all other routes
- Service worker at `/sw.js`

### Testing Offline Mode

**In Browser:**
1. Open http://localhost:5000
2. Open DevTools (F12) → Network tab
3. Check "Offline" checkbox
4. Refresh - page loads from cache! ✅

**On Mobile:**
1. Visit the app in Chrome/Safari
2. Tap "Add to Home Screen"
3. Open the installed app
4. Enable airplane mode
5. App still works! ✅

### What's Cached?

| Content Type | Strategy | Duration |
|--------------|----------|----------|
| App Code (JS/CSS) | Precached | Until update |
| HTML Pages | Precached | Until update |
| Google Fonts | Cache First | 1 year |
| API Calls | Network First | 5 minutes |
| Images/Icons | Runtime | As needed |

### Documentation

- **[OFFLINE_FEATURES.md](OFFLINE_FEATURES.md)** - Complete offline feature guide
- **[CHANGELOG_OFFLINE.md](CHANGELOG_OFFLINE.md)** - Implementation details

### Browser Support

| Browser | PWA Support | Offline Mode |
|---------|-------------|--------------|
| Chrome/Edge | ✅ Full | ✅ Full |
| Firefox | ⚠️ Limited | ✅ Full |
| Safari | ⚠️ Limited | ✅ Full |

### Troubleshooting

**Service Worker Not Working?**
- Ensure HTTPS or localhost
- Clear browser cache
- Check DevTools → Application → Service Workers

**Old Content Showing?**
- Service worker updates automatically
- Hard refresh (Ctrl+Shift+R)
- Clear site data in DevTools

For detailed troubleshooting, see [OFFLINE_FEATURES.md](OFFLINE_FEATURES.md).
