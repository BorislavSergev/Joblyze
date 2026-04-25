import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HiSparkles, HiChartBar, HiDownload, HiCheck,
  HiLightningBolt, HiColorSwatch, HiTemplate,
  HiMail, HiPhone, HiLocationMarker, HiExternalLink,
} from 'react-icons/hi'

/* ─── Mock CV data ───────────────────────────────────────────────── */
const CV = {
  name: 'Александър Петров',
  initials: 'АП',
  title: 'Senior Frontend Engineer',
  email: 'alex.petrov@example.com',
  phone: '+359 88 123 4567',
  location: 'София, България',
  website: 'alexp.dev',
  summary: 'Опитен frontend инженер с 6+ години опит в изграждането на мащабируеми уеб приложения. Специализиран в React, TypeScript и модерни UX практики. Страстен по чист код и отлично потребителско изживяване.',
  skills: ['React', 'TypeScript', 'Next.js', 'Node.js', 'Tailwind CSS', 'GraphQL', 'Figma', 'AWS'],
  experience: [
    {
      role: 'Senior Frontend Engineer',
      company: 'TechCorp Sofia',
      period: '2021 – Сега',
      location: 'София, България',
      bullets: [
        'Изграждане на SaaS платформа с React 18 и Next.js, обслужваща 50K+ потребители',
        'Намаляване на времето за зареждане с 42% чрез code splitting и lazy loading',
        'Менторство на 3 junior разработчика и провеждане на code reviews',
      ],
    },
    {
      role: 'Frontend Developer',
      company: 'Startup Hub',
      period: '2019 – 2021',
      location: 'Пловдив, България',
      bullets: [
        'Разработка на мобилно-адаптивни интерфейси за 12+ клиента',
        'Въвеждане на TypeScript, намаляване на бъговете с 35%',
        'Интеграция на REST и GraphQL API с React Query',
      ],
    },
    {
      role: 'Junior Web Developer',
      company: 'Digital Agency BG',
      period: '2018 – 2019',
      location: 'София, България',
      bullets: [
        'Изграждане на WordPress и Shopify сайтове за местни фирми',
        'Разработка на JavaScript функционалности и анимации',
      ],
    },
  ],
  education: [
    {
      degree: 'Бакалавър по Компютърни науки',
      school: 'СУ "Св. Климент Охридски"',
      period: '2015 – 2019',
      gpa: '5.80 / 6.00',
    },
  ],
  languages: ['Български (роден)', 'Английски (C2)', 'Немски (B1)'],
  certifications: ['AWS Certified Developer', 'Google UX Design Certificate'],
}

