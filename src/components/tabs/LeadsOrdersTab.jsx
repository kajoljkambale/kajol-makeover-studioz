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
export default function LeadsOrdersTab({data,setData,toast}) {
  const [view,setView]   = useState('leads')   // leads | orders
  const [modal,setModal] = useState(null)
  const [del,setDel]     = useState(null)
  const [form,setForm]   = useState({})
  const [exp,setExp]     = useState({desc:'',amt:''})
  const [filter,setFilter] = useState('all')
  const [busy,setBusy]   = useState(false)

  const leads  = data.orders.filter(o=> o.portfolio_lead===true)
  const orders = data.orders.filter(o=>!o.portfolio_lead)

  const tc = t => t==='Mehndi'?C.green:t==='Makeup'?C.pink:t==='Ariwork'?C.purple:C.amber
  const te = t => t==='Mehndi'?'🌿':t==='Makeup'?'💄':t==='Ariwork'?'🎨':'✨'
  const sc = s => s==='Confirmed'?C.green:s==='Completed'?C.teal:s==='Cancelled'?C.red:s==='Follow-up'?C.amber:C.blue

  const filteredLeads = filter==='all' ? leads : leads.filter(l=>l.type===filter)

  /* ── Save lead ── */
  const saveLead = async () => {
    if(!form.client||!form.mobile) return alert('Client name and mobile required.')
    setBusy(true)
    const row = {
      id:form.id||uid(), portfolio_lead:true,
      type:form.type||'Mehndi', client:form.client,
      mobile:form.mobile, email:form.email||'',
      address:form.address||'', event_date:form.event_date||'',
      event_type:form.event_type||'', amount:Number(form.amount||0),
      paid:Number(form.paid||0), status:form.status||'Enquiry',
      notes:form.notes||'', date:form.date||today(),
      order_expenses:[], created_at:form.created_at||new Date().toISOString()
    }
    await dbUpsert('orders',row)
    setData(d=>({...d,orders:form.id?d.orders.map(o=>o.id===form.id?{...o,...row}:o):[...d.orders,row]}))
    setBusy(false); setModal(null); toast('Lead saved!')
  }

  /* ── Save order ── */
  const saveOrder = async () => {
    if(!form.client||!form.amount) return alert('Client and charge required.')
    setBusy(true)
    const row = {
      id:form.id||uid(), portfolio_lead:false,
      type:form.type||'Mehndi', client:form.client,
      mobile:form.mobile||'', date:form.date||today(),
      amount:Number(form.amount), paid:Number(form.paid||0),
      status:form.status||'Pending', notes:form.notes||'',
      order_expenses:form.order_expenses||[],
      created_at:form.created_at||new Date().toISOString()
    }
    await dbUpsert('orders',row)
    setData(d=>({...d,orders:form.id?d.orders.map(o=>o.id===form.id?{...o,...row}:o):[...d.orders,row]}))
    setBusy(false); setModal(null); toast('Order saved!')
  }

  /* ── Expense row for orders ── */
  const ExpRow = () => (
    <>
      <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:6}}>Order Expenses</div>
      {(form.order_expenses||[]).map((e,i)=>(
        <Row key={i} gap={6} style={{marginBottom:5}}>
          <div style={{fontSize:12,flex:1,background:C.greyL,borderRadius:8,padding:'5px 8px'}}>{e.desc} — ₹{e.amt}</div>
          <Btn small color={C.red} onClick={()=>setForm(x=>({...x,order_expenses:x.order_expenses.filter((_,j)=>j!==i)}))}>×</Btn>
        </Row>
      ))}
      <Row gap={6} style={{marginBottom:12}}>
        <input value={exp.desc} onChange={e=>setExp(x=>({...x,desc:e.target.value}))} placeholder="Expense desc" style={{flex:2,padding:'7px 10px',borderRadius:8,border:`1.5px solid ${C.pinkPale}`,fontSize:12,fontFamily:'inherit',outline:'none'}}/>
        <input value={exp.amt} onChange={e=>setExp(x=>({...x,amt:e.target.value}))} placeholder="₹" type="number" style={{flex:1,padding:'7px 10px',borderRadius:8,border:`1.5px solid ${C.pinkPale}`,fontSize:12,fontFamily:'inherit',outline:'none'}}/>
        <Btn small onClick={()=>{if(exp.desc&&exp.amt){setForm(x=>({...x,order_expenses:[...(x.order_expenses||[]),{...exp}]}));setExp({desc:'',amt:''})}}}>
          <Ic n="add" size={13} color={C.white}/>
        </Btn>
      </Row>
    </>
  )

  /* ── STATS ── */
  const totalLeadRev   = leads.reduce((s,l)=>s+Number(l.paid),0)
  const totalOrderRev  = orders.reduce((s,o)=>s+Number(o.paid),0)
  const totalOrderExp  = orders.reduce((s,o)=>s+(o.order_expenses||[]).reduce((a,e)=>a+Number(e.amt),0),0)
  const pendingLeads   = leads.filter(l=>l.status==='Enquiry'||l.status==='Follow-up').length
  const confirmedLeads = leads.filter(l=>l.status==='Confirmed').length

  /* ════════════ VIEW TOGGLE ════════════ */
  return (
    <div>
      {/* Tab switcher */}
      <div style={{display:'flex',gap:0,marginBottom:14,background:C.greyL,borderRadius:14,padding:4}}>
        {[['leads','🌸 Bookings & Leads'],['orders','🛍️ Commercial Orders']].map(([v,l])=>(
          <div key={v} onClick={()=>setView(v)} style={{flex:1,textAlign:'center',padding:'9px 6px',borderRadius:10,background:view===v?C.pink:'transparent',color:view===v?'#fff':C.grey,fontWeight:view===v?700:500,fontSize:12,cursor:'pointer',transition:'all .2s'}}>{l}</div>
        ))}
      </div>

      {/* ══════ LEADS VIEW ══════ */}
      {view==='leads'&&<>
        {/* Hero banner */}
        <div style={{background:`linear-gradient(135deg,${C.purple},${C.pink})`,borderRadius:20,padding:'16px 18px',marginBottom:14,color:'#fff'}}>
          <div style={{fontSize:20,marginBottom:4}}>🎨💄🌿</div>
          <div style={{fontSize:16,fontWeight:900}}>Kajol J Kamble — Artist Bookings</div>
          <div style={{fontSize:12,opacity:.85,marginTop:2}}>Bridal · Events · Parties · Pune &amp; nearby areas</div>
          <div style={{marginTop:10,display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {[['Enquiries / Follow-up',pendingLeads,C.amber],['Confirmed',confirmedLeads,C.green],['Total Earned',totalLeadRev,C.white,'fmt'],['All Leads',leads.length,'rgba(255,255,255,0.7)']].map(([l,v,c,f])=>(
              <div key={l} style={{background:'rgba(255,255,255,0.12)',borderRadius:10,padding:'8px 12px'}}>
                <div style={{fontSize:10,opacity:.8}}>{l}</div>
                <div style={{fontSize:16,fontWeight:800,color:c==='rgba(255,255,255,0.7)'?'rgba(255,255,255,0.9)':c}}>{f?fmt(v):v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pune areas served */}
        <div style={{background:C.pinkPale,borderRadius:12,padding:'10px 14px',marginBottom:12,fontSize:11,color:C.pink,fontWeight:600}}>
          📍 Serving: Pune · Pimpri-Chinchwad · Baner · Kothrud · Hadapsar · Viman Nagar · Wakad · Hinjewadi · Aundh · Koregaon Park · Deccan · Katraj & all Pune areas
        </div>

        {/* Filter + Add */}
        <Row gap={6} style={{marginBottom:10,flexWrap:'wrap'}}>
          {['all','Mehndi','Makeup','Ariwork','Combined'].map(f=>(
            <div key={f} onClick={()=>setFilter(f)} style={{padding:'5px 12px',borderRadius:16,background:filter===f?C.pink:C.greyL,color:filter===f?'#fff':C.grey,fontSize:11,fontWeight:filter===f?700:500,cursor:'pointer'}}>
              {f==='all'?'All':te(f)+' '+f}
            </div>
          ))}
          <div style={{marginLeft:'auto'}}>
            <Btn small onClick={()=>{setForm({type:'Mehndi',status:'Enquiry',date:today()});setModal('lead')}}>
              <Ic n="add" size={14} color={C.white}/>New Lead
            </Btn>
          </div>
        </Row>

        {filteredLeads.length===0&&(
          <div style={{textAlign:'center',padding:36,background:C.white,borderRadius:16,color:C.grey}}>
            <div style={{fontSize:40,marginBottom:10}}>🌸</div>
            <div style={{fontWeight:700,marginBottom:6}}>No leads yet</div>
            <div style={{fontSize:13}}>Add enquiries for bridal mehndi, makeup or ariwork bookings in Pune</div>
          </div>
        )}

        {filteredLeads.map(lead=>{
          const due = Number(lead.amount)-Number(lead.paid)
          return (
            <Card key={lead.id} accent={tc(lead.type)}>
              <Row style={{justifyContent:'space-between',marginBottom:8}}>
                <div>
                  <div style={{fontWeight:800,fontSize:15,color:C.dark}}>{lead.client} {te(lead.type)}</div>
                  <div style={{fontSize:12,color:C.grey}}>📱 {lead.mobile}</div>
                  {lead.email&&<div style={{fontSize:11,color:C.grey}}>✉️ {lead.email}</div>}
                  {lead.address&&<div style={{fontSize:11,color:C.pink}}>📍 {lead.address}</div>}
                </div>
                <div style={{textAlign:'right',display:'flex',flexDirection:'column',gap:5}}>
                  <Badge color={sc(lead.status)}>{lead.status}</Badge>
                  <Badge color={tc(lead.type)}>{lead.type}</Badge>
                </div>
              </Row>
              {lead.event_type&&<div style={{fontSize:12,color:C.dark,marginBottom:6,background:C.pinkPale,borderRadius:8,padding:'4px 10px',display:'inline-block'}}>
                🎉 {lead.event_type}{lead.event_date?` — ${fmtDate(lead.event_date)}`:''}
              </div>}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:8}}>
                {[['Quote',fmt(lead.amount),C.dark],['Paid',fmt(lead.paid),C.green],['Due',fmt(due),due>0?C.amber:C.green]].map(([l,v,c])=>(
                  <div key={l} style={{background:c+'12',borderRadius:8,padding:'6px 8px',textAlign:'center'}}>
                    <div style={{fontSize:9,color:c,fontWeight:700}}>{l}</div>
                    <div style={{fontSize:13,fontWeight:700,color:c}}>{v}</div>
                  </div>
                ))}
              </div>
              {lead.notes&&<div style={{fontSize:12,color:C.grey,background:C.greyL,borderRadius:8,padding:'6px 10px',marginBottom:8}}>{lead.notes}</div>}
              <Row gap={7} style={{flexWrap:'wrap'}}>
                <Btn small outline onClick={()=>{setForm({...lead});setModal('lead')}}>✏️ Edit</Btn>
                <a href={`https://wa.me/91${lead.mobile}?text=${encodeURIComponent('Hi '+lead.client+'! Thank you for your enquiry. I am Kajol from Kajol Makeover Studioz, Pune. Please share your event details so I can assist you. 💄🌿')}`} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>
                  <Btn small color={C.wa}><Ic n="wa" size={12} color={C.white}/>WhatsApp</Btn>
                </a>
                {lead.mobile&&<a href={`tel:+91${lead.mobile}`} style={{textDecoration:'none'}}><Btn small color={C.blue}><Ic n="phone2" size={12} color={C.white}/>Call</Btn></a>}
                <select value={lead.status} onChange={async e=>{
                  const u={...lead,status:e.target.value}
                  await dbUpsert('orders',u)
                  setData(d=>({...d,orders:d.orders.map(o=>o.id===lead.id?u:o)}))
                  toast('Status updated!')
                }} style={{fontSize:11,borderRadius:8,border:`1.5px solid ${C.pinkPale}`,padding:'5px 8px',fontFamily:'inherit',cursor:'pointer',color:C.dark}}>
                  {['Enquiry','Follow-up','Confirmed','Completed','Cancelled'].map(s=><option key={s}>{s}</option>)}
                </select>
                <Btn small color={C.red} onClick={()=>setDel(lead)}>🗑️</Btn>
              </Row>
            </Card>
          )
        })}
      </>}

      {/* ══════ ORDERS VIEW ══════ */}
      {view==='orders'&&<>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:9,marginBottom:14}}>
          <StatBox label="Revenue"  value={fmt(totalOrderRev)} color={C.green} icon="rupee"/>
          <StatBox label="Expenses" value={fmt(totalOrderExp)} color={C.amber} icon="expenses"/>
          <StatBox label="Pending"  value={orders.filter(o=>o.status==='Pending').length} color={C.red} icon="order"/>
        </div>
        <Row style={{justifyContent:'space-between',marginBottom:12}}>
          <STitle><Ic n="order" size={15} color={C.teal}/> Commercial Orders</STitle>
          <Btn small onClick={()=>{setForm({type:'Mehndi',client:'',mobile:'',date:today(),amount:'',paid:'',status:'Pending',notes:'',order_expenses:[]});setExp({desc:'',amt:''});setModal('order')}}>
            <Ic n="add" size={14} color={C.white}/>New
          </Btn>
        </Row>
        {orders.length===0&&<div style={{textAlign:'center',color:C.grey,padding:32,background:C.white,borderRadius:16}}>No commercial orders yet.</div>}
        {orders.map(o=>{
          const due=Number(o.amount)-Number(o.paid)
          const oExp=(o.order_expenses||[]).reduce((a,e)=>a+Number(e.amt),0)
          return (
            <Card key={o.id} accent={tc(o.type)}>
              <Row style={{justifyContent:'space-between',marginBottom:6}}>
                <div>
                  <div style={{fontWeight:700,fontSize:14}}>{o.client} <Badge color={tc(o.type)}>{o.type}</Badge></div>
                  <div style={{fontSize:12,color:C.grey}}>📱 {o.mobile} · {fmtDate(o.date)}</div>
                  {o.notes&&<div style={{fontSize:11,color:C.grey,marginTop:2}}>{o.notes}</div>}
                </div>
                <Badge color={o.status==='Completed'?C.green:o.status==='Cancelled'?C.red:C.amber}>{o.status}</Badge>
              </Row>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:5,marginBottom:8}}>
                {[['Charge',fmt(o.amount),C.dark],[due>0?'Due':'Paid',due>0?fmt(due):fmt(o.paid),due>0?C.amber:C.green],['Exp.',fmt(oExp),C.red],['Profit',fmt(Number(o.paid)-oExp),(Number(o.paid)-oExp)>=0?C.green:C.red]].map(([l,v,c])=>(
                  <div key={l} style={{background:C.greyL,borderRadius:8,padding:'5px 6px',textAlign:'center'}}>
                    <div style={{fontSize:9,color:C.grey}}>{l}</div>
                    <div style={{fontSize:12,fontWeight:700,color:c}}>{v}</div>
                  </div>
                ))}
              </div>
              {(o.order_expenses||[]).length>0&&<div style={{background:'#FFF3E0',borderRadius:8,padding:'7px 10px',marginBottom:8}}>{(o.order_expenses||[]).map((e,i)=><div key={i} style={{fontSize:11,display:'flex',justifyContent:'space-between'}}><span>{e.desc}</span><span style={{fontWeight:700}}>₹{e.amt}</span></div>)}</div>}
              <Row gap={7} style={{flexWrap:'wrap'}}>
                <Btn small outline onClick={()=>{setForm({...o,order_expenses:[...(o.order_expenses||[])]});setExp({desc:'',amt:''});setModal('edit_order_'+o.id)}}>✏️</Btn>
                <select value={o.status} onChange={async e=>{const u={...o,status:e.target.value};await dbUpsert('orders',u);setData(d=>({...d,orders:d.orders.map(x=>x.id===o.id?u:x)}));toast('Updated.')}} style={{fontSize:11,borderRadius:8,border:`1.5px solid ${C.pinkPale}`,padding:'5px 8px',fontFamily:'inherit',cursor:'pointer',color:C.dark}}>
                  {['Pending','In Progress','Completed','Cancelled'].map(s=><option key={s}>{s}</option>)}
                </select>
                {o.mobile&&due>0&&<a href={`https://wa.me/91${o.mobile}?text=${encodeURIComponent('Hi '+o.client+'! Payment of '+fmt(due)+' is pending for your '+o.type+' booking. — Kajol Makeover Studioz')}`} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}><Btn small color={C.wa}><Ic n="wa" size={12} color={C.white}/>Remind</Btn></a>}
                <Btn small color={C.red} onClick={()=>setDel(o)}>🗑️</Btn>
              </Row>
              {modal===('edit_order_'+o.id)&&<Modal onClose={()=>setModal(null)} title="Edit Order">
                <Inp label="Client" value={form.client} onChange={v=>setForm(x=>({...x,client:v}))}/>
                <Inp label="Mobile" value={form.mobile} onChange={v=>setForm(x=>({...x,mobile:v}))}/>
                <Inp label="Type" value={form.type} onChange={v=>setForm(x=>({...x,type:v}))} opts={ORDER_TYPES}/>
                <Inp label="Date" value={form.date} onChange={v=>setForm(x=>({...x,date:v}))} type="date"/>
                <Inp label="Charge (₹)" value={form.amount} onChange={v=>setForm(x=>({...x,amount:v}))} type="number"/>
                <Inp label="Paid (₹)" value={form.paid} onChange={v=>setForm(x=>({...x,paid:v}))} type="number"/>
                <Inp label="Status" value={form.status} onChange={v=>setForm(x=>({...x,status:v}))} opts={['Pending','In Progress','Completed','Cancelled']}/>
                <Inp label="Notes" value={form.notes} onChange={v=>setForm(x=>({...x,notes:v}))}/>
                <ExpRow/>
                <Row gap={8}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn onClick={saveOrder} full disabled={busy}>{busy?'…':'Save'}</Btn></Row>
              </Modal>}
            </Card>
          )
        })}
        {modal==='order'&&<Modal onClose={()=>setModal(null)} title="New Commercial Order">
          <Inp label="Client Name *" value={form.client} onChange={v=>setForm(x=>({...x,client:v}))}/>
          <Inp label="Mobile" value={form.mobile} onChange={v=>setForm(x=>({...x,mobile:v}))}/>
          <Inp label="Type" value={form.type||'Mehndi'} onChange={v=>setForm(x=>({...x,type:v}))} opts={ORDER_TYPES}/>
          <Inp label="Date" value={form.date||today()} onChange={v=>setForm(x=>({...x,date:v}))} type="date"/>
          <Inp label="Charge (₹) *" value={form.amount} onChange={v=>setForm(x=>({...x,amount:v}))} type="number"/>
          <Inp label="Paid (₹)" value={form.paid} onChange={v=>setForm(x=>({...x,paid:v}))} type="number"/>
          <Inp label="Notes" value={form.notes} onChange={v=>setForm(x=>({...x,notes:v}))}/>
          <ExpRow/>
          <Row gap={8}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn color={C.teal} onClick={saveOrder} full disabled={busy}>{busy?'…':'Add Order'}</Btn></Row>
        </Modal>}
      </>}

      {/* Shared: lead form modal */}
      {modal==='lead'&&(
        <Modal onClose={()=>setModal(null)} title={<><Ic n="portfolio" color={C.purple}/> {form.id?'Edit':'New'} Lead / Booking</>}>
          <Inp label="Client Name *" value={form.client} onChange={v=>setForm(x=>({...x,client:v}))}/>
          <Inp label="Mobile *" value={form.mobile} onChange={v=>setForm(x=>({...x,mobile:v}))} type="tel"/>
          <Inp label="Email" value={form.email} onChange={v=>setForm(x=>({...x,email:v}))} type="email"/>
          <Inp label="Area / Location in Pune" value={form.address} onChange={v=>setForm(x=>({...x,address:v}))} placeholder="e.g. Baner, Kothrud, Hadapsar, Wakad"/>
          <Inp label="Service Type" value={form.type||'Mehndi'} onChange={v=>setForm(x=>({...x,type:v}))} opts={['Mehndi','Makeup','Ariwork','Combined']}/>
          <Inp label="Event Type" value={form.event_type} onChange={v=>setForm(x=>({...x,event_type:v}))} placeholder="e.g. Bridal, Engagement, Birthday, Sangeet"/>
          <Inp label="Event Date" value={form.event_date} onChange={v=>setForm(x=>({...x,event_date:v}))} type="date"/>
          <Inp label="Quotation (₹)" value={form.amount} onChange={v=>setForm(x=>({...x,amount:v}))} type="number"/>
          <Inp label="Advance Received (₹)" value={form.paid} onChange={v=>setForm(x=>({...x,paid:v}))} type="number"/>
          <Inp label="Status" value={form.status||'Enquiry'} onChange={v=>setForm(x=>({...x,status:v}))} opts={['Enquiry','Follow-up','Confirmed','Completed','Cancelled']}/>
          <Inp label="Notes / Requirements" value={form.notes} onChange={v=>setForm(x=>({...x,notes:v}))} rows={3}/>
          <Row gap={8}><Btn outline onClick={()=>setModal(null)} full>Cancel</Btn><Btn onClick={saveLead} full disabled={busy}>{busy?'Saving…':'Save Lead'}</Btn></Row>
        </Modal>
      )}

      {del&&<DelConfirm item={del.client} onConfirm={async()=>{await dbDelete('orders',del.id);setData(d=>({...d,orders:d.orders.filter(o=>o.id!==del.id)}));toast('Deleted.')}} onClose={()=>setDel(null)}/>}
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════
   CERTIFICATE TAB — generate & dispatch certificates per batch
═══════════════════════════════════════════════════════════════════ */
