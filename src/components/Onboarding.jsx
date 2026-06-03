import { useState } from 'react'

const SLIDES = [
  {
    icon: '⚔️',
    tag: 'WELCOME',
    title: 'Welcome to\nArmed & Anchored',
    body: 'Your personal war room. Built on Scripture. Designed for the believer who is serious about the fight.',
    detail: null,
  },
  {
    icon: '🗡',
    tag: 'THE ARSENAL',
    title: '23 Weapons of\nthe Believer',
    body: 'Every weapon is a biblical truth or discipline — the Name of Jesus, the Blood, the Armor of God, Fasting, Declarations, and more.',
    detail: 'Each weapon has six sections: Scripture, Teaching, Enemy Tactics, Declaration, Journal, and a hands-on Tool.',
  },
  {
    icon: '⚠',
    tag: 'ENEMY TACTICS',
    title: 'Know How\nHe Attacks',
    body: 'For every weapon, you\'ll see exactly how the enemy attacks in that area — so you recognize it before it lands.',
    detail: 'The enemy has a method. Knowing it changes how you fight.',
  },
  {
    icon: '🔥',
    tag: 'DECLARATIONS',
    title: 'Declare It\nOut Loud',
    body: 'Every weapon includes a Scripture-based declaration. Speak it aloud — Revelation 12:11 says we overcome by the blood of the Lamb and the word of our testimony.',
    detail: 'The enemy hates declarations. Use them daily.',
  },
  {
    icon: '✍️',
    tag: 'JOURNAL',
    title: 'Record\nYour Fight',
    body: 'Write your reflections, prayer responses, and battle notes for every weapon. Private. Saved to your account. Accessible from any device.',
    detail: null,
  },
  {
    icon: '🧠',
    tag: 'MEMORIZE',
    title: 'Hide the Word\nin Your Heart',
    body: 'Every key scripture has a memorization tool with three training modes: Read & Recall, Fill the Gaps, and Write it Out.',
    detail: 'A weapon you\'ve memorized is one you can deploy anywhere, anytime — no screen required.',
  },
  {
    icon: '⚔️',
    tag: 'BEGIN',
    title: 'You\'re Armed.\nNow Fight.',
    body: 'Start with the weapon that addresses your current battle. Deploy a declaration. Journal what God shows you. Come back tomorrow.',
    detail: null,
    isLast: true,
  },
]

export default function Onboarding({ onComplete, C }) {
  const [slide, setSlide] = useState(0)
  const current = SLIDES[slide]
  const isLast = slide === SLIDES.length - 1

  const next = () => isLast ? onComplete() : setSlide(s => s + 1)

  // Fallback colors if C not passed
  const bg    = C?.bg    || '#070E17'
  const goldB = C?.goldB || 'rgba(176,138,78,0.28)'
  const goldF = C?.goldF || 'rgba(176,138,78,0.11)'
  const gold  = C?.gold  || '#B08A4E'
  const cream = C?.cream || '#EDE6D6'
  const text  = C?.text  || '#C8BEAA'
  const muted = C?.muted || '#7C90A2'
  const redF  = C?.redF  || 'rgba(158,40,40,0.14)'
  const redB  = C?.redB  || 'rgba(158,40,40,0.32)'
  const border= C?.border|| 'rgba(255,255,255,0.06)'

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: `radial-gradient(ellipse at 50% 0%, rgba(158,40,40,0.18) 0%, transparent 55%), ${bg}`,
      fontFamily: "'EB Garamond',Georgia,serif", padding: '24px 20px',
    }}>
      <div style={{
        maxWidth: 420, width: '100%',
        background: 'rgba(7,14,23,0.98)', borderRadius: 24,
        border: `1px solid ${redB}`, padding: '48px 32px 36px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.6)', textAlign: 'center',
      }}>
        {/* Icon */}
        <div style={{ fontSize: 54, marginBottom: 10, lineHeight: 1 }}>{current.icon}</div>

        {/* Tag */}
        <div style={{
          fontFamily: "'Cinzel',Georgia,serif", fontSize: 9,
          color: gold, letterSpacing: '0.22em', textTransform: 'uppercase',
          marginBottom: 14,
        }}>{current.tag}</div>

        {/* Title */}
        <h2 style={{
          fontSize: 24, fontWeight: 700, color: cream,
          fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.04em',
          lineHeight: 1.2, marginBottom: 18, whiteSpace: 'pre-line',
        }}>{current.title}</h2>

        {/* Body */}
        <p style={{ fontSize: 17, color: text, lineHeight: 1.85, marginBottom: current.detail ? 16 : 32 }}>
          {current.body}
        </p>

        {/* Detail callout */}
        {current.detail && (
          <p style={{
            fontSize: 14, color: muted, lineHeight: 1.75, marginBottom: 32,
            background: redF, border: `1px solid ${redB}`,
            borderRadius: 10, padding: '12px 16px',
          }}>{current.detail}</p>
        )}

        {/* Dot indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 28 }}>
          {SLIDES.map((_, i) => (
            <div key={i} style={{
              width: i === slide ? 20 : 6, height: 6, borderRadius: 3,
              background: i === slide ? gold : border,
              transition: 'all .3s ease',
            }} />
          ))}
        </div>

        {/* Continue button */}
        <button onClick={next} style={{
          width: '100%', padding: '16px', borderRadius: 14, cursor: 'pointer',
          background: isLast
            ? 'linear-gradient(135deg,rgba(158,40,40,0.5),rgba(158,40,40,0.25))'
            : `linear-gradient(135deg,${goldF},rgba(176,138,78,0.06))`,
          border: `1px solid ${isLast ? redB : goldB}`,
          color: cream, fontSize: 14,
          fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.09em',
          marginBottom: 12,
          transition: 'all .25s',
        }}>
          {isLast ? '⚔️ Enter the Arsenal' : 'Continue →'}
        </button>

        {/* Skip */}
        {!isLast && (
          <button onClick={onComplete} style={{
            background: 'transparent', border: 'none',
            color: muted, cursor: 'pointer', fontSize: 13,
            fontFamily: "'EB Garamond',Georgia,serif",
          }}>
            Skip intro
          </button>
        )}
      </div>
    </div>
  )
}
