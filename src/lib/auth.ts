import { PublicKey } from '@solana/web3.js';
import { supabase, safeSupabase } from './supabase';

/**
 * Create or get a user account based on wallet address
 */
export const signInWithWallet = async (walletAddress: string): Promise<{
  user: any | null;
  error: string | null;
}> => {
  try {
    // For simplicity in the MVP, we'll use a standard password derived from the wallet address
    // In a production environment, we would use proper cryptographic signatures
    const simplifiedPassword = `${walletAddress.slice(0, 10)}${walletAddress.slice(-10)}`;
    
    // Try to sign in first
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: `${walletAddress}@otonom.fund`,
      password: simplifiedPassword,
    });
    
    // If login successful, return the user
    if (signInData?.user) {
      return { user: signInData.user, error: null };
    }
    
    // If user doesn't exist, create a new account
    if (signInError && signInError.message.includes('Invalid login credentials')) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: `${walletAddress}@otonom.fund`,
        password: simplifiedPassword,
      });
      
      if (signUpError) {
        return { user: null, error: `Sign up error: ${signUpError.message}` };
      }
      
      // Create a user record in our users table
      const { error: userError } = await supabase.from('users').insert({
        id: signUpData.user?.id,
        wallet_address: walletAddress,
        tier: 0, // Default tier
        ofund_balance: 0, // Default balance
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      if (userError) {
        return { user: null, error: `User creation error: ${userError.message}` };
      }
      
      return { user: signUpData.user, error: null };
    }
    
    // Some other error occurred during sign in
    return { user: null, error: signInError ? signInError.message : 'Unknown error' };
  } catch (error) {
    console.error('Error signing in with wallet:', error);
    return { user: null, error: `Unexpected error: ${(error as Error).message}` };
  }
};

/**
 * Get the current user from Supabase Auth
 */
export const getCurrentUser = async () => {
  // Use the safe wrapper that handles AuthSessionMissingError gracefully
  const { data, error } = await safeSupabase.auth.getUser();
  
  if (error) {
    // Suppress the noisy AuthSessionMissingError except in development
    const isAuthSessionMissing =
      error instanceof Error && error.message.includes('Auth session missing');

    if (!isAuthSessionMissing || process.env.NODE_ENV === 'development') {
      console.warn('Error getting current user:', error);
    }
    return null;
  }
  
  return data.user;
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<{ error: string | null }> => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    return { error: error.message };
  }
  
  return { error: null };
};
