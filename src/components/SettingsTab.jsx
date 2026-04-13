import React, { useState } from 'react'
import { C, ADMIN_PWD, Ic, Card, Row, SectionTitle, Btn, Inp, Modal } from '../lib/ui.jsx'
import { clearAllData, dbUpsert } from '../lib/supabase.js'

export default function SettingsTab({ data, setData, onLogout, toast }) {
  const [modal, setModal]       = useState(null)
  const [pwd, setPwd]           = useState('')
  const [err, setErr]           = useState('')
  const [clearing, setClearing] = useState(false)
  const [newPwd, setNewPwd]     = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [adminPwd, setAdminPwd] = useState('')

  const handleClearAll = async () => {
    if (pwd !== ADMIN_PWD) { setErr('Wrong password.'); return }
    setClearing(true)
    await clearAllData()
    setData({ students:[], courses:[], batches:[], classes:[], homeworkCompliance:[],
               payments:[], orders:[], expenses:[], reminders:[] })
    setClearing(false)
    setModal(null)
    setPwd('')
    toast('All app data cleared.')
  }

  const exportData = () => {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `kajol-studio-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click(); URL.revokeObjectURL(url)
    toast('Data exported!')
  }

  const stats = [
    ['Students', data.students.length],
    ['Courses', data.courses.length],
    ['Batches', data.batches.length],
    ['Classes', data.classes.length],
    ['Payments', data.payments.length],
    ['Orders', data.orders.length],
    ['Expenses', data.expenses.length],
  ]

  return (
    <div>
      <SectionTitle><Ic n="settings" size={15} color={C.pink}/> Settings & Admin</SectionTitle>

      {/* App Info */}
      <Card>
        <div style={{textAlign:'center',padding:'8px 0 16px'}}>
          <div style={{fontSize:48,marginBottom:8}}>💄</div>
          <div style={{fontSize:18,fontWeight:900,color:C.dark}}>Kajol Makeover Studioz</div>
          <div style={{fontSize:12,color:C.grey,marginTop:4}}>Version 2.0 · Cloud Edition</div>
          <div style={{fontSize:11,color:C.grey,marginTop:2}}>Makeup · Artwork · Mehndi</div>
        </div>
      </Card>

      {/* Database Stats */}
      <Card>
        <SectionTitle><Ic n="finance" size={15} color={C.blue}/> Database Records</SectionTitle>
        {stats.map(([label, count])=>(
          <div key={label} style={{display:'flex',justifyContent:'space-between',
            fontSize:13,padding:'6px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
            <span style={{color:C.grey}}>{label}</span>
            <span style={{fontWeight:700,color:C.dark}}>{count} record{count!==1?'s':''}</span>
          </div>
        ))}
      </Card>

      {/* Supabase Info */}
      <Card accent={C.green}>
        <SectionTitle><Ic n="info" size={15} color={C.green}/> Cloud Database</SectionTitle>
        <div style={{fontSize:12,color:C.grey,marginBottom:8}}>Connected to Supabase cloud database. All data is stored securely in the cloud and accessible from any device.</div>
        <div style={{fontSize:11,background:C.greenPale,borderRadius:8,padding:'8px 10px',color:C.green,fontWeight:600,wordBreak:'break-all'}}>
          🟢 {import.meta.env.VITE_SUPABASE_URL||'https://zlzrdpagpwlrbljfmxzy.supabase.co'}
        </div>
      </Card>

      {/* Export Data */}
      <Card>
        <SectionTitle><Ic n="upload" size={15} color={C.blue}/> Data Backup</SectionTitle>
        <div style={{fontSize:12,color:C.grey,marginBottom:12}}>Export all your data as a JSON backup file. Recommended before clearing data.</div>
        <Btn color={C.blue} onClick={exportData} full>
          <Ic n="upload" size={14} color={C.white}/>Export All Data (JSON)
        </Btn>
      </Card>

      {/* Social Links */}
      <Card>
        <SectionTitle><Ic n="links" size={15} color={C.pink}/> Social Links</SectionTitle>
        {[
          {label:'WhatsApp Community', url:'https://chat.whatsapp.com/Lhq5qzRYJ0z11onVX669a3', icon:'whatsapp', color:'#25D366'},
          {label:'Instagram', url:'https://www.instagram.com/kajol_makeover_studioz?igsh=a3h2ZWIzbmM3M3Y3', icon:'instagram', color:'#E91E63'},
          {label:'YouTube', url:'https://youtube.com/@kajolmakeoverstudioz?si=IsWwx4ScqJ33ZAqp', icon:'youtube', color:'#FF0000'},
        ].map(l=>(
          <div key={l.label} style={{display:'flex',alignItems:'center',justifyContent:'space-between',
            padding:'9px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{background:l.color+'18',borderRadius:9,padding:6,flexShrink:0}}>
                <Ic n={l.icon} size={15} color={l.color}/>
              </div>
              <span style={{fontSize:13,fontWeight:600}}>{l.label}</span>
            </div>
            <Row gap={6}>
              <a href={l.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>
                <Btn small color={l.color}>Open</Btn>
              </a>
              <Btn small outline onClick={()=>{navigator.clipboard.writeText(l.url);toast('Link copied!')}}>Copy</Btn>
            </Row>
          </div>
        ))}
      </Card>

      {/* Danger Zone */}
      <Card accent={C.red}>
        <SectionTitle><Ic n="alert" size={15} color={C.red}/> Danger Zone</SectionTitle>
        <div style={{fontSize:12,color:C.grey,marginBottom:12}}>
          Permanently delete ALL app data including students, batches, payments, orders and expenses. This action cannot be undone.
        </div>
        <Btn color={C.red} onClick={()=>{setPwd('');setErr('');setModal('clear')}} full>
          <Ic n="trash2" size={14} color={C.white}/>Clear All App Data
        </Btn>
        <Btn outline onClick={onLogout} full style={{marginTop:10}}>
          <Ic n="lock" size={14} color={C.pink}/>Logout
        </Btn>
      </Card>

      {/* Clear Confirm Modal */}
      {modal==='clear'&&(
        <Modal onClose={()=>setModal(null)} title={<><Ic n="alert" size={16} color={C.red}/> Clear All Data</>}>
          <div style={{background:'#FF172215',borderRadius:10,padding:12,marginBottom:14,fontSize:13,color:C.red,lineHeight:1.6}}>
            ⚠️ This will permanently delete ALL records from the database including all students, batches, classes, payments, orders, and expenses. This CANNOT be undone.
          </div>
          <div style={{fontSize:13,color:C.grey,marginBottom:12}}>Type your admin password to confirm:</div>
          <Inp label="Admin Password" value={pwd} onChange={v=>{setPwd(v);setErr('')}} type="password" placeholder="Enter password"/>
          {err&&<div style={{color:C.red,fontSize:12,marginBottom:8,background:C.red+'12',borderRadius:8,padding:'6px 10px'}}>{err}</div>}
          <Row gap={8}>
            <Btn outline onClick={()=>setModal(null)} full>Cancel</Btn>
            <Btn color={C.red} onClick={handleClearAll} full disabled={clearing}>
              {clearing?'Clearing…':'Yes, Delete Everything'}
            </Btn>
          </Row>
        </Modal>
      )}
    </div>
  )
}
