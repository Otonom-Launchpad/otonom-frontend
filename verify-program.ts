#!/usr/bin/env ts-node

/**
 * Program Verification Script
 * 
 * This script verifies that a deployed Anchor program contains the expected instructions
 * and helps debug InstructionFallbackNotFound errors.
 * 
 * Run with:
 * npx ts-node verify-program.ts
 */

import { Connection, PublicKey } from '@solana/web3.js';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Configuration (same as in our frontend)
const PROGRAM_ID = new PublicKey(process.env.OFUND_PROGRAM_ID || 'CWYLQDPfH6eywYGJfrSdX2cVMczm88x3V2Rd4tcgk4jf');
const NETWORK = 'devnet';
const RPC_URL = 'https://api.devnet.solana.com';

/**
 * Calculate instruction discriminator using Anchor's method
 * @param {string} ixName - The instruction name
 * @returns {Buffer} - The 8-byte discriminator
 */
function getAnchorDiscriminator(ixName: string): Buffer {
  // Anchor specifically uses SHA-256 on the name exactly as it appears in the IDL
  const hash = crypto.createHash('sha256').update(ixName).digest();
  // Take the first 8 bytes
  return hash.slice(0, 8);
}

/**
 * Helper function to serialize a string for Anchor (Borsh format)
 */
function serializeString(str: string): Buffer {
  const strBuffer = Buffer.from(str);
  const lenBuffer = Buffer.alloc(4);
  lenBuffer.writeUInt32LE(strBuffer.length, 0);
  return Buffer.concat([lenBuffer, strBuffer]);
}

/**
 * Prints the discriminator for an instruction in different formats
 */
function printDiscriminatorInfo(name: string): void {
  const discriminator = getAnchorDiscriminator(name);
  console.log(`
${name}:`);
  console.log(`  Hex: ${discriminator.toString('hex')}`);
  console.log(`  Bytes: [${Array.from(discriminator).join(', ')}]`);
}

/**
 * Main function to verify the program
 */
async function main() {
  try {
    console.log(`Connecting to Solana ${NETWORK}...`);
    console.log(`Verifying program: ${PROGRAM_ID.toString()}`);
    
    const connection = new Connection(RPC_URL, 'confirmed');

    // Load IDL from local file
    const idlPath = path.join(__dirname, 'src/lib/ofund-idl.json');
    const idlRaw = fs.readFileSync(idlPath, 'utf8');
    const idl = JSON.parse(idlRaw);

    console.log(`
Program information from local IDL:`);
    console.log(`Program name: ${idl.name || 'Not available'}`);
    console.log(`Program version: ${idl.version || 'Not available'}`);
    
    // Print instructions
    console.log(`
Instructions:`);
    idl.instructions.forEach((ix: any, index: number) => {
      console.log(`${index + 1}. ${ix.name}`);
      
      // Print accounts
      console.log('   Accounts:');
      ix.accounts.forEach((acc: any) => {
        console.log(`    - ${acc.name} (isMut: ${acc.isMut}, isSigner: ${acc.isSigner})`);
      });
      
      // Print args
      console.log('   Args:');
      if (ix.args && ix.args.length > 0) {
        ix.args.forEach((arg: any) => {
          console.log(`    - ${arg.name}: ${arg.type}`);
        });
      } else {
        console.log('    (none)');
      }
      
      // Print discriminator
      printDiscriminatorInfo(ix.name);
    });

    // Check instructions of interest
    console.log(`
=== Checking specific instructions ===`);

    // initializeProject
    printDiscriminatorInfo('initializeProject');
    printDiscriminatorInfo('initialize_project');

    // Display serialization tests
    console.log(`
=== Manual Serialization Tests ===`);
    
    const testProjectName = 'TestProject_631';
    const testBump = 255;
    
    // Test 1: [discriminator][string length][string bytes][bump]
    const discriminator1 = getAnchorDiscriminator('initializeProject');
    const test1 = Buffer.concat([
      discriminator1,
      serializeString(testProjectName),
      Buffer.from([testBump]),
    ]);
    console.log('Test 1 (correct format per our understanding):');
    console.log(test1.toString('hex'));
    
    // Test 2: [discriminator][bump][string length][string bytes]
    const test2 = Buffer.concat([
      discriminator1,
      Buffer.from([testBump]),
      serializeString(testProjectName),
    ]);
    console.log('Test 2 (reversed argument order):');
    console.log(test2.toString('hex'));
    
    // Test 3: with initalize_project (snake_case)
    const discriminator3 = getAnchorDiscriminator('initialize_project');
    const test3 = Buffer.concat([
      discriminator3,
      serializeString(testProjectName),
      Buffer.from([testBump]),
    ]);
    console.log('Test 3 (with snake_case name):');
    console.log(test3.toString('hex'));

    // Check program executable data
    const accountInfo = await connection.getAccountInfo(PROGRAM_ID);
    if (accountInfo) {
      console.log(`
Program owner: ${accountInfo.owner.toString()}`);
      console.log(`Program executable: ${accountInfo.executable}`);
      console.log(`Program data size: ${accountInfo.data.length} bytes`);
    } else {
      console.error('Program account not found!');
    }
  } catch (error) {
    console.error('Error verifying program:', error);
  }
}

// Run the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
