/**
 * Website.jsx  — Kajol Makeover Studioz  v4.0
 *
 * Changes in this version:
 *  1. Instagram widget moved → between Hero & About sections
 *  2. YouTube playlist widget added → below Instagram strip
 *  3. "Our Work" gallery → shows real uploaded photos from Supabase (admin can upload URLs)
 *  4. "What Students Say" → supports photo, WhatsApp screenshot, video feedback cards
 *  5. New SVG logo — mehndi/embroidery/makeup inspired, fully custom
 *
 * Route: /   (served via App.jsx router)
 */

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

/* ── Supabase ── */
const SB_URL = import.meta.env.VITE_SUPABASE_URL  || 'https://zlzrdpagpwlrbljfmxzy.supabase.co'
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_6_AujeG9DfoPxMELnkGCeQ_08K3XEF4'
const sb = createClient(SB_URL, SB_KEY)

/* ── Brand ── */
const C = {
  pink:'#E91E8C', pinkD:'#C2185B', pinkPale:'#FCE4EC',
  green:'#2E7D32', greenL:'#4CAF50', greenPale:'#E8F5E9',
  white:'#FFFFFF', offWhite:'#FFF8FB', grey:'#757575', greyL:'#F5F5F5',
  dark:'#1A1A2E', amber:'#FF6F00', purple:'#6A1B9A',
  wa:'#25D366', yt:'#FF0000', ig:'#E91E63',
}

const ENROLL_URL      = 'https://kajol-makeover-studioz.vercel.app/enroll'
const WA_COMMUNITY    = 'https://chat.whatsapp.com/Lhq5qzRYJ0z11onVX669a3'
const INSTAGRAM       = 'https://www.instagram.com/kajol_makeover_studioz?igsh=a3h2ZWIzbmM3M3Y3'
const YOUTUBE         = 'https://youtube.com/@kajolmakeoverstudioz?si=IsWwx4ScqJ33ZAqp'
// ★ Replace PLAYLIST_ID with your actual YouTube playlist ID
// How to find it: Go to YouTube → Your Channel → Playlists → Click playlist → copy ID from URL after "list="
const YT_PLAYLIST_ID  = 'PLxxxxxxxxxxxxxxxxx'   // ← REPLACE THIS
const ADMIN_URL       = '/app'

/* ═══════════════════════════════════════════════════════════════════
   LOGO  — mehndi mandala + makeup brush + embroidery inspired SVG
═══════════════════════════════════════════════════════════════════ */
function KMSLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* outer petal ring — mehndi mandala petals */}
      {[0,45,90,135,180,225,270,315].map((deg, i) => (
        <ellipse key={i}
          cx={40} cy={40} rx={6} ry={14}
          fill={i % 2 === 0 ? C.pink : C.pinkD}
          opacity="0.75"
          transform={`rotate(${deg} 40 40) translate(0 -20)`}
        />
      ))}
      {/* middle embroidery ring — small dots */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        const x = 40 + 22 * Math.cos(rad)
        const y = 40 + 22 * Math.sin(rad)
        return <circle key={i} cx={x} cy={y} r={2.2} fill={i%3===0?C.green:C.greenL} opacity="0.85"/>
      })}
      {/* inner filled circle — makeup compact */}
      <circle cx={40} cy={40} r={16} fill={`url(#kmsGrad)`}/>
      {/* makeup brush stroke across circle */}
      <path d="M32 36 Q40 32 48 36 Q40 40 32 36Z" fill="rgba(255,255,255,0.35)"/>
      {/* lipstick dot */}
      <circle cx={40} cy={42} r={4} fill="#fff" opacity="0.9"/>
      <circle cx={40} cy={42} r={2} fill={C.pink}/>
      {/* gradient def */}
      <defs>
        <radialGradient id="kmsGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor={C.pinkD}/>
          <stop offset="100%" stopColor="#7B1FA2"/>
        </radialGradient>
      </defs>
    </svg>
  )
}

/* ── Small inline logo text mark ── */
function LogoMark({ dark: isDark = true }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:9 }}>
      <KMSLogo size={40}/>
      <div>
        <div style={{
          fontSize: 13, fontWeight: 900, letterSpacing: 0.3, lineHeight: 1.15,
          background: isDark ? `linear-gradient(135deg,${C.pink},${C.pinkD})` : 'linear-gradient(135deg,#fff,#FFD6EC)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          fontFamily: "'Playfair Display', serif",
        }}>Kajol Makeover</div>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: 2.5, color: isDark ? C.grey : 'rgba(255,255,255,0.75)',
          textTransform:'uppercase',
        }}>S T U D I O Z</div>
      </div>
    </div>
  )
}

/* ── Large hero logo ── */
function HeroLogo() {
  return (
    <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', gap:6 }}>
      <KMSLogo size={88}/>
      <div style={{
        fontSize: 32, fontWeight: 900, color:'#fff',
        fontFamily:"'Playfair Display',serif",
        textShadow:'0 2px 16px rgba(0,0,0,0.3)',
        letterSpacing:1,
      }}>Kajol Makeover<br/><span style={{fontSize:20,letterSpacing:5,opacity:.9}}>S T U D I O Z</span></div>
    </div>
  )
}

