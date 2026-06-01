import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function FlashCard({ vocab, isFlipped, onFlip }) {
  return (
    <div className="flashcard-scene" onClick={onFlip} style={{ userSelect: 'none' }}>
      <div className={`flashcard-body${isFlipped ? ' flipped' : ''}`} style={{ minHeight: '220px' }}>
        {/* Front */}
        <div className="flashcard-face flashcard-front">
          <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.5, marginBottom: '4px' }}>
            日本語
          </div>
          <div className="flashcard-jp">{vocab.jp}</div>
          <div style={{ marginTop: '6px', fontSize: '11px', opacity: 0.5, fontFamily: 'var(--font-jp)' }}>
            {vocab.id}
          </div>
          <div style={{ marginTop: '20px', fontSize: '12px', opacity: 0.4, letterSpacing: '0.06em' }}>
            TAP UNTUK BALIK
          </div>
        </div>

        {/* Back */}
        <div className="flashcard-face flashcard-back" style={{ minHeight: '220px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.5, marginBottom: '4px' }}>
            Indonesia
          </div>
          <div className="flashcard-indo">{vocab.indo}</div>
          <div style={{ marginTop: '16px', fontSize: '13px', fontFamily: 'var(--font-jp)', opacity: 0.7 }}>
            {vocab.jp}
          </div>
          <div style={{ marginTop: '20px', fontSize: '12px', opacity: 0.4, letterSpacing: '0.06em' }}>
            TAP UNTUK KEMBALI
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FlashcardPage() {
  const { lessonId } = useParams()
  const navigate     = useNavigate()
  const { getLessonById } = useApp()

  const lesson = getLessonById(lessonId)
  const vocab  = lesson?.vocab ?? []

  const [index,   setIndex]   = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known,   setKnown]   = useState(new Set())
  const [unknown, setUnknown] = useState(new Set())
  const [done,    setDone]    = useState(false)

  const current  = vocab[index]
  const total    = vocab.length

  const handleFlip = () => setFlipped(f => !f)

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
      if (index + 1 >= total) setDone(true)
      else setIndex(i => i + 1)
    }, 200)
  }, [current, index, total])

  const handlePrev = () => {
    if (index > 0) { setIndex(i => i - 1); setFlipped(false) }
  }
  const handleNext = () => {
    if (index + 1 < total) { setIndex(i => i + 1); setFlipped(false) }
    else setDone(true)
  }

  const handleRestart = () => {
    setIndex(0); setFlipped(false); setKnown(new Set()); setUnknown(new Set()); setDone(false)
  }

  if (!lesson || !vocab.length) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '12px' }}>
        <div style={{ fontSize: '48px' }}>😕</div>
        <p className="text-secondary">Tidak ada kosakata untuk pelajaran ini</p>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Kembali</button>
      </div>
    )
  }

  // Done screen
  if (done) {
    const knownPct = total ? Math.round((known.size / total) * 100) : 0
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
        <div className="page-header">
          <div className="page-header-inner">
            <button className="back-btn" onClick={() => navigate(`/lesson/${lessonId}`)}>←</button>
            <span style={{ fontWeight: '700' }}>Flashcard Selesai</span>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '20px' }}>
          <div style={{ fontSize: '64px' }}>{knownPct >= 80 ? '🎉' : knownPct >= 50 ? '👍' : '💪'}</div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Sesi Selesai!</h2>
            <p className="text-secondary" style={{ marginTop: '6px' }}>{lesson.title}</p>
          </div>

          <div className="card" style={{ width: '100%', maxWidth: 340, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--green)' }}>{known.size}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>✅ Hafal</div>
              </div>
              <div style={{ width: '1px', background: 'var(--border)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--accent)' }}>{unknown.size}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>❌ Perlu Latihan</div>
              </div>
              <div style={{ width: '1px', background: 'var(--border)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--indigo)' }}>{total}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Total Kartu</div>
              </div>
            </div>
            <div className="progress-bar-wrap" style={{ marginTop: '16px' }}>
              <div className="progress-bar-fill" style={{ width: `${knownPct}%` }} />
            </div>
            <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
              {knownPct}% hafal
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: 340 }}>
            <button className="btn btn-primary btn-full" onClick={handleRestart}>🔄 Ulangi Semua</button>
            {unknown.size > 0 && (
              <button className="btn btn-outline btn-full" onClick={() => {
                // Filter to only unknown vocab
                setIndex(0); setFlipped(false); setKnown(new Set()); setUnknown(new Set()); setDone(false)
              }}>
                ❌ Latih Yang Belum Hafal ({unknown.size})
              </button>
            )}
            <button className="btn btn-secondary btn-full" onClick={() => navigate(`/lesson/${lessonId}/quiz`)}>
              🧪 Lanjut ke Quiz
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
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
            {index + 1}/{total}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="progress-bar-wrap" style={{ borderRadius: 0, height: '4px', background: 'var(--border)' }}>
        <div className="progress-bar-fill" style={{ width: `${pct}%`, borderRadius: 0 }} />
      </div>

      {/* Card area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 20px', gap: '24px', maxWidth: 640, margin: '0 auto', width: '100%' }}>
        {/* Known/Unknown counters */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="badge badge-green">✅ {known.size} hafal</span>
          <span className="badge badge-accent">❌ {unknown.size} belum</span>
        </div>

        {/* Flashcard */}
        <FlashCard vocab={current} isFlipped={flipped} onFlip={handleFlip} />

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handlePrev}
            disabled={index === 0}
            style={{ opacity: index === 0 ? 0.4 : 1, minWidth: 60 }}
          >
            ‹ Prev
          </button>

          <button
            className="btn btn-sm"
            onClick={handleNext}
            style={{ minWidth: 60, background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
          >
            Next ›
          </button>
        </div>

        {/* Mark buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn btn-full"
            onClick={() => handleMark(false)}
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: '700', flex: 1 }}
          >
            ❌ Belum Hafal
          </button>
          <button
            className="btn btn-full"
            onClick={() => handleMark(true)}
            style={{ background: 'var(--green-soft)', color: 'var(--green)', fontWeight: '700', flex: 1 }}
          >
            ✅ Hafal!
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
          Tap kartu untuk membalik • Klik tombol untuk menandai
        </p>
      </div>
    </div>
  )
}
