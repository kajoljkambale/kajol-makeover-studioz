import React, { useState, useEffect, useMemo } from 'react'
import { C, uid, today, fmt, fmtDate, monthKey, monthLabel, ADMIN_PWD, COURSE_TYPES, ORDER_TYPES, SCHEDULE_OPTS, DURATION_OPTS, EXP_CATS,
         Ic, Modal, Inp, Btn, Badge, Card, Divider, Row, SectionTitle, StatBox, Toggle, Spinner, DelConfirm } from './lib/ui.jsx'
import { supabase, loadAllData, dbUpsert, dbDelete } from './lib/supabase.js'
import Dashboard from './components/Dashboard.jsx'
import CoursesTab from './components/CoursesTab.jsx'
import BroadcastTab from './components/BroadcastTab.jsx'
import SettingsTab from './components/SettingsTab.jsx'

// ─── TOAST ────────────────────────────────────────────────────────
function Toast({ msg }) {
  return msg ? <div className="toast">{msg}</div> : null
}

// ─── LOGIN ────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [pwd, setPwd]   = useState('')
  const [err, setErr]   = useState('')
  const [show, setShow] = useState(false)
  const submit = () => { if(pwd===ADMIN_PWD) onLogin(); else setErr('Incorrect password. Please try again.') }
  return (
    <div style={{minHeight:'100vh',background:`linear-gradient(150deg,${C.pink} 0%,${C.pinkD} 35%,${C.green} 100%)`,
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{textAlign:'center',marginBottom:28}}>
        <div style={{width:90,height:90,borderRadius:'50%',background:'rgba(255,255,255,0.2)',
          border:'3px solid rgba(255,255,255,0.5)',display:'flex',alignItems:'center',
          justifyContent:'center',margin:'0 auto 14px',fontSize:40}}>💄</div>
        <div style={{fontSize:24,fontWeight:900,color:'#fff',letterSpacing:.5}}>Kajol Makeover Studioz</div>
        <div style={{fontSize:13,color:'rgba(255,255,255,0.85)',marginTop:4}}>Complete Studio Management System</div>
      </div>
      <div style={{background:'rgba(255,255,255,0.97)',borderRadius:24,padding:28,width:'100%',
        maxWidth:380,boxShadow:'0 24px 64px rgba(0,0,0,0.3)'}}>
        <div style={{fontSize:17,fontWeight:700,color:C.dark,marginBottom:20,display:'flex',alignItems:'center',gap:8}}>
          <Ic n="lock" color={C.pink}/> Admin Login
        </div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,fontWeight:700,color:C.grey,display:'block',marginBottom:4,
            textTransform:'uppercase',letterSpacing:.5}}>Password</label>
          <div style={{position:'relative'}}>
            <input type={show?'text':'password'} value={pwd}
              onChange={e=>{setPwd(e.target.value);setErr('')}}
              onKeyDown={e=>e.key==='Enter'&&submit()}
              placeholder="Enter admin password"
              style={{width:'100%',padding:'11px 44px 11px 14px',borderRadius:12,
                border:`1.5px solid ${C.pinkPale}`,fontSize:14,fontFamily:'inherit',
                outline:'none',color:C.dark,boxSizing:'border-box'}}/>
            <div onClick={()=>setShow(!show)} style={{position:'absolute',right:14,top:'50%',
              transform:'translateY(-50%)',cursor:'pointer',color:C.grey}}>
              <Ic n={show?'eyeOff':'eye'} size={18}/>
            </div>
          </div>
        </div>
        {err&&<div style={{color:C.red,fontSize:13,marginBottom:12,background:C.red+'12',
          borderRadius:8,padding:'8px 12px'}}>{err}</div>}
        <Btn color={C.pink} onClick={submit} full style={{padding:13,fontSize:15}}>
          Login to Studio →
        </Btn>
        <div style={{textAlign:'center',marginTop:16,fontSize:11,color:C.grey}}>
          Kajol Makeover Studioz © 2025
        </div>
      </div>
    </div>
  )
}

// ─── STUDENTS TAB ────────────────────────────────────────────────
function StudentsTab({ data, setData, toast }) {
  const [modal, setModal]       = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [search, setSearch]     = useState('')
  const [filterBatch, setFilterBatch] = useState('all')
  const [filterCourse, setFilterCourse] = useState('all')
  const [form, setForm]         = useState({})
  const [enrollModal, setEnrollModal] = useState(null)
  const [saving, setSaving]     = useState(false)

  const filtered = useMemo(()=>data.students.filter(s=>{
    const ms = s.name?.toLowerCase().includes(search.toLowerCase())||s.mobile?.includes(search)
    const mb = filterBatch==='all'||data.batches.find(b=>b.id===filterBatch&&(b.student_ids||[]).includes(s.id))
    const mc = filterCourse==='all'||(s.enrolled_courses||[]).includes(filterCourse)
    return ms&&mb&&mc
  }),[data,search,filterBatch,filterCourse])

  const saveStudent = async () => {
    if(!form.name||!form.mobile) return alert('Name and mobile required.')
    setSaving(true)
    const row = { id:form.id||uid(), name:form.name, mobile:form.mobile, profession:form.profession||'',
      address:form.address||'', email:form.email||'', birthday:form.birthday||null,
      enrolled_courses:form.enrolled_courses||[], join_date:form.join_date||today() }
    await dbUpsert('students', row)
    setData(d=>({...d, students: form.id ? d.students.map(s=>s.id===form.id?{...s,...row}:s) : [...d.students, row]}))
    setSaving(false); setModal(null); toast('Student saved!')
  }

  const delStudent = async (id) => {
    await dbDelete('students', id)
    setData(d=>({...d, students:d.students.filter(s=>s.id!==id)}))
    toast('Student removed.')
  }

  const enrollInBatch = async (studentId, batchId, enroll) => {
    const batch = data.batches.find(b=>b.id===batchId)
    if (!batch) return
    const ids = batch.student_ids||[]
    const newIds = enroll ? [...new Set([...ids,studentId])] : ids.filter(id=>id!==studentId)
    const updated = {...batch, student_ids: newIds}
    await dbUpsert('batches', updated)
    setData(d=>({...d, batches:d.batches.map(b=>b.id===batchId?updated:b)}))
    toast(enroll?'Enrolled!':'Unenrolled.')
  }

  return (
    <div>
      <div style={{position:'relative',marginBottom:8}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search students..."
          style={{width:'100%',padding:'10px 12px 10px 36px',borderRadius:10,
            border:`1.5px solid ${C.pinkPale}`,fontSize:13,fontFamily:'inherit',
            outline:'none',boxSizing:'border-box'}}/>
        <span style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)'}}><Ic n="search" size={15} color={C.grey}/></span>
      </div>
      <Row gap={8} style={{marginBottom:12}}>
        <select value={filterBatch} onChange={e=>setFilterBatch(e.target.value)}
          style={{flex:1,padding:'8px 10px',borderRadius:9,border:`1.5px solid ${C.pinkPale}`,fontSize:12,fontFamily:'inherit',outline:'none',color:C.dark}}>
          <option value="all">All Batches</option>
          {data.batches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={filterCourse} onChange={e=>setFilterCourse(e.target.value)}
          style={{flex:1,padding:'8px 10px',borderRadius:9,border:`1.5px solid ${C.pinkPale}`,fontSize:12,fontFamily:'inherit',outline:'none',color:C.dark}}>
          <option value="all">All Courses</option>
          {data.courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <Btn small onClick={()=>{setForm({name:'',mobile:'',profession:'',address:'',email:'',birthday:'',enrolled_courses:[]});setModal('add')}}>
          <Ic n="add" size={14} color={C.white}/>Add
        </Btn>
      </Row>
      <div style={{fontSize:12,color:C.grey,marginBottom:8}}>{filtered.length} student{filtered.length!==1?'s':''}</div>

      {filtered.map(s=>{
        const paid  = data.payments.filter(p=>p.student_id===s.id).reduce((a,p)=>a+Number(p.paid),0)
        const due   = data.payments.filter(p=>p.student_id===s.id).reduce((a,p)=>a+(Number(p.amount)-Number(p.paid)),0)
        const batches = data.batches.filter(b=>(b.student_ids||[]).includes(s.id))
        const courseNames = (s.enrolled_courses||[]).map(cid=>data.courses.find(c=>c.id===cid)?.name).filter(Boolean)
        return (
          <Card key={s.id}>
            <Row gap={12}>
              <div style={{width:46,height:46,borderRadius:'50%',background:`linear-gradient(135deg,${C.pink},${C.pinkD})`,
                display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:19,flexShrink:0}}>
                {(s.name||'?')[0]}
              </div>
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
            <div style={{fontSize:11,color:C.grey,marginBottom:5}}>📍 {s.address} · Joined: {s.join_date}</div>
            {s.birthday&&<div style={{fontSize:11,color:C.grey,marginBottom:5}}>🎂 Birthday: {fmtDate(s.birthday)}</div>}
            {courseNames.length>0&&<Row gap={5} style={{flexWrap:'wrap',marginBottom:6}}>
              {courseNames.map(n=><Badge key={n} color={data.courses.find(c=>c.name===n)?.color||C.pink}>{n}</Badge>)}
            </Row>}
            {batches.length>0&&<div style={{fontSize:11,color:C.grey,marginBottom:8}}>Batches: {batches.map(b=>b.name).join(', ')}</div>}
            <Row gap={7} style={{flexWrap:'wrap'}}>
              <Btn small outline onClick={()=>{setForm({...s,birthday:s.birthday||'',enrolled_courses:s.enrolled_courses||[]});setModal('edit_'+s.id)}}>✏️ Edit</Btn>
              <Btn small color={C.blue} onClick={()=>setEnrollModal(s.id)}>📚 Enroll</Btn>
              <a href={`https://wa.me/91${s.mobile}`} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>
                <Btn small color="#25D366"><Ic n="whatsapp" size={12} color={C.white}/>WA</Btn>
              </a>
              <Btn small color={C.red} onClick={()=>setDelTarget(s)}>🗑️</Btn>
            </Row>

            {modal==='edit_'+s.id&&(
              <Modal onClose={()=>setModal(null)} title={<><Ic n="edit" color={C.pink}/> Edit Student</>}>
                {[['name','Full Name *'],['mobile','Mobile *'],['profession','Profession'],['address','Address'],['email','Email']].map(([f,lbl])=>
                  <Inp key={f} label={lbl} value={form[f]} onChange={v=>setForm(x=>({...x,[f]:v}))}/>
                )}
                <Inp label="Birthday" value={form.birthday} onChange={v=>setForm(x=>({...x,birthday:v}))} type="date"/>
                <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Courses</div>
                {data.courses.map(c=>(
                  <label key={c.id} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,marginBottom:6,cursor:'pointer'}}>
                    <input type="checkbox" checked={(form.enrolled_courses||[]).includes(c.id)}
                      onChange={e=>{const cur=form.enrolled_courses||[];setForm(x=>({...x,enrolled_courses:e.target.checked?[...cur,c.id]:cur.filter(id=>id!==c.id)}))}}/>
                    <Badge color={c.color||C.pink}>{c.name}</Badge>
                  </label>
                ))}
                <Row gap={8} style={{marginTop:10}}>
                  <Btn outline onClick={()=>setModal(null)} full>Cancel</Btn>
                  <Btn onClick={saveStudent} full disabled={saving}>{saving?'Saving…':'Save'}</Btn>
                </Row>
              </Modal>
            )}

            {enrollModal===s.id&&(
              <Modal onClose={()=>setEnrollModal(null)} title={<><Ic n="course" color={C.blue}/> Enroll {s.name}</>}>
                {data.batches.map(b=>{
                  const enrolled=(b.student_ids||[]).includes(s.id)
                  const course=data.courses.find(c=>c.id===b.course_id)
                  return (
                    <div key={b.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
                      <div>
                        <div style={{fontWeight:600,fontSize:13}}>{b.name}</div>
                        <div style={{fontSize:11,color:C.grey}}>{course?.name} · {b.timing} · {b.schedule}</div>
                        {b.fee&&<div style={{fontSize:11,color:C.green,fontWeight:700}}>₹{b.fee}</div>}
                      </div>
                      <Toggle checked={enrolled} onChange={v=>enrollInBatch(s.id,b.id,v)}/>
                    </div>
                  )
                })}
                <Btn color={C.green} onClick={()=>setEnrollModal(null)} full style={{marginTop:12}}>Done</Btn>
              </Modal>
            )}
          </Card>
        )
      })}
      {filtered.length===0&&<div style={{textAlign:'center',color:C.grey,padding:32}}>No students found</div>}

      {modal==='add'&&(
        <Modal onClose={()=>setModal(null)} title={<><Ic n="add" color={C.pink}/> Add Student</>}>
          {[['name','Full Name *'],['mobile','Mobile *'],['profession','Profession'],['address','Address'],['email','Email']].map(([f,lbl])=>
            <Inp key={f} label={lbl} value={form[f]} onChange={v=>setForm(x=>({...x,[f]:v}))}/>
          )}
          <Inp label="Birthday (for wishes)" value={form.birthday} onChange={v=>setForm(x=>({...x,birthday:v}))} type="date"/>
          <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Select Courses</div>
          {data.courses.map(c=>(
            <label key={c.id} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,marginBottom:6,cursor:'pointer'}}>
              <input type="checkbox" checked={(form.enrolled_courses||[]).includes(c.id)}
                onChange={e=>{const cur=form.enrolled_courses||[];setForm(x=>({...x,enrolled_courses:e.target.checked?[...cur,c.id]:cur.filter(id=>id!==c.id)}))}}/>
              <Badge color={c.color||C.pink}>{c.name}</Badge>
            </label>
          ))}
          <Row gap={8} style={{marginTop:10}}>
            <Btn outline onClick={()=>setModal(null)} full>Cancel</Btn>
            <Btn onClick={saveStudent} full disabled={saving}>{saving?'Saving…':'Add Student'}</Btn>
          </Row>
        </Modal>
      )}
      {delTarget&&<DelConfirm item={delTarget.name} onConfirm={()=>delStudent(delTarget.id)} onClose={()=>setDelTarget(null)}/>}
    </div>
  )
}

