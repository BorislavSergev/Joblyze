import { useState, useEffect, useCallback } from 'react'
import { HiUpload, HiClipboardCopy, HiX, HiSparkles, HiDocumentText, HiCheck, HiSave } from 'react-icons/hi'
import { FaFileUpload } from 'react-icons/fa'
import ReactMarkdown from 'react-markdown'
import { analyzeResumeWithGemini, buildCvWebsiteDataWithGemini } from '../services/geminiService'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

function serializeCvToText(cv) {
  const lines = []
  const name = cv.name || cv.fullName || ''
  if (name)                              lines.push(`Name: ${name}`)
  if (cv.title || cv.position)           lines.push(`Title: ${cv.title || cv.position}`)
  if (cv.email)                          lines.push(`Email: ${cv.email}`)
  if (cv.phone)                          lines.push(`Phone: ${cv.phone}`)
  if (cv.location)                       lines.push(`Location: ${cv.location}`)
  if (cv.website || cv.linkedin)         lines.push(`Website: ${cv.website || cv.linkedin}`)
  if (cv.summary || cv.profile)          lines.push(`\nSummary:\n${cv.summary || cv.profile}`)
  if (Array.isArray(cv.skills) && cv.skills.length)
    lines.push(`\nSkills:\n${cv.skills.join(', ')}`)
  if (Array.isArray(cv.experience) && cv.experience.length) {
    lines.push('\nExperience:')
    cv.experience.forEach(e => {
      lines.push(`${e.role} at ${e.company}${e.period ? ` (${e.period})` : ''}${e.location ? ` — ${e.location}` : ''}`)
      if (Array.isArray(e.bullets)) e.bullets.forEach(b => lines.push(`  - ${b}`))
    })
  }
  if (Array.isArray(cv.education) && cv.education.length) {
    lines.push('\nEducation:')
    cv.education.forEach(e => {
      lines.push(`${e.degree} — ${e.school}${e.period ? ` (${e.period})` : ''}${e.gpa ? `, GPA: ${e.gpa}` : ''}`)
    })
  }
  if (Array.isArray(cv.languages) && cv.languages.length)
    lines.push(`\nLanguages:\n${cv.languages.join(', ')}`)
  if (Array.isArray(cv.certifications) && cv.certifications.length)
    lines.push(`\nCertifications:\n${cv.certifications.join(', ')}`)
  return lines.join('\n')
}

