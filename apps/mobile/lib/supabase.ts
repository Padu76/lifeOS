import { createClient } from '@supabase/supabase-js'

// Legge le variabili dal .env (Expo le espone con prefisso EXPO_PUBLIC_)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Variabili ambiente mancanti. Controlla che .env contenga EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY'
  )
}

// Client Supabase condiviso nell’app
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
