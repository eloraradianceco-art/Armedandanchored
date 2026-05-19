import { useRef, useState, useEffect } from 'react'

const C = {
  bg: '#070E17', red: '#8C1F1F', redL: '#B83232', redF: 'rgba(140,31,31,0.14)',
  redB: 'rgba(140,31,31,0.32)', gold: '#B08A4E', goldF: 'rgba(176,138,78,0.11)',
  goldB: 'rgba(176,138,78,0.28)', cream: '#EDE6D6', text: '#C8BEAA',
  muted: '#6A7E90', dim: '#3A4D5C', border: 'rgba(255,255,255,0.06)',
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
  if (text.length < 120) return 44
  if (text.length < 200) return 38
  if (text.length < 300) return 34
  return 30
}

export default function ShareCard({ weapon, onClose }) {
  const canvasRef = useRef(null)
  const [cardType, setCardType] = useState('scripture')
  const [imageReady, setImageReady] = useState(false)
  const [copiedImage, setCopiedImage] = useState(false)
  const [copiedText, setCopiedText] = useState(false)
  const [copiedCaption, setCopiedCaption] = useState(false)

  const scripture = weapon.scriptures[0]

  const getContent = (type) => {
    if (type === 'scripture') return {
      label: 'SCRIPTURE',
      main: `\u201c${scripture.text}\u201d`,
      sub: scripture.ref,
    }
    if (type === 'declaration') return {
      label: 'DECLARATION',
      main: `\u201c${weapon.declaration}\u201d`,
      sub: null,
    }
    return {
      label: 'WARFARE PRAYER',
      main: weapon.prayer.length > 280 ? weapon.prayer.substring(0, 280) + '\u2026' : weapon.prayer,
      sub: null,
    }
  }

  const getSuggestedCaption = (type) => {
    if (type === 'scripture') {
      return `\u201c${scripture.text}\u201d \u2014 ${scripture.ref}\n\nWeapon ${weapon.id}: ${weapon.title}\n\nArmed & Anchored \u2014 Spiritual Warfare Training Journal\narmedandanchored.vercel.app`
    }
    if (type === 'declaration') {
      return `${weapon.icon} ${weapon.title} \u2014 Spoken Declaration\n\n\u201c${weapon.declaration}\u201d\n\nArmed & Anchored \u2014 Spiritual Warfare Training Journal\narmedandanchored.vercel.app`
    }
    return `${weapon.icon} ${weapon.title} \u2014 Warfare Prayer\n\n${weapon.prayer}\n\nArmed & Anchored \u2014 Spiritual Warfare Training Journal\narmedandanchored.vercel.app`
  }

  const drawCard = async (type) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const W = 1080, H = 1080
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    // Background
    ctx.fillStyle = '#070E17'
    ctx.fillRect(0, 0, W, H)

    // Radial gradient top-left (crimson)
    const g1 = ctx.createRadialGradient(W * 0.15, 0, 0, W * 0.15, 0, W * 0.65)
    g1.addColorStop(0, 'rgba(139,32,32,0.32)')
    g1.addColorStop(1, 'transparent')
    ctx.fillStyle = g1
    ctx.fillRect(0, 0, W, H)

    // Radial gradient bottom-right (gold)
    const g2 = ctx.createRadialGradient(W * 0.85, H, 0, W * 0.85, H, W * 0.55)
    g2.addColorStop(0, 'rgba(176,138,78,0.16)')
    g2.addColorStop(1, 'transparent')
    ctx.fillStyle = g2
    ctx.fillRect(0, 0, W, H)

    // Outer border
    ctx.strokeStyle = 'rgba(176,138,78,0.3)'
    ctx.lineWidth = 2
    const pad = 36
    ctx.strokeRect(pad, pad, W - pad * 2, H - pad * 2)

    // Inner border
    ctx.strokeStyle = 'rgba(140,31,31,0.25)'
    ctx.lineWidth = 1
    const pad2 = 52
    ctx.strokeRect(pad2, pad2, W - pad2 * 2, H - pad2 * 2)

    // Load icon
    try {
      const img = new Image()
      await new Promise((resolve) => {
        img.onload = resolve
        img.onerror = resolve
        img.src = '/icon.png'
      })
      if (img.complete && img.naturalWidth > 0) {
        const iSize = 110
        const iX = (W - iSize) / 2
        // Rounded clip
        ctx.save()
        ctx.beginPath()
        ctx.roundRect(iX, 90, iSize, iSize, 22)
        ctx.clip()
        ctx.drawImage(img, iX, 90, iSize, iSize)
        ctx.restore()
      }
    } catch {}

    // Elora Radiance Co.
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(140,31,31,0.75)'
    ctx.font = '500 26px serif'
    ctx.letterSpacing = '0.18em'
    ctx.fillText('ELORA RADIANCE CO.', W / 2, 240)

    // Armed & Anchored title
    ctx.fillStyle = '#EDE6D6'
    ctx.font = 'bold 58px serif'
    ctx.letterSpacing = '0.04em'
    ctx.fillText('Armed & Anchored', W / 2, 310)

    // Weapon line
    ctx.fillStyle = 'rgba(176,138,78,0.7)'
    ctx.font = '400 30px serif'
    ctx.letterSpacing = '0.08em'
    ctx.fillText(`${weapon.icon}  ${weapon.title.toUpperCase()}`, W / 2, 360)

    // Divider line
    ctx.strokeStyle = 'rgba(176,138,78,0.35)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(120, 392)
    ctx.lineTo(W - 120, 392)
    ctx.stroke()

    const content = getContent(type)

    // Content label
    ctx.fillStyle = 'rgba(140,31,31,0.65)'
    ctx.font = '500 24px serif'
    ctx.letterSpacing = '0.16em'
    ctx.fillText(content.label, W / 2, 438)

    // Dynamic font size based on text length
    const fontSize = getFontSize(content.main, 300)
    const lineH = Math.round(fontSize * 1.55)
    // Reserve space: reference needs ~60px, tagline area needs 130px from bottom
    const textMaxY = content.sub ? H - 220 : H - 170

    // Main content quote
    ctx.fillStyle = '#EDE6D6'
    ctx.font = `italic ${fontSize}px serif`
    ctx.letterSpacing = '0.01em'
    const endY = wrapText(ctx, content.main, W / 2, 510, W - 200, lineH, textMaxY)

    // Reference / sub
    if (content.sub) {
      const refY = Math.min(endY + 52, H - 160)
      ctx.fillStyle = '#B08A4E'
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
    ctx.fillStyle = 'rgba(106,126,144,0.7)'
    ctx.font = '400 22px serif'
    ctx.letterSpacing = '0.06em'
    ctx.fillText(TAGLINE, W / 2, H - 78)

    ctx.letterSpacing = '0'
    setImageReady(true)
  }

  useEffect(() => {
    drawCard(cardType)
  }, [cardType, weapon])

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
            Share This {cardType === 'scripture' ? 'Verse' : cardType === 'declaration' ? 'Declaration' : 'Prayer'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 24, lineHeight: 1 }}>×</button>
        </div>

        {/* Card type selector */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[['scripture', '📖 Scripture'], ['declaration', '⚔️ Declaration'], ['prayer', '🙏 Prayer']].map(([type, label]) => (
            <button key={type} onClick={() => { setCardType(type); setImageReady(false) }} style={{
              flex: 1, background: cardType === type ? C.redF : 'rgba(255,255,255,0.04)',
              border: `1px solid ${cardType === type ? C.redB : C.border}`,
              color: cardType === type ? C.redL : C.muted,
              padding: '9px 4px', borderRadius: 10, cursor: 'pointer',
              fontSize: 11, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.04em',
              transition: 'all .2s',
            }}>{label}</button>
          ))}
        </div>

        {/* Canvas preview */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <canvas ref={canvasRef} style={{
            width: '100%', borderRadius: 14,
            border: `1px solid ${C.border}`, display: 'block',
            aspectRatio: '1/1', background: '#070E17',
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
            background: 'linear-gradient(135deg,rgba(139,32,32,0.35),rgba(139,32,32,0.15))',
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
