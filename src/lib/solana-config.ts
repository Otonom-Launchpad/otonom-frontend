import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { AnchorProvider, BN, Idl, Program } from '@coral-xyz/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';

// Import the IDL from the JSON file
// This ensures we use the exact structure that matches our deployed program
import idlFile from './ofund-idl.json';

// Configuration constants
export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
// Updated program ID from the freshly deployed contract
export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_OFUND_PROGRAM_ID || 'GAeLTwzvybwxaELbJrPcbjWBaNY5QLHurxXdoPN7jH6D'
);
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
// For hackathon: We're reusing a pre-created OFUND token on devnet for simplicity
export const TOKEN_MINT_ADDRESS = new PublicKey(
  process.env.NEXT_PUBLIC_OFUND_TOKEN_MINT || '9ct1toUJGsCzq3Ty9fZK9LRdCkQhSDaUPgqY9KQnsFm5'
);

// Get connection based on environment
export const getConnection = () => {
  return new Connection(
    SOLANA_NETWORK === 'devnet' 
      ? clusterApiUrl('devnet') 
      : SOLANA_NETWORK === 'mainnet-beta' 
        ? clusterApiUrl('mainnet-beta') 
        : 'http://localhost:8899',
    'confirmed'
  );
};

/**
 * Creates an AnchorProvider from a WalletContextState
 * @param wallet WalletContextState from @solana/wallet-adapter-react
 * @returns AnchorProvider instance for use with Anchor programs
 */
export const getProvider = (wallet: WalletContextState) => {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected or missing required methods');
  }
  
  // Create an adapter that works with Anchor's expected interface
  // Ensure all required methods are present - this is critical for compatibility
  if (!wallet.signAllTransactions) {
    throw new Error('Wallet does not support signAllTransactions');
  }
  
  const walletAdapter = {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction,
    signAllTransactions: wallet.signAllTransactions,
    // signMessage is optional for Anchor
    signMessage: wallet.signMessage
  };
  
  const connection = getConnection();
  return new AnchorProvider(
    connection,
    walletAdapter,
    AnchorProvider.defaultOptions()
  );
};

/**
 * Initialize the Anchor program
 * 
 * This function creates a properly configured Anchor Program instance
 * that can interact with our deployed Solana smart contract.
 * 
 * @param wallet Connected wallet context
 * @returns Initialized program instance for on-chain interactions
 */
export const initializeProgram = (wallet: WalletContextState): OtonomProgram | undefined => {
  try {
    // Verify wallet connection
    if (!wallet.publicKey) {
      console.error('Wallet not connected - cannot initialize program');
      return undefined;
    }

    // Create an optimized connection to the Solana network
    // with appropriate commitment level for transaction confirmation
    const connection = new Connection(
      SOLANA_NETWORK === 'devnet' ? clusterApiUrl('devnet') : 'http://localhost:8899',
      'confirmed'
    );

    // Create a proper Anchor provider with the wallet and connection
    // This is the interface that Anchor uses to communicate with the blockchain
    const provider = new AnchorProvider(
      connection,
      wallet as any, // Type assertion needed for wallet adapter compatibility
      {
        // Configuration to ensure reliable transactions
        skipPreflight: false, // Run preflight checks for better error reporting
        commitment: 'confirmed',
        preflightCommitment: 'processed',
      }
    );

    // Log important configuration for debugging
    console.log(`Initializing Solana program with:`);
    console.log(`- Program ID: ${PROGRAM_ID.toString()}`); 
    console.log(`- Network: ${SOLANA_NETWORK}`); 
    console.log(`- Token Mint: ${TOKEN_MINT_ADDRESS.toString()}`); 
    console.log(`- Wallet: ${wallet.publicKey.toString()}`); 

    // Initialize the program with local IDL
    // We explicitly avoid fetching from chain since the IDL is not uploaded yet
    // (as seen in the error "reading 'accounts' of undefined")
    const program = new Program(
      idl as any,  // Using 'any' to bypass TypeScript issues
      PROGRAM_ID, 
      provider
    );
    
    // Log available methods to help with debugging
    console.log('Program initialized with methods:', Object.keys(program.methods || {}).join(', '));
    
    // Verify program is properly initialized
    if (!program || !program.programId) {
      throw new Error('Program initialization failed - invalid program instance');
    }
    
    console.log('Program successfully initialized and ready for blockchain interactions');
    return program;
  } catch (error) {
    // Comprehensive error handling
    console.error('Error initializing Solana program:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
    return undefined;
  }
};

// Define our IDL interface with proper structure
// Note: We intentionally don't extend Idl here to avoid strict type issues
export interface OfundIdl {
  version: string;
  name: string;
  instructions: Array<{
    name: string;
    accounts: Array<{
      name: string;
      isMut: boolean;
      isSigner: boolean;
    }>;
    args: Array<{
      name: string;
      type: string;
    }>;
  }>;
  accounts: Array<{
    name: string;
    type: {
      kind: string;
      fields: Array<{
        name: string;
        type: string | { vec: { defined: string } } | any;
      }>;
    };
  }>;
  types: Array<{
    name: string;
    type: {
      kind: string;
      fields: Array<{
        name: string;
        type: string;
      }>;
    };
  }>;
  errors?: any[];
  metadata?: {
    address: string;
  };
  address: string;
}

// Prepare our IDL with a guaranteed address field for proper program initialization
const idl: OfundIdl = {
  ...idlFile as any,
  // Ensure address field is always set with our program ID
  address: (process.env.NEXT_PUBLIC_OFUND_PROGRAM_ID || 'GAeLTwzvybwxaELbJrPcbjWBaNY5QLHurxXdoPN7jH6D')
};

// Define the type for our program to properly type-check program methods
export type OtonomProgram = Program<OfundIdl>;
