# Guitar Chord Generator

A fast, offline web app that parses guitar chord notation from song lyrics and renders SVG fingering diagrams. Works with any standard guitar chord notation—designed for Vietnamese songs but universal.

**Live demo:** Deployed to Cloudflare Workers Assets (auto-deploy on push to `main`)

## Features

- **Chord Parsing** — Extracts `[ChordName]` from lyrics automatically
- **SVG Diagrams** — Renders accurate fingering patterns with fret numbers, finger positions, open/muted strings
- **Multiple Voicings** — Cycle through alternate fingerings per chord
- **Design Variants** — Editorial (clean), Paper (vintage), Mono (terminal) styles
- **Export** — Copy PNG to clipboard or download as image
- **Print** — A4 print stylesheet for paper output
- **Persistence** — Saves lyrics, title, and voicing state to localStorage

## Quick Start

### 1. Prerequisites
- Node.js 18+ (or just use `npx serve` if Node is installed)
- A browser (Chrome, Firefox, Safari, Edge)

### 2. Install & Run

```bash
# Clone or cd to project
cd chord-generator

# Install dependencies
npm install

# Start dev server on localhost:5173 (with HMR)
npm run dev
```

Then open http://localhost:5173 in your browser.

### 3. Use the App

1. Paste song lyrics with chords in square brackets into the left panel:
   ```
   [A] Verse one lyrics here
   [D] More lyrics [A] mid-line
   [E] Final line
   ```

2. Add song title and artist (optional)

3. Click chord names on the right to see fingering diagrams

4. Use ‹ › buttons to cycle voicings (alternate fingerings)

5. Select design variant (Editorial / Paper / Mono) from dropdown

6. Export PNG or print (Cmd+P)

## Adding Chords

### Via CLI (local)

```bash
# Add a brand-new chord
just add-chord "C#m7" "null,4,3,3,2,null" "0,1,3,1,2,0"

# Add an alternate voicing to an existing chord
just add-voicing "Dm7" "null,5,7,5,6,5" "0,1,3,1,2,1"

# List all known chords
just list-chords
```

**Frets format:** 6 comma-separated values (low E → high e string order)
- `0` = open string
- `null` = muted (not played)
- `1–24` = fret number

**Fingers format:** 6 values (matching frets)
- `0` = open or muted
- `1–4` = finger number (1=index, 4=pinky)

### Via GitHub Actions (no local setup needed)

Push to the repo → GitHub Actions UI → "Add Chord" workflow → Enter chord name, frets, fingers → Auto-builds and commits.

## Deployment

Deployed to **Cloudflare Workers Assets** (Git-connected).

1. Every push to `main` triggers auto-deploy on CF (runs `npm run build`)
2. Built assets in `dist/` served as static assets
3. Cloudflare must have build command configured: `npm run build`

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 (npm dependency) |
| **Build Tool** | Vite (dev server + build) |
| **JSX** | @vitejs/plugin-react (transpiled at build time) |
| **Styles** | CSS-in-JS (inline + `@media print`) |
| **Fonts** | Google Fonts (Fraunces, Inter, JetBrains Mono, EB Garamond, Courier Prime) |
| **Export** | html-to-image (PNG copy-to-clipboard) |
| **Data** | chord-data.json (bundled as JSON import) |
| **Scripts** | Node.js (add chords utility) |
| **Task Runner** | Justfile |
| **Hosting** | Cloudflare Workers Assets |
| **CI/CD** | GitHub Actions |

## File Structure

```
.
├── index.html                 # Entry point + print stylesheet
├── vite.config.js             # Vite configuration
├── chord-data.json            # Source of truth: all chord voicings
├── src/
│   ├── app.jsx                # Main React app (LyricsInput + ChordSheet)
│   ├── chord-utils.js         # Chord data parser + lookup (imports chord-data.json)
│   └── components/
│       ├── chord-diagram.jsx  # SVG chord diagram component (3 variants × 3 sizes)
│       └── variants.jsx       # Design variant renderers (Editorial, Paper, Mono)
├── scripts/
│   └── chord-add.js           # CLI: add/edit chords
├── Justfile                   # Task runner shortcuts
├── package.json               # npm scripts + dependencies
├── wrangler.jsonc             # Cloudflare Workers configuration
└── docs/                      # Documentation
```

## Development

### Key Concepts

- **Chord Data Pipeline:** `chord-data.json` bundled at build time (JSON import) by `src/chord-utils.js`
- **Vite Build:** Fast module bundling with hot reload (HMR) during dev
- **Voicing:** Each chord has 1+ fingering patterns (e.g., C major has 3 voicings)
- **Lookup:** Chord name lookup includes exact match, alias fallback (`min` → `m`), root fallback (`C#m7` → `C#m` → `C#`)

### Modifying the App

1. Edit `.jsx` files in `src/` directly (Vite HMR reloads automatically)
2. Edit `chord-data.json` to add chords (rebuild required: `npm run build`)
3. Changes auto-refresh in browser via Vite's hot reload

### Available npm Scripts

```bash
npm run dev      # Start Vite dev server (HMR on localhost:5173)
npm run build    # Build production bundle to dist/
npm run preview  # Preview production build locally
npm run deploy   # Build + deploy to Cloudflare Workers
```

Or use Justfile shortcuts:
```bash
just dev             # Dev server
just add-chord ...   # Add new chord
just add-voicing ... # Add voicing to existing chord
just list-chords     # List all chord names
```

## Troubleshooting

**"Chord not found" error:**
- Check chord name spelling (e.g., `C#m` not `Csm`)
- Add the chord with `just add-chord` or GitHub Actions
- Some chords have aliases (e.g., `Dm7` ↔ `D-7`)

**Export/print looks wrong:**
- Adjust zoom in browser if needed
- Try a different variant (Paper or Mono for print)
- Ensure fonts loaded (check Network tab in DevTools)

**Changes not appearing:**
- Hard-refresh browser (Cmd+Shift+R or Ctrl+Shift+F5)
- Rebuild after JSON changes: `npm run build`

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## License

MIT

## Questions?

See `./docs/` for architecture, code standards, and detailed development guides.
