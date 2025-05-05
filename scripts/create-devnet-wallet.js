#!/usr/bin/env node
/**
 * generate a fresh devnet wallet and airdrop 3 SOL
 * Usage:
 *   node scripts/create-devnet-wallet.js
 */
const fs = require('fs');
const { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');

async function main() {
  const kp = Keypair.generate();
  const pubkey = kp.publicKey.toBase58();

  const outfile = 'new-devnet-wallet.json';
  fs.writeFileSync(outfile, `[${Array.from(kp.secretKey)}]`);
  console.log(`💾  Secret key saved to ${outfile}`);
  console.log(`🔑  Public key: ${pubkey}`);

  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  console.log('⛽  Requesting 3 SOL airdrop …');
  const sig = await connection.requestAirdrop(kp.publicKey, 3 * LAMPORTS_PER_SOL);
  console.log(`📤  Airdrop tx signature: ${sig}`);
  console.log('✅  Airdrop requested. Balance will update shortly.');
}

main().catch((err) => {
  console.error('Error generating wallet:', err);
  process.exit(1);
});
