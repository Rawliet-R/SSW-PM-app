import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const FILTER_TABS = [
  { id: 'all',      label: 'Semua' },
  { id: 'lesson',   label: '📖 Pelajaran' },
  { id: 'vocab',    label: '📚 Kosakata' },
]

function highlight(text, query) {
  if (!query || !text) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: '3px', padding: '0 2px' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

function LessonResult({ lesson, query, progress, onClick }) {
  const done  = progress[lesson.lesson_id]?.completed
  const score = progress[lesson.lesson_id]?.quizPercent
  return (
    <button className="card card-hover animate-fadeUp" style={{ width: '100%', padding: '14px 16px', textAlign: 'left', display: 'flex', gap: '12px', alignItems: 'flex-start' }} onClick={onClick}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: done ? 'var(--green-soft)' : 'var(--indigo-soft)',
        color: done ? 'var(--green)' : 'var(--indigo)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px'
      }}>
        {done ? '✓' : '📖'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: '700', lineHeight: '1.4' }}>
          {highlight(lesson.title, query)}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
          {lesson.categoryName} · {lesson.vocab?.length ?? 0} kosakata
          {score != null && <span style={{ color: 'var(--green)', marginLeft: '6px' }}>✓ {score}%</span>}
        </div>
        <span className="badge badge-indigo" style={{ marginTop: '6px', fontSize: '11px' }}>{lesson.lesson_id}</span>
      </div>
      <span style={{ color: 'var(--text-muted)', fontSize: '18px', flexShrink: 0 }}>›</span>
    </button>
  )
}

function VocabResult({ vocab, query, bookmarks, onToggleBookmark }) {
  const saved = bookmarks.vocab.has(vocab.id)
  return (
    <div className="card animate-fadeUp" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-jp)', fontSize: '1.1rem', fontWeight: '700' }}>
          {highlight(vocab.jp, query)}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          {highlight(vocab.indo, query)}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
          {vocab.lessonTitle}
        </div>
      </div>
      <button
        onClick={() => onToggleBookmark(vocab.id)}
        style={{ fontSize: '20px', padding: '4px', flexShrink: 0, lineHeight: 1 }}
        aria-label={saved ? 'Hapus dari simpanan' : 'Simpan'}
      >
        {saved ? '⭐' : '☆'}
      </button>
    </div>
  )
}

export default function SearchPage() {
  const navigate = useNavigate()
  const { allLessons, allVocab, progress, bookmarks, toggleBookmarkVocab } = useApp()
  const [query,  setQuery]  = useState('')
  const [filter, setFilter] = useState('all')
  const inputRef = useRef(null)

  const q = query.trim().toLowerCase()

  const matchedLessons = useMemo(() => {
    if (!q) return []
    return allLessons.filter(l =>
      l.title?.toLowerCase().includes(q) ||
      l.lesson_id?.toLowerCase().includes(q) ||
      l.categoryName?.toLowerCase().includes(q) ||
      l.content_id?.toLowerCase().includes(q)
    )
  }, [allLessons, q])

  const matchedVocab = useMemo(() => {
    if (!q) return []
    return allVocab.filter(v =>
      v.jp?.toLowerCase().includes(q) ||
      v.indo?.toLowerCase().includes(q) ||
      v.id?.toLowerCase().includes(q)
    ).slice(0, 40)
  }, [allVocab, q])

  const showLessons = (filter === 'all' || filter === 'lesson') && matchedLessons.length > 0
  const showVocab   = (filter === 'all' || filter === 'vocab')  && matchedVocab.length > 0
  const noResults   = q && matchedLessons.length === 0 && matchedVocab.length === 0

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-inner" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '10px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '800' }}>🔍 Cari</h1>
          <div className="search-bar">
            <span style={{ fontSize: '18px', color: 'var(--text-muted)', flexShrink: 0 }}>🔍</span>
            <input
              ref={inputRef}
              type="search"
              placeholder="Cari pelajaran, kosakata, terjemahan…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
            />
            {query && (
              <button onClick={() => { setQuery(''); inputRef.current?.focus() }} style={{ fontSize: '18px', color: 'var(--text-muted)', padding: '2px', flexShrink: 0 }}>✕</button>
            )}
          </div>
        </div>
      </div>

      <div className="page-content" style={{ paddingTop: '16px' }}>
        {/* Filter tabs */}
        {q && (
          <div className="tabs" style={{ marginBottom: '16px' }}>
            {FILTER_TABS.map(t => (
              <button key={t.id} className={`tab-btn${filter === t.id ? ' active' : ''}`} onClick={() => setFilter(t.id)}>
                {t.label}
                {t.id === 'lesson' && matchedLessons.length > 0 && (
                  <span className="badge badge-indigo" style={{ marginLeft: '6px', fontSize: '11px', padding: '1px 6px' }}>{matchedLessons.length}</span>
                )}
                {t.id === 'vocab' && matchedVocab.length > 0 && (
                  <span className="badge badge-accent" style={{ marginLeft: '6px', fontSize: '11px', padding: '1px 6px' }}>{matchedVocab.length}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!q && (
          <div style={{ textAlign: 'center', padding: '56px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
            <h2 style={{ fontWeight: '700', fontSize: '18px' }}>Cari Apa Saja</h2>
            <p className="text-secondary" style={{ marginTop: '8px', fontSize: '14px', lineHeight: '1.6' }}>
              Ketik kata kunci untuk mencari pelajaran, kosakata Jepang, atau terjemahan Indonesia
            </p>
            <div style={{ marginTop: '24px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {['HACCP', '食品衛生', '労働安全', 'keracunan', '5S'].map(s => (
                <button key={s} className="badge badge-indigo" style={{ cursor: 'pointer', fontSize: '13px', padding: '6px 14px' }} onClick={() => setQuery(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {noResults && (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>😕</div>
            <h2 style={{ fontWeight: '700', fontSize: '17px' }}>Tidak Ditemukan</h2>
            <p className="text-secondary" style={{ marginTop: '6px', fontSize: '14px' }}>
              Tidak ada hasil untuk "<strong>{query}</strong>"
            </p>
          </div>
        )}

        {/* Lesson results */}
        {showLessons && (
          <div style={{ marginBottom: '20px' }}>
            <div className="section-title">
              Pelajaran ({matchedLessons.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {matchedLessons.map(l => (
                <LessonResult
                  key={l.lesson_id}
                  lesson={l}
                  query={query}
                  progress={progress}
                  onClick={() => navigate(`/lesson/${l.lesson_id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Vocab results */}
        {showVocab && (
          <div>
            <div className="section-title">
              Kosakata ({matchedVocab.length}{matchedVocab.length === 40 ? '+' : ''})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {matchedVocab.map(v => (
                <VocabResult
                  key={`${v.id}-${v.lessonId}`}
                  vocab={v}
                  query={query}
                  bookmarks={bookmarks}
                  onToggleBookmark={toggleBookmarkVocab}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
