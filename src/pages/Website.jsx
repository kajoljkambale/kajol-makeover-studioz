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
const YT_PLAYLIST_ID  = 'PLZDAEN7wCknjKSw6QrdoF9M-NHbkInkw7'
const PHONE1          = '8390695155'
const PHONE2          = '7030825125'
const EMAIL_KAJOL     = 'kajoljkambale@gmail.com'
const UPI_ID          = 'kajalkambaleaxis@yesg'
const UPI_NAME        = 'Kajol Makeover Studioz'  // Kajol Makeover Studioz playlist
const ADMIN_URL       = '/app'

/* ═══════════════════════════════════════════════════════════════════
   SEO HEAD — injects meta tags, Open Graph, structured data
   Improves Google ranking for Kajol Makeover Studioz, Pune
═══════════════════════════════════════════════════════════════════ */
function SEOHead() {
  useEffect(()=>{
    // Page title
    document.title = 'Kajol Makeover Studioz | Mehndi, Makeup & Ariwork Classes Online | Pune'

    const setMeta = (name,content,prop=false) => {
      const attr = prop ? 'property' : 'name'
      let el = document.querySelector(`meta[${attr}="${name}"]`)
      if(!el){ el=document.createElement('meta'); el.setAttribute(attr,name); document.head.appendChild(el) }
      el.setAttribute('content',content)
    }

    // Core SEO meta
    setMeta('description','Learn Mehndi, Makeup & Ariwork online from Kajol J Kamble — professional artist & teacher based in Pune. Live Zoom classes + YouTube recordings. Enroll now!')
    setMeta('keywords','mehndi classes online, makeup course Pune, ariwork classes, mehndi design course, bridal makeup training, online beauty courses India, Kajol Makeover Studioz, mehndi teacher Pune')
    setMeta('author','Kajol J Kamble — Kajol Makeover Studioz')
    setMeta('robots','index, follow')
    setMeta('language','en-IN')
    setMeta('geo.region','IN-MH')
    setMeta('geo.placename','Pune, Maharashtra, India')

    // Open Graph (Facebook, WhatsApp preview)
    setMeta('og:title','Kajol Makeover Studioz | Online Mehndi, Makeup & Ariwork Classes',true)
    setMeta('og:description','Professional Mehndi, Makeup & Ariwork courses by Kajol J Kamble, Pune. Live Zoom classes + YouTube recordings. Enroll free today!',true)
    setMeta('og:url','https://kajol-makeover-studioz.vercel.app',true)
    setMeta('og:type','website',true)
    setMeta('og:image','https://kajol-makeover-studioz.vercel.app/og-image.jpg',true)
    setMeta('og:site_name','Kajol Makeover Studioz',true)
    setMeta('og:locale','en_IN',true)

    // Twitter Card
    setMeta('twitter:card','summary_large_image')
    setMeta('twitter:title','Kajol Makeover Studioz | Online Beauty Courses Pune')
    setMeta('twitter:description','Learn Mehndi, Makeup & Ariwork online. Professional courses by Kajol J Kamble, Pune. Join 200+ students!')
    setMeta('twitter:image','https://kajol-makeover-studioz.vercel.app/og-image.jpg')

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if(!canonical){ canonical=document.createElement('link'); canonical.rel='canonical'; document.head.appendChild(canonical) }
    canonical.href = 'https://kajol-makeover-studioz.vercel.app'

    // Structured Data — LocalBusiness + EducationalOrganization
    const structuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": ["LocalBusiness","EducationalOrganization"],
          "name": "Kajol Makeover Studioz",
          "description": "Professional online classes in Mehndi, Makeup and Ariwork by Kajol J Kamble. Live Zoom sessions and YouTube recordings.",
          "url": "https://kajol-makeover-studioz.vercel.app",
          "telephone": "+918390695155",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Pune",
            "addressRegion": "Maharashtra",
            "addressCountry": "IN"
          },
          "geo": { "@type": "GeoCoordinates", "latitude": 18.5204, "longitude": 73.8567 },
          "sameAs": [
            "https://www.instagram.com/kajol_makeover_studioz",
            "https://youtube.com/@kajolmakeoverstudioz"
          ],
          "founder": { "@type": "Person", "name": "Kajol J Kamble" },
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Beauty Courses",
            "itemListElement": [
              {"@type":"Offer","name":"Mehndi Art Course","category":"Mehndi"},
              {"@type":"Offer","name":"Makeup Course","category":"Makeup"},
              {"@type":"Offer","name":"Ariwork Course","category":"Art"},
              {"@type":"Offer","name":"Combined Course","category":"Beauty"}
            ]
          }
        },
        {
          "@type": "Person",
          "name": "Kajol J Kamble",
          "jobTitle": "Makeup Artist, Mehndi Designer, Ariwork Instructor",
          "worksFor": {"@type":"Organization","name":"Kajol Makeover Studioz"},
          "address": {"@type":"PostalAddress","addressLocality":"Pune","addressRegion":"Maharashtra","addressCountry":"IN"},
          "sameAs": [
            "https://www.instagram.com/kajol_makeover_studioz",
            "https://youtube.com/@kajolmakeoverstudioz"
          ]
        }
      ]
    }
    let sdScript = document.querySelector('#kms-structured-data')
    if(!sdScript){ sdScript=document.createElement('script'); sdScript.id='kms-structured-data'; sdScript.type='application/ld+json'; document.head.appendChild(sdScript) }
    sdScript.text = JSON.stringify(structuredData)

    return ()=>{}
  },[])
  return null
}



