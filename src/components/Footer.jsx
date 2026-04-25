import { Link } from 'react-router-dom'
import { HiHome, HiChartBar, HiInformationCircle, HiMail, HiTemplate } from 'react-icons/hi'
import { FaBrain, FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="page-container" style={{ paddingTop: 'clamp(40px,6vw,64px)', paddingBottom: 'clamp(24px,4vw,40px)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,180px),1fr))',
          gap: 'clamp(28px,5vw,48px)',
          marginBottom: 40,
        }}>
          {/* Brand */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaBrain style={{ width: 14, height: 14, color: '#fff' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.0625rem', color: '#fff' }}>Joblyze</span>
            </Link>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.65, marginBottom: 20, maxWidth: 220 }}>
              AI платформа за анализ на резюмета и обяви за работа.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { href: 'https://github.com/DenisBG312', Icon: FaGithub, label: 'GitHub' },
                { href: 'https://www.linkedin.com/in/denis-tsranski/', Icon: FaLinkedin, label: 'LinkedIn' },
                { href: 'https://twitter.com', Icon: FaTwitter, label: 'Twitter' },
              ].map(({ href, Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="footer-link"
                  style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: 'rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.08)',
                    transition: 'background 0.15s, color 0.15s', flexShrink: 0,
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = '#fff' }}
                  onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
                >
                  <Icon style={{ width: 14, height: 14 }} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div>
            <p className="footer-title">Навигация</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { to: '/',          label: 'Начало',     Icon: HiHome },
                { to: '/analyze',   label: 'Анализиране', Icon: HiChartBar },
                { to: '/templates', label: 'Шаблони',    Icon: HiTemplate },
                { to: '/about',     label: 'За нас',     Icon: HiInformationCircle },
              ].map(({ to, label, Icon }) => (
                <li key={to}>
                  <Link to={to} className="footer-link">
                    <Icon style={{ width: 14, height: 14 }} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="footer-title">Ресурси</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Документация', 'API Референция', 'Често задавани въпроси', 'Поддръжка'].map(item => (
                <li key={item}>
                  <a href="#" className="footer-link">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="footer-title">Контакт</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li>
                <a href="mailto:contact@joblyze.com" className="footer-link">
                  <HiMail style={{ width: 14, height: 14 }} />
                  contact@joblyze.com
                </a>
              </li>
              <li style={{ fontSize: '0.875rem' }}>Русе, България</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <p style={{ fontSize: '0.8125rem' }}>© {year} Joblyze. Всички права запазени.</p>
          <p style={{ fontSize: '0.8125rem' }}>Направено с ❤ в България</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
