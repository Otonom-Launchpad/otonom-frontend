import { PublicKey, SystemProgram } from '@solana/web3.js';
import { web3 } from '@coral-xyz/anchor';
import { signInWithWallet } from '@/lib/auth';
import { Buffer } from 'buffer';
import { PROGRAM_ID, TOKEN_PROGRAM_ID, OFUND_MINT, getConnection } from '@/lib/solana-config';
import type { WalletContextState } from '@solana/wallet-adapter-react';
import { initializeProgram, findUserProfilePDA } from '@/services/anchor-program';

/**
 * Get program instance with connected wallet using our specialized adapter
 * @param wallet The connected wallet from wallet adapter
 * @returns Anchor Program instance for OFUND token
 */
const getProgram = (wallet: WalletContextState) => {
  if (!wallet || !wallet.publicKey) {
    throw new Error('Wallet not connected');
  }
  
  return initializeProgram(wallet);
};

/**
 * Automatically register a user on-chain if not already registered
 * This is called when a wallet connects
 * @param wallet The wallet from wallet adapter
 * @returns Promise resolving to success boolean
 */
export const autoRegisterUserIfNeeded = async (wallet: WalletContextState): Promise<boolean> => {
  try {
    if (!wallet.publicKey) {
      console.error('No public key available');
      return false;
    }
    
    const userWalletAddress = wallet.publicKey.toString();
    
    // First, try to sign in with Supabase (and create account if needed)
    const { user, error } = await signInWithWallet(userWalletAddress);
    if (error) {
      console.error('Error signing in to Supabase:', error);
      return false;
    }
    
    // Then, check if the user exists on-chain
    try {
      if (!wallet.publicKey) {
        console.error('Wallet public key not available');
        return false;
      }
      
      // Get the PDA and bump for the user profile
      const { pda: userProfilePda, bump: userBump } = await findUserProfilePDA(wallet.publicKey);
      
      console.log('Checking if user profile exists on-chain...');
      
      // Get a connection instance
      const connection = getConnection();
      
      // Try to fetch the user profile
      const accountInfo = await connection.getAccountInfo(userProfilePda);
      
      // If no account exists, register the user
      if (!accountInfo) {
        console.log('No user profile found, registering user...');
        
        // Get the program
        const program = getProgram(wallet);
        
        // Add null check for professional error handling
        if (!program) {
          console.error('Failed to initialize program');
          return false;
        }
        
        // Use the consistent OFUND_MINT from solana-config
        const mint = OFUND_MINT;
        
        // Calculate mint authority PDA
        const [mintAuthorityPda] = await PublicKey.findProgramAddress(
          [Buffer.from('mint-authority'), mint.toBuffer()],
          PROGRAM_ID
        );
        
        // For a production app, we would use the proper associated token account
        // This is a simplified version for the hackathon to work with our contract
        const userTokenAccount = wallet.publicKey;
        
        console.log('Registering user with program...');
        console.log('User wallet:', wallet.publicKey.toString());
        console.log('User profile PDA:', userProfilePda.toString());
        console.log('User bump:', userBump);
        
        try {
          // Register user on-chain
          await program.methods
            .registerUser(userBump)
            .accounts({
              user: wallet.publicKey,
              userProfile: userProfilePda,
              mint: mint,
              userTokenAccount: userTokenAccount,
              mintAuthority: mintAuthorityPda,
              mintAuthorityPda: mintAuthorityPda,
              tokenProgram: TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
              rent: web3.SYSVAR_RENT_PUBKEY,
            })
            .rpc();
          console.log('Successfully sent registration transaction');
        } catch (err) {
          console.error('Error sending registration transaction:', err);
          throw err;
        }
        
        console.log('User successfully registered on-chain!');
        return true;
      }
      
      console.log('User already registered on-chain');
      return true;
    } catch (err) {
      console.error('Error registering user:', err);
      return false;
    }
  } catch (err) {
    console.error('Error registering user:', err);
    return false;
  }
};
