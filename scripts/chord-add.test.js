'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseFrets, parseFingers, validate, deriveLabel, isDupeVoicing } = require('./chord-add');

// parseFrets
test('parseFrets: parses regular frets', () => {
  assert.deepEqual(parseFrets('0,2,2,1,0,0'), [0, 2, 2, 1, 0, 0]);
});

test('parseFrets: handles null for muted strings', () => {
  assert.deepEqual(parseFrets('null,0,2,2,1,0'), [null, 0, 2, 2, 1, 0]);
});

test('parseFrets: trims whitespace', () => {
  assert.deepEqual(parseFrets('0, 2, 2, 1, 0, 0'), [0, 2, 2, 1, 0, 0]);
});

// parseFingers
test('parseFingers: parses finger assignments', () => {
  assert.deepEqual(parseFingers('0,1,2,3,1,0'), [0, 1, 2, 3, 1, 0]);
});

test('parseFingers: trims whitespace', () => {
  assert.deepEqual(parseFingers('0, 1, 2, 3, 1, 0'), [0, 1, 2, 3, 1, 0]);
});

// validate
test('validate: accepts valid input', () => {
  assert.doesNotThrow(() => validate([0, 2, 2, 1, 0, 0], [0, 1, 2, 3, 1, 0]));
});

test('validate: accepts null fret for muted string', () => {
  assert.doesNotThrow(() => validate([null, 0, 2, 2, 1, 0], [0, 0, 1, 2, 3, 0]));
});

test('validate: rejects frets with wrong length', () => {
  assert.throws(() => validate([0, 2, 2], [0, 1, 2, 3, 1, 0]), /frets must have 6 values/);
});

test('validate: rejects fingers with wrong length', () => {
  assert.throws(() => validate([0, 2, 2, 1, 0, 0], [0, 1]), /fingers must have 6 values/);
});

test('validate: rejects fret value above 24', () => {
  assert.throws(() => validate([0, 25, 2, 1, 0, 0], [0, 1, 2, 3, 1, 0]), /frets\[1\] invalid/);
});

test('validate: rejects negative fret', () => {
  assert.throws(() => validate([0, -1, 2, 1, 0, 0], [0, 1, 2, 3, 1, 0]), /frets\[1\] invalid/);
});

test('validate: rejects finger value above 4', () => {
  assert.throws(() => validate([0, 2, 2, 1, 0, 0], [0, 5, 2, 3, 1, 0]), /fingers\[1\] invalid/);
});

test('validate: rejects negative finger value', () => {
  assert.throws(() => validate([0, 2, 2, 1, 0, 0], [0, -1, 2, 3, 1, 0]), /fingers\[1\] invalid/);
});

// deriveLabel
test('deriveLabel: all-zero frets returns open', () => {
  assert.equal(deriveLabel([0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]), 'open');
});

test('deriveLabel: mix of 0 and low frets returns open', () => {
  assert.equal(deriveLabel([0, 2, 2, 1, 0, 0], [0, 1, 2, 3, 1, 0]), 'open');
});

test('deriveLabel: full barre chord returns barre Nfr', () => {
  assert.equal(deriveLabel([5, 7, 7, 6, 5, 5], [1, 3, 4, 2, 1, 1]), 'barre 5fr');
});

test('deriveLabel: high fret position without open strings returns Nfr', () => {
  assert.equal(deriveLabel([null, 3, 5, 5, 4, null], [0, 1, 3, 4, 2, 0]), '3fr');
});

// isDupeVoicing
test('isDupeVoicing: returns false when existing list is empty', () => {
  assert.equal(isDupeVoicing([], [0, 2, 2, 1, 0, 0]), false);
});

test('isDupeVoicing: returns false for distinct fret positions', () => {
  const existing = [{ frets: [0, 2, 2, 1, 0, 0], fingers: [0, 1, 2, 3, 1, 0] }];
  assert.equal(isDupeVoicing(existing, [3, 2, 0, 0, 0, 3]), false);
});

test('isDupeVoicing: detects exact fret duplicate', () => {
  const existing = [{ frets: [0, 2, 2, 1, 0, 0], fingers: [0, 1, 2, 3, 1, 0] }];
  assert.equal(isDupeVoicing(existing, [0, 2, 2, 1, 0, 0]), true);
});

test('isDupeVoicing: same frets with different fingers is still a duplicate', () => {
  const existing = [{ frets: [0, 2, 2, 1, 0, 0], fingers: [0, 1, 2, 3, 1, 0] }];
  assert.equal(isDupeVoicing(existing, [0, 2, 2, 1, 0, 0]), true);
});

test('isDupeVoicing: handles null frets correctly', () => {
  const existing = [{ frets: [null, 0, 2, 2, 1, 0], fingers: [0, 0, 1, 2, 3, 0] }];
  assert.equal(isDupeVoicing(existing, [null, 0, 2, 2, 1, 0]), true);
});

test('isDupeVoicing: null vs 0 in same position is not a duplicate', () => {
  const existing = [{ frets: [null, 0, 2, 2, 1, 0], fingers: [0, 0, 1, 2, 3, 0] }];
  assert.equal(isDupeVoicing(existing, [0, 0, 2, 2, 1, 0]), false);
});

test('isDupeVoicing: scans all existing voicings', () => {
  const existing = [
    { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 1, 2, 3, 1, 0] },
    { frets: [5, 7, 7, 6, 5, 5], fingers: [1, 3, 4, 2, 1, 1] },
  ];
  assert.equal(isDupeVoicing(existing, [5, 7, 7, 6, 5, 5]), true);
  assert.equal(isDupeVoicing(existing, [2, 0, 2, 2, 2, 0]), false);
});
