import { FaBrain, FaUsers, FaRocket, FaShieldAlt } from 'react-icons/fa'
import { HiSparkles, HiArrowRight } from 'react-icons/hi'
import { Link } from 'react-router-dom'

function About() {
  return (
    <div className="page-container" style={{ paddingTop: 'clamp(40px,6vw,72px)', paddingBottom: 'clamp(40px,6vw,72px)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 'clamp(48px,7vw,72px)' }}>
          <span className="chip chip-brand anim-fade-up" style={{ marginBottom: 16, display: 'inline-flex' }}>
            <HiSparkles style={{ width: 11, height: 11 }} />
            За нас
          </span>
          <h1 className="section-title anim-fade-up d-1" style={{ maxWidth: 560, margin: '0 0 16px' }}>
            Какво е Joblyze?
          </h1>
          <p className="anim-fade-up d-2" style={{
            fontSize: 'clamp(0.9375rem,2vw,1.0625rem)',
            color: 'var(--ink-60)',
            lineHeight: 1.75,
            maxWidth: 600,
          }}>
            Joblyze е платформа, задвижвана от изкуствен интелект, предназначена да помогне
            на специалистите по подбор на персонал и HR екипите да създават по-добри
            длъжностни характеристики и да намерят идеалните кандидати.
          </p>
        </div>

        {/* ── Mission ── */}
        <div className="card anim-fade-up d-2" style={{
          padding: 'clamp(24px,4vw,40px)',
          marginBottom: 20,
          display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap',
          background: 'linear-gradient(135deg,var(--brand-light) 0%,var(--white) 60%)',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: 'var(--brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-brand)', flexShrink: 0,
          }}>
            <HiSparkles style={{ width: 22, height: 22, color: '#fff' }} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 10 }}>
              Нашата мисия
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--ink-60)', lineHeight: 1.75 }}>
              Вярваме, че всяка организация заслужава достъп до интелигентни инструменти,
              които правят набирането на персонал по-справедливо, по-ефективно и
              по-приобщаващо. Нашите алгоритми анализират обявите за работа за яснота,
              приобщаване и ефективност.
            </p>
          </div>
        </div>

        {/* ── Feature grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,230px),1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { icon: FaBrain,      title: 'AI-задвижван',  desc: 'Gemini AI с поддръжка за стрийминг на резултати в реално време.', delay: 'd-3' },
            { icon: FaUsers,      title: 'За всички',     desc: 'За рекрутери, HR екипи и мениджъри без технически умения.',      delay: 'd-4' },
            { icon: FaRocket,     title: 'Бърз и лесен',  desc: 'Пълен анализ за секунди с конкретни приложими препоръки.',       delay: 'd-3' },
            { icon: FaShieldAlt,  title: 'Поверителност', desc: 'Документите ви не се съхраняват. Пълна поверителност.',          delay: 'd-4' },
          ].map(({ icon: Icon, title, desc, delay }) => (
            <div key={title} className={`card card-hover anim-fade-up ${delay}`} style={{ padding: 'clamp(20px,3vw,28px)', textAlign: 'center' }}>
              <div className="icon-box icon-box-sm" style={{ margin: '0 auto 14px' }}>
                <Icon style={{ width: 17, height: 17 }} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--ink)', marginBottom: 7 }}>{title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-60)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="card anim-fade-up d-5" style={{
          padding: 'clamp(28px,5vw,48px)',
          background: 'linear-gradient(135deg, var(--brand) 0%, #3b82f6 100%)',
          border: 'none',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.25rem,2.5vw,1.625rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: 10 }}>
              Готови ли сте да започнете?
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.72)', marginBottom: 28, lineHeight: 1.6 }}>
              Анализирайте резюмето си безплатно и получете персонализирана обратна връзка.
            </p>
            <Link to="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '12px 24px', background: '#fff', color: 'var(--brand)',
              borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '0.9rem',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)', textDecoration: 'none',
              transition: 'transform 0.18s',
            }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = ''}
            >
              <HiSparkles style={{ width: 15, height: 15 }} />
              Опитайте Joblyze
              <HiArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