function Analyze() {
  const { user, saveCv, cvs } = useAuth()
  const { t } = useTranslation()

  const [resumeFile, setResumeFile]           = useState(null)
  const [resumeName, setResumeName]           = useState('')
  const [resumeDragging, setResumeDragging]   = useState(false)
  const [jdText, setJdText]                   = useState('')
  const [feedback, setFeedback]               = useState('')
  const [loading, setLoading]                 = useState(false)
  const [isStreaming, setIsStreaming]         = useState(false)

  const [showSaveCvDialog, setShowSaveCvDialog] = useState(false)
  const [savingCv, setSavingCv]                 = useState(false)
  const [savedCvData, setSavedCvData]           = useState(null)
  const [saveSuccess, setSaveSuccess]           = useState('')
  const [saveError, setSaveError]               = useState('')

  const [inputMode, setInputMode]               = useState('file')
  const [savedCvSelection, setSavedCvSelection] = useState(null)

  const canSubmit = (resumeFile || savedCvSelection) && jdText.trim() && !loading && !savingCv

  const handleResumeDragOver = useCallback((e) => {
    e.preventDefault()
    setResumeDragging(true)
  }, [])

  const handleResumeDragLeave = useCallback((e) => {
    e.preventDefault()
    setResumeDragging(false)
  }, [])

  const handleResumeDrop = useCallback((e) => {
    e.preventDefault()
    setResumeDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && (f.type === 'application/pdf' || f.type === 'text/plain')) {
      setResumeFile(f)
      setResumeName(f.name)
      setSaveSuccess('')
      setSaveError('')
      setSavedCvData(null)
    }
  }, [])

  const handleResumeChange = useCallback((e) => {
    const f = e.target.files[0]
    if (f && (f.type === 'application/pdf' || f.type === 'text/plain')) {
      setResumeFile(f)
      setResumeName(f.name)
      setSaveSuccess('')
      setSaveError('')
      setSavedCvData(null)
    }
  }, [])

  const switchToFile = () => { setInputMode('file'); setSavedCvSelection(null) }
  const switchToSaved = () => { setInputMode('saved'); setResumeFile(null); setResumeName('') }

  const handleSubmit = async () => {
    if (!canSubmit) return

    setLoading(true)
    setFeedback('')
    setIsStreaming(false)
    setShowSaveCvDialog(false)
    setSavingCv(false)
    setSavedCvData(null)
    setSaveSuccess('')
    setSaveError('')

    try {
      const resumeInput = (inputMode === 'saved' && savedCvSelection)
        ? serializeCvToText(savedCvSelection)
        : resumeFile
      const stream = await analyzeResumeWithGemini(resumeInput, jdText)
      let accumulated = ''
      let buffer = ''
      let firstChunk = false

      for await (const chunk of stream) {
        let text = ''

        if (typeof chunk === 'string') text = chunk
        else if (chunk?.text) text = chunk.text
        else if (chunk?.candidates?.[0]?.content?.parts?.[0]?.text) text = chunk.candidates[0].content.parts[0].text
        else if (chunk?.delta?.text) text = chunk.delta.text

        if (text) {
          if (!firstChunk) {
            firstChunk = true
            setLoading(false)
            setIsStreaming(true)
          }

          buffer += text
          const words = buffer.split(/(\s+)/)
          buffer = words.pop() || ''

          for (const word of words) {
            accumulated += word
            setFeedback(accumulated)
            await new Promise(r => setTimeout(r, 20))
          }
        }
      }

      if (buffer) {
        accumulated += buffer
        setFeedback(accumulated)
      }

      setIsStreaming(false)

      if (accumulated.trim() && inputMode === 'file') {
        setShowSaveCvDialog(true)
      }
    } catch (err) {
      console.error(err)
      setFeedback(`**${t('analyze.error_generic')}** ${err.message || ''}`)
      setIsStreaming(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveScrapedCv = async () => {
    if (!resumeFile) return

    if (!user) {
      setSaveError(t('analyze.save_error_login'))
      setShowSaveCvDialog(false)
      return
    }

    setSavingCv(true)
    setShowSaveCvDialog(false)
    setSaveSuccess('')
    setSaveError('')

    try {
      const json = await buildCvWebsiteDataWithGemini(resumeFile)
      await saveCv(json)
      setSavedCvData(json)
      setSaveSuccess(t('analyze.save_success'))
    } catch (err) {
      console.error(err)
      setSaveError(err.message || t('analyze.save_error_generic'))
    } finally {
      setSavingCv(false)
    }
  }

  const handleSkipSaveCv = () => {
    setShowSaveCvDialog(false)
    setSavedCvData(null)
    setSaveError('')
    setSaveSuccess('')
  }

  const handleClearAll = () => {
    setResumeFile(null)
    setResumeName('')
    setJdText('')
    setFeedback('')
    setIsStreaming(false)
    setShowSaveCvDialog(false)
    setSavingCv(false)
    setSavedCvData(null)
    setSaveSuccess('')
    setSaveError('')
    setInputMode('file')
    setSavedCvSelection(null)
  }

  useEffect(() => {
    document.body.style.overflow = (loading || savingCv) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [loading, savingCv])

  useEffect(() => {
    if (!saveSuccess) return
    const timer = setTimeout(() => setSaveSuccess(''), 4500)
    return () => clearTimeout(timer)
  }, [saveSuccess])

  useEffect(() => {
    if (!showSaveCvDialog) return
    const timer = setTimeout(() => handleSkipSaveCv(), 12000)
    return () => clearTimeout(timer)
  }, [showSaveCvDialog])

  const mdComponents = {
    h1: ({ ...p }) => <h1 className="md" style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 700, color: 'var(--ink)', margin: '24px 0 12px', letterSpacing: '-0.02em' }} {...p} />,
    h2: ({ ...p }) => <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--ink)', margin: '22px 0 10px', paddingLeft: 12, borderLeft: '3px solid var(--brand)' }} {...p} />,
    h3: ({ ...p }) => <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--brand)', margin: '16px 0 8px' }} {...p} />,
    h4: ({ ...p }) => <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)', margin: '12px 0 6px' }} {...p} />,
    p:  ({ ...p }) => <p  style={{ fontSize: '0.9375rem', color: 'var(--ink-60)', lineHeight: 1.75, marginBottom: 12 }} {...p} />,
    ul: ({ ...p }) => <ul style={{ paddingLeft: 0, marginBottom: 12, listStyle: 'none' }} {...p} />,
    ol: ({ ...p }) => <ol style={{ paddingLeft: 0, marginBottom: 12, listStyle: 'none', counterReset: 'item' }} {...p} />,
    li: ({ ordered, ...p }) => (
      <li style={{ fontSize: '0.9375rem', color: 'var(--ink-60)', lineHeight: 1.7, marginBottom: 5, paddingLeft: 18, position: 'relative' }}>
        <span style={{ position: 'absolute', left: 0, color: 'var(--brand)', fontWeight: 700 }}>{ordered ? '›' : '—'}</span>
        {p.children}
      </li>
    ),
    strong:     ({ ...p }) => <strong style={{ color: 'var(--ink)', fontWeight: 600 }} {...p} />,
    hr:         ({ ...p }) => <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} {...p} />,
    blockquote: ({ ...p }) => <blockquote style={{ borderLeft: '3px solid var(--brand)', paddingLeft: 14, margin: '14px 0', color: 'var(--ink-60)', fontStyle: 'italic' }} {...p} />,
    code:       ({ ...p }) => <code style={{ fontSize: '0.85em', background: 'var(--surface-2)', borderRadius: 5, padding: '1px 6px', color: 'var(--brand-dark)', fontFamily: 'monospace' }} {...p} />,
  }

  const skeletonBar = (w = '100%', h = 8) => (
    <div style={{ height: h, borderRadius: 4, width: w, background: 'linear-gradient(90deg, var(--surface-2) 25%, var(--border) 50%, var(--surface-2) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.8s infinite' }} />
  )

  return (
    <div className="page-container" style={{ paddingTop: 'clamp(40px,6vw,68px)', paddingBottom: 'clamp(40px,6vw,68px)' }}>

      {/* ── Loading overlay ── */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-card">
            <div className="spinner" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 8, letterSpacing: '-0.02em' }}>
              {t('analyze.loading_title')}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-60)' }}>{t('analyze.loading_subtitle')}</p>
          </div>
        </div>
      )}

      {/* ── Saving CV overlay ── */}
      {savingCv && (
        <div className="loading-overlay">
          <div className="loading-card">
            <div className="spinner" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 8, letterSpacing: '-0.02em' }}>
              {t('analyze.saving_title')}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-60)' }}>{t('analyze.saving_subtitle')}</p>
          </div>
        </div>
      )}

      {/* ── Save CV toast (non-blocking) ── */}
      {showSaveCvDialog && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9998,
          width: 'min(380px, calc(100vw - 48px))',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--white)',
          boxShadow: '0 24px 64px rgba(15,23,42,0.16), 0 4px 16px rgba(15,23,42,0.08)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          animation: 'slideInRight 0.4s var(--ease) both',
        }}>
          <div style={{ height: 3, background: 'var(--brand)', animation: 'toastProgress 12s linear forwards' }} />
          <div style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <HiSave style={{ width: 20, height: 20, color: 'var(--brand)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--ink)', marginBottom: 4, letterSpacing: '-0.01em' }}>
                  {t('analyze.save_dialog_title')}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-60)', lineHeight: 1.55 }}>
                  {t('analyze.save_dialog_desc')}
                </div>
              </div>
              <button onClick={handleSkipSaveCv} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-40)', cursor: 'pointer', flexShrink: 0, transition: 'background 0.15s' }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseOut={e => e.currentTarget.style.background = 'var(--white)'}
              >
                <HiX style={{ width: 13, height: 13 }} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSkipSaveCv} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8125rem' }}>
                {t('analyze.no_thanks')}
              </button>
              <button onClick={handleSaveScrapedCv} className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8125rem' }}>
                <HiSave style={{ width: 13, height: 13 }} />
                {t('analyze.yes_save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page header ── */}
      <div className="anim-fade-up" style={{ marginBottom: 'clamp(32px,5vw,52px)', position: 'relative' }}>
        <div aria-hidden style={{ position: 'absolute', top: -40, left: -60, width: 420, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(37,99,235,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <span className="chip chip-brand" style={{ display: 'inline-flex', marginBottom: 14 }}>
          <HiSparkles style={{ width: 11, height: 11 }} />
          {t('analyze.chip')}
        </span>
        <h1 className="anim-fade-up d-1" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem,4vw,2.75rem)', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 12 }}>
          {t('analyze.title')}
        </h1>
        <p className="anim-fade-up d-2" style={{ fontSize: 'clamp(0.9rem,2vw,1.0625rem)', color: 'var(--ink-60)', maxWidth: 540, lineHeight: 1.7 }}>
          {t('analyze.subtitle')}
        </p>
      </div>

      {/* ── Input cards ── */}
      <div className="anim-fade-up d-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,320px),1fr))', gap: 16, marginBottom: 12 }}>

        {/* ── Resume card ── */}
        <div style={{ borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', overflow: 'hidden', background: 'var(--white)', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column' }}>
          {/* Card header */}
          <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, transparent 100%)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-brand)' }}>
              <FaFileUpload style={{ width: 13, height: 13, color: '#fff' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2 }}>{t('analyze.resume_label')}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--ink-40)', marginTop: 1, fontWeight: 500 }}>Step 1 of 2</div>
            </div>
            {inputMode === 'file' && resumeFile && (
              <span className="chip chip-success" style={{ fontSize: '0.68rem' }}>
                <HiCheck style={{ width: 10, height: 10 }} />
                {resumeName.length > 18 ? resumeName.slice(0, 18) + '…' : resumeName}
              </span>
            )}
            {inputMode === 'saved' && savedCvSelection && (
              <span className="chip chip-success" style={{ fontSize: '0.68rem' }}>
                <HiCheck style={{ width: 10, height: 10 }} />
                {(savedCvSelection.name || savedCvSelection.fullName || 'CV').slice(0, 20)}
              </span>
            )}
          </div>

          {/* Card body */}
          <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Mode tabs */}
            <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: 3, gap: 2 }}>
              <button onClick={switchToFile} style={{ flex: 1, padding: '6px 10px', borderRadius: 'calc(var(--radius) - 2px)', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: inputMode === 'file' ? 700 : 500, background: inputMode === 'file' ? 'var(--white)' : 'transparent', color: inputMode === 'file' ? 'var(--ink)' : 'var(--ink-40)', boxShadow: inputMode === 'file' ? 'var(--shadow-xs)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.15s' }}>
                <HiUpload style={{ width: 12, height: 12 }} />
                {t('analyze.upload_file')}
              </button>
              <button onClick={switchToSaved} disabled={!user} title={!user ? t('analyze.sign_in_to_use') : ''} style={{ flex: 1, padding: '6px 10px', borderRadius: 'calc(var(--radius) - 2px)', border: 'none', cursor: !user ? 'not-allowed' : 'pointer', fontSize: '0.78rem', fontWeight: inputMode === 'saved' ? 700 : 500, background: inputMode === 'saved' ? 'var(--white)' : 'transparent', color: inputMode === 'saved' ? 'var(--ink)' : 'var(--ink-40)', boxShadow: inputMode === 'saved' ? 'var(--shadow-xs)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, opacity: !user ? 0.45 : 1, transition: 'all 0.15s' }}>
                <HiDocumentText style={{ width: 12, height: 12 }} />
                {t('analyze.pick_saved_cv')}
              </button>
            </div>

            {/* Upload drop zone */}
            {inputMode === 'file' && (
              <div className={`drop-zone${resumeDragging ? ' dragging' : ''}${resumeFile ? ' has-file' : ''}`} onDragOver={handleResumeDragOver} onDragLeave={handleResumeDragLeave} onDrop={handleResumeDrop} style={{ padding: 'clamp(24px,4vw,36px) 20px', flex: 1 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: resumeFile ? 'var(--brand-light)' : resumeDragging ? 'var(--brand)' : 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', transition: 'background 0.2s' }}>
                  <FaFileUpload style={{ width: 18, height: 18, color: resumeDragging && !resumeFile ? '#fff' : 'var(--brand)', transition: 'color 0.2s' }} />
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: resumeFile ? 'var(--brand)' : 'var(--ink)', marginBottom: 5, textAlign: 'center' }}>
                  {resumeFile ? t('analyze.file_uploaded') : resumeDragging ? t('analyze.drop_file_here') : t('analyze.drag_or_click')}
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--ink-40)', marginBottom: 16, textAlign: 'center' }}>{t('analyze.file_types')}</p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <label>
                    <span className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8125rem', cursor: 'pointer' }}>
                      <HiUpload style={{ width: 12, height: 12 }} />
                      {resumeFile ? t('analyze.change') : t('analyze.select_file')}
                    </span>
                    <input type="file" accept=".pdf,.txt" onChange={handleResumeChange} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
                  </label>
                  {resumeFile && (
                    <button onClick={() => { setResumeFile(null); setResumeName(''); setSavedCvData(null); setSaveSuccess(''); setSaveError('') }} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.8125rem' }}>
                      <HiX style={{ width: 12, height: 12 }} />
                      {t('analyze.clear')}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Save hint */}
            {inputMode === 'file' && !resumeFile && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, padding: '9px 12px', borderRadius: 'var(--radius)', background: 'var(--brand-light)', border: '1px solid var(--brand-mid)' }}>
                <HiSparkles style={{ width: 12, height: 12, color: 'var(--brand)', flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: '0.74rem', color: 'var(--brand-dark)', lineHeight: 1.6, margin: 0 }}>{t('analyze.upload_hint')}</p>
              </div>
            )}

            {/* Saved CV picker */}
            {inputMode === 'saved' && (
              !cvs?.length ? (
                <div className="drop-zone" style={{ padding: '28px 16px', textAlign: 'center', flex: 1 }}>
                  <HiDocumentText style={{ width: 30, height: 30, color: 'var(--ink-20)', margin: '0 auto 10px', display: 'block' }} />
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink-40)', marginBottom: 5 }}>{t('analyze.no_saved_cvs')}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--ink-30)' }}>{t('analyze.no_saved_cvs_hint')}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 260, overflowY: 'auto' }}>
                  {cvs.map(cv => {
                    const name = cv.name || cv.fullName || 'CV'
                    const initials = name.split(' ').filter(Boolean).map(p => p[0]).join('').toUpperCase().slice(0, 2) || 'CV'
                    const isSelected = savedCvSelection?.id === cv.id
                    return (
                      <button key={cv.id} onClick={() => setSavedCvSelection(cv)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius)', border: `1.5px solid ${isSelected ? 'var(--brand)' : 'var(--border)'}`, background: isSelected ? 'var(--brand-light)' : 'var(--white)', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'border-color 0.15s, background 0.15s' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: isSelected ? 'var(--brand)' : 'var(--surface-2)', color: isSelected ? '#fff' : 'var(--ink-60)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>{initials}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: isSelected ? 'var(--brand)' : 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--ink-40)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cv.title || cv.email || ''}</div>
                        </div>
                        {isSelected && <HiCheck style={{ width: 16, height: 16, color: 'var(--brand)', flexShrink: 0 }} />}
                      </button>
                    )
                  })}
                </div>
              )
            )}
          </div>
        </div>

        {/* ── Job description card ── */}
        <div style={{ borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', overflow: 'hidden', background: 'var(--white)', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column' }}>
          {/* Card header */}
          <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, transparent 100%)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(124,58,237,0.28)' }}>
              <HiClipboardCopy style={{ width: 14, height: 14, color: '#fff' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2 }}>{t('analyze.job_description')}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--ink-40)', marginTop: 1, fontWeight: 500 }}>Step 2 of 2</div>
            </div>
            {jdText && (
              <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--ink-40)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 6 }}>
                {jdText.length} {t('analyze.chars')}
              </span>
            )}
          </div>

          {/* Card body */}
          <div style={{ padding: 16, flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <textarea
              className="form-textarea"
              value={jdText}
              onChange={e => setJdText(e.target.value)}
              placeholder={t('analyze.job_description_placeholder')}
              style={{ minHeight: 'clamp(200px,28vw,340px)', flex: 1, resize: 'vertical' }}
            />
            {jdText && (
              <button onClick={() => setJdText('')} style={{ position: 'absolute', top: 26, right: 26, width: 24, height: 24, borderRadius: 6, background: 'var(--surface-2)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-40)', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--brand-light)'}
                onMouseOut={e => e.currentTarget.style.background = 'var(--surface-2)'}
              >
                <HiX style={{ width: 12, height: 12 }} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Analyze button ── */}
      <div className="anim-fade-up d-3" style={{ marginBottom: 48 }}>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            width: '100%', padding: '16px 32px',
            borderRadius: 'var(--radius-lg)',
            background: canSubmit
              ? 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #4f46e5 100%)'
              : 'var(--surface-2)',
            color: canSubmit ? '#fff' : 'var(--ink-40)',
            fontSize: '1rem', fontWeight: 700,
            border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: canSubmit ? '0 8px 28px rgba(37,99,235,0.38)' : 'none',
            transition: 'all 0.2s', letterSpacing: '-0.01em', fontFamily: 'var(--font)',
          }}
          onMouseOver={e => { if (canSubmit) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(37,99,235,0.45)' } }}
          onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = canSubmit ? '0 8px 28px rgba(37,99,235,0.38)' : 'none' }}
        >
          <HiSparkles style={{ width: 18, height: 18 }} />
          {loading ? t('analyze.analyzing') : t('analyze.analyze_now')}
        </button>
        {(resumeFile || savedCvSelection || jdText) && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
            <button onClick={handleClearAll} className="btn-ghost" style={{ fontSize: '0.8rem', color: 'var(--ink-40)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <HiX style={{ width: 12, height: 12 }} />
              {t('analyze.clear_all')}
            </button>
          </div>
        )}
      </div>

      {/* ── Success toast ── */}
      {saveSuccess && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          width: 'min(360px, calc(100vw - 48px))',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--white)',
          boxShadow: '0 24px 64px rgba(15,23,42,0.16), 0 4px 16px rgba(15,23,42,0.08)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          animation: 'slideInRight 0.4s var(--ease) both',
        }}>
          {/* Progress bar */}
          <div style={{ height: 3, background: 'var(--success)', width: '100%', transformOrigin: 'left', animation: 'toastProgress 4.5s linear forwards' }} />
          {/* Body */}
          <div style={{ padding: '16px 18px', display: 'flex', gap: 13, alignItems: 'flex-start' }}>
            {/* Icon */}
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <HiCheck style={{ width: 20, height: 20, color: 'var(--success)' }} />
            </div>
            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--ink)', marginBottom: 4, letterSpacing: '-0.01em' }}>
                {t('analyze.toast_title')}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--ink-60)', lineHeight: 1.5 }}>
                {t('analyze.toast_desc')}
              </div>
            </div>
            {/* Close */}
            <button onClick={() => setSaveSuccess('')} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-40)', cursor: 'pointer', flexShrink: 0, transition: 'background 0.15s' }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--white)'}
            >
              <HiX style={{ width: 13, height: 13 }} />
            </button>
          </div>
        </div>
      )}
      {saveError && (
        <div className="alert alert-error" style={{ marginBottom: 24 }}>
          <span>{saveError}</span>
        </div>
      )}
      {savedCvData && (
        <div className="card anim-fade-up" style={{ padding: 18, marginBottom: 28, border: '1px solid var(--brand-mid)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HiSave style={{ width: 16, height: 16, color: 'var(--brand)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{t('analyze.cv_ready_title')}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--ink-50)', margin: 0 }}>{t('analyze.cv_ready_desc')}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Feedback ── */}
      {feedback && (
        <div className="feedback-wrapper anim-fade-up" style={{ marginBottom: 32 }}>
          <div className="feedback-header">
            <HiSparkles style={{ width: 17, height: 17, color: '#fff', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>
              {t('analyze.ai_feedback')}
            </span>
            {isStreaming && (
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7 }}>
                <div className="stream-dot" />
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)' }}>{t('analyze.streaming')}</span>
              </div>
            )}
          </div>
          <div className="feedback-body">
            <div className={isStreaming ? 'typing-cursor' : ''}>
              <ReactMarkdown components={mdComponents}>{feedback}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* ── Empty state — skeleton preview ── */}
      {!feedback && !loading && !savingCv && (
        <div className="anim-fade-up d-4">
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink-40)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
            {t('analyze.empty_state')}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,220px),1fr))', gap: 12 }}>
            {[
              { label: t('analyze.skeleton_match'),           accent: '#2563eb', bars: ['60%', '80%'] },
              { label: t('analyze.skeleton_strengths'),       accent: '#10b981', bars: ['90%', '70%', '55%'] },
              { label: t('analyze.skeleton_gaps'),            accent: '#f59e0b', bars: ['75%', '50%'] },
              { label: t('analyze.skeleton_recommendations'), accent: '#7c3aed', bars: ['85%', '65%', '40%'] },
            ].map(({ label, accent, bars }) => (
              <div key={label} style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--white)', overflow: 'hidden', opacity: 0.65 }}>
                <div style={{ height: 3, background: accent, opacity: 0.5 }} />
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: accent, opacity: 0.7 }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-60)' }}>{label}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {bars.map((w, i) => (
                      <div key={i}>{skeletonBar(w, i === 0 ? 9 : 7)}</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Analyze
