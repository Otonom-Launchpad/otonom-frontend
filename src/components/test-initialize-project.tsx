'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { PublicKey, Transaction, TransactionInstruction, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { toast } from '@/components/ui/use-toast';
import { getConnection, OFUND_MINT, PROGRAM_ID } from '@/lib/solana-config';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import idl from '@/idl/spg/ofund-idl-deployed.json';
import { BorshInstructionCoder } from '@project-serum/anchor';

/**
 * Test component to initialize a project
 * This helps verify our deployed program actually has the initialize_project instruction
 */
export function TestInitializeProject() {
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);

  const handleInitializeProject = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log('Starting project initialization test...');
      const connection = getConnection();
      
      // Generate a unique project name for testing
      const projectName = `TestProject_${Math.floor(Math.random() * 10000)}`;
      
      // Derive the project PDA
      const [projectPda, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from('project'), Buffer.from(projectName)],
        PROGRAM_ID
      );
      console.log(`Project PDA: ${projectPda.toString()}, bump: ${bump}`);
      
      // Derive the associated token account for project vault and log it
      const projectVault = await getAssociatedTokenAddress(
        OFUND_MINT,        // mint
        wallet.publicKey,  // owner
        false              // allowOwnerOffCurve
      );
      console.log(`Using project vault (ATA): ${projectVault.toString()}`);
      
      // Use Anchor's BorshInstructionCoder to serialize the initializeProject instruction
      const coder = new BorshInstructionCoder(idl);
      const ixData = coder.encode('initializeProject', { projectName: projectName });
      console.log('Serialized instruction data via Anchor:', ixData.toString('hex'));
      
      // Construct the transaction instruction using Anchor BorshInstructionCoder
      const instruction = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },      // authority
          { pubkey: projectPda, isSigner: false, isWritable: true },           // project
          { pubkey: projectVault, isSigner: false, isWritable: true },         // projectVault
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // systemProgram
          { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },  // rent
        ],
        data: ixData,
      });
      
      // Check if the ATA exists for the project vault
      const ataInfo = await connection.getAccountInfo(projectVault);
      
      // Create and sign the transaction
      const { blockhash } = await connection.getRecentBlockhash();
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: wallet.publicKey
      });
      
      // If ATA doesn't exist, create it first
      if (!ataInfo) {
        console.log('Project vault ATA does not exist, creating it first.');
        transaction.add(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey,   // payer
            projectVault,       // ata
            wallet.publicKey,   // owner
            OFUND_MINT          // mint
          )
        );
      }
      
      // Add the initialize project instruction
      transaction.add(instruction);
      
      // We'll use a short transaction timeout to ensure the blockhash is still valid
      // when we send the transaction
      try {
        // Sign and send the transaction in a single step, without manually updating the blockhash afterwards
        const signedTransaction = await wallet.signTransaction(transaction);
        
        // Immediately send the transaction after signing to avoid blockhash expiration
        // Send the signed transaction
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        console.log(`Transaction submitted with signature: ${signature}`);
        
        // Wait for confirmation
        const confirmation = await connection.confirmTransaction(signature, 'confirmed');
        console.log('Transaction confirmed:', confirmation);
        
        // Provide a link to the transaction on Solana Explorer
        const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
        console.log(`View transaction on Solana Explorer: ${explorerUrl}`);
        
        toast({
          title: 'Project Initialized Successfully',
          description: (
            <div>
              Transaction confirmed! <a href={explorerUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>View on Explorer</a>
            </div>
          ),
        });
      } catch (error: any) {
        console.error('Error sending transaction:', error);
        if (error.logs) {
          console.error('Transaction logs:', error.logs);
        }
        
        toast({
          title: 'Transaction Failed',
          description: 'Failed to initialize project. See console for details.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error initializing project:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize project. See console for details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleInitializeProject}
      disabled={loading || !wallet.publicKey}
      className="w-full"
    >
      {loading ? 'Processing...' : 'Test: Initialize Project'}
    </Button>
  );
}
