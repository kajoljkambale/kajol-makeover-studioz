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
export default function FinanceTab({data,setData,toast}) {
  const [modal,setModal]=useState(null)
  const [del,setDel]=useState(null)
  const [form,setForm]=useState({})
  const [busy,setBusy]=useState(false)
  const [view,setView]=useState('overview')   // overview | expenses | monthly

  const totalIncome = useMemo(()=>
    data.payments.reduce((s,p)=>s+Number(p.paid),0)+
    data.orders.reduce((s,o)=>s+Number(o.paid),0)
  ,[data])

  const totalExpenses = useMemo(()=>
    data.expenses.reduce((s,e)=>s+Number(e.amount),0)+
    data.orders.reduce((s,o)=>s+(o.order_expenses||[]).reduce((a,x)=>a+Number(x.amt),0),0)
  ,[data])

  const netProfit = totalIncome - totalExpenses
  const pendingDues = data.payments.reduce((s,p)=>s+(Number(p.amount)-Number(p.paid)),0)

  /* Month-wise breakdown */
  const monthData = useMemo(()=>{
    const mp={}
    data.payments.forEach(p=>{
      const mk=monthKey(p.date); if(!mk)return
      if(!mp[mk])mp[mk]={income:0,expenses:0,dues:0}
      mp[mk].income+=Number(p.paid)
      mp[mk].dues+=Number(p.amount)-Number(p.paid)
    })
    data.orders.forEach(o=>{
      const mk=monthKey(o.date); if(!mk)return
      if(!mp[mk])mp[mk]={income:0,expenses:0,dues:0}
      mp[mk].income+=Number(o.paid)
      ;(o.order_expenses||[]).forEach(e=>{mp[mk].expenses+=Number(e.amt)})
    })
    data.expenses.forEach(e=>{
      const mk=monthKey(e.date); if(!mk)return
      if(!mp[mk])mp[mk]={income:0,expenses:0,dues:0}
      mp[mk].expenses+=Number(e.amount)
    })
    return Object.entries(mp).sort(([a],[b])=>b.localeCompare(a)).map(([k,v])=>({month:k,label:monthLabel(k),...v,profit:v.income-v.expenses}))
  },[data])

  /* Category-wise expenses */
  const catTotals = useMemo(()=>{
    const m={}
    data.expenses.forEach(e=>{
      const c=e.category||'Other'
      m[c]=(m[c]||0)+Number(e.amount)
    })
    return Object.entries(m).sort(([,a],[,b])=>b-a)
  },[data])

  const saveExpense=async()=>{
    if(!form.amount||!form.category)return alert('Category and amount required.')
    setBusy(true)
    const row={id:form.id||uid(),category:form.category,amount:Number(form.amount),date:form.date||today(),note:form.note||'',linked_to:form.linked_to||'',created_at:form.created_at||new Date().toISOString()}
    await dbUpsert('expenses',row)
    setData(d=>({...d,expenses:form.id?d.expenses.map(e=>e.id===form.id?{...e,...row}:e):[...d.expenses,row]}))
    setBusy(false); setModal(null); toast('Expense saved!')
  }

  return (
    <div>
      {/* Overview stats */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:14}}>
        <StatBox label="Total Income" value={fmt(totalIncome)} color={C.green} icon="rupee"/>
        <StatBox label="Total Expenses" value={fmt(totalExpenses)} color={C.amber} icon="expenses"/>
        <StatBox label="Net Profit" value={fmt(netProfit)} color={netProfit>=0?C.green:C.red} icon="trend"/>
        <StatBox label="Pending Dues" value={fmt(pendingDues)} color={C.amber} icon="alert"/>
      </div>

      {/* View tabs */}
      <div style={{display:'flex',gap:6,marginBottom:14,overflowX:'auto',paddingBottom:2}}>
        {[['overview','📊 Overview'],['expenses','💸 Expenses'],['monthly','📅 Monthly P&L']].map(([v,l])=>(
          <div key={v} onClick={()=>setView(v)} style={{flexShrink:0,padding:'8px 14px',borderRadius:12,background:view===v?C.pink:C.greyL,color:view===v?C.white:C.grey,fontSize:12,fontWeight:view===v?700:500,cursor:'pointer'}}>{l}</div>
        ))}
      </div>

      {view==='overview'&&<>
        <Card accent={C.green}>
          <STitle><Ic n="rupee" size={15} color={C.green}/> Income Breakdown</STitle>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <div style={{background:C.greenPale,borderRadius:10,padding:'10px 12px'}}>
              <div style={{fontSize:10,color:C.green,fontWeight:700,textTransform:'uppercase',letterSpacing:.5}}>Course Fees</div>
              <div style={{fontSize:17,fontWeight:800,color:C.green}}>{fmt(data.payments.reduce((s,p)=>s+Number(p.paid),0))}</div>
            </div>
            <div style={{background:C.greenPale,borderRadius:10,padding:'10px 12px'}}>
              <div style={{fontSize:10,color:C.green,fontWeight:700,textTransform:'uppercase',letterSpacing:.5}}>Order Revenue</div>
              <div style={{fontSize:17,fontWeight:800,color:C.green}}>{fmt(data.orders.reduce((s,o)=>s+Number(o.paid),0))}</div>
            </div>
          </div>
        </Card>

        <Card accent={C.amber}>
          <STitle><Ic n="expenses" size={15} color={C.amber}/> Expense Breakdown by Category</STitle>
          {catTotals.length===0&&<div style={{fontSize:13,color:C.grey,textAlign:'center',padding:16}}>No expenses recorded yet.</div>}
          {catTotals.map(([cat,amt])=>(
            <div key={cat} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
              <div style={{fontSize:13,color:C.dark}}>{cat}</div>
              <div style={{fontSize:13,fontWeight:700,color:C.amber}}>{fmt(amt)}</div>
            </div>
          ))}
          {data.orders.reduce((s,o)=>s+(o.order_expenses||[]).reduce((a,e)=>a+Number(e.amt),0),0)>0&&(
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
              <div style={{fontSize:13,color:C.dark}}>Order Expenses</div>
              <div style={{fontSize:13,fontWeight:700,color:C.amber}}>{fmt(data.orders.reduce((s,o)=>s+(o.order_expenses||[]).reduce((a,e)=>a+Number(e.amt),0),0))}</div>
            </div>
          )}
        </Card>
      </>}

      {view==='expenses'&&<>
        <Row style={{justifyContent:'space-between',marginBottom:12}}>
          <STitle><Ic n="expenses" size={15} color={C.amber}/> All Expenses</STitle>
          <Btn small onClick={()=>{setForm({category:'Advertising',date:today(),amount:'',note:''});setModal('expense')}}>
            <Ic n="add" size={13} color={C.white}/>Add
          </Btn>
        </Row>

        {data.expenses.length===0&&<div style={{textAlign:'center',color:C.grey,padding:32,background:C.white,borderRadius:16}}>
          <div style={{fontSize:36,marginBottom:8}}>💸</div>
          <div style={{fontWeight:700}}>No expenses recorded yet</div>
        </div>}

        {[...data.expenses].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(e=>(
          <Card key={e.id} accent={C.amber}>
            <Row style={{justifyContent:'space-between'}}>
              <div>
                <Badge color={C.amber}>{e.category}</Badge>
                <div style={{fontWeight:700,fontSize:14,marginTop:4,color:C.dark}}>{fmt(e.amount)}</div>
                <div style={{fontSize:12,color:C.grey}}>{fmtDate(e.date)}{e.note?` · ${e.note}`:''}</div>
              </div>
              <Row gap={6}>
                <Btn small outline onClick={()=>{setForm({...e});setModal('expense')}}>✏️</Btn>
                <Btn small color={C.red} onClick={()=>setDel(e)}>🗑️</Btn>
              </Row>
            </Row>
          </Card>
        ))}

        {modal==='expense'&&<Modal onClose={()=>setModal(null)} title={`${form.id?'Edit':'New'} Expense`}>
          <Inp label="Category *" value={form.category} onChange={v=>setForm(x=>({...x,category:v}))} opts={EXP_CATS}/>
          <Inp label="Amount (₹) *" value={form.amount} onChange={v=>setForm(x=>({...x,amount:v}))} type="number"/>
          <Inp label="Date" value={form.date} onChange={v=>setForm(x=>({...x,date:v}))} type="date"/>
          <Inp label="Notes" value={form.note} onChange={v=>setForm(x=>({...x,note:v}))}/>
          <Row gap={8}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn onClick={saveExpense} full disabled={busy}>{busy?'Saving…':'Save'}</Btn></Row>
        </Modal>}
      </>}

      {view==='monthly'&&<>
        <Card accent={C.blue}>
          <STitle><Ic n="chart" size={15} color={C.blue}/> Month-wise Profit & Loss</STitle>
          {monthData.length===0&&<div style={{fontSize:13,color:C.grey,textAlign:'center',padding:16}}>No data yet.</div>}
          {monthData.map(m=>(
            <div key={m.month} style={{padding:'10px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
              <div style={{fontWeight:700,fontSize:13,color:C.dark,marginBottom:6}}>{m.label}</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
                <div style={{background:C.greenPale,borderRadius:8,padding:'5px 8px',textAlign:'center'}}>
                  <div style={{fontSize:9,color:C.green,fontWeight:700}}>INCOME</div>
                  <div style={{fontSize:12,fontWeight:700,color:C.green}}>{fmt(m.income)}</div>
                </div>
                <div style={{background:'#FFF3E0',borderRadius:8,padding:'5px 8px',textAlign:'center'}}>
                  <div style={{fontSize:9,color:C.amber,fontWeight:700}}>EXPENSES</div>
                  <div style={{fontSize:12,fontWeight:700,color:C.amber}}>{fmt(m.expenses)}</div>
                </div>
                <div style={{background:m.profit>=0?C.greenPale:'#FFEBEE',borderRadius:8,padding:'5px 8px',textAlign:'center'}}>
                  <div style={{fontSize:9,color:m.profit>=0?C.green:C.red,fontWeight:700}}>PROFIT</div>
                  <div style={{fontSize:12,fontWeight:700,color:m.profit>=0?C.green:C.red}}>{fmt(m.profit)}</div>
                </div>
              </div>
              {m.dues>0&&<div style={{fontSize:11,color:C.amber,marginTop:4}}>⚠️ Pending dues: {fmt(m.dues)}</div>}
            </div>
          ))}
        </Card>
      </>}

      {del&&<DelConfirm item={`Expense: ${fmt(del.amount)}`} onConfirm={async()=>{await dbDelete('expenses',del.id);setData(d=>({...d,expenses:d.expenses.filter(e=>e.id!==del.id)}));toast('Deleted.')}} onClose={()=>setDel(null)}/>}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   REPORTS TAB  — Summary analytics
═══════════════════════════════════════════════════════════════════ */
