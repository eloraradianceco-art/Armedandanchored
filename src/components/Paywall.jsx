// Armed & Anchored's welcome page (signed out) and unlock page (signed in, not purchased yet).
// Free accounts get The Full Armor of God; this page is what a locked weapon opens.
// Layout: components/EntryScreens.jsx, shared with the other Elora Radiance apps.
import { Welcome } from './EntryScreens.jsx'
import { BRAND } from '../entryBrand.js'

const STRIPE_LINK = 'https://buy.stripe.com/aFa6oGajy3Xo2ijfMf57W0f'   // lifetime, $39.99 (since 2026-11-25)
// Anchored Library ($79): Year 1 + Year 2 + Armed & Anchored in one purchase. Checkout returns to
// eloraradiance.com/library-welcome, which opens each app with the checkout id. Web only.
const LIBRARY_LINK = 'https://buy.stripe.com/28EfZg0IYalM6yzeIb57W0b'

// Signed-in buyers carry their account to Stripe so the purchase unlocks it directly.
function buyLink(session, link = STRIPE_LINK) {
  if (!session?.user) return link
  const q = new URLSearchParams({ client_reference_id: session.user.id })
  if (session.user.email) q.set('prefilled_email', session.user.email)
  return link + '?' + q.toString()
}

export default function Paywall({ onShowSignIn, onTryFree, onBack, session, pending, onCheckAgain, onSignOut }) {
  return (
    <Welcome brand={BRAND} session={session} buyHref={buyLink(session)} bundleHref={buyLink(session, LIBRARY_LINK)}
      onSignIn={onShowSignIn} onSignOut={onSignOut} onCheckAgain={session ? onCheckAgain : undefined}
      onTryFree={onTryFree} freeCta={BRAND.freeCta} freeFine={BRAND.freeFine} onBack={onBack} backLabel="Back to your free weapon"
      notice={pending && session ? 'Just paid? It can take a minute to show up. Tap Check Again.' : null} />
  )
}
