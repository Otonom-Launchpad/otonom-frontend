/**
 * Simple Mint Authority Initialization Script
 * For Program ID: CWYLQDPfH6eywYGJfrSdX2cVMczm88x3V2Rd4tcgk4jf
 */

const { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY
} = require('@solana/web3.js');
const { readFileSync } = require('fs');
const path = require('path');
const anchor = require('@project-serum/anchor');
const { TOKEN_PROGRAM_ID } = require('@solana/spl-token');

// Load IDL from relative path
const idlFile = require('../src/idl/spg/ofund-idl-deployed.json');

// =========== Configuration constants ===========
// Program ID for the Otonom Fund program
const PROGRAM_ID = new PublicKey('CWYLQDPfH6eywYGJfrSdX2cVMczm88x3V2Rd4tcgk4jf');
// OFUND token mint address
const OFUND_MINT = new PublicKey('4pV3umk8pY62ry8FsnMbQfJBYgpWnzWcC67UCMUevXLY');
// Network to connect to
const NETWORK = 'devnet';
// Path to your Solana wallet keypair
const WALLET_KEYPAIR_PATH = path.resolve(process.env.HOME || '', '.config/solana/id.json');

// Create Anchor instruction coder for generating discriminators
const instructionCoder = new anchor.BorshInstructionCoder(idlFile);

// Get instruction discriminator for initializing existing mint
const initializeExistingMintDiscriminator = instructionCoder.encode('initializeExistingMint', {}).slice(0, 8);

/**
 * Get Solana connection
 */
function getConnection() {
  const endpoint = 'https://api.devnet.solana.com';
  
  console.log(`Creating Solana connection for network: ${NETWORK}`);
  console.log(`Using RPC endpoint: ${endpoint}`);
  
  return new Connection(endpoint, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000
  });
}

/**
 * Find mint authority PDAs
 */
async function findMintAuthorityPDAs() {
  // Derive the mint authority PDA that can sign for the mint
  const [mintAuthorityPda, mintAuthorityBump] = await PublicKey.findProgramAddress(
    [Buffer.from('mint-authority'), OFUND_MINT.toBuffer()],
    PROGRAM_ID
  );

  // Derive the authority account PDA that stores metadata
  const [authorityAccountPda, authorityBump] = await PublicKey.findProgramAddress(
    [Buffer.from('authority'), OFUND_MINT.toBuffer()],
    PROGRAM_ID
  );

  return [mintAuthorityPda, authorityAccountPda, authorityBump];
}

/**
 * Create transaction instruction to initialize the mint authority
 */
async function createInitMintInstruction(admin, authorityBump) {
  console.log(`Creating initialize existing mint instruction`);
  
  // Find mint authority PDAs
  const [mintAuthorityPda, mintAuthority] = await PublicKey.findProgramAddress(
    [Buffer.from('mint-authority'), OFUND_MINT.toBuffer()],
    PROGRAM_ID
  );
  
  // Create buffers for strings
  const tokenName = "OFUND Token";
  const tokenSymbol = "OFUND";
  const tokenUri = "https://otonom.fund/token";
  
  const nameBuffer = Buffer.from(tokenName);
  const nameLength = Buffer.alloc(4);
  nameLength.writeUInt32LE(nameBuffer.length, 0);
  
  const symbolBuffer = Buffer.from(tokenSymbol);
  const symbolLength = Buffer.alloc(4);
  symbolLength.writeUInt32LE(symbolBuffer.length, 0);
  
  const uriBuffer = Buffer.from(tokenUri);
  const uriLength = Buffer.alloc(4);
  uriLength.writeUInt32LE(uriBuffer.length, 0);
  
  // Build the instruction data
  const instructionData = Buffer.concat([
    initializeExistingMintDiscriminator,
    Buffer.from([authorityBump]),
    nameLength,
    nameBuffer,
    symbolLength,
    symbolBuffer,
    uriLength,
    uriBuffer
  ]);
  
  // Define accounts for the instruction
  const keys = [
    { pubkey: admin, isSigner: true, isWritable: true },
    { pubkey: OFUND_MINT, isSigner: false, isWritable: true },
    { pubkey: mintAuthorityPda, isSigner: false, isWritable: false },
    { pubkey: new PublicKey(mintAuthority), isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
  ];
  
  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys,
    data: instructionData
  });
}

/**
 * Main function to initialize mint authority
 */
async function main() {
  try {
    console.log('======== Otonom Fund Mint Authority Initialization ========');
    console.log(`Program ID: ${PROGRAM_ID.toString()}`);
    console.log(`OFUND Token Mint: ${OFUND_MINT.toString()}`);
    console.log(`Network: ${NETWORK}`);
    console.log('==================================================');
    
    // Load wallet keypair
    const walletKeypair = Keypair.fromSecretKey(
      Buffer.from(JSON.parse(readFileSync(WALLET_KEYPAIR_PATH, 'utf-8')))
    );
    console.log(`Using wallet: ${walletKeypair.publicKey.toString()}`);
    
    // Get Solana connection
    const connection = getConnection();
    
    // Check wallet balance
    const balance = await connection.getBalance(walletKeypair.publicKey);
    console.log(`Wallet balance: ${balance / 1_000_000_000} SOL`);
    
    if (balance < 10_000_000) {
      console.error('Warning: Wallet balance is low. Minimum 0.01 SOL recommended for transactions.');
      // Don't stop execution, but warn the user
    }
    
    // Get mint authority PDAs
    const [mintAuthorityPda, mintAuthority, authorityBump] = await findMintAuthorityPDAs();
    console.log(`Mint Authority PDA: ${mintAuthorityPda.toString()}`);
    console.log(`Authority Account: ${mintAuthority.toString()}`);
    
    // Check if mint authority is already initialized
    const mintAuthorityInfo = await connection.getAccountInfo(mintAuthority);
    
    if (mintAuthorityInfo) {
      console.log('✓ Mint authority already initialized!');
      console.log('Investment flow should now work correctly.');
    } else {
      console.log('Initializing mint authority...');
      
      // Create transaction
      const tx = new Transaction();
      
      // Add instruction to initialize mint authority
      const initMintIx = await createInitMintInstruction(
        walletKeypair.publicKey,
        authorityBump
      );
      
      tx.add(initMintIx);
      
      // Set fee payer and recent blockhash
      tx.feePayer = walletKeypair.publicKey;
      const { blockhash } = await connection.getRecentBlockhash();
      tx.recentBlockhash = blockhash;
      
      // Sign and send transaction
      tx.sign(walletKeypair);
      
      const signature = await connection.sendRawTransaction(tx.serialize());
      console.log(`Transaction sent! Signature: ${signature}`);
      console.log(`View on Solana Explorer: https://explorer.solana.com/tx/${signature}?cluster=${NETWORK}`);
      
      // Wait for confirmation
      console.log('Waiting for transaction confirmation...');
      await connection.confirmTransaction(signature);
      console.log('✓ Mint authority initialized successfully!');
      console.log('Investment flow should now work correctly.');
    }
    
    console.log('\n\n✅ Initialization Complete!');
    
  } catch (error) {
    console.error('Error during initialization:', error);
    if (error.logs) {
      console.error('Program logs:', error.logs);
    }
    process.exit(1);
  }
}

// Run the main function
main();
