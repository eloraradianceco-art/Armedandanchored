import { useRef, useState, useEffect } from 'react'

const C = {
  bg: '#070E17', red: '#9E2828', redL: '#C94848', redF: 'rgba(158,40,40,0.14)',
  redB: 'rgba(158,40,40,0.32)', gold: '#B08A4E', goldF: 'rgba(176,138,78,0.11)',
  goldB: 'rgba(176,138,78,0.28)', cream: '#EDE6D6', text: '#C8BEAA',
  muted: '#7C90A2', dim: '#4E6070', border: 'rgba(255,255,255,0.06)',
}

const TAGLINE = 'Stand firm. Fight from victory. — armedandanchored.vercel.app'

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxY) {
  const words = text.split(' ')
  let line = ''
  let currentY = y
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' '
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      if (maxY && currentY + lineHeight > maxY) {
        // Truncate with ellipsis on last visible line
        while (ctx.measureText(line.trim() + '...').width > maxWidth && line.length > 0) {
          line = line.slice(0, line.lastIndexOf(' ', line.length - 2)) + ' '
        }
        ctx.fillText(line.trim() + '...', x, currentY)
        return currentY
      }
      ctx.fillText(line.trim(), x, currentY)
      line = words[i] + ' '
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  if (!maxY || currentY <= maxY) {
    ctx.fillText(line.trim(), x, currentY)
  }
  return currentY
}

function getFontSize(text, maxChars) {
  if (text.length < 100) return 52
  if (text.length < 180) return 46
  if (text.length < 280) return 42
  return 38
}

