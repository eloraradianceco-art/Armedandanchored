import { useState, useEffect, Component } from 'react'
import { supabase } from './supabaseClient'
import Paywall from './components/Paywall'
import Auth from './components/Auth'
import Onboarding from './components/Onboarding'
import ArmedAndAnchored from './ArmedAndAnchored'

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070E17', flexDirection: 'column', gap: 16, padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 32 }}>⚔️</div>
          <div style={{ fontSize: 14, color: '#C94848', fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.1em' }}>Something went wrong</div>
          <div style={{ fontSize: 12, color: '#3A4D5C', maxWidth: 360, lineHeight: 1.6 }}>{this.state.error.message}</div>
          <button onClick={() => window.location.reload()} style={{ marginTop: 8, background: 'rgba(158,40,40,0.2)', border: '1px solid rgba(158,40,40,0.4)', color: '#C94848', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontFamily: "'Cinzel',Georgia,serif" }}>
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function AppInner() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)

  const params = new URLSearchParams(window.location.search)
  const stripeSessionId = params.get('session_id')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else setLoading(false)
    })

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
    try {
      const res = await fetch(`/api/verify-payment?session_id=${sessionId}`)
      const data = await res.json()
      if (data.paid) {
        window.history.replaceState({}, '', window.location.pathname)
        if (session) await loadProfile(session.user.id)
        return true
      }
    } catch (e) {
      console.error('Payment verification failed:', e)
    }
    return false
  }

  const handleAuthComplete = async (isNewUser) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await loadProfile(session.user.id)
      if (isNewUser) setShowOnboarding(true)
    }
    setShowSignIn(false)
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    localStorage.setItem('aa_onboarded', 'true')
  }

  if (loading) return <LoadingScreen />

  // Returned from Stripe — show sign up
  if (stripeSessionId && !session) {
    return <Auth stripeSessionId={stripeSessionId} onComplete={handleAuthComplete} onPaymentVerify={handlePaymentComplete} />
  }

  // Returned from Stripe, already logged in — verify payment
  if (stripeSessionId && session && !profile?.paid) {
    handlePaymentComplete(stripeSessionId)
    return <LoadingScreen />
  }

  // Not logged in — show paywall or sign in
  if (!session) {
    if (showSignIn) {
      return <Auth onComplete={handleAuthComplete} onBack={() => setShowSignIn(false)} />
    }
    return <Paywall onShowSignIn={() => setShowSignIn(true)} />
  }

  // Logged in but not paid — show paywall
  if (!profile?.paid) {
    return <Paywall onShowSignIn={() => setShowSignIn(true)} />
  }

  // New user — show onboarding
  if (showOnboarding || (!localStorage.getItem('aa_onboarded') && profile?.paid)) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  // All good
  return <ArmedAndAnchored session={session} profile={profile} />
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  )
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070E17', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 32 }}>⚔️</div>
      <div style={{ fontSize: 13, color: '#3A4D5C', fontFamily: "'Cinzel',Georgia,serif", letterSpacing: '0.12em' }}>
        ARMED & ANCHORED
      </div>
    </div>
  )
}
