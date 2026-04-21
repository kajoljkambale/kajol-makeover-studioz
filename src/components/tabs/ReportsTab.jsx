import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { C, uid, today, fmt, fmtDate, monthKey, monthLabel, ADMIN_PWD,
         COURSE_TYPES, ORDER_TYPES, SCHEDULE_OPTS, DURATION_OPTS, EXP_CATS,
         Ic, Modal, Inp, Btn, Badge, Card, Row, Divider, SectionTitle, StatBox,
         Toggle, Spinner, DelConfirm } from '../lib/ui.jsx'
import { supabase as sb, dbUpsert, dbDelete } from '../lib/supabase.js'

const ENROLL_URL   = (typeof window !== 'undefined' ? window.location.origin : 'https://kajol-makeover-studioz.vercel.app') + '/enroll'
const WA_COMMUNITY = 'https://chat.whatsapp.com/Lhq5qzRYJ0z11onVX669a3'
const INSTAGRAM    = 'https://www.instagram.com/kajol_makeover_studioz?igsh=a3h2ZWIzbmM3M3Y3'
const YOUTUBE      = 'https://youtube.com/@kajolmakeoverstudioz?si=IsWwx4ScqJ33ZAqp'
export default function ReportsTab({data}) {
  const [view,setView]=useState('summary')

  const totalIncome = data.payments.reduce((s,p)=>s+Number(p.paid),0)+data.orders.reduce((s,o)=>s+Number(o.paid),0)
  const totalExp    = data.expenses.reduce((s,e)=>s+Number(e.amount),0)+data.orders.reduce((s,o)=>s+(o.order_expenses||[]).reduce((a,x)=>a+Number(x.amt),0),0)
  const totalDues   = data.payments.reduce((s,p)=>s+(Number(p.amount)-Number(p.paid)),0)

  const topStudents = useMemo(()=>{
    const m={}
    data.payments.forEach(p=>{
      const s=data.students.find(x=>x.id===p.student_id)
      if(s) m[s.id]={name:s.name,mobile:s.mobile,paid:(m[s.id]?.paid||0)+Number(p.paid)}
    })
    return Object.values(m).sort((a,b)=>b.paid-a.paid).slice(0,5)
  },[data])

  const batchStats = useMemo(()=>data.batches.map(b=>{
    const course=data.courses.find(c=>c.id===b.course_id)
    const students=(b.student_ids||[]).length
    const classes=data.classes.filter(c=>c.batch_id===b.id).length
    const income=data.payments.filter(p=>p.batch_id===b.id).reduce((s,p)=>s+Number(p.paid),0)
    const dues=data.payments.filter(p=>p.batch_id===b.id).reduce((s,p)=>s+(Number(p.amount)-Number(p.paid)),0)
    const ytDone=data.classes.filter(c=>c.batch_id===b.id&&c.youtube_status==='Uploaded').length
    const attendance=data.classes.filter(c=>c.batch_id===b.id).reduce((s,c)=>s+(c.attendees||[]).length,0)
    const avgAtt=classes>0&&students>0?Math.round(attendance/(classes*students)*100):0
    return {name:b.name,course:course?.name||'—',status:b.status,students,classes,income,dues,ytDone,avgAtt}
  }),[data])

  return (
    <div>
      <div style={{display:'flex',gap:6,marginBottom:14,overflowX:'auto',paddingBottom:2}}>
        {[['summary','📊 Summary'],['batches','🎓 Batches'],['students','👥 Students']].map(([v,l])=>(
          <div key={v} onClick={()=>setView(v)} style={{flexShrink:0,padding:'8px 14px',borderRadius:12,background:view===v?C.pink:C.greyL,color:view===v?C.white:C.grey,fontSize:12,fontWeight:view===v?700:500,cursor:'pointer'}}>{l}</div>
        ))}
      </div>

      {view==='summary'&&<>
        <div style={{background:`linear-gradient(135deg,${C.pink},${C.green})`,borderRadius:18,padding:18,marginBottom:14,color:'#fff'}}>
          <div style={{fontSize:13,opacity:.85}}>Studio at a Glance</div>
          <div style={{fontSize:20,fontWeight:900,marginTop:2}}>Kajol Makeover Studioz 💄</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginTop:12}}>
            {[['Students',data.students.length],['Batches',data.batches.length],['Orders',data.orders.length]].map(([l,v])=>(
              <div key={l} style={{background:'rgba(255,255,255,0.15)',borderRadius:10,padding:'8px 10px',textAlign:'center'}}>
                <div style={{fontSize:20,fontWeight:900}}>{v}</div>
                <div style={{fontSize:10,opacity:.85}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:14}}>
          <StatBox label="Total Income" value={fmt(totalIncome)} color={C.green} icon="rupee"/>
          <StatBox label="Total Expenses" value={fmt(totalExp)} color={C.amber} icon="expenses"/>
          <StatBox label="Net Profit" value={fmt(totalIncome-totalExp)} color={totalIncome-totalExp>=0?C.green:C.red} icon="trend"/>
          <StatBox label="Pending Dues" value={fmt(totalDues)} color={C.amber} icon="alert"/>
        </div>

        <Card accent={C.purple}>
          <STitle><Ic n="batch" size={15} color={C.purple}/> Batch Overview</STitle>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
            {[['Active',data.batches.filter(b=>b.status==='Active').length,C.green],['Completed',data.batches.filter(b=>b.status==='Completed').length,C.grey],['Total',data.batches.length,C.purple]].map(([l,v,c])=>(
              <div key={l} style={{background:c+'12',borderRadius:10,padding:'8px 10px',textAlign:'center'}}>
                <div style={{fontSize:20,fontWeight:800,color:c}}>{v}</div>
                <div style={{fontSize:10,color:c,fontWeight:700}}>{l}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card accent={C.blue}>
          <STitle><Ic n="report" size={15} color={C.blue}/> Classes & YouTube</STitle>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <div style={{background:C.blue+'12',borderRadius:10,padding:'10px 12px',textAlign:'center'}}>
              <div style={{fontSize:20,fontWeight:800,color:C.blue}}>{data.classes.length}</div>
              <div style={{fontSize:10,color:C.blue,fontWeight:700}}>Total Classes</div>
            </div>
            <div style={{background:C.yt+'12',borderRadius:10,padding:'10px 12px',textAlign:'center'}}>
              <div style={{fontSize:20,fontWeight:800,color:C.yt}}>{data.classes.filter(c=>c.youtube_status==='Uploaded').length}</div>
              <div style={{fontSize:10,color:C.yt,fontWeight:700}}>YT Uploaded</div>
            </div>
          </div>
          {data.classes.filter(c=>c.youtube_status!=='Uploaded').length>0&&(
            <div style={{marginTop:8,fontSize:12,color:C.amber}}>⚠️ {data.classes.filter(c=>c.youtube_status!=='Uploaded').length} classes pending YouTube upload</div>
          )}
        </Card>
      </>}

      {view==='batches'&&<>
        {batchStats.length===0&&<div style={{textAlign:'center',color:C.grey,padding:32,background:C.white,borderRadius:16}}>No batches yet.</div>}
        {batchStats.map((b,i)=>(
          <Card key={i} accent={b.status==='Active'?C.green:C.grey}>
            <Row style={{justifyContent:'space-between',marginBottom:8}}>
              <div>
                <div style={{fontWeight:700,fontSize:14,color:C.dark}}>{b.name}</div>
                <div style={{fontSize:12,color:C.grey}}>{b.course} · <Badge color={b.status==='Active'?C.green:C.grey}>{b.status}</Badge></div>
              </div>
            </Row>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
              {[['Students',b.students,C.blue],['Classes',b.classes,C.purple],['Avg Att.',b.avgAtt+'%',C.teal],['Income',fmt(b.income),C.green],['Dues',fmt(b.dues),C.amber],['YT Done',b.ytDone,C.yt]].map(([l,v,c])=>(
                <div key={l} style={{background:c+'10',borderRadius:8,padding:'5px 8px',textAlign:'center'}}>
                  <div style={{fontSize:9,color:c,fontWeight:700,textTransform:'uppercase'}}>{l}</div>
                  <div style={{fontSize:12,fontWeight:700,color:c}}>{v}</div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </>}

      {view==='students'&&<>
        <Card accent={C.pink}>
          <STitle><Ic n="star" size={15} color={C.pink}/> Top Students by Payment</STitle>
          {topStudents.length===0&&<div style={{fontSize:13,color:C.grey,textAlign:'center',padding:12}}>No payment data yet.</div>}
          {topStudents.map((s,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:`linear-gradient(135deg,${C.pink},${C.green})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:12,flexShrink:0}}>{i+1}</div>
                <div>
                  <div style={{fontWeight:700,fontSize:13}}>{s.name}</div>
                  <div style={{fontSize:11,color:C.grey}}>{s.mobile}</div>
                </div>
              </div>
              <div style={{fontSize:13,fontWeight:700,color:C.green}}>{fmt(s.paid)}</div>
            </div>
          ))}
        </Card>

        <Card accent={C.amber}>
          <STitle><Ic n="alert" size={15} color={C.amber}/> Pending Dues by Student</STitle>
          {data.payments.filter(p=>Number(p.amount)>Number(p.paid)).length===0&&<div style={{fontSize:13,color:C.green,textAlign:'center',padding:12}}>✅ All dues cleared!</div>}
          {data.payments.filter(p=>Number(p.amount)>Number(p.paid)).map(p=>{
            const s=data.students.find(x=>x.id===p.student_id)
            const b=data.batches.find(x=>x.id===p.batch_id)
            const due=Number(p.amount)-Number(p.paid)
            return (
              <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
                <div>
                  <div style={{fontWeight:600,fontSize:13}}>{s?.name||'Unknown'}</div>
                  <div style={{fontSize:11,color:C.grey}}>{b?.name||''}</div>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:C.amber}}>{fmt(due)}</div>
              </div>
            )
          })}
        </Card>
      </>}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   WEBSITE EDITOR TAB  — Edit site_content key/values for website
═══════════════════════════════════════════════════════════════════ */
