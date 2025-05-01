'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { PublicKey, Transaction, TransactionInstruction, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { toast } from '@/components/ui/use-toast';
import { getConnection, OFUND_MINT, PROGRAM_ID } from '@/lib/solana-config';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import * as crypto from 'crypto';

// Professional approach: calculate instruction discriminator on-the-fly
function sha256(data: string): Buffer {
  return crypto.createHash('sha256').update(data).digest();
}

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
      
      // Professional approach: using the sha256 function defined above
      
      // We'll try format with module namespace prefix
      const formats = [
        { name: 'camelCase', value: 'initializeProject' },
        { name: 'snake_case', value: 'initialize_project' },
        { name: 'namespace-new', value: 'otonom_program::initialize_project' },
        { name: 'namespace-old', value: 'otonom_minimal::initialize_project' },
      ];
      
      // Select which format to use - using old namespace format to match deployed program
      const selectedFormat = formats[3]; // Use old otonom_minimal namespace to match deployed program
      console.log(`Using instruction format: ${selectedFormat.name} ("${selectedFormat.value}")`)
      
      // Calculate the instruction discriminator from the selected format
      const discriminator = sha256(selectedFormat.value).slice(0, 8);
      console.log(`Calculated discriminator: [${Array.from(discriminator).join(', ')}]`);
      
      // Create a buffer for the project name
      const nameBuffer = Buffer.from(projectName);
      const nameLenBuffer = Buffer.alloc(4);
      nameLenBuffer.writeUInt32LE(nameBuffer.length, 0);
      
      // Create the bump buffer
      const bumpBuffer = Buffer.from([bump]);
      
      // Construct the final instruction data following Anchor's Borsh serialization
      const instructionData = Buffer.concat([
        discriminator,                     // 8-byte instruction discriminator
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
