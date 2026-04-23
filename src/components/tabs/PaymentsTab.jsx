import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { C, uid, today, fmt, fmtDate, monthKey, monthLabel, ADMIN_PWD,
         COURSE_TYPES, ORDER_TYPES, SCHEDULE_OPTS, DURATION_OPTS, EXP_CATS,
         Ic, Modal, Inp, Btn, Badge, Card, Row, Divider, SectionTitle, StatBox,
         Toggle, Spinner, DelConfirm } from '../../lib/ui.jsx'
import { supabase as sb, dbUpsert, dbDelete } from '../../lib/supabase.js'
const STitle = SectionTitle

const ENROLL_URL   = (typeof window !== 'undefined' ? window.location.origin : 'https://kajol-makeover-studioz.vercel.app') + '/enroll'
const WA_COMMUNITY = 'https://chat.whatsapp.com/Lhq5qzRYJ0z11onVX669a3'
const INSTAGRAM    = 'https://www.instagram.com/kajol_makeover_studioz?igsh=a3h2ZWIzbmM3M3Y3'
const YOUTUBE      = 'https://youtube.com/@kajolmakeoverstudioz?si=IsWwx4ScqJ33ZAqp'
export default function PaymentsTab({data,setData,toast}) {
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

/* ═══════════════════════════════════════════════════════════════════
   LEADS & ORDERS TAB — merged: individual artist bookings (Pune)
   + commercial orders with expense tracking
   All stored in "orders" table; portfolio_lead flag separates them
═══════════════════════════════════════════════════════════════════ */
