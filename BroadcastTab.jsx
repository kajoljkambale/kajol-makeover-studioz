import React, { useState, useMemo } from 'react'
import { C, fmt, Ic, Card, Row, SectionTitle, Badge, Btn, Divider, Modal, Inp } from '../lib/ui.jsx'

const TEMPLATES = {
  classReminder: (name, batchName, timing, zoomLink) =>
    `🌸 *Class Reminder*\n\nHi ${name||'there'}! 👋\n\nYour *${batchName}* class is today!\n⏰ Time: ${timing}\n🎥 Zoom: ${zoomLink||'Link in group'}\n\nPlease join on time!\n\n— Kajol Ma'am 💄`,

  paymentReminder: (name, due, batchName) =>
    `💳 *Payment Reminder*\n\nDear ${name||'Student'},\n\nThis is a gentle reminder that your payment of *${fmt(due)}* for *${batchName}* is still pending.\n\nKindly pay at your earliest convenience.\n\nThank you! 🙏\n— Kajol Ma'am 💄`,

  festivalWish: (name, festival) =>
    `🎉 *Happy ${festival}!*\n\nDear ${name||'there'},\n\nWishing you and your family a wonderful ${festival}! 🌸\n\nMay this festival bring joy, beauty, and happiness to your life! ✨\n\n— Kajol Makeover Studioz 💄\nhttps://www.instagram.com/kajol_makeover_studioz`,

  birthdayWish: (name) =>
    `🎂 *Happy Birthday ${name||''}!* 🎉\n\nWishing you a gorgeous and wonderful birthday! 💄✨\n\nMay this special day bring you all the joy and happiness you deserve! 🌸\n\nWith love,\nKajol Ma'am 💄\nKajol Makeover Studioz`,

  newBatch: (batchName, timing, schedule, fee, link) =>
    `✨ *New Batch Announcement!*\n\n💄 *${batchName}*\n⏰ Timing: ${timing}\n📅 Schedule: ${schedule}\n💰 Fee: ₹${fee||'Contact for details'}\n\nLimited seats available! Enroll now! 🌸\n\n📲 Join here: ${link||'DM to enroll'}\n\n— Kajol Makeover Studioz\n📸 https://www.instagram.com/kajol_makeover_studioz`,

  custom: () => ''
}

