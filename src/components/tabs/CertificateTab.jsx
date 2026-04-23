import React, { useState, useRef } from 'react'
const STitle = SectionTitle
import { C, today, fmtDate, Ic, Btn, Card, Row, SectionTitle, Inp } from '../../lib/ui.jsx'
function KMSLogo({size=48,light=false}) {
  /* Artistic logo: circular badge with mehndi cone, makeup brush, ariwork palette
     Three art forms united — Kajol J Kamble, professional artist & teacher */
  const pk   = light ? '#FFB3D9' : '#E91E8C'
  const pkD  = light ? '#FF80C0' : '#C2185B'
  const gr   = light ? '#A5D6A7' : '#2E7D32'
  const pur  = light ? '#CE93D8' : '#6A1B9A'
  const bg   = light ? 'rgba(255,255,255,0.18)' : '#FFF0F6'
  const ring = light ? 'rgba(255,255,255,0.55)' : '#E91E8C'
  const txt  = light ? 'rgba(255,255,255,0.9)' : '#C2185B'
  const s    = size
  return (
    <svg width={s} height={s} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0}}>
      {/* Outer decorative ring */}
      <circle cx="60" cy="60" r="57" fill={bg} stroke={ring} strokeWidth="2.5" strokeDasharray="6 3" opacity="0.7"/>
      {/* Inner circle */}
      <circle cx="60" cy="60" r="48" fill={light?'rgba(255,255,255,0.12)':bg} stroke={ring} strokeWidth="1.2" opacity="0.5"/>

      {/* ── MEHNDI CONE (left, tilted) ── */}
      {/* Cone body */}
      <path d="M30 28 L42 72 L48 72 L38 28 Z" fill={gr} rx="3"/>
      {/* Cone tip */}
      <path d="M42 72 L45 85 L48 72 Z" fill={pkD}/>
      {/* Cone opening (top oval) */}
      <ellipse cx="34" cy="28" rx="7" ry="4" fill={gr} opacity="0.85"/>
      <ellipse cx="34" cy="27" rx="5" ry="2.5" fill="rgba(255,255,255,0.3)"/>
      {/* Mehndi flow from tip — decorative dots */}
      <circle cx="44" cy="89" r="2.5" fill={pk} opacity="0.9"/>
      <circle cx="43" cy="95" r="1.8" fill={pk} opacity="0.65"/>
      <circle cx="44.5" cy="100" r="1.2" fill={pk} opacity="0.4"/>
      {/* Mehndi cone cap band */}
      <rect x="31" y="36" width="12" height="4" rx="2" fill="rgba(255,255,255,0.3)" transform="rotate(-5 37 38)"/>
      {/* Mehndi pattern on cone */}
      <ellipse cx="35" cy="55" rx="2.5" ry="3.5" fill="rgba(255,255,255,0.22)" transform="rotate(-5 35 55)"/>

      {/* ── MAKEUP BRUSH (center, upright) ── */}
      {/* Handle */}
      <rect x="57" y="22" width="6" height="52" rx="3" fill="#8D5524"/>
      <rect x="58" y="22" width="2.5" height="52" rx="1.5" fill="rgba(255,255,255,0.22)"/>
      {/* Metal ferrule */}
      <rect x="56.5" y="65" width="7" height="7" rx="1.5" fill="#B0BEC5"/>
      <rect x="57.5" y="66" width="5" height="1.5" rx="1" fill="rgba(255,255,255,0.35)"/>
      {/* Brush head — soft bristles */}
      <ellipse cx="60" cy="20" rx="8" ry="12" fill={pk}/>
      <ellipse cx="60" cy="17" rx="5.5" ry="8" fill={pkD} opacity="0.7"/>
      <ellipse cx="60" cy="14" rx="3.5" ry="5" fill={pk} opacity="0.9"/>
      {/* Bristle highlights */}
      <path d="M56 10 Q60 6 64 10" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" fill="none"/>
      <path d="M57 13 Q60 10 63 13" stroke="rgba(255,255,255,0.4)" strokeWidth="0.9" fill="none"/>
      {/* Handle bottom cap */}
      <ellipse cx="60" cy="73" rx="3.5" ry="2" fill="#6D4C41"/>

      {/* ── ARIWORK PALETTE (right) ── */}
      {/* Palette body */}
      <path d="M76 35 Q95 30 100 50 Q105 68 90 80 Q82 86 76 78 Q70 70 72 58 Q68 48 76 35Z" fill={pur} opacity="0.85"/>
      <path d="M78 38 Q94 34 98 52 Q102 67 89 77 Q82 82 78 75 Q73 68 75 57 Q72 49 78 38Z" fill={light?'rgba(255,255,255,0.15)':pur} opacity="0.4"/>
      {/* Thumb hole */}
      <ellipse cx="83" cy="73" rx="5" ry="4" fill={bg} opacity="0.9"/>
      {/* Paint dots on palette */}
      <circle cx="85" cy="42" r="4.5" fill={pk}/>
      <circle cx="93" cy="52" r="4" fill={gr}/>
      <circle cx="94" cy="63" r="4" fill="#FF9800"/>
      <circle cx="88" cy="71" r="3.5" fill="#2196F3"/>
      <circle cx="80" cy="67" r="3.5" fill={pkD}/>
      <circle cx="79" cy="55" r="3" fill="#FFEB3B"/>
      {/* Palette shine */}
      <path d="M80 37 Q88 35 94 42" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

      {/* ── Central monogram "KMS" ── */}
      <text x="60" y="108" textAnchor="middle" fontSize="9" fontWeight="800" fill={txt} fontFamily="serif" letterSpacing="2" opacity="0.9">KMS</text>

      {/* Decorative mehndi petals around edge */}
      {[0,60,120,180,240,300].map((deg,i)=>{
        const rad=deg*Math.PI/180
        const cx=60+50*Math.cos(rad), cy=60+50*Math.sin(rad)
        return <circle key={i} cx={cx} cy={cy} r="2.5" fill={i%2===0?pk:gr} opacity="0.45"/>
      })}
    </svg>
  )
}

