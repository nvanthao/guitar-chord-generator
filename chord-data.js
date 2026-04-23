// Guitar chord shape database.
// Each chord name maps to an ARRAY of voicings (shape objects).
// Each shape: { frets: [E,A,D,G,B,e] -- low-to-high },
//   where fret is 0 (open), null (muted), or positive int (fret #).
// fingers: [0..4] where 0=open/muted.
// notes: array of 6 note names (or null) — auto-computed.

const OPEN_NOTES = ['E', 'A', 'D', 'G', 'B', 'E'];
const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function noteAt(stringIdx, fret) {
  if (fret === null || fret < 0) return null;
  const open = OPEN_NOTES[stringIdx];
  const openIdx = CHROMATIC.indexOf(open);
  return CHROMATIC[(openIdx + fret) % 12];
}
function v(frets, fingers, label) {
  return {
    frets,
    fingers: fingers || frets.map(() => 0),
    notes: frets.map((f, i) => noteAt(i, f)),
    label: label || null, // e.g. "open", "barre 5fr"
  };
}

// Auto-derive a human label from a voicing
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

// Low-to-high: E A D G B e
const CHORDS = {
  // Major
  'C':     [v([null, 3, 2, 0, 1, 0], [0, 3, 2, 0, 1, 0]),
            v([null, 3, 5, 5, 5, 3], [0, 1, 3, 4, 4, 1]),    // barre 3fr (C shape as A-barre)
            v([8, 10, 10, 9, 8, 8],   [1, 3, 4, 2, 1, 1])],  // barre 8fr (E shape)
  'D':     [v([null, null, 0, 2, 3, 2], [0, 0, 0, 1, 3, 2]),
            v([null, 5, 7, 7, 7, 5],    [0, 1, 3, 4, 4, 1]), // barre 5fr
            v([10, 12, 12, 11, 10, 10], [1, 3, 4, 2, 1, 1])],
  'E':     [v([0, 2, 2, 1, 0, 0],       [0, 2, 3, 1, 0, 0]),
            v([null, 7, 9, 9, 9, 7],    [0, 1, 3, 4, 4, 1])],
  'F':     [v([1, 3, 3, 2, 1, 1],       [1, 3, 4, 2, 1, 1]),
            v([null, 8, 10, 10, 10, 8], [0, 1, 3, 4, 4, 1])],
  'G':     [v([3, 2, 0, 0, 0, 3],       [3, 2, 0, 0, 0, 4]),
            v([3, 2, 0, 0, 3, 3],       [2, 1, 0, 0, 3, 4]),
            v([3, 5, 5, 4, 3, 3],       [1, 3, 4, 2, 1, 1])],
  'A':     [v([null, 0, 2, 2, 2, 0],    [0, 0, 1, 2, 3, 0]),
            v([5, 7, 7, 6, 5, 5],       [1, 3, 4, 2, 1, 1])],
  'B':     [v([null, 2, 4, 4, 4, 2],    [0, 1, 2, 3, 4, 1]),
            v([7, 9, 9, 8, 7, 7],       [1, 3, 4, 2, 1, 1])],

  // Minor
  'Cm':    [v([null, 3, 5, 5, 4, 3],    [0, 1, 3, 4, 2, 1]),
            v([8, 10, 10, 8, 8, 8],     [1, 3, 4, 1, 1, 1])],
  'Dm':    [v([null, null, 0, 2, 3, 1], [0, 0, 0, 2, 3, 1]),
            v([10, 12, 12, 10, 10, 10], [1, 3, 4, 1, 1, 1])],
  'Em':    [v([0, 2, 2, 0, 0, 0],       [0, 2, 3, 0, 0, 0]),
            v([null, 7, 9, 9, 8, 7],    [0, 1, 3, 4, 2, 1])],
  'Fm':    [v([1, 3, 3, 1, 1, 1],       [1, 3, 4, 1, 1, 1]),
            v([null, 8, 10, 10, 9, 8],  [0, 1, 3, 4, 2, 1])],
  'Gm':    [v([3, 5, 5, 3, 3, 3],       [1, 3, 4, 1, 1, 1]),
            v([null, 10, 12, 12, 11, 10], [0, 1, 3, 4, 2, 1])],
  'Am':    [v([null, 0, 2, 2, 1, 0],    [0, 0, 2, 3, 1, 0]),
            v([5, 7, 7, 5, 5, 5],       [1, 3, 4, 1, 1, 1])],
  'Bm':    [v([null, 2, 4, 4, 3, 2],    [0, 1, 3, 4, 2, 1]),
            v([7, 9, 9, 7, 7, 7],       [1, 3, 4, 1, 1, 1])],

  // 7
  'C7':    [v([null, 3, 2, 3, 1, 0],    [0, 3, 2, 4, 1, 0]),
            v([8, 10, 8, 9, 8, 8],      [1, 3, 1, 2, 1, 1])],
  'D7':    [v([null, null, 0, 2, 1, 2], [0, 0, 0, 2, 1, 3]),
            v([10, 12, 10, 11, 10, 10], [1, 3, 1, 2, 1, 1])],
  'E7':    [v([0, 2, 0, 1, 0, 0],       [0, 2, 0, 1, 0, 0]),
            v([0, 2, 2, 1, 3, 0],       [0, 2, 3, 1, 4, 0])],
  'F7':    [v([1, 3, 1, 2, 1, 1],       [1, 3, 1, 2, 1, 1])],
  'G7':    [v([3, 2, 0, 0, 0, 1],       [3, 2, 0, 0, 0, 1]),
            v([3, 5, 3, 4, 3, 3],       [1, 3, 1, 2, 1, 1])],
  'A7':    [v([null, 0, 2, 0, 2, 0],    [0, 0, 2, 0, 3, 0]),
            v([5, 7, 5, 6, 5, 5],       [1, 3, 1, 2, 1, 1])],
  'B7':    [v([null, 2, 1, 2, 0, 2],    [0, 2, 1, 3, 0, 4]),
            v([7, 9, 7, 8, 7, 7],       [1, 3, 1, 2, 1, 1])],

  // maj7
  'Cmaj7': [v([null, 3, 2, 0, 0, 0],    [0, 3, 2, 0, 0, 0]),
            v([8, 10, 9, 9, 8, 8],      [1, 4, 2, 3, 1, 1])],
  'Dmaj7': [v([null, null, 0, 2, 2, 2], [0, 0, 0, 1, 1, 1]),
            v([null, 5, 7, 6, 7, 5],    [0, 1, 3, 2, 4, 1])],
  'Emaj7': [v([0, 2, 1, 1, 0, 0],       [0, 3, 1, 2, 0, 0]),
            v([null, 7, 9, 8, 9, 7],    [0, 1, 3, 2, 4, 1])],
  'Fmaj7': [v([null, null, 3, 2, 1, 0], [0, 0, 3, 2, 1, 0]),
            v([1, 3, 2, 2, 1, 1],       [1, 4, 2, 3, 1, 1])],
  'Gmaj7': [v([3, 2, 0, 0, 0, 2],       [3, 2, 0, 0, 0, 1]),
            v([3, 5, 4, 4, 3, 3],       [1, 4, 2, 3, 1, 1])],
  'Amaj7': [v([null, 0, 2, 1, 2, 0],    [0, 0, 2, 1, 3, 0]),
            v([5, 7, 6, 6, 5, 5],       [1, 4, 2, 3, 1, 1])],
  'Bmaj7': [v([null, 2, 4, 3, 4, 2],    [0, 1, 3, 2, 4, 1]),
            v([7, 9, 8, 8, 7, 7],       [1, 4, 2, 3, 1, 1])],

  // m7
  'Cm7':   [v([null, 3, 5, 3, 4, 3],    [0, 1, 3, 1, 2, 1]),
            v([8, 10, 8, 8, 8, 8],      [1, 3, 1, 1, 1, 1])],
  'Dm7':   [v([null, null, 0, 2, 1, 1], [0, 0, 0, 2, 1, 1]),
            v([10, 12, 10, 10, 10, 10], [1, 3, 1, 1, 1, 1])],
  'Em7':   [v([0, 2, 0, 0, 0, 0],       [0, 2, 0, 0, 0, 0]),
            v([0, 2, 2, 0, 3, 0],       [0, 2, 3, 0, 4, 0])],
  'Fm7':   [v([1, 3, 1, 1, 1, 1],       [1, 3, 1, 1, 1, 1])],
  'Gm7':   [v([3, 5, 3, 3, 3, 3],       [1, 3, 1, 1, 1, 1])],
  'Am7':   [v([null, 0, 2, 0, 1, 0],    [0, 0, 2, 0, 1, 0]),
            v([5, 7, 5, 5, 5, 5],       [1, 3, 1, 1, 1, 1])],
  'Bm7':   [v([null, 2, 4, 2, 3, 2],    [0, 1, 3, 1, 2, 1]),
            v([7, 9, 7, 7, 7, 7],       [1, 3, 1, 1, 1, 1])],

  // Sus
  'Dsus2': [v([null, null, 0, 2, 3, 0], [0, 0, 0, 1, 2, 0])],
  'Dsus4': [v([null, null, 0, 2, 3, 3], [0, 0, 0, 1, 2, 3])],
  'Asus2': [v([null, 0, 2, 2, 0, 0],    [0, 0, 1, 2, 0, 0])],
  'Asus4': [v([null, 0, 2, 2, 3, 0],    [0, 0, 1, 2, 3, 0])],
  'Esus4': [v([0, 2, 2, 2, 0, 0],       [0, 1, 2, 3, 0, 0])],

  // Sharps/flats major
  'C#':    [v([null, 4, 6, 6, 6, 4],    [0, 1, 2, 3, 4, 1]),
            v([9, 11, 11, 10, 9, 9],    [1, 3, 4, 2, 1, 1])],
  'Db':    [v([null, 4, 6, 6, 6, 4],    [0, 1, 2, 3, 4, 1])],
  'D#':    [v([null, 6, 8, 8, 8, 6],    [0, 1, 2, 3, 4, 1])],
  'Eb':    [v([null, 6, 8, 8, 8, 6],    [0, 1, 2, 3, 4, 1])],
  'F#':    [v([2, 4, 4, 3, 2, 2],       [1, 3, 4, 2, 1, 1]),
            v([null, 9, 11, 11, 11, 9], [0, 1, 3, 4, 4, 1])],
  'Gb':    [v([2, 4, 4, 3, 2, 2],       [1, 3, 4, 2, 1, 1])],
  'G#':    [v([4, 6, 6, 5, 4, 4],       [1, 3, 4, 2, 1, 1])],
  'Ab':    [v([4, 6, 6, 5, 4, 4],       [1, 3, 4, 2, 1, 1])],
  'A#':    [v([null, 1, 3, 3, 3, 1],    [0, 1, 2, 3, 4, 1]),
            v([6, 8, 8, 7, 6, 6],       [1, 3, 4, 2, 1, 1])],
  'Bb':    [v([null, 1, 3, 3, 3, 1],    [0, 1, 2, 3, 4, 1]),
            v([6, 8, 8, 7, 6, 6],       [1, 3, 4, 2, 1, 1])],

  // Sharps/flats minor
  'C#m':   [v([null, 4, 6, 6, 5, 4],    [0, 1, 3, 4, 2, 1]),
            v([9, 11, 11, 9, 9, 9],     [1, 3, 4, 1, 1, 1])],
  'Dbm':   [v([null, 4, 6, 6, 5, 4],    [0, 1, 3, 4, 2, 1])],
  'D#m':   [v([null, 6, 8, 8, 7, 6],    [0, 1, 3, 4, 2, 1])],
  'Ebm':   [v([null, 6, 8, 8, 7, 6],    [0, 1, 3, 4, 2, 1])],
  'F#m':   [v([2, 4, 4, 2, 2, 2],       [1, 3, 4, 1, 1, 1]),
            v([null, 9, 11, 11, 10, 9], [0, 1, 3, 4, 2, 1])],
  'Gbm':   [v([2, 4, 4, 2, 2, 2],       [1, 3, 4, 1, 1, 1])],
  'G#m':   [v([4, 6, 6, 4, 4, 4],       [1, 3, 4, 1, 1, 1])],
  'Abm':   [v([4, 6, 6, 4, 4, 4],       [1, 3, 4, 1, 1, 1])],
  'A#m':   [v([null, 1, 3, 3, 2, 1],    [0, 1, 3, 4, 2, 1]),
            v([6, 8, 8, 6, 6, 6],       [1, 3, 4, 1, 1, 1])],
  'Bbm':   [v([null, 1, 3, 3, 2, 1],    [0, 1, 3, 4, 2, 1]),
            v([6, 8, 8, 6, 6, 6],       [1, 3, 4, 1, 1, 1])],

  // Sharps 7th
  'F#7':   [v([2, 4, 2, 3, 2, 2],       [1, 3, 1, 2, 1, 1])],
  'C#7':   [v([null, 4, 3, 4, 2, 4],    [0, 3, 2, 4, 1, 4])],

  // maj9 / add / slash
  'Bmaj9': [v([null, 2, 1, 3, 2, 2],    [0, 2, 1, 4, 3, 3])],
  'Amaj9': [v([null, 0, 2, 1, 0, 0],    [0, 0, 2, 1, 0, 0])],
  'E/F':   [v([1, 2, 2, 1, 0, 0],       [1, 2, 3, 1, 0, 0])],
};

// Fill in labels
Object.values(CHORDS).forEach((voicings) => {
  voicings.forEach((voicing, i) => {
    if (!voicing.label) voicing.label = autoLabel(voicing);
  });
});

// Parser: extract unique chord tokens in order from [Chord] notation.
function parseChords(text) {
  if (!text) return [];
  const re = /\[\s*([A-G][#b]?(?:m|maj|min|sus|dim|aug|add)?\d*(?:\/[A-G][#b]?)?)\s*\]/g;
  const seen = new Set();
  const list = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    const raw = m[1].trim();
    const norm = raw.replace(/\s+/g, '');
    if (!seen.has(norm)) {
      seen.add(norm);
      list.push(norm);
    }
  }
  return list;
}

// Lookup: returns { name, voicings: [...] | null, exact }
function lookupChord(name) {
  if (CHORDS[name]) return { name, voicings: CHORDS[name], exact: true };
  const variants = [
    name.replace('min', 'm'),
    name.replace(/\/.+$/, ''),
  ];
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

window.ChordData = { CHORDS, parseChords, lookupChord };
