# Pandora Codex - Branding Assets

This directory contains official branding and visual assets for The Pandora Codex.

## Available Assets

### Splash Screens
- **splash-golden.png** - Golden grimoire on dark background with "FATE REWRITTEN" tagline
  - Perfect for app launch splash screen
  - Dimensions optimized for desktop displays
  - Features iconic open book symbol with radiant light

### Wallpapers & Concept Art
- **wallpapers-4up.png** - Collection of 4 themed wallpapers:
  - Golden Grimoire (warm theme)
  - Electric Android (tech theme)
  - Crystal Monolith (mystical theme)
  - Ancient Citadel (fortress theme)

- **wallpapers-neon.png** - Neon-styled collection:
  - Neon Book (orange glow)
  - Electric Android (blue lightning)
  - Glowing Monolith (cyan aura)
  - Storm Citadel (gray/blue)

### Icon Variations
- **icon-variations.png** - Grid of 12+ logo concepts:
  - Feather (gold/blue variations)
  - Lightning bolt (gold/blue variations)
  - Star symbols (gold/blue variations)
  - Castle/citadel icons
  - Android robot
  - Geometric patterns
  - Grimoire/book icons

## Design Themes

### Color Palettes

#### Golden/Warm Theme
- **Primary**: Thunder Gold (#FFD700 / grimoire-thunder-gold)
- **Background**: Obsidian Black (#0A0A0F)
- **Use Case**: Grimoire, ancient knowledge, mystical power

#### Electric/Tech Theme
- **Primary**: Electric Blue (#00D9FF / grimoire-electric-blue)
- **Accent**: Neon Cyan (#00FFFF / grimoire-neon-cyan)
- **Background**: Obsidian Black (#0A0A0F)
- **Use Case**: Android operations, technical interfaces, device management

#### Mystical Theme
- **Primary**: Abyss Purple (#9D4EDD / grimoire-abyss-purple)
- **Background**: Deep space blue/black
- **Use Case**: iOS operations, recovery modes, mystical elements

## Typography

- **Primary Font**: Cinzel (font-grimoire) - Used for titles, branding
- **Secondary Font**: Orbitron (font-tech) - Used for technical text, subtitles
- **Tagline**: "FATE REWRITTEN" in all caps, letter-spaced

## Symbolism

### The Grimoire (Open Book)
- Represents knowledge, codex, ancient power
- Primary brand symbol
- Radiating light = unlocking secrets

### Lightning Bolt
- Power, speed, transformation
- Electric theme connection
- Android fastboot symbolism

### Stars & Geometric Patterns
- Mystical power, constellation navigation
- iOS/celestial connection
- Pattern complexity = sophisticated tech

### Citadel/Fortress
- Security, strength, protection
- Device security theme
- Ancient stronghold of knowledge

### Android Robot
- Direct Android platform representation
- Surrounded by lightning = powered state
- Tech meets mysticism

## Usage Guidelines

### App Icon
Recommended: Use the **electric blue star** or **golden grimoire** for desktop app icon
- Extract from icon-variations.png
- Generate multiple sizes (16x16, 32x32, 64x64, 128x128, 256x256, 512x512)
- Maintain electric blue or gold theme for brand recognition

### Splash Screen
Current implementation uses **animated SVG splash** based on star/grimoire concepts
- See: `frontend/src/components/SplashScreen.tsx`
- Duration: 2.5 seconds
- Fade out: 500ms
- Colors: Thunder gold with electric blue accents

### Loading States
Use **LoadingOverlay** component with theme variants:
- `variant="android"` - Electric blue Android robot
- `variant="ios"` - Purple star pattern
- `variant="device"` - Cyan device outline
- `variant="default"` - Dual spinning rings (gold + blue)

### Background Wallpapers
For marketing materials, documentation, or presentation slides:
- Use wallpapers-4up.png for variety showcase
- Golden grimoire for knowledge/documentation themes
- Electric Android for technical/device guides
- Citadel for security/protection messaging

## Asset Sources

These assets were generated as concept art for The Pandora Codex branding.
They establish the visual language combining:
- Ancient mysticism (grimoire, stars, citadel)
- Modern technology (Android, electric effects)
- Cinematic aesthetics (dramatic lighting, dark themes)

## Integration Status

✅ **Implemented:**
- SplashScreen component with animated star/grimoire
- LoadingOverlay component with theme variants
- Design tokens documented in `frontend/DESIGN_TOKENS.md`
- Grimoire color palette across UI

📋 **TODO:**
- Generate app icons from icon-variations.png
- Create platform-specific icon sets (.icns, .ico)
- Add wallpapers to marketing materials
- Create social media preview images

## Credits

**Project**: The Pandora Codex  
**Theme**: Mythic/Cinematic Device Management  
**Tagline**: "Fate Rewritten"  
**Style**: Dark fantasy meets cyberpunk
