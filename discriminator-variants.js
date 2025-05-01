/**
 * Test various discriminator formats to find the correct one
 * 
 * This script calculates discriminators for different variants of instruction names
 * to help debug the InstructionFallbackNotFound error
 */

const crypto = require('crypto');

// Helper function to calculate an Anchor instruction discriminator
function getAnchorDiscriminator(ixName) {
  // Anchor uses SHA-256 hash of the instruction name string
  const hash = crypto.createHash('sha256').update(ixName).digest();
  // And takes the first 8 bytes
  return hash.slice(0, 8);
}

// Helper function to pretty-print discriminator
function formatDiscriminator(name, discriminator) {
  console.log(`\n"${name}":`);
  console.log(`  Hex: ${discriminator.toString('hex')}`);
  console.log(`  Bytes: [${Array.from(discriminator).join(', ')}]`);
}

// Test a variety of name formats
const variants = [
  // CamelCase formats
  'initializeProject',
  'InitializeProject',
  
  // Snake_case formats
  'initialize_project',
  
  // Variations with spaces
  'initialize project',
  
  // Namespace formats
  'otonom_program::initialize_project',
  'otonom_program::initializeProject',
  
  // Short/alternate forms
  'init_project',
  'create_project',
  
  // With prefix/suffix
  'ix_initialize_project',
  'initialize_project_ix',
];

console.log('===== INSTRUCTION DISCRIMINATOR VARIANTS =====');
variants.forEach(variant => {
  formatDiscriminator(variant, getAnchorDiscriminator(variant));
});

// Try special case of "default" discriminator hash which is used for catch-all fallbacks
formatDiscriminator("default", getAnchorDiscriminator("global:default"));

// Now let's consider if the signer is expected on a different account than authority
console.log('\n===== ACCOUNT ARRANGEMENT POSSIBILITIES =====');
console.log('1. Check if the authority account needs to be first in the accounts list');
console.log('2. Verify if there are accounts missing or in different order than the IDL');
console.log('3. Make sure the project_vault account is a token account, not just a public key');
console.log('4. Consider if we need token_program in the accounts list despite not in IDL');

console.log('\n===== IMPORTANT CHECK =====');
console.log('Compare the current on-chain program ID to the one in our code:');
console.log('Code program ID: CWYLQDPfH6eywYGJfrSdX2cVMczm88x3V2Rd4tcgk4jf');
console.log('IDL program ID: Check ofund-idl-deployed.json for "programId" field');
console.log('Contract declare_id!: Check lib.rs for declare_id!() macro value');

console.log('\n===== REMEMBER =====');
console.log('The program data size was only 36 bytes, which is extremely small for an Anchor program.');
console.log('This suggests we might be interacting with a proxy or placeholder that uses a different format.');
