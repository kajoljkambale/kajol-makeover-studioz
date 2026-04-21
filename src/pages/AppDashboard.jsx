import React, { useState, useEffect, useCallback } from 'react'
import { C, ADMIN_PWD, Ic, Spinner, Toast } from '../lib/ui.jsx'
import { supabase as sb, loadAllData } from '../lib/supabase.js'

import Login            from '../components/tabs/Login'
import Dashboard        from '../components/tabs/Dashboard'
import EnrollmentTab    from '../components/tabs/EnrollmentTab'
import StudentsTab      from '../components/tabs/StudentsTab'
import CoursesTab       from '../components/tabs/CoursesTab'
import BatchesTab       from '../components/tabs/BatchesTab'
import PaymentsTab      from '../components/tabs/PaymentsTab'
import LeadsOrdersTab   from '../components/tabs/LeadsOrdersTab'
import FinanceTab       from '../components/tabs/FinanceTab'
import ReportsTab       from '../components/tabs/ReportsTab'
import BroadcastTab     from '../components/tabs/BroadcastTab'
import CertificateTab   from '../components/tabs/CertificateTab'
import WebsiteEditorTab from '../components/tabs/WebsiteEditorTab'
import SettingsTab      from '../components/tabs/SettingsTab'
import EnrollForm       from './EnrollForm'


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
function AdminApp() {
  const [loggedIn,setLoggedIn] = useState(false)
  const [tab,setTab]           = useState('home')
  const [data,setData]         = useState({students:[],courses:[],batches:[],classes:[],homeworkCompliance:[],payments:[],orders:[],expenses:[],enrollmentRequests:[]})
  const [loading,setLoading]   = useState(false)
  const [toastMsg,setToastMsg] = useState('')

  const toast = useCallback(msg=>{ setToastMsg(msg); setTimeout(()=>setToastMsg(''),3000) },[])

  const login = async () => {
    setLoggedIn(true); setLoading(true)
    try { const d=await loadAllData(); setData(d) } catch(e){ console.error(e); toast('⚠️ Could not load data. Check Supabase.') }
    setLoading(false)
  }

  // Poll for new enrollment requests every 60s
  useEffect(()=>{
    if(!loggedIn) return
    const iv=setInterval(async()=>{
      try {
        const {data:rows}=await sb.from('enrollment_requests').select('*').eq('status','pending')
        if(rows) setData(d=>{
          const newOnes=rows.filter(r=>!(d.enrollmentRequests||[]).find(x=>x.id===r.id))
          if(newOnes.length) toast(`📋 ${newOnes.length} new enrollment request!`)
          return {...d,enrollmentRequests:[...(d.enrollmentRequests||[]).filter(r=>r.status!=='pending'),...rows]}
        })
      }catch{}
    },60000)
    return ()=>clearInterval(iv)
  },[loggedIn])

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Nunito','Segoe UI',sans-serif;background:#FFF8FB;}
    input:focus,select:focus,textarea:focus{border-color:#E91E8C!important;outline:none;}
    a{-webkit-tap-highlight-color:transparent;}
    button{-webkit-tap-highlight-color:transparent;}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-thumb{background:#FCE4EC;border-radius:4px}
    /* Desktop: sidebar visible, bottom nav hidden */
    @media(min-width:768px){
      .sidebar-nav{display:flex!important;}
      .bottom-nav-bar{display:none!important;}
      .main-area{margin-left:220px;}
      .main-content-pad{padding:24px 32px 40px!important;}
      .content-inner{max-width:860px;margin:0 auto;}
    }
    @media(max-width:767px){
      .sidebar-nav{display:none!important;}
      .main-area{margin-left:0;}
    }
  `

  if(!loggedIn) return <div><style>{CSS}</style><Login onLogin={login}/></div>

  const pendingReq=(data.enrollmentRequests||[]).filter(r=>r.status==='pending').length

  return (
    <div><style>{CSS}</style>
      <div style={{display:'flex',minHeight:'100vh',background:'#FFF8FB'}}>

        {/* SIDEBAR (desktop) */}
        <aside className="sidebar-nav" style={{width:220,flexShrink:0,background:C.white,borderRight:`1px solid ${C.pinkPale}`,position:'fixed',top:0,left:0,bottom:0,zIndex:200,boxShadow:'2px 0 20px rgba(233,30,140,0.08)',flexDirection:'column',overflowY:'auto'}}>
          <div style={{background:`linear-gradient(135deg,${C.pink},${C.pinkD})`,padding:'20px 16px'}}>
            <div style={{fontSize:28,marginBottom:8}}>💄</div>
            <div style={{fontSize:13,fontWeight:900,color:'#fff',lineHeight:1.3}}>Kajol Makeover Studioz</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.8)',marginTop:3}}>Admin v3.1</div>
          </div>
          <nav style={{flex:1,padding:'8px 0'}}>
            {TABS.map(t=>(
              <div key={t.id} onClick={()=>setTab(t.id)} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 16px',cursor:'pointer',transition:'all .15s',background:tab===t.id?C.pinkPale:'transparent',borderLeft:tab===t.id?`3px solid ${C.pink}`:'3px solid transparent',color:tab===t.id?C.pink:C.grey,fontWeight:tab===t.id?700:500,fontSize:13,position:'relative'}}>
                <Ic n={t.icon} size={17} color={tab===t.id?C.pink:C.grey}/>{t.label}
                {t.id==='enroll'&&pendingReq>0&&<span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:C.red,color:'#fff',borderRadius:'50%',width:18,height:18,fontSize:10,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center'}}>{pendingReq}</span>}
              </div>
            ))}
          </nav>
          <div style={{padding:'12px 16px',borderTop:`1px solid ${C.pinkPale}`}}>
            <button onClick={()=>setLoggedIn(false)} style={{width:'100%',padding:'9px',borderRadius:10,background:C.pinkPale,border:'none',color:C.pink,fontWeight:700,cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:8,justifyContent:'center',fontFamily:'inherit'}}><Ic n="lock" size={14} color={C.pink}/>Logout</button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="main-area" style={{flex:1,display:'flex',flexDirection:'column',minHeight:'100vh'}}>
          <header style={{background:`linear-gradient(135deg,${C.pink},${C.pinkD})`,color:'#fff',padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100,boxShadow:'0 4px 20px rgba(233,30,140,0.4)'}}>
            <div><div style={{fontSize:16,fontWeight:800,letterSpacing:.3}}>💄 {TITLES[tab]||tab}</div><div style={{fontSize:10,opacity:.85}}>Kajol Makeover Studioz</div></div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              {pendingReq>0&&<div onClick={()=>setTab('enroll')} style={{background:'rgba(255,255,255,0.25)',borderRadius:20,padding:'4px 10px',fontSize:11,fontWeight:700,cursor:'pointer'}}>📋 {pendingReq} New</div>}
              <div style={{width:34,height:34,borderRadius:'50%',background:'rgba(255,255,255,0.2)',border:'2px solid rgba(255,255,255,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:15}}>K</div>
            </div>
          </header>

          <main className="main-content-pad" style={{padding:'14px 14px 90px',flex:1}}>
            <div className="content-inner">
              {loading?<Spinner/>:<>
                {tab==='home'     &&<Dashboard     data={data} setTab={setTab}/>}
                {tab==='enroll'   &&<EnrollmentTab data={data} setData={setData} toast={toast}/>}
                {tab==='students' &&<StudentsTab   data={data} setData={setData} toast={toast}/>}
                {tab==='courses'  &&<CoursesTab    data={data} setData={setData} toast={toast}/>}
                {tab==='batches'  &&<BatchesTab    data={data} setData={setData} toast={toast}/>}
                {tab==='payments' &&<PaymentsTab   data={data} setData={setData} toast={toast}/>}
                {tab==='finance'  &&<FinanceTab    data={data} setData={setData} toast={toast}/>}
                {tab==='reports'  &&<ReportsTab    data={data}/>}
                {tab==='broadcast'&&<BroadcastTab  data={data} toast={toast}/>}
                {tab==='orders'   &&<LeadsOrdersTab data={data} setData={setData} toast={toast}/>}
                {tab==='leads'    &&<LeadsOrdersTab data={data} setData={setData} toast={toast}/>}
                {tab==='website'  &&<WebsiteEditorTab toast={toast}/>}
                {tab==='settings' &&<SettingsTab   data={data} setData={setData} onLogout={()=>setLoggedIn(false)} toast={toast}/>}
              </>}
            </div>
          </main>
        </div>

        {/* MOBILE BOTTOM NAV */}
        <nav className="bottom-nav-bar" style={{background:C.white,display:'flex',borderTop:`1px solid ${C.pinkPale}`,position:'fixed',bottom:0,left:0,right:0,zIndex:100,boxShadow:'0 -4px 20px rgba(233,30,140,0.1)'}}>
          {BOTTOM_NAV.map(id=>{const t=TABS.find(x=>x.id===id);if(!t)return null;return(
            <div key={id} onClick={()=>setTab(id)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'7px 2px 6px',cursor:'pointer',color:tab===id?C.pink:C.grey,background:tab===id?C.pinkPale:'transparent',borderTop:tab===id?`2px solid ${C.pink}`:'2px solid transparent',fontSize:'8px',fontWeight:tab===id?800:400,gap:2,minWidth:0,position:'relative'}}>
              <Ic n={t.icon} size={17} color={tab===id?C.pink:C.grey}/>{t.label}
              {id==='enroll'&&pendingReq>0&&<span style={{position:'absolute',top:2,right:'8%',background:C.red,color:'#fff',borderRadius:'50%',width:14,height:14,fontSize:8,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center'}}>{pendingReq}</span>}
            </div>
          )})}
          {/* More → Settings/Finance/Reports/Courses/Orders */}
          <div onClick={()=>setTab(['courses','finance','reports','orders','settings'].includes(tab)?'home':'settings')} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'7px 2px 6px',cursor:'pointer',color:['courses','finance','reports','orders','settings'].includes(tab)?C.pink:C.grey,borderTop:['courses','finance','reports','orders','settings'].includes(tab)?`2px solid ${C.pink}`:'2px solid transparent',fontSize:'8px',fontWeight:400,gap:2,minWidth:0}}>
            <Ic n="settings" size={17} color={['courses','finance','reports','orders','settings'].includes(tab)?C.pink:C.grey}/>More
          </div>
        </nav>
      </div>
      <Toast msg={toastMsg}/>
    </div>
  )
}

export default function AppDashboard() {
  /* useLocation gives the correct path from React Router — fixes blank /enroll page */
  const _path = typeof window !== 'undefined' ? window.location.pathname : ''
  const isEnroll = _path === '/enroll' || _path.startsWith('/enroll/')
  if(isEnroll) return (
    <div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Nunito','Segoe UI',sans-serif;}`}</style>
      <EnrollForm/>
    </div>
  )
  return <AdminApp/>
}
