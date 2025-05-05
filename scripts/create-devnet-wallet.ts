/**
 * Helper script: generate a fresh devnet keypair, request 3 SOL airdrop,
 * and save the secret-key array to `new-devnet-wallet.json` inside the
 * current directory.
 *
 * Usage (from project root):
 *   cd otonom-frontend
 *   npx ts-node scripts/create-devnet-wallet.ts
 */
import fs from 'fs';
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';

async function main() {
  // 1️⃣  Generate keypair
  const kp = Keypair.generate();
  const pubkey = kp.publicKey.toBase58();

  // 2️⃣  Persist to disk so the user can import into Phantom
  const outfile = 'new-devnet-wallet.json';
  fs.writeFileSync(outfile, `[${kp.secretKey.toString()}]`);
  console.log(`💾  Secret key saved to ${outfile}`);
  console.log(`🔑  Public key: ${pubkey}`);

  // 3️⃣  Airdrop 3 SOL on devnet for convenience
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
