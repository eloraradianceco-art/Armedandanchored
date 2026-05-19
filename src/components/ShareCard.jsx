import { useRef, useState } from 'react'

const C = {
  bg: '#070E17', red: '#8C1F1F', redL: '#B83232', redF: 'rgba(140,31,31,0.14)',
  redB: 'rgba(140,31,31,0.32)', gold: '#B08A4E', goldF: 'rgba(176,138,78,0.11)',
  goldB: 'rgba(176,138,78,0.28)', cream: '#EDE6D6', text: '#C8BEAA',
  muted: '#6A7E90', dim: '#3A4D5C', border: 'rgba(255,255,255,0.06)',
}

export default function ShareCard({ weapon, onClose }) {
  const [cardType, setCardType] = useState('scripture')
  const [shareFlash, setShareFlash] = useState(false)
  const [copied, setCopied] = useState(false)

  const scripture = weapon.scriptures[0]

  // Share the text content directly — works everywhere, no canvas issues
  const handleShare = async () => {
    let text = ''
    if (cardType === 'scripture') {
      text = `⚔️ ${weapon.title}\n\n"${scripture.text}"\n— ${scripture.ref}\n\nArmed & Anchored | Spiritual Warfare Training Journal\narmedandanchored.vercel.app`
    } else if (cardType === 'declaration') {
      text = `⚔️ ${weapon.title} — Declaration\n\n"${weapon.declaration}"\n\nArmed & Anchored | Spiritual Warfare Training Journal\narmedandanchored.vercel.app`
    } else {
      text = `⚔️ ${weapon.title} — Warfare Prayer\n\n${weapon.prayer}\n\nArmed & Anchored | Spiritual Warfare Training Journal\narmedandanchored.vercel.app`
    }

    if (navigator.share) {
      try { await navigator.share({ title: `Armed & Anchored: ${weapon.title}`, text }) } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      } catch {}
    }
  }

  const content = cardType === 'scripture'
    ? { label: 'Scripture', quote: `"${scripture.text}"`, sub: `— ${scripture.ref}` }
    : cardType === 'declaration'
    ? { label: 'Declaration', quote: `"${weapon.declaration}"`, sub: null }
    : { label: 'Warfare Prayer', quote: weapon.prayer, sub: null }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '20px', overflowY: 'auto',
    }}>
      <div style={{ maxWidth: 480, width: '100%' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: C.muted, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Share Card — {weapon.icon} {weapon.title}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        {/* Type selector */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[['scripture','📖 Scripture'],['declaration','⚔️ Declaration'],['prayer','🙏 Prayer']].map(([type, label]) => (
            <button key={type} onClick={() => setCardType(type)} style={{
              flex: 1, background: cardType === type ? C.redF : 'rgba(255,255,255,0.04)',
              border: `1px solid ${cardType === type ? C.redB : C.border}`,
              color: cardType === type ? C.redL : C.muted,
              padding: '8px 4px', borderRadius: 10, cursor: 'pointer',
              fontSize: 11, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.04em',
              transition: 'all .2s',
            }}>{label}</button>
          ))}
        </div>

        {/* Card Preview */}
        <div style={{
          background: `radial-gradient(ellipse at 20% 0%,rgba(139,32,32,0.25) 0%,transparent 55%), radial-gradient(ellipse at 80% 100%,rgba(176,138,78,0.12) 0%,transparent 50%), #070E17`,
          border: '1px solid rgba(176,138,78,0.25)',
          borderRadius: 16, padding: '28px 24px', marginBottom: 16,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative border */}
          <div style={{ position: 'absolute', inset: 8, border: '1px solid rgba(140,31,31,0.2)', borderRadius: 12, pointerEvents: 'none' }} />

          <div style={{ fontSize: 10, color: C.red, letterSpacing: '0.2em', fontFamily: "'Cinzel',Georgia,serif", textTransform: 'uppercase', marginBottom: 14, opacity: 0.8, textAlign: 'center' }}>
            Elora Radiance Co.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 18, opacity: 0.55, transform: 'scaleX(-1)', display: 'inline-block' }}>⚔️</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: C.cream, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.03em' }}>Armed & Anchored</span>
            <span style={{ fontSize: 18, opacity: 0.55 }}>⚔️</span>
          </div>

          <div style={{ fontSize: 10, color: C.muted, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 18, textAlign: 'center' }}>
            {weapon.icon} {weapon.title}
          </div>

          <div style={{ borderTop: '1px solid rgba(176,138,78,0.18)', borderBottom: '1px solid rgba(176,138,78,0.18)', padding: '18px 0', marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: C.gold, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10, textAlign: 'center' }}>
              {content.label}
            </div>
            <p style={{ fontSize: 15, color: C.cream, fontStyle: 'italic', lineHeight: 1.8, textAlign: 'center', margin: 0 }}>
              {content.quote.length > 200 ? content.quote.substring(0, 200) + '...' : content.quote}
            </p>
            {content.sub && (
              <div style={{ fontSize: 11, color: C.gold, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 10, textAlign: 'center' }}>
                {content.sub}
              </div>
            )}
          </div>

          <div style={{ fontSize: 10, color: C.dim, textAlign: 'center', fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.1em' }}>
            SPIRITUAL WARFARE TRAINING JOURNAL
          </div>
        </div>

        {/* Share button */}
        <button onClick={handleShare} style={{
          width: '100%',
          background: copied ? 'rgba(124,146,132,0.2)' : 'linear-gradient(135deg,rgba(139,32,32,0.35),rgba(139,32,32,0.15))',
          border: `1px solid ${copied ? 'rgba(124,146,132,0.4)' : C.redB}`,
          color: copied ? '#7C9284' : C.cream,
          padding: '14px', borderRadius: 12, cursor: 'pointer',
          fontSize: 14, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.08em',
          transition: 'all .25s', marginBottom: 10,
        }}>
          {copied ? '✓ Copied to Clipboard' : '🔗 Share / Copy'}
        </button>

        <p style={{ fontSize: 12, color: C.dim, textAlign: 'center', lineHeight: 1.6 }}>
          On mobile — tap Share to post directly to Instagram, Messages, or any app.{'\n'}On desktop — copies to clipboard to paste anywhere.
        </p>
      </div>
    </div>
  )
}
