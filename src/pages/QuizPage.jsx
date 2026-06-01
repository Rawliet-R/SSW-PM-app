import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const RESULT_DELAY = 1200 // ms before auto-advance

// ── Single Question ───────────────────────────────────────────────────────────
function QuestionCard({ q, qIndex, total, onAnswer }) {
  const [selected, setSelected]   = useState(null)
  const [revealed, setRevealed]   = useState(false)

  const handleSelect = useCallback((opt) => {
    if (revealed) return
    setSelected(opt)
    setRevealed(true)
    const isCorrect = opt.startsWith(q.answer + '.')
    setTimeout(() => onAnswer(isCorrect), RESULT_DELAY)
  }, [revealed, q.answer, onAnswer])

  const pct = Math.round(((qIndex + 1) / total) * 100)

  return (
    <div className="animate-scaleIn" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>
            Soal {qIndex + 1} dari {total}
          </span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--indigo)' }}>{pct}%</span>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
          Pertanyaan {qIndex + 1}
        </div>
        <p style={{ fontSize: '16px', fontFamily: 'var(--font-jp)', lineHeight: '1.7', color: 'var(--text-primary)', fontWeight: '500' }}>
          {q.question}
        </p>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {q.options.map((opt) => {
          const letter   = opt.split('.')[0]
          const isAnswer = letter === q.answer
          const isSel    = opt === selected

          let cls = 'quiz-option'
          if (revealed) {
            if (isAnswer)       cls += ' correct'
            else if (isSel)     cls += ' wrong'
          } else if (isSel)     cls += ' selected'

          return (
            <button
              key={opt}
              className={cls}
              onClick={() => handleSelect(opt)}
              disabled={revealed}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 22, height: 22, borderRadius: 6, background: 'var(--bg-subtle)',
                fontSize: '12px', fontWeight: '700', marginRight: '10px', flexShrink: 0,
                fontFamily: 'var(--font-ui)'
              }}>
                {letter}
              </span>
              {opt.substring(opt.indexOf('.') + 2)}
            </button>
          )
        })}
      </div>

      {/* Feedback overlay */}
      {revealed && (
        <div className={`card animate-fadeUp`} style={{
          padding: '14px 16px',
          background: selected?.startsWith(q.answer + '.') ? 'var(--green-soft)' : 'var(--accent-soft)',
          border: `1.5px solid ${selected?.startsWith(q.answer + '.') ? 'var(--green)' : 'var(--accent)'}`,
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <span style={{ fontSize: '22px' }}>
            {selected?.startsWith(q.answer + '.') ? '✅' : '❌'}
          </span>
          <div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: selected?.startsWith(q.answer + '.') ? 'var(--green)' : 'var(--accent)' }}>
              {selected?.startsWith(q.answer + '.') ? 'Benar!' : `Salah — Jawaban: ${q.answer}`}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px', fontFamily: 'var(--font-jp)' }}>
              {q.options.find(o => o.startsWith(q.answer + '.'))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Result Screen ─────────────────────────────────────────────────────────────
function ResultScreen({ score, total, lesson, lessonId, wrongItems, onRetry, onRetryWrong }) {
  const navigate  = useNavigate()
  const pct       = Math.round((score / total) * 100)
  const [viewing, setViewing] = useState(false)

  const emoji  = pct >= 80 ? '🏆' : pct >= 60 ? '🎉' : pct >= 40 ? '👍' : '💪'
  const msg    = pct >= 80 ? 'Luar Biasa!'
               : pct >= 60 ? 'Bagus Sekali!'
               : pct >= 40 ? 'Cukup Baik'
               : 'Terus Berlatih!'

  const scoreColor = pct >= 70 ? 'var(--green)' : pct >= 50 ? 'var(--amber)' : 'var(--accent)'

  return (
    <div className="animate-scaleIn" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Score card */}
      <div className="card" style={{ padding: '28px 20px', textAlign: 'center', background: 'linear-gradient(135deg, var(--bg-card), var(--bg-subtle))' }}>
        <div style={{ fontSize: '52px', marginBottom: '8px' }}>{emoji}</div>
        <h2 style={{ fontSize: '26px', fontWeight: '800' }}>{msg}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>{lesson.title}</p>

        <div style={{ margin: '20px 0' }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            border: `5px solid ${scoreColor}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto'
          }}>
            <span style={{ fontSize: '24px', fontWeight: '800', color: scoreColor }}>{pct}%</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>SKOR</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--green)' }}>{score}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Benar</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent)' }}>{total - score}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Salah</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--indigo)' }}>{total}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {wrongItems.length > 0 && (
          <button className="btn btn-primary btn-full" onClick={onRetryWrong}>
            🔁 Ulangi yang Salah ({wrongItems.length} soal)
          </button>
        )}
        <button className="btn btn-outline btn-full" onClick={onRetry}>
          🔄 Ulangi Semua Soal
        </button>
        <button className="btn btn-secondary btn-full" onClick={() => navigate(`/lesson/${lessonId}/flashcard`)}>
          🎴 Latihan Flashcard
        </button>
        <button className="btn btn-secondary btn-full" onClick={() => navigate(`/lesson/${lessonId}`)}>
          ← Kembali ke Pelajaran
        </button>
      </div>

      {/* Wrong answer review */}
      {wrongItems.length > 0 && (
        <div>
          <button
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px 0' }}
            onClick={() => setViewing(v => !v)}
          >
            <span className="section-title" style={{ marginBottom: 0 }}>Review Jawaban Salah ({wrongItems.length})</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>{viewing ? '▲' : '▼'}</span>
          </button>
          {viewing && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {wrongItems.map((item, i) => (
                <div key={i} className="card animate-fadeUp" style={{ padding: '16px', borderLeft: '3px solid var(--accent)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Soal {item.index + 1}
                  </div>
                  <p style={{ fontSize: '14px', fontFamily: 'var(--font-jp)', lineHeight: '1.6', marginBottom: '10px' }}>
                    {item.q.question}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--accent-soft)', fontSize: '13px', fontFamily: 'var(--font-jp)' }}>
                      ❌ Jawaban kamu: {item.selected || '(tidak menjawab)'}
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--green-soft)', fontSize: '13px', fontFamily: 'var(--font-jp)' }}>
                      ✅ Jawaban benar: {item.q.options.find(o => o.startsWith(item.q.answer + '.'))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main QuizPage ─────────────────────────────────────────────────────────────
export default function QuizPage() {
  const { lessonId } = useParams()
  const navigate     = useNavigate()
  const { getLessonById, saveQuizResult } = useApp()

  const lesson = getLessonById(lessonId)
  const allQ   = lesson?.quiz ?? []

  const [questions,   setQuestions]   = useState(allQ)
  const [qIndex,      setQIndex]      = useState(0)
  const [score,       setScore]       = useState(0)
  const [wrongItems,  setWrongItems]  = useState([])
  const [selectedMap, setSelectedMap] = useState({})
  const [finished,    setFinished]    = useState(false)

  const handleAnswer = useCallback((isCorrect) => {
    const q   = questions[qIndex]
    const sel = selectedMap[qIndex]

    if (!isCorrect) {
      setWrongItems(w => [...w, { q, index: qIndex, selected: sel }])
    }
    if (isCorrect) setScore(s => s + 1)

    if (qIndex + 1 >= questions.length) {
      const finalScore = isCorrect ? score + 1 : score
      saveQuizResult(lessonId, finalScore, questions.length)
      setScore(finalScore)
      setFinished(true)
    } else {
      setQIndex(i => i + 1)
    }
  }, [qIndex, questions, score, selectedMap, lessonId, saveQuizResult])

  // Capture selection before answer
  const handleOptionSelect = useCallback((idx, opt) => {
    setSelectedMap(m => ({ ...m, [idx]: opt }))
  }, [])

  const handleRetry = () => {
    setQuestions(allQ); setQIndex(0); setScore(0)
    setWrongItems([]); setSelectedMap({}); setFinished(false)
  }

  const handleRetryWrong = () => {
    setQuestions(wrongItems.map(w => w.q)); setQIndex(0); setScore(0)
    setWrongItems([]); setSelectedMap({}); setFinished(false)
  }

  if (!lesson || !allQ.length) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '12px' }}>
        <div style={{ fontSize: '48px' }}>😕</div>
        <p className="text-secondary">Tidak ada soal untuk pelajaran ini</p>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Kembali</button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-inner" style={{ justifyContent: 'space-between' }}>
          <button className="back-btn" onClick={() => navigate(`/lesson/${lessonId}`)}>✕</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '700', fontSize: '15px' }}>Quiz</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lesson.title}</div>
          </div>
          {!finished
            ? <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--green)' }}>
                ✓ {score}
              </div>
            : <div style={{ width: 36 }} />
          }
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '20px 16px', maxWidth: 640, margin: '0 auto', width: '100%' }}>
        {finished ? (
          <ResultScreen
            score={score}
            total={questions.length}
            lesson={lesson}
            lessonId={lessonId}
            wrongItems={wrongItems}
            onRetry={handleRetry}
            onRetryWrong={handleRetryWrong}
          />
        ) : (
          <QuestionCard
            key={`${qIndex}-${questions[qIndex]?.question}`}
            q={questions[qIndex]}
            qIndex={qIndex}
            total={questions.length}
            onAnswer={handleAnswer}
            onSelect={(opt) => handleOptionSelect(qIndex, opt)}
          />
        )}
      </div>
    </div>
  )
}
