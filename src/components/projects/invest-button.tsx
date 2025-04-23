'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCustomWalletModal } from '@/components/wallet/CustomWalletModalProvider';
import { investInProject } from '@/services/investment-service';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

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
  const wallet = useWallet();
  const { setVisible } = useCustomWalletModal();

  const handleInvest = async () => {
    // Check if wallet is connected
    if (!wallet.connected || !wallet.publicKey) {
      setVisible(true);
      return;
    }

    try {
      setIsProcessing(true);

      console.log(`Starting investment in ${projectName} for $${amount}...`);
      
      // Execute the real on-chain transaction
      const signature = await investInProject(wallet, projectName, amount);
      
      console.log('Transaction successful with signature:', signature);
      
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
      console.error('Investment failed:', error);
      
      toast({
        title: "Investment Failed",
        description: `There was a problem processing your investment: ${error instanceof Error ? error.message : String(error)}`,
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
      className={`w-full rounded-full bg-primary hover:bg-primary/90 ${className}`}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>Invest Now</>
      )}
    </Button>
  );
}
