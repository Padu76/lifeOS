// Supabase Database Types for Web App
// This file is auto-generated. Do not edit manually.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Auto-generated tables will appear here
    }
    Views: {
      // Auto-generated views will appear here  
    }
    Functions: {
      // Auto-generated functions will appear here
    }
    Enums: {
      // Auto-generated enums will appear here
    }
    CompositeTypes: {
      // Auto-generated composite types will appear here
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]
export type Enums<T extends keyof Database['public']['Enums']> = 
  Database['public']['Enums'][T]
