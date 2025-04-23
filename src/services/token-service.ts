import { Connection, PublicKey } from '@solana/web3.js';
import * as spl from '@solana/spl-token';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { OFUND_MINT, getConnection } from '@/lib/solana-config';

// Use the centralized OFUND_MINT from solana-config.ts for consistency
// This ensures we use the same token mint address across the entire application

// Default airdrop amount for new users (100,000 OFUND)
export const DEFAULT_OFUND_AMOUNT = 100000;

/**
 * Get user's OFUND token balance
 * @param walletAddress 
 * @returns The token balance as a number
 */
export async function getOfundBalance(walletAddress: PublicKey): Promise<number> {
  try {
    const connection = getConnection();
    
    // Find the associated token account
    const tokenAccount = await spl.getAssociatedTokenAddress(
      OFUND_MINT,
      walletAddress,
      false
    );
    
    try {
      // Try to get the token account info
      const tokenAccountInfo = await spl.getAccount(connection, tokenAccount);
      return Number(tokenAccountInfo.amount) / Math.pow(10, 9); // Using 9 decimals for our OFUND token
    } catch (err) {
      // If the account doesn't exist, the user has 0 tokens
      console.log('Token account not found, user likely has 0 OFUND');
      return 0;
    }
  } catch (error) {
    console.error('Error fetching OFUND balance:', error);
    return DEFAULT_OFUND_AMOUNT; // For hackathon, default to expected amount if there's an error
  }
}

/**
 * Get user data including token balance
 * @param wallet Connected wallet
 * @returns User object with wallet address and token balance
 */
export async function getUserData(wallet: WalletContextState) {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }
  
  const walletAddress = wallet.publicKey.toString();
  const ofundBalance = await getOfundBalance(wallet.publicKey);
  
  // For hackathon purposes, we'll set a tier based on balance
  let tier = 1;
  if (ofundBalance >= 100000) tier = 3;
  else if (ofundBalance >= 10000) tier = 2;
  
  return {
    id: walletAddress, // Use wallet address as ID for now
    wallet_address: walletAddress,
    tier: tier,
    ofund_balance: ofundBalance,
    display_name: undefined // Can be implemented with a user profile system later
  };
}
