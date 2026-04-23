// Three design variations for the chord-sheet output.
// Each takes { chords, title?, meta?, nodeRef, voicingState, onCycle }

import React from 'react';
import ChordDiagram from './chord-diagram.jsx';

function renderChord(c, i, variant, size, voicingState, onCycle) {
  const idx = voicingState[c.name] || 0;
  const safeIdx = c.voicings ? Math.min(idx, c.voicings.length - 1) : 0;
  const shape = c.voicings ? c.voicings[safeIdx] : null;
  return (
    <ChordDiagram
      key={i}
      name={c.name}
      shape={shape}
      variant={variant}
      size={size}
      voicingIndex={safeIdx}
      voicingCount={c.voicings ? c.voicings.length : 1}
      voicingLabel={shape && shape.label}
      onCycle={onCycle ? (dir) => onCycle(c.name, dir) : null}
    />
  );
}

function VariantEditorial({ chords, title, meta, nodeRef, voicingState, onCycle }) {
  return (
    <div ref={nodeRef} style={{
      width: 880, padding: '56px 64px 64px',
      background: '#fafaf7', color: '#1a1a1a',
      fontFamily: '"Inter", -apple-system, sans-serif',
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: 11, letterSpacing: '0.14em', color: '#8a8a8a', textTransform: 'uppercase',
        }}>
          Chord Chart · Guitar · Standard Tuning
        </div>
        <div style={{
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: 11, color: '#8a8a8a',
        }}>
          {chords.length.toString().padStart(2, '0')} chords
        </div>
      </div>

      <div style={{
        fontFamily: '"Fraunces", "Times New Roman", serif',
        fontSize: 44, fontWeight: 400, letterSpacing: '-0.02em',
        lineHeight: 1.05, marginBottom: 6,
      }}>
        {title || 'Untitled Song'}
      </div>
      {meta && (
        <div style={{ fontSize: 14, color: '#6a6a6a', fontStyle: 'italic' }}>{meta}</div>
      )}

      <div style={{ height: 1, background: '#1a1a1a', margin: '28px 0 32px' }} />

      {/* Grid of chord diagrams */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '28px 12px',
        alignItems: 'start',
      }}>
        {chords.map((c, i) => renderChord(c, i, 'editorial', 'md', voicingState, onCycle))}
      </div>

      {/* Footer legend */}
      <div style={{
        marginTop: 40, paddingTop: 16, borderTop: '1px solid #e5e3dc',
        display: 'flex', gap: 24, fontSize: 10.5, color: '#8a8a8a',
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        letterSpacing: '0.05em', textTransform: 'uppercase',
      }}>
        <span>○ open</span>
        <span>× muted</span>
        <span>● fret · finger</span>
        <span style={{ marginLeft: 'auto' }}>E A D G B E</span>
      </div>
    </div>
  );
}

