import { useState } from 'react'
import { supabase } from '../supabaseClient'

const C = {
  bg: '#070E17', red: '#9E2828', redL: '#C94848', redF: 'rgba(158,40,40,0.14)',
  redB: 'rgba(158,40,40,0.32)', gold: '#B08A4E', goldF: 'rgba(176,138,78,0.11)',
  goldB: 'rgba(176,138,78,0.28)', cream: '#EDE6D6', text: '#C8BEAA',
  muted: '#7C90A2', dim: '#4E6070', border: 'rgba(255,255,255,0.06)',
  green: '#7C9284',
}

const INP = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(176,138,78,0.2)', borderRadius: 10,
  color: '#EDE6D6', fontSize: 16, padding: '14px 16px',
  fontFamily: "'EB Garamond',Georgia,serif", outline: 'none',
  boxSizing: 'border-box', marginBottom: 12,
}

const BTN = {
  width: '100%', padding: '16px', borderRadius: 12, minHeight: 52,
  cursor: 'pointer', fontSize: 14,
  fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.09em',
  transition: 'all .25s', touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent', border: 'none',
}

export default function Auth({ stripeSessionId, onComplete, onPaymentVerify, onBack, initialMode }) {
  const isNewUser = !!stripeSessionId
  const [mode, setMode] = useState(initialMode || (isNewUser ? 'signup' : 'signin'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [confirmSent, setConfirmSent] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    if (mode === 'forgot') {
      if (!email) { setError('Please enter your email address.'); return }
      setLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://armedandanchored.vercel.app',
      })
      setLoading(false)
      if (error) { setError(error.message); return }
      setResetSent(true)
      return
    }

    if (!email || !password) { setError('Please enter your email and password.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      if (!data?.session) {
        setConfirmSent(true); setLoading(false); return
      }
      if (stripeSessionId && onPaymentVerify) {
        await onPaymentVerify(stripeSessionId, data.session.user.id)
      }
      onComplete?.(true)
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(
          error.message === 'Email not confirmed'
            ? '✉️ Please confirm your email first — check your inbox for the confirmation link, then try again.'
            : error.message === 'Invalid login credentials'
            ? 'Incorrect email or password. Try again or use Forgot Password below.'
            : error.message
        )
        setLoading(false); return
      }
      // If signed in and has stripeSessionId, verify payment now
      if (stripeSessionId && onPaymentVerify && data?.session) {
        await onPaymentVerify(stripeSessionId, data.session.user.id)
      }
      onComplete?.(false)
    }
    setLoading(false)
  }

  const label = (txt) => (
    <div style={{ fontSize: 10, color: C.muted, letterSpacing: '0.14em',
      textTransform: 'uppercase', fontFamily: "'Cinzel',Georgia,serif", marginBottom: 6 }}>
      {txt}
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
      background: `radial-gradient(ellipse at 50% 0%, rgba(158,40,40,0.12) 0%, transparent 60%), ${C.bg}`,
      fontFamily: "'EB Garamond',Georgia,serif",
      overflowY: 'auto', padding: '0 16px 40px',
    }}>
      <div style={{
        background: 'rgba(13,26,42,0.98)', borderRadius: 20,
        border: '1px solid rgba(176,138,78,0.2)',
        padding: '32px 28px 48px', width: '100%', maxWidth: 420,
        marginTop: '8vh', marginBottom: 40,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>⚔️</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.cream,
            fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.06em', marginBottom: 6 }}>
            Armed &amp; Anchored
          </div>
          <div style={{ fontSize: 13, color: C.muted, fontStyle: 'italic' }}>
            {mode === 'signup' ? 'Create your account to begin' :
             mode === 'forgot' ? 'Reset your password' :
             'Welcome back, warrior'}
          </div>
        </div>

        {/* Tab switcher — only for signin/signup */}
        {mode !== 'forgot' && (
          <div style={{ display: 'flex', gap: 0, marginBottom: 24,
            background: 'rgba(255,255,255,0.03)', borderRadius: 10,
            border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            {[['signin','Sign In'],['signup','Create Account']].map(([m, lbl]) => (
              <button key={m} onClick={() => { setMode(m); setError(null); setConfirmSent(false) }}
                style={{ flex: 1, padding: '11px', background: mode === m
                  ? 'linear-gradient(135deg,rgba(158,40,40,0.3),rgba(158,40,40,0.12))'
                  : 'transparent',
                  border: 'none', borderRight: m === 'signin' ? `1px solid ${C.border}` : 'none',
                  color: mode === m ? C.redL : C.muted, cursor: 'pointer',
                  fontSize: 12, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.08em',
                  transition: 'all .2s', touchAction: 'manipulation' }}>
                {lbl}
              </button>
            ))}
          </div>
        )}

        {/* Confirm sent */}
        {confirmSent && (
          <div style={{ background: 'rgba(176,138,78,0.1)', border: '1px solid rgba(176,138,78,0.3)',
            borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: C.gold, fontFamily: "'Cinzel',Georgia,serif",
              letterSpacing: '0.06em', marginBottom: 6 }}>✉️ Check Your Email</div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>
              Confirmation link sent to <strong style={{ color: C.cream }}>{email}</strong>.
              Click it then come back and sign in.
            </div>
            <button onClick={() => { setConfirmSent(false); setMode('signin') }}
              style={{ marginTop: 12, background: 'transparent', border: `1px solid ${C.goldB}`,
                color: C.gold, padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                fontSize: 12, fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.06em',
                touchAction: 'manipulation' }}>
              Already confirmed? Sign In →
            </button>
          </div>
        )}

        {/* Reset sent */}
        {resetSent && (
          <div style={{ background: 'rgba(124,146,132,0.1)', border: '1px solid rgba(124,146,132,0.3)',
            borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: C.green, fontFamily: "'Cinzel',Georgia,serif",
              letterSpacing: '0.06em', marginBottom: 6 }}>✓ Reset Email Sent</div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>
              Check <strong style={{ color: C.cream }}>{email}</strong> for a password reset link.
            </div>
            <button onClick={() => { setResetSent(false); setMode('signin') }}
              style={{ marginTop: 12, background: 'transparent', border: `1px solid ${C.border}`,
                color: C.muted, padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                fontSize: 12, fontFamily: "'Cinzel',Georgia,serif", touchAction: 'manipulation' }}>
              Back to Sign In
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(158,40,40,0.1)', border: '1px solid rgba(158,40,40,0.3)',
            borderRadius: 10, padding: '12px 14px', marginBottom: 14, fontSize: 14,
            color: '#C94848', lineHeight: 1.6 }}>
            {error}
          </div>
        )}

        {/* Form */}
        {!confirmSent && !resetSent && (
          <>
            {label('Email Address')}
            <input type="email" placeholder="you@email.com" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={INP} autoCapitalize="none" autoCorrect="off"/>

            {mode !== 'forgot' && (
              <>
                {label('Password')}
                <input type="password"
                  placeholder={mode === 'signup' ? 'Create a password (min 6 chars)' : 'Your password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  style={{ ...INP, marginBottom: 20 }}/>
              </>
            )}

            <button onClick={handleSubmit} disabled={loading} style={{
              ...BTN,
              background: loading ? 'rgba(158,40,40,0.1)'
                : 'linear-gradient(135deg,rgba(158,40,40,0.45),rgba(158,40,40,0.22))',
              border: '1px solid rgba(158,40,40,0.5)',
              color: loading ? C.muted : C.cream,
            }}>
              {loading ? 'Please wait...' :
               mode === 'signup' ? '⚔️ Create Account & Begin' :
               mode === 'forgot' ? '✉️ Send Reset Email' :
               '⚔️ Sign In'}
            </button>

            {/* Forgot password link */}
            {mode === 'signin' && (
              <button onClick={() => { setMode('forgot'); setError(null) }}
                style={{ marginTop: 14, background: 'none', border: 'none',
                  color: C.dim, cursor: 'pointer', fontSize: 13,
                  fontFamily: "'EB Garamond',Georgia,serif", display: 'block',
                  width: '100%', textAlign: 'center', touchAction: 'manipulation' }}>
                Forgot your password?
              </button>
            )}

            {mode === 'forgot' && (
              <button onClick={() => { setMode('signin'); setError(null) }}
                style={{ marginTop: 14, background: 'none', border: 'none',
                  color: C.dim, cursor: 'pointer', fontSize: 13,
                  fontFamily: "'EB Garamond',Georgia,serif", display: 'block',
                  width: '100%', textAlign: 'center', touchAction: 'manipulation' }}>
                ← Back to Sign In
              </button>
            )}
          </>
        )}

        {/* New user sign-in link */}
        {mode === 'signin' && !isNewUser && (
          <div style={{ marginTop: 16, fontSize: 13, color: C.dim, textAlign: 'center' }}>
            Don't have an account?{' '}
            <button onClick={() => { window.location.href = 'https://buy.stripe.com/dRm6oGezOalM1ef1Vp57W07' }}
              style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer',
                fontSize: 13, textDecoration: 'underline', fontFamily: 'inherit', padding: 0,
                touchAction: 'manipulation' }}>
              Get Access
            </button>
          </div>
        )}

        {/* Add to Home Screen — shown after Stripe payment */}
        {isNewUser && (
          <div style={{ marginTop: 28, background: 'rgba(176,138,78,0.07)',
            border: '1px solid rgba(176,138,78,0.22)', borderRadius: 14, padding: '18px 18px 14px', textAlign: 'left' }}>
            <div style={{ fontSize: 10, color: C.gold, letterSpacing: '0.16em',
              textTransform: 'uppercase', fontFamily: "'Cinzel',Georgia,serif", marginBottom: 10 }}>
              📱 Add to Your Home Screen
            </div>
            <p style={{ fontSize: 13, color: C.text, lineHeight: 1.65, marginBottom: 14 }}>
              Armed &amp; Anchored works like a native app — add it to your home screen for instant one-tap access.
            </p>
            {[
              { os: '🍎 iPhone / iPad (Safari)', steps: ['Tap the Share button ⎋ at the bottom of Safari', 'Scroll and tap "Add to Home Screen"', 'Tap "Add" — done ✓'] },
              { os: '🤖 Android (Chrome)', steps: ['Tap the three-dot menu ⋮ at the top right', 'Tap "Add to Home Screen" or "Install App"', 'Tap "Add" — done ✓'] },
            ].map(p => (
              <div key={p.os} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: C.gold, fontFamily: "'Cinzel',Georgia,serif",
                  letterSpacing: '0.06em', marginBottom: 6 }}>{p.os}</div>
                {p.steps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: C.redL, flexShrink: 0, minWidth: 14,
                      fontFamily: "'Cinzel',Georgia,serif" }}>{i + 1}.</span>
                    <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{step}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
