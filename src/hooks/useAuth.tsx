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
  const { publicKey, connected } = useWallet();
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
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Sign in or sign up with Supabase using wallet address only
      const { user: authUser, error: authError } = await signInWithWallet(
        publicKey.toString()
      );
      
      if (authError) {
        setError(authError);
        return;
      }
      
      // Fetch user profile
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser?.id)
        .single();
        
      if (error) {
        setError(`Error fetching user profile: ${error.message}`);
        return;
      }
      
      setUser(data as AuthUser);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(`Connection error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  // Disconnect wallet and sign out
  const disconnectWallet = useCallback(async () => {
    try {
      setLoading(true);
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
  }, []);

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
