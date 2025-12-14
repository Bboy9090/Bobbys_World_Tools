# Planning Guide

Bobby's World - A gritty Bronx workshop repair toolkit featuring educational resources, legitimate diagnostic tools, and community repair guides with a hip-hop inspired aesthetic straight from Bobby's apartment in the 20s, fixing the hood one phone at a time.

**Experience Qualities**: 
1. **Authentic** - Raw, unpolished workshop vibe with spray-paint graffiti accents and vintage boom-box aesthetics
2. **Educational** - Community-focused repair knowledge sharing with step-by-step guides and legal techniques
3. **Empowering** - Tools and resources that put repair power back in the hands of the community

**Complexity Level**: Light Application (multiple features with basic state)
This is a curated resource hub and diagnostic toolkit for legitimate device repair technicians, presented through a distinctive Bronx workshop aesthetic with hip-hop cultural influences.

## Essential Features

### Bobby's Workshop Hub
- **Functionality**: Main landing page with graffiti-style navigation cards linking to Repair Library, Tool Registry, Device Diagnostics, and Community Resources
- **Purpose**: Provide immediate access to educational repair content and legitimate diagnostic tools in an authentic workshop aesthetic
- **Trigger**: App loads, user sees spray-painted menu on concrete-textured background
- **Progression**: App opens → Bobby's logo animates in → Navigation cards appear → User selects category → Content loads
- **Success criteria**: Page loads <2 seconds, all navigation cards interactive, authentic hip-hop aesthetic maintained, links functional

### Repair Library (Educational Resources)
- **Functionality**: Curated collection of legal repair guides, iFixit-style teardowns, battery replacement tutorials, screen repair instructions, and community-submitted techniques
- **Purpose**: Democratize repair knowledge with free, accessible tutorials for common device issues
- **Trigger**: User clicks "Repair Library" card from hub
- **Progression**: Click card → Category selector appears → User picks device type → Guides listed → User selects guide → Step-by-step instructions shown
- **Success criteria**: 20+ repair guides available, guides include images/diagrams, difficulty ratings clear, legal disclaimer present

### Tool Registry (Private & Public)
- **Functionality**: Organized directory of legitimate open-source repair tools (ADB, Fastboot, libimobiledevice, scrcpy, etc.) with descriptions, installation guides, and documentation links
- **Purpose**: Help technicians discover and learn about legal diagnostic and repair utilities
- **Trigger**: User clicks "Tool Registry" card, can toggle between Public Tools and Private Workspace
- **Progression**: Click card → Tool categories shown → User filters by platform → Tool cards displayed → Click tool for details → Installation instructions provided
- **Success criteria**: 30+ tools catalogued, clear legal status indicators, working documentation links, installation commands copy-to-clipboard

### Device Diagnostics Dashboard
- **Functionality**: Real USB device detection (ADB/Fastboot/iOS), battery health checks, storage diagnostics, sensor tests, device flashing with live progress tracking via WebSocket - all using legitimate system tools
- **Purpose**: Provide technicians with quick diagnostic capabilities for common hardware issues and live monitoring of flash operations
- **Trigger**: User clicks "Diagnostics" or "Flashing" card, connects device via USB
- **Progression**: Click card → Device detection runs → Connected devices shown → User selects device → Test suite options appear → User runs tests → Results displayed OR User initiates flash → WebSocket connects → Live progress updates stream → Flash completes
- **Success criteria**: Detects Android/iOS devices correctly, battery health % accurate, storage info correct, test results clear, WebSocket connection stable, progress updates real-time (<500ms latency), flash completion notifications work

### Multi-Brand Flash Station
- **Functionality**: Comprehensive flashing support for all major phone brands and emergency modes - iOS DFU (checkra1n/palera1n jailbreak support), Xiaomi EDL (emergency download for bricked devices), Samsung Odin (official protocol), and Universal Fastboot (Google, OnePlus, Motorola, etc.)
- **Purpose**: Provide one unified interface for flashing any brand of phone with appropriate protocols, including emergency recovery for deeply bricked devices
- **Trigger**: User clicks "Multi-Brand Flash" card from hub, selects brand-specific tab
- **Progression**: Click card → Tab interface loads → User selects iOS/Samsung/Xiaomi/Universal tab → Device scan runs → User selects detected device → Protocol-specific options appear → User configures flash settings → Start flash → Real-time progress with pause/resume → Flash completes with verification
- **Success criteria**: iOS DFU mode detection works, checkra1n/palera1n jailbreak instructions accurate, Xiaomi EDL mode scanning functional, Samsung Odin download mode recognition correct, partition selection for all brands, real-time progress tracking <500ms latency, pause/resume controls work, error handling shows helpful messages, legal disclaimers present

