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
export default function StudentsTab({data,setData,toast}) {
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
