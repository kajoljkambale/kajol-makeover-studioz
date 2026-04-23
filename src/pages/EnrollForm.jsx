import React, { useState, useEffect } from 'react'
import { C as _C, uid } from '../lib/ui.jsx'
const C = { ..._C, wa:'#25D366', ig:'#E91E63', yt:'#FF0000' }
import { supabase as sb } from '../lib/supabase.js'

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



const ENROLL_URL   = (typeof window !== 'undefined' ? window.location.origin : 'https://kajol-makeover-studioz.vercel.app') + '/enroll'
const WA_COMMUNITY = 'https://chat.whatsapp.com/Lhq5qzRYJ0z11onVX669a3'
const INSTAGRAM    = 'https://www.instagram.com/kajol_makeover_studioz?igsh=a3h2ZWIzbmM3M3Y3'
const YOUTUBE      = 'https://youtube.com/@kajolmakeoverstudioz?si=IsWwx4ScqJ33ZAqp'
export default function EnrollForm() {
  const [courses,setCourses] = useState([])
  const [batches,setBatches] = useState([])
  const [step,setStep]       = useState('form')   // form | success | error
  const [busy,setBusy]       = useState(false)
  const [form,setForm]       = useState({name:'',mobile:'',email:'',profession:'',address:'',birthday:'',selected_courses:[],selected_batch:'',message:''})

  useEffect(()=>{
    sb.from('courses').select('*').then(({data})=>data&&setCourses(data))
    sb.from('batches').select('*').eq('status','Active').order('created_at').then(({data})=>data&&setBatches(data))
  },[])

  const toggleCourse = id => setForm(f=>({...f,selected_courses:f.selected_courses.includes(id)?f.selected_courses.filter(x=>x!==id):[...f.selected_courses,id]}))

  const submit = async () => {
    if(!form.name.trim()||!form.mobile.trim()){alert('Name and mobile number are required.');return}
    if(form.mobile.replace(/\D/g,'').length<10){alert('Please enter a valid 10-digit mobile number.');return}
    setBusy(true)
    try {
      const row = {id:uid(),name:form.name.trim(),mobile:form.mobile.trim(),email:form.email.trim(),profession:form.profession.trim(),address:form.address.trim(),birthday:form.birthday||null,selected_courses:form.selected_courses,selected_batch:form.selected_batch||null,message:form.message.trim(),status:'pending',created_at:new Date().toISOString()}
      const {error} = await sb.from('enrollment_requests').insert(row)
      if(error) throw error
      setStep('success')
    } catch(e){ console.error(e); setStep('error') }
    setBusy(false)
  }

  const inp = (label,field,type='text',placeholder='') => (
    <div style={{marginBottom:14}}>
      <label style={{fontSize:12,fontWeight:700,color:C.grey,display:'block',marginBottom:5,textTransform:'uppercase',letterSpacing:.5}}>{label}</label>
      <input type={type} value={form[field]||''} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))} placeholder={placeholder}
        style={{width:'100%',padding:'12px 14px',borderRadius:12,border:`1.5px solid ${C.pinkPale}`,fontSize:14,fontFamily:'inherit',outline:'none',color:C.dark,boxSizing:'border-box'}}/>
    </div>
  )

  const GRAD = `linear-gradient(150deg,${C.pink} 0%,${C.pinkD} 40%,${C.green} 100%)`

  if(step==='success') return (
    <div style={{minHeight:'100vh',background:GRAD,display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:"'Nunito',sans-serif"}}>
      <div style={{background:'#fff',borderRadius:24,padding:32,maxWidth:420,width:'100%',textAlign:'center',boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
        <div style={{fontSize:60,marginBottom:12}}>🎉</div>
        <div style={{fontSize:22,fontWeight:900,color:C.dark,marginBottom:8}}>Request Submitted!</div>
        <div style={{fontSize:14,color:C.grey,lineHeight:1.7,marginBottom:20}}>
          Thank you <b>{form.name}</b>! Your enrollment request has been received.<br/>
          Kajol Ma'am will review and contact you on <b>{form.mobile}</b> shortly. 💄
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {[{label:'🟢 Join WhatsApp Community',url:WA_COMMUNITY,bg:C.wa},{label:'📸 Follow on Instagram',url:INSTAGRAM,bg:C.ig},{label:'▶ Subscribe on YouTube',url:YOUTUBE,bg:C.yt}].map(l=>(
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" style={{display:'block',background:l.bg,color:'#fff',borderRadius:12,padding:'12px',textDecoration:'none',fontWeight:700,fontSize:14}}>{l.label}</a>
          ))}
        </div>
        <div style={{fontSize:11,color:C.grey,marginTop:16}}>Kajol Makeover Studioz · Makeup · Ariwork · Mehndi</div>
      </div>
    </div>
  )

  if(step==='error') return (
    <div style={{minHeight:'100vh',background:GRAD,display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:"'Nunito',sans-serif"}}>
      <div style={{background:'#fff',borderRadius:24,padding:32,maxWidth:420,width:'100%',textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:12}}>😔</div>
        <div style={{fontSize:20,fontWeight:800,color:C.dark}}>Something went wrong</div>
        <div style={{fontSize:14,color:C.grey,marginTop:8,marginBottom:20}}>Please try again or contact Kajol Ma'am directly.</div>
        <button onClick={()=>setStep('form')} style={{background:GRAD,color:'#fff',border:'none',borderRadius:12,padding:'12px 24px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Try Again</button>
      </div>
    </div>
  )

  const stepBox = (n,label) => (
    <div style={{fontSize:15,fontWeight:800,color:C.dark,margin:'20px 0 14px',paddingBottom:10,borderBottom:`2px solid ${C.pinkPale}`,display:'flex',alignItems:'center',gap:8}}>
      <span style={{background:`linear-gradient(135deg,${C.pink},${C.pinkD})`,color:'#fff',borderRadius:8,width:28,height:28,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:900,flexShrink:0}}>{n}</span>
      {label}
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:`linear-gradient(160deg,${C.pinkPale} 0%,#fff 40%,${C.greenPale} 100%)`,fontFamily:"'Nunito','Segoe UI',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0;}input:focus,select:focus,textarea:focus{border-color:${C.pink}!important;outline:none;}`}</style>
      {/* Header with new logo */}
      <div style={{background:`linear-gradient(135deg,${C.pink},${C.pinkD})`,padding:'28px 20px',textAlign:'center'}}>
        <div style={{display:'flex',justifyContent:'center',marginBottom:10}}>
          <KMSLogo size={64} light={true}/>
        </div>
        <div style={{fontSize:22,fontWeight:900,color:'#fff',letterSpacing:0.5}}>Kajol Makeover Studioz</div>
        <div style={{fontSize:13,color:'rgba(255,255,255,0.82)',marginTop:5,letterSpacing:1.5,textTransform:'uppercase'}}>Course Enrollment Form</div>
      </div>
      <div style={{maxWidth:500,margin:'0 auto',padding:'24px 16px 48px'}}>
        {/* Welcome */}
        <div style={{background:'#fff',borderRadius:20,padding:20,marginBottom:20,boxShadow:'0 4px 20px rgba(233,30,140,0.1)',border:`1px solid ${C.pinkPale}`}}>
          <div style={{fontSize:16,fontWeight:800,color:C.dark,marginBottom:6}}>Welcome! 🌸</div>
          <div style={{fontSize:13,color:C.grey,lineHeight:1.7}}>Fill in your details below to enroll in our courses. Kajol Ma'am will review your request and add you to the batch. You will receive a WhatsApp confirmation shortly.</div>
        </div>
        {/* Form */}
        <div style={{background:'#fff',borderRadius:20,padding:22,boxShadow:'0 4px 20px rgba(233,30,140,0.1)',border:`1px solid ${C.pinkPale}`}}>
          {stepBox(1,'Personal Details')}
          {inp('Full Name *','name','text','Your full name')}
          {inp('Mobile Number *','mobile','tel','10-digit mobile number')}
          {inp('Email Address','email','email','your@email.com')}
          {inp('Profession / Occupation','profession','text','e.g. Homemaker, Student, Working Professional')}
          {inp('Address / City','address','text','Your city or area')}
          {inp('Date of Birth','birthday','date')}

          {stepBox(2,'Course Selection')}
          {courses.length===0
            ? <div style={{fontSize:13,color:C.grey,padding:16,textAlign:'center',background:C.greyL,borderRadius:12,marginBottom:14}}>Loading courses…</div>
            : <div style={{marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:700,color:C.grey,marginBottom:10,textTransform:'uppercase',letterSpacing:.5}}>Select Courses (can choose multiple)</div>
                {courses.map(c=>{
                  const sel=form.selected_courses.includes(c.id)
                  const [syllOpen,setSyllOpen]=React.useState(false)
                  return (
                    <div key={c.id} style={{borderRadius:14,marginBottom:10,border:`2px solid ${sel?(c.color||C.pink):C.pinkPale}`,background:sel?(c.color||C.pink)+'08':'#fff',overflow:'hidden',transition:'all .2s'}}>
                      <div onClick={()=>toggleCourse(c.id)} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',cursor:'pointer'}}>
                        <div style={{width:22,height:22,borderRadius:6,flexShrink:0,border:`2px solid ${sel?(c.color||C.pink):C.grey}`,background:sel?(c.color||C.pink):'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>
                          {sel&&<span style={{color:'#fff',fontSize:14,fontWeight:900}}>✓</span>}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:14,color:C.dark}}>{c.name}</div>
                          <div style={{fontSize:11,color:C.grey}}>{c.type}{c.fee>0?` · ₹${c.fee}`:''}</div>
                          {c.description&&<div style={{fontSize:11,color:C.grey,marginTop:2}}>{c.description}</div>}
                        </div>
                        {sel&&<span style={{fontSize:18,marginRight:4}}>✅</span>}
                      </div>
                      {c.syllabus&&(
                        <div>
                          <button onClick={e=>{e.stopPropagation();setSyllOpen(!syllOpen)}} style={{width:'100%',padding:'8px 14px',background:(c.color||C.pink)+'15',border:'none',borderTop:`1px solid ${(c.color||C.pink)}30`,cursor:'pointer',fontSize:12,fontWeight:700,color:c.color||C.pink,fontFamily:'inherit',textAlign:'left',display:'flex',alignItems:'center',gap:6}}>
                            📋 {syllOpen?'Hide Syllabus ▲':'View Full Syllabus ▼'}
                          </button>
                          {syllOpen&&(
                            <div style={{padding:'12px 14px',background:(c.color||C.pink)+'08',borderTop:`1px solid ${(c.color||C.pink)}20`}}>
                              <div style={{fontSize:12,fontWeight:700,color:c.color||C.pink,marginBottom:8,textTransform:'uppercase',letterSpacing:.5}}>Course Syllabus</div>
                              <div style={{fontSize:12,color:C.dark,lineHeight:1.9,whiteSpace:'pre-wrap'}}>{c.syllabus}</div>
                              {(c.sub_courses||[]).length>0&&(
                                <div style={{marginTop:10}}>
                                  <div style={{fontSize:11,fontWeight:700,color:c.color||C.pink,marginBottom:6}}>Included Modules:</div>
                                  {(c.sub_courses||[]).map((sc,i)=>(
                                    <div key={i} style={{fontSize:11,color:C.dark,padding:'4px 0',borderBottom:`1px solid ${C.pinkPale}`}}>✦ {sc}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
          }

          {batches.length>0&&(
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,fontWeight:700,color:C.grey,display:'block',marginBottom:5,textTransform:'uppercase',letterSpacing:.5}}>Preferred Batch (optional)</label>
              <select value={form.selected_batch} onChange={e=>setForm(f=>({...f,selected_batch:e.target.value}))} style={{width:'100%',padding:'12px 14px',borderRadius:12,border:`1.5px solid ${C.pinkPale}`,fontSize:14,fontFamily:'inherit',outline:'none',color:C.dark,boxSizing:'border-box'}}>
                <option value="">— Any / Let Kajol Ma'am assign —</option>
                {batches.map(b=><option key={b.id} value={b.id}>{b.name}{b.timing?` — ${b.timing}`:''}{b.schedule?` (${b.schedule})`:''}</option>)}
              </select>
            </div>
          )}

          {stepBox(3,'Message / Questions')}
          <div style={{marginBottom:20}}>
            <textarea value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} placeholder="Any questions or special requirements? (optional)" rows={3}
              style={{width:'100%',padding:'12px 14px',borderRadius:12,border:`1.5px solid ${C.pinkPale}`,fontSize:14,fontFamily:'inherit',outline:'none',color:C.dark,resize:'vertical'}}/>
          </div>

          <button onClick={submit} disabled={busy} style={{width:'100%',padding:16,background:busy?C.greyL:`linear-gradient(135deg,${C.pink},${C.pinkD})`,color:busy?C.grey:'#fff',border:'none',borderRadius:14,fontSize:16,fontWeight:800,cursor:busy?'not-allowed':'pointer',fontFamily:'inherit',boxShadow:busy?'none':`0 6px 20px ${C.pink}55`,transition:'all .2s'}}>
            {busy?'⏳ Submitting…':'🌸 Submit Enrollment Request'}
          </button>
          <div style={{textAlign:'center',fontSize:11,color:C.grey,marginTop:12,lineHeight:1.5}}>By submitting, you agree to be contacted by Kajol Makeover Studioz via WhatsApp.</div>
        </div>
        {/* Footer */}
        <div style={{marginTop:24,textAlign:'center'}}>
          <div style={{fontSize:13,color:C.grey,marginBottom:12,fontWeight:600}}>Follow us on</div>
          <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
            {[{l:'WhatsApp',u:WA_COMMUNITY,bg:C.wa},{l:'Instagram',u:INSTAGRAM,bg:C.ig},{l:'YouTube',u:YOUTUBE,bg:C.yt}].map(x=>(
              <a key={x.u} href={x.u} target="_blank" rel="noopener noreferrer" style={{background:x.bg,color:'#fff',borderRadius:10,padding:'8px 16px',textDecoration:'none',fontSize:12,fontWeight:700}}>{x.l}</a>
            ))}
          </div>
          <div style={{fontSize:11,color:C.grey,marginTop:16}}>💄 Kajol Makeover Studioz © 2025</div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   ADMIN LOGIN
═══════════════════════════════════════════════════════════════════ */
