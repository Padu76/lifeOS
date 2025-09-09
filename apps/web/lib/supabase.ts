import { createClient } from '@supabase/supabase-js'

// Legge le variabili dal .env.local (Next.js le espone con prefisso NEXT_PUBLIC_)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Variabili ambiente mancanti. Controlla che .env.local contenga NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

// Client Supabase condiviso nell'app
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper per chiamare Edge Functions con gestione errori
export const callEdgeFunction = async (functionName: string, payload?: any) => {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload
    })
    
    if (error) {
      console.error(`Edge Function ${functionName} error:`, error)
      throw error
    }
    
    return data
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error)
    throw error
  }
}

// Helper per ottenere utente corrente
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  return user
}

// Helper per controllare se utente è autenticato
export const isAuthenticated = async () => {
  const user = await getCurrentUser()
  return !!user
}