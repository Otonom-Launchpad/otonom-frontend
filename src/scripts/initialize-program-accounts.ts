/**
 * One-time initialization script for the Otonom Fund program
 * 
 * This script initializes the mint authority and other required accounts for 
 * a newly deployed program. Run this when you've deployed a new program ID.
 * 
 * NOTE: This script is meant to be referenced, not executed directly.
 * Instead, use the InitializeProgramAccounts component in src/components/admin/initialize-program-accounts.tsx
 * which has the same logic but with a browser-based UI.
 */

import { PublicKey, Keypair, Transaction } from '@solana/web3.js';
import { getConnection, OFUND_MINT, PROGRAM_ID } from '@/lib/solana-config';
import { createInitializeExistingMintInstruction, findMintAuthorityPDAs } from '@/services/transaction-builder';

async function initializeWithPrivateKey(adminSecretKey: Uint8Array) {
  try {
    console.log('Starting Otonom Fund program initialization...');
    console.log(`Program ID: ${PROGRAM_ID.toString()}`);
    console.log(`OFUND Token Mint: ${OFUND_MINT.toString()}`);
    
    // Create keypair from provided secret key
    const adminKeypair = Keypair.fromSecretKey(adminSecretKey);
    console.log(`Admin pubkey: ${adminKeypair.publicKey.toString()}`);
    
    // Get Solana connection
    const connection = getConnection();
    
    // Get mint authority PDAs
    const [mintAuthorityPda, mintAuthority] = await findMintAuthorityPDAs(OFUND_MINT);
    console.log(`Mint Authority PDA: ${mintAuthorityPda.toString()}`);
    console.log(`Authority Account PDA: ${mintAuthority.toString()}`);
    
    // Check if mint authority is already initialized
    const mintAuthorityInfo = await connection.getAccountInfo(mintAuthority);
    if (mintAuthorityInfo) {
      console.log('Mint authority already initialized!');
      return { success: true, message: 'Mint authority already initialized' };
    }
    
    console.log('Initializing mint authority...');
    
    // Create transaction to initialize mint authority
    const tx = new Transaction();
    
    // Add instruction to initialize mint authority
    const initMintIx = await createInitializeExistingMintInstruction(
      adminKeypair.publicKey,
      OFUND_MINT,
      "OFUND Token",
      "OFUND", 
      "https://otonom.fund/token"
    );
    
    tx.add(initMintIx);
    
    // Sign and send transaction
    tx.feePayer = adminKeypair.publicKey;
    const { blockhash } = await connection.getRecentBlockhash();
    tx.recentBlockhash = blockhash;
    tx.sign(adminKeypair);
    
    const signature = await connection.sendRawTransaction(tx.serialize());
    console.log(`Mint authority initialized! Signature: ${signature}`);
    console.log(`View on explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    
    // Wait for confirmation
    await connection.confirmTransaction(signature);
    console.log('Transaction confirmed!');
    
    return { 
      success: true, 
      message: 'Program initialization complete!',
      signature
    };
    
  } catch (error) {
    console.error('Error initializing program:', error);
    return { 
      success: false, 
      message: `Error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

// Export for use in components
export { initializeWithPrivateKey };
