import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { HiArrowRight, HiSparkles, HiSearch, HiLocationMarker, HiClock, HiCurrencyDollar, HiBookmark, HiChip, HiCheck, HiX } from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'
import { filterJobsByCvWithGemini } from '../services/geminiService'

/* ─── Data ─────────────────────────────────────────────────── */
const JOBS = [
  {
    id: 1, featured: true,
    title: 'Senior Frontend Engineer',
    company: 'Telerik (Progress)',
    logo: 'T', logoColor: '#e8f0fe', logoText: '#2563eb',
    location: 'София, България',
    type: 'Пълен работен ден',
    mode: 'remote', level: 'senior',
    posted: 'Днес', salary: '5 000 – 8 000 лв.',
    match: 91,
    tags: ['React', 'TypeScript', 'Node.js'],
    desc: 'Търсим опитен Frontend инженер за разработване на компоненти на Kendo UI. Ще работите с React, TypeScript и нашата дизайн система, обслужваща над 100 000 разработчици.',
    keywords: ['react', 'typescript', 'node', 'frontend', 'senior'],
  },
  {
    id: 2, featured: false,
    title: 'Full Stack Developer',
    company: 'Musala Soft',
    logo: 'M', logoColor: '#fef3c7', logoText: '#b45309',
    location: 'София / Дистанционно',
    type: 'Пълен работен ден',
    mode: 'remote', level: 'senior',
    posted: '2 дни', salary: '4 500 – 7 000 лв.',
    match: 84,
    tags: ['Vue.js', 'Python', 'AWS'],
    desc: 'Присъединете се към нашия екип за разработване на enterprise решения. Ще участвате в проекти за международни клиенти, използвайки Vue.js и Python FastAPI.',
    keywords: ['vue', 'python', 'aws', 'fullstack', 'senior'],
  },
  {
    id: 3, featured: false,
    title: 'Junior React Developer',
    company: 'SoftUni Tech',
    logo: 'S', logoColor: '#f0fdf4', logoText: '#15803d',
    location: 'Пловдив, България',
    type: 'Пълен работен ден',
    mode: 'fulltime', level: 'junior',
    posted: '3 дни', salary: '2 200 – 3 500 лв.',
    match: 76,
    tags: ['React', 'JavaScript', 'CSS'],
    desc: 'Идеална позиция за начинаещи разработчици. Ще получите менторство от старши инженери и ще работите върху реални проекти в динамична среда.',
    keywords: ['react', 'javascript', 'css', 'junior', 'frontend'],
  },
  {
    id: 4, featured: true,
    title: 'AI/ML Engineer',
    company: 'Experian Bulgaria',
    logo: 'E', logoColor: '#f5f3ff', logoText: '#6d28d9',
    location: 'София / Хибриден',
    type: 'Пълен работен ден',
    mode: 'remote', level: 'senior',
    posted: '5 дни', salary: '7 000 – 11 000 лв.',
    match: 68,
    tags: ['Python', 'TensorFlow', 'MLOps'],
    desc: 'Разработвайте ML модели за кредитен скоринг и анализ на риска. Ще работите с огромни масиви от данни и ще имплементирате решения в production среда.',
    keywords: ['python', 'ml', 'ai', 'tensorflow', 'senior', 'data'],
  },
  {
    id: 5, featured: false,
    title: 'Backend Engineer (Go)',
    company: 'Chaos Group',
    logo: 'C', logoColor: '#fff0f0', logoText: '#dc2626',
    location: 'София, България',
    type: 'Пълен работен ден',
    mode: 'fulltime', level: 'senior',
    posted: '1 седмица', salary: '5 500 – 9 000 лв.',
    match: 59,
    tags: ['Go', 'Kubernetes', 'gRPC'],
    desc: 'Изграждайте мащабируема backend инфраструктура за нашата визуализационна платформа, използвана от водещи студия в Холивуд.',
    keywords: ['go', 'golang', 'kubernetes', 'backend', 'senior', 'grpc'],
  },
  {
    id: 6, featured: false,
    title: 'UX/UI Designer',
    company: 'Payhawk',
    logo: 'P', logoColor: '#e0f2fe', logoText: '#0369a1',
    location: 'Дистанционно (Европа)',
    type: 'Пълен работен ден',
    mode: 'remote', level: 'senior',
    posted: '1 седмица', salary: '4 000 – 6 500 лв.',
    match: 72,
    tags: ['Figma', 'Design Systems', 'Research'],
    desc: 'Проектирайте потребителски интерфейси за B2B финтех продукт с над 5 000 корпоративни клиента в Европа.',
    keywords: ['design', 'ux', 'ui', 'figma', 'senior'],
  },
]