/* ═══════════════════════════════════════════════════════════════════
   LOGO — hand holding makeup brushes + mehndi cone
   NOTE: To use your own logo image, place the file as:
         /public/kms-logo.png  (in your GitHub project root/public/)
   Then replace <KMSLogo/> with:
         <img src="/kms-logo.png" alt="KMS Logo" style={{width:size,height:size}}/>
   For now this SVG logo is used automatically.
═══════════════════════════════════════════════════════════════════ */
function KMSLogo({ size = 48, light = false }) {
  const nail = light ? 'rgba(255,180,190,0.95)' : '#E91E8C'
  const hand = light ? 'rgba(255,255,255,0.93)' : '#FAEAE0'
  const hsk  = light ? 'rgba(255,255,255,0.45)' : '#2D1008'
  const bru  = light ? 'rgba(255,255,255,0.9)'  : '#3D2218'
  const bh   = light ? 'rgba(255,255,255,0.65)' : '#7A5040'
  const bhl  = light ? 'rgba(255,255,255,0.4)'  : '#A07868'
  const bg   = light ? 'rgba(255,255,255,0.1)'  : '#FCE4EC'
  return (
    <svg width={size} height={size*1.28} viewBox="0 0 100 128" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0}}>
      <rect width="100" height="128" rx="14" fill={bg} opacity="0.45"/>
      <rect x="5" y="2" width="11" height="45" rx="5.5" fill={bru} transform="rotate(-30 10 24)"/>
      <ellipse cx="4"  cy="5"  rx="8"   ry="12.5" fill={bh}  transform="rotate(-30 4 5)"/>
      <ellipse cx="4"  cy="4"  rx="5"   ry="8.5"  fill={bhl} transform="rotate(-30 4 4)" opacity="0.7"/>
      <line x1="8"  y1="48" x2="5"  y2="60" stroke={nail} strokeWidth="4.5" strokeLinecap="round"/>
      <rect x="27" y="0" width="11" height="47" rx="5.5" fill={bru} transform="rotate(-12 32 23)"/>
      <ellipse cx="26" cy="4"  rx="7.5" ry="12"   fill={bh}  transform="rotate(-12 26 4)"/>
      <ellipse cx="26" cy="3"  rx="4.5" ry="8"    fill={bhl} transform="rotate(-12 26 3)" opacity="0.7"/>
      <line x1="32" y1="48" x2="30" y2="60" stroke={nail} strokeWidth="4.5" strokeLinecap="round"/>
      <rect x="55" y="0" width="11" height="47" rx="5.5" fill={bru} transform="rotate(8 60 23)"/>
      <ellipse cx="62" cy="3"  rx="7.5" ry="12"   fill={bh}  transform="rotate(8 62 3)"/>
      <ellipse cx="62" cy="2"  rx="4.5" ry="8"    fill={bhl} transform="rotate(8 62 2)" opacity="0.7"/>
      <line x1="62" y1="48" x2="64" y2="60" stroke={nail} strokeWidth="4.5" strokeLinecap="round"/>
      <rect x="77" y="3" width="10" height="43" rx="5"   fill={bru} transform="rotate(26 82 24)"/>
      <ellipse cx="85" cy="6"  rx="7"   ry="11"   fill={bh}  transform="rotate(26 85 6)"/>
      <ellipse cx="85" cy="5"  rx="4"   ry="7.5"  fill={bhl} transform="rotate(26 85 5)" opacity="0.7"/>
      <line x1="83" y1="46" x2="86" y2="58" stroke={nail} strokeWidth="4" strokeLinecap="round"/>
      <path d="M16 62 Q12 74 14 90 Q14 103 30 107 Q50 112 70 107 Q86 103 86 90 L85 62 Q78 57 70 60 Q62 55 54 60 Q45 55 36 60 Q26 56 16 62Z"
        fill={hand} stroke={hsk} strokeWidth="2.8"/>
      <path d="M20 70 Q26 65 32 70" stroke={hsk} strokeWidth="1.3" fill="none" opacity="0.28"/>
      <path d="M38 66 Q45 61 52 66" stroke={hsk} strokeWidth="1.3" fill="none" opacity="0.28"/>
      <path d="M58 66 Q64 61 70 66" stroke={hsk} strokeWidth="1.3" fill="none" opacity="0.28"/>
      <path d="M74 69 Q79 64 83 69" stroke={hsk} strokeWidth="1.1" fill="none" opacity="0.28"/>
      <ellipse cx="26"   cy="64" rx="6.5" ry="4.5" fill={nail}/>
      <ellipse cx="45"   cy="61" rx="6.5" ry="4.2" fill={nail}/>
      <ellipse cx="64"   cy="61" rx="6"   ry="4"   fill={nail}/>
      <ellipse cx="80"   cy="63" rx="5.5" ry="3.8" fill={nail}/>
      <ellipse cx="24.5" cy="62.5" rx="2.5" ry="1.5" fill="rgba(255,255,255,0.55)"/>
      <ellipse cx="43.5" cy="59.5" rx="2.5" ry="1.4" fill="rgba(255,255,255,0.55)"/>
      <ellipse cx="62.5" cy="59.5" rx="2.2" ry="1.3" fill="rgba(255,255,255,0.55)"/>
      <ellipse cx="78.5" cy="61.5" rx="2"   ry="1.2" fill="rgba(255,255,255,0.55)"/>
      {[0,1,2,3,4,5].map(ix=>(
        <circle key={ix} cx={26+ix*9} cy={100} r="2.2" fill={nail} opacity="0.38"/>
      ))}
    </svg>
  )
}) {
  const pk   = light ? '#fff'                   : '#E91E8C'
  const nail = light ? 'rgba(255,200,220,0.9)'  : '#E91E8C'
  const hand = light ? 'rgba(255,255,255,0.92)' : '#FFF0F5'
  const hsk  = light ? 'rgba(255,255,255,0.55)' : '#3D1A1A'
  const bru  = light ? 'rgba(255,255,255,0.88)' : '#4A2C2A'
  const bh   = light ? 'rgba(255,255,255,0.6)'  : '#8B6B60'
  const bg   = light ? 'rgba(255,255,255,0.12)' : '#FCE4EC'
  const h    = size * 1.2
  return (
    <svg width={size} height={h} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="120" rx="16" fill={bg} opacity="0.5"/>
      <rect x="16" y="6" width="9" height="40" rx="4.5" fill={bru} transform="rotate(-20 20 26)"/>
      <ellipse cx="13" cy="9" rx="7" ry="11" fill={bh} transform="rotate(-20 13 9)"/>
      <ellipse cx="13" cy="8" rx="4.5" ry="7.5" fill={bru} opacity="0.5" transform="rotate(-20 13 8)"/>
      <line x1="18" y1="46" x2="16" y2="54" stroke={pk} strokeWidth="3.5" strokeLinecap="round"/>
      <rect x="44" y="4" width="10" height="42" rx="5" fill={bru} transform="rotate(-3 49 25)"/>
      <ellipse cx="46" cy="7" rx="6" ry="10" fill={bh} transform="rotate(-3 46 7)"/>
      <ellipse cx="46" cy="6" rx="3.8" ry="7" fill={bru} opacity="0.5" transform="rotate(-3 46 6)"/>
      <line x1="50" y1="46" x2="50" y2="54" stroke={pk} strokeWidth="3.5" strokeLinecap="round"/>
      <rect x="70" y="7" width="9" height="38" rx="4.5" fill={bru} transform="rotate(18 74 26)"/>
      <ellipse cx="76" cy="9" rx="6.5" ry="10" fill={bh} transform="rotate(18 76 9)"/>
      <ellipse cx="76" cy="8" rx="4" ry="7" fill={bru} opacity="0.5" transform="rotate(18 76 8)"/>
      <line x1="76" y1="45" x2="77" y2="53" stroke={pk} strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M26 55 Q23 66 24 82 Q24 93 36 95 Q50 99 64 95 Q76 93 76 82 L75 55 Q69 51 63 53 Q56 49 50 53 Q44 49 38 53 Q32 49 26 55Z"
        fill={hand} stroke={hsk} strokeWidth="2.5"/>
      <path d="M31 62 Q35 58 39 62" stroke={hsk} strokeWidth="1.2" fill="none" opacity="0.35"/>
      <path d="M46 59 Q50 55 54 59" stroke={hsk} strokeWidth="1.2" fill="none" opacity="0.35"/>
      <path d="M61 60 Q64 56 67 60" stroke={hsk} strokeWidth="1.2" fill="none" opacity="0.35"/>
      <ellipse cx="30"   cy="57" rx="5.5" ry="4"   fill={nail}/>
      <ellipse cx="50"   cy="54" rx="5.5" ry="3.8" fill={nail}/>
      <ellipse cx="64.5" cy="55" rx="5"   ry="3.5" fill={nail}/>
      <ellipse cx="75"   cy="58" rx="4.5" ry="3.2" fill={nail}/>
      <ellipse cx="28.5" cy="55.5" rx="2" ry="1.2" fill="rgba(255,255,255,0.45)"/>
      <ellipse cx="48.5" cy="52.8" rx="2" ry="1.2" fill="rgba(255,255,255,0.45)"/>
      <ellipse cx="63"   cy="53.8" rx="1.8" ry="1" fill="rgba(255,255,255,0.45)"/>
      {[0,1,2,3,4].map(i=>(
        <circle key={i} cx={33+i*8} cy={88} r="1.8" fill={pk} opacity="0.4"/>
      ))}
    </svg>
  )
}

