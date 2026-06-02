import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function speakJapanese(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'ja-JP'
  utter.rate = 0.85
  window.speechSynthesis.speak(utter)
}

function FlashCard({ vocab, isFlipped, onFlip }) {
  const handleAudio = (e) => {
    e.stopPropagation()
    speakJapanese(vocab.jp)
  }

  return (
    <div className="flashcard-scene" onClick={onFlip}>
      <div className={`flashcard-body${isFlipped ? ' flipped' : ''}`}>
        {/* Front - Japanese */}
        <div className="flashcard-face flashcard-front">
          <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.5 }}>
            日本語
          </div>

          {/* Furigana */}
          {vocab.reading ? (
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-jp)', letterSpacing: '0.1em', marginBottom: 4 }}>
                {vocab.reading}
              </div>
              <div className="flashcard-jp">{vocab.jp}</div>
            </div>
          ) : (
            <div className="flashcard-jp" style={{ marginTop: 8 }}>{vocab.jp}</div>
          )}

          {/* Audio button */}
          <button className="audio-btn" onClick={handleAudio} style={{ marginTop: 16 }}>
            🔊 Dengar
          </button>

          <div style={{ marginTop: '16px', fontSize: '11px', opacity: 0.35, letterSpacing: '0.06em' }}>
            TAP UNTUK BALIK ↻
          </div>
        </div>

        {/* Back - Indonesian */}
        <div className="flashcard-face flashcard-back">
          <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.5 }}>
            Indonesia
          </div>
          <div className="flashcard-indo" style={{ marginTop: 12 }}>{vocab.indo}</div>

          {/* Show JP on back too */}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {vocab.reading && (
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-jp)' }}>
                {vocab.reading}
              </div>
            )}
            <div style={{ fontSize: '1.1rem', fontFamily: 'var(--font-jp)', color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>
              {vocab.jp}
            </div>
          </div>

          <button className="audio-btn" onClick={handleAudio} style={{ marginTop: 14 }}>
            🔊 Dengar
          </button>

          <div style={{ marginTop: '16px', fontSize: '11px', opacity: 0.35, letterSpacing: '0.06em' }}>
            TAP UNTUK KEMBALI ↻
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FlashcardPage() {
  const { lessonId } = useParams()
  const navigate     = useNavigate()
  const { getLessonById, markLessonComplete } = useApp()

  const lesson = getLessonById(lessonId)
  const vocab  = lesson?.vocab ?? []

  const [index,   setIndex]   = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known,   setKnown]   = useState(new Set())
  const [unknown, setUnknown] = useState(new Set())
  const [done,    setDone]    = useState(false)

  const current = vocab[index]
  const total   = vocab.length

  const handleMark = useCallback((isKnown) => {
    const id = current.id
    if (isKnown) {
      setKnown(s => { const n = new Set(s); n.add(id); return n })
      setUnknown(s => { const n = new Set(s); n.delete(id); return n })
    } else {
      setUnknown(s => { const n = new Set(s); n.add(id); return n })
      setKnown(s => { const n = new Set(s); n.delete(id); return n })
    }
    setFlipped(false)
    setTimeout(() => {
      if (index + 1 >= total) {
        setDone(true)
        markLessonComplete(lessonId)
      } else {
        setIndex(i => i + 1)
      }
    }, 180)
  }, [current, index, total, lessonId, markLessonComplete])

  const handlePrev = () => { if (index > 0) { setIndex(i => i - 1); setFlipped(false) } }
  const handleNext = () => {
    if (index + 1 < total) { setIndex(i => i + 1); setFlipped(false) }
    else { setDone(true); markLessonComplete(lessonId) }
  }
  const handleRestart = () => {
    setIndex(0); setFlipped(false); setKnown(new Set()); setUnknown(new Set()); setDone(false)
  }

  if (!lesson || !vocab.length) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '12px' }}>
        <div style={{ fontSize: '48px' }}>😕</div>
        <p style={{ color: 'var(--text-secondary)' }}>Tidak ada kosakata</p>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Kembali</button>
      </div>
    )
  }

  // ── Done screen ─────────────────────────────────────────────────────────────
  if (done) {
    const knownPct = total ? Math.round((known.size / total) * 100) : 0
    const emoji = knownPct >= 80 ? '🎉' : knownPct >= 50 ? '👍' : '💪'

    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
        <div className="page-header">
          <div className="page-header-inner">
            <button className="back-btn" onClick={() => navigate(`/lesson/${lessonId}`)}>←</button>
            <span style={{ fontWeight: '700' }}>Sesi Selesai!</span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '20px' }}>
          <div style={{ fontSize: '72px', animation: 'scaleIn 0.4s both' }}>{emoji}</div>

          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '800' }}>
              {knownPct >= 80 ? 'Luar Biasa!' : knownPct >= 50 ? 'Terus Semangat!' : 'Jangan Menyerah!'}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '14px' }}>{lesson.title}</p>
          </div>

          <div className="card" style={{ width: '100%', maxWidth: 340, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '34px', fontWeight: '900', color: 'var(--green)' }}>{known.size}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>✅ Hafal</div>
              </div>
              <div style={{ width: '1px', background: 'var(--border)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '34px', fontWeight: '900', color: 'var(--accent)' }}>{unknown.size}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>❌ Perlu Latihan</div>
              </div>
              <div style={{ width: '1px', background: 'var(--border)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '34px', fontWeight: '900', color: 'var(--indigo)' }}>{total}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>Total</div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tingkat hafal</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: knownPct >= 70 ? 'var(--green)' : 'var(--accent)' }}>{knownPct}%</span>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{
                  width: `${knownPct}%`,
                  background: knownPct >= 70
                    ? 'linear-gradient(90deg, var(--green), #34d399)'
                    : 'linear-gradient(90deg, var(--accent), #ff9a9a)'
                }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: 340 }}>
            <button className="btn btn-primary btn-full" onClick={handleRestart}>🔄 Ulangi Semua</button>
            <button className="btn btn-full" onClick={() => navigate(`/lesson/${lessonId}/quiz`)}
              style={{ background: 'var(--indigo)', color: '#fff' }}>
              ✏️ Lanjut ke Quiz
            </button>
            <button className="btn btn-secondary btn-full" onClick={() => navigate(`/lesson/${lessonId}`)}>
              ← Kembali ke Pelajaran
            </button>
          </div>
        </div>
      </div>
    )
  }

  const pct = Math.round(((index + 1) / total) * 100)

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-inner" style={{ justifyContent: 'space-between' }}>
          <button className="back-btn" onClick={() => navigate(`/lesson/${lessonId}`)}>✕</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '700', fontSize: '15px' }}>Flashcard</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lesson.title}</div>
          </div>
          <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-secondary)' }}>
            {index + 1}<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/{total}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'var(--border)' }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, var(--accent), var(--indigo))',
          width: `${pct}%`,
          transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)'
        }} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 18px', gap: '20px', maxWidth: 640, margin: '0 auto', width: '100%' }}>
        {/* Counters */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="badge badge-green">✅ {known.size} hafal</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, alignSelf: 'center' }}>
            Kartu {index + 1} dari {total}
          </span>
          <span className="badge badge-accent">❌ {unknown.size} belum</span>
        </div>

        {/* Card */}
        <FlashCard vocab={current} isFlipped={flipped} onFlip={() => setFlipped(f => !f)} />

        {/* Nav */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={handlePrev} disabled={index === 0}
            style={{ opacity: index === 0 ? 0.4 : 1, minWidth: 70 }}>
            ‹ Prev
          </button>
          <button className="btn btn-sm" onClick={handleNext}
            style={{ minWidth: 70, background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>
            Next ›
          </button>
        </div>

        {/* Mark buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-full" onClick={() => handleMark(false)}
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: '700', flex: 1, fontSize: 14 }}>
            ❌ Belum Hafal
          </button>
          <button className="btn btn-full" onClick={() => handleMark(true)}
            style={{ background: 'var(--green-soft)', color: 'var(--green)', fontWeight: '700', flex: 1, fontSize: 14 }}>
            ✅ Hafal!
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
          Tap kartu untuk membalik • 🔊 untuk mendengar
        </p>
      </div>
    </div>
  )
}
