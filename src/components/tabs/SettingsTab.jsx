import React, { useState } from 'react'
import { C, ADMIN_PWD, uid, Ic, Btn, Card, Row, Inp, SectionTitle, DelConfirm } from '../../lib/ui.jsx'
import { clearAllData } from '../../lib/supabase.js'

const ENROLL_URL   = (typeof window !== 'undefined' ? window.location.origin : 'https://kajol-makeover-studioz.vercel.app') + '/enroll'
const WA_COMMUNITY = 'https://chat.whatsapp.com/Lhq5qzRYJ0z11onVX669a3'
const INSTAGRAM    = 'https://www.instagram.com/kajol_makeover_studioz?igsh=a3h2ZWIzbmM3M3Y3'
const YOUTUBE      = 'https://youtube.com/@kajolmakeoverstudioz?si=IsWwx4ScqJ33ZAqp'
export default function SettingsTab({data,setData,onLogout,toast}) {
  const [confirmClear,setConfirmClear]=useState(false)
  const [pwd,setPwd]=useState(''); const [err,setErr]=useState(''); const [busy,setBusy]=useState(false)

  const handleClear=async()=>{
    if(pwd!==ADMIN_PWD){setErr('Wrong password.');return}
    setBusy(true)
    try{await clearAll();setData({students:[],courses:[],batches:[],classes:[],homeworkCompliance:[],payments:[],orders:[],expenses:[],enrollmentRequests:[]});toast('All data cleared!');setConfirmClear(false)}
    catch(e){toast('Error: '+e.message)}
    setBusy(false)
  }

  return (
    <div>
      <Card accent={C.pink}>
        <STitle><Ic n="settings" size={15} color={C.pink}/> Admin Settings</STitle>
        <div style={{fontSize:13,color:C.grey,lineHeight:1.7}}>
          Studio: <b>Kajol Makeover Studioz</b><br/>
          Admin Password: <b>●●●●●●●●</b><br/>
          Version: <b>v3.1</b><br/>
          Supabase: <b>{SB_URL.replace('https://','').split('.')[0]}...</b>
        </div>
      </Card>

      <Card accent={C.blue}>
        <STitle><Ic n="report" size={15} color={C.blue}/> Data Summary</STitle>
        {[['Students',data.students.length],['Courses',data.courses.length],['Batches',data.batches.length],['Classes',data.classes.length],['Payments',data.payments.length],['Orders',data.orders.length],['Expenses',data.expenses.length]].map(([l,v])=>(
          <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:`1px solid ${C.pinkPale}`,fontSize:13}}>
            <span style={{color:C.grey}}>{l}</span>
            <span style={{fontWeight:700,color:C.dark}}>{v} records</span>
          </div>
        ))}
      </Card>

      <Card accent={C.wa}>
        <STitle><Ic n="link" size={15} color={C.wa}/> Quick Links</STitle>
        {[{l:'Enrollment Form',u:ENROLL_URL},{l:'WhatsApp Community',u:WA_COMMUNITY},{l:'Instagram',u:INSTAGRAM},{l:'YouTube Channel',u:YOUTUBE}].map(x=>(
          <div key={x.u} style={{padding:'7px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
            <a href={x.u} target="_blank" rel="noopener noreferrer" style={{fontSize:13,color:C.blue,textDecoration:'none'}}>{x.l} →</a>
          </div>
        ))}
      </Card>

      <Card accent={C.red}>
        <STitle><Ic n="alert" size={15} color={C.red}/> Danger Zone</STitle>
        <div style={{fontSize:12,color:C.grey,marginBottom:10}}>⚠️ This will permanently delete ALL data from Supabase. This cannot be undone.</div>
        {!confirmClear&&<Btn color={C.red} onClick={()=>setConfirmClear(true)}>🗑️ Clear All Data</Btn>}
        {confirmClear&&<>
          <Inp label="Admin Password to Confirm" value={pwd} onChange={v=>{setPwd(v);setErr('')}} type="password"/>
          {err&&<div style={{color:C.red,fontSize:12,marginBottom:8}}>{err}</div>}
          <Row gap={8}>
            <Btn outline onClick={()=>setConfirmClear(false)} full>Cancel</Btn>
            <Btn color={C.red} onClick={handleClear} full disabled={busy}>{busy?'Clearing…':'Confirm Delete All'}</Btn>
          </Row>
        </>}
      </Card>

      <Btn outline color={C.grey} full onClick={onLogout} style={{marginTop:8}}>
        <Ic n="lock" size={14} color={C.grey}/>Logout
      </Btn>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════
   NAVIGATION CONFIG
═══════════════════════════════════════════════════════════════════ */
const TABS=[
  {id:'home',     label:'Home',      icon:'home'},
  {id:'enroll',   label:'Requests',  icon:'enroll'},
  {id:'students', label:'Students',  icon:'students'},
  {id:'courses',  label:'Courses',   icon:'course'},
  {id:'batches',  label:'Batches',   icon:'batch'},
  {id:'payments', label:'Payments',  icon:'pay'},
  {id:'orders',   label:'Orders',    icon:'order'},
  {id:'finance',  label:'Finance',   icon:'chart'},
  {id:'reports',  label:'Reports',   icon:'report'},
  {id:'broadcast',label:'Broadcast', icon:'broadcast'},
  {id:'website',  label:'Website',   icon:'globe'},
  {id:'settings', label:'Settings',  icon:'settings'},
]
const TITLES={home:'Dashboard',orders:'Leads & Orders',enroll:'Enrollment Requests',students:'Students',courses:'Courses & Syllabus',batches:'Batches & Classes',payments:'Payments',finance:'Finance & Expenses',reports:'Reports',broadcast:'Broadcast Messaging',leads:'Leads & Orders (Pune)',website:'Website Editor',settings:'Settings & Admin'}
const BOTTOM_NAV=['home','enroll','students','batches','payments','broadcast']

/* ═══════════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════════ */
