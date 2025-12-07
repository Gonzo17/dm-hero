# DM Hero - Project Context

## Quick Start

### Web App (Browser)
```bash
nvm use              # Node 22+ required!
pnpm install
pnpm dev             # http://localhost:3000
```

### Desktop App (Electron) - Dev Mode
```bash
nvm use
pnpm install
pnpm dev:electron    # Starts Nuxt + opens Electron window
```

### Desktop App (Electron) - Production Test (Linux/WSL)
```bash
pnpm build                    # Build Nuxt/Nitro
pnpm mode:electron            # Rebuild better-sqlite3 for Electron
pnpm electron:start           # Test production Electron
```

### Windows Build (from WSL)
```bash
./scripts/sync-to-windows.sh  # Sync project to C:\Projects\dm-hero
```
Then in Windows PowerShell:
```powershell
cd C:\Projects\dm-hero
pnpm install
pnpm electron:build:win        # Builds Nuxt + rebuilds native modules + electron-builder
# Output: packages\app\dist-electron\win-unpacked\DM Hero.exe
```

**WICHTIG**: Windows Build erfordert VS Build Tools!
- Installieren: `winget install Microsoft.VisualStudio.2022.BuildTools --override "--add Microsoft.VisualStudio.Workload.VCTools --includeRecommended --passive"`
- Das alte `npm install -g windows-build-tools` funktioniert NICHT mehr mit Node 22!
- GitHub Actions hat VS Build Tools vorinstalliert, nur lokal muss man es manuell installieren

**Database**: Auto-creates at `data/dm-hero.db` (Web) or `~/.config/dm-hero/data/dm-hero.db` (Electron)

---

## Tech Stack

- **Framework**: Nuxt 4 (`app/` folder structure)
- **UI**: Vuetify 3 (no elevation, flat design)
- **Database**: SQLite + better-sqlite3 + FTS5
- **i18n**: German (default) + English
- **Node**: 22+ (see `.nvmrc`)
- **Desktop**: Electron 39.2.3

---

## Project Overview

Personal D&D campaign management tool for Dungeon Masters:
- **Fuzzy Search**: FTS5 + Levenshtein across ALL fields including linked entities
- **Entity Management**: NPCs, Locations, Items, Factions, Lore, Players, Sessions
- **Bidirectional Relations**: NPC knows Lore ↔ Lore shows NPCs
- **Entity Linking**: `{{npc:123}}` in Markdown → clickable badge with preview
- **In-Game Calendar**: Absolute day system for session tracking
- **AI Integration**: DALL-E image generation, GPT name generation
- **Local-First**: SQLite, self-hosted, your data forever

---

## Monorepo Structure

```
dm-hero/
├── package.json              # Root workspace config
├── pnpm-workspace.yaml       # packages: ['packages/*']
├── scripts/
│   └── version-bump.js       # Simple version bumping script
├── packages/
│   ├── app/                  # Main Nuxt App (@dm-hero/app) v1.0.0-beta.1
│   │   ├── app/              # Nuxt app folder
│   │   ├── server/           # Nitro API
│   │   ├── electron/         # Electron main/preload
│   │   └── package.json
│   └── landing/              # Landing Page (@dm-hero/landing) v1.0.0-beta.1
│       ├── app/              # Nuxt app folder
│       ├── i18n/locales/     # de.json, en.json
│       ├── Dockerfile        # Multi-stage with nginx
│       ├── nginx.conf        # SPA routing
│       └── package.json
├── Dockerfile                # Docker build for app
└── .github/workflows/        # CI/CD
```

### Workspace Commands (from root)
```bash
pnpm dev                      # Run @dm-hero/app dev (port 3000)
pnpm dev:landing              # Run @dm-hero/landing dev (port 3001)
pnpm build                    # Build @dm-hero/app
pnpm build:landing            # Build @dm-hero/landing
pnpm version:bump <version>   # Bump version (e.g., 1.0.0-beta.2)
```

---

## File Locations

| What | Where |
|------|-------|
| Pages | `packages/app/app/pages/` |
| Components | `packages/app/app/components/` |
| Composables | `packages/app/app/composables/` |
| Store | `packages/app/app/stores/entities.ts` |
| API Routes | `packages/app/server/api/` |
| DB Utils | `packages/app/server/utils/db.ts` |
| Path Utils | `packages/app/server/utils/paths.ts` |
| Migrations | `packages/app/server/utils/migrations.ts` |
| i18n | `packages/app/i18n/locales/{de,en}.json` |
| Electron Main | `packages/app/electron/main.js` |

