// Durable saving for Armed & Anchored (journal, drill records, declarations, bookmarks, light mode).
//
// Before 2026-11-16 each change was sent once, one second after typing stopped, and a failure was ignored:
// closing the app within that second, losing signal or an expired sign-in silently dropped the text.
// Now every change is written to this device first (localStorage), then sent; it stays queued until the
// database confirms it, and is retried with back-off, when the connection returns, when the app comes back
// to the foreground, and on the next launch.
import { supabase } from './supabaseClient'

const ENTRY_KEY = (uid) => `aa_pending_entries_${uid}`
const PROFILE_KEY = (uid) => `aa_pending_profile_${uid}`
const read = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k) || 'null') || fallback } catch { return fallback } }
const write = (k, v) => { try { if (v && Object.keys(v).length) localStorage.setItem(k, JSON.stringify(v)); else localStorage.removeItem(k) } catch { /* private mode: memory only */ } }

let uid = null
let entries = {} // "wid__field" → row
let profile = {} // field → value
let timer = null, retryTimer = null, attempt = 0, flushing = null
const listeners = new Set()
let status = 'saved' // 'saved' | 'saving' | 'waiting' (queued; will retry)
const setStatus = (s) => { if (s !== status) { status = s; listeners.forEach((f) => f(s)) } }
export const onSaveStatus = (f) => { listeners.add(f); f(status); return () => listeners.delete(f) }
export const pendingCount = () => Object.keys(entries).length + Object.keys(profile).length

export function startSync(userId) {
  if (uid === userId) return
  uid = userId || null
  entries = uid ? read(ENTRY_KEY(uid), {}) : {}
  profile = uid ? read(PROFILE_KEY(uid), {}) : {}
  attempt = 0
  if (pendingCount()) schedule(300)
}

// Rows this device changed that the database hasn't confirmed yet (shown over what the database returns).
export const pendingEntries = () => Object.values(entries)
export const pendingProfile = () => ({ ...profile })

export function queueEntry(weaponId, fieldKey, value) {
  if (!uid) return
  entries[`${weaponId}__${fieldKey}`] = { user_id: uid, weapon_id: weaponId, field_key: fieldKey, field_value: value, updated_at: new Date().toISOString() }
  write(ENTRY_KEY(uid), entries)
  schedule(1000)
}
export function queueProfile(patch) {
  if (!uid) return
  Object.assign(profile, patch)
  write(PROFILE_KEY(uid), profile)
  schedule(400)
}

function schedule(ms) {
  clearTimeout(timer)
  timer = setTimeout(() => { flush() }, ms)
}

// Sends everything queued. Resolves true when nothing is left waiting.
export function flush() {
  if (flushing) return flushing.then(() => (pendingCount() && status !== 'waiting' ? flush() : !pendingCount()))
  clearTimeout(timer)
  if (!uid || !pendingCount()) { setStatus('saved'); return Promise.resolve(true) }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) { setStatus('waiting'); return Promise.resolve(false) }
  setStatus('saving')
  const me = uid
  const sentEntries = { ...entries }, sentProfile = { ...profile }
  flushing = (async () => {
    let ok = true
    const rows = Object.values(sentEntries)
    if (rows.length) {
      const { error } = await supabase.from('aa_weapon_entries').upsert(rows, { onConflict: 'user_id,weapon_id,field_key' })
      if (error) { ok = false; console.warn('save entries:', error.message) }
      else if (me === uid) {
        for (const [k, r] of Object.entries(sentEntries)) if (entries[k] && entries[k].updated_at === r.updated_at) delete entries[k]
        write(ENTRY_KEY(me), entries)
      }
    }
    if (Object.keys(sentProfile).length) {
      const { error } = await supabase.from('aa_profiles').update(sentProfile).eq('id', me)
      if (error) { ok = false; console.warn('save profile:', error.message) }
      else if (me === uid) {
        for (const [k, v] of Object.entries(sentProfile)) if (JSON.stringify(profile[k]) === JSON.stringify(v)) delete profile[k]
        write(PROFILE_KEY(me), profile)
      }
    }
    return ok
  })().catch((e) => { console.warn('save:', e && e.message); return false }).then((ok) => {
    flushing = null
    if (pendingCount()) {
      if (ok) { attempt = 0; schedule(300) } // more changes arrived while sending
      else { setStatus('waiting'); attempt += 1; clearTimeout(retryTimer); retryTimer = setTimeout(() => flush(), [2000, 5000, 15000, 30000, 60000][Math.min(attempt - 1, 4)]) }
    } else { attempt = 0; setStatus('saved') }
    return ok && !pendingCount()
  })
  return flushing
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { attempt = 0; flush() })
  // Leaving the app: send now (anything that doesn't make it is still on this device for next time)
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' || pendingCount()) flush() })
  window.addEventListener('pagehide', () => { flush() })
}
