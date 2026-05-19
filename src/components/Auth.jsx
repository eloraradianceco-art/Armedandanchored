import { useState } from 'react'
import { supabase } from '../supabaseClient'

const C = {
  bg: '#070E17', red: '#8C1F1F', redL: '#B83232', redF: 'rgba(140,31,31,0.14)',
  redB: 'rgba(140,31,31,0.32)', gold: '#B08A4E', goldF: 'rgba(176,138,78,0.11)',
  goldB: 'rgba(176,138,78,0.28)', cream: '#EDE6D6', text: '#C8BEAA',
  muted: '#6A7E90', dim: '#3A4D5C', border: 'rgba(255,255,255,0.06)',
}

const INP = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(176,138,78,0.2)', borderRadius: 10,
  color: C.cream, fontSize: 16, padding: '13px 16px',
  fontFamily: "'EB Garamond',Georgia,serif", outline: 'none',
  boxSizing: 'border-box',
}

export default function Auth({ stripeSessionId, onComplete, onPaymentVerify, onBack }) {
  const isNewUser = !!stripeSessionId
  const [mode, setMode] = useState(isNewUser ? 'signup' : 'signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  // Check if user arrived directly to sign in (not from Stripe)
  const params = new URLSearchParams(window.location.search)
  const directSignin = params.get('signin') === 'true'

  const handleSubmit = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true); setError(null)

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }

      // If they came from Stripe, verify payment and mark profile as paid
      if (stripeSessionId && onPaymentVerify) {
        await onPaymentVerify(stripeSessionId)
      }
      onComplete?.(true) // true = new user → show onboarding

    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      onComplete?.(false) // false = returning user → skip onboarding
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: `radial-gradient(ellipse at 20% 0%,rgba(139,32,32,0.18) 0%,transparent 55%),${C.bg}`,
      fontFamily: "'EB Garamond',Georgia,serif", color: C.text,
      padding: '24px', textAlign: 'center',
    }}>
      <div style={{ maxWidth: 400, width: '100%' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 22, opacity: 0.6, transform: 'scaleX(-1)', display: 'inline-block' }}>⚔️</span>
          <span style={{ fontSize: 26, fontWeight: 700, color: C.cream, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.04em' }}>Armed & Anchored</span>
          <span style={{ fontSize: 22, opacity: 0.6 }}>⚔️</span>
        </div>

        <div style={{ fontSize: 11, color: C.muted, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Cinzel',Georgia,serif", marginBottom: 32 }}>
          {mode === 'signup' ? 'Create Your Account' : 'Welcome Back, Warrior'}
        </div>

        {isNewUser && mode === 'signup' && (
          <div style={{ background: 'rgba(140,31,31,0.1)', border: '1px solid rgba(140,31,31,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#B83232' }}>
            ✦ Payment confirmed — create your account to access the app
          </div>
        )}

        {onBack && (
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#6A7E90', cursor: 'pointer', fontSize: 13, fontFamily: "'inherit'", marginBottom: 16, textAlign: 'left', padding: 0 }}>← Back</button>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          <input
            type="email" placeholder="Email address" value={email}
            onChange={e => setEmail(e.target.value)} style={INP}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          <input
            type="password" placeholder="Password (min 6 characters)" value={password}
            onChange={e => setPassword(e.target.value)} style={INP}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {error && (
          <div style={{ background: 'rgba(140,31,31,0.1)', border: '1px solid rgba(140,31,31,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#B83232', textAlign: 'left' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit} disabled={loading}
          style={{
            width: '100%', background: loading ? 'rgba(140,31,31,0.1)' : 'linear-gradient(135deg,rgba(139,32,32,0.35),rgba(139,32,32,0.15))',
            border: '1px solid rgba(140,31,31,0.5)', color: loading ? C.muted : C.cream,
            padding: '14px', borderRadius: 12, cursor: loading ? 'default' : 'pointer',
            fontSize: 14, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.09em',
            marginBottom: 16, transition: 'all .25s',
          }}
        >
          {loading ? 'Please wait...' : mode === 'signup' ? '⚔️ Create Account & Begin' : '⚔️ Sign In'}
        </button>

        {!isNewUser && (
          <div style={{ fontSize: 13, color: C.dim }}>
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button onClick={() => window.location.href = 'https://buy.stripe.com/dRm6oGezOalM1ef1Vp57W07'}
                  style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 13, textDecoration: 'underline', fontFamily: 'inherit' }}>
                  Get Access
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => setMode('signin')}
                  style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 13, textDecoration: 'underline', fontFamily: 'inherit' }}>
                  Sign In
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