function KMSLogoMark({size=40,light=false}) {
  const textColor = light ? '#fff' : '#1A1A2E'
  const subColor  = light ? 'rgba(255,255,255,0.7)' : '#757575'
  return (
    <div style={{display:'flex',alignItems:'center',gap:9}}>
      <KMSLogo size={size} light={light}/>
      <div>
        <div style={{fontSize:13,fontWeight:900,letterSpacing:0.3,lineHeight:1.2,color:light?'#fff':'#E91E8C'}}>Kajol Makeover</div>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:2.2,color:subColor,textTransform:'uppercase'}}>S T U D I O Z</div>
      </div>
    </div>
  )
}
export default function CertificateTab({data,toast}) {
  const [selBatch,setSelBatch]=useState(data.batches[0]?.id||'')
  const [selStudent,setSelStudent]=useState('all')
  const [certDate,setCertDate]=useState(today())
  const [directorName]=useState('Kajol J Kamble')
  const SIGNATURE_STYLE={fontFamily:"'Dancing Script',Georgia,'Times New Roman',serif",fontSize:20,fontStyle:'italic',color:C.pink,fontWeight:700}
  const [preview,setPreview]=useState(null)
  const certRef=useRef()

  const batch   = data.batches.find(b=>b.id===selBatch)
  const course  = batch ? data.courses.find(c=>c.id===batch.course_id) : null
  const students= batch ? data.students.filter(s=>(batch.student_ids||[]).includes(s.id)) : []
  const targetStudents = selStudent==='all' ? students : students.filter(s=>s.id===selStudent)

  // Certificate — landscape A4 (297x210mm = 1.414:1), matches reference design
  const CertSVG = ({student}) => {
    const courseType = course?.type||'Mehndi'
    const courseEmoji = courseType==='Mehndi'?'🌿':courseType==='Makeup'?'💄':'🎨'
    return (
      <div id={'cert_'+student.id} style={{
        /* Landscape A4 ratio: 297/210 = 1.414 */
        width:'100%', aspectRatio:'1.414',
        background:'#ffffff',
        position:'relative', overflow:'hidden',
        fontFamily:"Georgia,'Times New Roman',serif",
        boxShadow:'0 8px 40px rgba(0,0,0,0.18)',
        borderRadius:6,
        display:'flex',
      }}>
        {/* ── LEFT CONTENT PANEL (white, ~65% width) ── */}
        <div style={{flex:'0 0 64%',padding:'5% 5% 5% 6%',display:'flex',flexDirection:'column',justifyContent:'space-between',zIndex:2,background:'#fff'}}>
          {/* Top: Logo + Studio name */}
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
            <KMSLogo size={40} light={false}/>
            <div>
              <div style={{fontSize:11,fontWeight:900,color:C.pink,letterSpacing:1}}>KAJOL MAKEOVER STUDIOZ</div>
              <div style={{fontSize:8,color:C.grey,letterSpacing:2,textTransform:'uppercase'}}>Pune · Maharashtra</div>
            </div>
          </div>

          {/* Big title — matches reference layout */}
          <div>
            <div style={{fontSize:8,color:C.grey,letterSpacing:4,textTransform:'uppercase',marginBottom:6}}>Certificate of Completion</div>
            <div style={{fontSize:28,fontWeight:900,color:C.pink,lineHeight:1.1,marginBottom:10,fontFamily:"Georgia,serif"}}>Certificate<br/>of Completion</div>
          </div>

          {/* Description line */}
          <div style={{fontSize:10,color:C.grey,lineHeight:1.6,marginBottom:6}}>
            For successfully completing the course on<br/>
            <span style={{fontWeight:700,color:C.dark}}>{courseEmoji} {course?.name||batch?.name}</span><br/>
            conducted at Kajol Makeover Studioz, Pune.
          </div>

          {/* Student name — cursive large */}
          <div>
            <div style={{fontFamily:"Georgia,'Dancing Script',serif",fontSize:22,color:C.dark,fontStyle:'italic',fontWeight:700,marginBottom:2,letterSpacing:.5,borderBottom:`1.5px solid ${C.grey}`,paddingBottom:4,display:'inline-block',minWidth:200}}>
              {student.name}
            </div>
            <div style={{fontSize:7,color:C.grey,letterSpacing:2,textTransform:'uppercase',marginTop:4}}>Presented To</div>
          </div>

          {/* Date + Signature row */}
          <div style={{display:'flex',gap:32,alignItems:'flex-end',marginTop:8}}>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:C.dark,marginBottom:2}}>{fmtDate(certDate)}</div>
              <div style={{width:90,height:1,background:C.grey,marginBottom:3}}/>
              <div style={{fontSize:7,color:C.grey,letterSpacing:1.5,textTransform:'uppercase'}}>Date</div>
            </div>
            <div>
              {/* Kajol J Kamble signature */}
              <div style={{fontFamily:"Georgia,serif",fontSize:16,color:C.pink,fontStyle:'italic',fontWeight:700,marginBottom:2,letterSpacing:.3}}>Kajol J Kamble</div>
              <div style={{width:110,height:1,background:C.grey,marginBottom:3}}/>
              <div style={{fontSize:7,color:C.grey,letterSpacing:1.5,textTransform:'uppercase'}}>Signature</div>
            </div>
          </div>

          {/* Bottom: website */}
          <div style={{fontSize:7,color:C.grey,marginTop:6,letterSpacing:.5}}>kajol-makeover-studioz.vercel.app · Batch: {batch?.name}</div>
        </div>

        {/* ── RIGHT DECORATIVE PANEL (~36% width) ── */}
        <div style={{flex:'0 0 36%',position:'relative',overflow:'hidden',background:'#fff'}}>
          {/* Woman silhouette — SVG, matches reference style */}
          <svg viewBox="0 0 200 300" style={{position:'absolute',inset:0,width:'100%',height:'100%'}} preserveAspectRatio="xMaxYMin slice">
            {/* Background fill */}
            <rect width="200" height="300" fill={C.pink} opacity="0.08"/>
            {/* Large decorative silhouette shape — woman face/hair profile */}
            <path d="M200 0 L200 300 L60 300 Q40 250 50 200 Q55 170 70 155 Q85 140 90 120 Q95 100 88 80 Q80 55 85 35 Q90 15 110 5 Q140 -5 170 5 Q195 15 200 0Z"
              fill={C.pink} opacity="0.18"/>
            <path d="M200 0 L200 300 L80 300 Q60 260 68 215 Q72 185 84 168 Q96 150 100 128 Q105 105 97 83 Q89 58 93 38 Q97 18 118 8 Q148 -2 178 8 Q200 18 200 0Z"
              fill={C.pink} opacity="0.3"/>
            <path d="M200 0 L200 300 L100 300 Q82 270 88 228 Q92 200 104 182 Q116 163 120 140 Q124 115 115 92 Q107 66 112 46 Q117 25 138 16 Q163 5 190 12 L200 0Z"
              fill={C.pink} opacity="0.55"/>
            {/* Hair flow — large sweeping curve at bottom */}
            <path d="M110 300 Q90 270 88 240 Q86 220 98 205 Q110 190 115 170 Q120 148 112 124 Q104 98 108 76 Q113 52 132 42 Q155 30 180 38 Q200 46 200 60 L200 300Z"
              fill={C.pinkD} opacity="0.7"/>
            {/* Decorative flowers like reference */}
            <circle cx="155" cy="200" r="8" fill={C.pink} opacity="0.5"/>
            <circle cx="168" cy="190" r="5" fill={C.pink} opacity="0.4"/>
            <circle cx="143" cy="210" r="4" fill={C.pink} opacity="0.35"/>
            {/* Small mehndi dots */}
            {[0,1,2,3].map(i=>(
              <circle key={i} cx={148+i*7} cy={230} r="2.5" fill={C.pink} opacity="0.3"/>
            ))}
            {/* Spiral at bottom like reference */}
            <path d="M130 280 Q120 265 128 255 Q136 245 145 252 Q152 258 148 268 Q144 276 136 275" stroke={C.pink} strokeWidth="2" fill="none" opacity="0.4"/>
          </svg>
          {/* Pink border overlay on left edge */}
          <div style={{position:'absolute',left:0,top:0,bottom:0,width:3,background:`linear-gradient(to bottom,${C.pink},${C.pinkD})`}}/>
        </div>

        {/* ── OUTER DECORATIVE BORDER ── */}
        <div style={{position:'absolute',inset:4,border:`2px solid ${C.pink}`,borderRadius:4,pointerEvents:'none',opacity:.25,zIndex:10}}/>
        <div style={{position:'absolute',inset:8,border:`1px solid ${C.green}`,borderRadius:3,pointerEvents:'none',opacity:.15,zIndex:10}}/>
      </div>
    )
  }

  const printCert = (student) => {
    const el = document.createElement('div')
    el.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:10000;display:flex;align-items:center;justify-content:center;'
    const inner = document.createElement('div')
    inner.style.width = '80vw'
    el.appendChild(inner)
    document.body.appendChild(el)

    // We'll use window.print() with the preview visible
    setPreview(student)
    setTimeout(()=>{
      window.print()
      document.body.removeChild(el)
    },300)
  }

  const sendWhatsApp = (student) => {
    const msg = `🎓 *Certificate of Completion*

Dear ${student.name},

Congratulations! 🌸 You have successfully completed the *${course?.name||batch?.name}* course at Kajol Makeover Studioz, Pune.

Your certificate has been prepared and will be dispatched to you shortly.

Keep creating beautiful art! 💄🌿🎨

— Kajol Ma'am
Kajol Makeover Studioz, Pune`
    window.open(`https://wa.me/91${student.mobile}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const sendEmail = (student) => {
    const subject = `Certificate of Completion — ${course?.name||batch?.name} | Kajol Makeover Studioz`
    const body = `Dear ${student.name},

Congratulations on successfully completing the ${course?.name||batch?.name} course at Kajol Makeover Studioz, Pune!

Your certificate has been prepared. Please find it attached or collect it from our studio.

Thank you for being a wonderful student!

Best regards,
Kajol J Kamble
Kajol Makeover Studioz, Pune
https://kajol-makeover-studioz.vercel.app`
    if(student.email) {
      window.open(`mailto:${student.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
    } else {
      alert(`No email address saved for ${student.name}. Please update their profile in the Students tab.`)
    }
  }

  return (
    <div>
      <Card accent={C.purple}>
        <STitle><Ic n="certificate" size={15} color={C.purple}/> Certificate Generator</STitle>
        <div style={{fontSize:12,color:C.grey,marginBottom:12}}>Generate, preview and send certificates to students. Print or dispatch by WhatsApp, email, or post.</div>

        <Inp label="Select Batch" value={selBatch} onChange={setSelBatch} opts={data.batches.map(b=>({v:b.id,l:b.name}))}/>
        <Inp label="Student" value={selStudent} onChange={setSelStudent} opts={[{v:'all',l:'All Students in Batch'},...students.map(s=>({v:s.id,l:s.name}))]}/>
        <Inp label="Certificate Date" value={certDate} onChange={setCertDate} type="date"/>

        {batch&&course&&(
          <div style={{background:C.pinkPale,borderRadius:10,padding:'10px 12px',marginBottom:12,fontSize:12}}>
            📚 Batch: <b>{batch.name}</b> · Course: <b>{course.name}</b> · {students.length} students enrolled
          </div>
        )}
      </Card>

      {/* Batch dispatch actions */}
      {targetStudents.length>0&&(
        <Card accent={C.green}>
          <STitle><Ic n="mailsend" size={15} color={C.green}/> Batch Dispatch ({targetStudents.length} students)</STitle>
          <div style={{fontSize:12,color:C.grey,marginBottom:12}}>Send congratulation messages to all selected students at once.</div>
          <Row gap={8} style={{flexWrap:'wrap'}}>
            <Btn small color={C.wa} onClick={()=>{targetStudents.forEach((s,i)=>{setTimeout(()=>sendWhatsApp(s),i*800)});toast(`WhatsApp opened for ${targetStudents.length} students!`);}}>
              <Ic n="wa" size={12} color={C.white}/> Send All on WhatsApp
            </Btn>
            <Btn small color={C.blue} onClick={()=>{targetStudents.forEach(s=>sendEmail(s));toast('Email compose opened!');}}>
              <Ic n="mailsend" size={12} color={C.white}/> Email All
            </Btn>
          </Row>
          <div style={{marginTop:10,background:C.greenPale,borderRadius:8,padding:'8px 12px',fontSize:11,color:C.green}}>
            📬 <b>Post/Courier:</b> Print each certificate (Print button below), write the student's address on envelope, and send via India Post or courier. You can find each student's address in the Students tab.
          </div>
        </Card>
      )}

      {/* Individual student certificates */}
      {!batch&&<div style={{textAlign:'center',color:C.grey,padding:32,background:C.white,borderRadius:16}}>
        <div style={{fontSize:36,marginBottom:8}}>🎓</div>
        <div style={{fontWeight:700}}>Select a batch to generate certificates</div>
      </div>}

      {targetStudents.map(student=>(
        <Card key={student.id} accent={C.purple}>
          <Row style={{justifyContent:'space-between',marginBottom:12}}>
            <div>
              <div style={{fontWeight:700,fontSize:15,color:C.dark}}>{student.name}</div>
              <div style={{fontSize:12,color:C.grey}}>📱 {student.mobile}{student.email&&` · ✉️ ${student.email}`}</div>
              {student.address&&<div style={{fontSize:11,color:C.grey}}>📍 {student.address}</div>}
            </div>
            <div style={{fontSize:32}}>🎓</div>
          </Row>

          {/* Certificate preview */}
          <div style={{marginBottom:12,transform:'scale(0.85)',transformOrigin:'top left',width:'117%'}}>
            <CertSVG student={student}/>
          </div>

          {/* Actions */}
          <Row gap={7} style={{flexWrap:'wrap',marginTop:8}}>
            <Btn small color={C.purple} onClick={()=>{
              // Open print dialog — user can Save as PDF from browser print dialog
              const printWin=window.open('','_blank','width=800,height=600')
              if(!printWin) return
              const certEl=document.getElementById('cert_'+student.id)
              if(certEl){
                const html='<html><head><title>Certificate</title></head><body style="margin:0;padding:20px;">'+certEl.innerHTML+'</body></html>';printWin.document.write(html)
                printWin.document.close()
                printWin.focus()
                setTimeout(()=>{printWin.print();},500)
              }else{window.print()}
            }}>
              📄 Save as PDF / Print
            </Btn>
            <Btn small color={C.wa} onClick={()=>sendWhatsApp(student)}>
              <Ic n="wa" size={12} color={C.white}/> WhatsApp
            </Btn>
            <Btn small color={C.blue} onClick={()=>sendEmail(student)}>
              <Ic n="mailsend" size={12} color={C.white}/> Email
            </Btn>
            <div style={{fontSize:11,color:C.grey,alignSelf:'center',padding:'0 4px'}}>
              {student.address?`📬 ${student.address}`:'⚠️ No address — add in Students tab for postal dispatch'}
            </div>
          </Row>
        </Card>
      ))}

      {/* Print styles */}
      <style>{`@media print{body>*:not(.print-area){display:none!important;}.print-area{display:block!important;}}`}</style>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   NAVIGATION CONFIG
═══════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════
   FINANCE TAB  — Income, Expenses, Month-wise P&L
═══════════════════════════════════════════════════════════════════ */
