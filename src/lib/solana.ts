import { Connection, clusterApiUrl } from '@solana/web3.js';

// Use localhost for development, devnet for testing, and mainnet-beta for production
const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'http://localhost:8899';

// Create a connection to the Solana cluster
export const connection = new Connection(
  network === 'devnet' ? clusterApiUrl('devnet') : 
  network === 'mainnet-beta' ? clusterApiUrl('mainnet-beta') : 
  network
);