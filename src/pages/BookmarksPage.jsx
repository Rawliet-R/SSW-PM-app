import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const TABS = [
  { id: 'lessons', label: '📖 Pelajaran' },
  { id: 'vocab',   label: '📚 Kosakata'  },
  { id: 'progress',label: '📊 Progress'  },
]

// ── Bookmarked Lessons ────────────────────────────────────────────────────────
function BookmarkedLessons({ lessons, progress, onNavigate, onRemove }) {
  if (!lessons.length) {
    return (
      <div style={{ textAlign: 'center', padding: '56px 24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>⭐</div>
        <h3 style={{ fontWeight: '700', fontSize: '17px' }}>Belum Ada Pelajaran Tersimpan</h3>
        <p className="text-secondary" style={{ marginTop: '6px', fontSize: '14px' }}>
          Simpan pelajaran dengan menekan ikon ⭐ di halaman pelajaran
        </p>
        <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => onNavigate('/')}>
          Jelajahi Pelajaran
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {lessons.map((l, i) => {
        const done  = progress[l.lesson_id]?.completed
        const score = progress[l.lesson_id]?.quizPercent
        return (
          <div key={l.lesson_id} className="card animate-fadeUp" style={{ animationDelay: `${i * 0.05}s`, overflow: 'hidden' }}>
            <button
              onClick={() => onNavigate(`/lesson/${l.lesson_id}`)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px', width: '100%', textAlign: 'left' }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: done ? 'var(--green-soft)' : 'var(--indigo-soft)',
                color: done ? 'var(--green)' : 'var(--indigo)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', flexShrink: 0
              }}>
                {done ? '✓' : '📖'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '700', fontSize: '14.5px', lineHeight: '1.3' }}>{l.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                  {l.categoryName}
                  {score != null && <span style={{ color: 'var(--green)', marginLeft: '8px' }}>✓ {score}%</span>}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <span className="badge badge-indigo" style={{ fontSize: '11px' }}>{l.lesson_id}</span>
                  <span className="badge badge-accent" style={{ fontSize: '11px' }}>{l.vocab?.length} kata</span>
                  <span className="badge badge-amber" style={{ fontSize: '11px' }}>{l.quiz?.length} soal</span>
                </div>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '18px', flexShrink: 0, alignSelf: 'center' }}>›</span>
            </button>
            <div style={{ borderTop: '1px solid var(--border)', display: 'flex' }}>
              <button
                onClick={() => onNavigate(`/lesson/${l.lesson_id}/flashcard`)}
                style={{ flex: 1, padding: '10px', fontSize: '13px', fontWeight: '600', color: 'var(--indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                🎴 Flashcard
              </button>
              <div style={{ width: '1px', background: 'var(--border)' }} />
              <button
                onClick={() => onNavigate(`/lesson/${l.lesson_id}/quiz`)}
                style={{ flex: 1, padding: '10px', fontSize: '13px', fontWeight: '600', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                🧪 Quiz
              </button>
              <div style={{ width: '1px', background: 'var(--border)' }} />
              <button
                onClick={() => onRemove(l.lesson_id)}
                style={{ padding: '10px 14px', fontSize: '16px', color: 'var(--text-muted)' }}
                aria-label="Hapus bookmark"
              >
                🗑
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Bookmarked Vocab ──────────────────────────────────────────────────────────
function BookmarkedVocab({ vocabList, onRemove }) {
  if (!vocabList.length) {
    return (
      <div style={{ textAlign: 'center', padding: '56px 24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📚</div>
        <h3 style={{ fontWeight: '700', fontSize: '17px' }}>Belum Ada Kosakata Tersimpan</h3>
        <p className="text-secondary" style={{ marginTop: '6px', fontSize: '14px' }}>
          Simpan kosakata dengan menekan ikon ☆ di halaman pelajaran
        </p>
      </div>
    )
  }

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {vocabList.map((v, i) => (
        <div key={v.id}>
          {i > 0 && <div className="divider" style={{ margin: 0 }} />}
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '12px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-jp)', fontSize: '1.1rem', fontWeight: '700' }}>{v.jp}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{v.indo}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{v.lessonTitle}</div>
            </div>
            <button
              onClick={() => onRemove(v.id)}
              style={{ fontSize: '20px', color: 'var(--accent)', flexShrink: 0, lineHeight: 1 }}
              aria-label="Hapus dari simpanan"
            >
              ⭐
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Progress Tab ──────────────────────────────────────────────────────────────
function ProgressTab({ allLessons, progress, onNavigate }) {
  const completed  = allLessons.filter(l => progress[l.lesson_id]?.completed)
  const incomplete = allLessons.filter(l => !progress[l.lesson_id]?.completed)
  const totalVocab = allLessons.reduce((a, l) => a + (l.vocab?.length ?? 0), 0)
  const totalQuiz  = allLessons.reduce((a, l) => a + (l.quiz?.length ?? 0), 0)
  const avgScore   = completed.length
    ? Math.round(completed.reduce((a, l) => a + (progress[l.lesson_id]?.quizPercent ?? 0), 0) / completed.length)
    : null

  const pct = allLessons.length ? Math.round((completed.length / allLessons.length) * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Overview */}
      <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, #1a1a2e, #3730a3)', border: 'none' }}>
        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', fontWeight: '600' }}>Total Progress</div>
        <div style={{ color: '#fff', fontSize: '40px', fontWeight: '900', lineHeight: '1', marginTop: '4px' }}>
          {pct}<span style={{ fontSize: '20px', opacity: 0.6 }}>%</span>
        </div>
        <div className="progress-bar-wrap" style={{ marginTop: '12px', background: 'rgba(255,255,255,0.15)' }}>
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', marginTop: '8px' }}>
          {completed.length} dari {allLessons.length} pelajaran selesai
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {[
          { icon: '✅', label: 'Selesai',       value: completed.length, color: 'var(--green)' },
          { icon: '📊', label: 'Rata-rata Quiz', value: avgScore != null ? `${avgScore}%` : '-', color: 'var(--indigo)' },
          { icon: '📚', label: 'Total Kosakata', value: totalVocab, color: 'var(--accent)' },
          { icon: '🧪', label: 'Total Soal',     value: totalQuiz, color: 'var(--amber)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '22px' }}>{s.icon}</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: s.color, marginTop: '4px', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Completed list */}
      {completed.length > 0 && (
        <div>
          <div className="section-title">Sudah Selesai ({completed.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {completed.map(l => {
              const p = progress[l.lesson_id]
              return (
                <button key={l.lesson_id} className="card card-hover" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left' }}
                  onClick={() => onNavigate(`/lesson/${l.lesson_id}`)}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--green-soft)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', flexShrink: 0 }}>✓</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{l.categoryName}</div>
                  </div>
                  {p?.quizPercent != null && (
                    <span style={{ fontSize: '13px', fontWeight: '700', color: p.quizPercent >= 70 ? 'var(--green)' : 'var(--amber)', flexShrink: 0 }}>
                      {p.quizPercent}%
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Incomplete */}
      {incomplete.length > 0 && (
        <div>
          <div className="section-title">Belum Selesai ({incomplete.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {incomplete.map(l => (
              <button key={l.lesson_id} className="card card-hover" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left' }}
                onClick={() => onNavigate(`/lesson/${l.lesson_id}`)}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--bg-subtle)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>○</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13.5px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{l.categoryName}</div>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '18px', flexShrink: 0 }}>›</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main BookmarksPage ────────────────────────────────────────────────────────
export default function BookmarksPage() {
  const navigate = useNavigate()
  const { bookmarks, toggleBookmarkLesson, toggleBookmarkVocab, allLessons, allVocab, progress } = useApp()
  const [tab, setTab] = useState('lessons')

  const savedLessons = allLessons.filter(l => bookmarks.lessons.has(l.lesson_id))
  const savedVocab   = allVocab.filter(v => bookmarks.vocab.has(v.id))

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-header-inner" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '10px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '800' }}>⭐ Tersimpan</h1>
          <div className="tabs">
            {TABS.map(t => (
              <button key={t.id} className={`tab-btn${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
                {t.label}
                {t.id === 'lessons' && savedLessons.length > 0 && (
                  <span className="badge badge-indigo" style={{ marginLeft: '5px', fontSize: '11px', padding: '1px 5px' }}>{savedLessons.length}</span>
                )}
                {t.id === 'vocab' && savedVocab.length > 0 && (
                  <span className="badge badge-accent" style={{ marginLeft: '5px', fontSize: '11px', padding: '1px 5px' }}>{savedVocab.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="page-content" style={{ paddingTop: '16px' }}>
        {tab === 'lessons' && (
          <BookmarkedLessons
            lessons={savedLessons}
            progress={progress}
            onNavigate={navigate}
            onRemove={toggleBookmarkLesson}
          />
        )}
        {tab === 'vocab' && (
          <BookmarkedVocab
            vocabList={savedVocab}
            onRemove={toggleBookmarkVocab}
          />
        )}
        {tab === 'progress' && (
          <ProgressTab
            allLessons={allLessons}
            progress={progress}
            onNavigate={navigate}
          />
        )}
      </div>
    </div>
  )
}
