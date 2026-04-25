import { useEffect, useRef, useState } from 'react'

/* ─── Intersection-observer hook for scroll reveals ─────────────── */
function useReveal(threshold = 0.12) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

/* ─── Animated counter ───────────────────────────────────────────── */
function Counter({ to, suffix = '', duration = 1400 }) {
  const [val, setVal] = useState(0)
  const [ref, visible] = useReveal(0.5)
  useEffect(() => {
    if (!visible) return
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(ease * to))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [visible, to, duration])
  return <span ref={ref}>{val}{suffix}</span>
}

/* ─── Skill bar ──────────────────────────────────────────────────── */
function SkillBar({ name, index }) {
  const [ref, visible] = useReveal(0.1)
  const pct = 60 + ((name.length * 7 + index * 13) % 35)
  return (
    <div ref={ref} style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{name}</span>
        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>{pct}%</span>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 99,
          background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
          width: visible ? `${pct}%` : '0%',
          transition: `width ${0.7 + index * 0.07}s cubic-bezier(0.16,1,0.3,1) ${index * 0.06}s`,
        }} />
      </div>
    </div>
  )
}

/* ─── Reveal wrapper ─────────────────────────────────────────────── */
function Reveal({ children, delay = 0, y = 24 }) {
  const [ref, visible] = useReveal()
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : `translateY(${y}px)`,
      transition: `opacity 0.65s ease ${delay}s, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
    }}>
      {children}
    </div>
  )
}

/* ─── Section heading ────────────────────────────────────────────── */
function SectionHeading({ children, light }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
      <h2 style={{
        fontFamily: "'Sora', system-ui, sans-serif",
        fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
        fontWeight: 800,
        letterSpacing: '-0.03em',
        color: light ? '#fff' : '#0f172a',
        whiteSpace: 'nowrap',
      }}>{children}</h2>
      <div style={{ flex: 1, height: 1, background: light ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)' }} />
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────────── */
function CvWebsiteTemplate({ data }) {
  if (!data) return null

  const {
    fullName    = 'Your Name',
    title       = 'Professional',
    location    = '',
    email       = '',
    phone       = '',
    summary     = '',
    skills      = [],
    experience  = [],
    education   = [],
    projects    = [],
    languages   = [],
  } = data

  const initials = fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const hasProjects = projects.length > 0
  const hasEducation = education.length > 0
  const hasLanguages = languages.length > 0

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: '#0f172a', lineHeight: 1.6, overflowX: 'hidden' }}>

      {/* ══════════════════════════════════════════════════════════════
          HERO — full-bleed dark gradient
      ══════════════════════════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, #080c14 0%, #0f172a 35%, #1a1040 70%, #0f172a 100%)',
        padding: 'clamp(64px,10vw,120px) clamp(20px,6vw,80px)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 'clamp(300px,50vw,600px)', height: 'clamp(300px,50vw,600px)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-30%', left: '-5%', width: 'clamp(200px,40vw,500px)', height: 'clamp(200px,40vw,500px)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        {/* Grid texture */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto', display: 'flex', gap: 'clamp(24px,5vw,56px)', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 'clamp(80px,14vw,120px)', height: 'clamp(80px,14vw,120px)',
            borderRadius: '28px', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
            boxShadow: '0 0 0 3px rgba(99,102,241,0.3), 0 20px 60px rgba(99,102,241,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'clamp(24px,5vw,40px)', fontWeight: 900, color: '#fff',
            fontFamily: "'Sora', system-ui, sans-serif",
            animation: 'cvAvatarPop 0.6s cubic-bezier(0.16,1,0.3,1) both',
          }}>
            {initials}
          </div>

          {/* Name + title */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 99, padding: '4px 14px', marginBottom: 16,
              animation: 'cvFadeUp 0.5s ease both',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', animation: 'cvPulse 2s ease infinite' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Автобиография</span>
            </div>

            <h1 style={{
              fontFamily: "'Sora', system-ui, sans-serif",
              fontSize: 'clamp(2rem,6vw,3.75rem)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              marginBottom: 12,
              background: 'linear-gradient(135deg, #fff 0%, #c7d2fe 60%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'cvFadeUp 0.55s ease 0.1s both',
            }}>
              {fullName}
            </h1>

            <p style={{
              fontSize: 'clamp(1rem,2.5vw,1.25rem)', fontWeight: 600,
              color: '#94a3b8', marginBottom: 20,
              animation: 'cvFadeUp 0.55s ease 0.18s both',
            }}>
              {title}
            </p>

            {/* Contact chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', animation: 'cvFadeUp 0.55s ease 0.26s both' }}>
              {[
                location && { icon: '📍', val: location },
                email    && { icon: '✉️', val: email },
                phone    && { icon: '📱', val: phone },
              ].filter(Boolean).map(({ icon, val }) => (
                <span key={val} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 99, padding: '5px 13px',
                  fontSize: 12, color: '#cbd5e1',
                }}>
                  <span>{icon}</span>{val}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats row */}
        {(experience.length > 0 || skills.length > 0) && (
          <div style={{
            position: 'relative', maxWidth: 900, margin: 'clamp(40px,6vw,64px) auto 0',
            display: 'grid',
            gridTemplateColumns: `repeat(${[experience.length, skills.length, education.length].filter(n => n > 0).length}, 1fr)`,
            gap: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
            animation: 'cvFadeUp 0.6s ease 0.35s both',
          }}>
            {experience.length > 0 && (
              <div style={{ padding: 'clamp(16px,3vw,24px)', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ fontFamily: "'Sora',system-ui,sans-serif", fontSize: 'clamp(1.5rem,4vw,2.25rem)', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                  <Counter to={experience.length} suffix="+" />
                </div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 6 }}>Позиции</div>
              </div>
            )}
            {skills.length > 0 && (
              <div style={{ padding: 'clamp(16px,3vw,24px)', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ fontFamily: "'Sora',system-ui,sans-serif", fontSize: 'clamp(1.5rem,4vw,2.25rem)', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                  <Counter to={skills.length} />
                </div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 6 }}>Умения</div>
              </div>
            )}
            {education.length > 0 && (
              <div style={{ padding: 'clamp(16px,3vw,24px)', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ fontFamily: "'Sora',system-ui,sans-serif", fontSize: 'clamp(1.5rem,4vw,2.25rem)', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                  <Counter to={education.length} />
                </div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 6 }}>Образование</div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════
          ABOUT — light section
      ══════════════════════════════════════════════════════════════ */}
      {summary && (
        <section style={{ background: '#fff', padding: 'clamp(56px,8vw,96px) clamp(20px,6vw,80px)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <Reveal>
              <SectionHeading>За мен</SectionHeading>
            </Reveal>
            <Reveal delay={0.1}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
                gap: 32, alignItems: 'center',
              }}>
                <p style={{ fontSize: 'clamp(1rem,2vw,1.125rem)', color: '#475569', lineHeight: 1.85, fontWeight: 400 }}>
                  {summary}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {skills.slice(0, 8).map((s, i) => (
                    <span key={s} style={{
                      padding: '7px 14px', borderRadius: 10,
                      background: i % 3 === 0 ? '#eff6ff' : i % 3 === 1 ? '#f5f3ff' : '#ecfdf5',
                      color: i % 3 === 0 ? '#1d4ed8' : i % 3 === 1 ? '#6d28d9' : '#065f46',
                      fontSize: 13, fontWeight: 700,
                      border: `1px solid ${i % 3 === 0 ? '#bfdbfe' : i % 3 === 1 ? '#ddd6fe' : '#a7f3d0'}`,
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          EXPERIENCE — dark section with timeline
      ══════════════════════════════════════════════════════════════ */}
      {experience.length > 0 && (
        <section style={{ background: '#080c14', padding: 'clamp(56px,8vw,96px) clamp(20px,6vw,80px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: 'radial-gradient(ellipse at top right, rgba(99,102,241,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
            <Reveal>
              <SectionHeading light>Трудов опит</SectionHeading>
            </Reveal>

            <div style={{ position: 'relative' }}>
              {/* Timeline line */}
              <div style={{ position: 'absolute', left: 19, top: 0, bottom: 0, width: 2, background: 'linear-gradient(180deg, #6366f1 0%, rgba(99,102,241,0.1) 100%)', borderRadius: 1 }} />

              {experience.map((exp, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div style={{ display: 'flex', gap: 28, marginBottom: i < experience.length - 1 ? 40 : 0, position: 'relative' }}>
                    {/* Timeline dot */}
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a78bfa)', boxShadow: '0 0 0 4px rgba(99,102,241,0.2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fff' }} />
                    </div>

                    {/* Card */}
                    <div style={{
                      flex: 1, background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 16, padding: 'clamp(20px,3vw,28px)',
                      transition: 'background 0.2s, border-color 0.2s',
                    }}
                      onMouseOver={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)' }}
                      onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                        <div>
                          <h3 style={{ fontFamily: "'Sora',system-ui,sans-serif", fontSize: 'clamp(1rem,2.5vw,1.125rem)', fontWeight: 700, color: '#fff', marginBottom: 4 }}>{exp.role || 'Роля'}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#818cf8' }}>{exp.company}</span>
                          </div>
                        </div>
                        {exp.period && (
                          <span style={{ fontSize: 12, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 99, padding: '4px 12px', fontWeight: 600, flexShrink: 0 }}>
                            {exp.period}
                          </span>
                        )}
                      </div>

                      {(exp.highlights || []).length > 0 && (
                        <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                          {exp.highlights.map((h, hi) => (
                            <li key={hi} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                              <div style={{ width: 18, height: 18, borderRadius: 6, background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                                <div style={{ width: 5, height: 5, borderRadius: 2, background: '#818cf8' }} />
                              </div>
                              <span style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>{h}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SKILLS — light section with animated bars
      ══════════════════════════════════════════════════════════════ */}
      {skills.length > 0 && (
        <section style={{ background: '#f8fafc', padding: 'clamp(56px,8vw,96px) clamp(20px,6vw,80px)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <Reveal>
              <SectionHeading>Умения</SectionHeading>
            </Reveal>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 48 }}>
              {/* Skill bars */}
              <div style={{ background: '#0f172a', borderRadius: 20, padding: 'clamp(24px,4vw,36px)', boxShadow: '0 20px 60px rgba(15,23,42,0.12)' }}>
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569', marginBottom: 24 }}>Технологии</p>
                {skills.map((s, i) => <SkillBar key={s} name={s} index={i} />)}
              </div>

              {/* Tag cloud */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 24 }}>Всички умения</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {skills.map((s, i) => (
                    <Reveal key={s} delay={i * 0.04}>
                      <span style={{
                        display: 'inline-block',
                        padding: '8px 16px', borderRadius: 10,
                        fontSize: 13, fontWeight: 700,
                        background: ['#eff6ff','#f5f3ff','#ecfdf5','#fff7ed','#fdf2f8'][i % 5],
                        color: ['#1d4ed8','#6d28d9','#065f46','#c2410c','#9d174d'][i % 5],
                        border: `1px solid ${'#bfdbfe,#ddd6fe,#a7f3d0,#fed7aa,#fbcfe8'.split(',')[i % 5]}`,
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        cursor: 'default',
                      }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)' }}
                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                      >{s}</span>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          PROJECTS — dark cards grid
      ══════════════════════════════════════════════════════════════ */}
      {hasProjects && (
        <section style={{ background: '#0f172a', padding: 'clamp(56px,8vw,96px) clamp(20px,6vw,80px)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <Reveal>
              <SectionHeading light>Проекти</SectionHeading>
            </Reveal>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20 }}>
              {projects.map((p, i) => (
                <Reveal key={i} delay={i * 0.07}>
                  <div style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 16, padding: 24, height: '100%',
                    display: 'flex', flexDirection: 'column', gap: 12,
                    transition: 'transform 0.2s, background 0.2s, border-color 0.2s, box-shadow 0.2s',
                    cursor: 'default',
                  }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)' }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${'#6366f1,#8b5cf6,#06b6d4,#10b981,#f59e0b'.split(',')[i % 5]}, ${['#a78bfa','#c4b5fd','#67e8f9','#6ee7b7','#fcd34d'][i % 5]})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 18 }}>{'🚀✦⚡🔥💎'.split('')[i % 5]}</span>
                    </div>
                    <h3 style={{ fontFamily: "'Sora',system-ui,sans-serif", fontSize: 16, fontWeight: 700, color: '#fff' }}>{p.name}</h3>
                    {p.description && <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65, flex: 1 }}>{p.description}</p>}
                    {(p.technologies || []).length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 'auto' }}>
                        {p.technologies.map(t => (
                          <span key={t} style={{ fontSize: 11, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          EDUCATION + LANGUAGES — two columns, light
      ══════════════════════════════════════════════════════════════ */}
      {(hasEducation || hasLanguages) && (
        <section style={{ background: '#fff', padding: 'clamp(56px,8vw,96px) clamp(20px,6vw,80px)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 48 }}>

              {hasEducation && (
                <div>
                  <Reveal>
                    <SectionHeading>Образование</SectionHeading>
                  </Reveal>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {education.map((e, i) => (
                      <Reveal key={i} delay={i * 0.08}>
                        <div style={{ display: 'flex', gap: 16, padding: 20, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, transition: 'border-color 0.2s, box-shadow 0.2s' }}
                          onMouseOver={e2 => { e2.currentTarget.style.borderColor = '#6366f1'; e2.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.1)' }}
                          onMouseOut={e2 => { e2.currentTarget.style.borderColor = '#e2e8f0'; e2.currentTarget.style.boxShadow = 'none' }}
                        >
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>
                            🎓
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 3 }}>{e.degree}</div>
                            <div style={{ fontSize: 13, color: '#6366f1', fontWeight: 600, marginBottom: 4 }}>{e.school}</div>
                            {e.period && <div style={{ fontSize: 12, color: '#94a3b8' }}>{e.period}</div>}
                          </div>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>
              )}

              {hasLanguages && (
                <div>
                  <Reveal>
                    <SectionHeading>Езици</SectionHeading>
                  </Reveal>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {languages.map((l, i) => (
                      <Reveal key={i} delay={i * 0.07}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, transition: 'border-color 0.2s' }}
                          onMouseOver={e => { e.currentTarget.style.borderColor = '#6366f1' }}
                          onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0' }}
                        >
                          <span style={{ fontSize: 24 }}>{'🇧🇬🇬🇧🇩🇪🇫🇷🇪🇸🇮🇹🇵🇹🇷🇺'.match(/.{1,2}/g)?.[i % 9] || '🌐'}</span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{l}</span>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          CONTACT CTA — gradient footer
      ══════════════════════════════════════════════════════════════ */}
      {(email || phone || location) && (
        <section style={{
          background: 'linear-gradient(135deg, #080c14 0%, #1a1040 50%, #080c14 100%)',
          padding: 'clamp(56px,8vw,96px) clamp(20px,6vw,80px)',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
            <Reveal>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #6366f1, #a78bfa)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: '0 0 0 4px rgba(99,102,241,0.2), 0 16px 40px rgba(99,102,241,0.3)' }}>
                ✉️
              </div>
              <h2 style={{ fontFamily: "'Sora',system-ui,sans-serif", fontSize: 'clamp(1.5rem,4vw,2.25rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 12 }}>
                Свържете се с мен
              </h2>
              <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.7, marginBottom: 36 }}>
                Готов за нови предизвикателства и интересни проекти.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                {email && (
                  <a href={`mailto:${email}`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 22px', borderRadius: 12,
                    background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                    color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none',
                    boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(99,102,241,0.45)' }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.35)' }}
                  >
                    ✉️ {email}
                  </a>
                )}
                {phone && (
                  <a href={`tel:${phone}`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 22px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#cbd5e1', fontSize: 14, fontWeight: 700, textDecoration: 'none',
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
                  >
                    📱 {phone}
                  </a>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Keyframe injector ── */}
      <style>{`
        @keyframes cvFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cvAvatarPop {
          from { opacity: 0; transform: scale(0.75); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes cvPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </div>
  )
}

export default CvWebsiteTemplate
