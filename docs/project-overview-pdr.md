# Guitar Chord Generator — Project Overview & PDR

## Executive Summary

Guitar Chord Generator is a lightweight, offline web app that transforms song lyrics containing chord notation into rendered guitar fingering diagrams. Target users are guitarists learning songs, arranging new material, or preparing charts for performance.

**Problem Solved:** Manual chord lookup + transcription → Takes minutes per song. Automated extraction + visualization = seconds per song.

**Market:** Musicians, songwriters, teachers (especially in Vietnam, where the app originated for Vietnamese song collections)

**Current Status:** MVP complete. Core features shipped. Actively accepting new chord contributions via CLI and GitHub Actions.

---

## Product Definition

### Target Users

1. **Casual Guitarists** — Learning songs, need quick chord diagrams without googling each one
2. **Songwriters/Arrangers** — Need visual chord charts while composing or transposing
3. **Music Teachers** — Preparing chord sheets for students
4. **Performance Musicians** — Generating on-the-fly chord references during rehearsal

### User Workflows

#### Workflow 1: Learn a Song
1. Find lyrics online or from memory
2. Paste into app with `[Chord]` notation
3. See diagrams instantly → practice fingerings
4. Print or export PNG for physical notes

#### Workflow 2: Transpose & Arrange
1. Paste original lyrics + chords
2. Copy output, modify chords for new key
3. Re-paste with new chords → see diagrams update
4. Export arranged version

#### Workflow 3: Build Custom Chord Library
1. Discover new chord voicings while playing
2. Add to database via CLI or GitHub Actions
3. All future charts benefit from expanded library

### Product Goals

| Goal | Status | Metric |
|------|--------|--------|
| **Core:** Parse & render standard chord notation | Shipped | 100+ chords, all common voicings |
| **Accessibility:** No login, offline-capable, fast load | Shipped | <2s load time, works offline |
| **Export:** PNG download + print support | Shipped | html-to-image integration, @media print |
| **Extensibility:** Community chord contributions | Shipped | GitHub Actions workflow, CLI scripts |
| **Polish:** Multiple design variants for different use cases | Shipped | Editorial, Paper, Mono styles |

### Success Metrics

#### Current (MVP Phase)
- **Zero friction:** No signup, no login, no watermarks
- **Fast:** App loads in <2s, renders in <500ms
- **Complete:** All common chords available (C–B, maj/min/7/sus/dim/aug variants)
- **Reliable:** No bugs in chord lookup, rendering, or export

#### Future (Growth Phase, if pursued)
- **User feedback:** Community requests tracked via GitHub Issues
- **Chord coverage:** New voicings contributed by users
- **Adoption:** Used by students, teachers, gigging musicians

---

## Scope & Architecture

### What It Does

1. **Parse Lyrics** — Regex extracts `[ChordName]` tokens from plain text
2. **Lookup Chords** — Returns matching voicing with fret + finger positions
3. **Render SVG** — Draws 6-string fretboard with visual markers
4. **Persist State** — Saves lyrics + voicing choices to localStorage
5. **Export** — PNG via html-to-image, or print via CSS @media print
6. **Manage Data** — Build scripts + CLI to add/update chords

### What It Doesn't Do (By Design)

- **Authentication** — No accounts, no login
- **Sync across devices** — localStorage only (local state)
- **Real-time collaboration** — Single-player app
- **Tab notation** — Chord diagrams only (no full tab)
- **MIDI/audio** — Chord diagrams, not playback
- **Mobile-first UI** — Desktop-optimized (though responsive)

### Tech Stack & Justification

| Component | Choice | Why |
|-----------|--------|-----|
| **Frontend Framework** | React 18 (CDN) | No build step, instant iteration, CDN reliable |
| **JSX Transpilation** | Babel standalone | Browser-side transpilation, minimal server |
| **Data Pipeline** | JSON → JS build | Source control for chords, generated runtime database |
| **Styling** | CSS-in-JS | Inline styles, no external CSS file, fast load |
| **Export** | html-to-image | Pure JS, no backend, PNG in-browser |
| **Hosting** | Cloudflare Workers Assets | Zero-config, Git-connected, auto-deploy |
| **Task Runner** | Justfile | Lightweight, human-readable, cross-platform |

