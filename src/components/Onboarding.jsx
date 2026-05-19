import { useState } from 'react'

const C = {
  bg: '#070E17', red: '#8C1F1F', redL: '#B83232', redF: 'rgba(140,31,31,0.14)',
  redB: 'rgba(140,31,31,0.32)', gold: '#B08A4E', goldF: 'rgba(176,138,78,0.11)',
  goldB: 'rgba(176,138,78,0.28)', cream: '#EDE6D6', text: '#C8BEAA',
  muted: '#6A7E90', dim: '#3A4D5C', border: 'rgba(255,255,255,0.06)',
}

const SLIDES = [
  {
    icon: '⚔️',
    title: 'Welcome to the War Room',
    subtitle: 'Armed & Anchored is a spiritual warfare training journal built on Scripture, rooted in the finished work of Christ.',
    detail: 'You don\'t fight for victory. You fight from it.',
    color: C.redL,
  },
  {
    icon: '🛡️',
    title: '15 Weapons of the Believer',
    subtitle: 'From the Full Armor of God to Breaking Strongholds, Fasting, Intercession, and Finishing the Fight.',
    detail: 'Tap any weapon from the bottom dock to jump straight to it.',
    color: C.gold,
  },
  {
    icon: '📜',
    title: 'Deep Warfare Teaching',
    subtitle: 'Every weapon comes with Scripture, in-depth teaching, and a breakdown of exactly how the enemy attacks in that area.',
    detail: 'Know his methods. Forewarned is forearmed.',
    color: C.redL,
  },
  {
    icon: '⚔️',
    title: 'Declare & Deploy',
    subtitle: 'Each weapon has a spoken declaration and a warfare prayer. Speak them aloud — the spoken word has spiritual weight.',
    detail: '"They overcame him by the blood of the Lamb and by the word of their testimony." — Rev 12:11',
    color: C.gold,
    italic: true,
  },
  {
    icon: '✍️',
    title: 'Your Battle Journal',
    subtitle: 'Write your responses, reflections, and warfare notes on every weapon. Saved to your account — access on any device.',
    detail: 'Your entries are private and persistent across phone, tablet, and desktop.',
    color: C.redL,
  },
  {
    icon: '🔗',
    title: 'Share the Weapons',
    subtitle: 'Send any weapon\'s scripture and declaration to someone who needs it — one tap from the declare tab or the nav bar.',
    detail: 'The word of your testimony is a weapon for you and for those who hear it.',
    color: C.gold,
  },
  {
    icon: '🌿',
    title: 'You\'re Armed. You\'re Anchored.',
    subtitle: 'The battle is real. The enemy has a method. But the victory belongs to Christ — and you are seated in it.',
    detail: null,
    isLast: true,
    color: C.redL,
  },
]

export default function Onboarding({ onComplete }) {
  const [slide, setSlide] = useState(0)
  const [fadingOut, setFadingOut] = useState(false)
  const current = SLIDES[slide]
  const isLast = slide === SLIDES.length - 1

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: `radial-gradient(ellipse at 20% 0%,rgba(139,32,32,0.18) 0%,transparent 55%),
                   radial-gradient(ellipse at 80% 100%,rgba(176,138,78,0.08) 0%,transparent 50%),${C.bg}`,
      fontFamily: "'EB Garamond',Georgia,serif", color: C.text,
      padding: '32px 24px', textAlign: 'center',
      opacity: fadingOut ? 0 : 1,
      transition: 'opacity 0.4s ease',
    }}>
      <div style={{ maxWidth: 440, width: '100%' }}>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 40 }}>
          {SLIDES.map((_, i) => (
            <div key={i} style={{
              width: i === slide ? 20 : 6, height: 6, borderRadius: 3,
              background: i === slide ? C.redL : 'rgba(255,255,255,0.12)',
              transition: 'all .3s ease',
            }} />
          ))}
        </div>

        {/* Icon */}
        <div style={{ fontSize: 52, marginBottom: 24 }}>{current.icon}</div>

        {/* Title */}
        <h2 style={{
          fontSize: 24, fontWeight: 700, color: C.cream,
          fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.03em',
          lineHeight: 1.2, marginBottom: 16,
        }}>
          {current.title}
        </h2>

        {/* Subtitle */}
        <p style={{
          fontSize: 17, color: C.text, lineHeight: 1.85,
          marginBottom: current.detail ? 20 : 40,
        }}>
          {current.subtitle}
        </p>

        {/* Detail callout */}
        {current.detail && (
          <div style={{
            background: 'linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))',
            border: `1px solid ${current.color === C.gold ? C.goldB : C.redB}`,
            borderRadius: 12, padding: '14px 18px', marginBottom: 40,
          }}>
            <p style={{
              fontSize: 15, color: current.color === C.gold ? C.gold : C.redL,
              lineHeight: 1.75, fontStyle: current.italic ? 'italic' : 'normal',
            }}>
              {current.detail}
            </p>
          </div>
        )}

        {/* CTA */}
        {isLast ? (
          <button
            onClick={() => {
            setFadingOut(true)
            setTimeout(() => onComplete(), 400)
          }}
            style={{
              width: '100%', background: 'linear-gradient(135deg,rgba(139,32,32,0.4),rgba(139,32,32,0.18))',
              border: '1px solid rgba(140,31,31,0.55)', color: C.cream,
              padding: '18px', borderRadius: 14, cursor: 'pointer',
              fontSize: 16, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.1em',
              marginBottom: 16,
            }}
          >
            ⚔️ Begin Training
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            {slide > 0 && (
              <button
                onClick={() => setSlide(s => s - 1)}
                style={{
                  flex: 1, background: 'transparent', border: `1px solid ${C.border}`,
                  color: C.muted, padding: '14px', borderRadius: 12,
                  cursor: 'pointer', fontSize: 14, fontFamily: "'Cinzel',Georgia,serif",
                }}
              >
                ‹ Back
              </button>
            )}
            <button
              onClick={() => setSlide(s => s + 1)}
              style={{
                flex: 2, background: 'linear-gradient(135deg,rgba(139,32,32,0.3),rgba(139,32,32,0.12))',
                border: '1px solid rgba(140,31,31,0.45)', color: C.cream,
                padding: '14px', borderRadius: 12, cursor: 'pointer',
                fontSize: 14, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.07em',
              }}
            >
              Next ›
            </button>
          </div>
        )}

        {/* Skip on early slides */}
        {!isLast && (
          <button
            onClick={() => {
            setFadingOut(true)
            setTimeout(() => onComplete(), 400)
          }}
            style={{
              background: 'none', border: 'none', color: C.dim,
              cursor: 'pointer', fontSize: 12, marginTop: 16,
              fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.08em',
            }}
          >
            Skip intro
          </button>
        )}
      </div>
    </div>
  )
}
