// Armed & Anchored's welcome page (signed out) and unlock page (signed in, not purchased yet).
// Layout: components/EntryScreens.jsx, shared with the other Elora Radiance apps.
import { Welcome } from './EntryScreens.jsx'
import { BRAND } from '../entryBrand.js'

const STRIPE_LINK = 'https://buy.stripe.com/cNi9AS3Va8dEbSTarV57W0a'

// Signed-in buyers carry their account to Stripe so the purchase unlocks it directly.
function buyLink(session) {
  if (!session?.user) return STRIPE_LINK
  const q = new URLSearchParams({ client_reference_id: session.user.id })
  if (session.user.email) q.set('prefilled_email', session.user.email)
  return STRIPE_LINK + '?' + q.toString()
}

export default function Paywall({ onShowSignIn, session, pending, onCheckAgain, onSignOut }) {
  return (
    <Welcome brand={BRAND} session={session} buyHref={buyLink(session)}
      onSignIn={onShowSignIn} onSignOut={onSignOut} onCheckAgain={session ? onCheckAgain : undefined}
      notice={pending && session ? 'Just paid? It can take a minute to show up. Tap Check Again.' : null} />
  )
}
