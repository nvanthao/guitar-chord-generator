# Guitar Chord Generator — Code Standards

## Overview

This document defines coding conventions, file naming, patterns, and quality standards for the Guitar Chord Generator project.

**Philosophy:** Keep code simple, self-documenting, and maintainable. Prioritize clarity over cleverness.

---

## File Organization

### Naming Conventions

| File Type | Convention | Example | Notes |
|-----------|-----------|---------|-------|
| **JSX components** | PascalCase (kebab-case filename) | chord-diagram.jsx (contains ChordDiagram component) | One component per file (or tightly coupled pair) |
| **Build scripts** | kebab-case.js | chord-build.js, chord-add.js | Executable scripts, Node.js entry points |
| **Documentation** | kebab-case.md | project-overview-pdr.md | Markdown files |
| **Config files** | lowercase or UPPERCASE | Justfile, .gitignore, package.json | Follow standard conventions |

### Directory Structure

```
project-root/
├── index.html               # App entry point (do not split)
├── *.jsx                    # React components (1 per file)
├── chord-data.json          # Source of truth (do not edit manually long-term)
├── chord-data.js            # Generated (gitignored)
├── scripts/                 # Build & CLI tools
│   ├── chord-build.js       # Entry: npm run build
│   └── chord-add.js         # Entry: just add-chord | add-voicing | list
├── .github/workflows/       # GitHub Actions
├── docs/                    # Documentation
└── [other config files]     # Justfile, .gitignore, etc.
```

---

## JSX Component Standards

### 1. Functional Components Only

Use React function components with hooks. No class components.

```javascript
// ✓ Good
function ChordDiagram({ chord, variant, size }) {
  const [hovered, setHovered] = useState(null);
  // ...
  return <svg>...</svg>;
}

// ✗ Bad
class ChordDiagram extends React.Component {
  // ...
}
```

### 2. Hook Usage

- **useState** — Component local state (lyrics, title, voicing indices)
- **useRef** — DOM references (for html-to-image export)
- **useMemo** — Expensive calculations (e.g., parsing all chords once)
- **useEffect** — Side effects (localStorage sync, event listeners)

```javascript
// ✓ Good: memoize parsed chord list
const chords = useMemo(() => {
  return parseChords(lyrics).map(name => lookupChord(name));
}, [lyrics]);
```

### 3. Props & Destructuring

Always destructure props at function signature.

```javascript
// ✓ Good
function ChordDiagram({ chord, variant, size, onVoicingChange }) {
  // ...
}

// ✗ Bad
function ChordDiagram(props) {
  const chord = props.chord;
  // ...
}
```

### 4. Inline Styles (CSS-in-JS)

All styling via inline `style` objects. No external CSS files (except @media print in index.html).

```javascript
// ✓ Good
<div style={{
  padding: '16px 22px',
  fontFamily: '"Fraunces", serif',
  fontSize: 16,
  borderBottom: '1px solid #e5e3dc',
}}>

// ✗ Bad (no external CSS)
<div className="chord-item">
```

**Rationale:** No build step, no CSS-in-JS runtime overhead, self-contained components.

### 5. Key Naming in Objects

Use consistent camelCase for all object keys (including style objects).

```javascript
// ✓ Good
const styles = {
  containerPadding: 16,
  labelFontSize: 10,
  borderColor: '#e5e3dc',
};

// ✗ Bad (inconsistent)
const styles = {
  container_padding: 16,
  'label-font-size': 10,
};
```

### 6. Component Structure

Standard component template:

```javascript
// Imports at top
const { useState, useRef, useMemo } = React;

// Functional component
function MyComponent({ propA, propB }) {
  // 1. State
  const [state, setState] = useState(initialValue);

  // 2. Refs
  const ref = useRef(null);

  // 3. Memoized values
  const computed = useMemo(() => {
    return expensiveCalculation(state);
  }, [state]);

  // 4. Effects
  useEffect(() => {
    // Side effects
  }, [deps]);

  // 5. Event handlers
  const handleClick = () => {
    setState(newValue);
  };

  // 6. Render
  return (
    <div style={{ /* styles */ }}>
      {/* JSX */}
    </div>
  );
}
```

