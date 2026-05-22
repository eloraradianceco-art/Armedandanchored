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
    if (this.state.error) return (
      <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
        background:'#070E17',flexDirection:'column',gap:16,padding:24,textAlign:'center' }}>
        <div style={{fontSize:32}}>⚔️</div>
        <div style={{fontSize:14,color:'#C94848',fontFamily:"'Cinzel',Georgia,serif",letterSpacing:'0.1em'}}>
          Something went wrong
        </div>
        <div style={{fontSize:12,color:'#3A4D5C',maxWidth:360,lineHeight:1.6}}>
          {this.state.error.message}
        </div>
        <button onClick={()=>window.location.reload()}
          style={{marginTop:8,background:'rgba(158,40,40,0.2)',border:'1px solid rgba(158,40,40,0.4)',
            color:'#C94848',padding:'10px 20px',borderRadius:10,cursor:'pointer',
            fontSize:12,fontFamily:"'Cinzel',Georgia,serif"}}>
          Reload
        </button>
      </div>
    )
    return this.props.children
  }
}

function AppInner() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState(null)
  const [resetDone, setResetDone] = useState(false)
  const [verifyingPayment, setVerifyingPayment] = useState(false)

  const params = new URLSearchParams(window.location.search)
  const stripeSessionId = params.get('session_id')

  // Store stripe session_id in localStorage as fallback
  if (stripeSessionId) {
    localStorage.setItem('pending_stripe_session', stripeSessionId)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowPasswordReset(true)
        setSession(session)
        setLoading(false)
        return
      }
      setSession(session)
      if (session) loadProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
    setLoading(false)

    // If profile exists but not paid, check for pending Stripe session
    if (data && !data.paid) {
      const pendingSession = localStorage.getItem('pending_stripe_session')
      if (pendingSession) {
        setVerifyingPayment(true)
        const paid = await handlePaymentComplete(pendingSession, userId)
        if (paid) localStorage.removeItem('pending_stripe_session')
        setVerifyingPayment(false)
      }
    } else if (data?.paid) {
      localStorage.removeItem('pending_stripe_session')
    }
  }

  const handlePaymentComplete = async (sessionId, userId) => {
    try {
      const userIdParam = userId ? `&user_id=${userId}` : ''
      const res = await fetch(`/api/verify-payment?session_id=${sessionId}${userIdParam}`)
      const data = await res.json()
      if (data.paid) {
        window.history.replaceState({}, '', window.location.pathname)
        const currentSession = (await supabase.auth.getSession()).data.session
        if (currentSession) {
          await loadProfile(currentSession.user.id)
        }
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

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      setResetError('Password must be at least 6 characters.')
      return
    }
    setResetLoading(true)
    setResetError(null)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setResetLoading(false)
    if (error) { setResetError(error.message); return }
    setResetDone(true)
    setTimeout(() => {
      setShowPasswordReset(false)
      setResetDone(false)
      setNewPassword('')
    }, 2000)
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    localStorage.setItem('aa_onboarded', 'true')
  }

  // ── Password Reset Screen ─────────────────────────────────────────────
  if (showPasswordReset) {
    return (
      <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'flex-start',
        flexDirection:'column',background:'#070E17',padding:'0 16px 40px',overflowY:'auto',
        fontFamily:"'EB Garamond',Georgia,serif" }}>
        <div style={{ background:'rgba(13,26,42,0.98)',borderRadius:20,
          border:'1px solid rgba(176,138,78,0.2)',padding:'32px 28px',
          width:'100%',maxWidth:420,marginTop:'10vh' }}>
          <div style={{textAlign:'center',marginBottom:28}}>
            <div style={{fontSize:28,marginBottom:10}}>🔐</div>
            <div style={{fontSize:18,fontWeight:700,color:'#EDE6D6',
              fontFamily:"'Cinzel',Georgia,serif",letterSpacing:'0.06em',marginBottom:6}}>
              Set New Password
            </div>
            <div style={{fontSize:13,color:'#7C90A2',fontStyle:'italic'}}>
              Choose a new password for your account
            </div>
          </div>
          {resetDone ? (
            <div style={{background:'rgba(124,146,132,0.15)',border:'1px solid rgba(124,146,132,0.4)',
              borderRadius:10,padding:'14px 16px',textAlign:'center',color:'#7C9284',fontSize:15}}>
              ✓ Password updated! Signing you in...
            </div>
          ) : (
            <>
              {resetError && (
                <div style={{background:'rgba(158,40,40,0.1)',border:'1px solid rgba(158,40,40,0.3)',
                  borderRadius:10,padding:'10px 14px',marginBottom:14,fontSize:14,color:'#C94848'}}>
                  {resetError}
                </div>
              )}
              <div style={{fontSize:10,color:'#7C90A2',letterSpacing:'0.14em',
                textTransform:'uppercase',fontFamily:"'Cinzel',Georgia,serif",marginBottom:6}}>
                New Password
              </div>
              <input type="password" placeholder="New password (min 6 characters)"
                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePasswordReset()}
                style={{width:'100%',background:'rgba(255,255,255,0.04)',
                  border:'1px solid rgba(176,138,78,0.2)',borderRadius:10,
                  color:'#EDE6D6',fontSize:16,padding:'14px 16px',
                  fontFamily:"'EB Garamond',Georgia,serif",outline:'none',
                  boxSizing:'border-box',marginBottom:20}}/>
              <button onClick={handlePasswordReset} disabled={resetLoading}
                style={{width:'100%',padding:'16px',borderRadius:12,cursor:'pointer',
                  background:resetLoading?'rgba(158,40,40,0.1)':'linear-gradient(135deg,rgba(158,40,40,0.45),rgba(158,40,40,0.22))',
                  border:'1px solid rgba(158,40,40,0.5)',
                  color:resetLoading?'#7C90A2':'#EDE6D6',fontSize:14,
                  fontFamily:"'Cinzel',Georgia,serif",letterSpacing:'0.09em',
                  touchAction:'manipulation'}}>
                {resetLoading ? 'Updating...' : '✓ Set New Password'}
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  if (loading || verifyingPayment) return <LoadingScreen message={verifyingPayment ? 'Verifying payment...' : null}/>

  // Returned from Stripe — show sign up/in
  if (stripeSessionId && !session) {
    return <Auth stripeSessionId={stripeSessionId}
      onComplete={handleAuthComplete} onPaymentVerify={handlePaymentComplete}/>
  }

  // Returned from Stripe, already logged in — verify payment
  if (stripeSessionId && session && !profile?.paid) {
    handlePaymentComplete(stripeSessionId, session.user.id)
    return <LoadingScreen message="Verifying payment..."/>
  }

  // Not logged in
  if (!session) {
    if (showSignIn) {
      return <Auth onComplete={handleAuthComplete} onBack={() => setShowSignIn(false)}/>
    }
    return <Paywall onShowSignIn={() => setShowSignIn(true)}/>
  }

  // Logged in but not paid
  if (!profile?.paid) {
    return (
      <Paywall
        onShowSignIn={() => setShowSignIn(true)}
        showRecovery={true}
        onRetryPayment={async () => {
          setVerifyingPayment(true)
          const pendingSession = localStorage.getItem('pending_stripe_session')
          if (pendingSession && session) {
            await handlePaymentComplete(pendingSession, session.user.id)
          }
          setVerifyingPayment(false)
        }}
      />
    )
  }

  // New user — show onboarding
  if (showOnboarding || (!localStorage.getItem('aa_onboarded') && profile?.paid)) {
    return <Onboarding onComplete={handleOnboardingComplete}/>
  }

  return <ArmedAndAnchored session={session} profile={profile}/>
}

export default function App() {
  return <ErrorBoundary><AppInner/></ErrorBoundary>
}

function LoadingScreen({ message }) {
  return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      background:'#070E17',flexDirection:'column',gap:16 }}>
      <div style={{fontSize:32}}>⚔️</div>
      <div style={{fontSize:13,color:'#3A4D5C',fontFamily:"'Cinzel',Georgia,serif",letterSpacing:'0.12em'}}>
        {message || 'ARMED & ANCHORED'}
      </div>
    </div>
  )
}