---

## Electron Architecture

### Production Flow
```
DM Hero.exe (Electron Main Process)
└── electron/main.js
     ├── utilityProcess.fork() ──► Nitro Server (port 3456)
     └── BrowserWindow.loadURL('http://127.0.0.1:3456')
```

### Packaged Structure
```
dist-electron/win-unpacked/
├── DM Hero.exe
└── resources/
    ├── app.asar           ← electron/ folder only
    └── .output/           ← Nitro Server (extraResources)
```

### Key Config (package.json build section)
```json
{
  "build": {
    "files": ["electron/**/*"],
    "extraResources": [
      { "from": ".output", "to": ".output", "filter": ["**/*"] },
      { "from": "node_modules/better-sqlite3", "to": ".output/server/node_modules/better-sqlite3" },
      { "from": "node_modules/bindings", "to": ".output/server/node_modules/bindings" },
      { "from": "node_modules/file-uri-to-path", "to": ".output/server/node_modules/file-uri-to-path" }
    ],
    "asar": true,
    "win": { "target": ["zip"] }
  }
}
```

### Native Modules für Electron

**KRITISCH**: `better-sqlite3` ist ein native Module und hat Dependencies die AUCH kopiert werden müssen!

Die Dependency-Chain:
```
better-sqlite3 → bindings → file-uri-to-path
```

Da Nitro `better-sqlite3` als `external` markiert (nicht gebundelt), muss es manuell in `extraResources` kopiert werden.
pnpm hoistet Dependencies zum Root `node_modules/.pnpm/`, aber wir brauchen sie in `packages/app/node_modules/`.

**Lösung**: `bindings` und `file-uri-to-path` als explizite Dependencies in `packages/app/package.json` hinzufügen:
```json
"dependencies": {
  "better-sqlite3": "^12.4.6",
  "bindings": "^1.5.0",
  "file-uri-to-path": "^1.0.0"
}
```

### Windows Build Target

**ZIP ist das einzige funktionierende Target!**
- `nsis`: Installer baut, aber App startet nicht
- `portable`: Baut nicht richtig
- `dir`: Erzeugt Ordner, keine .exe
- `zip`: ✅ Funktioniert zuverlässig

---

## Release Workflow (Simple Version Bumping)

**Changesets wurde entfernt** - zu komplex, zu viele Probleme mit Pre-release Mode.

### Creating a Release

```bash
# 1. Bump version in all packages
node scripts/version-bump.js 1.0.0-beta.2

# 2. Commit the version change
git add -A && git commit -m "chore: release v1.0.0-beta.2"

# 3. Push (triggers release workflow automatically)
git push
```

Das war's. Der Release Workflow:
1. Erkennt package.json Änderung
2. Prüft ob Tag existiert (falls ja → skip)
3. Baut Docker + Electron
4. Erstellt GitHub Release mit Tag

### GitHub Actions Workflows

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `release-app.yml` | Push to main (package.json changes) OR manual | Builds Docker + Electron, creates GitHub Release |
| `release-landing.yml` | Push to main (package.json changes) | Builds Landing Docker image |

### Docker Images

- **App**: `ghcr.io/flo0806/dm-hero:latest`
- **Landing**: `ghcr.io/flo0806/dm-hero-landing:latest`

### Version Format

- **Beta**: `1.0.0-beta.1`, `1.0.0-beta.2`, etc.
- **Stable**: `1.0.0`, `1.0.1`, `1.1.0`, etc.

### TODO: Better Version Tool (Issue #111)

Current `scripts/version-bump.js` is minimal. Future improvements:
- [ ] Auto-generate changelog from git commits
- [ ] Interactive mode: prompt for version
- [ ] Auto-increment: `pnpm version:bump beta` → next beta number
- [ ] Validation and dry-run mode

---

## Dockerfile Notes

**WICHTIG**: better-sqlite3 Pfad ist dynamisch (nicht hardcoded!):
```dockerfile
RUN cd $(find node_modules/.pnpm -type d -name "better-sqlite3" -path "*/node_modules/better-sqlite3" | head -1) && \
    npm run build-release
```

---

## Common Gotchas

