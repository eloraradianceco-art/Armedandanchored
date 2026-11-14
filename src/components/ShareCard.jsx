import { useState } from 'react'
import { ShareComposer, FormatPicker, captionExcerpt } from '../shareKit'
import { isNative, nativeShareImages } from '../native'

const SITE = 'armed.eloraradiance.com'

export default function ShareCard({ weapon, onClose, initialType = 'scripture', nativeShare = isNative ? nativeShareImages : null }) {
  const [cardType, setCardType] = useState(initialType)
  const [scriptureIdx, setScriptureIdx] = useState(0)
  const [lightCard, setLightCard] = useState(false)
  const [format, setFormat] = useState('post')
  const [copied, setCopied] = useState(null) // 'text' | 'caption'

  const scripture = weapon.scriptures[scriptureIdx] || weapon.scriptures[0]

  const TYPES = [
    { id: 'scripture', label: '📖 Scripture' },
    { id: 'teaching', label: '📜 Teaching' },
    { id: 'tactics',  label: '🎯 Tactics' },
    { id: 'declaration', label: '⚔️ Declaration' },
    { id: 'prayer',   label: '🙏 Prayer' },
  ]

  // What goes on the card (full text; long text becomes a numbered set of cards).
  const CONTENT = {
    scripture:   { label: 'Scripture',        content: { text: `“${scripture.text}”` }, ref: scripture.ref, italic: true,  plain: `“${scripture.text}” — ${scripture.ref}` },
    teaching:    { label: 'Warfare Teaching', content: { text: weapon.teaching },        italic: false, plain: weapon.teaching },
    tactics:     { label: 'Know the Enemy',   content: { items: weapon.tactics },        italic: false, plain: weapon.tactics.map((t, i) => `${i + 1}. ${t}`).join('\n') },
    declaration: { label: 'Declaration',      content: { text: `“${weapon.declaration}”` }, italic: true, plain: `“${weapon.declaration}”` },
    prayer:      { label: 'War Prayer',       content: { text: weapon.prayer },          italic: true,  plain: weapon.prayer },
  }
  const c = CONTENT[cardType] || CONTENT.scripture

  const caption = [
    cardType === 'scripture' ? `“${captionExcerpt(scripture.text)}” — ${scripture.ref}` : `${weapon.icon} ${weapon.title} — ${c.label}\n\n${captionExcerpt(c.plain)}`,
    '',
    cardType === 'scripture' ? `Weapon ${weapon.id}: ${weapon.title}` : null,
    'Armed & Anchored — Spiritual Warfare Training Journal',
    SITE,
  ].filter((l) => l !== null).join('\n').replace(/\n{3,}/g, '\n\n')

  // Card themes (text colors meet contrast on their backgrounds)
  const th = lightCard ? {
    bg: 'linear-gradient(155deg, #F5F0E8 0%, #EDE5D4 100%)',
    glow: 'radial-gradient(ellipse at 15% 0%, rgba(158,40,40,0.08) 0%, transparent 55%)',
    frame: 'rgba(139,106,48,0.45)', divider: 'rgba(139,106,48,0.35)',
    brand: '#8E2424', sub: '#5E4A1E', label: '#8E2424', text: '#2A1A0A', ref: '#6E5222', num: '#9E2828',
    footer: '#8E2424', muted: '#5E5040', dot: '#9E2828', canvas: '#F5F0E8',
  } : {
    bg: 'linear-gradient(155deg, #070E17 0%, #0D1A2A 60%, #070E17 100%)',
    glow: 'radial-gradient(ellipse at 15% 0%, rgba(158,40,40,0.24) 0%, transparent 55%)',
    frame: 'rgba(176,138,78,0.4)', divider: 'rgba(176,138,78,0.35)',
    brand: '#D96060', sub: '#C9A66B', label: '#D96060', text: '#EDE6D6', ref: '#C9A66B', num: '#E06A6A',
    footer: '#D96060', muted: '#9AAEC0', dot: '#D96060', canvas: '#070E17',
  }
  const display = "'Cinzel', Georgia, serif"
  const theme = {
    bg: th.bg, glow: th.glow, frame: th.frame, divider: th.divider, label: th.label, footer: th.footer, muted: th.muted,
    dot: th.dot, display, footerLine: '⚔ Stand firm. Fight from victory.', url: SITE,
  }
  const header = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
      <img src="/icon.png" alt="" style={{ width: 112, height: 112, borderRadius: 24, flexShrink: 0 }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 46, color: th.brand, fontFamily: display, letterSpacing: '0.05em', lineHeight: 1.2 }}>Armed &amp; Anchored</div>
        <div style={{ fontSize: 36, color: th.sub, lineHeight: 1.3, marginTop: 4, fontFamily: "'EB Garamond', Georgia, serif" }}>{weapon.icon} {weapon.title}</div>
      </div>
    </div>
  )

  const C = {
    red: '#9E2828', redL: '#E06A6A', redF: 'rgba(158,40,40,0.14)', redB: 'rgba(158,40,40,0.45)',
    gold: '#C9A66B', muted: '#9AAEC0', border: 'rgba(255,255,255,0.12)',
  }
  const pill = (active) => ({
    padding: '8px 6px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
    fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.04em',
    background: active ? C.redF : 'rgba(255,255,255,0.04)',
    border: `1px solid ${active ? C.redB : C.border}`,
    color: active ? C.redL : C.muted, transition: 'all .2s',
  })
  const small = { fontSize: 11, color: C.muted, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 7 }
  const copy = async (what, text) => {
    try { await navigator.clipboard.writeText(text); setCopied(what); setTimeout(() => setCopied(null), 2000) } catch {}
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 600,
      display: 'flex', flexDirection: 'column', overflowY: 'auto',
      padding: 'calc(16px + var(--safe-top, env(safe-area-inset-top, 0px))) 16px calc(32px + env(safe-area-inset-bottom, 0px))',
    }} onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Share this card" onClick={(e) => e.stopPropagation()} style={{
        maxWidth: 440, width: '100%', margin: '0 auto',
        background: 'rgba(7,14,23,0.98)', borderRadius: 20,
        border: '1px solid rgba(158,40,40,0.3)', padding: '20px 16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Cinzel',Georgia,serif", fontSize: 12, color: C.redL, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Share This Card</div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 24, lineHeight: 1, padding: '0 4px', minWidth: 44, minHeight: 44 }}>×</button>
        </div>

        {cardType === 'scripture' && weapon.scriptures.length > 1 && (
          <div style={{ marginBottom: 12 }}>
            <div style={small}>Scripture</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {weapon.scriptures.map((s, i) => (
                <button key={i} onClick={() => setScriptureIdx(i)} style={{ ...pill(scriptureIdx === i), padding: '7px 10px', maxWidth: 190, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.ref}</button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          {TYPES.map((t) => (
            <button key={t.id} onClick={() => setCardType(t.id)} aria-pressed={cardType === t.id} style={{ ...pill(cardType === t.id), flex: '1 1 auto', minWidth: 0 }}>{t.label}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['🌙 Dark', false], ['☀️ Light', true]].map(([label, val]) => (
              <button key={label} onClick={() => setLightCard(val)} aria-pressed={lightCard === val} style={{ ...pill(lightCard === val), flex: 1 }}>{label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <FormatPicker value={format} onChange={setFormat} renderButton={({ key, active, label, onClick }) => (
              <button key={key} onClick={onClick} aria-pressed={active} style={{ ...pill(active), flex: 1 }}>{label}</button>
            )} />
          </div>
        </div>

        <ShareComposer
          formatId={format}
          theme={theme}
          header={header}
          label={c.label}
          content={c.content}
          refText={c.ref}
          bodyStyle={{ font: "'EB Garamond', Georgia, serif", italic: c.italic, color: th.text, numColor: th.num, numFont: display, refColor: th.ref, refFont: display, letterSpacing: '0.01em' }}
          background={th.canvas}
          fileBase={`armed-anchored-${weapon.id}-${cardType}`}
          title="Armed & Anchored"
          layoutKey={[weapon.id, cardType, scriptureIdx, lightCard].join(':')}
          nativeShare={nativeShare}
          renderActions={({ share, shareOne, busy, total, current, note, formatId }) => (
            <div style={{ marginTop: 14 }}>
              {total > 1 && (
                <p style={{ fontSize: 13, color: C.muted, textAlign: 'center', margin: '0 0 10px', lineHeight: 1.5 }}>
                  This one is long, so it's a set of {total} cards. Swipe to see each; they share together.{formatId==='post'&&total>=4?' Story size fits more on each card.':''}
                </p>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button onClick={share} disabled={busy} style={{
                  background: 'linear-gradient(135deg, rgba(158,40,40,0.45), rgba(158,40,40,0.22))',
                  border: `1px solid ${C.redB}`, color: '#F2D6D6', padding: '13px', borderRadius: 12, cursor: 'pointer',
                  fontSize: 13, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.06em', opacity: busy ? 0.6 : 1, minHeight: 48,
                }}>{busy ? 'Preparing…' : total > 1 ? `🔗 Share all ${total}` : '🔗 Share Image'}</button>
                {total > 1 ? (
                  <button onClick={shareOne} disabled={busy} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted, padding: '13px', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontFamily: "'Cinzel',Georgia,serif", minHeight: 48 }}>
                    Just card {current + 1}
                  </button>
                ) : (
                  <button onClick={() => copy('text', c.plain)} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted, padding: '13px', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontFamily: "'Cinzel',Georgia,serif", minHeight: 48 }}>
                    {copied === 'text' ? '✓ Copied' : 'Copy Text'}
                  </button>
                )}
              </div>
              {total > 1 && (
                <button onClick={() => copy('text', c.plain)} style={{ width: '100%', marginTop: 8, background: 'transparent', border: `1px solid ${C.border}`, color: C.muted, padding: '11px', borderRadius: 12, cursor: 'pointer', fontSize: 12, fontFamily: "'Cinzel',Georgia,serif", minHeight: 44 }}>
                  {copied === 'text' ? '✓ Copied' : 'Copy Full Text'}
                </button>
              )}
              {note && <p role="status" style={{ fontSize: 13, color: C.gold, textAlign: 'center', margin: '10px 0 0' }}>{note}</p>}
            </div>
          )}
        />

        <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', marginTop: 14 }}>
          <div style={{ fontSize: 11, color: C.gold, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>Suggested Caption</div>
          <p style={{ fontSize: 15, color: '#C8BEAA', lineHeight: 1.6, margin: '0 0 12px', fontStyle: 'italic', whiteSpace: 'pre-line' }}>{caption}</p>
          <button onClick={() => copy('caption', caption)} style={{
            width: '100%', background: copied === 'caption' ? 'rgba(124,146,132,0.15)' : 'transparent',
            border: `1px solid ${copied === 'caption' ? 'rgba(124,146,132,0.4)' : 'rgba(176,138,78,0.35)'}`,
            color: copied === 'caption' ? '#9DBBA6' : C.gold, padding: '10px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
            fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.08em', transition: 'all .25s', minHeight: 44,
          }}>{copied === 'caption' ? '✓ Copied' : 'Copy Caption'}</button>
        </div>
      </div>
    </div>
  )
}