const FILTERS = [
  { label: 'Всички', value: 'all' },
  { label: 'Дистанционно', value: 'remote' },
  { label: 'Senior', value: 'senior' },
  { label: 'Junior', value: 'junior' },
  { label: 'Пълен работен ден', value: 'fulltime' },
]

/* ─── Sub-components ────────────────────────────────────────── */
function MatchIndicator({ score }) {
  const color = score >= 85 ? '#15803d' : score >= 70 ? '#2563eb' : score >= 55 ? '#b45309' : '#64748b'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--canvas)', borderRadius: 10, padding: '6px 12px' }}>
      <span style={{ fontSize: '0.6875rem', color: 'var(--ink-60)', fontWeight: 500, whiteSpace: 'nowrap' }}>Съответствие</span>
      <div style={{ width: 60, height: 4, borderRadius: 999, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #2563eb, #4ade80)' }} />
      </div>
      <span style={{ fontSize: '0.875rem', fontWeight: 700, color, minWidth: 32 }}>{score}%</span>
    </div>
  )
}

function JobCard({ job, onAnalyze }) {
  const [saved, setSaved] = useState(false)

  return (
    <div style={{
      background: 'var(--white)',
      border: `1px solid ${job.featured ? 'rgba(37,99,235,0.3)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-xl)',
      padding: 'clamp(18px,3vw,24px)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.2s var(--ease), box-shadow 0.2s var(--ease)',
      cursor: 'default',
    }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)' }}
      onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      {/* Featured stripe */}
      {job.featured && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #2563eb, #60a5fa)' }} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14, marginTop: job.featured ? 8 : 0 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: job.logoColor, color: job.logoText,
          fontWeight: 800, fontSize: '1.125rem',
          border: '1px solid var(--border)',
        }}>
          {job.logo}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--ink)' }}>{job.title}</span>
            {job.featured && (
              <span style={{ background: 'var(--brand)', color: '#fff', padding: '2px 8px', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 700 }}>
                ⭐ Препоръчана
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--ink-60)' }}>
            {job.company} · {job.location}
          </div>
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 9px', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 600 }}>
          {job.type}
        </span>
        <span style={{ background: '#f5f3ff', color: '#6d28d9', padding: '3px 9px', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 600 }}>
          {job.mode === 'remote' ? '🌐 Дистанционно' : '🏢 Офис'}
        </span>
        {job.tags.map(t => (
          <span key={t} style={{ background: 'var(--canvas)', color: 'var(--ink-60)', padding: '3px 9px', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 500 }}>
            {t}
          </span>
        ))}
      </div>

      {/* Description */}
      <p style={{ fontSize: '0.8125rem', color: 'var(--ink-60)', lineHeight: 1.65, marginBottom: 16 }}>
        {job.desc}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-60)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <HiClock style={{ width: 13, height: 13 }} /> {job.posted}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-60)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <HiCurrencyDollar style={{ width: 13, height: 13 }} /> {job.salary}
          </span>
          <MatchIndicator score={job.match} />
        </div>
        <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
          <button
            onClick={() => setSaved(s => !s)}
            style={{
              width: 34, height: 34, borderRadius: 9,
              background: saved ? '#eff6ff' : 'var(--canvas)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: saved ? 'var(--brand)' : 'var(--ink-60)',
              fontSize: '0.875rem',
              transition: 'all 0.15s',
            }}
            title="Запази"
          >
            <HiBookmark style={{ width: 15, height: 15 }} />
          </button>
          <button
            onClick={() => onAnalyze(job)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px',
              background: 'var(--brand)', color: '#fff',
              border: 'none', borderRadius: 10,
              fontSize: '0.8125rem', fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s, transform 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#1d4ed8'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseOut={e => { e.currentTarget.style.background = 'var(--brand)'; e.currentTarget.style.transform = '' }}
          >
            <HiChip style={{ width: 14, height: 14 }} />
            Анализирай
          </button>
        </div>
      </div>
    </div>
  )
}

function normalizeCvName(cv) {
  const name = cv?.name || cv?.fullName || cv?.full_name || ''
  const email = cv?.email || ''
  const title = cv?.title || cv?.position || cv?.jobTitle || ''
  const initials = cv?.initials || name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return {
    name: name || 'Без име',
    title: title || email || 'Запазено CV',
    initials: initials || 'CV',
  }
}

function CvPickerModal({ cvs, selectedCvId, onSelect, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.58)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 560, background: 'var(--white)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', padding: 24, position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 14, right: 14, width: 34, height: 34, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--white)', color: 'var(--ink-50)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <HiX style={{ width: 16, height: 16 }} />
        </button>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>
          Избери CV
        </h2>

        <p style={{ fontSize: '0.875rem', color: 'var(--ink-60)', marginBottom: 18, lineHeight: 1.6 }}>
          Избери кое CV да използваме за AI филтриране на подходящи обяви.
        </p>

        {!cvs || cvs.length === 0 ? (
          <div style={{ padding: 18, borderRadius: 'var(--radius-lg)', background: 'var(--canvas)', border: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ color: 'var(--ink-60)', marginBottom: 14 }}>
              Все още нямаш запазени CV-та.
            </p>
            <Link
              to="/analyze"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 'var(--radius)', background: 'var(--brand)', color: '#fff', fontWeight: 700, textDecoration: 'none' }}
            >
              Към анализатора
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 380, overflowY: 'auto' }}>
            {cvs.map(cv => {
              const data = normalizeCvName(cv)
              const isSelected = selectedCvId === cv.id

              return (
                <button
                  key={cv.id || `${data.name}-${cv.email || ''}`}
                  onClick={() => onSelect(cv)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: 14, borderRadius: 'var(--radius-lg)', border: `1px solid ${isSelected ? 'var(--brand)' : 'var(--border)'}`, background: isSelected ? 'var(--brand-light)' : 'var(--white)', cursor: 'pointer', textAlign: 'left' }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                    {data.initials}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: 'var(--ink)' }}>
                      {data.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--ink-50)', marginTop: 2 }}>
                      {data.title}
                    </div>
                  </div>

                  {isSelected && (
                    <HiCheck style={{ width: 18, height: 18, color: 'var(--brand)', flexShrink: 0 }} />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Main component ────────────────────────────────────────── */
export default function Jobs() {
  const { user, cvs } = useAuth()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('recent')
  const [aiMatchedIds, setAiMatchedIds] = useState(null)
  const [isAiFiltering, setIsAiFiltering] = useState(false)
  const [aiError, setAiError] = useState('')
  const [showCvModal, setShowCvModal] = useState(false)
  const [selectedCv, setSelectedCv] = useState(null)

  const filtered = useMemo(() => {
    let jobs = [...JOBS]
    const q = search.toLowerCase().trim()
    if (q) {
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.keywords.some(k => k.includes(q)) ||
        j.desc.toLowerCase().includes(q)
      )
    }
    if (filter !== 'all') {
      jobs = jobs.filter(j => j.mode === filter || j.level === filter)
    }
    if (sort === 'match') jobs.sort((a, b) => b.match - a.match)
    else if (sort === 'salary') jobs.sort((a, b) => parseInt(b.salary) - parseInt(a.salary))
    if (Array.isArray(aiMatchedIds)) {
      jobs = jobs.filter(job => aiMatchedIds.includes(job.id))
    }
    return jobs
  }, [search, filter, sort, aiMatchedIds])

  async function handleApplyCvFilter(cv) {
    if (!cv) return

    setSelectedCv(cv)
    setShowCvModal(false)

    if (!cvs?.length) {
      setAiError('Нямате запазено CV. Моля, анализирайте CV от страницата Analyze.')
      setAiMatchedIds([])
      return
    }

    setIsAiFiltering(true)
    setAiError('')

    try {
      const matchedIds = await filterJobsByCvWithGemini(cv, JOBS)
      setAiMatchedIds(Array.isArray(matchedIds) ? matchedIds : [])
    } catch (error) {
      console.error(error)
      setAiError('Неуспешно филтриране с AI. Опитайте отново.')
      setAiMatchedIds([])
    } finally {
      setIsAiFiltering(false)
    }
  }

  function clearAiFilter() {
    setAiMatchedIds(null)
    setAiError('')
  }

  function handleOpenCvModal() {
    if (!cvs?.length) {
      setAiError('Нямате запазено CV. Моля, анализирайте CV от страницата Analyze.')
      setAiMatchedIds([])
      return
    }

    setAiError('')
    setShowCvModal(true)
  }

  function handleAnalyze(job) {
    // TODO: navigate to /analyze with job.desc pre-filled as the job description
    console.log('Analyze job:', job.id)
  }

  useEffect(() => {
    document.body.style.overflow = isAiFiltering ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isAiFiltering])

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
              Моля, изчакайте докато филтрираме обявите според избраното CV
            </p>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #2563eb 100%)',
        padding: 'clamp(48px,7vw,80px) 0 clamp(40px,6vw,64px)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -60, width: 360, height: 360, borderRadius: '50%', background: 'rgba(59,130,246,0.12)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04, backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

        <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{ marginBottom: 18, display: 'flex' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px 5px 8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 999 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80' }} />
              <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>247 нови позиции тази седмица</span>
            </div>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.875rem,5vw,3rem)', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 12 }}>
            Намерете вашата
            <br />
            <span style={{ background: 'linear-gradient(90deg, #93c5fd, #60a5fa, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              следваща позиция
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(0.9375rem,2vw,1.0625rem)', color: 'rgba(255,255,255,0.6)', maxWidth: 480, lineHeight: 1.65, marginBottom: 28 }}>
            Разгледайте обяви, подходящи за вашия профил. Анализирайте съответствието с вашето CV с един клик.
          </p>

          {/* Search */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: '10px 10px 10px 16px', maxWidth: 580, backdropFilter: 'blur(8px)' }}>
            <HiSearch style={{ width: 17, height: 17, color: 'rgba(255,255,255,0.4)', alignSelf: 'center', flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Длъжност, компания или ключова дума…"
              style={{ flex: 1, minWidth: 160, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.875rem', fontFamily: 'inherit' }}
            />
            <button style={{ background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Търси
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 24, flexWrap: 'wrap' }}>
            {[['1,240', 'Обяви'], ['380', 'Компании'], ['95%', 'Точност']].map(([val, label], i, arr) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: i < arr.length - 1 ? 20 : 0 }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#fff' }}>{val}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>{label}</div>
                </div>
                {i < arr.length - 1 && <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.15)', marginLeft: 20 }} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <section style={{ background: 'var(--canvas)', padding: 'clamp(28px,5vw,40px) 0 clamp(48px,7vw,72px)' }}>
        <div className="page-container">

          {/* CV banner (only for logged-in users with a saved CV) */}
          {user && (
            <div style={{ background: 'linear-gradient(135deg, #f8faff 0%, #eff6ff 100%)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: 14, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.375rem', flexShrink: 0 }}>📄</span>
              <div style={{ flex: 1, minWidth: 160 }}>
                <strong style={{ fontSize: '0.875rem', color: 'var(--ink)', display: 'block', marginBottom: 2 }}>CV от вашия профил е готово за съпоставяне</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--ink-60)' }}>Натиснете "Render Jobs based on CV", за да покажем само подходящите позиции.</span>
                {selectedCv && (
                  <span style={{ display: 'inline-block', marginTop: 8, fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'var(--success-light, #dcfce7)', color: 'var(--success, #16a34a)' }}>
                    Избрано CV: {normalizeCvName(selectedCv).name}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={handleOpenCvModal}
                  disabled={isAiFiltering}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.8125rem', opacity: isAiFiltering ? 0.75 : 1 }}
                >
                  <HiSparkles style={{ width: 14, height: 14 }} />
                  {isAiFiltering ? 'Рендериране…' : 'Render Jobs based on CV'}
                </button>
                {Array.isArray(aiMatchedIds) && (
                  <button
                    onClick={clearAiFilter}
                    className="btn-secondary"
                    style={{ padding: '8px 14px', fontSize: '0.8125rem' }}
                  >
                    Изчисти AI филтър
                  </button>
                )}
                <Link to="/analyze" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8125rem' }}>
                  Към анализатора <HiArrowRight style={{ width: 14, height: 14 }} />
                </Link>
              </div>
            </div>
          )}

          {aiError && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              <span>{aiError}</span>
            </div>
          )}

          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '6px 13px', borderRadius: 999,
                    border: `1px solid ${filter === f.value ? 'var(--brand)' : 'var(--border)'}`,
                    background: filter === f.value ? 'var(--brand)' : 'var(--white)',
                    color: filter === f.value ? '#fff' : 'var(--ink-60)',
                    fontSize: '0.75rem', fontWeight: 500,
                    cursor: 'pointer', transition: 'all 0.15s',
                    fontFamily: 'inherit',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={{ fontSize: '0.75rem', color: 'var(--ink-60)', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <option value="recent">Най-нови</option>
              <option value="match">По съответствие</option>
              <option value="salary">По заплата</option>
            </select>
          </div>

          {/* Jobs list */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--ink-60)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>🔍</div>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>
                {Array.isArray(aiMatchedIds) ? 'No Jobs Matching your CV' : 'Няма намерени позиции'}
              </p>
              <p style={{ fontSize: '0.875rem' }}>
                {Array.isArray(aiMatchedIds)
                  ? 'Опитайте с друго CV или изчистете AI филтъра.'
                  : 'Опитайте с друга ключова дума или премахнете филтрите.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(job => (
                <JobCard key={job.id} job={job} onAnalyze={handleAnalyze} />
              ))}
            </div>
          )}
        </div>
      </section>

      {showCvModal && (
        <CvPickerModal
          cvs={cvs}
          selectedCvId={selectedCv?.id}
          onSelect={handleApplyCvFilter}
          onClose={() => setShowCvModal(false)}
        />
      )}
    </div>
  )
}