### 1. better-sqlite3 Version Mismatch
```
Error: Module did not self-register (NODE_MODULE_VERSION 127 vs 140)
```
- System Node = 127, Electron = 140
- Fix: `pnpm mode:web` (für Browser-Dev) oder `pnpm mode:electron` (für Electron-Dev)
- **WICHTIG**: Immer mit der gleichen Node-Version rebuilden die auch `pnpm dev` ausführt!
- Wenn du `pnpm mode:web` mit Node 20 ausführst aber `pnpm dev` mit Node 22, gibt es wieder einen Mismatch

### 2. Electron Build - Missing Native Module Dependencies
```
Error: Cannot find module 'bindings'
```
- `better-sqlite3` hat Dependencies (`bindings`, `file-uri-to-path`) die auch kopiert werden müssen
- Diese müssen in `extraResources` UND als explizite Dependencies in package.json stehen
- Siehe "Native Modules für Electron" Sektion oben

### 3. Nitro Routing Conflict
**Falsch**: `[id].get.ts` + `[id]/relations.get.ts`
**Richtig**: `[id]/index.get.ts` + `[id]/relations.get.ts`

### 4. Async Functions
`convertMetadataToKeys`, `getRaceKey`, `getClassKey` sind ASYNC - immer `await`!

### 5. GitHub Actions Build lokal testen
Vor dem Push immer erst lokal testen wie GitHub Actions es baut:
```powershell
# In Windows PowerShell:
cd C:\Projects\dm-hero
.\scripts\test-github-build.ps1
```
Dieses Script simuliert exakt den GitHub Actions Build (clean install, build, electron-builder).

---

## Design Principles

- **Soft-delete**: Never hard delete, use `deleted_at`
- **Comments**: English only
- **i18n**: All UI text through translation files
- **No over-engineering**: Solve current problems only
- **Local-first**: All data in SQLite
- **pnpm only**: Never npm or yarn
- **No alert()**: Use snackbars

---

## Theme Colors

**Dark**: Background `#1A1D29`, Primary `#D4A574`, Secondary `#8B7355`
**Light**: Background `#F5F1E8`, Primary `#8B4513`, Secondary `#B8860B`

---

## Self-Contained Edit Dialogs

All entity dialogs (NpcEditDialog, LocationEditDialog, ItemEditDialog, FactionEditDialog):
```typescript
defineProps<{ show: boolean; entityId?: number | null }>()
defineEmits<{ 'update:show': [boolean]; saved: [Entity]; created: [Entity] }>()
```

**Key**: Watch `[props.show, props.entityId]` with `{ immediate: true }`

---

## Landing Page (packages/landing)

**Status**: v1.0.0-alpha.6 - Production ready at https://dm-hero.com

### Features (implemented):
- [x] Hero Section with animated background (particles, orbs, gradient)
- [x] Feature Showcase (8 key features with icons)
- [x] Screenshots Gallery with auto-detection (finds highest numbered version like `npc-edit-02.png`)
- [x] Downloads section with GitHub API integration (filters app releases only, not landing releases)
- [x] Docker command section
- [x] i18n (DE + EN) with language toggle
- [x] Footer with links (GitHub, Issues, Releases, License)
- [x] Tech stack badges (Nuxt, Vuetify, SQLite, Electron)
- [x] Responsive design (mobile-first, docs padding fix)
- [x] Docker support (nginx static hosting)
- [x] Buy Me a Coffee integration (SupportSection, NavBar button, FUNDING.yml)
- [x] Feedback section linking to GitHub Discussions
- [x] Docs section with EN/DE guides and particle animation
- [x] Nuxt Content v3 for documentation

### Tech Stack:
- Nuxt 4 (Static Generation, `nitro.preset: 'static'`)
- Vuetify 3 (DM Hero theme)
- @vueuse/motion for animations
- GitHub API for dynamic release info
- Nuxt Content v3 for docs

### Deployment:
```bash
# Docker
docker pull ghcr.io/flo0806/dm-hero-landing:latest
docker run -p 80:80 ghcr.io/flo0806/dm-hero-landing:latest

# Local preview
cd packages/landing
pnpm build
npx serve .output/public
```

---

## Search Implementation Details

### Levenshtein Fuzzy Search

All entity search APIs use Levenshtein distance for fuzzy matching:

```typescript
// Distance threshold based on search term length
const maxDist = searchTerm.length <= 3 ? 1 : searchTerm.length <= 6 ? 2 : 3

// Always check BOTH full name AND word-by-word
// 1. Full name match first (for single-word or close matches)
if (levenshtein(searchTerm, nameNormalized) <= maxDist) return true

// 2. Word-level match (for multi-word names like "Stephan Müller")
const words = nameNormalized.split(/\s+/)
for (const word of words) {
  if (word.length < 3) continue
  if (levenshtein(searchTerm, word) <= maxDist) return true
}
```

