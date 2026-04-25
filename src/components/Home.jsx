import { Link } from 'react-router-dom'
import { HiArrowRight, HiLightningBolt, HiUsers, HiCheckCircle, HiUpload, HiSparkles, HiShieldCheck, HiChartBar } from 'react-icons/hi'
import { FaBrain } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

/* ── tiny inline components ── */
function StatPill({ val, label }) {
  return (
    <div style={{ textAlign: 'center', padding: '16px 24px', background: 'rgba(255,255,255,0.07)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.375rem,3vw,1.75rem)', color: '#fff', lineHeight: 1 }}>{val}</div>
      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', marginTop: 5, fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc, accent }) {
  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      padding: 'clamp(20px,3.5vw,28px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      boxShadow: 'var(--shadow-sm)',
      transition: 'transform 0.22s var(--ease), box-shadow 0.22s var(--ease), border-color 0.22s',
      cursor: 'default',
    }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.2)' }}
      onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border)' }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: accent || 'var(--brand-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon style={{ width: 20, height: 20, color: 'var(--brand)' }} />
      </div>
      <div>
        <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--ink)', marginBottom: 6 }}>{title}</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--ink-60)', lineHeight: 1.65 }}>{desc}</p>
      </div>
    </div>
  )
}

function StepRow({ n, icon: Icon, title, desc, isLast }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'var(--brand)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.875rem',
          boxShadow: 'var(--shadow-brand)', flexShrink: 0,
        }}>{n}</div>
        {!isLast && <div style={{ width: 1, flex: 1, minHeight: 28, background: 'var(--border)', margin: '6px 0' }} />}
      </div>
      <div style={{ paddingTop: 10, paddingBottom: isLast ? 0 : 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
          <Icon style={{ width: 14, height: 14, color: 'var(--brand)', flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--ink)' }}>{title}</span>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--ink-60)', lineHeight: 1.65 }}>{desc}</p>
      </div>
    </div>
  )
}

