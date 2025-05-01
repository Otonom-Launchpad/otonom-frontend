#!/usr/bin/env node

/**
 * Utility script to calculate Anchor instruction discriminators
 * This will show the correct values for use in manual transaction building
 */

// We need to use the same hashing function that Anchor uses
const crypto = require('crypto');

/**
 * Calculate instruction discriminator using Anchor's method
 * @param {string} ixName - The instruction name
 * @returns {Buffer} - The 8-byte discriminator
 */
function getAnchorDiscriminator(ixName) {
  // Anchor specifically uses SHA-256 on the name exactly as it appears in the IDL
  const hash = crypto.createHash('sha256').update(ixName).digest();
  // Take the first 8 bytes
  return hash.slice(0, 8);
}

// Check different variations
const instructions = [
  'initialize_project',
  'initializeProject',
  'initialize-project'
];

console.log('Anchor Instruction Discriminators\n');

instructions.forEach(name => {
  const discriminator = getAnchorDiscriminator(name);
  console.log(`${name}:`);
  console.log(`  Hex: ${discriminator.toString('hex')}`);
  console.log(`  Bytes: [${Array.from(discriminator).join(', ')}]`);
  console.log();
});

// Now show the one currently used in code
console.log('Current values in code:');
console.log('  Snake case: [98, 222, 123, 1, 143, 111, 134, 160]');
console.log('  Camel case: [175, 175, 109, 31, 13, 152, 155, 237]');
