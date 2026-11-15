// Shared database (Year 1, Year 2, Armed & Anchored, Red Letters) — Apple in-app purchases through RevenueCat.
// Deployed to the shared Supabase project as `store-sync`. Armed & Anchored is the first app using it.
//
// Two callers, one rule: never trust what the caller says; re-read the buyer's state from RevenueCat and save it.
//   • RevenueCat webhook: POST …/store-sync?app=aa with { event: { app_user_id, original_app_user_id, aliases,
//     transferred_from, transferred_to, … } }. If app_secrets has `revenuecat_<app>_webhook_auth`, the request's
//     Authorization header must equal it.
//   • The App Store app, after a purchase or restore and when it opens: POST { action: 'sync', app: 'aa' } with
//     the person's Bearer token (only their own account is checked).
// The RevenueCat secret API key for each app lives in app_secrets as `revenuecat_<app>_secret_key`.
// Until it exists the function answers 503 and changes nothing.
import { createClient } from 'npm:@supabase/supabase-js@2.45.4'

const APPS: Record<string, { entitlement: string }> = {
  aa: { entitlement: 'lifetime' }, // Armed & Anchored: one-time lifetime unlock
}
const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
const secret = async (name: string) => ((await sb.from('app_secrets').select('value').eq('name', name).maybeSingle()).data?.value as string | undefined) || null

type Ent = { expires_date?: string | null; product_identifier?: string }
type NonSub = { id?: string; store_transaction_id?: string; is_sandbox?: boolean; purchase_date?: string }

export function entitlementState(subscriber: { entitlements?: Record<string, Ent>; non_subscriptions?: Record<string, NonSub[]>; subscriptions?: Record<string, { is_sandbox?: boolean }> }, entitlement: string, now = Date.now()) {
  const ent = subscriber?.entitlements?.[entitlement]
  if (!ent) return { active: false, product_id: null, transaction_id: null, is_sandbox: null, expires_at: null }
  const exp = ent.expires_date ? Date.parse(ent.expires_date) : null
  const product = ent.product_identifier || null
  const buys = (product && subscriber.non_subscriptions?.[product]) || []
  const last = buys[buys.length - 1]
  const sandbox = last?.is_sandbox ?? (product ? subscriber.subscriptions?.[product]?.is_sandbox : undefined) ?? null
  return {
    active: exp === null || exp > now,
    product_id: product,
    transaction_id: last?.store_transaction_id || last?.id || null,
    is_sandbox: sandbox,
    expires_at: exp === null ? null : new Date(exp).toISOString(),
  }
}

async function syncUser(app: string, userId: string, apiKey: string) {
  if (!UUID.test(userId)) return { userId, skipped: 'not an account id' }
  const { data: who } = await sb.auth.admin.getUserById(userId)
  if (!who?.user) return { userId, skipped: 'no such account' }
  const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'X-Platform': 'ios' },
  })
  if (!res.ok) throw new Error(`RevenueCat ${res.status}`)
  const state = entitlementState((await res.json()).subscriber || {}, APPS[app].entitlement)
  const { data: existing } = await sb.from('app_store_entitlements').select('active').eq('user_id', userId).eq('app', app).maybeSingle()
  // Someone who never bought in the app gets no row and nothing changes
  if (!state.product_id && !existing) return { userId, active: false }
  const { error } = await sb.from('app_store_entitlements').upsert({ user_id: userId, app, ...state, checked_at: new Date().toISOString() }, { onConflict: 'user_id,app' })
  if (error) throw error
  if (app === 'aa') {
    const { error: e2 } = await sb.rpc('aa_apply_store_entitlement', {
      p_user: userId, p_active: state.active, p_was_active: !!existing?.active, p_tx: state.transaction_id, p_sandbox: state.is_sandbox,
    })
    if (e2) throw e2
  }
  return { userId, active: state.active }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405)
  try {
    const body = await req.json().catch(() => ({})) as { action?: string; app?: string; event?: Record<string, unknown> }
    const app = String(body.app || new URL(req.url).searchParams.get('app') || '')
    if (!APPS[app]) return json({ error: 'unknown app' }, 400)
    const apiKey = await secret(`revenuecat_${app}_secret_key`)
    if (!apiKey) return json({ ok: false, error: 'In-app purchases are not set up yet' }, 503)

    if (body.action === 'sync') {
      const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
      const { data: u } = await sb.auth.getUser(token)
      if (!u?.user) return json({ error: 'Sign in required' }, 401)
      return json({ ok: true, ...(await syncUser(app, u.user.id, apiKey)) })
    }

    // RevenueCat webhook
    const auth = await secret(`revenuecat_${app}_webhook_auth`)
    if (auth && req.headers.get('Authorization') !== auth) return json({ error: 'unauthorized' }, 401)
    const ev = body.event || {}
    const ids = new Set<string>()
    for (const v of [ev.app_user_id, ev.original_app_user_id, ...[].concat((ev.aliases as string[]) || []), ...[].concat((ev.transferred_from as string[]) || []), ...[].concat((ev.transferred_to as string[]) || [])]) {
      if (typeof v === 'string' && UUID.test(v)) ids.add(v)
    }
    const results = []
    for (const id of ids) results.push(await syncUser(app, id, apiKey))
    return json({ ok: true, type: ev.type || null, results })
  } catch (err) {
    console.error('store-sync', (err as Error).message)
    return json({ ok: false, error: (err as Error).message }, 500)   // RevenueCat retries later
  }
})