### Non-Goals

- **Performance optimization beyond MVP** — Currently sufficient (fast enough for target users)
- **Mobile app** — Web-first (responsive but not native)
- **Monetization** — Open-source, ad-free
- **Social features** — Solo user experience
- **Internationalization** — English UI (chord notation universal)

---

## Functional Requirements

### FR-1: Chord Parsing
- **Extract chord tokens** from lyrics text using regex pattern `[ChordName]`
- **Support formats:** A–G, sharps (C#), flats (Db), suffixes (m, maj, min, 7, sus, dim, aug, add9, etc.)
- **Deduplication:** Show each unique chord only once
- **Case-insensitive lookup:** "cm" and "Cm" resolve to same chord

### FR-2: Chord Lookup
- **Exact match:** C → matches "C" exactly
- **Alias fallback:** Dm7 → tries "Dm7", then "Dm", then "D"
- **Root fallback:** C#m7 → tries root + quality progression
- **Fallback message:** If chord not found, display "Chord not found; add via CLI"

### FR-3: SVG Rendering
- **Fretboard:** 6 strings, configurable fret range (typically 0–12)
- **String labels:** E A D G B e (left margin)
- **Fret markers:** Numbers on each played fret
- **Finger numbers:** 1–4 (or none for open/muted)
- **Open strings:** Circle above fret 0
- **Muted strings:** X above fretboard
- **Barre chords:** Highlight when 3+ fingers on same fret

### FR-4: Voicing Selection
- **Multiple voicings per chord** (e.g., C has 3 voicings)
- **Cycle with ‹ › buttons** — navigate through options
- **Auto-label:** "open", "barre 5fr", "2fr", etc.
- **Visual feedback:** Highlight current voicing

### FR-5: Design Variants
- **Editorial:** Clean, minimal, monospace labels (default)
- **Paper:** Vintage serif aesthetic, resembles printed sheet music
- **Mono:** Monospace, terminal-friendly, high contrast
- **Selector:** Dropdown in toolbar

### FR-6: Export & Print
- **PNG copy-to-clipboard:** Click "Copy" → image in clipboard
- **PNG download:** Fallback "Download" button
- **Print stylesheet:** A4 page size, hide UI, optimize margins
- **Keyboard shortcut:** Cmd+P for native print dialog

### FR-7: Data Persistence
- **Save lyrics:** localStorage key `lyrics`
- **Save title:** localStorage key `title`
- **Save artist/subtitle:** localStorage key `meta`
- **Save voicing state:** localStorage per chord (current voicing index)

### FR-8: Chord Management
- **Add new chord:** CLI `node scripts/chord-add.js chord "Name" "frets" "fingers"`
- **Add voicing:** CLI `node scripts/chord-add.js voicing "Name" "frets" "fingers"`
- **List chords:** CLI `node scripts/chord-add.js list` → stdout
- **Validation:** Frets must be 6 values (0–24 or null), fingers must be 0–4
- **Rebuild:** Auto-run `chord-build.js` after each addition

---

## Non-Functional Requirements

### NFR-1: Performance
- **Load time:** <2 seconds to interactive
- **Chord lookup:** <50ms (in-memory lookup)
- **Render:** <500ms for full chart with 20 chords
- **Voicing cycle:** Instant (<100ms)

### NFR-2: Compatibility
- **Browsers:** Chrome/Edge 90+, Firefox 88+, Safari 14+, mobile browsers
- **Devices:** Desktop, tablet, mobile (responsive but desktop-optimized)
- **No dependencies:** React + Babel from CDN, no npm install for users

### NFR-3: Maintainability
- **Code clarity:** Self-documenting JSX, minimal external packages
- **Separation of concerns:** Input component, rendering component, data access
- **Comment coverage:** Complex logic (chord lookup, SVG paths) documented
- **Script reusability:** Build scripts testable, modular functions

### NFR-4: Data Integrity
- **Chord format validation:** Frets array must be length 6, all values 0–24 or null
- **No silent failures:** Invalid chords logged + message shown to user
- **Version control:** chord-data.json under Git (source of truth)

### NFR-5: Accessibility
- **Keyboard navigation:** Tab through controls, chord list keyboard-navigable
- **Color contrast:** Diagrams readable in light + dark backgrounds (variants help)
- **Semantic HTML:** Labels tied to inputs, buttons clearly labeled
- **Not yet full WCAG 2.1 AA** (noted for future improvement)

---

## Architecture Overview

```
User Input (Lyrics)
    ↓
[Parse] — Extract [ChordName] tokens via regex
    ↓
[Lookup] — Match chord name to voicings (exact → alias → root fallback)
    ↓
[Render] — SVG diagram per chord (selected voicing)
    ↓
[Display] — React components render to DOM
    ↓
[Export] — html-to-image (PNG) or CSS @media print
```

### Component Hierarchy

```
<App>
  ├─ <LyricsInput />           # Left panel: textarea, title, artist
  ├─ <ChordSheet />            # Right panel: parsed chords + diagrams
  │  ├─ <ChordDiagram />       # SVG for one chord
  │  └─ <VariantSelector />    # Variant dropdown + export buttons
  └─ <DesignVariant />         # Editorial | Paper | Mono renderer
```

### Data Flow

1. **User types lyrics** → `app.jsx` state updates
2. **Regex parses chords** → list of unique chord names
3. **Loop through chords** → call `window.ChordData.lookupChord(name)`
4. **Return voicing object** → pass to `<ChordDiagram />`
5. **SVG renders** → <ChordDiagram /> generates `<svg>` element
6. **Variant applied** → CSS + styling from `variants.jsx`
7. **Export triggered** → html-to-image or print
8. **State saved** → localStorage for persistence

---

## Development Phases (Completed)

### Phase 1: Data Migration & Build Pipeline ✓
- Migrated chord-data.js → chord-data.json
- Built `chord-build.js` to generate runtime JS from JSON
- Created gitignore rule for generated files

### Phase 2: CLI Scripts ✓
- Created `chord-add.js` for adding/editing chords
- Validation for frets + fingers arrays
- Auto-derive labels ("open", "barre 5fr", etc.)
- Auto-rebuild after each command

### Phase 3: Task Automation ✓
- Created Justfile with shortcuts (add-chord, add-voicing, list-chords, build, dev)
- Created GitHub Actions workflow for UI-based chord additions
- Workflow auto-commits + triggers Cloudflare deploy

---

## Roadmap & Future Considerations

### Current Backlog (Not Planned)

**If pursuing growth phase:**
- **Chord extensions:** More esoteric voicings (jazz extensions, alternate tunings)
- **Transposition UI:** Built-in transposition tool (not just copy-paste)
- **Song database:** Curated list of songs with pre-parsed chords
- **User accounts:** Save favorites, collaborate (breaks offline-first design)
- **Accessibility improvements:** Full WCAG 2.1 AA compliance
- **Mobile optimization:** Touch-friendly voicing selector, larger diagrams
- **Offline mode:** Service Worker for true offline use
- **Tab viewer:** Companion for full tablature (separate feature)

### Known Limitations

- **No iOS app** — Web-only (can be added later with React Native)
- **Print layout** — A4 only (not A3, poster sizes)
- **Tuning** — Standard tuning only (not open tunings, drop-D, etc.)
- **Accessibility** — Not yet WCAG 2.1 AA (basic support only)
- **Mobile UI** — Designed for desktop (not mobile-first)

---

## Success Criteria for MVP

✓ All features listed in FR-1 through FR-8 working correctly
✓ All chords in scope parsing + rendering without errors
✓ Export (PNG + print) working across browsers
✓ Persistence (localStorage) functional
✓ No critical performance regressions
✓ Documentation complete (README, code comments)

---

## Version History

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 0.1.0 | 2026-04-23 | Shipped | MVP: core parsing, rendering, export, chord management |

---

## Contacts & Ownership

- **Product Owner:** Gerard Nguyen (gerard@replicated.com)
- **Lead Developer:** Gerard Nguyen
- **Repository:** github.com/[org]/chord-generator
- **Deploy:** Cloudflare Workers Assets (auto-deploy on push to main)
