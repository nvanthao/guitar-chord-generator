# Guitar Chord Generator — System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User's Web Browser                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React App (18.3.1 via CDN)                            │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  ┌─────────────────┐        ┌────────────────────────┐ │ │
│  │  │  LyricsInput    │        │    ChordSheet          │ │ │
│  │  │                 │        │                        │ │ │
│  │  │ - Textarea      │        │ - Parsed chords list  │ │ │
│  │  │ - Title input   │        │ - ChordDiagram (SVG) │ │ │
│  │  │ - Artist input  │        │ - Variant selector   │ │ │
│  │  └─────────────────┘        │ - Export buttons     │ │ │
│  │           │                 └────────────────────────┘ │ │
│  │           │ onChange              │ useEffect        │ │
│  │           │                       │ → parseChords   │ │
│  │           └───────┬───────────────┘                 │ │
│  │                   │                                 │ │
│  │         ┌─────────▼──────────┐                      │ │
│  │         │  App State (React  │                      │ │
│  │         │  useState)         │                      │ │
│  │         │                    │                      │ │
│  │         │ lyrics             │                      │ │
│  │         │ title              │ ◄─────────┐          │ │
│  │         │ meta               │           │          │ │
│  │         │ voicingIndices     │        ┌──┴──────┐   │ │
│  │         │ selectedVariant    │        │          │   │ │
│  │         └────────────────────┘        │          │   │ │
│  │                   │                   │          │   │ │
│  │                   │                   │          │   │ │
│  │                   │                   │      useEffect│ │
│  │                   │                   │   (save to   │ │
│  │                   │                   │  localStorage)│ │
│  │                   └───────────────────┴──────────────┘ │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  window.ChordData                                │  │ │
│  │  │                                                   │  │ │
│  │  │  CHORDS = {                                      │  │ │
│  │  │    "C": [voicing1, voicing2, voicing3],         │  │ │
│  │  │    "D": [voicing1, voicing2],                   │  │ │
│  │  │    ...                                           │  │ │
│  │  │  }                                               │  │ │
│  │  │                                                   │  │ │
│  │  │  function parseChords(text) { ... }            │  │ │
│  │  │  function lookupChord(name) { ... }            │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  External Libraries (npm dependencies + CDN)            │ │
│  │  - React 19 (bundled)                                   │ │
│  │  - html-to-image (bundled)                              │ │
│  │  - Google Fonts (via CDN)                               │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘

Data source at build time:
chord-data.json → Vite bundler → dist/chord-data bundled in app
```

---

## Component Architecture

### React Component Tree

```
<App>
├─ State (lyrics, title, meta, voicingIndices, selectedVariant)
│
├─ useEffect (load from localStorage on mount)
├─ useEffect (save to localStorage on state change)
│
├─ <LyricsInput />
│  ├─ Props: value, onChange, title, onTitle, meta, onMeta
│  └─ Children: textarea, title input, artist input
│
└─ <ChordSheet />
   ├─ useMemo: parseChords(lyrics) → lookupChord for each → render
   │
   ├─ For each unique chord:
   │  │
   │  └─ <ChordItem key={chordName}>
   │     ├─ Voicing selector (‹ › buttons)
   │     │  └─ onClick: setVoicingIndices({ ...prev, [chordName]: newIdx })
   │     │
   │     └─ <ChordDiagram chord={voicing} variant={selectedVariant} size="md">
   │        ├─ Renders <svg> fretboard
   │        └─ Styled by <VariantRenderer> (Editorial/Paper/Mono)
   │
   ├─ Variant selector (dropdown)
   │  └─ onChange: setSelectedVariant("Editorial" | "Paper" | "Mono")
   │
   └─ Export buttons
      ├─ Copy PNG: html-to-image → clipboard
      └─ Download PNG: html-to-image → file
