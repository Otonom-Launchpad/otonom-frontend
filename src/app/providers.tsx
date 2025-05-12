'use client';

import React, { useEffect } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

// Important: Import Solana wallet adapter styles
// This is critical for the wallet UI to render properly
import '@solana/wallet-adapter-react-ui/styles.css';

import { CustomWalletModalProvider } from '@/components/wallet/CustomWalletModalProvider';
import { clusterApiUrl } from '@solana/web3.js';
import { initializeProgram } from '@/services/anchor-program';

export function Providers({ children }: { children: React.ReactNode }) {
  // Set network to devnet for proper blockchain integration in the hackathon
  const network = WalletAdapterNetwork.Devnet;
  
  // Get RPC URL with proper fallback to ensure reliable connection
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network);
  
  // Configure supported wallets for the best user experience
  // NOTE: Phantom is automatically included by StandardWalletAdapter
  // so we only explicitly add Solflare to avoid duplicate registration
  const wallets = [
    // Removed PhantomWalletAdapter to avoid double registration warning
    new SolflareWalletAdapter(),
  ];

  // Inner component to access wallet context for program initialization
  const WalletEffect = () => {
    const wallet = useWallet();
    useEffect(() => {
      if (wallet.connected && wallet.publicKey) {
        console.log('[Providers] Wallet connected, initializing Anchor program...');
        initializeProgram(wallet) // Pass the whole wallet context
          .then(() => {
            console.log('[Providers] Anchor program initialized successfully via Providers.');
          })
          .catch(error => {
            console.error('[Providers] Failed to initialize Anchor program via Providers:', error);
          });
      }
    }, [wallet.connected, wallet.publicKey, wallet]); // Ensure wallet object is in dependency array

    return null; // This component does not render anything itself
  };

  // Properly nest providers to ensure correct React context inheritance
  return (
    <ConnectionProvider endpoint={rpcUrl}>
      <WalletProvider wallets={wallets} autoConnect>
        <CustomWalletModalProvider>
          <WalletModalProvider>
            <WalletEffect /> {/* Add the effect component here */}
            {children}
          </WalletModalProvider>
        </CustomWalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}