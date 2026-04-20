/**
 * KAJOL MAKEOVER STUDIOZ — App.jsx v3.1
 *
 * HOW THIS FILE WORKS
 * ───────────────────
 * • Route  /enroll  → public student enrollment form (no login needed)
 * • Route  /        → full admin app (password protected)
 *
 * This is ONE file.  Drop it into  src/App.jsx  and it handles both routes.
 *
 * SUPABASE TABLES NEEDED
 * ──────────────────────
 * Run  supabase_schema_v3.sql  in your Supabase SQL editor before deploying.
 * The new table is:  enrollment_requests
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

/* ═══════════════════════════════════════════════════════════════════
   SUPABASE
═══════════════════════════════════════════════════════════════════ */
const SB_URL  = import.meta.env.VITE_SUPABASE_URL  || 'https://zlzrdpagpwlrbljfmxzy.supabase.co'
const SB_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_6_AujeG9DfoPxMELnkGCeQ_08K3XEF4'
const sb      = createClient(SB_URL, SB_KEY)

const dbLoad   = async t => { 
  const { data, error } = await sb.from(t).select('*').order('created_at',{ascending:true}); 
  if(error) console.error(t,error.message); 
  return data||[] 
}
const dbUpsert = async (t,d) => {
  const { error } = await sb.from(t).upsert(d,{onConflict:'id'});
  if(error) console.error("Upsert error:", error.message);
}
const dbSave   = async (t,d) => { 
  const { error } = await sb.from(t).upsert(d); 
  if(error) alert("Error saving: "+error.message); 
}
const dbDelete = async (t,id) => { 
  const { error } = await sb.from(t).delete().eq('id',id); 
  if(error) alert("Error deleting: "+error.message); 
}

async function loadAll() {
  const [students,courses,batches,classes,hw,payments,orders,expenses,requests] = await Promise.all([
    dbLoad('students'), dbLoad('courses'), dbLoad('batches'), dbLoad('classes'),
    dbLoad('homework_compliance'), dbLoad('payments'), dbLoad('orders'),
    dbLoad('expenses'), dbLoad('enrollment_requests'),
  ])
  return { students, courses, batches, classes, homeworkCompliance:hw,
           payments, orders, expenses, enrollmentRequests:requests }
}

async function clearAll() {
  for(const t of ['homework_compliance','payments','expenses','orders','classes',
                   'batches','courses','enrollment_requests','students'])
    await sb.from(t).delete().neq('id','__none__')
}

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS & HELPERS
═══════════════════════════════════════════════════════════════════ */
const ADMIN_PWD    = 'kajol2024'
const ENROLL_URL   = 'https://kajol-makeover-studioz.vercel.app/enroll'
const PHONE1       = '8390695155'
const PHONE2       = '7030825125'
const EMAIL_KAJOL  = 'kajoljkambale@gmail.com'
const UPI_ID       = 'kajalkambaleaxis@yesg'  // From QR code
const WA_COMMUNITY = 'https://chat.whatsapp.com/Lhq5qzRYJ0z11onVX669a3'
const INSTAGRAM    = 'https://www.instagram.com/kajol_makeover_studioz?igsh=a3h2ZWIzbmM3M3Y3'
const YOUTUBE      = 'https://youtube.com/@kajolmakeoverstudioz?si=IsWwx4ScqJ33ZAqp'

const uid      = () => crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2)
const today    = () => new Date().toISOString().split('T')[0]
const fmt      = n  => `₹${Number(n||0).toLocaleString('en-IN')}`
const fmtDate  = d  => d ? new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'
const mKey     = d  => d ? d.slice(0,7) : ''
const mLabel   = m  => m ? new Date(m+'-01').toLocaleDateString('en-IN',{month:'long',year:'numeric'}) : ''

const C = {
  pink:'#E91E8C', pinkD:'#C2185B', pinkPale:'#FCE4EC',
  green:'#2E7D32', greenL:'#4CAF50', greenPale:'#E8F5E9',
  white:'#FFFFFF', offWhite:'#FFF8FB', grey:'#757575', greyL:'#F5F5F5',
  dark:'#1A1A2E', amber:'#FF6F00', red:'#D32F2F',
  blue:'#1565C0', teal:'#00695C', purple:'#6A1B9A',
  wa:'#25D366', yt:'#FF0000', ig:'#E91E63',
}

const COURSE_COLORS  = [C.pink,C.green,C.purple,C.teal,C.blue,C.amber]
const COURSE_TYPES   = ['Mehndi','Makeup','Ariwork','Combined']
const ORDER_TYPES    = ['Mehndi','Makeup','Ariwork','Combined']
const SCHEDULE_OPTS  = ['Daily','3 Days/Week','Weekend Only','Tue-Thu-Sat','Mon-Wed-Fri','Custom']
const DURATION_OPTS  = ['10 Days','Monthly','3 Months','Custom']
const EXP_CATS       = ['Advertising','Study Material','Equipment','Mehndi Cones','Makeup Kit','Zoom','Internet','Transport','Other']



/* ═══════════════════════════════════════════════════════════════════
   EXCEL / CSV EXPORT  — students, payments, batch-wise, course-wise
═══════════════════════════════════════════════════════════════════ */
function toCSV(headers,rows){
  const esc=v=>`"${String(v??'').replace(/"/g,'""')}"`
  return [headers.map(esc).join(','),...rows.map(r=>r.map(esc).join(','))].join('\n')
}
function dlCSV(filename,headers,rows){
  const csv='\uFEFF'+toCSV(headers,rows)
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'})
  const url=URL.createObjectURL(blob)
  const a=document.createElement('a');a.href=url;a.download=filename;a.click()
  URL.revokeObjectURL(url)
}
function inRange(d,from,to){
  if(!d) return true
  if(from&&d<from) return false
  if(to&&d>to) return false
  return true
}

