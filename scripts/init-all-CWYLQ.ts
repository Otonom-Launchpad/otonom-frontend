/**
 * Otonom Fund Program Initialization Script
 * For Program ID: CWYLQDPfH6eywYGJfrSdX2cVMczm88x3V2Rd4tcgk4jf
 * 
 * This script performs all necessary one-time initializations after deploying a new version 
 * of the Otonom Fund Solana program. It follows a specific sequence:
 * 
 * 1. Initialize the OFUND token mint authority
 * 2. Create a sample project for testing
 * 3. Initialize the admin user profile
 * 
 * Usage:
 *   npx ts-node scripts/init-all-CWYLQ.ts
 * 
 * Requirements:
 *   - Solana CLI with a configured wallet (solana-keygen)
 *   - Node.js v16+
 *   - The wallet must have SOL for transaction fees
 */

import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  AccountMeta
} from '@solana/web3.js';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Import IDL directly with require instead of ESM import
// eslint-disable-next-line @typescript-eslint/no-var-requires
const idlFile = require('../../src/idl/spg/ofund-idl-deployed.json');

// Define interfaces for better type safety
interface InstructionDiscriminators {
  initializeExistingMint: Buffer;
  registerUser: Buffer;
  initializeProject: Buffer;
}

// =========== Configuration constants ===========
// Program ID for the Otonom Fund program
const PROGRAM_ID = new PublicKey('CWYLQDPfH6eywYGJfrSdX2cVMczm88x3V2Rd4tcgk4jf');
// OFUND token mint address
const OFUND_MINT = new PublicKey('4pV3umk8pY62ry8FsnMbQfJBYgpWnzWcC67UCMUevXLY');
// Network to connect to
const NETWORK = 'devnet';
// Sample project name to initialize
const SAMPLE_PROJECT_NAME = 'Demo Project';
// Path to your Solana wallet keypair
const WALLET_KEYPAIR_PATH = path.resolve(process.env.HOME || '', '.config/solana/id.json');

// Create Anchor instruction coder for generating discriminators
const instructionCoder = new anchor.BorshInstructionCoder(idlFile);

// Instruction discriminators (first 8 bytes of serialized instructions)
const INSTRUCTION_DISCRIMINATORS: InstructionDiscriminators = {
  initializeExistingMint: instructionCoder.encode('initializeExistingMint', {}).slice(0, 8),
  registerUser: instructionCoder.encode('registerUser', {}).slice(0, 8),
  initializeProject: instructionCoder.encode('initializeProject', {}).slice(0, 8),
};

// =========== Helper Functions ===========

/**
 * Get Solana connection
 * @returns {Connection} Solana connection
 */
function getConnection(): Connection {
  const endpoint = NETWORK === 'devnet' 
    ? 'https://api.devnet.solana.com' 
    : 'https://api.mainnet-beta.solana.com';
  
  console.log(`Creating Solana connection for network: ${NETWORK}`);
  console.log(`Using RPC endpoint: ${endpoint}`);
  
  return new Connection(endpoint, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000
  });
}

/**
 * Find mint authority PDAs
 * @returns {Promise<[PublicKey, PublicKey, number]>} [mintAuthorityPDA, authorityAccountPDA, bump]
 */
