import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  HiArrowRight, HiSparkles, HiSearch, HiClock, HiCurrencyDollar, HiBookmark,
  HiChip, HiCheck, HiX, HiDocumentText, HiRefresh, HiPlus,
  HiChevronLeft, HiChevronRight, HiInformationCircle,
} from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'
import { filterJobsByCvWithGemini } from '../services/geminiService'
import { supabase } from '../services/supabaseClient'

const FILTERS = [
  { label: 'Всички',            value: 'all' },
  { label: 'Дистанционно',      value: 'remote' },
  { label: 'Senior',            value: 'senior' },
  { label: 'Junior',            value: 'junior' },
  { label: 'Пълен работен ден', value: 'fulltime' },
]

const PAGE_SIZE = 6

/* ══════════════════════════════════════════════════════════════════
   MATCH SCORE RING  — circular SVG score with colour coding
══════════════════════════════════════════════════════════════════ */
function ScoreRing({ score, size = 48 }) {
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const fill = circ - (circ * score) / 100
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#2563eb' : score >= 40 ? '#d97706' : '#94a3b8'

  return (
    <svg width={size} height={size} style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={5} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={5}
        strokeDasharray={circ}
        strokeDashoffset={fill}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text
        x={size / 2} y={size / 2 + 5}
        textAnchor="middle" fill={color}
        fontSize={size < 44 ? 10 : 12} fontWeight={800}
        style={{ transform: `rotate(90deg) translate(0, -${size}px)`, transformOrigin: `${size / 2}px ${size / 2}px` }}
      >
        {score}%
      </text>
    </svg>
  )
}

