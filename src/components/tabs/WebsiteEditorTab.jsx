import React, { useState, useEffect, useRef } from 'react'
import { C, Ic, Btn, Card, Row, SectionTitle, Spinner } from '../../lib/ui.jsx'
import { supabase as sb } from '../../lib/supabase.js'
const STitle = SectionTitle
export default function WebsiteEditorTab({toast}) {
  const [content,setContent]=useState({})
  const [busy,setBusy]=useState(false)
  const [sec,setSec]=useState('about')
  const [loading,setLoading]=useState(true)
  const [galleryItems,setGalleryItems]=useState([])
  const [newPhoto,setNewPhoto]=useState({url:'',label:'',cat:'Mehndi'})
  const [reviews,setReviews]=useState([])
  const [newReview,setNewReview]=useState({name:'',role:'',text:'',color:'#E91E8C'})
  const photoRef=useRef()

  useEffect(()=>{
    sb.from('site_content').select('*').then(({data})=>{
      if(data){
        const m={}
        data.forEach(r=>{m[r.key]=r.value})
        setContent(m)
        try{if(m.gallery_photos)setGalleryItems(JSON.parse(m.gallery_photos))}catch{}
        try{if(m.reviews_rich)setReviews(JSON.parse(m.reviews_rich))}catch{}
      }
      setLoading(false)
    })
  },[])

  const saveKey=async(key,value)=>{
    setBusy(true)
    const {error}=await sb.from('site_content').upsert({id:key,key,value,updated_at:new Date().toISOString()},{onConflict:'key'})
    if(error)toast('Error: '+error.message); else toast('Saved to website!')
    setBusy(false)
  }

  const sc=(k,fb='')=>content[k]!=null?content[k]:fb
  const setc=k=>v=>setContent(c=>({...c,[k]:v}))

  const uploadPhoto=async e=>{
    const file=e.target.files[0]; if(!file) return
    const ext=file.name.split('.').pop()
    const path=`gallery/${Date.now()}.${ext}`
    const {error}=await sb.storage.from('site-media').upload(path,file,{upsert:true})
    if(error){toast('Upload failed: '+error.message);return}
    const {data:pub}=sb.storage.from('site-media').getPublicUrl(path)
    setNewPhoto(x=>({...x,url:pub.publicUrl}))
    toast('Photo uploaded!')
  }

  const addPhoto=async()=>{
    if(!newPhoto.url)return alert('Add a photo URL or upload a file')
    const items=[...galleryItems,{...newPhoto}]
    setGalleryItems(items)
    await saveKey('gallery_photos',JSON.stringify(items))
    setNewPhoto({url:'',label:'',cat:'Mehndi'})
  }

  const removePhoto=async i=>{
    const items=galleryItems.filter((_,j)=>j!==i)
    setGalleryItems(items)
    await saveKey('gallery_photos',JSON.stringify(items))
    toast('Photo removed!')
  }

  const addReview=async()=>{
    if(!newReview.name||!newReview.text)return alert('Name and review text required')
    const items=[...reviews,{...newReview,type:'text',initial:newReview.name[0]}]
    setReviews(items)
    await saveKey('reviews_rich',JSON.stringify(items))
    setNewReview({name:'',role:'',text:'',color:'#E91E8C'})
    toast('Review added!')
  }

  const removeReview=async i=>{
    const items=reviews.filter((_,j)=>j!==i)
    setReviews(items)
    await saveKey('reviews_rich',JSON.stringify(items))
    toast('Review removed!')
  }

  const inp={width:'100%',padding:'10px 12px',borderRadius:10,border:`1.5px solid ${C.pinkPale}`,fontSize:13,fontFamily:'inherit',outline:'none',color:C.dark,boxSizing:'border-box',marginBottom:8,display:'block'}

  if(loading) return <Spinner/>

  const SECS=[{v:'about',l:'📄 About'},{v:'courses',l:'📚 Courses'},{v:'gallery',l:'🖼️ Gallery'},{v:'reviews',l:'⭐ Reviews'},{v:'stats',l:'📊 Stats'}]

  return (
    <div>
      <Card accent={C.purple}>
        <STitle><Ic n="globe" size={15} color={C.purple}/> Website Content Editor</STitle>
        <div style={{fontSize:12,color:C.grey,marginBottom:10}}>Edit your website live. Save each section — changes appear instantly on your website.</div>
        <a href="https://kajol-makeover-studioz.vercel.app" target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:12,color:C.blue,textDecoration:'none',background:C.blue+'12',borderRadius:8,padding:'5px 10px'}}>
          <Ic n="globe" size={13} color={C.blue}/>View Website
        </a>
      </Card>

      {/* Section tabs */}
      <div style={{display:'flex',gap:6,overflowX:'auto',marginBottom:14,paddingBottom:4}}>
        {SECS.map(s=>(
          <div key={s.v} onClick={()=>setSec(s.v)} style={{flexShrink:0,padding:'7px 14px',borderRadius:20,background:sec===s.v?C.pink:C.greyL,color:sec===s.v?C.white:C.grey,fontSize:12,fontWeight:sec===s.v?700:500,cursor:'pointer'}}>
            {s.l}
          </div>
        ))}
      </div>

      {/* ── ABOUT ── */}
      {sec==='about'&&<Card accent={C.pink}>
        <STitle><Ic n="info" size={15} color={C.pink}/> About Section</STitle>
        <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>Hero Tagline</div>
        <textarea rows={2} value={sc('hero_tagline')} onChange={e=>setc('hero_tagline')(e.target.value)} placeholder="Learn from Kajol J Kamble — professional artist & passionate teacher." style={inp}/>
        <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>About Headline</div>
        <input value={sc('about_headline')} onChange={e=>setc('about_headline')(e.target.value)} placeholder="Passionate Artist. Dedicated Teacher." style={inp}/>
        <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>About Paragraph 1</div>
        <textarea rows={3} value={sc('about_para1')} onChange={e=>setc('about_para1')(e.target.value)} placeholder="Hi! I am Kajol..." style={inp}/>
        <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>About Paragraph 2</div>
        <textarea rows={3} value={sc('about_para2')} onChange={e=>setc('about_para2')(e.target.value)} placeholder="All my courses are conducted live on Zoom..." style={inp}/>
        <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>YouTube Playlist ID</div>
        <input value={sc('yt_playlist_id')} onChange={e=>setc('yt_playlist_id')(e.target.value)} placeholder="PLZDAEN7wCknjKSw6QrdoF9M-NHbkInkw7" style={inp}/>
        <Btn color={C.green} onClick={()=>{['hero_tagline','about_headline','about_para1','about_para2','yt_playlist_id'].forEach(k=>saveKey(k,content[k]||''))}} disabled={busy} full>
          {busy?'Saving…':'💾 Save About Section'}
        </Btn>
      </Card>}

      {/* ── COURSES ── */}
      {sec==='courses'&&<Card accent={C.green}>
        <STitle><Ic n="course" size={15} color={C.green}/> Courses Section</STitle>
        <div style={{fontSize:12,color:C.grey,marginBottom:12}}>Separate bullet items with a pipe <b>|</b> character.</div>
        {[{key:'mehndi',emoji:'🌿',label:'Mehndi Art'},{key:'makeup',emoji:'💄',label:'Makeup Course'},{key:'ariwork',emoji:'🎨',label:'Ariwork Course'},{key:'combined',emoji:'✨',label:'Combined Course'}].map(c=>(
          <div key={c.key} style={{marginBottom:16,background:C.greyL,borderRadius:12,padding:12}}>
            <div style={{fontSize:13,fontWeight:800,color:C.dark,marginBottom:8}}>{c.emoji} {c.label}</div>
            <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:3,textTransform:'uppercase',letterSpacing:.5}}>Description</div>
            <textarea rows={2} value={sc('course_'+c.key+'_desc')} onChange={e=>setc('course_'+c.key+'_desc')(e.target.value)} placeholder="Course description..." style={inp}/>
            <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:3,textTransform:'uppercase',letterSpacing:.5}}>Bullet Points (separate with |)</div>
            <input value={sc('course_'+c.key+'_items')} onChange={e=>setc('course_'+c.key+'_items')(e.target.value)} placeholder="Item 1|Item 2|Item 3" style={inp}/>
          </div>
        ))}
        <Btn color={C.green} onClick={()=>{['mehndi','makeup','ariwork','combined'].forEach(k=>{saveKey('course_'+k+'_desc',content['course_'+k+'_desc']||'');saveKey('course_'+k+'_items',content['course_'+k+'_items']||'')})}} disabled={busy} full>
          {busy?'Saving…':'💾 Save All Courses'}
        </Btn>
      </Card>}

      {/* ── GALLERY ── */}
      {sec==='gallery'&&<Card accent={C.teal}>
        <STitle><Ic n="image" size={15} color={C.teal}/> Gallery Photos</STitle>
        <div style={{fontSize:12,color:C.grey,marginBottom:12}}>Upload photos of student work, your designs & class highlights. These show in the Our Work section.</div>

        {/* Add photo */}
        <div style={{background:C.greyL,borderRadius:12,padding:12,marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:C.dark,marginBottom:10}}>Add New Photo</div>
          <input ref={photoRef} type="file" accept="image/*" style={{display:'none'}} onChange={uploadPhoto}/>
          <Btn small color={C.blue} onClick={()=>photoRef.current?.click()} disabled={busy}>
            <Ic n="upload" size={13} color={C.white}/>Upload Photo
          </Btn>
          <div style={{fontSize:11,color:C.grey,margin:'8px 0 4px'}}>— or paste image URL —</div>
          <input value={newPhoto.url} onChange={e=>setNewPhoto(x=>({...x,url:e.target.value}))} placeholder="https://..." style={{...inp,marginBottom:6}}/>
          {newPhoto.url&&<img src={newPhoto.url} alt="preview" style={{width:'100%',maxHeight:120,objectFit:'cover',borderRadius:8,marginBottom:6}}/>}
          <input value={newPhoto.label} onChange={e=>setNewPhoto(x=>({...x,label:e.target.value}))} placeholder="Label (e.g. Bridal Mehndi)" style={{...inp,marginBottom:6}}/>
          <select value={newPhoto.cat} onChange={e=>setNewPhoto(x=>({...x,cat:e.target.value}))} style={{...inp,marginBottom:10}}>
            <option>Mehndi</option><option>Makeup</option><option>Ariwork</option><option>Other</option>
          </select>
          <Btn color={C.teal} onClick={addPhoto} disabled={busy||!newPhoto.url} full>+ Add to Gallery</Btn>
        </div>

        {/* Current gallery */}
        <div style={{fontSize:13,fontWeight:700,color:C.dark,marginBottom:8}}>Current Photos ({galleryItems.length})</div>
        {galleryItems.length===0&&<div style={{fontSize:12,color:C.grey,textAlign:'center',padding:20,background:C.pinkPale,borderRadius:10}}>No photos yet. Add your first photo above!</div>}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
          {galleryItems.map((p,i)=>(
            <div key={i} style={{position:'relative',borderRadius:10,overflow:'hidden',aspectRatio:'1',background:C.greyL}}>
              {p.url?<img src={p.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28}}>🖼️</div>}
              <button onClick={()=>removePhoto(i)} style={{position:'absolute',top:4,right:4,background:C.red,border:'none',color:'#fff',borderRadius:6,padding:'2px 7px',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>×</button>
              <div style={{position:'absolute',bottom:0,left:0,right:0,background:'rgba(0,0,0,0.5)',padding:'3px 6px',fontSize:9,color:'#fff'}}>{p.label||p.cat}</div>
            </div>
          ))}
        </div>

        <div style={{marginTop:12,background:C.greenPale,borderRadius:10,padding:10,fontSize:11,color:C.green}}>
          💡 Instagram feed is live on website — post on @kajol_makeover_studioz and it auto-appears!
        </div>
      </Card>}

      {/* ── REVIEWS ── */}
      {sec==='reviews'&&<Card accent={C.amber}>
        <STitle><Ic n="star" size={15} color={C.amber}/> Student Reviews</STitle>
        <div style={{fontSize:12,color:C.grey,marginBottom:12}}>Add student feedback. These appear in the What Students Say section on your website.</div>

        {/* Add review */}
        <div style={{background:C.greyL,borderRadius:12,padding:12,marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:C.dark,marginBottom:10}}>Add New Review</div>
          <input value={newReview.name} onChange={e=>setNewReview(x=>({...x,name:e.target.value}))} placeholder="Student name *" style={{...inp,marginBottom:6}}/>
          <input value={newReview.role} onChange={e=>setNewReview(x=>({...x,role:e.target.value}))} placeholder="Role (e.g. Homemaker · Mehndi Student)" style={{...inp,marginBottom:6}}/>
          <textarea rows={3} value={newReview.text} onChange={e=>setNewReview(x=>({...x,text:e.target.value}))} placeholder="Review text *" style={{...inp,resize:'vertical',marginBottom:6}}/>
          <Row gap={8} style={{alignItems:'center',marginBottom:8}}>
            <label style={{fontSize:12,color:C.grey}}>Color:</label>
            <input type="color" value={newReview.color} onChange={e=>setNewReview(x=>({...x,color:e.target.value}))} style={{width:44,height:32,borderRadius:8,border:'none',cursor:'pointer'}}/>
          </Row>
          <Btn color={C.amber} onClick={addReview} disabled={busy} full>+ Add Review</Btn>
        </div>

        {/* Current reviews */}
        <div style={{fontSize:13,fontWeight:700,color:C.dark,marginBottom:8}}>Current Reviews ({reviews.length})</div>
        {reviews.length===0&&<div style={{fontSize:12,color:C.grey,textAlign:'center',padding:16,background:C.greyL,borderRadius:10}}>No custom reviews yet. Default reviews show on website.</div>}
        {reviews.map((r,i)=>(
          <div key={i} style={{background:C.white,borderRadius:10,padding:10,marginBottom:8,display:'flex',gap:10,alignItems:'flex-start',border:`1px solid ${C.pinkPale}`}}>
            <div style={{width:36,height:36,borderRadius:'50%',background:r.color||C.pink,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:14,flexShrink:0}}>{r.initial||r.name[0]}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,fontSize:13}}>{r.name}</div>
              <div style={{fontSize:11,color:C.grey}}>{r.role}</div>
              <div style={{fontSize:11,color:C.dark,marginTop:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.text}</div>
            </div>
            <button onClick={()=>removeReview(i)} style={{background:C.red,border:'none',color:'#fff',borderRadius:8,padding:'5px 10px',fontSize:12,cursor:'pointer',fontFamily:'inherit',flexShrink:0}}>×</button>
          </div>
        ))}
      </Card>}

      {/* ── STATS ── */}
      {sec==='stats'&&<Card accent={C.blue}>
        <STitle><Ic n="chart" size={15} color={C.blue}/> Stats & CTA</STitle>
        {[['stat_students','Students Trained','200+'],['stat_courses','Expert Courses','3'],['stat_classes','Classes Done','50+']].map(([k,label,ph])=>(
          <div key={k}>
            <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:3,textTransform:'uppercase',letterSpacing:.5}}>{label}</div>
            <input value={sc(k)} onChange={e=>setc(k)(e.target.value)} placeholder={ph} style={inp}/>
          </div>
        ))}
        <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:3,textTransform:'uppercase',letterSpacing:.5}}>CTA Headline</div>
        <input value={sc('cta_headline')} onChange={e=>setc('cta_headline')(e.target.value)} placeholder="Ready to Start Your Journey?" style={inp}/>
        <div style={{fontSize:11,fontWeight:700,color:C.grey,marginBottom:3,textTransform:'uppercase',letterSpacing:.5}}>CTA Sub-text</div>
        <textarea rows={2} value={sc('cta_subtext')} onChange={e=>setc('cta_subtext')(e.target.value)} placeholder="Fill our free enrollment form today..." style={inp}/>
        <Btn color={C.green} onClick={()=>{['stat_students','stat_courses','stat_classes','cta_headline','cta_subtext'].forEach(k=>saveKey(k,content[k]||''))}} disabled={busy} full>
          {busy?'Saving…':'💾 Save Stats & CTA'}
        </Btn>
      </Card>}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SETTINGS TAB  — Admin settings, data management
═══════════════════════════════════════════════════════════════════ */
