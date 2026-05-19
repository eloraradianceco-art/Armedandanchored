// api/verify-payment.js
// Verifies a Stripe checkout session and marks the user as paid in Supabase

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

    // If we have a user_id, mark them as paid in Supabase
    if (user_id) {
      await supabase
        .from('profiles')
        .update({
          paid: true,
          paid_at: new Date().toISOString(),
          stripe_session_id: session_id,
        })
        .eq('id', user_id)
    }

    return res.status(200).json({ paid: true, email: session.customer_details?.email })

  } catch (err) {
    console.error('Stripe verification error:', err.message)
    return res.status(400).json({ error: 'Invalid or expired session' })
  }
}