function LogoMark({ dark: isDark = true }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <KMSLogo size={42} light={!isDark}/>
      <div>
        <div style={{ fontSize:13, fontWeight:900, letterSpacing:0.4, lineHeight:1.2, color: isDark ? C.pink : '#fff' }}>
          Kajol Makeover
        </div>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:2.8, textTransform:'uppercase', color: isDark ? C.grey : 'rgba(255,255,255,0.72)' }}>
          S T U D I O Z
        </div>
      </div>
    </div>
  )
}

function HeroLogo() {
  return (
    <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', gap:8 }}>
      <KMSLogo size={96} light={true}/>
      <div style={{ fontSize:32, fontWeight:900, color:'#fff', fontFamily:"'Playfair Display',serif", textShadow:'0 2px 18px rgba(0,0,0,0.32)', letterSpacing:1 }}>
        Kajol Makeover<br/>
        <span style={{ fontSize:19, letterSpacing:5, opacity:.88 }}>S T U D I O Z</span>
      </div>
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
  @media print { body>*:not(#cert-print-area){display:none!important;} #cert-print-area{display:block!important;} }
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

/* ── YouTube Playlist Widget — player left + playlist list right ── */
const PLAYLIST_ITEMS = [
  { title:'Introduction to Mehndi Art', duration:'~18 min', cat:'Mehndi' },
  { title:'Basic Patterns & Strokes', duration:'~24 min', cat:'Mehndi' },
  { title:'Arabic Mehndi Full Design', duration:'~31 min', cat:'Mehndi' },
  { title:'Bridal Mehndi — Full Hand', duration:'~45 min', cat:'Mehndi' },
  { title:'Makeup: Skin Prep & Base', duration:'~22 min', cat:'Makeup' },
  { title:'Eye Makeup Techniques', duration:'~28 min', cat:'Makeup' },
  { title:'Bridal Makeup Complete Look', duration:'~52 min', cat:'Makeup' },
  { title:'Mandala Art Basics', duration:'~20 min', cat:'Ariwork' },
  { title:'Canvas Painting for Beginners', duration:'~35 min', cat:'Ariwork' },
  { title:'Resin Art Introduction', duration:'~26 min', cat:'Ariwork' },
]
const CAT_COLOR = { Mehndi: C.green, Makeup: C.pink, Ariwork: C.purple }

function YouTubePlaylistWidget({ playlistId }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const embedSrc = `https://www.youtube.com/embed/videoseries?list=${playlistId}&index=${activeIdx + 1}&rel=0&modestbranding=1`

  return (
    <div style={{
      display:'flex', borderRadius:20, overflow:'hidden',
      boxShadow:'0 12px 48px rgba(0,0,0,0.4)', background:'#0f0f0f',
      flexWrap:'wrap', minHeight:320,
    }}>
      {/* ── Video player ── */}
      <div style={{ flex:'1 1 58%', minWidth:260, position:'relative', background:'#000' }}>
        <div style={{ position:'relative', paddingBottom:'56.25%', height:0 }}>
          <iframe
            key={activeIdx}
            style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none' }}
            src={embedSrc}
            title="Kajol Makeover Studioz Classes"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {/* Now playing label */}
        <div style={{ padding:'10px 14px', background:'#111' }}>
          <div style={{ fontSize:12, color:'#aaa', marginBottom:2, textTransform:'uppercase', letterSpacing:.8 }}>Now Playing</div>
          <div style={{ fontSize:14, color:'#fff', fontWeight:700, lineHeight:1.4 }}>
            {PLAYLIST_ITEMS[activeIdx]?.title || 'Class Video'}
          </div>
        </div>
      </div>

      {/* ── Playlist sidebar ── */}
      <div style={{ flex:'0 1 260px', minWidth:200, background:'#1a1a1a', maxHeight:380, overflowY:'auto', display:'flex', flexDirection:'column' }}>
        {/* Header */}
        <div style={{ padding:'12px 14px', borderBottom:'1px solid #2d2d2d', position:'sticky', top:0, background:'#111', zIndex:1 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#fff', letterSpacing:1, textTransform:'uppercase' }}>
            📋 Class Playlist
          </div>
          <div style={{ fontSize:10, color:'#888', marginTop:3 }}>{PLAYLIST_ITEMS.length} videos</div>
        </div>
        {/* Video list */}
        {PLAYLIST_ITEMS.map((v, i) => {
          const isActive = i === activeIdx
          const catC = CAT_COLOR[v.cat] || C.pink
          return (
            <div key={i} onClick={() => setActiveIdx(i)} style={{
              padding:'10px 12px', borderBottom:'1px solid #232323',
              cursor:'pointer', display:'flex', gap:10, alignItems:'flex-start',
              background: isActive ? '#1e0a0e' : 'transparent',
              borderLeft: isActive ? `3px solid ${C.pink}` : '3px solid transparent',
              transition:'all .12s',
            }}>
              {/* Number / play indicator */}
              <div style={{
                width:30, height:30, borderRadius:'50%', flexShrink:0,
                background: isActive ? C.pink : '#2d2d2d',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:12, color:'#fff', fontWeight:800,
              }}>
                {isActive ? '▶' : i + 1}
              </div>
              <div style={{ minWidth:0, flex:1 }}>
                <div style={{
                  fontSize:12, fontWeight: isActive ? 700 : 400,
                  color: isActive ? '#fff' : '#ccc', lineHeight:1.4,
                  overflow:'hidden', textOverflow:'ellipsis',
                  display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
                }}>
                  {v.title}
                </div>
                <div style={{ display:'flex', gap:6, marginTop:4, alignItems:'center' }}>
                  <span style={{ fontSize:9, background:catC+'33', color:catC, borderRadius:5, padding:'1px 6px', fontWeight:700 }}>{v.cat}</span>
                  <span style={{ fontSize:10, color:'#666' }}>{v.duration}</span>
                </div>
              </div>
            </div>
          )
        })}
        {/* Open in YouTube */}
        <a href={`https://www.youtube.com/playlist?list=${playlistId}`} target="_blank" rel="noopener noreferrer"
          style={{ margin:'10px 12px', padding:'9px 12px', borderRadius:10, background:C.yt, color:'#fff', textDecoration:'none', fontSize:12, fontWeight:700, textAlign:'center', display:'block' }}>
          ▶ Open Full Channel
        </a>
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


/* ── FAQ Item (collapsible, used for SEO rich snippets) ── */
function FAQItem({q,a}) {
  const [open,setOpen]=useState(false)
  return (
    <div style={{marginBottom:10,background:C.white,borderRadius:14,border:`1px solid ${C.pinkPale}`,overflow:'hidden'}}>
      <button onClick={()=>setOpen(!open)} style={{
        width:'100%',padding:'14px 18px',background:'none',border:'none',
        display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',
        fontFamily:'inherit',textAlign:'left',
      }}>
        <span style={{fontSize:14,fontWeight:700,color:C.dark,lineHeight:1.4}}>{q}</span>
        <span style={{fontSize:20,color:C.pink,flexShrink:0,marginLeft:12,transition:'transform .2s',transform:open?'rotate(45deg)':'rotate(0deg)'}}>+</span>
      </button>
      {open&&<div style={{padding:'0 18px 16px',fontSize:13,color:C.grey,lineHeight:1.8,borderTop:`1px solid ${C.pinkPale}`}}>{a}</div>}
    </div>
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
    {href:'#book',    label:'Book Me'},
    {href:'#gallery', label:'Gallery'},
    {href:'#reviews', label:'Reviews'},
    {href:'#pay',     label:'Pay Fee'},
    {href:'#contact', label:'Contact'},
  ]

  return (
    <div>
      <SEOHead/>
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


      {/* ══════════════ INDIVIDUAL ARTIST — Pune Bookings ══════════════ */}
      <Section id="book" style={{background:`linear-gradient(135deg,${C.pinkPale} 0%,#fff 50%,${C.greenPale} 100%)`}}>
        <SectionTitle emoji="🌸" title="Book Kajol for Your Event" accent
          subtitle="Individual artist services in Pune — Bridal Mehndi, Makeup & Ariwork for your special day"/>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:18,marginBottom:28}}>
          {[
            {emoji:'🌿',title:'Bridal Mehndi',desc:'Traditional, Arabic, Indo-western & contemporary bridal mehndi at your venue or home',badge:'Home visits available'},
            {emoji:'💄',title:'Bridal Makeup',desc:'HD, airbrush, natural & party makeup for brides, bridesmaids & all occasion looks',badge:'Trial session available'},
            {emoji:'🎨',title:'Ariwork for Events',desc:'Custom mandala backdrops, rangoli, canvas art & décor for weddings & celebrations',badge:'Custom quotes'},
          ].map(s=>(
            <div key={s.title} style={{background:C.white,borderRadius:20,padding:22,boxShadow:'0 4px 20px rgba(233,30,140,0.09)',border:`1px solid ${C.pinkPale}`,textAlign:'center'}}>
              <div style={{fontSize:44,marginBottom:12}}>{s.emoji}</div>
              <div style={{fontSize:16,fontWeight:900,color:C.dark,marginBottom:8}}>{s.title}</div>
              <div style={{fontSize:13,color:C.grey,lineHeight:1.7,marginBottom:12}}>{s.desc}</div>
              <div style={{display:'inline-block',background:C.pinkPale,color:C.pink,borderRadius:20,padding:'4px 12px',fontSize:11,fontWeight:700}}>{s.badge}</div>
            </div>
          ))}
        </div>
        <div style={{background:C.white,borderRadius:20,padding:24,boxShadow:'0 4px 20px rgba(233,30,140,0.09)',border:`1px solid ${C.pinkPale}`,maxWidth:540,margin:'0 auto',textAlign:'center'}}>
          <div style={{fontSize:13,color:C.grey,marginBottom:8}}>📍 Serving all Pune areas: Baner · Kothrud · Hadapsar · Wakad · Hinjewadi · Viman Nagar · Aundh · Koregaon Park · Deccan · Pimpri-Chinchwad · Katraj · Sinhagad Road & nearby</div>
          <div style={{fontSize:14,fontWeight:700,color:C.dark,marginBottom:16}}>Get a personalised quote for your event</div>
          <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
            <a href={`https://wa.me/918390695155?text=${encodeURIComponent("Hi Kajol Maam! 🌸 I would like to book your services for my event in Pune. Please share your availability and charges.")}`}
              target="_blank" rel="noopener noreferrer"
              style={{padding:'12px 22px',borderRadius:14,background:C.wa,color:'#fff',fontWeight:700,fontSize:14,textDecoration:'none',display:'flex',alignItems:'center',gap:8}}>
              💬 WhatsApp to Book
            </a>
            <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer"
              style={{padding:'12px 22px',borderRadius:14,background:`linear-gradient(135deg,#e6683c,#cc2366)`,color:'#fff',fontWeight:700,fontSize:14,textDecoration:'none'}}>
              📸 View Portfolio
            </a>
          </div>
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
            items={sc('course_combined_items',"Mehndi + Makeup + Ariwork|Flexible batch timings|Special bundle pricing|Priority support from Kajol Maam|Freelance career guidance").split('|')}/>
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


      {/* ══════════════ FAQ — Google Rich Snippets + SEO ══════════════ */}
      <Section bg={C.greyL}>
        <SectionTitle emoji="❓" title="Frequently Asked Questions" accent
          subtitle="Everything you need to know before enrolling"/>
        <div style={{maxWidth:700,margin:'0 auto'}}>
          {[
            {q:'Are the classes conducted online or offline?',a:"All classes are conducted live online via Zoom. Recordings are uploaded to YouTube so you never miss a session and can revise anytime."},
            {q:'Do I need prior experience to join?',a:"No experience needed! Our courses start from absolute basics and gradually move to advanced techniques. Anyone can join — homemakers, students, working professionals."},
            {q:'What equipment/kit do I need?',a:"We guide you on the exact materials needed for each course. Basic kits are affordable and available locally. We share detailed lists before class begins."},
            {q:'How long are the courses?',a:"Course durations vary — Mehndi is 10 days, Makeup is monthly, Ariwork varies by module. Check each course for details or WhatsApp us to know more."},
            {q:'Will I receive a certificate?',a:"Yes! Every student receives a certificate of completion from Kajol Makeover Studioz after successfully finishing the course."},
            {q:'Can I join from outside Pune?',a:"Absolutely! Our online classes welcome students from anywhere in India. The enrollment form is free and open to all."},
            {q:'What are the class timings?',a:"Batches are scheduled at convenient timings like morning, afternoon and evening. Timings are shared once you are added to a batch."},
            {q:'Is the course fee refundable?',a:"Please contact Kajol Ma'am directly on WhatsApp to discuss fees and payment terms before enrolling."},
          ].map((faq,i)=>(
            <FAQItem key={i} q={faq.q} a={faq.a}/>
          ))}
        </div>
      </Section>


      {/* ══════════════ UPI PAYMENT ══════════════ */}
      <Section id="pay" bg={C.white} style={{padding:'48px 16px'}}>
        <SectionTitle emoji="💳" title="Pay Course Fee" accent
          subtitle="Secure UPI payment — scan QR or send to UPI ID"/>
        <div style={{maxWidth:480,margin:'0 auto'}}>
          <div style={{background:`linear-gradient(135deg,${C.pinkPale},${C.greenPale})`,borderRadius:24,padding:28,textAlign:'center',boxShadow:'0 4px 24px rgba(233,30,140,0.1)',border:`1px solid ${C.pinkPale}`}}>
            {/* QR Code — hosted image */}
            <div style={{background:'#fff',borderRadius:16,padding:16,marginBottom:16,display:'inline-block',boxShadow:'0 2px 12px rgba(0,0,0,0.1)'}}>
              <img
                src="/upi-qr.jpg"
                alt="UPI QR Code — Kajol Makeover Studioz"
                style={{width:200,height:200,display:'block',borderRadius:8}}
                onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='flex'}}
              />
              {/* Fallback if image not uploaded yet */}
              <div style={{width:200,height:200,display:'none',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:8,borderRadius:8,background:C.greyL}}>
                <div style={{fontSize:48}}>📱</div>
                <div style={{fontSize:12,color:C.grey,textAlign:'center'}}>QR Code<br/>coming soon</div>
              </div>
            </div>
            <div style={{marginBottom:6}}>
              <div style={{fontSize:18,fontWeight:900,color:C.dark}}>KAJOL MAKEOVER STUDIOZ</div>
              <div style={{fontSize:13,color:C.grey,marginTop:4}}>UPI ID: <b style={{color:C.dark,userSelect:'all'}}>kajalkambaleaxis@yesg</b></div>
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:14,flexWrap:'wrap'}}>
              {['Google Pay','PhonePe','Paytm','BHIM'].map(app=>(
                <span key={app} style={{fontSize:11,background:C.white,borderRadius:8,padding:'4px 10px',color:C.dark,fontWeight:600,border:`1px solid ${C.pinkPale}`}}>{app}</span>
              ))}
            </div>
            <div style={{marginTop:16,background:C.white,borderRadius:12,padding:'12px 16px',fontSize:12,color:C.grey,lineHeight:1.7}}>
              📌 After payment, please send a screenshot on WhatsApp to confirm your enrollment.
            </div>
            <a href={`https://wa.me/918390695155?text=${encodeURIComponent(`Hi Kajol Maam! I have made the payment for the course. Please find the screenshot attached. Name: [Your Name]`)}`}
              target="_blank" rel="noopener noreferrer"
              style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:14,padding:'12px 20px',borderRadius:14,background:C.wa,color:'#fff',fontWeight:700,fontSize:14,textDecoration:'none',boxShadow:`0 4px 16px ${C.wa}44`}}>
              💬 Send Payment Screenshot on WhatsApp
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
            <div style={{ fontSize:12, opacity:.55 }}>© 2025 Kajol Makeover Studioz by Kajol J Kamble, Pune. All rights reserved.</div>
            <a href={ADMIN_URL} style={{ fontSize:11, opacity:.38, color:'#fff', textDecoration:'none' }}>🔒 Admin</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
