import { useEffect, useMemo, useState } from 'react'
import { HiCamera, HiUser, HiMail, HiSave, HiCheck, HiChartBar, HiTemplate, HiLogout, HiBriefcase, HiAcademicCap, HiGlobeAlt, HiStar, HiTrash, HiEye, HiDocumentText } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import { getAvatarUrl, invalidateAvatar } from '../services/avatarCache'

function Profile() {
  const { user, profile, updateUser, upsertProfile, refreshProfile, setProfileOptimistic, signOut, cvs, deleteCv } = useAuth()
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

        {/* ── Saved CVs section ── */}
        {cvs && cvs.length > 0 && (
          <div className="card anim-fade-up d-2" style={{ padding: 'clamp(24px,4vw,36px)', marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <HiBriefcase style={{ width: 20, height: 20, color: 'var(--brand)' }} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.015em', margin: 0 }}>
                Запазени автобиографии
              </h2>
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 600, background: 'var(--brand-light)', color: 'var(--brand)', padding: '3px 10px', borderRadius: 99 }}>
                {cvs.length} {cvs.length === 1 ? 'CV' : 'CV-та'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {cvs.map((cv, index) => (
                <CvCard key={cv.id || index} cv={cv} onDelete={() => deleteCv(cv.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Empty CV state */}
        {(!cvs || cvs.length === 0) && (
          <div className="card anim-fade-up d-2" style={{ padding: 'clamp(24px,4vw,36px)', marginTop: 24, textAlign: 'center' }}>
            <HiDocumentText style={{ width: 40, height: 40, color: 'var(--ink-30)', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
              Все още нямате запазени CV-та
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-60)', marginBottom: 16 }}>
              Качете резюме в страницата за анализ и го запазете, за да го видите тук.
            </p>
            <Link to="/analyze" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px' }}>
              <HiChartBar style={{ width: 14, height: 14 }} />
              Анализирай CV
            </Link>
          </div>
        )}

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

/* ════════════════════════════════════════════════════════════════════
   CV Card Component — Beautiful visualization of saved CV
══════════════════════════════════════════════════════════════════════ */
function CvCard({ cv, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете това CV?')) {
      setDeleting(true)
      await onDelete()
      setDeleting(false)
    }
  }

  const initials = cv.initials || (cv.name ? cv.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??')
  const createdDate = cv.created_at ? new Date(cv.created_at).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
    }}>
      {/* Card header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
        cursor: 'pointer',
        background: expanded ? 'var(--surface-2)' : 'transparent',
      }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Avatar circle */}
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'linear-gradient(135deg, var(--brand) 0%, #6366f1 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>{initials}</span>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--ink)' }}>{cv.name || 'Без име'}</span>
            {cv.title && (
              <span style={{ fontSize: '0.7rem', fontWeight: 600, background: 'var(--brand-light)', color: 'var(--brand)', padding: '2px 8px', borderRadius: 99 }}>
                {cv.title}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.78rem', color: 'var(--ink-40)' }}>
            {cv.email && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><HiMail style={{ width: 11, height: 11 }} />{cv.email}</span>}
            {createdDate && <span>· {createdDate}</span>}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--surface-2)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ink-60)', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'var(--brand-light)'; e.currentTarget.style.color = 'var(--brand)' }}
            onMouseOut={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--ink-60)' }}
          >
            <HiEye style={{ width: 14, height: 14 }} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete() }}
            disabled={deleting}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'transparent', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ink-40)', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = 'var(--error)' }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-40)' }}
          >
            <HiTrash style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--border)' }}>
          {/* Summary */}
          {cv.summary && (
            <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-60)', lineHeight: 1.7, margin: 0 }}>{cv.summary}</p>
            </div>
          )}

          {/* Skills */}
          {cv.skills && cv.skills.length > 0 && (
            <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <HiStar style={{ width: 12, height: 12, color: 'var(--brand)' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-40)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Умения</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {cv.skills.slice(0, 12).map((skill, i) => (
                  <span key={i} style={{
                    fontSize: '0.72rem', fontWeight: 600,
                    background: 'var(--surface-2)', color: 'var(--ink-70)',
                    padding: '4px 10px', borderRadius: 6,
                  }}>{skill}</span>
                ))}
                {cv.skills.length > 12 && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-40)', padding: '4px 10px' }}>
                    +{cv.skills.length - 12} още
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Experience */}
          {cv.experience && cv.experience.length > 0 && (
            <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <HiBriefcase style={{ width: 12, height: 12, color: 'var(--brand)' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-40)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Опит</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {cv.experience.slice(0, 3).map((exp, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--ink)' }}>{exp.role}</span>
                      {exp.period && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--ink-40)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 4 }}>
                          {exp.period}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--brand)', fontWeight: 600, marginBottom: 4 }}>{exp.company}</div>
                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: 14, listStyle: 'none' }}>
                        {exp.bullets.slice(0, 2).map((bullet, bi) => (
                          <li key={bi} style={{ fontSize: '0.75rem', color: 'var(--ink-60)', marginBottom: 2, paddingLeft: 8, position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 0, color: 'var(--brand)' }}>›</span>
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {cv.education && cv.education.length > 0 && (
            <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <HiAcademicCap style={{ width: 12, height: 12, color: 'var(--brand)' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-40)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Образование</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {cv.education.map((edu, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--ink)' }}>{edu.degree}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--brand)' }}>{edu.school}</div>
                    </div>
                    {edu.period && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--ink-40)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 4 }}>
                        {edu.period}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages & Certifications row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingTop: 4 }}>
            {/* Languages */}
            {cv.languages && cv.languages.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <HiGlobeAlt style={{ width: 12, height: 12, color: 'var(--brand)' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-40)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Езици</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {cv.languages.map((lang, i) => (
                    <span key={i} style={{ fontSize: '0.78rem', color: 'var(--ink-60)' }}>• {lang}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {cv.certifications && cv.certifications.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <HiStar style={{ width: 12, height: 12, color: 'var(--brand)' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-40)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Сертификати</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {cv.certifications.map((cert, i) => (
                    <span key={i} style={{ fontSize: '0.78rem', color: 'var(--ink-60)' }}>✦ {cert}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
