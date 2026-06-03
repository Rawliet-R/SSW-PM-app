import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { FuriganaText } from '../utils/furigana'

function speakJapanese(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'ja-JP'; u.rate = 0.85
  window.speechSynthesis.speak(u)
}

function VocabItem({ v, saved, onBookmark, furigana }) {
  const [speaking, setSpeaking] = useState(false)
  const speak = useCallback(() => {
    setSpeaking(true)
    speakJapanese(v.jp)
    setTimeout(() => setSpeaking(false), 1500)
  }, [v.jp])

  return (
    <div className="vocab-item">
      <div style={{ flex: 1, minWidth: 0 }}>
        {furigana && v.reading ? (
          <ruby style={{ fontFamily: 'var(--font-jp)', fontSize: '1.1rem', fontWeight: 700 }}>
            {v.jp}<rt style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 400 }}>{v.reading}</rt>
          </ruby>
        ) : (
          <div className="vocab-jp">{v.jp}</div>
        )}
        <div className="vocab-id" style={{ marginTop: 3 }}>{v.indo}</div>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
        <button onClick={speak} style={{
          width: 32, height: 32, borderRadius: '50%',
          background: speaking ? 'var(--indigo-soft)' : 'var(--bg-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, border: speaking ? '1.5px solid var(--indigo)' : '1.5px solid transparent'
        }}>
          {speaking ? '🔊' : '🔈'}
        </button>
        <button onClick={onBookmark} style={{ fontSize: 20, padding: 4, lineHeight: 1 }}>
          {saved ? '⭐' : '☆'}
        </button>
      </div>
    </div>
  )
}

function TabMateri({ lesson, furigana }) {
  const [lang, setLang] = useState('id')
  return (
    <div style={{ paddingBottom: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <div className="tabs" style={{ maxWidth: 220 }}>
          <button className={`tab-btn${lang === 'id' ? ' active' : ''}`} onClick={() => setLang('id')}>🇮🇩 Indonesia</button>
          <button className={`tab-btn${lang === 'jp' ? ' active' : ''}`} onClick={() => setLang('jp')}>🇯🇵 日本語</button>
        </div>
      </div>

      {lang === 'id' ? (
        <div className="animate-fadeUp">
          <div className="card" style={{ padding: 18 }}>
            <p className="content-id" style={{ whiteSpace: 'pre-wrap' }}>{lesson.content_id}</p>
          </div>
          {lesson.main_points?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className="section-title">Poin Penting</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {lesson.main_points.map((pt, i) => (
                  <div key={i} className="key-point">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--indigo)', marginTop: 6, flexShrink: 0 }} />
                    <p style={{ fontSize: 13.5, fontFamily: 'var(--font-jp)', lineHeight: 1.7 }}>
                      {furigana ? <FuriganaText text={pt} /> : pt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-fadeUp">
          <div className="card" style={{ padding: 18 }}>
            <p style={{ fontFamily: 'var(--font-jp)', fontSize: 15, lineHeight: 1.9 }}>
              {furigana ? <FuriganaText text={lesson.content_jp} /> : lesson.content_jp}
            </p>
          </div>
          {lesson.main_points?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className="section-title">重要ポイント</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {lesson.main_points.map((pt, i) => (
                  <div key={i} className="key-point">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--indigo)', marginTop: 6, flexShrink: 0 }} />
                    <p style={{ fontSize: 13.5, fontFamily: 'var(--font-jp)', lineHeight: 1.7 }}>
                      {furigana ? <FuriganaText text={pt} /> : pt}
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

function TabKosakata({ lesson, furigana }) {
  const { bookmarks, toggleBookmarkVocab } = useApp()
  if (!lesson.vocab?.length) return (
    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Tidak ada kosakata</div>
  )
  return (
    <div>
      <div className="card" style={{ overflow: 'hidden' }}>
        {lesson.vocab.map((v, i) => (
          <div key={v.id}>
            {i > 0 && <div className="divider" style={{ margin: 0 }} />}
            <VocabItem
              v={v}
              saved={bookmarks.vocab.has(v.id)}
              onBookmark={() => toggleBookmarkVocab(v.id)}
              furigana={furigana}
            />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>💡</span>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Tap 🔈 untuk mendengar · Furigana menunjukkan cara baca kanji
        </p>
      </div>
    </div>
  )
}

function TabQuiz({ lesson, lessonId, navigate }) {
  const { progress } = useApp()
  const result = progress[lessonId]
  return (
    <div>
      {result?.quizPercent != null && (
        <div className="card animate-fadeUp" style={{ padding: 16, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', border: `4px solid ${result.quizPercent >= 70 ? 'var(--green)' : 'var(--accent)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: result.quizPercent >= 70 ? 'var(--green)' : 'var(--accent)' }}>{result.quizPercent}%</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{result.quizPercent >= 70 ? '🎉 Bagus!' : '💪 Coba lagi'}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Skor: {result.quizScore}/{result.quizTotal}</div>
          </div>
        </div>
      )}
      <div className="card" style={{ padding: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✏️</div>
        <h3 style={{ fontWeight: 700, fontSize: 17 }}>Latihan Soal</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>{lesson.quiz?.length ?? 0} pertanyaan pilihan ganda</p>
        <button className="btn btn-primary btn-full mt-4" onClick={() => navigate(`/lesson/${lessonId}/quiz`)}>Mulai Quiz →</button>
        {result?.quizPercent != null && (
          <button className="btn btn-outline btn-full" style={{ marginTop: 10 }} onClick={() => navigate(`/lesson/${lessonId}/quiz`)}>Ulangi Quiz</button>
        )}
      </div>
      <div style={{ marginTop: 14 }}>
        <div className="section-title">Pratinjau Soal</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lesson.quiz?.map((q, i) => (
            <div key={i} className="card" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>Soal {i+1}</div>
              <p style={{ fontSize: 14, fontFamily: 'var(--font-jp)', lineHeight: 1.6 }}>{q.question}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const TABS = [
  { id: 'materi', label: '📖 Materi' },
  { id: 'kosakata', label: '🈳 Kosakata' },
  { id: 'quiz', label: '✏️ Quiz' },
]

export default function LessonPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { getLessonById, bookmarks, toggleBookmarkLesson, furiganaEnabled, setFuriganaEnabled } = useApp()
  const [tab, setTab] = useState('materi')
  const lesson = getLessonById(lessonId)

  if (!lesson) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 40 }}>😕</div>
      <p style={{ marginTop: 12, color: 'var(--text-secondary)' }}>Pelajaran tidak ditemukan</p>
      <button className="btn btn-secondary mt-4" onClick={() => navigate('/')}>← Kembali</button>
    </div>
  )

  const saved = bookmarks.lessons.has(lessonId)

  return (
    <div className="page-wrapper">
      {/* Furigana toggle - floating */}
      <button
        onClick={() => setFuriganaEnabled(f => !f)}
        className={`furigana-toggle${furiganaEnabled ? ' active' : ''}`}
        title={furiganaEnabled ? 'Furigana ON' : 'Furigana OFF'}
      >
        ふ
      </button>

      <div className="page-header">
        <div className="page-header-inner">
          <button className="back-btn" onClick={() => navigate(-1)}>←</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{lesson.categoryName}</div>
            <h1 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson.title}</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={() => toggleBookmarkLesson(lessonId)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              {saved ? '⭐' : '☆'}
            </button>
            <button onClick={() => navigate(`/lesson/${lessonId}/flashcard`)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--indigo-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              🎴
            </button>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', padding: '8px 16px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="badge badge-indigo">{lesson.lesson_id}</span>
          <span className="badge badge-accent">{lesson.vocab?.length ?? 0} kosakata</span>
          <span className="badge badge-gold">{lesson.quiz?.length ?? 0} soal</span>
        </div>
      </div>

      <div style={{ padding: '12px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 69, zIndex: 40 }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div className="tabs">
            {TABS.map(t => (
              <button key={t.id} className={`tab-btn${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="page-content" style={{ paddingTop: 16 }}>
        {tab === 'materi' && <TabMateri lesson={lesson} furigana={furiganaEnabled} />}
        {tab === 'kosakata' && <TabKosakata lesson={lesson} furigana={furiganaEnabled} />}
        {tab === 'quiz' && <TabQuiz lesson={lesson} lessonId={lessonId} navigate={navigate} />}
      </div>
    </div>
  )
}
