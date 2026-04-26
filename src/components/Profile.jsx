import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  HiCamera, HiUser, HiMail, HiSave, HiCheck, HiChartBar, HiTemplate, HiLogout,
  HiBriefcase, HiAcademicCap, HiGlobeAlt, HiStar, HiTrash, HiEye, HiDocumentText,
  HiX, HiPlus, HiUpload, HiLocationMarker, HiOfficeBuilding, HiCalendar,
  HiChevronLeft, HiChevronRight, HiSparkles, HiDownload, HiRefresh,
} from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import { getAvatarUrl, invalidateAvatar } from '../services/avatarCache'

/* ── Local-storage key for CV wizard draft ── */
const WIZARD_DRAFT_KEY = 'joblyze_cv_wizard_draft'

const EMPTY_EXPERIENCE = () => ({ company: '', role: '', from: '', to: '', current: false })
const EMPTY_WIZARD = () => ({
  firstName: '', lastName: '', location: '',
  title: '', phone: '', website: '', summary: '',
  skills: [],
  experience: [EMPTY_EXPERIENCE()],
})

/* ══════════════════════════════════════════════════════════════════
   MAIN PROFILE COMPONENT
══════════════════════════════════════════════════════════════════ */
function Profile() {
  const { user, profile, updateUser, upsertProfile, refreshProfile, setProfileOptimistic, signOut, cvs, saveCv, deleteCv } = useAuth()
  const [username, setUsername]             = useState(profile?.username || user?.user_metadata?.username || '')
  const [avatarFile, setAvatarFile]         = useState(null)
  const [avatarPreview, setAvatarPreview]   = useState('')
  const [resolvedAvatar, setResolvedAvatar] = useState('')
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState('')
  const [success, setSuccess]               = useState('')

  /* CV file upload to storage bucket */
  const [cvFile, setCvFile]       = useState(null)
  const [cvUploading, setCvUploading] = useState(false)
  const [cvUploadMsg, setCvUploadMsg] = useState('')
  const [cvUploadErr, setCvUploadErr] = useState('')
  const cvFileRef = useRef(null)

  /* CV wizard */
  const [wizardOpen, setWizardOpen] = useState(false)

  /* Uploaded CV files from storage bucket */
  const [uploadedFiles, setUploadedFiles]     = useState([])
  const [filesLoading, setFilesLoading]       = useState(false)
  const [fileDeleteId, setFileDeleteId]       = useState(null)

  const fetchUploadedFiles = useCallback(async () => {
    if (!user?.id) return
    setFilesLoading(true)
    try {
      const { data, error: err } = await supabase.storage
        .from('Users')
        .list(user.id, { sortBy: { column: 'updated_at', order: 'desc' } })
      if (err) throw err
      // exclude avatar files and .emptyFolderPlaceholder
      const cvFiles = (data || []).filter(
        f => f.name && !f.name.startsWith('avatar-') && !f.name.startsWith('.')
      )
      setUploadedFiles(cvFiles)
    } catch (err) {
      console.error('Failed to list CV files:', err)
    } finally {
      setFilesLoading(false)
    }
  }, [user?.id])

  useEffect(() => { fetchUploadedFiles() }, [fetchUploadedFiles])

  const getFileUrl = (fileName) => {
    const { data } = supabase.storage.from('Users').getPublicUrl(`${user.id}/${fileName}`)
    return data?.publicUrl || ''
  }

  const handleDeleteFile = async (fileName) => {
    if (!window.confirm(`Изтрий "${fileName}"?`)) return
    setFileDeleteId(fileName)
    try {
      await supabase.storage.from('Users').remove([`${user.id}/${fileName}`])
      setUploadedFiles(prev => prev.filter(f => f.name !== fileName))
    } catch { /* ignore */ } finally {
      setFileDeleteId(null)
    }
  }

  const displayAvatar = useMemo(() =>
    avatarPreview || resolvedAvatar || profile?.avatar_url || user?.user_metadata?.avatar_url || ''
  , [avatarPreview, resolvedAvatar, profile?.avatar_url, user?.user_metadata?.avatar_url])

  const displayName = profile?.username || user?.user_metadata?.username || user?.email || ''
  const initial = displayName.charAt(0).toUpperCase()

  useEffect(() => {
    let alive = true
    getAvatarUrl(user, profile).then(url => { if (alive) setResolvedAvatar(url) })
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

  /* ── Upload CV file to storage bucket ── */
  const handleCvFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ['application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowed.includes(file.type)) { setCvUploadErr('Само PDF, TXT или DOCX файлове.'); return }
    if (file.size > 10 * 1024 * 1024) { setCvUploadErr('Файлът трябва да е под 10MB.'); return }
    setCvUploadErr('')
    setCvFile(file)
  }

  const handleCvUpload = async () => {
    if (!cvFile || !user?.id) return
    setCvUploading(true); setCvUploadMsg(''); setCvUploadErr('')
    try {
      const ext = cvFile.name.split('.').pop() || 'pdf'
      const path = `${user.id}/cv-${Date.now()}.${ext}`
      const { error: err } = await supabase.storage.from('Users').upload(path, cvFile, { upsert: true, contentType: cvFile.type })
      if (err) throw new Error(err.message)
      setCvUploadMsg('CV файлът е качен успешно в облака!')
      setCvFile(null)
      if (cvFileRef.current) cvFileRef.current.value = ''
      fetchUploadedFiles()
    } catch (err) {
      setCvUploadErr(`Грешка: ${err.message}`)
    } finally {
      setCvUploading(false)
    }
  }

  return (
    <div className="page-container" style={{ paddingTop: 'clamp(32px,5vw,60px)', paddingBottom: 'clamp(32px,5vw,60px)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

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
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Профил</p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.25rem,3vw,1.625rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }} className="truncate">
                {displayName}
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', marginTop: 2 }} className="truncate">{user?.email}</p>
            </div>
            <button onClick={signOut} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.85)', fontWeight: 500, fontSize: '0.8125rem',
              border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', transition: 'background 0.15s', flexShrink: 0,
            }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            >
              <HiLogout style={{ width: 14, height: 14 }} /> Изход
            </button>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.12)', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
            {[
              { icon: HiChartBar, label: 'Анализи',  link: '/analyze' },
              { icon: HiTemplate, label: 'Шаблони',  link: '/templates' },
            ].map(({ icon: Icon, label, link }) => (
              <Link key={label} to={link} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.15s',
              }}
                onMouseOver={e => e.currentTarget.style.color = '#fff'}
                onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
              >
                <Icon style={{ width: 16, height: 16 }} />{label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Edit profile card ── */}
        <div className="card anim-fade-up d-1" style={{ padding: 'clamp(24px,4vw,36px)', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 24, letterSpacing: '-0.015em' }}>
            Редактиране на профила
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: 'var(--canvas)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <label style={{ cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
                <div className="avatar-ring" style={{ width: 60, height: 60 }}>
                  {displayAvatar
                    ? <img src={displayAvatar} alt="" onError={() => setResolvedAvatar('')} />
                    : <div className="avatar-fallback" style={{ fontSize: '1.25rem' }}>{initial}</div>
                  }
                </div>
                <div style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: '50%', background: 'var(--brand)', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            <div className="form-field">
              <label className="form-label">Потребителско име</label>
              <div className="form-input-wrap">
                <HiUser className="form-input-icon" />
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="вашето_потр_име" className="form-input has-icon" />
              </div>
            </div>
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
                {loading ? <span>Запазване...</span> : <><HiSave style={{ width: 15, height: 15 }} /><span>Запази промените</span></>}
              </button>
            </div>
          </form>
        </div>

        {/* ── CV Section ── */}
        <div className="card anim-fade-up d-2" style={{ padding: 'clamp(24px,4vw,36px)', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <HiDocumentText style={{ width: 20, height: 20, color: 'var(--brand)', flexShrink: 0 }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.015em', margin: 0, flex: 1 }}>
              Автобиографии
            </h2>
            <button
              onClick={() => setWizardOpen(true)}
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: '0.8125rem' }}
            >
              <HiSparkles style={{ width: 14, height: 14 }} /> Създай CV
            </button>
          </div>

          {/* Upload existing CV file */}
          <div style={{ background: 'var(--canvas)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '18px 20px', marginBottom: 20 }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink-80)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <HiUpload style={{ width: 14, height: 14, color: 'var(--brand)' }} /> Качи CV файл в облака
            </p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 'var(--radius)', cursor: 'pointer',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                fontSize: '0.8125rem', fontWeight: 500, color: 'var(--ink-80)',
                transition: 'all 0.15s', position: 'relative',
              }}>
                <HiDocumentText style={{ width: 14, height: 14, color: 'var(--brand)' }} />
                {cvFile ? cvFile.name : 'Избери файл'}
                <input ref={cvFileRef} type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleCvFileChange} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
              </label>
              {cvFile && (
                <button
                  onClick={handleCvUpload}
                  disabled={cvUploading}
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: '0.8125rem' }}
                >
                  <HiUpload style={{ width: 13, height: 13 }} />
                  {cvUploading ? 'Качване...' : 'Качи'}
                </button>
              )}
              {cvFile && (
                <button onClick={() => { setCvFile(null); if (cvFileRef.current) cvFileRef.current.value = '' }}
                  style={{ width: 30, height: 30, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-40)' }}>
                  <HiX style={{ width: 14, height: 14 }} />
                </button>
              )}
            </div>
            {cvUploadMsg && <p style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--success)', fontWeight: 500 }}>{cvUploadMsg}</p>}
            {cvUploadErr && <p style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--error)', fontWeight: 500 }}>{cvUploadErr}</p>}
            <p style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--ink-40)' }}>PDF, TXT, DOCX · до 10MB</p>
          </div>

          {/* Uploaded files list */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink-40)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Качени файлове
              </span>
              {uploadedFiles.length > 0 && (
                <span style={{ fontSize: '0.7rem', fontWeight: 600, background: 'var(--surface-2)', color: 'var(--ink-60)', padding: '2px 8px', borderRadius: 99 }}>
                  {uploadedFiles.length}
                </span>
              )}
              <button
                onClick={fetchUploadedFiles}
                disabled={filesLoading}
                title="Обнови списъка"
                style={{ marginLeft: 'auto', width: 26, height: 26, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-40)', transition: 'all 0.15s' }}
                onMouseOver={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--brand)' }}
                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-40)' }}
              >
                <HiRefresh style={{ width: 13, height: 13, animation: filesLoading ? 'spinCW 0.8s linear infinite' : 'none' }} />
              </button>
            </div>

            {filesLoading && uploadedFiles.length === 0 ? (
              <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--ink-40)', fontSize: '0.8125rem' }}>
                Зареждане...
              </div>
            ) : uploadedFiles.length === 0 ? (
              <div style={{ padding: '14px 16px', borderRadius: 'var(--radius-lg)', border: '1.5px dashed var(--border)', textAlign: 'center', color: 'var(--ink-40)', fontSize: '0.8125rem' }}>
                Все още няма качени файлове
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {uploadedFiles.map(file => (
                  <UploadedFileRow
                    key={file.name}
                    file={file}
                    url={getFileUrl(file.name)}
                    deleting={fileDeleteId === file.name}
                    onDelete={() => handleDeleteFile(file.name)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Saved CVs list */}
          {cvs && cvs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink-40)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Запазени CV-та</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, background: 'var(--brand-light)', color: 'var(--brand)', padding: '2px 8px', borderRadius: 99 }}>
                  {cvs.length}
                </span>
              </div>
              {cvs.map((cv, index) => (
                <CvCard key={cv.id || index} cv={cv} onDelete={() => deleteCv(cv.id)} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0 8px' }}>
              <HiDocumentText style={{ width: 36, height: 36, color: 'var(--ink-20)', margin: '0 auto 10px' }} />
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-40)' }}>
                Все още нямате запазени CV-та. Качете файл или създайте ново.
              </p>
            </div>
          )}
        </div>

        {/* ── Danger zone ── */}
        <div className="card anim-fade-up d-3" style={{ padding: 'clamp(20px,4vw,28px)', border: '1px solid rgba(239,68,68,0.12)' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--error)', marginBottom: 8 }}>Зона за опасни действия</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-60)', marginBottom: 14 }}>
            Изходът ви отвежда към страницата за вход. Данните ви се запазват.
          </p>
          <button onClick={signOut} className="btn-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <HiLogout style={{ width: 14, height: 14 }} /> Изход от профила
          </button>
        </div>
      </div>

      {/* ── CV Wizard Dialog ── */}
      {wizardOpen && (
        <CvWizard
          user={user}
          saveCv={saveCv}
          onClose={() => setWizardOpen(false)}
        />
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   CV WIZARD — multi-step dialog with local-storage persistence
══════════════════════════════════════════════════════════════════ */
const STEPS = ['Лична информация', 'Трудов опит', 'Умения', 'Преглед']

function CvWizard({ user, saveCv, onClose }) {
  const [step, setStep]   = useState(0)
  const [data, setData]   = useState(() => {
    try {
      const saved = localStorage.getItem(WIZARD_DRAFT_KEY)
      return saved ? JSON.parse(saved) : EMPTY_WIZARD()
    } catch { return EMPTY_WIZARD() }
  })
  const [saving, setSaving]     = useState(false)
  const [saveErr, setSaveErr]   = useState('')
  const [skillInput, setSkillInput] = useState('')

  /* persist draft on every change */
  useEffect(() => {
    try { localStorage.setItem(WIZARD_DRAFT_KEY, JSON.stringify(data)) } catch {}
  }, [data])

  const update = (key, value) => setData(prev => ({ ...prev, [key]: value }))

  /* skills */
  const addSkill = () => {
    const trimmed = skillInput.trim()
    if (!trimmed) return
    const skills = trimmed.split(',').map(s => s.trim()).filter(Boolean)
    const next = [...new Set([...data.skills, ...skills])]
    update('skills', next)
    setSkillInput('')
  }
  const removeSkill = (i) => update('skills', data.skills.filter((_, idx) => idx !== i))

  /* experience */
  const addExp = () => update('experience', [...data.experience, EMPTY_EXPERIENCE()])
  const updateExp = (i, key, value) => {
    const next = data.experience.map((e, idx) => idx === i ? { ...e, [key]: value } : e)
    update('experience', next)
  }
  const removeExp = (i) => update('experience', data.experience.filter((_, idx) => idx !== i))
  const toggleCurrent = (i) => updateExp(i, 'current', !data.experience[i].current)

  /* save */
  const handleSave = async () => {
    setSaveErr(''); setSaving(true)
    try {
      const cvPayload = {
        name: `${data.firstName} ${data.lastName}`.trim(),
        initials: `${data.firstName[0] || ''}${data.lastName[0] || ''}`.toUpperCase(),
        title: data.title,
        email: user?.email || '',
        phone: data.phone,
        location: data.location,
        website: data.website,
        summary: data.summary,
        skills: data.skills,
        experience: data.experience.map(e => ({
          company: e.company,
          role: e.role,
          period: e.current ? `${e.from} – настояще` : `${e.from} – ${e.to}`,
          location: '',
          bullets: [],
        })),
        education: [],
        languages: [],
        certifications: [],
      }
      await saveCv(cvPayload)
      localStorage.removeItem(WIZARD_DRAFT_KEY)
      onClose()
    } catch (err) {
      setSaveErr(err.message || 'Грешка при запазване.')
    } finally {
      setSaving(false)
    }
  }

  const canNext = () => {
    if (step === 0) return data.firstName.trim() && data.lastName.trim()
    if (step === 1) return true
    if (step === 2) return true
    return true
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: 'var(--white)', borderRadius: 'var(--radius-2xl)',
        width: '100%', maxWidth: 560,
        boxShadow: 'var(--shadow-xl)',
        display: 'flex', flexDirection: 'column',
        maxHeight: '90vh', overflow: 'hidden',
        animation: 'fadeUp 0.25s var(--ease)',
      }}>
        {/* Header */}
        <div style={{
          padding: '22px 24px 18px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'flex-start', gap: 12, flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {STEPS.map((label, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                  <div style={{
                    height: 3, borderRadius: 99, width: '100%',
                    background: i <= step ? 'var(--brand)' : 'var(--border)',
                    transition: 'background 0.3s',
                  }} />
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 600,
                    color: i === step ? 'var(--brand)' : i < step ? 'var(--success)' : 'var(--ink-40)',
                    letterSpacing: '0.04em', whiteSpace: 'nowrap',
                  }}>{label}</span>
                </div>
              ))}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.015em' }}>
              {STEPS[step]}
            </h2>
          </div>
          <button onClick={onClose} style={{
            width: 34, height: 34, borderRadius: 10, border: 'none', background: 'var(--surface-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            color: 'var(--ink-60)', flexShrink: 0,
          }}>
            <HiX style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

          {/* Step 0 – Personal info */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <WizardField label="Собствено име *" icon={HiUser} value={data.firstName} onChange={v => update('firstName', v)} placeholder="Иван" />
                <WizardField label="Фамилно име *" icon={HiUser} value={data.lastName} onChange={v => update('lastName', v)} placeholder="Иванов" />
              </div>
              <WizardField label="Местоживеене" icon={HiLocationMarker} value={data.location} onChange={v => update('location', v)} placeholder="гр. София, България" />
              <WizardField label="Длъжност / Позиция" icon={HiBriefcase} value={data.title} onChange={v => update('title', v)} placeholder="Софтуерен инженер" />
              <WizardField label="Телефон" icon={HiUser} value={data.phone} onChange={v => update('phone', v)} placeholder="+359 88 888 8888" />
              <WizardField label="Уебсайт / LinkedIn" icon={HiGlobeAlt} value={data.website} onChange={v => update('website', v)} placeholder="linkedin.com/in/..." />
              <div className="form-field">
                <label className="form-label">Кратко резюме</label>
                <textarea
                  value={data.summary}
                  onChange={e => update('summary', e.target.value)}
                  placeholder="Кратко описание за вас..."
                  rows={3}
                  className="form-input"
                  style={{ resize: 'vertical', paddingTop: 10, paddingBottom: 10 }}
                />
              </div>
            </div>
          )}

          {/* Step 1 – Experience */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {data.experience.map((exp, i) => (
                <ExperienceEntry key={i} exp={exp} index={i}
                  onChange={updateExp} onRemove={removeExp}
                  onToggleCurrent={toggleCurrent}
                  canRemove={data.experience.length > 1}
                />
              ))}
              <button onClick={addExp} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
                borderRadius: 'var(--radius)', border: '1.5px dashed var(--brand-mid)',
                background: 'var(--brand-light)', color: 'var(--brand)',
                fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                width: '100%', justifyContent: 'center', transition: 'all 0.15s',
              }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--brand-mid)'}
                onMouseOut={e => e.currentTarget.style.background = 'var(--brand-light)'}
              >
                <HiPlus style={{ width: 15, height: 15 }} /> Добави работно място
              </button>
            </div>
          )}

          {/* Step 2 – Skills */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
                  Добави умения <span style={{ color: 'var(--ink-40)', fontWeight: 400 }}>(разделени със запетая)</span>
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div className="form-input-wrap" style={{ flex: 1, margin: 0 }}>
                    <HiStar className="form-input-icon" />
                    <input
                      type="text"
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                      placeholder="React, TypeScript, Node.js..."
                      className="form-input has-icon"
                    />
                  </div>
                  <button onClick={addSkill} className="btn-primary" style={{ padding: '0 16px', flexShrink: 0 }}>
                    <HiPlus style={{ width: 15, height: 15 }} />
                  </button>
                </div>
              </div>

              {data.skills.length > 0 ? (
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-40)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
                    Добавени умения ({data.skills.length})
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {data.skills.map((skill, i) => (
                      <SkillChip key={i} skill={skill} onRemove={() => removeSkill(i)} />
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--ink-40)', fontSize: '0.875rem' }}>
                  Все още няма добавени умения
                </div>
              )}
            </div>
          )}

          {/* Step 3 – Review */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <ReviewSection title="Лична информация" icon={HiUser}>
                <ReviewRow label="Имe" value={`${data.firstName} ${data.lastName}`.trim()} />
                {data.location && <ReviewRow label="Местоживеене" value={data.location} />}
                {data.title    && <ReviewRow label="Позиция" value={data.title} />}
                {data.phone    && <ReviewRow label="Телефон" value={data.phone} />}
                {data.website  && <ReviewRow label="Уебсайт" value={data.website} />}
                {data.summary  && <ReviewRow label="Резюме" value={data.summary} />}
              </ReviewSection>

              {data.experience.some(e => e.company) && (
                <ReviewSection title="Трудов опит" icon={HiBriefcase}>
                  {data.experience.filter(e => e.company).map((exp, i) => (
                    <div key={i} style={{ paddingBottom: i < data.experience.filter(e => e.company).length - 1 ? 10 : 0, borderBottom: i < data.experience.filter(e => e.company).length - 1 ? '1px solid var(--border)' : 'none', marginBottom: i < data.experience.filter(e => e.company).length - 1 ? 10 : 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ink)' }}>{exp.role || '—'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--brand)', fontWeight: 600 }}>{exp.company}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-40)', marginTop: 2 }}>
                        {exp.from}{exp.to || exp.current ? ` – ${exp.current ? 'настояще' : exp.to}` : ''}
                      </div>
                    </div>
                  ))}
                </ReviewSection>
              )}

              {data.skills.length > 0 && (
                <ReviewSection title="Умения" icon={HiStar}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {data.skills.map((s, i) => (
                      <span key={i} style={{ fontSize: '0.75rem', fontWeight: 600, background: 'var(--surface-2)', color: 'var(--ink-70)', padding: '3px 10px', borderRadius: 6 }}>{s}</span>
                    ))}
                  </div>
                </ReviewSection>
              )}

              {saveErr && <div className="alert alert-error"><span>{saveErr}</span></div>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
          gap: 10,
        }}>
          <button
            onClick={() => step === 0 ? onClose() : setStep(s => s - 1)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
              background: 'var(--surface-2)', color: 'var(--ink-60)',
              fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer',
            }}
          >
            <HiChevronLeft style={{ width: 14, height: 14 }} />
            {step === 0 ? 'Отказ' : 'Назад'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-40)' }}>
              Стъпка {step + 1} от {STEPS.length}
            </span>
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px' }}
              >
                Напред <HiChevronRight style={{ width: 14, height: 14 }} />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px' }}
              >
                <HiCheck style={{ width: 14, height: 14 }} />
                {saving ? 'Запазване...' : 'Запази CV'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Wizard sub-components ── */

function WizardField({ label, icon: Icon, value, onChange, placeholder, type = 'text' }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <div className="form-input-wrap">
        {Icon && <Icon className="form-input-icon" />}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`form-input${Icon ? ' has-icon' : ''}`}
        />
      </div>
    </div>
  )
}