/* ── Global CSS ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Nunito', 'Segoe UI', sans-serif; background: #FFF8FB; color: #1A1A2E; }
  a { -webkit-tap-highlight-color: transparent; }
  button { -webkit-tap-highlight-color: transparent; }
  @keyframes fadeInUp { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
  @keyframes float    { 0%,100%{transform:translateY(0);}  50%{transform:translateY(-10px);} }
  @keyframes spinSlow { to { transform:rotate(360deg); } }
  @keyframes shimmer  { 0%{opacity:.6} 50%{opacity:1} 100%{opacity:.6} }
  .fade-in  { animation: fadeInUp .65s ease both; }
  .logo-spin{ animation: spinSlow 18s linear infinite; }
  .shimmer  { animation: shimmer 2.5s ease-in-out infinite; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:#FCE4EC; border-radius:4px; }
  .embedsocial-hashtag { margin:0 auto; }
  .gallery-img { transition:transform .25s,box-shadow .25s; }
  .gallery-img:hover { transform:scale(1.04); box-shadow:0 12px 32px rgba(233,30,140,0.22)!important; }
  .review-card { transition:transform .2s,box-shadow .2s; }
  .review-card:hover { transform:translateY(-4px); box-shadow:0 14px 40px rgba(233,30,140,0.13)!important; }
  @media(max-width:768px){
    #desktop-nav { display:none!important; }
    #hamburger-btn { display:block!important; }
    .about-grid { grid-template-columns:1fr!important; }
    .stats-grid  { grid-template-columns:repeat(2,1fr)!important; }
    .courses-grid{ grid-template-columns:1fr!important; }
    .reviews-grid{ grid-template-columns:1fr!important; }
    .gallery-grid{ grid-template-columns:repeat(2,1fr)!important; }
    .hero-title  { font-size:26px!important; }
  }
`

/* ── Section ── */
function Section({ id, children, bg='#FFF8FB', style:sx }) {
  return (
    <section id={id} style={{ background:bg, padding:'64px 16px', ...sx }}>
      <div style={{ maxWidth:900, margin:'0 auto' }}>{children}</div>
    </section>
  )
}

