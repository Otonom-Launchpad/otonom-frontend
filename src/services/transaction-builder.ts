/**
 * Direct Transaction Builder for Otonom Fund
 * 
 * This module provides browser-compatible transaction construction
 * that bypasses Anchor's abstractions for better browser compatibility.
 * 
 * Created for Solana Breakout Hackathon to ensure production deployments work correctly
 */

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Buffer } from 'buffer';

/**
 * The OFund program ID - exported as a constant for consistency
 */
export const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_OFUND_PROGRAM_ID || 'CWYLQDPfH6eywYGJfrSdX2cVMczm88x3V2Rd4tcgk4jf');

// Import the IDL and proper type definition
import rawIdl from '@/idl/spg/ofund-idl-deployed.json';
import { BorshInstructionCoder, Idl } from '@project-serum/anchor';

// Cast the imported JSON to the Idl type to satisfy TypeScript
const idl = rawIdl as unknown as Idl;

// Create the instruction coder from the IDL
const instructionCoder = new BorshInstructionCoder(idl);

// Get instruction discriminators from the IDL using Anchor's coder
const INSTRUCTION_DISCRIMINATORS = {
  // From the IDL: registerUser instruction (camelCase in IDL)
  registerUser: instructionCoder.encode('registerUser', {}).slice(0, 8),
  
  // From the IDL: investInProject instruction (camelCase in IDL)
  investInProject: instructionCoder.encode('investInProject', {}).slice(0, 8),
  
  // From the IDL: initializeProject instruction (camelCase in IDL)
  initializeProject: instructionCoder.encode('initializeProject', {}).slice(0, 8),
};

/**
 * Serialize a u64 number to a Buffer for program instructions
 * This is a browser-safe replacement for BN.js
 * 
 * @param num - The number to serialize
 * @returns A buffer containing the serialized u64
 */
export function serializeU64(num: number): Buffer {
  // Create an 8-byte buffer (64 bits)
  const buffer = Buffer.alloc(8);
  
  // Convert to BigInt for precise 64-bit integers
  const bigIntVal = BigInt(Math.floor(num * 1e9)); // Convert to OFUND amount with 9 decimals
  
  // Write as little-endian 64-bit value (Solana's expected format)
  buffer.writeBigUInt64LE(bigIntVal, 0);
  
  return buffer;
}

/**
 * Create an invest in project instruction
 * 
 * @param payer - The investor's wallet address
 * @param userProfilePda - PDA for the user's profile
 * @param projectPda - PDA for the project
 * @param investorTokenAccount - The investor's token account for OFUND
 * @param projectVault - The token account to receive OFUND tokens
 * @param ofundMint - OFUND token mint address
 * @param amount - Amount to invest in USD (will be converted to OFUND with 9 decimals)
 * @returns TransactionInstruction for the investment
 */
export function createInvestInProjectInstruction(
  payer: PublicKey,
  userProfilePda: PublicKey,
  projectPda: PublicKey,
  investorTokenAccount: PublicKey,
  projectVault: PublicKey,
  ofundMint: PublicKey,
  amount: number,
): TransactionInstruction {
  console.log('[TX_BUILDER] Creating investment instruction for amount:', amount);

  // Format instruction data: [8 bytes discriminator][8 bytes u64 amount]
  const instructionData = Buffer.concat([
    INSTRUCTION_DISCRIMINATORS.investInProject,
    serializeU64(amount),
  ]);

  console.log('[TX_BUILDER] Instruction data:', instructionData.toString('hex'));

  // Define accounts in the correct order based on the program's instruction definition
  // This must match the Anchor IDL account structure for the investment instruction
  const keys = [
    { pubkey: payer, isSigner: true, isWritable: true },               // investor
    { pubkey: userProfilePda, isSigner: false, isWritable: true },     // userProfile
    { pubkey: projectPda, isSigner: false, isWritable: true },         // project
    { pubkey: investorTokenAccount, isSigner: false, isWritable: true }, // investorTokenAccount
    { pubkey: projectVault, isSigner: false, isWritable: true },       // projectVault
    { pubkey: ofundMint, isSigner: false, isWritable: false },         // mint
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },  // tokenProgram
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // systemProgram
  ];

  // Create and return the instruction
  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys,
    data: instructionData,
  });
}

/**
 * Create an instruction to register a user using the registerUser instruction
 * @param payer The user's wallet address that will pay for the transaction
 * @param userProfilePda PDA for the user profile account
 * @param bump The bump used to derive the PDA
 * @param ofundMint The OFUND token mint public key
 * @param userTokenAccount The user's token account for OFUND
 * @returns TransactionInstruction
 */
export function createInitializeUserProfileInstruction(
  payer: PublicKey,
  userProfilePda: PublicKey,
  bump: number,
  ofundMint: PublicKey,
  userTokenAccount: PublicKey,
): TransactionInstruction {
  console.log('[TX_BUILDER] Creating register user instruction');

  // Format instruction data: [8 bytes discriminator][1 byte bump]
  const instructionData = Buffer.concat([
    INSTRUCTION_DISCRIMINATORS.registerUser,
    Buffer.from([bump]), // userBump argument from IDL
  ]);
  
  console.log('[TX_BUILDER] Register user instruction data:', instructionData.toString('hex'));

  // Find the mint authority PDA
  // In Anchor, this is typically derived with ['mint-authority', mint]
  const mintAuthorityPdaSeed = Buffer.from('mint-authority');
  const [mintAuthorityPda] = PublicKey.findProgramAddressSync(
    [mintAuthorityPdaSeed, ofundMint.toBuffer()],
    PROGRAM_ID
  );
  
  // Find the mint authority account
  // This will be derived from the mint authority PDA
  const [mintAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from('authority'), ofundMint.toBuffer()],
    PROGRAM_ID
  );

  // Define all accounts needed based on the IDL for registerUser
  const keys = [
    { pubkey: payer, isSigner: true, isWritable: true },                 // user
    { pubkey: userProfilePda, isSigner: false, isWritable: true },         // userProfile
    { pubkey: ofundMint, isSigner: false, isWritable: true },              // mint
    { pubkey: userTokenAccount, isSigner: false, isWritable: true },       // userTokenAccount
    { pubkey: mintAuthority, isSigner: false, isWritable: false },         // mintAuthority
    { pubkey: mintAuthorityPda, isSigner: false, isWritable: false },      // mintAuthorityPda
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },      // tokenProgram
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // systemProgram
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },    // rent
  ];

  // Create and return the instruction
  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys,
    data: instructionData,
  });
}

