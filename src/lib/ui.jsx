import React from 'react'
// ══════════════════════════════════════════
//  CONSTANTS & HELPERS
// ══════════════════════════════════════════

export const C = {
  pink:'#E91E8C', pinkD:'#C2185B', pinkL:'#F48FB1', pinkPale:'#FCE4EC', pinkBg:'#FFF0F7',
  green:'#2E7D32', greenL:'#4CAF50', greenPale:'#E8F5E9',
  white:'#FFFFFF', offWhite:'#FFF8FB', grey:'#757575', greyL:'#F5F5F5',
  dark:'#1A1A2E', amber:'#FF6F00', amberL:'#FFA000', red:'#D32F2F',
  blue:'#1565C0', blueL:'#42A5F5', teal:'#00695C', purple:'#6A1B9A',
  wa:'#25D366', ig:'#E1306C', yt:'#FF0000',
}

export const uid = () => crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2)
export const today = () => new Date().toISOString().split('T')[0]
export const fmt = n => `₹${Number(n||0).toLocaleString('en-IN')}`
export const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'
export const monthKey = d => d ? d.slice(0,7) : ''
export const monthLabel = m => m ? new Date(m+'-01').toLocaleDateString('en-IN',{month:'long',year:'numeric'}) : ''

export const ADMIN_PWD = 'kajol2024'

export const COURSE_TYPES = ['Mehndi','Makeup','ArtWork','Combined']
export const ORDER_TYPES   = ['Mehndi','Makeup','ArtWork','Combined']
export const SCHEDULE_OPTS = ['Daily','3 Days/Week','Weekend Only','Tue-Thu-Sat','Mon-Wed-Fri','Custom']
export const DURATION_OPTS = ['10 Days','Monthly','3 Months','Custom']
export const EXP_CATS      = ['Advertising','Study Material','Equipment','Mehndi Cones','Makeup Kit','Zoom Subscription','Internet','Transport','Other']

// ══════════════════════════════════════════
//  SVG ICON
// ══════════════════════════════════════════
const PATHS = {
  home:'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  students:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2',
  batch:'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  payments:'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  finance:'M18 20V10M12 20V4M6 20v-6',
  reports:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
  orders:'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z',
  links:'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71',
  add:'M12 5v14M5 12h14',
  del:'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
  edit:'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7',
  close:'M18 6L6 18M6 6l12 12',
  check:'M20 6L9 17l-5-5',
  lock:'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4',
  eye:'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  eyeOff:'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22',
  whatsapp:'M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.07-1.35A9.93 9.93 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z',
  youtube:'M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z',
  zoom:'M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.362a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z',
  bell:'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  search:'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  upload:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
  calendar:'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18',
  share:'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13',
  book:'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5z',
  rupee:'M6 3h12M6 8h12M15 3v18M6 13h8.5a4.5 4.5 0 0 0 0-9',
  star:'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  alert:'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  trend:'M23 6l-9.5 9.5-5-5L1 18',
  course:'M22 10v6M2 10l10-5 10 5-10 5z',
  filter:'M22 3H2l8 9.46V19l4 2v-8.54L22 3',
  instagram:'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919z',
  broadcast:'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.37h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.8-1.8a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  settings:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4',
  trash2:'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6',
  info:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 16v-4M12 8h.01',
  copy:'M20 9H11a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 0 2 2v1',
  loader:'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83',
}

export function Ic({n, size=18, color='currentColor', style:sx}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={sx}>
      <path d={PATHS[n]||''}/>
      {n==='students'&&<><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>}
      {n==='youtube'&&<polygon points="9.5,14.5 15.5,12 9.5,9.5" fill={color} stroke="none"/>}
    </svg>
  )
}

// ══════════════════════════════════════════
//  SHARED UI COMPONENTS
// ══════════════════════════════════════════

export function Modal({onClose, children, title, wide}) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',display:'flex',
      alignItems:'flex-end',zIndex:800,backdropFilter:'blur(4px)'}} onClick={onClose}>
      <div className="slide-up" style={{background:C.white,borderRadius:'24px 24px 0 0',width:'100%',
        maxWidth: wide ? 700 : 480, margin:'0 auto',padding:'20px 18px 32px',
        maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        {title&&<div style={{fontSize:16,fontWeight:700,color:C.dark,marginBottom:14,
          display:'flex',alignItems:'center',gap:8}}>{title}</div>}
        {children}
      </div>
    </div>
  )
}

