import { useState } from 'react'

// ─── SHARED STYLES ─────────────────────────────────────────────────────────
const inp = (C) => ({
  width:'100%',background:'rgba(255,255,255,0.04)',
  border:`1px solid ${C.borderGold}`,borderRadius:10,
  color:C.cream,fontSize:16,padding:'11px 14px',
  fontFamily:"'EB Garamond',Georgia,serif",outline:'none',
  boxSizing:'border-box',
})
const ta = (C, rows=3) => ({...inp(C), resize:'vertical', lineHeight:1.7, minHeight: rows*32 })
const lbl = (C) => ({
  fontSize:9,color:C.gold,letterSpacing:'0.14em',
  textTransform:'uppercase',fontFamily:"'Cinzel',Georgia,serif",
  marginBottom:6,display:'block',
})
const card = (C) => ({
  background:C.bgCard,border:`1px solid ${C.border}`,
  borderRadius:12,padding:'14px 16px',marginBottom:10,
})
const addBtn = (C) => ({
  width:'100%',background:`linear-gradient(135deg,${C.redF},rgba(255,255,255,0.01))`,
  border:`1px solid ${C.redB}`,color:C.redL,padding:'12px',
  borderRadius:12,cursor:'pointer',fontSize:13,
  fontFamily:"'Cinzel',Georgia,serif",letterSpacing:'0.08em',
  transition:'all .25s',marginTop:6,
})
const saveBtn = (C,saved) => ({
  width:'100%',background:saved?'rgba(124,146,132,0.15)':`linear-gradient(135deg,${C.redF},rgba(255,255,255,0.01))`,
  border:`1px solid ${saved?'rgba(124,146,132,0.4)':C.redB}`,
  color:saved?C.green:C.redL,padding:'12px',borderRadius:12,
  cursor:'pointer',fontSize:13,fontFamily:"'Cinzel',Georgia,serif",
  letterSpacing:'0.08em',transition:'all .25s',marginTop:8,
})
const tag = (C,color='red') => ({
  fontSize:9,color:color==='gold'?C.gold:C.redL,
  fontFamily:"'Cinzel',Georgia,serif",letterSpacing:'0.12em',
  textTransform:'uppercase',marginBottom:4,display:'block',
})
const dateStr = () => new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})

function Section({title,C,children}) {
  return (
    <div style={{marginBottom:20}}>
      <div style={{fontSize:9,color:C.muted,letterSpacing:'0.16em',textTransform:'uppercase',
        fontFamily:"'Cinzel',Georgia,serif",marginBottom:12}}>{title}</div>
      {children}
    </div>
  )
}

function Entry({C,date,children,onDelete}) {
  return (
    <div style={{...card(C),position:'relative'}}>
      <div style={{fontSize:10,color:C.dim,marginBottom:8,fontFamily:"'Cinzel',Georgia,serif"}}>{date}</div>
      {children}
      {onDelete && (
        <button onClick={onDelete} style={{position:'absolute',top:10,right:12,background:'none',
          border:'none',color:C.dim,cursor:'pointer',fontSize:13}}>×</button>
      )}
    </div>
  )
}

// ─── HELPERS ────────────────────────────────────────────────────────────────
function useToolData(get, set, key) {
  const load = () => { try { return JSON.parse(get(key)||'[]') } catch { return [] } }
  const save = (data) => set(key, JSON.stringify(data))
  return [load, save]
}

// ─── TOOL 1: Battle Log ─────────────────────────────────────────────────────
function BattleLog({C, get, set}) {
  const [load,save] = useToolData(get,set,'tool_battles')
  const [cat,setCat] = useState('peace')
  const [notes,setNotes] = useState('')
  const [saved,setSaved] = useState(false)
  const entries = load()
  const cats = ['peace','purity','purpose','relationships','health','mind','finances','other']
  const add = () => {
    if(!notes.trim()) return
    save([{date:dateStr(),category:cat,notes},{...entries},...entries.slice(0,19)])
    setNotes(''); setSaved(true); setTimeout(()=>setSaved(false),1800)
  }
  return (
    <div>
      <Section title="Log a Battle" C={C}>
        <label style={lbl(C)}>Area Under Attack</label>
        <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:12}}>
          {cats.map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{
              background:cat===c?C.redF:'rgba(255,255,255,0.04)',
              border:`1px solid ${cat===c?C.redB:C.border}`,
              color:cat===c?C.redL:C.muted,padding:'5px 12px',borderRadius:20,
              cursor:'pointer',fontSize:12,fontFamily:"'Cinzel',Georgia,serif",
              textTransform:'capitalize',transition:'all .18s',
            }}>{c}</button>
          ))}
        </div>
        <label style={lbl(C)}>What did the attack look like?</label>
        <textarea style={ta(C)} rows={3} value={notes} onChange={e=>setNotes(e.target.value)}
          placeholder="Describe the attack — what triggered it, how it came, what it targeted..."/>
        <button style={saveBtn(C,saved)} onClick={add}>{saved?'✓ Logged':'Log This Battle'}</button>
      </Section>
      {entries.length>0 && (
        <Section title={`Battle Log (${entries.length})`} C={C}>
          {entries.map((e,i)=>(
            <Entry key={i} C={C} date={e.date} onDelete={()=>save(entries.filter((_,j)=>j!==i))}>
              <span style={{fontSize:10,color:C.redL,fontFamily:"'Cinzel',Georgia,serif",
                letterSpacing:'0.1em',textTransform:'capitalize',marginBottom:6,display:'block'}}>{e.category}</span>
              <p style={{fontSize:15,color:C.text,lineHeight:1.7,margin:0}}>{e.notes}</p>
            </Entry>
          ))}
        </Section>
      )}
    </div>
  )
}

