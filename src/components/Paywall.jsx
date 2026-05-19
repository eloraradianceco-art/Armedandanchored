const C = {
  bg: '#070E17', red: '#8C1F1F', redL: '#B83232', redF: 'rgba(140,31,31,0.14)',
  redB: 'rgba(140,31,31,0.32)', gold: '#B08A4E', goldF: 'rgba(176,138,78,0.11)',
  goldB: 'rgba(176,138,78,0.28)', cream: '#EDE6D6', text: '#C8BEAA',
  muted: '#6A7E90', dim: '#3A4D5C', border: 'rgba(255,255,255,0.06)',
}

const STRIPE_LINK = 'https://buy.stripe.com/dRm6oGezOalM1ef1Vp57W07'

const FEATURES = [
  { icon: '⚔️', text: '15 Weapons of Spiritual Warfare — full teaching on each' },
  { icon: '🎯', text: 'Enemy Tactics — exactly how he attacks in every area' },
  { icon: '📢', text: 'Spoken Declarations + Warfare Prayers per weapon' },
  { icon: '✍️', text: 'Personal battle journal — saved across all your devices' },
  { icon: '🔗', text: 'Share any weapon instantly — scripture, declaration, prayer' },
]

export default function Paywall({ onShowSignIn }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: `radial-gradient(ellipse at 20% 0%,rgba(139,32,32,0.2) 0%,transparent 55%),
                   radial-gradient(ellipse at 80% 100%,rgba(176,138,78,0.1) 0%,transparent 50%),${C.bg}`,
      fontFamily: "'EB Garamond',Georgia,serif", color: C.text,
      padding: '24px', textAlign: 'center',
    }}>
      <div style={{ maxWidth: 480, width: '100%' }}>

        <div style={{ fontSize: 11, color: C.red, letterSpacing: '0.22em', fontFamily: "'Cinzel',Georgia,serif", textTransform: 'uppercase', marginBottom: 14, opacity: 0.9 }}>
          Elora Radiance Co.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 26, opacity: 0.6, transform: 'scaleX(-1)', display: 'inline-block' }}>⚔️</span>
          <span style={{ fontSize: 32, fontWeight: 700, color: C.cream, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.04em', lineHeight: 1.1 }}>Armed & Anchored</span>
          <span style={{ fontSize: 26, opacity: 0.6 }}>⚔️</span>
        </div>
        <div style={{ fontSize: 12, color: C.muted, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: "'Cinzel',Georgia,serif", marginBottom: 32 }}>
          Spiritual Warfare Training Journal
        </div>

        <div style={{
          background: 'linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))',
          border: `1px solid ${C.goldB}`, borderRadius: 16, padding: '24px 26px', marginBottom: 24,
        }}>
          <p style={{ fontSize: 17, color: C.cream, lineHeight: 1.8, marginBottom: 8, fontStyle: 'italic' }}>
            "Put on the whole armor of God, that you may be able to stand against the schemes of the devil."
          </p>
          <div style={{ fontSize: 10, color: C.gold, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 22 }}>
            Ephesians 6:11
          </div>
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 18, textAlign: 'left' }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 11 }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{f.icon}</span>
                <span style={{ fontSize: 15, color: C.text, lineHeight: 1.55 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <a
          href={STRIPE_LINK}
          style={{
            display: 'block', background: 'linear-gradient(135deg,rgba(139,32,32,0.4),rgba(139,32,32,0.18))',
            border: '1px solid rgba(140,31,31,0.55)', color: C.cream,
            padding: '16px 28px', borderRadius: 14, fontSize: 16,
            fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.09em',
            textDecoration: 'none', marginBottom: 12, cursor: 'pointer',
          }}
        >
          ⚔️ Get Lifetime Access
        </a>
        <p style={{ fontSize: 12, color: C.dim, lineHeight: 1.7 }}>
          One-time payment &nbsp;•&nbsp; Instant access &nbsp;•&nbsp; All 15 weapons unlocked forever
        </p>

        <div style={{ marginTop: 24, fontSize: 13, color: C.dim }}>
          Already purchased?{' '}
          <button
            onClick={onShowSignIn}
            style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 13, textDecoration: 'underline', fontFamily: 'inherit' }}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  )
}