function SectionTitle({ emoji, title, subtitle, light, accent }) {
  return (
    <div style={{ textAlign:'center', marginBottom:40 }}>
      {emoji && <div style={{ fontSize:42, marginBottom:10 }}>{emoji}</div>}
      <h2 style={{
        fontSize:28, fontWeight:900,
        color: light ? '#fff' : C.dark,
        fontFamily:"'Playfair Display',serif",
        marginBottom:10,
        ...(accent ? { background:`linear-gradient(135deg,${C.pink},${C.pinkD})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' } : {}),
      }}>{title}</h2>
      {subtitle && <p style={{ fontSize:14, color:light?'rgba(255,255,255,.82)':C.grey, maxWidth:500, margin:'0 auto', lineHeight:1.75 }}>{subtitle}</p>}
    </div>
  )
}

/* ── Course card ── */
function CourseCard({ emoji, title, desc, color, items }) {
  return (
    <div style={{
      background:C.white, borderRadius:22, padding:24,
      boxShadow:'0 4px 24px rgba(233,30,140,0.09)',
      border:`1px solid ${C.pinkPale}`, borderTop:`5px solid ${color}`,
      display:'flex', flexDirection:'column', gap:10,
    }}>
      <div style={{ fontSize:38 }}>{emoji}</div>
      <div style={{ fontSize:17, fontWeight:900, color:C.dark, fontFamily:"'Playfair Display',serif" }}>{title}</div>
      <div style={{ fontSize:13, color:C.grey, lineHeight:1.75 }}>{desc}</div>
      <ul style={{ paddingLeft:18, color:C.grey, fontSize:13, lineHeight:2.1 }}>
        {items.map((it,i)=><li key={i}>{it}</li>)}
      </ul>
    </div>
  )
}

/* ── Stat ── */
function Stat({ value, label }) {
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ fontSize:34, fontWeight:900, color:'#fff', fontFamily:"'Playfair Display',serif" }}>{value}</div>
      <div style={{ fontSize:11, color:'rgba(255,255,255,.75)', marginTop:3, letterSpacing:1, textTransform:'uppercase' }}>{label}</div>
    </div>
  )
}

/* ── Instagram EmbedSocial widget ── */
function InstagramWidget() {
  useEffect(()=>{
    if(!document.getElementById('EmbedSocialHashtagScript')){
      const s=document.createElement('script')
      s.id='EmbedSocialHashtagScript'
      s.src='https://embedsocial.com/cdn/ht.js'
      document.head.appendChild(s)
    }
  },[])
  return (
    <div style={{ margin:'0 auto', maxWidth:900 }}>
      <div className="embedsocial-hashtag"
        data-ref="8217faf2e6a10da81e70e2c5d776d43a2ad63ca1"
        data-lazyload="yes">
        <a className="feed-powered-by-es es-widget-branding"
          href="https://embedsocial.com/instagram-widget/" target="_blank" rel="noopener noreferrer">
          <img src="https://embedsocial.com/cdn/icon/embedsocial-logo.webp" alt="EmbedSocial"/>
        </a>
      </div>
    </div>
  )
}

/* ── YouTube Playlist Widget ── */
function YouTubePlaylistWidget({ playlistId }) {
  // If no real playlist ID provided, show a link instead
  const isReal = playlistId && !playlistId.startsWith('PLxxx')
  if (!isReal) {
    return (
      <div style={{ background:C.dark, borderRadius:20, padding:32, textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:12 }}>▶</div>
        <div style={{ color:'#fff', fontWeight:700, fontSize:16, marginBottom:8 }}>Watch Our Classes on YouTube</div>
        <div style={{ color:'rgba(255,255,255,0.7)', fontSize:13, marginBottom:20 }}>
          Mehndi tutorials · Makeup classes · Ariwork sessions — all recorded &amp; available anytime
        </div>
        <a href={YOUTUBE} target="_blank" rel="noopener noreferrer"
          style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 28px', borderRadius:14, background:C.yt, color:'#fff', fontWeight:800, fontSize:14, textDecoration:'none', boxShadow:'0 6px 20px rgba(255,0,0,0.4)' }}>
          ▶ Visit Our YouTube Channel
        </a>
      </div>
    )
  }
  // Real embed
  return (
    <div style={{ borderRadius:20, overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.18)', background:C.dark }}>
      <div style={{ position:'relative', paddingBottom:'56.25%', height:0 }}>
        <iframe
          style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none' }}
          src={`https://www.youtube.com/embed/videoseries?list=${playlistId}&rel=0&modestbranding=1`}
          title="Kajol Makeover Studioz — YouTube Playlist"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}

/* ── Media Review Card (supports text / image / video / whatsapp screenshot) ── */
function ReviewCard({ item }) {
  const [lightbox, setLightbox] = useState(false)
  const type = item.type || 'text'   // text | image | video | whatsapp

  const borderColor = item.color || C.pink

  return (
    <>
      <div className="review-card" style={{
        background:C.white, borderRadius:22, overflow:'hidden',
        boxShadow:'0 4px 16px rgba(233,30,140,0.07)',
        border:`1px solid ${C.pinkPale}`,
      }}>
        {/* image / whatsapp screenshot */}
        {(type==='image'||type==='whatsapp') && item.media_url && (
          <div onClick={()=>setLightbox(true)} style={{ cursor:'zoom-in', overflow:'hidden', maxHeight:260, position:'relative' }}>
            <img src={item.media_url} alt={item.name||'student work'} style={{ width:'100%', objectFit:'cover', display:'block', transition:'transform .3s' }}
              onMouseEnter={e=>e.currentTarget.style.transform='scale(1.04)'}
              onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}/>
            {type==='whatsapp' && (
              <div style={{ position:'absolute', top:10, right:10, background:C.wa, borderRadius:8, padding:'4px 10px', color:'#fff', fontSize:11, fontWeight:700 }}>
                💬 WhatsApp
              </div>
            )}
          </div>
        )}
        {/* video embed */}
        {type==='video' && item.media_url && (
          <div style={{ position:'relative', paddingBottom:'56.25%', background:C.dark }}>
            {item.media_url.includes('youtube.com')||item.media_url.includes('youtu.be') ? (
              <iframe style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none' }}
                src={item.media_url.replace('watch?v=','embed/').replace('youtu.be/','www.youtube.com/embed/')}
                title="Student video feedback" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowFullScreen/>
            ) : (
              <video controls style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%' }} src={item.media_url}/>
            )}
          </div>
        )}
        {/* text body */}
        <div style={{ padding:'18px 20px' }}>
          {type==='text' && (
            <div style={{ fontSize:28, color:borderColor, fontWeight:900, lineHeight:1, marginBottom:8 }}>"</div>
          )}
          {item.text && (
            <p style={{ fontSize:13, color:C.dark, lineHeight:1.85, marginBottom:14, fontStyle:'italic' }}>{item.text}</p>
          )}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width:38, height:38, borderRadius:'50%', flexShrink:0,
              background:`linear-gradient(135deg,${borderColor},${borderColor}99)`,
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'#fff', fontWeight:900, fontSize:16,
            }}>{item.initial||item.name?.[0]||'S'}</div>
            <div>
              <div style={{ fontWeight:800, fontSize:13, color:C.dark }}>{item.name}</div>
              <div style={{ fontSize:11, color:C.grey }}>{item.role}</div>
            </div>
            {type==='image'&&<div style={{ marginLeft:'auto', fontSize:11, color:C.grey }}>🔍 Tap to expand</div>}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={()=>setLightbox(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <img src={item.media_url} alt="" style={{ maxWidth:'100%', maxHeight:'90vh', borderRadius:16, boxShadow:'0 24px 80px rgba(0,0,0,0.6)' }}/>
          <div style={{ position:'absolute', top:20, right:20, color:'#fff', fontSize:32, cursor:'pointer' }}>✕</div>
        </div>
      )}
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════════════ */
export default function Website() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [siteContent, setSiteContent] = useState({})
  const [galleryItems, setGalleryItems] = useState([])
  const [reviewItems, setReviewItems] = useState([])

  useEffect(()=>{
    // Load site_content key/value
    sb.from('site_content').select('*').then(({data})=>{
      if(data){ const m={}; data.forEach(r=>{m[r.key]=r.value}); setSiteContent(m) }
    })
    // Load gallery photos from site_content as JSON
    sb.from('site_content').select('value').eq('key','gallery_photos').maybeSingle().then(({data})=>{
      try { if(data?.value) setGalleryItems(JSON.parse(data.value)) } catch{}
    })
    // Load rich review items from site_content as JSON
    sb.from('site_content').select('value').eq('key','reviews_rich').maybeSingle().then(({data})=>{
      try { if(data?.value) setReviewItems(JSON.parse(data.value)) } catch{}
    })
  },[])

  const sc = (key, fallback) => siteContent[key] || fallback

  /* Default gallery placeholder items */
  const defaultGallery = [
    {url:null, label:'Bridal Mehndi', emoji:'🌿', cat:'Mehndi'},
    {url:null, label:'Makeup Look',   emoji:'💄', cat:'Makeup'},
    {url:null, label:'Ariwork',       emoji:'🎨', cat:'Ariwork'},
    {url:null, label:'Arabic Mehndi', emoji:'🌺', cat:'Mehndi'},
    {url:null, label:'Party Makeup',  emoji:'✨', cat:'Makeup'},
    {url:null, label:'Canvas Art',    emoji:'🖌️', cat:'Ariwork'},
    {url:null, label:'Bridal Look',   emoji:'👰', cat:'Makeup'},
    {url:null, label:'Mandala Art',   emoji:'🌸', cat:'Ariwork'},
    {url:null, label:'Student Work',  emoji:'🎀', cat:'Mehndi'},
  ]
  const gallery = galleryItems.length > 0 ? galleryItems : defaultGallery

  /* Default reviews */
  const defaultReviews = [
    { type:'text', name:'Priya Sharma',   role:'Homemaker · Mehndi Student',           initial:'P', color:C.pink,
      text:"Kajol Ma'am is such a patient and detailed teacher. I could never draw a proper cone before, and now I do full bridal hands!" },
    { type:'text', name:'Sneha Patil',    role:'Working Professional · Makeup Student', initial:'S', color:C.green,
      text:"The live Zoom classes fit perfectly into my schedule. I learned more in one month than watching random videos for a year!" },
    { type:'text', name:'Ritika Nair',    role:'College Student · Ariwork Student',     initial:'R', color:C.purple,
      text:"Mandala and resin art sessions were absolutely amazing. I sold my first artwork within a week of completing the course!" },
    { type:'text', name:'Aarti Kulkarni', role:'Salon Owner · Combined Course',         initial:'A', color:C.amber,
      text:"Taking the combined course was the best investment for my salon. I upskilled in all three areas. Highly recommended!" },
  ]
  const reviews = reviewItems.length > 0 ? reviewItems : defaultReviews

  const navLinks = [
    {href:'#about',   label:'About'},
    {href:'#courses', label:'Courses'},
    {href:'#gallery', label:'Gallery'},
    {href:'#reviews', label:'Reviews'},
    {href:'#contact', label:'Contact'},
  ]

  return (
    <div>
      <style>{CSS}</style>

      {/* ══════════════ NAVBAR ══════════════ */}
      <header style={{
        position:'sticky', top:0, zIndex:500,
        background:'rgba(255,248,251,0.96)', backdropFilter:'blur(14px)',
        borderBottom:`1px solid ${C.pinkPale}`,
        boxShadow:'0 2px 20px rgba(233,30,140,0.07)',
      }}>
        <div style={{ maxWidth:960, margin:'0 auto', padding:'11px 18px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <a href="#" style={{ textDecoration:'none' }}><LogoMark dark/></a>

          <nav id="desktop-nav" style={{ display:'flex', gap:4, alignItems:'center' }}>
            {navLinks.map(l=>(
              <a key={l.href} href={l.href}
                style={{ padding:'6px 13px', borderRadius:9, fontSize:13, fontWeight:600, color:C.grey, textDecoration:'none', transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.color=C.pink;e.currentTarget.style.background=C.pinkPale}}
                onMouseLeave={e=>{e.currentTarget.style.color=C.grey;e.currentTarget.style.background='transparent'}}>
                {l.label}
              </a>
            ))}
            <a href={ENROLL_URL} style={{ marginLeft:10, padding:'9px 20px', borderRadius:22, fontSize:13, fontWeight:800, background:`linear-gradient(135deg,${C.pink},${C.pinkD})`, color:'#fff', textDecoration:'none', boxShadow:`0 4px 14px ${C.pink}55` }}>
              Enroll Now
            </a>
            <a href={ADMIN_URL} style={{ marginLeft:4, padding:'8px 13px', borderRadius:20, fontSize:12, fontWeight:700, border:`1.5px solid ${C.pink}`, color:C.pink, textDecoration:'none' }}>🔒</a>
          </nav>

          <button id="hamburger-btn" onClick={()=>setMenuOpen(!menuOpen)}
            style={{ display:'none', background:'none', border:'none', fontSize:26, cursor:'pointer', color:C.pink }}>
            {menuOpen?'✕':'☰'}
          </button>
        </div>
        {menuOpen&&(
          <div style={{ background:C.white, borderTop:`1px solid ${C.pinkPale}`, padding:'12px 16px', display:'flex', flexDirection:'column', gap:4 }}>
            {navLinks.map(l=>(
              <a key={l.href} href={l.href} onClick={()=>setMenuOpen(false)}
                style={{ padding:'11px 14px', borderRadius:10, fontSize:14, fontWeight:700, color:C.dark, textDecoration:'none' }}>{l.label}</a>
            ))}
            <a href={ENROLL_URL} style={{ padding:'13px 14px', borderRadius:12, fontSize:14, fontWeight:800, background:`linear-gradient(135deg,${C.pink},${C.pinkD})`, color:'#fff', textDecoration:'none', textAlign:'center', marginTop:6 }}>🌸 Enroll Now</a>
            <a href={ADMIN_URL} style={{ padding:'10px 14px', borderRadius:10, fontSize:13, fontWeight:700, color:C.pink, textDecoration:'none', textAlign:'center' }}>🔒 Admin Login</a>
          </div>
        )}
      </header>

      {/* ══════════════ HERO ══════════════ */}
      <section style={{
        background:`linear-gradient(145deg,${C.pink} 0%,${C.pinkD} 38%,#4A148C 72%,${C.green} 100%)`,
        padding:'80px 16px 90px', textAlign:'center', position:'relative', overflow:'hidden',
      }}>
        {/* decorative mehndi-inspired arcs */}
        {[200,320,440].map((s,i)=>(
          <div key={i} style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:s, height:s, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.08)', pointerEvents:'none' }}/>
        ))}
        <div style={{ position:'absolute', top:-40, left:-40, width:220, height:220, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }}/>
        <div style={{ position:'absolute', bottom:-60, right:-30, width:280, height:280, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }}/>

        <div style={{ position:'relative', maxWidth:620, margin:'0 auto', animation:'fadeInUp .7s ease' }}>
          <HeroLogo/>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.88)', lineHeight:1.75, margin:'22px 0 8px' }}>
            Online courses in <strong>Mehndi · Makeup · Ariwork</strong>
          </p>
          <p style={{ fontSize:14, color:'rgba(255,255,255,0.75)', lineHeight:1.75, marginBottom:36 }}>
            {sc('hero_tagline',"Learn from Kajol J Kamble — professional artist & passionate teacher. Live Zoom + recorded YouTube sessions.")}
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <a href={ENROLL_URL} style={{ padding:'15px 30px', borderRadius:16, fontWeight:800, fontSize:15, background:'#fff', color:C.pink, textDecoration:'none', boxShadow:'0 10px 28px rgba(0,0,0,0.22)' }}>
              🌸 Enroll Free
            </a>
            <a href="#courses" style={{ padding:'15px 30px', borderRadius:16, fontWeight:700, fontSize:15, background:'rgba(255,255,255,0.15)', color:'#fff', border:'2px solid rgba(255,255,255,0.4)', textDecoration:'none' }}>
              View Courses →
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════ STATS STRIP ══════════════ */}
      <div style={{ background:`linear-gradient(90deg,${C.pinkD},#7B1FA2,${C.green})`, padding:'26px 16px' }}>
        <div className="stats-grid" style={{ maxWidth:760, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
          <Stat value={sc('stat_students','200+')} label="Students Trained"/>
          <Stat value={sc('stat_courses','3')}     label="Expert Courses"/>
          <Stat value={sc('stat_classes','50+')}   label="Classes Done"/>
          <Stat value="100%"                       label="Online Comfort"/>
        </div>
      </div>

      {/* ══════════════ INSTAGRAM STRIP  (between Hero & About) ══════════════ */}
      <section style={{ background:'#fff', padding:'48px 16px 36px', borderBottom:`1px solid ${C.pinkPale}` }}>
        <div style={{ maxWidth:960, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:24 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:`linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)`, borderRadius:30, padding:'8px 20px', color:'#fff', fontWeight:800, fontSize:14, marginBottom:8 }}>
              📸 Live Instagram Feed — @kajol_makeover_studioz
            </div>
            <p style={{ fontSize:13, color:C.grey }}>Latest reels, posts &amp; student work directly from Instagram</p>
          </div>
          <InstagramWidget/>
          <div style={{ textAlign:'center', marginTop:18 }}>
            <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 24px', borderRadius:22, background:`linear-gradient(135deg,#e6683c,#dc2743,#cc2366)`, color:'#fff', textDecoration:'none', fontWeight:700, fontSize:13, boxShadow:'0 4px 14px rgba(220,39,67,0.35)' }}>
              📸 Follow us on Instagram
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════ ABOUT ══════════════ */}
      <Section id="about">
        <div className="about-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:40, alignItems:'center' }}>
          <div style={{ textAlign:'center' }}>
            {/* Large decorative logo in about */}
            <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
              <div style={{ position:'relative' }}>
                <div className="logo-spin" style={{ position:'absolute', inset:-8, borderRadius:'50%', border:`2px dashed ${C.pink}50` }}/>
                <KMSLogo size={130}/>
              </div>
            </div>
            <div style={{ fontSize:20, fontWeight:900, color:C.dark, fontFamily:"'Playfair Display',serif" }}>Kajol J Kamble</div>
            <div style={{ fontSize:13, color:C.grey, marginTop:4, marginBottom:16 }}>Mehndi · Makeup · Ariwork Artist</div>
            <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
              {[{label:'WhatsApp',url:WA_COMMUNITY,bg:C.wa},{label:'Instagram',url:INSTAGRAM,bg:C.ig},{label:'YouTube',url:YOUTUBE,bg:C.yt}].map(s=>(
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer"
                  style={{ padding:'7px 16px', borderRadius:22, background:s.bg, color:'#fff', fontSize:12, fontWeight:700, textDecoration:'none' }}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <div style={{ display:'inline-block', background:C.pinkPale, color:C.pink, borderRadius:22, padding:'4px 16px', fontSize:12, fontWeight:700, marginBottom:14 }}>About Me</div>
            <h2 style={{ fontSize:26, fontWeight:900, color:C.dark, lineHeight:1.3, marginBottom:16, fontFamily:"'Playfair Display',serif" }}>
              {sc('about_headline','Passionate Artist.\nDedicated Teacher.').split('\n').map((l,i)=><span key={i}>{l}{i===0?<br/>:''}</span>)}
            </h2>
            <p style={{ fontSize:14, color:C.grey, lineHeight:1.85, marginBottom:12 }}>
              {sc('about_para1',"Hi! I'm Kajol, a professional Mehndi, Makeup, and Ariwork artist with years of experience working with brides, events, and art enthusiasts across India. My mission is to help you discover your creative potential — from home, at your own pace.")}
            </p>
            <p style={{ fontSize:14, color:C.grey, lineHeight:1.85, marginBottom:22 }}>
              {sc('about_para2',"All my courses are conducted live on Zoom with recordings uploaded to YouTube, so you never miss a session. Whether you're a complete beginner or looking to polish your skills, there's a course for you here.")}
            </p>
            <a href={ENROLL_URL} style={{ display:'inline-block', padding:'13px 26px', borderRadius:14, fontWeight:800, fontSize:14, background:`linear-gradient(135deg,${C.pink},${C.pinkD})`, color:'#fff', textDecoration:'none', boxShadow:`0 6px 20px ${C.pink}44` }}>
              🌸 Enroll in a Course
            </a>
          </div>
        </div>
      </Section>

      {/* ══════════════ YOUTUBE PLAYLIST ══════════════ */}
      <Section bg={C.dark} style={{ padding:'60px 16px' }}>
        <SectionTitle emoji="▶" title="Watch Our Classes" light
          subtitle="Browse our full library of Mehndi, Makeup & Ariwork video classes on YouTube"/>
        <YouTubePlaylistWidget playlistId={sc('yt_playlist_id', YT_PLAYLIST_ID)}/>
        <div style={{ textAlign:'center', marginTop:24 }}>
          <a href={YOUTUBE} target="_blank" rel="noopener noreferrer"
            style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 26px', borderRadius:22, background:C.yt, color:'#fff', fontWeight:700, fontSize:13, textDecoration:'none', boxShadow:`0 6px 20px ${C.yt}55` }}>
            ▶ Open Full YouTube Channel
          </a>
        </div>
      </Section>

      {/* ══════════════ COURSES ══════════════ */}
      <Section id="courses" bg={C.greyL}>
        <SectionTitle emoji="📚" title="Our Courses" accent
          subtitle={sc('courses_subtitle','Professional-level training from the comfort of your home. Live Zoom + YouTube recordings.')}/>
        <div className="courses-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:20 }}>
          <CourseCard emoji="🌿" title="Mehndi Art" color={C.green}
            desc={sc('course_mehndi_desc','From traditional bridal designs to modern Arabic patterns — learn step by step with daily practice sheets.')}
            items={sc('course_mehndi_items','Basic & advanced patterns|Bridal & Arabic designs|Cone making & filling|Practice sheets included|Certificate on completion').split('|')}/>
          <CourseCard emoji="💄" title="Makeup Course" color={C.pink}
            desc={sc('course_makeup_desc','Everyday glam to bridal looks — master professional makeup techniques used by top artists.')}
            items={sc('course_makeup_items','Skin prep & base makeup|Eye makeup & contouring|Bridal & party looks|Airbrush introduction|Kit guidance & product tips').split('|')}/>
          <CourseCard emoji="🎨" title="Ariwork Course" color={C.purple}
            desc={sc('course_ariwork_desc','Unleash your creativity with canvas painting, mandala art, resin, and decorative crafts.')}
            items={sc('course_ariwork_items','Mandala & dot art|Canvas painting|Resin art basics|Warli & folk art|DIY home décor projects').split('|')}/>
          <CourseCard emoji="✨" title="Combined Course" color={C.amber}
            desc={sc('course_combined_desc',"Get the best of all three courses at a special bundled fee. Perfect for aspiring freelancers.")}
            items={sc('course_combined_items',"Mehndi + Makeup + Ariwork|Flexible batch timings|Special bundle pricing|Priority support from Kajol Ma'am|Freelance career guidance").split('|')}/>
        </div>
      </Section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <Section id="how">
        <SectionTitle emoji="✅" title="How It Works" subtitle="Getting started is easy — just 3 simple steps."/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:22 }}>
          {[
            {n:'1',icon:'📲',title:'Fill the Form',desc:'Submit the free enrollment form with your details and course preference.'},
            {n:'2',icon:'📩',title:'Get Confirmed',desc:"Kajol Ma'am reviews your form and contacts you on WhatsApp with batch details."},
            {n:'3',icon:'🎓',title:'Start Learning',desc:'Join live Zoom classes, watch recordings on YouTube, and practice daily!'},
          ].map(s=>(
            <div key={s.n} style={{ textAlign:'center', background:C.white, borderRadius:22, padding:26, boxShadow:'0 4px 16px rgba(233,30,140,0.07)', border:`1px solid ${C.pinkPale}` }}>
              <div style={{ width:50, height:50, borderRadius:'50%', background:`linear-gradient(135deg,${C.pink},${C.pinkD})`, color:'#fff', fontWeight:900, fontSize:20, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontFamily:"'Playfair Display',serif" }}>{s.n}</div>
              <div style={{ fontSize:34, marginBottom:10 }}>{s.icon}</div>
              <div style={{ fontSize:16, fontWeight:800, color:C.dark, marginBottom:8 }}>{s.title}</div>
              <div style={{ fontSize:13, color:C.grey, lineHeight:1.75 }}>{s.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:'center', marginTop:36 }}>
          <a href={ENROLL_URL} style={{ display:'inline-block', padding:'15px 34px', borderRadius:16, fontWeight:800, fontSize:15, background:`linear-gradient(135deg,${C.pink},${C.pinkD})`, color:'#fff', textDecoration:'none', boxShadow:`0 6px 22px ${C.pink}44` }}>
            🌸 Start Your Enrollment
          </a>
        </div>
      </Section>

      {/* ══════════════ OUR WORK GALLERY ══════════════ */}
      <Section id="gallery" bg={C.pinkPale}>
        <SectionTitle emoji="🖼️" title="Our Work" accent
          subtitle={sc('gallery_subtitle',"A glimpse of the beautiful art our students and Kajol Ma'am create — photos, designs & more!")}/>

        <div className="gallery-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:28 }}>
          {gallery.map((item, i)=>{
            const catColor = item.cat==='Mehndi'?C.green : item.cat==='Makeup'?C.pink : C.purple
            return (
              <div key={i} className="gallery-img" style={{
                borderRadius:18, overflow:'hidden', aspectRatio:'1',
                background: item.url ? 'transparent' : `linear-gradient(135deg,${catColor}18,${catColor}08)`,
                border:`1px solid ${C.pinkPale}`, boxShadow:'0 3px 14px rgba(233,30,140,0.08)',
                position:'relative', cursor: item.url ? 'zoom-in' : 'default',
              }}>
                {item.url ? (
                  <img src={item.url} alt={item.label||''} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                ) : (
                  <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
                    <div style={{ fontSize:44 }}>{item.emoji||'🖼️'}</div>
                    <div style={{ fontSize:11, fontWeight:700, color:catColor, textAlign:'center', padding:'0 8px' }}>{item.label}</div>
                  </div>
                )}
                {item.cat && (
                  <div style={{ position:'absolute', top:8, left:8, background:catColor, color:'#fff', borderRadius:8, padding:'2px 8px', fontSize:10, fontWeight:700 }}>{item.cat}</div>
                )}
              </div>
            )
          })}
        </div>

        <p style={{ textAlign:'center', fontSize:13, color:C.grey, marginBottom:24 }}>
          📸 Follow on <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" style={{ color:C.ig, fontWeight:700 }}>Instagram</a> &amp; ▶ watch on <a href={YOUTUBE} target="_blank" rel="noopener noreferrer" style={{ color:C.yt, fontWeight:700 }}>YouTube</a> for more
        </p>
      </Section>

      {/* ══════════════ STUDENT REVIEWS ══════════════ */}
      <Section id="reviews">
        <SectionTitle emoji="⭐" title="What Students Say"
          subtitle={sc('reviews_subtitle','Real words from real learners — text, photos, WhatsApp messages & video feedback.')}/>
        <div className="reviews-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
          {reviews.map((r,i)=><ReviewCard key={i} item={r}/>)}
        </div>
      </Section>

      {/* ══════════════ COMMUNITY ══════════════ */}
      <Section bg={`linear-gradient(135deg,${C.green},#1B5E20)`} style={{ padding:'60px 16px' }}>
        <SectionTitle emoji="🌐" title="Join Our Community" light subtitle={null}/>
        <p style={{ textAlign:'center', fontSize:14, color:'rgba(255,255,255,0.82)', lineHeight:1.8, maxWidth:500, margin:'0 auto 32px' }}>
          {sc('community_text','Connect with 200+ students on WhatsApp, get daily tips, and stay updated on new batches.')}
        </p>
        <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
          {[
            {label:'🟢 Join WhatsApp Community',url:WA_COMMUNITY,bg:C.wa},
            {label:'📸 Follow on Instagram',url:INSTAGRAM,bg:C.ig},
            {label:'▶ Subscribe on YouTube',url:YOUTUBE,bg:C.yt},
          ].map(l=>(
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
              style={{ padding:'14px 24px', borderRadius:16, background:l.bg, color:'#fff', fontWeight:700, fontSize:14, textDecoration:'none', boxShadow:'0 4px 16px rgba(0,0,0,0.22)' }}>
              {l.label}
            </a>
          ))}
        </div>
      </Section>

      {/* ══════════════ CONTACT / CTA ══════════════ */}
      <Section id="contact" bg={C.offWhite}>
        <div style={{ background:`linear-gradient(135deg,${C.pink},${C.pinkD})`, borderRadius:28, padding:'48px 28px', textAlign:'center', boxShadow:`0 18px 56px ${C.pink}44` }}>
          <div style={{ marginBottom:18, display:'flex', justifyContent:'center' }}>
            <KMSLogo size={64}/>
          </div>
          <h2 style={{ fontSize:28, fontWeight:900, color:'#fff', marginBottom:14, fontFamily:"'Playfair Display',serif" }}>
            {sc('cta_headline','Ready to Start Your Journey?')}
          </h2>
          <p style={{ fontSize:14, color:'rgba(255,255,255,.88)', lineHeight:1.8, maxWidth:440, margin:'0 auto 32px' }}>
            {sc('cta_subtext',"Fill our free enrollment form today and get a personal reply from Kajol Ma'am on WhatsApp within 24 hours.")}
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <a href={ENROLL_URL} style={{ padding:'15px 32px', borderRadius:16, fontWeight:800, fontSize:15, background:'#fff', color:C.pink, textDecoration:'none', boxShadow:'0 6px 22px rgba(0,0,0,0.2)' }}>
              🌸 Enroll Now — It's Free
            </a>
            <a href={WA_COMMUNITY} target="_blank" rel="noopener noreferrer" style={{ padding:'15px 32px', borderRadius:16, fontWeight:700, fontSize:15, background:'rgba(255,255,255,0.18)', color:'#fff', border:'2px solid rgba(255,255,255,0.42)', textDecoration:'none' }}>
              💬 Ask on WhatsApp
            </a>
          </div>
        </div>
      </Section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer style={{ background:C.dark, color:'#fff', padding:'40px 16px 28px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:30, marginBottom:30 }}>
            <div>
              <div style={{ marginBottom:14 }}><LogoMark dark={false}/></div>
              <p style={{ fontSize:12, opacity:.65, lineHeight:1.85 }}>
                Professional Mehndi, Makeup &amp; Ariwork courses taught live online by Kajol J Kamble.
              </p>
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:800, marginBottom:12, color:C.pink }}>Quick Links</div>
              {[{label:'Enroll Now',href:ENROLL_URL},{label:'About',href:'#about'},{label:'Courses',href:'#courses'},{label:'Gallery',href:'#gallery'},{label:'Reviews',href:'#reviews'},{label:'Admin Login',href:ADMIN_URL}].map(l=>(
                <a key={l.label} href={l.href} style={{ display:'block', fontSize:13, opacity:.72, textDecoration:'none', color:'#fff', marginBottom:7, lineHeight:1.6 }}>→ {l.label}</a>
              ))}
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:800, marginBottom:12, color:C.pink }}>Follow Us</div>
              {[{label:'WhatsApp Community',url:WA_COMMUNITY,color:C.wa},{label:'Instagram',url:INSTAGRAM,color:C.ig},{label:'YouTube Channel',url:YOUTUBE,color:C.yt}].map(s=>(
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" style={{ display:'block', fontSize:13, color:s.color, textDecoration:'none', marginBottom:9, fontWeight:700 }}>{s.label}</a>
              ))}
            </div>
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:20, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
            <div style={{ fontSize:12, opacity:.55 }}>© 2025 Kajol Makeover Studioz. All rights reserved.</div>
            <a href={ADMIN_URL} style={{ fontSize:11, opacity:.38, color:'#fff', textDecoration:'none' }}>🔒 Admin</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
