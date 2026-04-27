import React, { useState } from 'react'
import { C, today, fmtDate, Ic, Btn, Card, Row, SectionTitle, Inp } from '../../lib/ui.jsx'

const STitle = SectionTitle
const CERT_BG = "data:image/png;base64,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|STitle = SectionTitle
const CERT_BG = "data:image/png;base64,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r9P9b/m8f/986v/V/7f+z8uv7f/L6/rf+p9R/+O+f7M2Z+b9b8P8r8j/9X+k+eX773B/t/j/v//3P+77Z777f98e+H0v+H/p9+76/r//+xP6P/j/n/Gfvf0T8uAADgdIDAHQBglqI0V9H+dYfS/zD969Y//fH+9V+vXre+/m9Wv3r9Xp9evXp9vXp1vXrd+vTqdXvdXreW0ut2+9F2u70uSjZ970dtv61v3m979F7v1+u9v9vV+tZ6+y9v9/6Z2+8969f69Hrfu99793s/q3/p7f+e/W/0Z+83/T/m/s/f7zG9687oV2++99H2L96Xb/f+vX69v57fX297X0Zvz5u+f9P3vvTe//9o36/X+3X9/m/v7T+s9/rPq+n7//t+f/f79X77f7R/7r/f/0n9/2H9/0n996v+69Tr13f6p1evXre+//8BAADAdIdKGQAAs1arV69evfpevXrd+tTrX6/Xrdeta//u1+v3+vTqf//vdfP1WvXq9XrV9Wp9anV9676vXr9evX79et26er1e9ep+vXq9+r2X3f+vfr9er9enV69bt1er1er1+vX69evV69X7/u/f9er6v67vX6/f79Xr9/9ar6/X69bt9ep1Xq9er1f95vX61atXV6/er9erV9+r7/V69W89AAAAgDMWAneAtv+lqV6Xpn996X97f/fWp7ZfS9P/1v7u7Tf//7X96+tfv351ferX9evS+6uv0u9X6dfXp9fXV19d6756/fr16vVr+7Xr/frV9uvX+1O/rt/v/fr+V+/9W9+v7/9bt79et/+rX6/fX6Xv1/vV7X8ZfX+vX6/b9z/vff/vrS/X7V9f/7r61K9Lt7/X7df9+XrdX/Xn+/0vXq9L768BAADAmQuVOgAAALC/Xn29Xt+rS7/6dfX96vV/1Uv0er9evXq9Xm/vff/9/75f3+v6fl2f+r9e36/161Xvdfv/8PrXr/erL+v69ar7K/R/Wp8v7/vV76v2v679/+v79f2/rv/V6v/f69erv6zf69evX6/X/69f/e/6/vUqAAAAcEZB4A4AAADs776v7X+X/r/V/7+2P/X7V7v9f+v9/6v7r+9f/3X9f9/f/Tf9797/O+X99+f++9/1/v+r9/f+Kvd6vb9+u773pU/999f1P6Uu/X9tf339r/v/X69Xr75evV6vXu/3/7p6vV6vXr1+Xb1er/p9fV1dr1evXq9er9fXAAAAcIZC4A4AAADsr1evW5/63+3X/7S//v3rf99f/+63X6+rf69fr77/+r1f369//++96v73+vXv++p9Sv7v+vXt/9f/X+99XXv76vS/+v9+vW/78v/ff6/X+t71ev/n3//f+7179+XdfX9X9df69fv16X/9f6/V+X/v8BAADAGQqVOgAAALC/+7t7/erW16vX92v96vf71ffq/VvXr+/+v7X99fp/39/979fr9v/6fn3/+35V7/+f/r97u3W9f6v3f1+v1/X7+nX1/d+v6/8fXm/fq9fX1+vV/78vff/vq1ev7/f+2vX9X1ev9+/6v75X7/f/69X9f3Xp/z8BAAAAzloI3AEAAID9Vfer+/26PvW6tD71+n5dfb9e76/Xq+79/v8HAAAAzlz/H8e/m7qI+rUuAAAAAElFTkSuQmCC"

