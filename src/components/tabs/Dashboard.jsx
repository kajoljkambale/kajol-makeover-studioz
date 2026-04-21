import React, { useMemo } from 'react'
import { C, fmt, fmtDate, Ic, Card, Row, SectionTitle, StatBox, Badge, Btn, Divider } from '../../lib/ui.jsx'
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
export default function Dashboard({data,setTab}) {
  const tIncome = useMemo(()=>data.payments.reduce((s,p)=>s+Number(p.paid),0)+data.orders.reduce((s,o)=>s+Number(o.paid),0),[data])
  const tExp    = useMemo(()=>data.expenses.reduce((s,e)=>s+Number(e.amount),0)+data.orders.reduce((s,o)=>s+(o.order_expenses||[]).reduce((a,x)=>a+Number(x.amt),0),0),[data])
  const activeBatches = data.batches.filter(b=>b.status==='Active')
  const pendingDues   = data.payments.reduce((s,p)=>s+(Number(p.amount)-Number(p.paid)),0)
  const pendingYT     = data.classes.filter(c=>c.youtube_status!=='Uploaded').length
  const pendingReq    = (data.enrollmentRequests||[]).filter(r=>r.status==='pending').length
  const todayClasses  = data.classes.filter(c=>c.date===today())

  const partialStudents = useMemo(()=>{
    const m={}
    data.payments.forEach(p=>{ const d=Number(p.amount)-Number(p.paid); if(d>0){const s=data.students.find(x=>x.id===p.student_id);if(s)m[s.id]={name:s.name,mobile:s.mobile,due:d,batch:data.batches.find(b=>b.id===p.batch_id)?.name||''}} })
    return Object.values(m)
  },[data])

  const pend=[]
  if(pendingReq>0)   pend.push({icon:'enroll',color:C.pink,text:`${pendingReq} new enrollment request${pendingReq>1?'s':''} awaiting review`,tab:'enroll'})
  if(pendingYT>0)    pend.push({icon:'yt',color:C.yt,text:`${pendingYT} class recording${pendingYT>1?'s':''} pending YouTube upload`,tab:'batches'})
  if(partialStudents.length>0) pend.push({icon:'pay',color:C.amber,text:`${partialStudents.length} student${partialStudents.length>1?'s':''} have pending dues (${fmt(pendingDues)})`,tab:'payments'})
  const noWA=data.batches.filter(b=>b.status==='Active'&&!b.wa_group)
  if(noWA.length)    pend.push({icon:'wa',color:C.wa,text:`${noWA.length} active batch${noWA.length>1?'es':''} missing WhatsApp group link`,tab:'batches'})

  return (
    <div>
      <div style={{background:`linear-gradient(135deg,${C.pink},${C.pinkD},${C.green})`,borderRadius:20,padding:'18px 16px',marginBottom:14,color:'#fff',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-24,right:-24,width:110,height:110,borderRadius:'50%',background:'rgba(255,255,255,0.08)'}}/>
        <div style={{fontSize:13,opacity:.9}}>Welcome,</div>
        <div style={{fontSize:22,fontWeight:900,marginTop:2}}>Kajol J Kamble 💄</div>
        <div style={{fontSize:12,opacity:.85,marginTop:3}}>Makeup · Ariwork · Mehndi Artist</div>
        <Row gap={8} style={{marginTop:12,flexWrap:'wrap'}}>
          <div style={{background:'rgba(255,255,255,0.18)',borderRadius:10,padding:'6px 12px',fontSize:12,display:'flex',alignItems:'center',gap:5}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:'#69FF47',display:'inline-block'}}/>{activeBatches.length} Active Batch{activeBatches.length!==1?'es':''}
          </div>
          {pendingReq>0&&<div onClick={()=>setTab('enroll')} style={{background:'rgba(233,30,140,0.4)',borderRadius:10,padding:'6px 12px',fontSize:12,cursor:'pointer'}}>📋 {pendingReq} New Enrollment{pendingReq>1?'s':''}</div>}
          {todayClasses.length>0&&<div style={{background:'rgba(255,255,255,0.2)',borderRadius:10,padding:'6px 12px',fontSize:12}}>📅 {todayClasses.length} class today</div>}
        </Row>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:14}}>
        <StatBox label="Total Income" value={fmt(tIncome)} color={C.green} icon="rupee"/>
        <StatBox label="Total Expenses" value={fmt(tExp)} color={C.amber} icon="chart"/>
        <StatBox label="Net Profit" value={fmt(tIncome-tExp)} color={C.pink} icon="trend"/>
        <StatBox label="Pending Dues" value={fmt(pendingDues)} color={C.red} icon="alert"/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:9,marginBottom:14}}>
        <StatBox label="Students" value={data.students.length} color={C.purple} icon="students"/>
        <StatBox label="Batches" value={data.batches.length} color={C.blue} icon="batch"/>
        <StatBox label="New Requests" value={pendingReq} color={pendingReq>0?C.pink:C.grey} icon="enroll" onClick={()=>setTab('enroll')}/>
      </div>
      {pend.length>0&&<Card accent={C.amber}>
        <STitle><Ic n="alert" size={15} color={C.amber}/> Pending Activities ({pend.length})</STitle>
        {pend.map((p,i)=>(
          <div key={i} onClick={()=>setTab(p.tab)} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:`1px solid ${C.pinkPale}`,cursor:'pointer'}}>
            <div style={{background:p.color+'18',borderRadius:8,padding:6,flexShrink:0}}><Ic n={p.icon} size={15} color={p.color}/></div>
            <div style={{flex:1,fontSize:13,color:C.dark}}>{p.text}</div>
            <span style={{color:C.grey,fontSize:18}}>›</span>
          </div>
        ))}
      </Card>}
      {todayClasses.length>0&&<Card accent={C.blue}>
        <STitle><Ic n="zoom" size={15} color={C.blue}/> Today's Classes</STitle>
        {todayClasses.map(cl=>{const b=data.batches.find(x=>x.id===cl.batch_id); return(
          <div key={cl.id} style={{padding:'8px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
            <div style={{fontWeight:700,fontSize:13}}>{b?.name||'?'} — Day {cl.day}: {cl.topic}</div>
            <div style={{fontSize:12,color:C.grey}}>{b?.timing}</div>
            {cl.zoom_link&&<a href={cl.zoom_link} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:C.blue,display:'flex',alignItems:'center',gap:4,marginTop:3,textDecoration:'none'}}><Ic n="zoom" size={13} color={C.blue}/> Join Zoom</a>}
          </div>
        )})}
      </Card>}
      {partialStudents.length>0&&<Card accent={C.amber}>
        <STitle><Ic n="bell" size={15} color={C.amber}/> Payment Reminders</STitle>
        {partialStudents.slice(0,4).map((s,i)=>(
          <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
            <div><div style={{fontWeight:700,fontSize:13}}>{s.name}</div><div style={{fontSize:11,color:C.grey}}>{s.batch}</div></div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:13,fontWeight:700,color:C.amber}}>Due: {fmt(s.due)}</div>
              <a href={`https://wa.me/91${s.mobile}?text=${encodeURIComponent('Hi '+s.name+'! Gentle reminder: payment of '+fmt(s.due)+' for '+s.batch+' is pending. — Kajol Maam 💄')}`} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:C.wa,textDecoration:'none',display:'flex',alignItems:'center',gap:3,justifyContent:'flex-end',marginTop:3}}>
                <Ic n="wa" size={11} color={C.wa}/> Remind
              </a>
            </div>
          </div>
        ))}
      </Card>}
      <Card>
        <STitle><Ic n="link" size={15} color={C.pink}/> Quick Links</STitle>
        {[{label:'WhatsApp Community',url:WA_COMMUNITY,icon:'wa',color:C.wa},{label:'Instagram',url:INSTAGRAM,icon:'ig',color:C.ig},{label:'YouTube Channel',url:YOUTUBE,icon:'yt',color:C.yt}].map(l=>(
          <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',textDecoration:'none',color:C.dark,borderBottom:`1px solid ${C.pinkPale}`}}>
            <div style={{background:l.color+'18',borderRadius:9,padding:7,flexShrink:0}}><Ic n={l.icon} size={15} color={l.color}/></div>
            <div style={{fontSize:13,fontWeight:600}}>{l.label}</div>
          </a>
        ))}
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   ENROLLMENT REQUESTS TAB  (admin side)
═══════════════════════════════════════════════════════════════════ */
