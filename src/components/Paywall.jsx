// Armed & Anchored's welcome page (signed out) and unlock page (signed in, not purchased yet).
// Layout: components/EntryScreens.jsx, shared with the other Elora Radiance apps.
// Website: Stripe checkout. App Store app: Apple in-app purchase (RevenueCat) once REVENUECAT_IOS_KEY is set in
// native.js; until then people sign in, and buying waits.
import { useEffect, useState } from 'react'
import { Welcome } from './EntryScreens.jsx'
import { BRAND } from '../entryBrand.js'
import { isNative, NATIVE_PURCHASES, storeLifetime, storeBuy, storeRestore } from '../native'

const STRIPE_LINK = 'https://buy.stripe.com/cNi9AS3Va8dEbSTarV57W0a'
// Anchored Library ($79): Year 1 + Year 2 + Armed & Anchored in one purchase. Checkout returns to
// eloraradiance.com/library-welcome, which opens each app with the checkout id. Web only: never in the App Store app.
const LIBRARY_LINK = 'https://buy.stripe.com/28EfZg0IYalM6yzeIb57W0b'

// Signed-in buyers carry their account to Stripe so the purchase unlocks it directly.
function buyLink(session, link = STRIPE_LINK) {
  if (!session?.user) return link
  const q = new URLSearchParams({ client_reference_id: session.user.id })
  if (session.user.email) q.set('prefilled_email', session.user.email)
  return link + '?' + q.toString()
}

export default function Paywall({ onShowSignIn, session, pending, onCheckAgain, onSignOut, onStorePurchase }) {
  if (isNative && NATIVE_PURCHASES) return <StorePaywall session={session} onShowSignIn={onShowSignIn} onSignOut={onSignOut} onStorePurchase={onStorePurchase} />
  return (
    <Welcome brand={BRAND} session={session} buyHref={buyLink(session)} bundleHref={isNative ? undefined : buyLink(session, LIBRARY_LINK)}
      purchasable={!isNative} unavailableNote="Lifetime access will be available to purchase right here in the app soon."
      onSignIn={onShowSignIn} onSignOut={onSignOut} onCheckAgain={session && !isNative ? onCheckAgain : undefined}
      notice={pending && session ? 'Just paid? It can take a minute to show up. Tap Check Again.' : null} />
  )
}

// App Store: the lifetime unlock is bought with Apple and tied to the signed-in account, so it also opens on the
// website and every device. Apple requires a Restore Purchases button.
function StorePaywall({ session, onShowSignIn, onSignOut, onStorePurchase }) {
  const c = BRAND.colors
  const uid = session?.user?.id
  const [product, setProduct] = useState(undefined) // undefined = loading, null = store unavailable
  const [busy, setBusy] = useState(null)
  const [msg, setMsg] = useState('')
  useEffect(() => {
    if (!uid) return undefined
    let alive = true
    storeLifetime(uid).then((p) => { if (alive) setProduct(p) })
    return () => { alive = false }
  }, [uid])
  const buy = async () => {
    if (busy) return
    if (!product) { setMsg("The App Store isn't reachable right now. Check your connection and try again."); return }
    setBusy('buy'); setMsg('')
    const r = await storeBuy(uid, product.pkg)
    setBusy(null)
    if (r === 'unlocked') onStorePurchase?.()
    else if (r === 'pending') setMsg('Your purchase is waiting for approval. Armed & Anchored opens as soon as it is approved.')
    else if (r && r.error) setMsg(r.error)
  }
  const restore = async () => {
    if (busy) return
    setBusy('restore'); setMsg('')
    const ok = await storeRestore(uid)
    setBusy(null)
    if (ok) onStorePurchase?.()
    else setMsg('No Armed & Anchored purchase was found for this Apple ID.')
  }
  const brand = {
    ...BRAND,
    cta: busy === 'buy' ? 'Opening the App Store…' : `⚔️ Get Lifetime Access${product?.price ? ' · ' + product.price : ''}`,
    fine: 'One-time purchase · Instant access · All 26 weapons, yours forever',
  }
  const link = { background: 'none', border: 'none', padding: 0, color: c.link, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }
  const footer = uid ? (
    <div style={{ marginTop: 16, fontSize: 13, color: c.muted, lineHeight: 1.6 }}>
      <button type="button" onClick={restore} disabled={!!busy} style={link}>{busy === 'restore' ? 'Restoring…' : 'Restore purchases'}</button>
      <div style={{ marginTop: 10 }}>
        A one-time purchase through your Apple ID, saved to this account so it also opens on the website and your other devices.{' '}
        <a href="https://eloraradiance.com/terms.html" target="_blank" rel="noopener noreferrer" style={{ color: c.link }}>Terms of Use</a>
        {' · '}
        <a href="https://eloraradiance.com/privacy.html" target="_blank" rel="noopener noreferrer" style={{ color: c.link }}>Privacy Policy</a>
      </div>
    </div>
  ) : null
  return (
    <Welcome brand={brand} session={session} purchasable={!!uid} onPrimary={buy}
      unavailableNote={uid ? null : 'Sign in or create a free account first. Your lifetime access is saved to your account, so it opens on every device.'}
      onSignIn={onShowSignIn} onSignOut={onSignOut} notice={msg || null} footer={footer} />
  )
}
