import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

// Audio helper using Web Speech API
function speakJapanese(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'ja-JP'
  utter.rate = 0.85
  window.speechSynthesis.speak(utter)
}

// Furigana component
function Furigana({ jp, reading }) {
  if (!reading) return <span className="vocab-jp">{jp}</span>
  return (
    <ruby style={{ fontFamily: 'var(--font-jp)', fontSize: '1.1rem', fontWeight: 700 }}>
      {jp}
      <rt style={{ fontSize: '0.55rem', fontWeight: 400, color: 'var(--text-muted)', letterSpacing: '0.03em' }}>
        {reading}
      </rt>
    </ruby>
  )
}

// ── Tab: Materi ───────────────────────────────────────────────────────────────
function TabMateri({ lesson }) {
  const [lang, setLang] = useState('id')

  return (
    <div style={{ paddingBottom: '16px' }}>
      <div style={{ marginBottom: '16px' }}>
        <div className="tabs" style={{ maxWidth: '220px' }}>
          <button className={`tab-btn${lang === 'id' ? ' active' : ''}`} onClick={() => setLang('id')}>
            🇮🇩 Indonesia
          </button>
          <button className={`tab-btn${lang === 'jp' ? ' active' : ''}`} onClick={() => setLang('jp')}>
            🇯🇵 日本語
          </button>
        </div>
      </div>

      {lang === 'id' ? (
        <div className="animate-fadeUp">
          <div className="card" style={{ padding: '18px' }}>
            <p className="content-id" style={{ whiteSpace: 'pre-wrap' }}>{lesson.content_id}</p>
          </div>
          {lesson.main_points?.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div className="section-title">Poin Penting (JP)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {lesson.main_points.map((pt, i) => (
                  <div key={i} className="key-point">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--indigo)', marginTop: 6, flexShrink: 0 }} />
                    <p style={{ fontSize: '13.5px', fontFamily: 'var(--font-jp)', lineHeight: '1.7', color: 'var(--text-primary)' }}>
                      {pt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-fadeUp">
          <div className="card" style={{ padding: '18px' }}>
            <p className="content-text">{lesson.content_jp}</p>
          </div>
          {lesson.main_points?.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div className="section-title">重要ポイント</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {lesson.main_points.map((pt, i) => (
                  <div key={i} className="key-point">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--indigo)', marginTop: 6, flexShrink: 0 }} />
                    <p style={{ fontSize: '13.5px', fontFamily: 'var(--font-jp)', lineHeight: '1.7', color: 'var(--text-primary)' }}>
                      {pt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Tab: Kosakata ─────────────────────────────────────────────────────────────
function TabKosakata({ lesson }) {
  const { bookmarks, toggleBookmarkVocab } = useApp()
  const [speaking, setSpeaking] = useState(null)

  const handleSpeak = useCallback((v) => {
    setSpeaking(v.id)
    speakJapanese(v.jp)
    setTimeout(() => setSpeaking(null), 1500)
  }, [])

  if (!lesson.vocab?.length) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Tidak ada kosakata</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      <div className="card" style={{ overflow: 'hidden' }}>
        {lesson.vocab.map((v, i) => {
          const saved = bookmarks.vocab.has(v.id)
          const isSpeaking = speaking === v.id
          return (
            <div key={v.id}>
              {i > 0 && <div className="divider" style={{ margin: 0 }} />}
              <div className="vocab-item">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Furigana jp={v.jp} reading={v.reading} />
                  <div className="vocab-id" style={{ marginTop: 4 }}>{v.indo}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  {/* Audio button */}
                  <button
                    onClick={() => handleSpeak(v)}
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: isSpeaking ? 'var(--indigo-soft)' : 'var(--bg-subtle)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '15px', transition: 'all 0.2s',
                      border: isSpeaking ? '1.5px solid var(--indigo)' : '1.5px solid transparent'
                    }}
                    aria-label="Putar audio"
                  >
                    {isSpeaking ? '🔊' : '🔈'}
                  </button>
                  {/* Bookmark button */}
                  <button
                    onClick={() => toggleBookmarkVocab(v.id)}
                    style={{ fontSize: '20px', padding: '4px', lineHeight: 1 }}
                    aria-label={saved ? 'Hapus dari simpanan' : 'Simpan vocab'}
                  >
                    {saved ? '⭐' : '☆'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>💡</span>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Tap 🔈 untuk mendengar pengucapan · Furigana menunjukkan cara baca kanji
        </p>
      </div>
    </div>
  )
}

// ── Tab: Quiz ─────────────────────────────────────────────────────────────────
function TabQuiz({ lesson, lessonId, navigate }) {
  const { progress } = useApp()
  const result = progress[lessonId]

  return (
    <div>
      {result?.quizPercent != null && (
        <div className="card animate-fadeUp" style={{ padding: '16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            border: `4px solid ${result.quizPercent >= 70 ? 'var(--green)' : 'var(--accent)'}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <span style={{ fontSize: '16px', fontWeight: '800', color: result.quizPercent >= 70 ? 'var(--green)' : 'var(--accent)' }}>
              {result.quizPercent}%
            </span>
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '15px' }}>
              {result.quizPercent >= 70 ? '🎉 Bagus!' : '💪 Coba lagi'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Skor terakhir: {result.quizScore}/{result.quizTotal} soal benar
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>✏️</div>
        <h3 style={{ fontWeight: '700', fontSize: '17px' }}>Latihan Soal</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
          {lesson.quiz?.length ?? 0} pertanyaan pilihan ganda
        </p>
        <button className="btn btn-primary btn-full mt-4" onClick={() => navigate(`/lesson/${lessonId}/quiz`)}>
          Mulai Quiz →
        </button>
        {result?.quizPercent != null && (
          <button className="btn btn-outline btn-full" style={{ marginTop: '10px' }} onClick={() => navigate(`/lesson/${lessonId}/quiz`)}>
            Ulangi Quiz
          </button>
        )}
      </div>

      <div style={{ marginTop: '14px' }}>
        <div className="section-title">Pratinjau Soal</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {lesson.quiz?.map((q, i) => (
            <div key={i} className="card" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px' }}>Soal {i + 1}</div>
              <p style={{ fontSize: '14px', fontFamily: 'var(--font-jp)', lineHeight: '1.6' }}>{q.question}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'materi',   label: '📖 Materi' },
  { id: 'kosakata', label: '🈳 Kosakata' },
  { id: 'quiz',     label: '✏️ Quiz' },
]

export default function LessonPage() {
  const { lessonId } = useParams()
  const navigate     = useNavigate()
  const { getLessonById, bookmarks, toggleBookmarkLesson } = useApp()
  const [tab, setTab] = useState('materi')

  const lesson = getLessonById(lessonId)

  if (!lesson) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px' }}>😕</div>
        <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Pelajaran tidak ditemukan</p>
        <button className="btn btn-secondary mt-4" onClick={() => navigate('/')}>← Kembali</button>
      </div>
    )
  }

  const saved = bookmarks.lessons.has(lessonId)

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-header-inner">
          <button className="back-btn" onClick={() => navigate(-1)}>←</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {lesson.categoryName}
            </div>
            <h1 style={{ fontSize: '15px', fontWeight: '700', lineHeight: '1.3', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {lesson.title}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={() => toggleBookmarkLesson(lessonId)}
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}
            >
              {saved ? '⭐' : '☆'}
            </button>
            <button
              onClick={() => navigate(`/lesson/${lessonId}/flashcard`)}
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--indigo-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}
            >
              🎴
            </button>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', padding: '8px 16px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="badge badge-indigo">{lesson.lesson_id}</span>
          <span className="badge badge-accent">{lesson.vocab?.length ?? 0} kosakata</span>
          <span className="badge badge-gold">{lesson.quiz?.length ?? 0} soal</span>
        </div>
      </div>

      <div style={{ padding: '12px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', position: 'sticky', top: '69px', zIndex: 40 }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div className="tabs">
            {TABS.map(t => (
              <button key={t.id} className={`tab-btn${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="page-content" style={{ paddingTop: '16px' }}>
        {tab === 'materi'   && <TabMateri   lesson={lesson} />}
        {tab === 'kosakata' && <TabKosakata lesson={lesson} />}
        {tab === 'quiz'     && <TabQuiz     lesson={lesson} lessonId={lessonId} navigate={navigate} />}
      </div>
    </div>
  )
}
