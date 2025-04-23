/**
 * Specialized Anchor Program Integration for Hackathon
 * 
 * This module provides a reliable way to connect to Solana programs
 * using Anchor in a hackathon environment without type generation.
 */

import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import type { WalletContextState } from '@solana/wallet-adapter-react';
import { PROGRAM_ID } from '@/lib/solana-config';
import idlData from '../lib/ofund-idl.json';

// Connection configuration
const COMMITMENT: anchor.web3.Commitment = 'confirmed';

/**
 * Create a wallet adapter that Anchor can use
 */
export const createAnchorWalletAdapter = (wallet: WalletContextState) => {
  if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
    throw new Error('Wallet missing required methods');
  }
  
  return {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction,
    signAllTransactions: wallet.signAllTransactions,
  };
};

/**
 * Get a connection to the Solana network
 */
export const getSolanaConnection = () => {
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  return new Connection(rpcUrl, COMMITMENT);
};

/**
 * Initialize program for interacting with our smart contract
 * This function creates the necessary connections to interact with the Solana blockchain
 * 
 * We're deliberately using the local IDL file instead of fetching from chain,
 * as the on-chain IDL may not be uploaded correctly yet
 */
export const initializeProgram = (wallet: WalletContextState) => {
  try {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const connection = getSolanaConnection();
    const provider = new anchor.AnchorProvider(connection, createAnchorWalletAdapter(wallet), {
      commitment: COMMITMENT,
      preflightCommitment: COMMITMENT,
    });

    // Use the imported IDL directly
    const program = new anchor.Program(idlData as any, PROGRAM_ID, provider);

    console.log('Available program methods:', Object.keys(program.methods));
    return program;
  } catch (error) {
    console.error('Failed to initialize program:', error);
    throw error;
  }
};

/**
 * Find PDA for user profile
 * @returns An object containing both the PDA and the bump seed
 */
export const findUserProfilePDA = async (userWallet: PublicKey) => {
  const [pda, bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from('user_profile'),
      userWallet.toBuffer()
    ],
    PROGRAM_ID
  );
  
  return { pda, bump };
};
