import React, { useMemo } from 'react'
import { C, fmt, fmtDate, Ic, Card, Row, SectionTitle, StatBox, Badge, Btn, Divider } from '../lib/ui.jsx'

export default function Dashboard({ data, setTab }) {
  const totalIncome = useMemo(() =>
    data.payments.reduce((s,p)=>s+Number(p.paid),0) +
    data.orders.reduce((s,o)=>s+Number(o.paid),0), [data])

  const totalExp = useMemo(() =>
    data.expenses.reduce((s,e)=>s+Number(e.amount),0) +
    data.orders.reduce((s,o)=>s+(o.order_expenses||[]).reduce((a,x)=>a+Number(x.amt),0),0), [data])

  const activeBatches  = data.batches.filter(b=>b.status==='Active')
  const pendingYT      = data.classes.filter(c=>c.youtube_status!=='Uploaded').length
  const pendingDues    = data.payments.reduce((s,p)=>s+(Number(p.amount)-Number(p.paid)),0)
  const pendingOrders  = data.orders.filter(o=>o.status==='Pending').length
  const todayStr       = new Date().toISOString().split('T')[0]
  const todayClasses   = data.classes.filter(c=>c.date===todayStr)

  // Partial-paid students
  const partialStudents = useMemo(()=> {
    const map = {}
    data.payments.forEach(p=>{
      const due = Number(p.amount)-Number(p.paid)
      if(due>0){
        const s = data.students.find(x=>x.id===p.student_id)
        if(s) map[s.id] = { name:s.name, mobile:s.mobile, due, batchName: data.batches.find(b=>b.id===p.batch_id)?.name||'' }
      }
    })
    return Object.values(map)
  },[data])

  // Pending activities list
  const pending = []
  if(pendingYT>0)       pending.push({ icon:'youtube',  color:'#FF0000', text:`${pendingYT} class recordings pending upload to YouTube`, tab:'batches' })
  if(pendingOrders>0)   pending.push({ icon:'orders',   color:C.teal,    text:`${pendingOrders} individual orders still Pending`,           tab:'orders' })
  if(partialStudents.length>0) pending.push({ icon:'payments', color:C.amber, text:`${partialStudents.length} students have pending dues (${fmt(pendingDues)})`, tab:'payments' })
  const missingWA = data.batches.filter(b=>b.status==='Active'&&!b.wa_group)
  if(missingWA.length)  pending.push({ icon:'whatsapp', color:'#25D366', text:`${missingWA.length} active batch(es) missing WhatsApp group link`, tab:'batches' })
  const missingSyllabus = data.courses.filter(c=>!c.syllabus||c.syllabus.trim()==='')
  if(missingSyllabus.length) pending.push({ icon:'course', color:C.purple, text:`${missingSyllabus.length} course(s) have no syllabus added`, tab:'courses' })

  return (
    <div>
      {/* Hero Banner */}
      <div style={{background:`linear-gradient(135deg,${C.pink},${C.pinkD},${C.green})`,
        borderRadius:20,padding:'18px 16px',marginBottom:14,color:'#fff',
        position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-24,right:-24,width:110,height:110,
          borderRadius:'50%',background:'rgba(255,255,255,0.08)'}}/>
        <div style={{position:'absolute',bottom:-32,left:50,width:90,height:90,
          borderRadius:'50%',background:'rgba(255,255,255,0.06)'}}/>
        <div style={{fontSize:13,opacity:.9}}>Welcome,</div>
        <div style={{fontSize:22,fontWeight:900,marginTop:2}}>Kajol J Kamble 💄</div>
        <div style={{fontSize:12,opacity:.85,marginTop:3}}>Makeup · Artwork · Mehndi Artist</div>
        <Row gap={8} style={{marginTop:12,flexWrap:'wrap'}}>
          <div style={{background:'rgba(255,255,255,0.18)',borderRadius:10,padding:'6px 12px',fontSize:12,display:'flex',alignItems:'center',gap:5}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:'#69FF47',display:'inline-block'}}/>
            {activeBatches.length} Active Batch{activeBatches.length!==1?'es':''}
          </div>
          {pendingYT>0&&<div style={{background:'rgba(255,165,0,0.3)',borderRadius:10,padding:'6px 12px',fontSize:12}}>⚠️ {pendingYT} YT Pending</div>}
          {todayClasses.length>0&&<div style={{background:'rgba(255,255,255,0.2)',borderRadius:10,padding:'6px 12px',fontSize:12}}>📅 {todayClasses.length} class today</div>}
        </Row>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:14}}>
        <StatBox label="Total Income" value={fmt(totalIncome)} color={C.green} icon="rupee"/>
        <StatBox label="Total Expenses" value={fmt(totalExp)} color={C.amber} icon="finance"/>
        <StatBox label="Net Profit" value={fmt(totalIncome-totalExp)} color={C.pink} icon="trend"/>
        <StatBox label="Pending Dues" value={fmt(pendingDues)} color={C.red} icon="alert"/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:9,marginBottom:14}}>
        <StatBox label="Students" value={data.students.length} color={C.purple} icon="students"/>
        <StatBox label="Batches" value={data.batches.length} color={C.blue} icon="batch"/>
        <StatBox label="Orders" value={`${pendingOrders} Pending`} color={C.teal} icon="orders"/>
      </div>

      {/* Pending Activities */}
      {pending.length>0&&(
        <Card accent={C.amber}>
          <SectionTitle><Ic n="alert" size={15} color={C.amber}/> Pending Activities</SectionTitle>
          {pending.map((p,i)=>(
            <div key={i} onClick={()=>setTab(p.tab)} style={{display:'flex',alignItems:'center',
              gap:10,padding:'9px 0',borderBottom:`1px solid ${C.pinkPale}`,cursor:'pointer'}}>
              <div style={{background:p.color+'18',borderRadius:8,padding:6,flexShrink:0}}>
                <Ic n={p.icon} size={15} color={p.color}/>
              </div>
              <div style={{flex:1,fontSize:13,color:C.dark}}>{p.text}</div>
              <span style={{color:C.grey,fontSize:16}}>›</span>
            </div>
          ))}
        </Card>
      )}

      {/* Today's Classes */}
      {todayClasses.length>0&&(
        <Card accent={C.blue}>
          <SectionTitle><Ic n="calendar" size={15} color={C.blue}/> Today's Classes</SectionTitle>
          {todayClasses.map(cl=>{
            const batch = data.batches.find(b=>b.id===cl.batch_id)
            return(
              <div key={cl.id} style={{padding:'8px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
                <div style={{fontWeight:700,fontSize:13}}>{batch?.name||'?'} — Day {cl.day}</div>
                <div style={{fontSize:12,color:C.grey}}>{cl.topic} · {batch?.timing}</div>
                {cl.zoom_link&&<a href={cl.zoom_link} target="_blank" rel="noopener noreferrer"
                  style={{fontSize:12,color:C.blue,display:'flex',alignItems:'center',gap:4,marginTop:4}}>
                  <Ic n="zoom" size={13} color={C.blue}/> Join Zoom
                </a>}
              </div>
            )
          })}
        </Card>
      )}

      {/* Partial-paid reminders */}
      {partialStudents.length>0&&(
        <Card accent={C.amber}>
          <SectionTitle><Ic n="bell" size={15} color={C.amber}/> Payment Reminders</SectionTitle>
          {partialStudents.slice(0,5).map((s,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',
              padding:'8px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
              <div>
                <div style={{fontWeight:700,fontSize:13}}>{s.name}</div>
                <div style={{fontSize:11,color:C.grey}}>{s.batchName}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:13,fontWeight:700,color:C.amber}}>Due: {fmt(s.due)}</div>
                <a href={`https://wa.me/91${s.mobile}?text=${encodeURIComponent(`Hi ${s.name}! This is a gentle reminder that your payment of ${fmt(s.due)} for ${s.batchName} is pending. Please pay at your earliest convenience.\n\n— Kajol Ma'am 💄`)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{fontSize:11,color:'#25D366',textDecoration:'none',display:'flex',alignItems:'center',gap:3,justifyContent:'flex-end',marginTop:3}}>
                  <Ic n="whatsapp" size={11} color="#25D366"/> Remind
                </a>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Active Batches */}
      <Card>
        <SectionTitle><Ic n="batch" size={15} color={C.pink}/> Active Batches</SectionTitle>
        {activeBatches.length===0&&<div style={{color:C.grey,fontSize:13,textAlign:'center',padding:12}}>No active batches</div>}
        {activeBatches.map(b=>{
          const course = data.courses.find(c=>c.id===b.course_id)
          const enrolled = b.student_ids?.length||0
          const classes = data.classes.filter(c=>c.batch_id===b.id).length
          return (
            <div key={b.id} style={{padding:'9px 0',borderBottom:`1px solid ${C.pinkPale}`,
              display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontWeight:700,fontSize:13}}>{b.name}</div>
                <div style={{fontSize:11,color:C.grey}}>{b.schedule} · {b.timing} · {enrolled} students · {classes} classes</div>
              </div>
              <Badge color={course?.color||C.pink}>{course?.type||'—'}</Badge>
            </div>
          )
        })}
      </Card>

      {/* Social quick links */}
      <Card>
        <SectionTitle><Ic n="links" size={15} color={C.pink}/> Quick Links</SectionTitle>
        {[
          {label:'WhatsApp Community', url:'https://chat.whatsapp.com/Lhq5qzRYJ0z11onVX669a3', icon:'whatsapp', color:'#25D366'},
          {label:'Instagram', url:'https://www.instagram.com/kajol_makeover_studioz', icon:'instagram', color:'#E91E63'},
          {label:'YouTube', url:'https://youtube.com/@kajolmakeoverstudioz', icon:'youtube', color:'#FF0000'},
        ].map(l=>(
          <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer"
            style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',textDecoration:'none',color:C.dark,borderBottom:`1px solid ${C.pinkPale}`}}>
            <div style={{background:l.color+'18',borderRadius:9,padding:7,flexShrink:0}}><Ic n={l.icon} size={15} color={l.color}/></div>
            <div style={{fontSize:13,fontWeight:600}}>{l.label}</div>
          </a>
        ))}
      </Card>
    </div>
  )
}
