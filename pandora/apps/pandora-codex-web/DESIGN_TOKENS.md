# Mythic Design System - Design Tokens

**The Pandora Codex** uses a cinematic "Ancient Digital Grimoire" theme with mythic color palettes, custom fonts, and animations.

## Color Palette

### Primary Colors (Grimoire Theme)
```js
grimoire: {
  obsidian: '#0B0E11',        // Obsidian Black - primary background
  'obsidian-light': '#151821', // Lighter obsidian for cards
  'electric-blue': '#00C9FF',  // Electric Blue - Codex Link Layer
  'thunder-gold': '#FFDB56',   // Thunder Gold - Zeus Forge
  'abyss-purple': '#7A14FF',   // Abyss Purple - Hades Gate
  'phoenix-orange': '#FF6B35', // Phoenix Verse - burning feather
  'neon-cyan': '#00FFF5',      // Neon glyphs accent
  'smoke-gray': '#4A4A5C',     // Purple smoke base
}
```

### Dark Theme Colors
```js
dark: {
  bg: '#0f1419',
  card: '#1a1f2e',
  border: '#2d3748',
  text: '#e2e8f0',
  muted: '#94a3b8',
}
```

## Typography

### Font Families
- **font-grimoire**: Cinzel (serif) - For headings and ancient text
- **font-tech**: Orbitron (monospace) - For digital/tech elements
- **font-mono**: JetBrains Mono / Fira Code - For code and logs

### Usage Guidelines
```jsx
// Headings - use grimoire font with electric-blue
<h1 className="font-grimoire text-grimoire-electric-blue">Title</h1>

// Subtitles - use tech font with neon-cyan
<p className="font-tech text-grimoire-neon-cyan">Subtitle</p>

// Body text - use default font with dark-text
<p className="text-dark-text">Body content</p>

// Code/logs - use mono font
<code className="font-mono">code snippet</code>
```

## Themed Components

### GrimoireCard
Reusable card component with hover effects and themed borders.

```jsx
import { GrimoireCard } from './components/GrimoireCard';

<GrimoireCard theme="codex">
  Card content
</GrimoireCard>
```

**Available themes**: `default`, `codex`, `zeus`, `hades`, `phoenix`

### StormstrikeButton
Mythic-styled button with gradients and glow effects.

```jsx
import { StormstrikeButton } from './components/StormstrikeButton';

<StormstrikeButton theme="zeus" size="lg" onClick={handleClick}>
  Click Me
</StormstrikeButton>
```

**Available themes**: `default`, `codex`, `zeus`, `hades`, `phoenix`
**Available sizes**: `sm`, `md`, `lg`

### ScrollPanel
Themed panel container with borders and titles.

```jsx
import { ScrollPanel } from './components/ScrollPanel';

<ScrollPanel theme="hades" title="Panel Title">
  Panel content
</ScrollPanel>
```

**Available themes**: `default`, `codex`, `zeus`, `hades`, `phoenix`

## Shadow Effects (Glows)

### Usage
```jsx
// Blue glow (Codex theme)
<div className="shadow-glow-blue">Content</div>

// Gold glow (Zeus theme)
<div className="shadow-glow-gold">Content</div>

// Purple glow (Hades theme)
<div className="shadow-glow-purple">Content</div>

// Orange glow (Phoenix theme)
<div className="shadow-glow-orange">Content</div>
```

## Animations

### Pulse Glow
```jsx
<div className="animate-pulse-glow">Pulsing element</div>
```

### Lightning Strike
```jsx
<div className="animate-lightning-strike">Lightning effect</div>
```

### Smoke Float
```jsx
<div className="animate-smoke-float">Floating smoke</div>
```

### Flame Flicker
```jsx
<div className="animate-flame-flicker">Flickering flame</div>
```

### Chain Break
```jsx
<div className="animate-chain-break">Breaking chains</div>
```

### Glyph Appear
```jsx
<div className="animate-glyph-appear">Appearing glyph</div>
```

## Background Gradients

### Electric Glow
```jsx
<div className="bg-electric-glow">Content</div>
```

### Thunder Strike
```jsx
<div className="bg-thunder-strike">Content</div>
```

### Abyss Smoke
```jsx
<div className="bg-abyss-smoke">Content</div>
```

### Phoenix Flame
```jsx
<div className="bg-phoenix-flame">Content</div>
```

## Theme Mapping

Each theme corresponds to a mythic power:

| Theme | Primary Color | Secondary Color | Use Case |
|-------|---------------|-----------------|----------|
| `default` | Electric Blue | Neon Cyan | General UI elements |
| `codex` | Electric Blue | Neon Cyan | Codex Link Layer (connectivity) |
| `zeus` | Thunder Gold | Yellow | Zeus Forge (power/creation) |
| `hades` | Abyss Purple | Purple | Hades Gate (destruction/logs) |
| `phoenix` | Phoenix Orange | Orange | Phoenix Verse (rebirth/recovery) |

## Best Practices

### 1. Use Themed Components
Prefer `GrimoireCard`, `StormstrikeButton`, and `ScrollPanel` over custom styling to maintain consistency.

### 2. Layer Glows Subtly
Use opacity suffixes (e.g., `/10`, `/20`, `/30`) to layer glow effects without overwhelming the UI.

```jsx
// Good - subtle glow
<div className="shadow-glow-blue/20">Content</div>

// Avoid - too intense
<div className="shadow-glow-blue">Content</div>
```

### 3. Font Hierarchy
- **Headings**: `font-grimoire` (ancient/mystical)
- **Tech elements**: `font-tech` (digital/modern)
- **Body text**: Default sans-serif
- **Code/logs**: `font-mono`

### 4. Color Contrast
Always ensure readable contrast:
- Use `text-grimoire-electric-blue` on dark backgrounds
- Use `text-grimoire-obsidian` on bright backgrounds
- Use `text-dark-muted` for secondary text

### 5. Consistent Borders
Use grimoire colors with opacity for borders:
```jsx
<div className="border border-grimoire-electric-blue/30">Content</div>
```

## Examples

### Mythic Card
```jsx
<div className="grimoire-card p-4">
  <h3 className="font-grimoire text-grimoire-electric-blue">Card Title</h3>
  <p className="text-dark-muted font-tech">Card description</p>
  <StormstrikeButton theme="codex">Action</StormstrikeButton>
</div>
```

### Status Badge
```jsx
<span className="px-2 py-1 rounded text-xs font-tech bg-grimoire-electric-blue/20 text-grimoire-neon-cyan border border-grimoire-electric-blue/40 shadow-glow-blue/30">
  Running
</span>
```

### Mythic Header
```jsx
<header className="bg-grimoire-obsidian-light border-b-2 border-grimoire-electric-blue/30 shadow-glow-blue/20">
  <h1 className="font-grimoire text-grimoire-electric-blue animate-pulse-glow">
    The Pandora Codex
  </h1>
  <p className="font-tech text-grimoire-neon-cyan">
    Ancient Secrets. Modern Power.
  </p>
</header>
```

## Extending the Design System

When adding new components:

1. **Choose a theme** from the 5 available themes based on component purpose
2. **Reuse existing primitives** (GrimoireCard, StormstrikeButton, ScrollPanel)
3. **Apply consistent typography** (grimoire for headings, tech for UI elements)
4. **Use glow effects sparingly** (20-30% opacity for subtle effects)
5. **Test in dark mode** (the primary color scheme)

## Configuration Location

- **Tailwind Config**: `frontend/tailwind.config.js`
- **Global Styles**: `frontend/src/index.css`
- **Component Library**: `frontend/src/components/`
