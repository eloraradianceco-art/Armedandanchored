import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Paywall from './components/Paywall'
import Auth from './components/Auth'
import Onboarding from './components/Onboarding'
import ArmedAndAnchored from './ArmedAndAnchored'

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Check for Stripe session_id on load
  const params = new URLSearchParams(window.location.search)
  const stripeSessionId = params.get('session_id')

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  const handlePaymentComplete = async (sessionId) => {
    // Verify payment with our API
    try {
      const res = await fetch(`/api/verify-payment?session_id=${sessionId}`)
      const data = await res.json()
      if (data.paid) {
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname)
        if (session) {
          // Already logged in — just reload profile
          await loadProfile(session.user.id)
        }
        // Otherwise Auth component will redirect here after sign up
        return true
      }
    } catch (e) {
      console.error('Payment verification failed:', e)
    }
    return false
  }

  const handleAuthComplete = async (isNewUser) => {
    // Reload profile after sign in/up
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await loadProfile(session.user.id)
      if (isNewUser) setShowOnboarding(true)
    }
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    localStorage.setItem('aa_onboarded', 'true')
  }

  if (loading) return <LoadingScreen />

  // Not paid yet — show paywall
  if (!profile?.paid && !stripeSessionId) {
    return <Paywall />
  }

  // Came back from Stripe but not logged in — show auth with session_id
  if (stripeSessionId && !session) {
    return (
      <Auth
        stripeSessionId={stripeSessionId}
        onComplete={handleAuthComplete}
        onPaymentVerify={handlePaymentComplete}
      />
    )
  }

  // Paid + logged in but session_id still in URL — verify then continue
  if (stripeSessionId && session && !profile?.paid) {
    handlePaymentComplete(stripeSessionId)
    return <LoadingScreen />
  }

  // Not logged in (direct visit, not from Stripe)
  if (!session) {
    return <Auth onComplete={handleAuthComplete} />
  }

  // Logged in, paid — show onboarding for new users
  if (showOnboarding || (!localStorage.getItem('aa_onboarded') && profile?.paid)) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  // All good — show the app
  return <ArmedAndAnchored session={session} profile={profile} />
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#070E17', flexDirection: 'column', gap: 16
    }}>
      <div style={{ fontSize: 32 }}>⚔️</div>
      <div style={{ fontSize: 13, color: '#3A4D5C', fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.12em' }}>
        ARMED & ANCHORED
      </div>
    </div>
  )
}
