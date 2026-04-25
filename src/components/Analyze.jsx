import { useState, useEffect, useCallback } from 'react'
import { HiUpload, HiClipboardCopy, HiX, HiSparkles, HiDocumentText, HiCheck, HiSave } from 'react-icons/hi'
import { FaFileUpload } from 'react-icons/fa'
import ReactMarkdown from 'react-markdown'
import { analyzeResumeWithGemini, buildCvWebsiteDataWithGemini } from '../services/geminiService'
import { useAuth } from '../context/AuthContext'

function Analyze() {
  const { user, saveCv } = useAuth()

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

  const canSubmit = resumeFile && jdText.trim() && !loading && !savingCv

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
      const stream = await analyzeResumeWithGemini(resumeFile, jdText)
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

      if (accumulated.trim()) {
        setShowSaveCvDialog(true)
      }
    } catch (err) {
      console.error(err)
      setFeedback(`**Грешка:** ${err.message || 'Неуспешен анализ. Проверете API ключа и опитайте отново.'}`)
      setIsStreaming(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveScrapedCv = async () => {
    if (!resumeFile) return

    if (!user) {
      setSaveError('Трябва да сте влезли в профила си, за да запазите CV.')
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
      setSaveSuccess('CV-то беше запазено успешно във вашия профил.')
    } catch (err) {
      console.error(err)
      setSaveError(err.message || 'Неуспешно запазване на CV. Опитайте отново.')
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
  }

  useEffect(() => {
    document.body.style.overflow = (loading || savingCv) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [loading, savingCv])

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

  return (
    <div className="page-container" style={{ paddingTop: 'clamp(40px,6vw,68px)', paddingBottom: 'clamp(40px,6vw,68px)' }}>

      {/* ── Loading overlay ── */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-card">
            <div className="spinner" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 8, letterSpacing: '-0.02em' }}>
              AI анализира…
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-60)' }}>
              Моля, изчакайте докато обработваме резюмето ви
            </p>
          </div>
        </div>
      )}

      {/* ── Saving CV overlay ── */}
      {savingCv && (
        <div className="loading-overlay">
          <div className="loading-card">
            <div className="spinner" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 8, letterSpacing: '-0.02em' }}>
              Запазване на CV…
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-60)' }}>
              Извличаме структурираните данни и ги добавяме към профила ви
            </p>
          </div>
        </div>
      )}

      {/* ── Save CV dialog ── */}
      {showSaveCvDialog && (
        <div className="loading-overlay">
          <div className="loading-card" style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HiSave style={{ width: 18, height: 18, color: 'var(--brand)' }} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--ink)' }}>
                Да запазим ли CV-то?
              </h3>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--ink-60)', lineHeight: 1.65, marginBottom: 24 }}>
              Анализът е готов. Искате ли AI да извлече информацията от това CV и да я запази във вашия профил? След това ще можете да я използвате в страницата с шаблони.
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button onClick={handleSkipSaveCv} className="btn-secondary">
                Не, благодаря
              </button>
              <button onClick={handleSaveScrapedCv} className="btn-primary">
                <HiSave style={{ width: 14, height: 14 }} />
                Да, запази CV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page header ── */}
      <div style={{ marginBottom: 'clamp(36px,6vw,60px)' }}>
        <span className="chip chip-brand anim-fade-up" style={{ display: 'inline-flex', marginBottom: 14 }}>
          <HiSparkles style={{ width: 11, height: 11 }} />
          AI анализ
        </span>
        <h1 className="anim-fade-up d-1" style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.75rem,4vw,2.75rem)',
          fontWeight: 800,
          color: 'var(--ink)',
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          marginBottom: 12,
        }}>
          Анализирайте резюмето си
        </h1>
        <p className="anim-fade-up d-2" style={{ fontSize: 'clamp(0.9rem,2vw,1.0625rem)', color: 'var(--ink-60)', maxWidth: 540, lineHeight: 1.7 }}>
          Качете автобиографията си и описанието на длъжността за персонализиран AI доклад.
        </p>
      </div>

      {/* ── Input grid ── */}
      <div className="anim-fade-up d-2" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,320px),1fr))',
        gap: 16,
        marginBottom: 16,
      }}>
        {/* Resume drop zone */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <FaFileUpload style={{ width: 14, height: 14, color: 'var(--brand)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.01em' }}>Резюме</span>
            {resumeFile && (
              <span className="chip chip-success" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
                <HiCheck style={{ width: 10, height: 10 }} />
                {resumeName.length > 20 ? resumeName.slice(0, 20) + '…' : resumeName}
              </span>
            )}
          </div>

          <div
            className={`drop-zone${resumeDragging ? ' dragging' : ''}${resumeFile ? ' has-file' : ''}`}
            onDragOver={handleResumeDragOver}
            onDragLeave={handleResumeDragLeave}
            onDrop={handleResumeDrop}
            style={{ padding: 'clamp(28px,5vw,44px) 20px' }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 13,
              background: resumeFile ? 'var(--brand-light)' : resumeDragging ? 'var(--brand)' : 'var(--brand-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
              transition: 'background 0.2s',
            }}>
              <FaFileUpload style={{ width: 20, height: 20, color: resumeDragging && !resumeFile ? '#fff' : 'var(--brand)', transition: 'color 0.2s' }} />
            </div>

            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: resumeFile ? 'var(--brand)' : 'var(--ink)', marginBottom: 6, textAlign: 'center' }}>
              {resumeFile ? 'Файлът е качен успешно' : resumeDragging ? 'Пуснете файла тук' : 'Плъзнете или кликнете за качване'}
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--ink-40)', marginBottom: 18, textAlign: 'center' }}>
              PDF или TXT · до 10 MB
            </p>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <label>
                <span className="btn-primary" style={{ padding: '9px 18px', fontSize: '0.8125rem', cursor: 'pointer' }}>
                  <HiUpload style={{ width: 13, height: 13 }} />
                  {resumeFile ? 'Смени' : 'Избери файл'}
                </span>
                <input type="file" accept=".pdf,.txt" onChange={handleResumeChange} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
              </label>
              {resumeFile && (
                <button onClick={() => { setResumeFile(null); setResumeName(''); setSavedCvData(null); setSaveSuccess(''); setSaveError('') }} className="btn-secondary" style={{ padding: '9px 14px', fontSize: '0.8125rem' }}>
                  <HiX style={{ width: 13, height: 13 }} />
                  Изчисти
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Job description */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <HiClipboardCopy style={{ width: 14, height: 14, color: 'var(--brand)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ink)' }}>Описание на длъжността</span>
            {jdText && (
              <span style={{ marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 600, color: 'var(--ink-40)', background: 'var(--surface-2)', padding: '2px 7px', borderRadius: 6 }}>
                {jdText.length} символа
              </span>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <textarea
              className="form-textarea"
              value={jdText}
              onChange={e => setJdText(e.target.value)}
              placeholder="Поставете текста на обявата за работа тук…"
              style={{ minHeight: 'clamp(180px,28vw,280px)' }}
            />
            {jdText && (
              <button
                onClick={() => setJdText('')}
                style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 24, height: 24, borderRadius: 6,
                  background: 'var(--surface-2)', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--ink-40)', cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--brand-light)'}
                onMouseOut={e => e.currentTarget.style.background = 'var(--surface-2)'}
              >
                <HiX style={{ width: 12, height: 12 }} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Actions row ── */}
      <div className="anim-fade-up d-3" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginBottom: 40, flexWrap: 'wrap' }}>
        {(resumeFile || jdText) && (
          <button onClick={handleClearAll} className="btn-secondary">
            <HiX style={{ width: 14, height: 14 }} />
            Изчисти всички
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="btn-primary"
          style={{ padding: '12px 24px', fontSize: '0.9375rem' }}
        >
          <HiSparkles style={{ width: 15, height: 15 }} />
          {loading ? 'Анализиране…' : 'Анализирай сега'}
        </button>
      </div>

      {/* ── Save messages ── */}
      {saveSuccess && (
        <div className="alert alert-success" style={{ marginBottom: 24 }}>
          <HiCheck style={{ width: 15, height: 15 }} />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="alert alert-error" style={{ marginBottom: 24 }}>
          <span>{saveError}</span>
        </div>
      )}

      {savedCvData && (
        <div className="card anim-fade-up" style={{ padding: 18, marginBottom: 28, border: '1px solid var(--brand-mid)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HiSave style={{ width: 16, height: 16, color: 'var(--brand)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                CV-то е готово за шаблоните
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--ink-50)', margin: 0 }}>
                Можете да го изберете от страницата с CV шаблони.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Feedback ── */}
      {feedback && (
        <div className="feedback-wrapper" style={{ marginBottom: 32 }}>
          <div className="feedback-header">
            <HiSparkles style={{ width: 17, height: 17, color: '#fff', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>
              Обратна връзка с AI
            </span>
            {isStreaming && (
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7 }}>
                <div className="stream-dot" />
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)' }}>Стрийминг…</span>
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

      {/* Empty state */}
      {!feedback && !loading && !savingCv && (
        <div className="anim-fade-up d-4" style={{ textAlign: 'center', padding: '52px 24px', color: 'var(--ink-40)' }}>
          <HiDocumentText style={{ width: 36, height: 36, margin: '0 auto 10px', display: 'block', opacity: 0.35 }} />
          <p style={{ fontSize: '0.9rem' }}>Качете резюме и описание на длъжността, за да започнете</p>
        </div>
      )}
    </div>
  )
}

export default Analyze
