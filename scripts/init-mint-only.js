// Simple mint authority initialization script
const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction, SystemProgram, SYSVAR_RENT_PUBKEY } = require('@solana/web3.js');
const fs = require('fs');
const { TOKEN_PROGRAM_ID } = require('@solana/spl-token');

// Constants
const PROGRAM_ID = new PublicKey('CWYLQDPfH6eywYGJfrSdX2cVMczm88x3V2Rd4tcgk4jf');
const OFUND_MINT = new PublicKey('4pV3umk8pY62ry8FsnMbQfJBYgpWnzWcC67UCMUevXLY');

// Create the discriminator for initializeExistingMint (first 8 bytes of the SHA256 hash)
const discriminator = Buffer.from([
  95, 75, 212, 181, 85, 188, 101, 110
]);

// Load wallet
const keypairData = JSON.parse(fs.readFileSync(require('os').homedir() + '/.config/solana/id.json', 'utf-8'));
const wallet = Keypair.fromSecretKey(new Uint8Array(keypairData));
console.log(`Using wallet: ${wallet.publicKey.toString()}`);

// Get connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

async function main() {
  try {
    console.log('Starting mint authority initialization...');
    
    // Create PDAs
    const [mintAuthorityPda] = await PublicKey.findProgramAddress(
      [Buffer.from('mint-authority'), OFUND_MINT.toBuffer()],
      PROGRAM_ID
    );
    
    const [mintAuthority] = await PublicKey.findProgramAddress(
      [Buffer.from('authority'), OFUND_MINT.toBuffer()],
      PROGRAM_ID
    );
    
    console.log(`Mint Authority PDA: ${mintAuthorityPda.toString()}`);
    console.log(`Authority Account: ${mintAuthority.toString()}`);
    
    // Check if already initialized
    const mintAuthorityInfo = await connection.getAccountInfo(mintAuthority);
    if (mintAuthorityInfo) {
      console.log('✓ Mint authority already initialized!');
      return;
    }
    
    // Create instruction data with discriminator and parameters
    const authorityBump = 255; // We'll let the program handle finding the correct bump
    
    // Token details as buffers
    const tokenName = "OFUND Token";
    const tokenSymbol = "OFUND";
    const tokenUri = "https://otonom.fund/token";
    
    const nameBuffer = Buffer.from(tokenName);
    const nameLength = Buffer.alloc(4);
    nameLength.writeUInt32LE(nameBuffer.length, 0);
    
    const symbolBuffer = Buffer.from(tokenSymbol);
    const symbolLength = Buffer.alloc(4);
    symbolLength.writeUInt32LE(symbolBuffer.length, 0);
    
    const uriBuffer = Buffer.from(tokenUri);
    const uriLength = Buffer.alloc(4);
    uriLength.writeUInt32LE(uriBuffer.length, 0);
    
    // Combine into instruction data
    const instructionData = Buffer.concat([
      discriminator,
      Buffer.from([authorityBump]),
      nameLength,
      nameBuffer,
      symbolLength,
      symbolBuffer,
      uriLength,
      uriBuffer
    ]);
    
    // Create instruction
    const instruction = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: OFUND_MINT, isSigner: false, isWritable: true },
        { pubkey: mintAuthorityPda, isSigner: false, isWritable: false },
        { pubkey: mintAuthority, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      ],
      data: instructionData
    });
    
    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    transaction.feePayer = wallet.publicKey;
    
    const { blockhash } = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash;
    
    // Sign and send
    transaction.sign(wallet);
    const signature = await connection.sendRawTransaction(transaction.serialize());
    
    console.log(`Transaction sent! Signature: ${signature}`);
    console.log(`View on Solana Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    
    // Wait for confirmation
    await connection.confirmTransaction(signature);
    console.log('✓ Mint authority initialized successfully!');
    
  } catch (error) {
    console.error('Error:', error);
    if (error.logs) {
      console.log('Program logs:', error.logs);
    }
  }
}

main();
