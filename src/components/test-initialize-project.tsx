'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { PublicKey, Transaction, TransactionInstruction, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { toast } from '@/components/ui/use-toast';
import { getConnection, OFUND_MINT, PROGRAM_ID } from '@/lib/solana-config';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';

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
      
      // Derive the associated token account for project vault
      const projectVault = await getAssociatedTokenAddress(
        OFUND_MINT,        // mint
        wallet.publicKey,  // owner
        false               // allowOwnerOffCurve
      );
      console.log(`Using project vault (ATA): ${projectVault.toString()}`);
      
      // Initialize project instruction discriminator for snake_case "initialize_project"
      // From verification script: initialize_project = [30, 193, 84, 123, 140, 205, 33, 51]
      const initializeProjectDiscriminator = Buffer.from([30, 193, 84, 123, 140, 205, 33, 51]);
      
      // Create a buffer for the project name
      const nameBuffer = Buffer.from(projectName);
      const nameLenBuffer = Buffer.alloc(4);
      nameLenBuffer.writeUInt32LE(nameBuffer.length, 0);
      
      // Create the bump buffer
      const bumpBuffer = Buffer.from([bump]);
      
      // Construct the final instruction data following Anchor's Borsh serialization
      const instructionData = Buffer.concat([
        initializeProjectDiscriminator,    // 8-byte instruction discriminator
        nameLenBuffer,                     // 4-byte length prefix for string
        nameBuffer,                        // actual string bytes
        bumpBuffer,                        // Bump as u8
      ]);
      
      console.log('Serialized instruction data:', instructionData.toString('hex'));
      
      // Construct the transaction instruction using manual account setup
      const instruction = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },      // authority
          { pubkey: projectPda, isSigner: false, isWritable: true },           // project
          { pubkey: projectVault, isSigner: false, isWritable: true },         // projectVault
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // systemProgram
          { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },  // rent
        ],
        data: instructionData,
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
      
      // Have the user sign the transaction
      const signedTransaction = await wallet.signTransaction(transaction);
      
      // Get a fresh blockhash right before sending to avoid the "Blockhash not found" error
      const { blockhash: newBlockhash } = await connection.getRecentBlockhash();
      signedTransaction.recentBlockhash = newBlockhash;
      
      try {
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
