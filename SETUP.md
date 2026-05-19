# Armed & Anchored — Setup Guide

## Step 1: Supabase

1. Create a new project at supabase.com
2. Go to **SQL Editor** → paste the entire contents of `supabase/schema.sql` → click **Run**
3. Go to **Settings → API** and copy:
   - Project URL
   - anon/public key
   - service_role key (keep this secret)

## Step 2: Environment Variables

1. Copy `.env.local.example` → rename to `.env.local`
2. Fill in your Supabase URL, anon key, service role key
3. Fill in your Stripe secret key

## Step 3: Install & Run Locally

```bash
npm install
npm run dev
```

## Step 4: Push to GitHub

```bash
git init
git add .
git commit -m "Armed & Anchored initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/armed-anchored.git
git push -u origin main
```

## Step 5: Deploy to Vercel

1. Go to vercel.com → New Project → Import your GitHub repo
2. Add all environment variables from `.env.local` to Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy

## Step 6: Update Stripe Payment Link

1. Go to your Stripe payment link settings
2. Set **After payment → Redirect** to:
   `https://YOUR-VERCEL-URL.vercel.app?session_id={CHECKOUT_SESSION_ID}`
3. Save

## Step 7: Supabase Auth Settings

1. Supabase → Authentication → URL Configuration
2. Set **Site URL** to your Vercel URL
3. Add your Vercel URL to **Redirect URLs**

---

## Flow Summary

```
User visits app
  → Not paid? → Paywall → Stripe checkout
  → Returns with ?session_id=xxx
  → Create account (email + password)
  → Payment verified → profile.paid = true
  → Onboarding walkthrough
  → Full app — all entries saved to Supabase
```

## Files Overview

```
src/
  main.jsx              Entry point
  App.jsx               Auth routing logic
  supabaseClient.js     Supabase singleton
  ArmedAndAnchored.jsx  Main app
  components/
    Paywall.jsx         Payment screen
    Auth.jsx            Sign in / sign up
    Onboarding.jsx      7-slide feature walkthrough
    ShareCard.jsx       Canvas quote card generator
api/
  verify-payment.js     Vercel function — Stripe + Supabase
supabase/
  schema.sql            Run this in Supabase SQL editor
```
