'use client';

import React, { useState, useEffect } from 'react';
import { useWallet, WalletContextState } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { getOfundBalance } from '@/services/token-service';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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
async function createUserProfileIfNeeded(wallet: WalletContextState): Promise<boolean> {
  if (!wallet.publicKey) {
    console.error('Cannot create user profile - wallet not connected');
    return false;
  }
  
  try {
    console.log('Ensuring user profile and OFUND ATA exist...');
    
    // Dynamic imports to keep bundle lean
    const {
      createInitializeUserProfileInstruction,
      findUserProfilePda,
      sendTransaction,
    } = await import('@/services/transaction-builder');
    const { OFUND_MINT } = await import('@/lib/solana-config');
    const {
      getAssociatedTokenAddress,
      createAssociatedTokenAccountInstruction,
    } = await import('@solana/spl-token');
    const connection = getConnection();
    
    // 1️⃣ Ensure the investor's OFUND ATA exists --------------------------------
    const userTokenAddress = await getAssociatedTokenAddress(
      OFUND_MINT,
      wallet.publicKey,
    );
    const tokenAccountInfo = await connection.getAccountInfo(userTokenAddress);
    if (!tokenAccountInfo) {
      console.log('OFUND ATA missing – creating...');
      const createAtaIx = createAssociatedTokenAccountInstruction(
        wallet.publicKey,      // payer
        userTokenAddress,      // ata to create
        wallet.publicKey,      // owner
        OFUND_MINT,            // mint
      );
      await sendTransaction(wallet, connection, createAtaIx);
      console.log('OFUND ATA created:', userTokenAddress.toString());
    } else {
      console.log('OFUND ATA already exists:', userTokenAddress.toString());
    }
    
    // 2️⃣ Ensure the user profile account exists -------------------------------
    const [userProfilePda, bump] = await findUserProfilePda(wallet.publicKey);
    const accountInfo = await connection.getAccountInfo(userProfilePda);
    if (accountInfo) {
      console.log('User profile already exists, skipping registration');
      return true;
    }
    
    console.log('Creating user profile on-chain...');
    const registerIx = createInitializeUserProfileInstruction(
      wallet.publicKey,
      userProfilePda,
      bump,
      OFUND_MINT,
      userTokenAddress,
    );
    await sendTransaction(wallet, connection, registerIx);
    console.log('User profile created successfully');
    return true;
  } catch (error) {
    console.error('Failed to create user profile / ATA:', error);
    toast.error('Profile Error', {
      description: 'Failed to check or create user profile. Please try again.',
    });
    return false;
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
      toast.error('Invalid Amount', {
        description: 'Please enter a valid investment amount greater than 0.',
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
      const profileOk = await createUserProfileIfNeeded(wallet);
      if (!profileOk) {
        toast.error('User setup failed', {
          description: 'Could not create your investor profile. Please try again.',
        });
        setIsProcessing(false);
        return; // Bail early – do NOT proceed to invest
      }
      
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
      console.log('View on explorer:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);

      // Show success toast
      toast.success(`Investment successful!`, {
        description: `Your $${amount} investment in ${projectName} was confirmed.`,
        descriptionClassName: 'text-gray-800', // Added class for darker text
        action: {
          label: 'View on Explorer',
          onClick: () => window.open(`https://explorer.solana.com/tx/${signature}?cluster=devnet`, '_blank'),
        },
      });
      
    } catch (error: unknown) {
      console.error('INVESTMENT ERROR:', error);

      let errorMessage = 'An unknown error occurred during the transaction.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      // Basic check for common Solana transaction errors (can be expanded)
      if (errorMessage.includes('Transaction simulation failed')) {
        errorMessage = 'Transaction simulation failed. Check your balance or network status.';
      } else if (errorMessage.includes('blockhash')) {
        errorMessage = 'Transaction expired. Please try again.';
      }

      // Show error toast using sonner
      toast.error('Investment Failed', {
        description: `There was a problem processing your investment: ${errorMessage}`,
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