function VariantPaper({ chords, title, meta, nodeRef, voicingState, onCycle }) {
  return (
    <div ref={nodeRef} style={{
      width: 880, padding: '60px 70px 70px',
      background: '#f5ecd9',
      backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(139,108,66,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139,108,66,0.04) 0%, transparent 50%)',
      color: '#2a1e12',
      fontFamily: '"EB Garamond", Georgia, serif',
      boxSizing: 'border-box',
      position: 'relative',
    }}>
      {/* Decorative corner marks */}
      {['tl', 'tr', 'bl', 'br'].map((pos) => {
        const p = {
          tl: { top: 20, left: 20 }, tr: { top: 20, right: 20 },
          bl: { bottom: 20, left: 20 }, br: { bottom: 20, right: 20 },
        }[pos];
        return (
          <div key={pos} style={{ position: 'absolute', ...p, width: 16, height: 16,
            borderTop: pos.startsWith('t') ? '1.5px solid #8a7560' : 'none',
            borderBottom: pos.startsWith('b') ? '1.5px solid #8a7560' : 'none',
            borderLeft: pos.endsWith('l') ? '1.5px solid #8a7560' : 'none',
            borderRight: pos.endsWith('r') ? '1.5px solid #8a7560' : 'none',
          }} />
        );
      })}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          fontFamily: '"Courier Prime", Courier, monospace',
          fontSize: 10.5, letterSpacing: '0.35em', color: '#8a7560',
          textTransform: 'uppercase', marginBottom: 10,
        }}>
          ~ Songbook ~
        </div>
        <div style={{
          fontSize: 48, fontWeight: 600, fontStyle: 'italic',
          letterSpacing: '-0.01em', lineHeight: 1.05,
        }}>
          {title || 'Untitled Song'}
        </div>
        {meta && (
          <div style={{ marginTop: 8, fontSize: 15, color: '#6a5542', fontStyle: 'italic' }}>
            — {meta} —
          </div>
        )}
        <div style={{
          margin: '20px auto 0', width: 120, height: 1,
          background: '#8a7560',
        }} />
      </div>

      {/* Diagrams */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '28px 18px',
        justifyItems: 'center',
        alignItems: 'start',
      }}>
        {chords.map((c, i) => renderChord(c, i, 'paper', 'md', voicingState, onCycle))}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 40, textAlign: 'center',
        fontFamily: '"Courier Prime", Courier, monospace',
        fontSize: 10, color: '#8a7560', letterSpacing: '0.2em',
        textTransform: 'uppercase',
      }}>
        Guitar · Standard Tuning · E  A  D  G  B  E
      </div>
    </div>
  );
}

function VariantMono({ chords, title, meta, nodeRef, voicingState, onCycle }) {
  return (
    <div ref={nodeRef} style={{
      width: 880, padding: '48px 56px 56px',
      background: '#0f0f0f', color: '#e8e8e8',
      fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace',
      boxSizing: 'border-box',
    }}>
      {/* Terminal-style header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24,
        fontSize: 11, color: '#707070',
      }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56', display: 'inline-block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f', display: 'inline-block' }} />
        <span style={{ marginLeft: 12 }}>~ / chords / {(title || 'untitled').toLowerCase().replace(/\s+/g, '-')}.chart</span>
      </div>

      <div style={{ fontSize: 11, color: '#707070', marginBottom: 4 }}>
        <span style={{ color: '#27c93f' }}>$</span> chord-gen --instrument=guitar --tuning=standard
      </div>
      <div style={{ fontSize: 11, color: '#707070', marginBottom: 18 }}>
        <span style={{ color: '#707070' }}># parsed {chords.length} unique chord{chords.length === 1 ? '' : 's'}</span>
      </div>

      {/* Title block */}
      <div style={{
        border: '1px solid #2a2a2a', padding: '14px 18px', marginBottom: 28,
        background: '#181818',
      }}>
        <div style={{ fontSize: 10, color: '#707070', letterSpacing: '0.1em', marginBottom: 4 }}>
          TITLE
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, color: '#f5f5f5', letterSpacing: '0.01em' }}>
          {title || 'untitled'}
        </div>
        {meta && (
          <div style={{ fontSize: 12, color: '#909090', marginTop: 4 }}>
            // {meta}
          </div>
        )}
      </div>

      {/* Diagrams inverted-colors */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '24px 8px',
        padding: '20px 12px',
        border: '1px dashed #2a2a2a',
        background: '#181818',
        alignItems: 'start',
      }}>
        {chords.map((c, i) => (
          <div key={i} style={{ filter: 'invert(1) hue-rotate(180deg)' }}>
            {renderChord(c, i, 'mono', 'md', voicingState, onCycle)}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 20, fontSize: 10, color: '#707070',
      }}>
        <span style={{ color: '#27c93f' }}>$</span> <span style={{ color: '#909090' }}>_</span>
      </div>
    </div>
  );
}

export { VariantEditorial, VariantPaper, VariantMono };