```

---

## Data Structures

### 1. Voicing Object

Each chord has one or more voicings (fingering patterns):

```javascript
{
  frets: [0, 3, 2, 0, 1, 0],              // Low E to high e
  fingers: [0, 3, 2, 0, 1, 0],            // 0=open/muted, 1-4=finger
  notes: ['E', 'G', 'B', 'E', 'G', 'E'],  // Computed from frets
  label: "open"                           // Auto-derived label
}
```

### 2. Chord Lookup Result

Returned by `window.ChordData.lookupChord(name)`:

```javascript
{
  name: "C#m7",           // Requested name (as-is from lyrics)
  voicings: [
    { frets: [...], fingers: [...], notes: [...], label: "barre 4fr" },
    { frets: [...], fingers: [...], notes: [...], label: "9fr" },
  ],
  exact: true             // true if exact match, false if fallback
}
```

### 3. App State (React)

```javascript
{
  lyrics: "string",                    // Textarea content
  title: "Song Name",                  // Title input
  meta: "Artist Name",                 // Artist/subtitle input
  voicingIndices: {
    "C": 0,                            // Index into C voicings array
    "Dm7": 1,                          // Index into Dm7 voicings array
    ...
  },
  selectedVariant: "Editorial"         // "Editorial" | "Paper" | "Mono"
}
```

---

## Data Flow

### 1. User Types Lyrics

```
User types in textarea
          ↓
onChange event fired
          ↓
setLyrics(newText)
          ↓
React re-renders with new lyrics
          ↓
useMemo triggers (lyrics changed)
          ↓
parseChords(lyrics) via regex
          ↓
For each unique chord → lookupChord(name)
          ↓
Returns voicing + voicingIndices[chordName]
          ↓
ChordDiagram renders SVG
```

### 2. Chord Lookup Algorithm

**File:** `src/chord-utils.js` (lookupChord function)

```
lookupChord("C#m7")
          │
          ├─ Check exact match in bundled chords data → Found ✓
          │  return { name: "C#m7", voicings: [...], exact: true }
          │
          (if not found, try fallbacks:)
          │
          ├─ Try "min" → "m" substitution: "C#m" → Found ✓
          │  return { name: "C#m7", voicings: chords["C#m"], exact: false }
          │
          ├─ Try remove bass note: "C#m7/G" → "C#m7" → repeat
          │
          └─ Try root fallback: Extract root "C#" → Found ✓
             return { name: "C#m7", voicings: chords["C#"], exact: false }

Result displayed with warning if not exact match
```

### 3. Voicing Selection

```
User clicks ‹ › button
          ↓
handleVoicingChange(direction)
          ↓
Calculate nextIndex = (current + 1) % voicings.length
          ↓
setVoicingIndices({ ...prev, [chordName]: nextIndex })
          ↓
React re-renders ChordDiagram with new voicing
          ↓
SVG updates (frets, fingers change)
```

### 4. State Persistence (localStorage)

**Save (useEffect):**
```
State changes (lyrics, title, meta, voicingIndices, variant)
          ↓
useEffect dependency triggers
          ↓
Save each to localStorage:
  - localStorage.lyrics = lyrics
  - localStorage.title = title
  - localStorage.meta = meta
  - localStorage.voicing_[ChordName] = voicingIndices[ChordName]
  - localStorage.variant = selectedVariant
```

**Load (useEffect on mount):**
```
App component mounts
          ↓
useEffect([], []) called
          ↓
For each localStorage key:
  - lyrics = localStorage.lyrics || ""
  - title = localStorage.title || "Untitled Song"
  - ...
          ↓
setLyrics(lyrics), setTitle(title), ...
          ↓
