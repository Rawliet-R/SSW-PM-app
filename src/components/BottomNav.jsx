import { useLocation, useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/',          label: 'Beranda',  icon: '🏠' },
  { path: '/search',    label: 'Cari',     icon: '🔍' },
  { path: '/bookmarks', label: 'Simpan',   icon: '⭐' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const hidden = location.pathname.endsWith('/flashcard') || location.pathname.endsWith('/quiz')
  if (hidden) return null

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Navigasi utama">
      {NAV_ITEMS.map(item => {
        const isActive = item.path === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(item.path)
        return (
          <button
            key={item.path}
            className={`nav-item${isActive ? ' active' : ''}`}
            onClick={() => navigate(item.path)}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="nav-icon-wrap">
              <span style={{ fontSize: 22 }}>{item.icon}</span>
            </div>
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
