# Guitar Chord Generator — task runner

# Add a new voicing to an existing chord
# Usage: just add-voicing "Dm7" "null,5,7,5,6,5" "0,1,3,1,2,1"
add-voicing NAME FRETS FINGERS:
    node scripts/chord-add.js voicing "{{NAME}}" "{{FRETS}}" "{{FINGERS}}"

# Add a brand-new chord
# Usage: just add-chord "C#m7" "null,4,3,3,2,null" "0,1,3,1,2,0"
add-chord NAME FRETS FINGERS:
    node scripts/chord-add.js chord "{{NAME}}" "{{FRETS}}" "{{FINGERS}}"

# List all chord names
list-chords:
    node scripts/chord-add.js list

# Start local dev server
dev:
    npm run dev
