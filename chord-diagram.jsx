// ChordDiagram.jsx — SVG fretboard diagram
// Props:
//   name: string (chord name)
//   shape: { frets, fingers, notes } — from chord-data.js
//   variant: 'editorial' | 'paper' | 'mono' (visual style)
//   size: 'sm' | 'md' | 'lg'

function ChordDiagram({
  name, shape, variant = 'editorial', size = 'md',
  showNotes = true, showFingers = true,
  voicingIndex = 0, voicingCount = 1, onCycle = null,
  voicingLabel = null,
}) {
  const styles = STYLE_TOKENS[variant];
  const dims = SIZE_TOKENS[size];

  if (!shape) {
    return (
      <div style={{
        width: dims.w, fontFamily: styles.font,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      }}>
        <div style={{ fontSize: dims.nameSize, fontWeight: 600, color: styles.fg, letterSpacing: '0.01em' }}>
          {name}
        </div>
        <div style={{
          width: dims.w - 4, height: dims.h, border: `1px dashed ${styles.muted}`,
          borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: styles.muted, fontSize: 10, fontFamily: 'ui-monospace, Menlo, monospace',
        }}>
          unknown
        </div>
      </div>
    );
  }

  const { frets, fingers, notes } = shape;
  // Determine baseFret: if any fret > 4, start at min non-zero fret
  const playedFrets = frets.filter((f) => f !== null && f > 0);
  const minFret = playedFrets.length ? Math.min(...playedFrets) : 1;
  const maxFret = playedFrets.length ? Math.max(...playedFrets) : 1;
  const baseFret = (maxFret > 4) ? minFret : 1;
  const visibleFrets = 4;

  // SVG geometry
  const pad = { top: dims.fretLabelGap, right: 10, bottom: 4, left: 10 };
  const stringSpacing = (dims.w - pad.left - pad.right) / 5;
  const fretSpacing = dims.fretSpacing;
  const gridW = stringSpacing * 5;
  const gridH = fretSpacing * visibleFrets;
  const gridLeft = pad.left;
  const gridTop = pad.top + dims.openRowH;
  // total svg height
  const svgH = gridTop + gridH + 4 + (showNotes ? dims.noteRowH : 0);
  const svgW = dims.w;

  // strings displayed left->right: low E (index 0) to high e (index 5)
  const stringX = (i) => gridLeft + i * stringSpacing;
  const fretY = (f) => gridTop + f * fretSpacing;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: styles.font, color: styles.fg,
    }}>
      {/* Chord name + optional cycle */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        marginBottom: dims.nameGap, minHeight: dims.nameSize * 1.1,
      }}>
        {onCycle && voicingCount > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onCycle(-1); }}
            aria-label="previous voicing"
            data-chord-ctrl
            style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              padding: 2, color: styles.muted, lineHeight: 0,
              fontFamily: styles.monoFont, fontSize: dims.nameSize * 0.55,
            }}
          >‹</button>
        )}
        <div style={{
          fontSize: dims.nameSize, fontWeight: styles.nameWeight, color: styles.fg,
          letterSpacing: styles.nameSpacing, fontFamily: styles.nameFont,
          lineHeight: 1,
        }}>
          {name}
        </div>
        {onCycle && voicingCount > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onCycle(1); }}
            aria-label="next voicing"
            data-chord-ctrl
            style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              padding: 2, color: styles.muted, lineHeight: 0,
              fontFamily: styles.monoFont, fontSize: dims.nameSize * 0.55,
            }}
          >›</button>
        )}
      </div>
      {/* Voicing label row (always reserved for alignment) */}
      <div style={{
        fontFamily: styles.monoFont, fontSize: dims.noteSize - 0.5,
        color: styles.muted, letterSpacing: '0.05em',
        marginTop: -dims.nameGap + 2, marginBottom: dims.nameGap - 2,
        textTransform: 'lowercase',
        minHeight: dims.noteSize + 1,
      }}>
        {voicingCount > 1 ? (voicingLabel || `voicing ${voicingIndex + 1}/${voicingCount}`) : (voicingLabel || '\u00A0')}
      </div>

      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: 'block', overflow: 'visible' }}>
        {/* Open / muted indicators row */}
        {frets.map((f, i) => {
          const x = stringX(i);
          const y = pad.top + dims.openRowH / 2;
          if (f === null) {
            // X for muted
            const s = dims.muteSize;
            return (
              <g key={`m${i}`}>
                <line x1={x - s / 2} y1={y - s / 2} x2={x + s / 2} y2={y + s / 2}
                  stroke={styles.fg} strokeWidth={1.4} strokeLinecap="round" />
                <line x1={x - s / 2} y1={y + s / 2} x2={x + s / 2} y2={y - s / 2}
                  stroke={styles.fg} strokeWidth={1.4} strokeLinecap="round" />
              </g>
            );
          }
          if (f === 0) {
            return (
              <circle key={`o${i}`} cx={x} cy={y} r={dims.openR}
                fill="none" stroke={styles.fg} strokeWidth={1.2} />
            );
          }
          return null;
        })}

        {/* Nut (thick line) if baseFret === 1 */}
        {baseFret === 1 && (
          <rect x={gridLeft - 1} y={gridTop - 2.5} width={gridW + 2} height={3}
            fill={styles.fg} rx={0.5} />
        )}

        {/* Fret lines */}
        {Array.from({ length: visibleFrets + 1 }).map((_, i) => (
          <line key={`f${i}`} x1={gridLeft} y1={fretY(i)} x2={gridLeft + gridW} y2={fretY(i)}
            stroke={styles.grid} strokeWidth={i === 0 && baseFret === 1 ? 0 : 1} />
        ))}

        {/* String lines */}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`s${i}`} x1={stringX(i)} y1={gridTop} x2={stringX(i)} y2={gridTop + gridH}
            stroke={styles.grid} strokeWidth={1} />
        ))}

        {/* Base fret label (if > 1) */}
        {baseFret > 1 && (
          <text x={gridLeft - 6} y={gridTop + fretSpacing / 2 + 3}
            textAnchor="end" fontSize={dims.fretLabelSize} fill={styles.muted}
            fontFamily={styles.monoFont}>
            {baseFret}fr
          </text>
        )}

        {/* Barre detection */}
        {(() => {
          // If multiple strings share the same fret AND finger 1, draw barre
          const byFret = {};
          frets.forEach((f, i) => {
            if (f !== null && f > 0 && fingers[i] === 1) {
              if (!byFret[f]) byFret[f] = [];
              byFret[f].push(i);
            }
          });
          return Object.entries(byFret).map(([f, stringsArr]) => {
            if (stringsArr.length < 2) return null;
            const fretNum = parseInt(f);
            const relFret = fretNum - baseFret + 1;
            if (relFret < 1 || relFret > visibleFrets) return null;
            const x1 = stringX(Math.min(...stringsArr));
            const x2 = stringX(Math.max(...stringsArr));
            const y = fretY(relFret) - fretSpacing / 2;
            return (
              <rect key={`b${f}`} x={x1 - dims.dotR} y={y - dims.dotR * 0.75}
                width={x2 - x1 + dims.dotR * 2} height={dims.dotR * 1.5}
                rx={dims.dotR} fill={styles.dot} />
            );
          });
        })()}

        {/* Dots for fingered notes */}
        {frets.map((f, i) => {
          if (f === null || f === 0) return null;
          const relFret = f - baseFret + 1;
          if (relFret < 1 || relFret > visibleFrets) return null;
          const cx = stringX(i);
          const cy = fretY(relFret) - fretSpacing / 2;
          return (
            <g key={`d${i}`}>
              <circle cx={cx} cy={cy} r={dims.dotR} fill={styles.dot} />
              {showFingers && fingers[i] > 0 && (
                <text x={cx} y={cy + 3.5} textAnchor="middle"
                  fontSize={dims.fingerSize} fontWeight={600} fill={styles.dotText}
                  fontFamily={styles.font}>
                  {fingers[i]}
                </text>
              )}
            </g>
          );
        })}

        {/* Note names below */}
        {showNotes && notes.map((n, i) => {
          const x = stringX(i);
          const y = gridTop + gridH + dims.noteRowH - 3;
          return (
            <text key={`n${i}`} x={x} y={y} textAnchor="middle"
              fontSize={dims.noteSize} fill={n ? styles.muted : styles.muteColor}
              fontFamily={styles.monoFont}>
              {n || '×'}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

const SIZE_TOKENS = {
  sm: {
    w: 78, h: 100, fretSpacing: 14, openRowH: 12, noteRowH: 12,
    fretLabelGap: 2, nameSize: 13, nameGap: 6,
    dotR: 5.5, fingerSize: 8, muteSize: 7, openR: 3.2,
    noteSize: 8, fretLabelSize: 8.5,
  },
  md: {
    w: 110, h: 140, fretSpacing: 20, openRowH: 16, noteRowH: 16,
    fretLabelGap: 4, nameSize: 18, nameGap: 10,
    dotR: 8, fingerSize: 10, muteSize: 10, openR: 4.5,
    noteSize: 10, fretLabelSize: 11,
  },
  lg: {
    w: 140, h: 180, fretSpacing: 26, openRowH: 20, noteRowH: 20,
    fretLabelGap: 4, nameSize: 22, nameGap: 12,
    dotR: 10, fingerSize: 12, muteSize: 12, openR: 5.5,
    noteSize: 12, fretLabelSize: 12,
  },
};

const STYLE_TOKENS = {
  editorial: {
    fg: '#1a1a1a', muted: '#8a8a8a', muteColor: '#c0c0c0',
    grid: '#2a2a2a', dot: '#1a1a1a', dotText: '#fafafa',
    font: '"Inter", -apple-system, sans-serif',
    nameFont: '"Fraunces", "Times New Roman", serif',
    monoFont: '"JetBrains Mono", ui-monospace, Menlo, monospace',
    nameWeight: 500, nameSpacing: '-0.01em',
  },
  paper: {
    fg: '#2a1e12', muted: '#8a7560', muteColor: '#c9b89e',
    grid: '#4a3828', dot: '#2a1e12', dotText: '#f5ecd9',
    font: '"EB Garamond", Georgia, serif',
    nameFont: '"EB Garamond", Georgia, serif',
    monoFont: '"Courier Prime", Courier, monospace',
    nameWeight: 600, nameSpacing: '0',
  },
  mono: {
    fg: '#0f0f0f', muted: '#707070', muteColor: '#b8b8b8',
    grid: '#0f0f0f', dot: '#0f0f0f', dotText: '#ffffff',
    font: '"JetBrains Mono", ui-monospace, Menlo, monospace',
    nameFont: '"JetBrains Mono", ui-monospace, Menlo, monospace',
    monoFont: '"JetBrains Mono", ui-monospace, Menlo, monospace',
    nameWeight: 600, nameSpacing: '0.02em',
  },
};

window.ChordDiagram = ChordDiagram;
window.STYLE_TOKENS = STYLE_TOKENS;
window.SIZE_TOKENS = SIZE_TOKENS;
