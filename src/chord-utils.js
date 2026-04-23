// Guitar chord shape database — bundled from chord-data.json at build time.
// Exports parseChords and lookupChord for use by the React app.

import chordDataRaw from '../chord-data.json';

const OPEN_NOTES = ['E', 'A', 'D', 'G', 'B', 'E'];
const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function noteAt(stringIdx, fret) {
  if (fret === null || fret < 0) return null;
  const openIdx = CHROMATIC.indexOf(OPEN_NOTES[stringIdx]);
  return CHROMATIC[(openIdx + fret) % 12];
}

function autoLabel(shape) {
  const played = shape.frets.filter((f) => f !== null && f > 0);
  if (played.length === 0) return 'open';
  const min = Math.min(...played);
  const max = Math.max(...played);
  const barreCount = shape.fingers.filter((x) => x === 1).length;
  if (max <= 4 && shape.frets.some((f) => f === 0)) return 'open';
  if (barreCount >= 3) return `barre ${min}fr`;
  if (min > 1) return `${min}fr`;
  return 'open';
}

// Pre-process all chord voicings synchronously at module load time
const CHORDS = {};
Object.entries(chordDataRaw).forEach(([name, voicings]) => {
  CHORDS[name] = voicings.map(({ frets, fingers }) => {
    const shape = {
      frets,
      fingers: fingers || frets.map(() => 0),
      notes: frets.map((f, i) => noteAt(i, f)),
      label: null,
    };
    shape.label = autoLabel(shape);
    return shape;
  });
});

export function parseChords(text) {
  if (!text) return [];
  const re = /\[\s*([A-G][#b]?(?:m|maj|min|sus|dim|aug|add)?\d*(?:\/[A-G][#b]?)?)\s*\]/g;
  const seen = new Set();
  const list = [];
  for (const match of text.matchAll(re)) {
    const norm = match[1].trim().replace(/\s+/g, '');
    if (!seen.has(norm)) { seen.add(norm); list.push(norm); }
  }
  return list;
}

export function lookupChord(name) {
  if (CHORDS[name]) return { name, voicings: CHORDS[name], exact: true };
  const variants = [name.replace('min', 'm'), name.replace(/\/.+$/, '')];
  for (const vr of variants) {
    if (CHORDS[vr]) return { name, voicings: CHORDS[vr], exact: false };
  }
  const rootMatch = name.match(/^([A-G][#b]?)(m?)/);
  if (rootMatch) {
    const simple = rootMatch[1] + (rootMatch[2] || '');
    if (CHORDS[simple]) return { name, voicings: CHORDS[simple], exact: false };
  }
  return { name, voicings: null, exact: false };
}