### 7. Conditional Rendering

Use ternary or logical AND, not inline if statements.

```javascript
// ✓ Good
{chord.voicings ? <ChordDiagram chord={chord} /> : <p>Not found</p>}

// ✓ Good (short form)
{isLoading && <Spinner />}

// ✗ Bad (no if statements in JSX)
{(() => { if (loading) return <Spinner />; })()}
```

### 8. Lists & Keys

Always provide unique, stable keys for list items.

```javascript
// ✓ Good
{chords.map((chord, index) => (
  <ChordItem key={chord.name} chord={chord} />
))}

// ✗ Bad (index as key)
{chords.map((chord, index) => (
  <ChordItem key={index} chord={chord} />
))}
```

---

## Data Format Standards

### Chord Data Structure (chord-data.json)

**Source of truth format:**

```json
{
  "ChordName": [
    {
      "frets": [0, 3, 2, 0, 1, 0],
      "fingers": [0, 3, 2, 0, 1, 0]
    },
    {
      "frets": [null, 3, 5, 5, 5, 3],
      "fingers": [0, 1, 3, 4, 4, 1]
    }
  ]
}
```

**Rules:**
- **frets:** Array of 6 values (low E to high e string)
  - `0` = open string (played)
  - `null` = muted (not played)
  - `1–24` = fret number
- **fingers:** Array of 6 values (matching frets)
  - `0` = open or muted (no finger)
  - `1–4` = finger number (1=index, 2=middle, 3=ring, 4=pinky)
- **Chord names:** Follow standard notation (e.g., "C", "C#m7", "Dm/G")

### Runtime Voicing Object (generated in chord-data.js)

```javascript
{
  frets: [0, 3, 2, 0, 1, 0],           // Array of 6 numbers
  fingers: [0, 3, 2, 0, 1, 0],         // Array of 6 numbers
  notes: ['E', 'G', 'B', 'E', 'G', 'E'],  // Computed from frets
  label: 'open'                        // Auto-derived: 'open', 'barre 5fr', '2fr', etc.
}
```

**Auto-label logic** (see scripts/chord-build.js):
- "open" — no fingers or all open strings
- "barre Xfr" — 3+ fingers on same fret X
- "Xfr" — minimum played fret is X
- "open" — default fallback

### State Persistence (localStorage)

```javascript
localStorage.lyrics        // String: textarea content
localStorage.title         // String: song title
localStorage.meta          // String: artist/subtitle
localStorage.voicing_C     // String: "0" (voicing index for chord C)
localStorage.voicing_Dm7   // String: "1" (voicing index for chord Dm7)
// etc.
localStorage.variant       // String: "Editorial" | "Paper" | "Mono"
```

**Key format:** `voicing_` + chord name (URI-safe, no special chars).

---

## Script Standards (Node.js)

### File Structure

All scripts use this structure:

```javascript
'use strict';                              // Enable strict mode
const fs = require('fs');                 // Core modules first
const path = require('path');
const { execFileSync } = require('child_process');

// Constants
const DATA_PATH = path.join(__dirname, '..', 'chord-data.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'chord-data.js');

// Helper functions
function parseChordName(str) {
  // ...
  return normalized;
}

// Main logic
function main() {
  // 1. Validate inputs
  if (!process.argv[2]) {
    console.error('Usage: node script.js <arg>');
    process.exit(1);
  }

  // 2. Read/process files
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

  // 3. Perform work
  const result = process(data);

  // 4. Write output
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2) + '\n');
  console.log(`✓ Done: ${Object.keys(result).length} items processed`);
}

main();
```

**Important:** Use `execFileSync` (not `exec`) to avoid shell injection when running child processes.

### Error Handling

Always validate inputs and provide clear error messages.

