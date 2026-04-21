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
export default function BroadcastTab({data,toast}) {
  const [section,setSection] = useState('batch')   // batch | community | students | custom
  const [selBatch,setSelBatch] = useState(data.batches[0]?.id||'')
  const [msgType,setMsgType]   = useState('classReminder')
  const [customMsg,setCustomMsg] = useState('')
  const [festival,setFestival]   = useState('Diwali')
  const [listType,setListType]   = useState('all')
  const [selected,setSelected]   = useState([])

  const batch = data.batches.find(b=>b.id===selBatch)
  const nextClass = useMemo(()=>{
    if(!batch) return null
    const t=today(); return data.classes.filter(c=>c.batch_id===batch.id&&c.date>=t).sort((a,b)=>a.date.localeCompare(b.date))[0]||data.classes.filter(c=>c.batch_id===batch.id).sort((a,b)=>b.day-a.day)[0]||null
  },[batch,data.classes])

  /* ── Batch messages ── */
  const batchMsg = type => {
    if(!batch) return ''
    const cl=nextClass
    if(type==='classReminder') return '🌸 *Class Reminder — '+batch.name+'*\n\n'+(cl?'Day '+cl.day+': *'+cl.topic+'*\n📅 Date: '+cl.date+'\n':'')+'⏰ Time: '+(batch.timing||'As scheduled')+'\n🎥 Zoom: '+(cl?.zoom_link||batch.zoom_link||'Link in group')+'\n\n'+(cl?.homework?'📝 Homework: '+cl.homework+'\n\n':'')+'Please join on time! 🙏\n— Kajol Maam 💄'
    if(type==='zoomLink')      return `🎥 *${batch.name} — Zoom Link*\n\nMeeting Link: ${batch.zoom_link||'To be shared'}\nMeeting ID: ${batch.zoom_id||'—'}\n⏰ Time: ${batch.timing||'As scheduled'}\n\n— Kajol Ma'am 💄`
    if(type==='ytReady')       return '🎬 *Recording is Ready!*\n\n'+(cl?'Day '+cl.day+': *'+cl.topic+'*\n▶ '+(cl.youtube_link||'Link coming soon')+'\n':'')+'Watch anytime:\nhttps://youtube.com/@kajolmakeoverstudioz\n\n— Kajol Maam 💄'
    if(type==='homework')      return '📝 *Homework Reminder — '+batch.name+'*\n\n'+(cl?'Day '+cl.day+' HW: *'+(cl.homework||'Check previous class')+'*\n':'')+'Please share your practice photos in this group. ✅\n— Kajol Maam 💄'
    if(type==='payReminder')   return `💳 *Fee Reminder — ${batch.name}*\n\nDear Students,\n\nKindly complete your pending fee payment at your earliest convenience. 🙏\n\nThank you!\n— Kajol Ma'am 💄`
    return ''
  }

  /* ── Community messages ── */
  const communityMsg = type => {
    if(type==='newBatch') {
      const active=data.batches.filter(b=>b.status==='Active'||b.status==='Upcoming')
      return '✨ *New Batch Announcement!*\n\n💄 Kajol Makeover Studioz\n\n'+active.map(b=>'📚 *'+b.name+'*\n⏰ '+(b.timing||'TBD')+' · '+(b.schedule||'')+'\n💰 Fee: '+fmt(b.fee||0)).join('\n\n')+'\n\n🎯 Limited seats — Enroll now!\n🔗 '+ENROLL_URL+'\n\n— Kajol Maam 💄\n📸 '+INSTAGRAM
    }
    if(type==='enrollLink') return `🌸 *Enroll in Our Online Courses!*\n\nMehndi • Makeup • Ariwork\n\n📲 Fill your enrollment form:\n🔗 ${ENROLL_URL}\n\n💄 Online classes via Zoom\n📹 Recorded classes on YouTube\n\n— Kajol Ma'am 💄\n📸 ${INSTAGRAM}`
    if(type==='youtube')    return `🎬 *Watch Our Latest Classes on YouTube!* 🌸\n\n▶ Subscribe & Watch: ${YOUTUBE}\n\n💄 Kajol Makeover Studioz\n📸 ${INSTAGRAM}`
    if(type==='festival')   return `🎉 *Happy ${festival}!* 🌸\n\nWishing all our students and followers a wonderful ${festival}!\n\nMay this festival bring joy, beauty and happiness! ✨\n\n💄 Kajol Makeover Studioz\n📸 ${INSTAGRAM}`
    return ''
  }

  /* ── Student list for individual broadcast ── */
  const contacts = useMemo(()=>{
    let list=[]
    if(listType==='all') list=[...data.students,...data.orders.map(o=>({id:o.id+'_c',name:o.client,mobile:o.mobile,type:'client'}))]
    else if(listType==='students') list=[...data.students]
    else if(listType==='batch'&&selBatch) list=data.students.filter(s=>(batch?.student_ids||[]).includes(s.id))
    else if(listType==='partial'){const ids=new Set(data.payments.filter(p=>Number(p.amount)>Number(p.paid)).map(p=>p.student_id));list=data.students.filter(s=>ids.has(s.id))}
    else if(listType==='birthday'){const t=new Date();list=data.students.filter(s=>{if(!s.birthday)return false;const b=new Date(s.birthday+'T00:00:00');return b.getDate()===t.getDate()&&b.getMonth()===t.getMonth()})}
    const seen=new Set(); return list.filter(c=>{if(!c.mobile||seen.has(c.mobile))return false;seen.add(c.mobile);return true})
  },[data,listType,selBatch,batch])

  const studentMsg = c => {
    if(msgType==='custom') return customMsg
    const b=data.batches.find(x=>(x.student_ids||[]).includes(c.id))
    const p=data.payments.find(x=>x.student_id===c.id)
    const due=p?Number(p.amount)-Number(p.paid):0
    if(msgType==='classReminder') return `🌸 Class Reminder!\n\nHi ${c.name}! Your class is today at ${b?.timing||'scheduled time'}.\n🎥 Zoom: ${b?.zoom_link||'Link in your group'}\n\n— Kajol Ma'am 💄`
    if(msgType==='payReminder')   return `💳 Payment Reminder\n\nHi ${c.name}, ${fmt(due)} payment is pending for ${b?.name||'your course'}.\nKindly pay at your earliest. 🙏\n— Kajol Ma'am 💄`
    if(msgType==='festival')      return `🎉 Happy ${festival}!\n\nDear ${c.name}, wishing you a wonderful ${festival}! 🌸\n— Kajol Makeover Studioz 💄`
    if(msgType==='birthday')      return `🎂 Happy Birthday ${c.name}! 🎉\n\nWishing you a gorgeous and wonderful birthday! 💄✨\n— Kajol Ma'am 💄`
    return ''
  }

  const sendContacts = () => {
    const targets=selected.length>0?contacts.filter(c=>selected.includes(c.id)):contacts
    if(!targets.length){alert('No contacts selected.');return}
    const first=targets[0]
    window.open(`https://wa.me/91${first.mobile}?text=${encodeURIComponent(studentMsg(first))}`,'_blank')
    if(targets.length>1){
      const links=targets.slice(1).map(c=>`https://wa.me/91${c.mobile}?text=${encodeURIComponent(studentMsg(c))}`).join('\n')
      navigator.clipboard?.writeText(links)
      toast(`Opened WA for ${first.name}. ${targets.length-1} more links copied to clipboard!`)
    }
  }

  const SECTIONS=[{v:'batch',l:'🎓 Batch Groups'},{v:'community',l:'🌐 Community'},{v:'students',l:'👥 Students'},{v:'custom',l:'✍️ Custom'}]

  return (
    <div>
      <div style={{display:'flex',gap:6,overflowX:'auto',marginBottom:14,paddingBottom:4}}>
        {SECTIONS.map(s=><div key={s.v} onClick={()=>setSection(s.v)} style={{flexShrink:0,padding:'8px 14px',borderRadius:12,background:section===s.v?C.pink:C.greyL,color:section===s.v?C.white:C.grey,fontSize:12,fontWeight:section===s.v?700:500,cursor:'pointer',whiteSpace:'nowrap'}}>{s.l}</div>)}
      </div>

      {/* ── BATCH GROUPS ── */}
      {section==='batch'&&<div>
        <Card accent={C.green}>
          <STitle><Ic n="batch" size={15} color={C.green}/> Send to Batch WhatsApp Group</STitle>
          <div style={{fontSize:12,color:C.grey,marginBottom:10}}>Select a batch and send reminders directly to its WhatsApp group.</div>
          <Inp label="Select Batch" value={selBatch} onChange={setSelBatch} opts={data.batches.map(b=>({v:b.id,l:b.name+(b.wa_group?' ✅':' ❌ no group')}))}/>

          {batch&&<>
            {batch.wa_group
              ? <div style={{background:C.greenPale,borderRadius:10,padding:'8px 12px',marginBottom:12,fontSize:12}}>✅ Group: <a href={batch.wa_group} target="_blank" rel="noopener noreferrer" style={{color:C.green,wordBreak:'break-all'}}>{batch.wa_group.slice(0,50)}…</a></div>
              : <div style={{background:'#FFF3E0',borderRadius:10,padding:'8px 12px',marginBottom:12,fontSize:12,color:C.amber}}>⚠️ No WhatsApp group set. Go to Batches → Edit Batch to add the group link.</div>
            }
            <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:8,textTransform:'uppercase',letterSpacing:.5}}>Quick Send Templates</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
              {[{t:'classReminder',l:'📅 Class Reminder',c:C.blue},{t:'zoomLink',l:'🎥 Zoom Link',c:C.blue},{t:'ytReady',l:'▶ Recording Ready',c:C.yt},{t:'homework',l:'📝 Homework Reminder',c:C.green},{t:'payReminder',l:'💳 Fee Reminder',c:C.amber}].map(btn=>(
                <button key={btn.t} onClick={()=>{
                  const msg=batchMsg(btn.t)
                  if(batch.wa_group){navigator.clipboard?.writeText(msg);window.open(batch.wa_group,'_blank');toast('Message copied! Paste in group.')}
                  else{navigator.share?navigator.share({text:msg}):(navigator.clipboard?.writeText(msg),toast('Copied! Open group manually.'))}
                }} style={{background:btn.c+'15',border:`1.5px solid ${btn.c}30`,borderRadius:10,padding:'10px 8px',cursor:'pointer',fontFamily:'inherit',color:btn.c,fontSize:12,fontWeight:700,textAlign:'center'}}>
                  {btn.l}
                </button>
              ))}
            </div>
            <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Class Reminder Preview</div>
            <div style={{background:C.greyL,borderRadius:10,padding:12,fontSize:11,lineHeight:1.7,whiteSpace:'pre-wrap',color:C.dark,marginBottom:10,maxHeight:140,overflow:'auto'}}>{batchMsg('classReminder')}</div>
            <Btn color={C.wa} full onClick={()=>{const m=batchMsg('classReminder');if(batch.wa_group){navigator.clipboard?.writeText(m);window.open(batch.wa_group,'_blank');toast('Copied! Paste in group.')}else{navigator.share?navigator.share({text:m}):(navigator.clipboard?.writeText(m),toast('Copied!'))}}}>
              <Ic n="wa" size={14} color={C.white}/>Open Group & Copy Message
            </Btn>
          </>}
        </Card>

        {/* All batches quick access */}
        <Card>
          <STitle><Ic n="batch" size={15} color={C.pink}/> All Batch Groups</STitle>
          {data.batches.map(b=>(
            <div key={b.id} style={{padding:'9px 0',borderBottom:`1px solid ${C.pinkPale}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontWeight:600,fontSize:13}}>{b.name}</div>
                <div style={{fontSize:11,color:C.grey}}>{b.student_ids?.length||0} students · {b.timing}</div>
              </div>
              {b.wa_group
                ? <a href={b.wa_group} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}><Btn small color={C.wa}><Ic n="wa" size={12} color={C.white}/>Open</Btn></a>
                : <Badge color={C.grey}>No Group</Badge>
              }
            </div>
          ))}
          {data.batches.length===0&&<div style={{fontSize:13,color:C.grey,textAlign:'center',padding:16}}>No batches yet.</div>}
        </Card>
      </div>}

      {/* ── COMMUNITY ── */}
      {section==='community'&&<div>
        <Card accent={C.wa}>
          <STitle><Ic n="wa" size={15} color={C.wa}/> WhatsApp Community</STitle>
          <div style={{background:C.greenPale,borderRadius:10,padding:'8px 12px',marginBottom:12,fontSize:12,wordBreak:'break-all'}}>🟢 {WA_COMMUNITY}</div>
          <a href={WA_COMMUNITY} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none',display:'block',marginBottom:10}}>
            <Btn color={C.wa} full><Ic n="wa" size={15} color={C.white}/>Open Community</Btn>
          </a>
        </Card>

        <div style={{fontSize:12,fontWeight:700,color:C.grey,marginBottom:8,textTransform:'uppercase',letterSpacing:.5}}>Community Announcements</div>
        {[
          {type:'newBatch',label:'✨ New Batch Announcement',desc:'Share upcoming batches with enrollment link'},
          {type:'enrollLink',label:'🔗 Enrollment Link',desc:'Invite new students to fill the form'},
          {type:'youtube',label:'▶ YouTube Update',desc:'Direct followers to class recordings'},
          {type:'festival',label:'🎉 Festival Wishes',desc:'Seasonal greeting for the community',showFestival:true},
        ].map(item=>(
          <Card key={item.type}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:3}}>{item.label}</div>
            <div style={{fontSize:11,color:C.grey,marginBottom:8}}>{item.desc}</div>
            {item.showFestival&&<Inp label="Festival Name" value={festival} onChange={setFestival} placeholder="e.g. Diwali, Holi, Navratri"/>}
            <Row gap={8}>
              <Btn small outline onClick={()=>{navigator.clipboard?.writeText(communityMsg(item.type));toast('Copied!')}}>
                <Ic n="copy" size={12} color={C.pink}/>Copy
              </Btn>
              <Btn small color={C.wa} onClick={()=>{const m=communityMsg(item.type);navigator.share?navigator.share({text:m}):(navigator.clipboard?.writeText(m),toast('Copied! Open community to paste.'))}}>
                <Ic n="share" size={12} color={C.white}/>Share
              </Btn>
              <a href={WA_COMMUNITY} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>
                <Btn small color={C.wa}><Ic n="wa" size={12} color={C.white}/>Open</Btn>
              </a>
            </Row>
          </Card>
        ))}

        <Card>
          <STitle><Ic n="share" size={15} color={C.pink}/> Other Social Platforms</STitle>
          {[{l:'Instagram',u:INSTAGRAM,c:C.ig},{l:'YouTube Channel',u:YOUTUBE,c:C.yt}].map(x=>(
            <div key={x.l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
              <span style={{fontWeight:600,fontSize:13}}>{x.l}</span>
              <a href={x.u} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}><Btn small color={x.c}>Open</Btn></a>
            </div>
          ))}
        </Card>
      </div>}

      {/* ── STUDENTS ── */}
      {section==='students'&&<div>
        <Card>
          <STitle><Ic n="students" size={15} color={C.blue}/> Send to Individual Students</STitle>
          <Inp label="Contact List" value={listType} onChange={setListType} opts={[
            {v:'all',l:'All Students + Clients'},{v:'students',l:'All Students'},
            {v:'batch',l:'Batch-wise'},{v:'partial',l:'Partial-paid Students'},
            {v:'birthday',l:"Today's Birthdays 🎂"}
          ]}/>
          {listType==='batch'&&<Inp label="Batch" value={selBatch} onChange={setSelBatch} opts={data.batches.map(b=>({v:b.id,l:b.name}))}/>}
          <Inp label="Message Template" value={msgType} onChange={setMsgType} opts={[
            {v:'classReminder',l:'📅 Class Reminder'},{v:'payReminder',l:'💳 Payment Reminder'},
            {v:'festival',l:'🎉 Festival Wishes'},{v:'birthday',l:'🎂 Birthday Wishes'},{v:'custom',l:'✍️ Custom'}
          ]}/>
          {msgType==='festival'&&<Inp label="Festival" value={festival} onChange={setFestival} placeholder="e.g. Diwali"/>}
          {msgType==='custom'&&<Inp label="Message" value={customMsg} onChange={setCustomMsg} rows={4} placeholder="Your message here…"/>}
          <div style={{fontSize:12,color:C.grey}}>{contacts.length} contacts · {selected.length>0?selected.length+' selected':'all selected by default'}</div>
        </Card>

        <Card>
          <Row style={{justifyContent:'space-between',marginBottom:8}}>
            <div style={{fontSize:13,fontWeight:700}}>Select Recipients</div>
            <Btn small outline onClick={()=>selected.length===contacts.length?setSelected([]):setSelected(contacts.map(c=>c.id))}>
              {selected.length===contacts.length?'Deselect All':'Select All'}
            </Btn>
          </Row>
          <div style={{maxHeight:260,overflowY:'auto'}}>
            {contacts.map(c=>(
              <div key={c.id} onClick={()=>setSelected(s=>s.includes(c.id)?s.filter(x=>x!==c.id):[...s,c.id])}
                style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',borderRadius:10,marginBottom:4,cursor:'pointer',background:selected.includes(c.id)?C.pinkPale:C.white,border:`1px solid ${selected.includes(c.id)?C.pink:C.pinkPale}`}}>
                <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${selected.includes(c.id)?C.pink:C.grey}`,background:selected.includes(c.id)?C.pink:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  {selected.includes(c.id)&&<Ic n="check" size={12} color={C.white}/>}
                </div>
                <div style={{width:30,height:30,borderRadius:'50%',background:`linear-gradient(135deg,${C.pink},${C.pinkD})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:13,flexShrink:0}}>{(c.name||'?')[0]}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</div>
                  <div style={{fontSize:11,color:C.grey}}>{c.mobile}</div>
                </div>
              </div>
            ))}
            {contacts.length===0&&<div style={{textAlign:'center',color:C.grey,padding:20,fontSize:13}}>No contacts in this list</div>}
          </div>
        </Card>

        <Btn color={C.wa} full onClick={sendContacts} style={{marginBottom:8}}>
          <Ic n="wa" size={16} color={C.white}/>Send to {selected.length>0?selected.length:contacts.length} Contact{(selected.length||contacts.length)!==1?'s':''}
        </Btn>
        <div style={{fontSize:11,color:C.grey,textAlign:'center',marginBottom:16}}>WhatsApp opens for first contact. Links for rest are copied to clipboard.</div>
      </div>}

      {/* ── CUSTOM ── */}
      {section==='custom'&&<Card>
        <STitle><Ic n="edit" size={15} color={C.pink}/> Custom Message</STitle>
        <Inp label="Your Message" value={customMsg} onChange={setCustomMsg} rows={7} placeholder="Type your custom announcement here…"/>
        <Row gap={8} style={{flexWrap:'wrap'}}>
          <Btn color={C.wa} onClick={()=>navigator.share?navigator.share({text:customMsg}):(navigator.clipboard?.writeText(customMsg),toast('Copied!'))}>
            <Ic n="share" size={14} color={C.white}/>Share
          </Btn>
          <a href={WA_COMMUNITY} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}><Btn color={C.wa}><Ic n="wa" size={14} color={C.white}/>Community</Btn></a>
          <Btn outline onClick={()=>{navigator.clipboard?.writeText(customMsg);toast('Copied!')}}><Ic n="copy" size={14} color={C.pink}/>Copy</Btn>
        </Row>
      </Card>}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   COURSES TAB
═══════════════════════════════════════════════════════════════════ */
