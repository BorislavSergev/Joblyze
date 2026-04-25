import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HiHome, HiChartBar, HiInformationCircle, HiMenu, HiX, HiTemplate, HiUser, HiLogout } from 'react-icons/hi'
import { FaBrain } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { getAvatarUrl } from '../services/avatarCache'

function Navbar() {
  const location = useLocation()
  const { user, profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [avatarSrc, setAvatarSrc] = useState('')

  const isActive = (p) => location.pathname === p

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [location.pathname])

  useEffect(() => {
    let alive = true
    getAvatarUrl(user, profile).then(url => {
      if (alive) setAvatarSrc(url)
    })
    return () => { alive = false }
  }, [user, profile?.avatar_path, profile?.avatar_url])

  const displayName = profile?.username || user?.user_metadata?.username || user?.email || ''
  const initial = displayName.charAt(0).toUpperCase()

  const navLinks = [
    { path: '/',          label: 'Начало',     icon: HiHome },
    { path: '/analyze',   label: 'Анализиране', icon: HiChartBar },
    { path: '/templates', label: 'Шаблони',    icon: HiTemplate },
    { path: '/about',     label: 'За нас',     icon: HiInformationCircle },
  ]

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <div className="nav-logo-mark">
              <FaBrain style={{ width: 16, height: 16, color: '#fff' }} />
            </div>
            <span className="nav-logo-text">Joblyze</span>
          </Link>

          {/* Desktop links */}
          <div className="nav-links">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path} className={`nav-link${isActive(path) ? ' active' : ''}`}>
                <Icon style={{ width: 15, height: 15 }} />
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="nav-actions" style={{ display: 'flex' }}>
            {user ? (
              <>
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                  {avatarSrc
                    ? <img src={avatarSrc} alt="" className="nav-avatar" onError={() => setAvatarSrc('')} />
                    : <div className="nav-avatar-fallback">{initial}</div>
                  }
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--ink-80)', maxWidth: 120 }} className="truncate">
                    {displayName}
                  </span>
                </Link>
                <button
                  onClick={signOut}
                  className="btn-ghost"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <HiLogout style={{ width: 14, height: 14 }} />
                  Изход
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8125rem' }}>
                  Вход
                </Link>
                <Link to="/register" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8125rem' }}>
                  Регистрация
                </Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button className="hamburger" onClick={() => setOpen(o => !o)} aria-label="Меню">
            {open ? <HiX style={{ width: 20, height: 20 }} /> : <HiMenu style={{ width: 20, height: 20 }} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="mobile-menu">
            <div className="mobile-menu-links">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link key={path} to={path} className={`nav-link${isActive(path) ? ' active' : ''}`}>
                  <Icon style={{ width: 16, height: 16 }} />
                  {label}
                </Link>
              ))}
            </div>
            <div className="mobile-menu-actions">
              {user ? (
                <>
                  <Link to="/profile" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                    <HiUser style={{ width: 14, height: 14 }} />
                    Профил
                  </Link>
                  <button onClick={signOut} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
                    <HiLogout style={{ width: 14, height: 14 }} />
                    Изход
                  </button>
                </>
              ) : (
                <>
                  <Link to="/auth" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Вход</Link>
                  <Link to="/register" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Регистрация</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

export default Navbar
