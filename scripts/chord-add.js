'use strict';
const fs = require('fs');
const path = require('path');

function parseFrets(str) {
  return str.split(',').map(s => {
    const t = s.trim();
    return t === 'null' ? null : parseInt(t, 10);
  });
}

function parseFingers(str) {
  return str.split(',').map(s => parseInt(s.trim(), 10));
}

function validate(frets, fingers) {
  if (frets.length !== 6) throw new Error(`frets must have 6 values, got ${frets.length}`);
  if (fingers.length !== 6) throw new Error(`fingers must have 6 values, got ${fingers.length}`);
  frets.forEach((f, i) => {
    if (f !== null && (isNaN(f) || f < 0 || f > 24))
      throw new Error(`frets[${i}] invalid: ${f} (must be null or 0-24)`);
  });
  fingers.forEach((g, i) => {
    if (isNaN(g) || g < 0 || g > 4)
      throw new Error(`fingers[${i}] invalid: ${g} (must be 0-4)`);
  });
}

// Mirrors autoLabel() logic from chord-utils.js
function deriveLabel(frets, fingers) {
  const played = frets.filter(f => f !== null && f > 0);
  if (played.length === 0) return 'open';
  const min = Math.min(...played);
  const max = Math.max(...played);
  const barreCount = fingers.filter(x => x === 1).length;
  if (max <= 4 && frets.some(f => f === 0)) return 'open';
  if (barreCount >= 3) return `barre ${min}fr`;
  if (min > 1) return `${min}fr`;
  return 'open';
}

// Same fret positions = same sounding voicing; fingering differences don't create a new voicing.
function isDupeVoicing(existing, frets) {
  const key = JSON.stringify(frets);
  return existing.some(v => JSON.stringify(v.frets) === key);
}

if (require.main === module) {
  const [mode, name, fretsStr, fingersStr] = process.argv.slice(2);
  const dataPath = path.join(__dirname, '..', 'chord-data.json');

  if (mode === 'list') {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(Object.keys(data).sort().join('\n'));
    process.exit(0);
  }

  if (mode !== 'chord' && mode !== 'voicing') {
    console.error('Usage: node scripts/chord-add.js <chord|voicing|list> <name> <frets> <fingers>');
    process.exit(1);
  }
  if (!name || !fretsStr || !fingersStr) {
    console.error('Missing arguments: name, frets, fingers required');
    process.exit(1);
  }

  const frets = parseFrets(fretsStr);
  const fingers = parseFingers(fingersStr);

  try {
    validate(frets, fingers);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const label = deriveLabel(frets, fingers);

  if (mode === 'chord') {
    if (data[name]) {
      console.error(`Chord "${name}" already exists. Use "voicing" mode to add a new voicing.`);
      process.exit(1);
    }
    data[name] = [{ frets, fingers }];
    console.log(`Created chord ${name}: v([${frets.map(f => f === null ? 'null' : f).join(', ')}], [${fingers.join(', ')}])  // ${label}`);
  }

  if (mode === 'voicing') {
    if (!data[name]) {
      console.error(`Chord "${name}" does not exist. Use "chord" mode to create it first.`);
      process.exit(1);
    }
    if (isDupeVoicing(data[name], frets)) {
      console.error(`Duplicate: chord "${name}" already has voicing with frets [${frets.map(f => f === null ? 'null' : f).join(', ')}]`);
      process.exit(1);
    }
    data[name].push({ frets, fingers });
    console.log(`Added voicing to ${name}: v([${frets.map(f => f === null ? 'null' : f).join(', ')}], [${fingers.join(', ')}])  // ${label}`);
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n');
}

module.exports = { parseFrets, parseFingers, validate, deriveLabel, isDupeVoicing };