/* ══════════════════════════════════════════════════════════════════
   JOB CARD
══════════════════════════════════════════════════════════════════ */
function JobCard({ job, aiScore, onAnalyze }) {
  const [saved, setSaved] = useState(false)
  const [showReasons, setShowReasons] = useState(false)
  const tooltipRef = useRef(null)

  /* close reasons tooltip on outside click */
  useEffect(() => {
    if (!showReasons) return
    const handler = (e) => { if (tooltipRef.current && !tooltipRef.current.contains(e.target)) setShowReasons(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showReasons])

  const hasAiScore = aiScore != null

  return (
    <div style={{
      background: 'var(--white)',
      border: `1px solid ${job.featured ? 'rgba(37,99,235,0.3)' : hasAiScore && aiScore.score >= 65 ? 'rgba(22,163,74,0.25)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-xl)',
      padding: 'clamp(16px,3vw,22px)',
      position: 'relative', overflow: 'visible',
      transition: 'transform 0.2s var(--ease), box-shadow 0.2s var(--ease)',
    }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)' }}
      onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      {/* Featured stripe */}
      {job.featured && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '20px 20px 0 0', background: 'linear-gradient(90deg, #2563eb, #60a5fa)' }} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12, marginTop: job.featured ? 8 : 0 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: job.logoColor, color: job.logoText,
          fontWeight: 800, fontSize: '1.125rem', border: '1px solid var(--border)',
        }}>
          {job.logo}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--ink)' }}>{job.title}</span>
            {job.featured && (
              <span style={{ background: 'var(--brand)', color: '#fff', padding: '2px 8px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 700 }}>
                ⭐ Препоръчана
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--ink-60)' }}>{job.company} · {job.location}</div>
        </div>

        {/* AI Score ring */}
        {hasAiScore && (
          <div style={{ position: 'relative', flexShrink: 0 }} ref={tooltipRef}>
            <button
              onClick={() => setShowReasons(s => !s)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
              title="AI съответствие"
            >
              <ScoreRing score={aiScore.score} size={50} />
              <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--ink-40)', letterSpacing: '0.04em' }}>AI</span>
            </button>

            {/* Reasons tooltip */}
            {showReasons && aiScore.reasons?.length > 0 && (
              <div style={{
                position: 'absolute', top: 60, right: 0, zIndex: 50,
                background: 'var(--ink)', color: '#fff',
                borderRadius: 'var(--radius-lg)', padding: '14px 16px',
                width: 260, boxShadow: 'var(--shadow-xl)',
                animation: 'fadeIn 0.15s ease',
              }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                  AI анализ
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {aiScore.reasons.map((r, i) => (
                    <li key={i} style={{ fontSize: '0.78rem', lineHeight: 1.5, display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                      <span style={{ color: aiScore.score >= 65 ? '#4ade80' : '#fb923c', flexShrink: 0, marginTop: 2 }}>›</span>
                      {r}
                    </li>
                  ))}
                </ul>
                {/* arrow */}
                <div style={{ position: 'absolute', top: -6, right: 16, width: 12, height: 12, background: 'var(--ink)', transform: 'rotate(45deg)', borderRadius: 2 }} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
        <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 9px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 600 }}>
          {job.type}
        </span>
        <span style={{ background: '#f5f3ff', color: '#6d28d9', padding: '3px 9px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 600 }}>
          {job.mode === 'remote' ? '🌐 Дистанционно' : job.mode === 'hybrid' ? '🔀 Хибриден' : '🏢 Офис'}
        </span>
        {job.tags.slice(0, 4).map(t => (
          <span key={t} style={{ background: 'var(--canvas)', color: 'var(--ink-60)', padding: '3px 9px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 500 }}>
            {t}
          </span>
        ))}
      </div>

      {/* Description */}
      <p style={{ fontSize: '0.8125rem', color: 'var(--ink-60)', lineHeight: 1.65, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {job.desc}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.73rem', color: 'var(--ink-50)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <HiClock style={{ width: 12, height: 12 }} /> {job.posted}
          </span>
          <span style={{ fontSize: '0.73rem', color: 'var(--ink-50)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <HiCurrencyDollar style={{ width: 12, height: 12 }} /> {job.salary}
          </span>
          {!hasAiScore && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--canvas)', borderRadius: 8, padding: '4px 10px' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--ink-50)', fontWeight: 500 }}>Съответствие</span>
              <div style={{ width: 48, height: 3, borderRadius: 999, background: 'var(--border)', overflow: 'hidden' }}>
                <div style={{ width: `${job.match}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #2563eb, #4ade80)' }} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: job.match >= 80 ? '#15803d' : job.match >= 60 ? '#2563eb' : 'var(--ink-50)' }}>{job.match}%</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={() => setSaved(s => !s)}
            style={{
              width: 32, height: 32, borderRadius: 9,
              background: saved ? '#eff6ff' : 'var(--canvas)',
              border: '1px solid var(--border)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: saved ? 'var(--brand)' : 'var(--ink-60)', transition: 'all 0.15s',
            }}
            title="Запази"
          >
            <HiBookmark style={{ width: 14, height: 14 }} />
          </button>
          <button
            onClick={() => onAnalyze(job)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '7px 14px', background: 'var(--brand)', color: '#fff',
              border: 'none', borderRadius: 9, fontSize: '0.8rem', fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.15s, transform 0.15s', whiteSpace: 'nowrap',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#1d4ed8'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseOut={e => { e.currentTarget.style.background = 'var(--brand)'; e.currentTarget.style.transform = '' }}
          >
            <HiChip style={{ width: 13, height: 13 }} /> Анализирай
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   PAGINATION
══════════════════════════════════════════════════════════════════ */
function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i)
    else if (pages[pages.length - 1] !== '…') pages.push('…')
  }

  const btn = (content, target, disabled = false, active = false) => (
    <button
      key={`${content}-${target}`}
      onClick={() => { if (!disabled && target !== '…') onChange(target) }}
      disabled={disabled || content === '…'}
      style={{
        minWidth: 34, height: 34, borderRadius: 9,
        border: `1px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
        background: active ? 'var(--brand)' : disabled || content === '…' ? 'transparent' : 'var(--white)',
        color: active ? '#fff' : content === '…' ? 'var(--ink-30)' : 'var(--ink-60)',
        fontWeight: active ? 700 : 500, fontSize: '0.8125rem',
        cursor: disabled || content === '…' ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s', fontFamily: 'inherit', padding: '0 6px',
      }}
    >{content}</button>
  )

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 32, flexWrap: 'wrap' }}>
      <button
        onClick={() => onChange(page - 1)} disabled={page === 1}
        style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid var(--border)', background: page === 1 ? 'transparent' : 'var(--white)', color: page === 1 ? 'var(--ink-20)' : 'var(--ink-60)', cursor: page === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
      >
        <HiChevronLeft style={{ width: 15, height: 15 }} />
      </button>
      {pages.map((p, i) => btn(p, p, false, p === page))}
      <button
        onClick={() => onChange(page + 1)} disabled={page === totalPages}
        style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid var(--border)', background: page === totalPages ? 'transparent' : 'var(--white)', color: page === totalPages ? 'var(--ink-20)' : 'var(--ink-60)', cursor: page === totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
      >
        <HiChevronRight style={{ width: 15, height: 15 }} />
      </button>
      <span style={{ fontSize: '0.75rem', color: 'var(--ink-40)', marginLeft: 6 }}>
        Страница {page} от {totalPages}
      </span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   CV PICKER MODAL
══════════════════════════════════════════════════════════════════ */
function normalizeCvName(cv) {
  const name = cv?.name || cv?.fullName || cv?.full_name || ''
  const email = cv?.email || ''
  const title = cv?.title || cv?.position || cv?.jobTitle || ''
  const initials = cv?.initials || name.split(' ').filter(Boolean).map(p => p[0]).join('').toUpperCase().slice(0, 2)
  return { name: name || 'Без име', title: title || email || 'Запазено CV', initials: initials || 'CV' }
}

const FILE_EXT_COLORS = {
  pdf:  { bg: '#fef2f2', color: '#ef4444' },
  doc:  { bg: '#eff6ff', color: '#2563eb' },
  docx: { bg: '#eff6ff', color: '#2563eb' },
  txt:  { bg: '#f0fdf4', color: '#16a34a' },
}

function CvPickerModal({ cvs, selectedCvId, onSelect, onClose, userId }) {
  const [tab, setTab] = useState('saved')
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [filesLoading, setFilesLoading] = useState(false)
  const [loadingFileId, setLoadingFileId] = useState(null)

  const fetchFiles = useCallback(async () => {
    if (!userId) return
    setFilesLoading(true)
    try {
      const { data, error } = await supabase.storage.from('Users').list(userId, { sortBy: { column: 'updated_at', order: 'desc' } })
      if (error) throw error
      setUploadedFiles((data || []).filter(f => f.name && !f.name.startsWith('avatar-') && !f.name.startsWith('.')))
    } catch { /* ignore */ } finally { setFilesLoading(false) }
  }, [userId])

  useEffect(() => { if (tab === 'files') fetchFiles() }, [tab, fetchFiles])

  const handleFileSelect = async (file) => {
    setLoadingFileId(file.name)
    try {
      const { data } = supabase.storage.from('Users').getPublicUrl(`${userId}/${file.name}`)
      const url = data?.publicUrl
      const ext = file.name.split('.').pop()?.toLowerCase()
      let cvData
      if (ext === 'txt') {
        const res = await fetch(url)
        const text = await res.text()
        cvData = { rawText: text, name: file.name, source: 'file' }
      } else {
        cvData = { rawText: `CV файл: ${file.name}. URL: ${url}`, name: file.name, source: 'file', fileUrl: url }
      }
      onSelect(cvData)
    } catch { onSelect({ name: file.name, source: 'file' }) }
    finally { setLoadingFileId(null) }
  }

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const tabBtn = (active) => ({
    flex: 1, padding: '9px 0', borderRadius: 8, border: 'none',
    background: active ? 'var(--white)' : 'transparent',
    color: active ? 'var(--ink)' : 'var(--ink-40)',
    fontWeight: active ? 700 : 500, fontSize: '0.8125rem',
    cursor: 'pointer', transition: 'all 0.15s',
    boxShadow: active ? 'var(--shadow-xs)' : 'none', fontFamily: 'inherit',
  })

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ width: '100%', maxWidth: 560, background: 'var(--white)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', animation: 'fadeUp 0.22s var(--ease)' }}>
        <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 4 }}>Избери CV за AI анализ</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ink-60)', lineHeight: 1.5 }}>Gemini ще оцени съответствието на всяка обява от 0 до 100.</p>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--ink-60)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <HiX style={{ width: 15, height: 15 }} />
          </button>
        </div>

        <div style={{ padding: '12px 22px 0' }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--canvas)', borderRadius: 10, padding: 4 }}>
            <button style={tabBtn(tab === 'saved')} onClick={() => setTab('saved')}>
              Запазени CV-та {cvs?.length > 0 && <span style={{ marginLeft: 4, fontSize: '0.7rem', background: 'var(--brand-light)', color: 'var(--brand)', padding: '1px 6px', borderRadius: 99 }}>{cvs.length}</span>}
            </button>
            <button style={tabBtn(tab === 'files')} onClick={() => setTab('files')}>
              Качени файлове {uploadedFiles.length > 0 && <span style={{ marginLeft: 4, fontSize: '0.7rem', background: 'var(--surface-2)', color: 'var(--ink-60)', padding: '1px 6px', borderRadius: 99 }}>{uploadedFiles.length}</span>}
            </button>
          </div>
        </div>

        <div style={{ padding: '16px 22px 22px', maxHeight: 400, overflowY: 'auto' }}>
          {tab === 'saved' && (
            !cvs || cvs.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center' }}>
                <HiDocumentText style={{ width: 36, height: 36, color: 'var(--ink-20)', margin: '0 auto 10px' }} />
                <p style={{ color: 'var(--ink-60)', marginBottom: 14, fontSize: '0.875rem' }}>Все още нямаш запазени CV-та.</p>
                <Link to="/profile" onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 'var(--radius)', background: 'var(--brand)', color: '#fff', fontWeight: 600, textDecoration: 'none', fontSize: '0.8125rem' }}>
                  Към профила
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {cvs.map(cv => {
                  const d = normalizeCvName(cv)
                  const sel = selectedCvId === cv.id
                  return (
                    <button key={cv.id || d.name} onClick={() => onSelect(cv)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-lg)', border: `1.5px solid ${sel ? 'var(--brand)' : 'var(--border)'}`, background: sel ? 'var(--brand-light)' : 'var(--white)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', fontFamily: 'inherit' }}
                    >
                      <div style={{ width: 42, height: 42, borderRadius: 11, background: 'linear-gradient(135deg, var(--brand) 0%, #6366f1 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem', flexShrink: 0 }}>{d.initials}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '0.875rem' }}>{d.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ink-50)', marginTop: 2 }}>{d.title}</div>
                      </div>
                      {sel && <HiCheck style={{ width: 17, height: 17, color: 'var(--brand)', flexShrink: 0 }} />}
                    </button>
                  )
                })}
              </div>
            )
          )}

          {tab === 'files' && (
            filesLoading ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--ink-40)', fontSize: '0.875rem' }}>Зареждане...</div>
            ) : uploadedFiles.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center' }}>
                <HiDocumentText style={{ width: 36, height: 36, color: 'var(--ink-20)', margin: '0 auto 10px' }} />
                <p style={{ color: 'var(--ink-60)', marginBottom: 14, fontSize: '0.875rem' }}>Нямате качени CV файлове.</p>
                <Link to="/profile" onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 'var(--radius)', background: 'var(--brand)', color: '#fff', fontWeight: 600, textDecoration: 'none', fontSize: '0.8125rem' }}>
                  Качи файл в профила
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {uploadedFiles.map(file => {
                  const ext = file.name.split('.').pop()?.toLowerCase() || ''
                  const colors = FILE_EXT_COLORS[ext] || { bg: 'var(--surface-2)', color: 'var(--ink-60)' }
                  const isLoading = loadingFileId === file.name
                  return (
                    <button key={file.name} onClick={() => handleFileSelect(file)} disabled={!!loadingFileId}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border)', background: 'var(--white)', cursor: loadingFileId ? 'wait' : 'pointer', textAlign: 'left', transition: 'all 0.15s', fontFamily: 'inherit', opacity: loadingFileId && !isLoading ? 0.5 : 1 }}
                      onMouseOver={e => { if (!loadingFileId) { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.background = 'var(--brand-light)' } }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--white)' }}
                    >
                      <div style={{ width: 42, height: 42, borderRadius: 11, background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isLoading
                          ? <HiRefresh style={{ width: 16, height: 16, color: 'var(--brand)', animation: 'spinCW 0.8s linear infinite' }} />
                          : <span style={{ fontSize: '0.6rem', fontWeight: 800, color: colors.color, letterSpacing: '0.04em' }}>{ext.toUpperCase()}</span>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--ink-40)', marginTop: 2 }}>{isLoading ? 'Четене на файла...' : 'Натисни за избор'}</div>
                      </div>
                      {!isLoading && <HiDocumentText style={{ width: 16, height: 16, color: 'var(--ink-30)', flexShrink: 0 }} />}
                    </button>
                  )
                })}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   ADD JOB MODAL
══════════════════════════════════════════════════════════════════ */
const LOGO_COLORS = [
  { bg: '#eff6ff', text: '#1d4ed8' }, { bg: '#f0fdf4', text: '#15803d' },
  { bg: '#fdf4ff', text: '#7e22ce' }, { bg: '#fff7ed', text: '#c2410c' },
  { bg: '#fef2f2', text: '#b91c1c' }, { bg: '#f0f9ff', text: '#0369a1' },
]
const EMPTY_JOB = { title: '', company: '', logo: '', location: '', type: 'Пълен работен ден', mode: 'office', level: 'mid', salary: '', desc: '', tags: '', featured: false }

function AddJobModal({ onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_JOB)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr('')
    if (!form.title.trim() || !form.company.trim()) { setErr('Длъжността и компанията са задължителни.'); return }
    setSaving(true)
    try {
      const colorPick = LOGO_COLORS[Math.floor(Math.random() * LOGO_COLORS.length)]
      const logo = form.logo.trim() || form.company.trim().charAt(0).toUpperCase()
      const tagsArr = form.tags.split(',').map(t => t.trim()).filter(Boolean)
      const payload = {
        title: form.title.trim(), company: form.company.trim(), logo,
        logo_color: colorPick.bg, logo_text: colorPick.text,
        location: form.location.trim() || 'България', type: form.type,
        mode: form.mode, level: form.level, salary: form.salary.trim() || 'По договаряне',
        desc: form.desc.trim(), tags: tagsArr, keywords: tagsArr,
        featured: form.featured, match: 50, posted: 'Току-що',
      }
      const { data, error } = await supabase.from('jobs').insert(payload).select().single()
      if (error) throw error
      onSaved({ ...data, logoColor: data.logo_color, logoText: data.logo_text, tags: Array.isArray(data.tags) ? data.tags : [], keywords: Array.isArray(data.keywords) ? data.keywords : [] })
    } catch (e) { setErr(e.message || 'Грешка при запазване.') }
    finally { setSaving(false) }
  }

  const F = ({ label, k, req, ph }) => (
    <div className="form-field" style={{ margin: 0 }}>
      <label className="form-label">{label}{req && <span style={{ color: 'var(--error)' }}> *</span>}</label>
      <input type="text" value={form[k]} onChange={e => set(k, e.target.value)} placeholder={ph || ''} className="form-input" style={{ height: 38 }} />
    </div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.62)', backdropFilter: 'blur(7px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ width: '100%', maxWidth: 580, background: 'var(--white)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column', maxHeight: '92vh', overflow: 'hidden', animation: 'fadeUp 0.22s var(--ease)' }}>
        <div style={{ padding: '20px 24px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <HiPlus style={{ width: 18, height: 18, color: 'var(--brand)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.0625rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.015em' }}>Добави обява за работа</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--ink-40)', marginTop: 1 }}>Попълнете данните за новата позиция</p>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--ink-60)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <HiX style={{ width: 15, height: 15 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <F label="Длъжност" k="title" req ph="Напр. Frontend Developer" />
            <F label="Компания" k="company" req ph="Напр. Acme Corp" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <F label="Локация" k="location" ph="гр. София" />
            <F label="Заплата" k="salary" ph="Напр. 3000–5000 лв." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[
              { label: 'Тип', k: 'type', opts: ['Пълен работен ден', 'Непълен работен ден', 'Стаж', 'Договор', 'Фрийланс'] },
              { label: 'Режим', k: 'mode', opts: [['office','Офис'],['remote','Дистанционно'],['hybrid','Хибриден']] },
              { label: 'Ниво',  k: 'level', opts: [['junior','Junior'],['mid','Mid'],['senior','Senior'],['lead','Lead']] },
            ].map(({ label, k, opts }) => (
              <div key={k} className="form-field" style={{ margin: 0 }}>
                <label className="form-label">{label}</label>
                <select value={form[k]} onChange={e => set(k, e.target.value)} className="form-input" style={{ height: 38 }}>
                  {opts.map(o => Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="form-field" style={{ margin: 0 }}>
            <label className="form-label">Описание</label>
            <textarea value={form.desc} onChange={e => set('desc', e.target.value)} placeholder="Описание на позицията, изисквания, отговорности…" rows={4} className="form-input" style={{ resize: 'vertical', paddingTop: 10 }} />
          </div>
          <div className="form-field" style={{ margin: 0 }}>
            <label className="form-label">Тагове <span style={{ color: 'var(--ink-40)', fontWeight: 400 }}>(разделени със запетая)</span></label>
            <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="React, TypeScript, Remote…" className="form-input" style={{ height: 38 }} />
          </div>
          <F label="Лого / Инициали" k="logo" ph="А или emoji 🚀" />
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
            <div onClick={() => set('featured', !form.featured)} style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, border: `2px solid ${form.featured ? 'var(--brand)' : 'var(--border-strong)'}`, background: form.featured ? 'var(--brand)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', cursor: 'pointer' }}>
              {form.featured && <HiCheck style={{ width: 11, height: 11, color: '#fff' }} />}
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--ink-70)' }}>Препоръчана обява ⭐</span>
          </label>
          {err && <div className="alert alert-error"><span>{err}</span></div>}
        </form>

        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
          <button type="button" onClick={onClose} style={{ padding: '9px 18px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--ink-60)', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}>Отказ</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px' }}>
            <HiCheck style={{ width: 14, height: 14 }} />
            {saving ? 'Запазване…' : 'Добави обявата'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function Jobs() {
  const { user, cvs } = useAuth()
  const [jobs, setJobs]               = useState([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [jobsError, setJobsError]     = useState('')
  const [search, setSearch]           = useState('')
  const [filter, setFilter]           = useState('all')
  const [sort, setSort]               = useState('recent')
  const [page, setPage]               = useState(1)

  /* AI scoring */
  const [aiScores, setAiScores]           = useState(null)   // Map<id, {score, reasons}>
  const [isAiFiltering, setIsAiFiltering] = useState(false)
  const [aiError, setAiError]             = useState('')
  const [selectedCv, setSelectedCv]       = useState(null)
  const [aiFilterActive, setAiFilterActive] = useState(false) // show only matched when true

  /* Modals */
  const [showCvModal, setShowCvModal] = useState(false)
  const [showAddJob, setShowAddJob]   = useState(false)

  useEffect(() => {
    async function loadJobs() {
      setJobsLoading(true); setJobsError('')
      const { data, error } = await supabase
        .from('jobs')
        .select('id, featured, title, company, logo, logo_color, logo_text, location, type, mode, level, posted, salary, tags, desc, keywords')
        .order('id', { ascending: true })
      if (error) { setJobsError('Неуспешно зареждане на обявите. Опитайте отново.'); setJobsLoading(false); return }
      setJobs((data || []).map(job => ({ ...job, logoColor: job.logo_color, logoText: job.logo_text, tags: Array.isArray(job.tags) ? job.tags : [], keywords: Array.isArray(job.keywords) ? job.keywords : [] })))
      setJobsLoading(false)
    }
    loadJobs()
  }, [])

  /* Reset to page 1 whenever filters change */
  useEffect(() => { setPage(1) }, [search, filter, sort, aiScores, aiFilterActive])

  const filtered = useMemo(() => {
    let list = [...jobs]
    const q = search.toLowerCase().trim()
    if (q) list = list.filter(j => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.keywords.some(k => k.includes(q)) || j.desc.toLowerCase().includes(q))
    if (filter === 'remote' || filter === 'hybrid') list = list.filter(j => j.mode === filter)
    else if (filter === 'senior' || filter === 'junior') list = list.filter(j => j.level === filter)
    else if (filter === 'fulltime') list = list.filter(j => j.type === 'Пълен работен ден')

    /* if AI active and filter-only mode, keep only scored jobs with score >= 50 */
    if (aiFilterActive && aiScores) {
      list = list.filter(j => {
        const s = aiScores.get(j.id)
        return s && s.score >= 50
      })
    }

    /* sorting */
    if (aiScores && sort === 'match') {
      list.sort((a, b) => (aiScores.get(b.id)?.score ?? b.match) - (aiScores.get(a.id)?.score ?? a.match))
    } else if (sort === 'match') {
      list.sort((a, b) => b.match - a.match)
    } else if (sort === 'salary') {
      list.sort((a, b) => parseInt(b.salary) - parseInt(a.salary))
    }

    return list
  }, [jobs, search, filter, sort, aiScores, aiFilterActive])

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  async function handleApplyCvFilter(cv) {
    if (!cv) return
    setSelectedCv(cv)
    setShowCvModal(false)
    setIsAiFiltering(true)
    setAiError('')
    try {
      const results = await filterJobsByCvWithGemini(cv, jobs)
      const map = new Map()
      results.forEach(r => map.set(r.id, { score: r.score, reasons: r.reasons }))
      setAiScores(map)
      setAiFilterActive(false)   // show all jobs with scores by default
      setSort('match')           // auto-sort by AI score
    } catch (err) {
      console.error(err)
      setAiError('Неуспешно AI анализиране. Опитайте отново.')
    } finally {
      setIsAiFiltering(false)
    }
  }

  function clearAiFilter() {
    setAiScores(null); setAiError(''); setSelectedCv(null)
    setAiFilterActive(false); setSort('recent')
  }

  useEffect(() => {
    document.body.style.overflow = isAiFiltering ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isAiFiltering])

  const cvName = selectedCv ? normalizeCvName(selectedCv).name : ''

  return (
    <div>
      {isAiFiltering && (
        <div className="loading-overlay">
          <div className="loading-card">
            <div className="spinner" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 8, letterSpacing: '-0.02em' }}>
              AI анализира…
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-60)' }}>
              Изчакайте — оценяваме съответствието за всяка обява
            </p>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #2563eb 100%)', padding: 'clamp(48px,7vw,80px) 0 clamp(40px,6vw,64px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -60, width: 360, height: 360, borderRadius: '50%', background: 'rgba(59,130,246,0.12)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04, backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

        <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 18, display: 'flex' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px 5px 8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 999 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80' }} />
              <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{jobs.length || '…'} обяви в платформата</span>
            </div>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.875rem,5vw,3rem)', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 12 }}>
            Намерете вашата<br />
            <span style={{ background: 'linear-gradient(90deg, #93c5fd, #60a5fa, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>следваща позиция</span>
          </h1>
          <p style={{ fontSize: 'clamp(0.9375rem,2vw,1.0625rem)', color: 'rgba(255,255,255,0.6)', maxWidth: 480, lineHeight: 1.65, marginBottom: 28 }}>
            Разгледайте обяви, подходящи за вашия профил. Gemini AI оценява съответствието с вашето CV.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: '10px 10px 10px 16px', maxWidth: 580, backdropFilter: 'blur(8px)' }}>
            <HiSearch style={{ width: 17, height: 17, color: 'rgba(255,255,255,0.4)', alignSelf: 'center', flexShrink: 0 }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Длъжност, компания или ключова дума…"
              style={{ flex: 1, minWidth: 160, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.875rem', fontFamily: 'inherit' }}
            />
            <button style={{ background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Търси</button>
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <section style={{ background: 'var(--canvas)', padding: 'clamp(28px,5vw,40px) 0 clamp(48px,7vw,72px)' }}>
        <div className="page-container">

          {/* CV AI banner */}
          {user && (
            <div style={{ background: aiScores ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : 'linear-gradient(135deg, #f8faff 0%, #eff6ff 100%)', border: `1px solid ${aiScores ? 'rgba(22,163,74,0.2)' : 'rgba(37,99,235,0.15)'}`, borderRadius: 14, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.375rem', flexShrink: 0 }}>{aiScores ? '🎯' : '📄'}</span>
              <div style={{ flex: 1, minWidth: 160 }}>
                <strong style={{ fontSize: '0.875rem', color: 'var(--ink)', display: 'block', marginBottom: 2 }}>
                  {aiScores ? `AI анализ завършен за "${cvName}"` : 'CV от вашия профил е готово за анализ'}
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--ink-60)' }}>
                  {aiScores
                    ? `Всяка обява получи оценка от Gemini. Кликни на резултата за детайли.`
                    : 'Gemini ще оцени колко добре CV-то ви съответства на всяка обява.'}
                </span>
                {aiScores && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    {[
                      { label: '80–100%', color: '#16a34a', count: [...aiScores.values()].filter(s => s.score >= 80).length },
                      { label: '60–79%',  color: '#2563eb', count: [...aiScores.values()].filter(s => s.score >= 60 && s.score < 80).length },
                      { label: '<60%',    color: '#94a3b8', count: [...aiScores.values()].filter(s => s.score < 60).length },
                    ].map(({ label, color, count }) => (
                      <span key={label} style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(255,255,255,0.7)', color, border: `1px solid ${color}30` }}>
                        {label} · {count} обяви
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => setShowCvModal(true)} disabled={isAiFiltering || jobsLoading || jobs.length === 0} className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.8125rem', opacity: (isAiFiltering || jobsLoading) ? 0.75 : 1, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <HiSparkles style={{ width: 14, height: 14 }} />
                  {isAiFiltering ? 'Анализиране…' : aiScores ? 'Промени CV' : 'Анализирай по CV'}
                </button>
                {aiScores && (
                  <button onClick={() => setAiFilterActive(f => !f)} style={{
                    padding: '8px 14px', fontSize: '0.8125rem', borderRadius: 'var(--radius)',
                    border: `1px solid ${aiFilterActive ? '#16a34a' : 'var(--border)'}`,
                    background: aiFilterActive ? '#f0fdf4' : 'var(--white)',
                    color: aiFilterActive ? '#16a34a' : 'var(--ink-60)',
                    fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                  }}>
                    <HiCheck style={{ width: 13, height: 13 }} />
                    {aiFilterActive ? 'Само съвпадения' : 'Всички обяви'}
                  </button>
                )}
                {aiScores && (
                  <button onClick={clearAiFilter} style={{ padding: '8px 14px', fontSize: '0.8125rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--white)', color: 'var(--ink-60)', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Изчисти
                  </button>
                )}
                <Link to="/analyze" className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  Анализатор <HiArrowRight style={{ width: 13, height: 13 }} />
                </Link>
              </div>
            </div>
          )}

          {jobsError && <div className="alert alert-error" style={{ marginBottom: 16 }}><span>{jobsError}</span></div>}
          {aiError   && <div className="alert alert-error" style={{ marginBottom: 16 }}><span>{aiError}</span></div>}

          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {FILTERS.map(f => (
                <button key={f.value} onClick={() => setFilter(f.value)} style={{
                  display: 'inline-flex', alignItems: 'center', padding: '6px 13px', borderRadius: 999,
                  border: `1px solid ${filter === f.value ? 'var(--brand)' : 'var(--border)'}`,
                  background: filter === f.value ? 'var(--brand)' : 'var(--white)',
                  color: filter === f.value ? '#fff' : 'var(--ink-60)',
                  fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                }}>{f.label}</button>
              ))}
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-40)', paddingLeft: 4 }}>
                {filtered.length} обяви
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <select value={sort} onChange={e => setSort(e.target.value)}
                style={{ fontSize: '0.75rem', color: 'var(--ink-60)', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
                <option value="recent">Най-нови</option>
                <option value="match">{aiScores ? 'По AI оценка' : 'По съответствие'}</option>
                <option value="salary">По заплата</option>
              </select>
              <button onClick={() => setShowAddJob(true)} className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                <HiPlus style={{ width: 14, height: 14 }} /> Добави обява
              </button>
            </div>
          </div>

          {/* Jobs list */}
          {jobsLoading ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--ink-60)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
              <p style={{ fontWeight: 600 }}>Зареждане на обяви…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--ink-60)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>🔍</div>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>
                {aiFilterActive ? 'Няма обяви с добро съответствие за вашето CV' : 'Няма намерени позиции'}
              </p>
              <p style={{ fontSize: '0.875rem' }}>
                {aiFilterActive ? 'Опитайте с друго CV или покажете всички обяви.' : 'Опитайте с друга ключова дума или премахнете филтрите.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {paginated.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  aiScore={aiScores?.get(job.id) ?? null}
                  onAnalyze={() => {}}
                />
              ))}
            </div>
          )}

          <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={p => { setPage(p); window.scrollTo({ top: 400, behavior: 'smooth' }) }} />
        </div>
      </section>

      {showCvModal && (
        <CvPickerModal cvs={cvs} selectedCvId={selectedCv?.id} onSelect={handleApplyCvFilter} onClose={() => setShowCvModal(false)} userId={user?.id} />
      )}
      {showAddJob && (
        <AddJobModal onClose={() => setShowAddJob(false)} onSaved={(newJob) => { setJobs(prev => [newJob, ...prev]); setShowAddJob(false) }} />
      )}
    </div>
  )
}
