/**
 * Script to analyze Solana program data
 * This performs a careful analysis of the program data to determine if it's valid
 */
const { Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');

// Connect to devnet
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Program ID and its data account
const PROGRAM_ID = new PublicKey('CWYLQDPfH6eywYGJfrSdX2cVMczm88x3V2Rd4tcgk4jf');
const PROGRAM_DATA_ACCOUNT = new PublicKey('6BM5C2yoGis5sJxnyyLKPKuuW8oZoBAShj7NHmQkP9WF');

async function analyzeProgramData() {
  console.log('Analyzing Program Data Account\n');
  
  try {
    // Get the program account first to confirm it points to the data account
    const programAccount = await connection.getAccountInfo(PROGRAM_ID);
    
    if (!programAccount) {
      console.log('❌ Program not found');
      return;
    }
    
    console.log(`Program account size: ${programAccount.data.length} bytes`);
    
    // Extract the program data pointer (should be bytes 4-35)
    if (programAccount.data.length >= 36) {
      const programDataPubkey = new PublicKey(programAccount.data.slice(4));
      console.log(`Program data pointer: ${programDataPubkey.toString()}`);
      
      if (programDataPubkey.toString() !== PROGRAM_DATA_ACCOUNT.toString()) {
        console.log('⚠️ WARNING: Program data account mismatch!');
        console.log(`Expected: ${PROGRAM_DATA_ACCOUNT.toString()}`);
        console.log(`Actual: ${programDataPubkey.toString()}`);
        return;
      }
    }
    
    // Now get the program data account
    const programDataAccount = await connection.getAccountInfo(PROGRAM_DATA_ACCOUNT);
    
    if (!programDataAccount) {
      console.log('❌ Program data account not found');
      return;
    }
    
    console.log(`\nProgram data account size: ${programDataAccount.data.length} bytes`);
    
    // First 8 bytes of program data are metadata
    if (programDataAccount.data.length < 8) {
      console.log('❌ Program data too small to contain metadata');
      return;
    }
    
    // Careful extraction of metadata using proper methods
    const slot = programDataAccount.data.readUInt32LE(0);
    
    // Here's where we need to be careful about the reported program size
    const programLen = programDataAccount.data.readUInt32LE(4);
    
    console.log(`Deployment slot: ${slot}`);
    console.log(`Reported program length: ${programLen} bytes`);
    
    // Validate if the reported length makes sense
    if (programLen > 2 * 1024 * 1024) {
      console.log('⚠️ WARNING: Reported program length exceeds Solana\'s 2MB limit');
      console.log('This suggests a corrupt metadata header or binary');
    }
    
    // Check how much actual data we have
    const actualDataAvailable = programDataAccount.data.length - 8;
    console.log(`Actual binary data available: ${actualDataAvailable} bytes`);
    
    if (programLen > actualDataAvailable) {
      console.log(`⚠️ WARNING: Reported program length (${programLen}) exceeds available data (${actualDataAvailable})`);
      console.log('This indicates the data account is incomplete or corrupt');
    }
    
    // Let's look at some of the binary data
    const binaryStart = Buffer.from(programDataAccount.data.slice(8, 8 + 32));
    console.log('\nFirst 32 bytes of binary data (hex):');
    console.log(binaryStart.toString('hex'));
    
    // Look for common ELF header for Solana programs
    // ELF files start with the magic number 0x7F followed by "ELF" in ASCII
    const expectedMagic = Buffer.from([0x7F, 0x45, 0x4C, 0x46]);
    const actualMagic = Buffer.from(programDataAccount.data.slice(8, 8 + 4));
    
    console.log('\nELF magic number check:');
    console.log(`Expected: ${expectedMagic.toString('hex')}`);
    console.log(`Actual: ${actualMagic.toString('hex')}`);
    
    if (Buffer.compare(expectedMagic, actualMagic) === 0) {
      console.log('✅ Valid ELF header found - this appears to be a properly deployed program');
    } else {
      console.log('❌ Invalid ELF header - this is NOT a valid Solana program binary');
    }
    
    // Save a small sample of the program data for inspection
    const sampleSize = Math.min(1024, programDataAccount.data.length - 8);
    const sample = Buffer.from(programDataAccount.data.slice(8, 8 + sampleSize));
    
    fs.writeFileSync('program-data-sample.bin', sample);
    console.log(`\nSaved first ${sampleSize} bytes of program data to program-data-sample.bin`);
    
    // Provide recommendations
    console.log('\n=== RECOMMENDATIONS ===');
    if (Buffer.compare(expectedMagic, actualMagic) !== 0) {
      console.log('1. The program data appears to be CORRUPTED or INVALID');
      console.log('2. You should redeploy the program properly');
      console.log('3. Ensure your build environment is correctly configured');
    } else if (programLen > 2 * 1024 * 1024) {
      console.log('1. The program metadata header reports an INVALID size');
      console.log('2. However, the actual binary appears valid (has ELF header)');
      console.log('3. This might be a header corruption issue rather than binary corruption');
      console.log('4. Try using the module namespace format for instructions');
    } else {
      console.log('1. The program appears to be VALID with correct ELF header');
      console.log('2. The instruction discriminator issue is likely due to namespace differences');
      console.log('3. Try using "otonom_program::initialize_project" format');
    }
    
  } catch (error) {
    console.error('Error analyzing program data:', error);
  }
}

analyzeProgramData().catch(console.error);
