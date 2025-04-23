'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { investInProject, ensureUserProfileExists } from '@/services/investment-service';
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
      
      // First, ensure the user profile exists on-chain
      console.log('Ensuring user profile exists on-chain...');
      const profileExists = await ensureUserProfileExists(wallet);
      if (!profileExists) {
        throw new Error('Failed to create or verify user profile on-chain');
      }
      
      // Now execute the real on-chain transaction
      console.log('Calling investInProject function...');
      const signature = await investInProject(wallet, projectName, amount);
      
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
