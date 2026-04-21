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
export default function CoursesTab({data,setData,toast}) {
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
