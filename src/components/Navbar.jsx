import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HiHome, HiChartBar, HiInformationCircle, HiMenu, HiX, HiTemplate, HiUser, HiLogout, HiBriefcase } from 'react-icons/hi'
import { FaBrain } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { getAvatarUrl } from '../services/avatarCache'
import { useTranslation } from 'react-i18next'
import flagBG from '../images/Flag_of_Bulgaria.png'
import flagEN from '../images/Flag_of_Great_Britain_(1707–1800).svg.png'

function Navbar() {
  const location = useLocation()
  const { user, profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [avatarSrc, setAvatarSrc] = useState('')
  const { t, i18n } = useTranslation()

  const isActive = (p) => location.pathname === p

  const toggleLanguage = () => {
    const next = i18n.language === 'bg' ? 'en' : 'bg'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
  }

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
    { path: '/',          label: t('nav.home'),      icon: HiHome },
    { path: '/analyze',   label: t('nav.analyze'),   icon: HiChartBar },
    { path: '/templates', label: t('nav.templates'), icon: HiTemplate },
    { path: '/about',     label: t('nav.about'),     icon: HiInformationCircle },
    { path: '/jobs',      label: t('nav.jobs'),      icon: HiBriefcase },
  ]

  const isBg = i18n.language === 'bg'

  const langBtn = (
    <button
      onClick={toggleLanguage}
      title="Switch language"
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '5px 12px 5px 6px',
        borderRadius: 999,
        border: '1px solid var(--border)',
        background: 'var(--surface-2)',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseOver={e => {
        e.currentTarget.style.background = 'var(--brand-light)'
        e.currentTarget.style.borderColor = 'var(--brand)'
        e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-light)'
      }}
      onMouseOut={e => {
        e.currentTarget.style.background = 'var(--surface-2)'
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Circular flag badge */}
      <img
        src={isBg ? flagBG : flagEN}
        alt={isBg ? 'BG' : 'EN'}
        style={{
          width: 22, height: 22, borderRadius: '50%',
          objectFit: 'cover',
          border: '1px solid rgba(0,0,0,0.08)',
          flexShrink: 0,
        }}
      />
      {/* Label */}
      <span style={{
        fontSize: '0.72rem', fontWeight: 700,
        color: 'var(--ink-60)',
        letterSpacing: '0.06em',
      }}>
        {isBg ? 'BG' : 'EN'}
      </span>
    </button>
  )

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
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {langBtn}
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
                  {t('nav.sign_out')}
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8125rem' }}>
                  {t('nav.sign_in')}
                </Link>
                <Link to="/register" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8125rem' }}>
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button className="hamburger" onClick={() => setOpen(o => !o)} aria-label={t('nav.menu')}>
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
                    {t('nav.profile')}
                  </Link>
                  <button onClick={signOut} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
                    <HiLogout style={{ width: 14, height: 14 }} />
                    {t('nav.sign_out')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/auth" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>{t('nav.sign_in')}</Link>
                  <Link to="/register" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>{t('nav.register')}</Link>
                </>
              )}
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>{langBtn}</div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

export default Navbar
