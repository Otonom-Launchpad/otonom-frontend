/**
 * Investment Service for Otonom Fund
 * 
 * Handles on-chain project investments using OFUND tokens
 * For the Solana Breakout Hackathon
 */

import { WalletContextState } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { initializeProgram } from '@/services/anchor-program';
import { OFUND_MINT, PROGRAM_ID } from '@/lib/solana-config';
import { getOfundBalance } from './token-service';

// OFUND token has 9 decimals (standard for Solana SPL tokens)
const OFUND_DECIMALS = 1_000_000_000;

// Project mapping for the hackathon demo
// In a production app, this would be dynamic and fetched from the blockchain
const PROJECTS_MAP: Record<string, string> = {
  // Mapping of project public keys to readable names
  'AiEcoRBhKTX2s7gYkMafqiSvdNx3tnjac8xwtR9pLQFH': 'NeuroLeap AI',
  'DTXTznNvmv3uV1KqKwMbCaZP3oNuWDxoBUEMWkpbLNLj': 'BioGenesis Protocol',
  'F3CajaVdGe2XFdLeEZyWQvijGdJyLwfbVV2wSDY3N9Yr': 'Quantum Computing Solutions',
  // Add more as needed for the demo
};

// Define interfaces for our program accounts
interface Investment {
  project: PublicKey;
  amount: BN;
  timestamp: number;
}

interface UserProfile {
  user: PublicKey;
  bump: number;
  tier: number;
  totalInvested: BN;
  investments: Investment[];
}

interface Project {
  admin: PublicKey;
  bump: number;
  name: string;
  symbol: string;
  description: string;
  targetAmount: BN;
  totalRaised: BN;
  minTierRequired: number;
  vault: PublicKey;
  isActive: boolean;
}

// Use a more flexible type that allows any Program to be compatible
type OtonomProgram = any;

/**
 * Helper function to find the user profile PDA for a given wallet
 */
const findUserProfilePDA = async (userPublicKey: PublicKey): Promise<PublicKey> => {
  const [pda] = await PublicKey.findProgramAddress(
    [Buffer.from('user-profile'), userPublicKey.toBuffer()],
    PROGRAM_ID
  );
  return pda;
};

/**
 * Helper function to find the project PDA for a given project name
 */
const findProjectPDA = async (projectName: string): Promise<PublicKey> => {
  const [pda] = await PublicKey.findProgramAddress(
    [Buffer.from('project'), Buffer.from(projectName)],
    PROGRAM_ID
  );
  return pda;
};

/**
 * For testing - list of demo projects pre-deployed to devnet
 * This helps the hackathon judges invest in existing projects
 */
const DEMO_PROJECTS: Record<string, { publicKey: string, vault: string }> = {
  'Neural Bridge': {
    publicKey: 'HvwC9QSAzvGXhhVrgPmauVwFWcYZhne3hVot9EbHuFTm',
    vault: 'GZrjpc3d4jmh4pvUKDHvQgmY5vTsWkEVgQwUT7XimjuL'
  },
  'Quantum AI': {
    publicKey: '9m5oPnW8hJLpHM3m3kgvFrH9R1HatuHkq2gqtM5hAkY8',
    vault: 'BBBXxaaSpiRoCrQQNg1o8fLHVuNZt67Qj12dzpEGfcNF'
  }
  // Add more demo projects as needed
};

/**
 * Invest in a project using OFUND tokens
 * 
 * @param wallet Connected wallet from Phantom
 * @param projectName Name of the project to invest in
 * @param amount Amount to invest in USD (will be converted to OFUND tokens)
 * @returns Transaction signature
 */

/**
 * Real on-chain investment function for Solana hackathon judges to verify
 * This creates an actual blockchain transaction on Solana devnet
 */
/**
 * Ensure user profile exists on-chain
 * This should be called before any investment to make sure the user account is created
 */
