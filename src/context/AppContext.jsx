import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

const AppContext = createContext(null)

function safeJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback }
  catch { return fallback }
}

// XP needed per level
const XP_PER_LEVEL = 100

function calcLevel(xp) {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

function xpProgress(xp) {
  return xp % XP_PER_LEVEL
}

export function AppProvider({ children }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const [darkMode, setDarkMode] = useState(() => safeJSON('ssw_dark', true))
  const [furiganaEnabled, setFuriganaEnabled] = useState(() => safeJSON('ssw_furigana', true))

  const [progress, setProgress] = useState(() => safeJSON('ssw_progress', {}))

  const [bookmarks, setBookmarks] = useState(() => {
    const saved = safeJSON('ssw_bookmarks', { lessons: [], vocab: [] })
    return { lessons: new Set(saved.lessons), vocab: new Set(saved.vocab) }
  })

  // ── Gamification state ──────────────────────────────────────────────────────
  const [xp, setXp]             = useState(() => safeJSON('ssw_xp', 0))
  const [streak, setStreak]     = useState(() => safeJSON('ssw_streak', 0))
  const [lastStudy, setLastStudy] = useState(() => safeJSON('ssw_last_study', null))

  // Load JSON
  useEffect(() => {
    fetch('/data/ssw_pm_master_db.json')
      .then(r => { if (!r.ok) throw new Error('Gagal memuat data'); return r.json() })
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  // Sync furigana
  useEffect(() => {
    localStorage.setItem('ssw_furigana', JSON.stringify(furiganaEnabled))
  }, [furiganaEnabled])

  // Sync dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('ssw_dark', JSON.stringify(darkMode))
  }, [darkMode])

  // Persist progress
  useEffect(() => {
    localStorage.setItem('ssw_progress', JSON.stringify(progress))
  }, [progress])

  // Persist bookmarks
  useEffect(() => {
    localStorage.setItem('ssw_bookmarks', JSON.stringify({
      lessons: [...bookmarks.lessons],
      vocab:   [...bookmarks.vocab]
    }))
  }, [bookmarks])

  // Persist XP
  useEffect(() => {
    localStorage.setItem('ssw_xp', JSON.stringify(xp))
  }, [xp])

  // Persist streak
  useEffect(() => {
    localStorage.setItem('ssw_streak', JSON.stringify(streak))
    localStorage.setItem('ssw_last_study', JSON.stringify(lastStudy))
  }, [streak, lastStudy])

  // Check streak on mount
  useEffect(() => {
    if (!lastStudy) return
    const today = new Date().toDateString()
    const last  = new Date(lastStudy).toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    if (last !== today && last !== yesterday) {
      // Streak broken
      setStreak(0)
    }
  }, [])

  // ── XP & Streak actions ─────────────────────────────────────────────────────
  const addXp = useCallback((amount) => {
    setXp(prev => prev + amount)
    // Update streak
    const today = new Date().toDateString()
    setLastStudy(prev => {
      const prevDate = prev ? new Date(prev).toDateString() : null
      if (prevDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString()
        setStreak(s => prevDate === yesterday ? s + 1 : 1)
      }
      return Date.now()
    })
  }, [])

  // ── Progress actions ────────────────────────────────────────────────────────
  const markLessonComplete = useCallback((lessonId, quizScore = null) => {
    setProgress(p => {
      const alreadyDone = p[lessonId]?.completed
      if (!alreadyDone) addXp(20) // 20 XP for first completion
      return {
        ...p,
        [lessonId]: {
          ...p[lessonId],
          completed:   true,
          quizScore:   quizScore ?? p[lessonId]?.quizScore,
          completedAt: Date.now()
        }
      }
    })
  }, [addXp])

  const saveQuizResult = useCallback((lessonId, score, total) => {
    setProgress(p => {
      const pct = Math.round((score / total) * 100)
      const passed = (score / total) >= 0.5
      const prevPct = p[lessonId]?.quizPercent ?? 0
      // XP: 10 base + bonus for improvement
      if (passed) {
        const bonus = Math.max(0, pct - prevPct)
        addXp(10 + Math.floor(bonus / 10) * 5)
      }
      return {
        ...p,
        [lessonId]: {
          ...p[lessonId],
          quizScore:   score,
          quizTotal:   total,
          quizPercent: pct,
          completed:   passed,
          completedAt: Date.now()
        }
      }
    })
  }, [addXp])

  // ── Bookmark actions ────────────────────────────────────────────────────────
  const toggleBookmarkLesson = useCallback((lessonId) => {
    setBookmarks(b => {
      const lessons = new Set(b.lessons)
      if (lessons.has(lessonId)) lessons.delete(lessonId)
      else lessons.add(lessonId)
      return { ...b, lessons }
    })
  }, [])

  const toggleBookmarkVocab = useCallback((vocabId) => {
    setBookmarks(b => {
      const vocab = new Set(b.vocab)
      if (vocab.has(vocabId)) vocab.delete(vocabId)
      else vocab.add(vocabId)
      return { ...b, vocab }
    })
  }, [])

  // ── Derived data ────────────────────────────────────────────────────────────
  const allLessons = useMemo(() =>
    (data?.categories ?? []).flatMap(c =>
      c.lessons.map(l => ({ ...l, categoryId: c.id, categoryName: c.name }))
    ), [data]
  )

  const allVocab = useMemo(() =>
    allLessons.flatMap(l =>
      (l.vocab ?? []).map(v => ({
        ...v,
        lessonId:    l.lesson_id,
        lessonTitle: l.title
      }))
    ), [allLessons]
  )

  const completedCount = useMemo(() =>
    allLessons.filter(l => progress[l.lesson_id]?.completed).length,
    [allLessons, progress]
  )

  const getLessonById = useCallback((id) =>
    allLessons.find(l => l.lesson_id === id),
    [allLessons]
  )

  const level       = useMemo(() => calcLevel(xp), [xp])
  const xpInLevel   = useMemo(() => xpProgress(xp), [xp])
  const xpForNext   = XP_PER_LEVEL

  return (
    <AppContext.Provider value={{
      data, loading, error,
      darkMode, setDarkMode,
      progress, markLessonComplete, saveQuizResult,
      bookmarks, toggleBookmarkLesson, toggleBookmarkVocab,
      allLessons, allVocab,
      completedCount,
      getLessonById,
      xp, level, xpInLevel, xpForNext, streak, addXp,
      furiganaEnabled, setFuriganaEnabled
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
