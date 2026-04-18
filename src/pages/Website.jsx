/**
 * Website.jsx
 * Kajol Makeover Studioz — Public Portfolio / Landing Page
 *
 * Fixes applied:
 *  1. Instagram widget embedded in Gallery section
 *  2. "ArtWork" → "Ariwork" everywhere
 *  3. About/Courses/Gallery/Reviews content can be edited from admin via Supabase site_content table
 *  4. "Ariwork" used consistently throughout
 *
 * Route: /
 */

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

/* ── Supabase (for fetching editable content) ── */
const SB_URL = import.meta.env.VITE_SUPABASE_URL  || 'https://zlzrdpagpwlrbljfmxzy.supabase.co'
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_6_AujeG9DfoPxMELnkGCeQ_08K3XEF4'
const sb = createClient(SB_URL, SB_KEY)

/* ── Brand constants ── */
const C = {
  pink: '#E91E8C', pinkD: '#C2185B', pinkPale: '#FCE4EC',
  green: '#2E7D32', greenL: '#4CAF50', greenPale: '#E8F5E9',
  white: '#FFFFFF', offWhite: '#FFF8FB', grey: '#757575', greyL: '#F5F5F5',
  dark: '#1A1A2E', amber: '#FF6F00',
  wa: '#25D366', yt: '#FF0000', ig: '#E91E63',
}

const ENROLL_URL   = 'https://kajol-makeover-studioz.vercel.app/enroll'
const WA_COMMUNITY = 'https://chat.whatsapp.com/Lhq5qzRYJ0z11onVX669a3'
const INSTAGRAM    = 'https://www.instagram.com/kajol_makeover_studioz?igsh=a3h2ZWIzbmM3M3Y3'
const YOUTUBE      = 'https://youtube.com/@kajolmakeoverstudioz?si=IsWwx4ScqJ33ZAqp'
const ADMIN_URL    = '/app'

/* ── Inline SVG icon helper ── */
function Ic({ path, size = 20, color = 'currentColor', extra = null }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}>
      <path d={path} />
      {extra}
    </svg>
  )
}

/* ── Global styles ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Nunito', 'Segoe UI', sans-serif; background: #FFF8FB; color: #1A1A2E; }
  a { -webkit-tap-highlight-color: transparent; }
  button { -webkit-tap-highlight-color: transparent; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  .fade-in { animation: fadeInUp .6s ease both; }
  .float-emoji { animation: float 3s ease-in-out infinite; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: #FCE4EC; border-radius: 4px; }

  /* EmbedSocial Instagram widget overrides */
  .embedsocial-hashtag { margin: 0 auto; max-width: 860px; }

  /* Responsive nav */
  @media (max-width: 768px) {
    #desktop-nav { display: none !important; }
    #hamburger-btn { display: block !important; }
    .about-grid { grid-template-columns: 1fr !important; }
    .stats-grid  { grid-template-columns: repeat(2,1fr) !important; }
    .courses-grid{ grid-template-columns: 1fr !important; }
    .reviews-grid{ grid-template-columns: 1fr !important; }
  }
`

/* ── Section wrapper ── */
function Section({ id, children, bg = '#FFF8FB', style: sx }) {
  return (
    <section id={id} style={{ background: bg, padding: '60px 16px', ...sx }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {children}
      </div>
    </section>
  )
}

function SectionTitle({ emoji, title, subtitle, light }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 36 }}>
      {emoji && <div style={{ fontSize: 40, marginBottom: 8 }}>{emoji}</div>}
      <h2 style={{ fontSize: 26, fontWeight: 900, color: light ? '#fff' : C.dark, marginBottom: 8 }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: 14, color: light ? 'rgba(255,255,255,0.82)' : C.grey, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

/* ── Course card ── */
function CourseCard({ emoji, title, desc, color, items }) {
  return (
    <div style={{
      background: C.white, borderRadius: 20, padding: 22,
      boxShadow: '0 4px 20px rgba(233,30,140,0.08)',
      border: `1px solid ${C.pinkPale}`, borderTop: `4px solid ${color}`,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ fontSize: 36 }}>{emoji}</div>
      <div style={{ fontSize: 17, fontWeight: 900, color: C.dark }}>{title}</div>
      <div style={{ fontSize: 13, color: C.grey, lineHeight: 1.7 }}>{desc}</div>
      <ul style={{ paddingLeft: 18, color: C.grey, fontSize: 13, lineHeight: 2 }}>
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  )
}

/* ── Testimonial card ── */
function TestimonialCard({ name, role, text, initial, color }) {
  return (
    <div style={{
      background: C.white, borderRadius: 20, padding: 20,
      boxShadow: '0 4px 16px rgba(233,30,140,0.07)',
      border: `1px solid ${C.pinkPale}`,
    }}>
      <div style={{ fontSize: 28, color: color, marginBottom: 10, fontWeight: 900, lineHeight: 1 }}>"</div>
      <p style={{ fontSize: 13, color: C.dark, lineHeight: 1.8, marginBottom: 14, fontStyle: 'italic' }}>{text}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: `linear-gradient(135deg, ${color}, ${color}99)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 900, fontSize: 16, flexShrink: 0,
        }}>{initial}</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 13, color: C.dark }}>{name}</div>
          <div style={{ fontSize: 11, color: C.grey }}>{role}</div>
        </div>
      </div>
    </div>
  )
}

