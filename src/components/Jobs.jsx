import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { HiArrowRight, HiSparkles, HiSearch, HiClock, HiCurrencyDollar, HiBookmark, HiChip, HiCheck, HiX } from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'
import { filterJobsByCvWithGemini } from '../services/geminiService'
import { supabase } from '../services/supabaseClient'
import { useTranslation } from 'react-i18next'

function JobCard({ job, onAnalyze, t }) {
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
      {job.featured && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #2563eb, #60a5fa)' }} />
      )}

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
                {t('jobs.featured')}
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--ink-60)' }}>
            {job.company} · {job.location}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 9px', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 600 }}>
          {job.type}
        </span>
        <span style={{ background: '#f5f3ff', color: '#6d28d9', padding: '3px 9px', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 600 }}>
          {job.mode === 'remote' ? t('jobs.remote') : t('jobs.office')}
        </span>
        {job.tags.map(tag => (
          <span key={tag} style={{ background: 'var(--canvas)', color: 'var(--ink-60)', padding: '3px 9px', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 500 }}>
            {tag}
          </span>
        ))}
      </div>

      <p style={{ fontSize: '0.8125rem', color: 'var(--ink-60)', lineHeight: 1.65, marginBottom: 16 }}>
        {job.desc}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-60)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <HiClock style={{ width: 13, height: 13 }} /> {job.posted}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-60)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <HiCurrencyDollar style={{ width: 13, height: 13 }} /> {job.salary}
          </span>
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
            title={t('jobs.save')}
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
            {t('jobs.analyze')}
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
    name: name || 'Без ime',
    title: title || email || 'Запазено CV',
    initials: initials || 'CV',
  }
}

