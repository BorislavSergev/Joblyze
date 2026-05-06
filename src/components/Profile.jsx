import { useEffect, useMemo, useState } from 'react'
import { HiCamera, HiUser, HiMail, HiSave, HiCheck, HiChartBar, HiTemplate, HiLogout, HiBriefcase, HiAcademicCap, HiGlobeAlt, HiStar, HiTrash, HiEye, HiDocumentText } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import { getAvatarUrl, invalidateAvatar } from '../services/avatarCache'
import { useTranslation } from 'react-i18next'

function Profile() {
  const { user, profile, updateUser, upsertProfile, refreshProfile, setProfileOptimistic, signOut, cvs, deleteCv } = useAuth()
  const { t } = useTranslation()
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
    if (!file.type.startsWith('image/')) { setError(t('profile.invalid_image')); return }
    if (file.size > 5 * 1024 * 1024) { setError(t('profile.photo_too_large')); return }
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
    if (err) throw new Error(t('profile.upload_failed', { message: err.message }))
    const { data: pub } = supabase.storage.from('Users').getPublicUrl(avatarPath)
    return { avatarPath, avatarUrl: pub.publicUrl || '' }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    const trimmed = username.trim()
    if (!trimmed) { setError(t('profile.username_required')); return }
    if (!user?.id) { setError(t('profile.user_not_found')); return }
    setLoading(true)
    try {
      setProfileOptimistic({ username: trimmed, avatar_url: avatarPreview || profile?.avatar_url || user?.user_metadata?.avatar_url || '' })
      const oldPath = profile?.avatar_path || user?.user_metadata?.avatar_path
      const { avatarPath, avatarUrl } = await uploadAvatar(user.id)
      if (oldPath && oldPath !== avatarPath) invalidateAvatar(oldPath)
      invalidateAvatar(avatarPath)
      const { error: err } = await updateUser({ data: { username: trimmed, avatar_path: avatarPath, avatar_url: avatarUrl } })
      if (err) throw err
      await upsertProfile({ userId: user.id, email: user.email || profile?.email || '', username: trimmed, avatar_path: avatarPath, avatar_url: avatarUrl })
      await refreshProfile()
      setAvatarFile(null); setAvatarPreview('')
      setSuccess(t('profile.update_success'))
    } catch (err) {
      setError(err.message || t('profile.update_failed'))
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
                {t('profile.profile_label')}
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
              {t('profile.sign_out')}
            </button>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 24, marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.12)', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
            {[
              { icon: HiChartBar, label: t('profile.analyses'),  link: '/analyze' },
              { icon: HiTemplate, label: t('profile.templates'), link: '/templates' },
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
            {t('profile.edit_title')}
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
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink-80)' }}>{t('profile.profile_photo')}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--ink-40)', marginTop: 2 }}>{t('profile.photo_types')}</p>
                {avatarPreview && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)' }}>
                    <HiCheck style={{ width: 12, height: 12 }} /> {t('profile.ready_to_save')}
                  </span>
                )}
              </div>
            </div>

            {/* Username */}
            <div className="form-field">
              <label className="form-label">{t('profile.username')}</label>
              <div className="form-input-wrap">
                <HiUser className="form-input-icon" />
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder={t('profile.username_placeholder')} className="form-input has-icon" />
              </div>
            </div>

            {/* Email (readonly) */}
            <div className="form-field">
              <label className="form-label">{t('profile.email')} <span style={{ color: 'var(--ink-40)', fontWeight: 400 }}>{t('profile.cannot_change')}</span></label>
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
                  ? <><span>{t('profile.saving')}</span></>
                  : <><HiSave style={{ width: 15, height: 15 }} /><span>{t('profile.save_changes')}</span></>
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
                {t('profile.saved_cvs')}
              </h2>
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 600, background: 'var(--brand-light)', color: 'var(--brand)', padding: '3px 10px', borderRadius: 99 }}>
                {cvs.length} {cvs.length === 1 ? t('profile.cv_count_one') : t('profile.cv_count_other')}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {cvs.map((cv, index) => (
                <CvCard key={cv.id || index} cv={cv} onDelete={() => deleteCv(cv.id)} t={t} />
              ))}
            </div>
          </div>
        )}

        {/* Empty CV state */}
        {(!cvs || cvs.length === 0) && (
          <div className="card anim-fade-up d-2" style={{ padding: 'clamp(24px,4vw,36px)', marginTop: 24, textAlign: 'center' }}>
            <HiDocumentText style={{ width: 40, height: 40, color: 'var(--ink-30)', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
              {t('profile.no_cvs_title')}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-60)', marginBottom: 16 }}>
              {t('profile.no_cvs_desc')}
            </p>
            <Link to="/analyze" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px' }}>
              <HiChartBar style={{ width: 14, height: 14 }} />
              {t('profile.analyze_cv')}
            </Link>
          </div>
        )}

        {/* ── Danger zone ── */}
        <div className="card anim-fade-up d-2" style={{ padding: 'clamp(20px,4vw,28px)', marginTop: 16, border: '1px solid rgba(239,68,68,0.12)' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--error)', marginBottom: 8 }}>{t('profile.danger_zone_title')}</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-60)', marginBottom: 14 }}>
            {t('profile.danger_zone_desc')}
          </p>
          <button onClick={signOut} className="btn-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <HiLogout style={{ width: 14, height: 14 }} />
            {t('profile.sign_out_profile')}
          </button>
        </div>
      </div>
    </div>
  )
}

