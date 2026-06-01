import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const CAT_META = {
  industry_overview: { icon: '🏭', color: '#3730a3', bg: '#e0e7ff' },
  food_hygiene:      { icon: '🧼', color: '#059669', bg: '#d1fae5' },
  labor_safety:      { icon: '⛑️',  color: '#d97706', bg: '#fef3c7' },
}

function StatCard({ label, value, sub }) {
  return (
    <div className="card" style={{ padding: '16px', textAlign: 'center', flex: 1 }}>
      <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--accent)' }}>{value}</div>
      <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginTop: '2px' }}>{label}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{sub}</div>}
    </div>
  )
}

function CategoryCard({ cat, lessons, progress, onNavigate }) {
  const meta  = CAT_META[cat.id] || { icon: '📚', color: '#6b7280', bg: '#f3f4f6' }
  const done  = lessons.filter(l => progress[l.lesson_id]?.completed).length
  const pct   = lessons.length ? Math.round((done / lessons.length) * 100) : 0

  return (
    <div className="card card-hover animate-fadeUp" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '18px 18px 14px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: meta.bg, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 26, flexShrink: 0
        }}>
          {meta.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', lineHeight: '1.3', color: 'var(--text-primary)' }}>
            {cat.name}
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {lessons.length} pelajaran · {done}/{lessons.length} selesai
          </div>
          <div className="progress-bar-wrap" style={{ marginTop: '10px' }}>
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <span style={{ fontSize: '13px', fontWeight: '700', color: meta.color }}>{pct}%</span>
      </div>

      {/* Lesson list */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        {lessons.map((l, i) => {
          const done = progress[l.lesson_id]?.completed
          const score = progress[l.lesson_id]?.quizPercent
          return (
            <button
              key={l.lesson_id}
              className="lesson-card"
              style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', width:'100%' }}
              onClick={() => onNavigate(`/lesson/${l.lesson_id}`)}
            >
              <div className={`lesson-num${done ? ' done' : ''}`}>
                {done ? '✓' : i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  {l.title}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                  {l.vocab?.length ?? 0} kosakata · {l.quiz?.length ?? 0} soal
                  {score != null && <span style={{ color: 'var(--green)', marginLeft: '8px' }}>✓ {score}%</span>}
                </div>
              </div>
              <span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>›</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function HomePage() {
  const { data, progress, allLessons, completedCount, darkMode, setDarkMode } = useApp()
  const navigate = useNavigate()

  const totalLessons = allLessons.length
  const totalVocab   = allLessons.reduce((acc, l) => acc + (l.vocab?.length ?? 0), 0)
  const totalQuiz    = allLessons.reduce((acc, l) => acc + (l.quiz?.length ?? 0), 0)
  const pctDone      = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0

  return (
    <div className="page-wrapper">
      {/* Top bar */}
      <div className="page-header">
        <div className="page-header-inner" style={{ justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              SSW PM Master
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', lineHeight: '1.2', marginTop: '1px' }}>
              Belajar Bahasa Jepang 🇯🇵
            </h1>
          </div>
          <button
            onClick={() => setDarkMode(d => !d)}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--bg-subtle)', fontSize: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <div className="page-content" style={{ paddingTop: '20px', paddingBottom: '16px' }}>

        {/* Hero progress */}
        <div className="card animate-fadeUp" style={{ padding: '20px', background: 'linear-gradient(135deg, #1a1a2e 0%, #3730a3 100%)', border: 'none', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.65)' }}>Progress Belajar</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#fff', lineHeight: '1.1', marginTop: '2px' }}>
                {pctDone}<span style={{ fontSize: '18px', opacity: .7 }}>%</span>
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>
                {completedCount} dari {totalLessons} pelajaran selesai
              </div>
            </div>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              border: '4px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', flexShrink: 0
            }}>
              <svg width="72" height="72" style={{ position: 'absolute', top: -4, left: -4, transform: 'rotate(-90deg)' }}>
                <circle cx="36" cy="36" r="32" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                <circle cx="36" cy="36" r="32" fill="none" stroke="#e94560" strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - pctDone / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
                />
              </svg>
              <span style={{ fontSize: '28px', zIndex: 1 }}>📚</span>
            </div>
          </div>

          <div className="progress-bar-wrap" style={{ marginTop: '16px', background: 'rgba(255,255,255,0.1)' }}>
            <div className="progress-bar-fill" style={{ width: `${pctDone}%` }} />
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <StatCard label="Pelajaran" value={totalLessons} />
          <StatCard label="Kosakata" value={totalVocab} />
          <StatCard label="Soal Latihan" value={totalQuiz} />
        </div>

        {/* Categories */}
        <div className="section-title">Materi Belajar</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {data?.categories.map((cat, idx) => (
            <div key={cat.id} style={{ animationDelay: `${idx * 0.08}s` }}>
              <CategoryCard
                cat={cat}
                lessons={cat.lessons}
                progress={progress}
                onNavigate={navigate}
              />
            </div>
          ))}
        </div>

        {/* Module info */}
        <div style={{ textAlign: 'center', marginTop: '28px', paddingBottom: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {data?.app_meta?.module} · v{data?.app_meta?.version} · {data?.app_meta?.published}
          </div>
        </div>
      </div>
    </div>
  )
}