```javascript
// ✓ Good
const frets = parseFrets(fretsStr);
if (!frets || frets.length !== 6) {
  console.error('ERROR: frets must have exactly 6 values');
  process.exit(1);
}

// Helpful output
console.log(`✓ Added chord ${name}: v([${frets}], [${fingers}])`);
console.error(`✗ Chord ${name} already exists`);
```

### Path Handling

Use `path` module, never hardcode paths.

```javascript
// ✓ Good
const dataPath = path.join(__dirname, '..', 'chord-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// ✗ Bad
const data = JSON.parse(fs.readFileSync('../chord-data.json', 'utf8'));
```

### Exit Codes

- `0` — Success
- `1` — General error (validation, file not found, etc.)
- Other codes — Reserved for system errors

---

## Comments & Documentation

### JSX Comment Style

```javascript
// Single-line comments for quick notes above code

function handleVoicingChange(nextIndex) {
  // Cycle through voicings; wrap to start if at end
  const max = chord.voicings.length;
  setVoicingIndex((nextIndex % max + max) % max);
}

/* Multi-line comments for complex logic explanations */
const frets = voicing.frets.map((f, i) => {
  /*
    Calculate SVG y-position for each fret:
    - nut at y=0
    - each fret 50px apart
    - open strings above nut at y=-40
  */
  return f === null ? -40 : f * 50;
});
```

### What to Comment

**DO comment:**
- Complex algorithms (chord lookup fallback chain, note calculation)
- Non-obvious variable names or state transformations
- SVG rendering logic (fretboard layout, path generation)
- Tricky regex patterns

**DON'T comment:**
- Obvious code (`const name = chord.name;`)
- Naming itself (if names are clear, comments are noise)
- Every function (good function names explain intent)

### Function Documentation

Use comment headers for exported/complex functions:

```javascript
// Extract unique chord names from lyrics text
// Returns array of unique chord names in order of appearance
// Example: "Play [C] then [D]" → ['C', 'D']
function parseChords(text) {
  const re = /\[\s*([A-G][#b]?.*?)\s*\]/g;
  const seen = new Set();
  const chords = [];
  let match;
  while ((match = re.exec(text))) {
    const name = match[1].trim();
    if (!seen.has(name)) {
      seen.add(name);
      chords.push(name);
    }
  }
  return chords;
}
```

---

## Error Handling

### User-Facing Errors

Display friendly messages for expected errors:

```javascript
// ✓ Good: user sees this
const { name, voicings, exact } = lookupChord(chordName);
if (!voicings) {
  return (
    <div style={{ color: '#d9534f', padding: '8px' }}>
      Chord "<strong>{name}</strong>" not found. 
      <a href="#">Add it via CLI</a> or suggest a voicing.
    </div>
  );
}

// Show alternate matches if not exact
if (!exact) {
  return (
    <div style={{ color: '#f0ad4e', fontSize: 12 }}>
      Showing voicings for {name} (closest match)
    </div>
  );
}
```

### Developer-Facing Errors

Log to console + exit with error code:

```javascript
// ✓ Good: developer sees this in terminal
if (!process.argv[2]) {
  console.error('Usage: node scripts/chord-add.js <chord|voicing|list> <name> <frets> <fingers>');
  console.error('Example: node scripts/chord-add.js chord "C#m7" "null,4,3,3,2,null" "0,1,3,1,2,0"');
  process.exit(1);
}
```

---

## Performance Considerations

### 1. Memoization

Memoize expensive computations:

```javascript
// ✓ Good: only re-parse if lyrics change
const chords = useMemo(() => {
  return parseChords(lyrics).map(name => lookupChord(name));
}, [lyrics]);
```

### 2. Avoid Inline Functions in JSX

Define event handlers outside render:

```javascript
// ✓ Good: function defined once
function ChordItem({ chord }) {
  const handleClick = () => {
    setSelectedChord(chord.name);
  };
  return <button onClick={handleClick}>{chord.name}</button>;
}

// ✗ Bad: new function every render
return <button onClick={() => setSelectedChord(chord.name)}>{chord.name}</button>;
```