Component re-renders with restored state
```

---

## Rendering Pipeline

### ChordDiagram SVG Generation

**Input:** voicing object + variant + size

**Process:**

1. **Calculate dimensions**
   ```
   Fretboard width = 6 strings × spacing (80px)
   Fretboard height = num frets × fret spacing (50px)
   ```

2. **Draw fret lines (horizontal)**
   ```
   For each fret 0 to 12:
     drawLine(x1, y, x2, y)  // Fret line
   ```

3. **Draw string lines (vertical)**
   ```
   For each string 0 to 5:
     drawLine(x, y1, x, y2)  // String line
   ```

4. **Draw nuts/nut bar**
   ```
   If any open strings (fret=0):
     drawBar(y=0) across all strings
   ```

5. **Draw open circles (open strings)**
   ```
   For each string with fret=0:
     drawCircle(x, y=-40, r=15) // Above fretboard
   ```

6. **Draw muted X marks**
   ```
   For each string with fret=null:
     drawX(x, y=-40)  // Above fretboard
   ```

7. **Draw finger markers**
   ```
   For each played fret:
     if fingers[i] > 0:
       drawCircle(x, y=fret*50, r=20)
       drawText(fingers[i], x, y)  // Finger number inside circle
   ```

8. **Draw barre lines**
   ```
   If any fret has 3+ fingers with same value:
     drawLine(x1, y, x2, y)  // Horizontal line across strings
   ```

9. **Draw fret numbers (left margin)**
   ```
   For each visible fret:
     drawText(fretNum, x=-30, y)
   ```

10. **Draw string labels (bottom)**
    ```
    For each string:
      drawText(label, x, y=bottom+20)
    ```

11. **Apply variant styling**
    ```
    - Editorial: Clean sans-serif, gray lines
    - Paper: Serif fonts, brown background, vintage look
    - Mono: Monospace, high contrast, ASCII-like
    ```

### SVG Output Structure

```xml
<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg">
  <!-- Barre lines (if any) -->
  <line x1="..." y1="..." x2="..." y2="..." stroke="..." />

  <!-- String lines (vertical) -->
  <line x1="..." y1="..." x2="..." y2="..." stroke="..." />

  <!-- Fret lines (horizontal) -->
  <line x1="..." y1="..." x2="..." y2="..." stroke="..." />

  <!-- Open strings (circles above nut) -->
  <circle cx="..." cy="..." r="15" fill="none" stroke="..." />

  <!-- Muted strings (X above nut) -->
  <text x="..." y="..." font-size="20">✕</text>

  <!-- Finger markers (circles with numbers) -->
  <circle cx="..." cy="..." r="20" fill="..." stroke="..." />
  <text x="..." y="..." font-size="14" text-anchor="middle">1</text>

  <!-- Fret numbers (left margin) -->
  <text x="..." y="..." font-size="12">1</text>
  <text x="..." y="..." font-size="12">2</text>

  <!-- String labels (bottom) -->
  <text x="..." y="..." font-size="12">E</text>
  <text x="..." y="..." font-size="12">A</text>

  <!-- Note names (variant-dependent) -->
  <text x="..." y="..." font-size="10">E</text>
</svg>
```

---

## Variant Rendering System

### Editorial (Default)

- **Font:** Inter (sans-serif)
- **Colors:** Monochrome (grays)
- **Style:** Clean, minimal, modern
- **Use case:** Screen display, web publishing

### Paper

- **Font:** EB Garamond (serif)
- **Colors:** Warm browns, aged paper color
- **Style:** Vintage, sheet-music-like
- **Use case:** Printing, physical sheets, teaching

### Mono

- **Font:** JetBrains Mono (monospace)
- **Colors:** High contrast (black/white)
- **Style:** Terminal-friendly, ASCII aesthetic
- **Use case:** Terminal output, accessibility, retro look

### Variant Selection Flow

```
User selects variant in dropdown
          ↓
setSelectedVariant("Paper")
          ↓
React re-renders all ChordDiagram components
          ↓
Each ChordDiagram checks selectedVariant prop
          ↓
Calls appropriate variant renderer (variantRenderer[variant])
          ↓
Returns styled SVG
          ↓
DOM updated with new styles
```

---

## Export Pipeline

### PNG Export (Copy to Clipboard)

**Using html-to-image library:**

```
User clicks "Copy PNG"
          ↓
onClick handler triggered
          ↓
htmlToImage.toPng(domElement) — converts DOM to canvas → PNG
          ↓
navigator.clipboard.writeText(imageDataUrl)
          ↓
PNG blob stored in clipboard
          ↓
User can Cmd+V to paste in Slack, email, etc.
```

**Fallback (if clipboard API unavailable):**
```
HTML5 download <a> with href="data:image/png;base64,..."
Opens "Save As" dialog
User saves chord chart as PNG file
```

### Print Export

**Using CSS @media print in index.html:**

```css
@media print {
  html, body, #root { height: auto; overflow: visible; }
  [data-noprint] { display: none !important; }  /* Hide buttons, inputs */
  [data-printroot] { /* Main container */ }
  [data-printsheet] { /* Chord chart area */ }
  @page { size: A4; margin: 14mm; }
}
```

**Flow:**
```
User presses Cmd+P
          ↓
Browser opens print dialog
          ↓
@media print CSS applied
          ↓
Chord diagrams render in A4 layout
          ↓
User clicks Print or Save as PDF
```

---

## Build & Deployment Pipeline

### Build Phase (npm run build)

```
Vite bundler starts
          ↓
Processes src/app.jsx entry point
          ↓
Encounters import statement in src/chord-utils.js:
  import chordDataRaw from '../chord-data.json'
          ↓
Vite loads and processes chord-data.json
          ↓
All chord voicings bundled into JavaScript
          ↓
