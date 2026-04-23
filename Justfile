# Guitar Chord Generator — task runner

# ─── Chord DB ────────────────────────────────────────────────────────────────
#
# chord-data.json holds all chords. Each chord has one or more voicings.
#
# FRETS  — 6 values (low E → high e), comma-separated.
#           Use a number (0–24) for a fret, or "null" for a muted string.
#           0 = open string.
#           Example: "null,3,2,0,1,0"  (E string muted, then frets 3,2,0,1,0)
#
# FINGERS — 6 values matching each string.
#           0 = not used / muted, 1 = index, 2 = middle, 3 = ring, 4 = pinky.
#           Example: "0,2,1,0,1,0"
#
# Workflow:
#   1. Run `just list-chords` to see what already exists.
#   2. If the chord name is NEW        → use `just add-chord`
#   3. If the chord name already exists → use `just add-voicing`
#
# ─────────────────────────────────────────────────────────────────────────────

# List all chord names currently in chord-data.json
list-chords:
    node scripts/chord-add.js list

# Add a brand-new chord (chord name must NOT already exist).
# Usage: just add-chord "<NAME>" "<FRETS>" "<FINGERS>"
# Example (C major open):
#   just add-chord "C" "null,3,2,0,1,0" "0,3,2,0,1,0"
add-chord NAME FRETS FINGERS:
    node scripts/chord-add.js chord "{{NAME}}" "{{FRETS}}" "{{FINGERS}}"

# Add an alternative voicing to an existing chord (chord name MUST already exist).
# Usage: just add-voicing "<NAME>" "<FRETS>" "<FINGERS>"
# Example (Dm7 barre at 5th fret):
#   just add-voicing "Dm7" "null,5,7,5,6,5" "0,1,3,1,2,1"
add-voicing NAME FRETS FINGERS:
    node scripts/chord-add.js voicing "{{NAME}}" "{{FRETS}}" "{{FINGERS}}"

# ─── Dev ─────────────────────────────────────────────────────────────────────

# Start local dev server
dev:
    npm run dev
