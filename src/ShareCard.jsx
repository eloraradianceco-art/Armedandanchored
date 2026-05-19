import { useRef, useState } from 'react'

export default function ShareCard({ weapon, onClose }) {
  const canvasRef = useRef(null)
  const [shareFlash, setShareFlash] = useState(false)
  const [cardType, setCardType] = useState('scripture') // 'scripture' | 'declaration'

  const scripture = weapon.scriptures[0]

  const drawCard = (type) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 1080, H = 1080
    canvas.width = W
    canvas.height = H

    // Background
    ctx.fillStyle = '#070E17'
    ctx.fillRect(0, 0, W, H)

    // Gradient overlay top
    const gTop = ctx.createRadialGradient(W * 0.2, 0, 0, W * 0.2, 0, W * 0.7)
    gTop.addColorStop(0, 'rgba(139,32,32,0.28)')
    gTop.addColorStop(1, 'transparent')
    ctx.fillStyle = gTop
    ctx.fillRect(0, 0, W, H)

    // Gradient overlay bottom
    const gBot = ctx.createRadialGradient(W * 0.8, H, 0, W * 0.8, H, W * 0.6)
    gBot.addColorStop(0, 'rgba(176,138,78,0.14)')
    gBot.addColorStop(1, 'transparent')
    ctx.fillStyle = gBot
    ctx.fillRect(0, 0, W, H)

    // Border
    ctx.strokeStyle = 'rgba(176,138,78,0.22)'
    ctx.lineWidth = 2
    ctx.strokeRect(32, 32, W - 64, H - 64)

    // Inner accent line
    ctx.strokeStyle = 'rgba(140,31,31,0.3)'
    ctx.lineWidth = 1
    ctx.strokeRect(44, 44, W - 88, H - 88)

    // Top: Elora Radiance Co.
    ctx.fillStyle = 'rgba(140,31,31,0.8)'
    ctx.font = '500 28px Cinzel, Georgia, serif'
    ctx.textAlign = 'center'
    ctx.letterSpacing = '0.2em'
    ctx.fillText('ELORA RADIANCE CO.', W / 2, 110)

    // Weapon icon + title
    ctx.font = '700 52px EB Garamond, Georgia, serif'
    ctx.fillStyle = '#EDE6D6'
    ctx.fillText(`${weapon.icon}  ${weapon.title}`, W / 2, 200)

    // Divider
    ctx.strokeStyle = 'rgba(176,138,78,0.35)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(120, 240)
    ctx.lineTo(W - 120, 240)
    ctx.stroke()

    if (type === 'scripture') {
      // Quote mark
      ctx.font = 'italic 120px EB Garamond, Georgia, serif'
      ctx.fillStyle = 'rgba(140,31,31,0.25)'
      ctx.fillText('\u201C', 80, 360)

      // Scripture text — wrap it
      ctx.font = 'italic 42px EB Garamond, Georgia, serif'
      ctx.fillStyle = '#EDE6D6'
      wrapText(ctx, scripture.text, W / 2, 320, W - 200, 62)

      // Reference
      ctx.font = '500 32px Cinzel, Georgia, serif'
      ctx.fillStyle = '#B08A4E'
      ctx.fillText(scripture.ref, W / 2, H - 200)

    } else {
      // Declaration
      ctx.font = '500 30px Cinzel, Georgia, serif'
      ctx.fillStyle = 'rgba(140,31,31,0.7)'
      ctx.fillText('DECLARATION', W / 2, 290)

      ctx.font = 'italic 38px EB Garamond, Georgia, serif'
      ctx.fillStyle = '#EDE6D6'
      wrapText(ctx, `"${weapon.declaration}"`, W / 2, 340, W - 160, 58)
    }

    // Bottom — Armed & Anchored
    ctx.font = '600 36px Cinzel, Georgia, serif'
    ctx.fillStyle = '#EDE6D6'
    ctx.fillText('⚔  Armed & Anchored  ⚔', W / 2, H - 120)

    ctx.font = '400 24px Cinzel, Georgia, serif'
    ctx.fillStyle = 'rgba(106,126,144,0.7)'
    ctx.fillText('Spiritual Warfare Training Journal', W / 2, H - 72)
  }

  const wrapText = (ctx, text, x, startY, maxWidth, lineHeight) => {
    const words = text.split(' ')
    let line = ''
    let y = startY
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line.trim(), x, y)
        line = words[i] + ' '
        y += lineHeight
      } else {
        line = testLine
      }
    }
    ctx.fillText(line.trim(), x, y)
  }

  const handleGenerate = (type) => {
    setCardType(type)
    setTimeout(() => drawCard(type), 50)
  }

  const handleShare = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(async (blob) => {
      if (!blob) return
      const file = new File([blob], `armed-anchored-${weapon.id}.png`, { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: `Armed & Anchored: ${weapon.title}` }) } catch {}
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `armed-anchored-${weapon.title.toLowerCase().replace(/\s+/g,'-')}.png`
        a.click(); URL.revokeObjectURL(url)
      }
      setShareFlash(true)
      setTimeout(() => setShareFlash(false), 2000)
    })
  }

  const C = {
    bg: '#070E17', redL: '#B83232', redF: 'rgba(140,31,31,0.14)', redB: 'rgba(140,31,31,0.32)',
    gold: '#B08A4E', goldF: 'rgba(176,138,78,0.11)', goldB: 'rgba(176,138,78,0.28)',
    cream: '#EDE6D6', text: '#C8BEAA', muted: '#6A7E90', border: 'rgba(255,255,255,0.06)',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 20,
    }}>
      <div style={{ maxWidth: 480, width: '100%' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: C.muted, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.1em' }}>
            SHARE CARD
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 20 }}>×</button>
        </div>

        {/* Card type selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[['scripture', '📖 Scripture'], ['declaration', '⚔️ Declaration']].map(([type, label]) => (
            <button
              key={type}
              onClick={() => handleGenerate(type)}
              style={{
                flex: 1, background: cardType === type ? C.redF : 'rgba(255,255,255,0.04)',
                border: `1px solid ${cardType === type ? C.redB : C.border}`,
                color: cardType === type ? C.redL : C.muted,
                padding: '10px', borderRadius: 10, cursor: 'pointer',
                fontSize: 13, fontFamily: "'Cinzel',Georgia,serif",
                letterSpacing: '0.06em', transition: 'all .2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Canvas preview */}
        <canvas
          ref={canvasRef}
          style={{
            width: '100%', borderRadius: 12,
            border: `1px solid ${C.border}`, display: 'block',
            background: '#070E17', marginBottom: 14,
            aspectRatio: '1/1',
          }}
          onClick={() => handleGenerate(cardType)}
        />

        {!canvasRef.current?.width && (
          <div
            onClick={() => handleGenerate('scripture')}
            style={{
              width: '100%', aspectRatio: '1/1', borderRadius: 12,
              border: `1px solid ${C.border}`, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.02)', cursor: 'pointer',
              flexDirection: 'column', gap: 8, marginBottom: 14,
            }}
          >
            <div style={{ fontSize: 32 }}>⚔️</div>
            <div style={{ fontSize: 13, color: C.muted, fontFamily: "'Cinzel',Georgia,serif" }}>Tap to generate card</div>
          </div>
        )}

        {/* Share / Download button */}
        <button
          onClick={handleShare}
          style={{
            width: '100%', background: shareFlash ? 'rgba(124,146,132,0.2)' : 'linear-gradient(135deg,rgba(139,32,32,0.3),rgba(139,32,32,0.12))',
            border: `1px solid ${shareFlash ? 'rgba(124,146,132,0.4)' : C.redB}`,
            color: shareFlash ? '#7C9284' : C.cream,
            padding: '14px', borderRadius: 12, cursor: 'pointer',
            fontSize: 14, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.08em',
            transition: 'all .25s',
          }}
        >
          {shareFlash ? '✓ Saved' : '🔗 Share / Download Card'}
        </button>
      </div>
    </div>
  )
}
