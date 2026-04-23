// Main app: lyrics input + Editorial chord sheet.

const { useState, useRef, useMemo, useEffect } = React;

const SAMPLE = `[A] Vẫn những câu hỏi nhỏ  [Bm] Sau bao tháng chia ly 
[D] Anh vẫn thường thắc mắc [E] Khi anh không làm [A] gì.  
 
Em dạo này [A] có còn [Amaj7] xem phim một [A] mình  
[Amaj7] Em dạo này [Bm7] có đồ [Bmaj9] ăn và [Bm7] shopping  
[Bmaj9] Ngày xuân em [E]có [E/F] xuống [F#7] phố không người [F#7]
Và [D] tán dương cỏ [Bm] cây lặng [E] thinh 

Chorus:
Và tình [A] yêu và tình [Amaj7] yêu và tình [A] yêu mới 
Dạo [Amaj7] này người ta [A] có khiến em [D] cười 

[A]Anh [Amaj7] dù không [A] muốn [Amaj7] 
Tình [A] cờ gặp lại [Amaj7] nhau lần [D] nữa [Dm] 
Nhưng [Bm] em có đi [E] trà đá Hồ [C#m] Gươm [C#m]`;

function LyricsInput({ value, onChange, title, onTitle, meta, onMeta }) {
  return (
    <div style={{
      width: 340, flex: '0 0 340px',
      background: '#ffffff',
      borderRight: '1px solid #e5e3dc',
      display: 'flex', flexDirection: 'column',
      fontFamily: '"Inter", -apple-system, sans-serif',
      height: '100vh', boxSizing: 'border-box',
    }}>
      <div style={{
        padding: '20px 22px 16px', borderBottom: '1px solid #e5e3dc',
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: 10, letterSpacing: '0.18em', color: '#8a8a8a',
          textTransform: 'uppercase', marginBottom: 6,
        }}>
          Chord Generator
        </div>
        <div style={{
          fontFamily: '"Fraunces", serif', fontSize: 22,
          letterSpacing: '-0.01em', lineHeight: 1.1,
        }}>
          Paste lyrics <span style={{ fontStyle: 'italic', color: '#8a8a8a' }}>with</span> [chords]
        </div>
      </div>

      <div style={{ padding: '16px 22px 8px', borderBottom: '1px solid #e5e3dc' }}>
        <label style={{ display: 'block', fontSize: 10, color: '#8a8a8a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
          Title
        </label>
        <input value={title} onChange={(e) => onTitle(e.target.value)}
          placeholder="Untitled Song"
          style={{
            width: '100%', border: 'none', outline: 'none',
            fontSize: 16, fontFamily: '"Fraunces", serif',
            padding: '2px 0', background: 'transparent',
            borderBottom: '1px solid transparent',
          }}
          onFocus={(e) => e.target.style.borderBottomColor = '#1a1a1a'}
          onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
        />
        <label style={{ display: 'block', fontSize: 10, color: '#8a8a8a', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 12, marginBottom: 4 }}>
          Artist / Subtitle
        </label>
        <input value={meta} onChange={(e) => onMeta(e.target.value)}
          placeholder="optional"
          style={{
            width: '100%', border: 'none', outline: 'none',
            fontSize: 13, fontFamily: '"Inter", sans-serif',
            padding: '2px 0', background: 'transparent',
            color: '#6a6a6a',
          }}
        />
      </div>

      <div style={{
        padding: '12px 22px 6px',
        fontSize: 10, color: '#8a8a8a', letterSpacing: '0.12em', textTransform: 'uppercase',
      }}>
        Lyrics
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your lyrics here. Chords in [square brackets] will be extracted."
        style={{
          flex: 1, margin: '0 18px 18px', padding: '12px 14px',
          border: '1px solid #e5e3dc', borderRadius: 6,
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: 12, lineHeight: 1.6, resize: 'none',
          outline: 'none', background: '#fcfbf8',
          color: '#2a2a2a',
        }}
      />
    </div>
  );
}

function ChordSheet({ chords, songTitle, meta, voicingState, onCycle }) {
  const ref = useRef(null);
  const [copyState, setCopyState] = useState('idle');

  async function copyPNG() {
    if (!ref.current || !window.htmlToImage) return;
    setCopyState('working');
    try {
      const blob = await window.htmlToImage.toBlob(ref.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      if (!blob) throw new Error('No blob');
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopyState('done');
      setTimeout(() => setCopyState('idle'), 1800);
    } catch (e) {
      console.error(e);
      try {
        const url = await window.htmlToImage.toPng(ref.current, { pixelRatio: 2 });
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(songTitle || 'chords').replace(/\s+/g, '-').toLowerCase()}.png`;
        a.click();
        setCopyState('done');
        setTimeout(() => setCopyState('idle'), 1800);
      } catch (e2) {
        setCopyState('error');
        setTimeout(() => setCopyState('idle'), 2200);
      }
    }
  }

  const btnLabel = {
    idle: 'Copy PNG',
    working: 'Copying…',
    done: '✓ Copied to clipboard',
    error: 'Couldn’t copy — try again',
  }[copyState];

  return (
    <div style={{
      minHeight: '100vh', padding: '32px 40px 80px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      boxSizing: 'border-box',
    }} data-printsheet>
      {/* Toolbar */}
      <div data-noprint style={{
        width: 880, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', paddingInline: 4,
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: 11, letterSpacing: '0.14em', color: 'rgba(60,50,40,0.7)',
          textTransform: 'uppercase',
        }}>
          Chord Sheet · {chords.length} chord{chords.length === 1 ? '' : 's'}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => window.print()}
            disabled={chords.length === 0}
            style={{
              border: '1px solid #1a1a1a', background: 'transparent', color: '#1a1a1a',
              padding: '8px 18px', borderRadius: 999,
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: chords.length === 0 ? 'default' : 'pointer',
              opacity: chords.length === 0 ? 0.4 : 1,
              transition: 'all .15s',
            }}
          >
            Print
          </button>
          <button
            onClick={copyPNG}
            disabled={copyState === 'working' || chords.length === 0}
            style={{
              border: '1px solid #1a1a1a', background: copyState === 'done' ? '#1a1a1a' : 'transparent',
              color: copyState === 'done' ? '#fafaf7' : '#1a1a1a',
              padding: '8px 18px', borderRadius: 999,
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: copyState === 'working' || chords.length === 0 ? 'default' : 'pointer',
              opacity: chords.length === 0 ? 0.4 : 1,
              transition: 'all .15s',
            }}
          >
            {btnLabel}
          </button>
        </div>
      </div>

      {/* The exportable artifact */}
      <div style={{
        boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)',
      }}>
        {chords.length === 0 ? (
          <div style={{
            width: 880, height: 500, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: '#fafaf7', color: '#8a8a8a',
            fontFamily: '"Inter", sans-serif', fontSize: 14,
          }}>
            No chords yet — paste lyrics with [chords] on the left.
          </div>
        ) : (
          <VariantEditorial
            chords={chords} title={songTitle} meta={meta} nodeRef={ref}
            voicingState={voicingState} onCycle={onCycle}
          />
        )}
      </div>
    </div>
  );
}

function App() {
  const [text, setText] = useState(() => localStorage.getItem('cg_text') || SAMPLE);
  const [title, setTitle] = useState(() => localStorage.getItem('cg_title') || 'Em Dạo Này');
  const [meta, setMeta] = useState(() => localStorage.getItem('cg_meta') || 'Ngọt · demo chart');

  useEffect(() => { localStorage.setItem('cg_text', text); }, [text]);
  useEffect(() => { localStorage.setItem('cg_title', title); }, [title]);
  useEffect(() => { localStorage.setItem('cg_meta', meta); }, [meta]);

  const chords = useMemo(() => {
    const names = window.ChordData.parseChords(text);
    const unique = names.map((n) => window.ChordData.lookupChord(n));
    return unique.slice().sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [text]);

  const [voicingState, setVoicingState] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cg_voicings') || '{}'); } catch { return {}; }
  });
  useEffect(() => { localStorage.setItem('cg_voicings', JSON.stringify(voicingState)); }, [voicingState]);

  const onCycle = React.useCallback((chordName, dir) => {
    setVoicingState((prev) => {
      const entry = chords.find((c) => c.name === chordName);
      if (!entry || !entry.voicings) return prev;
      const cur = prev[chordName] || 0;
      const next = ((cur + dir) % entry.voicings.length + entry.voicings.length) % entry.voicings.length;
      return { ...prev, [chordName]: next };
    });
  }, [chords]);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <div data-noprint style={{ display: 'contents' }}>
        <LyricsInput
          value={text} onChange={setText}
          title={title} onTitle={setTitle}
          meta={meta} onMeta={setMeta}
        />
      </div>
      <div data-printroot data-noprint-sidebar style={{ flex: 1, overflow: 'auto', background: '#f0eee9' }}>
        <ChordSheet
          chords={chords} songTitle={title} meta={meta}
          voicingState={voicingState} onCycle={onCycle}
        />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
