import React, { useState, useMemo } from 'react'
import { C, uid, today, fmt, fmtDate,
         Ic, Modal, Inp, Btn, Badge, Card, Row, Divider, SectionTitle, StatBox,
         Toggle, DelConfirm } from '../../lib/ui.jsx'
import { dbUpsert, dbDelete } from '../../lib/supabase.js'
const STitle = SectionTitle

/* ── Inline Excel export (SheetJS via CDN loaded once) ── */
let _xlsxReady = false
function loadXLSX(cb) {
  if (window.XLSX) { cb(window.XLSX); return }
  if (_xlsxReady) { setTimeout(()=>loadXLSX(cb), 80); return }
  _xlsxReady = true
  const s = document.createElement('script')
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
  s.onload = () => cb(window.XLSX)
  document.head.appendChild(s)
}

function exportExcel(data, toast) {
  loadXLSX(XLSX => {
    const wb = XLSX.utils.book_new()

    /* ── Helper: style header row (openpyxl not available client-side; use SheetJS aoaoa) ── */
    const pink = 'FFE91E8C'
    const green = 'FF2E7D32'
    const hdrStyle = { font:{bold:true,color:{rgb:'FFFFFFFF'}}, fill:{patternType:'solid',fgColor:{rgb:pink}}, alignment:{horizontal:'center'} }
    const subHdr   = { font:{bold:true,color:{rgb:'FFFFFFFF'}}, fill:{patternType:'solid',fgColor:{rgb:green}}, alignment:{horizontal:'center'} }

    /* ── Helpers ── */
    const getStudentBatches = s => data.batches.filter(b=>(b.student_ids||[]).includes(s.id))
    const getStudentCourses = s => (s.enrolled_courses||[]).map(cid=>data.courses.find(c=>c.id===cid)?.name).filter(Boolean)
    const getStudentPaid    = s => data.payments.filter(p=>p.student_id===s.id).reduce((a,p)=>a+Number(p.paid),0)
    const getStudentDue     = s => data.payments.filter(p=>p.student_id===s.id).reduce((a,p)=>a+(Number(p.amount)-Number(p.paid)),0)
    const getStudentFee     = s => data.payments.filter(p=>p.student_id===s.id).reduce((a,p)=>a+Number(p.amount),0)
    const getAttendance     = s => {
      const batches = getStudentBatches(s)
      const total   = data.classes.filter(c=>batches.some(b=>b.id===c.batch_id)).length
      const present = data.classes.filter(c=>batches.some(b=>b.id===c.batch_id)&&(c.attendees||[]).includes(s.id)).length
      return total>0 ? Math.round(present/total*100)+'%' : 'N/A'
    }

    /* ════════════════════════════════════════
       SHEET 1 — ALL STUDENTS (Master)
    ════════════════════════════════════════ */
    const allHeaders = [
      'Sr.No','Name','Mobile','Email','Profession','Address',
      'Birthday','Join Date','Courses Enrolled','Batches',
      'Total Fee (₹)','Paid (₹)','Due (₹)','Attendance %','Notes'
    ]
    const allRows = data.students.map((s,i)=>[
      i+1, s.name||'', s.mobile||'', s.email||'', s.profession||'', s.address||'',
      s.birthday?fmtDate(s.birthday):'', s.join_date?fmtDate(s.join_date):'',
      getStudentCourses(s).join(', '),
      getStudentBatches(s).map(b=>b.name).join(', '),
      getStudentFee(s), getStudentPaid(s), getStudentDue(s),
      getAttendance(s), s.notes||''
    ])
    const ws1 = XLSX.utils.aoa_to_sheet([allHeaders, ...allRows])
    ws1['!cols'] = [4,22,14,22,16,24,12,12,28,24,12,12,12,12,20].map(w=>({wch:w}))
    XLSX.utils.book_append_sheet(wb, ws1, 'All Students')

    /* ════════════════════════════════════════
       SHEET 2 — COURSE-WISE
    ════════════════════════════════════════ */
    const ws2rows = []
    data.courses.forEach(course => {
      const courseStudents = data.students.filter(s=>(s.enrolled_courses||[]).includes(course.id))
      if (courseStudents.length===0) return
      ws2rows.push([`COURSE: ${course.name} (${course.type}) — ${courseStudents.length} students`,'','','','','','','','','',''])
      ws2rows.push(['Sr.No','Name','Mobile','Email','Batches','Join Date','Fee (₹)','Paid (₹)','Due (₹)','Attendance %','Address'])
      courseStudents.forEach((s,i)=>{
        ws2rows.push([
          i+1, s.name, s.mobile, s.email||'',
          getStudentBatches(s).filter(b=>b.course_id===course.id).map(b=>b.name).join(', '),
          s.join_date?fmtDate(s.join_date):'',
          getStudentFee(s), getStudentPaid(s), getStudentDue(s),
          getAttendance(s), s.address||''
        ])
      })
      // Totals row
      ws2rows.push([
        '','TOTAL','','','','',
        courseStudents.reduce((a,s)=>a+getStudentFee(s),0),
        courseStudents.reduce((a,s)=>a+getStudentPaid(s),0),
        courseStudents.reduce((a,s)=>a+getStudentDue(s),0),
        '','',
      ])
      ws2rows.push([]) // blank separator
    })
    const ws2 = XLSX.utils.aoa_to_sheet(ws2rows)
    ws2['!cols'] = [4,22,14,22,24,12,12,12,12,12,24].map(w=>({wch:w}))
    XLSX.utils.book_append_sheet(wb, ws2, 'Course-wise')

    /* ════════════════════════════════════════
       SHEET 3 — BATCH-WISE
    ════════════════════════════════════════ */
    const ws3rows = []
    data.batches.forEach(batch => {
      const course  = data.courses.find(c=>c.id===batch.course_id)
      const bStudents = data.students.filter(s=>(batch.student_ids||[]).includes(s.id))
      if (bStudents.length===0) return
      ws3rows.push([`BATCH: ${batch.name} | Course: ${course?.name||'—'} | Status: ${batch.status||'Active'} | ${bStudents.length} students`,'','','','','','','','',''])
      ws3rows.push(['Sr.No','Name','Mobile','Email','Courses','Join Date','Fee (₹)','Paid (₹)','Due (₹)','Attendance %'])
      bStudents.forEach((s,i)=>{
        const batchClasses = data.classes.filter(c=>c.batch_id===batch.id)
        const present = batchClasses.filter(c=>(c.attendees||[]).includes(s.id)).length
        const attPct  = batchClasses.length>0 ? Math.round(present/batchClasses.length*100)+'%' : 'N/A'
        ws3rows.push([
          i+1, s.name, s.mobile, s.email||'',
          getStudentCourses(s).join(', '),
          s.join_date?fmtDate(s.join_date):'',
          getStudentFee(s), getStudentPaid(s), getStudentDue(s), attPct
        ])
      })
      ws3rows.push([
        '','TOTAL','','','','',
        bStudents.reduce((a,s)=>a+getStudentFee(s),0),
        bStudents.reduce((a,s)=>a+getStudentPaid(s),0),
        bStudents.reduce((a,s)=>a+getStudentDue(s),0),
        ''
      ])
      ws3rows.push([])
    })
    const ws3 = XLSX.utils.aoa_to_sheet(ws3rows)
    ws3['!cols'] = [4,22,14,22,24,12,12,12,12,12].map(w=>({wch:w}))
    XLSX.utils.book_append_sheet(wb, ws3, 'Batch-wise')

    /* ════════════════════════════════════════
       SHEET 4 — MONTH-WISE (by join date)
    ════════════════════════════════════════ */
    const byMonth = {}
    data.students.forEach(s => {
      const mk = s.join_date ? s.join_date.slice(0,7) : 'Unknown'
      if (!byMonth[mk]) byMonth[mk] = []
      byMonth[mk].push(s)
    })
    const ws4rows = []
    Object.keys(byMonth).sort().reverse().forEach(mk => {
      const mStudents = byMonth[mk]
      const label = mk==='Unknown' ? 'Unknown Month' : new Date(mk+'-01').toLocaleString('en-IN',{month:'long',year:'numeric'})
      ws4rows.push([`${label} — ${mStudents.length} new students`,'','','','','','','',''])
      ws4rows.push(['Sr.No','Name','Mobile','Email','Courses','Batches','Fee (₹)','Paid (₹)','Due (₹)'])
      mStudents.forEach((s,i) => {
        ws4rows.push([
          i+1, s.name, s.mobile, s.email||'',
          getStudentCourses(s).join(', '),
          getStudentBatches(s).map(b=>b.name).join(', '),
          getStudentFee(s), getStudentPaid(s), getStudentDue(s)
        ])
      })
      ws4rows.push([
        '','TOTAL','','','','',
        mStudents.reduce((a,s)=>a+getStudentFee(s),0),
        mStudents.reduce((a,s)=>a+getStudentPaid(s),0),
        mStudents.reduce((a,s)=>a+getStudentDue(s),0),
      ])
      ws4rows.push([])
    })
    const ws4 = XLSX.utils.aoa_to_sheet(ws4rows)
    ws4['!cols'] = [4,22,14,22,28,24,12,12,12].map(w=>({wch:w}))
    XLSX.utils.book_append_sheet(wb, ws4, 'Month-wise')

    /* ════════════════════════════════════════
       SHEET 5 — FEE SUMMARY
    ════════════════════════════════════════ */
    const feeHeaders = ['Name','Mobile','Courses','Batches','Total Fee (₹)','Paid (₹)','Due (₹)','Status']
    const feeRows = data.students.map(s=>{
      const due = getStudentDue(s)
      return [
        s.name, s.mobile,
        getStudentCourses(s).join(', '),
        getStudentBatches(s).map(b=>b.name).join(', '),
        getStudentFee(s), getStudentPaid(s), due,
        due<=0 ? 'Cleared' : 'Pending'
      ]
    }).sort((a,b)=>b[6]-a[6])
    // Grand total row
    feeRows.push([
      'GRAND TOTAL','','','',
      data.students.reduce((a,s)=>a+getStudentFee(s),0),
      data.students.reduce((a,s)=>a+getStudentPaid(s),0),
      data.students.reduce((a,s)=>a+getStudentDue(s),0),
      ''
    ])
    const ws5 = XLSX.utils.aoa_to_sheet([feeHeaders,...feeRows])
    ws5['!cols'] = [22,14,28,24,14,14,14,12].map(w=>({wch:w}))
    XLSX.utils.book_append_sheet(wb, ws5, 'Fee Summary')

    /* ── Download ── */
    const date = new Date().toISOString().slice(0,10)
    XLSX.writeFile(wb, `KMS_Students_${date}.xlsx`)
    toast('✅ Excel exported! 5 sheets: All, Course-wise, Batch-wise, Month-wise, Fee Summary')
  })
}

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════ */
export default function StudentsTab({data, setData, toast}) {
  const [modal,    setModal]    = useState(null)
  const [del,      setDel]      = useState(null)
  const [search,   setSearch]   = useState('')
  const [fb,       setFb]       = useState('all')
  const [fc,       setFc]       = useState('all')
  const [form,     setForm]     = useState({})
  const [enrollM,  setEnrollM]  = useState(null)
  const [busy,     setBusy]     = useState(false)
  const [expand,   setExpand]   = useState({})   // expanded student cards

  const list = useMemo(() => data.students.filter(s => {
    const ms = s.name?.toLowerCase().includes(search.toLowerCase()) || s.mobile?.includes(search)
    const mb = fb === 'all' || data.batches.find(b => b.id===fb && (b.student_ids||[]).includes(s.id))
    const mc = fc === 'all' || (s.enrolled_courses||[]).includes(fc)
    return ms && mb && mc
  }), [data, search, fb, fc])

  /* Stats */
  const totalStudents = data.students.length
  const totalPaid     = data.payments.reduce((a,p)=>a+Number(p.paid),0)
  const totalDue      = data.payments.reduce((a,p)=>a+(Number(p.amount)-Number(p.paid)),0)
  const activeStudents= data.students.filter(s=>data.batches.some(b=>b.status==='Active'&&(b.student_ids||[]).includes(s.id))).length

  const save = async () => {
    if (!form.name || !form.mobile) return alert('Name and mobile required.')
    setBusy(true)
    const row = {
      id: form.id||uid(), name: form.name, mobile: form.mobile,
      email: form.email||'', profession: form.profession||'',
      address: form.address||'', birthday: form.birthday||null,
      blood_group: form.blood_group||'', emergency_contact: form.emergency_contact||'',
      notes: form.notes||'',
      enrolled_courses: form.enrolled_courses||[],
      join_date: form.join_date||today(),
      created_at: form.created_at||new Date().toISOString()
    }
    await dbUpsert('students', row)
    setData(d => ({...d, students: form.id
      ? d.students.map(s => s.id===form.id ? {...s,...row} : s)
      : [...d.students, row]
    }))
    setBusy(false); setModal(null); toast('Student saved!')
  }

  const enrollBatch = async (sid, bid, enroll) => {
    const b = data.batches.find(x => x.id===bid); if (!b) return
    const ids = enroll
      ? [...new Set([...(b.student_ids||[]), sid])]
      : (b.student_ids||[]).filter(i => i!==sid)
    const updated = {...b, student_ids: ids}
    await dbUpsert('batches', updated)
    setData(d => ({...d, batches: d.batches.map(x => x.id===bid ? updated : x)}))
    toast(enroll ? 'Enrolled in batch!' : 'Removed from batch.')
  }

  const toggleExpand = id => setExpand(e => ({...e, [id]: !e[id]}))

  return (
    <div>
      {/* ── Stats bar ── */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:14}}>
        <StatBox label="Total Students" value={totalStudents} color={C.pink} icon="students"/>
        <StatBox label="Active in Batches" value={activeStudents} color={C.green} icon="batch"/>
        <StatBox label="Total Collected" value={fmt(totalPaid)} color={C.green} icon="rupee"/>
        <StatBox label="Pending Dues" value={fmt(totalDue)} color={C.amber} icon="alert"/>
      </div>

      {/* ── Search + Filters ── */}
      <div style={{position:'relative',marginBottom:8}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or mobile…"
          style={{width:'100%',padding:'10px 12px 10px 36px',borderRadius:10,border:`1.5px solid ${C.pinkPale}`,fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/>
        <span style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)'}}><Ic n="search" size={15} color={C.grey}/></span>
      </div>

      <Row gap={7} style={{marginBottom:10,flexWrap:'wrap'}}>
        <select value={fb} onChange={e=>setFb(e.target.value)} style={{flex:1,minWidth:100,padding:'8px 10px',borderRadius:9,border:`1.5px solid ${C.pinkPale}`,fontSize:12,fontFamily:'inherit',outline:'none',color:C.dark}}>
          <option value="all">All Batches</option>
          {data.batches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={fc} onChange={e=>setFc(e.target.value)} style={{flex:1,minWidth:100,padding:'8px 10px',borderRadius:9,border:`1.5px solid ${C.pinkPale}`,fontSize:12,fontFamily:'inherit',outline:'none',color:C.dark}}>
          <option value="all">All Courses</option>
          {data.courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <Btn small onClick={()=>{setForm({name:'',mobile:'',email:'',profession:'',address:'',birthday:'',blood_group:'',emergency_contact:'',notes:'',enrolled_courses:[],join_date:today()});setModal('add')}}>
          <Ic n="add" size={13} color={C.white}/>Add
        </Btn>
        <Btn small color={C.green} onClick={()=>exportExcel(data,toast)}>
          <Ic n="upload" size={13} color={C.white}/>Export
        </Btn>
      </Row>

      <div style={{fontSize:12,color:C.grey,marginBottom:10}}>
        {list.length} student{list.length!==1?'s':''} found
      </div>

      {/* ── Student Cards ── */}
      {list.map(s => {
        const paid     = data.payments.filter(p=>p.student_id===s.id).reduce((a,p)=>a+Number(p.paid),0)
        const due      = data.payments.filter(p=>p.student_id===s.id).reduce((a,p)=>a+(Number(p.amount)-Number(p.paid)),0)
        const totalFee = data.payments.filter(p=>p.student_id===s.id).reduce((a,p)=>a+Number(p.amount),0)
        const batches  = data.batches.filter(b=>(b.student_ids||[]).includes(s.id))
        const cNames   = (s.enrolled_courses||[]).map(cid=>data.courses.find(c=>c.id===cid)?.name).filter(Boolean)
        const allClasses    = data.classes.filter(c=>batches.some(b=>b.id===c.batch_id))
        const attended      = allClasses.filter(c=>(c.attendees||[]).includes(s.id)).length
        const attPct        = allClasses.length>0 ? Math.round(attended/allClasses.length*100) : null
        const isExpanded    = expand[s.id]

        return (
          <Card key={s.id} accent={due>0 ? C.amber : C.green}>
            {/* ── Top row ── */}
            <Row gap={12} style={{alignItems:'flex-start'}}>
              {/* Avatar */}
              <div style={{width:48,height:48,borderRadius:'50%',background:`linear-gradient(135deg,${C.pink},${C.pinkD})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:20,flexShrink:0}}>
                {(s.name||'?')[0].toUpperCase()}
              </div>

              {/* Main info */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:800,fontSize:15,color:C.dark}}>{s.name}</div>
                <div style={{fontSize:12,color:C.grey}}>📱 {s.mobile}{s.email&&<span> · ✉️ {s.email}</span>}</div>
                {s.profession&&<div style={{fontSize:11,color:C.grey}}>💼 {s.profession}</div>}
                {/* Course badges */}
                {cNames.length>0&&(
                  <Row gap={4} style={{flexWrap:'wrap',marginTop:4}}>
                    {cNames.map(n=><Badge key={n} color={data.courses.find(c=>c.name===n)?.color||C.pink}>{n}</Badge>)}
                  </Row>
                )}
              </div>

              {/* Fee summary */}
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:13,fontWeight:800,color:C.green}}>{fmt(paid)}</div>
                {due>0&&<div style={{fontSize:11,color:C.amber,fontWeight:700}}>Due: {fmt(due)}</div>}
                {attPct!==null&&<div style={{fontSize:10,color:C.blue}}>{attPct}% att.</div>}
              </div>
            </Row>

            {/* ── Batch chips ── */}
            {batches.length>0&&(
              <div style={{marginTop:6,fontSize:11,color:C.grey}}>
                📦 {batches.map(b=><span key={b.id} style={{background:C.pinkPale,borderRadius:6,padding:'2px 7px',marginRight:4,color:C.pink,fontWeight:600}}>{b.name}</span>)}
              </div>
            )}

            {/* ── Expand: detailed info ── */}
            {isExpanded&&(
              <div style={{marginTop:10,background:'#FAFAFA',borderRadius:10,padding:'10px 12px',fontSize:12}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                  {s.birthday&&<div><span style={{color:C.grey}}>🎂 Birthday: </span><b>{fmtDate(s.birthday)}</b></div>}
                  {s.join_date&&<div><span style={{color:C.grey}}>📅 Joined: </span><b>{fmtDate(s.join_date)}</b></div>}
                  {s.address&&<div style={{gridColumn:'1/-1'}}><span style={{color:C.grey}}>📍 Address: </span>{s.address}</div>}
                  {s.blood_group&&<div><span style={{color:C.grey}}>🩸 Blood: </span><b>{s.blood_group}</b></div>}
                  {s.emergency_contact&&<div><span style={{color:C.grey}}>🆘 Emergency: </span>{s.emergency_contact}</div>}
                  {s.notes&&<div style={{gridColumn:'1/-1'}}><span style={{color:C.grey}}>📝 Notes: </span>{s.notes}</div>}
                </div>
                {/* Fee detail */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginTop:8}}>
                  {[['Total Fee',fmt(totalFee),C.dark],['Paid',fmt(paid),C.green],['Due',fmt(due),due>0?C.amber:C.green]].map(([l,v,col])=>(
                    <div key={l} style={{background:col+'10',borderRadius:8,padding:'6px 8px',textAlign:'center'}}>
                      <div style={{fontSize:9,color:col,fontWeight:700,textTransform:'uppercase'}}>{l}</div>
                      <div style={{fontSize:12,fontWeight:800,color:col}}>{v}</div>
                    </div>
                  ))}
                </div>
                {/* Attendance */}
                {allClasses.length>0&&(
                  <div style={{marginTop:8,background:C.blue+'10',borderRadius:8,padding:'6px 10px'}}>
                    <span style={{fontSize:11,color:C.blue,fontWeight:700}}>📊 Attendance: {attended}/{allClasses.length} classes ({attPct}%)</span>
                  </div>
                )}
                {/* Payment history */}
                {data.payments.filter(p=>p.student_id===s.id).length>0&&(
                  <div style={{marginTop:8}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.grey,marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>Payment History</div>
                    {data.payments.filter(p=>p.student_id===s.id).map(p=>{
                      const b=data.batches.find(x=>x.id===p.batch_id)
                      return(
                        <div key={p.id} style={{display:'flex',justifyContent:'space-between',fontSize:11,padding:'3px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
                          <span style={{color:C.grey}}>{p.date} · {b?.name||'—'}</span>
                          <span><b style={{color:C.green}}>{fmt(p.paid)}</b>{Number(p.amount)>Number(p.paid)&&<span style={{color:C.amber}}> / {fmt(p.amount)}</span>}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            <Divider/>

            {/* ── Action buttons ── */}
            <Row gap={6} style={{flexWrap:'wrap'}}>
              <Btn small outline onClick={()=>toggleExpand(s.id)}>
                {isExpanded?'▲ Less':'▼ Details'}
              </Btn>
              <Btn small outline onClick={()=>{setForm({...s,enrolled_courses:s.enrolled_courses||[]});setModal('edit_'+s.id)}}>✏️ Edit</Btn>
              <Btn small color={C.blue} onClick={()=>setEnrollM(s.id)}>📚 Batch</Btn>
              <a href={`https://wa.me/91${s.mobile}`} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>
                <Btn small color={C.wa}><Ic n="wa" size={12} color={C.white}/>WA</Btn>
              </a>
              {due>0&&(
                <a href={`https://wa.me/91${s.mobile}?text=${encodeURIComponent(`Hi ${s.name}! 🙏 Friendly reminder: ₹${due} pending for your course at Kajol Makeover Studioz. Please clear at your earliest convenience.\n— Kajol Ma'am 💄`)}`} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>
                  <Btn small color={C.amber}>💰 Remind</Btn>
                </a>
              )}
              <Btn small color={C.red} onClick={()=>setDel(s)}>🗑️</Btn>
            </Row>

            {/* Edit Modal */}
            {modal===('edit_'+s.id)&&(
              <Modal onClose={()=>setModal(null)} title={<><Ic n="edit" color={C.pink}/> Edit Student</>}>
                <Inp label="Full Name *"        value={form.name}              onChange={v=>setForm(x=>({...x,name:v}))}/>
                <Inp label="Mobile *"           value={form.mobile}            onChange={v=>setForm(x=>({...x,mobile:v}))}/>
                <Inp label="Email"              value={form.email}             onChange={v=>setForm(x=>({...x,email:v}))}/>
                <Inp label="Profession"         value={form.profession}        onChange={v=>setForm(x=>({...x,profession:v}))}/>
                <Inp label="Address"            value={form.address}           onChange={v=>setForm(x=>({...x,address:v}))}/>
                <Inp label="Birthday"           value={form.birthday}          onChange={v=>setForm(x=>({...x,birthday:v}))} type="date"/>
                <Inp label="Join Date"          value={form.join_date}         onChange={v=>setForm(x=>({...x,join_date:v}))} type="date"/>
                <Inp label="Blood Group"        value={form.blood_group}       onChange={v=>setForm(x=>({...x,blood_group:v}))} opts={['','A+','A-','B+','B-','AB+','AB-','O+','O-']}/>
                <Inp label="Emergency Contact"  value={form.emergency_contact} onChange={v=>setForm(x=>({...x,emergency_contact:v}))}/>
                <Inp label="Notes"              value={form.notes}             onChange={v=>setForm(x=>({...x,notes:v}))}/>
                <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Courses Enrolled</div>
                {data.courses.map(c=>(
                  <label key={c.id} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,marginBottom:6,cursor:'pointer'}}>
                    <input type="checkbox" checked={(form.enrolled_courses||[]).includes(c.id)} onChange={e=>{
                      const cur=form.enrolled_courses||[]
                      setForm(x=>({...x,enrolled_courses:e.target.checked?[...cur,c.id]:cur.filter(i=>i!==c.id)}))
                    }}/>
                    <Badge color={c.color||C.pink}>{c.name}</Badge>
                  </label>
                ))}
                <Row gap={8} style={{marginTop:10}}>
                  <Btn outline onClick={()=>setModal(null)} full>Cancel</Btn>
                  <Btn onClick={save} full disabled={busy}>{busy?'Saving…':'Save'}</Btn>
                </Row>
              </Modal>
            )}

            {/* Batch enroll modal */}
            {enrollM===s.id&&(
              <Modal onClose={()=>setEnrollM(null)} title={<><Ic n="course" color={C.blue}/> Batches — {s.name}</>}>
                {data.batches.length===0&&<div style={{color:C.grey,fontSize:13,textAlign:'center',padding:16}}>No batches created yet.</div>}
                {data.batches.map(b=>{
                  const enrolled=(b.student_ids||[]).includes(s.id)
                  const c=data.courses.find(x=>x.id===b.course_id)
                  return(
                    <div key={b.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:`1px solid ${C.pinkPale}`}}>
                      <div>
                        <div style={{fontWeight:600,fontSize:13}}>{b.name}</div>
                        <div style={{fontSize:11,color:C.grey}}>{c?.name} · {b.timing||''} · {b.schedule||''}</div>
                        {b.fee>0&&<div style={{fontSize:11,color:C.green,fontWeight:700}}>₹{b.fee}</div>}
                      </div>
                      <Toggle checked={enrolled} onChange={v=>enrollBatch(s.id,b.id,v)}/>
                    </div>
                  )
                })}
                <Btn color={C.green} onClick={()=>setEnrollM(null)} full style={{marginTop:12}}>Done</Btn>
              </Modal>
            )}
          </Card>
        )
      })}

      {list.length===0&&(
        <div style={{textAlign:'center',color:C.grey,padding:40,background:C.white,borderRadius:16}}>
          <div style={{fontSize:36,marginBottom:8}}>👥</div>
          <div style={{fontWeight:700}}>No students found</div>
          <div style={{fontSize:13,marginTop:4}}>Approve enrollment requests to add students</div>
        </div>
      )}

      {/* Add Modal */}
      {modal==='add'&&(
        <Modal onClose={()=>setModal(null)} title={<><Ic n="add" color={C.pink}/> Add Student</>}>
          <Inp label="Full Name *"       value={form.name}              onChange={v=>setForm(x=>({...x,name:v}))}/>
          <Inp label="Mobile *"          value={form.mobile}            onChange={v=>setForm(x=>({...x,mobile:v}))}/>
          <Inp label="Email"             value={form.email}             onChange={v=>setForm(x=>({...x,email:v}))}/>
          <Inp label="Profession"        value={form.profession}        onChange={v=>setForm(x=>({...x,profession:v}))}/>
          <Inp label="Address"           value={form.address}           onChange={v=>setForm(x=>({...x,address:v}))}/>
          <Inp label="Birthday"          value={form.birthday}          onChange={v=>setForm(x=>({...x,birthday:v}))} type="date"/>
          <Inp label="Join Date"         value={form.join_date}         onChange={v=>setForm(x=>({...x,join_date:v}))} type="date"/>
          <Inp label="Blood Group"       value={form.blood_group}       onChange={v=>setForm(x=>({...x,blood_group:v}))} opts={['','A+','A-','B+','B-','AB+','AB-','O+','O-']}/>
          <Inp label="Emergency Contact" value={form.emergency_contact} onChange={v=>setForm(x=>({...x,emergency_contact:v}))}/>
          <Inp label="Notes"             value={form.notes}             onChange={v=>setForm(x=>({...x,notes:v}))}/>
          <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Select Courses</div>
          {data.courses.map(c=>(
            <label key={c.id} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,marginBottom:6,cursor:'pointer'}}>
              <input type="checkbox" checked={(form.enrolled_courses||[]).includes(c.id)} onChange={e=>{
                const cur=form.enrolled_courses||[]
                setForm(x=>({...x,enrolled_courses:e.target.checked?[...cur,c.id]:cur.filter(i=>i!==c.id)}))
              }}/>
              <Badge color={c.color||C.pink}>{c.name}</Badge>
            </label>
          ))}
          <Row gap={8} style={{marginTop:10}}>
            <Btn outline onClick={()=>setModal(null)} full>Cancel</Btn>
            <Btn onClick={save} full disabled={busy}>{busy?'Saving…':'Add Student'}</Btn>
          </Row>
        </Modal>
      )}

      {del&&(
        <DelConfirm
          item={del.name}
          onConfirm={async()=>{
            await dbDelete('students',del.id)
            setData(d=>({...d,students:d.students.filter(s=>s.id!==del.id)}))
            toast('Student deleted.')
          }}
          onClose={()=>setDel(null)}
        />
      )}
    </div>
  )
}
