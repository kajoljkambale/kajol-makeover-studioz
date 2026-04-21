import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { C, uid, today, fmt, fmtDate, monthKey, monthLabel, ADMIN_PWD,
         COURSE_TYPES, ORDER_TYPES, SCHEDULE_OPTS, DURATION_OPTS, EXP_CATS,
         Ic, Modal, Inp, Btn, Badge, Card, Row, Divider, SectionTitle, StatBox,
         Toggle, Spinner, DelConfirm } from '../../lib/ui.jsx'
import { supabase as sb, dbUpsert, dbDelete } from '../../lib/supabase.js'

const ENROLL_URL   = (typeof window !== 'undefined' ? window.location.origin : 'https://kajol-makeover-studioz.vercel.app') + '/enroll'
const WA_COMMUNITY = 'https://chat.whatsapp.com/Lhq5qzRYJ0z11onVX669a3'
const INSTAGRAM    = 'https://www.instagram.com/kajol_makeover_studioz?igsh=a3h2ZWIzbmM3M3Y3'
const YOUTUBE      = 'https://youtube.com/@kajolmakeoverstudioz?si=IsWwx4ScqJ33ZAqp'
export default function BatchesTab({data,setData,toast}) {
  const [sel,setSel]=useState(null); const [sub,setSub]=useState('overview')
  const [modal,setModal]=useState(null); const [del,setDel]=useState(null)
  const [form,setForm]=useState({}); const [cf,setCf]=useState({})
  const [hwM,setHwM]=useState(null); const [busy,setBusy]=useState(false)
  useEffect(()=>{if(!sel&&data.batches[0])setSel(data.batches[0].id)},[data.batches])

  const batch=data.batches.find(b=>b.id===sel)
  const bStudents=batch?data.students.filter(s=>(batch.student_ids||[]).includes(s.id)):[]
  const bClasses=batch?data.classes.filter(c=>c.batch_id===sel).sort((a,b)=>a.day-b.day):[]
  const course=batch?data.courses.find(c=>c.id===batch.course_id):null

  const saveBatch=async()=>{
    if(!form.name)return alert('Name required.')
    setBusy(true)
    const row={
      id:form.id||uid(),
      name:form.name.trim(),
      course_id:form.course_id||'',
      schedule:form.schedule||'Daily',
      duration:form.duration||'10 Days',
      start_date:form.start_date||today(),
      end_date:form.end_date||'',
      timing:form.timing||'',
      status:form.status||'Active',
      fee:Number(form.fee||0),
      zoom_link:form.zoom_link||'',
      zoom_id:form.zoom_id||'',
      wa_group:form.wa_group||'',
      student_ids:form.student_ids||[],
      created_at:form.created_at||new Date().toISOString()
    }
    const ok = await dbUpsert('batches',row)
    if(ok){
      setData(d=>({...d,batches:form.id?d.batches.map(b=>b.id===form.id?{...b,...row}:b):[...d.batches,row]}))
      if(!form.id)setSel(row.id)
      toast('Batch saved!')
    }
    setBusy(false); setModal(null)
  }
  const saveClass=async()=>{
    if(!cf.topic)return alert('Topic required.')
    setBusy(true)
    const row={
      id:cf.id||uid(),
      batch_id:sel,
      day:Number(cf.day||1),
      topic:cf.topic.trim(),
      date:cf.date||today(),
      zoom_link:cf.zoom_link||'',
      youtube_link:cf.youtube_link||'',
      youtube_status:cf.youtube_status||'Pending',
      homework:cf.homework||'',
      notes:cf.notes||'',
      attendees:cf.attendees||[],
      created_at:cf.created_at||new Date().toISOString()
    }
    const ok = await dbUpsert('classes',row)
    if(ok) setData(d=>({...d,classes:cf.id?d.classes.map(c=>c.id===cf.id?{...c,...row}:c):[...d.classes,row]}))
    setBusy(false); setModal(null); toast('Class saved!')
  }
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
