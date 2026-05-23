import { useState } from 'react'
import { supabase } from '../supabaseClient'

const STRIPE_LINK = 'https://buy.stripe.com/dRm6oGezOalM1ef1Vp57W07'

export default function Settings({ profile, userId, weapons, lightMode, onToggleLightMode, onClose }) {
  const [copiedReferral, setCopiedReferral] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [exporting, setExporting] = useState(false)

  const C = lightMode ? {
    bg: '#F2EDE3', bgCard: 'rgba(0,0,0,0.04)', border: 'rgba(0,0,0,0.08)',
    cream: '#1A1209', text: '#3D2E1A', muted: '#7A6A5A', dim: '#B0A090',
    red: '#9E2828', redL: '#C94848', redF: 'rgba(158,40,40,0.1)', redB: 'rgba(158,40,40,0.25)',
    gold: '#8B6A30', goldF: 'rgba(139,106,48,0.12)', goldB: 'rgba(139,106,48,0.3)',
  } : {
    bg: '#070E17', bgCard: 'rgba(255,255,255,0.025)', border: 'rgba(255,255,255,0.06)',
    cream: '#EDE6D6', text: '#C8BEAA', muted: '#7C90A2', dim: '#4E6070',
    red: '#9E2828', redL: '#C94848', redF: 'rgba(158,40,40,0.14)', redB: 'rgba(158,40,40,0.32)',
    gold: '#B08A4E', goldF: 'rgba(176,138,78,0.11)', goldB: 'rgba(176,138,78,0.28)',
  }

  const referralText = `I've been using Armed & Anchored — a spiritual warfare training journal with 15 weapons of Scripture, teaching, declarations, and prayer. Worth every penny.\n\nGet it here: ${STRIPE_LINK}`

  const handleCopyReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Armed & Anchored',
          text: referralText,
          url: STRIPE_LINK,
        })
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(referralText)
        setCopiedReferral(true)
        setTimeout(() => setCopiedReferral(false), 2500)
      } catch {}
    }
  }

  const handleExport = async () => {
    if (!userId || exporting) return
    setExporting(true)
    try {
      const { data } = await supabase.from('weapon_entries')
        .select('*').eq('user_id', userId)
      const get = (wId, key) => data?.find(e => String(e.weapon_id) === String(wId) && e.field_key === key)?.field_value || ''
      const lines = []
      lines.push('ARMED & ANCHORED — SPIRITUAL WARFARE JOURNAL')
      lines.push('Elora Radiance Co. | armedandanchored.vercel.app')
      lines.push(`Exported: ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}`)
      lines.push('='.repeat(50))
      if (weapons) {
        for (const w of weapons) {
          const journal = get(w.id, 'journal')
          const declared = get(w.id, 'declared') === 'true'
          const hasData = journal || declared || data?.some(e => String(e.weapon_id) === String(w.id))
          if (!hasData) continue
          lines.push('')
          lines.push(`${w.icon} WEAPON ${w.id}: ${w.title.toUpperCase()}`)
          lines.push('-'.repeat(40))
          if (declared) lines.push('✦ Declaration deployed')
          // Memorized verses
          w.scriptures.forEach((s, i) => {
            if (get(w.id, `mem_${i}`) === 'true')
              lines.push(`✓ Memorized: ${s.ref}`)
          })
          if (journal) {
            lines.push('')
            lines.push('JOURNAL ENTRY:')
            lines.push(journal)
          }
          // Tool entries
          const toolKeys = [...new Set(data?.filter(e=>e.weapon_id===w.id&&e.field_key.startsWith('tool_')).map(e=>e.field_key)||[])]
          for (const key of toolKeys) {
            try {
              const entries = JSON.parse(get(w.id, key) || '[]')
              if (entries.length) {
                lines.push('')
                lines.push(`TOOL LOG (${key.replace('tool_','')}):`)
                entries.slice(0,5).forEach(e => {
                  lines.push(`  [${e.date||''}] ${Object.values(e).filter(v=>typeof v==='string'&&v!==e.date).join(' — ')}`)
                })
              }
            } catch {}
          }
        }
      }
      lines.push('')
      lines.push('='.repeat(50))
      lines.push('Stand firm. Fight from victory.')
      const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `armed-anchored-journal-${new Date().toISOString().split('T')[0]}.txt`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) { console.error(e) }
    setExporting(false)
  }

  const handlePrintPDF = async () => {
    if (!userId) return
    const { data } = await supabase.from('weapon_entries').select('*').eq('user_id', userId)
    const get = (wId, key) => data?.find(e => String(e.weapon_id) === String(wId) && e.field_key === key)?.field_value || ''
    const printWindow = window.open('', '_blank')
    let html = `<!DOCTYPE html><html><head><title>Armed & Anchored Journal</title>
    <style>
      body{font-family:Georgia,serif;max-width:700px;margin:0 auto;padding:40px;color:#1a1209;line-height:1.7;}
      h1{font-size:26px;color:#1a1209;text-align:center;margin-bottom:4px;}
      .sub{text-align:center;color:#8B6A2E;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:36px;}
      h2{font-size:18px;color:#1a1209;border-bottom:2px solid #B08A4E;padding-bottom:6px;margin-top:32px;}
      h3{font-size:13px;color:#8B6A2E;letter-spacing:0.1em;text-transform:uppercase;margin:16px 0 6px;}
      p{line-height:1.8;margin:0 0 12px;}
      .mem{font-size:12px;color:#5a7a64;margin:4px 0;}
      @media print{body{padding:20px}}</style></head><body>
    <h1>Armed &amp; Anchored</h1>
    <p class="sub">Spiritual Warfare Journal &mdash; Exported ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</p>`
    if (weapons) {
      for (const w of weapons) {
        const journal = get(w.id, 'journal')
        const hasMemo = w.scriptures?.some((_, i) => get(w.id, `mem_${i}`) === 'true')
        const declared = get(w.id, 'declared') === 'true'
        if (!journal && !hasMemo && !declared) continue
        html += `<h2>${w.icon} ${w.title}</h2>`
        if (declared) html += `<p class="mem">✦ Declaration deployed</p>`
        w.scriptures?.forEach((s, i) => {
          if (get(w.id, `mem_${i}`) === 'true') html += `<p class="mem">✓ Memorized: ${s.ref}</p>`
        })
        if (journal) html += `<h3>Journal Entry</h3><p>${journal.replace(/
/g,'<br/>')}</p>`
      }
    }
    html += `<hr/><p style="text-align:center;font-size:12px;color:#999">Stand firm. Fight from victory.</p></body></html>`
    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 500)
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
  }

  const Row = ({ icon, label, children, border = true }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 0',
      borderBottom: border ? `1px solid ${C.border}` : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 18, width: 26, textAlign: 'center' }}>{icon}</span>
        <span style={{ fontSize: 16, color: C.text, fontFamily: "'EB Garamond',Georgia,serif" }}>{label}</span>
      </div>
      {children}
    </div>
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 400,
      background: lightMode ? '#F2EDE3' : '#070E17',
      fontFamily: "'EB Garamond',Georgia,serif",
      overflowY: 'auto', animation: 'fadeIn 0.25s ease',
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 0 80px' }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: `1px solid ${C.border}`,
          position: 'sticky', top: 0, zIndex: 10,
          background: lightMode ? '#F2EDE3' : '#070E17',
          backdropFilter: 'blur(12px)',
        }}>
          <div>
            <div style={{ fontSize: 9, color: C.redL, letterSpacing: '0.16em', textTransform: 'uppercase', fontFamily: "'Cinzel',Georgia,serif" }}>Armed & Anchored</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.cream, fontFamily: "'Cinzel',Georgia,serif" }}>Settings</div>
          </div>
          <button onClick={onClose} style={{ background: C.bgCard, border: `1px solid ${C.border}`, color: C.muted, width: 36, height: 36, borderRadius: 9, cursor: 'pointer', fontSize: 18 }}>←</button>
        </div>

        <div style={{ padding: '8px 20px' }}>

          {/* Account */}
          <div style={{ marginTop: 24, marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: C.muted, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: "'Cinzel',Georgia,serif", marginBottom: 4 }}>Account</div>
          </div>
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: '0 16px' }}>
            <Row icon="✉️" label={profile?.email || 'Your account'}>
              <span style={{ fontSize: 12, color: C.muted }}>Lifetime Access ✦</span>
            </Row>
            <Row icon="🚪" label="Sign Out" border={false}>
              <button onClick={handleSignOut} disabled={signingOut} style={{
                background: C.redF, border: `1px solid ${C.redB}`,
                color: C.redL, padding: '6px 16px', borderRadius: 10,
                cursor: 'pointer', fontSize: 12,
                fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.07em',
              }}>
                {signingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </Row>
          </div>

          {/* Appearance */}
          <div style={{ marginTop: 24, marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: C.muted, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: "'Cinzel',Georgia,serif", marginBottom: 4 }}>Appearance</div>
          </div>
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: '0 16px' }}>
            <Row icon={lightMode ? '🌙' : '☀️'} label={lightMode ? 'Dark Mode' : 'Light Mode'} border={false}>
              {/* Toggle switch */}
              <div
                onClick={onToggleLightMode}
                style={{
                  width: 48, height: 28, borderRadius: 14, cursor: 'pointer',
                  background: lightMode ? C.redL : C.bgCard,
                  border: `1px solid ${lightMode ? C.redB : C.border}`,
                  position: 'relative', transition: 'all 0.25s',
                }}
              >
                <div style={{
                  position: 'absolute', top: 3, left: lightMode ? 22 : 3,
                  width: 20, height: 20, borderRadius: '50%',
                  background: lightMode ? '#fff' : C.muted,
                  transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }} />
              </div>
            </Row>
          </div>

          {/* Share & Referral */}
          <div style={{ marginTop: 24, marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: C.muted, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: "'Cinzel',Georgia,serif", marginBottom: 4 }}>Share & Referral</div>
          </div>
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px' }}>
            <p style={{ fontSize: 15, color: C.text, lineHeight: 1.75, marginBottom: 14 }}>
              Know a warrior who needs this? Share Armed & Anchored with someone in your life. Every soldier needs to be equipped.
            </p>
            <div style={{ background: lightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 12, fontSize: 13, color: C.muted, fontStyle: 'italic', lineHeight: 1.7 }}>
              "{referralText.split('\n')[0]}"
            </div>
            <button onClick={handleCopyReferral} style={{
              width: '100%',
              background: copiedReferral ? 'rgba(124,146,132,0.15)' : `linear-gradient(135deg,${C.redF},rgba(255,255,255,0.02))`,
              border: `1px solid ${copiedReferral ? 'rgba(124,146,132,0.4)' : C.redB}`,
              color: copiedReferral ? '#7C9284' : C.redL,
              padding: '13px', borderRadius: 12, cursor: 'pointer',
              fontSize: 13, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.08em',
              transition: 'all .25s',
            }}>
              {copiedReferral ? '✓ Copied — Send It to Someone' : '🔗 Share Armed & Anchored'}
            </button>
          </div>

          {/* More from Elora Radiance */}
          <div style={{ marginTop: 24, marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: C.muted, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: "'Cinzel',Georgia,serif", marginBottom: 4 }}>More from Elora Radiance Co.</div>
          </div>
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 16px', marginBottom: 0 }}>
            <p style={{ fontSize: 13, color: C.muted, fontStyle: 'italic', lineHeight: 1.7, marginBottom: 14 }}>
              The Anchored Steps devotional series — daily Scripture, reflection, and prayer for those walking steadily with God.
            </p>
            {[
              { label: 'Anchored Steps · Year 1', desc: 'The original daily devotional', url: 'https://anchored-steps.vercel.app/', icon: '⚓' },
              { label: 'Anchored Steps · Year 2', desc: 'Continuing the journey', url: 'https://anchored-steps-year2.vercel.app/', icon: '⚓' },
            ].map(app => (
              <a key={app.url} href={app.url} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '13px 14px', borderRadius: 12, marginBottom: 8,
                background: C.goldF, border: `1px solid ${C.goldB}`,
                textDecoration: 'none', transition: 'all .2s',
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{app.icon}</span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: 13, color: C.cream, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.05em', marginBottom: 2 }}>{app.label}</span>
                  <span style={{ display: 'block', fontSize: 12, color: C.muted, fontStyle: 'italic' }}>{app.desc}</span>
                </span>
                <span style={{ fontSize: 13, color: C.gold }}>↗</span>
              </a>
            ))}
          </div>

          {/* About */}
          <div style={{ marginTop: 24, marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: C.muted, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: "'Cinzel',Georgia,serif", marginBottom: 4 }}>About</div>
          </div>
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: '0 16px' }}>
            <Row icon="⚔️" label="Armed & Anchored">
              <span style={{ fontSize: 11, color: C.dim }}>v1.0</span>
            </Row>
            <Row icon="🌿" label="Elora Radiance Co." border={false}>
              <span style={{ fontSize: 11, color: C.dim }}>eloraradiance.com</span>
            </Row>
          </div>

          {/* Export Journal */}
          <div style={{ marginTop: 24, marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: C.muted, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: "'Cinzel',Georgia,serif", marginBottom: 4 }}>Your Data</div>
          </div>
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px' }}>
            <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, marginBottom: 14 }}>
              Download all your journal entries, declarations, tool logs, and memorized verses as a text file.
            </p>
            <button onClick={handleExport} disabled={exporting} style={{
              width: '100%',
              background: exporting ? 'rgba(255,255,255,0.03)' : C.goldF,
              border: `1px solid ${exporting ? C.border : C.goldB}`,
              color: exporting ? C.muted : C.gold,
              padding: '13px', borderRadius: 12, cursor: exporting ? 'default' : 'pointer',
              fontSize: 13, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.08em',
              transition: 'all .25s',
            }}>
              {exporting ? 'Preparing Export…' : '📥 Export Journal'}
            </button>
            <button onClick={handlePrintPDF} style={{
              marginTop: 8, padding: '13px', borderRadius: 12, cursor: 'pointer',
              background: C.bgCard, border: `1px solid ${C.border}`,
              color: C.muted, fontSize: 12,
              fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.08em',
            }}>
              🖨️ Print as PDF
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
