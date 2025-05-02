/**
 * Otonom Fund User Profile Initialization Script
 * 
 * This script initializes a user profile in the Otonom Fund program
 */

const fs = require('fs');
const path = require('path');
const anchor = require('@project-serum/anchor');
const web3 = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID } = require('@solana/spl-token');

// Configuration constants
const PROGRAM_ID = new web3.PublicKey('CWYLQDPfH6eywYGJfrSdX2cVMczm88x3V2Rd4tcgk4jf');
const OFUND_MINT = new web3.PublicKey('4pV3umk8pY62ry8FsnMbQfJBYgpWnzWcC67UCMUevXLY');
const WALLET_PATH = path.resolve(process.env.HOME || '', '.config/solana/id.json');
const IDL_PATH = path.resolve(__dirname, '../src/idl/spg/ofund-idl-deployed.json');
const NETWORK = 'devnet';

// The target user wallet to initialize (from the error logs)
const TARGET_USER_WALLET = new web3.PublicKey('5VRwNWW5tANG5o1X96CBim7YAyTYVgrjHciAD7VHovuv');

// Load admin wallet
const keypairData = JSON.parse(fs.readFileSync(WALLET_PATH, 'utf-8'));
const keypair = web3.Keypair.fromSecretKey(Uint8Array.from(keypairData));
console.log(`Using admin wallet: ${keypair.publicKey.toString()}`);

// Setup connection
const connection = new web3.Connection(
  NETWORK === 'devnet' ? 'https://api.devnet.solana.com' : 'https://api.mainnet-beta.solana.com',
  { commitment: 'confirmed', confirmTransactionInitialTimeout: 60000 }
);

// Load IDL
const idl = JSON.parse(fs.readFileSync(IDL_PATH, 'utf-8'));
console.log(`Loaded IDL: ${idl.name} with ${idl.instructions.length} instructions`);

// Create Anchor wallet adapter
const wallet = new anchor.Wallet(keypair);

// Create Anchor provider
const provider = new anchor.AnchorProvider(
  connection,
  wallet,
  { commitment: 'confirmed', preflightCommitment: 'confirmed' }
);

anchor.setProvider(provider);
const program = new anchor.Program(idl, PROGRAM_ID, provider);

/**
 * Find user profile PDA
 */
async function findUserProfilePDA(userWallet) {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from('user-profile'), userWallet.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Initialize user profile for the target wallet
 */
async function initializeUserProfile() {
  console.log('\n=== Initializing User Profile ===\n');
  console.log(`Target user wallet: ${TARGET_USER_WALLET.toString()}`);
  
  // Find the user profile PDA
  const [userProfilePda, bump] = await findUserProfilePDA(TARGET_USER_WALLET);
  console.log(`User Profile PDA: ${userProfilePda.toString()}`);
  console.log(`User Profile Bump: ${bump}`);
  
  // Check if already initialized
  const profileInfo = await connection.getAccountInfo(userProfilePda);
  if (profileInfo) {
    console.log('✅ User profile already initialized!');
    return;
  }
  
  try {
    console.log('Using Anchor program to initialize user profile...');
    
    // Try the standard Anchor method first
    const tx = await program.methods
      .registerUser(bump)
      .accounts({
        user: TARGET_USER_WALLET,
        userProfile: userProfilePda,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([keypair])
      .rpc();
    
    console.log(`Transaction sent! Signature: ${tx}`);
    console.log(`View on Solana Explorer: https://explorer.solana.com/tx/${tx}?cluster=${NETWORK}`);
    
    // Wait for confirmation
    await connection.confirmTransaction(tx);
    console.log('✅ User profile initialized successfully!');
  } catch (error) {
    console.error('Error initializing user profile:', error);
    
    // If that doesn't work, try with manual instruction creation using BorshInstructionCoder
    console.log('\nTrying alternate approach with BorshInstructionCoder...');
    
    try {
      // Get the instruction encoder from Anchor
      const coder = new anchor.BorshInstructionCoder(idl);
      
      // Get the discriminator (first 8 bytes)
      const discriminator = coder.encode('registerUser', {}).slice(0, 8);
      
      // Bump as a byte
      const bumpData = Buffer.from([bump]);
      
      // Combine all data
      const data = Buffer.concat([discriminator, bumpData]);
      
      // Create a transaction instruction
      const instruction = new web3.TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          { pubkey: TARGET_USER_WALLET, isSigner: false, isWritable: true },
          { pubkey: userProfilePda, isSigner: false, isWritable: true },
          { pubkey: web3.SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data
      });
      
      // Create and sign transaction
      const transaction = new web3.Transaction().add(instruction);
      transaction.feePayer = keypair.publicKey;
      
      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      
      transaction.sign(keypair);
      
      // Send transaction
      const manualTx = await connection.sendRawTransaction(transaction.serialize());
      
      console.log(`Transaction sent! Signature: ${manualTx}`);
      console.log(`View on Solana Explorer: https://explorer.solana.com/tx/${manualTx}?cluster=${NETWORK}`);
      
      // Wait for confirmation
      await connection.confirmTransaction(manualTx);
      console.log('✅ User profile initialized successfully with alternate method!');
    } catch (altError) {
      console.error('Error with alternate approach:', altError);
      if (altError.logs) {
        console.log('\nProgram logs:');
        console.log(altError.logs.join('\n'));
      }
    }
    
    if (error.logs) {
      console.log('\nOriginal error program logs:');
      console.log(error.logs.join('\n'));
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('======== Otonom Fund User Profile Initialization ========');
  console.log(`Program ID: ${PROGRAM_ID.toString()}`);
  console.log(`Target User: ${TARGET_USER_WALLET.toString()}`);
  console.log(`Network: ${NETWORK}`);
  console.log('======================================================\n');
  
  // Check wallet balance
  const balance = await connection.getBalance(keypair.publicKey);
  console.log(`Admin wallet balance: ${balance / 1_000_000_000} SOL`);
  
  if (balance < 10_000_000) {
    console.warn('⚠️ Warning: Admin wallet balance is low. Minimum 0.01 SOL recommended for transactions.');
  }
  
  // Run initialization
  await initializeUserProfile();
  
  console.log('\n✅ Initialization Complete!');
}

// Run main function
main().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