/* ── Stat badge ── */
function Stat({ value, label, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 32, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{label}</div>
    </div>
  )
}

/* ── Instagram EmbedSocial Widget ── */
function InstagramWidget() {
  useEffect(() => {
    // Inject EmbedSocial script only once
    if (!document.getElementById('EmbedSocialHashtagScript')) {
      const s = document.createElement('script')
      s.id  = 'EmbedSocialHashtagScript'
      s.src = 'https://embedsocial.com/cdn/ht.js'
      document.head.appendChild(s)
    }
  }, [])

  return (
    <div style={{ margin: '32px 0' }}>
      {/* EmbedSocial Instagram widget — ref from insta_code.txt */}
      <div
        className="embedsocial-hashtag"
        data-ref="8217faf2e6a10da81e70e2c5d776d43a2ad63ca1"
        data-lazyload="yes"
      >
        <a
          className="feed-powered-by-es feed-powered-by-es-feed-img es-widget-branding"
          href="https://embedsocial.com/instagram-widget/"
          target="_blank"
          rel="noopener noreferrer"
          title="Instagram widget"
        >
          <img src="https://embedsocial.com/cdn/icon/embedsocial-logo.webp" alt="EmbedSocial" />
          <div className="es-widget-branding-text">Instagram widget</div>
        </a>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function Website() {
  const [menuOpen, setMenuOpen] = useState(false)

  /* ── Editable content fetched from Supabase site_content table ── */
  const [siteContent, setSiteContent] = useState({})

  useEffect(() => {
    sb.from('site_content').select('*').then(({ data }) => {
      if (data) {
        const map = {}
        data.forEach(row => { map[row.key] = row.value })
        setSiteContent(map)
      }
    })
  }, [])

  // Helper: get editable value or fall back to default
  const sc = (key, fallback) => siteContent[key] || fallback

  const navLinks = [
    { href: '#about',   label: 'About'   },
    { href: '#courses', label: 'Courses' },
    { href: '#gallery', label: 'Gallery' },
    { href: '#reviews', label: 'Reviews' },
    { href: '#contact', label: 'Contact' },
  ]

  /* ── Dynamic reviews from site_content or defaults ── */
  const defaultReviews = [
    { name: 'Priya Sharma',    role: 'Homemaker · Mehndi Student',          initial: 'P', color: C.pink,
      text: "Kajol Ma'am is such a patient and detailed teacher. I could never draw a proper cone before, and now I do full bridal hands! The recorded classes are a bonus." },
    { name: 'Sneha Patil',     role: 'Working Professional · Makeup Student', initial: 'S', color: C.green,
      text: "The live Zoom classes fit perfectly into my schedule. I learned more in one month than I did watching random YouTube videos for a year!" },
    { name: 'Ritika Nair',     role: 'College Student · Ariwork Student',     initial: 'R', color: '#6A1B9A',
      text: "The mandala and resin art sessions were absolutely amazing. Kajol Ma'am breaks everything down so simply. I sold my first artwork within a week!" },
    { name: 'Aarti Kulkarni',  role: 'Salon Owner · Combined Course',         initial: 'A', color: C.amber,
      text: "Taking the combined course was the best investment for my salon. I upskilled in all three areas and now offer bridal packages. Highly recommended!" },
  ]

  let reviews = defaultReviews
  try {
    const parsed = JSON.parse(sc('reviews_json', '[]'))
    if (Array.isArray(parsed) && parsed.length > 0) reviews = parsed
  } catch {}

  return (
    <div>
      <style>{CSS}</style>

      {/* ── NAVBAR ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 500,
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.pinkPale}`,
        boxShadow: '0 2px 16px rgba(233,30,140,0.08)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: `linear-gradient(135deg, ${C.pink}, ${C.pinkD})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>💄</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: C.dark, lineHeight: 1.1 }}>Kajol Makeover</div>
              <div style={{ fontSize: 10, color: C.grey }}>Studioz</div>
            </div>
          </a>

          {/* Desktop nav */}
          <nav id="desktop-nav" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {navLinks.map(l => (
              <a key={l.href} href={l.href}
                style={{ padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: C.grey, textDecoration: 'none', transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = C.pink; e.currentTarget.style.background = C.pinkPale }}
                onMouseLeave={e => { e.currentTarget.style.color = C.grey;  e.currentTarget.style.background = 'transparent' }}>
                {l.label}
              </a>
            ))}
            <a href={ENROLL_URL} style={{
              marginLeft: 8, padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 800,
              background: `linear-gradient(135deg, ${C.pink}, ${C.pinkD})`,
              color: '#fff', textDecoration: 'none', boxShadow: `0 4px 14px ${C.pink}55`,
            }}>Enroll Now</a>
            <a href={ADMIN_URL} style={{
              marginLeft: 4, padding: '8px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              border: `1.5px solid ${C.pink}`, color: C.pink, textDecoration: 'none',
            }}>🔒 Admin</a>
          </nav>

          {/* Mobile hamburger */}
          <button id="hamburger-btn" onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: 'none', background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: C.pink }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: C.white, borderTop: `1px solid ${C.pinkPale}`, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navLinks.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                style={{ padding: '10px 14px', borderRadius: 10, fontSize: 14, fontWeight: 700, color: C.dark, textDecoration: 'none' }}>
                {l.label}
              </a>
            ))}
            <a href={ENROLL_URL}
              style={{ padding: '12px 14px', borderRadius: 12, fontSize: 14, fontWeight: 800, background: `linear-gradient(135deg, ${C.pink}, ${C.pinkD})`, color: '#fff', textDecoration: 'none', textAlign: 'center', marginTop: 6 }}>
              🌸 Enroll Now
            </a>
            <a href={ADMIN_URL}
              style={{ padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, color: C.pink, textDecoration: 'none', textAlign: 'center' }}>
              🔒 Admin Login
            </a>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section style={{
        background: `linear-gradient(145deg, ${C.pink} 0%, ${C.pinkD} 40%, ${C.green} 100%)`,
        padding: '72px 16px 80px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -60, right: -30, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
          <div className="float-emoji" style={{ fontSize: 72, marginBottom: 16 }}>💄</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1.25, marginBottom: 12, textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
            Kajol Makeover Studioz
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', lineHeight: 1.7, marginBottom: 8 }}>
            Online courses in <strong>Mehndi · Makeup · Ariwork</strong>
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: 32 }}>
            {sc('hero_tagline', "Learn from Kajol J Kamble — professional artist & passionate teacher. Live Zoom classes + recorded YouTube sessions.")}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={ENROLL_URL} style={{
              padding: '14px 28px', borderRadius: 14, fontWeight: 800, fontSize: 15,
              background: '#fff', color: C.pink, textDecoration: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}>🌸 Enroll Free</a>
            <a href="#courses" style={{
              padding: '14px 28px', borderRadius: 14, fontWeight: 700, fontSize: 15,
              background: 'rgba(255,255,255,0.18)', color: '#fff',
              border: '2px solid rgba(255,255,255,0.4)', textDecoration: 'none',
            }}>View Courses →</a>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div style={{ background: `linear-gradient(90deg, ${C.pinkD}, ${C.green})`, padding: '24px 16px' }}>
        <div className="stats-grid" style={{ maxWidth: 700, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          <Stat value={sc('stat_students', '200+')} label="Students Trained"  color="#fff" />
          <Stat value={sc('stat_courses',  '3')}    label="Expert Courses"    color="#fff" />
          <Stat value={sc('stat_classes',  '50+')}  label="Classes Delivered" color="#fff" />
          <Stat value="100%"                         label="Online Comfort"   color="#fff" />
        </div>
      </div>

      {/* ── ABOUT ── */}
      <Section id="about">
        <div className="about-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
          {/* Avatar side */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 160, height: 160, borderRadius: '50%', margin: '0 auto 16px',
              background: `linear-gradient(135deg, ${C.pink}, ${C.pinkD})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 72, boxShadow: `0 12px 36px ${C.pink}44`, border: `6px solid ${C.pinkPale}`,
            }}>💄</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: C.dark }}>Kajol J Kamble</div>
            <div style={{ fontSize: 13, color: C.grey, marginTop: 4 }}>Mehndi · Makeup · Ariwork Artist</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
              {[
                { label: 'WhatsApp', url: WA_COMMUNITY, bg: C.wa },
                { label: 'Instagram', url: INSTAGRAM,   bg: C.ig },
                { label: 'YouTube',   url: YOUTUBE,     bg: C.yt },
              ].map(s => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer"
                  style={{ padding: '6px 14px', borderRadius: 20, background: s.bg, color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Bio side */}
          <div>
            <div style={{ display: 'inline-block', background: C.pinkPale, color: C.pink, borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
              About Me
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: C.dark, lineHeight: 1.3, marginBottom: 14 }}>
              {sc('about_headline', 'Passionate Artist.\nDedicated Teacher.').split('\n').map((line, i) => (
                <span key={i}>{line}{i === 0 ? <br /> : ''}</span>
              ))}
            </h2>
            <p style={{ fontSize: 14, color: C.grey, lineHeight: 1.8, marginBottom: 12 }}>
              {sc('about_para1', "Hi! I'm Kajol, a professional Mehndi, Makeup, and Ariwork artist with years of experience working with brides, events, and art enthusiasts across India. My mission is to help you discover your creative potential — from home, at your own pace.")}
            </p>
            <p style={{ fontSize: 14, color: C.grey, lineHeight: 1.8, marginBottom: 20 }}>
              {sc('about_para2', "All my courses are conducted live on Zoom with recordings uploaded to YouTube, so you never miss a session. Whether you're a complete beginner or looking to polish your skills, there's a course for you here.")}
            </p>
            <a href={ENROLL_URL} style={{
              display: 'inline-block', padding: '12px 24px', borderRadius: 12, fontWeight: 800, fontSize: 14,
              background: `linear-gradient(135deg, ${C.pink}, ${C.pinkD})`,
              color: '#fff', textDecoration: 'none', boxShadow: `0 6px 18px ${C.pink}44`,
            }}>🌸 Enroll in a Course</a>
          </div>
        </div>
      </Section>

      {/* ── COURSES ── */}
      <Section id="courses" bg={C.greyL}>
        <SectionTitle emoji="📚" title="Our Courses"
          subtitle={sc('courses_subtitle', 'Professional-level training from the comfort of your home. Live Zoom + YouTube recordings.')} />
        <div className="courses-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          <CourseCard
            emoji="🌿" title="Mehndi Art" color={C.green}
            desc={sc('course_mehndi_desc', 'From traditional bridal designs to modern Arabic patterns — learn step by step with daily practice sheets.')}
            items={sc('course_mehndi_items', 'Basic & advanced patterns|Bridal & Arabic designs|Cone making & filling|Practice sheets included|Certificate on completion').split('|')}
          />
          <CourseCard
            emoji="💄" title="Makeup Course" color={C.pink}
            desc={sc('course_makeup_desc', 'Everyday glam to bridal looks — master professional makeup techniques used by top artists.')}
            items={sc('course_makeup_items', 'Skin prep & base makeup|Eye makeup & contouring|Bridal & party looks|Airbrush introduction|Kit guidance & product tips').split('|')}
          />
          <CourseCard
            emoji="🎨" title="Ariwork Course" color="#6A1B9A"
            desc={sc('course_ariwork_desc', 'Unleash your creativity with canvas painting, mandala art, resin, and decorative crafts.')}
            items={sc('course_ariwork_items', 'Mandala & dot art|Canvas painting|Resin art basics|Warli & folk art|DIY home décor projects').split('|')}
          />
          <CourseCard
            emoji="✨" title="Combined Course" color={C.amber}
            desc={sc('course_combined_desc', "Get the best of all three courses at a special bundled fee. Perfect for aspiring freelancers.")}
            items={sc('course_combined_items', "Mehndi + Makeup + Ariwork|Flexible batch timings|Special bundle pricing|Priority support from Kajol Ma'am|Freelance career guidance").split('|')}
          />
        </div>
      </Section>

      {/* ── HOW IT WORKS ── */}
      <Section id="how">
        <SectionTitle emoji="✅" title="How It Works"
          subtitle="Getting started is easy — just 3 simple steps." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          {[
            { n: '1', icon: '📲', title: 'Fill the Form', desc: 'Submit the free enrollment form with your details and course preference.' },
            { n: '2', icon: '📩', title: 'Get Confirmed', desc: "Kajol Ma'am reviews your form and contacts you on WhatsApp with batch details." },
            { n: '3', icon: '🎓', title: 'Start Learning', desc: 'Join live Zoom classes, watch recordings on YouTube, and practice daily!' },
          ].map(s => (
            <div key={s.n} style={{ textAlign: 'center', background: C.white, borderRadius: 20, padding: 24, boxShadow: '0 4px 14px rgba(233,30,140,0.07)', border: `1px solid ${C.pinkPale}` }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${C.pink}, ${C.pinkD})`, color: '#fff', fontWeight: 900, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>{s.n}</div>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.dark, marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: C.grey, lineHeight: 1.7 }}>{s.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <a href={ENROLL_URL} style={{
            display: 'inline-block', padding: '14px 32px', borderRadius: 14, fontWeight: 800, fontSize: 15,
            background: `linear-gradient(135deg, ${C.pink}, ${C.pinkD})`,
            color: '#fff', textDecoration: 'none', boxShadow: `0 6px 20px ${C.pink}44`,
          }}>🌸 Start Your Enrollment</a>
        </div>
      </Section>

      {/* ── GALLERY ── */}
      <Section id="gallery" bg={C.pinkPale}>
        <SectionTitle emoji="🖼️" title="Our Work"
          subtitle={sc('gallery_subtitle', 'A glimpse of the beautiful art our students and Kajol Ma\'am create!')} />

        {/* ── Emoji art grid (placeholder until real photos are uploaded) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12, marginBottom: 16 }}>
          {['🌿', '💄', '🎨', '🌸', '👰', '✨', '🌺', '💅', '🎭', '🌼', '👁️', '🎀'].map((e, i) => (
            <div key={i} style={{
              aspectRatio: '1', borderRadius: 16,
              background: `linear-gradient(135deg, ${[C.pink, C.green, '#6A1B9A', C.amber, C.pink + '99', C.green + '99'][i % 6]}22, ${C.pinkPale})`,
              border: `1px solid ${C.pinkPale}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44,
              boxShadow: '0 2px 10px rgba(233,30,140,0.08)',
            }}>{e}</div>
          ))}
        </div>

        {/* ── LIVE Instagram Feed via EmbedSocial ── */}
        <div style={{
          background: C.white, borderRadius: 20, padding: '24px 16px',
          boxShadow: '0 4px 20px rgba(233,30,140,0.08)', border: `1px solid ${C.pinkPale}`,
          marginBottom: 20,
        }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg,${C.ig},#C2185B)`, borderRadius: 20, padding: '6px 16px', color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
              📸 Live Instagram Feed
            </div>
            <p style={{ fontSize: 12, color: C.grey }}>Latest reels &amp; posts from <strong>@kajol_makeover_studioz</strong></p>
          </div>
          <InstagramWidget />
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 20, background: `linear-gradient(135deg,${C.ig},#C2185B)`, color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>
              📸 Follow @kajol_makeover_studioz
            </a>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: C.grey }}>
          Also watch tutorials on&nbsp;
          <a href={YOUTUBE} target="_blank" rel="noopener noreferrer" style={{ color: C.yt, fontWeight: 700 }}>YouTube</a>
        </p>
      </Section>

      {/* ── TESTIMONIALS / REVIEWS ── */}
      <Section id="reviews">
        <SectionTitle emoji="⭐" title="What Students Say"
          subtitle={sc('reviews_subtitle', 'Real words from real learners who transformed their skills with us.')} />
        <div className="reviews-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
          {reviews.map((r, i) => (
            <TestimonialCard key={i}
              name={r.name} role={r.role} text={r.text}
              initial={r.initial || r.name[0]} color={r.color || C.pink}
            />
          ))}
        </div>
      </Section>

      {/* ── COMMUNITY ── */}
      <Section bg={`linear-gradient(135deg, ${C.green}, #1B5E20)`} style={{ padding: '56px 16px' }}>
        <SectionTitle emoji="🌐" title="Join Our Community" subtitle={null} light />
        <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, marginBottom: 28, maxWidth: 500, margin: '0 auto 28px' }}>
          {sc('community_text', 'Connect with 200+ students on WhatsApp, get daily tips, and stay updated on new batches.')}
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: '🟢 Join WhatsApp Community', url: WA_COMMUNITY, bg: C.wa },
            { label: '📸 Follow on Instagram',     url: INSTAGRAM,   bg: C.ig },
            { label: '▶ Subscribe on YouTube',     url: YOUTUBE,     bg: C.yt },
          ].map(l => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
              style={{ padding: '13px 22px', borderRadius: 14, background: l.bg, color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
              {l.label}
            </a>
          ))}
        </div>
      </Section>

      {/* ── CONTACT / ENROLL CTA ── */}
      <Section id="contact" bg={C.offWhite}>
        <div style={{ background: `linear-gradient(135deg, ${C.pink}, ${C.pinkD})`, borderRadius: 24, padding: '44px 24px', textAlign: 'center', boxShadow: `0 16px 48px ${C.pink}44` }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🌸</div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 12 }}>
            {sc('cta_headline', 'Ready to Start Your Journey?')}
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.88)', lineHeight: 1.8, marginBottom: 28, maxWidth: 440, margin: '0 auto 28px' }}>
            {sc('cta_subtext', "Fill our free enrollment form today and get a personal reply from Kajol Ma'am on WhatsApp within 24 hours.")}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={ENROLL_URL} style={{
              padding: '14px 30px', borderRadius: 14, fontWeight: 800, fontSize: 15,
              background: '#fff', color: C.pink, textDecoration: 'none', boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
            }}>🌸 Enroll Now — It's Free</a>
            <a href={WA_COMMUNITY} target="_blank" rel="noopener noreferrer" style={{
              padding: '14px 30px', borderRadius: 14, fontWeight: 700, fontSize: 15,
              background: 'rgba(255,255,255,0.18)', color: '#fff',
              border: '2px solid rgba(255,255,255,0.4)', textDecoration: 'none',
            }}>💬 Ask on WhatsApp</a>
          </div>
        </div>
      </Section>

      {/* ── FOOTER ── */}
      <footer style={{ background: C.dark, color: '#fff', padding: '36px 16px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 28, marginBottom: 28 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ fontSize: 28 }}>💄</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900 }}>Kajol Makeover Studioz</div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>Online Beauty Education</div>
                </div>
              </div>
              <p style={{ fontSize: 12, opacity: 0.7, lineHeight: 1.8 }}>
                Professional Mehndi, Makeup &amp; Ariwork courses taught live online by Kajol J Kamble.
              </p>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12, color: C.pink }}>Quick Links</div>
              {[
                { label: 'Enroll Now',   href: ENROLL_URL },
                { label: 'About',        href: '#about'   },
                { label: 'Courses',      href: '#courses' },
                { label: 'Gallery',      href: '#gallery' },
                { label: 'Reviews',      href: '#reviews' },
                { label: 'Admin Login',  href: ADMIN_URL  },
              ].map(l => (
                <a key={l.label} href={l.href}
                  style={{ display: 'block', fontSize: 13, opacity: 0.75, textDecoration: 'none', color: '#fff', marginBottom: 6, lineHeight: 1.6 }}>
                  → {l.label}
                </a>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12, color: C.pink }}>Follow Us</div>
              {[
                { label: 'WhatsApp Community', url: WA_COMMUNITY, color: C.wa },
                { label: 'Instagram',          url: INSTAGRAM,   color: C.ig },
                { label: 'YouTube Channel',    url: YOUTUBE,     color: C.yt },
              ].map(s => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', fontSize: 13, color: s.color, textDecoration: 'none', marginBottom: 8, fontWeight: 700 }}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 12, opacity: 0.6 }}>© 2025 Kajol Makeover Studioz. All rights reserved.</div>
            <a href={ADMIN_URL} style={{ fontSize: 11, opacity: 0.4, color: '#fff', textDecoration: 'none' }}>🔒 Admin</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
