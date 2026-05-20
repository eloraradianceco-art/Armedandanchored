import { useState, useRef, useEffect } from 'react'
import { toPng } from 'html-to-image'

const TAGLINE = 'Stand firm. Fight from victory. — armedandanchored.vercel.app'

export default function ShareCard({ weapon, onClose, initialType = 'scripture' }) {
  const cardRef = useRef(null)
  const [cardType, setCardType] = useState(initialType)
  const [lightCard, setLightCard] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [copiedCaption, setCopiedCaption] = useState(false)

  const scripture = weapon.scriptures[0]

  const TYPES = [
    { id: 'scripture', label: '📖 Scripture' },
    { id: 'teaching', label: '📜 Teaching' },
    { id: 'tactics',  label: '🎯 Tactics' },
    { id: 'declaration', label: '⚔️ Declaration' },
    { id: 'prayer',   label: '🙏 Prayer' },
  ]

  const getContent = (type) => {
    if (type === 'scripture') return {
      label: 'SCRIPTURE',
      main: `"${scripture.text}"`,
      sub: scripture.ref,
      caption: `"${scripture.text}" — ${scripture.ref}\n\nWeapon ${weapon.id}: ${weapon.title}\n\nArmed & Anchored — Spiritual Warfare Training Journal\narmedandanchored.vercel.app`,
    }
    if (type === 'teaching') return {
      label: 'WARFARE TEACHING',
      main: weapon.teaching,
      sub: null,
      caption: `${weapon.icon} ${weapon.title} — Warfare Teaching\n\n${weapon.teaching}\n\nArmed & Anchored — Spiritual Warfare Training Journal\narmedandanchored.vercel.app`,
    }
    if (type === 'tactics') return {
      label: 'KNOW THE ENEMY',
      main: weapon.tactics,
      sub: null,
      isList: true,
      caption: `${weapon.icon} ${weapon.title} — Know the Enemy's Tactics\n\n${weapon.tactics.map((t,i)=>`${i+1}. ${t}`).join('\n')}\n\nArmed & Anchored — Spiritual Warfare Training Journal\narmedandanchored.vercel.app`,
    }
    if (type === 'declaration') return {
      label: 'DECLARATION',
      main: `"${weapon.declaration}"`,
      sub: null,
      caption: `${weapon.icon} ${weapon.title} — Declaration\n\n"${weapon.declaration}"\n\nArmed & Anchored — Spiritual Warfare Training Journal\narmedandanchored.vercel.app`,
    }
    if (type === 'prayer') return {
      label: 'WAR PRAYER',
      main: weapon.prayer,
      sub: null,
      caption: `${weapon.icon} ${weapon.title} — War Prayer\n\n${weapon.prayer}\n\nArmed & Anchored — Spiritual Warfare Training Journal\narmedandanchored.vercel.app`,
    }
    return { label: '', main: '', sub: null, caption: '' }
  }

  const content = getContent(cardType)

  // Theme
  const th = lightCard ? {
    bg: '#F5F0E8',
    bgGrad: 'linear-gradient(155deg, #F5F0E8 0%, #EDE5D4 100%)',
    border: 'rgba(139,106,48,0.4)',
    borderInner: 'rgba(158,40,40,0.2)',
    brand: 'rgba(158,40,40,0.65)',
    title: '#1A1209',
    weapon: 'rgba(100,70,20,0.85)',
    divider: 'rgba(139,106,48,0.4)',
    label: 'rgba(158,40,40,0.6)',
    body: '#2A1A0A',
    bodyItalic: true,
    ref: '#8B6A30',
    footer: 'rgba(158,40,40,0.7)',
    tagline: 'rgba(80,60,40,0.55)',
    numColor: 'rgba(180,50,50,0.9)',
  } : {
    bg: '#070E17',
    bgGrad: 'linear-gradient(155deg, #070E17 0%, #0D1A2A 60%, #070E17 100%)',
    border: 'rgba(176,138,78,0.35)',
    borderInner: 'rgba(158,40,40,0.22)',
    brand: 'rgba(201,72,72,0.8)',
    title: '#EDE6D6',
    weapon: 'rgba(176,138,78,0.85)',
    divider: 'rgba(176,138,78,0.4)',
    label: 'rgba(201,72,72,0.75)',
    body: '#EDE6D6',
    bodyItalic: false,
    ref: '#B08A4E',
    footer: 'rgba(201,72,72,0.85)',
    tagline: 'rgba(106,126,144,0.65)',
    numColor: 'rgba(201,72,72,1)',
  }

  const handleShare = async () => {
    if (!cardRef.current || sharing) return
    setSharing(true)
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: lightCard ? '#F5F0E8' : '#070E17',
      })
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], 'armed-anchored.png', { type: 'image/png' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Armed & Anchored' })
      } else {
        const a = document.createElement('a')
        a.href = dataUrl; a.download = 'armed-anchored.png'; a.click()
      }
    } catch (err) {
      console.error(err)
    }
    setSharing(false)
  }

  const C = {
    bg: '#070E17', red: '#9E2828', redL: '#C94848', redF: 'rgba(158,40,40,0.12)',
    redB: 'rgba(158,40,40,0.35)', gold: '#B08A4E', cream: '#EDE6D6',
    text: '#C8BEAA', muted: '#7C90A2', border: 'rgba(255,255,255,0.08)',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 600,
      display: 'flex', flexDirection: 'column', overflowY: 'auto',
      padding: '16px 16px 32px',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        maxWidth: 440, width: '100%', margin: '0 auto',
        background: 'rgba(7,14,23,0.98)', borderRadius: 20,
        border: '1px solid rgba(158,40,40,0.3)',
        padding: '20px 16px',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Cinzel',Georgia,serif", fontSize: 11, color: C.redL, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            Share This Card
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>

        {/* Card Type Selector */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {TYPES.map(t => (
            <button key={t.id} onClick={() => setCardType(t.id)} style={{
              flex: '1 1 auto', minWidth: 0,
              padding: '7px 4px', borderRadius: 8, cursor: 'pointer', fontSize: 10,
              fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.04em',
              background: cardType === t.id ? C.redF : 'transparent',
              border: `1px solid ${cardType === t.id ? C.redB : C.border}`,
              color: cardType === t.id ? C.redL : C.muted, transition: 'all .2s',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Light / Dark toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: C.muted, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.06em', flexShrink: 0 }}>Style:</span>
          {[['🌙 Dark', false], ['☀️ Light', true]].map(([label, val]) => (
            <button key={label} onClick={() => setLightCard(val)} style={{
              flex: 1, padding: '7px', borderRadius: 8, cursor: 'pointer', fontSize: 11,
              fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.06em',
              background: lightCard === val ? (val ? 'rgba(245,240,232,0.15)' : C.redF) : 'rgba(255,255,255,0.04)',
              border: `1px solid ${lightCard === val ? (val ? 'rgba(245,240,232,0.4)' : C.redB) : C.border}`,
              color: lightCard === val ? (val ? '#EDE6D6' : C.redL) : C.muted, transition: 'all .2s',
            }}>{label}</button>
          ))}
        </div>

        {/* ── THE CARD (HTML → image) ─────────────────────────────────── */}
        <div ref={cardRef} style={{
          background: th.bgGrad,
          borderRadius: 18,
          padding: '28px 28px 22px',
          textAlign: 'center',
          fontFamily: "'EB Garamond', Georgia, serif",
          border: `2px solid ${th.border}`,
          boxShadow: `inset 0 0 0 1px ${th.borderInner}`,
          marginBottom: 16,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background gradient accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: lightCard
              ? 'radial-gradient(ellipse at 15% 0%, rgba(158,40,40,0.08) 0%, transparent 55%)'
              : 'radial-gradient(ellipse at 15% 0%, rgba(158,40,40,0.22) 0%, transparent 55%)',
            pointerEvents: 'none',
          }}/>

          {/* Icon */}
          <img src="/icon.png" alt="" style={{ width: 52, height: 52, borderRadius: 13, marginBottom: 10, display: 'block', margin: '0 auto 10px' }} />

          {/* Elora Radiance Co. */}
          <div style={{ fontSize: 11, color: th.brand, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: "'Cinzel',Georgia,serif", marginBottom: 6 }}>
            Elora Radiance Co.
          </div>

          {/* Armed & Anchored */}
          <div style={{ fontSize: 24, fontWeight: 700, color: th.title, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.03em', marginBottom: 4 }}>
            Armed &amp; Anchored
          </div>

          {/* Weapon */}
          <div style={{ fontSize: 12, color: th.weapon, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Cinzel',Georgia,serif", marginBottom: 14 }}>
            {weapon.icon}&nbsp;&nbsp;{weapon.title}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: th.divider, marginBottom: 12 }} />

          {/* Content Label */}
          <div style={{ fontSize: 10, color: th.label, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: "'Cinzel',Georgia,serif", marginBottom: 12 }}>
            {content.label}
          </div>

          {/* Main Content */}
          {content.isList ? (
            <div style={{ textAlign: 'left', marginBottom: 14 }}>
              {content.main.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: th.numColor, fontFamily: "'Cinzel',Georgia,serif", flexShrink: 0, minWidth: 22 }}>
                    {i + 1}.
                  </span>
                  <span style={{ fontSize: 16, color: th.body, lineHeight: 1.65 }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{
              fontSize: 18, color: th.body, lineHeight: 1.85, marginBottom: 12,
              fontStyle: 'italic', letterSpacing: '0.01em',
            }}>
              {content.main}
            </p>
          )}

          {/* Reference */}
          {content.sub && (
            <>
              <div style={{ height: 1, background: th.divider, opacity: 0.5, margin: '10px 40px' }} />
              <div style={{ fontSize: 12, color: th.ref, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
                {content.sub}
              </div>
            </>
          )}

          {/* Footer */}
          <div style={{ height: 1, background: th.divider, opacity: 0.4, marginBottom: 10 }} />
          <div style={{ fontSize: 13, color: th.footer, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.05em', marginBottom: 3 }}>
            ⚔&nbsp; Armed &amp; Anchored &nbsp;⚔
          </div>
          <div style={{ fontSize: 10, color: th.tagline, letterSpacing: '0.05em' }}>
            {TAGLINE}
          </div>
        </div>

        {/* Share / Copy buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <button onClick={handleShare} disabled={sharing} style={{
            background: `linear-gradient(135deg, rgba(158,40,40,0.4), rgba(158,40,40,0.2))`,
            border: `1px solid ${C.redB}`, color: C.redL,
            padding: '13px', borderRadius: 12, cursor: 'pointer', fontSize: 12,
            fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.08em',
            opacity: sharing ? 0.6 : 1,
          }}>
            {sharing ? 'Preparing…' : '🔗 Share Image'}
          </button>
          <button onClick={() => { navigator.clipboard.writeText(content.main); }} style={{
            background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
            color: C.muted, padding: '13px', borderRadius: 12, cursor: 'pointer',
            fontSize: 12, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.08em',
          }}>
            Copy Text
          </button>
        </div>

        {/* Suggested Caption */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 10, color: C.gold, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
            Suggested Caption
          </div>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: '0 0 12px', fontStyle: 'italic', whiteSpace: 'pre-line' }}>
            {content.caption}
          </p>
          <button onClick={() => { navigator.clipboard.writeText(content.caption); setCopiedCaption(true); setTimeout(() => setCopiedCaption(false), 2000); }} style={{
            width: '100%', background: copiedCaption ? 'rgba(124,146,132,0.15)' : 'transparent',
            border: `1px solid ${copiedCaption ? 'rgba(124,146,132,0.4)' : 'rgba(176,138,78,0.3)'}`,
            color: copiedCaption ? '#7C9284' : C.gold,
            padding: '9px', borderRadius: 8, cursor: 'pointer', fontSize: 11,
            fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.08em', transition: 'all .25s',
          }}>
            {copiedCaption ? '✓ Copied' : 'Copy Caption'}
          </button>
        </div>
      </div>
    </div>
  )
}