// ─── BATCHES TAB ─────────────────────────────────────────────────
function BatchesTab({ data, setData, toast }) {
  const [selBatch, setSelBatch] = useState(null)
  const [subTab, setSubTab]     = useState('overview')
  const [modal, setModal]       = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [form, setForm]         = useState({})
  const [classForm, setClassForm] = useState({})
  const [hwModal, setHwModal]   = useState(null)
  const [saving, setSaving]     = useState(false)

  useEffect(()=>{if(!selBatch&&data.batches[0]) setSelBatch(data.batches[0].id)},[data.batches])

  const batch        = data.batches.find(b=>b.id===selBatch)
  const batchStudents = batch ? data.students.filter(s=>(batch.student_ids||[]).includes(s.id)) : []
  const batchClasses  = batch ? data.classes.filter(c=>c.batch_id===selBatch).sort((a,b)=>a.day-b.day) : []
  const course        = batch ? data.courses.find(c=>c.id===batch.course_id) : null

  const saveBatch = async () => {
    if(!form.name) return alert('Batch name required.')
    setSaving(true)
    const row = { id:form.id||uid(), name:form.name, course_id:form.course_id||'',
      schedule:form.schedule||'Daily', duration:form.duration||'10 Days',
      start_date:form.start_date||today(), end_date:form.end_date||'',
      timing:form.timing||'', status:form.status||'Active',
      fee:Number(form.fee||0), zoom_link:form.zoom_link||'', zoom_id:form.zoom_id||'',
      wa_group:form.wa_group||'', youtube_channel:'https://youtube.com/@kajolmakeoverstudioz',
      student_ids: form.student_ids||[] }
    await dbUpsert('batches', row)
    setData(d=>({...d, batches: form.id ? d.batches.map(b=>b.id===form.id?{...b,...row}:b) : [...d.batches, row]}))
    if(!form.id) setSelBatch(row.id)
    setSaving(false); setModal(null); toast('Batch saved!')
  }

  const saveClass = async () => {
    if(!classForm.topic) return alert('Topic required.')
    setSaving(true)
    const row = { id:classForm.id||uid(), batch_id:selBatch, day:Number(classForm.day||1),
      topic:classForm.topic, date:classForm.date||today(), zoom_link:classForm.zoom_link||'',
      youtube_link:classForm.youtube_link||'', youtube_status:classForm.youtube_status||'Pending',
      homework:classForm.homework||'', notes:classForm.notes||'', attendees:classForm.attendees||[] }
    await dbUpsert('classes', row)
    setData(d=>({...d, classes: classForm.id ? d.classes.map(c=>c.id===classForm.id?{...c,...row}:c) : [...d.classes, row]}))
    setSaving(false); setModal(null); toast('Class saved!')
  }

  const toggleHW = async (classId, studentId, currentVal) => {
    const existing = data.homeworkCompliance.find(h=>h.class_id===classId&&h.student_id===studentId)
    if(existing) {
      const updated = {...existing, submitted:!currentVal, date:today()}
      await dbUpsert('homework_compliance', updated)
      setData(d=>({...d, homeworkCompliance:d.homeworkCompliance.map(h=>h.id===existing.id?updated:h)}))
    } else {
      const row = {id:uid(), class_id:classId, student_id:studentId, submitted:true, note:'', date:today()}
      await dbUpsert('homework_compliance', row)
      setData(d=>({...d, homeworkCompliance:[...d.homeworkCompliance, row]}))
    }
  }

  const SUB = ['overview','classes','zoom_yt','whatsapp','reminders']
  const LABELS = {overview:'Overview',classes:'Classes',zoom_yt:'Zoom/YT',whatsapp:'WhatsApp',reminders:'Reminders'}

  return (
    <div>
      {/* Batch pills */}
      <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4,marginBottom:12}}>
        {data.batches.map(b=>{
          const c=data.courses.find(x=>x.id===b.course_id)
          return (
            <div key={b.id} onClick={()=>{setSelBatch(b.id);setSubTab('overview')}}
              style={{flexShrink:0,padding:'7px 14px',borderRadius:12,cursor:'pointer',
                background:selBatch===b.id?(c?.color||C.pink):C.white,
                color:selBatch===b.id?C.white:C.dark,
                border:`1.5px solid ${selBatch===b.id?(c?.color||C.pink):C.pinkPale}`,
                fontSize:12,fontWeight:600,transition:'all .2s',
                boxShadow:selBatch===b.id?`0 4px 12px ${(c?.color||C.pink)}44`:'none'}}>
              {b.name.length>16?b.name.slice(0,14)+'…':b.name}
            </div>
          )
        })}
        <div onClick={()=>{setForm({name:'',schedule:'Daily',duration:'10 Days',status:'Active',student_ids:[]});setModal('form')}}
          style={{flexShrink:0,padding:'7px 14px',borderRadius:12,background:C.pinkPale,
            color:C.pink,border:`1.5px dashed ${C.pink}`,fontSize:12,fontWeight:700,cursor:'pointer'}}>
          + New
        </div>
      </div>

      {!batch&&<div style={{textAlign:'center',color:C.grey,padding:40}}>No batches yet. Create one!</div>}

      {batch&&(
        <>
          {/* Sub-tabs */}
          <div style={{display:'flex',gap:4,overflowX:'auto',marginBottom:12}}>
            {SUB.map(s=>(
              <div key={s} onClick={()=>setSubTab(s)} style={{flexShrink:0,padding:'6px 12px',borderRadius:10,
                background:subTab===s?C.pink:C.greyL, color:subTab===s?C.white:C.grey,
                fontSize:11,fontWeight:subTab===s?700:500,cursor:'pointer',transition:'all .15s'}}>
                {LABELS[s]}
              </div>
            ))}
          </div>

          {/* OVERVIEW */}
          {subTab==='overview'&&(
            <div>
              <Card accent={course?.color||C.pink}>
                <Row style={{justifyContent:'space-between',marginBottom:8}}>
                  <div style={{fontWeight:800,fontSize:16}}>{batch.name}</div>
                  <Badge color={batch.status==='Active'?C.green:batch.status==='Upcoming'?C.blue:C.grey}>{batch.status}</Badge>
                </Row>
                <div style={{fontSize:12,color:C.grey}}>Course: <b>{course?.name||'—'}</b></div>
                <div style={{fontSize:12,color:C.grey}}>📅 {batch.start_date} → {batch.end_date} · ⏰ {batch.timing}</div>
                <div style={{fontSize:12,color:C.grey}}>📋 {batch.schedule} · {batch.duration} · Fee: {fmt(batch.fee||0)}</div>
                <Divider/>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:10}}>
                  {[['Students',batchStudents.length,C.pink],['Classes',batchClasses.length,C.green],['YT Done',batchClasses.filter(c=>c.youtube_status==='Uploaded').length,'#FF0000']].map(([l,v,c])=>(
                    <div key={l} style={{textAlign:'center',background:c+'12',borderRadius:10,padding:10}}>
                      <div style={{fontSize:20,fontWeight:800,color:c}}>{v}</div>
                      <div style={{fontSize:10,color:C.grey}}>{l}</div>
                    </div>
                  ))}
                </div>
                <Row gap={7} style={{flexWrap:'wrap'}}>
                  <Btn small outline onClick={()=>{setForm({...batch,start_date:batch.start_date||'',end_date:batch.end_date||''});setModal('form')}}>✏️ Edit</Btn>
                  <Btn small color={C.red} onClick={()=>setDelTarget({id:batch.id,name:batch.name,type:'batch'})}>🗑️</Btn>
                </Row>
              </Card>

              <SectionTitle><Ic n="students" size={15} color={C.blue}/> Enrolled Students</SectionTitle>
              {batchStudents.length===0&&<div style={{color:C.grey,fontSize:13,textAlign:'center',padding:16,background:C.white,borderRadius:12}}>No students. Use Students tab → Enroll.</div>}
              {batchStudents.map(s=>{
                const paid=data.payments.filter(p=>p.student_id===s.id&&p.batch_id===selBatch).reduce((a,p)=>a+Number(p.paid),0)
                const total=data.payments.filter(p=>p.student_id===s.id&&p.batch_id===selBatch).reduce((a,p)=>a+Number(p.amount),0)
                return (
                  <Card key={s.id}>
                    <Row style={{justifyContent:'space-between'}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:13}}>{s.name}</div>
                        <div style={{fontSize:11,color:C.grey}}>📱 {s.mobile}</div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:13,fontWeight:700,color:C.green}}>{fmt(paid)}</div>
                        {total>paid&&<div style={{fontSize:11,color:C.amber}}>Due: {fmt(total-paid)}</div>}
                        {total>paid&&(
                          <a href={`https://wa.me/91${s.mobile}?text=${encodeURIComponent(`Hi ${s.name}! Gentle reminder: ₹${total-paid} payment pending for ${batch.name}. — Kajol Ma'am 💄`)}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{fontSize:11,color:'#25D366',display:'flex',alignItems:'center',gap:3,justifyContent:'flex-end',textDecoration:'none',marginTop:3}}>
                            <Ic n="whatsapp" size={11} color="#25D366"/> Remind
                          </a>
                        )}
                      </div>
                    </Row>
                  </Card>
                )
              })}
            </div>
          )}

          {/* CLASSES */}
          {subTab==='classes'&&(
            <div>
              <Row style={{justifyContent:'space-between',marginBottom:12}}>
                <SectionTitle><Ic n="book" size={15} color={C.green}/> Class Progress</SectionTitle>
                <Btn small onClick={()=>{setClassForm({topic:'',date:today(),day:batchClasses.length+1,zoom_link:batch.zoom_link||'',youtube_link:'',youtube_status:'Pending',homework:'',notes:'',attendees:[]});setModal('class')}}>
                  <Ic n="add" size={13} color={C.white}/>Add Class
                </Btn>
              </Row>
              {batchClasses.map(cl=>{
                const hwList=data.homeworkCompliance.filter(h=>h.class_id===cl.id)
                const submitted=hwList.filter(h=>h.submitted).length
                const ytColor=cl.youtube_status==='Uploaded'?C.green:cl.youtube_status==='Processing'?C.amber:C.red
                return (
                  <Card key={cl.id} accent={cl.youtube_status==='Uploaded'?C.green:C.amber}>
                    <Row style={{justifyContent:'space-between',marginBottom:4}}>
                      <div style={{fontWeight:700,fontSize:14}}>Day {cl.day}: {cl.topic}</div>
                      <Badge color={ytColor}>{cl.youtube_status}</Badge>
                    </Row>
                    <div style={{fontSize:11,color:C.grey,marginBottom:6}}>📅 {cl.date} · 👥 {(cl.attendees||[]).length}/{batchStudents.length} attended</div>
                    {cl.homework&&<div style={{fontSize:12,color:C.dark,background:C.greenPale,borderRadius:8,padding:'6px 10px',marginBottom:6}}>📝 HW: {cl.homework}</div>}
                    {cl.homework&&<div style={{fontSize:11,color:C.grey,marginBottom:6}}>✅ HW Compliance: {submitted}/{batchStudents.length}</div>}
                    {cl.youtube_link&&<a href={cl.youtube_link} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'#FF0000',display:'flex',alignItems:'center',gap:4,marginBottom:4}}><Ic n="youtube" size={13} color="#FF0000"/> Watch Recording</a>}
                    <Row gap={7} style={{marginTop:8,flexWrap:'wrap'}}>
                      <Btn small outline onClick={()=>{setClassForm({...cl,attendees:cl.attendees||[]});setModal('edit_cl_'+cl.id)}}>✏️</Btn>
                      <Btn small color={C.blue} onClick={()=>setHwModal(cl.id)}>📝 HW</Btn>
                      <select value={cl.youtube_status} onChange={async e=>{
                        const updated={...cl,youtube_status:e.target.value}
                        await dbUpsert('classes',updated)
                        setData(d=>({...d,classes:d.classes.map(c=>c.id===cl.id?updated:c)}))
                        toast('YT status updated!')
                      }} style={{fontSize:11,borderRadius:6,border:`1px solid ${C.pinkPale}`,padding:'4px 7px',fontFamily:'inherit',cursor:'pointer'}}>
                        {['Pending','Processing','Uploaded'].map(s=><option key={s}>{s}</option>)}
                      </select>
                      <Btn small color={C.red} onClick={async()=>{await dbDelete('classes',cl.id);setData(d=>({...d,classes:d.classes.filter(c=>c.id!==cl.id)}));toast('Class deleted.')}}>🗑️</Btn>
                    </Row>

                    {/* Edit class modal */}
                    {modal==='edit_cl_'+cl.id&&(
                      <Modal onClose={()=>setModal(null)} title={<><Ic n="edit" color={C.pink}/> Edit Class</>}>
                        {[['day','Day #'],['topic','Topic *'],['homework','Homework'],['notes','Notes'],['zoom_link','Zoom Link'],['youtube_link','YouTube Link']].map(([f,lbl])=>
                          <Inp key={f} label={lbl} value={classForm[f]} onChange={v=>setClassForm(x=>({...x,[f]:v}))}/>
                        )}
                        <Inp label="Date" value={classForm.date} onChange={v=>setClassForm(x=>({...x,date:v}))} type="date"/>
                        <Inp label="YT Status" value={classForm.youtube_status} onChange={v=>setClassForm(x=>({...x,youtube_status:v}))} opts={['Pending','Processing','Uploaded']}/>
                        <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Attendance</div>
                        {batchStudents.map(s=>(
                          <label key={s.id} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,marginBottom:5,cursor:'pointer'}}>
                            <input type="checkbox" checked={(classForm.attendees||[]).includes(s.id)}
                              onChange={e=>{const cur=classForm.attendees||[];setClassForm(x=>({...x,attendees:e.target.checked?[...cur,s.id]:cur.filter(id=>id!==s.id)}))}}/>
                            {s.name}
                          </label>
                        ))}
                        <Row gap={8} style={{marginTop:10}}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn onClick={saveClass} full disabled={saving}>{saving?'…':'Save'}</Btn></Row>
                      </Modal>
                    )}

                    {/* HW compliance modal */}
                    {hwModal===cl.id&&(
                      <Modal onClose={()=>setHwModal(null)} title={<><Ic n="check" color={C.green}/> HW — Day {cl.day}</>}>
                        {batchStudents.map(s=>{
                          const hw=data.homeworkCompliance.find(h=>h.class_id===cl.id&&h.student_id===s.id)
                          return (
                            <div key={s.id} style={{padding:'10px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
                              <Row style={{justifyContent:'space-between'}}>
                                <div>
                                  <div style={{fontWeight:600,fontSize:13}}>{s.name}</div>
                                  <div style={{fontSize:11,color:hw?.submitted?C.green:C.red}}>
                                    {hw?.submitted?'✅ Submitted':'❌ Not submitted'}
                                  </div>
                                </div>
                                <Toggle checked={!!hw?.submitted} onChange={()=>toggleHW(cl.id,s.id,!!hw?.submitted)}/>
                              </Row>
                            </div>
                          )
                        })}
                        <Btn color={C.green} onClick={()=>setHwModal(null)} full style={{marginTop:12}}>Done</Btn>
                      </Modal>
                    )}
                  </Card>
                )
              })}
              {batchClasses.length===0&&<div style={{textAlign:'center',color:C.grey,padding:24,background:C.white,borderRadius:12}}>No classes added yet.</div>}
            </div>
          )}

          {/* ZOOM/YT */}
          {subTab==='zoom_yt'&&(
            <div>
              <Card accent={C.blue}>
                <SectionTitle><Ic n="zoom" size={15} color={C.blue}/> Zoom Details</SectionTitle>
                <div style={{fontSize:13,marginBottom:6}}><b>Meeting ID:</b> {batch.zoom_id||'Not set'}</div>
                <div style={{fontSize:12,color:C.grey,wordBreak:'break-all',marginBottom:10}}>{batch.zoom_link||'No Zoom link set'}</div>
                {batch.zoom_link&&<Row gap={8} style={{flexWrap:'wrap'}}>
                  <a href={batch.zoom_link} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>
                    <Btn color={C.blue} small><Ic n="zoom" size={13} color={C.white}/>Join Zoom</Btn>
                  </a>
                  <Btn small outline onClick={()=>{const t=`${batch.name} Zoom: ${batch.zoom_link} (ID: ${batch.zoom_id||''})`;navigator.share?navigator.share({text:t}):(navigator.clipboard.writeText(t),toast('Copied!'))}}>
                    <Ic n="share" size={13} color={C.pink}/>Share
                  </Btn>
                </Row>}
              </Card>
              <Card accent="#FF0000">
                <SectionTitle><Ic n="youtube" size={15} color="#FF0000"/> YouTube Tracker</SectionTitle>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:12}}>
                  {['Uploaded','Processing','Pending'].map(s=>{
                    const cnt=batchClasses.filter(c=>c.youtube_status===s).length
                    const col=s==='Uploaded'?C.green:s==='Processing'?C.amber:C.red
                    return <div key={s} style={{background:col+'15',borderRadius:10,padding:10,textAlign:'center'}}>
                      <div style={{fontSize:18,fontWeight:800,color:col}}>{cnt}</div>
                      <div style={{fontSize:10,color:C.grey}}>{s}</div>
                    </div>
                  })}
                </div>
                {batchClasses.map(cl=>(
                  <div key={cl.id} style={{padding:'9px 0',borderBottom:`1px solid ${C.pinkPale}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:600}}>Day {cl.day}: {cl.topic}</div>
                      <div style={{fontSize:11,color:C.grey}}>{cl.date}</div>
                      {cl.youtube_link&&<a href={cl.youtube_link} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:'#FF0000'}}>▶ Watch</a>}
                    </div>
                    <Badge color={cl.youtube_status==='Uploaded'?C.green:cl.youtube_status==='Processing'?C.amber:C.red}>{cl.youtube_status}</Badge>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* WHATSAPP */}
          {subTab==='whatsapp'&&(
            <div>
              <Card accent="#25D366">
                <SectionTitle><Ic n="whatsapp" size={15} color="#25D366"/> Batch WhatsApp Group</SectionTitle>
                {batch.wa_group
                  ? <><div style={{wordBreak:'break-all',fontSize:13,marginBottom:12}}>{batch.wa_group}</div>
                      <Row gap={8} style={{flexWrap:'wrap'}}>
                        <a href={batch.wa_group} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>
                          <Btn color="#25D366" small><Ic n="whatsapp" size={13} color={C.white}/>Open Group</Btn>
                        </a>
                        <Btn small outline onClick={()=>{const m=`Hi! Welcome to ${batch.name}.\nGroup: ${batch.wa_group}\nClass time: ${batch.timing}\nZoom: ${batch.zoom_link||'to be shared'}\n\n— Kajol Ma'am 💄`;navigator.share?navigator.share({text:m}):(navigator.clipboard.writeText(m),toast('Copied!'))}}>
                          Share Welcome
                        </Btn>
                      </Row></>
                  : <div style={{fontSize:13,color:C.grey}}>No group link. Edit batch to add it.</div>
                }
              </Card>
              <Card>
                <SectionTitle><Ic n="share" size={15} color={C.pink}/> Share Class Updates</SectionTitle>
                {batchClasses.slice(-5).reverse().map(cl=>(
                  <div key={cl.id} style={{padding:'9px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
                    <div style={{fontSize:13,fontWeight:600,marginBottom:5}}>Day {cl.day}: {cl.topic}</div>
                    <Row gap={6} style={{flexWrap:'wrap'}}>
                      {cl.zoom_link&&<Btn small color="#25D366" onClick={()=>{const m=`📚 *${batch.name} — Day ${cl.day}*\nTopic: ${cl.topic}\n🎥 Zoom: ${cl.zoom_link}\n⏰ Time: ${batch.timing}\n— Kajol Ma'am 💄`;navigator.share?navigator.share({text:m}):(navigator.clipboard.writeText(m),toast('Copied!'))}}>
                        <Ic n="whatsapp" size={12} color={C.white}/>Zoom
                      </Btn>}
                      {cl.youtube_link&&<Btn small color="#FF0000" onClick={()=>{const m=`🎬 *Day ${cl.day} Recording*\nTopic: ${cl.topic}\n▶ ${cl.youtube_link}\n— Kajol Ma'am 💄`;navigator.share?navigator.share({text:m}):(navigator.clipboard.writeText(m),toast('Copied!'))}}>
                        <Ic n="youtube" size={12} color={C.white}/>YT Link
                      </Btn>}
                    </Row>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* REMINDERS */}
          {subTab==='reminders'&&(
            <div>
              <Card accent={C.amber}>
                <SectionTitle><Ic n="bell" size={15} color={C.amber}/> Class Day Reminders</SectionTitle>
                {batchClasses.map(cl=>(
                  <div key={cl.id} style={{padding:'10px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
                    <Row style={{justifyContent:'space-between',marginBottom:4}}>
                      <div style={{fontWeight:600,fontSize:13}}>Day {cl.day}: {cl.topic}</div>
                      <div style={{fontSize:11,color:C.grey}}>{cl.date}</div>
                    </Row>
                    <Btn small color="#25D366" onClick={()=>{
                      const msg=`🌸 *Class Reminder — ${batch.name}*\n\nDay ${cl.day}: *${cl.topic}*\n📅 Date: ${cl.date}\n⏰ Time: ${batch.timing}\n🎥 Zoom: ${cl.zoom_link||batch.zoom_link||'Link coming'}\n\n${cl.homework?'📝 Previous HW: '+cl.homework+'\n\n':''}Please join on time!\n— Kajol Ma'am 💄`
                      navigator.share?navigator.share({text:msg}):(navigator.clipboard.writeText(msg),toast('Reminder copied!'))
                    }}><Ic n="whatsapp" size={12} color={C.white}/>Copy Reminder</Btn>
                  </div>
                ))}
                {batchClasses.length===0&&<div style={{color:C.grey,fontSize:13,padding:12,textAlign:'center'}}>Add classes first.</div>}
              </Card>
              <Card>
                <SectionTitle><Ic n="bell" size={15} color={C.pink}/> Custom Announcement</SectionTitle>
                <CustomAnnounce batch={batch}/>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Batch Modal */}
      {modal==='form'&&(
        <Modal onClose={()=>setModal(null)} title={<><Ic n="batch" color={C.pink}/> {form.id?'Edit':'New'} Batch</>}>
          <Inp label="Batch Name *" value={form.name} onChange={v=>setForm(x=>({...x,name:v}))}/>
          <Inp label="Course" value={form.course_id||''} onChange={v=>setForm(x=>({...x,course_id:v}))} opts={[{v:'',l:'— No Course —'},...data.courses.map(c=>({v:c.id,l:c.name}))]}/>
          <Inp label="Schedule" value={form.schedule||'Daily'} onChange={v=>setForm(x=>({...x,schedule:v}))} opts={SCHEDULE_OPTS}/>
          <Inp label="Duration" value={form.duration||'10 Days'} onChange={v=>setForm(x=>({...x,duration:v}))} opts={DURATION_OPTS}/>
          <Inp label="Status" value={form.status||'Active'} onChange={v=>setForm(x=>({...x,status:v}))} opts={['Active','Upcoming','Completed']}/>
          <Inp label="Timing (e.g. 6:00 PM)" value={form.timing} onChange={v=>setForm(x=>({...x,timing:v}))}/>
          <Inp label="Start Date" value={form.start_date||today()} onChange={v=>setForm(x=>({...x,start_date:v}))} type="date"/>
          <Inp label="End Date" value={form.end_date} onChange={v=>setForm(x=>({...x,end_date:v}))} type="date"/>
          <Inp label="Batch Fee (₹)" value={form.fee} onChange={v=>setForm(x=>({...x,fee:v}))} type="number"/>
          <Inp label="Zoom Link" value={form.zoom_link} onChange={v=>setForm(x=>({...x,zoom_link:v}))}/>
          <Inp label="Zoom Meeting ID" value={form.zoom_id} onChange={v=>setForm(x=>({...x,zoom_id:v}))}/>
          <Inp label="WhatsApp Group Link" value={form.wa_group} onChange={v=>setForm(x=>({...x,wa_group:v}))}/>
          <Row gap={8}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn onClick={saveBatch} full disabled={saving}>{saving?'Saving…':'Save Batch'}</Btn></Row>
        </Modal>
      )}

      {/* Add/Edit Class Modal */}
      {modal==='class'&&(
        <Modal onClose={()=>setModal(null)} title={<><Ic n="add" color={C.green}/> Add Class</>}>
          {[['day','Day #'],['topic','Topic *'],['homework','Homework for Students'],['notes','Notes'],['zoom_link','Zoom Link'],['youtube_link','YouTube Link (after upload)']].map(([f,lbl])=>
            <Inp key={f} label={lbl} value={classForm[f]} onChange={v=>setClassForm(x=>({...x,[f]:v}))}/>
          )}
          <Inp label="Date" value={classForm.date||today()} onChange={v=>setClassForm(x=>({...x,date:v}))} type="date"/>
          <Inp label="YouTube Status" value={classForm.youtube_status||'Pending'} onChange={v=>setClassForm(x=>({...x,youtube_status:v}))} opts={['Pending','Processing','Uploaded']}/>
          <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Mark Attendance</div>
          {batchStudents.map(s=>(
            <label key={s.id} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,marginBottom:5,cursor:'pointer'}}>
              <input type="checkbox" checked={(classForm.attendees||[]).includes(s.id)}
                onChange={e=>{const cur=classForm.attendees||[];setClassForm(x=>({...x,attendees:e.target.checked?[...cur,s.id]:cur.filter(id=>id!==s.id)}))}}/>
              {s.name}
            </label>
          ))}
          <Row gap={8} style={{marginTop:10}}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn color={C.green} onClick={saveClass} full disabled={saving}>{saving?'…':'Add Class'}</Btn></Row>
        </Modal>
      )}

      {delTarget&&<DelConfirm item={delTarget.name} onConfirm={async()=>{
        if(delTarget.type==='batch'){await dbDelete('batches',delTarget.id);setData(d=>({...d,batches:d.batches.filter(b=>b.id!==delTarget.id),classes:d.classes.filter(c=>c.batch_id!==delTarget.id)}))}
        setDelTarget(null); toast('Deleted.')
      }} onClose={()=>setDelTarget(null)}/>}
    </div>
  )
}

function CustomAnnounce({ batch }) {
  const [msg, setMsg] = useState(`🌸 *Reminder — ${batch?.name}*\n\nClass today at ${batch?.timing||'scheduled time'}!\n🎥 Zoom: ${batch?.zoom_link||'Link in group'}\n\n— Kajol Ma'am 💄`)
  return (
    <div>
      <textarea value={msg} onChange={e=>setMsg(e.target.value)} style={{width:'100%',minHeight:100,padding:'10px 12px',borderRadius:10,border:`1.5px solid ${C.pinkPale}`,fontSize:12,fontFamily:'inherit',outline:'none',boxSizing:'border-box',resize:'vertical',color:C.dark}}/>
      <Btn color="#25D366" full style={{marginTop:8}} onClick={()=>{navigator.share?navigator.share({text:msg}):(navigator.clipboard.writeText(msg),alert('Copied! Paste in WhatsApp group.'))}}>
        <Ic n="whatsapp" size={14} color={C.white}/>Share to WhatsApp
      </Btn>
    </div>
  )
}

// ─── PAYMENTS TAB ─────────────────────────────────────────────────
function PaymentsTab({ data, setData, toast }) {
  const [modal, setModal]       = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [form, setForm]         = useState({})
  const [filterBatch, setFilterBatch] = useState('all')
  const [filterStudent, setFilterStudent] = useState('all')
  const [saving, setSaving]     = useState(false)

  const filtered = data.payments.filter(p=>(filterBatch==='all'||p.batch_id===filterBatch)&&(filterStudent==='all'||p.student_id===filterStudent))
  const totalPaid = filtered.reduce((s,p)=>s+Number(p.paid),0)
  const totalDue  = filtered.reduce((s,p)=>s+(Number(p.amount)-Number(p.paid)),0)

  const savePayment = async () => {
    if(!form.amount||!form.paid) return alert('Amount required.')
    setSaving(true)
    const row = { id:form.id||uid(), student_id:form.student_id||data.students[0]?.id,
      batch_id:form.batch_id||data.batches[0]?.id, amount:Number(form.amount), paid:Number(form.paid),
      type:form.type||'Full', date:form.date||today(), note:form.note||'' }
    await dbUpsert('payments', row)
    setData(d=>({...d, payments: form.id ? d.payments.map(p=>p.id===form.id?{...p,...row}:p) : [...d.payments, row]}))
    setSaving(false); setModal(null); toast('Payment saved!')
  }

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:14}}>
        <StatBox label="Received" value={fmt(totalPaid)} color={C.green} icon="rupee"/>
        <StatBox label="Pending" value={fmt(totalDue)} color={C.amber} icon="alert"/>
      </div>
      <Row gap={8} style={{marginBottom:12}}>
        <select value={filterBatch} onChange={e=>setFilterBatch(e.target.value)} style={{flex:1,padding:'8px 10px',borderRadius:9,border:`1.5px solid ${C.pinkPale}`,fontSize:12,fontFamily:'inherit',outline:'none',color:C.dark}}>
          <option value="all">All Batches</option>
          {data.batches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={filterStudent} onChange={e=>setFilterStudent(e.target.value)} style={{flex:1,padding:'8px 10px',borderRadius:9,border:`1.5px solid ${C.pinkPale}`,fontSize:12,fontFamily:'inherit',outline:'none',color:C.dark}}>
          <option value="all">All Students</option>
          {data.students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <Btn small onClick={()=>{setForm({student_id:data.students[0]?.id||'',batch_id:data.batches[0]?.id||'',amount:'',paid:'',type:'Full',date:today(),note:''});setModal('add')}}>
          <Ic n="add" size={14} color={C.white}/>
        </Btn>
      </Row>

      {filtered.map(p=>{
        const student=data.students.find(s=>s.id===p.student_id)
        const batch=data.batches.find(b=>b.id===p.batch_id)
        const due=Number(p.amount)-Number(p.paid)
        return (
          <Card key={p.id} accent={due>0?C.amber:C.green}>
            <Row style={{justifyContent:'space-between',marginBottom:6}}>
              <div>
                <div style={{fontWeight:700,fontSize:14}}>{student?.name||'Unknown'}</div>
                <div style={{fontSize:12,color:C.grey}}>{batch?.name||'No batch'}</div>
              </div>
              <Badge color={p.type==='Full'?C.green:C.amber}>{p.type}</Badge>
            </Row>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:8}}>
              {[['Fee',fmt(p.amount),C.dark],['Paid',fmt(p.paid),C.green],['Due',fmt(due),due>0?C.amber:C.green]].map(([l,v,c])=>(
                <div key={l} style={{background:c+'10',borderRadius:8,padding:'6px 8px',textAlign:'center'}}>
                  <div style={{fontSize:10,color:c}}>{l}</div>
                  <div style={{fontSize:13,fontWeight:700,color:c}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{fontSize:11,color:C.grey,marginBottom:8}}>📅 {p.date} {p.note&&`· ${p.note}`}</div>
            {due>0&&student&&(
              <a href={`https://wa.me/91${student.mobile}?text=${encodeURIComponent(`Hi ${student.name}! Gentle reminder: payment of ${fmt(due)} is pending for ${batch?.name||'your course'}. Please pay when convenient.\n— Kajol Ma'am 💄`)}`}
                target="_blank" rel="noopener noreferrer" style={{textDecoration:'none',display:'inline-flex',alignItems:'center',gap:5,fontSize:12,color:'#25D366',marginBottom:8}}>
                <Ic n="whatsapp" size={13} color="#25D366"/> Send Payment Reminder
              </a>
            )}
            <Row gap={7}>
              <Btn small outline onClick={()=>{setForm({...p});setModal('edit_'+p.id)}}>✏️</Btn>
              <Btn small color={C.red} onClick={()=>setDelTarget(p)}>🗑️</Btn>
            </Row>
            {modal==='edit_'+p.id&&(
              <Modal onClose={()=>setModal(null)} title={<><Ic n="edit" color={C.pink}/> Edit Payment</>}>
                <Inp label="Amount (₹)" value={form.amount} onChange={v=>setForm(x=>({...x,amount:v}))} type="number"/>
                <Inp label="Paid (₹)" value={form.paid} onChange={v=>setForm(x=>({...x,paid:v}))} type="number"/>
                <Inp label="Type" value={form.type} onChange={v=>setForm(x=>({...x,type:v}))} opts={['Full','Partial']}/>
                <Inp label="Date" value={form.date} onChange={v=>setForm(x=>({...x,date:v}))} type="date"/>
                <Inp label="Note" value={form.note} onChange={v=>setForm(x=>({...x,note:v}))}/>
                <Row gap={8}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn onClick={savePayment} full disabled={saving}>{saving?'…':'Save'}</Btn></Row>
              </Modal>
            )}
          </Card>
        )
      })}
      {filtered.length===0&&<div style={{textAlign:'center',color:C.grey,padding:32}}>No payments found.</div>}

      {modal==='add'&&(
        <Modal onClose={()=>setModal(null)} title={<><Ic n="payments" color={C.pink}/> Add Payment</>}>
          <Inp label="Student *" value={form.student_id} onChange={v=>setForm(x=>({...x,student_id:v}))} opts={data.students.map(s=>({v:s.id,l:s.name}))}/>
          <Inp label="Batch" value={form.batch_id} onChange={v=>setForm(x=>({...x,batch_id:v}))} opts={data.batches.map(b=>({v:b.id,l:b.name}))}/>
          <Inp label="Total Fee (₹) *" value={form.amount} onChange={v=>setForm(x=>({...x,amount:v}))} type="number"/>
          <Inp label="Amount Paid (₹) *" value={form.paid} onChange={v=>setForm(x=>({...x,paid:v}))} type="number"/>
          <Inp label="Type" value={form.type||'Full'} onChange={v=>setForm(x=>({...x,type:v}))} opts={['Full','Partial']}/>
          <Inp label="Date" value={form.date||today()} onChange={v=>setForm(x=>({...x,date:v}))} type="date"/>
          <Inp label="Note" value={form.note} onChange={v=>setForm(x=>({...x,note:v}))}/>
          <Row gap={8}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn color={C.green} onClick={savePayment} full disabled={saving}>{saving?'…':'Save'}</Btn></Row>
        </Modal>
      )}
      {delTarget&&<DelConfirm item="this payment" onConfirm={async()=>{await dbDelete('payments',delTarget.id);setData(d=>({...d,payments:d.payments.filter(p=>p.id!==delTarget.id)}));toast('Deleted.')}} onClose={()=>setDelTarget(null)}/>}
    </div>
  )
}

// ─── ORDERS TAB ───────────────────────────────────────────────────
function OrdersTab({ data, setData, toast }) {
  const [modal, setModal] = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [form, setForm] = useState({})
  const [expForm, setExpForm] = useState({desc:'',amt:''})
  const [saving, setSaving] = useState(false)

  const saveOrder = async () => {
    if(!form.client||!form.amount) return alert('Client name and charge required.')
    setSaving(true)
    const row = { id:form.id||uid(), type:form.type||'Mehndi', client:form.client, mobile:form.mobile||'',
      date:form.date||today(), amount:Number(form.amount), paid:Number(form.paid||0),
      status:form.status||'Pending', notes:form.notes||'', order_expenses:form.order_expenses||[] }
    await dbUpsert('orders', row)
    setData(d=>({...d, orders: form.id ? d.orders.map(o=>o.id===form.id?{...o,...row}:o) : [...d.orders, row]}))
    setSaving(false); setModal(null); toast('Order saved!')
  }

  const typeColor = t=>t==='Mehndi'?C.green:t==='Makeup'?C.pink:t==='ArtWork'?C.purple:C.teal

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:9,marginBottom:14}}>
        <StatBox label="Revenue" value={fmt(data.orders.reduce((s,o)=>s+Number(o.paid),0))} color={C.green} icon="rupee"/>
        <StatBox label="Expenses" value={fmt(data.orders.reduce((s,o)=>s+(o.order_expenses||[]).reduce((a,e)=>a+Number(e.amt),0),0))} color={C.amber} icon="finance"/>
        <StatBox label="Pending" value={`${data.orders.filter(o=>o.status==='Pending').length}`} color={C.red} icon="orders"/>
      </div>
      <Row style={{justifyContent:'space-between',marginBottom:12}}>
        <SectionTitle><Ic n="orders" size={15} color={C.teal}/> Individual Orders</SectionTitle>
        <Btn small onClick={()=>{setForm({type:'Mehndi',client:'',mobile:'',date:today(),amount:'',paid:'',status:'Pending',notes:'',order_expenses:[]});setExpForm({desc:'',amt:''});setModal('add')}}>
          <Ic n="add" size={14} color={C.white}/>New Order
        </Btn>
      </Row>
      {data.orders.map(o=>{
        const due=Number(o.amount)-Number(o.paid)
        const oExp=(o.order_expenses||[]).reduce((a,e)=>a+Number(e.amt),0)
        return (
          <Card key={o.id} accent={typeColor(o.type)}>
            <Row style={{justifyContent:'space-between',marginBottom:6}}>
              <div>
                <div style={{fontWeight:700,fontSize:14}}>{o.client}</div>
                <div style={{fontSize:12,color:C.grey}}>📱 {o.mobile} · 📅 {fmtDate(o.date)}</div>
                {o.notes&&<div style={{fontSize:11,color:C.grey}}>{o.notes}</div>}
              </div>
              <div style={{textAlign:'right'}}>
                <Badge color={typeColor(o.type)}>{o.type}</Badge>
                <div style={{marginTop:4}}><Badge color={o.status==='Completed'?C.green:o.status==='Cancelled'?C.red:C.amber}>{o.status}</Badge></div>
              </div>
            </Row>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:5,marginBottom:8}}>
              {[['Charge',fmt(o.amount),C.dark],[due>0?'Due':'Paid',due>0?fmt(due):fmt(o.paid),due>0?C.amber:C.green],['Expenses',fmt(oExp),C.red],['Profit',fmt(Number(o.paid)-oExp),(Number(o.paid)-oExp)>=0?C.green:C.red]].map(([l,v,c])=>(
                <div key={l} style={{background:C.greyL,borderRadius:8,padding:'5px 6px',textAlign:'center'}}>
                  <div style={{fontSize:9,color:C.grey}}>{l}</div>
                  <div style={{fontSize:12,fontWeight:700,color:c}}>{v}</div>
                </div>
              ))}
            </div>
            {(o.order_expenses||[]).length>0&&(
              <div style={{background:'#FFF3E0',borderRadius:8,padding:'7px 10px',marginBottom:8}}>
                {(o.order_expenses||[]).map((e,i)=><div key={i} style={{fontSize:11,display:'flex',justifyContent:'space-between'}}><span>{e.desc}</span><span style={{fontWeight:700}}>₹{e.amt}</span></div>)}
              </div>
            )}
            <Row gap={7} style={{flexWrap:'wrap'}}>
              <Btn small outline onClick={()=>{setForm({...o,order_expenses:[...(o.order_expenses||[])]});setExpForm({desc:'',amt:''});setModal('edit_'+o.id)}}>✏️ Edit</Btn>
              <select value={o.status} onChange={async e=>{const updated={...o,status:e.target.value};await dbUpsert('orders',updated);setData(d=>({...d,orders:d.orders.map(x=>x.id===o.id?updated:x)}));toast('Status updated.')}} style={{fontSize:11,borderRadius:8,border:`1.5px solid ${C.pinkPale}`,padding:'5px 8px',fontFamily:'inherit',cursor:'pointer',color:C.dark}}>
                {['Pending','In Progress','Completed','Cancelled'].map(s=><option key={s}>{s}</option>)}
              </select>
              {o.mobile&&due>0&&<a href={`https://wa.me/91${o.mobile}?text=${encodeURIComponent(`Hi ${o.client}! Gentle reminder: payment of ${fmt(due)} is pending for your ${o.type} booking.\n— Kajol Makeover Studioz 💄`)}`} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}><Btn small color="#25D366"><Ic n="whatsapp" size={12} color={C.white}/>Remind</Btn></a>}
              <Btn small color={C.red} onClick={()=>setDelTarget(o)}>🗑️</Btn>
            </Row>
            {(modal==='edit_'+o.id)&&(
              <Modal onClose={()=>setModal(null)} title={<><Ic n="edit" color={C.pink}/> Edit Order</>}>
                <Inp label="Client Name" value={form.client} onChange={v=>setForm(x=>({...x,client:v}))}/>
                <Inp label="Mobile" value={form.mobile} onChange={v=>setForm(x=>({...x,mobile:v}))}/>
                <Inp label="Type" value={form.type} onChange={v=>setForm(x=>({...x,type:v}))} opts={ORDER_TYPES}/>
                <Inp label="Date" value={form.date} onChange={v=>setForm(x=>({...x,date:v}))} type="date"/>
                <Inp label="Charge (₹)" value={form.amount} onChange={v=>setForm(x=>({...x,amount:v}))} type="number"/>
                <Inp label="Paid (₹)" value={form.paid} onChange={v=>setForm(x=>({...x,paid:v}))} type="number"/>
                <Inp label="Status" value={form.status} onChange={v=>setForm(x=>({...x,status:v}))} opts={['Pending','In Progress','Completed','Cancelled']}/>
                <Inp label="Notes" value={form.notes} onChange={v=>setForm(x=>({...x,notes:v}))}/>
                <ExpenseList form={form} setForm={setForm} expForm={expForm} setExpForm={setExpForm}/>
                <Row gap={8}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn onClick={saveOrder} full disabled={saving}>{saving?'…':'Save'}</Btn></Row>
              </Modal>
            )}
          </Card>
        )
      })}
      {data.orders.length===0&&<div style={{textAlign:'center',color:C.grey,padding:32}}>No individual orders yet.</div>}

      {modal==='add'&&(
        <Modal onClose={()=>setModal(null)} title={<><Ic n="orders" color={C.teal}/> New Order</>}>
          <Inp label="Client Name *" value={form.client} onChange={v=>setForm(x=>({...x,client:v}))}/>
          <Inp label="Mobile" value={form.mobile} onChange={v=>setForm(x=>({...x,mobile:v}))}/>
          <Inp label="Type" value={form.type||'Mehndi'} onChange={v=>setForm(x=>({...x,type:v}))} opts={ORDER_TYPES}/>
          <Inp label="Date" value={form.date||today()} onChange={v=>setForm(x=>({...x,date:v}))} type="date"/>
          <Inp label="Charge (₹) *" value={form.amount} onChange={v=>setForm(x=>({...x,amount:v}))} type="number"/>
          <Inp label="Amount Paid (₹)" value={form.paid} onChange={v=>setForm(x=>({...x,paid:v}))} type="number"/>
          <Inp label="Notes" value={form.notes} onChange={v=>setForm(x=>({...x,notes:v}))}/>
          <ExpenseList form={form} setForm={setForm} expForm={expForm} setExpForm={setExpForm}/>
          <Row gap={8}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn color={C.teal} onClick={saveOrder} full disabled={saving}>{saving?'…':'Add Order'}</Btn></Row>
        </Modal>
      )}
      {delTarget&&<DelConfirm item={`order for ${delTarget.client}`} onConfirm={async()=>{await dbDelete('orders',delTarget.id);setData(d=>({...d,orders:d.orders.filter(o=>o.id!==delTarget.id)}));toast('Deleted.')}} onClose={()=>setDelTarget(null)}/>}
    </div>
  )
}

function ExpenseList({ form, setForm, expForm, setExpForm }) {
  return (
    <>
      <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Order Expenses</div>
      {(form.order_expenses||[]).map((e,i)=>(
        <Row key={i} gap={6} style={{marginBottom:5}}>
          <div style={{fontSize:12,flex:1,background:C.greyL,borderRadius:8,padding:'5px 8px'}}>{e.desc} — ₹{e.amt}</div>
          <Btn small color={C.red} onClick={()=>setForm(x=>({...x,order_expenses:x.order_expenses.filter((_,j)=>j!==i)}))}>×</Btn>
        </Row>
      ))}
      <Row gap={6} style={{marginBottom:12}}>
        <input value={expForm.desc} onChange={e=>setExpForm(x=>({...x,desc:e.target.value}))} placeholder="e.g. Mehndi cones" style={{flex:2,padding:'7px 10px',borderRadius:8,border:`1.5px solid ${C.pinkPale}`,fontSize:12,fontFamily:'inherit',outline:'none'}}/>
        <input value={expForm.amt} onChange={e=>setExpForm(x=>({...x,amt:e.target.value}))} placeholder="₹" type="number" style={{flex:1,padding:'7px 10px',borderRadius:8,border:`1.5px solid ${C.pinkPale}`,fontSize:12,fontFamily:'inherit',outline:'none'}}/>
        <Btn small onClick={()=>{if(expForm.desc&&expForm.amt){setForm(x=>({...x,order_expenses:[...(x.order_expenses||[]),{...expForm}]}));setExpForm({desc:'',amt:''})}}}>
          <Ic n="add" size={13} color={C.white}/>
        </Btn>
      </Row>
    </>
  )
}

// ─── FINANCE TAB ──────────────────────────────────────────────────
function FinanceTab({ data, setData, toast }) {
  const [modal, setModal] = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [form, setForm]   = useState({})
  const [saving, setSaving] = useState(false)

  const saveExpense = async () => {
    if(!form.amount) return alert('Amount required.')
    setSaving(true)
    const row = { id:form.id||uid(), category:form.category||'Advertising', amount:Number(form.amount),
      date:form.date||today(), note:form.note||'', linked_to:form.linked_to||'general' }
    await dbUpsert('expenses', row)
    setData(d=>({...d, expenses: form.id ? d.expenses.map(e=>e.id===form.id?{...e,...row}:e) : [...d.expenses, row]}))
    setSaving(false); setModal(null); toast('Expense saved!')
  }

  const totalIncome = data.payments.reduce((s,p)=>s+Number(p.paid),0)+data.orders.reduce((s,o)=>s+Number(o.paid),0)
  const totalExp = data.expenses.reduce((s,e)=>s+Number(e.amount),0)+data.orders.reduce((s,o)=>s+(o.order_expenses||[]).reduce((a,e)=>a+Number(e.amt),0),0)

  // Batch-wise income bars
  const batchIncome = data.batches.map(b=>({name:b.name.slice(0,14), income:data.payments.filter(p=>p.batch_id===b.id).reduce((s,p)=>s+Number(p.paid),0)}))

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:14}}>
        {[['Income',fmt(totalIncome),C.green],['Expenses',fmt(totalExp),C.red],['Profit',fmt(totalIncome-totalExp),(totalIncome-totalExp)>=0?C.pink:C.red]].map(([l,v,c])=>(
          <div key={l} style={{background:C.white,borderRadius:14,padding:12,boxShadow:'0 2px 10px rgba(0,0,0,0.06)',border:`1px solid ${C.pinkPale}`,textAlign:'center'}}>
            <div style={{fontSize:10,color:C.grey,fontWeight:700,textTransform:'uppercase'}}>{l}</div>
            <div style={{fontSize:14,fontWeight:800,color:c,marginTop:4}}>{v}</div>
          </div>
        ))}
      </div>

      <Card>
        <SectionTitle><Ic n="finance" size={15} color={C.pink}/> Income by Batch</SectionTitle>
        {batchIncome.map(b=>(
          <div key={b.name} style={{marginBottom:10}}>
            <Row style={{justifyContent:'space-between',marginBottom:4}}>
              <span style={{fontSize:12,fontWeight:600}}>{b.name}</span>
              <span style={{fontSize:12,fontWeight:700,color:C.green}}>{fmt(b.income)}</span>
            </Row>
            <div style={{background:C.pinkPale,borderRadius:10,height:8,overflow:'hidden'}}>
              <div style={{background:`linear-gradient(90deg,${C.pink},${C.green})`,height:'100%',borderRadius:10,
                width:totalIncome>0?`${(b.income/totalIncome)*100}%`:'0%',transition:'width .5s'}}/>
            </div>
          </div>
        ))}
      </Card>

      <Row style={{justifyContent:'space-between',marginBottom:12}}>
        <SectionTitle><Ic n="expenses" size={15} color={C.amber}/> General Expenses</SectionTitle>
        <Btn small onClick={()=>{setForm({category:'Advertising',amount:'',date:today(),note:'',linked_to:'general'});setModal('add')}}>
          <Ic n="add" size={14} color={C.white}/>Add
        </Btn>
      </Row>
      {data.expenses.map(e=>(
        <Card key={e.id} accent={C.amber}>
          <Row style={{justifyContent:'space-between'}}>
            <div>
              <div style={{fontWeight:700,fontSize:13}}>{e.category}</div>
              <div style={{fontSize:12,color:C.grey}}>{e.note}</div>
              <div style={{fontSize:11,color:C.grey}}>📅 {e.date}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:18,fontWeight:800,color:C.amber}}>{fmt(e.amount)}</div>
              <Row gap={5} style={{marginTop:6,justifyContent:'flex-end'}}>
                <Btn small outline onClick={()=>{setForm({...e});setModal('edit_'+e.id)}}>✏️</Btn>
                <Btn small color={C.red} onClick={()=>setDelTarget(e)}>🗑️</Btn>
              </Row>
            </div>
          </Row>
          {modal==='edit_'+e.id&&(
            <Modal onClose={()=>setModal(null)} title={<><Ic n="edit" color={C.pink}/> Edit Expense</>}>
              <Inp label="Category" value={form.category} onChange={v=>setForm(x=>({...x,category:v}))} opts={EXP_CATS}/>
              <Inp label="Amount (₹)" value={form.amount} onChange={v=>setForm(x=>({...x,amount:v}))} type="number"/>
              <Inp label="Date" value={form.date} onChange={v=>setForm(x=>({...x,date:v}))} type="date"/>
              <Inp label="Note" value={form.note} onChange={v=>setForm(x=>({...x,note:v}))}/>
              <Inp label="Linked To" value={form.linked_to||'general'} onChange={v=>setForm(x=>({...x,linked_to:v}))} opts={[{v:'general',l:'General'},...data.batches.map(b=>({v:b.id,l:b.name}))]}/>
              <Row gap={8}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn onClick={saveExpense} full disabled={saving}>{saving?'…':'Save'}</Btn></Row>
            </Modal>
          )}
        </Card>
      ))}

      {modal==='add'&&(
        <Modal onClose={()=>setModal(null)} title={<><Ic n="expenses" color={C.amber}/> Add Expense</>}>
          <Inp label="Category" value={form.category||'Advertising'} onChange={v=>setForm(x=>({...x,category:v}))} opts={EXP_CATS}/>
          <Inp label="Amount (₹) *" value={form.amount} onChange={v=>setForm(x=>({...x,amount:v}))} type="number"/>
          <Inp label="Date" value={form.date||today()} onChange={v=>setForm(x=>({...x,date:v}))} type="date"/>
          <Inp label="Description" value={form.note} onChange={v=>setForm(x=>({...x,note:v}))}/>
          <Inp label="Linked To" value={form.linked_to||'general'} onChange={v=>setForm(x=>({...x,linked_to:v}))} opts={[{v:'general',l:'General'},...data.batches.map(b=>({v:b.id,l:b.name}))]}/>
          <Row gap={8}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn color={C.amber} onClick={saveExpense} full disabled={saving}>{saving?'…':'Save'}</Btn></Row>
        </Modal>
      )}
      {delTarget&&<DelConfirm item={`${delTarget.category} expense`} onConfirm={async()=>{await dbDelete('expenses',delTarget.id);setData(d=>({...d,expenses:d.expenses.filter(e=>e.id!==delTarget.id)}));toast('Deleted.')}} onClose={()=>setDelTarget(null)}/>}
    </div>
  )
}