function ExperienceEntry({ exp, index, onChange, onRemove, onToggleCurrent, canRemove }) {
  return (
    <div style={{
      background: 'var(--canvas)', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)', padding: '16px 18px',
      position: 'relative',
    }}>
      {canRemove && (
        <button onClick={() => onRemove(index)} style={{
          position: 'absolute', top: 12, right: 12,
          width: 28, height: 28, borderRadius: 8, border: 'none',
          background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--ink-40)', transition: 'all 0.15s',
        }}
          onMouseOver={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = 'var(--error)' }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-40)' }}
        >
          <HiTrash style={{ width: 13, height: 13 }} />
        </button>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HiOfficeBuilding style={{ width: 13, height: 13, color: 'var(--brand)' }} />
        </div>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ink-80)' }}>Работно място {index + 1}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="form-field" style={{ margin: 0 }}>
            <label className="form-label">Компания</label>
            <input type="text" value={exp.company} onChange={e => onChange(index, 'company', e.target.value)}
              placeholder="Google" className="form-input" style={{ height: 38 }} />
          </div>
          <div className="form-field" style={{ margin: 0 }}>
            <label className="form-label">Длъжност</label>
            <input type="text" value={exp.role} onChange={e => onChange(index, 'role', e.target.value)}
              placeholder="Senior Developer" className="form-input" style={{ height: 38 }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="form-field" style={{ margin: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <HiCalendar style={{ width: 10, height: 10 }} /> От
            </label>
            <input type="month" value={exp.from} onChange={e => onChange(index, 'from', e.target.value)}
              className="form-input" style={{ height: 38 }} />
          </div>
          <div className="form-field" style={{ margin: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <HiCalendar style={{ width: 10, height: 10 }} /> До
            </label>
            <input type="month" value={exp.to} onChange={e => onChange(index, 'to', e.target.value)}
              disabled={exp.current} className="form-input" style={{ height: 38, opacity: exp.current ? 0.4 : 1 }} />
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
          <div onClick={() => onToggleCurrent(index)} style={{
            width: 18, height: 18, borderRadius: 5,
            border: `2px solid ${exp.current ? 'var(--brand)' : 'var(--border-strong)'}`,
            background: exp.current ? 'var(--brand)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s', cursor: 'pointer', flexShrink: 0,
          }}>
            {exp.current && <HiCheck style={{ width: 10, height: 10, color: '#fff' }} />}
          </div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--ink-70)' }}>Работя тук в момента</span>
        </label>
      </div>
    </div>
  )
}

function SkillChip({ skill, onRemove }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 10px 5px 12px', borderRadius: 'var(--radius-full)',
      background: 'var(--brand-light)', border: '1px solid var(--brand-mid)',
      fontSize: '0.8rem', fontWeight: 600, color: 'var(--brand)',
    }}>
      {skill}
      <button onClick={onRemove} style={{
        width: 16, height: 16, borderRadius: '50%', border: 'none',
        background: 'var(--brand-mid)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--brand)', padding: 0, flexShrink: 0,
        transition: 'all 0.15s',
      }}
        onMouseOver={e => { e.currentTarget.style.background = 'var(--brand)'; e.currentTarget.style.color = '#fff' }}
        onMouseOut={e => { e.currentTarget.style.background = 'var(--brand-mid)'; e.currentTarget.style.color = 'var(--brand)' }}
      >
        <HiX style={{ width: 9, height: 9 }} />
      </button>
    </span>
  )
}

