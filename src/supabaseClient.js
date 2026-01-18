import { createClient } from '@supabase/supabase-js'

// Read the environment variables (from your .env file)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Safety check: fail immediately if env variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Make sure .env is set correctly.')
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
