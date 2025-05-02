import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Create the base client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Wrapper to handle common Supabase errors gracefully, especially during SSR
 */
export const safeSupabase = {
  auth: {
    /**
     * Get the current user with error handling for missing auth session
     * @returns The current user or null if not authenticated or error occurs
     */
    getUser: async () => {
      try {
        return await supabase.auth.getUser();
      } catch (error) {
        // Handle the AuthSessionMissingError gracefully - expected during SSR
        if (error instanceof Error && error.message.includes('Auth session missing')) {
          // This is normal during SSR, so don't log it as an error
          return { data: { user: null }, error: null };
        }
        console.error('Unexpected Supabase error:', error);
        return { data: { user: null }, error };
      }
    },
    
    // Export the rest of supabase.auth methods directly
    signUp: supabase.auth.signUp.bind(supabase.auth),
    signInWithPassword: supabase.auth.signInWithPassword.bind(supabase.auth),
    signOut: supabase.auth.signOut.bind(supabase.auth),
    onAuthStateChange: supabase.auth.onAuthStateChange.bind(supabase.auth),
  },
  
  // Export the rest of supabase methods directly
  from: supabase.from.bind(supabase),
  storage: supabase.storage,
  rpc: supabase.rpc.bind(supabase),
};

// Also export the original client for advanced usage if needed
export { supabase };