// ─── REPORTS TAB ──────────────────────────────────────────────────
function ReportsTab({ data }) {
  const [type, setType] = useState('overall')

  const classFees  = data.payments.reduce((s,p)=>s+Number(p.paid),0)
  const orderRev   = data.orders.reduce((s,o)=>s+Number(o.paid),0)
  const totalIncome = classFees+orderRev
  const generalExp = data.expenses.reduce((s,e)=>s+Number(e.amount),0)
  const orderExp   = data.orders.reduce((s,o)=>s+(o.order_expenses||[]).reduce((a,e)=>a+Number(e.amt),0),0)
  const totalExp   = generalExp+orderExp
  const pendingDues = data.payments.reduce((s,p)=>s+(Number(p.amount)-Number(p.paid)),0)+data.orders.reduce((s,o)=>s+(Number(o.amount)-Number(o.paid)),0)

  const months = useMemo(()=>{
    const map={}
    data.payments.forEach(p=>{if(p.date){const m=monthKey(p.date);if(!map[m])map[m]={income:0,orders:0,expenses:0,oExp:0};map[m].income+=Number(p.paid)}})
    data.orders.forEach(o=>{if(o.date){const m=monthKey(o.date);if(!map[m])map[m]={income:0,orders:0,expenses:0,oExp:0};map[m].orders+=Number(o.paid);map[m].oExp+=(o.order_expenses||[]).reduce((a,e)=>a+Number(e.amt),0)}})
    data.expenses.forEach(e=>{if(e.date){const m=monthKey(e.date);if(!map[m])map[m]={income:0,orders:0,expenses:0,oExp:0};map[m].expenses+=Number(e.amount)}})
    return Object.entries(map).sort((a,b)=>b[0].localeCompare(a[0]))
  },[data])

  const TYPES = [{v:'overall',l:'Summary'},{v:'monthly',l:'Monthly'},{v:'batch',l:'Batch-wise'},{v:'student',l:'Student'},{v:'orders',l:'Orders'}]

  return (
    <div>
      <div style={{display:'flex',gap:6,overflowX:'auto',marginBottom:14,paddingBottom:4}}>
        {TYPES.map(t=>(
          <div key={t.v} onClick={()=>setType(t.v)} style={{flexShrink:0,padding:'7px 14px',borderRadius:20,
            background:type===t.v?C.pink:C.greyL, color:type===t.v?C.white:C.grey,
            fontSize:12,fontWeight:type===t.v?700:500,cursor:'pointer',transition:'all .15s'}}>
            {t.l}
          </div>
        ))}
      </div>

      {type==='overall'&&(
        <>
          <Card accent={C.pink}>
            <SectionTitle><Ic n="rupee" size={15} color={C.pink}/> Financial Summary</SectionTitle>
            {[['Class Fees Income',fmt(classFees),C.green],['Orders Income',fmt(orderRev),C.teal],
              ['Total Income',fmt(totalIncome),C.green],['General Expenses',fmt(generalExp),C.red],
              ['Order Expenses',fmt(orderExp),C.amber],['Total Expenses',fmt(totalExp),C.red],
              ['NET PROFIT',fmt(totalIncome-totalExp),(totalIncome-totalExp)>=0?C.green:C.red],
              ['Pending Dues',fmt(pendingDues),C.amber]].map(([l,v,c])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'5px 0',
                borderBottom:`1px solid ${C.pinkPale}`,fontWeight:l.includes('NET')||l.includes('Total')?700:400}}>
                <span style={{color:l.includes('NET')?C.pink:C.grey}}>{l}</span>
                <span style={{fontWeight:700,color:c}}>{v}</span>
              </div>
            ))}
          </Card>
          <Card>
            <SectionTitle><Ic n="star" size={15} color={C.blue}/> Studio Stats</SectionTitle>
            {[['Total Students',data.students.length],['Total Batches',data.batches.length],
              ['Active Batches',data.batches.filter(b=>b.status==='Active').length],
              ['Total Classes',data.classes.length],
              ['YT Uploaded',data.classes.filter(c=>c.youtube_status==='Uploaded').length],
              ['YT Pending',data.classes.filter(c=>c.youtube_status!=='Uploaded').length],
              ['Total Orders',data.orders.length],
              ['HW Compliance',`${data.homeworkCompliance.filter(h=>h.submitted).length}/${data.homeworkCompliance.length}`]
            ].map(([l,v])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'5px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
                <span style={{color:C.grey}}>{l}</span><span style={{fontWeight:700,color:C.dark}}>{v}</span>
              </div>
            ))}
          </Card>
        </>
      )}

      {type==='monthly'&&(
        <div>
          <SectionTitle><Ic n="calendar" size={15} color={C.pink}/> Monthly Report</SectionTitle>
          {months.map(([m,v])=>(
            <Card key={m} accent={C.pink}>
              <div style={{fontWeight:700,fontSize:15,marginBottom:10}}>{monthLabel(m)}</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                {[['Class Fees',fmt(v.income),C.green],['Order Income',fmt(v.orders),C.teal],['Expenses',fmt(v.expenses),C.red],['Order Exp.',fmt(v.oExp),C.amber]].map(([l,val,c])=>(
                  <div key={l} style={{background:c+'10',borderRadius:10,padding:'8px 10px'}}>
                    <div style={{fontSize:10,color:c,fontWeight:700}}>{l}</div>
                    <div style={{fontSize:15,fontWeight:800,color:c}}>{val}</div>
                  </div>
                ))}
              </div>
              <div style={{background:C.pinkPale,borderRadius:10,padding:'8px 10px',display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:13,fontWeight:700}}>Net Profit</span>
                <span style={{fontSize:15,fontWeight:800,color:(v.income+v.orders-v.expenses-v.oExp)>=0?C.green:C.red}}>{fmt(v.income+v.orders-v.expenses-v.oExp)}</span>
              </div>
            </Card>
          ))}
          {months.length===0&&<div style={{textAlign:'center',color:C.grey,padding:32}}>No data yet.</div>}
        </div>
      )}

      {type==='batch'&&(
        <div>
          <SectionTitle><Ic n="batch" size={15} color={C.blue}/> Batch-wise Report</SectionTitle>
          {data.batches.map(b=>{
            const income=data.payments.filter(p=>p.batch_id===b.id).reduce((s,p)=>s+Number(p.paid),0)
            const due=data.payments.filter(p=>p.batch_id===b.id).reduce((s,p)=>s+(Number(p.amount)-Number(p.paid)),0)
            const exp=data.expenses.filter(e=>e.linked_to===b.id).reduce((s,e)=>s+Number(e.amount),0)
            const classes=data.classes.filter(c=>c.batch_id===b.id).length
            const ytDone=data.classes.filter(c=>c.batch_id===b.id&&c.youtube_status==='Uploaded').length
            const course=data.courses.find(c=>c.id===b.course_id)
            return (
              <Card key={b.id} accent={course?.color||C.pink}>
                <Row style={{justifyContent:'space-between',marginBottom:8}}>
                  <div style={{fontWeight:700,fontSize:14}}>{b.name}</div>
                  <Badge color={b.status==='Active'?C.green:C.grey}>{b.status}</Badge>
                </Row>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:8}}>
                  {[['Students',b.student_ids?.length||0,C.purple],['Classes',classes,C.blue],['YT Done',ytDone,'#FF0000']].map(([l,v,c])=>(
                    <div key={l} style={{background:c+'10',borderRadius:8,padding:'6px 8px',textAlign:'center'}}>
                      <div style={{fontSize:18,fontWeight:800,color:c}}>{v}</div>
                      <div style={{fontSize:9,color:C.grey}}>{l}</div>
                    </div>
                  ))}
                </div>
                {[['Income',fmt(income),C.green],['Pending Dues',fmt(due),C.amber],['Expenses',fmt(exp),C.red],['Net',fmt(income-exp),income-exp>=0?C.green:C.red]].map(([l,v,c])=>(
                  <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'4px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
                    <span style={{color:C.grey}}>{l}</span><span style={{fontWeight:700,color:c}}>{v}</span>
                  </div>
                ))}
              </Card>
            )
          })}
        </div>
      )}

      {type==='student'&&(
        <div>
          <SectionTitle><Ic n="students" size={15} color={C.purple}/> Student-wise Report</SectionTitle>
          {data.students.map(s=>{
            const paid=data.payments.filter(p=>p.student_id===s.id).reduce((a,p)=>a+Number(p.paid),0)
            const due=data.payments.filter(p=>p.student_id===s.id).reduce((a,p)=>a+(Number(p.amount)-Number(p.paid)),0)
            const batches=data.batches.filter(b=>(b.student_ids||[]).includes(s.id))
            const att=data.classes.reduce((a,c)=>{if(batches.find(b=>b.id===c.batch_id)&&(c.attendees||[]).includes(s.id))return a+1;return a},0)
            const tc=data.classes.filter(c=>batches.find(b=>b.id===c.batch_id)).length
            const hwS=data.homeworkCompliance.filter(h=>h.student_id===s.id&&h.submitted).length
            const hwT=data.homeworkCompliance.filter(h=>h.student_id===s.id).length
            return (
              <Card key={s.id}>
                <Row gap={10} style={{marginBottom:8}}>
                  <div style={{width:38,height:38,borderRadius:'50%',background:`linear-gradient(135deg,${C.pink},${C.pinkD})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:16,flexShrink:0}}>{(s.name||'?')[0]}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14}}>{s.name}</div>
                    <div style={{fontSize:11,color:C.grey}}>📱 {s.mobile} · {batches.length} batch{batches.length!==1?'es':''}</div>
                  </div>
                </Row>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                  {[['Total Paid',fmt(paid),C.green],['Due',fmt(due),C.amber],['Attendance',`${att}/${tc}`,C.blue],['HW Done',`${hwS}/${hwT}`,C.teal]].map(([l,v,c])=>(
                    <div key={l} style={{background:c+'10',borderRadius:8,padding:'6px 10px'}}>
                      <div style={{fontSize:10,color:c,fontWeight:700}}>{l}</div>
                      <div style={{fontSize:14,fontWeight:800,color:c}}>{v}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {type==='orders'&&(
        <div>
          <SectionTitle><Ic n="orders" size={15} color={C.teal}/> Orders Report</SectionTitle>
          {['Mehndi','Makeup','ArtWork','Combined'].map(otype=>{
            const os=data.orders.filter(o=>o.type===otype)
            if(!os.length) return null
            const rev=os.reduce((s,o)=>s+Number(o.paid),0)
            const exp=os.reduce((s,o)=>s+(o.order_expenses||[]).reduce((a,e)=>a+Number(e.amt),0),0)
            return (
              <Card key={otype} accent={otype==='Mehndi'?C.green:otype==='Makeup'?C.pink:C.purple}>
                <div style={{fontWeight:700,fontSize:15,marginBottom:10}}>{otype} ({os.length})</div>
                {[['Revenue',fmt(rev),C.green],['Expenses',fmt(exp),C.red],['Profit',fmt(rev-exp),rev-exp>=0?C.green:C.red]].map(([l,v,c])=>(
                  <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'4px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
                    <span style={{color:C.grey}}>{l}</span><span style={{fontWeight:700,color:c}}>{v}</span>
                  </div>
                ))}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── NAVIGATION CONFIG ────────────────────────────────────────────
const TABS = [
  {id:'home',     label:'Home',      icon:'home'},
  {id:'students', label:'Students',  icon:'students'},
  {id:'courses',  label:'Courses',   icon:'course'},
  {id:'batches',  label:'Batches',   icon:'batch'},
  {id:'payments', label:'Payments',  icon:'payments'},
  {id:'orders',   label:'Orders',    icon:'orders'},
  {id:'finance',  label:'Finance',   icon:'finance'},
  {id:'reports',  label:'Reports',   icon:'reports'},
  {id:'broadcast',label:'Broadcast', icon:'broadcast'},
  {id:'settings', label:'Settings',  icon:'settings'},
]

const HEADER_TITLES = {
  home:'Dashboard', students:'Students', courses:'Courses & Syllabus',
  batches:'Batches & Classes', payments:'Payments', orders:'Individual Orders',
  finance:'Finance & Expenses', reports:'Reports', broadcast:'Broadcast Messaging',
  settings:'Settings & Admin'
}

// ─── ROOT APP ─────────────────────────────────────────────────────
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [tab, setTab]           = useState('home')
  const [data, setData]         = useState({students:[],courses:[],batches:[],classes:[],homeworkCompliance:[],payments:[],orders:[],expenses:[],reminders:[]})
  const [loading, setLoading]   = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const toast = (msg) => {
    setToastMsg(msg)
    setTimeout(()=>setToastMsg(''), 3000)
  }

  // Load from Supabase on login
  const handleLogin = async () => {
    setLoggedIn(true)
    setLoading(true)
    try {
      const { loadAllData } = await import('./lib/supabase.js')
      const loaded = await loadAllData()
      setData(loaded)
    } catch(e) {
      console.error('Load error:', e)
      toast('⚠️ Could not load cloud data. Check Supabase setup.')
    }
    setLoading(false)
  }

  if (!loggedIn) return <Login onLogin={handleLogin}/>

  const bottomTabs = TABS.slice(0, 7) // first 7 for bottom nav on mobile

  return (
    <div className="app-shell">
      {/* DESKTOP SIDEBAR */}
      <aside className="sidebar" style={{background:C.white,borderRight:`1px solid ${C.pinkPale}`,
        flexDirection:'column',position:'fixed',top:0,left:0,bottom:0,zIndex:200,
        boxShadow:'2px 0 20px rgba(233,30,140,0.08)'}}>
        {/* Sidebar header */}
        <div style={{background:`linear-gradient(135deg,${C.pink},${C.pinkD})`,padding:'20px 16px'}}>
          <div style={{fontSize:28,marginBottom:8}}>💄</div>
          <div style={{fontSize:13,fontWeight:900,color:'#fff',lineHeight:1.3}}>Kajol Makeover Studioz</div>
          <div style={{fontSize:10,color:'rgba(255,255,255,0.8)',marginTop:3}}>Admin Panel</div>
        </div>
        {/* Sidebar nav */}
        <nav style={{flex:1,overflowY:'auto',padding:'8px 0'}}>
          {TABS.map(t=>(
            <div key={t.id} onClick={()=>setTab(t.id)} style={{display:'flex',alignItems:'center',
              gap:12,padding:'11px 16px',cursor:'pointer',transition:'all .15s',
              background:tab===t.id?C.pinkPale:'transparent',
              borderLeft:tab===t.id?`3px solid ${C.pink}`:'3px solid transparent',
              color:tab===t.id?C.pink:C.grey,fontWeight:tab===t.id?700:500,fontSize:13}}>
              <Ic n={t.icon} size={17} color={tab===t.id?C.pink:C.grey}/>
              {t.label}
            </div>
          ))}
        </nav>
        <div style={{padding:'12px 16px',borderTop:`1px solid ${C.pinkPale}`}}>
          <button onClick={()=>setLoggedIn(false)} style={{width:'100%',padding:'9px',borderRadius:10,
            background:C.pinkPale,border:'none',color:C.pink,fontWeight:700,cursor:'pointer',fontSize:12,
            display:'flex',alignItems:'center',gap:8,justifyContent:'center',fontFamily:'inherit'}}>
            <Ic n="lock" size={14} color={C.pink}/>Logout
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div style={{flex:1,marginLeft:0,display:'flex',flexDirection:'column',minHeight:'100vh'}}>
        {/* Header */}
        <header className="app-header" style={{background:`linear-gradient(135deg,${C.pink},${C.pinkD})`,
          color:'#fff',padding:'12px 16px',display:'flex',alignItems:'center',
          justifyContent:'space-between',position:'sticky',top:0,zIndex:100,
          boxShadow:'0 4px 20px rgba(233,30,140,0.4)'}}>
          <div>
            <div style={{fontSize:16,fontWeight:800,letterSpacing:.3}}>💄 {HEADER_TITLES[tab]}</div>
            <div style={{fontSize:10,opacity:.85}}>Kajol Makeover Studioz</div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <div style={{width:34,height:34,borderRadius:'50%',background:'rgba(255,255,255,0.2)',
              border:'2px solid rgba(255,255,255,0.4)',display:'flex',alignItems:'center',
              justifyContent:'center',fontWeight:900,fontSize:15}}>K</div>
            <button onClick={()=>setLoggedIn(false)} className="bottom-nav"
              style={{background:'rgba(255,255,255,0.2)',border:'none',color:'#fff',
              borderRadius:8,padding:'5px 9px',cursor:'pointer',fontSize:10,fontWeight:700,fontFamily:'inherit'}}>
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="main-content" style={{padding:'14px 14px 90px',flex:1}}>
          <div className="content-wrapper">
            {loading ? <Spinner/> : (
              <>
                {tab==='home'     &&<Dashboard  data={data} setTab={setTab}/>}
                {tab==='students' &&<StudentsTab data={data} setData={setData} toast={toast}/>}
                {tab==='courses'  &&<CoursesTab  data={data} setData={setData} toast={toast}/>}
                {tab==='batches'  &&<BatchesTab  data={data} setData={setData} toast={toast}/>}
                {tab==='payments' &&<PaymentsTab data={data} setData={setData} toast={toast}/>}
                {tab==='orders'   &&<OrdersTab   data={data} setData={setData} toast={toast}/>}
                {tab==='finance'  &&<FinanceTab  data={data} setData={setData} toast={toast}/>}
                {tab==='reports'  &&<ReportsTab  data={data}/>}
                {tab==='broadcast'&&<BroadcastTab data={data}/>}
                {tab==='settings' &&<SettingsTab  data={data} setData={setData} onLogout={()=>setLoggedIn(false)} toast={toast}/>}
              </>
            )}
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="bottom-nav" style={{background:C.white,display:'flex',
        borderTop:`1px solid ${C.pinkPale}`,position:'fixed',bottom:0,left:0,right:0,
        zIndex:100,boxShadow:'0 -4px 20px rgba(233,30,140,0.1)'}}>
        {bottomTabs.map(t=>(
          <div key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,display:'flex',
            flexDirection:'column',alignItems:'center',justifyContent:'center',
            padding:'7px 2px 6px',cursor:'pointer',
            color:tab===t.id?C.pink:C.grey,
            background:tab===t.id?C.pinkPale:'transparent',
            borderTop:tab===t.id?`2px solid ${C.pink}`:'2px solid transparent',
            transition:'all .15s',fontSize:'8px',fontWeight:tab===t.id?800:400,gap:2,minWidth:0}}>
            <Ic n={t.icon} size={17} color={tab===t.id?C.pink:C.grey}/>
            {t.label}
          </div>
        ))}
        {/* More button on mobile */}
        <div onClick={()=>setTab(tab==='settings'?'home':'settings')} style={{flex:1,display:'flex',
          flexDirection:'column',alignItems:'center',justifyContent:'center',
          padding:'7px 2px 6px',cursor:'pointer',
          color:['broadcast','settings'].includes(tab)?C.pink:C.grey,
          background:['broadcast','settings'].includes(tab)?C.pinkPale:'transparent',
          borderTop:['broadcast','settings'].includes(tab)?`2px solid ${C.pink}`:'2px solid transparent',
          transition:'all .15s',fontSize:'8px',fontWeight:400,gap:2,minWidth:0}}>
          <Ic n="settings" size={17} color={['broadcast','settings'].includes(tab)?C.pink:C.grey}/>
          More
        </div>
      </nav>

      <Toast msg={toastMsg}/>
    </div>
  )
}