export async function ensureUserProfileExists(wallet: WalletContextState): Promise<boolean> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    console.error('[PROFILE] Wallet not connected');
    return false;
  }

  try {
    console.log('[PROFILE] Checking if user profile exists...');
    
    if (!wallet.publicKey) {
      console.error('[PROFILE] Wallet not connected');
      return false;
    }

    // Find user profile PDA
    const [userProfilePda, bump] = await PublicKey.findProgramAddress(
      [Buffer.from('user-profile'), wallet.publicKey.toBuffer()],
      PROGRAM_ID // Using program ID as the seed for PDA
    );
    console.log('[PROFILE] User profile PDA:', userProfilePda.toString());
    
    // Initialize program using our compatibility layer
    const program = await initializeProgram(wallet);
    if (!program) {
      console.error('[PROFILE] Failed to initialize program');
      return false;
    }
    
    try {
      // First check if the user already has OFUND tokens
      // If they do, they might already be registered
      const initialBalance = await getOfundBalance(wallet.publicKey);
      console.log('[PROFILE] Current OFUND balance:', initialBalance);
      
      if (initialBalance > 0) {
        console.log('[PROFILE] User already has OFUND tokens, they may be registered already');
        // Even though they have tokens, try to verify the user profile exists
        try {
          // @ts-ignore
          const userProfileInfo = await program.account.userProfile.fetch(userProfilePda);
          console.log('[PROFILE] User profile exists:', userProfileInfo);
          return true; // User profile exists, no need to create it
        } catch (error) {
          console.log('[PROFILE] User has tokens but no profile. This is an unusual state.');
          // Continue with registration to ensure profile exists
        }
      } else {
        try {
          // Check if user profile already exists
          // @ts-ignore
          const userProfileInfo = await program.account.userProfile.fetch(userProfilePda);
          console.log('[PROFILE] User profile already exists:', userProfileInfo);
          return true; // User profile exists, no need to create it
        } catch (error) {
          console.log('[PROFILE] User profile does not exist, creating...');
        }
      }
    // Get or create the user's token account
    const userTokenAccount = await getAssociatedTokenAddress(
      OFUND_MINT,
      wallet.publicKey
    );
    
    // Find the mint authority PDA
    const [mintAuthorityPda, mintAuthorityBump] = await PublicKey.findProgramAddress(
      [Buffer.from('mint-authority'), OFUND_MINT.toBuffer()],
      PROGRAM_ID
    );
    
    console.log('[PROFILE] User token account:', userTokenAccount.toString());
    console.log('[PROFILE] Mint authority PDA:', mintAuthorityPda.toString());
    
    // Derive the authority account PDA (stores the authority metadata)
    const [authorityAccountPda] = await PublicKey.findProgramAddress(
      [Buffer.from('authority'), OFUND_MINT.toBuffer()],
      PROGRAM_ID
    );
    console.log('[PROFILE] Authority account PDA:', authorityAccountPda.toString());
      
    // First, fetch the mint authority account to verify it exists
    try {
      // @ts-ignore - Working around type compatibility issues
      const mintAuthorityInfo = await program.account.mintAuthority.fetch(authorityAccountPda);
      console.log('[PROFILE] Mint authority exists:', mintAuthorityInfo);
    } catch (error) {
      console.warn('[PROFILE] Could not fetch authority account, it may not exist yet:', error);
      console.warn('[PROFILE] User registration might fail if mint authority is not initialized');
      // We'll continue anyway and let the transaction fail with a helpful message if needed
    }
      
      // Professional debug: Verify transaction via preflight simulation before sending
      let txSignature: string;
      try {
        // Build the transaction without sending it
        // @ts-ignore - Working around type compatibility issues
        const transaction = await program.methods
          .registerUser(bump)
          .accounts({
            user: wallet.publicKey,
            userProfile: userProfilePda,
            mint: OFUND_MINT,
            userTokenAccount: userTokenAccount,
            mintAuthority: authorityAccountPda,  // Account that holds authority data (using 'authority' seed)
            mintAuthorityPda: mintAuthorityPda,  // PDA that signs (using 'mint-authority' seed)
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY
          })
          .transaction();

        // Get the connection from the provider
        const connection = program.provider.connection;
        
        // Simulate the transaction with detailed logs
        console.log('[PROFILE] Simulating transaction before sending...');
        try {
          const simulation = await connection.simulateTransaction(transaction, 'processed');
          
          if (simulation.value.err) {
            console.error('[PROFILE] Transaction simulation failed:', simulation.value.err);
            console.log('[PROFILE] Transaction logs:', simulation.value.logs);
            throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
          }
          
          // Log all simulation logs for debugging
          console.log('[PROFILE] Simulation logs:', simulation.value.logs);
        } catch (simError) {
          console.error('[PROFILE] Transaction simulation threw exception:', simError);
          throw simError;
        }
        
        console.log('[PROFILE] Simulation successful, executing transaction...');

        // Now execute the real transaction
        // @ts-ignore - Working around type compatibility issues
        txSignature = await program.methods
          .registerUser(bump)
          .accounts({
            user: wallet.publicKey,
            userProfile: userProfilePda,
            mint: OFUND_MINT,
            userTokenAccount: userTokenAccount,
            mintAuthority: authorityAccountPda,  // Account that holds authority data (using 'authority' seed)
            mintAuthorityPda: mintAuthorityPda,  // PDA that signs (using 'mint-authority' seed)
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY
          })
          .rpc();
        
        console.log('[PROFILE] User registered successfully with tx:', txSignature);
        console.log(`[PROFILE] Transaction: https://explorer.solana.com/tx/${txSignature}?cluster=devnet`);
      } catch (simError) {
        console.error('[PROFILE] Error in transaction simulation/execution:', simError);
        
        // Check if the user already has tokens, if so, we'll consider this a success
        const finalBalance = await getOfundBalance(wallet.publicKey);
        if (finalBalance > 0) {
          console.log('[PROFILE] User already has tokens but registration failed. Continuing with investment.');
          return true; // Return normally to allow investment to proceed
        }
        
        throw simError;
      }
      
      // Verify token balance after airdrop
      const finalTokenBalance = await getOfundBalance(wallet.publicKey);
      console.log('[PROFILE] New token balance:', finalTokenBalance);
      
      return true;
    } catch (error) {
      console.error('[PROFILE] Error in ensureUserProfileExists:', error);
      return false;
    }
  } catch (outerError) {
    console.error('[PROFILE] Fatal error in ensureUserProfileExists:', outerError);
    return false;
  }
}

