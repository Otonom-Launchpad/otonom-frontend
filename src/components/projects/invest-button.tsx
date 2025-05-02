'use client';

import React, { useState, useEffect } from 'react';
import { useWallet, WalletContextState } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { getOfundBalance } from '@/services/token-service';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { getConnection } from '@/lib/solana-config';

interface InvestButtonProps {
  projectName: string;
  amount: number;
  tokenSymbol: string;
  tokenPrice: number;
  className?: string;
}

/**
 * Invest Now button for projects
 * Handles on-chain investment transaction
 */
/**
 * Create a user profile on-chain if it doesn't exist
 * Uses browser-compatible direct transaction construction
 */
async function createUserProfileIfNeeded(wallet: WalletContextState): Promise<void> {
  try {
    if (!wallet.publicKey) {
      console.error('Cannot create user profile - wallet not connected');
      return;
    }
    
    console.log('Ensuring user profile exists (direct construction method)...');
    
    // Import our transaction builder and OFUND_MINT
    const { createInitializeUserProfileInstruction, findUserProfilePda, sendTransaction } = 
      await import('@/services/transaction-builder');
    const { OFUND_MINT } = await import('@/lib/solana-config');
    const { getOrCreateAssociatedTokenAccount } = await import('@solana/spl-token');
    
    // Get a connection
    const connection = getConnection();
    
    // Find the user profile PDA
    const [userProfilePda, bump] = await findUserProfilePda(wallet.publicKey);
    console.log(`User profile PDA: ${userProfilePda.toString()}, bump: ${bump}`);
    
    // Check if account exists already
    const accountInfo = await connection.getAccountInfo(userProfilePda);
    if (accountInfo) {
      console.log('User profile already exists, skipping creation');
      return;
    }
    
    // Get or create the user's token account for OFUND
    console.log('Getting user token account for OFUND...');
    
    // First, find the associated token account address without creating it
    const { getAssociatedTokenAddress } = await import('@solana/spl-token');
    const userTokenAddress = await getAssociatedTokenAddress(
      OFUND_MINT,
      wallet.publicKey
    );
    console.log(`User token account address: ${userTokenAddress.toString()}`);
    
    // Check if the token account exists
    const tokenAccountInfo = await connection.getAccountInfo(userTokenAddress);
    
    // If it doesn't exist, we'll create it when we register the user through the program
    if (!tokenAccountInfo) {
      console.log('Token account does not exist yet - will be created during registration');
    } else {
      console.log('Token account already exists');
    }
    
    const userTokenAccount = userTokenAddress;
    console.log(`Using token account: ${userTokenAccount.toString()}`);
    
    // Create the instruction with all required accounts according to the IDL
    console.log('Creating register user instruction...');
    const instruction = createInitializeUserProfileInstruction(
      wallet.publicKey,
      userProfilePda,
      bump,
      OFUND_MINT,
      userTokenAccount
    );
    
    // Send the transaction
    console.log('Creating user profile on-chain...');
    const signature = await sendTransaction(wallet, connection, instruction);
    console.log(`User profile created with tx: ${signature}`);
    console.log(`View on explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
  } catch (error) {
    // Just log the error but continue - the investment transaction will likely fail
    // if the user profile doesn't exist, but maybe it does exist and we just got an error checking
    console.warn('Failed to ensure user profile exists, but continuing anyway:', error);
  }
}

export function InvestButton({ 
  projectName, 
  amount, 
  tokenSymbol, 
  tokenPrice,
  className = ''
}: InvestButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  
  // Validate investment amount and enable/disable button accordingly
  useEffect(() => {
    setButtonEnabled(amount > 0 && amount <= 100000);
  }, [amount]);

  const handleInvest = async () => {
    // Input validation
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid investment amount greater than 0.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    // Check if wallet is connected
    if (!wallet.connected || !wallet.publicKey) {
      console.log('Wallet not connected, showing connect modal');
      setVisible(true);
      return;
    }

    try {
      setIsProcessing(true);

      // DEBUG: Check RPC connection first
      try {
        const connection = getConnection();
        const balance = await connection.getBalance(wallet.publicKey);
        console.log(`Wallet SOL balance: ${balance / 1e9} SOL`);
      } catch (connectionError) {
        console.error('CRITICAL: Failed to connect to Solana RPC:', connectionError);
        throw new Error(`RPC Connection Failed: ${connectionError instanceof Error ? connectionError.message : String(connectionError)}`);
      }

      console.log(`Starting investment in "${projectName}" for $${amount}...`);
      console.log(`User wallet: ${wallet.publicKey.toString()}`);
      console.log(`Project name: ${projectName}`);
      console.log(`Amount: $${amount}`);
      
      // Get the existing token balance as a validation check
      console.log('Checking current OFUND balance...');
      const initialBalance = await getOfundBalance(wallet.publicKey);
      console.log('[INVEST] Current OFUND balance:', initialBalance);
      
      // We need to create a user profile first if it doesn't exist
      // Since we can't reliably check its existence in the browser without Anchor, we'll try to create it
      await createUserProfileIfNeeded(wallet);
      
      // Import our transaction builder for browser-compatible direct transactions
      console.log('Using direct transaction builder for browser compatibility...');
      const {
        createInvestInProjectInstruction,
        sendTransaction
      } = await import('@/services/transaction-builder');
      
      // We'll import the PDA functions directly when we need them for better code organization
      
      // Import configuration constants
      const { OFUND_MINT } = await import('@/lib/solana-config');
      
      // Get token account address for the user
      const { getAssociatedTokenAddress } = await import('@solana/spl-token');
      const { PublicKey } = await import('@solana/web3.js');
      
      // Get a connection to Solana
      const connection = getConnection();
      
      // Find user profile PDA
      console.log('Finding user profile PDA...');
      const { findUserProfilePda } = await import('@/services/transaction-builder');
      const [userProfilePda, bump] = await findUserProfilePda(wallet.publicKey);
      console.log(`User profile PDA: ${userProfilePda.toString()}, bump: ${bump}`);
      
      // Find project PDA
      console.log(`Finding project PDA for "${projectName}"`);
      const { findProjectPda } = await import('@/services/transaction-builder');
      const [projectPda, projectBump] = await findProjectPda(projectName);
      console.log(`Project PDA: ${projectPda.toString()}, bump: ${projectBump}`);
      
      // Get associated token accounts
      console.log('Getting token accounts...');
      // Investor's personal OFUND ATA
      const investorTokenAccount = await getAssociatedTokenAddress(
        OFUND_MINT,
        wallet.publicKey
      );
      console.log(`Investor token account: ${investorTokenAccount.toString()}`);

      // Fetch the vault address stored in the on-chain Project account
      const { getProjectVaultAddress } = await import('@/services/transaction-builder');
      const projectVault = await getProjectVaultAddress(connection, projectPda);
      console.log(`Project vault (on-chain): ${projectVault.toString()}`);
      
      // Create the instruction
      console.log('Creating invest instruction...');
      const instruction = createInvestInProjectInstruction(
        wallet.publicKey,
        userProfilePda,
        projectPda,
        investorTokenAccount,
        projectVault,
        OFUND_MINT,
        amount
      );
      
      // Send the transaction
      console.log('Sending transaction to Solana...');
      const signature = await sendTransaction(wallet, connection, instruction);
      
      console.log('Transaction successful!');
      console.log('Transaction signature:', signature);
      console.log(`View on explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
      
      // Show success message with transaction link
      toast({
        title: "Investment Successful!",
        description: (
          <div className="mt-2">
            <p>You've successfully invested ${amount} in {projectName}.</p>
            <p className="mt-2">
              <a 
                href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary/80"
              >
                View transaction on Solana Explorer
              </a>
            </p>
          </div>
        ),
        duration: 8000,
      });
      
    } catch (error: unknown) {
      console.error('INVESTMENT ERROR:', error);
      
      // Enhanced error logging
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Stack trace:', error.stack);
      } else {
        console.error('Unknown error type:', typeof error);
        console.error('Error stringified:', JSON.stringify(error));
      }
      
      // More user-friendly error message
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
        // Simplify error messages for better user experience
        if (errorMessage.includes('Anchor program')) {
          errorMessage = 'Blockchain program connection failed. Please try again.';
        } else if (errorMessage.includes('Wallet not connected')) {
          errorMessage = 'Wallet connection lost. Please reconnect your wallet.';
        } else if (errorMessage.includes('JSON RPC') || errorMessage.includes('connection')) {
          errorMessage = 'Network connection issue. Please check your internet and try again.';
        }
      }
      
      toast({
        title: "Investment Failed",
        description: `There was a problem processing your investment: ${errorMessage}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handleInvest}
      className={`w-full rounded-full ${buttonEnabled ? 'bg-primary hover:bg-primary/90' : 'bg-gray-500 cursor-not-allowed'} ${className}`}
      disabled={isProcessing || !buttonEnabled}
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing On-Chain Transaction...
        </>
      ) : (
        <>{amount > 0 ? `Invest $${amount} Now` : 'Enter Amount to Invest'}</>
      )}
    </Button>
  );
}