/* ════════════════════════════════════════════════════════════════════
   TEMPLATE 1 — NOVA  (modern sidebar, blue-indigo)
══════════════════════════════════════════════════════════════════════ */
function NovaTemplate() {
  return (
    <div style={{ display: 'flex', minHeight: '100%', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: 13, lineHeight: 1.55, color: '#1e293b', background: '#fff' }}>

      {/* ── Sidebar ── */}
      <div style={{ width: 220, flexShrink: 0, background: 'linear-gradient(180deg, #1e3a8a 0%, #2563eb 100%)', color: '#fff', padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Avatar */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800 }}>
            {CV.initials}
          </div>
          <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.3, marginBottom: 4 }}>{CV.name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 500, letterSpacing: '0.02em' }}>{CV.title}</div>
        </div>

        {/* Contact */}
        <div>
          <SbHead label="Контакти" />
          {[
            { icon: HiMail, val: CV.email },
            { icon: HiPhone, val: CV.phone },
            { icon: HiLocationMarker, val: CV.location },
            { icon: HiExternalLink, val: CV.website },
          ].map(({ icon: Icon, val }) => (
            <div key={val} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 8, fontSize: 10.5 }}>
              <Icon style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.6)', flexShrink: 0, marginTop: 1 }} />
              <span style={{ color: 'rgba(255,255,255,0.82)', wordBreak: 'break-word' }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div>
          <SbHead label="Умения" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {CV.skills.map(s => (
              <div key={s}>
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.85)', marginBottom: 4, fontWeight: 500 }}>{s}</div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.18)', borderRadius: 2 }}>
                  <div style={{ height: '100%', borderRadius: 2, background: 'rgba(255,255,255,0.75)', width: `${55 + Math.floor(Math.sin(s.length) * 30 + 30)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <SbHead label="Езици" />
          {CV.languages.map(l => (
            <div key={l} style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.82)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.55)', flexShrink: 0 }} />
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ flex: 1, padding: '32px 28px', overflowY: 'auto' }}>

        {/* Summary */}
        <section style={{ marginBottom: 24 }}>
          <MH label="Профил" color="#2563eb" />
          <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.7 }}>{CV.summary}</p>
        </section>

        {/* Experience */}
        <section style={{ marginBottom: 24 }}>
          <MH label="Опит" color="#2563eb" />
          {CV.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 18, paddingLeft: 14, borderLeft: '2px solid #bfdbfe', position: 'relative' }}>
              <div style={{ position: 'absolute', left: -5, top: 4, width: 8, height: 8, borderRadius: '50%', background: '#2563eb', border: '2px solid #eff6ff' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4, marginBottom: 2 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{e.role}</span>
                <span style={{ fontSize: 10.5, color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: 99 }}>{e.period}</span>
              </div>
              <div style={{ fontSize: 11.5, color: '#2563eb', fontWeight: 600, marginBottom: 7 }}>{e.company} · {e.location}</div>
              <ul style={{ paddingLeft: 0, margin: 0, listStyle: 'none' }}>
                {e.bullets.map((b, bi) => (
                  <li key={bi} style={{ fontSize: 11.5, color: '#475569', marginBottom: 4, paddingLeft: 12, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: '#2563eb', fontWeight: 700 }}>›</span>{b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Education */}
        <section style={{ marginBottom: 24 }}>
          <MH label="Образование" color="#2563eb" />
          {CV.education.map((e, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{e.degree}</div>
                <div style={{ fontSize: 11.5, color: '#2563eb', fontWeight: 600 }}>{e.school}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>GPA: {e.gpa}</div>
              </div>
              <span style={{ fontSize: 10.5, color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: 99, flexShrink: 0 }}>{e.period}</span>
            </div>
          ))}
        </section>

        {/* Certifications */}
        <section>
          <MH label="Сертификати" color="#2563eb" />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CV.certifications.map(c => (
              <span key={c} style={{ fontSize: 11, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: 6, padding: '3px 10px', fontWeight: 600 }}>{c}</span>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   TEMPLATE 2 — ONYX  (dark luxury, charcoal + gold)
══════════════════════════════════════════════════════════════════════ */
function OnyxTemplate() {
  const gold = '#c9a84c'
  const bg = '#141414'
  const card = '#1f1f1f'
  const muted = 'rgba(255,255,255,0.45)'
  return (
    <div style={{ background: bg, minHeight: '100%', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: 13, color: '#e2e8f0' }}>

      {/* Hero header */}
      <div style={{ padding: '36px 40px 28px', borderBottom: `1px solid rgba(201,168,76,0.2)`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle, ${gold}18 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div style={{ width: 68, height: 68, borderRadius: 14, background: `linear-gradient(135deg, ${gold}40, ${gold}18)`, border: `2px solid ${gold}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: gold, flexShrink: 0 }}>
            {CV.initials}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', marginBottom: 4 }}>{CV.name}</h1>
            <p style={{ fontSize: 13, color: gold, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 12 }}>{CV.title}</p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[CV.email, CV.phone, CV.location].map(v => (
                <span key={v} style={{ fontSize: 10.5, color: muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: gold, display: 'inline-block' }} />
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 0 }}>

        {/* Main */}
        <div style={{ padding: '28px 32px', borderRight: `1px solid rgba(255,255,255,0.07)` }}>
          <OnyxSection label="Профил" gold={gold}>
            <p style={{ fontSize: 12, color: muted, lineHeight: 1.75 }}>{CV.summary}</p>
          </OnyxSection>

          <OnyxSection label="Опит" gold={gold}>
            {CV.experience.map((e, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>{e.role}</div>
                    <div style={{ fontSize: 11.5, color: gold, fontWeight: 600, marginTop: 2 }}>{e.company}</div>
                  </div>
                  <span style={{ fontSize: 10.5, color: muted, background: 'rgba(255,255,255,0.06)', padding: '2px 10px', borderRadius: 4, flexShrink: 0 }}>{e.period}</span>
                </div>
                {e.bullets.map((b, bi) => (
                  <div key={bi} style={{ display: 'flex', gap: 8, marginTop: 5 }}>
                    <span style={{ color: gold, fontSize: 14, lineHeight: 1.4, flexShrink: 0 }}>—</span>
                    <span style={{ fontSize: 11.5, color: muted, lineHeight: 1.6 }}>{b}</span>
                  </div>
                ))}
                {i < CV.experience.length - 1 && <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginTop: 18 }} />}
              </div>
            ))}
          </OnyxSection>
        </div>

        {/* Sidebar */}
        <div style={{ padding: '28px 24px', background: card }}>
          <OnyxSection label="Умения" gold={gold}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {CV.skills.map((s, i) => (
                <div key={s}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 500 }}>{s}</span>
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <div style={{ height: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${gold}, ${gold}88)`, width: `${60 + (i * 13) % 35}%`, transition: 'width 0.6s' }} />
                  </div>
                </div>
              ))}
            </div>
          </OnyxSection>

          <OnyxSection label="Образование" gold={gold}>
            {CV.education.map((e, i) => (
              <div key={i}>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#e2e8f0', marginBottom: 3 }}>{e.degree}</div>
                <div style={{ fontSize: 11, color: gold }}>{e.school}</div>
                <div style={{ fontSize: 10.5, color: muted, marginTop: 2 }}>{e.period}</div>
              </div>
            ))}
          </OnyxSection>

          <OnyxSection label="Езици" gold={gold}>
            {CV.languages.map(l => (
              <div key={l} style={{ fontSize: 11, color: muted, marginBottom: 6, paddingLeft: 8, borderLeft: `2px solid ${gold}50` }}>{l}</div>
            ))}
          </OnyxSection>

          <OnyxSection label="Сертификати" gold={gold}>
            {CV.certifications.map(c => (
              <div key={c} style={{ fontSize: 11, color: muted, marginBottom: 6, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <span style={{ color: gold, marginTop: 1 }}>✦</span>{c}
              </div>
            ))}
          </OnyxSection>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   TEMPLATE 3 — SLATE  (editorial single-column, monochrome)
══════════════════════════════════════════════════════════════════════ */
function SlateTemplate() {
  return (
    <div style={{ background: '#fff', minHeight: '100%', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", maxWidth: 680, margin: '0 auto', padding: '44px 48px', fontSize: 13, color: '#1e293b' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em', color: '#0f172a', lineHeight: 1, marginBottom: 6 }}>{CV.name}</h1>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{CV.title}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            {[CV.email, CV.phone, CV.location].map(v => (
              <div key={v} style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>{v}</div>
            ))}
          </div>
        </div>
        <div style={{ height: 3, background: '#0f172a', borderRadius: 2 }} />
      </div>

      {/* Summary */}
      <SlateSection label="Резюме">
        <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.75 }}>{CV.summary}</p>
      </SlateSection>

      {/* Experience */}
      <SlateSection label="Трудов стаж">
        {CV.experience.map((e, i) => (
          <div key={i} style={{ marginBottom: 20, display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0 20px' }}>
            <div style={{ paddingTop: 2 }}>
              <div style={{ fontSize: 10.5, color: '#94a3b8', fontWeight: 600, lineHeight: 1.4 }}>{e.period}</div>
              <div style={{ fontSize: 10, color: '#cbd5e1', marginTop: 2 }}>{e.location}</div>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', marginBottom: 2 }}>{e.role}</div>
              <div style={{ fontSize: 12, color: '#475569', fontWeight: 600, marginBottom: 8 }}>{e.company}</div>
              <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
                {e.bullets.map((b, bi) => (
                  <li key={bi} style={{ fontSize: 11.5, color: '#64748b', marginBottom: 4, paddingLeft: 14, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: '#0f172a', fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>·</span>{b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </SlateSection>

      {/* Education */}
      <SlateSection label="Образование">
        {CV.education.map((e, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0 20px' }}>
            <div style={{ fontSize: 10.5, color: '#94a3b8', fontWeight: 600 }}>{e.period}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>{e.degree}</div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{e.school}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Среден успех: {e.gpa}</div>
            </div>
          </div>
        ))}
      </SlateSection>

      {/* Skills + Languages row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <SlateSection label="Технологии">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {CV.skills.map(s => (
              <span key={s} style={{ fontSize: 10.5, background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', borderRadius: 4, padding: '3px 9px', fontWeight: 600 }}>{s}</span>
            ))}
          </div>
        </SlateSection>
        <SlateSection label="Езици">
          {CV.languages.map(l => (
            <div key={l} style={{ fontSize: 11.5, color: '#475569', marginBottom: 5 }}>{l}</div>
          ))}
        </SlateSection>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   TEMPLATE 4 — AURORA  (creative, emerald + teal gradient)
══════════════════════════════════════════════════════════════════════ */
function AuroraTemplate() {
  const teal = '#0d9488'
  const emerald = '#059669'
  return (
    <div style={{ background: '#f0fdf4', minHeight: '100%', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: 13, color: '#1e293b' }}>

      {/* Top header */}
      <div style={{ background: `linear-gradient(135deg, #064e3b 0%, #065f46 40%, ${teal} 100%)`, padding: '36px 40px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -50, left: 60, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'relative', display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, flexShrink: 0 }}>
            {CV.initials}
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 4 }}>{CV.name}</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>{CV.title}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[CV.email, CV.phone, CV.location].map(v => (
                <span key={v} style={{ fontSize: 10.5, background: 'rgba(255,255,255,0.12)', borderRadius: 99, padding: '3px 10px', color: 'rgba(255,255,255,0.85)' }}>{v}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Skills bar */}
      <div style={{ background: '#ecfdf5', borderBottom: '1px solid #a7f3d0', padding: '14px 40px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {CV.skills.map(s => (
          <span key={s} style={{ fontSize: 11, background: '#fff', color: teal, border: `1px solid ${teal}30`, borderRadius: 6, padding: '3px 10px', fontWeight: 700 }}>{s}</span>
        ))}
      </div>

      {/* Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 0 }}>
        {/* Main */}
        <div style={{ padding: '28px 32px', borderRight: '1px solid #d1fae5' }}>
          <AuSection label="Профил" teal={teal}>
            <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.75 }}>{CV.summary}</p>
          </AuSection>

          <AuSection label="Опит" teal={teal}>
            {CV.experience.map((e, i) => (
              <div key={i} style={{ marginBottom: 20, background: '#fff', border: '1px solid #d1fae5', borderRadius: 10, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: `linear-gradient(180deg, ${teal}, ${emerald})`, borderRadius: '10px 0 0 10px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>{e.role}</div>
                  <span style={{ fontSize: 10.5, color: teal, background: '#ecfdf5', padding: '2px 8px', borderRadius: 99, fontWeight: 600, flexShrink: 0 }}>{e.period}</span>
                </div>
                <div style={{ fontSize: 12, color: teal, fontWeight: 600, marginBottom: 8 }}>{e.company} · {e.location}</div>
                {e.bullets.map((b, bi) => (
                  <div key={bi} style={{ display: 'flex', gap: 7, marginBottom: 4 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: emerald, flexShrink: 0, marginTop: 4 }} />
                    <span style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.6 }}>{b}</span>
                  </div>
                ))}
              </div>
            ))}
          </AuSection>
        </div>

        {/* Sidebar */}
        <div style={{ padding: '28px 20px', background: '#f0fdf4' }}>
          <AuSection label="Образование" teal={teal}>
            {CV.education.map((e, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #d1fae5', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#0f172a', marginBottom: 3 }}>{e.degree}</div>
                <div style={{ fontSize: 11, color: teal, fontWeight: 600 }}>{e.school}</div>
                <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 3 }}>{e.period} · {e.gpa}</div>
              </div>
            ))}
          </AuSection>

          <AuSection label="Езици" teal={teal}>
            {CV.languages.map(l => (
              <div key={l} style={{ fontSize: 11, color: '#475569', marginBottom: 7, display: 'flex', gap: 6 }}>
                <span style={{ color: teal, fontWeight: 700 }}>›</span>{l}
              </div>
            ))}
          </AuSection>

          <AuSection label="Сертификати" teal={teal}>
            {CV.certifications.map(c => (
              <div key={c} style={{ fontSize: 11, background: '#fff', color: '#1e293b', border: '1px solid #a7f3d0', borderRadius: 6, padding: '5px 10px', marginBottom: 6, fontWeight: 600 }}>{c}</div>
            ))}
          </AuSection>
        </div>
      </div>
    </div>
  )
}

