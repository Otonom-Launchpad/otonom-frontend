import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { signInWithWallet, signOut, getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface AuthUser {
  id: string;
  wallet_address: string;
  tier: number;
  ofund_balance: number;
  display_name?: string;
}

export function useAuth() {
  const wallet = useWallet();
  const { publicKey, connected } = wallet;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Load user on mount or when wallet changes
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if user is authenticated with Supabase
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
          return;
        }
        
        // Get user profile from our users table
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single();
          
        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }
        
        setUser(data as AuthUser);
      } catch (err) {
        console.error('Failed to load user:', err);
      }
    };
    
    loadUser();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // Load user profile when signed in
        supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('Error fetching user profile:', error);
              return;
            }
            
            setUser(data as AuthUser);
          });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Connect wallet and authenticate
  const connectWallet = useCallback(async () => {
    if (!publicKey) {
      setError('Wallet not connected');
      return { success: false };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Log the connection attempt for debugging
      console.log('Connecting wallet:', publicKey.toString());
      
      // Sign in or sign up with Supabase using wallet address only
      const { user: authUser, error: authError } = await signInWithWallet(
        publicKey.toString()
      );
      
      if (authError) {
        console.error('Auth error:', authError);
        setError(authError);
        return { success: false };
      }
      
      // Fetch user profile
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser?.id)
        .single();
        
      if (error) {
        console.error('Error fetching user profile:', error);
        setError(`Error fetching user profile: ${error.message}`);
        return { success: false };
      }
      
      // Apply default tier and balance for testing if not set
      let userData = data as AuthUser;
      
      // For hackathon demo, set default tier and balance if not set
      if (!userData.tier) {
        // Update user with default values for hackathon demo
        const { error: updateError } = await supabase
          .from('users')
          .update({
            tier: 1, // Default to Tier 1 for testing
            ofund_balance: 1500, // Give some tokens for testing
            updated_at: new Date().toISOString()
          })
          .eq('id', authUser?.id);
          
        if (updateError) {
          console.warn('Could not set default values:', updateError);
        } else {
          // Update local data
          userData.tier = 1;
          userData.ofund_balance = 1500;
        }
      }
      
      setUser(userData);
      return { success: true };
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(`Connection error: ${(err as Error).message}`);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  // Disconnect wallet and sign out
  const disconnectWallet = useCallback(async () => {
    try {
      setLoading(true);

      // Disconnect the wallet adapter session first
      await wallet.disconnect();

      const { error: signOutError } = await signOut();

      if (signOutError) {
        setError(signOutError);
        return;
      }

      setUser(null);
    } catch (err) {
      setError(`Sign out error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  return {
    user,
    loading,
    error,
    connected,
    connectWallet,
    disconnectWallet,
    isAuthenticated: !!user,
  };
}