**Files with Levenshtein search:**
- `server/api/search.get.ts` - Global search (all entity types)
- `server/api/npcs/index.get.ts`
- `server/api/items/index.get.ts`
- `server/api/locations/index.get.ts`
- `server/api/factions/index.get.ts`
- `server/api/lore/index.get.ts`
- `server/api/players/index.get.ts`

### Bidirectional Entity Relations

**CRITICAL**: Entity relations in `entity_relations` table are stored with `from_entity_id` and `to_entity_id`.
When querying linked entities, ALWAYS check BOTH directions:

```sql
-- WRONG (only one direction):
SELECT to_entity_id FROM entity_relations WHERE from_entity_id = ?

-- CORRECT (bidirectional):
SELECT DISTINCT
  CASE WHEN from_entity_id = ? THEN to_entity_id ELSE from_entity_id END as linked_id
FROM entity_relations
WHERE from_entity_id = ? OR to_entity_id = ?
```

**Or use UNION ALL pattern:**
```sql
SELECT to_entity_id as linked_id FROM entity_relations WHERE from_entity_id IN (...)
UNION ALL
SELECT from_entity_id as linked_id FROM entity_relations WHERE to_entity_id IN (...)
```

### Cross-Entity Search

When searching for an entity type, also find entities linked to matching entities of OTHER types:
- Search "Gandalf" in Items → Find items owned by NPC "Gandalf"
- Search "Stephan" in Lore → Find lore entries linked to Player "Stephan"

This is implemented in all entity-specific search endpoints.

---

## CRITICAL: Search Architecture - KEYS NOT TEXT!

**THE DATABASE STORES KEYS, NOT TRANSLATED TEXT!**

When a user enters "Meine DE Rasse" (German) as a custom race:
1. It gets converted to a KEY and stored in metadata as `"race":"meinederasse"` or similar
2. The `races` table stores: `name` (key), `name_de` (German), `name_en` (English)
3. Search MUST look up the KEY from the translated text, then search for the KEY

**Search flow:**
1. User searches "Meine DE Rasse" (German text)
2. Backend calls `getRaceKey("Meine DE Rasse")` → returns the KEY
3. Backend searches for the KEY in metadata JSON
4. Display converts KEY back to localized text via i18n

**NEVER search for raw user text in metadata - always convert to KEY first!**

Files:
- `server/utils/i18n-lookup.ts` - `getRaceKey()`, `getClassKey()`, `convertMetadataToKeys()`
- `server/api/npcs/index.get.ts` - search logic with key expansion

---

## CRITICAL: i18n and Dropdown Patterns

### v-select vs v-combobox - VALUE EXTRACTION

**v-select with `item-value="value"`**: Automatically extracts the value - use directly.

**v-combobox**: Returns the ENTIRE object `{value, title}` - MUST extract value manually!

```typescript
// REQUIRED helper function for v-combobox
function getComboboxValue(val: string | { value: string; title: string } | null): string {
  if (!val) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'object' && 'value' in val) return val.value
  return ''
}

// Usage in save/submit functions:
const relationType = getComboboxValue(localRelationType.value)
```

**Files that use this pattern:**
- `NpcRelationsTab.vue` - `getRelationTypeValue()`
- `FactionEditDialog.vue` - `getComboboxValue()` for type
- `LocationEditDialog.vue` - `getComboboxValue()` for type

### i18n Keys - NEVER save translated values to DB!

**WRONG**: Saving `"Freund"` (German translation) to database
**CORRECT**: Saving `"friend"` (English key) to database, display with `$t('npcs.npcRelationTypes.friend')`

**Display pattern:**
```vue
{{ $t(`namespace.${value}`, value) }}
```
The second parameter is fallback if key not found.

### i18n Files - Check for duplicate keys!

Before adding new keys to `de.json` or `en.json`:
1. Search for existing key: `grep -n "keyName" i18n/locales/*.json`
2. Check for duplicates at different positions in same file
3. Use consistent naming: camelCase for keys (e.g., `lawfulGood` not `lawful_good`)

### Dropdown Suggestions Pattern

Use TypeScript const arrays from `types/*.ts`, not hardcoded arrays in components:

