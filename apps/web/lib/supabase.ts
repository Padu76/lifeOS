import { createClient } from '@supabase/supabase-js'

// Legge le variabili dal .env.local (Next.js le espone con prefisso NEXT_PUBLIC_)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'âŒ Variabili ambiente mancanti. Controlla che .env.local contenga NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY'
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

// Helper per chiamare Edge Functions con gestione errori e autenticazione
export const callEdgeFunction = async (functionName: string, payload?: any) => {
  try {
    console.log(`Calling Edge Function: ${functionName}`)
    
    // Ottieni la sessione corrente per il token di autenticazione
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Error getting session:', sessionError)
      throw new Error('Authentication required')
    }
    
    if (!session) {
      throw new Error('User not authenticated')
    }
    
    console.log('Session found, making authenticated call...')
    
    // Chiama la Edge Function con header di autenticazione esplicito
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (error) {
      console.error(`Edge Function ${functionName} error:`, error)
      throw error
    }
    
    console.log(`Edge Function ${functionName} success:`, data)
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