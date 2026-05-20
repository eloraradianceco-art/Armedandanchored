import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Dashboard({ userId, weapons, onClose, onSelectWeapon, C }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    supabase.from('weapon_entries').select('*').eq('user_id', userId)
      .then(({ data }) => { setEntries(data || []); setLoading(false) })
  }, [userId])

  const get = (weaponId, key) =>
    entries.find(e => e.weapon_id === weaponId && e.field_key === key)?.field_value || ''

  // Stats
  const weaponsExplored = weapons.filter(w =>
    entries.some(e => e.weapon_id === w.id)
  ).length

  const journalCount = weapons.filter(w => {
    const j = get(w.id, 'journal'); return j && j.length > 10
  }).length

  const declarationsDeployed = weapons.filter(w =>
    get(w.id, 'declared') === 'true'
  ).length

  const versesMemorized = weapons.reduce((sum, w) => {
    const count = w.scriptures.filter((_, i) =>
      get(w.id, `mem_${i}`) === 'true'
    ).length
    return sum + count
  }, 0)

  const totalVerses = weapons.reduce((s, w) => s + w.scriptures.length, 0)

  const toolsUsed = weapons.filter(w =>
    entries.some(e => e.weapon_id === w.id && e.field_key.startsWith('tool_'))
  ).length

  const fastCount = (() => {
    try {
      const f = JSON.parse(get(5, 'tool_fasts') || '[]')
      return f.filter(f => f.completed).length
    } catch { return 0 }
  })()

  const stats = [
    { icon: '⚔️', label: 'Weapons Explored', value: weaponsExplored, total: weapons.length, color: C.redL },
    { icon: '✦', label: 'Declarations Deployed', value: declarationsDeployed, total: weapons.length, color: C.gold },
    { icon: '🧠', label: 'Verses Memorized', value: versesMemorized, total: totalVerses, color: '#7C9284' },
    { icon: '📝', label: 'Weapons Journaled', value: journalCount, total: weapons.length, color: C.muted },
    { icon: '🛠️', label: 'Tools Activated', value: toolsUsed, total: weapons.length, color: C.redL },
    { icon: '⚡', label: 'Fasts Completed', value: fastCount, total: null, color: C.gold },
  ]

  // Per-weapon progress
  const weaponProgress = weapons.map(w => {
    const explored = entries.some(e => e.weapon_id === w.id)
    const journaled = get(w.id, 'journal')?.length > 10
    const declared = get(w.id, 'declared') === 'true'
    const memorized = w.scriptures.some((_, i) => get(w.id, `mem_${i}`) === 'true')
    const tooled = entries.some(e => e.weapon_id === w.id && e.field_key.startsWith('tool_'))
    const score = [explored, journaled, declared, memorized, tooled].filter(Boolean).length
    return { ...w, score, explored, journaled, declared, memorized, tooled }
  })

  const pct = (v, t) => t ? Math.round((v / t) * 100) : 0

  if (loading) return (
    <div style={{ position: 'fixed', inset: 0, background: C.bg, zIndex: 600,
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: C.muted, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.1em' }}>Loading…</div>
    </div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: C.bg, zIndex: 600,
      overflowY: 'auto', fontFamily: "'EB Garamond',Georgia,serif", color: C.text }}>

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, background: 'rgba(7,14,23,0.96)',
        backdropFilter: 'blur(14px)', borderBottom: `1px solid ${C.border}`,
        padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
        <div>
          <div style={{ fontSize: 9, color: C.redL, letterSpacing: '0.16em', textTransform: 'uppercase',
            fontFamily: "'Cinzel',Georgia,serif", marginBottom: 2 }}>Your Warfare</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.cream, fontFamily: "'Cinzel',Georgia,serif" }}>
            Progress Dashboard
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none',
          color: C.muted, cursor: 'pointer', fontSize: 24, lineHeight: 1 }}>×</button>
      </div>

      <div style={{ padding: '20px 18px 100px' }}>

        {/* Overall score */}
        <div style={{ background: `linear-gradient(145deg, rgba(158,40,40,0.15), rgba(176,138,78,0.08))`,
          border: `1px solid rgba(158,40,40,0.3)`, borderRadius: 16, padding: '20px',
          marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: C.redL, letterSpacing: '0.16em',
            fontFamily: "'Cinzel',Georgia,serif", textTransform: 'uppercase', marginBottom: 8 }}>
            Arsenal Readiness
          </div>
          <div style={{ fontSize: 56, fontWeight: 700, color: C.cream,
            fontFamily: "'Cinzel',Georgia,serif", lineHeight: 1, marginBottom: 4 }}>
            {pct(weaponsExplored, weapons.length)}%
          </div>
          <div style={{ fontSize: 13, color: C.muted, fontStyle: 'italic' }}>
            {weaponsExplored} of {weapons.length} weapons in your arsenal
          </div>
          {/* Progress bar */}
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)',
            borderRadius: 2, margin: '14px 0 0', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct(weaponsExplored, weapons.length)}%`,
              background: `linear-gradient(90deg, ${C.redL}, ${C.gold})`,
              borderRadius: 2, transition: 'width 0.8s ease' }}/>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color,
                fontFamily: "'Cinzel',Georgia,serif", lineHeight: 1, marginBottom: 4 }}>
                {s.value}{s.total ? <span style={{ fontSize: 13, color: C.dim, fontWeight: 400 }}>/{s.total}</span> : ''}
              </div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.3 }}>{s.label}</div>
              {s.total && (
                <div style={{ height: 3, background: 'rgba(255,255,255,0.05)',
                  borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct(s.value, s.total)}%`,
                    background: s.color, borderRadius: 2 }}/>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Per-weapon breakdown */}
        <div style={{ fontSize: 9, color: C.muted, letterSpacing: '0.14em',
          textTransform: 'uppercase', fontFamily: "'Cinzel',Georgia,serif", marginBottom: 12 }}>
          Weapon by Weapon
        </div>
        {weaponProgress.map(w => (
          <button key={w.id} onClick={() => { onSelectWeapon(w.id); onClose(); }}
            style={{ width: '100%', background: w.score > 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.015)',
              border: `1px solid ${w.score >= 4 ? 'rgba(176,138,78,0.3)' : w.score > 0 ? C.border : 'rgba(255,255,255,0.04)'}`,
              borderRadius: 12, padding: '12px 14px', marginBottom: 8, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', transition: 'all .2s' }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{w.icon}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 13, color: w.score > 0 ? C.cream : C.dim,
                fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.04em', marginBottom: 4 }}>
                {w.title}
              </span>
              {/* Mini dots */}
              <span style={{ display: 'flex', gap: 4 }}>
                {[
                  { key: 'explored', label: 'Opened', icon: '👁' },
                  { key: 'journaled', label: 'Journaled', icon: '📝' },
                  { key: 'declared', label: 'Declared', icon: '✦' },
                  { key: 'memorized', label: 'Memorized', icon: '🧠' },
                  { key: 'tooled', label: 'Tool used', icon: '🛠' },
                ].map(dot => (
                  <span key={dot.key} title={dot.label} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: w[dot.key] ? C.gold : 'rgba(255,255,255,0.08)',
                    flexShrink: 0,
                  }}/>
                ))}
              </span>
            </span>
            {w.score >= 4 && <span style={{ fontSize: 10, color: C.gold }}>✦</span>}
          </button>
        ))}

        <div style={{ marginTop: 16, fontSize: 12, color: C.dim, textAlign: 'center', fontStyle: 'italic' }}>
          Tap any weapon to open it
        </div>
      </div>
    </div>
  )
}