function CvPickerModal({ cvs, selectedCvId, onSelect, onClose, t }) {
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
          {t('jobs.pick_cv_title')}
        </h2>

        <p style={{ fontSize: '0.875rem', color: 'var(--ink-60)', marginBottom: 18, lineHeight: 1.6 }}>
          {t('jobs.pick_cv_subtitle')}
        </p>

        {!cvs || cvs.length === 0 ? (
          <div style={{ padding: 18, borderRadius: 'var(--radius-lg)', background: 'var(--canvas)', border: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ color: 'var(--ink-60)', marginBottom: 14 }}>
              {t('jobs.no_cvs')}
            </p>
            <Link
              to="/analyze"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 'var(--radius)', background: 'var(--brand)', color: '#fff', fontWeight: 700, textDecoration: 'none' }}
            >
              {t('jobs.to_analyzer_link')}
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
                    <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{data.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--ink-50)', marginTop: 2 }}>{data.title}</div>
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
  const { t } = useTranslation()
  const [jobs, setJobs] = useState([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [jobsError, setJobsError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('recent')
  const [aiMatchedIds, setAiMatchedIds] = useState(null)
  const [isAiFiltering, setIsAiFiltering] = useState(false)
  const [aiError, setAiError] = useState('')
  const [showCvModal, setShowCvModal] = useState(false)
  const [selectedCv, setSelectedCv] = useState(null)

  const FILTERS = [
    { label: t('jobs.filter_all'),      value: 'all' },
    { label: t('jobs.filter_remote'),   value: 'remote' },
    { label: t('jobs.filter_senior'),   value: 'senior' },
    { label: t('jobs.filter_junior'),   value: 'junior' },
    { label: t('jobs.filter_fulltime'), value: 'fulltime' },
  ]

  useEffect(() => {
    async function loadJobs() {
      setJobsLoading(true)
      setJobsError('')

      const { data, error } = await supabase
        .from('jobs')
        .select('id, featured, title, company, logo, logo_color, logo_text, location, type, mode, level, posted, salary, tags, desc, keywords')
        .order('id', { ascending: true })

      if (error) {
        console.error('Error loading jobs:', error)
        setJobsError(t('jobs.jobs_load_error'))
        setJobs([])
        setJobsLoading(false)
        return
      }

      const normalizedJobs = (data || []).map(job => ({
        ...job,
        logoColor: job.logo_color,
        logoText: job.logo_text,
        tags: Array.isArray(job.tags) ? job.tags : [],
        keywords: Array.isArray(job.keywords) ? job.keywords : [],
      }))

      setJobs(normalizedJobs)
      setJobsLoading(false)
    }

    loadJobs()
  }, [])

  const filtered = useMemo(() => {
    let filteredJobs = [...jobs]
    const q = search.toLowerCase().trim()
    if (q) {
      filteredJobs = filteredJobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.keywords.some(k => k.includes(q)) ||
        j.desc.toLowerCase().includes(q)
      )
    }
    if (filter !== 'all') {
      filteredJobs = filteredJobs.filter(j => j.mode === filter || j.level === filter)
    }
    if (sort === 'salary') filteredJobs.sort((a, b) => parseInt(b.salary) - parseInt(a.salary))
    if (Array.isArray(aiMatchedIds)) {
      filteredJobs = filteredJobs.filter(job => aiMatchedIds.includes(job.id))
    }
    return filteredJobs
  }, [jobs, search, filter, sort, aiMatchedIds])

  async function handleApplyCvFilter(cv) {
    if (!cv) return

    setSelectedCv(cv)
    setShowCvModal(false)

    if (!cvs?.length) {
      setAiError(t('jobs.no_cv_error'))
      setAiMatchedIds([])
      return
    }

    setIsAiFiltering(true)
    setAiError('')

    try {
      const matchedIds = await filterJobsByCvWithGemini(cv, jobs)
      setAiMatchedIds(Array.isArray(matchedIds) ? matchedIds : [])
    } catch (error) {
      console.error(error)
      setAiError(t('jobs.ai_filter_error'))
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
      setAiError(t('jobs.no_cv_error'))
      setAiMatchedIds([])
      return
    }
    setAiError('')
    setShowCvModal(true)
  }

  function handleAnalyze(job) {
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
              {t('jobs.ai_loading_title')}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-60)' }}>
              {t('jobs.ai_loading_subtitle')}
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
          <div style={{ marginBottom: 18, display: 'flex' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px 5px 8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 999 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80' }} />
              <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{t('jobs.new_positions', { count: 247 })}</span>
            </div>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.875rem,5vw,3rem)', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 12 }}>
            {t('jobs.hero_title_1')}
            <br />
            <span style={{ background: 'linear-gradient(90deg, #93c5fd, #60a5fa, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {t('jobs.hero_title_2')}
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(0.9375rem,2vw,1.0625rem)', color: 'rgba(255,255,255,0.6)', maxWidth: 480, lineHeight: 1.65, marginBottom: 28 }}>
            {t('jobs.hero_subtitle')}
          </p>

          {/* Search */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: '10px 10px 10px 16px', maxWidth: 580, backdropFilter: 'blur(8px)' }}>
            <HiSearch style={{ width: 17, height: 17, color: 'rgba(255,255,255,0.4)', alignSelf: 'center', flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('jobs.search_placeholder')}
              style={{ flex: 1, minWidth: 160, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.875rem', fontFamily: 'inherit' }}
            />
            <button style={{ background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {t('jobs.search')}
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 24, flexWrap: 'wrap' }}>
            {[['1,240', t('jobs.stat_listings')], ['380', t('jobs.stat_companies')], ['95%', t('jobs.stat_accuracy')]].map(([val, label], i, arr) => (
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

          {/* CV banner */}
          {user && (
            <div style={{ background: 'linear-gradient(135deg, #f8faff 0%, #eff6ff 100%)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: 14, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.375rem', flexShrink: 0 }}>📄</span>
              <div style={{ flex: 1, minWidth: 160 }}>
                <strong style={{ fontSize: '0.875rem', color: 'var(--ink)', display: 'block', marginBottom: 2 }}>{t('jobs.cv_banner_title')}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--ink-60)' }}>{t('jobs.cv_banner_subtitle')}</span>
                {selectedCv && (
                  <span style={{ display: 'inline-block', marginTop: 8, fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'var(--success-light, #dcfce7)', color: 'var(--success, #16a34a)' }}>
                    {t('jobs.selected_cv', { name: normalizeCvName(selectedCv).name })}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={handleOpenCvModal}
                  disabled={isAiFiltering || jobsLoading || jobs.length === 0}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.8125rem', opacity: (isAiFiltering || jobsLoading || jobs.length === 0) ? 0.75 : 1 }}
                >
                  <HiSparkles style={{ width: 14, height: 14 }} />
                  {isAiFiltering ? t('jobs.rendering') : jobsLoading ? t('jobs.loading') : t('jobs.render_jobs')}
                </button>
                {Array.isArray(aiMatchedIds) && (
                  <button onClick={clearAiFilter} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8125rem' }}>
                    {t('jobs.clear_ai_filter')}
                  </button>
                )}
                <Link to="/analyze" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8125rem' }}>
                  {t('jobs.to_analyzer')} <HiArrowRight style={{ width: 14, height: 14 }} />
                </Link>
              </div>
            </div>
          )}

          {jobsError && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              <span>{jobsError}</span>
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
              <option value="recent">{t('jobs.sort_recent')}</option>
              <option value="salary">{t('jobs.sort_salary')}</option>
            </select>
          </div>

          {/* Jobs list */}
          {jobsLoading ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--ink-60)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>{t('jobs.loading_jobs')}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--ink-60)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>🔍</div>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>
                {Array.isArray(aiMatchedIds) ? t('jobs.no_jobs_ai') : t('jobs.no_jobs')}
              </p>
              <p style={{ fontSize: '0.875rem' }}>
                {Array.isArray(aiMatchedIds) ? t('jobs.no_jobs_ai_hint') : t('jobs.no_jobs_hint')}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(job => (
                <JobCard key={job.id} job={job} onAnalyze={handleAnalyze} t={t} />
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
          t={t}
        />
      )}
    </div>
  )
}