// Delete duplicate functions - already defined below

/**
 * Create an instruction to initialize a project using the initializeProject instruction
 * @param payer The project creator's wallet address that will pay for the transaction
 * @param projectPda PDA for the project account
 * @param bump The bump used to derive the PDA
 * @param projectName The project's name
 * @param projectVault The project's vault account
 * @param ofundMint The OFUND token mint public key
 * @returns TransactionInstruction
 */
export function createInitializeProjectInstruction(
  payer: PublicKey,
  projectPda: PublicKey,
  bump: number,
  projectName: string,
  projectVault: PublicKey,
): TransactionInstruction {
  console.log('[TX_BUILDER] Creating initialize project instruction');

  // Format instruction data: [8 bytes discriminator][serialized project name][1 byte bump]
  // Create a buffer for the project name
  const nameBuffer = Buffer.from(projectName);
  const nameLenBuffer = Buffer.alloc(4);
  nameLenBuffer.writeUInt32LE(nameBuffer.length, 0);
  
  // Create the bump buffer
  const bumpBuffer = Buffer.from([bump]);
  
  // Construct the final instruction data following Anchor's Borsh serialization
  const instructionData = Buffer.concat([
    INSTRUCTION_DISCRIMINATORS.initializeProject,
    nameLenBuffer,                     // 4-byte length prefix for string
    nameBuffer,                        // actual string bytes
    bumpBuffer,                        // Bump as u8
  ]);
  
  console.log('[TX_BUILDER] Initialize project instruction data:', instructionData.toString('hex'));

  // Define all accounts needed based on the IDL for initializeProject
  // IMPORTANT: Must exactly match the IDL account structure - no additional accounts
  const keys = [
    { pubkey: payer, isSigner: true, isWritable: true },                 // authority
    { pubkey: projectPda, isSigner: false, isWritable: true },           // project
    { pubkey: projectVault, isSigner: false, isWritable: true },         // projectVault
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // systemProgram
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },  // rent
  ];

  // Create and return the instruction
  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys,
    data: instructionData,
  });
}

/**
 * Find the user profile PDA for a given user
 * 
 * @param user - The public key of the user
 * @returns A tuple of [pda, bump]
 */
export async function findUserProfilePda(user: PublicKey): Promise<[PublicKey, number]> {
  const [pda, bump] = await PublicKey.findProgramAddress(
    [Buffer.from('user-profile'), user.toBuffer()],
    PROGRAM_ID
  );
  return [pda, bump];
}

/**
 * Find the PDA for a project
 * 
 * @param projectName - The name of the project
 * @returns [PDA, bump] - The project PDA and bump seed
 */
export async function findProjectPda(projectName: string): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddress(
    [Buffer.from('project'), Buffer.from(projectName)],
    PROGRAM_ID
  );
}

/**
 * Find the mint authority PDAs
 * 
 * @param mint - The mint address
 * @returns [mintAuthorityPDA, authorityAccountPDA] - The two PDAs needed for mint authority
 */
export async function findMintAuthorityPDAs(
  mint: PublicKey
): Promise<[PublicKey, PublicKey]> {
  // Derive the mint authority PDA that can sign for the mint
  const [mintAuthorityPda] = await PublicKey.findProgramAddress(
    [Buffer.from('mint-authority'), mint.toBuffer()],
    PROGRAM_ID
  );

  // Derive the authority account PDA that stores metadata
  const [authorityAccountPda] = await PublicKey.findProgramAddress(
    [Buffer.from('authority'), mint.toBuffer()],
    PROGRAM_ID
  );

  return [mintAuthorityPda, authorityAccountPda];
}

/**
 * Send a transaction using direct web3.js methods
 * 
 * @param wallet - Connected wallet to sign the transaction
 * @param connection - Solana connection
 * @param instruction - The instruction to include in the transaction
 * @returns Transaction signature
 */
export async function sendTransaction(
  wallet: WalletContextState,
  connection: Connection,
  instruction: TransactionInstruction,
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected or missing required methods');
  }

  console.log('[TX_BUILDER] Creating transaction with instruction');

  // Create a new transaction with our instruction
  const transaction = new Transaction().add(instruction);
  
  // Get a recent blockhash for the transaction
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;

  console.log('[TX_BUILDER] Transaction created, requesting signature');

  // Have the wallet sign the transaction
  const signedTransaction = await wallet.signTransaction(transaction);

  console.log('[TX_BUILDER] Transaction signed, sending to network');

  // Send the signed transaction to the network
  const signature = await connection.sendRawTransaction(signedTransaction.serialize());

  console.log('[TX_BUILDER] Transaction sent, signature:', signature);
  console.log(`[TX_BUILDER] View on explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);

  // Return the transaction signature
  return signature;
}