export function Inp({label, value, onChange, type='text', placeholder, opts, rows}) {
  const base = {width:'100%',padding:'10px 12px',borderRadius:10,border:`1.5px solid ${C.pinkPale}`,
    fontSize:13,fontFamily:'inherit',outline:'none',color:C.dark,boxSizing:'border-box',background:C.white}
  return (
    <div style={{marginBottom:10}}>
      {label&&<label style={{fontSize:11,fontWeight:700,color:C.grey,display:'block',
        marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>{label}</label>}
      {opts ? (
        <select value={value||''} onChange={e=>onChange(e.target.value)} style={base}>
          {opts.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
        </select>
      ) : rows ? (
        <textarea value={value||''} onChange={e=>onChange(e.target.value)}
          placeholder={placeholder||label} rows={rows} style={{...base,resize:'vertical'}}/>
      ) : (
        <input type={type} value={value||''} onChange={e=>onChange(e.target.value)}
          placeholder={placeholder||label} style={base}/>
      )}
    </div>
  )
}

export function Btn({children, onClick, color=C.pink, outline, small, full, style:sx, disabled}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? C.greyL : outline ? 'transparent' : `linear-gradient(135deg,${color},${color}CC)`,
      color: disabled ? C.grey : outline ? color : C.white,
      border: outline ? `1.5px solid ${color}` : 'none',
      borderRadius:10, padding: small ? '7px 13px' : '10px 16px',
      fontSize: small ? 12 : 13, fontWeight:600, cursor: disabled ? 'not-allowed' : 'pointer',
      display:'inline-flex', alignItems:'center', gap:5,
      width: full ? '100%' : undefined, justifyContent: full ? 'center' : undefined,
      boxShadow: outline||disabled ? 'none' : `0 4px 12px ${color}44`,
      fontFamily:'inherit', transition:'all .15s', ...sx
    }}>{children}</button>
  )
}

export function Badge({children, color=C.pink}) {
  return <span style={{background:color+'18',color,borderRadius:20,padding:'2px 9px',
    fontSize:11,fontWeight:700,display:'inline-block',whiteSpace:'nowrap'}}>{children}</span>
}

export function Card({children, style:sx, accent}) {
  return <div className="fade-in" style={{background:C.white,borderRadius:16,padding:15,marginBottom:10,
    boxShadow:'0 2px 12px rgba(233,30,140,0.07)',border:`1px solid ${C.pinkPale}`,
    borderLeft: accent ? `4px solid ${accent}` : undefined,...sx}}>{children}</div>
}

export function Divider() { return <div style={{height:1,background:C.pinkPale,margin:'10px 0'}}/> }

export function Row({children, gap=8, style:sx}) {
  return <div style={{display:'flex',gap,alignItems:'center',...sx}}>{children}</div>
}

export function SectionTitle({children, color=C.pink}) {
  return <div style={{fontSize:15,fontWeight:700,color:C.dark,marginBottom:12,
    display:'flex',alignItems:'center',gap:7}}>{children}</div>
}

export function StatBox({label, value, color, icon, sub, onClick}) {
  return (
    <div onClick={onClick} style={{background:C.white,borderRadius:14,padding:13,
      boxShadow:'0 2px 10px rgba(0,0,0,0.06)',border:`1px solid ${C.pinkPale}`,
      flex:1, minWidth:0, cursor: onClick ? 'pointer' : 'default',
      transition: onClick ? 'transform .15s' : 'none'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div style={{minWidth:0}}>
          <div style={{fontSize:10,color:C.grey,fontWeight:700,textTransform:'uppercase',letterSpacing:.5}}>{label}</div>
          <div style={{fontSize:18,fontWeight:800,color,marginTop:3,overflow:'hidden',
            textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{value}</div>
          {sub&&<div style={{fontSize:10,color:C.grey,marginTop:2}}>{sub}</div>}
        </div>
        {icon&&<div style={{background:color+'15',borderRadius:10,padding:8,flexShrink:0}}>
          <Ic n={icon} size={16} color={color}/>
        </div>}
      </div>
    </div>
  )
}

export function Toggle({checked, onChange}) {
  return (
    <div onClick={()=>onChange(!checked)} style={{width:44,height:24,borderRadius:12,
      background: checked ? C.green : C.greyL, cursor:'pointer', position:'relative',
      transition:'all .2s', flexShrink:0}}>
      <div style={{position:'absolute',top:2,left:checked?22:2,width:20,height:20,
        borderRadius:'50%',background:C.white,boxShadow:'0 1px 4px rgba(0,0,0,0.3)',
        transition:'all .2s'}}/>
    </div>
  )
}

export function Spinner() {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:40}}>
      <div style={{width:32,height:32,borderRadius:'50%',
        border:`3px solid ${C.pinkPale}`,borderTopColor:C.pink,
        animation:'spin 0.8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export function Toast({msg}) {
  if (!msg) return null
  return <div className="toast">{msg}</div>
}

export function DelConfirm({item, onConfirm, onClose}) {
  const [pwd,setPwd] = React.useState('')
  const [err,setErr] = React.useState('')
  return (
    <Modal onClose={onClose} title={<><Ic n="alert" size={16} color={C.red}/> Confirm Delete</>}>
      <div style={{fontSize:13,color:C.grey,marginBottom:14}}>
        Admin approval required to delete <b>{item}</b>.
      </div>
      <Inp label="Admin Password" value={pwd} onChange={v=>{setPwd(v);setErr('')}} type="password" placeholder="Enter password"/>
      {err&&<div style={{color:C.red,fontSize:12,marginBottom:8,background:C.red+'12',borderRadius:8,padding:'6px 10px'}}>{err}</div>}
      <Row>
        <Btn outline onClick={onClose} full>Cancel</Btn>
        <Btn color={C.red} onClick={()=>{
          if(pwd===ADMIN_PWD){onConfirm();onClose();}else setErr('Wrong password.')
        }} full>Delete</Btn>
      </Row>
    </Modal>
  )
}

