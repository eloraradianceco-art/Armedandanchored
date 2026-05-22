import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  const { session_id, user_id } = req.query

  if (!session_id) return res.status(400).json({ error: 'Missing session_id' })

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' })
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id)

    if (session.payment_status !== 'paid') {
      return res.status(200).json({ paid: false, status: session.payment_status })
    }

    const stripeEmail = session.customer_details?.email
    const now = new Date().toISOString()

    // ── Update by user_id if provided (most reliable) ──────────────────
    if (user_id) {
      await supabase.from('profiles').upsert({
        id: user_id,
        paid: true,
        paid_at: now,
        stripe_session_id: session_id,
      }, { onConflict: 'id' })
    }

    // ── Also match by Stripe email as fallback ─────────────────────────
    if (stripeEmail) {
      const { data: authData } = await supabase.auth.admin.listUsers()
      const matchedUser = authData?.users?.find(u =>
        u.email?.toLowerCase() === stripeEmail.toLowerCase()
      )
      if (matchedUser && matchedUser.id !== user_id) {
        await supabase.from('profiles').upsert({
          id: matchedUser.id,
          paid: true,
          paid_at: now,
          stripe_session_id: session_id,
        }, { onConflict: 'id' })
      }
    }

    return res.status(200).json({ paid: true, email: stripeEmail })

  } catch (err) {
    console.error('Stripe verification error:', err.message)
    return res.status(400).json({ error: 'Invalid or expired session', detail: err.message })
  }
}
