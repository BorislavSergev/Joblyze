import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { HiLockClosed, HiMail, HiEye, HiEyeOff, HiArrowRight } from 'react-icons/hi'
import { FaBrain } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

function Auth() {
  const { signIn, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const destination = location.state?.from?.pathname || '/analyze'

  if (user) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: 'var(--brand-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', color: 'var(--brand)',
          }}>
            <FaBrain style={{ width: 24, height: 24 }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
            {t('auth.already_logged_in')}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-60)', marginBottom: 24 }}>
            {t('auth.continue_to_dashboard')}
          </p>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => navigate(destination, { replace: true })}>
            {t('auth.continue')}
            <HiArrowRight style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data, error: err } = await signIn(email, password)
      if (err) throw err
      if (!data?.session) throw new Error(t('auth.sign_in_success_no_session'))
      navigate(destination, { replace: true })
    } catch (err) {
      setError(err.message || t('auth.auth_failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card anim-fade-up">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: 'var(--brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: 'var(--shadow-brand)',
          }}>
            <FaBrain style={{ width: 22, height: 22, color: '#fff' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            {t('auth.welcome_back')}
          </h1>
          <p style={{ marginTop: 6, fontSize: '0.9rem', color: 'var(--ink-60)' }}>
            {t('auth.sign_in_to_continue')}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Email */}
          <div className="form-field">
            <label className="form-label">{t('auth.email')}</label>
            <div className="form-input-wrap">
              <HiMail className="form-input-icon" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="form-input has-icon"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-field">
            <label className="form-label">{t('auth.password')}</label>
            <div className="form-input-wrap">
              <HiLockClosed className="form-input-icon" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder={t('auth.min_6_chars')}
                className="form-input has-icon"
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(s => !s)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--ink-40)', background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', padding: 0,
                }}
              >
                {showPw
                  ? <HiEyeOff style={{ width: 16, height: 16 }} />
                  : <HiEye    style={{ width: 16, height: 16 }} />
                }
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: '0.9375rem', marginTop: 4 }}
          >
            {loading ? t('auth.please_wait') : t('auth.sign_in')}
            {!loading && <HiArrowRight style={{ width: 16, height: 16 }} />}
          </button>
        </form>

        <div className="auth-divider">
          <div className="auth-divider-line" />
          <span className="auth-divider-text">{t('auth.no_account')}</span>
          <div className="auth-divider-line" />
        </div>

        <Link to="/register" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.9rem' }}>
          {t('auth.create_free_account')}
        </Link>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.8125rem', color: 'var(--ink-40)' }}>
          <Link to="/" style={{ color: 'var(--ink-40)' }}>{t('auth.back_to_home')}</Link>
        </p>
      </div>
    </div>
  )
}

export default Auth
