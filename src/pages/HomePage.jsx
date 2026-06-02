import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const CAT_META = {
  industry_overview: { icon: '🏭', color: '#4338ca', bg: '#eef2ff', label: 'Industri' },
  food_hygiene:      { icon: '🧼', color: '#0d9c6b', bg: '#e6faf4', label: 'Higienitas' },
  labor_safety:      { icon: '⛑️',  color: '#c9973a', bg: '#fef5e4', label: 'Keselamatan' },
}

const LEVEL_TITLES = ['Pemula', 'Dasar', 'Menengah', 'Mahir', 'Ahli', 'Master', 'Legend']

function getLevelTitle(level) {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)]
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card" style={{ padding: '14px 12px', textAlign: 'center', flex: 1 }}>
      <div style={{ fontSize: '20px', marginBottom: '4px' }}>{icon}</div>
      <div style={{ fontSize: '22px', fontWeight: '800', color: color || 'var(--accent)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginTop: '3px', letterSpacing: '0.03em' }}>{label}</div>
    </div>
  )
}

function CategoryCard({ cat, lessons, progress, onNavigate }) {
  const meta = CAT_META[cat.id] || { icon: '📚', color: '#6b7280', bg: '#f3f4f6', label: '' }
  const done = lessons.filter(l => progress[l.lesson_id]?.completed).length
  const pct  = lessons.length ? Math.round((done / lessons.length) * 100) : 0

  return (
    <div className="card card-hover animate-fadeUp" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '18px 18px 14px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div style={{
          width: 54, height: 54, borderRadius: 16,
          background: meta.bg, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 26, flexShrink: 0,
          border: `1px solid ${meta.color}22`
        }}>
          {meta.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span className="badge" style={{ background: meta.bg, color: meta.color, fontSize: 10, padding: '2px 8px' }}>
              {meta.label}
            </span>
          </div>
          <h2 style={{ fontSize: '15px', fontWeight: '700', lineHeight: '1.35', color: 'var(--text-primary)' }}>
            {cat.name}
          </h2>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
            {done}/{lessons.length} selesai
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '20px', fontWeight: '800', color: pct === 100 ? 'var(--green)' : meta.color }}>{pct}%</div>
        </div>
      </div>

      <div style={{ padding: '0 18px 14px' }}>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${pct}%`,
            background: pct === 100
              ? 'linear-gradient(90deg, var(--green), #34d399)'
              : `linear-gradient(90deg, ${meta.color}, ${meta.color}99)`
          }} />
        </div>
      </div>

      {/* Lesson list */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        {lessons.map((l, i) => {
          const isDone  = progress[l.lesson_id]?.completed
          const score   = progress[l.lesson_id]?.quizPercent
          return (
            <button
              key={l.lesson_id}
              className="lesson-card"
              style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}
              onClick={() => onNavigate(`/lesson/${l.lesson_id}`)}
            >
              <div className={`lesson-num${isDone ? ' done' : ''}`} style={{
                background: isDone ? 'var(--green-soft)' : 'var(--bg-subtle)',
                color: isDone ? 'var(--green)' : 'var(--text-muted)'
              }}>
                {isDone ? '✓' : i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  {l.title}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span>📖 {l.vocab?.length ?? 0} kata</span>
                  <span>✏️ {l.quiz?.length ?? 0} soal</span>
                  {score != null && <span style={{ color: 'var(--green)', fontWeight: 600 }}>🏆 {score}%</span>}
                </div>
              </div>
              <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>›</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function HomePage() {
  const { data, progress, allLessons, completedCount, darkMode, setDarkMode,
          xp, level, xpInLevel, xpForNext, streak } = useApp()
  const navigate = useNavigate()

  const totalLessons = allLessons.length
  const totalVocab   = allLessons.reduce((acc, l) => acc + (l.vocab?.length ?? 0), 0)
  const totalQuiz    = allLessons.reduce((acc, l) => acc + (l.quiz?.length ?? 0), 0)
  const pctDone      = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0
  const levelTitle   = getLevelTitle(level)

  return (
    <div className="page-wrapper">
      {/* Top bar */}
      <div className="page-header">
        <div className="page-header-inner" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Level Badge */}
            <div className="level-badge">
              <span style={{ fontSize: 16 }}>⭐</span>
              <span style={{ fontSize: 9, marginTop: 1 }}>Lv.{level}</span>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                SSW PM Master
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '1px' }}>
                {levelTitle} · {xp} XP
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {streak > 0 && (
              <div className="streak-pill">
                🔥 {streak}
              </div>
            )}
            <button
              onClick={() => setDarkMode(d => !d)}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--bg-subtle)', fontSize: '18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* XP bar */}
        <div style={{ maxWidth: 640, margin: '10px auto 0', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>XP menuju Level {level + 1}</span>
            <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700 }}>{xpInLevel}/{xpForNext}</span>
          </div>
          <div className="xp-bar-wrap">
            <div className="xp-bar-fill" style={{ width: `${(xpInLevel / xpForNext) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="page-content" style={{ paddingTop: '20px', paddingBottom: '16px' }}>

        {/* Hero progress */}
        <div className="card animate-fadeUp" style={{
          padding: '22px',
          background: darkMode
            ? 'linear-gradient(145deg, #0d0c20 0%, #1e1b4b 60%, #2d0a1a 100%)'
            : 'linear-gradient(145deg, #1a1a2e 0%, #3730a3 60%, #7f1d3a 100%)',
          border: 'none',
          marginBottom: '16px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative */}
          <div style={{
            position: 'absolute', top: -20, right: -20,
            width: 120, height: 120, borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)'
          }} />
          <div style={{
            position: 'absolute', bottom: -30, left: '40%',
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(255,255,255,0.02)'
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Progress Belajar
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: '4px' }}>
                <span style={{ fontSize: '40px', fontWeight: '900', color: '#fff', lineHeight: '1' }}>{pctDone}</span>
                <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.5)', fontWeight: '700' }}>%</span>
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                {completedCount} dari {totalLessons} pelajaran selesai
              </div>
              {pctDone === 100 && (
                <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 12px', background: 'rgba(255,255,255,0.12)',
                  borderRadius: 99, fontSize: 12, color: '#fff', fontWeight: 700 }}>
                  🎉 Semua selesai!
                </div>
              )}
            </div>

            {/* Circle progress */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                <circle cx="40" cy="40" r="34" fill="none"
                  stroke="url(#grad)" strokeWidth="5"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - pctDone / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ff6b9d" />
                    <stop offset="100%" stopColor="#f5c518" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '26px'
              }}>🇯🇵</div>
            </div>
          </div>

          <div style={{ marginTop: '18px', background: 'rgba(255,255,255,0.08)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: 'linear-gradient(90deg, #ff6b9d, #f5c518)',
              width: `${pctDone}%`,
              transition: 'width 1s cubic-bezier(0.4,0,0.2,1)'
            }} />
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '22px' }}>
          <StatCard icon="📖" label="Pelajaran" value={totalLessons} color="var(--indigo)" />
          <StatCard icon="🈳" label="Kosakata"  value={totalVocab}   color="var(--accent)" />
          <StatCard icon="✏️" label="Soal"       value={totalQuiz}    color="var(--green)" />
        </div>

        {/* Quick tips */}
        {streak === 0 && (
          <div className="card animate-fadeUp" style={{
            padding: '14px 16px', marginBottom: '20px',
            background: 'var(--gold-soft)',
            border: '1px solid rgba(201,151,58,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>💡</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)' }}>Mulai streak hari ini!</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Belajar tiap hari untuk dapat bonus XP dan mempertahankan streak 🔥
                </div>
              </div>
            </div>
          </div>
        )}

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

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '32px', paddingBottom: '8px' }}>
          <div style={{ fontSize: '20px', marginBottom: 6 }}>🌸</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {data?.app_meta?.module}<br />
            v{data?.app_meta?.version} · {data?.app_meta?.published}
          </div>
        </div>
      </div>
    </div>
  )
}
