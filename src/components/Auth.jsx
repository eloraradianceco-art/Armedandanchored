import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { AuthCard } from './EntryScreens.jsx'
import { BRAND } from '../entryBrand.js'

export default function Auth({ isNewUser = false, onComplete, onBack, initialMode }) {
  const [mode, setMode] = useState(initialMode || (isNewUser ? 'signup' : 'signin'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
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
        redirectTo: 'https://armed.eloraradiance.com',
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
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { app: 'aa' } } })
      if (error && /already (registered|exists)/i.test(error.message)) {
        // One account works across Elora Radiance apps: sign in with it instead
        const res = await supabase.auth.signInWithPassword({ email, password })
        if (res.error) {
          setError('This email already has an Elora Radiance account (from Anchored Steps). Enter that password, or use Forgot Password below.')
          setLoading(false); return
        }
        onComplete?.(isNewUser)
        setLoading(false); return
      }
      if (error) { setError(error.message); setLoading(false); return }
      if (!data?.session) {
        setConfirmSent(true); setLoading(false); return
      }
      onComplete?.(true)
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(
          error.message === 'Email not confirmed'
            ? '✉️ Please confirm your email first — check your inbox for the confirmation link, then try again.'
            : error.message === 'Invalid login credentials'
            ? 'Incorrect email or password.'
            : error.message
        )
        setLoading(false); return
      }
      onComplete?.(false)
    }
    setLoading(false)
  }

  const message = confirmSent ? `Confirmation link sent to ${email}. Open it, then come back and sign in.`
    : isNewUser && mode !== 'forgot' ? 'Payment received. Create your account (or sign in) with the email you paid with to open Armed & Anchored.' : null
  return (
    <AuthCard brand={BRAND} mode={mode} onMode={(m) => { setMode(m); setError(null); setConfirmSent(false); setResetSent(false) }}
      email={email} onEmail={setEmail} password={password} onPassword={setPassword}
      onSubmit={handleSubmit} loading={loading} error={error} message={message}
      resetSent={resetSent} onResetDone={() => { setResetSent(false); setMode('signin') }}
      onBack={onBack} />
  )
}
