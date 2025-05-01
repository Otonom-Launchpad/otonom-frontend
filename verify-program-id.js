/**
 * Script to verify Solana Program IDs
 * This will check both configured program IDs against the Solana devnet
 */
const { Connection, PublicKey } = require('@solana/web3.js');

// The two program IDs we need to verify
const PROGRAM_IDS = [
  'CWYLQDPfH6eywYGJfrSdX2cVMczm88x3V2Rd4tcgk4jf', // From our frontend config
  'EPwpbJYL6H3u3VDMShoJ6XFtdPQ9FJAFpEpjyMH7UADN'  // From the contract source code
];

async function verifyProgramIds() {
  // Connect to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  console.log('Checking program IDs on Solana devnet...\n');
  
  for (const idString of PROGRAM_IDS) {
    try {
      console.log(`Checking program ID: ${idString}`);
      const programId = new PublicKey(idString);
      
      // Try to fetch the account info for this program
      const accountInfo = await connection.getAccountInfo(programId);
      
      if (accountInfo === null) {
        console.log(`❌ Program not found on devnet: ${idString}`);
      } else {
        // A real program will have executable = true
        if (accountInfo.executable) {
          console.log(`✅ Valid program found on devnet: ${idString}`);
          console.log(`   Owner: ${accountInfo.owner.toString()}`);
          console.log(`   Data size: ${accountInfo.data.length} bytes`);
        } else {
          console.log(`⚠️  Account exists but is not executable: ${idString}`);
        }
      }
    } catch (error) {
      console.error(`Error checking program ${idString}:`, error.message);
    }
    console.log('-----------------------------------');
  }
}

verifyProgramIds().catch(err => {
  console.error('Error:', err);
});