```typescript
// In types/npc.ts
export const NPC_RELATION_TYPES = ['ally', 'enemy', 'friend', ...] as const

// In component
import { NPC_RELATION_TYPES } from '~~/types/npc'
const suggestions = computed(() =>
  NPC_RELATION_TYPES.map((type) => ({
    value: type,
    title: t(`npcs.npcRelationTypes.${type}`),
  })),
)
```

---

## KNOWN ISSUES TO FIX

### Search: Quoted phrase not working for metadata fields

**Problem**: Searching `"Meine DE Rasse"` (in quotes) in NPC search returns 0 results even though an NPC has this value in metadata.class field.

**Expected**: Quoted phrases should search in metadata fields (race, class, etc.) as exact substring match.

**Location**: `server/api/npcs/index.get.ts` - quoted phrase search logic around line 541-565

**Status**: NEEDS INVESTIGATION - the multi-word quoted search should match metadata but doesn't

---

## Migration 24: Normalize relation_type to English keys

Added migration that converts old German relation_type values to English keys:
- `"Freund"` → `"friend"`
- `"Chaotisch Böse"` → `"chaoticEvil"`
- etc.

This runs automatically on server start.

---

## Migration 28: Campaign Currencies

Added flexible currency system for item pricing:
- `currencies` table with campaign_id, code, name, symbol, exchange_rate, sort_order, is_default
- Default currencies: CP (1), SP (10), GP (100, default), PP (1000)
- exchange_rate is relative to base unit (Copper = 1)
- Users can add/edit/delete currencies per campaign
- Items store currency_id in metadata

## Migration 29: Currency names to i18n keys

Converts existing English currency names to lowercase keys for i18n:
- "Copper" → "copper", "Silver" → "silver", "Gold" → "gold", "Platinum" → "platinum"
- Frontend translates keys via `campaigns.currencies.defaults.{key}`
- Custom currency names (user-created) are displayed as-is

## Migration 31: Calendar Weather System

Added weather tracking for calendar days:
- `calendar_weather` table with campaign_id, year, month, day, weather_type, temperature, notes
- Weather types: sunny, partlyCloudy, cloudy, rain, heavyRain, thunderstorm, snow, heavySnow, fog, windy, hail
- Auto-generate weather for entire month based on seasons
- Manual editing per day via WeatherDialog

## Migration 32: Season Weather Type

Added explicit weather_type field to calendar_seasons:
- `weather_type` column: 'winter', 'spring', 'summer', 'autumn'
- Users select weather type via dropdown when creating/editing seasons
- Weather generation uses this explicit type instead of keyword-matching season names
- Migration auto-detects weather type from existing season names

---

## Interactive Campaign Maps (Issue #72)

### Implemented
- **Database**: Migration 25 (`campaign_maps` + `map_markers`) + Migration 26 (`location_id` on entities + `map_areas`)
- **API Routes**: Full CRUD for maps, markers, and areas
- **MapViewer.vue**: Leaflet.js with CRS.Simple for image-based maps
- **MapMarkerEditDialog.vue**: Create/edit markers linked to entities
- **MapAreaEditDialog.vue**: Create/edit location circles on maps
- **LocationSelectWithMap.vue**: Reusable component for entity dialogs (select location + optional map sync)
- **EntityPreviewDialog**: Opens on marker/area click to show entity details
- **i18n**: Full German + English translations

### Key Features
- Upload custom world maps with name, description, version
- Pan/zoom with Leaflet (zoom state saved per map in localStorage)
- Click on map = add new marker OR area (based on menu selection)
- Click on marker = EntityPreviewDialog (view entity)
- Click on area (circle) = EntityPreviewDialog (view location)
- Right-click = Edit/delete marker or area
- Drag markers to reposition
- Entity name labels under markers (only visible when zoomed in)
- Help badges in top-right corner explaining controls

### Location/Standort System (Migration 26)
Every entity (NPC, Item, Faction, Lore, Player) can have a `location_id` field pointing to a Location entity.
- Entities table has `location_id INTEGER REFERENCES entities(id)`
- `map_areas` table stores circles (location_id, center_x, center_y, radius, color)
- LocationSelectWithMap component allows selecting location + syncing to maps

