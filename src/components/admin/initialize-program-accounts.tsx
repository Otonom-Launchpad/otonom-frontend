'use client';

import { FC, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getConnection, OFUND_MINT, PROGRAM_ID } from '@/lib/solana-config';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { createInitializeExistingMintInstruction, findMintAuthorityPDAs } from '@/services/transaction-builder';
import { Loader2 } from 'lucide-react';

/**
 * This component handles the one-time initialization of program accounts
 * required when deploying a new version of the program.
 *
 * It initializes:
 * 1. The mint authority for the OFUND token
 * 
 * This is needed before users can interact with the program.
 */
const InitializeProgramAccounts: FC = () => {
  const { publicKey, signTransaction } = useWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [mintAuthorityInitialized, setMintAuthorityInitialized] = useState<boolean | null>(null);

  const checkMintAuthority = async () => {
    try {
      setIsLoading(true);
      const connection = getConnection();
      const [_, mintAuthority] = await findMintAuthorityPDAs(new PublicKey(OFUND_MINT));
      const mintAuthorityInfo = await connection.getAccountInfo(mintAuthority);
      
      const isInitialized = !!mintAuthorityInfo;
      setMintAuthorityInitialized(isInitialized);
      
      toast({
        title: isInitialized 
          ? "Mint Authority Status" 
          : "Mint Authority Not Initialized",
        description: isInitialized 
          ? "The mint authority for OFUND token is already initialized and ready to use." 
          : "The mint authority needs to be initialized. Click the Initialize button.",
        variant: isInitialized ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error checking mint authority:", error);
      toast({
        title: "Error",
        description: "Failed to check mint authority status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitializeMintAuthority = async () => {
    if (!publicKey || !signTransaction) {
      toast({
        title: "Wallet Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const connection = getConnection();
      
      // Create transaction to initialize mint authority
      const tx = new Transaction();
      
      // Add instruction to initialize mint authority
      const initMintIx = await createInitializeExistingMintInstruction(
        publicKey,
        new PublicKey(OFUND_MINT),
        "OFUND Token",
        "OFUND", 
        "https://otonom.fund/token"
      );
      
      tx.add(initMintIx);
      
      // Get recent blockhash
      const { blockhash } = await connection.getRecentBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;
      
      // Sign transaction
      const signedTx = await signTransaction(tx);
      
      // Send transaction
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      
      // Wait for confirmation
      await connection.confirmTransaction(signature);
      
      console.log("Mint authority initialized successfully!");
      console.log(`Transaction signature: ${signature}`);
      
      toast({
        title: "Success",
        description: "Mint authority initialized successfully!",
      });
      
      // Mark as initialized
      setMintAuthorityInitialized(true);
      
    } catch (error) {
      console.error("Error initializing mint authority:", error);
      toast({
        title: "Error",
        description: `Failed to initialize mint authority: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-4 bg-slate-50 rounded-lg border shadow-sm">
      <h2 className="text-xl font-semibold">Program Initialization</h2>
      <p className="text-sm text-slate-600">
        After deploying a new version of the Solana program, one-time initialization is required.
        This initializes the mint authority for the OFUND token.
      </p>
      
      <div className="flex flex-col space-y-2">
        <h3 className="font-medium">Environment Information:</h3>
        <div className="grid grid-cols-1 gap-1 text-sm">
          <div><span className="font-medium">Program ID:</span> {PROGRAM_ID.toString()}</div>
          <div><span className="font-medium">OFUND Token Mint:</span> {OFUND_MINT.toString()}</div>
        </div>
      </div>
      
      <div className="flex flex-col space-y-2">
        <h3 className="font-medium">Mint Authority Status:</h3>
        {mintAuthorityInitialized === null ? (
          <div className="text-sm text-slate-500">Not checked yet. Click Check Status.</div>
        ) : mintAuthorityInitialized ? (
          <div className="text-sm text-green-600">
            ✅ Mint authority is initialized and ready to use
          </div>
        ) : (
          <div className="text-sm text-red-600">
            ❌ Mint authority needs to be initialized
          </div>
        )}
      </div>
      
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={checkMintAuthority}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Check Status
        </Button>
        
        <Button 
          onClick={handleInitializeMintAuthority}
          disabled={isLoading || mintAuthorityInitialized === true}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Initialize Mint Authority
        </Button>
      </div>
    </div>
  );
};

export default InitializeProgramAccounts;
