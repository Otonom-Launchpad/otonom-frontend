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
      // `metadata` is not part of the generated IDL type. Cast to `any` to access it safely.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.log('[ANCHOR] Program ID from IDL:', (idlFile as any).metadata?.address || 'Not found in IDL');
      
      // Create a clean copy of the IDL to prevent any mutations
      const idlCopy = JSON.parse(JSON.stringify(idlFile));
      
      // Ensure we're dealing with proper PublicKey objects
      const programId = new PublicKey(PROGRAM_ID.toString());

      // ------------------------------------------------------------------
      // Anchor v0.31+ expects `idl.metadata.address` to be present so that
      // it can verify the IDL belongs to the given program. If it is
      // missing (common when the IDL is generated with `anchor idl
      // init` older than v0.25), the constructor attempts to translate an
      // `undefined` value into a `PublicKey`, leading to the notorious
      // "cannot read properties of undefined (reading '_bn')" error.
      // We patch the IDL at runtime by injecting the program ID.
      // ------------------------------------------------------------------
      if (!idlCopy.metadata) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - we are adding the missing field dynamically
        idlCopy.metadata = {};
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - metadata is loosely typed
      idlCopy.metadata.address = programId.toBase58();

      // Create the program – now safe because the IDL is patched
      // @ts-ignore – generic type param not critical for runtime
      const anchorProgram = new Program(idlCopy as Idl, programId, provider);
      
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