export default function BroadcastTab({ data }) {
  const [listType, setListType]   = useState('all')
  const [template, setTemplate]   = useState('classReminder')
  const [customMsg, setCustomMsg] = useState('')
  const [selBatch, setSelBatch]   = useState('')
  const [selected, setSelected]   = useState([])
  const [festival, setFestival]   = useState('Diwali')
  const [preview, setPreview]     = useState(null)
  const [selectAll, setSelectAll] = useState(false)

  // Build contact list
  const contacts = useMemo(() => {
    let list = []
    if (listType === 'all') {
      list = [...data.students.map(s=>({...s, type:'student'})),
               ...data.orders.map(o=>({id:o.id, name:o.client, mobile:o.mobile, type:'client'}))]
    } else if (listType === 'students') {
      list = data.students.map(s=>({...s, type:'student'}))
    } else if (listType === 'clients') {
      const clientMap = {}
      data.orders.forEach(o=>{ if(o.mobile) clientMap[o.mobile]={id:o.id,name:o.client,mobile:o.mobile,type:'client'} })
      list = Object.values(clientMap)
    } else if (listType === 'batch' && selBatch) {
      const batch = data.batches.find(b=>b.id===selBatch)
      list = data.students.filter(s=>(batch?.student_ids||[]).includes(s.id)).map(s=>({...s,type:'student'}))
    } else if (listType === 'partial') {
      const partialIds = new Set(data.payments.filter(p=>Number(p.amount)>Number(p.paid)).map(p=>p.student_id))
      list = data.students.filter(s=>partialIds.has(s.id)).map(s=>({...s,type:'student'}))
    } else if (listType === 'birthday') {
      const today = new Date()
      list = data.students.filter(s=>{
        if(!s.birthday) return false
        const b = new Date(s.birthday)
        return b.getDate()===today.getDate() && b.getMonth()===today.getMonth()
      }).map(s=>({...s,type:'student'}))
    }
    // dedupe by mobile
    const seen = new Set()
    return list.filter(c=>{ if(!c.mobile||seen.has(c.mobile)) return false; seen.add(c.mobile); return true })
  }, [data, listType, selBatch])

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id])
  const toggleAll = () => {
    if (selectAll) { setSelected([]); setSelectAll(false) }
    else { setSelected(contacts.map(c=>c.id)); setSelectAll(true) }
  }

  const buildMsg = (contact) => {
    if (template === 'custom') return customMsg
    const batch = data.batches.find(b=>(b.student_ids||[]).includes(contact.id))
    const payment = data.payments.find(p=>p.student_id===contact.id)
    const due = payment ? Number(payment.amount)-Number(payment.paid) : 0
    if (template === 'classReminder') return TEMPLATES.classReminder(contact.name, batch?.name||'our class', batch?.timing||'as scheduled', batch?.zoom_link||'')
    if (template === 'paymentReminder') return TEMPLATES.paymentReminder(contact.name, due, batch?.name||'your course')
    if (template === 'festivalWish') return TEMPLATES.festivalWish(contact.name, festival)
    if (template === 'birthdayWish') return TEMPLATES.birthdayWish(contact.name)
    if (template === 'newBatch') {
      const b = data.batches[data.batches.length-1]
      return TEMPLATES.newBatch(b?.name||'New Batch', b?.timing||'', b?.schedule||'', b?.fee||'', b?.wa_group||'')
    }
    return ''
  }

  const openPreview = () => {
    const first = contacts.find(c=>selected.includes(c.id)) || contacts[0]
    if (first) setPreview(buildMsg(first))
  }

  const sendToAll = () => {
    const targets = selected.length > 0 ? contacts.filter(c=>selected.includes(c.id)) : contacts
    if (targets.length === 0) return alert('No contacts selected.')
    // Open WhatsApp for first contact, copy others
    const first = targets[0]
    const msg = buildMsg(first)
    window.open(`https://wa.me/91${first.mobile}?text=${encodeURIComponent(msg)}`, '_blank')
    if (targets.length > 1) {
      const allMsgs = targets.slice(1).map(c=>`${c.name} (${c.mobile}):\n${buildMsg(c)}`).join('\n\n---\n\n')
      navigator.clipboard.writeText(allMsgs)
      alert(`WhatsApp opened for ${first.name}.\n\nMessages for ${targets.length-1} more contacts copied to clipboard. Paste individually in WhatsApp.`)
    }
  }

  const LIST_TYPES = [
    {v:'all',l:'All (Students + Clients)'},
    {v:'students',l:'All Students'},
    {v:'clients',l:'Individual Clients'},
    {v:'batch',l:'Batch-wise'},
    {v:'partial',l:'Partial-paid Students'},
    {v:'birthday',l:"Today's Birthdays"},
  ]

  const TEMPLATE_OPTS = [
    {v:'classReminder',l:'📅 Class Reminder'},
    {v:'paymentReminder',l:'💳 Payment Reminder'},
    {v:'festivalWish',l:'🎉 Festival Wishes'},
    {v:'birthdayWish',l:'🎂 Birthday Wishes'},
    {v:'newBatch',l:'✨ New Batch Announcement'},
    {v:'custom',l:'✍️ Custom Message'},
  ]

  return (
    <div>
      <SectionTitle><Ic n="broadcast" size={15} color={C.green}/> Broadcast Messaging</SectionTitle>

      {/* Step 1: Choose List */}
      <Card>
        <div style={{fontSize:13,fontWeight:700,color:C.dark,marginBottom:8}}>① Choose Contact List</div>
        <Inp label="" value={listType} onChange={setListType} opts={LIST_TYPES}/>
        {listType==='batch'&&(
          <Inp label="Select Batch" value={selBatch} onChange={setSelBatch}
            opts={[{v:'',l:'— Select —'},...data.batches.map(b=>({v:b.id,l:b.name}))]}/>
        )}
        {listType==='festival'&&(
          <Inp label="Festival Name" value={festival} onChange={setFestival} placeholder="e.g. Diwali"/>
        )}
        <div style={{fontSize:12,color:C.grey,marginTop:4}}>{contacts.length} contacts found</div>
      </Card>

      {/* Step 2: Choose Template */}
      <Card>
        <div style={{fontSize:13,fontWeight:700,color:C.dark,marginBottom:8}}>② Choose Message Template</div>
        <Inp label="" value={template} onChange={setTemplate} opts={TEMPLATE_OPTS}/>
        {template==='festivalWish'&&(
          <Inp label="Festival Name" value={festival} onChange={setFestival} placeholder="e.g. Diwali, Holi, Navratri"/>
        )}
        {template==='custom'&&(
          <Inp label="Your Message" value={customMsg} onChange={setCustomMsg} rows={5}
            placeholder="Type your message here..."/>
        )}
        <Btn small outline onClick={openPreview} style={{marginTop:6}}>
          <Ic n="eye" size={13} color={C.pink}/>Preview Message
        </Btn>
      </Card>

      {/* Step 3: Select Contacts */}
      <Card>
        <div style={{fontSize:13,fontWeight:700,color:C.dark,marginBottom:8}}>③ Select Recipients</div>
        <Row style={{justifyContent:'space-between',marginBottom:10}}>
          <div style={{fontSize:12,color:C.grey}}>{selected.length>0?`${selected.length} selected`:'Select all or pick individually'}</div>
          <Btn small outline onClick={toggleAll}>{selectAll?'Deselect All':'Select All'}</Btn>
        </Row>
        <div style={{maxHeight:280,overflowY:'auto'}}>
          {contacts.map(c=>(
            <div key={c.id} onClick={()=>toggleSelect(c.id)}
              style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',
                borderBottom:`1px solid ${C.pinkPale}`,cursor:'pointer',
                background:selected.includes(c.id)?C.pinkPale:'transparent',
                borderRadius:selected.includes(c.id)?8:'none',padding:'8px 10px',marginBottom:2}}>
              <div style={{width:20,height:20,borderRadius:4,border:`2px solid ${selected.includes(c.id)?C.pink:C.grey}`,
                background:selected.includes(c.id)?C.pink:'transparent',display:'flex',alignItems:'center',
                justifyContent:'center',flexShrink:0}}>
                {selected.includes(c.id)&&<Ic n="check" size={12} color={C.white}/>}
              </div>
              <div style={{width:32,height:32,borderRadius:'50%',
                background:`linear-gradient(135deg,${C.pink},${C.pinkD})`,
                display:'flex',alignItems:'center',justifyContent:'center',
                color:'#fff',fontWeight:800,fontSize:13,flexShrink:0}}>{(c.name||'?')[0]}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:13}}>{c.name}</div>
                <div style={{fontSize:11,color:C.grey}}>📱 {c.mobile}</div>
              </div>
              <Badge color={c.type==='student'?C.blue:C.teal}>{c.type}</Badge>
            </div>
          ))}
          {contacts.length===0&&<div style={{textAlign:'center',color:C.grey,padding:20,fontSize:13}}>No contacts in this list</div>}
        </div>
      </Card>

      {/* Send */}
      <Btn color="#25D366" full onClick={sendToAll} style={{marginBottom:8}}>
        <Ic n="whatsapp" size={16} color={C.white}/>
        Send to {selected.length>0?selected.length:contacts.length} Contact{(selected.length||contacts.length)!==1?'s':''}
      </Btn>
      <div style={{fontSize:11,color:C.grey,textAlign:'center',marginBottom:16}}>
        WhatsApp will open for each contact. Messages also copied to clipboard.
      </div>

      {preview&&(
        <Modal onClose={()=>setPreview(null)} title={<><Ic n="eye" color={C.pink}/> Message Preview</>}>
          <div style={{background:C.greyL,borderRadius:12,padding:14,fontSize:13,
            lineHeight:1.7,whiteSpace:'pre-wrap',color:C.dark,marginBottom:12}}>{preview}</div>
          <Row gap={8}>
            <Btn outline onClick={()=>setPreview(null)} full>Close</Btn>
            <Btn color="#25D366" onClick={()=>{navigator.clipboard.writeText(preview);alert('Copied!');}} full>
              <Ic n="copy" size={14} color={C.white}/>Copy
            </Btn>
          </Row>
        </Modal>
      )}
    </div>
  )
}
