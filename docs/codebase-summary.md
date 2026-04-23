# Guitar Chord Generator — Codebase Summary

## Project Overview

A lightweight, offline web app that parses guitar chord notation from song lyrics and renders SVG fingering diagrams. Works with any standard chord notation—designed initially for Vietnamese songs but universal.

- **Tech Stack:** React 18 (CDN), Babel standalone (browser JSX transpilation), Node.js build scripts, Cloudflare Workers Assets
- **No bundler:** All JS loaded via CDN, transpiled at runtime
- **Data-driven:** Single JSON source of truth, generated JavaScript runtime database
- **CLI tooling:** Add/edit chords via command line or GitHub Actions

---

## Repository Structure

```
.
├── index.html                 # Entry point: loads React, Babel, html-to-image from CDN
├── app.jsx                    # Main app (271 LOC): LyricsInput + ChordSheet components
├── chord-diagram.jsx          # SVG chord diagram (281 LOC): renders 6-string fretboard
├── variants.jsx               # Variant renderers (236 LOC): Editorial, Paper, Mono styles
├── chord-data.json            # SOURCE OF TRUTH: chord voicings in JSON format (~300 LOC)
├── chord-data.js              # GENERATED: runtime database (gitignored, ~300 LOC)
├── scripts/
│   ├── chord-build.js         # Build: generates chord-data.js from JSON (121 LOC)
│   └── chord-add.js           # CLI: add/edit chords, rebuild (101 LOC)
├── Justfile                   # Task runner: shortcuts for common commands
├── package.json               # npm metadata + scripts
├── .github/workflows/         # GitHub Actions: chord addition workflow
├── .gitignore                 # Excludes generated files, node_modules
├── .repomixignore             # Repomix packing rules
├── CLAUDE.md                  # Claude Code project instructions
└── docs/                      # Documentation directory
    ├── project-overview-pdr.md
    ├── codebase-summary.md
    ├── code-standards.md
    ├── system-architecture.md
    └── project-roadmap.md
```

---

## Key Files & Their Role

### Frontend (JSX)

| File | LOC | Responsibility |
|------|-----|-----------------|
| **index.html** | 48 | CDN script loading, app root, print stylesheet |
| **app.jsx** | 271 | Main React app: input panel, chord sheet layout, state mgmt |
| **chord-diagram.jsx** | 281 | SVG rendering: fretboard, frets, fingers, open/muted markers |
| **variants.jsx** | 236 | Three design systems (Editorial, Paper, Mono) |

### Data & Build

| File | LOC | Responsibility |
|------|-----|-----------------|
| **chord-data.json** | ~300 | Single source of truth: all chord voicings |
| **chord-data.js** | ~300 | Generated: runtime chord lookup database |
| **scripts/chord-build.js** | 121 | Generates chord-data.js from JSON + adds utility functions |
| **scripts/chord-add.js** | 101 | CLI: adds/edits chords in JSON, auto-rebuilds |

### Configuration