export default function ShareCard({ weapon, onClose, initialType = 'scripture' }) {
  const canvasRef = useRef(null)
  const [cardType, setCardType] = useState(initialType)
  const [lightCard, setLightCard] = useState(false)
  const [imageReady, setImageReady] = useState(false)
  const [copiedImage, setCopiedImage] = useState(false)
  const [copiedText, setCopiedText] = useState(false)
  const [copiedCaption, setCopiedCaption] = useState(false)

  const scripture = weapon.scriptures[0]

  const getContent = (type) => {
    if (type === 'scripture') return {
      label: 'SCRIPTURE',
      main: `“${scripture.text}”`,
      sub: scripture.ref,
    }
    if (type === 'declaration') return {
      label: 'DECLARATION',
      main: `“${weapon.declaration}”`,
      sub: null,
    }
    if (type === 'teaching') return {
      label: 'WARFARE TEACHING',
      main: weapon.teaching.split('\n\n')[0],
      sub: null,
    }
    if (type === 'tactics') return {
      label: 'KNOW THE ENEMY',
      main: weapon.tactics.slice(0, 3).map((t, i) => `${i + 1}. ${t}`).join('\n'),
      sub: null,
    }
    return {
      label: 'WARFARE PRAYER',
      main: weapon.prayer.length > 280 ? weapon.prayer.substring(0, 280) + '…' : weapon.prayer,
      sub: null,
    }
  }

  const getSuggestedCaption = (type) => {
    if (type === 'scripture')
      return `“${scripture.text}” — ${scripture.ref}\n\nWeapon ${weapon.id}: ${weapon.title}\n\nArmed & Anchored — Spiritual Warfare Training Journal\narmedandanchored.vercel.app`
    if (type === 'declaration')
      return `${weapon.icon} ${weapon.title} — Spoken Declaration\n\n“${weapon.declaration}”\n\nArmed & Anchored — Spiritual Warfare Training Journal\narmedandanchored.vercel.app`
    if (type === 'teaching')
      return `${weapon.icon} ${weapon.title} — Warfare Teaching\n\n${weapon.teaching.split('\n\n')[0]}\n\nArmed & Anchored — Spiritual Warfare Training Journal\narmedandanchored.vercel.app`
    if (type === 'tactics')
      return `${weapon.icon} ${weapon.title} — Know the Enemy\'s Tactics\n\n${weapon.tactics.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\nArmed & Anchored — Spiritual Warfare Training Journal\narmedandanchored.vercel.app`
    return `${weapon.icon} ${weapon.title} — Warfare Prayer\n\n${weapon.prayer}\n\nArmed & Anchored — Spiritual Warfare Training Journal\narmedandanchored.vercel.app`
  }

  const drawCard = async (type, isLight) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const W = 1080, H = 1080
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    // ── Theme ──────────────────────────────────────────────────────────────
    const th = isLight ? {
      bg: '#F2EDE3', bgGrad1: 'rgba(158,40,40,0.12)', bgGrad2: 'rgba(176,138,78,0.08)',
      border1: 'rgba(158,40,40,0.3)', border2: 'rgba(176,138,78,0.35)',
      brand: 'rgba(158,40,40,0.7)', title: '#1A1209', weapon: 'rgba(139,106,48,0.85)',
      divider: 'rgba(139,106,48,0.4)', label: 'rgba(158,40,40,0.6)',
      body: '#2A1A0A', ref: '#8B6A30', tagline: 'rgba(80,60,40,0.6)',
    } : {
      bg: '#070E17', bgGrad1: 'rgba(158,40,40,0.28)', bgGrad2: 'rgba(176,138,78,0.14)',
      border1: 'rgba(176,138,78,0.3)', border2: 'rgba(158,40,40,0.22)',
      brand: 'rgba(158,40,40,0.75)', title: '#EDE6D6', weapon: 'rgba(176,138,78,0.75)',
      divider: 'rgba(176,138,78,0.35)', label: 'rgba(158,40,40,0.65)',
      body: '#EDE6D6', ref: '#B08A4E', tagline: 'rgba(106,126,144,0.7)',
    }

    // Background
    ctx.fillStyle = th.bg
    ctx.fillRect(0, 0, W, H)
    const g1 = ctx.createRadialGradient(W*0.15, 0, 0, W*0.15, 0, W*0.65)
    g1.addColorStop(0, th.bgGrad1); g1.addColorStop(1, 'transparent')
    ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H)
    const g2 = ctx.createRadialGradient(W*0.85, H, 0, W*0.85, H, W*0.55)
    g2.addColorStop(0, th.bgGrad2); g2.addColorStop(1, 'transparent')
    ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H)

    // Borders
    const pad = 36, pad2 = 50
    ctx.strokeStyle = th.border1; ctx.lineWidth = 2
    ctx.strokeRect(pad, pad, W-pad*2, H-pad*2)
    ctx.strokeStyle = th.border2; ctx.lineWidth = 1
    ctx.strokeRect(pad2, pad2, W-pad2*2, H-pad2*2)

    // ── Original header (large, centered) ─────────────────────────────────
    ctx.textAlign = 'center'

    // Icon centered at top
    try {
      const img = new Image()
      await new Promise(res => { img.onload = res; img.onerror = res; img.src = '/icon.png' })
      if (img.complete && img.naturalWidth > 0) {
        const iSize = 110
        const iX = (W - iSize) / 2
        ctx.save()
        ctx.beginPath()
        ctx.roundRect(iX, 90, iSize, iSize, 22)
        ctx.clip()
        ctx.drawImage(img, iX, 90, iSize, iSize)
        ctx.restore()
      }
    } catch {}

    // Elora Radiance Co.
    ctx.fillStyle = th.brand
    ctx.font = '500 26px serif'
    ctx.letterSpacing = '0.18em'
    ctx.fillText('ELORA RADIANCE CO.', W / 2, 248)

    // Armed & Anchored title
    ctx.fillStyle = th.title
    ctx.font = 'bold 58px serif'
    ctx.letterSpacing = '0.04em'
    ctx.fillText('Armed & Anchored', W / 2, 318)

    // Weapon line
    ctx.fillStyle = th.weapon
    ctx.font = '400 30px serif'
    ctx.letterSpacing = '0.08em'
    ctx.fillText(`${weapon.icon}  ${weapon.title.toUpperCase()}`, W / 2, 368)

    // Divider
    ctx.strokeStyle = th.divider; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(120, 400); ctx.lineTo(W - 120, 400); ctx.stroke()

    const content = getContent(type)

    // Content label
    ctx.fillStyle = th.label
    ctx.font = '500 24px serif'
    ctx.letterSpacing = '0.16em'
    ctx.fillText(content.label, W / 2, 444)

    // Dynamic font size based on text length
    const fontSize = getFontSize(content.main, 300)
    const lineH = Math.round(fontSize * 1.55)
    const textMaxY = content.sub ? H - 220 : H - 170

    // Main content
    ctx.fillStyle = th.body
    ctx.letterSpacing = '0.01em'
    let endY = 500

    // Split on any newline variant
    const rawLines = content.main.split(/\n|\\n/).filter(s => s.trim())
    const isList = rawLines.length > 1 && /^\d+\./.test(rawLines[0])

    if (isList) {
      const listFontSize = 42
      const listLineH = 66
      const listX = 90
      const listMaxW = W - 180
      ctx.textAlign = 'left'
      let y = 480
      for (const line of rawLines) {
        if (y + listLineH > textMaxY) break
        const dotIdx = line.indexOf('. ')
        const num = dotIdx >= 0 ? line.substring(0, dotIdx + 2) : ''
        const text = dotIdx >= 0 ? line.substring(dotIdx + 2) : line
        // Draw number in red
        ctx.font = `bold ${listFontSize}px serif`
        ctx.fillStyle = 'rgba(201,72,72,0.95)'
        ctx.fillText(num, listX, y)
        const numW = num ? ctx.measureText(num).width + 4 : 0
        // Draw text
        ctx.font = `${listFontSize}px serif`
        ctx.fillStyle = th.body
        const lastLine = wrapText(ctx, text, listX + numW, y, listMaxW - numW, listLineH, textMaxY)
        y = lastLine + listLineH
        endY = y
      }
      ctx.textAlign = 'center'
    } else {
      ctx.font = `italic ${fontSize}px serif`
      endY = wrapText(ctx, content.main, W / 2, 510, W - 200, lineH, textMaxY)
    }
    // Reference / sub
    if (content.sub) {
      const refY = Math.min(endY + 52, H - 160)
      ctx.fillStyle = th.ref
      ctx.font = '500 26px serif'
      ctx.letterSpacing = '0.1em'
      ctx.fillText(content.sub.toUpperCase(), W / 2, refY)
    }

    // Bottom divider
    ctx.strokeStyle = 'rgba(176,138,78,0.3)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(120, H - 118)
    ctx.lineTo(W - 120, H - 118)
    ctx.stroke()

    // Tagline
    ctx.fillStyle = th.tagline
    ctx.font = '400 22px serif'
    ctx.letterSpacing = '0.06em'
    ctx.fillText(TAGLINE, W / 2, H - 78)

    ctx.letterSpacing = '0'
    setImageReady(true)
  }

  useEffect(() => {
    drawCard(cardType, lightCard)
  }, [cardType, lightCard, weapon])

  const handleShareImage = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(async (blob) => {
      if (!blob) return
      const file = new File([blob], `armed-anchored-${weapon.id}.png`, { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: `Armed & Anchored: ${weapon.title}` }) } catch {}
      } else {
        // Download fallback
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `armed-anchored-${weapon.title.toLowerCase().replace(/\s+/g, '-')}.png`
        a.click()
        URL.revokeObjectURL(url)
        setCopiedImage(true)
        setTimeout(() => setCopiedImage(false), 2500)
      }
    })
  }

  const handleCopyText = async () => {
    const content = getContent(cardType)
    const text = content.sub ? `${content.main}\n${content.sub}` : content.main
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(true)
      setTimeout(() => setCopiedText(false), 2500)
    } catch {}
  }

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(getSuggestedCaption(cardType))
      setCopiedCaption(true)
      setTimeout(() => setCopiedCaption(false), 2500)
    } catch {}
  }

  const btnBase = {
    flex: 1, padding: '13px 10px', borderRadius: 12, cursor: 'pointer',
    fontSize: 13, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.07em',
    transition: 'all .25s', border: 'none',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(14px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'flex-start', padding: '20px',
      overflowY: 'auto', WebkitOverflowScrolling: 'touch',
    }}>
      <div style={{ maxWidth: 480, width: '100%', paddingBottom: 40 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 14, color: C.cream, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {cardType === 'scripture' ? 'Share This Verse' : cardType === 'teaching' ? 'Share Teaching' : cardType === 'tactics' ? 'Share Tactics' : cardType === 'declaration' ? 'Share Declaration' : 'Share Prayer'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 24, lineHeight: 1 }}>×</button>
        </div>

        {/* Card type selector */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[['scripture','📖 Scripture'],['teaching','📜 Teaching'],['tactics','🎯 Tactics'],['declaration','⚔️ Declaration'],['prayer','🙏 Prayer']].map(([type, label]) => (
            <button key={type} onClick={() => { setCardType(type); setImageReady(false); }} style={{
              flex: 1, background: cardType === type ? C.redF : 'rgba(255,255,255,0.04)',
              border: `1px solid ${cardType === type ? C.redB : C.border}`,
              color: cardType === type ? C.redL : C.muted,
              padding: '9px 4px', borderRadius: 10, cursor: 'pointer',
              fontSize: 11, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.04em',
              transition: 'all .2s',
            }}>{label}</button>
          ))}
        </div>

        {/* Light / Dark card toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: C.muted, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.06em' }}>Card Style:</span>
          <button onClick={() => { setLightCard(false); setImageReady(false); }} style={{
            flex: 1, padding: '7px', borderRadius: 8, cursor: 'pointer', fontSize: 11,
            fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.06em',
            background: !lightCard ? C.redF : 'rgba(255,255,255,0.04)',
            border: `1px solid ${!lightCard ? C.redB : C.border}`,
            color: !lightCard ? C.redL : C.muted, transition: 'all .2s',
          }}>🌙 Dark</button>
          <button onClick={() => { setLightCard(true); setImageReady(false); }} style={{
            flex: 1, padding: '7px', borderRadius: 8, cursor: 'pointer', fontSize: 11,
            fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.06em',
            background: lightCard ? 'rgba(242,237,227,0.15)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${lightCard ? 'rgba(242,237,227,0.4)' : C.border}`,
            color: lightCard ? '#EDE6D6' : C.muted, transition: 'all .2s',
          }}>☀️ Light</button>
        </div>

        {/* Canvas preview */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <canvas ref={canvasRef} style={{
            width: '100%', borderRadius: 14,
            border: `1px solid ${C.border}`, display: 'block',
            aspectRatio: '1/1', background: lightCard ? '#F2EDE3' : '#070E17',
          }} />
          {!imageReady && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: 'rgba(7,14,23,0.7)', borderRadius: 14,
            }}>
              <span style={{ fontSize: 13, color: C.muted, fontFamily: "'Cinzel',Georgia,serif" }}>Generating card...</span>
            </div>
          )}
        </div>

        {/* Share Image + Copy Text buttons */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <button onClick={handleShareImage} style={{
            ...btnBase, flex: 1.4,
            background: 'linear-gradient(135deg,rgba(158,40,40,0.35),rgba(158,40,40,0.15))',
            border: `1px solid ${C.redB}`, color: copiedImage ? '#7C9284' : C.cream,
          }}>
            {copiedImage ? '✓ Downloaded' : '🔗 Share Image'}
          </button>
          <button onClick={handleCopyText} style={{
            ...btnBase,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${C.border}`, color: copiedText ? '#7C9284' : C.muted,
          }}>
            {copiedText ? '✓ Copied' : 'Copy Text'}
          </button>
        </div>

        {/* Suggested Caption */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`,
          borderRadius: 12, padding: '14px 16px', marginBottom: 10,
        }}>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: "'Cinzel',Georgia,serif", marginBottom: 10 }}>
            Suggested Caption
          </div>
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.75, whiteSpace: 'pre-line', margin: 0, fontStyle: 'italic' }}>
            {getSuggestedCaption(cardType)}
          </p>
        </div>

        {/* Copy Caption */}
        <button onClick={handleCopyCaption} style={{
          width: '100%',
          background: copiedCaption ? 'rgba(124,146,132,0.2)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${copiedCaption ? 'rgba(124,146,132,0.4)' : C.border}`,
          color: copiedCaption ? '#7C9284' : C.muted,
          padding: '12px', borderRadius: 12, cursor: 'pointer',
          fontSize: 13, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.08em',
          transition: 'all .25s', marginBottom: 12,
        }}>
          {copiedCaption ? '✓ Caption Copied' : 'Copy Caption'}
        </button>

        {/* Close */}
        <button onClick={onClose} style={{
          width: '100%', background: 'transparent', border: 'none',
          color: C.dim, cursor: 'pointer', fontSize: 13,
          fontFamily: "'Cinzel',Georgia,serif", padding: '8px',
        }}>
          Close
        </button>
      </div>
    </div>
  )
}
