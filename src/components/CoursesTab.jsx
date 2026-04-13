import React, { useState } from 'react'
import { C, uid, Ic, Card, Row, SectionTitle, Badge, Btn, Divider, Modal, Inp, DelConfirm, COURSE_TYPES } from '../lib/ui.jsx'
import { dbUpsert, dbDelete } from '../lib/supabase.js'

const COURSE_COLORS = [C.pink, C.green, C.purple, C.teal, C.blue, C.amber]

export default function CoursesTab({ data, setData, toast }) {
  const [modal, setModal] = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  const openAdd = () => setForm({ name:'', type:'Mehndi', color:C.pink, description:'', syllabus:'', fee:'' })

  const save = async () => {
    if (!form.name) return alert('Course name required.')
    setSaving(true)
    const row = { id: form.id||uid(), name:form.name, type:form.type, color:form.color,
      description:form.description, syllabus:form.syllabus, fee:Number(form.fee||0) }
    await dbUpsert('courses', row)
    setData(d => ({...d, courses: form.id
      ? d.courses.map(c=>c.id===form.id?{...c,...row}:c)
      : [...d.courses, row]
    }))
    setSaving(false); setModal(null)
    toast('Course saved!')
  }

  const del = async (id) => {
    await dbDelete('courses', id)
    setData(d=>({...d, courses:d.courses.filter(c=>c.id!==id)}))
    toast('Course deleted.')
  }

  const shareSyllabus = (c) => {
    const msg = `📚 *${c.name} — Course Syllabus*\n\nType: ${c.type}\nFee: ₹${c.fee||0}\n\n${c.syllabus||'Syllabus coming soon!'}\n\n— Kajol Makeover Studioz 💄\n📸 Instagram: https://www.instagram.com/kajol_makeover_studioz\n▶ YouTube: https://youtube.com/@kajolmakeoverstudioz`
    if (navigator.share) navigator.share({ text: msg })
    else { navigator.clipboard.writeText(msg); toast('Syllabus copied!') }
  }

  return (
    <div>
      <Row style={{justifyContent:'space-between',marginBottom:14}}>
        <SectionTitle><Ic n="course" size={15} color={C.purple}/> Courses & Syllabus</SectionTitle>
        <Btn small onClick={()=>{openAdd();setModal('form')}}>
          <Ic n="add" size={14} color={C.white}/>New Course
        </Btn>
      </Row>

      {data.courses.length===0&&(
        <div style={{textAlign:'center',color:C.grey,padding:40,background:C.white,borderRadius:16}}>
          <div style={{fontSize:36,marginBottom:8}}>📚</div>
          <div style={{fontWeight:700}}>No courses yet</div>
          <div style={{fontSize:13,marginTop:4}}>Create your first course with syllabus</div>
        </div>
      )}

      {data.courses.map(c=>{
        const batchCount = data.batches.filter(b=>b.course_id===c.id).length
        const studentIds = [...new Set(data.batches.filter(b=>b.course_id===c.id).flatMap(b=>b.student_ids||[]))]
        return (
          <Card key={c.id} accent={c.color||C.pink}>
            <Row style={{justifyContent:'space-between',marginBottom:8}}>
              <div>
                <div style={{fontWeight:800,fontSize:15,color:C.dark}}>{c.name}</div>
                <div style={{fontSize:12,color:C.grey}}>{c.description}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <Badge color={c.color||C.pink}>{c.type}</Badge>
                {c.fee>0&&<div style={{fontSize:12,fontWeight:700,color:C.green,marginTop:4}}>₹{c.fee}</div>}
              </div>
            </Row>
            <Row gap={8} style={{marginBottom:10}}>
              <span style={{fontSize:11,background:C.greyL,borderRadius:8,padding:'4px 10px',color:C.grey}}>📦 {batchCount} batches</span>
              <span style={{fontSize:11,background:C.greyL,borderRadius:8,padding:'4px 10px',color:C.grey}}>👥 {studentIds.length} students</span>
            </Row>
            {c.syllabus&&(
              <div style={{background:`${c.color||C.pink}10`,borderRadius:10,padding:'10px 12px',marginBottom:10}}>
                <div style={{fontSize:11,fontWeight:700,color:c.color||C.pink,marginBottom:4}}>📋 SYLLABUS</div>
                <div style={{fontSize:12,color:C.dark,lineHeight:1.7,whiteSpace:'pre-wrap'}}>{c.syllabus}</div>
              </div>
            )}
            {!c.syllabus&&(
              <div style={{background:C.greyL,borderRadius:10,padding:'8px 12px',marginBottom:10,fontSize:12,color:C.grey}}>
                No syllabus added yet. Click Edit to add one.
              </div>
            )}
            <Row gap={7} style={{flexWrap:'wrap'}}>
              <Btn small outline onClick={()=>{setForm({...c,fee:c.fee||''});setModal('form')}}>✏️ Edit</Btn>
              <Btn small color="#25D366" onClick={()=>shareSyllabus(c)}>
                <Ic n="whatsapp" size={12} color={C.white}/>Share Syllabus
              </Btn>
              <Btn small color={C.red} onClick={()=>setDelTarget(c)}>🗑️</Btn>
            </Row>
          </Card>
        )
      })}

      {modal==='form'&&(
        <Modal onClose={()=>setModal(null)} title={<><Ic n="course" color={C.purple}/> {form.id?'Edit':'New'} Course</>}>
          <Inp label="Course Name *" value={form.name} onChange={v=>setForm(x=>({...x,name:v}))}/>
          <Inp label="Type" value={form.type} onChange={v=>setForm(x=>({...x,type:v}))} opts={COURSE_TYPES}/>
          <Inp label="Fee (₹)" value={form.fee} onChange={v=>setForm(x=>({...x,fee:v}))} type="number"/>
          <Inp label="Short Description" value={form.description} onChange={v=>setForm(x=>({...x,description:v}))}/>
          <Inp label="Syllabus (class-by-class details)" value={form.syllabus} onChange={v=>setForm(x=>({...x,syllabus:v}))} rows={8} placeholder={`Day 1: Introduction & Basics\nDay 2: Simple Patterns\nDay 3: Floral Designs\n...`}/>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Course Color</div>
            <Row gap={10}>
              {COURSE_COLORS.map(col=>(
                <div key={col} onClick={()=>setForm(x=>({...x,color:col}))} style={{width:28,height:28,borderRadius:'50%',background:col,cursor:'pointer',
                  border:`3px solid ${form.color===col?C.dark:'transparent'}`,transition:'all .15s'}}/>
              ))}
            </Row>
          </div>
          <Row gap={8}>
            <Btn outline onClick={()=>setModal(null)} full>Cancel</Btn>
            <Btn onClick={save} full disabled={saving}>{saving?'Saving…':'Save Course'}</Btn>
          </Row>
        </Modal>
      )}

      {delTarget&&<DelConfirm item={delTarget.name} onConfirm={()=>del(delTarget.id)} onClose={()=>setDelTarget(null)}/>}
    </div>
  )
}