const PreviewCard = ({ student }) => {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '1414 / 1000',
      backgroundImage: `url(${CERT_BG})`,
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      {/* Student Name: Adjusted size and line-height to prevent cropping */}
      <div style={{
        position: 'absolute',
        top: '43%',
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: "'Great Vibes', cursive",
        fontSize: '3.6cqi',
        color: '#8a6d3b',
        lineHeight: '1.5',
        paddingBottom: '5px'
      }}>
        {student.name}
      </div>

      {/* Paragraph: Centered relative to the layout */}
      <div style={{
        position: 'absolute',
        top: '56%',
        left: '10%',
        right: '10%',
        textAlign: 'center',
        fontFamily: "'Lato', sans-serif",
        fontSize: '1.3cqi',
        color: '#444',
        lineHeight: '1.6'
      }}>
        This is to certify that <b>{student.name}</b> has successfully completed 
        the professional course in Mehndi, Ariwork and Makeup at 
        Kajol Makeover Studioz.
      </div>
    </div>
  )
}

export default function CertificateTab({ students, activeBatch }) {
  const targets = students.filter(s => s.batch === activeBatch)

  const sendWhatsApp = (student) => {
    const msg = `Hello ${student.name}, your certificate from Kajol Makeover Studioz is ready!`
    window.open(`https://wa.me/${student.mobile}?text=${encodeURIComponent(msg)}`)
  }

  const sendEmail = (student) => {
    if(!student.email) return alert("No email provided")
    window.location.href = `mailto:${student.email}?subject=Your Certificate&body=Congratulations!`
  }

  const printCert = (student) => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Certificate - ${student.name}</title>
          <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Lato:wght@400;700&display=swap" rel="stylesheet">
          <style>
            body { margin: 0; padding: 0; background: #eee; }
            .cert-container {
                position: relative;
                width: 1414px;
                height: 1000px;
                background-image: url(${CERT_BG});
                background-size: cover;
                margin: 0 auto;
                background-color: white;
            }
            .cert-name {
                position: absolute;
                top: 435px;
                width: 100%;
                text-align: center;
                font-family: 'Great Vibes', cursive;
                font-size: 50px;
                color: #8a6d3b;
                line-height: 1.5;
            }
            .cert-body {
                position: absolute;
                top: 565px;
                left: 100px;
                right: 100px;
                text-align: center;
                font-family: 'Lato', sans-serif;
                font-size: 19px;
                color: #444;
                line-height: 1.6;
            }
            @media print {
                body { background: none; }
                .cert-container { margin: 0; box-shadow: none; }
                @page { size: landscape; margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="cert-container">
            <div class="cert-name">${student.name}</div>
            <div class="cert-body">
                This is to certify that <b>${student.name}</b> has successfully completed 
                the professional course in Mehndi, Ariwork and Makeup at 
                Kajol Makeover Studioz.
            </div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              // window.close();
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div style={{padding:20}}>
      <STitle>Batch Certificates</STitle>
      
      {targets.length === 0 && (
        <div style={{textAlign:'center',color:C.grey,padding:32,background:C.white,borderRadius:16}}>
          <div style={{fontSize:36,marginBottom:8}}>🎓</div>
          <div style={{fontWeight:700}}>Select a batch to generate certificates</div>
        </div>
      )}

      {targets.map(student => (
        <Card key={student.id} accent={C.purple}>
          <Row style={{justifyContent:'space-between',marginBottom:10}}>
            <div>
              <div style={{fontWeight:700,fontSize:15,color:C.dark}}>{student.name}</div>
              <div style={{fontSize:12,color:C.grey}}>📱 {student.mobile}{student.email&&` · ✉️ ${student.email}`}</div>
              {student.address&&<div style={{fontSize:11,color:C.grey}}>📍 {student.address}</div>}
            </div>
            <div style={{fontSize:28}}>🎓</div>
          </Row>

          <div style={{marginBottom:12}}>
            <PreviewCard student={student}/>
          </div>

          <Row gap={7} style={{flexWrap:'wrap'}}>
            <Btn small color={C.purple} onClick={()=>printCert(student)}>📄 Print / Save PDF</Btn>
            <Btn small color={C.wa} onClick={()=>sendWhatsApp(student)}><Ic n="wa" size={12} color={C.white}/> WhatsApp</Btn>
            <Btn small color={C.blue} onClick={()=>sendEmail(student)}>✉️ Email</Btn>
          </Row>
          {!student.address && <div style={{fontSize:11, color:C.grey, marginTop:8}}>* Address missing in profile</div>}
        </Card>
      ))}
    </div>
  )
}