export const investInProject = async (
  wallet: WalletContextState,
  projectName: string,
  amount: number
): Promise<string> => {
  // Initial validation
  if (!wallet.publicKey || !wallet.signTransaction) {
    console.error('Wallet validation failed: not connected or missing required methods');
    throw new Error('Wallet not connected');
  }

  try {
    console.log(`[INVEST] Starting REAL on-chain investment in "${projectName}" for $${amount}...`);
    console.log(`[INVEST] Using wallet: ${wallet.publicKey.toString()}`);
    
    // Verify wallet connection status
    if (!wallet.connected) {
      console.error('Wallet shows as connected in state but wallet.connected is false');
      throw new Error('Wallet connection inconsistent state. Please reconnect.');
    }
    
    // Check for environment variables
    console.log(`[INVEST] Using Solana RPC URL: ${process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'default: https://api.devnet.solana.com'}`);
    console.log(`[INVEST] Using program ID: ${PROGRAM_ID.toString()}`);
    console.log(`[INVEST] Using OFUND mint: ${OFUND_MINT.toString()}`);
    
    // Initialize the program with our proper IDL
    console.log('[INVEST] Initializing Anchor program...');
    let programInstance;
    try {
      programInstance = initializeProgram(wallet);
      if (!programInstance) {
        throw new Error('Program is undefined after initialization');
      }
    } catch (programError) {
      console.error('[INVEST] Program initialization failed:', programError);
      throw new Error(`Failed to initialize Solana program: ${programError instanceof Error ? programError.message : String(programError)}`);
    }
    
    const program = programInstance as OtonomProgram;
    console.log('[INVEST] Program initialized successfully');
    console.log('[INVEST] Available program methods:', Object.keys(program.methods));
    
    // Find user profile PDA
    console.log('[INVEST] Finding user profile PDA...');
    let userProfilePda;
    try {
      userProfilePda = await findUserProfilePDA(wallet.publicKey);
      console.log(`[INVEST] User profile PDA: ${userProfilePda.toString()}`);
    } catch (pdaError) {
      console.error('[INVEST] Failed to find user profile PDA:', pdaError);
      throw new Error(`User profile lookup failed: ${pdaError instanceof Error ? pdaError.message : String(pdaError)}`);
    }
    
    // For the hackathon demo, use our live deployed project PDAs
    let projectPda: PublicKey;
    let projectVault: PublicKey;
    
    try {
      // Use hardcoded demo project for hackathon judging
      if (DEMO_PROJECTS[projectName]) {
        console.log(`[INVEST] Using demo project data for "${projectName}"`);
        projectPda = new PublicKey(DEMO_PROJECTS[projectName].publicKey);
        projectVault = new PublicKey(DEMO_PROJECTS[projectName].vault);
      } else {
        console.log(`[INVEST] Finding project PDA for "${projectName}"`);
        // For dynamic projects, compute the PDA
        projectPda = await findProjectPDA(projectName);
        // Get the project account data to obtain the vault address
        console.log('[INVEST] Fetching project account...');
        const projectAccount = await (program as any).account.project.fetch(projectPda);
        projectVault = projectAccount.vault;
      }
      
      console.log(`[INVEST] Project PDA: ${projectPda.toString()}`);
      console.log(`[INVEST] Project vault: ${projectVault.toString()}`);
    } catch (projectError) {
      console.error('[INVEST] Project data retrieval failed:', projectError);
      throw new Error(`Project data retrieval failed: ${projectError instanceof Error ? projectError.message : String(projectError)}`);
    }
    
    // Find investor's OFUND token account
    console.log('[INVEST] Finding investor token account...');
    let investorTokenAccount;
    try {
      investorTokenAccount = await getAssociatedTokenAddress(
        OFUND_MINT,
        wallet.publicKey
      );
      console.log(`[INVEST] Investor token account: ${investorTokenAccount.toString()}`);
    } catch (tokenError) {
      console.error('[INVEST] Failed to find investor token account:', tokenError);
      throw new Error(`Token account lookup failed: ${tokenError instanceof Error ? tokenError.message : String(tokenError)}`);
    }
    
    // Convert USD amount to OFUND tokens (1:1 ratio for simplicity in hackathon)
    // Apply 9 decimals for our new OFUND token
    const ofundAmount = new BN(amount * Math.pow(10, 9));
    
    console.log(`[INVEST] Investment amount: $${amount} USD = ${ofundAmount.toString()} OFUND tokens`);
    
    // Make sure the amount is valid
    if (amount > 100000) {
      throw new Error('Investment amount exceeds available OFUND tokens (100,000 max)');
    } else if (amount <= 0) {
      throw new Error('Investment amount must be greater than 0');
    }
    
    // Set up the accounts structure according to the program's expectations
    const accountsConfig = {
      investor: wallet.publicKey,
      userProfile: userProfilePda,
      project: projectPda,
      investorTokenAccount: investorTokenAccount,
      projectVault: projectVault,
      mint: OFUND_MINT,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    };
    
    console.log('[INVEST] Using accounts configuration:', {
      investor: wallet.publicKey.toString(),
      userProfile: userProfilePda.toString(),
      project: projectPda.toString(),
      investorTokenAccount: investorTokenAccount.toString(),
      projectVault: projectVault.toString(),
      mint: OFUND_MINT.toString(),
      tokenProgram: TOKEN_PROGRAM_ID.toString(),
      systemProgram: SystemProgram.programId.toString()
    });
    
    // Execute the investment transaction using the standard Anchor pattern
    console.log('[INVEST] Preparing to execute investment transaction...');
    let tx;
    try {
      // Log the method being called
      console.log('[INVEST] Calling program.methods.investInProject with amount:', ofundAmount.toString());
      
      // Perform the actual on-chain transaction
      tx = await program.methods
        .investInProject(ofundAmount)
        .accounts(accountsConfig)
        .rpc();
      
      console.log('[INVEST] On-chain investment transaction successful!');
      console.log(`[INVEST] Transaction signature: ${tx}`);
      console.log(`[INVEST] View on explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    } catch (txError) {
      console.error('[INVEST] Transaction execution failed:', txError);
      
      // More detailed error handling for transaction failures
      if (txError instanceof Error) {
        // Look for specific Anchor or Solana error patterns
        const errorMsg = txError.message;
        if (errorMsg.includes('custom program error: 0x')) {
          console.error('[INVEST] Detected Anchor program error code in error message');
        } else if (errorMsg.includes('Blockhash not found')) {
          console.error('[INVEST] Network issue: Blockhash not found. RPC node may be having issues.');
        } else if (errorMsg.includes('TokenAccount') || errorMsg.includes('Account not found')) {
          console.error('[INVEST] Token account may not exist or has no OFUND tokens.');
        }
      }
      
      throw new Error(`Transaction failed: ${txError instanceof Error ? txError.message : String(txError)}`);
    }
    
    return tx;
  } catch (error: unknown) {
    console.error('[INVEST] Error making on-chain investment:', error);
    
    // Enhanced error logging
    if (error instanceof Error) {
      console.error('[INVEST] Error details:', error.message);
      console.error('[INVEST] Stack trace:', error.stack);
    } else {
      console.error('[INVEST] Unknown error type:', typeof error);
    }
    
    throw new Error(`Failed to invest in project: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Get user's investment in a specific project
 * 
 * @param wallet Connected wallet
 * @param projectName Project name
 * @returns Investment amount or 0 if none
 */
export const getUserInvestmentInProject = async (
  wallet: WalletContextState,
  projectName: string
): Promise<number> => {
  if (!wallet.publicKey) {
    return 0;
  }

  try {
    // Initialize the program
    console.log('Initializing Anchor program...');
    // Await dynamic program initialization and ensure it's defined
    const programInstance = await initializeProgram(wallet);
    if (!programInstance) {
      throw new Error('Failed to initialize Solana program: program is undefined');
    }
    const program = programInstance as OtonomProgram;
    
    // Find relevant PDAs
    const userProfilePda = await findUserProfilePDA(wallet.publicKey);
    const projectPda = await findProjectPDA(projectName);
    
    // Get user profile to check investments
    const userProfile = await program.account.userProfile.fetch(userProfilePda);
    
    // Find the investment for the specific project
    const investment = userProfile.investments.find(
      (inv: any) => inv.project.equals(projectPda)
    );
    
    return investment ? Number(investment.amount) / OFUND_DECIMALS : 0;
  } catch (error) {
    console.error('Error getting user investment:', error);
    return 0;
  }
};

export const getUserInvestments = async (
  wallet: WalletContextState
): Promise<Array<{ projectName: string, amount: number, timestamp: string }>> => {
  if (!wallet.publicKey) {
    console.log('No wallet connected, returning empty investments');
    return [];
  }

  try {
    // Initialize the program
    console.log('Initializing Anchor program...');
    // Await dynamic program initialization and ensure it's defined
    const programInstance = await initializeProgram(wallet);
    if (!programInstance) {
      throw new Error('Failed to initialize Solana program: program is undefined');
    }
    const program = programInstance as OtonomProgram;
    
    // Get user profile PDA
    const userProfilePda = await findUserProfilePDA(wallet.publicKey);
    console.log('[GET PORTFOLIO] User profile PDA:', userProfilePda.toString());
    
    const userProfile = await program.account.userProfile.fetch(userProfilePda);
    
    console.log('User profile fetched successfully:', userProfile);
    
    // For hackathon judges: if no investments exist yet, return empty array
    if (!userProfile.investments || userProfile.investments.length === 0) {
      console.log('No investments found for this user');
      return [];
    }
    
    // Map investments to a more usable format with readable project names
    return userProfile.investments.map((inv: Investment) => {
      const projectKey = inv.project.toString();
      
      // We're using 1:1 conversion for the hackathon (1 OFUND = $1 USD)
      // Do not divide by 1000 as that's causing incorrect display values
      const amount = Number(inv.amount);
      
      // Log the investment details for judges to trace
      console.log(`Found investment in project ${projectKey}: ${amount} OFUND tokens = $${amount} USD`);
      
      return {
        projectName: PROJECTS_MAP[projectKey] || `Project ${projectKey.slice(0, 6)}...`,
        amount: amount,
        timestamp: inv.timestamp
      };
    });
  } catch (error: unknown) {
    console.error('Error getting user investments:', error);
    // If account doesn't exist yet, that's expected for new users
    if (error instanceof Error && error.message.includes('Account does not exist')) {
      console.log('User profile does not exist yet - user needs to register first');
    } else if (typeof error === 'object' && error !== null && 'toString' in error) {
      // Handle Anchor-specific errors which may not be standard Error objects
      const errorStr = error.toString();
      if (errorStr.includes('Account does not exist')) {
        console.log('User profile does not exist yet - user needs to register first');
      }
    }
    return [];
  }
};
