/**
 * Script to print exact program ID for Solana Explorer verification
 */
const { PublicKey } = require('@solana/web3.js');

// The program ID from our frontend config
const PROGRAM_ID_STRING = 'CWYLQDPfH6eywYGJfrSdX2cVMczm88x3V2Rd4tcgk4jf';

// Print it in both formats for verification
console.log('Program ID (for verification):');
console.log(`String format: ${PROGRAM_ID_STRING}`);

// Create PublicKey and print again to ensure valid base58 encoding
try {
  const pubkey = new PublicKey(PROGRAM_ID_STRING);
  console.log(`PublicKey format: ${pubkey.toString()}`);
  console.log(`Solana Explorer URL: https://explorer.solana.com/address/${pubkey.toString()}?cluster=devnet`);
  
  // Count characters to ensure no transcription errors
  console.log(`Character count: ${PROGRAM_ID_STRING.length}`);
  
  // Verify base58 validity
  console.log('Base58 check: Valid');
} catch (error) {
  console.error('Invalid PublicKey format:', error.message);
}