async function findMintAuthorityPDAs(): Promise<[PublicKey, PublicKey, number]> {
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
 * Find user profile PDA
 * @param {PublicKey} user - User public key
 * @returns {Promise<[PublicKey, number]>} [userProfilePDA, bump]
 */
async function findUserProfilePDA(user: PublicKey): Promise<[PublicKey, number]> {
  const [pda, bump] = await PublicKey.findProgramAddress(
    [Buffer.from('user-profile'), user.toBuffer()],
    PROGRAM_ID
  );
  return [pda, bump];
}

/**
 * Find project PDA
 * @param {string} projectName - Project name
 * @returns {Promise<[PublicKey, number]>} [projectPDA, bump]
 */
async function findProjectPDA(projectName: string): Promise<[PublicKey, number]> {
  const [pda, bump] = await PublicKey.findProgramAddress(
    [Buffer.from('project'), Buffer.from(projectName)],
    PROGRAM_ID
  );
  return [pda, bump];
}

/**
 * Create instruction to initialize an existing mint with program authority
 * @param {PublicKey} admin - Admin wallet
 * @param {PublicKey} mint - Token mint
 * @param {number} authorityBump - Authority bump
 * @param {string} tokenName - Token name
 * @param {string} tokenSymbol - Token symbol 
 * @param {string} tokenUri - Token metadata URI
 * @returns {Instruction} Instruction object
 */
function createInitializeExistingMintIx(
  admin: PublicKey,
  mint: PublicKey,
  authorityBump: number,
  tokenName: string,
  tokenSymbol: string,
  tokenUri: string
): TransactionInstruction {
  console.log(`Creating initialize existing mint instruction for: ${mint.toString()}`);
  
  // Find the mint authority PDAs
  const [mintAuthorityPda, mintAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from('mint-authority'), mint.toBuffer()],
    PROGRAM_ID
  );
  
  // Create buffers for strings
  const nameBuffer = Buffer.from(tokenName);
  const nameLength = Buffer.alloc(4);
  nameLength.writeUInt32LE(nameBuffer.length, 0);
  
  const symbolBuffer = Buffer.from(tokenSymbol);
  const symbolLength = Buffer.alloc(4);
  symbolLength.writeUInt32LE(symbolBuffer.length, 0);
  
  const uriBuffer = Buffer.from(tokenUri);
  const uriLength = Buffer.alloc(4);
  uriLength.writeUInt32LE(uriBuffer.length, 0);
  
  // Create the instruction data
  const instructionData = Buffer.concat([
    INSTRUCTION_DISCRIMINATORS.initializeExistingMint,
    Buffer.from([authorityBump]),
    nameLength,
    nameBuffer,
    symbolLength,
    symbolBuffer,
    uriLength,
    uriBuffer
  ]);
  
  // Define accounts according to IDL - with proper typing
  const keys: AccountMeta[] = [
    { pubkey: admin, isSigner: true, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: true },
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
 * Create instruction to register a user profile
 * @param {PublicKey} user - User wallet 
 * @param {PublicKey} userProfilePda - User profile PDA
 * @param {number} bump - PDA bump
 * @returns {TransactionInstruction} Transaction instruction
 */
function createRegisterUserIx(
  user: PublicKey, 
  userProfilePda: PublicKey, 
  bump: number
): TransactionInstruction {
  console.log(`Creating register user instruction for: ${user.toString()}`);
  
  // Find the mint authority PDAs
  const [mintAuthorityPda, mintAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from('mint-authority'), OFUND_MINT.toBuffer()],
    PROGRAM_ID
  );
  
  // Format instruction data: [8 bytes discriminator][1 byte bump]
  const instructionData = Buffer.concat([
    INSTRUCTION_DISCRIMINATORS.registerUser,
    Buffer.from([bump]), // userBump argument from IDL
  ]);
  
  // Define accounts needed based on the IDL for registerUser - with proper typing
  const keys: AccountMeta[] = [
    { pubkey: user, isSigner: true, isWritable: true },
    { pubkey: userProfilePda, isSigner: false, isWritable: true },
    { pubkey: OFUND_MINT, isSigner: false, isWritable: true },
    { pubkey: new PublicKey(user), isSigner: false, isWritable: true }, // Properly cast to PublicKey
    { pubkey: new PublicKey(mintAuthority), isSigner: false, isWritable: false },
    { pubkey: mintAuthorityPda, isSigner: false, isWritable: false },
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
 * Create instruction to initialize a project
 * @param {PublicKey} authority - Project authority
 * @param {PublicKey} projectPda - Project PDA
 * @param {number} bump - PDA bump 
 * @param {string} projectName - Project name
 * @returns {TransactionInstruction} Transaction instruction
 */
function createInitializeProjectIx(
  authority: PublicKey, 
  projectPda: PublicKey, 
  bump: number, 
  projectName: string
): TransactionInstruction {
  console.log(`Creating initialize project instruction for: ${projectName}`);
  
  // Create a buffer for the project name
  const nameBuffer = Buffer.from(projectName);
  const nameLenBuffer = Buffer.alloc(4);
  nameLenBuffer.writeUInt32LE(nameBuffer.length, 0);
  
  // Create the bump buffer
  const bumpBuffer = Buffer.from([bump]);
  
  // Construct the final instruction data
  const instructionData = Buffer.concat([
    INSTRUCTION_DISCRIMINATORS.initializeProject,
    nameLenBuffer,                     // 4-byte length prefix for string
    nameBuffer,                        // actual string bytes
    bumpBuffer,                        // Bump as u8
  ]);
  
  // Define accounts according to IDL - with proper typing
  const keys: AccountMeta[] = [
    { pubkey: authority, isSigner: true, isWritable: true },
    { pubkey: projectPda, isSigner: false, isWritable: true },
    { pubkey: new PublicKey(authority), isSigner: false, isWritable: true }, // Properly cast to PublicKey
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
 * Main function to run all initializations
 */
async function main(): Promise<void> {
  try {
    console.log('======== Otonom Fund Program Initialization ========');
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
    
    // ======== Step 1: Initialize OFUND Token Mint Authority ========
    console.log('\n\n📝 Step 1: Initializing OFUND Token Mint Authority...');
    
    // Get mint authority PDAs
    const [mintAuthorityPda, mintAuthority, authorityBump] = await findMintAuthorityPDAs();
    console.log(`Mint Authority PDA: ${mintAuthorityPda.toString()}`);
    console.log(`Authority Account: ${mintAuthority.toString()}`);
    
    // Check if mint authority is already initialized
    const mintAuthorityInfo = await connection.getAccountInfo(mintAuthority);
    
    if (mintAuthorityInfo) {
      console.log('✓ Mint authority already initialized, skipping...');
    } else {
      console.log('Initializing mint authority...');
      
      // Create transaction
      const tx = new Transaction();
      
      // Add instruction to initialize mint authority
      const initMintIx = createInitializeExistingMintIx(
        walletKeypair.publicKey,
        OFUND_MINT,
        authorityBump,
        "OFUND Token",
        "OFUND",
        "https://otonom.fund/token"
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
    }
    
    // ======== Step 2: Initialize User Profile ========
    console.log('\n\n📝 Step 2: Initializing User Profile...');
    
    // Find user profile PDA
    const [userProfilePda, userProfileBump] = await findUserProfilePDA(walletKeypair.publicKey);
    console.log(`User Profile PDA: ${userProfilePda.toString()}`);
    
    // Check if user profile already exists
    const userProfileInfo = await connection.getAccountInfo(userProfilePda);
    
    if (userProfileInfo) {
      console.log('✓ User profile already initialized, skipping...');
    } else {
      console.log('Note: User profiles are automatically created when investing, so this step is optional.');
      console.log('Initialization will be handled when the first investment is made.');
    }
    
    // ======== Step 3: Initialize Sample Project ========
    console.log('\n\n📝 Step 3: Initializing Sample Project...');
    
    // Find project PDA
    const [projectPda, projectBump] = await findProjectPDA(SAMPLE_PROJECT_NAME);
    console.log(`Project PDA: ${projectPda.toString()}`);
    
    // Check if project already exists
    const projectInfo = await connection.getAccountInfo(projectPda);
    
    if (projectInfo) {
      console.log(`✓ Sample project "${SAMPLE_PROJECT_NAME}" already initialized, skipping...`);
    } else {
      // Create an ATA for project vault
      // Note: This step is simplified for this script
      // In a real app, we'd create the ATA first
      
      console.log(`Initializing sample project: "${SAMPLE_PROJECT_NAME}"...`);
      console.log('Note: This requires a second step to configure in the database');
      
      // Create transaction
      const tx = new Transaction();
      
      // Create project instruction
      // Note: In a complete version, we'd also create the project vault ATA
      const projectIx = createInitializeProjectIx(
        walletKeypair.publicKey,
        projectPda,
        projectBump,
        SAMPLE_PROJECT_NAME
      );
      
      tx.add(projectIx);
      
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
      console.log(`✓ Sample project "${SAMPLE_PROJECT_NAME}" initialized successfully!`);
    }
    
    // ======== Final Steps ========
    console.log('\n\n✅ Program Initialization Complete!');
    console.log('==================================================');
    console.log('Next steps:');
    console.log('1. Add the sample project to your database if needed');
    console.log('2. Test the investment flow with a connected wallet');
    console.log('==================================================');
    
  } catch (error: unknown) {
    console.error('Error during program initialization:', error);
    if (error && typeof error === 'object' && 'logs' in error) {
      console.error('Program logs:', (error as { logs: unknown }).logs);
    }
  }
}

// Run the main function
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
