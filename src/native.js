// Helpers for the iPhone/Android app build (Capacitor).
// On the website every check below is false, so the web app behaves exactly as before.
import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Preferences } from '@capacitor/preferences'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Purchases } from '@revenuecat/purchases-capacitor'
import { TextToSpeech } from '@capacitor-community/text-to-speech'
import { setNativeSpeaker } from './speech.js'

export const isNative = Capacitor.isNativePlatform()

// Read-aloud uses the phone's own speech engine in the app: Android's in-app browser has no read-aloud at all, and
// on iPhone AppDelegate sets audio to "playback" so it is heard with the Silent switch on.
if (isNative) {
  setNativeSpeaker({
    speak: ({ text, lang, rate }) => TextToSpeech.speak({ text, lang, rate, category: 'playback' }),
    stop: () => TextToSpeech.stop(),
  })
}

// The app runs from files on the phone, so shared links use the full website address.
export const WEB_ORIGIN = 'https://armed.eloraradiance.com'

// Keeps the sign-in session in the phone's native storage, which iOS never clears on its own.
export const nativeAuthStorage = {
  getItem: async (key) => (await Preferences.get({ key })).value,
  setItem: async (key, value) => { await Preferences.set({ key, value }) },
  removeItem: async (key) => { await Preferences.remove({ key }) },
}

export async function nativeShareText({ title, text, url }) {
  try { await Share.share({ title, text, url, dialogTitle: title }) } catch (e) { /* user closed the share sheet */ }
}

export async function nativeShareImage(dataUrl, fileName, title) {
  const { uri } = await Filesystem.writeFile({
    path: fileName, data: dataUrl.split(',')[1], directory: Directory.Cache,
  })
  try { await Share.share({ title, files: [uri], dialogTitle: title }) } catch (e) { /* closed */ }
}

// Several images in one share sheet (a set of share cards).
export async function nativeShareImages(dataUrls, fileNames, title) {
  const files = []
  for (let i = 0; i < dataUrls.length; i++) {
    const { uri } = await Filesystem.writeFile({ path: fileNames[i], data: dataUrls[i].split(',')[1], directory: Directory.Cache })
    files.push(uri)
  }
  try { await Share.share({ title, files, dialogTitle: title }) } catch (e) { /* closed */ }
}

export async function nativeShareFile(content, fileName, title) {
  const { uri } = await Filesystem.writeFile({
    path: fileName, data: content, directory: Directory.Cache, encoding: Encoding.UTF8,
  })
  try { await Share.share({ title, files: [uri], dialogTitle: title }) } catch (e) { /* closed */ }
}

// Light text on the dark theme, dark text on the light theme.
export function syncStatusBar(lightMode) {
  if (!isNative) return
  StatusBar.setStyle({ style: lightMode ? Style.Light : Style.Dark }).catch(() => {})
}

// ── Apple in-app purchase (RevenueCat), decided 2026-11-15 ───────────────
// Turns on by itself once REVENUECAT_IOS_KEY holds the app's public RevenueCat key (starts with "appl_"; it is
// meant to ship inside the app). Until then the App Store app shows "sign in" with no buy button, as before.
// App Store Connect: non-consumable product aa_lifetime_access (aa_lifetime was used up by a product created under the wrong app). RevenueCat: entitlement "lifetime", current offering with
// a Lifetime package. The purchase is tied to the signed-in account (RevenueCat app user id = account id), and the
// shared database is updated by the store-sync function. Setup steps: claude/in-app-purchases.md in the project.
export const REVENUECAT_IOS_KEY = import.meta.env.VITE_REVENUECAT_IOS_KEY ?? 'appl_nWGmdPGhsBjYhJjdSesrbtwzNuU'  // public key (safe to ship); a test build can override it
export const NATIVE_PURCHASES = isNative && Capacitor.getPlatform() === 'ios' && /^appl_/.test(REVENUECAT_IOS_KEY)
export const LIFETIME_ENTITLEMENT = 'lifetime'
let storeReady = null
let storeUser = null
export async function storeSignIn(userId) {
  if (!NATIVE_PURCHASES || !userId) return false
  try {
    if (!storeReady) storeReady = Purchases.configure({ apiKey: REVENUECAT_IOS_KEY, appUserID: userId }).then(() => true)
    await storeReady
    if (storeUser && storeUser !== userId) await Purchases.logIn({ appUserID: userId })
    storeUser = userId
    return true
  } catch { storeReady = null; return false }
}
export async function storeSignOut() {
  if (!NATIVE_PURCHASES || !storeReady) return
  try { await storeReady; await Purchases.logOut() } catch {} // fails for anonymous users; nothing to undo
  storeUser = null
}
const unlocked = (info) => !!info?.entitlements?.active?.[LIFETIME_ENTITLEMENT]
// The lifetime unlock with Apple's own price text for this person's country (null if the store is unreachable)
export async function storeLifetime(userId) {
  if (!(await storeSignIn(userId))) return null
  try {
    const cur = (await Purchases.getOfferings())?.current
    const pkg = cur?.lifetime || cur?.availablePackages?.find((p) => p.packageType === 'LIFETIME' || p.identifier === '$rc_lifetime') || cur?.availablePackages?.[0]
    return pkg ? { pkg, price: pkg.product?.priceString || '' } : null
  } catch { return null }
}
// 'unlocked' | 'cancelled' | 'pending' (Ask to Buy) | { error }
export async function storeBuy(userId, pkg) {
  if (!(await storeSignIn(userId))) return { error: "The App Store isn't available right now." }
  try {
    const r = await Purchases.purchasePackage({ aPackage: pkg })
    return unlocked(r?.customerInfo) ? 'unlocked' : 'pending'
  } catch (e) {
    if (e?.userCancelled || String(e?.code) === '1') return 'cancelled'   // PURCHASE_CANCELLED_ERROR
    if (String(e?.code) === '20') return 'pending'                          // PAYMENT_PENDING_ERROR (Ask to Buy)
    return { error: e?.message || "The purchase didn't go through." }
  }
}
// true when this Apple ID already owns the lifetime unlock (restored onto the signed-in account)
export async function storeRestore(userId) {
  if (!(await storeSignIn(userId))) return false
  try { return unlocked((await Purchases.restorePurchases())?.customerInfo) } catch { return false }
}
