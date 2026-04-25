import { useEffect, useMemo, useState } from 'react'
import { HiCamera, HiUser, HiMail, HiSave, HiCheck, HiChartBar, HiTemplate, HiLogout } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import { getAvatarUrl, invalidateAvatar } from '../services/avatarCache'

function Profile() {
  const { user, profile, updateUser, upsertProfile, refreshProfile, setProfileOptimistic, signOut } = useAuth()
  const [username, setUsername]             = useState(profile?.username || user?.user_metadata?.username || '')
  const [avatarFile, setAvatarFile]         = useState(null)
  const [avatarPreview, setAvatarPreview]   = useState('')
  const [resolvedAvatar, setResolvedAvatar] = useState('')
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState('')
  const [success, setSuccess]               = useState('')

  const displayAvatar = useMemo(() =>
    avatarPreview || resolvedAvatar || profile?.avatar_url || user?.user_metadata?.avatar_url || ''
  , [avatarPreview, resolvedAvatar, profile?.avatar_url, user?.user_metadata?.avatar_url])

  const displayName = profile?.username || user?.user_metadata?.username || user?.email || ''
  const initial = displayName.charAt(0).toUpperCase()

  useEffect(() => {
    let alive = true
    getAvatarUrl(user, profile).then(url => {
      if (alive) setResolvedAvatar(url)
    })
    return () => { alive = false }
  }, [user, profile?.avatar_path, profile?.avatar_url])

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Моля, качете валидно изображение.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Снимката трябва да е под 5MB.'); return }
    setError('')
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(typeof reader.result === 'string' ? reader.result : '')
    reader.readAsDataURL(file)
  }

  const uploadAvatar = async (userId) => {
    if (!avatarFile || !userId) return {
      avatarPath: profile?.avatar_path || user?.user_metadata?.avatar_path || '',
      avatarUrl:  profile?.avatar_url  || user?.user_metadata?.avatar_url  || '',
    }
    const ext = avatarFile.name.split('.').pop() || 'jpg'
    const avatarPath = `${userId}/avatar-${Date.now()}.${ext}`
    const { error: err } = await supabase.storage.from('Users').upload(avatarPath, avatarFile, { upsert: true, contentType: avatarFile.type })
    if (err) throw new Error(`Качването е неуспешно: ${err.message}`)
    const { data: pub } = supabase.storage.from('Users').getPublicUrl(avatarPath)
    return { avatarPath, avatarUrl: pub.publicUrl || '' }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    const trimmed = username.trim()
    if (!trimmed) { setError('Потребителското име е задължително.'); return }
    if (!user?.id) { setError('Не е намерен потребител. Моля, влезте отново.'); return }
    setLoading(true)
    try {
      setProfileOptimistic({ username: trimmed, avatar_url: avatarPreview || profile?.avatar_url || user?.user_metadata?.avatar_url || '' })
      const oldPath = profile?.avatar_path || user?.user_metadata?.avatar_path
      const { avatarPath, avatarUrl } = await uploadAvatar(user.id)
      // Bust the cache for the old path before saving the new one
      if (oldPath && oldPath !== avatarPath) invalidateAvatar(oldPath)
      invalidateAvatar(avatarPath)
      const { error: err } = await updateUser({ data: { username: trimmed, avatar_path: avatarPath, avatar_url: avatarUrl } })
      if (err) throw err
      await upsertProfile({ userId: user.id, email: user.email || profile?.email || '', username: trimmed, avatar_path: avatarPath, avatar_url: avatarUrl })
      await refreshProfile()
      setAvatarFile(null); setAvatarPreview('')
      setSuccess('Профилът е обновен успешно.')
    } catch (err) {
      setError(err.message || 'Неуспешно обновяване на профила.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container" style={{ paddingTop: 'clamp(32px,5vw,60px)', paddingBottom: 'clamp(32px,5vw,60px)' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* ── Profile hero card ── */}
        <div className="profile-header-card anim-fade-up" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <div className="avatar-ring" style={{ width: 72, height: 72, border: '3px solid rgba(255,255,255,0.35)' }}>
              {displayAvatar
                ? <img src={displayAvatar} alt="" onError={() => setResolvedAvatar('')} />
                : <div className="avatar-fallback" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '1.5rem' }}>{initial}</div>
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                Профил
              </p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.25rem,3vw,1.625rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }} className="truncate">
                {displayName}
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', marginTop: 2 }} className="truncate">
                {user?.email}
              </p>
            </div>
            <button onClick={signOut} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.85)', fontWeight: 500, fontSize: '0.8125rem',
              border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', transition: 'background 0.15s',
              flexShrink: 0,
            }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            >
              <HiLogout style={{ width: 14, height: 14 }} />
              Изход
            </button>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 24, marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.12)', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
            {[
              { icon: HiChartBar,  label: 'Анализи',   link: '/analyze' },
              { icon: HiTemplate,  label: 'Шаблони',   link: '/templates' },
            ].map(({ icon: Icon, label, link }) => (
              <Link key={label} to={link} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
                transition: 'color 0.15s',
              }}
                onMouseOver={e => e.currentTarget.style.color = '#fff'}
                onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
              >
                <Icon style={{ width: 16, height: 16 }} />
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Edit form card ── */}
        <div className="card anim-fade-up d-1" style={{ padding: 'clamp(24px,4vw,36px)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 24, letterSpacing: '-0.015em' }}>
            Редактиране на профила
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Avatar row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: 'var(--canvas)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <label style={{ cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
                <div className="avatar-ring" style={{ width: 60, height: 60 }}>
                  {displayAvatar
                    ? <img src={displayAvatar} alt="" onError={() => setResolvedAvatar('')} />
                    : <div className="avatar-fallback" style={{ fontSize: '1.25rem' }}>{initial}</div>
                  }
                </div>
                <div style={{
                  position: 'absolute', bottom: -2, right: -2,
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'var(--brand)', border: '2px solid white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <HiCamera style={{ width: 10, height: 10, color: '#fff' }} />
                </div>
                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
              </label>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink-80)' }}>Снимка на профила</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--ink-40)', marginTop: 2 }}>JPG, PNG · до 5MB</p>
                {avatarPreview && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)' }}>
                    <HiCheck style={{ width: 12, height: 12 }} /> Готово за запазване
                  </span>
                )}
              </div>
            </div>

            {/* Username */}
            <div className="form-field">
              <label className="form-label">Потребителско име</label>
              <div className="form-input-wrap">
                <HiUser className="form-input-icon" />
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="вашето_потр_име" className="form-input has-icon" />
              </div>
            </div>

            {/* Email (readonly) */}
            <div className="form-field">
              <label className="form-label">Имейл <span style={{ color: 'var(--ink-40)', fontWeight: 400 }}>(не може да се промени)</span></label>
              <div className="form-input-wrap">
                <HiMail className="form-input-icon" />
                <input type="email" value={user?.email || profile?.email || ''} disabled className="form-input has-icon" />
              </div>
            </div>

            {error   && <div className="alert alert-error"><span>{error}</span></div>}
            {success && <div className="alert alert-success"><span>{success}</span></div>}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
              <button type="submit" disabled={loading} className="btn-primary" style={{ gap: 8 }}>
                {loading
                  ? <><span>Запазване...</span></>
                  : <><HiSave style={{ width: 15, height: 15 }} /><span>Запази промените</span></>
                }
              </button>
            </div>
          </form>
        </div>

        {/* ── Danger zone ── */}
        <div className="card anim-fade-up d-2" style={{ padding: 'clamp(20px,4vw,28px)', marginTop: 16, border: '1px solid rgba(239,68,68,0.12)' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--error)', marginBottom: 8 }}>Зона за опасни действия</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-60)', marginBottom: 14 }}>
            Изходът ви отвежда към страницата за вход. Данните ви се запазват.
          </p>
          <button onClick={signOut} className="btn-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <HiLogout style={{ width: 14, height: 14 }} />
            Изход от профила
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile
