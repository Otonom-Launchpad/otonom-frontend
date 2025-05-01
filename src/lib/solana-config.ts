import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';

// Configuration constants
export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';

// Program and token addresses as strings
// NOTE: These are PUBLIC on-chain addresses, NOT secrets
// They can be viewed by anyone on Solana Explorer: https://explorer.solana.com

// Public Program ID - Otonom Fund smart contract address on Solana
const PROGRAM_ID_STRING = process.env.NEXT_PUBLIC_OFUND_PROGRAM_ID || 'CWYLQDPfH6eywYGJfrSdX2cVMczm88x3V2Rd4tcgk4jf';

// Public Token Mint - OFUND token mint address on Solana
const TOKEN_MINT_STRING = process.env.NEXT_PUBLIC_OFUND_TOKEN_MINT || '4pV3umk8pY62ry8FsnMbQfJBYgpWnzWcC67UCMUevXLY';

// Public SPL Token Program ID - official Solana token program
const SPL_TOKEN_PROGRAM_ID_STRING = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

// Validate and log the addresses we're using
console.log('Using Solana network:', SOLANA_NETWORK);
console.log('Using program ID:', PROGRAM_ID_STRING);
console.log('Using token mint:', TOKEN_MINT_STRING);

// These PublicKey objects are used throughout the app for on-chain transactions
export const PROGRAM_ID = new PublicKey(PROGRAM_ID_STRING);
export const TOKEN_PROGRAM_ID = new PublicKey(SPL_TOKEN_PROGRAM_ID_STRING);
export const OFUND_MINT = new PublicKey(TOKEN_MINT_STRING);

// Create alias for backward compatibility
export const TOKEN_MINT_ADDRESS = OFUND_MINT;

// Get connection based on environment
export const getConnection = () => {
  console.log('Creating Solana connection for network:', SOLANA_NETWORK);
  const endpoint = 
    SOLANA_NETWORK === 'devnet' ? clusterApiUrl('devnet') : 
    SOLANA_NETWORK === 'mainnet-beta' ? clusterApiUrl('mainnet-beta') : 
    'http://localhost:8899';
  
  console.log('Using RPC endpoint:', endpoint);
  return new Connection(endpoint, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000 // 60 seconds timeout for transaction confirmation
  });
};

// This file is deliberately kept simple with clean exports
// Complex Anchor integration logic has been moved to anchor-program.ts
