import React, { useState } from 'react'
import { C, ADMIN_PWD, Ic, Btn, Inp } from '../lib/ui.jsx'
function KMSLogo({size=48,light=false}) {
  /* Artistic logo: circular badge with mehndi cone, makeup brush, ariwork palette
     Three art forms united — Kajol J Kamble, professional artist & teacher */
  const pk   = light ? '#FFB3D9' : '#E91E8C'
  const pkD  = light ? '#FF80C0' : '#C2185B'
  const gr   = light ? '#A5D6A7' : '#2E7D32'
  const pur  = light ? '#CE93D8' : '#6A1B9A'
  const bg   = light ? 'rgba(255,255,255,0.18)' : '#FFF0F6'
  const ring = light ? 'rgba(255,255,255,0.55)' : '#E91E8C'
  const txt  = light ? 'rgba(255,255,255,0.9)' : '#C2185B'
  const s    = size
  return (
    <svg width={s} height={s} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0}}>
      {/* Outer decorative ring */}
      <circle cx="60" cy="60" r="57" fill={bg} stroke={ring} strokeWidth="2.5" strokeDasharray="6 3" opacity="0.7"/>
      {/* Inner circle */}
      <circle cx="60" cy="60" r="48" fill={light?'rgba(255,255,255,0.12)':bg} stroke={ring} strokeWidth="1.2" opacity="0.5"/>

      {/* ── MEHNDI CONE (left, tilted) ── */}
      {/* Cone body */}
      <path d="M30 28 L42 72 L48 72 L38 28 Z" fill={gr} rx="3"/>
      {/* Cone tip */}
      <path d="M42 72 L45 85 L48 72 Z" fill={pkD}/>
      {/* Cone opening (top oval) */}
      <ellipse cx="34" cy="28" rx="7" ry="4" fill={gr} opacity="0.85"/>
      <ellipse cx="34" cy="27" rx="5" ry="2.5" fill="rgba(255,255,255,0.3)"/>
      {/* Mehndi flow from tip — decorative dots */}
      <circle cx="44" cy="89" r="2.5" fill={pk} opacity="0.9"/>
      <circle cx="43" cy="95" r="1.8" fill={pk} opacity="0.65"/>
      <circle cx="44.5" cy="100" r="1.2" fill={pk} opacity="0.4"/>
      {/* Mehndi cone cap band */}
      <rect x="31" y="36" width="12" height="4" rx="2" fill="rgba(255,255,255,0.3)" transform="rotate(-5 37 38)"/>
      {/* Mehndi pattern on cone */}
      <ellipse cx="35" cy="55" rx="2.5" ry="3.5" fill="rgba(255,255,255,0.22)" transform="rotate(-5 35 55)"/>

      {/* ── MAKEUP BRUSH (center, upright) ── */}
      {/* Handle */}
      <rect x="57" y="22" width="6" height="52" rx="3" fill="#8D5524"/>
      <rect x="58" y="22" width="2.5" height="52" rx="1.5" fill="rgba(255,255,255,0.22)"/>
      {/* Metal ferrule */}
      <rect x="56.5" y="65" width="7" height="7" rx="1.5" fill="#B0BEC5"/>
      <rect x="57.5" y="66" width="5" height="1.5" rx="1" fill="rgba(255,255,255,0.35)"/>
      {/* Brush head — soft bristles */}
      <ellipse cx="60" cy="20" rx="8" ry="12" fill={pk}/>
      <ellipse cx="60" cy="17" rx="5.5" ry="8" fill={pkD} opacity="0.7"/>
      <ellipse cx="60" cy="14" rx="3.5" ry="5" fill={pk} opacity="0.9"/>
      {/* Bristle highlights */}
      <path d="M56 10 Q60 6 64 10" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" fill="none"/>
      <path d="M57 13 Q60 10 63 13" stroke="rgba(255,255,255,0.4)" strokeWidth="0.9" fill="none"/>
      {/* Handle bottom cap */}
      <ellipse cx="60" cy="73" rx="3.5" ry="2" fill="#6D4C41"/>

      {/* ── ARIWORK PALETTE (right) ── */}
      {/* Palette body */}
      <path d="M76 35 Q95 30 100 50 Q105 68 90 80 Q82 86 76 78 Q70 70 72 58 Q68 48 76 35Z" fill={pur} opacity="0.85"/>
      <path d="M78 38 Q94 34 98 52 Q102 67 89 77 Q82 82 78 75 Q73 68 75 57 Q72 49 78 38Z" fill={light?'rgba(255,255,255,0.15)':pur} opacity="0.4"/>
      {/* Thumb hole */}
      <ellipse cx="83" cy="73" rx="5" ry="4" fill={bg} opacity="0.9"/>
      {/* Paint dots on palette */}
      <circle cx="85" cy="42" r="4.5" fill={pk}/>
      <circle cx="93" cy="52" r="4" fill={gr}/>
      <circle cx="94" cy="63" r="4" fill="#FF9800"/>
      <circle cx="88" cy="71" r="3.5" fill="#2196F3"/>
      <circle cx="80" cy="67" r="3.5" fill={pkD}/>
      <circle cx="79" cy="55" r="3" fill="#FFEB3B"/>
      {/* Palette shine */}
      <path d="M80 37 Q88 35 94 42" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

      {/* ── Central monogram "KMS" ── */}
      <text x="60" y="108" textAnchor="middle" fontSize="9" fontWeight="800" fill={txt} fontFamily="serif" letterSpacing="2" opacity="0.9">{"KMS"}</text>

      {/* Decorative mehndi petals around edge */}
      {[0,60,120,180,240,300].map((deg,i)=>{
        const rad=deg*Math.PI/180
        const cx=60+50*Math.cos(rad), cy=60+50*Math.sin(rad)
        return <circle key={i} cx={cx} cy={cy} r="2.5" fill={i%2===0?pk:gr} opacity="0.45"/>
      })}
    </svg>
  )
}

