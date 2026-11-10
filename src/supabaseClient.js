import { createClient } from '@supabase/supabase-js'

// Shared Elora Radiance database: Armed & Anchored, Anchored Steps Year 1 and Year 2
// use one sign-in. These are the public values every browser receives (not secrets).
// The old Armed & Anchored database settings in Vercel are no longer used.
export const SUPABASE_URL = 'https://cvtukqamaqrhjtdvmslb.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2dHVrcWFtYXFyaGp0ZHZtc2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NDU1MjQsImV4cCI6MjA5MTQyMTUyNH0.gSksF5jV-UpuaUL7x7vhHHOB6Z7Qq0iehtbc2PoSAxw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
