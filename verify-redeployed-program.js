/**
 * Script to verify a redeployed Solana program
 * Checks for valid ELF header and proper program structure
 */
const { Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');

// The program ID we're using
const PROGRAM_ID_STRING = 'CWYLQDPfH6eywYGJfrSdX2cVMczm88x3V2Rd4tcgk4jf';
const PROGRAM_ID = new PublicKey(PROGRAM_ID_STRING);

// Connect to devnet
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

async function verifyProgram() {
  console.log('Verifying redeployed program...\n');
  
  try {
    // Get the program account
    const programAccount = await connection.getAccountInfo(PROGRAM_ID);
    
    if (!programAccount) {
      console.log('❌ Program not found on devnet');
      return;
    }
    
    console.log(`Program account size: ${programAccount.data.length} bytes`);
    console.log(`Program is executable: ${programAccount.executable}`);
    console.log(`Program owner: ${programAccount.owner.toString()}`);
    
    // For upgradeable programs, extract the program data account address
    if (programAccount.owner.toString() === 'BPFLoaderUpgradeab1e11111111111111111111111') {
      const programDataPubkey = new PublicKey(programAccount.data.slice(4));
      console.log(`Program data account: ${programDataPubkey.toString()}`);
      
      // Get the program data account
      const programDataAccount = await connection.getAccountInfo(programDataPubkey);
      
      if (!programDataAccount) {
        console.log('❌ Program data account not found');
        return;
      }
      
      console.log(`Program data size: ${programDataAccount.data.length} bytes`);
      
      // First 8 bytes of program data account are metadata
      if (programDataAccount.data.length < 8) {
        console.log('❌ Program data too small to contain metadata');
        return;
      }
      
      // Get deployment slot and program length
      const deploySlot = programDataAccount.data.readUInt32LE(0);
      const programLen = programDataAccount.data.readUInt32LE(4);
      
      console.log(`Deployment slot from metadata: ${deploySlot}`);
      console.log(`Program length from metadata: ${programLen} bytes`);
      
      // Check the ELF header - should start with 0x7F followed by "ELF" in ASCII (0x7F, 0x45, 0x4C, 0x46)
      const elfHeader = Buffer.from(programDataAccount.data.slice(8, 8 + 4));
      console.log(`\nELF header check (first 4 bytes of binary):`);
      console.log(`- As hex: 0x${elfHeader.toString('hex')}`);
      console.log(`- Expected: 0x7f454c46 (0x7F + "ELF" in ASCII)`);
      
      const isValidElf = elfHeader[0] === 0x7F && 
                        elfHeader[1] === 0x45 && // 'E'
                        elfHeader[2] === 0x4C && // 'L'
                        elfHeader[3] === 0x46;   // 'F'
      
      if (isValidElf) {
        console.log('✅ VALID ELF header detected - this is a proper Solana program binary!');
        
        // Additional ELF header checks for further verification
        const elfClass = programDataAccount.data[8 + 4]; // e_ident[EI_CLASS]
        const elfData = programDataAccount.data[8 + 5];  // e_ident[EI_DATA]
        const elfVersion = programDataAccount.data[8 + 6]; // e_ident[EI_VERSION]
        
        console.log('\nAdditional ELF header information:');
        console.log(`- ELF Class: ${elfClass === 1 ? '32-bit (1)' : elfClass === 2 ? '64-bit (2)' : 'Unknown'}`);
        console.log(`- Data encoding: ${elfData === 1 ? 'Little endian (1)' : elfData === 2 ? 'Big endian (2)' : 'Unknown'}`);
        console.log(`- ELF version: ${elfVersion}`);
        
        // Extract machine type (e_machine, bytes 18-19 in the ELF header)
        const machineType = programDataAccount.data.readUInt16LE(8 + 18);
        console.log(`- Machine type: ${machineType === 0xF7 ? 'BPF (247/0xF7)' : `Unknown (${machineType})`}`);
        
        console.log('\n✅ Program verification successful!');
        console.log('The program appears to be properly deployed and has a valid ELF header.');
        console.log('You should now be able to interact with it using the correct instruction format.');
        
      } else {
        console.log('❌ INVALID ELF header detected - this is NOT a proper Solana program binary.');
        console.log('The program may still be corrupted, even after redeployment.');
        console.log('Consider checking the deployment process or trying another deployment method.');
      }
    } else {
      console.log('This is not an upgradeable program. Cannot verify the binary.');
    }
    
  } catch (error) {
    console.error('Error verifying program:', error);
  }
}

verifyProgram().catch(console.error);
