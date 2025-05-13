'use client';

import React from 'react';
import { WalletAdapterNetwork, Adapter } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { CustomWalletModalProvider } from '@/components/wallet/CustomWalletModalProvider';
import { clusterApiUrl } from '@solana/web3.js';

export function Providers({ children }: { children: React.ReactNode }) {
  // Set network to devnet for proper blockchain integration in the hackathon
  const network = WalletAdapterNetwork.Devnet;
  
  // Get RPC URL with proper fallback to ensure reliable connection
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network);
  
  // Configure supported wallets for the best user experience
  // NOTE: Phantom is automatically included by StandardWalletAdapter
  // We pass an empty array now to rely solely on the standard adapters (like Phantom)
  const wallets: Adapter[] = [
    // Removed SolflareWalletAdapter()
  ];

  // Properly nest providers to ensure correct React context inheritance
  return (
    <ConnectionProvider endpoint={rpcUrl}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider> {/* Standard provider for context */}
          <CustomWalletModalProvider> {/* Our custom provider for UI */}
            {children}
          </CustomWalletModalProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}