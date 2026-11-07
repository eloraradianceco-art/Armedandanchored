import { createClient } from '@supabase/supabase-js'
import { isNative, nativeAuthStorage } from './native'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  isNative
    ? { auth: { storage: nativeAuthStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }
    : undefined
)