export default function Home() {
  const { user } = useAuth()

  return (
    <div>
      {/* ═══════════════════════════════════════════════════════════
          HERO — full-width gradient with centered content
      ═══════════════════════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #2563eb 100%)',
        padding: 'clamp(64px,9vw,120px) 0 clamp(56px,8vw,100px)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -120, right: -80, width: 500, height: 500, borderRadius: '50%', background: 'rgba(59,130,246,0.12)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -60, width: 400, height: 400, borderRadius: '50%', background: 'rgba(37,99,235,0.15)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        {/* Grid texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div className="anim-fade-up d-0" style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px 6px 8px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 999,
              backdropFilter: 'blur(8px)',
            }}>
              <span style={{ background: 'var(--brand)', borderRadius: 999, padding: '3px 8px', fontSize: '0.6875rem', fontWeight: 700, color: '#fff', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Ново
              </span>
              <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                Задвижван от Gemini AI
              </span>
              <HiSparkles style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.6)' }} />
            </div>
          </div>

          {/* Headline */}
          <h1 className="anim-fade-up d-1" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.375rem, 6vw, 4.5rem)',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.08,
            letterSpacing: '-0.035em',
            textAlign: 'center',
            margin: '0 auto 22px',
            maxWidth: 760,
          }}>
            Анализирайте резюметата
            <br />
            <span style={{
              background: 'linear-gradient(90deg, #93c5fd, #60a5fa, #a5b4fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              с изкуствен интелект
            </span>
          </h1>

          {/* Sub */}
          <p className="anim-fade-up d-2" style={{
            fontSize: 'clamp(1rem, 2vw, 1.1875rem)',
            color: 'rgba(255,255,255,0.65)',
            maxWidth: 530,
            margin: '0 auto 40px',
            lineHeight: 1.72,
            textAlign: 'center',
          }}>
            Качете CV, поставете описание на длъжността и получете персонализирана
            обратна връзка в секунди — безплатно.
          </p>

          {/* CTAs */}
          <div className="anim-fade-up d-3" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to={user ? '/analyze' : '/register'}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '15px 30px',
                background: '#fff',
                color: 'var(--brand)',
                borderRadius: 'var(--radius)',
                fontWeight: 700,
                fontSize: '0.9375rem',
                textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                transition: 'transform 0.18s var(--ease), box-shadow 0.18s',
                whiteSpace: 'nowrap',
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)' }}
              onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)' }}
            >
              {user ? 'Към анализатора' : 'Започни безплатно'}
              <HiArrowRight style={{ width: 17, height: 17 }} />
            </Link>
            {!user && (
              <Link to="/auth" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '15px 28px',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                borderRadius: 'var(--radius)',
                fontWeight: 600,
                fontSize: '0.9375rem',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)',
                transition: 'background 0.18s',
                whiteSpace: 'nowrap',
              }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.16)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                Вход
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="anim-fade-up d-4" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            marginTop: 56,
            flexWrap: 'wrap',
          }}>
            <StatPill val="98%"  label="Точност на анализа" />
            <StatPill val="<10с" label="Средно изчакване" />
            <StatPill val="6"    label="Категории обратна връзка" />
            <StatPill val="100%" label="Безплатно" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--canvas)', padding: 'clamp(64px,9vw,96px) 0' }}>
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p className="section-eyebrow anim-fade-up">Възможности</p>
            <h2 className="section-title anim-fade-up d-1" style={{ margin: '10px auto 14px', maxWidth: 500 }}>
              Всичко за успешно кандидатстване
            </h2>
            <p className="anim-fade-up d-2" style={{ fontSize: '1rem', color: 'var(--ink-60)', maxWidth: 440, margin: '0 auto' }}>
              Един инструмент — пълен анализ на вашето резюме спрямо всяка позиция.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,260px),1fr))', gap: 14 }}>
            <div className="anim-fade-up d-2">
              <FeatureCard icon={FaBrain} title="AI анализ на резюмето"
                desc="Gemini AI сравнява вашето резюме с длъжностното описание, открива съответствия, пропуски и дава конкретни препоръки." />
            </div>
            <div className="anim-fade-up d-3">
              <FeatureCard icon={HiUsers} title="Проверка за приобщаване"
                desc="Открива потенциално дискриминиращ език и помага за привличане на разнообразни таланти." />
            </div>
            <div className="anim-fade-up d-4">
              <FeatureCard icon={HiLightningBolt} title="Стрийминг в реално време"
                desc="Резултатите се появяват дума по дума — без чакане, веднага след старта на анализа." />
            </div>
            <div className="anim-fade-up d-3">
              <FeatureCard icon={HiChartBar} title="Оценка на съответствие"
                desc="Числова оценка от 1 до 10 показва колко добре резюмето пасва на конкретната позиция." />
            </div>
            <div className="anim-fade-up d-4">
              <FeatureCard icon={HiShieldCheck} title="Поверителност"
                desc="Документите ви не се съхраняват на нашите сървъри. Обработват се в реално време и се изтриват." />
            </div>
            <div className="anim-fade-up d-5">
              <FeatureCard icon={HiCheckCircle} title="Ключови думи и форматиране"
                desc="Получете списък с липсващи ключови думи и бележки за структурата и оформлението на CV-то." />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS — left steps + right visual
      ═══════════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--white)', padding: 'clamp(64px,9vw,96px) 0', borderTop: '1px solid var(--border)' }}>
        <div className="page-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,340px),1fr))', gap: 'clamp(40px,7vw,80px)', alignItems: 'center' }}>

            {/* Steps */}
            <div>
              <p className="section-eyebrow anim-fade-up">Как работи</p>
              <h2 className="section-title anim-fade-up d-1" style={{ marginBottom: 36 }}>
                Три стъпки до резултат
              </h2>
              <div className="anim-fade-up d-2">
                <StepRow n="01" icon={HiUpload} title="Качете резюмето" desc="Плъзнете PDF или TXT файл. Поддържаме до 10 MB без регистрация." />
                <StepRow n="02" icon={FaBrain} title="AI анализира" desc="Gemini обработва двата документа и открива всички ключови показатели." />
                <StepRow n="03" icon={HiCheckCircle} title="Получете доклада" isLast desc="Оценка, силни страни, ключови думи и конкретни препоръки за подобрение." />
              </div>
              <div className="anim-fade-up d-3" style={{ marginTop: 36 }}>
                <Link to={user ? '/analyze' : '/register'} className="btn-primary" style={{ padding: '13px 26px', fontSize: '0.9375rem' }}>
                  {user ? 'Анализирай сега' : 'Опитайте безплатно'}
                  <HiArrowRight style={{ width: 17, height: 17 }} />
                </Link>
              </div>
            </div>

            {/* Visual demo card */}
            <div className="anim-fade-up d-3">
              <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
                borderRadius: 'var(--radius-2xl)',
                padding: 'clamp(24px,4vw,36px)',
                boxShadow: '0 24px 60px rgba(15,23,42,0.25)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Decorative */}
                <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(37,99,235,0.2)', filter: 'blur(40px)' }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  {/* Mock header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaBrain style={{ width: 16, height: 16, color: '#fff' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#fff' }}>AI Анализ</div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)' }}>Обратна връзка · само сега</div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', animation: 'pulseDot 1.2s ease infinite' }} />
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Активен</span>
                    </div>
                  </div>

                  {/* Mock score */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Оценка на съответствие</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: '#4ade80', lineHeight: 1 }}>8.4</span>
                      <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)' }}>/10</span>
                    </div>
                    {/* Progress bar */}
                    <div style={{ marginTop: 10, height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                      <div style={{ width: '84%', height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #2563eb, #4ade80)' }} />
                    </div>
                  </div>

                  {/* Mock items */}
                  {[
                    { icon: '✓', text: 'React & TypeScript — пълно съответствие', color: '#4ade80' },
                    { icon: '✓', text: 'Node.js опит — налице', color: '#4ade80' },
                    { icon: '!', text: 'Липсва: GraphQL в резюмето', color: '#fbbf24' },
                    { icon: '!', text: 'Добавете: AWS или cloud опит', color: '#fbbf24' },
                  ].map(({ icon, text, color }) => (
                    <div key={text} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                      <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{text}</span>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.35)', animation: `pulseDot 1.2s ${i*0.2}s ease infinite` }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>AI генерира препоръки…</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA BANNER — only when logged out
      ═══════════════════════════════════════════════════════════ */}
      {!user && (
        <section style={{ background: 'var(--canvas)', padding: 'clamp(48px,7vw,80px) 0', borderTop: '1px solid var(--border)' }}>
          <div className="page-container">
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #2563eb 100%)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'clamp(40px,6vw,64px) clamp(24px,5vw,56px)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', filter: 'blur(60px)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -80, left: -30, width: 240, height: 240, borderRadius: '50%', background: 'rgba(37,99,235,0.12)', filter: 'blur(50px)', pointerEvents: 'none' }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 999, marginBottom: 20 }}>
                  <HiSparkles style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.7)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em' }}>100% Безплатно</span>
                </div>

                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.625rem, 4vw, 2.5rem)',
                  fontWeight: 800,
                  color: '#fff',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.12,
                  marginBottom: 14,
                }}>
                  Готови ли сте да подобрите<br />шансовете си?
                </h2>
                <p style={{ fontSize: 'clamp(0.9375rem, 2vw, 1.0625rem)', color: 'rgba(255,255,255,0.6)', marginBottom: 36, maxWidth: 440, margin: '0 auto 36px', lineHeight: 1.65 }}>
                  Присъединете се и получете AI анализ на резюмето си безплатно — без кредитна карта.
                </p>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link to="/register" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '15px 30px', background: '#fff', color: 'var(--brand)',
                    borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '0.9375rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.25)', textDecoration: 'none',
                    transition: 'transform 0.18s var(--ease), box-shadow 0.18s',
                    whiteSpace: 'nowrap',
                  }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)' }}
                    onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)' }}
                  >
                    <HiSparkles style={{ width: 16, height: 16 }} />
                    Регистрирайте се безплатно
                    <HiArrowRight style={{ width: 15, height: 15 }} />
                  </Link>
                  <Link to="/auth" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '15px 26px',
                    background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.85)',
                    borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.9375rem',
                    border: '1px solid rgba(255,255,255,0.15)', textDecoration: 'none',
                    transition: 'background 0.18s',
                    whiteSpace: 'nowrap',
                  }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  >
                    Вече имам акаунт
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
