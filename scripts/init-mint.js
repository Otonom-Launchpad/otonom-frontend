/**
 * Otonom Fund Mint Authority Initialization Script
 * 
 * This script initializes the mint authority for the OFUND token
 * using the Anchor program interface for professional-grade code.
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

// Load wallet
const keypairData = JSON.parse(fs.readFileSync(WALLET_PATH, 'utf-8'));
const keypair = web3.Keypair.fromSecretKey(Uint8Array.from(keypairData));
console.log(`Using wallet: ${keypair.publicKey.toString()}`);

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
 * Initialize mint authority
 */
async function initializeMintAuthority() {
  console.log('\n=== Initializing OFUND Token Mint Authority ===\n');
  
  // Find the mint authority PDAs
  const [mintAuthorityPda] = await web3.PublicKey.findProgramAddress(
    [Buffer.from('mint-authority'), OFUND_MINT.toBuffer()],
    PROGRAM_ID
  );
  
  const [authorityPda, authorityBump] = await web3.PublicKey.findProgramAddress(
    [Buffer.from('authority'), OFUND_MINT.toBuffer()],
    PROGRAM_ID
  );
  
  console.log(`Mint Authority PDA: ${mintAuthorityPda.toString()}`);
  console.log(`Authority Account: ${authorityPda.toString()}`);
  console.log(`Authority Bump: ${authorityBump}`);

  // Check if already initialized
  const authorityInfo = await connection.getAccountInfo(authorityPda);
  if (authorityInfo) {
    console.log('✅ Mint authority already initialized!');
    return;
  }

  try {
    console.log('Using Anchor program to initialize mint authority...');
    
    // Try the standard Anchor method first
    const tx = await program.methods
      .initializeExistingMint(
        authorityBump,
        'OFUND Token',
        'OFUND',
        'https://otonom.fund/token'
      )
      .accounts({
        admin: keypair.publicKey,
        mint: OFUND_MINT,
        mintAuthorityPda: mintAuthorityPda,
        mintAuthority: authorityPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([keypair])
      .rpc();
    
    console.log(`Transaction sent! Signature: ${tx}`);
    console.log(`View on Solana Explorer: https://explorer.solana.com/tx/${tx}?cluster=${NETWORK}`);
    
    // Wait for confirmation
    await connection.confirmTransaction(tx);
    console.log('✅ Mint authority initialized successfully!');
  } catch (error) {
    console.error('Error initializing mint authority:', error);
    
    // If that doesn't work, try with manual instruction creation using BorshInstructionCoder
    console.log('\nTrying alternate approach with BorshInstructionCoder...');
    
    try {
      // Get the instruction encoder from Anchor
      const coder = new anchor.BorshInstructionCoder(idl);
      
      // Get the discriminator (first 8 bytes)
      const discriminator = coder.encode('initializeExistingMint', {}).slice(0, 8);
      
      // Create buffers for strings
      const nameStr = 'OFUND Token';
      const symbolStr = 'OFUND';
      const uriStr = 'https://otonom.fund/token';
      
      const nameBuffer = Buffer.from(nameStr);
      const nameLength = Buffer.alloc(4);
      nameLength.writeUInt32LE(nameBuffer.length, 0);
      
      const symbolBuffer = Buffer.from(symbolStr);
      const symbolLength = Buffer.alloc(4);
      symbolLength.writeUInt32LE(symbolBuffer.length, 0);
      
      const uriBuffer = Buffer.from(uriStr);
      const uriLength = Buffer.alloc(4);
      uriLength.writeUInt32LE(uriBuffer.length, 0);
      
      // Combine all data
      const data = Buffer.concat([
        discriminator,
        Buffer.from([authorityBump]),
        nameLength,
        nameBuffer,
        symbolLength,
        symbolBuffer,
        uriLength,
        uriBuffer
      ]);
      
      // Create a transaction instruction
      const instruction = new web3.TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          { pubkey: keypair.publicKey, isSigner: true, isWritable: true },
          { pubkey: OFUND_MINT, isSigner: false, isWritable: true },
          { pubkey: mintAuthorityPda, isSigner: false, isWritable: false },
          { pubkey: authorityPda, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: web3.SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: web3.SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
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
      console.log('✅ Mint authority initialized successfully with alternate method!');
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
  console.log('======== Otonom Fund Program Initialization ========');
  console.log(`Program ID: ${PROGRAM_ID.toString()}`);
  console.log(`OFUND Token Mint: ${OFUND_MINT.toString()}`);
  console.log(`Network: ${NETWORK}`);
  console.log('==================================================\n');
  
  // Check wallet balance
  const balance = await connection.getBalance(keypair.publicKey);
  console.log(`Wallet balance: ${balance / 1_000_000_000} SOL`);
  
  if (balance < 10_000_000) {
    console.warn('⚠️ Warning: Wallet balance is low. Minimum 0.01 SOL recommended for transactions.');
  }
  
  // Run initialization
  await initializeMintAuthority();
  
  console.log('\n✅ Initialization Complete!');
}

// Run main function
main().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