### Technical Details
```typescript
// Marker positions stored as percentage (0-100) for scalability
interface MapMarker {
  id: number
  map_id: number
  entity_id: number
  x: number  // 0-100%
  y: number  // 0-100%
  custom_label?: string
  notes?: string
  entity_name?: string
  entity_type?: string
}

// Location areas (circles) on maps
interface MapArea {
  id: number
  map_id: number
  location_id: number  // Must be a Location entity
  center_x: number     // 0-100%
  center_y: number     // 0-100%
  radius: number       // Percentage of map width
  color: string | null
  location_name?: string
}

// Leaflet with CRS.Simple (no geographic projection)
// IMPORTANT: Dynamic import to avoid SSR "window is not defined" errors
onMounted(async () => {
  const leaflet = await import('leaflet')
  L = leaflet.default || leaflet
})
```

### Files
- `server/utils/migrations.ts` - Migrations 25 + 26
- `types/map.ts` - TypeScript types (CampaignMap, MapMarker, MapArea)
- `server/api/maps/` - CRUD routes for maps, markers, areas
- `app/pages/maps/index.vue` - Maps page with viewer
- `app/components/maps/MapViewer.vue` - Leaflet component with markers + circles
- `app/components/maps/MapMarkerEditDialog.vue` - Marker dialog
- `app/components/maps/MapAreaEditDialog.vue` - Area (circle) dialog
- `app/components/shared/LocationSelectWithMap.vue` - Location selector for entity dialogs

### Location Integration in Entity Dialogs
NPCs (done), Items, Factions, Lore, Players can have a "Current Location" field:
1. Add `LocationSelectWithMap` component to dialog template
2. Add `location_id` to form state
3. Handle `update:mapSync` event for optional map marker creation
4. Update API routes to accept/return `location_id`

### TODO / Ideas for later

**Done:**
- [x] Integrate LocationSelectWithMap in remaining entity dialogs (Items, Factions, Lore, Players)
- [x] Filter markers by entity type in header
- [x] Map editing dialog (rename, change image)
- [x] Measurement Tool (multi-point, configurable scale)

**Maps - Next Up:**
- [ ] **Entity Location History** - Track where entities have been over time
  - Applies to ALL entity types (NPCs, Items, Factions, Lore, Players)
  - New table: `entity_location_history` (entity_id, location_id, map_id, x, y, timestamp, notes?)
  - Log when: marker moved, location_id changed, marker created/deleted
  - Display: Timeline per entity, optional path visualization on map
  - Use cases: "Where was this NPC?", "Track item's journey", "Faction territory changes"
- [ ] Map versions (parent_map_id for "Before/After" variants)
- [ ] Automatic location hierarchy (entity at location → appears in all areas showing that location)

**Maps - Future Ideas:**
- [ ] Marker-Clustering (group nearby markers until zoom in)
- [ ] Fog of War (hide/reveal areas for players)
- [ ] Layer-System (toggle NPCs, Items, Dangers - persistent)
- [ ] Mini-Map (small overview in corner)
- [ ] Map sharing/export (export as image or share link for players)
- [ ] Path drawing (draw travel routes)
- [ ] Freitext-Notizen (notes on map not tied to entity)
- [ ] Marker-Suche (search markers on large maps)
- [ ] Zoom to fit (button to show all markers)
- [ ] Marker-Liste (sidebar with all markers, click to jump)

---

---

## AI Features

### DALL-E Image Generation (generate-image.post.ts)

**Architecture**: GPT-4 optimizes user prompt → DALL-E 3 generates image

**Entity-specific prompts**:
- Each entity type (NPC, Location, Item, Faction, Player, Session) has tailored system prompts
- Structured entity data (race, class, type, etc.) enriches the prompt
- Anti-3D/CGI instructions for realistic style

**Session covers**:
- 16:9 format (1792x1024) for cinematic look
- Safety-filter-friendly rephrasing: GPT-4 transforms "battle" → "epic confrontation"
- Custom description field for user control

**Styles**: realistic (default), fantasy-art, sketch, oil-painting

---

## Roadmap

### Current: Beta (1.0.0-beta.1)

**What's in Beta:**
- Calendar Weather System (weather per day, season-based generation)
- Expanded Entity Icons (48 location types, 40 item types)
- Type-specific icons in global search, entity previews, relation lists

**Remaining for Stable 1.0:**
- [ ] #102 - Quick-Entity-Create beim Verlinken (optional, nice-to-have)
- [ ] #67 - Refactor event patterns (technical debt)
- [ ] #111 - Better version management tool (replace Changesets) **PRIORITY**

**Stable 1.0 criteria:**
- Feature-complete
- No critical bugs
- Stable, polished UX

---

**App Version**: 1.0.0-beta.1
**Landing Version**: 1.0.0-beta.1
**Last Updated**: 2025-12-07
