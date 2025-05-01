/**
 * Advanced Solana Program Verification Script
 * This script provides detailed information about a deployed program on Solana
 */
const { Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');

// The program ID we're currently using in the frontend
const PROGRAM_ID_STRING = 'CWYLQDPfH6eywYGJfrSdX2cVMczm88x3V2Rd4tcgk4jf';
const PROGRAM_ID = new PublicKey(PROGRAM_ID_STRING);

// Connect to devnet
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

async function checkProgramDetails() {
  console.log('Detailed Program Verification\n');
  console.log(`Checking program ID: ${PROGRAM_ID_STRING}`);
  
  try {
    // Get account info for the program
    const accountInfo = await connection.getAccountInfo(PROGRAM_ID);
    
    if (!accountInfo) {
      console.log('❌ Program not found on devnet');
      return;
    }
    
    // Basic program info
    console.log('\n=== BASIC PROGRAM INFO ===');
    console.log(`• Executable: ${accountInfo.executable}`);
    console.log(`• Owner: ${accountInfo.owner.toString()}`);
    console.log(`• Data size: ${accountInfo.data.length} bytes`);
    console.log(`• Lamports: ${accountInfo.lamports}`);
    
    // Check if it's using the upgradeable loader
    const isUpgradeable = accountInfo.owner.toString() === 'BPFLoaderUpgradeab1e11111111111111111111111';
    console.log(`• Uses upgradeable loader: ${isUpgradeable}`);
    
    if (isUpgradeable && accountInfo.data.length === 36) {
      console.log('\n⚠️ This appears to be a program using the upgradeable loader.');
      console.log('The 36 bytes likely contain a pointer to the actual program data,');
      console.log('which is stored in a separate account.');
      
      // The first 32 bytes are the programdata account public key
      const programDataAccountKey = new PublicKey(accountInfo.data.slice(4));
      console.log(`\n• ProgramData account: ${programDataAccountKey.toString()}`);
      
      // Try to get the programdata account
      const programDataAccount = await connection.getAccountInfo(programDataAccountKey);
      
      if (programDataAccount) {
        console.log(`• ProgramData size: ${programDataAccount.data.length} bytes`);
        console.log(`• ProgramData owner: ${programDataAccount.owner.toString()}`);
        
        // The first 8 bytes of program data are metadata 
        // (4 bytes for slot, 4 bytes for program length)
        if (programDataAccount.data.length > 8) {
          const slot = programDataAccount.data.readUInt32LE(0);
          const programLen = programDataAccount.data.readUInt32LE(4);
          
          console.log(`• Deployed in slot: ${slot}`);
          console.log(`• Program binary size: ${programLen} bytes`);
          console.log(`• Actual binary starts at offset 8`);
        }
      } else {
        console.log('❌ Could not find ProgramData account - this is unusual');
      }
    }
    
    // Try to fetch the IDL
    console.log('\n=== TRYING TO FETCH IDL ===');
    console.log('This might fail if the IDL isn\'t published on-chain');
    
    try {
      // Derive the IDL account address
      // This follows Anchor's convention for storing IDLs on-chain
      const programSigner = await PublicKey.createProgramAddress(
        [PROGRAM_ID.toBytes()],
        new PublicKey('AnchoRProgramIDLs11111111111111111111111')
      );
      
      const idlAddr = await PublicKey.findProgramAddress(
        [
          Buffer.from('anchor:idl'),
          PROGRAM_ID.toBytes(),
        ],
        new PublicKey('AnchoRProgramIDLs11111111111111111111111')
      );
      
      console.log(`• IDL Account Address: ${idlAddr[0].toString()}`);
      
      const idlAccount = await connection.getAccountInfo(idlAddr[0]);
      if (idlAccount) {
        console.log(`• IDL Account exists with ${idlAccount.data.length} bytes`);
        
        // Try to parse the IDL
        // In a real IDL account, the first 8 bytes are a discriminator
        // The rest is borsh-serialized IDL data
        if (idlAccount.data.length > 8) {
          // Skip the 8-byte discriminator
          const idlData = idlAccount.data.slice(8);
          
          // Save to a file for inspection
          fs.writeFileSync('on-chain-idl-data.json', JSON.stringify({
            idlAccount: idlAddr[0].toString(),
            dataLength: idlAccount.data.length,
            dataHex: Buffer.from(idlAccount.data).toString('hex')
          }, null, 2));
          
          console.log('• Saved IDL data to on-chain-idl-data.json for inspection');
        }
      } else {
        console.log('❌ No on-chain IDL found. This is common for programs that haven\'t published their IDL.');
      }
    } catch (error) {
      console.log(`❌ Error checking for IDL: ${error.message}`);
    }
    
    // Suggestion for further investigation
    console.log('\n=== RECOMMENDATIONS ===');
    if (accountInfo.data.length === 36 && isUpgradeable) {
      console.log('1. The 36-byte size is normal for programs using the upgradeable loader');
      console.log('2. To fix issues, ensure you\'re using:');
      console.log('   - The correct Program ID in all files');
      console.log('   - The proper instruction format, likely with namespace (otonom_program::initialize_project)');
      console.log('   - The correct account structure from the IDL');
    } else {
      console.log('1. Unusual program structure detected - consider redeploying');
      console.log('2. Ensure you\'re using an up-to-date IDL that matches the deployed program');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkProgramDetails().catch(console.error);
