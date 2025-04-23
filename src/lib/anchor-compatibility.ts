/**
 * Anchor Compatibility Layer
 * 
 * This module provides version-compatible initialization for Anchor programs
 * to handle differences between frontend (0.31.1) and contract (0.29.0) versions.
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, BN, Program, web3 } from '@coral-xyz/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';
import idlFile from './ofund-idl.json';

/**
 * Creates a compatible Anchor program instance by handling version differences
 * between the frontend and contract
 */
export function createCompatibleProgram(
  programId: PublicKey,
  wallet: WalletContextState,
  connection: Connection
): Program | undefined {
  try {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      console.error('[ANCHOR] Wallet not connected or missing required methods');
      return undefined;
    }

    // Create compatible wallet adapter
    const anchorWallet = {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
    };

    // Create provider
    const provider = new AnchorProvider(
      connection,
      anchorWallet,
      { commitment: 'confirmed', preflightCommitment: 'confirmed' }
    );

    // Log details for debugging
    console.log('[ANCHOR] Using program ID:', programId.toBase58());
    console.log('[ANCHOR] IDL program ID:', idlFile.metadata?.address || 'Not found in IDL');
    
    // Handle IDL compatibility checks
    const idl = {...idlFile};
    
    // Ensure metadata has correct program ID
    if (!idl.metadata) {
      idl.metadata = { address: programId.toBase58() };
    } else if (idl.metadata.address !== programId.toBase58()) {
      console.warn('[ANCHOR] IDL program ID differs from provided program ID, updating...');
      idl.metadata.address = programId.toBase58();
    }
    
    // The key fix for "_bn" error: force the ProgramId to be compatible in both versions
    let program: Program;
    
    try {
      // Use type assertion to help TypeScript understand our Program constructor
      const AnchorProgram = Program as any;
      program = new AnchorProgram(idl, programId, provider);
    } catch (error) {
      console.warn('[ANCHOR] Standard initialization failed, trying fallback method:', error);
      
      // Fallback to a more compatible initialization
      // TypeScript needs help understanding the constructor parameters may vary between versions
      const AnchorProgram = Program as any;
      program = new AnchorProgram(idl, programId.toString(), provider);
    }
    
    // Additional validation
    if (!program || typeof program.methods !== 'object') {
      throw new Error('Program created but methods object is not available');
    }
    
    console.log('[ANCHOR] Successfully initialized program with methods:', 
      Object.keys(program.methods));
    
    return program;
  } catch (error) {
    console.error('[ANCHOR] Failed to create compatible program:', error);
    if (error instanceof Error) {
      console.error('[ANCHOR] Error details:', error.message);
      console.error('[ANCHOR] Stack trace:', error.stack);
    }
    return undefined;
  }
}

/**
 * Helper for safely working with BN values across Anchor versions
 */
export function createSafeBN(value: number | string | bigint): BN {
  // Ensure we're handling numbers in a way compatible with both Anchor versions
  if (typeof value === 'number') {
    // Convert to string to prevent precision loss for large numbers
    return new BN(value.toString());
  } else if (typeof value === 'bigint') {
    return new BN(value.toString());
  }
  return new BN(value);
}