### 3. Lazy SVG Rendering

For large chord lists, consider virtualizing:

```javascript
// Current: renders all chords in viewport
{chords.map(chord => (
  <ChordDiagram key={chord.name} chord={chord} />
))}

// Future: render only visible chords if list > 50 items
// (Use react-window or custom virtual scroller)
```

---

## Testing Standards

### Current State
**No automated tests yet.** Manual testing covers:
- Chord parsing with 10+ chords
- Voicing lookup (exact, alias, root fallback)
- SVG rendering across browsers
- Export (PNG, print) quality
- localStorage persistence

### Future Strategy
When tests are added:
- **Unit tests:** Chord lookup, note calculation, label derivation
- **Component tests:** ChordDiagram rendering (snapshot + visual)
- **Integration tests:** Full flow (parse → lookup → render → export)
- **Test framework:** Vitest (lightweight, no build step)

### Test File Naming
```
chord-diagram.test.jsx     # Test file lives next to component
chord-build.test.js         # Test file lives next to script
```

---

## Browser Compatibility

### Target Browsers

- **Desktop:** Chrome/Edge 90+, Firefox 88+, Safari 14+
- **Mobile:** iOS Safari 14+, Chrome Android (latest)

### Feature Detection

Use feature detection, not version detection:

```javascript
// ✓ Good: feature detection
if (typeof navigator.clipboard !== 'undefined') {
  // Copy to clipboard available
  navigator.clipboard.writeText(imageDataUrl);
}

// ✗ Bad: version sniffing
if (navigator.userAgent.includes('Chrome/90')) {
  // might break on Chrome 91!
}
```

### Polyfills

None currently used. All features are widely supported.

If adding polyfills:
- Bundle via CDN, not npm
- Document in index.html

---

## Security Practices

### 1. Input Validation

All user inputs validated before use:

```javascript
// ✓ Good
function addChord(name, frets, fingers) {
  // Validate name
  if (!/^[A-G][#b]?/.test(name)) {
    throw new Error('Invalid chord name');
  }
  // Validate frets
  if (!Array.isArray(frets) || frets.length !== 6) {
    throw new Error('Frets must be array of 6');
  }
  // Process...
}
```

### 2. No eval() or innerHTML

Never use `eval()`, `Function()`, or `.innerHTML` with user input.

```javascript
// ✗ Bad
eval(userInput);  // Never
element.innerHTML = userInput;  // XSS risk

// ✓ Good
element.textContent = userInput;  // Safe
```

### 3. JSON Parsing

Always validate JSON structure:

```javascript
// ✓ Good
try {
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  validateChordData(data);  // Verify structure
} catch (err) {
  console.error('Invalid JSON:', err.message);
  process.exit(1);
}
```

---

## Code Review Checklist

Before committing, verify:

- [ ] No syntax errors (JSX parses, Node.js runs)
- [ ] No console.log or debugger statements left behind
- [ ] Comments explain "why", not "what"
- [ ] Props destructured at function signature
- [ ] Inline styles use consistent camelCase
- [ ] Error messages are user-friendly
- [ ] No hardcoded paths (use path.join or relative refs)
- [ ] Chord data validates against schema
- [ ] No external CSS or hidden dependencies
- [ ] File names follow kebab-case (scripts) or PascalCase (JSX)

---

## Version Management

### Versioning Scheme

Semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR** — Breaking changes (chord format, UI redesign)
- **MINOR** — Features (new variants, export options)
- **PATCH** — Bug fixes (parsing edge case, rendering artifact)

### Version Bumping
- Update in package.json
- Tag in Git: `git tag v0.1.0`
- Cloudflare auto-deploys tagged version

---

## Resources

- **README.md** — User guide & quick start
- **docs/codebase-summary.md** — Project structure & algorithms
- **docs/system-architecture.md** — Rendering pipeline, data flow
- **docs/project-overview-pdr.md** — Product spec & roadmap
