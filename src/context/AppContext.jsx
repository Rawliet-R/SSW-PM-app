import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

const AppContext = createContext(null)

function safeJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback }
  catch { return fallback }
}

export function AppProvider({ children }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const [darkMode, setDarkMode] = useState(() => safeJSON('ssw_dark', false))

  const [progress, setProgress] = useState(() =>
    safeJSON('ssw_progress', {})
  )

  const [bookmarks, setBookmarks] = useState(() => {
    const saved = safeJSON('ssw_bookmarks', { lessons: [], vocab: [] })
    return { lessons: new Set(saved.lessons), vocab: new Set(saved.vocab) }
  })

  // Load JSON
  useEffect(() => {
    fetch('/data/ssw_pm_master_db.json')
      .then(r => { if (!r.ok) throw new Error('Failed to load data'); return r.json() })
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

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

  // ── Progress actions ────────────────────────────────────────────────────────
  const markLessonComplete = useCallback((lessonId, quizScore = null) => {
    setProgress(p => ({
      ...p,
      [lessonId]: {
        ...p[lessonId],
        completed:   true,
        quizScore:   quizScore ?? p[lessonId]?.quizScore,
        completedAt: Date.now()
      }
    }))
  }, [])

  const saveQuizResult = useCallback((lessonId, score, total) => {
    setProgress(p => ({
      ...p,
      [lessonId]: {
        ...p[lessonId],
        quizScore:    score,
        quizTotal:    total,
        quizPercent:  Math.round((score / total) * 100),
        completed:    (score / total) >= 0.5,
        completedAt:  Date.now()
      }
    }))
  }, [])

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

  return (
    <AppContext.Provider value={{
      data, loading, error,
      darkMode, setDarkMode,
      progress, markLessonComplete, saveQuizResult,
      bookmarks, toggleBookmarkLesson, toggleBookmarkVocab,
      allLessons, allVocab,
      completedCount,
      getLessonById
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
