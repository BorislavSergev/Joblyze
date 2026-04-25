import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiLockClosed, HiMail, HiUser, HiArrowRight, HiEye, HiEyeOff, HiCamera, HiCheck } from 'react-icons/hi'
import { FaBrain } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'

function Register() {
  const { signUp, updateUser, upsertProfile, refreshProfile, setProfileOptimistic } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Моля, качете изображение.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Снимката трябва да е под 5MB.'); return }
    setError('')
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(typeof reader.result === 'string' ? reader.result : '')
    reader.readAsDataURL(file)
  }

  const uploadAvatar = async (userId) => {
    if (!avatarFile || !userId) return ''
    const ext = avatarFile.name.split('.').pop() || 'jpg'
    const path = `${userId}/avatar-${Date.now()}.${ext}`
    const { error: err } = await supabase.storage.from('Users').upload(path, avatarFile, { upsert: true, contentType: avatarFile.type })
    if (err) throw new Error(`Качването на снимката е неуспешно: ${err.message}`)
    return path
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setMessage('')
    if (!username.trim()) { setError('Потребителското име е задължително.'); return }
    setLoading(true)
    try {
      const { data, error: err } = await signUp(email, password, { username: username.trim() })
      if (err) throw err
      const session = data?.session
      if (!session) {
        setMessage('Акаунтът е създаден. Моля, потвърдете имейла си, след което влезте.')
        return
      }
      navigate('/analyze', { replace: true })
      setProfileOptimistic({ id: session.user.id, email: session.user.email || email, username: username.trim(), avatar_url: avatarPreview || '' });
      (async () => {
        try {
          if (avatarFile) {
            const avatarPath = await uploadAvatar(session.user.id)
            if (avatarPath) {
              const { data: pub } = supabase.storage.from('Users').getPublicUrl(avatarPath)
              const avatarUrl = pub.publicUrl || ''
              await updateUser({ data: { username: username.trim(), avatar_url: avatarUrl, avatar_path: avatarPath } })
              await upsertProfile({ userId: session.user.id, email: session.user.email || email, username: username.trim(), avatar_path: avatarPath, avatar_url: avatarUrl })
            }
          } else {
            await upsertProfile({ userId: session.user.id, email: session.user.email || email, username: username.trim() })
          }
          await refreshProfile()
        } catch (syncErr) {
          console.error('Profile sync failed:', syncErr)
        }
      })()
    } catch (err) {
      setError(err.message || 'Регистрацията е неуспешна. Моля, опитайте отново.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card anim-fade-up" style={{ maxWidth: 480 }}>
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
            Създайте акаунт
          </h1>
          <p style={{ marginTop: 6, fontSize: '0.9rem', color: 'var(--ink-60)' }}>
            Регистрирайте се безплатно и започнете анализа
          </p>
        </div>

        {/* Avatar picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <label style={{ cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
            <div className="avatar-ring" style={{ width: 64, height: 64 }}>
              {avatarPreview
                ? <img src={avatarPreview} alt="Preview" />
                : <div className="avatar-fallback" style={{ fontSize: '1.25rem' }}>
                    {username ? username.charAt(0).toUpperCase() : <HiCamera style={{ width: 20, height: 20, color: 'var(--brand)' }} />}
                  </div>
              }
            </div>
            <div style={{
              position: 'absolute', bottom: -2, right: -2,
              width: 22, height: 22, borderRadius: '50%',
              background: 'var(--brand)', border: '2px solid white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <HiCamera style={{ width: 11, height: 11, color: '#fff' }} />
            </div>
            <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
          </label>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink-80)' }}>Снимка на профила</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink-40)', marginTop: 2 }}>Незадължително · JPG, PNG, GIF · до 5MB</p>
            {avatarPreview && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)' }}>
                <HiCheck style={{ width: 12, height: 12 }} /> Качена
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Username */}
          <div className="form-field">
            <label className="form-label">Потребителско име</label>
            <div className="form-input-wrap">
              <HiUser className="form-input-icon" />
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="вашето_потр_име" className="form-input has-icon" />
            </div>
          </div>

          {/* Email */}
          <div className="form-field">
            <label className="form-label">Имейл</label>
            <div className="form-input-wrap">
              <HiMail className="form-input-icon" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="form-input has-icon" />
            </div>
          </div>

          {/* Password */}
          <div className="form-field">
            <label className="form-label">Парола</label>
            <div className="form-input-wrap">
              <HiLockClosed className="form-input-icon" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required minLength={6}
                placeholder="Минимум 6 символа"
                className="form-input has-icon"
                style={{ paddingRight: 40 }}
              />
              <button type="button" onClick={() => setShowPw(s => !s)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--ink-40)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0,
              }}>
                {showPw ? <HiEyeOff style={{ width: 16, height: 16 }} /> : <HiEye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>

          {error   && <div className="alert alert-error"><span>{error}</span></div>}
          {message && <div className="alert alert-success"><span>{message}</span></div>}

          <button type="submit" disabled={loading} className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: '0.9375rem', marginTop: 4 }}>
            {loading ? 'Създаване на акаунт...' : 'Регистрация'}
            {!loading && <HiArrowRight style={{ width: 16, height: 16 }} />}
          </button>
        </form>

        <div className="auth-divider">
          <div className="auth-divider-line" />
          <span className="auth-divider-text">Вече имате акаунт?</span>
          <div className="auth-divider-line" />
        </div>

        <Link to="/auth" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.9rem' }}>
          Влезте в профила си
        </Link>
      </div>
    </div>
  )
}

export default Register