/* ─── Helper section components ──────────────────────────────────── */
function SbHead({ label }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
      {label}
    </div>
  )
}
function MH({ label, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <div style={{ width: 3, height: 18, borderRadius: 2, background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: `${color}25` }} />
    </div>
  )
}
function OnyxSection({ label, gold, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: gold, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 16, height: 1.5, background: gold, borderRadius: 1 }} />
        {label}
      </div>
      {children}
    </div>
  )
}
function SlateSection({ label, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 14, paddingBottom: 6, borderBottom: '1px solid #e2e8f0' }}>{label}</div>
      {children}
    </div>
  )
}
function AuSection({ label, teal, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 16, height: 16, borderRadius: 5, background: `${teal}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 6, height: 6, borderRadius: 2, background: teal }} />
        </div>
        <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: teal }}>{label}</span>
      </div>
      {children}
    </div>
  )
}

/* ─── Template registry ───────────────────────────────────────────── */
const TEMPLATES = [
  {
    id: 'nova',
    name: 'Nova',
    tag: 'Корпоративен',
    tagColor: '#2563eb',
    desc: 'Двуколонен дизайн с интензивен blue sidebar. Идеален за корпоративни и tech позиции.',
    accent: '#2563eb',
    industries: 'IT · Финанси · Консултации',
  },
  {
    id: 'onyx',
    name: 'Onyx',
    tag: 'Луксозен',
    tagColor: '#c9a84c',
    desc: 'Тъмен, изтънчен стил с golden accents. За позиции в tech, design и creative agencies.',
    accent: '#c9a84c',
    industries: 'Design · Tech · Creative',
    dark: true,
  },
  {
    id: 'slate',
    name: 'Slate',
    tag: 'Класически',
    tagColor: '#475569',
    desc: 'Минималистичен едноколонен дизайн. Максимална ATS съвместимост.',
    accent: '#0f172a',
    industries: 'Универсален · Academia · Legal',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    tag: 'Творчески',
    tagColor: '#059669',
    desc: 'Свеж emerald-teal дизайн с карти за опит. За иновативни и творчески роли.',
    accent: '#0d9488',
    industries: 'Startup · Marketing · UX',
  },
]

function TemplatePreview({ id }) {
  switch (id) {
    case 'onyx':   return <OnyxTemplate />
    case 'slate':  return <SlateTemplate />
    case 'aurora': return <AuroraTemplate />
    default:       return <NovaTemplate />
  }
}

/* ─── Thumbnail swatch ────────────────────────────────────────────── */
const SWATCHES = {
  nova:   { bg: '#1e3a8a', strip1: '#fff', strip2: '#bfdbfe' },
  onyx:   { bg: '#141414', strip1: '#c9a84c', strip2: '#1f1f1f' },
  slate:  { bg: '#fff', strip1: '#0f172a', strip2: '#94a3b8' },
  aurora: { bg: '#064e3b', strip1: '#6ee7b7', strip2: '#059669' },
}
function Swatch({ id }) {
  const s = SWATCHES[id]
  return (
    <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(0,0,0,0.08)', background: s.bg, display: 'flex', flexDirection: 'column', padding: 6, gap: 3 }}>
      <div style={{ height: 6, borderRadius: 2, background: s.strip1, opacity: 0.9 }} />
      <div style={{ height: 3, borderRadius: 2, background: s.strip2, opacity: 0.6, width: '70%' }} />
      <div style={{ height: 2, borderRadius: 2, background: s.strip2, opacity: 0.35, width: '50%' }} />
      <div style={{ height: 2, borderRadius: 2, background: s.strip2, opacity: 0.35, width: '80%' }} />
      <div style={{ height: 2, borderRadius: 2, background: s.strip2, opacity: 0.35, width: '60%' }} />
    </div>
  )
}

/* ─── Main page ───────────────────────────────────────────────────── */
function Templates() {
  const [active, setActive] = useState('nova')
  const activeT = TEMPLATES.find(t => t.id === active)

  return (
    <div className="page-container" style={{ paddingTop: 'clamp(40px,6vw,68px)', paddingBottom: 'clamp(60px,8vw,100px)' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 'clamp(32px,5vw,52px)' }}>
        <span className="chip chip-brand anim-fade-up" style={{ display: 'inline-flex', marginBottom: 14 }}>
          <HiTemplate style={{ width: 11, height: 11 }} />
          CV Шаблони
        </span>
        <h1 className="anim-fade-up d-1" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem,4vw,2.75rem)', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 12 }}>
          Шаблони за автобиография
        </h1>
        <p className="anim-fade-up d-2" style={{ fontSize: 'clamp(0.9rem,2vw,1.0625rem)', color: 'var(--ink-60)', maxWidth: 560, lineHeight: 1.7 }}>
          Четири уникални стила — от корпоративен до творчески. Всеки е ATS-оптимизиран и автоматично се попълва с вашите данни от AI.
        </p>
      </div>

      {/* ── Layout ── */}
      <div className="templates-layout" style={{ display: 'grid', gridTemplateColumns: 'clamp(260px,30%,320px) 1fr', gap: 24, alignItems: 'start' }}>

        {/* Left panel */}
        <div className="templates-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'sticky', top: 88 }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-40)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            Изберете шаблон
          </p>

          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '13px 14px', borderRadius: 'var(--radius-lg)',
              border: `2px solid ${active === t.id ? t.accent : 'var(--border)'}`,
              background: active === t.id ? (t.dark ? `${t.accent}18` : `${t.accent}07`) : 'var(--white)',
              cursor: 'pointer', textAlign: 'left',
              transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
              boxShadow: active === t.id ? `0 0 0 3px ${t.accent}18, var(--shadow-md)` : 'var(--shadow-xs)',
            }}>
              <Swatch id={t.id} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ink)' }}>{t.name}</span>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: `${t.tagColor}14`, color: t.tagColor }}>{t.tag}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--ink-40)', lineHeight: 1.5, margin: 0 }}>{t.desc}</p>
                <p style={{ fontSize: '0.68rem', color: 'var(--ink-40)', marginTop: 4 }}>
                  <span style={{ color: t.accent, fontWeight: 600 }}>✦</span> {t.industries}
                </p>
              </div>
              {active === t.id && (
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: t.accent, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HiCheck style={{ width: 10, height: 10, color: '#fff' }} />
                </div>
              )}
            </button>
          ))}

          {/* CTA card */}
          <div style={{ marginTop: 8, padding: '18px 16px', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #2563eb 100%)', textAlign: 'center' }}>
            <HiSparkles style={{ width: 20, height: 20, color: 'rgba(255,255,255,0.6)', margin: '0 auto 8px' }} />
            <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#fff', marginBottom: 5 }}>Готови за AI анализ?</p>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginBottom: 14, lineHeight: 1.55 }}>
              Качете CV и AI автоматично ще попълни шаблона с вашите данни.
            </p>
            <Link to="/analyze" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 'var(--radius)',
              background: '#fff', color: '#1d4ed8',
              fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none',
            }}>
              <HiChartBar style={{ width: 13, height: 13 }} />
              Анализирай CV
            </Link>
          </div>
        </div>

        {/* Right: preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Label row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ink)' }}>{activeT.name}</span>
              <span style={{ marginLeft: 8, fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: `${activeT.tagColor}14`, color: activeT.tagColor }}>{activeT.tag}</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--ink-40)' }}>{activeT.industries}</span>
          </div>

          {/* Browser chrome + preview */}
          <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)', background: '#fff' }}>
            {/* Chrome bar */}
            <div style={{ padding: '8px 14px', background: '#f1f5f9', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 5 }}>
                {['#ef4444', '#f59e0b', '#10b981'].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
              </div>
              <div style={{ flex: 1, maxWidth: 260, height: 19, background: '#e2e8f0', borderRadius: 5, display: 'flex', alignItems: 'center', paddingLeft: 10 }}>
                <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 500 }}>cv.joblyze.ai/{activeT.id}</span>
              </div>
            </div>

            {/* Scaled preview — full real-size CV inside a viewport scale container */}
            <div style={{ height: 600, overflow: 'hidden', position: 'relative', background: activeT.dark ? '#141414' : '#f8fafc' }}>
              <div style={{
                width: '167%',       /* scale 0.6 => 1/0.6 ≈ 167% */
                height: '167%',
                transformOrigin: 'top left',
                transform: 'scale(0.6)',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}>
                <TemplatePreview id={active} />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Link to="/analyze" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '12px 16px', borderRadius: 'var(--radius)',
              background: activeT.accent, color: '#fff',
              fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none',
              fontFamily: 'var(--font)', transition: 'opacity 0.15s, transform 0.15s',
              boxShadow: `0 4px 16px ${activeT.accent}40`,
            }}
              onMouseOver={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseOut={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <HiSparkles style={{ width: 14, height: 14 }} />
              Използвай шаблона
            </Link>
            <button disabled style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '12px 16px', borderRadius: 'var(--radius)',
              background: 'var(--white)', color: 'var(--ink-40)',
              fontWeight: 600, fontSize: '0.875rem',
              border: '1px solid var(--border)', cursor: 'not-allowed',
              fontFamily: 'var(--font)', opacity: 0.55,
            }}>
              <HiDownload style={{ width: 14, height: 14 }} />
              Изтегли HTML
            </button>
          </div>

          {/* Info hint */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '11px 14px', borderRadius: 'var(--radius)', background: 'var(--brand-light)', border: '1px solid var(--brand-mid)' }}>
            <HiLightningBolt style={{ width: 13, height: 13, color: 'var(--brand)', flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: '0.77rem', color: 'var(--brand-dark)', lineHeight: 1.65, margin: 0 }}>
              <strong>Как работи:</strong> В <Link to="/analyze" style={{ color: 'var(--brand)', fontWeight: 700 }}>Анализиране</Link> качете CV, изчакайте AI анализ, след което изберете "Да, създай сайт" — AI попълва точно този шаблон с вашите данни.
            </p>
          </div>
        </div>
      </div>

      {/* ── All 4 in a grid below ── */}
      <div style={{ marginTop: 64 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem,3vw,1.5rem)', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 6 }}>
          Всички шаблони
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--ink-60)', marginBottom: 28 }}>Бърз преглед на четирите дизайна.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,280px), 1fr))', gap: 20 }}>
          {TEMPLATES.map(t => (
            <div
              key={t.id}
              onClick={() => { setActive(t.id); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              style={{
                borderRadius: 'var(--radius-xl)', overflow: 'hidden', cursor: 'pointer',
                border: `2px solid ${active === t.id ? t.accent : 'var(--border)'}`,
                boxShadow: active === t.id ? `0 0 0 3px ${t.accent}18, var(--shadow-lg)` : 'var(--shadow-sm)',
                transition: 'all 0.2s var(--ease-out)',
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `var(--shadow-xl)` }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = active === t.id ? `0 0 0 3px ${t.accent}18, var(--shadow-lg)` : 'var(--shadow-sm)' }}
            >
              {/* Mini preview */}
              <div style={{ height: 220, overflow: 'hidden', position: 'relative', background: t.dark ? '#141414' : '#f8fafc' }}>
                <div style={{ width: '200%', height: '200%', transformOrigin: 'top left', transform: 'scale(0.5)', pointerEvents: 'none' }}>
                  <TemplatePreview id={t.id} />
                </div>
                {active === t.id && (
                  <div style={{ position: 'absolute', top: 10, right: 10, background: t.accent, borderRadius: 99, padding: '3px 10px', fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>
                    Активен
                  </div>
                )}
              </div>
              {/* Footer */}
              <div style={{ padding: '12px 14px', background: 'var(--white)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ink)' }}>{t.name}</span>
                  <span style={{ marginLeft: 7, fontSize: '0.62rem', fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: `${t.tagColor}14`, color: t.tagColor }}>{t.tag}</span>
                </div>
                <HiColorSwatch style={{ width: 14, height: 14, color: t.accent }} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default Templates