function ReviewSection({ title, icon: Icon, children }) {
  return (
    <div style={{ background: 'var(--canvas)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 7, background: 'var(--surface-2)' }}>
        <Icon style={{ width: 13, height: 13, color: 'var(--brand)' }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink-60)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{title}</span>
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  )
}

function ReviewRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--ink-40)', minWidth: 90, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.8125rem', color: 'var(--ink-80)', lineHeight: 1.5 }}>{value || '—'}</span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   CV CARD — saved CV visualization
══════════════════════════════════════════════════════════════════ */
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
      background: 'var(--white)', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)', overflow: 'hidden',
      transition: 'box-shadow 0.2s',
    }}
      onMouseOver={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
      onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
        cursor: 'pointer', background: expanded ? 'var(--canvas)' : 'transparent',
      }} onClick={() => setExpanded(!expanded)}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--brand) 0%, #6366f1 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.875rem' }}>{initials}</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)' }}>{cv.name || 'Без ime'}</span>
            {cv.title && (
              <span style={{ fontSize: '0.68rem', fontWeight: 600, background: 'var(--brand-light)', color: 'var(--brand)', padding: '2px 8px', borderRadius: 99 }}>
                {cv.title}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.75rem', color: 'var(--ink-40)' }}>
            {cv.email && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><HiMail style={{ width: 10, height: 10 }} />{cv.email}</span>}
            {createdDate && <span>· {createdDate}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={e => { e.stopPropagation(); setExpanded(!expanded) }}
            style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface-2)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-60)', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseOver={e => { e.currentTarget.style.background = 'var(--brand-light)'; e.currentTarget.style.color = 'var(--brand)' }}
            onMouseOut={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--ink-60)' }}
          >
            <HiEye style={{ width: 13, height: 13 }} />
          </button>
          <button onClick={e => { e.stopPropagation(); handleDelete() }} disabled={deleting}
            style={{ width: 30, height: 30, borderRadius: 8, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-40)', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseOver={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = 'var(--error)' }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-40)' }}
          >
            <HiTrash style={{ width: 13, height: 13 }} />
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
          {cv.summary && (
            <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.83rem', color: 'var(--ink-60)', lineHeight: 1.7, margin: 0 }}>{cv.summary}</p>
            </div>
          )}

          {cv.skills && cv.skills.length > 0 && (
            <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                <HiStar style={{ width: 11, height: 11, color: 'var(--brand)' }} />
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--ink-40)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Умения</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {cv.skills.slice(0, 14).map((skill, i) => (
                  <span key={i} style={{ fontSize: '0.7rem', fontWeight: 600, background: 'var(--surface-2)', color: 'var(--ink-70)', padding: '3px 9px', borderRadius: 5 }}>{skill}</span>
                ))}
                {cv.skills.length > 14 && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--ink-40)', padding: '3px 9px' }}>+{cv.skills.length - 14} още</span>
                )}
              </div>
            </div>
          )}

          {cv.experience && cv.experience.length > 0 && (
            <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                <HiBriefcase style={{ width: 11, height: 11, color: 'var(--brand)' }} />
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--ink-40)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Трудов опит</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cv.experience.slice(0, 4).map((exp, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.825rem', color: 'var(--ink)' }}>{exp.role}</span>
                      {exp.period && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--ink-40)', background: 'var(--surface-2)', padding: '2px 7px', borderRadius: 4, flexShrink: 0, marginLeft: 8 }}>{exp.period}</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--brand)', fontWeight: 600, marginBottom: 3 }}>{exp.company}</div>
                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                        {exp.bullets.slice(0, 2).map((bullet, bi) => (
                          <li key={bi} style={{ fontSize: '0.73rem', color: 'var(--ink-60)', marginBottom: 2, paddingLeft: 12, position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 0, color: 'var(--brand)' }}>›</span>{bullet}
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
            <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                <HiAcademicCap style={{ width: 11, height: 11, color: 'var(--brand)' }} />
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--ink-40)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Образование</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {cv.education.map((edu, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.825rem', color: 'var(--ink)' }}>{edu.degree}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--brand)' }}>{edu.school}</div>
                    </div>
                    {edu.period && (
                      <span style={{ fontSize: '0.68rem', color: 'var(--ink-40)', background: 'var(--surface-2)', padding: '2px 7px', borderRadius: 4, flexShrink: 0, marginLeft: 8 }}>{edu.period}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingTop: 4 }}>
            {cv.languages && cv.languages.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
                  <HiGlobeAlt style={{ width: 11, height: 11, color: 'var(--brand)' }} />
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--ink-40)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Езици</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {cv.languages.map((lang, i) => (
                    <span key={i} style={{ fontSize: '0.775rem', color: 'var(--ink-60)' }}>• {lang}</span>
                  ))}
                </div>
              </div>
            )}
            {cv.certifications && cv.certifications.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
                  <HiStar style={{ width: 11, height: 11, color: 'var(--brand)' }} />
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--ink-40)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Сертификати</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {cv.certifications.map((cert, i) => (
                    <span key={i} style={{ fontSize: '0.775rem', color: 'var(--ink-60)' }}>✦ {cert}</span>
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

/* ══════════════════════════════════════════════════════════════════
   UPLOADED FILE ROW + PREVIEW DIALOG
══════════════════════════════════════════════════════════════════ */
const FILE_ICONS = {
  pdf:  { bg: '#fef2f2', color: '#ef4444', label: 'PDF' },
  doc:  { bg: '#eff6ff', color: '#2563eb', label: 'DOC' },
  docx: { bg: '#eff6ff', color: '#2563eb', label: 'DOCX' },
  txt:  { bg: '#f0fdf4', color: '#16a34a', label: 'TXT' },
}

function UploadedFileRow({ file, url, deleting, onDelete }) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  const icon = FILE_ICONS[ext] || { bg: 'var(--surface-2)', color: 'var(--ink-60)', label: ext.toUpperCase() || 'FILE' }

  const sizeLabel = file.metadata?.size
    ? file.metadata.size < 1024 * 1024
      ? `${(file.metadata.size / 1024).toFixed(0)} KB`
      : `${(file.metadata.size / 1024 / 1024).toFixed(1)} MB`
    : null

  const dateLabel = file.created_at
    ? new Date(file.created_at).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', year: 'numeric' })
    : file.updated_at
      ? new Date(file.updated_at).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', year: 'numeric' })
      : null

  const displayName = file.name

  return (
    <>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 14px', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', background: 'var(--white)',
          transition: 'box-shadow 0.15s', cursor: 'pointer',
        }}
        onClick={() => setPreviewOpen(true)}
        onMouseOver={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
        onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
      >
        {/* File type badge */}
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: icon.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '0.6rem', fontWeight: 800, color: icon.color, letterSpacing: '0.04em' }}>{icon.label}</span>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.8375rem', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {displayName}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2, fontSize: '0.72rem', color: 'var(--ink-40)' }}>
            {sizeLabel && <span>{sizeLabel}</span>}
            {dateLabel && <span>· {dateLabel}</span>}
            <span style={{ color: 'var(--brand)', fontWeight: 500 }}>· Натисни за преглед</span>
          </div>
        </div>

        {/* Actions — stop propagation so clicks don't open preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setPreviewOpen(true)}
            title="Преглед"
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'var(--surface-2)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ink-60)', cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'var(--brand-light)'; e.currentTarget.style.color = 'var(--brand)' }}
            onMouseOut={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--ink-60)' }}
          >
            <HiEye style={{ width: 13, height: 13 }} />
          </button>
          <a
            href={url}
            download
            title="Изтегли"
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'var(--surface-2)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ink-60)', textDecoration: 'none', transition: 'all 0.15s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'var(--brand-light)'; e.currentTarget.style.color = 'var(--brand)' }}
            onMouseOut={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--ink-60)' }}
          >
            <HiDownload style={{ width: 13, height: 13 }} />
          </a>
          <button
            onClick={onDelete}
            disabled={deleting}
            title="Изтрий файла"
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'transparent', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ink-40)', cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = 'var(--error)' }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-40)' }}
          >
            <HiTrash style={{ width: 13, height: 13 }} />
          </button>
        </div>
      </div>

      {previewOpen && (
        <FilePreviewDialog
          url={url}
          name={displayName}
          ext={ext}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </>
  )
}

/* ── File preview dialog ── */
function FilePreviewDialog({ url, name, ext, onClose }) {
  const [txtContent, setTxtContent] = useState(null)
  const [txtLoading, setTxtLoading] = useState(false)

  /* For TXT files — fetch the raw text */
  useEffect(() => {
    if (ext !== 'txt') return
    setTxtLoading(true)
    fetch(url)
      .then(r => r.text())
      .then(t => { setTxtContent(t); setTxtLoading(false) })
      .catch(() => { setTxtContent('Неуспешно зареждане на файла.'); setTxtLoading(false) })
  }, [url, ext])

  /* Close on Escape */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const isPdf  = ext === 'pdf'
  const isTxt  = ext === 'txt'
  const isWord = ext === 'doc' || ext === 'docx'
  /* Google Docs Viewer works for public URLs — good fallback for Word files */
  const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(15,23,42,0.72)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.18s ease',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-2xl)',
        width: '100%',
        maxWidth: 860,
        height: '88vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xl)',
        animation: 'fadeUp 0.22s var(--ease)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
          background: 'var(--canvas)',
        }}>
          {/* Badge */}
          <div style={{
            width: 36, height: 36, borderRadius: 9, flexShrink: 0,
            background: FILE_ICONS[ext]?.bg || 'var(--surface-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '0.58rem', fontWeight: 800, color: FILE_ICONS[ext]?.color || 'var(--ink-60)', letterSpacing: '0.04em' }}>
              {(FILE_ICONS[ext]?.label || ext.toUpperCase())}
            </span>
          </div>

          {/* Name */}
          <span style={{
            flex: 1, fontWeight: 700, fontSize: '0.9375rem',
            color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {name}
          </span>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              title="Отвори в нов таб"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 'var(--radius)',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                color: 'var(--ink-60)', fontSize: '0.8rem', fontWeight: 500,
                textDecoration: 'none', transition: 'all 0.15s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'var(--brand-light)'; e.currentTarget.style.color = 'var(--brand)'; e.currentTarget.style.borderColor = 'var(--brand-mid)' }}
              onMouseOut={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--ink-60)'; e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              <HiEye style={{ width: 13, height: 13 }} /> Нов таб
            </a>
            <a
              href={url}
              download
              title="Изтегли"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 'var(--radius)',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                color: 'var(--ink-60)', fontSize: '0.8rem', fontWeight: 500,
                textDecoration: 'none', transition: 'all 0.15s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'var(--brand-light)'; e.currentTarget.style.color = 'var(--brand)'; e.currentTarget.style.borderColor = 'var(--brand-mid)' }}
              onMouseOut={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--ink-60)'; e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              <HiDownload style={{ width: 13, height: 13 }} /> Изтегли
            </a>
            <button
              onClick={onClose}
              style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--ink-60)', cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = 'var(--error)' }}
              onMouseOut={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--ink-60)' }}
            >
              <HiX style={{ width: 15, height: 15 }} />
            </button>
          </div>
        </div>

        {/* Preview body */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', background: '#525659' }}>

          {/* PDF — native browser iframe */}
          {isPdf && (
            <iframe
              src={url}
              title={name}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
          )}

          {/* TXT — styled pre */}
          {isTxt && (
            <div style={{ width: '100%', height: '100%', overflow: 'auto', background: 'var(--canvas)', padding: '28px 32px' }}>
              {txtLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--ink-40)', fontSize: '0.9rem' }}>
                  Зареждане...
                </div>
              ) : (
                <pre style={{
                  fontFamily: '"Fira Code", "Cascadia Code", "Courier New", monospace',
                  fontSize: '0.85rem', lineHeight: 1.75,
                  color: 'var(--ink-80)', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  margin: 0,
                }}>
                  {txtContent}
                </pre>
              )}
            </div>
          )}

          {/* DOC / DOCX — Google Docs Viewer */}
          {isWord && (
            <iframe
              src={googleViewerUrl}
              title={name}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
          )}

          {/* Unknown format fallback */}
          {!isPdf && !isTxt && !isWord && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              height: '100%', gap: 16, background: 'var(--canvas)',
            }}>
              <HiDocumentText style={{ width: 52, height: 52, color: 'var(--ink-20)' }} />
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-60)' }}>Преглед не се поддържа за този формат.</p>
              <a href={url} download className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <HiDownload style={{ width: 14, height: 14 }} /> Изтегли файла
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