function KMSLogoMark({size=40,light=false}) {
  const textColor = light ? '#fff' : '#1A1A2E'
  const subColor  = light ? 'rgba(255,255,255,0.7)' : '#757575'
  return (
    <div style={{display:'flex',alignItems:'center',gap:9}}>
      <KMSLogo size={size} light={light}/>
      <div>
        <div style={{fontSize:13,fontWeight:900,letterSpacing:0.3,lineHeight:1.2,color:light?'#fff':'#E91E8C'}}>Kajol Makeover</div>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:2.2,color:subColor,textTransform:'uppercase'}}>S T U D I O Z</div>
      </div>
    </div>
  )
}
export default function Login({onLogin}) {
  const [pwd,setPwd]=useState(''); const [err,setErr]=useState(''); const [show,setShow]=useState(false)
  const go = () => { if(pwd===ADMIN_PWD) onLogin(); else setErr('Incorrect password.') }
  return (
    <div style={{minHeight:'100vh',background:`linear-gradient(150deg,${C.pink} 0%,${C.pinkD} 35%,${C.green} 100%)`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{textAlign:'center',marginBottom:28}}>
        <div style={{width:90,height:90,borderRadius:'50%',background:'rgba(255,255,255,0.2)',border:'3px solid rgba(255,255,255,0.5)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',fontSize:40}}>💄</div>
        <div style={{fontSize:24,fontWeight:900,color:'#fff',letterSpacing:.5}}>Kajol Makeover Studioz</div>
        <div style={{fontSize:13,color:'rgba(255,255,255,0.85)',marginTop:4}}>Studio Management System</div>
      </div>
      <div style={{background:'rgba(255,255,255,0.97)',borderRadius:24,padding:28,width:'100%',maxWidth:380,boxShadow:'0 24px 64px rgba(0,0,0,0.3)'}}>
        <div style={{fontSize:17,fontWeight:700,color:C.dark,marginBottom:20,display:'flex',alignItems:'center',gap:8}}><Ic n="lock" color={C.pink}/> Admin Login</div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,fontWeight:700,color:C.grey,display:'block',marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>Password</label>
          <div style={{position:'relative'}}>
            <input type={show?'text':'password'} value={pwd} onChange={e=>{setPwd(e.target.value);setErr('')}} onKeyDown={e=>e.key==='Enter'&&go()} placeholder="Enter admin password"
              style={{width:'100%',padding:'11px 44px 11px 14px',borderRadius:12,border:`1.5px solid ${C.pinkPale}`,fontSize:14,fontFamily:'inherit',outline:'none',color:C.dark,boxSizing:'border-box'}}/>
            <div onClick={()=>setShow(!show)} style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',cursor:'pointer',color:C.grey}}><Ic n={show?'eyeOff':'eye'} size={18}/></div>
          </div>
        </div>
        {err&&<div style={{color:C.red,fontSize:13,marginBottom:12,background:C.red+'12',borderRadius:8,padding:'8px 12px'}}>{err}</div>}
        <Btn color={C.pink} onClick={go} full style={{padding:13,fontSize:15}}>Login to Studio →</Btn>
        <div style={{textAlign:'center',marginTop:16,fontSize:11,color:C.grey}}>Kajol Makeover Studioz © 2025</div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════════ */