function ExportModal({data,onClose}) {
  const [type,setType]=useState('students')
  const [from,setFrom]=useState('')
  const [to,setTo]=useState('')
  const [selBatch,setSelBatch]=useState('all')
  const [selCourse,setSelCourse]=useState('all')

  const run=()=>{
    if(type==='students'){
      const rows=data.students.map(s=>[
        s.name,s.mobile,s.email||'',s.profession||'',s.address||'',
        s.birthday||'',s.join_date||'',
        (s.enrolled_courses||[]).map(cid=>data.courses.find(c=>c.id===cid)?.name||cid).join('; ')
      ])
      dlCSV('students.csv',['Name','Mobile','Email','Profession','Address','Birthday','Join Date','Courses'],rows)
    }
    else if(type==='batch_students'){
      // Batchwise — one row per student per batch
      const batches=selBatch==='all'?data.batches:data.batches.filter(b=>b.id===selBatch)
      const rows=[]
      batches.forEach(b=>{
        const course=data.courses.find(c=>c.id===b.course_id)
        const students=data.students.filter(s=>(b.student_ids||[]).includes(s.id))
        students.forEach(s=>{
          const paid=data.payments.filter(p=>p.student_id===s.id&&p.batch_id===b.id).reduce((a,p)=>a+Number(p.paid),0)
          const due=data.payments.filter(p=>p.student_id===s.id&&p.batch_id===b.id).reduce((a,p)=>a+(Number(p.amount)-Number(p.paid)),0)
          rows.push([b.name,b.timing||'',b.schedule||'',b.status||'',course?.name||'',s.name,s.mobile,s.email||'',s.profession||'',fmt(paid),fmt(due)])
        })
      })
      dlCSV('batch_students.csv',['Batch','Timing','Schedule','Status','Course','Student Name','Mobile','Email','Profession','Paid','Pending'],rows)
    }
    else if(type==='course_students'){
      // Coursewise — one row per student per enrolled course
      const courses=selCourse==='all'?data.courses:data.courses.filter(c=>c.id===selCourse)
      const rows=[]
      courses.forEach(c=>{
        const students=data.students.filter(s=>(s.enrolled_courses||[]).includes(c.id))
        students.forEach(s=>{
          const batches=data.batches.filter(b=>(b.student_ids||[]).includes(s.id))
          rows.push([c.name,c.type||'',s.name,s.mobile,s.email||'',s.profession||'',s.join_date||'',batches.map(b=>b.name).join('; ')])
        })
      })
      dlCSV('course_students.csv',['Course','Type','Student Name','Mobile','Email','Profession','Join Date','Batches'],rows)
    }
    else if(type==='payments'){
      const filtered=data.payments.filter(p=>inRange(p.date,from,to)&&(selBatch==='all'||p.batch_id===selBatch))
      const rows=filtered.map(p=>{
        const s=data.students.find(x=>x.id===p.student_id)
        const b=data.batches.find(x=>x.id===p.batch_id)
        return [s?.name||'',s?.mobile||'',b?.name||'',p.amount,p.paid,Number(p.amount)-Number(p.paid),p.type,p.date,p.note||'']
      })
      dlCSV('payments.csv',['Student','Mobile','Batch','Total Fee','Paid','Due','Type','Date','Note'],rows)
    }
    else if(type==='batch_report'){
      const rows=data.batches.map(b=>{
        const course=data.courses.find(c=>c.id===b.course_id)
        const studentCount=(b.student_ids||[]).length
        const classCount=data.classes.filter(c=>c.batch_id===b.id).length
        const ytDone=data.classes.filter(c=>c.batch_id===b.id&&c.youtube_status==='Uploaded').length
        const income=data.payments.filter(p=>p.batch_id===b.id).reduce((a,p)=>a+Number(p.paid),0)
        const due=data.payments.filter(p=>p.batch_id===b.id).reduce((a,p)=>a+(Number(p.amount)-Number(p.paid)),0)
        return [b.name,course?.name||'',b.status||'',b.timing||'',b.schedule||'',b.start_date||'',b.end_date||'',studentCount,classCount,ytDone,income,due]
      })
      dlCSV('batch_report.csv',['Batch Name','Course','Status','Timing','Schedule','Start','End','Students','Classes','YT Uploaded','Income','Pending Dues'],rows)
    }
    else if(type==='attendance'){
      const batch=selBatch!=='all'?data.batches.find(b=>b.id===selBatch):null
      const classes=batch?data.classes.filter(c=>c.batch_id===batch.id).sort((a,b)=>a.day-b.day):data.classes.sort((a,b)=>a.day-b.day)
      const students=batch?data.students.filter(s=>(batch.student_ids||[]).includes(s.id)):data.students
      const dayHeaders=classes.map(c=>`Day${c.day}: ${c.topic.slice(0,12)}`)
      const rows=students.map(s=>{
        const atts=classes.map(c=>(c.attendees||[]).includes(s.id)?'Present':'Absent')
        const pct=Math.round(atts.filter(x=>x==='Present').length/Math.max(classes.length,1)*100)
        return [s.name,s.mobile,...atts,`${pct}%`]
      })
      dlCSV('attendance.csv',['Student','Mobile',...dayHeaders,'Attendance %'],rows)
    }
    onClose()
  }

  const needsDate=['payments'].includes(type)
  const needsBatch=['batch_students','payments','attendance'].includes(type)
  const needsCourse=['course_students'].includes(type)

  const sel={width:'100%',padding:'10px 12px',borderRadius:10,border:`1.5px solid ${C.pinkPale}`,fontSize:13,fontFamily:'inherit',outline:'none',color:C.dark,boxSizing:'border-box',background:C.white,marginBottom:10}
  const lbl={fontSize:11,fontWeight:700,color:C.grey,display:'block',marginBottom:4,textTransform:'uppercase',letterSpacing:.5}

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',display:'flex',alignItems:'flex-end',zIndex:900}} onClick={onClose}>
      <div style={{background:C.white,borderRadius:'24px 24px 0 0',width:'100%',maxWidth:500,margin:'0 auto',padding:'20px 18px 32px',maxHeight:'85vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:16,fontWeight:700,color:C.dark,marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
          <Ic n="upload" size={16} color={C.green}/> Export to Excel / CSV
        </div>

        <label style={lbl}>Export Type</label>
        <select value={type} onChange={e=>setType(e.target.value)} style={sel}>
          <option value="students">📋 All Students (complete list)</option>
          <option value="batch_students">🎓 Batch-wise Student List</option>
          <option value="course_students">📚 Course-wise Student List</option>
          <option value="payments">💳 Payment Records</option>
          <option value="batch_report">📊 Batch Summary Report</option>
          <option value="attendance">✅ Attendance Sheet</option>
        </select>

        {needsBatch&&<><label style={lbl}>Filter by Batch</label>
          <select value={selBatch} onChange={e=>setSelBatch(e.target.value)} style={sel}>
            <option value="all">All Batches</option>
            {data.batches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
          </select></>}

        {needsCourse&&<><label style={lbl}>Filter by Course</label>
          <select value={selCourse} onChange={e=>setSelCourse(e.target.value)} style={sel}>
            <option value="all">All Courses</option>
            {data.courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select></>}

        {needsDate&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:4}}>
          <div><label style={lbl}>From Date</label><input type="date" value={from} onChange={e=>setFrom(e.target.value)} style={{...sel,marginBottom:0}}/></div>
          <div><label style={lbl}>To Date</label><input type="date" value={to} onChange={e=>setTo(e.target.value)} style={{...sel,marginBottom:0}}/></div>
        </div>}

        <div style={{background:C.greenPale,borderRadius:10,padding:'10px 12px',marginBottom:14,fontSize:12,color:C.green}}>
          ✅ Opens as CSV — open with Microsoft Excel, Google Sheets, or any spreadsheet app.
        </div>

        <div style={{display:'flex',gap:8}}>
          <button onClick={onClose} style={{flex:1,padding:11,borderRadius:10,border:`1.5px solid ${C.pink}`,background:'transparent',color:C.pink,fontWeight:600,cursor:'pointer',fontFamily:'inherit',fontSize:13}}>Cancel</button>
          <button onClick={run} style={{flex:1,padding:11,borderRadius:10,border:'none',background:`linear-gradient(135deg,${C.green},${C.greenL})`,color:'#fff',fontWeight:700,cursor:'pointer',fontFamily:'inherit',fontSize:13}}>⬇ Download</button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   KMS LOGO — hand holding brushes + mehndi cone
   Used in: enrollment form header, admin header, settings
═══════════════════════════════════════════════════════════════════ */
function KMSLogo({size=48,light=false}) {
  const pk   = light ? '#fff'                   : '#E91E8C'
  const nail = light ? 'rgba(255,200,220,0.9)'  : '#E91E8C'
  const hand = light ? 'rgba(255,255,255,0.92)' : '#FFF0F5'
  const hsk  = light ? 'rgba(255,255,255,0.55)' : '#3D1A1A'
  const bru  = light ? 'rgba(255,255,255,0.88)' : '#4A2C2A'
  const bh   = light ? 'rgba(255,255,255,0.6)'  : '#8B6B60'
  const bg   = light ? 'rgba(255,255,255,0.12)' : '#FCE4EC'
  const h = size * 1.2
  return (
    <svg width={size} height={h} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="120" rx="16" fill={bg} opacity="0.5"/>
      {/* === BRUSH 1 — left, angled left === */}
      <rect x="16" y="6" width="9" height="40" rx="4.5" fill={bru} transform="rotate(-20 20 26)"/>
      <ellipse cx="13" cy="9" rx="7" ry="11" fill={bh} transform="rotate(-20 13 9)"/>
      <ellipse cx="13" cy="8" rx="4.5" ry="7.5" fill={bru} opacity="0.5" transform="rotate(-20 13 8)"/>
      <line x1="18" y1="46" x2="16" y2="54" stroke={pk} strokeWidth="3.5" strokeLinecap="round"/>
      {/* === BRUSH 2 — center, nearly upright === */}
      <rect x="44" y="4" width="10" height="42" rx="5" fill={bru} transform="rotate(-3 49 25)"/>
      <ellipse cx="46" cy="7" rx="6" ry="10" fill={bh} transform="rotate(-3 46 7)"/>
      <ellipse cx="46" cy="6" rx="3.8" ry="7" fill={bru} opacity="0.5" transform="rotate(-3 46 6)"/>
      <line x1="50" y1="46" x2="50" y2="54" stroke={pk} strokeWidth="3.5" strokeLinecap="round"/>
      {/* === BRUSH 3 — right, angled right === */}
      <rect x="70" y="7" width="9" height="38" rx="4.5" fill={bru} transform="rotate(18 74 26)"/>
      <ellipse cx="76" cy="9" rx="6.5" ry="10" fill={bh} transform="rotate(18 76 9)"/>
      <ellipse cx="76" cy="8" rx="4" ry="7" fill={bru} opacity="0.5" transform="rotate(18 76 8)"/>
      <line x1="76" y1="45" x2="77" y2="53" stroke={pk} strokeWidth="3.5" strokeLinecap="round"/>
      {/* === HAND / PALM holding brushes === */}
      <path d="M26 55 Q23 66 24 82 Q24 93 36 95 Q50 99 64 95 Q76 93 76 82 L75 55 Q69 51 63 53 Q56 49 50 53 Q44 49 38 53 Q32 49 26 55Z"
        fill={hand} stroke={hsk} strokeWidth="2.5"/>
      {/* Finger/knuckle lines */}
      <path d="M31 62 Q35 58 39 62" stroke={hsk} strokeWidth="1.2" fill="none" opacity="0.35"/>
      <path d="M46 59 Q50 55 54 59" stroke={hsk} strokeWidth="1.2" fill="none" opacity="0.35"/>
      <path d="M61 60 Q64 56 67 60" stroke={hsk} strokeWidth="1.2" fill="none" opacity="0.35"/>
      {/* === NAILS — brand pink matching image === */}
      <ellipse cx="30"   cy="57" rx="5.5" ry="4"   fill={nail}/>
      <ellipse cx="50"   cy="54" rx="5.5" ry="3.8" fill={nail}/>
      <ellipse cx="64.5" cy="55" rx="5" ry="3.5" fill={nail}/>
      <ellipse cx="75"   cy="58" rx="4.5" ry="3.2" fill={nail}/>
      {/* Nail highlights */}
      <ellipse cx="28.5" cy="55.5" rx="2" ry="1.2" fill="rgba(255,255,255,0.45)"/>
      <ellipse cx="48.5" cy="52.8" rx="2" ry="1.2" fill="rgba(255,255,255,0.45)"/>
      <ellipse cx="63"   cy="53.8" rx="1.8" ry="1" fill="rgba(255,255,255,0.45)"/>
      {/* === Mehndi dot accent on wrist === */}
      {[0,1,2,3,4].map(i=>(
        <circle key={i} cx={33+i*8} cy={88} r="1.8" fill={pk} opacity="0.4"/>
      ))}
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

/* ═══════════════════════════════════════════════════════════════════
   ICONS
═══════════════════════════════════════════════════════════════════ */
const IP = {
  home:'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  students:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2',
  batch:'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  pay:'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  chart:'M18 20V10M12 20V4M6 20v-6',
  report:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
  order:'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z',
  add:'M12 5v14M5 12h14',
  edit:'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7',
  del:'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6',
  lock:'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4',
  eye:'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  eyeOff:'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22',
  wa:'M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.07-1.35A9.93 9.93 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z',
  yt:'M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z',
  ig:'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919z',
  zoom:'M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.362a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z',
  bell:'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  search:'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  share:'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13',
  book:'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5z',
  rupee:'M6 3h12M6 8h12M15 3v18M6 13h8.5a4.5 4.5 0 0 0 0-9',
  star:'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  alert:'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  trend:'M23 6l-9.5 9.5-5-5L1 18',
  course:'M22 10v6M2 10l10-5 10 5-10 5z',
  broadcast:'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.37h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.8-1.8a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  settings:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33',
  enroll:'M18 21a8 8 0 0 0-16 0M10 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 11l-4 4-2-2',
  link:'M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3M8 12h8',
  check:'M20 6L9 17l-5-5',
  copy:'M20 9H11a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 1 1 0 0v1',
  info:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 16v-4M12 8h.01',
  upload:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
  expenses:'M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z',
  globe:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  portfolio:'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z',
  certificate:'M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12',
  mappin:'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  mailsend:'M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z',
  phone2:'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.37h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.8-1.8a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
  award2:'M8.21 13.89L7 23l5-3 5 3-1.21-9.12M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z',
  image:'M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z',
  star:'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
}

function Ic({n,size=18,color='currentColor',style:sx}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={sx}>
      <path d={IP[n]||''}/>
      {n==='students'&&<><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>}
      {n==='yt'&&<polygon points="9.5,14.5 15.5,12 9.5,9.5" fill={color} stroke="none"/>}
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SHARED UI
═══════════════════════════════════════════════════════════════════ */
const baseInput = {width:'100%',padding:'10px 12px',borderRadius:10,border:`1.5px solid ${C.pinkPale}`,fontSize:13,fontFamily:'inherit',outline:'none',color:C.dark,boxSizing:'border-box',background:C.white}

function Inp({label,value,onChange,type='text',placeholder,opts,rows,required}) {
  return (
    <div style={{marginBottom:10}}>
      {label&&<label style={{fontSize:11,fontWeight:700,color:C.grey,display:'block',marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>
        {label}{required&&<span style={{color:C.pink}}> *</span>}
      </label>}
      {opts
        ? <select value={value||''} onChange={e=>onChange(e.target.value)} style={baseInput}>
            {opts.map(o=><option key={o.v??o} value={o.v??o}>{o.l??o}</option>)}
          </select>
        : rows
          ? <textarea value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} rows={rows} style={{...baseInput,resize:'vertical'}}/>
          : <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} style={baseInput}/>
      }
    </div>
  )
}

function Btn({children,onClick,color=C.pink,outline,small,full,disabled,style:sx}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background:disabled?C.greyL:outline?'transparent':`linear-gradient(135deg,${color},${color}CC)`,
      color:disabled?C.grey:outline?color:C.white, border:outline?`1.5px solid ${color}`:'none',
      borderRadius:10, padding:small?'7px 12px':'10px 16px', fontSize:small?12:13, fontWeight:600,
      cursor:disabled?'not-allowed':'pointer', display:'inline-flex', alignItems:'center', gap:5,
      width:full?'100%':undefined, justifyContent:full?'center':undefined,
      boxShadow:outline||disabled?'none':`0 4px 12px ${color}44`,
      fontFamily:'inherit', transition:'all .15s', ...sx
    }}>{children}</button>
  )
}

function Badge({children,color=C.pink}) {
  return <span style={{background:color+'18',color,borderRadius:20,padding:'2px 9px',fontSize:11,fontWeight:700,display:'inline-block',whiteSpace:'nowrap'}}>{children}</span>
}

function Card({children,style:sx,accent}) {
  return <div style={{background:C.white,borderRadius:16,padding:15,marginBottom:10,boxShadow:'0 2px 12px rgba(233,30,140,0.07)',border:`1px solid ${C.pinkPale}`,borderLeft:accent?`4px solid ${accent}`:undefined,...sx}}>{children}</div>
}

function Row({children,gap=8,style:sx}) { return <div style={{display:'flex',gap,alignItems:'center',...sx}}>{children}</div> }
function Divider() { return <div style={{height:1,background:C.pinkPale,margin:'10px 0'}}/> }
function STitle({children}) { return <div style={{fontSize:15,fontWeight:700,color:C.dark,marginBottom:12,display:'flex',alignItems:'center',gap:7}}>{children}</div> }

function StatBox({label,value,color,icon,sub,onClick}) {
  return (
    <div onClick={onClick} style={{background:C.white,borderRadius:14,padding:13,boxShadow:'0 2px 10px rgba(0,0,0,0.06)',border:`1px solid ${C.pinkPale}`,flex:1,minWidth:0,cursor:onClick?'pointer':'default'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div style={{minWidth:0}}>
          <div style={{fontSize:10,color:C.grey,fontWeight:700,textTransform:'uppercase',letterSpacing:.5}}>{label}</div>
          <div style={{fontSize:18,fontWeight:800,color,marginTop:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{value}</div>
          {sub&&<div style={{fontSize:10,color:C.grey,marginTop:2}}>{sub}</div>}
        </div>
        {icon&&<div style={{background:color+'15',borderRadius:10,padding:8,flexShrink:0}}><Ic n={icon} size={16} color={color}/></div>}
      </div>
    </div>
  )
}

function Toggle({checked,onChange}) {
  return (
    <div onClick={()=>onChange(!checked)} style={{width:44,height:24,borderRadius:12,background:checked?C.green:C.greyL,cursor:'pointer',position:'relative',transition:'all .2s',flexShrink:0}}>
      <div style={{position:'absolute',top:2,left:checked?22:2,width:20,height:20,borderRadius:'50%',background:C.white,boxShadow:'0 1px 4px rgba(0,0,0,0.3)',transition:'all .2s'}}/>
    </div>
  )
}

function Modal({onClose,children,title}) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',display:'flex',alignItems:'flex-end',zIndex:800,backdropFilter:'blur(4px)'}} onClick={onClose}>
      <div style={{background:C.white,borderRadius:'24px 24px 0 0',width:'100%',maxWidth:520,margin:'0 auto',padding:'20px 18px 32px',maxHeight:'92vh',overflowY:'auto',animation:'slideUp .25s ease'}} onClick={e=>e.stopPropagation()}>
        {title&&<div style={{fontSize:16,fontWeight:700,color:C.dark,marginBottom:14,display:'flex',alignItems:'center',gap:8}}>{title}</div>}
        {children}
      </div>
    </div>
  )
}

function Spinner() {
  return <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:48,flexDirection:'column',gap:12}}>
    <div style={{width:36,height:36,borderRadius:'50%',border:`3px solid ${C.pinkPale}`,borderTopColor:C.pink,animation:'spin .8s linear infinite'}}/>
    <div style={{fontSize:13,color:C.grey}}>Loading your studio…</div>
  </div>
}

function Toast({msg}) {
  return msg?<div style={{position:'fixed',bottom:90,left:'50%',transform:'translateX(-50%)',background:C.dark,color:'#fff',padding:'10px 20px',borderRadius:20,fontSize:13,fontWeight:600,zIndex:9999,whiteSpace:'nowrap',maxWidth:'90vw',textAlign:'center',animation:'fadeIn .2s ease'}}>{msg}</div>:null
}

function DelConfirm({item,onConfirm,onClose}) {
  const [pwd,setPwd]=useState(''); const [err,setErr]=useState('')
  return (
    <Modal onClose={onClose} title={<><Ic n="alert" size={16} color={C.red}/> Confirm Delete</>}>
      <div style={{fontSize:13,color:C.grey,marginBottom:12}}>Admin password required to delete <b>{item}</b>.</div>
      <Inp label="Admin Password" value={pwd} onChange={v=>{setPwd(v);setErr('')}} type="password" placeholder="Enter password"/>
      {err&&<div style={{color:C.red,fontSize:12,marginBottom:8,background:C.red+'12',borderRadius:8,padding:'6px 10px'}}>{err}</div>}
      <Row gap={8}><Btn outline onClick={onClose} full>Cancel</Btn><Btn color={C.red} onClick={()=>{if(pwd===ADMIN_PWD){onConfirm();onClose()}else setErr('Wrong password.')}} full>Delete</Btn></Row>
    </Modal>
  )
}

/* helper: open WA or copy */
function waShare(msg,url) {
  if(url) { navigator.clipboard?.writeText(msg); window.open(url,'_blank') }
  else if(navigator.share) navigator.share({text:msg})
  else { navigator.clipboard?.writeText(msg) }
}

/* ═══════════════════════════════════════════════════════════════════
   PUBLIC ENROLLMENT FORM  (shown at /enroll)
═══════════════════════════════════════════════════════════════════ */
function EnrollForm() {
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
              <select value={form.selected_batch} onChange={e=>setForm(f=>({...f,selected_batch:e.target.value}))} style={{...baseInput}}>
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
function Login({onLogin}) {
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
function Dashboard({data,setTab}) {
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
function EnrollmentTab({data,setData,toast}) {
  const [filter,setFilter] = useState('pending')
  const [modal,setModal]   = useState(null)
  const [form,setForm]     = useState({})
  const [busy,setBusy]     = useState(false)

  const reqs = useMemo(()=>(data.enrollmentRequests||[]).filter(r=>filter==='all'||r.status===filter)
    .sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)),[data.enrollmentRequests,filter])

  const pendCount = (data.enrollmentRequests||[]).filter(r=>r.status==='pending').length

  const approve = async (req,editedForm) => {
    const d = editedForm||req
    setBusy(true)
    const student = {id:uid(),name:d.name,mobile:d.mobile,email:d.email||'',profession:d.profession||'',address:d.address||'',birthday:d.birthday||null,enrolled_courses:d.selected_courses||[],join_date:today()}
    await dbUpsert('students',student)
    const updated = {...req,...(editedForm||{}),status:'approved',approved_student_id:student.id}
    await dbUpsert('enrollment_requests',updated)
    setData(p=>({...p,students:[...p.students,student],enrollmentRequests:p.enrollmentRequests.map(r=>r.id===req.id?updated:r)}))
    setBusy(false); setModal(null); toast(`✅ ${student.name} approved & added to Students!`)
  }

  const reject = async (req) => {
    const updated={...req,status:'rejected'}
    await dbUpsert('enrollment_requests',updated)
    setData(p=>({...p,enrollmentRequests:p.enrollmentRequests.map(r=>r.id===req.id?updated:r)}))
    toast('Request rejected.')
  }

  const sColor = s=>s==='pending'?C.amber:s==='approved'?C.green:C.red

  return (
    <div>
      {/* Share enrollment link */}
      <Card accent={C.pink}>
        <STitle><Ic n="link" size={15} color={C.pink}/> Student Enrollment Link</STitle>
        <div style={{fontSize:12,color:C.grey,marginBottom:10}}>Share this link with potential students. Their form data automatically appears below for your review.</div>
        <div style={{background:C.pinkPale,borderRadius:10,padding:'10px 12px',fontSize:12,fontWeight:700,wordBreak:'break-all',marginBottom:12}}>🔗 {ENROLL_URL}</div>
        <Row gap={8} style={{flexWrap:'wrap'}}>
          <Btn small onClick={()=>{navigator.clipboard?.writeText(ENROLL_URL);toast('Link copied!')}}>
            <Ic n="copy" size={13} color={C.white}/>Copy Link
          </Btn>
          <Btn small color={C.wa} onClick={()=>{
            const m=`🌸 *Enroll in Kajol Makeover Studioz!*\n\nClick to fill your enrollment form:\n${ENROLL_URL}\n\nCourses: Mehndi • Makeup • Ariwork\n\n— Kajol Ma'am 💄`
            navigator.share?navigator.share({text:m}):(navigator.clipboard?.writeText(m),toast('Copied!'))
          }}><Ic n="wa" size={13} color={C.white}/>Share on WhatsApp</Btn>
          <a href={ENROLL_URL} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>
            <Btn small outline>Preview Form</Btn>
          </a>
        </Row>
      </Card>

      {/* Filter tabs */}
      <Row gap={6} style={{marginBottom:12}}>
        {['pending','approved','rejected','all'].map(s=>(
          <div key={s} onClick={()=>setFilter(s)} style={{padding:'6px 14px',borderRadius:20,cursor:'pointer',background:filter===s?C.pink:C.greyL,color:filter===s?C.white:C.grey,fontSize:12,fontWeight:filter===s?700:500,position:'relative',flexShrink:0}}>
            {s.charAt(0).toUpperCase()+s.slice(1)}
            {s==='pending'&&pendCount>0&&<span style={{position:'absolute',top:-4,right:-4,background:C.red,color:'#fff',borderRadius:'50%',width:16,height:16,fontSize:9,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center'}}>{pendCount}</span>}
          </div>
        ))}
      </Row>

      {reqs.length===0&&<div style={{textAlign:'center',color:C.grey,padding:40,background:C.white,borderRadius:16}}>
        <div style={{fontSize:36,marginBottom:8}}>📋</div>
        <div style={{fontWeight:700}}>No {filter} requests</div>
        <div style={{fontSize:13,marginTop:4}}>Share the enrollment link to receive student requests</div>
      </div>}

      {reqs.map(req=>{
        const courseNames=(req.selected_courses||[]).map(cid=>data.courses.find(c=>c.id===cid)?.name).filter(Boolean)
        const batchName=data.batches.find(b=>b.id===req.selected_batch)?.name
        return (
          <Card key={req.id} accent={sColor(req.status)}>
            <Row style={{justifyContent:'space-between',marginBottom:8}}>
              <div>
                <div style={{fontWeight:800,fontSize:15,color:C.dark}}>{req.name}</div>
                <div style={{fontSize:12,color:C.grey}}>📱 {req.mobile}</div>
                {req.email&&<div style={{fontSize:11,color:C.grey}}>✉️ {req.email}</div>}
              </div>
              <Badge color={sColor(req.status)}>{req.status}</Badge>
            </Row>
            {req.profession&&<div style={{fontSize:12,color:C.grey,marginBottom:2}}>💼 {req.profession}</div>}
            {req.address&&<div style={{fontSize:12,color:C.grey,marginBottom:2}}>📍 {req.address}</div>}
            {courseNames.length>0&&<Row gap={5} style={{flexWrap:'wrap',marginBottom:6}}>{courseNames.map(n=><Badge key={n} color={data.courses.find(c=>c.name===n)?.color||C.pink}>{n}</Badge>)}</Row>}
            {batchName&&<div style={{fontSize:12,color:C.blue,marginBottom:4}}>📦 Preferred batch: {batchName}</div>}
            {req.message&&<div style={{fontSize:12,color:C.dark,background:C.greyL,borderRadius:8,padding:'6px 10px',marginBottom:8}}>💬 {req.message}</div>}
            <div style={{fontSize:11,color:C.grey,marginBottom:10}}>Submitted: {req.created_at?new Date(req.created_at).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—'}</div>

            {req.status==='pending'&&<Row gap={7} style={{flexWrap:'wrap'}}>
              <Btn small color={C.green} onClick={()=>approve(req)} disabled={busy}><Ic n="check" size={13} color={C.white}/>Approve & Add</Btn>
              <Btn small outline onClick={()=>{setForm({...req,enrolled_courses:req.selected_courses||[]});setModal('edit_'+req.id)}}>✏️ Edit & Approve</Btn>
              <Btn small color={C.red} onClick={()=>reject(req)}>Reject</Btn>
              <a href={`https://wa.me/91${req.mobile}?text=${encodeURIComponent('Hi '+req.name+'! 🌸 We received your enrollment request for Kajol Makeover Studioz. We will contact you shortly with batch details.\n\n— Kajol Maam 💄')}`} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>
                <Btn small color={C.wa}><Ic n="wa" size={12} color={C.white}/>Contact</Btn>
              </a>
            </Row>}
            {req.status==='approved'&&<div style={{fontSize:12,color:C.green,display:'flex',alignItems:'center',gap:5}}><Ic n="check" size={13} color={C.green}/>Added to Students tab</div>}

            {modal==='edit_'+req.id&&<Modal onClose={()=>setModal(null)} title={<><Ic n="enroll" color={C.green}/> Edit & Approve</>}>
              <div style={{fontSize:12,color:C.grey,marginBottom:10,background:C.greenPale,borderRadius:8,padding:'8px 10px'}}>Review and edit student details before approving.</div>
              {[['name','Full Name *'],['mobile','Mobile *'],['email','Email'],['profession','Profession'],['address','Address']].map(([f,lbl])=><Inp key={f} label={lbl} value={form[f]} onChange={v=>setForm(x=>({...x,[f]:v}))}/>)}
              <Inp label="Birthday" value={form.birthday} onChange={v=>setForm(x=>({...x,birthday:v}))} type="date"/>
              <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Courses</div>
              {data.courses.map(c=>(
                <label key={c.id} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,marginBottom:6,cursor:'pointer'}}>
                  <input type="checkbox" checked={(form.enrolled_courses||[]).includes(c.id)} onChange={e=>{const cur=form.enrolled_courses||[];setForm(x=>({...x,enrolled_courses:e.target.checked?[...cur,c.id]:cur.filter(id=>id!==c.id)}))}}/>
                  <Badge color={c.color||C.pink}>{c.name}</Badge>
                </label>
              ))}
              <Row gap={8} style={{marginTop:12}}>
                <Btn outline onClick={()=>setModal(null)} full>Cancel</Btn>
                <Btn color={C.green} onClick={()=>approve(req,{...form,selected_courses:form.enrolled_courses||[]})} full disabled={busy}>{busy?'Adding…':'✅ Approve & Add'}</Btn>
              </Row>
            </Modal>}
          </Card>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   STUDENTS TAB
═══════════════════════════════════════════════════════════════════ */
function StudentsTab({data,setData,toast}) {
  const [modal,setModal]=useState(null); const [del,setDel]=useState(null)
  const [search,setSearch]=useState(''); const [fb,setFb]=useState('all'); const [fc,setFc]=useState('all')
  const [form,setForm]=useState({}); const [enrollM,setEnrollM]=useState(null); const [busy,setBusy]=useState(false)
  const [showExport,setShowExport]=useState(false)

  const list = useMemo(()=>data.students.filter(s=>{
    const ms=s.name?.toLowerCase().includes(search.toLowerCase())||s.mobile?.includes(search)
    const mb=fb==='all'||data.batches.find(b=>b.id===fb&&(b.student_ids||[]).includes(s.id))
    const mc=fc==='all'||(s.enrolled_courses||[]).includes(fc)
    return ms&&mb&&mc
  }),[data,search,fb,fc])

  const save = async () => {
    if(!form.name||!form.mobile)return alert('Name and mobile required.')
    setBusy(true)
    const row={id:form.id||uid(),name:form.name,mobile:form.mobile,email:form.email||'',profession:form.profession||'',address:form.address||'',birthday:form.birthday||null,enrolled_courses:form.enrolled_courses||[],join_date:form.join_date||today(),created_at:form.created_at||new Date().toISOString()}
    await dbUpsert('students',row)
    setData(d=>({...d,students:form.id?d.students.map(s=>s.id===form.id?{...s,...row}:s):[...d.students,row]}))
    setBusy(false); setModal(null); toast('Student saved!')
  }

  const enrollBatch = async (sid,bid,enroll) => {
    const b=data.batches.find(x=>x.id===bid); if(!b) return
    const ids=enroll?[...new Set([...(b.student_ids||[]),sid])]:(b.student_ids||[]).filter(i=>i!==sid)
    const updated={...b,student_ids:ids}
    await dbUpsert('batches',updated)
    setData(d=>({...d,batches:d.batches.map(x=>x.id===bid?updated:x)}))
    toast(enroll?'Enrolled!':'Unenrolled.')
  }

  return (
    <div>
      {/* Enrollment link banner */}
      <div style={{background:`linear-gradient(135deg,${C.pink}12,${C.green}08)`,borderRadius:14,padding:'12px 14px',marginBottom:12,border:`1px dashed ${C.pink}50`}}>
        <div style={{fontSize:12,fontWeight:700,color:C.pink,marginBottom:5}}>📲 New Student Enrollment Link</div>
        <div style={{fontSize:11,color:C.grey,marginBottom:8}}>Share with new students — their form data auto-appears in the Enrollment tab for your review.</div>
        <Row gap={7}>
          <Btn small onClick={()=>{navigator.clipboard?.writeText(ENROLL_URL);toast('Link copied!')}}>
            <Ic n="copy" size={12} color={C.white}/>Copy
          </Btn>
          <Btn small color={C.wa} onClick={()=>{const m=`🌸 Enroll for our courses!\n${ENROLL_URL}\n— Kajol Ma'am 💄`;navigator.share?navigator.share({text:m}):(navigator.clipboard?.writeText(m),toast('Copied!'))}}>
            <Ic n="wa" size={12} color={C.white}/>Share
          </Btn>
        </Row>
      </div>

      <div style={{position:'relative',marginBottom:8}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search students…"
          style={{width:'100%',padding:'10px 12px 10px 36px',borderRadius:10,border:`1.5px solid ${C.pinkPale}`,fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/>
        <span style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)'}}><Ic n="search" size={15} color={C.grey}/></span>
      </div>
      <Row gap={8} style={{marginBottom:12}}>
        <select value={fb} onChange={e=>setFb(e.target.value)} style={{flex:1,padding:'8px 10px',borderRadius:9,border:`1.5px solid ${C.pinkPale}`,fontSize:12,fontFamily:'inherit',outline:'none',color:C.dark}}>
          <option value="all">All Batches</option>{data.batches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={fc} onChange={e=>setFc(e.target.value)} style={{flex:1,padding:'8px 10px',borderRadius:9,border:`1.5px solid ${C.pinkPale}`,fontSize:12,fontFamily:'inherit',outline:'none',color:C.dark}}>
          <option value="all">All Courses</option>{data.courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <Btn small onClick={()=>{setForm({name:'',mobile:'',email:'',profession:'',address:'',birthday:'',enrolled_courses:[]});setModal('add')}}>
          <Ic n="add" size={14} color={C.white}/>Add
        </Btn>
        <Btn small color={C.green} onClick={()=>setShowExport(true)}>
          <Ic n="upload" size={13} color={C.white}/>Export
        </Btn>
      </Row>
      <div style={{fontSize:12,color:C.grey,marginBottom:8}}>{list.length} student{list.length!==1?'s':''}</div>

      {list.map(s=>{
        const paid=data.payments.filter(p=>p.student_id===s.id).reduce((a,p)=>a+Number(p.paid),0)
        const due=data.payments.filter(p=>p.student_id===s.id).reduce((a,p)=>a+(Number(p.amount)-Number(p.paid)),0)
        const batches=data.batches.filter(b=>(b.student_ids||[]).includes(s.id))
        const cNames=(s.enrolled_courses||[]).map(cid=>data.courses.find(c=>c.id===cid)?.name).filter(Boolean)
        return (
          <Card key={s.id}>
            <Row gap={12}>
              <div style={{width:46,height:46,borderRadius:'50%',background:`linear-gradient(135deg,${C.pink},${C.pinkD})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:19,flexShrink:0}}>{(s.name||'?')[0]}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:14,color:C.dark}}>{s.name}</div>
                <div style={{fontSize:12,color:C.grey}}>📱 {s.mobile}</div>
                <div style={{fontSize:11,color:C.grey}}>{s.profession}</div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:13,fontWeight:700,color:C.green}}>{fmt(paid)}</div>
                {due>0&&<div style={{fontSize:11,color:C.amber}}>Due: {fmt(due)}</div>}
              </div>
            </Row>
            <Divider/>
            {s.birthday&&<div style={{fontSize:11,color:C.grey,marginBottom:4}}>🎂 {fmtDate(s.birthday)}</div>}
            {cNames.length>0&&<Row gap={5} style={{flexWrap:'wrap',marginBottom:6}}>{cNames.map(n=><Badge key={n} color={data.courses.find(c=>c.name===n)?.color||C.pink}>{n}</Badge>)}</Row>}
            {batches.length>0&&<div style={{fontSize:11,color:C.grey,marginBottom:8}}>Batches: {batches.map(b=>b.name).join(', ')}</div>}
            <Row gap={7} style={{flexWrap:'wrap'}}>
              <Btn small outline onClick={()=>{setForm({...s,enrolled_courses:s.enrolled_courses||[]});setModal('edit_'+s.id)}}>✏️</Btn>
              <Btn small color={C.blue} onClick={()=>setEnrollM(s.id)}>📚 Enroll</Btn>
              <a href={`https://wa.me/91${s.mobile}`} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}><Btn small color={C.wa}><Ic n="wa" size={12} color={C.white}/>WA</Btn></a>
              <Btn small color={C.red} onClick={()=>setDel(s)}>🗑️</Btn>
            </Row>
            {modal===('edit_'+s.id)&&<Modal onClose={()=>setModal(null)} title={<><Ic n="edit" color={C.pink}/> Edit Student</>}>
              {[['name','Full Name *'],['mobile','Mobile *'],['profession','Profession'],['address','Address'],['email','Email']].map(([f,lbl])=><Inp key={f} label={lbl} value={form[f]} onChange={v=>setForm(x=>({...x,[f]:v}))}/>)}
              <Inp label="Birthday" value={form.birthday} onChange={v=>setForm(x=>({...x,birthday:v}))} type="date"/>
              <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Courses</div>
              {data.courses.map(c=><label key={c.id} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,marginBottom:6,cursor:'pointer'}}><input type="checkbox" checked={(form.enrolled_courses||[]).includes(c.id)} onChange={e=>{const cur=form.enrolled_courses||[];setForm(x=>({...x,enrolled_courses:e.target.checked?[...cur,c.id]:cur.filter(i=>i!==c.id)}))}}/>  <Badge color={c.color||C.pink}>{c.name}</Badge></label>)}
              <Row gap={8} style={{marginTop:10}}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn onClick={save} full disabled={busy}>{busy?'Saving…':'Save'}</Btn></Row>
            </Modal>}
            {enrollM===s.id&&<Modal onClose={()=>setEnrollM(null)} title={<><Ic n="course" color={C.blue}/> Enroll {s.name}</>}>
              {data.batches.map(b=>{const enrolled=(b.student_ids||[]).includes(s.id);const c=data.courses.find(x=>x.id===b.course_id);return(
                <div key={b.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
                  <div><div style={{fontWeight:600,fontSize:13}}>{b.name}</div><div style={{fontSize:11,color:C.grey}}>{c?.name} · {b.timing} · {b.schedule}</div>{b.fee>0&&<div style={{fontSize:11,color:C.green,fontWeight:700}}>₹{b.fee}</div>}</div>
                  <Toggle checked={enrolled} onChange={v=>enrollBatch(s.id,b.id,v)}/>
                </div>
              )})}
              <Btn color={C.green} onClick={()=>setEnrollM(null)} full style={{marginTop:12}}>Done</Btn>
            </Modal>}
          </Card>
        )
      })}
      {list.length===0&&<div style={{textAlign:'center',color:C.grey,padding:32}}>No students found</div>}

      {modal==='add'&&<Modal onClose={()=>setModal(null)} title={<><Ic n="add" color={C.pink}/> Add Student</>}>
        {[['name','Full Name *'],['mobile','Mobile *'],['profession','Profession'],['address','Address'],['email','Email']].map(([f,lbl])=><Inp key={f} label={lbl} value={form[f]} onChange={v=>setForm(x=>({...x,[f]:v}))}/>)}
        <Inp label="Birthday" value={form.birthday} onChange={v=>setForm(x=>({...x,birthday:v}))} type="date"/>
        <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Select Courses</div>
        {data.courses.map(c=><label key={c.id} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,marginBottom:6,cursor:'pointer'}}><input type="checkbox" checked={(form.enrolled_courses||[]).includes(c.id)} onChange={e=>{const cur=form.enrolled_courses||[];setForm(x=>({...x,enrolled_courses:e.target.checked?[...cur,c.id]:cur.filter(i=>i!==c.id)}))}}/>  <Badge color={c.color||C.pink}>{c.name}</Badge></label>)}
        <Row gap={8} style={{marginTop:10}}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn onClick={save} full disabled={busy}>{busy?'Saving…':'Add'}</Btn></Row>
      </Modal>}
      {del&&<DelConfirm item={del.name} onConfirm={async()=>{await dbDelete('students',del.id);setData(d=>({...d,students:d.students.filter(s=>s.id!==del.id)}));toast('Deleted.')}} onClose={()=>setDel(null)}/>}
      {showExport&&<ExportModal data={data} onClose={()=>setShowExport(false)}/>}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   BROADCAST TAB  — Batch Groups + Community + Students
═══════════════════════════════════════════════════════════════════ */
function BroadcastTab({data,toast}) {
  const [section,setSection] = useState('batch')   // batch | community | students | custom
  const [selBatch,setSelBatch] = useState(data.batches[0]?.id||'')
  const [msgType,setMsgType]   = useState('classReminder')
  const [customMsg,setCustomMsg] = useState('')
  const [festival,setFestival]   = useState('Diwali')
  const [listType,setListType]   = useState('all')
  const [selected,setSelected]   = useState([])

  const batch = data.batches.find(b=>b.id===selBatch)
  const nextClass = useMemo(()=>{
    if(!batch) return null
    const t=today(); return data.classes.filter(c=>c.batch_id===batch.id&&c.date>=t).sort((a,b)=>a.date.localeCompare(b.date))[0]||data.classes.filter(c=>c.batch_id===batch.id).sort((a,b)=>b.day-a.day)[0]||null
  },[batch,data.classes])

  /* ── Batch messages ── */
  const batchMsg = type => {
    if(!batch) return ''
    const cl=nextClass
    if(type==='classReminder') return '🌸 *Class Reminder — '+batch.name+'*\n\n'+(cl?'Day '+cl.day+': *'+cl.topic+'*\n📅 Date: '+cl.date+'\n':'')+'⏰ Time: '+(batch.timing||'As scheduled')+'\n🎥 Zoom: '+(cl?.zoom_link||batch.zoom_link||'Link in group')+'\n\n'+(cl?.homework?'📝 Homework: '+cl.homework+'\n\n':'')+'Please join on time! 🙏\n— Kajol Maam 💄'
    if(type==='zoomLink')      return `🎥 *${batch.name} — Zoom Link*\n\nMeeting Link: ${batch.zoom_link||'To be shared'}\nMeeting ID: ${batch.zoom_id||'—'}\n⏰ Time: ${batch.timing||'As scheduled'}\n\n— Kajol Ma'am 💄`
    if(type==='ytReady')       return '🎬 *Recording is Ready!*\n\n'+(cl?'Day '+cl.day+': *'+cl.topic+'*\n▶ '+(cl.youtube_link||'Link coming soon')+'\n':'')+'Watch anytime:\nhttps://youtube.com/@kajolmakeoverstudioz\n\n— Kajol Maam 💄'
    if(type==='homework')      return '📝 *Homework Reminder — '+batch.name+'*\n\n'+(cl?'Day '+cl.day+' HW: *'+(cl.homework||'Check previous class')+'*\n':'')+'Please share your practice photos in this group. ✅\n— Kajol Maam 💄'
    if(type==='payReminder')   return `💳 *Fee Reminder — ${batch.name}*\n\nDear Students,\n\nKindly complete your pending fee payment at your earliest convenience. 🙏\n\nThank you!\n— Kajol Ma'am 💄`
    return ''
  }

  /* ── Community messages ── */
  const communityMsg = type => {
    if(type==='newBatch') {
      const active=data.batches.filter(b=>b.status==='Active'||b.status==='Upcoming')
      return '✨ *New Batch Announcement!*\n\n💄 Kajol Makeover Studioz\n\n'+active.map(b=>'📚 *'+b.name+'*\n⏰ '+(b.timing||'TBD')+' · '+(b.schedule||'')+'\n💰 Fee: '+fmt(b.fee||0)).join('\n\n')+'\n\n🎯 Limited seats — Enroll now!\n🔗 '+ENROLL_URL+'\n\n— Kajol Maam 💄\n📸 '+INSTAGRAM
    }
    if(type==='enrollLink') return `🌸 *Enroll in Our Online Courses!*\n\nMehndi • Makeup • Ariwork\n\n📲 Fill your enrollment form:\n🔗 ${ENROLL_URL}\n\n💄 Online classes via Zoom\n📹 Recorded classes on YouTube\n\n— Kajol Ma'am 💄\n📸 ${INSTAGRAM}`
    if(type==='youtube')    return `🎬 *Watch Our Latest Classes on YouTube!* 🌸\n\n▶ Subscribe & Watch: ${YOUTUBE}\n\n💄 Kajol Makeover Studioz\n📸 ${INSTAGRAM}`
    if(type==='festival')   return `🎉 *Happy ${festival}!* 🌸\n\nWishing all our students and followers a wonderful ${festival}!\n\nMay this festival bring joy, beauty and happiness! ✨\n\n💄 Kajol Makeover Studioz\n📸 ${INSTAGRAM}`
    return ''
  }

  /* ── Student list for individual broadcast ── */
  const contacts = useMemo(()=>{
    let list=[]
    if(listType==='all') list=[...data.students,...data.orders.map(o=>({id:o.id+'_c',name:o.client,mobile:o.mobile,type:'client'}))]
    else if(listType==='students') list=[...data.students]
    else if(listType==='batch'&&selBatch) list=data.students.filter(s=>(batch?.student_ids||[]).includes(s.id))
    else if(listType==='partial'){const ids=new Set(data.payments.filter(p=>Number(p.amount)>Number(p.paid)).map(p=>p.student_id));list=data.students.filter(s=>ids.has(s.id))}
    else if(listType==='birthday'){const t=new Date();list=data.students.filter(s=>{if(!s.birthday)return false;const b=new Date(s.birthday+'T00:00:00');return b.getDate()===t.getDate()&&b.getMonth()===t.getMonth()})}
    const seen=new Set(); return list.filter(c=>{if(!c.mobile||seen.has(c.mobile))return false;seen.add(c.mobile);return true})
  },[data,listType,selBatch,batch])

  const studentMsg = c => {
    if(msgType==='custom') return customMsg
    const b=data.batches.find(x=>(x.student_ids||[]).includes(c.id))
    const p=data.payments.find(x=>x.student_id===c.id)
    const due=p?Number(p.amount)-Number(p.paid):0
    if(msgType==='classReminder') return `🌸 Class Reminder!\n\nHi ${c.name}! Your class is today at ${b?.timing||'scheduled time'}.\n🎥 Zoom: ${b?.zoom_link||'Link in your group'}\n\n— Kajol Ma'am 💄`
    if(msgType==='payReminder')   return `💳 Payment Reminder\n\nHi ${c.name}, ${fmt(due)} payment is pending for ${b?.name||'your course'}.\nKindly pay at your earliest. 🙏\n— Kajol Ma'am 💄`
    if(msgType==='festival')      return `🎉 Happy ${festival}!\n\nDear ${c.name}, wishing you a wonderful ${festival}! 🌸\n— Kajol Makeover Studioz 💄`
    if(msgType==='birthday')      return `🎂 Happy Birthday ${c.name}! 🎉\n\nWishing you a gorgeous and wonderful birthday! 💄✨\n— Kajol Ma'am 💄`
    return ''
  }

  const sendContacts = () => {
    const targets=selected.length>0?contacts.filter(c=>selected.includes(c.id)):contacts
    if(!targets.length){alert('No contacts selected.');return}
    const first=targets[0]
    window.open(`https://wa.me/91${first.mobile}?text=${encodeURIComponent(studentMsg(first))}`,'_blank')
    if(targets.length>1){
      const links=targets.slice(1).map(c=>`https://wa.me/91${c.mobile}?text=${encodeURIComponent(studentMsg(c))}`).join('\n')
      navigator.clipboard?.writeText(links)
      toast(`Opened WA for ${first.name}. ${targets.length-1} more links copied to clipboard!`)
    }
  }

  const SECTIONS=[{v:'batch',l:'🎓 Batch Groups'},{v:'community',l:'🌐 Community'},{v:'students',l:'👥 Students'},{v:'custom',l:'✍️ Custom'}]

  return (
    <div>
      <div style={{display:'flex',gap:6,overflowX:'auto',marginBottom:14,paddingBottom:4}}>
        {SECTIONS.map(s=><div key={s.v} onClick={()=>setSection(s.v)} style={{flexShrink:0,padding:'8px 14px',borderRadius:12,background:section===s.v?C.pink:C.greyL,color:section===s.v?C.white:C.grey,fontSize:12,fontWeight:section===s.v?700:500,cursor:'pointer',whiteSpace:'nowrap'}}>{s.l}</div>)}
      </div>

      {/* ── BATCH GROUPS ── */}
      {section==='batch'&&<div>
        <Card accent={C.green}>
          <STitle><Ic n="batch" size={15} color={C.green}/> Send to Batch WhatsApp Group</STitle>
          <div style={{fontSize:12,color:C.grey,marginBottom:10}}>Select a batch and send reminders directly to its WhatsApp group.</div>
          <Inp label="Select Batch" value={selBatch} onChange={setSelBatch} opts={data.batches.map(b=>({v:b.id,l:b.name+(b.wa_group?' ✅':' ❌ no group')}))}/>

          {batch&&<>
            {batch.wa_group
              ? <div style={{background:C.greenPale,borderRadius:10,padding:'8px 12px',marginBottom:12,fontSize:12}}>✅ Group: <a href={batch.wa_group} target="_blank" rel="noopener noreferrer" style={{color:C.green,wordBreak:'break-all'}}>{batch.wa_group.slice(0,50)}…</a></div>
              : <div style={{background:'#FFF3E0',borderRadius:10,padding:'8px 12px',marginBottom:12,fontSize:12,color:C.amber}}>⚠️ No WhatsApp group set. Go to Batches → Edit Batch to add the group link.</div>
            }
            <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:8,textTransform:'uppercase',letterSpacing:.5}}>Quick Send Templates</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
              {[{t:'classReminder',l:'📅 Class Reminder',c:C.blue},{t:'zoomLink',l:'🎥 Zoom Link',c:C.blue},{t:'ytReady',l:'▶ Recording Ready',c:C.yt},{t:'homework',l:'📝 Homework Reminder',c:C.green},{t:'payReminder',l:'💳 Fee Reminder',c:C.amber}].map(btn=>(
                <button key={btn.t} onClick={()=>{
                  const msg=batchMsg(btn.t)
                  if(batch.wa_group){navigator.clipboard?.writeText(msg);window.open(batch.wa_group,'_blank');toast('Message copied! Paste in group.')}
                  else{navigator.share?navigator.share({text:msg}):(navigator.clipboard?.writeText(msg),toast('Copied! Open group manually.'))}
                }} style={{background:btn.c+'15',border:`1.5px solid ${btn.c}30`,borderRadius:10,padding:'10px 8px',cursor:'pointer',fontFamily:'inherit',color:btn.c,fontSize:12,fontWeight:700,textAlign:'center'}}>
                  {btn.l}
                </button>
              ))}
            </div>
            <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Class Reminder Preview</div>
            <div style={{background:C.greyL,borderRadius:10,padding:12,fontSize:11,lineHeight:1.7,whiteSpace:'pre-wrap',color:C.dark,marginBottom:10,maxHeight:140,overflow:'auto'}}>{batchMsg('classReminder')}</div>
            <Btn color={C.wa} full onClick={()=>{const m=batchMsg('classReminder');if(batch.wa_group){navigator.clipboard?.writeText(m);window.open(batch.wa_group,'_blank');toast('Copied! Paste in group.')}else{navigator.share?navigator.share({text:m}):(navigator.clipboard?.writeText(m),toast('Copied!'))}}}>
              <Ic n="wa" size={14} color={C.white}/>Open Group & Copy Message
            </Btn>
          </>}
        </Card>

        {/* All batches quick access */}
        <Card>
          <STitle><Ic n="batch" size={15} color={C.pink}/> All Batch Groups</STitle>
          {data.batches.map(b=>(
            <div key={b.id} style={{padding:'9px 0',borderBottom:`1px solid ${C.pinkPale}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontWeight:600,fontSize:13}}>{b.name}</div>
                <div style={{fontSize:11,color:C.grey}}>{b.student_ids?.length||0} students · {b.timing}</div>
              </div>
              {b.wa_group
                ? <a href={b.wa_group} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}><Btn small color={C.wa}><Ic n="wa" size={12} color={C.white}/>Open</Btn></a>
                : <Badge color={C.grey}>No Group</Badge>
              }
            </div>
          ))}
          {data.batches.length===0&&<div style={{fontSize:13,color:C.grey,textAlign:'center',padding:16}}>No batches yet.</div>}
        </Card>
      </div>}

      {/* ── COMMUNITY ── */}
      {section==='community'&&<div>
        <Card accent={C.wa}>
          <STitle><Ic n="wa" size={15} color={C.wa}/> WhatsApp Community</STitle>
          <div style={{background:C.greenPale,borderRadius:10,padding:'8px 12px',marginBottom:12,fontSize:12,wordBreak:'break-all'}}>🟢 {WA_COMMUNITY}</div>
          <a href={WA_COMMUNITY} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none',display:'block',marginBottom:10}}>
            <Btn color={C.wa} full><Ic n="wa" size={15} color={C.white}/>Open Community</Btn>
          </a>
        </Card>

        <div style={{fontSize:12,fontWeight:700,color:C.grey,marginBottom:8,textTransform:'uppercase',letterSpacing:.5}}>Community Announcements</div>
        {[
          {type:'newBatch',label:'✨ New Batch Announcement',desc:'Share upcoming batches with enrollment link'},
          {type:'enrollLink',label:'🔗 Enrollment Link',desc:'Invite new students to fill the form'},
          {type:'youtube',label:'▶ YouTube Update',desc:'Direct followers to class recordings'},
          {type:'festival',label:'🎉 Festival Wishes',desc:'Seasonal greeting for the community',showFestival:true},
        ].map(item=>(
          <Card key={item.type}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:3}}>{item.label}</div>
            <div style={{fontSize:11,color:C.grey,marginBottom:8}}>{item.desc}</div>
            {item.showFestival&&<Inp label="Festival Name" value={festival} onChange={setFestival} placeholder="e.g. Diwali, Holi, Navratri"/>}
            <Row gap={8}>
              <Btn small outline onClick={()=>{navigator.clipboard?.writeText(communityMsg(item.type));toast('Copied!')}}>
                <Ic n="copy" size={12} color={C.pink}/>Copy
              </Btn>
              <Btn small color={C.wa} onClick={()=>{const m=communityMsg(item.type);navigator.share?navigator.share({text:m}):(navigator.clipboard?.writeText(m),toast('Copied! Open community to paste.'))}}>
                <Ic n="share" size={12} color={C.white}/>Share
              </Btn>
              <a href={WA_COMMUNITY} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>
                <Btn small color={C.wa}><Ic n="wa" size={12} color={C.white}/>Open</Btn>
              </a>
            </Row>
          </Card>
        ))}

        <Card>
          <STitle><Ic n="share" size={15} color={C.pink}/> Other Social Platforms</STitle>
          {[{l:'Instagram',u:INSTAGRAM,c:C.ig},{l:'YouTube Channel',u:YOUTUBE,c:C.yt}].map(x=>(
            <div key={x.l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
              <span style={{fontWeight:600,fontSize:13}}>{x.l}</span>
              <a href={x.u} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}><Btn small color={x.c}>Open</Btn></a>
            </div>
          ))}
        </Card>
      </div>}

      {/* ── STUDENTS ── */}
      {section==='students'&&<div>
        <Card>
          <STitle><Ic n="students" size={15} color={C.blue}/> Send to Individual Students</STitle>
          <Inp label="Contact List" value={listType} onChange={setListType} opts={[
            {v:'all',l:'All Students + Clients'},{v:'students',l:'All Students'},
            {v:'batch',l:'Batch-wise'},{v:'partial',l:'Partial-paid Students'},
            {v:'birthday',l:"Today's Birthdays 🎂"}
          ]}/>
          {listType==='batch'&&<Inp label="Batch" value={selBatch} onChange={setSelBatch} opts={data.batches.map(b=>({v:b.id,l:b.name}))}/>}
          <Inp label="Message Template" value={msgType} onChange={setMsgType} opts={[
            {v:'classReminder',l:'📅 Class Reminder'},{v:'payReminder',l:'💳 Payment Reminder'},
            {v:'festival',l:'🎉 Festival Wishes'},{v:'birthday',l:'🎂 Birthday Wishes'},{v:'custom',l:'✍️ Custom'}
          ]}/>
          {msgType==='festival'&&<Inp label="Festival" value={festival} onChange={setFestival} placeholder="e.g. Diwali"/>}
          {msgType==='custom'&&<Inp label="Message" value={customMsg} onChange={setCustomMsg} rows={4} placeholder="Your message here…"/>}
          <div style={{fontSize:12,color:C.grey}}>{contacts.length} contacts · {selected.length>0?selected.length+' selected':'all selected by default'}</div>
        </Card>

        <Card>
          <Row style={{justifyContent:'space-between',marginBottom:8}}>
            <div style={{fontSize:13,fontWeight:700}}>Select Recipients</div>
            <Btn small outline onClick={()=>selected.length===contacts.length?setSelected([]):setSelected(contacts.map(c=>c.id))}>
              {selected.length===contacts.length?'Deselect All':'Select All'}
            </Btn>
          </Row>
          <div style={{maxHeight:260,overflowY:'auto'}}>
            {contacts.map(c=>(
              <div key={c.id} onClick={()=>setSelected(s=>s.includes(c.id)?s.filter(x=>x!==c.id):[...s,c.id])}
                style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',borderRadius:10,marginBottom:4,cursor:'pointer',background:selected.includes(c.id)?C.pinkPale:C.white,border:`1px solid ${selected.includes(c.id)?C.pink:C.pinkPale}`}}>
                <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${selected.includes(c.id)?C.pink:C.grey}`,background:selected.includes(c.id)?C.pink:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  {selected.includes(c.id)&&<Ic n="check" size={12} color={C.white}/>}
                </div>
                <div style={{width:30,height:30,borderRadius:'50%',background:`linear-gradient(135deg,${C.pink},${C.pinkD})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:13,flexShrink:0}}>{(c.name||'?')[0]}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</div>
                  <div style={{fontSize:11,color:C.grey}}>{c.mobile}</div>
                </div>
              </div>
            ))}
            {contacts.length===0&&<div style={{textAlign:'center',color:C.grey,padding:20,fontSize:13}}>No contacts in this list</div>}
          </div>
        </Card>

        <Btn color={C.wa} full onClick={sendContacts} style={{marginBottom:8}}>
          <Ic n="wa" size={16} color={C.white}/>Send to {selected.length>0?selected.length:contacts.length} Contact{(selected.length||contacts.length)!==1?'s':''}
        </Btn>
        <div style={{fontSize:11,color:C.grey,textAlign:'center',marginBottom:16}}>WhatsApp opens for first contact. Links for rest are copied to clipboard.</div>
      </div>}

      {/* ── CUSTOM ── */}
      {section==='custom'&&<Card>
        <STitle><Ic n="edit" size={15} color={C.pink}/> Custom Message</STitle>
        <Inp label="Your Message" value={customMsg} onChange={setCustomMsg} rows={7} placeholder="Type your custom announcement here…"/>
        <Row gap={8} style={{flexWrap:'wrap'}}>
          <Btn color={C.wa} onClick={()=>navigator.share?navigator.share({text:customMsg}):(navigator.clipboard?.writeText(customMsg),toast('Copied!'))}>
            <Ic n="share" size={14} color={C.white}/>Share
          </Btn>
          <a href={WA_COMMUNITY} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}><Btn color={C.wa}><Ic n="wa" size={14} color={C.white}/>Community</Btn></a>
          <Btn outline onClick={()=>{navigator.clipboard?.writeText(customMsg);toast('Copied!')}}><Ic n="copy" size={14} color={C.pink}/>Copy</Btn>
        </Row>
      </Card>}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   COURSES TAB
═══════════════════════════════════════════════════════════════════ */
function CoursesTab({data,setData,toast}) {
  const [modal,setModal]=useState(null); const [del,setDel]=useState(null)
  const [form,setForm]=useState({}); const [busy,setBusy]=useState(false)
  const save=async()=>{if(!form.name)return alert('Name required.');setBusy(true);const row={id:form.id||uid(),name:form.name,type:form.type||'Mehndi',color:form.color||C.pink,description:form.description||'',syllabus:form.syllabus||'',sub_courses:form.sub_courses||[],fee:Number(form.fee||0),created_at:form.created_at||new Date().toISOString()};await dbUpsert('courses',row);setData(d=>({...d,courses:form.id?d.courses.map(c=>c.id===form.id?{...c,...row}:c):[...d.courses,row]}));setBusy(false);setModal(null);toast('Course saved!')}
  const share=c=>{const m=`📚 *${c.name} Syllabus*\n\nType: ${c.type}\nFee: ₹${c.fee||0}\n\n${c.syllabus||'Syllabus coming soon!'}\n\nEnroll: ${ENROLL_URL}\n— Kajol Ma'am 💄`;navigator.share?navigator.share({text:m}):(navigator.clipboard?.writeText(m),toast('Copied!'))}
  return (
    <div>
      <Row style={{justifyContent:'space-between',marginBottom:14}}>
        <STitle><Ic n="course" size={15} color={C.purple}/> Courses & Syllabus</STitle>
        <Btn small onClick={()=>{setForm({name:'',type:'Mehndi',color:C.pink,description:'',syllabus:'',fee:''});setModal('form')}}><Ic n="add" size={14} color={C.white}/>New</Btn>
      </Row>
      {data.courses.length===0&&<div style={{textAlign:'center',color:C.grey,padding:40,background:C.white,borderRadius:16}}><div style={{fontSize:36,marginBottom:8}}>📚</div><div style={{fontWeight:700}}>No courses yet</div></div>}
      {data.courses.map(c=>{const bc=data.batches.filter(b=>b.course_id===c.id).length;return(
        <Card key={c.id} accent={c.color||C.pink}>
          <Row style={{justifyContent:'space-between',marginBottom:8}}><div><div style={{fontWeight:800,fontSize:15}}>{c.name}</div><div style={{fontSize:12,color:C.grey}}>{c.description}</div></div><div style={{textAlign:'right'}}><Badge color={c.color||C.pink}>{c.type}</Badge>{c.fee>0&&<div style={{fontSize:12,fontWeight:700,color:C.green,marginTop:4}}>₹{c.fee}</div>}</div></Row>
          <div style={{fontSize:11,color:C.grey,marginBottom:8}}>📦 {bc} batch{bc!==1?'es':''}</div>
          {c.syllabus?<div style={{background:(c.color||C.pink)+'10',borderRadius:10,padding:'10px 12px',marginBottom:10}}><div style={{fontSize:11,fontWeight:700,color:c.color||C.pink,marginBottom:4}}>📋 SYLLABUS</div><div style={{fontSize:12,color:C.dark,lineHeight:1.7,whiteSpace:'pre-wrap'}}>{c.syllabus}</div></div>:<div style={{background:C.greyL,borderRadius:10,padding:'8px 12px',marginBottom:10,fontSize:12,color:C.grey}}>No syllabus added yet.</div>}
          <Row gap={7} style={{flexWrap:'wrap'}}>
            <Btn small outline onClick={()=>{setForm({...c,fee:c.fee||''});setModal('form')}}>✏️</Btn>
            <Btn small color={C.wa} onClick={()=>share(c)}><Ic n="wa" size={12} color={C.white}/>Share Syllabus</Btn>
            <Btn small color={C.red} onClick={()=>setDel(c)}>🗑️</Btn>
          </Row>
        </Card>
      )})}
      {modal==='form'&&<Modal onClose={()=>setModal(null)} title={`${form.id?'Edit':'New'} Course`}>
        <Inp label="Course Name *" value={form.name} onChange={v=>setForm(x=>({...x,name:v}))}/>
        <Inp label="Type" value={form.type||'Mehndi'} onChange={v=>setForm(x=>({...x,type:v}))} opts={COURSE_TYPES}/>
        <Inp label="Fee (₹)" value={form.fee} onChange={v=>setForm(x=>({...x,fee:v}))} type="number"/>
        <Inp label="Short Description" value={form.description} onChange={v=>setForm(x=>({...x,description:v}))}/>
        <Inp label="Syllabus (Day-by-day details)" value={form.syllabus} onChange={v=>setForm(x=>({...x,syllabus:v}))} rows={8} placeholder={`Day 1: Introduction & Basics\nDay 2: Simple Patterns\nDay 3: Floral Designs\n...`}/>
        <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>Sub-Courses / Modules (one per line)</div>
        <textarea rows={3} value={(form.sub_courses||[]).join('\n')} onChange={e=>setForm(x=>({...x,sub_courses:e.target.value.split('\n').filter(s=>s.trim())}))} placeholder={'Basic Mehndi Module\nAdvanced Patterns Module\nBridal Specialization'} style={{width:'100%',padding:'10px 12px',borderRadius:10,border:`1.5px solid ${C.pinkPale}`,fontSize:13,fontFamily:'inherit',outline:'none',color:C.dark,boxSizing:'border-box',background:C.white,marginBottom:10,resize:'vertical'}}/>
        <div style={{marginBottom:12}}><div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Color</div><Row gap={10}>{COURSE_COLORS.map(col=><div key={col} onClick={()=>setForm(x=>({...x,color:col}))} style={{width:28,height:28,borderRadius:'50%',background:col,cursor:'pointer',border:`3px solid ${form.color===col?C.dark:'transparent'}`}}/>)}</Row></div>
        <Row gap={8}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn onClick={save} full disabled={busy}>{busy?'Saving…':'Save'}</Btn></Row>
      </Modal>}
      {del&&<DelConfirm item={del.name} onConfirm={async()=>{await dbDelete('courses',del.id);setData(d=>({...d,courses:d.courses.filter(c=>c.id!==del.id)}));toast('Deleted.')}} onClose={()=>setDel(null)}/>}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   BATCHES TAB
═══════════════════════════════════════════════════════════════════ */
function BatchesTab({data,setData,toast}) {
  const [sel,setSel]=useState(null); const [sub,setSub]=useState('overview')
  const [modal,setModal]=useState(null); const [del,setDel]=useState(null)
  const [form,setForm]=useState({}); const [cf,setCf]=useState({})
  const [hwM,setHwM]=useState(null); const [busy,setBusy]=useState(false)
  useEffect(()=>{if(!sel&&data.batches[0])setSel(data.batches[0].id)},[data.batches])

  const batch=data.batches.find(b=>b.id===sel)
  const bStudents=batch?data.students.filter(s=>(batch.student_ids||[]).includes(s.id)):[]
  const bClasses=batch?data.classes.filter(c=>c.batch_id===sel).sort((a,b)=>a.day-b.day):[]
  const course=batch?data.courses.find(c=>c.id===batch.course_id):null

  const saveBatch=async()=>{if(!form.name)return alert('Name required.');setBusy(true);const row={id:form.id||uid(),name:form.name,course_id:form.course_id||'',schedule:form.schedule||'Daily',duration:form.duration||'10 Days',start_date:form.start_date||today(),end_date:form.end_date||'',timing:form.timing||'',status:form.status||'Active',fee:Number(form.fee||0),zoom_link:form.zoom_link||'',zoom_id:form.zoom_id||'',wa_group:form.wa_group||'',student_ids:form.student_ids||[],created_at:form.created_at||new Date().toISOString()};await dbUpsert('batches',row);setData(d=>({...d,batches:form.id?d.batches.map(b=>b.id===form.id?{...b,...row}:b):[...d.batches,row]}));if(!form.id)setSel(row.id);setBusy(false);setModal(null);toast('Batch saved!')}
  const saveClass=async()=>{if(!cf.topic)return alert('Topic required.');setBusy(true);const row={id:cf.id||uid(),batch_id:sel,day:Number(cf.day||1),topic:cf.topic,date:cf.date||today(),zoom_link:cf.zoom_link||'',youtube_link:cf.youtube_link||'',youtube_status:cf.youtube_status||'Pending',homework:cf.homework||'',notes:cf.notes||'',attendees:cf.attendees||[]};await dbUpsert('classes',row);setData(d=>({...d,classes:cf.id?d.classes.map(c=>c.id===cf.id?{...c,...row}:c):[...d.classes,row]}));setBusy(false);setModal(null);toast('Class saved!')}
  const toggleHW=async(classId,studentId,cur)=>{const ex=data.homeworkCompliance.find(h=>h.class_id===classId&&h.student_id===studentId);if(ex){const u={...ex,submitted:!cur,date:today()};await dbUpsert('homework_compliance',u);setData(d=>({...d,homeworkCompliance:d.homeworkCompliance.map(h=>h.id===ex.id?u:h)}))}else{const row={id:uid(),class_id:classId,student_id:studentId,submitted:true,note:'',date:today()};await dbUpsert('homework_compliance',row);setData(d=>({...d,homeworkCompliance:[...d.homeworkCompliance,row]}))}}

  const SUBS=['overview','classes','zoom_yt','whatsapp','reminders']
  const SLBL={overview:'Overview',classes:'Classes',zoom_yt:'Zoom/YT',whatsapp:'WhatsApp',reminders:'Reminders'}

  return (
    <div>
      {/* Batch pills */}
      <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4,marginBottom:12}}>
        {data.batches.map(b=>{const c=data.courses.find(x=>x.id===b.course_id);return(
          <div key={b.id} onClick={()=>{setSel(b.id);setSub('overview')}} style={{flexShrink:0,padding:'7px 14px',borderRadius:12,cursor:'pointer',background:sel===b.id?(c?.color||C.pink):C.white,color:sel===b.id?C.white:C.dark,border:`1.5px solid ${sel===b.id?(c?.color||C.pink):C.pinkPale}`,fontSize:12,fontWeight:600,transition:'all .2s'}}>
            {b.name.length>16?b.name.slice(0,14)+'…':b.name}
          </div>
        )})}
        <div onClick={()=>{setForm({name:'',schedule:'Daily',duration:'10 Days',status:'Active',student_ids:[]});setModal('batch')}} style={{flexShrink:0,padding:'7px 14px',borderRadius:12,background:C.pinkPale,color:C.pink,border:`1.5px dashed ${C.pink}`,fontSize:12,fontWeight:700,cursor:'pointer'}}>+ New</div>
      </div>

      {!batch&&<div style={{textAlign:'center',color:C.grey,padding:40,background:C.white,borderRadius:16}}>No batches yet. Create one!</div>}

      {batch&&<>
        <div style={{display:'flex',gap:4,overflowX:'auto',marginBottom:12}}>
          {SUBS.map(s=><div key={s} onClick={()=>setSub(s)} style={{flexShrink:0,padding:'6px 12px',borderRadius:10,background:sub===s?C.pink:C.greyL,color:sub===s?C.white:C.grey,fontSize:11,fontWeight:sub===s?700:500,cursor:'pointer'}}>{SLBL[s]}</div>)}
        </div>

        {/* OVERVIEW */}
        {sub==='overview'&&<div>
          <Card accent={course?.color||C.pink}>
            <Row style={{justifyContent:'space-between',marginBottom:8}}><div style={{fontWeight:800,fontSize:16}}>{batch.name}</div><Badge color={batch.status==='Active'?C.green:batch.status==='Upcoming'?C.blue:C.grey}>{batch.status}</Badge></Row>
            <div style={{fontSize:12,color:C.grey}}>Course: <b>{course?.name||'—'}</b> · {batch.schedule} · {batch.timing}</div>
            <div style={{fontSize:12,color:C.grey}}>📅 {batch.start_date} → {batch.end_date} · Fee: {fmt(batch.fee||0)}</div>
            <Divider/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:10}}>
              {[['Students',bStudents.length,C.pink],['Classes',bClasses.length,C.green],['YT Done',bClasses.filter(c=>c.youtube_status==='Uploaded').length,C.yt]].map(([l,v,c])=>(
                <div key={l} style={{textAlign:'center',background:c+'12',borderRadius:10,padding:10}}><div style={{fontSize:20,fontWeight:800,color:c}}>{v}</div><div style={{fontSize:10,color:C.grey}}>{l}</div></div>
              ))}
            </div>
            <Row gap={7}><Btn small outline onClick={()=>{setForm({...batch,start_date:batch.start_date||'',end_date:batch.end_date||''});setModal('batch')}}>✏️ Edit</Btn><Btn small color={C.red} onClick={()=>setDel({id:batch.id,name:batch.name,type:'batch'})}>🗑️</Btn></Row>
          </Card>
          <STitle><Ic n="students" size={15} color={C.blue}/> Enrolled Students</STitle>
          {bStudents.map(s=>{const paid=data.payments.filter(p=>p.student_id===s.id&&p.batch_id===sel).reduce((a,p)=>a+Number(p.paid),0);const total=data.payments.filter(p=>p.student_id===s.id&&p.batch_id===sel).reduce((a,p)=>a+Number(p.amount),0);return(
            <Card key={s.id}><Row style={{justifyContent:'space-between'}}>
              <div><div style={{fontWeight:700,fontSize:13}}>{s.name}</div><div style={{fontSize:11,color:C.grey}}>📱 {s.mobile}</div></div>
              <div style={{textAlign:'right'}}><div style={{fontSize:13,fontWeight:700,color:C.green}}>{fmt(paid)}</div>
              {total>paid&&<><div style={{fontSize:11,color:C.amber}}>Due: {fmt(total-paid)}</div><a href={`https://wa.me/91${s.mobile}?text=${encodeURIComponent('Hi '+s.name+'! Payment of '+fmt(total-paid)+' pending for '+batch.name+'. — Kajol Maam 💄')}`} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:C.wa,textDecoration:'none',display:'flex',alignItems:'center',gap:3,justifyContent:'flex-end',marginTop:2}}><Ic n="wa" size={11} color={C.wa}/> Remind</a></>}
              </div>
            </Row></Card>
          )})}
          {bStudents.length===0&&<div style={{fontSize:13,color:C.grey,textAlign:'center',padding:16,background:C.white,borderRadius:12}}>No students. Go to Students tab → Enroll in Batch.</div>}
        </div>}

        {/* CLASSES */}
        {sub==='classes'&&<div>
          <Row style={{justifyContent:'space-between',marginBottom:12}}>
            <STitle><Ic n="book" size={15} color={C.green}/> Classes</STitle>
            <Btn small onClick={()=>{setCf({topic:'',date:today(),day:bClasses.length+1,zoom_link:batch.zoom_link||'',youtube_link:'',youtube_status:'Pending',homework:'',notes:'',attendees:[]});setModal('class')}}><Ic n="add" size={13} color={C.white}/>Add Class</Btn>
          </Row>
          {bClasses.map(cl=>{const hwList=data.homeworkCompliance.filter(h=>h.class_id===cl.id);const sub=hwList.filter(h=>h.submitted).length;return(
            <Card key={cl.id} accent={cl.youtube_status==='Uploaded'?C.green:C.amber}>
              <Row style={{justifyContent:'space-between',marginBottom:4}}><div style={{fontWeight:700,fontSize:14}}>Day {cl.day}: {cl.topic}</div><Badge color={cl.youtube_status==='Uploaded'?C.green:cl.youtube_status==='Processing'?C.amber:C.red}>{cl.youtube_status}</Badge></Row>
              <div style={{fontSize:11,color:C.grey,marginBottom:4}}>📅 {cl.date} · 👥 {(cl.attendees||[]).length}/{bStudents.length}</div>
              {cl.homework&&<div style={{fontSize:12,background:C.greenPale,borderRadius:8,padding:'6px 10px',marginBottom:6}}>📝 {cl.homework} — ✅ {sub}/{bStudents.length} submitted</div>}
              {cl.youtube_link&&<a href={cl.youtube_link} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:C.yt,display:'flex',alignItems:'center',gap:4,marginBottom:4}}><Ic n="yt" size={13} color={C.yt}/> Watch Recording</a>}
              <Row gap={6} style={{marginTop:8,flexWrap:'wrap'}}>
                <Btn small outline onClick={()=>{setCf({...cl,attendees:cl.attendees||[]});setModal('edit_cl_'+cl.id)}}>✏️</Btn>
                <Btn small color={C.blue} onClick={()=>setHwM(cl.id)}>📝 HW</Btn>
                <select value={cl.youtube_status} onChange={async e=>{const u={...cl,youtube_status:e.target.value};await dbUpsert('classes',u);setData(d=>({...d,classes:d.classes.map(c=>c.id===cl.id?u:c)}));toast('Updated!')}} style={{fontSize:11,borderRadius:6,border:`1px solid ${C.pinkPale}`,padding:'4px 7px',fontFamily:'inherit'}}>
                  {['Pending','Processing','Uploaded'].map(s=><option key={s}>{s}</option>)}
                </select>
                <Btn small color={C.red} onClick={async()=>{await dbDelete('classes',cl.id);setData(d=>({...d,classes:d.classes.filter(c=>c.id!==cl.id)}));toast('Deleted.')}}>🗑️</Btn>
              </Row>
              {modal===('edit_cl_'+cl.id)&&<Modal onClose={()=>setModal(null)} title="Edit Class">
                {[['day','Day #'],['topic','Topic *'],['homework','Homework'],['notes','Notes'],['zoom_link','Zoom Link'],['youtube_link','YouTube Link']].map(([f,lbl])=><Inp key={f} label={lbl} value={cf[f]} onChange={v=>setCf(x=>({...x,[f]:v}))}/>)}
                <Inp label="Date" value={cf.date} onChange={v=>setCf(x=>({...x,date:v}))} type="date"/>
                <Inp label="YT Status" value={cf.youtube_status} onChange={v=>setCf(x=>({...x,youtube_status:v}))} opts={['Pending','Processing','Uploaded']}/>
                <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:6}}>Attendance</div>
                {bStudents.map(s=><label key={s.id} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,marginBottom:5,cursor:'pointer'}}><input type="checkbox" checked={(cf.attendees||[]).includes(s.id)} onChange={e=>{const cur=cf.attendees||[];setCf(x=>({...x,attendees:e.target.checked?[...cur,s.id]:cur.filter(i=>i!==s.id)}))}}/>  {s.name}</label>)}
                <Row gap={8} style={{marginTop:10}}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn onClick={saveClass} full disabled={busy}>{busy?'…':'Save'}</Btn></Row>
              </Modal>}
              {hwM===cl.id&&<Modal onClose={()=>setHwM(null)} title={`HW Compliance — Day ${cl.day}`}>
                {bStudents.map(s=>{const hw=data.homeworkCompliance.find(h=>h.class_id===cl.id&&h.student_id===s.id);return(
                  <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
                    <div><div style={{fontWeight:600,fontSize:13}}>{s.name}</div><div style={{fontSize:11,color:hw?.submitted?C.green:C.red}}>{hw?.submitted?'✅ Submitted':'❌ Not submitted'}</div></div>
                    <Toggle checked={!!hw?.submitted} onChange={()=>toggleHW(cl.id,s.id,!!hw?.submitted)}/>
                  </div>
                )})}
                <Btn color={C.green} onClick={()=>setHwM(null)} full style={{marginTop:12}}>Done</Btn>
              </Modal>}
            </Card>
          )})}
          {bClasses.length===0&&<div style={{textAlign:'center',color:C.grey,padding:24,background:C.white,borderRadius:12}}>No classes added yet.</div>}
        </div>}

        {/* ZOOM/YT */}
        {sub==='zoom_yt'&&<div>
          <Card accent={C.blue}><STitle><Ic n="zoom" size={15} color={C.blue}/> Zoom Details</STitle>
            <div style={{fontSize:13,marginBottom:4}}>ID: {batch.zoom_id||'Not set'}</div>
            <div style={{fontSize:12,color:C.grey,wordBreak:'break-all',marginBottom:10}}>{batch.zoom_link||'No link set'}</div>
            {batch.zoom_link&&<Row gap={8}><a href={batch.zoom_link} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}><Btn color={C.blue} small><Ic n="zoom" size={13} color={C.white}/>Join</Btn></a><Btn small outline onClick={()=>{const t=`${batch.name} Zoom: ${batch.zoom_link} (ID: ${batch.zoom_id||''})`;navigator.share?navigator.share({text:t}):(navigator.clipboard?.writeText(t),toast('Copied!'))}}><Ic n="share" size={13} color={C.pink}/>Share</Btn></Row>}
          </Card>
          <Card accent={C.yt}><STitle><Ic n="yt" size={15} color={C.yt}/> YouTube Tracker</STitle>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:12}}>{['Uploaded','Processing','Pending'].map(s=>{const cnt=bClasses.filter(c=>c.youtube_status===s).length;const col=s==='Uploaded'?C.green:s==='Processing'?C.amber:C.red;return<div key={s} style={{background:col+'15',borderRadius:10,padding:10,textAlign:'center'}}><div style={{fontSize:18,fontWeight:800,color:col}}>{cnt}</div><div style={{fontSize:10,color:C.grey}}>{s}</div></div>})}
            </div>
            {bClasses.map(cl=><div key={cl.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
              <div><div style={{fontSize:13,fontWeight:600}}>Day {cl.day}: {cl.topic}</div>{cl.youtube_link&&<a href={cl.youtube_link} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:C.yt}}>▶ Watch</a>}</div>
              <Badge color={cl.youtube_status==='Uploaded'?C.green:cl.youtube_status==='Processing'?C.amber:C.red}>{cl.youtube_status}</Badge>
            </div>)}
          </Card>
        </div>}

        {/* WHATSAPP */}
        {sub==='whatsapp'&&<div>
          <Card accent={C.wa}><STitle><Ic n="wa" size={15} color={C.wa}/> Batch WhatsApp Group</STitle>
            {batch.wa_group?<><div style={{wordBreak:'break-all',fontSize:13,marginBottom:10}}>{batch.wa_group}</div>
            <Row gap={8} style={{flexWrap:'wrap'}}>
              <a href={batch.wa_group} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}><Btn color={C.wa} small><Ic n="wa" size={13} color={C.white}/>Open Group</Btn></a>
              <Btn small outline onClick={()=>{const m=`Welcome to ${batch.name}! 🌸\nJoin our batch group: ${batch.wa_group}\nClass time: ${batch.timing||'As scheduled'}\nZoom: ${batch.zoom_link||'to be shared'}\n\n— Kajol Ma'am 💄`;navigator.share?navigator.share({text:m}):(navigator.clipboard?.writeText(m),toast('Copied!'))}}>Share Welcome</Btn>
            </Row></>
            :<div style={{fontSize:13,color:C.grey}}>No group link. Click Edit Batch above to add the WhatsApp group link.</div>}
          </Card>
          <Card><STitle><Ic n="star" size={15} color={C.blue}/> Studio Stats</STitle>
            {bClasses.slice(-5).reverse().map(cl=>(
              <div key={cl.id} style={{padding:'9px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
                <div style={{fontSize:13,fontWeight:600,marginBottom:5}}>Day {cl.day}: {cl.topic}</div>
                <Row gap={6} style={{flexWrap:'wrap'}}>
                  {(cl.zoom_link||batch.zoom_link)&&<Btn small color={C.wa} onClick={()=>{const m=`📚 *${batch.name} — Day ${cl.day}*\nTopic: ${cl.topic}\n🎥 Zoom: ${cl.zoom_link||batch.zoom_link}\n⏰ ${batch.timing||''}\n— Kajol Ma'am 💄`;if(batch.wa_group){navigator.clipboard?.writeText(m);window.open(batch.wa_group,'_blank');toast('Copied! Paste in group.')}else{navigator.share?navigator.share({text:m}):(navigator.clipboard?.writeText(m),toast('Copied!'))}}}>
                    <Ic n="wa" size={12} color={C.white}/>Zoom Link
                  </Btn>}
                  {cl.youtube_link&&<Btn small color={C.yt} onClick={()=>{const m=`🎬 *Day ${cl.day} Recording*\nTopic: ${cl.topic}\n▶ ${cl.youtube_link}\n— Kajol Ma'am 💄`;if(batch.wa_group){navigator.clipboard?.writeText(m);window.open(batch.wa_group,'_blank');toast('Copied!')}else{navigator.share?navigator.share({text:m}):(navigator.clipboard?.writeText(m),toast('Copied!'))}}}>
                    <Ic n="yt" size={12} color={C.white}/>YT Link
                  </Btn>}
                </Row>
              </div>
            ))}
            {bClasses.length===0&&<div style={{fontSize:13,color:C.grey,padding:12}}>Add classes first.</div>}
          </Card>
        </div>}

        {/* REMINDERS */}
        {sub==='reminders'&&<div>
          <Card accent={C.amber}><STitle><Ic n="bell" size={15} color={C.amber}/> Class Day Reminders</STitle>
            {bClasses.map(cl=>(
              <div key={cl.id} style={{padding:'10px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
                <Row style={{justifyContent:'space-between',marginBottom:4}}><div style={{fontWeight:600,fontSize:13}}>Day {cl.day}: {cl.topic}</div><div style={{fontSize:11,color:C.grey}}>{cl.date}</div></Row>
                <Btn small color={C.wa} onClick={()=>{const msg=`🌸 *Class Reminder — ${batch.name}*\nDay ${cl.day}: *${cl.topic}*\n📅 ${cl.date} ⏰ ${batch.timing||''}\n🎥 ${cl.zoom_link||batch.zoom_link||'Link coming'}\n${cl.homework?'📝 HW: '+cl.homework+'\n':''}— Kajol Ma'am 💄`;if(batch.wa_group){navigator.clipboard?.writeText(msg);window.open(batch.wa_group,'_blank');toast('Copied! Paste in WA group.')}else{navigator.share?navigator.share({text:msg}):(navigator.clipboard?.writeText(msg),toast('Reminder copied!'))}}}>
                  <Ic n="wa" size={12} color={C.white}/>Send Reminder to Group
                </Btn>
              </div>
            ))}
            {bClasses.length===0&&<div style={{color:C.grey,fontSize:13,padding:12}}>Add classes first.</div>}
          </Card>
          <Card><STitle><Ic n="bell" size={15} color={C.pink}/> Custom Announcement</STitle>
            <textarea defaultValue={`🌸 *Reminder — ${batch.name}*\n\nClass today at ${batch.timing||'scheduled time'}!\n🎥 ${batch.zoom_link||'Link in group'}\n\n— Kajol Ma'am 💄`} id={`custom_${batch.id}`} style={{width:'100%',minHeight:100,padding:'10px 12px',borderRadius:10,border:`1.5px solid ${C.pinkPale}`,fontSize:12,fontFamily:'inherit',outline:'none',boxSizing:'border-box',resize:'vertical',color:C.dark,marginBottom:10}}/>
            <Btn color={C.wa} full onClick={()=>{const msg=document.getElementById(`custom_${batch.id}`)?.value||'';if(batch.wa_group){navigator.clipboard?.writeText(msg);window.open(batch.wa_group,'_blank');toast('Copied! Paste in WA group.')}else{navigator.share?navigator.share({text:msg}):(navigator.clipboard?.writeText(msg),toast('Copied!'))}}}>
              <Ic n="wa" size={14} color={C.white}/>Send to Group
            </Btn>
          </Card>
        </div>}

        {/* Add/Edit Class Modal */}
        {modal==='class'&&<Modal onClose={()=>setModal(null)} title="Add Class">
          {[['day','Day #'],['topic','Topic *'],['homework','Homework'],['notes','Notes'],['zoom_link','Zoom Link'],['youtube_link','YouTube Link']].map(([f,lbl])=><Inp key={f} label={lbl} value={cf[f]} onChange={v=>setCf(x=>({...x,[f]:v}))}/>)}
          <Inp label="Date" value={cf.date||today()} onChange={v=>setCf(x=>({...x,date:v}))} type="date"/>
          <Inp label="YT Status" value={cf.youtube_status||'Pending'} onChange={v=>setCf(x=>({...x,youtube_status:v}))} opts={['Pending','Processing','Uploaded']}/>
          <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:6}}>Mark Attendance</div>
          {bStudents.map(s=><label key={s.id} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,marginBottom:5,cursor:'pointer'}}><input type="checkbox" checked={(cf.attendees||[]).includes(s.id)} onChange={e=>{const cur=cf.attendees||[];setCf(x=>({...x,attendees:e.target.checked?[...cur,s.id]:cur.filter(i=>i!==s.id)}))}}/>  {s.name}</label>)}
          <Row gap={8} style={{marginTop:10}}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn color={C.green} onClick={saveClass} full disabled={busy}>{busy?'…':'Add Class'}</Btn></Row>
        </Modal>}
      </>}

      {/* Add/Edit Batch Modal */}
      {modal==='batch'&&<Modal onClose={()=>setModal(null)} title={`${form.id?'Edit':'New'} Batch`}>
        <Inp label="Batch Name *" value={form.name} onChange={v=>setForm(x=>({...x,name:v}))}/>
        <Inp label="Course" value={form.course_id||''} onChange={v=>setForm(x=>({...x,course_id:v}))} opts={[{v:'',l:'— None —'},...data.courses.map(c=>({v:c.id,l:c.name}))]}/>
        <Inp label="Schedule" value={form.schedule||'Daily'} onChange={v=>setForm(x=>({...x,schedule:v}))} opts={SCHEDULE_OPTS}/>
        <Inp label="Duration" value={form.duration||'10 Days'} onChange={v=>setForm(x=>({...x,duration:v}))} opts={DURATION_OPTS}/>
        <Inp label="Status" value={form.status||'Active'} onChange={v=>setForm(x=>({...x,status:v}))} opts={['Active','Upcoming','Completed']}/>
        <Inp label="Timing (e.g. 6:00 PM)" value={form.timing} onChange={v=>setForm(x=>({...x,timing:v}))}/>
        <Inp label="Start Date" value={form.start_date||today()} onChange={v=>setForm(x=>({...x,start_date:v}))} type="date"/>
        <Inp label="End Date" value={form.end_date} onChange={v=>setForm(x=>({...x,end_date:v}))} type="date"/>
        <Inp label="Fee (₹)" value={form.fee} onChange={v=>setForm(x=>({...x,fee:v}))} type="number"/>
        <Inp label="Zoom Link" value={form.zoom_link} onChange={v=>setForm(x=>({...x,zoom_link:v}))}/>
        <Inp label="Zoom Meeting ID" value={form.zoom_id} onChange={v=>setForm(x=>({...x,zoom_id:v}))}/>
        <Inp label="WhatsApp Group Link (for batch students)" value={form.wa_group} onChange={v=>setForm(x=>({...x,wa_group:v}))} placeholder="https://chat.whatsapp.com/…"/>
        <Row gap={8}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn onClick={saveBatch} full disabled={busy}>{busy?'Saving…':'Save Batch'}</Btn></Row>
      </Modal>}

      {del&&<DelConfirm item={del.name} onConfirm={async()=>{if(del.type==='batch'){await dbDelete('batches',del.id);setData(d=>({...d,batches:d.batches.filter(b=>b.id!==del.id),classes:d.classes.filter(c=>c.batch_id!==del.id)}))}setDel(null);toast('Deleted.')}} onClose={()=>setDel(null)}/>}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   PAYMENTS TAB
═══════════════════════════════════════════════════════════════════ */
function PaymentsTab({data,setData,toast}) {
  const [modal,setModal]=useState(null); const [del,setDel]=useState(null)
  const [form,setForm]=useState({}); const [busy,setBusy]=useState(false)
  const [fb,setFb]=useState('all'); const [fs,setFs]=useState('all')
  const filtered=data.payments.filter(p=>(fb==='all'||p.batch_id===fb)&&(fs==='all'||p.student_id===fs))
  const save=async()=>{if(!form.amount||!form.paid)return alert('Amount required.');setBusy(true);const row={id:form.id||uid(),student_id:form.student_id||data.students[0]?.id,batch_id:form.batch_id||data.batches[0]?.id,amount:Number(form.amount),paid:Number(form.paid),type:form.type||'Full',date:form.date||today(),note:form.note||'',created_at:form.created_at||new Date().toISOString()};await dbUpsert('payments',row);setData(d=>({...d,payments:form.id?d.payments.map(p=>p.id===form.id?{...p,...row}:p):[...d.payments,row]}));setBusy(false);setModal(null);toast('Payment saved!')}
  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:14}}>
        <StatBox label="Received" value={fmt(filtered.reduce((s,p)=>s+Number(p.paid),0))} color={C.green} icon="rupee"/>
        <StatBox label="Pending" value={fmt(filtered.reduce((s,p)=>s+(Number(p.amount)-Number(p.paid)),0))} color={C.amber} icon="alert"/>
      </div>
      <Row gap={8} style={{marginBottom:12}}>
        <select value={fb} onChange={e=>setFb(e.target.value)} style={{flex:1,padding:'8px 10px',borderRadius:9,border:`1.5px solid ${C.pinkPale}`,fontSize:12,fontFamily:'inherit',outline:'none',color:C.dark}}>
          <option value="all">All Batches</option>{data.batches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={fs} onChange={e=>setFs(e.target.value)} style={{flex:1,padding:'8px 10px',borderRadius:9,border:`1.5px solid ${C.pinkPale}`,fontSize:12,fontFamily:'inherit',outline:'none',color:C.dark}}>
          <option value="all">All Students</option>{data.students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <Btn small onClick={()=>{setForm({student_id:data.students[0]?.id||'',batch_id:data.batches[0]?.id||'',amount:'',paid:'',type:'Full',date:today(),note:''});setModal('add')}}><Ic n="add" size={14} color={C.white}/></Btn>
      </Row>
      {filtered.map(p=>{const s=data.students.find(x=>x.id===p.student_id);const b=data.batches.find(x=>x.id===p.batch_id);const due=Number(p.amount)-Number(p.paid);return(
        <Card key={p.id} accent={due>0?C.amber:C.green}>
          <Row style={{justifyContent:'space-between',marginBottom:6}}><div><div style={{fontWeight:700,fontSize:14}}>{s?.name||'Unknown'}</div><div style={{fontSize:12,color:C.grey}}>{b?.name}</div></div><Badge color={p.type==='Full'?C.green:C.amber}>{p.type}</Badge></Row>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:8}}>{[['Fee',fmt(p.amount),C.dark],['Paid',fmt(p.paid),C.green],['Due',fmt(due),due>0?C.amber:C.green]].map(([l,v,c])=><div key={l} style={{background:c+'10',borderRadius:8,padding:'6px 8px',textAlign:'center'}}><div style={{fontSize:10,color:c}}>{l}</div><div style={{fontSize:13,fontWeight:700,color:c}}>{v}</div></div>)}</div>
          <div style={{fontSize:11,color:C.grey,marginBottom:6}}>📅 {p.date}{p.note&&` · ${p.note}`}</div>
          {due>0&&s&&<a href={`https://wa.me/91${s.mobile}?text=${encodeURIComponent('Hi '+s.name+'! Gentle reminder: payment of '+fmt(due)+' pending for '+(b?.name||'your course')+'. — Kajol Maam 💄')}`} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:C.wa,display:'flex',alignItems:'center',gap:5,marginBottom:8,textDecoration:'none'}}><Ic n="wa" size={13} color={C.wa}/> Send Payment Reminder</a>}
          <Row gap={7}><Btn small outline onClick={()=>{setForm({...p});setModal('edit_'+p.id)}}>✏️</Btn><Btn small color={C.red} onClick={()=>setDel(p)}>🗑️</Btn></Row>
          {modal===('edit_'+p.id)&&<Modal onClose={()=>setModal(null)} title="Edit Payment">
            <Inp label="Amount(₹)" value={form.amount} onChange={v=>setForm(x=>({...x,amount:v}))} type="number"/>
            <Inp label="Paid(₹)" value={form.paid} onChange={v=>setForm(x=>({...x,paid:v}))} type="number"/>
            <Inp label="Type" value={form.type} onChange={v=>setForm(x=>({...x,type:v}))} opts={['Full','Partial']}/>
            <Inp label="Date" value={form.date} onChange={v=>setForm(x=>({...x,date:v}))} type="date"/>
            <Inp label="Note" value={form.note} onChange={v=>setForm(x=>({...x,note:v}))}/>
            <Row gap={8}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn onClick={save} full disabled={busy}>{busy?'…':'Save'}</Btn></Row>
          </Modal>}
        </Card>
      )})}
      {modal==='add'&&<Modal onClose={()=>setModal(null)} title="Add Payment">
        <Inp label="Student" value={form.student_id} onChange={v=>setForm(x=>({...x,student_id:v}))} opts={data.students.map(s=>({v:s.id,l:s.name}))}/>
        <Inp label="Batch" value={form.batch_id} onChange={v=>setForm(x=>({...x,batch_id:v}))} opts={data.batches.map(b=>({v:b.id,l:b.name}))}/>
        <Inp label="Total Fee(₹)" value={form.amount} onChange={v=>setForm(x=>({...x,amount:v}))} type="number"/>
        <Inp label="Amount Paid(₹)" value={form.paid} onChange={v=>setForm(x=>({...x,paid:v}))} type="number"/>
        <Inp label="Type" value={form.type||'Full'} onChange={v=>setForm(x=>({...x,type:v}))} opts={['Full','Partial']}/>
        <Inp label="Date" value={form.date||today()} onChange={v=>setForm(x=>({...x,date:v}))} type="date"/>
        <Inp label="Note" value={form.note} onChange={v=>setForm(x=>({...x,note:v}))}/>
        <Row gap={8}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn color={C.green} onClick={save} full disabled={busy}>{busy?'…':'Save'}</Btn></Row>
      </Modal>}
      {del&&<DelConfirm item="this payment" onConfirm={async()=>{await dbDelete('payments',del.id);setData(d=>({...d,payments:d.payments.filter(p=>p.id!==del.id)}));toast('Deleted.')}} onClose={()=>setDel(null)}/>}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   ORDERS TAB
═══════════════════════════════════════════════════════════════════ */
function OrdersTab({data,setData,toast}) {
  const [modal,setModal]=useState(null); const [del,setDel]=useState(null)
  const [form,setForm]=useState({}); const [exp,setExp]=useState({desc:'',amt:''}); const [busy,setBusy]=useState(false)
  const save=async()=>{if(!form.client||!form.amount)return alert('Client and charge required.');setBusy(true);const row={id:form.id||uid(),type:form.type||'Mehndi',client:form.client,mobile:form.mobile||'',date:form.date||today(),amount:Number(form.amount),paid:Number(form.paid||0),status:form.status||'Pending',notes:form.notes||'',order_expenses:form.order_expenses||[]};await dbUpsert('orders',row);setData(d=>({...d,orders:form.id?d.orders.map(o=>o.id===form.id?{...o,...row}:o):[...d.orders,row]}));setBusy(false);setModal(null);toast('Order saved!')}
  const tc=t=>t==='Mehndi'?C.green:t==='Makeup'?C.pink:C.purple
  const ExpRow=()=><>
    <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:6}}>Order Expenses</div>
    {(form.order_expenses||[]).map((e,i)=><Row key={i} gap={6} style={{marginBottom:5}}><div style={{fontSize:12,flex:1,background:C.greyL,borderRadius:8,padding:'5px 8px'}}>{e.desc} — ₹{e.amt}</div><Btn small color={C.red} onClick={()=>setForm(x=>({...x,order_expenses:x.order_expenses.filter((_,j)=>j!==i)}))}>×</Btn></Row>)}
    <Row gap={6} style={{marginBottom:12}}>
      <input value={exp.desc} onChange={e=>setExp(x=>({...x,desc:e.target.value}))} placeholder="e.g. Mehndi cones" style={{flex:2,padding:'7px 10px',borderRadius:8,border:`1.5px solid ${C.pinkPale}`,fontSize:12,fontFamily:'inherit',outline:'none'}}/>
      <input value={exp.amt} onChange={e=>setExp(x=>({...x,amt:e.target.value}))} placeholder="₹" type="number" style={{flex:1,padding:'7px 10px',borderRadius:8,border:`1.5px solid ${C.pinkPale}`,fontSize:12,fontFamily:'inherit',outline:'none'}}/>
      <Btn small onClick={()=>{if(exp.desc&&exp.amt){setForm(x=>({...x,order_expenses:[...(x.order_expenses||[]),{...exp}]}));setExp({desc:'',amt:''})}}}><Ic n="add" size={13} color={C.white}/></Btn>
    </Row>
  </>
  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:9,marginBottom:14}}>
        <StatBox label="Revenue" value={fmt(data.orders.reduce((s,o)=>s+Number(o.paid),0))} color={C.green} icon="rupee"/>
        <StatBox label="Expenses" value={fmt(data.orders.reduce((s,o)=>s+(o.order_expenses||[]).reduce((a,e)=>a+Number(e.amt),0),0))} color={C.amber} icon="expenses"/>
        <StatBox label="Pending" value={data.orders.filter(o=>o.status==='Pending').length} color={C.red} icon="order"/>
      </div>
      <Row style={{justifyContent:'space-between',marginBottom:12}}>
        <STitle><Ic n="order" size={15} color={C.teal}/> Individual Orders</STitle>
        <Btn small onClick={()=>{setForm({type:'Mehndi',client:'',mobile:'',date:today(),amount:'',paid:'',status:'Pending',notes:'',order_expenses:[]});setExp({desc:'',amt:''});setModal('add')}}><Ic n="add" size={14} color={C.white}/>New</Btn>
      </Row>
      {data.orders.map(o=>{const due=Number(o.amount)-Number(o.paid);const oExp=(o.order_expenses||[]).reduce((a,e)=>a+Number(e.amt),0);return(
        <Card key={o.id} accent={tc(o.type)}>
          <Row style={{justifyContent:'space-between',marginBottom:6}}><div><div style={{fontWeight:700,fontSize:14}}>{o.client}</div><div style={{fontSize:12,color:C.grey}}>📱 {o.mobile} · {fmtDate(o.date)}</div>{o.notes&&<div style={{fontSize:11,color:C.grey}}>{o.notes}</div>}</div><div style={{textAlign:'right'}}><Badge color={tc(o.type)}>{o.type}</Badge><div style={{marginTop:4}}><Badge color={o.status==='Completed'?C.green:o.status==='Cancelled'?C.red:C.amber}>{o.status}</Badge></div></div></Row>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:5,marginBottom:8}}>{[['Charge',fmt(o.amount),C.dark],[due>0?'Due':'Paid',due>0?fmt(due):fmt(o.paid),due>0?C.amber:C.green],['Exp.',fmt(oExp),C.red],['Profit',fmt(Number(o.paid)-oExp),(Number(o.paid)-oExp)>=0?C.green:C.red]].map(([l,v,c])=><div key={l} style={{background:C.greyL,borderRadius:8,padding:'5px 6px',textAlign:'center'}}><div style={{fontSize:9,color:C.grey}}>{l}</div><div style={{fontSize:12,fontWeight:700,color:c}}>{v}</div></div>)}</div>
          {(o.order_expenses||[]).length>0&&<div style={{background:'#FFF3E0',borderRadius:8,padding:'7px 10px',marginBottom:8}}>{(o.order_expenses||[]).map((e,i)=><div key={i} style={{fontSize:11,display:'flex',justifyContent:'space-between'}}><span>{e.desc}</span><span style={{fontWeight:700}}>₹{e.amt}</span></div>)}</div>}
          <Row gap={7} style={{flexWrap:'wrap'}}>
            <Btn small outline onClick={()=>{setForm({...o,order_expenses:[...(o.order_expenses||[])]});setExp({desc:'',amt:''});setModal('edit_'+o.id)}}>✏️</Btn>
            <select value={o.status} onChange={async e=>{const u={...o,status:e.target.value};await dbUpsert('orders',u);setData(d=>({...d,orders:d.orders.map(x=>x.id===o.id?u:x)}));toast('Updated.')}} style={{fontSize:11,borderRadius:8,border:`1.5px solid ${C.pinkPale}`,padding:'5px 8px',fontFamily:'inherit',cursor:'pointer',color:C.dark}}>
              {['Pending','In Progress','Completed','Cancelled'].map(s=><option key={s}>{s}</option>)}
            </select>
            {o.mobile&&due>0&&<a href={`https://wa.me/91${o.mobile}?text=${encodeURIComponent('Hi '+o.client+'! Payment of '+fmt(due)+' pending for your '+o.type+' booking. — Kajol Makeover Studioz 💄')}`} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}><Btn small color={C.wa}><Ic n="wa" size={12} color={C.white}/>Remind</Btn></a>}
            <Btn small color={C.red} onClick={()=>setDel(o)}>🗑️</Btn>
          </Row>
          {modal===('edit_'+o.id)&&<Modal onClose={()=>setModal(null)} title="Edit Order"><Inp label="Client" value={form.client} onChange={v=>setForm(x=>({...x,client:v}))}/><Inp label="Mobile" value={form.mobile} onChange={v=>setForm(x=>({...x,mobile:v}))}/><Inp label="Type" value={form.type} onChange={v=>setForm(x=>({...x,type:v}))} opts={ORDER_TYPES}/><Inp label="Date" value={form.date} onChange={v=>setForm(x=>({...x,date:v}))} type="date"/><Inp label="Charge(₹)" value={form.amount} onChange={v=>setForm(x=>({...x,amount:v}))} type="number"/><Inp label="Paid(₹)" value={form.paid} onChange={v=>setForm(x=>({...x,paid:v}))} type="number"/><Inp label="Status" value={form.status} onChange={v=>setForm(x=>({...x,status:v}))} opts={['Pending','In Progress','Completed','Cancelled']}/><Inp label="Notes" value={form.notes} onChange={v=>setForm(x=>({...x,notes:v}))}/><ExpRow/><Row gap={8}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn onClick={save} full disabled={busy}>{busy?'…':'Save'}</Btn></Row></Modal>}
        </Card>
      )})}
      {modal==='add'&&<Modal onClose={()=>setModal(null)} title="New Order"><Inp label="Client Name *" value={form.client} onChange={v=>setForm(x=>({...x,client:v}))}/><Inp label="Mobile" value={form.mobile} onChange={v=>setForm(x=>({...x,mobile:v}))}/><Inp label="Type" value={form.type||'Mehndi'} onChange={v=>setForm(x=>({...x,type:v}))} opts={ORDER_TYPES}/><Inp label="Date" value={form.date||today()} onChange={v=>setForm(x=>({...x,date:v}))} type="date"/><Inp label="Charge(₹) *" value={form.amount} onChange={v=>setForm(x=>({...x,amount:v}))} type="number"/><Inp label="Paid(₹)" value={form.paid} onChange={v=>setForm(x=>({...x,paid:v}))} type="number"/><Inp label="Notes" value={form.notes} onChange={v=>setForm(x=>({...x,notes:v}))}/><ExpRow/><Row gap={8}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn color={C.teal} onClick={save} full disabled={busy}>{busy?'…':'Add Order'}</Btn></Row></Modal>}
      {del&&<DelConfirm item={`order for ${del.client}`} onConfirm={async()=>{await dbDelete('orders',del.id);setData(d=>({...d,orders:d.orders.filter(o=>o.id!==del.id)}));toast('Deleted.')}} onClose={()=>setDel(null)}/>}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   FINANCE + REPORTS + SETTINGS  (compact inline)
═══════════════════════════════════════════════════════════════════ */
function FinanceTab({data,setData,toast}) {
  const [modal,setModal]=useState(null); const [del,setDel]=useState(null); const [form,setForm]=useState({}); const [busy,setBusy]=useState(false)
  const save=async()=>{if(!form.amount)return alert('Amount required.');setBusy(true);const row={id:form.id||uid(),category:form.category||'Advertising',amount:Number(form.amount),date:form.date||today(),note:form.note||'',linked_to:form.linked_to||'general'};await dbUpsert('expenses',row);setData(d=>({...d,expenses:form.id?d.expenses.map(e=>e.id===form.id?{...e,...row}:e):[...d.expenses,row]}));setBusy(false);setModal(null);toast('Expense saved!')}
  const ti=data.payments.reduce((s,p)=>s+Number(p.paid),0)+data.orders.reduce((s,o)=>s+Number(o.paid),0)
  const te=data.expenses.reduce((s,e)=>s+Number(e.amount),0)+data.orders.reduce((s,o)=>s+(o.order_expenses||[]).reduce((a,e)=>a+Number(e.amt),0),0)
  const bi=data.batches.map(b=>({name:b.name.slice(0,14),inc:data.payments.filter(p=>p.batch_id===b.id).reduce((s,p)=>s+Number(p.paid),0)}))
  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:14}}>{[['Income',fmt(ti),C.green],['Expenses',fmt(te),C.red],['Profit',fmt(ti-te),ti-te>=0?C.pink:C.red]].map(([l,v,c])=><div key={l} style={{background:C.white,borderRadius:14,padding:12,boxShadow:'0 2px 10px rgba(0,0,0,0.06)',border:`1px solid ${C.pinkPale}`,textAlign:'center'}}><div style={{fontSize:10,color:C.grey,fontWeight:700,textTransform:'uppercase'}}>{l}</div><div style={{fontSize:14,fontWeight:800,color:c,marginTop:4}}>{v}</div></div>)}</div>
      <Card><STitle><Ic n="chart" size={15} color={C.pink}/> Income by Batch</STitle>{bi.map(b=><div key={b.name} style={{marginBottom:10}}><Row style={{justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:12,fontWeight:600}}>{b.name}</span><span style={{fontSize:12,fontWeight:700,color:C.green}}>{fmt(b.inc)}</span></Row><div style={{background:C.pinkPale,borderRadius:10,height:8,overflow:'hidden'}}><div style={{background:`linear-gradient(90deg,${C.pink},${C.green})`,height:'100%',borderRadius:10,width:ti>0?`${(b.inc/ti)*100}%`:'0%',transition:'width .5s'}}/></div></div>)}</Card>
      <Row style={{justifyContent:'space-between',marginBottom:12}}><STitle><Ic n="expenses" size={15} color={C.amber}/> Expenses</STitle><Btn small onClick={()=>{setForm({category:'Advertising',amount:'',date:today(),note:'',linked_to:'general'});setModal('add')}}><Ic n="add" size={14} color={C.white}/>Add</Btn></Row>
      {data.expenses.map(e=><Card key={e.id} accent={C.amber}><Row style={{justifyContent:'space-between'}}><div><div style={{fontWeight:700,fontSize:13}}>{e.category}</div><div style={{fontSize:12,color:C.grey}}>{e.note} · {e.date}</div></div><div style={{textAlign:'right'}}><div style={{fontSize:18,fontWeight:800,color:C.amber}}>{fmt(e.amount)}</div><Row gap={5} style={{marginTop:6,justifyContent:'flex-end'}}><Btn small outline onClick={()=>{setForm({...e});setModal('edit_'+e.id)}}>✏️</Btn><Btn small color={C.red} onClick={()=>setDel(e)}>🗑️</Btn></Row></div></Row>
        {modal===('edit_'+e.id)&&<Modal onClose={()=>setModal(null)} title="Edit Expense"><Inp label="Category" value={form.category} onChange={v=>setForm(x=>({...x,category:v}))} opts={EXP_CATS}/><Inp label="Amount(₹)" value={form.amount} onChange={v=>setForm(x=>({...x,amount:v}))} type="number"/><Inp label="Date" value={form.date} onChange={v=>setForm(x=>({...x,date:v}))} type="date"/><Inp label="Note" value={form.note} onChange={v=>setForm(x=>({...x,note:v}))}/><Row gap={8}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn onClick={save} full disabled={busy}>{busy?'…':'Save'}</Btn></Row></Modal>}
      </Card>)}
      {modal==='add'&&<Modal onClose={()=>setModal(null)} title="Add Expense"><Inp label="Category" value={form.category||'Advertising'} onChange={v=>setForm(x=>({...x,category:v}))} opts={EXP_CATS}/><Inp label="Amount(₹) *" value={form.amount} onChange={v=>setForm(x=>({...x,amount:v}))} type="number"/><Inp label="Date" value={form.date||today()} onChange={v=>setForm(x=>({...x,date:v}))} type="date"/><Inp label="Description" value={form.note} onChange={v=>setForm(x=>({...x,note:v}))}/><Inp label="Linked To" value={form.linked_to||'general'} onChange={v=>setForm(x=>({...x,linked_to:v}))} opts={[{v:'general',l:'General'},...data.batches.map(b=>({v:b.id,l:b.name}))]}/><Row gap={8}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn color={C.amber} onClick={save} full disabled={busy}>{busy?'…':'Save'}</Btn></Row></Modal>}
      {del&&<DelConfirm item={`${del.category} expense`} onConfirm={async()=>{await dbDelete('expenses',del.id);setData(d=>({...d,expenses:d.expenses.filter(e=>e.id!==del.id)}));toast('Deleted.')}} onClose={()=>setDel(null)}/>}
    </div>
  )
}