### Community Resources Hub
- **Functionality**: Links to legal repair advocacy groups (Right to Repair movement), forum communities, YouTube repair channels, and local repair shop directories
- **Purpose**: Connect technicians with broader repair community and advocacy resources
- **Trigger**: User clicks "Community" card
- **Progression**: Click card → Resource categories shown → User browses links → External sites open in new tabs
- **Success criteria**: 15+ quality resource links, organized by category, all links functional, descriptions clear

### Bobby's Private Workspace
- **Functionality**: Personal tool bookmarks, custom repair notes, device history log - all stored locally in browser using useKV
- **Purpose**: Let individual technicians organize their personal workflow and track repair jobs
- **Trigger**: User clicks "My Workspace" from menu, data persists between sessions
- **Progression**: Click workspace → Saved tools/notes appear → User adds/edits content → Changes auto-save → Persist on reload
- **Success criteria**: Data persists correctly using useKV, no data loss, export/import functionality works, clear organizational structure

### Workshop Atmosphere System
- **Functionality**: Optional background audio atmosphere for focused work - instrumental (80-92 BPM boom-bap), ambient (vinyl hiss/city hum), or external (user's own audio). Hard capped at 15% volume, never auto-plays, starts only when work begins, fades out on errors/completion
- **Purpose**: Create authentic workshop vibe without distraction - feels like music in the next room, not a soundtrack
- **Trigger**: User enables in Settings → Atmosphere panel, audio plays when flash/diagnostic operations start
- **Progression**: User enables atmosphere → Selects mode → Adjusts intensity (0-15%) → Enables auto-mute/pause options → Starts work → Audio fades in → Job completes → Audio fades out
- **Success criteria**: Never auto-plays on launch, volume hard-capped at 15%, smooth fade in/out (200-300ms), respects user preferences via useKV persistence, works with all flash/diagnostic operations, gracefully handles missing audio files, External mode does nothing (BYO audio), legal/license-clean audio only

## Edge Case Handling

- **No Devices Connected**: Show friendly empty state with connection instructions, avoid technical jargon
- **Legal Disclaimer Not Accepted**: Block access to advanced diagnostic tools until disclaimer acknowledged
- **External Links Broken**: Show error toast, provide alternative resource suggestions
- **Browser Storage Full**: Gracefully handle useKV storage limits, prompt user to export/clear old data
- **Unsupported Device Detected**: Show "Unknown Device" with generic diagnostic options
- **Installation Commands Fail**: Troubleshooting section in guides with common error solutions
- **Mobile Browser Access**: Responsive layout maintains functionality, diagnostic features may have limited capability warnings
- **Audio Files Missing**: Workshop Atmosphere system continues to function (settings UI works), audio simply doesn't play - no errors shown to user
- **Atmosphere During Errors**: Auto-mute kicks in immediately (200ms fade), never competes with error notifications or diagnostic output

## Design Direction

**Bronx Workshop Soul** - This interface channels Bobby's apartment workshop in the 20s: fluorescent lights flickering, oil on concrete floors, cigarette smoke in the air, tools older than the city. A line outside the roll-up gate - a dealer with a cracked screen, a sex worker scrolling on shattered glass, a thug waiting respectfully, a smart kid with hope, a businessman who doesn't belong but needs it done. Different lives, same problem. When Bobby shows up, shit gets fixed.

The UI captures this energy: raw authenticity meets professional capability. Not polished corporate design, not hacker aesthetics - this is *workshop reality*. Fluorescent cyan like overhead lights. Amber like sodium streetlamps. Asphalt black and oil-stained surfaces. The app feels like field equipment that's seen real work. No speeches, no promises - just results.

This is operator-grade infrastructure with street soul. Industrial credibility that knows where it came from.

## Color Selection

**Bronx Workshop Aesthetic** - Raw, authentic, street-level repair culture with industrial credibility.

The colorway evokes Bobby's apartment workshop: fluorescent lights, oil-stained concrete, cold winter nights, and tools older than the city itself. This is the soul of the street technician - not polished, not corporate, just real.

- **Background**: `#0A0A0A` - Asphalt black, apartment floor
- **Card/Panel**: `#121212` - Oil-stained charcoal surfaces
- **Border**: `#1F2632` - Worn metal divisions
- **Primary Color**: `#1ECAD3` - Fluorescent shop cyan, that bright overhead light
- **Accent**: `#CFA24D` - Sodium light amber, streetlamp warmth
- **Rust Red** (rare/critical): `#8B2E2E` - Old tool patina, use sparingly
- **Success**: `#2ECC71` - Clean fix confirmation
- **Muted**: `#8C8C8C` - Dust gray for secondary text
- **Foreground**: `#EDEDED` - Chalk white, written-on-concrete clarity
- **Foreground/Background Pairings**: 
  - Background (#0A0A0A): Chalk white (#EDEDED) - Ratio 18.2:1 ✓
  - Primary Cyan (#1ECAD3): Dark text (#0A0A0A) - Ratio 10.8:1 ✓
  - Accent Amber (#CFA24D): Dark text (#0A0A0A) - Ratio 7.2:1 ✓
  - Rust Red (#8B2E2E): Chalk white (#EDEDED) - Ratio 6.1:1 ✓
  - Card Surface (#121212): Chalk white (#EDEDED) - Ratio 16.5:1 ✓

## Font Selection

Mix of graffiti-inspired display fonts and clean technical monospace for readability.

- **Primary**: Outfit (bold, geometric) for headers and navigation - street-style meets readability
- **Secondary**: Space Mono for technical data, device IDs, and code
- **Accent**: Bebas Neue for large impact text and hero sections
- **Typographic Hierarchy**: 
  - Hero Title: Bebas Neue Bold/48px/tight spacing
  - Section Headers: Outfit Bold/28px/normal spacing  
  - Card Titles: Outfit SemiBold/18px/normal spacing
  - Body Text: Outfit Regular/15px/relaxed spacing (1.6)
  - Technical Data: Space Mono Regular/13px/normal spacing
  - Labels: Outfit Medium/12px/wide spacing/uppercase

## Animations

Raw, impactful animations inspired by street culture - spray-paint reveals, cassette tape loading animations, vinyl scratch transitions. Cards should feel like they're being slapped onto a wall with a slight bounce. Hover states should have subtle graffiti-style glow effects. Page transitions should feel snappy and urban, not corporate. Key moments (successful repairs, device connections) should celebrate with spray-paint burst animations or old-school boom-box visual effects.

## Component Selection

- **Components**: 
  - Card with concrete texture backgrounds and spray-paint borders
  - Button styled like cassette tape buttons or boom-box controls
  - Badge shaped like price tags or graffiti tags
  - Custom navigation cards styled like vinyl record covers or cassette cases
  - Tooltip styled like sticky notes or torn paper
  
- **Customizations**: 
  - Graffiti-style border treatments using SVG spray effects
  - Concrete texture overlays on major containers
  - Custom scrollbars styled like spray-paint drips
  - Icon buttons styled like old-school boom-box controls
  
- **States**: 
  - Buttons: Rest (cassette button), Hover (slight glow), Active (pressed in), Disabled (faded)
  - Cards: Rest (concrete texture), Hover (spray-paint glow), Active (lifted with shadow)
  - Status: Success (mint jade glow), Warning (hot pink), Error (rust red), Info (spray gold)
  
- **Icon Selection**: 
  - Wrench, Hammer, Screwdriver for tool references
  - Books, GraduationCap for educational content
  - Users, Heart for community features
  - Lightning, Cpu for diagnostics
  - Bookmarks, FolderOpen for workspace
  - Link, Download for external resources
  
- **Spacing**: Generous spacing (gap-6) between major sections, standard padding (p-5) on cards, tight clustering (gap-2) for related controls
- **Mobile**: Single column stacking, larger touch targets (min 48px), collapsible sections with accordion behavior, bottom-sticky navigation