| File | Purpose |
|------|---------|
| **Justfile** | Human-readable task runner (Rust-inspired) |
| **package.json** | npm metadata, scripts, version |
| **.gitignore** | Excludes chord-data.js, node_modules |
| **.github/workflows/*** | GitHub Actions for chord addition workflow |

---

## Data Pipeline

```
User edits chord-data.json
           ↓
npm run build  (or: just build)
           ↓
scripts/chord-build.js reads JSON
           ↓
Generates chord-data.js:
  - Utility functions (noteAt, v, autoLabel)
  - CHORDS object (all voicings)
  - Exports window.ChordData
           ↓
Browser loads chord-data.js
           ↓
App calls window.ChordData.lookupChord(name)
           ↓
Returns voicing { frets, fingers, notes, label }
           ↓
ChordDiagram renders SVG
```

**Critical:** `chord-data.js` is gitignored. Always run `npm run build` after:
- Pulling new changes
- Adding chords locally
- Before deployment

---

## Component Architecture

### React Component Tree

```
<App>                            # Main app state (lyrics, title, voicing indices)
├─ <LyricsInput />               # Left panel: lyrics textarea, title/artist inputs
└─ <ChordSheet />                # Right panel: parsed chords + diagrams
   ├─ ChordItem (loop)           # For each unique chord:
   │  ├─ Voicing selector (‹ ›)  # Cycle through voicings
   │  └─ <ChordDiagram />        # SVG diagram
   │     └─ <VariantRenderer />  # Editorial/Paper/Mono styling
   ├─ Variant selector (dropdown)
   └─ Export buttons (Copy PNG, Download, Print)
```

### State Management

**App-level state (React.useState):**
- `lyrics` — textarea content (persisted to localStorage)
- `title` — song title (persisted)
- `meta` — artist/subtitle (persisted)
- `voicingIndices` — per-chord voicing selection (persisted)
- `selectedVariant` — Editorial | Paper | Mono (persisted)

**No Redux/Context** — state tree simple enough for useState.

---

## Key Algorithms

### 1. Chord Parsing

**File:** `app.jsx` (regex parsing)

```javascript
const re = /\[\s*([A-G][#b]?(?:m|maj|min|sus|dim|aug|add)?(?:\d+)?(?:\/[A-G][#b]?)?)\s*\]/g;
const matches = [...text.matchAll(re)];
// Deduplicate and extract unique chord names
```

**Pattern:** Matches `[C]`, `[C#m7]`, `[Dm/G]`, etc. Deduplicates, preserves order.

### 2. Chord Lookup

**File:** `scripts/chord-build.js` (footergenerated in chord-data.js)

```javascript
function lookupChord(name) {
  // 1. Exact match: CHORDS[name]
  // 2. Alias fallback: min → m, /bass → ""
  // 3. Root fallback: C#m7 → C#m → C#
  // Returns { name, voicings, exact: bool }
}
```

**Fallback chain handles** user typing variations + incomplete chords.

### 3. SVG Rendering

**File:** `chord-diagram.jsx`

Renders fretboard:
1. **Frame:** 6 strings (vertical lines), frets (horizontal lines)
2. **Open strings:** Circle (⭕) above nut if fret=0
3. **Muted strings:** X (✕) above nut if fret=null
4. **Played frets:** Finger number in circle at (string, fret)
5. **Barre:** Horizontal line across fingers on same fret (if 3+ fingers)
6. **Labels:** Fret numbers (left), string letters (bottom)

**SVG paths** hand-coded for precision, styled per variant.

### 4. Note Calculation

**File:** `scripts/chord-build.js`

```javascript
const OPEN_NOTES = ['E', 'A', 'D', 'G', 'B', 'E'];
const CHROMATIC = ['C', 'C#', 'D', ... 'B'];

function noteAt(stringIdx, fret) {
  // stringIdx: 0-5 (low E to high e)
  // Returns note name (e.g., "G#" at fret 4 of low E string)
}
```

Used by variant renderers to display note names on diagrams.

---

## Dev Workflow

### Initial Setup

```bash
cd chord-generator
npm run build        # Generate chord-data.js from JSON
npm run dev          # Start server at localhost:3000
```

### Adding a Chord

```bash
just add-chord "Gmaj7" "null,10,9,11,10,10" "0,1,2,3,1,1"
# or
node scripts/chord-add.js chord "Gmaj7" "null,10,9,11,10,10" "0,1,3,1,1"

# Auto-rebuilds chord-data.js
```

### Editing React Components

Edit `.jsx` files directly → Babel transpiles at runtime → refresh browser.

### Deploying

Push to `main` branch. Cloudflare Workers Assets:
1. Pulls latest code
2. Runs `npm run build`
3. Serves project root as static assets

---

## External Dependencies

### Runtime (CDN)

| Package | Version | Purpose |
|---------|---------|---------|
| **React** | 18.3.1 | UI framework |
| **ReactDOM** | 18.3.1 | DOM rendering |
| **Babel** | 7.29.0 | JSX transpilation |
| **html-to-image** | 1.11.11 | PNG export |
| **Google Fonts** | - | Typography (Fraunces, Inter, JetBrains Mono, EB Garamond, Courier Prime) |

### Development (Node.js)

| Package | Version | Purpose |
|---------|---------|---------|
| **Node.js** | 18+ | Runtime for build scripts |
| **serve** | Latest | Local dev server (`npx serve`) |

**No npm dependencies** — build scripts use only Node built-ins (fs, path, child_process).

---

## Performance Characteristics

| Metric | Current | Target |
|--------|---------|--------|
| Load time | <2s | <2s ✓ |
| Parse (100 chords) | <50ms | <100ms ✓ |
| Render (20 chords) | <500ms | <1s ✓ |
| SVG file size | ~50KB | <100KB ✓ |
| Memory (app state) | <1MB | <5MB ✓ |

Optimization strategy:
- Minimize DOM nodes (reuse SVG elements)
- Cache voicing lookups per chord
- Use CSS transforms for variant switching (GPU accelerated)

---

## Testing Strategy

**Current:** Manual testing only (no test suite)

**Test scenarios** (manual checklist):
- Parse lyrics with 10+ chords, verify all extracted
- Lookup unknown chord, verify fallback message
- Cycle voicings, verify diagram updates
- Print & export PNG, verify rendering
- localStorage persistence across page reload
- Cross-browser: Chrome, Firefox, Safari, mobile

**Future improvement:** Add Vitest/Jest unit tests for:
- Chord lookup algorithm
- Note calculation (noteAt function)
- SVG path generation

---

## Known Issues & Limitations

| Issue | Severity | Workaround | Future |
|-------|----------|-----------|--------|
| No WCAG 2.1 AA compliance | Low | Manual font size adjustment | Planned |
| Print layout only A4 | Low | Manual page setup | Backlog |
| Standard tuning only | Medium | Users suggest alternate voicings | Backlog |
| No mobile-optimized UI | Medium | Works on mobile (desktop-optimized) | Post-MVP |
| No transposition tool | Medium | Copy/paste + manual chord edit | Post-MVP |

---

## Code Quality Standards

See `./docs/code-standards.md` for:
- File naming conventions (kebab-case for scripts, PascalCase for JSX components)
- JSX patterns (functional components, hooks)
- Comment coverage (complex logic)
- Error handling (try/catch, validation)

---

## Resources & References

- **README.md** — User-facing quick start
- **docs/project-overview-pdr.md** — Product definition & roadmap
- **docs/system-architecture.md** — Deep dive: rendering pipeline, data flow
- **docs/code-standards.md** — Coding conventions
- **CLAUDE.md** — Claude Code project instructions