function ReportsTab({data}) {
  const [type,setType]=useState('overall')
  const [showExport,setShowExport]=useState(false)
  const cf=data.payments.reduce((s,p)=>s+Number(p.paid),0); const or_=data.orders.reduce((s,o)=>s+Number(o.paid),0); const ti=cf+or_
  const ge=data.expenses.reduce((s,e)=>s+Number(e.amount),0); const oe=data.orders.reduce((s,o)=>s+(o.order_expenses||[]).reduce((a,e)=>a+Number(e.amt),0),0); const te=ge+oe
  const pd=data.payments.reduce((s,p)=>s+(Number(p.amount)-Number(p.paid)),0)+data.orders.reduce((s,o)=>s+(Number(o.amount)-Number(o.paid)),0)
  const months=useMemo(()=>{const m={};data.payments.forEach(p=>{if(p.date){const k=mKey(p.date);if(!m[k])m[k]={i:0,o:0,e:0,oe:0};m[k].i+=Number(p.paid)}});data.orders.forEach(o=>{if(o.date){const k=mKey(o.date);if(!m[k])m[k]={i:0,o:0,e:0,oe:0};m[k].o+=Number(o.paid);m[k].oe+=(o.order_expenses||[]).reduce((a,e)=>a+Number(e.amt),0)}});data.expenses.forEach(e=>{if(e.date){const k=mKey(e.date);if(!m[k])m[k]={i:0,o:0,e:0,oe:0};m[k].e+=Number(e.amount)}});return Object.entries(m).sort((a,b)=>b[0].localeCompare(a[0]))},[data])
  return (
    <div>
      <Row style={{justifyContent:'flex-end',marginBottom:10}}>
        <Btn small color={C.green} onClick={()=>setShowExport(true)}><Ic n="upload" size={13} color={C.white}/>Export to Excel</Btn>
      </Row>
      <div style={{display:'flex',gap:6,overflowX:'auto',marginBottom:14,paddingBottom:4}}>{[{v:'overall',l:'Summary'},{v:'monthly',l:'Monthly'},{v:'batch',l:'Batch'},{v:'student',l:'Student'}].map(t=><div key={t.v} onClick={()=>setType(t.v)} style={{flexShrink:0,padding:'7px 14px',borderRadius:20,background:type===t.v?C.pink:C.greyL,color:type===t.v?C.white:C.grey,fontSize:12,fontWeight:type===t.v?700:500,cursor:'pointer'}}>{t.l}</div>)}</div>
      {type==='overall'&&<><Card accent={C.pink}><STitle><Ic n="rupee" size={15} color={C.pink}/> Financial Summary</STitle>{[['Class Fees',fmt(cf),C.green],['Orders Income',fmt(or_),C.teal],['Total Income',fmt(ti),C.green],['General Expenses',fmt(ge),C.red],['Order Expenses',fmt(oe),C.amber],['Total Expenses',fmt(te),C.red],['NET PROFIT',fmt(ti-te),ti-te>=0?C.green:C.red],['Pending Dues',fmt(pd),C.amber]].map(([l,v,c])=><div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'5px 0',borderBottom:`1px solid ${C.pinkPale}`,fontWeight:l.includes('NET')||l.includes('Total')?700:400}}><span style={{color:l.includes('NET')?C.pink:C.grey}}>{l}</span><span style={{fontWeight:700,color:c}}>{v}</span></div>)}</Card>
      <Card><STitle><Ic n="star" size={15} color={C.blue}/> Studio Stats</STitle>{[['Students',data.students.length],['Batches',data.batches.length],['Active Batches',data.batches.filter(b=>b.status==='Active').length],['Total Classes',data.classes.length],['YT Uploaded',data.classes.filter(c=>c.youtube_status==='Uploaded').length],['Enrollment Requests',(data.enrollmentRequests||[]).length]].map(([l,v])=><div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'5px 0',borderBottom:`1px solid ${C.pinkPale}`}}><span style={{color:C.grey}}>{l}</span><span style={{fontWeight:700}}>{v}</span></div>)}</Card></>}
      {type==='monthly'&&<div><STitle><Ic n="calendar" size={15} color={C.pink}/> Monthly Report</STitle>{months.map(([m,v])=><Card key={m} accent={C.pink}><div style={{fontWeight:700,fontSize:15,marginBottom:10}}>{mLabel(m)}</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>{[['Class Fees',fmt(v.i),C.green],['Order Income',fmt(v.o),C.teal],['Expenses',fmt(v.e),C.red],['Order Exp.',fmt(v.oe),C.amber]].map(([l,val,c])=><div key={l} style={{background:c+'10',borderRadius:10,padding:'8px 10px'}}><div style={{fontSize:10,color:c,fontWeight:700}}>{l}</div><div style={{fontSize:15,fontWeight:800,color:c}}>{val}</div></div>)}</div><div style={{background:C.pinkPale,borderRadius:10,padding:'8px 10px',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:13,fontWeight:700}}>Net Profit</span><span style={{fontSize:15,fontWeight:800,color:(v.i+v.o-v.e-v.oe)>=0?C.green:C.red}}>{fmt(v.i+v.o-v.e-v.oe)}</span></div></Card>)}{months.length===0&&<div style={{textAlign:'center',color:C.grey,padding:32}}>No data yet.</div>}</div>}
       {type==='batch'&&<div><STitle><Ic n="batch" size={15} color={C.blue}/> Batch Report</STitle>{data.batches.map(b=>{const income=data.payments.filter(p=>p.batch_id===b.id).reduce((s,p)=>s+Number(p.paid),0);const due=data.payments.filter(p=>p.batch_id===b.id).reduce((s,p)=>s+(Number(p.amount)-Number(p.paid)),0);const exp=data.expenses.filter(e=>e.linked_to===b.id).reduce((s,e)=>s+Number(e.amount),0);const c2=data.courses.find(c=>c.id===b.course_id);return(<Card key={b.id} accent={c2?.color||C.pink}><Row style={{justifyContent:'space-between',marginBottom:8}}><div style={{fontWeight:700,fontSize:14}}>{b.name}</div><Badge color={b.status==='Active'?C.green:C.grey}>{b.status}</Badge></Row><Row gap={6} style={{marginBottom:8}}>{[['Students',b.student_ids?.length||0,C.purple],['Classes',data.classes.filter(c=>c.batch_id===b.id).length,C.blue]].map(([l,v,c])=><span key={l} style={{background:c+'12',borderRadius:8,padding:'4px 10px',fontSize:11,color:c,fontWeight:700}}>{l}: {v}</span>)}</Row>{[['Income',fmt(income),C.green],['Pending',fmt(due),C.amber],['Expenses',fmt(exp),C.red],['Net',fmt(income-exp),income-exp>=0?C.green:C.red]].map(([l,v,c])=><div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'4px 0',borderBottom:`1px solid ${C.pinkPale}`}}><span style={{color:C.grey}}>{l}</span><span style={{fontWeight:700,color:c}}>{v}</span></div>)}</Card>)})}</div>}
     {type==='student'&&<div><STitle><Ic n="students" size={15} color={C.purple}/> Student Report</STitle>{data.students.map(s=>{const paid=data.payments.filter(p=>p.student_id===s.id).reduce((a,p)=>a+Number(p.paid),0);const due=data.payments.filter(p=>p.student_id===s.id).reduce((a,p)=>a+(Number(p.amount)-Number(p.paid)),0);const bats=data.batches.filter(b=>(b.student_ids||[]).includes(s.id));const att=data.classes.reduce((a,c)=>{if(bats.find(b=>b.id===c.batch_id)&&(c.attendees||[]).includes(s.id))return a+1;return a},0);const tc=data.classes.filter(c=>bats.find(b=>b.id===c.batch_id)).length;const hwS=data.homeworkCompliance.filter(h=>h.student_id===s.id&&h.submitted).length;const hwT=data.homeworkCompliance.filter(h=>h.student_id===s.id).length;return(<Card key={s.id}><Row gap={10} style={{marginBottom:8}}><div style={{width:38,height:38,borderRadius:'50%',background:`linear-gradient(135deg,${C.pink},${C.pinkD})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:16,flexShrink:0}}>{(s.name||'?')[0]}</div><div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{s.name}</div><div style={{fontSize:11,color:C.grey}}>{bats.length} batch{bats.length!==1?'es':''} · {s.mobile}</div></div></Row><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>{[['Paid',fmt(paid),C.green],['Due',fmt(due),C.amber],['Attendance',`${att}/${tc}`,C.blue],['HW Done',`${hwS}/${hwT}`,C.teal]].map(([l,v,c])=><div key={l} style={{background:c+'10',borderRadius:8,padding:'6px 10px'}}><div style={{fontSize:10,color:c,fontWeight:700}}>{l}</div><div style={{fontSize:14,fontWeight:800,color:c}}>{v}</div></div>)}</div></Card>)})}</div>}
      {showExport&&<ExportModal data={data} onClose={()=>setShowExport(false)}/>}
    </div>
  )
}

function SettingsTab({data,setData,onLogout,toast}) {
  const [modal,setModal]=useState(null); const [pwd,setPwd]=useState(''); const [err,setErr]=useState(''); const [busy,setBusy]=useState(false)
  const doClear=async()=>{if(pwd!==ADMIN_PWD){setErr('Wrong password.');return}setBusy(true);await clearAll();setData({students:[],courses:[],batches:[],classes:[],homeworkCompliance:[],payments:[],orders:[],expenses:[],enrollmentRequests:[]});setBusy(false);setModal(null);setPwd('');toast('All data cleared.')}
  const exportData=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`kajol-backup-${today()}.json`;a.click();URL.revokeObjectURL(url);toast('Exported!')}
  return (
    <div>
      <Card><div style={{textAlign:'center',padding:'8px 0 16px'}}><div style={{fontSize:48,marginBottom:8}}>💄</div><div style={{fontSize:18,fontWeight:900,color:C.dark}}>Kajol Makeover Studioz</div><div style={{fontSize:12,color:C.grey,marginTop:4}}>Version 3.1 · Cloud Edition</div></div></Card>
      <Card accent={C.pink}><STitle><Ic n="link" size={15} color={C.pink}/> Enrollment Form</STitle><div style={{background:C.pinkPale,borderRadius:10,padding:'8px 12px',fontSize:12,fontWeight:700,wordBreak:'break-all',marginBottom:10}}>🔗 {ENROLL_URL}</div><Row gap={8}><Btn small onClick={()=>{navigator.clipboard?.writeText(ENROLL_URL);toast('Copied!')}}>Copy</Btn><a href={ENROLL_URL} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}><Btn small outline>Open</Btn></a></Row></Card>
      <Card><STitle><Ic n="info" size={15} color={C.green}/> Database</STitle>{[['Students',data.students.length],['Courses',data.courses.length],['Batches',data.batches.length],['Classes',data.classes.length],['Payments',data.payments.length],['Orders',data.orders.length],['Expenses',data.expenses.length],['Enroll Requests',(data.enrollmentRequests||[]).length]].map(([l,v])=><div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'5px 0',borderBottom:`1px solid ${C.pinkPale}`}}><span style={{color:C.grey}}>{l}</span><span style={{fontWeight:700}}>{v}</span></div>)}</Card>
      <Card accent={C.green}><STitle><Ic n="rupee" size={15} color={C.green}/> UPI Payment Info</STitle>
    <div style={{fontSize:12,color:C.grey,marginBottom:10}}>Share UPI details with students for fee payment</div>
    <div style={{background:C.greenPale,borderRadius:10,padding:12,marginBottom:10}}>
      <div style={{fontSize:13,fontWeight:700,color:C.green}}>📱 Google Pay / PhonePe / Paytm</div>
      <div style={{fontSize:15,fontWeight:900,color:C.dark,marginTop:4}}>8390695155</div>
      <div style={{fontSize:12,color:C.grey,marginTop:2}}>Kajal Jivan Kamble</div>
      <div style={{fontSize:11,color:C.grey}}>UPI ID: kajalkambaleaxis@yesg</div>
    </div>
    <Row gap={8}><Btn small color={C.wa} onClick={()=>{const m='💳 *Fee Payment — Kajol Makeover Studioz*\n\nPlease pay your course fee via UPI:\n📱 *8390695155* (Google Pay / PhonePe / Paytm)\nUPI ID: kajalkambaleaxis@yesg\nName: Kajal Jivan Kamble\n\nPlease share payment screenshot after payment. 🙏\n— Kajol Maam';navigator.share?navigator.share({text:m}):(navigator.clipboard?.writeText(m),toast('Payment info copied!'))}}>Share UPI Details</Btn>
      <Btn small color={C.blue} onClick={()=>{navigator.clipboard?.writeText('kajalkambaleaxis@yesg');toast('UPI ID copied!')}}>Copy UPI ID</Btn>
    </Row>
    <div style={{marginTop:10,textAlign:'center'}}>
      <img src="/upi-qr.jpg" alt="UPI QR" style={{width:140,height:140,borderRadius:12,border:`2px solid ${C.pinkPale}`,objectFit:'contain'}} onError={e=>{e.target.style.display='none'}}/>
    </div></Card>
  <Card><STitle><Ic n="upload" size={15} color={C.blue}/> Backup</STitle><Btn color={C.blue} onClick={exportData} full><Ic n="upload" size={14} color={C.white}/>Export All Data (JSON)</Btn></Card>
      <Card accent={C.red}><STitle><Ic n="alert" size={15} color={C.red}/> Danger Zone</STitle><div style={{fontSize:12,color:C.grey,marginBottom:12}}>Permanently delete all records. Cannot be undone.</div><Btn color={C.red} onClick={()=>{setPwd('');setErr('');setModal('clear')}} full><Ic n="del" size={14} color={C.white}/>Clear All App Data</Btn><Btn outline onClick={onLogout} full style={{marginTop:10}}><Ic n="lock" size={14} color={C.pink}/>Logout</Btn></Card>
      {modal==='clear'&&<Modal onClose={()=>setModal(null)} title={<><Ic n="alert" size={16} color={C.red}/> Clear All Data</>}>
        <div style={{background:C.red+'12',borderRadius:10,padding:12,marginBottom:14,fontSize:13,color:C.red}}>⚠️ This will permanently delete ALL records from the database. This CANNOT be undone.</div>
        <Inp label="Admin Password to Confirm" value={pwd} onChange={v=>{setPwd(v);setErr('')}} type="password"/>
        {err&&<div style={{color:C.red,fontSize:12,marginBottom:8,background:C.red+'12',borderRadius:8,padding:'6px 10px'}}>{err}</div>}
        <Row gap={8}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn color={C.red} onClick={doClear} full disabled={busy}>{busy?'Clearing…':'Delete Everything'}</Btn></Row>
      </Modal>}
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════
   WEBSITE EDITOR TAB  v2 — gallery photos, rich reviews, YouTube
═══════════════════════════════════════════════════════════════════ */

/* ── Supabase file upload helper (uses public bucket "site-media") ──
   HOW TO SET UP the storage bucket (one-time):
   1. In Supabase dashboard → Storage → New Bucket → name: "site-media" → Public: ON
   2. In Bucket settings → Policies → add policy: allow all (anon) for insert/select
   Then the upload buttons in this tab will work.                           ── */
async function uploadToSupabase(file, folder) {
  const ext = file.name.split('.').pop()
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const { data, error } = await sb.storage.from('site-media').upload(path, file, { upsert:true })
  if(error) { alert('Upload failed: '+error.message); return null }
  const { data:pub } = sb.storage.from('site-media').getPublicUrl(path)
  return pub.publicUrl
}

/* ── Quick Review Adder ── */
function QuickReviewAdder({currentJson,onSave}) {
  const [r,setR]=useState({type:'text',name:'',role:'',text:'',initial:'',color:'#E91E8C',media_url:''})
  const [uploading,setUploading]=useState(false)
  const fileRef=useRef()

  const handleFile=async(e)=>{
    const file=e.target.files[0]; if(!file) return
    setUploading(true)
    const url=await uploadToSupabase(file,'reviews')
    if(url) setR(x=>({...x,media_url:url}))
    setUploading(false)
  }

  const add=()=>{
    if(!r.name){alert('Student name required.');return}
    if(r.type==='text'&&!r.text){alert('Review text required.');return}
    try{
      const arr=JSON.parse(currentJson||'[]')
      arr.push({...r,initial:r.initial||r.name[0]})
      onSave(JSON.stringify(arr,null,2))
      setR({type:'text',name:'',role:'',text:'',initial:'',color:'#E91E8C',media_url:''})
    }catch{alert('Existing reviews JSON is invalid. Please fix it first.')}
  }
  const fs={width:'100%',padding:'9px 11px',borderRadius:9,border:`1.5px solid ${C.pinkPale}`,fontSize:12,fontFamily:'inherit',outline:'none',color:C.dark,boxSizing:'border-box',background:C.white,marginBottom:9}
  return(
    <div>
      <div style={{marginBottom:9}}>
        <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:5,textTransform:'uppercase',letterSpacing:.5}}>Review Type</div>
        <Row gap={6} style={{flexWrap:'wrap'}}>
          {[['text','💬 Text'],['image','🖼️ Photo'],['whatsapp','📱 WA Screenshot'],['video','▶ Video']].map(([v,l])=>(
            <div key={v} onClick={()=>setR(x=>({...x,type:v}))} style={{padding:'5px 12px',borderRadius:12,background:r.type===v?C.pink:C.greyL,color:r.type===v?C.white:C.grey,fontSize:11,fontWeight:r.type===v?700:500,cursor:'pointer'}}>{l}</div>
          ))}
        </Row>
      </div>
      <input value={r.name} onChange={e=>setR(x=>({...x,name:e.target.value}))} placeholder="Student name *" style={fs}/>
      <input value={r.role} onChange={e=>setR(x=>({...x,role:e.target.value}))} placeholder="Role (e.g. Homemaker · Mehndi Student)" style={fs}/>
      {r.type==='text'&&<textarea rows={3} value={r.text} onChange={e=>setR(x=>({...x,text:e.target.value}))} placeholder="Review text *" style={{...fs,resize:'vertical'}}/>}
      {(r.type==='image'||r.type==='whatsapp')&&<>
        <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile}/>
        <div style={{display:'flex',gap:8,marginBottom:9}}>
          <Btn small onClick={()=>fileRef.current.click()} disabled={uploading} color={C.blue}>
            {uploading?'Uploading…':'📷 Upload Photo'}
          </Btn>
          {r.media_url&&<span style={{fontSize:11,color:C.green,alignSelf:'center'}}>✅ Uploaded</span>}
        </div>
        <input value={r.media_url} onChange={e=>setR(x=>({...x,media_url:e.target.value}))} placeholder="Or paste image URL" style={fs}/>
        <textarea rows={2} value={r.text} onChange={e=>setR(x=>({...x,text:e.target.value}))} placeholder="Caption (optional)" style={{...fs,resize:'vertical'}}/>
      </>}
      {r.type==='video'&&<>
        <input value={r.media_url} onChange={e=>setR(x=>({...x,media_url:e.target.value}))} placeholder="YouTube video URL or direct video link" style={fs}/>
        <textarea rows={2} value={r.text} onChange={e=>setR(x=>({...x,text:e.target.value}))} placeholder="Caption (optional)" style={{...fs,resize:'vertical'}}/>
      </>}
      <Row gap={8} style={{alignItems:'flex-start',marginBottom:4}}>
        <input value={r.initial} onChange={e=>setR(x=>({...x,initial:e.target.value}))} placeholder="Initial" style={{...fs,width:70,marginBottom:0}}/>
        <input type="color" value={r.color} onChange={e=>setR(x=>({...x,color:e.target.value}))} style={{height:38,borderRadius:8,border:'none',cursor:'pointer'}}/>
        <Btn small color={C.green} onClick={add}>+ Add</Btn>
      </Row>
    </div>
  )
}

function WebsiteEditorTab({toast}) {
  const [sec,setSec]=useState('about')
  const [vals,setVals]=useState({})
  const [busy,setBusy]=useState(false)
  const [loaded,setLoaded]=useState(false)
  const [galleryItems,setGalleryItems]=useState([])
  const [reviewItems,setReviewItems]=useState([])
  const [newPhoto,setNewPhoto]=useState({url:'',label:'',cat:'Mehndi',emoji:'🌿'})
  const [uploading,setUploading]=useState(false)
  const photoRef=useRef()

  useEffect(()=>{
    sb.from('site_content').select('*').then(({data})=>{
      if(data){const m={};data.forEach(r=>{m[r.key]=r.value});setVals(m)}
      setLoaded(true)
    })
    sb.from('site_content').select('value').eq('key','gallery_photos').maybeSingle().then(({data})=>{
      try{if(data?.value)setGalleryItems(JSON.parse(data.value))}catch{}
    })
    sb.from('site_content').select('value').eq('key','reviews_rich').maybeSingle().then(({data})=>{
      try{if(data?.value)setReviewItems(JSON.parse(data.value))}catch{}
    })
  },[])

  const get=(k,fb='')=>vals[k]!=null?vals[k]:fb
  const set=(k,v)=>setVals(x=>({...x,[k]:v}))

  const saveKey=async(key,value)=>{
    const {data:ex}=await sb.from('site_content').select('id').eq('key',key).maybeSingle()
    const row={id:ex?.id||uid(),key,value,updated_at:new Date().toISOString()}
    await sb.from('site_content').upsert(row,{onConflict:'id'})
  }

  const saveAll=async(keys)=>{
    setBusy(true)
    for(const k of keys){
      await saveKey(k,vals[k]??'')
    }
    toast('All changes saved to website!')
    setBusy(false)
  }

  const saveGallery=async(items)=>{
    setBusy(true)
    await saveKey('gallery_photos',JSON.stringify(items))
    setGalleryItems(items)
    toast('Gallery updated!')
    setBusy(false)
  }

  const saveReviews=async(items)=>{
    setBusy(true)
    await saveKey('reviews_rich',JSON.stringify(items))
    setReviewItems(items)
    toast('Reviews updated!')
    setBusy(false)
  }

  const handlePhotoUpload=async(e)=>{
    const file=e.target.files[0]; if(!file) return
    setUploading(true)
    const url=await uploadToSupabase(file,'gallery')
    if(url) setNewPhoto(x=>({...x,url}))
    setUploading(false)
  }

  const addGalleryPhoto=async()=>{
    if(!newPhoto.url&&!newPhoto.emoji){alert('Add a photo URL or select a file');return}
    const items=[...galleryItems,{...newPhoto}]
    await saveGallery(items)
    setNewPhoto({url:'',label:'',cat:'Mehndi',emoji:'🌿'})
  }

  const fld={width:'100%',padding:'10px 12px',borderRadius:10,border:`1.5px solid ${C.pinkPale}`,fontSize:13,fontFamily:'inherit',outline:'none',color:C.dark,boxSizing:'border-box',background:C.white,marginBottom:10,resize:'vertical'}

  if(!loaded) return <div style={{textAlign:'center',padding:40,color:C.grey}}>Loading website content…</div>

  const SECS=[{v:'about',l:'📄 About'},{v:'courses',l:'📚 Courses'},{v:'gallery',l:'🖼️ Gallery'},{v:'reviews',l:'⭐ Reviews'},{v:'stats',l:'📊 Stats & CTA'}]
  const CAT_OPTS=[{v:'Mehndi',l:'🌿 Mehndi'},{v:'Makeup',l:'💄 Makeup'},{v:'Ariwork',l:'🎨 Ariwork'},{v:'Other',l:'✨ Other'}]

  return(
    <div>
      <Card accent={C.pink}>
        <STitle><Ic n="globe" size={15} color={C.pink}/> Website Content Editor</STitle>
        <div style={{fontSize:12,color:C.grey,marginBottom:10}}>Edit your public website content. Changes appear live on the website instantly.</div>
        <Row gap={8} style={{flexWrap:'wrap'}}>
          <a href="/" target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}><Btn small color={C.blue}><Ic n="globe" size={13} color={C.white}/>View Website</Btn></a>
          <a href={ENROLL_URL} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}><Btn small outline>View Enroll Form</Btn></a>
        </Row>
      </Card>

      <div style={{display:'flex',gap:6,overflowX:'auto',marginBottom:14,paddingBottom:4}}>
        {SECS.map(s=><div key={s.v} onClick={()=>setSec(s.v)} style={{flexShrink:0,padding:'7px 14px',borderRadius:20,background:sec===s.v?C.pink:C.greyL,color:sec===s.v?C.white:C.grey,fontSize:12,fontWeight:sec===s.v?700:500,cursor:'pointer'}}>{s.l}</div>)}
      </div>

      {/* ── ABOUT ── */}
      {sec==='about'&&<Card>
        <STitle><Ic n="info" size={15} color={C.pink}/> About Section</STitle>
        <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>Hero Tagline</div>
        <textarea rows={2} value={get('hero_tagline',"Learn from Kajol J Kamble — professional artist & passionate teacher.")} onChange={e=>set('hero_tagline',e.target.value)} style={fld}/>
        <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>About Headline</div>
        <input value={get('about_headline','Passionate Artist. Dedicated Teacher.')} onChange={e=>set('about_headline',e.target.value)} style={{...fld,resize:'none'}}/>
        <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>About Paragraph 1</div>
        <textarea rows={4} value={get('about_para1',"Hi! I'm Kajol, a professional Mehndi, Makeup, and Ariwork artist...")} onChange={e=>set('about_para1',e.target.value)} style={fld}/>
        <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>About Paragraph 2</div>
        <textarea rows={3} value={get('about_para2','All my courses are conducted live on Zoom...')} onChange={e=>set('about_para2',e.target.value)} style={fld}/>
        <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>YouTube Playlist ID (for website video section)</div>
        <input value={get('yt_playlist_id','')} onChange={e=>set('yt_playlist_id',e.target.value)} placeholder="e.g. PLxxxxxxxxxxxxxxxxx (from YouTube playlist URL)" style={{...fld,resize:'none'}}/>
        <div style={{fontSize:11,color:C.grey,marginBottom:10,background:C.greenPale,borderRadius:8,padding:'8px 10px'}}>
          📋 <b>How to get Playlist ID:</b> Go to YouTube → Your Channel → Playlists → Click playlist → copy the ID from the URL after "list=" (e.g. PLxxxxxxxxx)
        </div>
        <Btn color={C.green} onClick={()=>saveAll(['hero_tagline','about_headline','about_para1','about_para2','yt_playlist_id'])} disabled={busy} full>{busy?'Saving…':'💾 Save About Section'}</Btn>
      </Card>}

      {/* ── COURSES ── */}
      {sec==='courses'&&<Card>
        <STitle><Ic n="course" size={15} color={C.green}/> Courses Section</STitle>
        <div style={{fontSize:12,color:C.grey,marginBottom:12}}>Separate bullet items with a pipe <b>|</b> character.</div>
        {[{key:'mehndi',emoji:'🌿',label:'Mehndi Art'},{key:'makeup',emoji:'💄',label:'Makeup Course'},{key:'ariwork',emoji:'🎨',label:'Ariwork Course'},{key:'combined',emoji:'✨',label:'Combined Course'}].map(c=>(
          <div key={c.key} style={{marginBottom:18,background:C.greyL,borderRadius:12,padding:12}}>
            <div style={{fontSize:13,fontWeight:800,color:C.dark,marginBottom:8}}>{c.emoji} {c.label}</div>
            <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>Description</div>
            <textarea rows={2} value={get(`course_${c.key}_desc`,'')} onChange={e=>set(`course_${c.key}_desc`,e.target.value)} style={fld}/>
            <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>Bullet Points (separate with |)</div>
            <input value={get(`course_${c.key}_items`,'')} onChange={e=>set(`course_${c.key}_items`,e.target.value)} style={{...fld,resize:'none'}} placeholder="Item 1|Item 2|Item 3"/>
          </div>
        ))}
        <Btn color={C.green} onClick={()=>saveAll(['course_mehndi_desc','course_mehndi_items','course_makeup_desc','course_makeup_items','course_ariwork_desc','course_ariwork_items','course_combined_desc','course_combined_items'])} disabled={busy} full>{busy?'Saving…':'💾 Save All Courses'}</Btn>
      </Card>}

      {/* ── GALLERY ── */}
      {sec==='gallery'&&<div>
        <Card accent={C.pink}>
          <STitle><Ic n="image" size={15} color={C.pink}/> Gallery Photos</STitle>
          <div style={{fontSize:12,color:C.grey,marginBottom:14}}>Upload photos of student work, your designs, and class highlights. These appear in the "Our Work" grid on the website.</div>

          {/* Add new photo */}
          <div style={{background:C.greyL,borderRadius:14,padding:14,marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:700,color:C.dark,marginBottom:10}}>➕ Add New Photo</div>

            {/* File upload */}
            <input ref={photoRef} type="file" accept="image/*" style={{display:'none'}} onChange={handlePhotoUpload}/>
            <Row gap={8} style={{marginBottom:10}}>
              <Btn small onClick={()=>photoRef.current.click()} disabled={uploading} color={C.blue}>
                <Ic n="upload" size={12} color={C.white}/>{uploading?'Uploading…':'📷 Upload Photo'}
              </Btn>
              {newPhoto.url&&<span style={{fontSize:11,color:C.green}}>✅ Photo uploaded</span>}
            </Row>
            <div style={{fontSize:11,color:C.grey,marginBottom:6}}>— OR paste an image URL —</div>
            <input value={newPhoto.url} onChange={e=>setNewPhoto(x=>({...x,url:e.target.value}))} placeholder="https://… image URL" style={{...fld,marginBottom:8,resize:'none'}}/>
            {newPhoto.url&&<img src={newPhoto.url} alt="preview" style={{width:'100%',maxHeight:140,objectFit:'cover',borderRadius:10,marginBottom:8}}/>}
            <Row gap={8}>
              <div style={{flex:2}}>
                <input value={newPhoto.label} onChange={e=>setNewPhoto(x=>({...x,label:e.target.value}))} placeholder="Label (e.g. Bridal Mehndi)" style={{...fld,marginBottom:0,resize:'none'}}/>
              </div>
              <select value={newPhoto.cat} onChange={e=>setNewPhoto(x=>({...x,cat:e.target.value}))} style={{...fld,width:'auto',marginBottom:0,resize:'none',flex:1}}>
                {CAT_OPTS.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </Row>
            <Btn color={C.green} onClick={addGalleryPhoto} disabled={busy||uploading} full style={{marginTop:10}}>{busy?'Adding…':'+ Add to Gallery'}</Btn>
          </div>

          {/* Current gallery */}
          <div style={{fontSize:13,fontWeight:700,color:C.dark,marginBottom:10}}>Current Gallery ({galleryItems.length} photos)</div>
          {galleryItems.length===0&&<div style={{fontSize:12,color:C.grey,textAlign:'center',padding:20,background:C.pinkPale,borderRadius:10}}>
            No photos added yet. Upload your first photo above!<br/><span style={{fontSize:11}}>Empty gallery shows emoji placeholder tiles on the website.</span>
          </div>}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
            {galleryItems.map((p,i)=>(
              <div key={i} style={{position:'relative',borderRadius:12,overflow:'hidden',aspectRatio:'1',background:C.greyL}}>
                {p.url?<img src={p.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:
                  <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32}}>{p.emoji||'🖼️'}</div>}
                <div style={{position:'absolute',bottom:0,left:0,right:0,background:'rgba(0,0,0,0.55)',padding:'4px 7px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:9,color:'#fff',fontWeight:600}}>{p.label||p.cat}</span>
                  <button onClick={async()=>{const items=galleryItems.filter((_,j)=>j!==i);await saveGallery(items)}} style={{background:C.red,border:'none',color:'#fff',borderRadius:5,padding:'2px 6px',fontSize:10,cursor:'pointer',fontFamily:'inherit'}}>×</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:4,marginTop:14,textTransform:'uppercase',letterSpacing:.5}}>Gallery Section Subtitle</div>
          <textarea rows={2} value={get('gallery_subtitle',"A glimpse of the beautiful art our students and Kajol Ma'am create!")} onChange={e=>set('gallery_subtitle',e.target.value)} style={fld}/>
          <Btn color={C.green} onClick={()=>saveAll(['gallery_subtitle'])} disabled={busy} full>{busy?'Saving…':'💾 Save Subtitle'}</Btn>

          <div style={{marginTop:14,background:C.pinkPale,borderRadius:10,padding:12,fontSize:12,color:C.pink}}>
            📋 <b>Storage setup required:</b> In Supabase → Storage → Create bucket named <b>site-media</b> → set to Public → add anon insert/select policy.
          </div>
        </Card>
      </div>}

      {/* ── REVIEWS ── */}
      {sec==='reviews'&&<div>
        <Card accent={C.amber}>
          <STitle><Ic n="star" size={15} color={C.amber}/> Student Feedback & Reviews</STitle>
          <div style={{fontSize:12,color:C.grey,marginBottom:14}}>
            Add text reviews, photos of student work, WhatsApp message screenshots, and YouTube video feedback. All appear in the "What Students Say" section.
          </div>

          {/* Type legend */}
          <Row gap={8} style={{flexWrap:'wrap',marginBottom:16}}>
            {[['💬 Text','text'],['🖼️ Photo','image'],['📱 WA Screenshot','whatsapp'],['▶ Video','video']].map(([l])=>(
              <div key={l} style={{fontSize:11,padding:'4px 10px',borderRadius:10,background:C.greyL,color:C.grey}}>{l}</div>
            ))}
          </Row>

          {/* Existing reviews */}
          <div style={{fontSize:13,fontWeight:700,color:C.dark,marginBottom:10}}>Current Reviews ({reviewItems.length})</div>
          {reviewItems.length===0&&<div style={{fontSize:12,color:C.grey,textAlign:'center',padding:16,background:C.greyL,borderRadius:10,marginBottom:14}}>No reviews added yet. Default reviews show on the website.</div>}
          {reviewItems.map((r,i)=>(
            <div key={i} style={{background:C.greyL,borderRadius:12,padding:12,marginBottom:8,display:'flex',gap:10,alignItems:'flex-start'}}>
              <div style={{width:36,height:36,borderRadius:'50%',background:`linear-gradient(135deg,${r.color||C.pink},${r.color||C.pink}99)`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:14,flexShrink:0}}>
                {r.initial||r.name?.[0]||'S'}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:13}}>{r.name} <Badge color={r.color||C.pink}>{r.type||'text'}</Badge></div>
                <div style={{fontSize:11,color:C.grey}}>{r.role}</div>
                {r.text&&<div style={{fontSize:11,color:C.dark,marginTop:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.text}</div>}
                {r.media_url&&<div style={{fontSize:10,color:C.blue,marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>📎 {r.media_url}</div>}
              </div>
              <button onClick={async()=>{const items=reviewItems.filter((_,j)=>j!==i);await saveReviews(items)}}
                style={{background:C.red,border:'none',color:'#fff',borderRadius:8,padding:'5px 10px',fontSize:12,cursor:'pointer',fontFamily:'inherit',flexShrink:0}}>×</button>
            </div>
          ))}

          {/* Add new review */}
          <div style={{background:C.greenPale,borderRadius:14,padding:14,marginTop:8}}>
            <div style={{fontSize:13,fontWeight:700,color:C.green,marginBottom:10}}>➕ Add New Review / Feedback</div>
            <QuickReviewAdder currentJson={JSON.stringify(reviewItems)} onSave={json=>{saveReviews(JSON.parse(json))}}/>
          </div>

          <div style={{fontSize:11,fontWeight:700,color:C.grey,marginTop:14,marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>Reviews Subtitle</div>
          <input value={get('reviews_subtitle','Real words from real learners who transformed their skills with us.')} onChange={e=>set('reviews_subtitle',e.target.value)} style={{...fld,resize:'none'}}/>
          <Btn color={C.green} onClick={()=>saveAll(['reviews_subtitle'])} disabled={busy} full>{busy?'Saving…':'💾 Save Subtitle'}</Btn>
        </Card>
      </div>}

      {/* ── STATS & CTA ── */}
      {sec==='stats'&&<Card>
        <STitle><Ic n="chart" size={15} color={C.pink}/> Stats Strip & CTA</STitle>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:12}}>
          {[['stat_students','Students Trained','200+'],['stat_courses','Expert Courses','3'],['stat_classes','Classes Delivered','50+']].map(([k,label,def])=>(
            <div key={k}>
              <div style={{fontSize:10,fontWeight:700,color:C.grey,marginBottom:4,textTransform:'uppercase'}}>{label}</div>
              <input value={get(k,def)} onChange={e=>set(k,e.target.value)} style={{...fld,marginBottom:0,resize:'none'}}/>
            </div>
          ))}
        </div>
        <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>CTA Headline</div>
        <input value={get('cta_headline','Ready to Start Your Journey?')} onChange={e=>set('cta_headline',e.target.value)} style={{...fld,resize:'none'}}/>
        <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>CTA Subtext</div>
        <textarea rows={2} value={get('cta_subtext',"Fill our free enrollment form today and get a personal reply from Kajol Ma'am on WhatsApp within 24 hours.")} onChange={e=>set('cta_subtext',e.target.value)} style={fld}/>
        <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>Community Text</div>
        <textarea rows={2} value={get('community_text','Connect with 200+ students on WhatsApp, get daily tips, and stay updated on new batches.')} onChange={e=>set('community_text',e.target.value)} style={fld}/>
        <Btn color={C.green} onClick={()=>saveAll(['stat_students','stat_courses','stat_classes','cta_headline','cta_subtext','community_text'])} disabled={busy} full>{busy?'Saving…':'💾 Save Stats & CTA'}</Btn>
      </Card>}
    </div>
  )
}



/* ═══════════════════════════════════════════════════════════════════
   PORTFOLIO TAB — individual artist orders in Pune
═══════════════════════════════════════════════════════════════════ */
function PortfolioTab({data,setData,toast}) {
  const [modal,setModal]=useState(null)
  const [del,setDel]=useState(null)
  const [form,setForm]=useState({})
  const [busy,setBusy]=useState(false)
  const [filter,setFilter]=useState('all')

  // Portfolio leads stored in orders table with a "portfolio_lead" tag
  const leads = data.orders.filter(o=>o.portfolio_lead===true)
    .sort((a,b)=>new Date(b.created_at||b.date)-new Date(a.created_at||a.date))
  const filtered = filter==='all' ? leads : leads.filter(o=>o.type===filter)

  const save = async () => {
    if(!form.client||!form.mobile) return alert('Client name and mobile required.')
    setBusy(true)
    const row={
      id:form.id||uid(),
      portfolio_lead:true,
      type:form.type||'Mehndi',
      client:form.client,
      mobile:form.mobile,
      email:form.email||'',
      address:form.address||'',
      event_date:form.event_date||'',
      event_type:form.event_type||'',
      amount:Number(form.amount||0),
      paid:Number(form.paid||0),
      status:form.status||'Enquiry',
      notes:form.notes||'',
      date:form.date||today(),
      order_expenses:[],
    }
    await dbUpsert('orders',row)
    setData(d=>({...d,orders:form.id?d.orders.map(o=>o.id===form.id?{...o,...row}:o):[...d.orders,row]}))
    setBusy(false); setModal(null); toast('Lead saved!')
  }

  const statusColor = s => s==='Confirmed'?C.green:s==='Completed'?C.teal:s==='Cancelled'?C.red:s==='Follow-up'?C.amber:C.blue
  const typeColor   = t => t==='Mehndi'?C.green:t==='Makeup'?C.pink:t==='Ariwork'?C.purple:C.amber
  const typeEmoji   = t => t==='Mehndi'?'🌿':t==='Makeup'?'💄':t==='Ariwork'?'🎨':'✨'

  const stats = [
    {label:'Total Leads', val:leads.length, color:C.blue},
    {label:'Confirmed',   val:leads.filter(l=>l.status==='Confirmed').length, color:C.green},
    {label:'Revenue',     val:fmt(leads.reduce((s,l)=>s+Number(l.paid),0)), color:C.pink},
    {label:'Pending Due', val:fmt(leads.reduce((s,l)=>s+Number(l.amount)-Number(l.paid),0)), color:C.amber},
  ]

  return (
    <div>
      {/* Header banner */}
      <div style={{background:`linear-gradient(135deg,${C.purple},${C.pink})`,borderRadius:20,padding:'18px 16px',marginBottom:14,color:'#fff'}}>
        <div style={{fontSize:22,marginBottom:4}}>🎨💄🌿</div>
        <div style={{fontSize:17,fontWeight:900}}>Kajol J Kamble — Artist Portfolio</div>
        <div style={{fontSize:12,opacity:.85,marginTop:2}}>Individual Orders · Bridal · Events · Pune &amp; nearby areas</div>
        <div style={{marginTop:10,fontSize:11,opacity:.8,display:'flex',alignItems:'center',gap:6}}>
          <Ic n="mappin" size={13} color="#fff"/> Serving Pune, Pimpri-Chinchwad, PCMC, Mumbai
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:14}}>
        {stats.map(s=>(
          <div key={s.label} style={{background:C.white,borderRadius:14,padding:13,boxShadow:'0 2px 10px rgba(0,0,0,0.06)',border:`1px solid ${C.pinkPale}`}}>
            <div style={{fontSize:10,color:C.grey,fontWeight:700,textTransform:'uppercase',letterSpacing:.5}}>{s.label}</div>
            <div style={{fontSize:20,fontWeight:800,color:s.color,marginTop:3}}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filter + Add */}
      <Row gap={6} style={{marginBottom:12,flexWrap:'wrap'}}>
        {['all','Mehndi','Makeup','Ariwork','Combined'].map(f=>(
          <div key={f} onClick={()=>setFilter(f)} style={{padding:'5px 12px',borderRadius:16,background:filter===f?C.pink:C.greyL,color:filter===f?C.white:C.grey,fontSize:11,fontWeight:filter===f?700:500,cursor:'pointer'}}>
            {f==='all'?'All':typeEmoji(f)+' '+f}
          </div>
        ))}
        <div style={{marginLeft:'auto'}}>
          <Btn small onClick={()=>{setForm({type:'Mehndi',status:'Enquiry',date:today()});setModal('form')}}>
            <Ic n="add" size={14} color={C.white}/>New Lead
          </Btn>
        </div>
      </Row>
      <div style={{fontSize:12,color:C.grey,marginBottom:8}}>{filtered.length} lead{filtered.length!==1?'s':''}</div>

      {/* Leads list */}
      {filtered.length===0 && (
        <div style={{textAlign:'center',padding:40,background:C.white,borderRadius:16,color:C.grey}}>
          <div style={{fontSize:40,marginBottom:10}}>🌸</div>
          <div style={{fontWeight:700,marginBottom:6}}>No leads yet</div>
          <div style={{fontSize:13}}>Add enquiries for bridal mehndi, makeup or ariwork bookings in Pune</div>
        </div>
      )}

      {filtered.map(lead=>{
        const due = Number(lead.amount)-Number(lead.paid)
        return (
          <Card key={lead.id} accent={typeColor(lead.type)}>
            <Row style={{justifyContent:'space-between',marginBottom:8}}>
              <div>
                <div style={{fontWeight:800,fontSize:15,color:C.dark}}>{lead.client} {typeEmoji(lead.type)}</div>
                <div style={{fontSize:12,color:C.grey}}>📱 {lead.mobile}</div>
                {lead.email&&<div style={{fontSize:11,color:C.grey}}>✉️ {lead.email}</div>}
                {lead.address&&<div style={{fontSize:11,color:C.grey}}>📍 {lead.address}</div>}
              </div>
              <div style={{textAlign:'right'}}>
                <Badge color={statusColor(lead.status)}>{lead.status}</Badge>
                <div style={{marginTop:6}}><Badge color={typeColor(lead.type)}>{lead.type}</Badge></div>
              </div>
            </Row>

            {lead.event_type&&<div style={{fontSize:12,color:C.dark,marginBottom:3}}>🎉 {lead.event_type}{lead.event_date?` — ${fmtDate(lead.event_date)}`:''}</div>}

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:8}}>
              {[['Quote',fmt(lead.amount),C.dark],['Paid',fmt(lead.paid),C.green],['Due',fmt(due),due>0?C.amber:C.green]].map(([l,v,c])=>(
                <div key={l} style={{background:c+'10',borderRadius:8,padding:'6px 8px',textAlign:'center'}}>
                  <div style={{fontSize:9,color:c}}>{l}</div>
                  <div style={{fontSize:13,fontWeight:700,color:c}}>{v}</div>
                </div>
              ))}
            </div>

            {lead.notes&&<div style={{fontSize:12,color:C.grey,background:C.greyL,borderRadius:8,padding:'6px 10px',marginBottom:8}}>{lead.notes}</div>}

            <Row gap={7} style={{flexWrap:'wrap'}}>
              <Btn small outline onClick={()=>{setForm({...lead});setModal('form')}}>✏️ Edit</Btn>
              <a href={`https://wa.me/91${lead.mobile}?text=${encodeURIComponent('Hi '+lead.client+'! 🌸 Thank you for your enquiry for '+lead.type+' services. I am Kajol from Kajol Makeover Studioz, Pune. Let me share my portfolio and discuss your requirements.\n\n📸 Instagram: https://www.instagram.com/kajol_makeover_studioz\n\nLooking forward to making your occasion special! 💄')}`} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>
                <Btn small color={C.wa}><Ic n="wa" size={12} color={C.white}/>WhatsApp</Btn>
              </a>
              {lead.mobile&&<a href={`tel:+91${lead.mobile}`} style={{textDecoration:'none'}}><Btn small color={C.blue}><Ic n="phone2" size={12} color={C.white}/>Call</Btn></a>}
              <select value={lead.status} onChange={async e=>{
                const u={...lead,status:e.target.value}
                await dbUpsert('orders',u)
                setData(d=>({...d,orders:d.orders.map(o=>o.id===lead.id?u:o)}))
                toast('Status updated!')
              }} style={{fontSize:11,borderRadius:8,border:`1.5px solid ${C.pinkPale}`,padding:'5px 8px',fontFamily:'inherit',cursor:'pointer',color:C.dark}}>
                {['Enquiry','Follow-up','Confirmed','Completed','Cancelled'].map(s=><option key={s}>{s}</option>)}
              </select>
              <Btn small color={C.red} onClick={()=>setDel(lead)}>🗑️</Btn>
            </Row>
          </Card>
        )
      })}

      {/* Services info card */}
      <Card>
        <STitle><Ic n="mappin" size={15} color={C.pink}/> My Artist Services — Pune</STitle>
        {[
          {emoji:'🌿',type:'Mehndi',desc:'Bridal, party, Arabic & traditional designs',areas:'Home visits, banquet halls, events'},
          {emoji:'💄',type:'Makeup',desc:'Bridal, HD, airbrush, party & reception looks',areas:'Studio, home visits & event venues'},
          {emoji:'🎨',type:'Ariwork',desc:'Custom canvas, mandala, resin décor',areas:'Studio-based, delivery available'},
        ].map(s=>(
          <div key={s.type} style={{padding:'10px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
            <div style={{fontWeight:700,fontSize:13,color:C.dark}}>{s.emoji} {s.type}</div>
            <div style={{fontSize:12,color:C.grey}}>{s.desc}</div>
            <div style={{fontSize:11,color:C.pink,marginTop:2}}>📍 {s.areas}</div>
          </div>
        ))}
      </Card>

      {/* Add/Edit form modal */}
      {modal==='form'&&(
        <Modal onClose={()=>setModal(null)} title={<><Ic n="portfolio" color={C.purple}/> {form.id?'Edit':'New'} Portfolio Lead</>}>
          <Inp label="Client Name *" value={form.client} onChange={v=>setForm(x=>({...x,client:v}))}/>
          <Inp label="Mobile *" value={form.mobile} onChange={v=>setForm(x=>({...x,mobile:v}))} type="tel"/>
          <Inp label="Email" value={form.email} onChange={v=>setForm(x=>({...x,email:v}))} type="email"/>
          <Inp label="Address / Area in Pune" value={form.address} onChange={v=>setForm(x=>({...x,address:v}))} placeholder="e.g. Baner, Kothrud, Hadapsar"/>
          <Inp label="Service Type" value={form.type||'Mehndi'} onChange={v=>setForm(x=>({...x,type:v}))} opts={['Mehndi','Makeup','Ariwork','Combined']}/>
          <Inp label="Event Type" value={form.event_type} onChange={v=>setForm(x=>({...x,event_type:v}))} placeholder="e.g. Bridal, Engagement, Birthday, Sangeet"/>
          <Inp label="Event Date" value={form.event_date} onChange={v=>setForm(x=>({...x,event_date:v}))} type="date"/>
          <Inp label="Quotation (₹)" value={form.amount} onChange={v=>setForm(x=>({...x,amount:v}))} type="number"/>
          <Inp label="Advance Received (₹)" value={form.paid} onChange={v=>setForm(x=>({...x,paid:v}))} type="number"/>
          <Inp label="Status" value={form.status||'Enquiry'} onChange={v=>setForm(x=>({...x,status:v}))} opts={['Enquiry','Follow-up','Confirmed','Completed','Cancelled']}/>
          <Inp label="Notes" value={form.notes} onChange={v=>setForm(x=>({...x,notes:v}))} rows={3} placeholder="Special requirements, venue details, etc."/>
          <Row gap={8}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn onClick={save} full disabled={busy}>{busy?'Saving…':'Save Lead'}</Btn></Row>
        </Modal>
      )}
      {del&&<DelConfirm item={del.client} onConfirm={async()=>{await dbDelete('orders',del.id);setData(d=>({...d,orders:d.orders.filter(o=>o.id!==del.id)}));toast('Deleted.')}} onClose={()=>setDel(null)}/>}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   CERTIFICATE TAB — generate & dispatch certificates per batch
═══════════════════════════════════════════════════════════════════ */
function CertificateTab({data,toast}) {
  const [selBatch,setSelBatch]=useState(data.batches[0]?.id||'')
  const [selStudent,setSelStudent]=useState('all')
  const [certDate,setCertDate]=useState(today())
  const [directorName]=useState('Kajol J Kamble')
  const SIGNATURE_STYLE={fontFamily:"'Dancing Script',Georgia,'Times New Roman',serif",fontSize:20,fontStyle:'italic',color:C.pink,fontWeight:700}
  const [preview,setPreview]=useState(null)
  const certRef=useRef()

  const batch   = data.batches.find(b=>b.id===selBatch)
  const course  = batch ? data.courses.find(c=>c.id===batch.course_id) : null
  const students= batch ? data.students.filter(s=>(batch.student_ids||[]).includes(s.id)) : []
  const targetStudents = selStudent==='all' ? students : students.filter(s=>s.id===selStudent)

  // Generate certificate SVG for a student
  const CertSVG = ({student}) => {
    const courseEmoji = course?.type==='Mehndi'?'🌿':course?.type==='Makeup'?'💄':'🎨'
    return (
      <div id={'cert_'+student.id} ref={certRef} style={{
        width:'100%',maxWidth:700,margin:'0 auto',
        background:'linear-gradient(135deg,#fff9fc 0%,#fff 50%,#f0fdf4 100%)',
        border:'8px solid transparent',
        backgroundClip:'padding-box',
        position:'relative',
        borderRadius:8,
        fontFamily:"'Georgia',serif",
        aspectRatio:'1.41', // A4 landscape ratio
        display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
        padding:'5%',
        boxShadow:'0 8px 40px rgba(233,30,140,0.15)',
        overflow:'hidden',
      }}>
        {/* Decorative borders */}
        <div style={{position:'absolute',inset:12,border:`3px solid ${C.pink}`,borderRadius:4,pointerEvents:'none'}}/>
        <div style={{position:'absolute',inset:18,border:`1px solid ${C.green}`,borderRadius:4,pointerEvents:'none',opacity:.5}}/>

        {/* Corner decorations */}
        {[{top:8,left:8},{top:8,right:8},{bottom:8,left:8},{bottom:8,right:8}].map((pos,i)=>(
          <div key={i} style={{position:'absolute',...pos,width:32,height:32,fontSize:22,lineHeight:1}}>
            {courseEmoji}
          </div>
        ))}

        {/* Logo area */}
        <div style={{textAlign:'center',marginBottom:10}}>
          <div style={{fontSize:28}}>💄🌿🎨</div>
          <div style={{fontSize:16,fontWeight:900,color:C.pink,letterSpacing:1,marginTop:4}}>KAJOL MAKEOVER STUDIOZ</div>
          <div style={{fontSize:9,color:C.grey,letterSpacing:3,textTransform:'uppercase',marginTop:2}}>Pune · Maharashtra</div>
        </div>

        {/* Certificate title */}
        <div style={{fontSize:11,color:C.grey,letterSpacing:4,textTransform:'uppercase',marginBottom:8}}>Certificate of Completion</div>
        <div style={{width:120,height:2,background:`linear-gradient(90deg,transparent,${C.pink},transparent)`,marginBottom:16}}/>

        {/* Main content */}
        <div style={{fontSize:11,color:C.grey,textAlign:'center',marginBottom:6}}>This is to certify that</div>
        <div style={{fontSize:22,fontWeight:900,color:C.dark,textAlign:'center',marginBottom:6,letterSpacing:.5}}>
          {student.name}
        </div>
        <div style={{fontSize:11,color:C.grey,textAlign:'center',marginBottom:10}}>has successfully completed the</div>
        <div style={{fontSize:16,fontWeight:800,color:C.pink,textAlign:'center',marginBottom:4}}>
          {courseEmoji} {course?.name || batch?.name} {courseEmoji}
        </div>
        <div style={{fontSize:10,color:C.grey,textAlign:'center',marginBottom:16}}>
          conducted at Kajol Makeover Studioz, Pune
        </div>

        {/* Divider */}
        <div style={{width:'60%',height:1,background:`linear-gradient(90deg,transparent,${C.pinkPale},transparent)`,marginBottom:16}}/>

        {/* Date + Signature row */}
        <div style={{display:'flex',justifyContent:'space-between',width:'80%',alignItems:'flex-end'}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:11,fontWeight:700,color:C.dark}}>{fmtDate(certDate)}</div>
            <div style={{width:100,height:1,background:C.grey,margin:'4px auto'}}/>
            <div style={{fontSize:9,color:C.grey,letterSpacing:1}}>DATE</div>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{fontFamily:"'Dancing Script',Georgia,serif",fontSize:19,color:C.pink,fontWeight:700,letterSpacing:.5,marginBottom:4}}>{directorName}</div>
            <div style={{width:130,height:1,background:C.grey,margin:'4px auto'}}/>
            <div style={{fontSize:9,color:C.grey,letterSpacing:1}}>DIRECTOR & INSTRUCTOR</div>
          </div>
        </div>

        {/* Batch info */}
        <div style={{position:'absolute',bottom:28,left:'50%',transform:'translateX(-50%)',fontSize:8,color:C.grey,letterSpacing:.5,textAlign:'center',whiteSpace:'nowrap'}}>
          Batch: {batch?.name} | {batch?.timing} | kajol-makeover-studioz.vercel.app
        </div>
      </div>
    )
  }

  const printCert = (student) => {
    const el = document.createElement('div')
    el.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:10000;display:flex;align-items:center;justify-content:center;'
    const inner = document.createElement('div')
    inner.style.width = '80vw'
    el.appendChild(inner)
    document.body.appendChild(el)

    // We'll use window.print() with the preview visible
    setPreview(student)
    setTimeout(()=>{
      window.print()
      document.body.removeChild(el)
    },300)
  }

  const sendWhatsApp = (student) => {
    const msg = `🎓 *Certificate of Completion*

Dear ${student.name},

Congratulations! 🌸 You have successfully completed the *${course?.name||batch?.name}* course at Kajol Makeover Studioz, Pune.

Your certificate has been prepared and will be dispatched to you shortly.

Keep creating beautiful art! 💄🌿🎨

— Kajol Ma'am
Kajol Makeover Studioz, Pune`
    window.open(`https://wa.me/91${student.mobile}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const sendEmail = (student) => {
    const subject = `Certificate of Completion — ${course?.name||batch?.name} | Kajol Makeover Studioz`
    const body = `Dear ${student.name},

Congratulations on successfully completing the ${course?.name||batch?.name} course at Kajol Makeover Studioz, Pune!

Your certificate has been prepared. Please find it attached or collect it from our studio.

Thank you for being a wonderful student!

Best regards,
Kajol J Kamble
Kajol Makeover Studioz, Pune
https://kajol-makeover-studioz.vercel.app`
    if(student.email) {
      window.open(`mailto:${student.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
    } else {
      alert(`No email address saved for ${student.name}. Please update their profile in the Students tab.`)
    }
  }

  return (
    <div>
      <Card accent={C.purple}>
        <STitle><Ic n="certificate" size={15} color={C.purple}/> Certificate Generator</STitle>
        <div style={{fontSize:12,color:C.grey,marginBottom:12}}>Generate, preview and send certificates to students. Print or dispatch by WhatsApp, email, or post.</div>

        <Inp label="Select Batch" value={selBatch} onChange={setSelBatch} opts={data.batches.map(b=>({v:b.id,l:b.name}))}/>
        <Inp label="Student" value={selStudent} onChange={setSelStudent} opts={[{v:'all',l:'All Students in Batch'},...students.map(s=>({v:s.id,l:s.name}))]}/>
        <Inp label="Certificate Date" value={certDate} onChange={setCertDate} type="date"/>

        {batch&&course&&(
          <div style={{background:C.pinkPale,borderRadius:10,padding:'10px 12px',marginBottom:12,fontSize:12}}>
            📚 Batch: <b>{batch.name}</b> · Course: <b>{course.name}</b> · {students.length} students enrolled
          </div>
        )}
      </Card>

      {/* Batch dispatch actions */}
      {targetStudents.length>0&&(
        <Card accent={C.green}>
          <STitle><Ic n="mailsend" size={15} color={C.green}/> Batch Dispatch ({targetStudents.length} students)</STitle>
          <div style={{fontSize:12,color:C.grey,marginBottom:12}}>Send congratulation messages to all selected students at once.</div>
          <Row gap={8} style={{flexWrap:'wrap'}}>
            <Btn small color={C.wa} onClick={()=>{targetStudents.forEach((s,i)=>{setTimeout(()=>sendWhatsApp(s),i*800)});toast(`WhatsApp opened for ${targetStudents.length} students!`);}}>
              <Ic n="wa" size={12} color={C.white}/> Send All on WhatsApp
            </Btn>
            <Btn small color={C.blue} onClick={()=>{targetStudents.forEach(s=>sendEmail(s));toast('Email compose opened!');}}>
              <Ic n="mailsend" size={12} color={C.white}/> Email All
            </Btn>
          </Row>
          <div style={{marginTop:10,background:C.greenPale,borderRadius:8,padding:'8px 12px',fontSize:11,color:C.green}}>
            📬 <b>Post/Courier:</b> Print each certificate (Print button below), write the student's address on envelope, and send via India Post or courier. You can find each student's address in the Students tab.
          </div>
        </Card>
      )}

      {/* Individual student certificates */}
      {!batch&&<div style={{textAlign:'center',color:C.grey,padding:32,background:C.white,borderRadius:16}}>
        <div style={{fontSize:36,marginBottom:8}}>🎓</div>
        <div style={{fontWeight:700}}>Select a batch to generate certificates</div>
      </div>}

      {targetStudents.map(student=>(
        <Card key={student.id} accent={C.purple}>
          <Row style={{justifyContent:'space-between',marginBottom:12}}>
            <div>
              <div style={{fontWeight:700,fontSize:15,color:C.dark}}>{student.name}</div>
              <div style={{fontSize:12,color:C.grey}}>📱 {student.mobile}{student.email&&` · ✉️ ${student.email}`}</div>
              {student.address&&<div style={{fontSize:11,color:C.grey}}>📍 {student.address}</div>}
            </div>
            <div style={{fontSize:32}}>🎓</div>
          </Row>

          {/* Certificate preview */}
          <div style={{marginBottom:12,transform:'scale(0.85)',transformOrigin:'top left',width:'117%'}}>
            <CertSVG student={student}/>
          </div>

          {/* Actions */}
          <Row gap={7} style={{flexWrap:'wrap',marginTop:8}}>
            <Btn small color={C.purple} onClick={()=>{
              // Open print dialog — user can Save as PDF from browser print dialog
              const printWin=window.open('','_blank','width=800,height=600')
              if(!printWin) return
              const certEl=document.getElementById('cert_'+student.id)
              if(certEl){
                printWin.document.write('<html><head><title>Certificate — '+student.name+'</title><style>@import url(https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap);body{margin:0;padding:20px;font-family:Georgia,serif;background:#fff;}@media print{body{padding:0;}}</style></head><body>'+certEl.innerHTML+'</body></html>')
                printWin.document.close()
                printWin.focus()
                setTimeout(()=>{printWin.print();},500)
              }else{window.print()}
            }}>
              📄 Save as PDF / Print
            </Btn>
            <Btn small color={C.wa} onClick={()=>sendWhatsApp(student)}>
              <Ic n="wa" size={12} color={C.white}/> WhatsApp
            </Btn>
            <Btn small color={C.blue} onClick={()=>sendEmail(student)}>
              <Ic n="mailsend" size={12} color={C.white}/> Email
            </Btn>
            <div style={{fontSize:11,color:C.grey,alignSelf:'center',padding:'0 4px'}}>
              {student.address?`📬 ${student.address}`:'⚠️ No address — add in Students tab for postal dispatch'}
            </div>
          </Row>
        </Card>
      ))}

      {/* Print styles */}
      <style>{`@media print{body>*:not(.print-area){display:none!important;}.print-area{display:block!important;}}`}</style>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   NAVIGATION CONFIG
═══════════════════════════════════════════════════════════════════ */
const TABS=[
  {id:'home',     label:'Home',      icon:'home'},
  {id:'enroll',   label:'Requests',  icon:'enroll'},
  {id:'students', label:'Students',  icon:'students'},
  {id:'courses',  label:'Courses',   icon:'course'},
  {id:'batches',  label:'Batches',   icon:'batch'},
  {id:'payments', label:'Payments',  icon:'pay'},
  {id:'orders',   label:'Orders',    icon:'order'},
  {id:'finance',  label:'Finance',   icon:'chart'},
  {id:'reports',  label:'Reports',   icon:'report'},
  {id:'broadcast',label:'Broadcast', icon:'broadcast'},
  {id:'leads',    label:'Leads',     icon:'portfolio'},
  {id:'certificate',label:'Certs',  icon:'certificate'},
  {id:'website',  label:'Website',   icon:'globe'},
  {id:'settings', label:'Settings',  icon:'settings'},
]
const TITLES={home:'Dashboard',enroll:'Enrollment Requests',students:'Students',courses:'Courses & Syllabus',batches:'Batches & Classes',payments:'Payments',orders:'Individual Orders',finance:'Finance & Expenses',reports:'Reports',broadcast:'Broadcast Messaging',leads:'Individual Orders & Leads',certificate:'Certificates',website:'Website Editor',settings:'Settings & Admin'}
const BOTTOM_NAV=['home','enroll','students','batches','payments','broadcast']

/* ═══════════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════════ */
function AdminApp() {
  const [loggedIn,setLoggedIn] = useState(false)
  const [tab,setTab]           = useState('home')
  const [data,setData]         = useState({students:[],courses:[],batches:[],classes:[],homeworkCompliance:[],payments:[],orders:[],expenses:[],enrollmentRequests:[]})
  const [loading,setLoading]   = useState(false)
  const [toastMsg,setToastMsg] = useState('')

  const toast = useCallback(msg=>{ setToastMsg(msg); setTimeout(()=>setToastMsg(''),3000) },[])

  const login = async () => {
    setLoggedIn(true); setLoading(true)
    try { const d=await loadAll(); setData(d) } catch(e){ console.error(e); toast('⚠️ Could not load data. Check Supabase.') }
    setLoading(false)
  }

  // Poll for new enrollment requests every 60s
  useEffect(()=>{
    if(!loggedIn) return
    const iv=setInterval(async()=>{
      try {
        const {data:rows}=await sb.from('enrollment_requests').select('*').eq('status','pending')
        if(rows) setData(d=>{
          const newOnes=rows.filter(r=>!(d.enrollmentRequests||[]).find(x=>x.id===r.id))
          if(newOnes.length) toast(`📋 ${newOnes.length} new enrollment request!`)
          return {...d,enrollmentRequests:[...(d.enrollmentRequests||[]).filter(r=>r.status!=='pending'),...rows]}
        })
      }catch{}
    },60000)
    return ()=>clearInterval(iv)
  },[loggedIn])

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Nunito','Segoe UI',sans-serif;background:#FFF8FB;}
    input:focus,select:focus,textarea:focus{border-color:#E91E8C!important;outline:none;}
    a{-webkit-tap-highlight-color:transparent;}
    button{-webkit-tap-highlight-color:transparent;}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-thumb{background:#FCE4EC;border-radius:4px}
    /* Desktop: sidebar visible, bottom nav hidden */
    @media(min-width:768px){
      .sidebar-nav{display:flex!important;}
      .bottom-nav-bar{display:none!important;}
      .main-area{margin-left:220px;}
      .main-content-pad{padding:24px 32px 40px!important;}
      .content-inner{max-width:860px;margin:0 auto;}
    }
    @media(max-width:767px){
      .sidebar-nav{display:none!important;}
      .main-area{margin-left:0;}
    }
  `

  if(!loggedIn) return <div><style>{CSS}</style><Login onLogin={login}/></div>

  const pendingReq=(data.enrollmentRequests||[]).filter(r=>r.status==='pending').length

  return (
    <div><style>{CSS}</style>
      <div style={{display:'flex',minHeight:'100vh',background:'#FFF8FB'}}>

        {/* SIDEBAR (desktop) */}
        <aside className="sidebar-nav" style={{width:220,flexShrink:0,background:C.white,borderRight:`1px solid ${C.pinkPale}`,position:'fixed',top:0,left:0,bottom:0,zIndex:200,boxShadow:'2px 0 20px rgba(233,30,140,0.08)',flexDirection:'column',overflowY:'auto'}}>
          <div style={{background:`linear-gradient(135deg,${C.pink},${C.pinkD})`,padding:'20px 16px'}}>
            <div style={{fontSize:28,marginBottom:8}}>💄</div>
            <div style={{fontSize:13,fontWeight:900,color:'#fff',lineHeight:1.3}}>Kajol Makeover Studioz</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.8)',marginTop:3}}>Admin v3.1</div>
          </div>
          <nav style={{flex:1,padding:'8px 0'}}>
            {TABS.map(t=>(
              <div key={t.id} onClick={()=>setTab(t.id)} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 16px',cursor:'pointer',transition:'all .15s',background:tab===t.id?C.pinkPale:'transparent',borderLeft:tab===t.id?`3px solid ${C.pink}`:'3px solid transparent',color:tab===t.id?C.pink:C.grey,fontWeight:tab===t.id?700:500,fontSize:13,position:'relative'}}>
                <Ic n={t.icon} size={17} color={tab===t.id?C.pink:C.grey}/>{t.label}
                {t.id==='enroll'&&pendingReq>0&&<span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:C.red,color:'#fff',borderRadius:'50%',width:18,height:18,fontSize:10,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center'}}>{pendingReq}</span>}
              </div>
            ))}
          </nav>
          <div style={{padding:'12px 16px',borderTop:`1px solid ${C.pinkPale}`}}>
            <button onClick={()=>setLoggedIn(false)} style={{width:'100%',padding:'9px',borderRadius:10,background:C.pinkPale,border:'none',color:C.pink,fontWeight:700,cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:8,justifyContent:'center',fontFamily:'inherit'}}><Ic n="lock" size={14} color={C.pink}/>Logout</button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="main-area" style={{flex:1,display:'flex',flexDirection:'column',minHeight:'100vh'}}>
          <header style={{background:`linear-gradient(135deg,${C.pink},${C.pinkD})`,color:'#fff',padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100,boxShadow:'0 4px 20px rgba(233,30,140,0.4)'}}>
            <div><div style={{fontSize:16,fontWeight:800,letterSpacing:.3}}>💄 {TITLES[tab]||tab}</div><div style={{fontSize:10,opacity:.85}}>Kajol Makeover Studioz</div></div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              {pendingReq>0&&<div onClick={()=>setTab('enroll')} style={{background:'rgba(255,255,255,0.25)',borderRadius:20,padding:'4px 10px',fontSize:11,fontWeight:700,cursor:'pointer'}}>📋 {pendingReq} New</div>}
              <div style={{width:34,height:34,borderRadius:'50%',background:'rgba(255,255,255,0.2)',border:'2px solid rgba(255,255,255,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:15}}>K</div>
            </div>
          </header>

          <main className="main-content-pad" style={{padding:'14px 14px 90px',flex:1}}>
            <div className="content-inner">
              {loading?<Spinner/>:<>
                {tab==='home'     &&<Dashboard     data={data} setTab={setTab}/>}
                {tab==='enroll'   &&<EnrollmentTab data={data} setData={setData} toast={toast}/>}
                {tab==='students' &&<StudentsTab   data={data} setData={setData} toast={toast}/>}
                {tab==='courses'  &&<CoursesTab    data={data} setData={setData} toast={toast}/>}
                {tab==='batches'  &&<BatchesTab    data={data} setData={setData} toast={toast}/>}
                {tab==='payments' &&<PaymentsTab   data={data} setData={setData} toast={toast}/>}
                {tab==='orders'   &&<OrdersTab     data={data} setData={setData} toast={toast}/>}
                {tab==='finance'  &&<FinanceTab    data={data} setData={setData} toast={toast}/>}
                {tab==='reports'  &&<ReportsTab    data={data}/>}
                {tab==='broadcast'&&<BroadcastTab  data={data} toast={toast}/>}
                {tab==='leads'    &&<PortfolioTab    data={data} setData={setData} toast={toast}/>}
                {tab==='certificate'&&<CertificateTab  data={data} toast={toast}/>}
                {tab==='website'  &&<WebsiteEditorTab toast={toast}/>}
                {tab==='settings' &&<SettingsTab   data={data} setData={setData} onLogout={()=>setLoggedIn(false)} toast={toast}/>}
              </>}
            </div>
          </main>
        </div>

        {/* MOBILE BOTTOM NAV */}
        <nav className="bottom-nav-bar" style={{background:C.white,display:'flex',borderTop:`1px solid ${C.pinkPale}`,position:'fixed',bottom:0,left:0,right:0,zIndex:100,boxShadow:'0 -4px 20px rgba(233,30,140,0.1)'}}>
          {BOTTOM_NAV.map(id=>{const t=TABS.find(x=>x.id===id);if(!t)return null;return(
            <div key={id} onClick={()=>setTab(id)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'7px 2px 6px',cursor:'pointer',color:tab===id?C.pink:C.grey,background:tab===id?C.pinkPale:'transparent',borderTop:tab===id?`2px solid ${C.pink}`:'2px solid transparent',fontSize:'8px',fontWeight:tab===id?800:400,gap:2,minWidth:0,position:'relative'}}>
              <Ic n={t.icon} size={17} color={tab===id?C.pink:C.grey}/>{t.label}
              {id==='enroll'&&pendingReq>0&&<span style={{position:'absolute',top:2,right:'8%',background:C.red,color:'#fff',borderRadius:'50%',width:14,height:14,fontSize:8,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center'}}>{pendingReq}</span>}
            </div>
          )})}
          {/* More → Settings/Finance/Reports/Courses/Orders */}
          <div onClick={()=>setTab(['courses','finance','reports','orders','settings'].includes(tab)?'home':'settings')} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'7px 2px 6px',cursor:'pointer',color:['courses','finance','reports','orders','settings'].includes(tab)?C.pink:C.grey,borderTop:['courses','finance','reports','orders','settings'].includes(tab)?`2px solid ${C.pink}`:'2px solid transparent',fontSize:'8px',fontWeight:400,gap:2,minWidth:0}}>
            <Ic n="settings" size={17} color={['courses','finance','reports','orders','settings'].includes(tab)?C.pink:C.grey}/>More
          </div>
        </nav>
      </div>
      <Toast msg={toastMsg}/>
    </div>
  )
}

export default function AppDashboard() {
  const isEnroll = window.location.pathname.startsWith('/enroll')
  if(isEnroll) return (
    <div>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <EnrollForm/>
    </div>
  )
  return <AdminApp/>
}
