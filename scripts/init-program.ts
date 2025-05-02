/**
 * Otonom Fund Program Initialization Script
 * 
 * Professional, maintainable script to initialize on-chain program accounts:
 * 1. OFUND token mint authority 
 * 2. Admin user profile (optional)
 * 3. Sample project (optional)
 */

import fs from 'fs';
import path from 'path';
// Using @project-serum/anchor for consistency with existing codebase
import { Program, AnchorProvider, Wallet, BorshInstructionCoder } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress, 
  setAuthority, 
  AuthorityType, 
  getMint, 
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';

// ----- Configuration constants -----
const PROGRAM_ID = new PublicKey(process.env.OFUND_PROGRAM_ID || 'CWYLQDPfH6eywYGJfrSdX2cVMczm88x3V2Rd4tcgk4jf');
const OFUND_MINT = new PublicKey('4pV3umk8pY62ry8FsnMbQfJBYgpWnzWcC67UCMUevXLY');
const WALLET_PATH = path.resolve(process.env.HOME || '', '.config/solana/id.json');
const IDL_PATH = path.resolve(__dirname, '../src/lib/ofund-idl.json');
const NETWORK = 'devnet';
const SAMPLE_PROJECT_NAME = 'Demo Project';

// ----- Setup provider and program connection -----

// Load wallet keypair
let keypairData: number[];
try {
  keypairData = JSON.parse(fs.readFileSync(WALLET_PATH, 'utf-8'));
  if (!Array.isArray(keypairData)) {
    throw new Error('Keypair file is not in the expected format');
  }
} catch (error) {
  console.error('Error loading wallet keypair:', error);
  process.exit(1);
}

const keypair = Keypair.fromSecretKey(Uint8Array.from(keypairData));
console.log(`Using wallet: ${keypair.publicKey.toString()}`);

// Setup connection
const connection = new Connection(
  NETWORK === 'devnet' ? 'https://api.devnet.solana.com' : 'https://api.mainnet-beta.solana.com',
  { commitment: 'confirmed', confirmTransactionInitialTimeout: 60000 }
);

// Create Anchor wallet adapter
const wallet = new Wallet(keypair);

// Create Anchor provider
const provider = new AnchorProvider(
  connection,
  wallet,
  { commitment: 'confirmed', preflightCommitment: 'confirmed' }
);

// Load IDL
let idl: any;
try {
  const idlContent = fs.readFileSync(IDL_PATH, 'utf-8');
  idl = JSON.parse(idlContent);
  console.log(`Loaded IDL: ${idl.name} with ${idl.instructions.length} instructions`);
} catch (error) {
  console.error('Error loading IDL:', error);
  process.exit(1);
}

// Create program instance
const program = new Program(idl, PROGRAM_ID, provider);

/**
 * Find mint authority PDAs
 * @returns [mintAuthorityPda, authorityPda, authorityBump]
 */
async function findMintAuthorityPDAs(): Promise<[PublicKey, PublicKey, number]> {
  // Derive the mint authority PDA that can sign for the mint
  const [mintAuthorityPda] = await PublicKey.findProgramAddress(
    [Buffer.from('mint-authority'), OFUND_MINT.toBuffer()],
    PROGRAM_ID
  );

  // Derive the authority account PDA that stores metadata
  const [authorityPda, authorityBump] = await PublicKey.findProgramAddress(
    [Buffer.from('authority'), OFUND_MINT.toBuffer()],
    PROGRAM_ID
  );

  return [mintAuthorityPda, authorityPda, authorityBump];
}

/**
 * Find user profile PDA
 * @param user User public key
 * @returns [userProfilePda, bump]
 */
