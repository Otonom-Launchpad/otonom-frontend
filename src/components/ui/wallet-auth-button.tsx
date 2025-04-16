import React, { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export function WalletAuthButton() {
  const { publicKey, connected } = useWallet();
  const { user, loading, connectWallet, disconnectWallet, isAuthenticated } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (connected && publicKey && !isAuthenticated && !isAuthenticating && !loading) {
      handleAuthenticate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, publicKey, isAuthenticated]);

  // Handle authentication after wallet connection
  const handleAuthenticate = async () => {
    try {
      setIsAuthenticating(true);
      await connectWallet();
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle disconnection
  const handleDisconnect = async () => {
    await disconnectWallet();
  };

  // If wallet is connected but not authenticated with Supabase
  if (connected && !isAuthenticated) {
    return (
      <Button
        onClick={handleAuthenticate}
        disabled={isAuthenticating || loading}
        className="rounded-full bg-black text-white hover:bg-black/80"
      >
        {isAuthenticating || loading ? 'Authenticating...' : 'Authenticate Wallet'}
      </Button>
    );
  }

  // If authenticated with both wallet and Supabase
  if (connected && isAuthenticated) {
    return (
      <Button
        onClick={handleDisconnect}
        className="rounded-full bg-[#9d00ff] text-white hover:bg-[#9d00ff]/80"
      >
        {user && user.tier && user.tier > 0 ? `Tier ${user.tier} Investor` : 'Wallet Connected'}
      </Button>
    );
  }

  // Default state - show the standard wallet connection button
  return <WalletMultiButton className="rounded-full" />;
}