@vitejs/plugin-react transpiles JSX → JavaScript
          ↓
Assets optimized and written to dist/
          ↓
Output ready for deployment
```

### Deploy Phase (Git push to main)

```
Developer pushes to main branch
          ↓
GitHub webhook triggers Cloudflare Workers build
          ↓
CF pulls latest code
          ↓
CF runs: npm run build (Vite builds to dist/)
          ↓
CF serves dist/ as static assets
          ↓
https://chord-generator.example.com is updated
          ↓
Old browser caches cleared (CDN propagation ~1min)
```

---

## Performance Optimizations

### 1. Memoization (React)

```javascript
const chords = useMemo(() => {
  return parseChords(lyrics).map(name => lookupChord(name));
}, [lyrics]);  // Only recalculate if lyrics change
```

**Benefit:** Parsing 100 chords is fast (<50ms), but skipped if lyrics unchanged.

### 2. Efficient SVG Rendering

- **No DOM manipulation:** All SVG generated in one pass
- **SVG for geometry:** Native, GPU-accelerated rendering
- **Ref-based export:** Minimal re-renders during export

### 3. Caching Strategy

- **Bundled assets:** React, html-to-image bundled in dist/ (cached by CF)
- **External CDN:** Google Fonts (cached by browser)
- **Static files:** index.html, JS, CSS (cached by CF with versioning)

### 4. State Batching

React 18 auto-batches state updates (multiple setState calls in one render).

---

## Error Handling

### Chord Not Found

```
lookup("UnknownChord")
          ↓
Check exact match → Not found
          ↓
Try fallbacks (min→m, remove bass, root) → All failed
          ↓
Return { name: "UnknownChord", voicings: null, exact: false }
          ↓
ChordItem renders error message:
  "Chord UnknownChord not found. Add via CLI or suggest a voicing."
          ↓
Display continues (partial chart for known chords)
```

### Invalid Chord Data

```
Build time: scripts/chord-build.js validates:
  - frets array length === 6 ✓
  - All fret values are 0-24 or null ✓
  - fingers array length === 6 ✓
  - All finger values are 0-4 ✓
          ↓
If validation fails:
  console.error("Invalid chord...")
  process.exit(1)
          ↓
Build stops (CI/CD catches error)
```

### Runtime Error Handling

Safely parse and validate:
```javascript
try {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  // Validate structure before use
  if (!data || typeof data !== 'object') {
    throw new Error('Chord data must be an object');
  }
} catch (err) {
  console.error('Failed to load chord data:', err.message);
  process.exit(1);
}
```

---

## Security Considerations

### 1. No Code Injection

- **Input sanitization:** All user text (lyrics, title) treated as plain text
- **No dynamic code execution:** Never execute user input as code
- **SVG safety:** Only rendering geometry, no embedded scripts

### 2. localStorage Safety

- Keys are hardcoded (not derived from user input)
- Values are validated before use
- No sensitive data stored (no passwords, no API keys)

### 3. CORS Policy

App is static (no API calls), so CORS not a concern.

---

## Scalability Notes

### Current Limits (MVP)

- **Chord database:** 100+ chords (in-memory lookup ~1ms)
- **Max lyrics length:** localStorage limit ~5MB (unlikely to hit)
- **Max visible chords:** 50 (rendered in <500ms)

### Future Scaling

If chord database grows to 1000+ chords:
1. **Lazy load variants:** Only load voicings on demand
2. **Virtual rendering:** Use react-window for large chord lists
3. **Service Worker:** Cache chord-data.js for offline access

---

## Technology Rationale

| Choice | Why |
|--------|-----|
| **Vite** | Fast dev server with HMR, optimized production builds, zero-config |
| **React 19** | Modern UI framework, proven ecosystem |
| **@vitejs/plugin-react** | Automatic JSX transpilation, no config needed |
| **Inline styles** | No external CSS, self-contained components |
| **SVG for diagrams** | Vector rendering, GPU accelerated, printable |
| **JSON import** | Type-safe chord data bundling at build time |
| **localStorage** | Simple persistence, no backend needed |
| **Node.js scripts** | Lightweight CLI tooling for chord management |
| **Cloudflare Workers** | Zero-config hosting, Git-connected, auto-deploy |

---

## Resources

- **README.md** — User guide
- **docs/codebase-summary.md** — File structure, algorithms
- **docs/code-standards.md** — Coding conventions
- **docs/project-overview-pdr.md** — Product spec