async function findUserProfilePDA(user: PublicKey): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddress(
    [Buffer.from('user-profile'), user.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Find project PDA
 * @param projectName Project name
 * @returns [projectPda, bump]
 */
async function findProjectPDA(projectName: string): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddress(
    [Buffer.from('project'), Buffer.from(projectName)],
    PROGRAM_ID
  );
}

/**
 * Initialize mint authority
 */
async function initializeMintAuthority() {
  console.log('\n=== Initializing OFUND Token Mint Authority ===\n');
  
  const [mintAuthorityPda, authorityPda, authorityBump] = await findMintAuthorityPDAs();
  
  console.log(`Mint Authority PDA: ${mintAuthorityPda.toString()}`);
  console.log(`Authority Account: ${authorityPda.toString()}`);

  const authorityInfo = await connection.getAccountInfo(authorityPda);
  if (!authorityInfo) {
    try {
      // Initialize the metadata account once
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
          mintAuthorityPda,
          mintAuthority: authorityPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([keypair])
        .rpc();
      console.log(`Transaction sent! Signature: ${tx}`);
      console.log(`View on Solana Explorer: https://explorer.solana.com/tx/${tx}?cluster=${NETWORK}`);
      await connection.confirmTransaction(tx);
      console.log('✅ Mint authority metadata initialized');
    } catch (error: any) {
      console.error('Error initializing mint authority metadata:', error);
      if (error.logs) {
        console.log('\nProgram logs:');
        console.log(error.logs.join('\n'));
      }
    }
  } else {
    console.log('✅ Mint authority metadata already initialized');
  }

  // Ensure SPL mint authority is the PDA (always run)
  try {
    const mintInfo = await getMint(connection, OFUND_MINT);
    if (!mintInfo.mintAuthority || !mintInfo.mintAuthority.equals(mintAuthorityPda)) {
      console.log('Transferring SPL mint authority to PDA...');
      const txSig = await setAuthority(
        connection,
        keypair, // payer and current authority signer
        OFUND_MINT,
        keypair.publicKey,
        AuthorityType.MintTokens,
        mintAuthorityPda
      );
      console.log(`Mint authority transferred. Tx: ${txSig}`);
    } else {
      console.log('✅ SPL mint authority already set to PDA');
    }
  } catch (splErr) {
    console.error('Error ensuring mint authority PDA owns the mint:', splErr);
  }
}

/**
 * Initialize admin user profile
 */
async function initializeAdminProfile() {
  console.log('\n=== Initializing Admin User Profile ===\n');
  
  const [userProfilePda, bump] = await findUserProfilePDA(keypair.publicKey);
  console.log(`Admin User Profile PDA: ${userProfilePda.toString()}`);
  
  // Check if already initialized
  const userProfileInfo = await connection.getAccountInfo(userProfilePda);
  if (userProfileInfo) {
    console.log('✅ Admin user profile already initialized!');
    return;
  }

  // Derive additional required accounts
  const userTokenAccount = await getAssociatedTokenAddress(
    OFUND_MINT,
    keypair.publicKey
  );

  const [mintAuthorityPda, mintAuthority] = await (async () => {
    const [pda1] = await PublicKey.findProgramAddress(
      [Buffer.from('mint-authority'), OFUND_MINT.toBuffer()],
      PROGRAM_ID
    );
    const [pda2] = await PublicKey.findProgramAddress(
      [Buffer.from('authority'), OFUND_MINT.toBuffer()],
      PROGRAM_ID
    );
    return [pda1, pda2];
  })();
  
  try {
    const tx = await program.methods
      .registerUser(bump)
      .accounts({
        user: keypair.publicKey,
        userProfile: userProfilePda,
        mint: OFUND_MINT,
        userTokenAccount,
        mintAuthority: mintAuthority,
        mintAuthorityPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([keypair])
      .rpc();
    
    console.log(`Transaction sent! Signature: ${tx}`);
    console.log(`View on Solana Explorer: https://explorer.solana.com/tx/${tx}?cluster=${NETWORK}`);
    
    await connection.confirmTransaction(tx);
    console.log('✅ Admin user profile initialized successfully!');
  } catch (error: any) {
    console.error('Error initializing admin user profile:', error);
    if (error.logs) {
      console.log('\nProgram logs:');
      console.log(error.logs.join('\n'));
    }
  }
}

/**
 * Initialize sample project
 */
async function initializeSampleProject() {
  console.log('\n=== Initializing Sample Project ===\n');
  
  const [projectPda, bump] = await findProjectPDA(SAMPLE_PROJECT_NAME);
  console.log(`Project PDA: ${projectPda.toString()}`);
  
  // Check if already initialized
  const projectInfo = await connection.getAccountInfo(projectPda);
  if (projectInfo) {
    console.log('✅ Sample project already initialized!');
    return;
  }

  // Project vault: ATA owned by the project PDA (allow off-curve)
  const projectVault = await getAssociatedTokenAddress(
    OFUND_MINT,
    projectPda,
    true // allow owner off-curve (PDA)
  );

  // Ensure the vault ATA exists
  try {
    await getOrCreateAssociatedTokenAccount(
      connection,
      keypair, // payer
      OFUND_MINT,
      projectPda,
      true // owner off-curve
    );
    console.log('Project vault ATA ensured');
  } catch (ataErr: any) {
    if (ataErr?.message?.includes('0x0')) {
      // Already exists
      console.log('Project vault ATA already exists');
    } else {
      console.warn('ATA create returned:', ataErr?.message || ataErr);
    }
  }
  
  try {
    const tx = await program.methods
      .initializeProject(
        SAMPLE_PROJECT_NAME,
        bump,
      )
      .accounts({
        authority: keypair.publicKey,
        project: projectPda,
        projectVault,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([keypair])
      .rpc();
    
    console.log(`Transaction sent! Signature: ${tx}`);
    console.log(`View on Solana Explorer: https://explorer.solana.com/tx/${tx}?cluster=${NETWORK}`);
    
    await connection.confirmTransaction(tx);
    console.log('✅ Sample project initialized successfully!');
  } catch (error: any) {
    console.error('Error initializing sample project:', error);
    if (error.logs) {
      console.log('\nProgram logs:');
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
  
  // Run initializations
  await initializeMintAuthority();
  await initializeAdminProfile();
  await initializeSampleProject();
  
  console.log('\n✅ Initialization Complete!');
}

// Run main function
main().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