function CvCard({ cv, onDelete, t }) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (window.confirm(t('profile.delete_confirm'))) {
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
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'linear-gradient(135deg, var(--brand) 0%, #6366f1 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>{initials}</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--ink)' }}>{cv.name || t('profile.no_name')}</span>
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
          {cv.summary && (
            <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-60)', lineHeight: 1.7, margin: 0 }}>{cv.summary}</p>
            </div>
          )}

          {cv.skills && cv.skills.length > 0 && (
            <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <HiStar style={{ width: 12, height: 12, color: 'var(--brand)' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-40)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('profile.skills')}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {cv.skills.slice(0, 12).map((skill, i) => (
                  <span key={i} style={{ fontSize: '0.72rem', fontWeight: 600, background: 'var(--surface-2)', color: 'var(--ink-70)', padding: '4px 10px', borderRadius: 6 }}>{skill}</span>
                ))}
                {cv.skills.length > 12 && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-40)', padding: '4px 10px' }}>
                    {t('profile.more_skills', { count: cv.skills.length - 12 })}
                  </span>
                )}
              </div>
            </div>
          )}

          {cv.experience && cv.experience.length > 0 && (
            <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <HiBriefcase style={{ width: 12, height: 12, color: 'var(--brand)' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-40)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('profile.experience')}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {cv.experience.slice(0, 3).map((exp, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--ink)' }}>{exp.role}</span>
                      {exp.period && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--ink-40)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 4 }}>{exp.period}</span>
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

          {cv.education && cv.education.length > 0 && (
            <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <HiAcademicCap style={{ width: 12, height: 12, color: 'var(--brand)' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-40)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('profile.education')}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {cv.education.map((edu, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--ink)' }}>{edu.degree}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--brand)' }}>{edu.school}</div>
                    </div>
                    {edu.period && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--ink-40)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 4 }}>{edu.period}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingTop: 4 }}>
            {cv.languages && cv.languages.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <HiGlobeAlt style={{ width: 12, height: 12, color: 'var(--brand)' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-40)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('profile.languages')}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {cv.languages.map((lang, i) => (
                    <span key={i} style={{ fontSize: '0.78rem', color: 'var(--ink-60)' }}>• {lang}</span>
                  ))}
                </div>
              </div>
            )}

            {cv.certifications && cv.certifications.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <HiStar style={{ width: 12, height: 12, color: 'var(--brand)' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-40)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('profile.certifications')}</span>
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
