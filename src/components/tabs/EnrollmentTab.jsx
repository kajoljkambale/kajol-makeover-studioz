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
export default function EnrollmentTab({data,setData,toast}) {
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