// ─── TOOL 2: Daily Armor Check ───────────────────────────────────────────────
function ArmorCheck({C, get, set}) {
  const pieces = [
    {id:'truth',label:'Belt of Truth',desc:'I am grounded in God\'s Word and personal integrity'},
    {id:'righteousness',label:'Breastplate of Righteousness',desc:'My heart is guarded — positionally and practically'},
    {id:'peace',label:'Gospel of Peace',desc:'I stand on the stability of the gospel'},
    {id:'faith',label:'Shield of Faith',desc:'I raise active faith against every flaming dart'},
    {id:'salvation',label:'Helmet of Salvation',desc:'My mind is protected by the reality of my salvation'},
    {id:'sword',label:'Sword of the Spirit',desc:'I have God\'s Word ready and will speak it'},
    {id:'prayer',label:'Prayer',desc:'I am alert, praying in the Spirit for all believers'},
  ]
  const today = new Date().toISOString().split('T')[0]
  const key = `tool_armor_${today}`
  const checked = () => { try { return JSON.parse(get(key)||'[]') } catch { return [] } }
  const toggle = (id) => {
    const current = checked()
    const updated = current.includes(id) ? current.filter(c=>c!==id) : [...current,id]
    set(key, JSON.stringify(updated))
  }
  const done = checked()
  const allOn = done.length === pieces.length
  return (
    <div>
      <div style={{...card(C),background:allOn?'rgba(124,146,132,0.1)':C.bgCard,
        border:`1px solid ${allOn?'rgba(124,146,132,0.3)':C.border}`,marginBottom:16,textAlign:'center'}}>
        <div style={{fontSize:allOn?28:22,marginBottom:4}}>{allOn?'⚔️':'🛡️'}</div>
        <div style={{fontSize:13,color:allOn?C.green:C.muted,fontFamily:"'Cinzel',Georgia,serif",letterSpacing:'0.08em'}}>
          {allOn?'Fully Armed Today':'Put On Your Armor'} — {done.length}/{pieces.length}
        </div>
      </div>
      <Section title="Today's Armor Check" C={C}>
        {pieces.map(p=>{
          const on = done.includes(p.id)
          return(
            <button key={p.id} onClick={()=>toggle(p.id)} style={{
              width:'100%',display:'flex',alignItems:'flex-start',gap:12,
              background:on?C.redF:C.bgCard,border:`1px solid ${on?C.redB:C.border}`,
              borderRadius:12,padding:'13px 14px',cursor:'pointer',
              textAlign:'left',marginBottom:8,transition:'all .2s',
            }}>
              <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${on?C.redL:C.dim}`,
                background:on?C.redL:'transparent',flexShrink:0,marginTop:1,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:12,color:'#fff',transition:'all .2s'}}>
                {on?'✓':''}
              </div>
              <div>
                <div style={{fontSize:13,color:on?C.cream:C.text,fontFamily:"'Cinzel',Georgia,serif",
                  fontWeight:600,marginBottom:2}}>{p.label}</div>
                <div style={{fontSize:13,color:C.muted,fontStyle:'italic',lineHeight:1.5}}>{p.desc}</div>
              </div>
            </button>
          )
        })}
      </Section>
    </div>
  )
}

// ─── TOOL 3: Stronghold Breaker ──────────────────────────────────────────────
function StrongholdBreaker({C, get, set}) {
  const [load,save] = useToolData(get,set,'tool_strongholds')
  const [lie,setLie] = useState('')
  const [truth,setTruth] = useState('')
  const [scripture,setScripture] = useState('')
  const [saved,setSaved] = useState(false)
  const entries = load()
  const add = () => {
    if(!lie.trim()||!truth.trim()) return
    save([{date:dateStr(),startDate:new Date().toISOString(),lie,truth,scripture,days:[]},
      ...entries.slice(0,9)])
    setLie('');setTruth('');setScripture('');setSaved(true);setTimeout(()=>setSaved(false),1800)
  }
  const markToday = (i) => {
    const updated = [...entries]
    const today = new Date().toISOString().split('T')[0]
    if(!updated[i].days.includes(today)) {
      updated[i].days = [...(updated[i].days||[]),today]
      save(updated)
    }
  }
  return (
    <div>
      <Section title="Identify a Stronghold" C={C}>
        <label style={lbl(C)}>The Lie</label>
        <input style={inp(C)} value={lie} onChange={e=>setLie(e.target.value)}
          placeholder="What lie has been operating in your thinking?"/>
        <div style={{height:10}}/>
        <label style={lbl(C)}>The Truth (God's Word)</label>
        <textarea style={ta(C)} rows={2} value={truth} onChange={e=>setTruth(e.target.value)}
          placeholder="What does God say that directly contradicts this lie?"/>
        <div style={{height:10}}/>
        <label style={lbl(C)}>Scripture Reference (optional)</label>
        <input style={inp(C)} value={scripture} onChange={e=>setScripture(e.target.value)}
          placeholder="e.g. Romans 8:1"/>
        <button style={saveBtn(C,saved)} onClick={add}>{saved?'✓ Stronghold Identified':'Break This Stronghold'}</button>
      </Section>
      {entries.length>0 && (
        <Section title="Active Strongholds" C={C}>
          {entries.map((e,i)=>{
            const days = e.days?.length||0
            const today = new Date().toISOString().split('T')[0]
            const declaredToday = e.days?.includes(today)
            return(
              <div key={i} style={{...card(C),borderLeft:`3px solid ${C.redL}`}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                  <span style={tag(C)}>Day {days} of Breaking</span>
                  <button onClick={()=>save(entries.filter((_,j)=>j!==i))} style={{background:'none',border:'none',color:C.dim,cursor:'pointer',fontSize:13}}>×</button>
                </div>
                <p style={{fontSize:13,color:C.muted,fontStyle:'italic',marginBottom:4}}>Lie: "{e.lie}"</p>
                <p style={{fontSize:15,color:C.cream,lineHeight:1.65,marginBottom:e.scripture?6:10}}>Truth: {e.truth}</p>
                {e.scripture && <p style={{fontSize:12,color:C.gold,fontFamily:"'Cinzel',Georgia,serif",marginBottom:10}}>{e.scripture}</p>}
                <button onClick={()=>markToday(i)} style={{
                  width:'100%',background:declaredToday?'rgba(124,146,132,0.15)':C.redF,
                  border:`1px solid ${declaredToday?'rgba(124,146,132,0.4)':C.redB}`,
                  color:declaredToday?C.green:C.redL,padding:'9px',borderRadius:9,
                  cursor:'pointer',fontSize:12,fontFamily:"'Cinzel',Georgia,serif",letterSpacing:'0.07em',
                }}>
                  {declaredToday?'✓ Declared Today':'Declare Truth Today'}
                </button>
              </div>
            )
          })}
        </Section>
      )}
    </div>
  )
}

// ─── TOOL 4: Attack Pattern Log ──────────────────────────────────────────────
function AttackPatternLog({C, get, set}) {
  const [load,save] = useToolData(get,set,'tool_attacks')
  const [type,setType] = useState('accusation')
  const [method,setMethod] = useState('')
  const [response,setResponse] = useState('')
  const [saved,setSaved] = useState(false)
  const entries = load()
  const types = ['accusation','temptation','deception','fear','discouragement','confusion','distraction','isolation']
  const add = () => {
    if(!method.trim()) return
    save([{date:dateStr(),type,method,response},...entries.slice(0,19)])
    setMethod('');setResponse('');setSaved(true);setTimeout(()=>setSaved(false),1800)
  }
  return (
    <div>
      <Section title="Log an Attack" C={C}>
        <label style={lbl(C)}>Type of Attack</label>
        <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:12}}>
          {types.map(t=>(
            <button key={t} onClick={()=>setType(t)} style={{
              background:type===t?C.redF:'rgba(255,255,255,0.04)',
              border:`1px solid ${type===t?C.redB:C.border}`,
              color:type===t?C.redL:C.muted,padding:'5px 12px',borderRadius:20,
              cursor:'pointer',fontSize:12,fontFamily:"'Cinzel',Georgia,serif",
              textTransform:'capitalize',transition:'all .18s',
            }}>{t}</button>
          ))}
        </div>
        <label style={lbl(C)}>How did it come?</label>
        <textarea style={ta(C)} rows={2} value={method} onChange={e=>setMethod(e.target.value)}
          placeholder="Describe the method — thought, situation, person, timing..."/>
        <div style={{height:10}}/>
        <label style={lbl(C)}>How did you respond?</label>
        <textarea style={ta(C)} rows={2} value={response} onChange={e=>setResponse(e.target.value)}
          placeholder="What did you do — Scripture, prayer, worship, resistance..."/>
        <button style={saveBtn(C,saved)} onClick={add}>{saved?'✓ Logged':'Log This Attack'}</button>
      </Section>
      {entries.length>0 && (
        <Section title={`Pattern Log (${entries.length})`} C={C}>
          {entries.map((e,i)=>(
            <Entry key={i} C={C} date={e.date} onDelete={()=>save(entries.filter((_,j)=>j!==i))}>
              <span style={{fontSize:10,color:C.redL,fontFamily:"'Cinzel',Georgia,serif",
                letterSpacing:'0.1em',textTransform:'capitalize',marginBottom:6,display:'block'}}>{e.type}</span>
              <p style={{fontSize:15,color:C.text,lineHeight:1.65,marginBottom:e.response?8:0}}>{e.method}</p>
              {e.response && <p style={{fontSize:14,color:C.green,fontStyle:'italic',lineHeight:1.6,margin:0}}>Response: {e.response}</p>}
            </Entry>
          ))}
        </Section>
      )}
    </div>
  )
}

// ─── TOOL 5: Fast Tracker ────────────────────────────────────────────────────
function FastTracker({C, get, set}) {
  const [load,save] = useToolData(get,set,'tool_fasts')
  const [phase,setPhase] = useState('new') // new | active | reflect
  const [intention,setIntention] = useState('')
  const [type,setType] = useState('full')
  const [duration,setDuration] = useState('1')
  const [notes,setNotes] = useState('')
  const [revelations,setRevelations] = useState('')
  const [saved,setSaved] = useState(false)
  const entries = load()
  const active = entries.find(e=>!e.endDate)
  const fastTypes = ['full','partial','sunrise-sunset','daniel']
  const add = () => {
    if(!intention.trim()) return
    save([{intention,type,duration,startDate:dateStr(),endDate:null,notes:'',revelations:''},...entries])
    setIntention('');setSaved(true);setTimeout(()=>setSaved(false),1800)
  }
  const end = (i) => {
    const updated = [...entries]
    updated[i] = {...updated[i],endDate:dateStr(),notes,revelations}
    save(updated)
    setNotes('');setRevelations('')
  }
  return (
    <div>
      {!active ? (
        <Section title="Begin a Fast" C={C}>
          <label style={lbl(C)}>Intention — What are you believing God for?</label>
          <textarea style={ta(C)} rows={3} value={intention} onChange={e=>setIntention(e.target.value)}
            placeholder="Be specific. Name what you are standing for in prayer..."/>
          <div style={{height:10}}/>
          <label style={lbl(C)}>Type of Fast</label>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>
            {fastTypes.map(t=>(
              <button key={t} onClick={()=>setType(t)} style={{
                background:type===t?C.redF:'rgba(255,255,255,0.04)',
                border:`1px solid ${type===t?C.redB:C.border}`,
                color:type===t?C.redL:C.muted,padding:'6px 13px',borderRadius:20,
                cursor:'pointer',fontSize:12,fontFamily:"'Cinzel',Georgia,serif",
                textTransform:'capitalize',transition:'all .18s',
              }}>{t === 'sunrise-sunset' ? 'Sunrise–Sunset' : t.charAt(0).toUpperCase()+t.slice(1)}</button>
            ))}
          </div>
          <label style={lbl(C)}>Duration (days)</label>
          <input style={inp(C)} type="number" min="1" max="40" value={duration}
            onChange={e=>setDuration(e.target.value)} placeholder="1"/>
          <button style={saveBtn(C,saved)} onClick={add}>{saved?'✓ Fast Started':'Begin This Fast'}</button>
        </Section>
      ) : (
        <Section title="Active Fast" C={C}>
          <div style={{background:C.redF,border:`1px solid ${C.redB}`,borderRadius:14,padding:'16px',marginBottom:14}}>
            <div style={{fontSize:10,color:C.redL,fontFamily:"'Cinzel',Georgia,serif",letterSpacing:'0.1em',marginBottom:6}}>🔥 FASTING NOW — {active.type} · {active.duration} day{active.duration>1?'s':''}</div>
            <p style={{fontSize:16,color:C.cream,lineHeight:1.75,margin:0,fontStyle:'italic'}}>{active.intention}</p>
            <div style={{fontSize:11,color:C.muted,marginTop:6}}>Started {active.startDate}</div>
          </div>
          <label style={lbl(C)}>Daily Notes</label>
          <textarea style={ta(C)} rows={3} value={notes} onChange={e=>setNotes(e.target.value)}
            placeholder="What is God speaking? What are you noticing spiritually?"/>
          <div style={{height:10}}/>
          <label style={lbl(C)}>Revelations</label>
          <textarea style={ta(C)} rows={3} value={revelations} onChange={e=>setRevelations(e.target.value)}
            placeholder="Any specific revelations, breakthrough moments, or clarity received..."/>
          <button onClick={()=>end(0)} style={{...saveBtn(C,false),background:'rgba(124,146,132,0.15)',
            border:'1px solid rgba(124,146,132,0.4)',color:C.green}}>
            ✓ Complete This Fast
          </button>
        </Section>
      )}
      {entries.filter(e=>e.endDate).length>0 && (
        <Section title="Completed Fasts" C={C}>
          {entries.filter(e=>e.endDate).map((e,i)=>(
            <div key={i} style={card(C)}>
              <div style={{fontSize:10,color:C.muted,marginBottom:4}}>{e.startDate} → {e.endDate} · {e.type} · {e.duration}d</div>
              <p style={{fontSize:14,color:C.cream,fontStyle:'italic',lineHeight:1.65,marginBottom:e.revelations?8:0}}>{e.intention}</p>
              {e.revelations && <p style={{fontSize:13,color:C.gold,lineHeight:1.65,margin:0}}>✦ {e.revelations}</p>}
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

// ─── TOOL 6: Declaration Builder ─────────────────────────────────────────────
function DeclarationBuilder({C, get, set}) {
  const [load,save] = useToolData(get,set,'tool_declarations')
  const [text,setText] = useState('')
  const [saved,setSaved] = useState(false)
  const entries = load()
  const add = () => {
    if(!text.trim()) return
    save([{text,startDate:new Date().toISOString(),days:[]},...entries.slice(0,9)])
    setText('');setSaved(true);setTimeout(()=>setSaved(false),1800)
  }
  const markToday = (i) => {
    const updated = [...entries]
    const today = new Date().toISOString().split('T')[0]
    if(!updated[i].days.includes(today)) {
      updated[i].days = [...(updated[i].days||[]),today]
      save(updated)
    }
  }
  return (
    <div>
      <Section title="Write a Personal Declaration" C={C}>
        <label style={lbl(C)}>Your Declaration (based on Scripture)</label>
        <textarea style={ta(C)} rows={4} value={text} onChange={e=>setText(e.target.value)}
          placeholder="Write your personal declaration in first person, grounded in God's Word..."/>
        <button style={saveBtn(C,saved)} onClick={add}>{saved?'✓ Declaration Added':'Add This Declaration'}</button>
      </Section>
      {entries.length>0 && (
        <Section title="Your Declarations" C={C}>
          {entries.map((e,i)=>{
            const days = e.days?.length||0
            const today = new Date().toISOString().split('T')[0]
            const spokenToday = e.days?.includes(today)
            return(
              <div key={i} style={{...card(C),borderLeft:`3px solid ${spokenToday?C.green:C.redL}`}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8,alignItems:'center'}}>
                  <span style={{fontSize:11,color:spokenToday?C.green:C.redL,fontFamily:"'Cinzel',Georgia,serif"}}>
                    {days} day{days!==1?'s':''} declared
                  </span>
                  <button onClick={()=>save(entries.filter((_,j)=>j!==i))} style={{background:'none',border:'none',color:C.dim,cursor:'pointer',fontSize:13}}>×</button>
                </div>
                <p style={{fontSize:16,color:C.cream,fontStyle:'italic',lineHeight:1.8,marginBottom:10}}>"{e.text}"</p>
                <button onClick={()=>markToday(i)} style={{
                  width:'100%',background:spokenToday?'rgba(124,146,132,0.15)':C.redF,
                  border:`1px solid ${spokenToday?'rgba(124,146,132,0.4)':C.redB}`,
                  color:spokenToday?C.green:C.redL,padding:'9px',borderRadius:9,
                  cursor:'pointer',fontSize:12,fontFamily:"'Cinzel',Georgia,serif",letterSpacing:'0.07em',
                }}>
                  {spokenToday?'✓ Spoken Today':'Speak This Today'}
                </button>
              </div>
            )
          })}
        </Section>
      )}
    </div>
  )
}

// ─── TOOL 7: Thought Journal ─────────────────────────────────────────────────
function ThoughtJournal({C, get, set}) {
  const [load,save] = useToolData(get,set,'tool_thoughts')
  const [lie,setLie] = useState('')
  const [truth,setTruth] = useState('')
  const [saved,setSaved] = useState(false)
  const entries = load()
  const add = () => {
    if(!lie.trim()||!truth.trim()) return
    save([{date:dateStr(),lie,truth,renewals:0},...entries.slice(0,19)])
    setLie('');setTruth('');setSaved(true);setTimeout(()=>setSaved(false),1800)
  }
  const renew = (i) => {
    const updated = [...entries]
    updated[i].renewals = (updated[i].renewals||0)+1
    save(updated)
  }
  return (
    <div>
      <Section title="Capture a Thought" C={C}>
        <label style={lbl(C)}>The Thought / Lie</label>
        <textarea style={ta(C)} rows={2} value={lie} onChange={e=>setLie(e.target.value)}
          placeholder="Write the recurring negative, fearful, or condemning thought..."/>
        <div style={{height:10}}/>
        <label style={lbl(C)}>The Replacement Truth</label>
        <textarea style={ta(C)} rows={2} value={truth} onChange={e=>setTruth(e.target.value)}
          placeholder="What does God say that directly replaces this thought?"/>
        <button style={saveBtn(C,saved)} onClick={add}>{saved?'✓ Captured':'Take This Thought Captive'}</button>
      </Section>
      {entries.length>0 && (
        <Section title="Captive Thoughts" C={C}>
          {entries.map((e,i)=>(
            <div key={i} style={card(C)}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontSize:10,color:C.dim}}>{e.date}</span>
                <button onClick={()=>save(entries.filter((_,j)=>j!==i))} style={{background:'none',border:'none',color:C.dim,cursor:'pointer',fontSize:13}}>×</button>
              </div>
              <p style={{fontSize:13,color:C.muted,fontStyle:'italic',marginBottom:4,lineHeight:1.6}}>Lie: "{e.lie}"</p>
              <p style={{fontSize:15,color:C.cream,lineHeight:1.7,marginBottom:10}}>Truth: {e.truth}</p>
              <button onClick={()=>renew(i)} style={{
                width:'100%',background:C.redF,border:`1px solid ${C.redB}`,
                color:C.redL,padding:'8px',borderRadius:9,cursor:'pointer',
                fontSize:12,fontFamily:"'Cinzel',Georgia,serif",letterSpacing:'0.07em',
              }}>
                Declare Truth — {e.renewals||0} time{e.renewals!==1?'s':''}
              </button>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

// ─── TOOL 8: Fear Inventory ──────────────────────────────────────────────────
function FearInventory({C, get, set}) {
  const [load,save] = useToolData(get,set,'tool_fears')
  const [fear,setFear] = useState('')
  const [scripture,setScripture] = useState('')
  const [saved,setSaved] = useState(false)
  const entries = load()
  const add = () => {
    if(!fear.trim()) return
    save([{date:dateStr(),fear,scripture,groundLost:false},...entries.slice(0,19)])
    setFear('');setScripture('');setSaved(true);setTimeout(()=>setSaved(false),1800)
  }
  const toggleGround = (i) => {
    const updated = [...entries]
    updated[i].groundLost = !updated[i].groundLost
    save(updated)
  }
  return (
    <div>
      <Section title="Name a Fear" C={C}>
        <p style={{fontSize:14,color:C.muted,fontStyle:'italic',lineHeight:1.7,marginBottom:12}}>
          Name it specifically. A named fear is a confronted fear.
        </p>
        <label style={lbl(C)}>The Fear</label>
        <input style={inp(C)} value={fear} onChange={e=>setFear(e.target.value)}
          placeholder="Name it clearly and specifically..."/>
        <div style={{height:10}}/>
        <label style={lbl(C)}>Scripture That Addresses It</label>
        <input style={inp(C)} value={scripture} onChange={e=>setScripture(e.target.value)}
          placeholder="e.g. 2 Timothy 1:7 — God has not given me a spirit of fear..."/>
        <button style={saveBtn(C,saved)} onClick={add}>{saved?'✓ Named & Confronted':'Name This Fear'}</button>
      </Section>
      {entries.length>0 && (
        <Section title="Fear Inventory" C={C}>
          {entries.map((e,i)=>(
            <div key={i} style={{...card(C),opacity:e.groundLost?0.6:1,borderLeft:`3px solid ${e.groundLost?C.green:C.redL}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                <p style={{fontSize:15,color:e.groundLost?C.muted:C.cream,lineHeight:1.65,
                  margin:0,textDecoration:e.groundLost?'line-through':'none',flex:1}}>{e.fear}</p>
                <button onClick={()=>save(entries.filter((_,j)=>j!==i))} style={{background:'none',border:'none',color:C.dim,cursor:'pointer',fontSize:13,flexShrink:0,marginLeft:8}}>×</button>
              </div>
              {e.scripture && <p style={{fontSize:13,color:C.gold,fontStyle:'italic',lineHeight:1.65,marginBottom:8}}>{e.scripture}</p>}
              <button onClick={()=>toggleGround(i)} style={{
                width:'100%',background:e.groundLost?'rgba(124,146,132,0.15)':C.redF,
                border:`1px solid ${e.groundLost?'rgba(124,146,132,0.4)':C.redB}`,
                color:e.groundLost?C.green:C.redL,padding:'8px',borderRadius:9,
                cursor:'pointer',fontSize:12,fontFamily:"'Cinzel',Georgia,serif",letterSpacing:'0.07em',
              }}>
                {e.groundLost?'✓ This Fear Lost Ground':'Mark as Losing Ground'}
              </button>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

// ─── TOOL 9: Worship Log ─────────────────────────────────────────────────────
function WorshipLog({C, get, set}) {
  const [load,save] = useToolData(get,set,'tool_worship')
  const [notes,setNotes] = useState('')
  const [shift,setShift] = useState('')
  const [saved,setSaved] = useState(false)
  const entries = load()
  const add = () => {
    if(!notes.trim()) return
    save([{date:dateStr(),notes,shift},...entries.slice(0,29)])
    setNotes('');setShift('');setSaved(true);setTimeout(()=>setSaved(false),1800)
  }
  return (
    <div>
      <Section title="Log a Worship Moment" C={C}>
        <label style={lbl(C)}>What happened when you worshipped?</label>
        <textarea style={ta(C)} rows={3} value={notes} onChange={e=>setNotes(e.target.value)}
          placeholder="Describe the moment — when, what you did, what you felt or sensed..."/>
        <div style={{height:10}}/>
        <label style={lbl(C)}>Atmospheric Shift (optional)</label>
        <input style={inp(C)} value={shift} onChange={e=>setShift(e.target.value)}
          placeholder="Did something shift — spiritually, emotionally, circumstantially?"/>
        <button style={saveBtn(C,saved)} onClick={add}>{saved?'✓ Logged':'Log This Moment'}</button>
      </Section>
      {entries.length>0 && (
        <Section title={`Worship Log (${entries.length})`} C={C}>
          {entries.map((e,i)=>(
            <Entry key={i} C={C} date={e.date} onDelete={()=>save(entries.filter((_,j)=>j!==i))}>
              <p style={{fontSize:15,color:C.text,lineHeight:1.7,marginBottom:e.shift?8:0}}>{e.notes}</p>
              {e.shift && <p style={{fontSize:13,color:C.gold,fontStyle:'italic',lineHeight:1.6,margin:0}}>✦ Shift: {e.shift}</p>}
            </Entry>
          ))}
        </Section>
      )}
    </div>
  )
}

// ─── TOOL 10: Generational Map ───────────────────────────────────────────────
function GenerationalMap({C, get, set}) {
  const data = () => { try { return JSON.parse(get('tool_gen')||'{"patterns":[],"declarations":[]}') } catch { return {patterns:[],declarations:[]} } }
  const saveData = (d) => set('tool_gen', JSON.stringify(d))
  const [pattern,setPattern] = useState('')
  const [declaration,setDeclaration] = useState('')
  const [savedP,setSavedP] = useState(false)
  const [savedD,setSavedD] = useState(false)
  const d = data()
  const addPattern = () => {
    if(!pattern.trim()) return
    saveData({...d,patterns:[{date:dateStr(),text:pattern,broken:false},...d.patterns.slice(0,9)]})
    setPattern('');setSavedP(true);setTimeout(()=>setSavedP(false),1800)
  }
  const addDeclaration = () => {
    if(!declaration.trim()) return
    saveData({...d,declarations:[{date:dateStr(),text:declaration},...d.declarations.slice(0,9)]})
    setDeclaration('');setSavedD(true);setTimeout(()=>setSavedD(false),1800)
  }
  const togglePattern = (i) => {
    const updated = {...d,patterns:[...d.patterns]}
    updated.patterns[i].broken = !updated.patterns[i].broken
    saveData(updated)
  }
  return (
    <div>
      <Section title="Patterns to Break" C={C}>
        <input style={inp(C)} value={pattern} onChange={e=>setPattern(e.target.value)}
          placeholder="Name a generational pattern you are breaking..."/>
        <button style={saveBtn(C,savedP)} onClick={addPattern}>{savedP?'✓ Added':'Add Pattern'}</button>
        <div style={{marginTop:12}}>
          {d.patterns.map((p,i)=>(
            <button key={i} onClick={()=>togglePattern(i)} style={{
              width:'100%',display:'flex',alignItems:'center',gap:10,
              background:p.broken?'rgba(124,146,132,0.1)':C.redF,
              border:`1px solid ${p.broken?'rgba(124,146,132,0.3)':C.redB}`,
              borderRadius:10,padding:'11px 13px',cursor:'pointer',
              textAlign:'left',marginBottom:7,transition:'all .2s',
            }}>
              <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${p.broken?C.green:C.redL}`,
                background:p.broken?C.green:'transparent',flexShrink:0,display:'flex',
                alignItems:'center',justifyContent:'center',fontSize:11,color:'#fff'}}>
                {p.broken?'✓':''}
              </div>
              <span style={{fontSize:14,color:p.broken?C.muted:C.cream,
                textDecoration:p.broken?'line-through':'none'}}>{p.text}</span>
            </button>
          ))}
        </div>
      </Section>
      <Section title="New Inheritance Declarations" C={C}>
        <textarea style={ta(C)} rows={3} value={declaration} onChange={e=>setDeclaration(e.target.value)}
          placeholder="What new inheritance are you establishing? What will be true of your line?"/>
        <button style={saveBtn(C,savedD)} onClick={addDeclaration}>{savedD?'✓ Declared':'Declare New Inheritance'}</button>
        <div style={{marginTop:12}}>
          {d.declarations.map((dec,i)=>(
            <div key={i} style={{...card(C),borderLeft:`3px solid ${C.gold}`}}>
              <div style={{fontSize:10,color:C.dim,marginBottom:6}}>{dec.date}</div>
              <p style={{fontSize:15,color:C.cream,fontStyle:'italic',lineHeight:1.75,margin:0}}>"{dec.text}"</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

// ─── TOOL 11: Voice Tracker ──────────────────────────────────────────────────
function VoiceTracker({C, get, set}) {
  const [load,save] = useToolData(get,set,'tool_voices')
  const [thought,setThought] = useState('')
  const [source,setSource] = useState('unknown')
  const [response,setResponse] = useState('')
  const [saved,setSaved] = useState(false)
  const entries = load()
  const sources = ['God','enemy','flesh','unknown']
  const add = () => {
    if(!thought.trim()) return
    save([{date:dateStr(),thought,source,response},...entries.slice(0,29)])
    setThought('');setResponse('');setSaved(true);setTimeout(()=>setSaved(false),1800)
  }
  const srcColor = (s) => s==='God'?C.green:s==='enemy'?C.redL:s==='flesh'?C.gold:C.muted
  return (
    <div>
      <Section title="Log a Thought" C={C}>
        <label style={lbl(C)}>The Thought</label>
        <textarea style={ta(C)} rows={2} value={thought} onChange={e=>setThought(e.target.value)}
          placeholder="Write the thought or voice you're discerning..."/>
        <div style={{height:10}}/>
        <label style={lbl(C)}>Source</label>
        <div style={{display:'flex',gap:8,marginBottom:12}}>
          {sources.map(s=>(
            <button key={s} onClick={()=>setSource(s)} style={{
              flex:1,background:source===s?`${srcColor(s)}22`:'rgba(255,255,255,0.04)',
              border:`1px solid ${source===s?srcColor(s):C.border}`,
              color:source===s?srcColor(s):C.muted,padding:'7px 4px',borderRadius:9,
              cursor:'pointer',fontSize:12,fontFamily:"'Cinzel',Georgia,serif",
              transition:'all .18s',
            }}>{s}</button>
          ))}
        </div>
        <label style={lbl(C)}>Your Response</label>
        <textarea style={ta(C)} rows={2} value={response} onChange={e=>setResponse(e.target.value)}
          placeholder="How did you respond or how will you respond?"/>
        <button style={saveBtn(C,saved)} onClick={add}>{saved?'✓ Logged':'Log This'}</button>
      </Section>
      {entries.length>0 && (
        <Section title={`Voice Log (${entries.length})`} C={C}>
          {entries.map((e,i)=>(
            <Entry key={i} C={C} date={e.date} onDelete={()=>save(entries.filter((_,j)=>j!==i))}>
              <span style={{fontSize:10,color:srcColor(e.source),fontFamily:"'Cinzel',Georgia,serif",
                letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6,display:'block'}}>{e.source}</span>
              <p style={{fontSize:15,color:C.text,lineHeight:1.65,marginBottom:e.response?8:0}}>{e.thought}</p>
              {e.response && <p style={{fontSize:13,color:C.green,fontStyle:'italic',lineHeight:1.6,margin:0}}>Response: {e.response}</p>}
            </Entry>
          ))}
        </Section>
      )}
    </div>
  )
}

// ─── TOOL 12: Authority Log ──────────────────────────────────────────────────
function AuthorityLog({C, get, set}) {
  const [load,save] = useToolData(get,set,'tool_authority')
  const [situation,setSituation] = useState('')
  const [action,setAction] = useState('')
  const [result,setResult] = useState('')
  const [saved,setSaved] = useState(false)
  const entries = load()
  const add = () => {
    if(!situation.trim()) return
    save([{date:dateStr(),situation,action,result},...entries.slice(0,29)])
    setSituation('');setAction('');setResult('');setSaved(true);setTimeout(()=>setSaved(false),1800)
  }
  return (
    <div>
      <Section title="Log an Authority Moment" C={C}>
        <label style={lbl(C)}>The Situation</label>
        <textarea style={ta(C)} rows={2} value={situation} onChange={e=>setSituation(e.target.value)}
          placeholder="What was the spiritual situation that called for authority?"/>
        <div style={{height:10}}/>
        <label style={lbl(C)}>How You Exercised Authority</label>
        <textarea style={ta(C)} rows={2} value={action} onChange={e=>setAction(e.target.value)}
          placeholder="What did you do — declare, resist, pray, rebuke..."/>
        <div style={{height:10}}/>
        <label style={lbl(C)}>Result (optional)</label>
        <input style={inp(C)} value={result} onChange={e=>setResult(e.target.value)}
          placeholder="What happened — immediately or over time?"/>
        <button style={saveBtn(C,saved)} onClick={add}>{saved?'✓ Logged':'Log This'}</button>
      </Section>
      {entries.length>0 && (
        <Section title={`Authority Log (${entries.length})`} C={C}>
          {entries.map((e,i)=>(
            <Entry key={i} C={C} date={e.date} onDelete={()=>save(entries.filter((_,j)=>j!==i))}>
              <p style={{fontSize:15,color:C.text,lineHeight:1.65,marginBottom:e.action?8:0}}>{e.situation}</p>
              {e.action && <p style={{fontSize:14,color:C.cream,lineHeight:1.6,marginBottom:e.result?6:0}}>Action: {e.action}</p>}
              {e.result && <p style={{fontSize:13,color:C.green,fontStyle:'italic',lineHeight:1.6,margin:0}}>Result: {e.result}</p>}
            </Entry>
          ))}
        </Section>
      )}
    </div>
  )
}

// ─── TOOL 13: Intercession List ──────────────────────────────────────────────
function IntercessionList({C, get, set}) {
  const [load,save] = useToolData(get,set,'tool_intercession')
  const [name,setName] = useState('')
  const [request,setRequest] = useState('')
  const [saved,setSaved] = useState(false)
  const entries = load()
  const add = () => {
    if(!name.trim()) return
    save([{date:dateStr(),name,request,prayerCount:0,breakthrough:''},...entries.slice(0,49)])
    setName('');setRequest('');setSaved(true);setTimeout(()=>setSaved(false),1800)
  }
  const pray = (i) => {
    const updated = [...entries]
    updated[i].prayerCount = (updated[i].prayerCount||0)+1
    save(updated)
  }
  const markBreakthrough = (i) => {
    const updated = [...entries]
    updated[i].breakthrough = updated[i].breakthrough ? '' : dateStr()
    save(updated)
  }
  return (
    <div>
      <Section title="Add to Intercession List" C={C}>
        <label style={lbl(C)}>Name</label>
        <input style={inp(C)} value={name} onChange={e=>setName(e.target.value)}
          placeholder="Who are you standing in the gap for?"/>
        <div style={{height:10}}/>
        <label style={lbl(C)}>Specific Request</label>
        <textarea style={ta(C)} rows={2} value={request} onChange={e=>setRequest(e.target.value)}
          placeholder="What specifically are you believing God for on their behalf?"/>
        <button style={saveBtn(C,saved)} onClick={add}>{saved?'✓ Added':'Stand in the Gap'}</button>
      </Section>
      {entries.length>0 && (
        <Section title={`Intercession List (${entries.length})`} C={C}>
          {entries.map((e,i)=>(
            <div key={i} style={{...card(C),borderLeft:`3px solid ${e.breakthrough?C.green:C.gold}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <span style={{fontSize:14,color:C.cream,fontFamily:"'Cinzel',Georgia,serif",fontWeight:600}}>{e.name}</span>
                <div style={{display:'flex',gap:6,alignItems:'center'}}>
                  {e.breakthrough && <span style={{fontSize:10,color:C.green,fontFamily:"'Cinzel',Georgia,serif"}}>✦ Breakthrough</span>}
                  <button onClick={()=>save(entries.filter((_,j)=>j!==i))} style={{background:'none',border:'none',color:C.dim,cursor:'pointer',fontSize:13}}>×</button>
                </div>
              </div>
              {e.request && <p style={{fontSize:14,color:C.text,lineHeight:1.65,marginBottom:10}}>{e.request}</p>}
              <div style={{display:'flex',gap:7}}>
                <button onClick={()=>pray(i)} style={{
                  flex:1,background:C.goldF,border:`1px solid ${C.goldB}`,
                  color:C.gold,padding:'8px',borderRadius:9,cursor:'pointer',
                  fontSize:12,fontFamily:"'Cinzel',Georgia,serif",
                }}>🙏 Prayed ({e.prayerCount||0})</button>
                <button onClick={()=>markBreakthrough(i)} style={{
                  flex:1,background:e.breakthrough?'rgba(124,146,132,0.15)':C.redF,
                  border:`1px solid ${e.breakthrough?'rgba(124,146,132,0.4)':C.redB}`,
                  color:e.breakthrough?C.green:C.redL,padding:'8px',borderRadius:9,
                  cursor:'pointer',fontSize:12,fontFamily:"'Cinzel',Georgia,serif",
                }}>{e.breakthrough?'✓ Breakthrough':'Mark Breakthrough'}</button>
              </div>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

// ─── TOOL 14: Covenant Tracker ───────────────────────────────────────────────
function CovenantTracker({C, get, set}) {
  const data = () => { try { return JSON.parse(get('tool_covenant')||'{"commitments":[],"checkins":{}}') } catch { return {commitments:[],checkins:{}} } }
  const saveData = (d) => set('tool_covenant', JSON.stringify(d))
  const [commitment,setCommitment] = useState('')
  const [notes,setNotes] = useState('')
  const [saved,setSaved] = useState(false)
  const d = data()
  const today = new Date().toISOString().split('T')[0]
  const addCommitment = () => {
    if(!commitment.trim()) return
    saveData({...d,commitments:[{text:commitment,date:dateStr()},...d.commitments.slice(0,9)]})
    setCommitment('');setSaved(true);setTimeout(()=>setSaved(false),1800)
  }
  const checkIn = () => {
    if(!notes.trim()) return
    const checkins = {...d.checkins,[today]:notes}
    saveData({...d,checkins})
    setNotes('')
  }
  const checkedIn = d.checkins?.[today]
  return (
    <div>
      <Section title="Covenant Commitments" C={C}>
        <label style={lbl(C)}>My Covenant</label>
        <textarea style={ta(C)} rows={2} value={commitment} onChange={e=>setCommitment(e.target.value)}
          placeholder="What specific commitment are you making before God today?"/>
        <button style={saveBtn(C,saved)} onClick={addCommitment}>{saved?'✓ Covenant Made':'Make This Covenant'}</button>
        {d.commitments.length>0 && (
          <div style={{marginTop:12}}>
            {d.commitments.map((c,i)=>(
              <div key={i} style={{...card(C),borderLeft:`3px solid ${C.gold}`}}>
                <div style={{fontSize:10,color:C.dim,marginBottom:4}}>{c.date}</div>
                <p style={{fontSize:15,color:C.cream,fontStyle:'italic',lineHeight:1.75,margin:0}}>"{c.text}"</p>
              </div>
            ))}
          </div>
        )}
      </Section>
      <Section title="Daily Check-In" C={C}>
        {checkedIn ? (
          <div style={{...card(C),borderLeft:`3px solid ${C.green}`}}>
            <div style={{fontSize:10,color:C.green,fontFamily:"'Cinzel',Georgia,serif",marginBottom:6}}>✦ Checked in today</div>
            <p style={{fontSize:15,color:C.text,lineHeight:1.7,margin:0}}>{checkedIn}</p>
          </div>
        ) : (
          <>
            <textarea style={ta(C)} rows={3} value={notes} onChange={e=>setNotes(e.target.value)}
              placeholder="How did you walk in purity today? Where did you stand firm? Where do you need grace?"/>
            <button style={saveBtn(C,false)} onClick={checkIn}>Check In Today</button>
          </>
        )}
      </Section>
    </div>
  )
}

// ─── TOOL 15: Finish Strong ──────────────────────────────────────────────────
function FinishStrong({C, get, set}) {
  const data = () => { try { return JSON.parse(get('tool_endurance')||'{"commitment":"","why":"","recommitments":[]}') } catch { return {commitment:'',why:'',recommitments:[]} } }
  const saveData = (d) => set('tool_endurance', JSON.stringify(d))
  const [commitment,setCommitment] = useState('')
  const [why,setWhy] = useState('')
  const [note,setNote] = useState('')
  const [saved,setSaved] = useState(false)
  const d = data()
  const saveCommitment = () => {
    if(!commitment.trim()) return
    saveData({...d,commitment,why})
    setCommitment('');setWhy('');setSaved(true);setTimeout(()=>setSaved(false),1800)
  }
  const recommit = () => {
    if(!note.trim()) return
    saveData({...d,recommitments:[{date:dateStr(),note},...(d.recommitments||[]).slice(0,19)]})
    setNote('')
  }
  return (
    <div>
      {!d.commitment ? (
        <Section title="What Are You Not Quitting?" C={C}>
          <label style={lbl(C)}>The Commitment</label>
          <textarea style={ta(C)} rows={2} value={commitment} onChange={e=>setCommitment(e.target.value)}
            placeholder="Name what you are committed to finishing — specifically..."/>
          <div style={{height:10}}/>
          <label style={lbl(C)}>Why You Won't Quit</label>
          <textarea style={ta(C)} rows={2} value={why} onChange={e=>setWhy(e.target.value)}
            placeholder="Why does this matter? What are you running toward?"/>
          <button style={saveBtn(C,saved)} onClick={saveCommitment}>{saved?'✓ Committed':'Set This Commitment'}</button>
        </Section>
      ) : (
        <div>
          <Section title="Your Commitment" C={C}>
            <div style={{background:C.redF,border:`1px solid ${C.redB}`,borderRadius:14,padding:'16px',marginBottom:10}}>
              <div style={{fontSize:9,color:C.redL,fontFamily:"'Cinzel',Georgia,serif",letterSpacing:'0.1em',marginBottom:6}}>I WILL NOT QUIT</div>
              <p style={{fontSize:17,color:C.cream,fontStyle:'italic',lineHeight:1.8,margin:0}}>{d.commitment}</p>
              {d.why && <p style={{fontSize:14,color:C.muted,lineHeight:1.65,marginTop:8,fontStyle:'italic'}}>Why: {d.why}</p>}
            </div>
            <button onClick={()=>saveData({...d,commitment:'',why:''})} style={{
              background:'transparent',border:`1px solid ${C.border}`,color:C.dim,
              padding:'8px 16px',borderRadius:9,cursor:'pointer',fontSize:12,
              fontFamily:"'Cinzel',Georgia,serif",
            }}>Reset Commitment</button>
          </Section>
          <Section title="Weekly Recommitment" C={C}>
            <textarea style={ta(C)} rows={3} value={note} onChange={e=>setNote(e.target.value)}
              placeholder="Where did you feel like quitting this week? What kept you going?"/>
            <button style={saveBtn(C,false)} onClick={recommit}>Recommit This Week</button>
            {(d.recommitments||[]).length>0 && (
              <div style={{marginTop:12}}>
                {d.recommitments.map((r,i)=>(
                  <Entry key={i} C={C} date={r.date}>
                    <p style={{fontSize:15,color:C.text,lineHeight:1.7,margin:0}}>{r.note}</p>
                  </Entry>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}
    </div>
  )
}

// ─── ROUTER ──────────────────────────────────────────────────────────────────
const TOOLS = {
  1: BattleLog,
  2: ArmorCheck,
  3: StrongholdBreaker,
  4: AttackPatternLog,
  5: FastTracker,
  6: DeclarationBuilder,
  7: ThoughtJournal,
  8: FearInventory,
  9: WorshipLog,
  10: GenerationalMap,
  11: VoiceTracker,
  12: AuthorityLog,
  13: IntercessionList,
  14: CovenantTracker,
  15: FinishStrong,
}

const TOOL_NAMES = {
  1:'Battle Log', 2:'Armor Check', 3:'Stronghold Breaker',
  4:'Attack Pattern Log', 5:'Fast Tracker', 6:'Declaration Builder',
  7:'Thought Journal', 8:'Fear Inventory', 9:'Worship Log',
  10:'Generational Map', 11:'Voice Tracker', 12:'Authority Log',
  13:'Intercession List', 14:'Covenant Tracker', 15:'Finish Strong',
}

export { TOOL_NAMES }

export default function WeaponTool({ weapon, C, get, set }) {
  const Tool = TOOLS[weapon.id]
  if (!Tool) return (
    <div style={{padding:'32px',textAlign:'center',color:C.muted,fontStyle:'italic',fontSize:15}}>
      Tool coming soon for this weapon.
    </div>
  )
  return (
    <div>
      <div style={{fontSize:9,color:C.muted,letterSpacing:'0.16em',textTransform:'uppercase',
        fontFamily:"'Cinzel',Georgia,serif",marginBottom:4}}>{TOOL_NAMES[weapon.id]}</div>
      <p style={{fontSize:14,color:C.muted,fontStyle:'italic',lineHeight:1.7,marginBottom:20}}>
        Your personal warfare tool for {weapon.title.toLowerCase()}.
      </p>
      <Tool C={C} get={get} set={set} />
    </div>
  )
}
