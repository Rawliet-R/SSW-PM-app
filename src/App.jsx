import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'
import BottomNav    from './components/BottomNav'
import HomePage     from './pages/HomePage'
import LessonPage   from './pages/LessonPage'
import FlashcardPage from './pages/FlashcardPage'
import QuizPage     from './pages/QuizPage'
import SearchPage   from './pages/SearchPage'
import BookmarksPage from './pages/BookmarksPage'

function LoadingScreen() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100dvh', gap:'16px' }}>
      <div className="spinner" />
      <p className="text-secondary" style={{ fontSize:'15px' }}>Memuat data…</p>
    </div>
  )
}

function ErrorScreen({ message }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100dvh', gap:'12px', padding:'24px', textAlign:'center' }}>
      <div style={{ fontSize:'48px' }}>⚠️</div>
      <h2 style={{ fontSize:'20px', fontWeight:'700' }}>Gagal Memuat Data</h2>
      <p className="text-secondary">{message}</p>
      <button className="btn btn-primary mt-3" onClick={() => window.location.reload()}>
        Coba Lagi
      </button>
    </div>
  )
}

export default function App() {
  const { loading, error } = useApp()

  if (loading) return <LoadingScreen />
  if (error)   return <ErrorScreen message={error} />

  return (
    <>
      <Routes>
        <Route path="/"                             element={<HomePage />} />
        <Route path="/lesson/:lessonId"             element={<LessonPage />} />
        <Route path="/lesson/:lessonId/flashcard"   element={<FlashcardPage />} />
        <Route path="/lesson/:lessonId/quiz"        element={<QuizPage />} />
        <Route path="/search"                       element={<SearchPage />} />
        <Route path="/bookmarks"                    element={<BookmarksPage />} />
        <Route path="*"                             element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </>
  )
}
