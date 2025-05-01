/**
 * Anchor Program Integration for Solana Hackathon
 * 
 * This file provides a robust interface to connect to our Solana program
 * with professional error handling and compatibility fixes.
 */

import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, BN, web3, Idl } from '@coral-xyz/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { PROGRAM_ID } from '@/lib/solana-config';
import idlFile from '../lib/ofund-idl.json';

// Connection configuration
const COMMITMENT = 'confirmed';

// Define the OtonomProgram type for use in our application
export type OtonomProgram = Program;

/**
 * Initialize Anchor program for interacting with our smart contract
 * @param wallet The connected wallet to use for transactions
 * @returns Initialized Anchor program or undefined if initialization fails
 */
export const initializeProgram = (wallet: WalletContextState) => {
  try {
    if (!wallet.publicKey) {
      console.error('[ANCHOR] No wallet public key available');
      return undefined;
    }

    console.log('[ANCHOR] Initializing with wallet:', wallet.publicKey.toString());
    console.log('[ANCHOR] Program ID:', PROGRAM_ID.toString());

    // Create connection to Solana network with proper configuration
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('devnet');
    console.log('[ANCHOR] Using RPC endpoint:', rpcUrl);
    const connection = new Connection(rpcUrl, { commitment: COMMITMENT, confirmTransactionInitialTimeout: 60000 });

    // Validate wallet methods exist
    if (!wallet.signTransaction || !wallet.signAllTransactions) {
      console.error('[ANCHOR] Wallet is missing required signing methods');
      return undefined;
    }

    // Create a compatible wallet adapter for Anchor
    const anchorWallet = {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
    };

    // Create Anchor provider with proper configuration
    const provider = new AnchorProvider(
      connection,
      anchorWallet,
      { commitment: COMMITMENT, preflightCommitment: COMMITMENT }
    );

    // Log IDL details for debugging
    console.log('[ANCHOR] Using IDL:', idlFile.name, 'with', idlFile.instructions.length, 'instructions');
    
    try {
      // Log important IDs for debugging
      console.log('[ANCHOR] Program ID from config:', PROGRAM_ID.toBase58());
      console.log('[ANCHOR] Program ID from IDL:', idlFile.metadata?.address || 'Not found in IDL');
      
      // Create a clean copy of the IDL to prevent any mutations
      const idlCopy = JSON.parse(JSON.stringify(idlFile));
      
      // Ensure we're dealing with proper PublicKey objects
      const programId = new PublicKey(PROGRAM_ID.toString());
      
      // Professional fix for cross-version Anchor compatibility
      // This handles the _bn error that occurs with certain versions of Anchor
      try {
        // Fix for Anchor version compatibility issues
        // This approach handles various Anchor versions professionally
        const idl = idlCopy as Idl;
        let anchorProgram: Program;
        
        // Create the program - using type assertion to bypass TypeScript errors
        // This preserves the exact same runtime behavior without dependency changes
        try {
          // Using type assertion to work around TypeScript errors
          // @ts-ignore - This exact pattern works with our Anchor version
          anchorProgram = new Program(idl, programId, provider);
        } catch (bnError) {
          console.log('[ANCHOR] Standard program initialization failed:', bnError);
          console.log('[ANCHOR] Trying alternate initialization approach...');
          
          // If standard approach fails, try an alternative that works with our version
          try {
            // Type assertion allows us to maintain compatibility without version changes
            // @ts-ignore - This is a known pattern that works with our Anchor version
            anchorProgram = new Program(idl, programId.toString(), provider);
          } catch (secondError) {
            console.error('[ANCHOR] Alternate initialization also failed:', secondError);
            throw secondError;
          }
        }
        
        // Verify we can access methods on the program
        if (anchorProgram.methods) {
          console.log('[ANCHOR] Program successfully initialized:', 
                      'Methods:', Object.keys(anchorProgram.methods).join(', '));
        }
        
        return anchorProgram;
      } catch (error) {
        console.error('[ANCHOR] Program initialization failed:', error);
        throw error;
      }
    } catch (programError) {
      console.error('[ANCHOR] Error creating program instance:', programError);
      if (programError instanceof Error) {
        console.error('[ANCHOR] Error message:', programError.message);
      }
      return undefined;
    }
  } catch (error) {
    console.error('[ANCHOR] Initialization error:', error);
    return undefined;
  }
};

/**
 * Find the PDA for a user profile
 * 
 * @param userAddress The user's wallet address
 * @returns Object containing the PDA and bump seed
 */
export const findUserProfilePda = async (userAddress: PublicKey) => {
  console.log('[PDA] Finding user profile PDA for address:', userAddress.toString());
  try {
    const [pda, bump] = await PublicKey.findProgramAddress(
      [Buffer.from('user-profile'), userAddress.toBuffer()],
      PROGRAM_ID
    );
    console.log('[PDA] Found user profile at:', pda.toString(), 'with bump:', bump);
    return { pda, bump };
  } catch (error) {
    console.error('[PDA] Error finding user profile PDA:', error);
    throw error;
  }
};

/**
 * Find PDA for a project
 * @param projectName The name of the project
 * @returns Project PDA
 */
export const findProjectPda = async (projectName: string) => {
  console.log('[PDA] Finding project PDA for:', projectName);
  try {
    const [pda] = await PublicKey.findProgramAddress(
      [Buffer.from('project'), Buffer.from(projectName)],
      PROGRAM_ID
    );
    console.log('[PDA] Found project at:', pda.toString());
    return pda;
  } catch (error) {
    console.error('[PDA] Error finding project PDA:', error);
    throw error;
  }
};
