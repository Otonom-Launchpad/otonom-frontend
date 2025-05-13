import fs from 'fs';
import path from 'path';
import { Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@project-serum/anchor';
import { createInitializeAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';

/**
 * Seed on-chain Project accounts for all projects defined in PROJECT_NAMES.
 *
 * Run with:
 *  npx ts-node --compiler-options '{"module":"commonjs"}' scripts/seed-onchain-projects.ts
 *
 * Adjust PROJECT_NAMES as needed or pass names via CLI arguments.
 */

// ----- CONFIG -----
const NETWORK = 'devnet';
const RPC_URL = 'https://api.devnet.solana.com';
const PROGRAM_ID = new PublicKey(process.env.OFUND_PROGRAM_ID || 'CWYLQDPfH6eywYGJfrSdX2cVMczm88x3V2Rd4tcgk4jf');
const OFUND_MINT = new PublicKey('4pV3umk8pY62ry8FsnMbQfJBYgpWnzWcC67UCMUevXLY');
const WALLET_PATH = path.resolve(process.env.HOME || '', '.config/solana/id.json');
const IDL_PATH = path.resolve(__dirname, '../src/lib/ofund-idl.json');

// If names passed via CLI use them; otherwise default list.
const PROJECT_NAMES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      'Neural Bridge',
      'Visionary AI',
      'Quantum Lens',
    ];

// ----- Helpers -----
async function findProjectPDA(name: string): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddress(
    [Buffer.from('project'), Buffer.from(name)],
    PROGRAM_ID,
  );
}

async function main() {
  // Setup wallet & connection
  const keypair = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(WALLET_PATH, 'utf-8'))),
  );
  const connection = new Connection(RPC_URL, 'confirmed');
  const wallet = new Wallet(keypair);
  const provider = new AnchorProvider(connection, wallet, {});
  const idl = JSON.parse(fs.readFileSync(IDL_PATH, 'utf8'));
  const program = new Program(idl, PROGRAM_ID, provider);

  console.log('Seeding on-chain projects...');

  for (const name of PROJECT_NAMES) {
    console.log(`\n→ Processing "${name}"`);
    const [projectPda, bump] = await findProjectPDA(name);
    console.log(`Project PDA: ${projectPda.toBase58()}`);

    // Check if the project account already exists on-chain
    const info = await connection.getAccountInfo(projectPda);
    if (info) {
      console.log('✅ Project already initialized. Skipping…');
      continue;
    }

    // --- Create project vault (token account owned by the project PDA) ---
    const vaultKeypair = Keypair.generate();
    const rentLamports = await connection.getMinimumBalanceForRentExemption(165);

    const createVaultAccountIx = SystemProgram.createAccount({
      fromPubkey: keypair.publicKey,
      newAccountPubkey: vaultKeypair.publicKey,
      space: 165, // size of a token account
      lamports: rentLamports,
      programId: TOKEN_PROGRAM_ID,
    });

    const initVaultIx = createInitializeAccountInstruction(
      vaultKeypair.publicKey, // account to initialise
      OFUND_MINT,             // token mint
      keypair.publicKey,      // owner must equal authority per program constraint
    );

    console.log(`Vault account (new): ${vaultKeypair.publicKey.toBase58()}`);

    try {
      const txSig = await program.methods
        .initializeProject(name, bump)
        .accounts({
          authority: keypair.publicKey,
          project: projectPda,
          projectVault: vaultKeypair.publicKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .preInstructions([createVaultAccountIx, initVaultIx])
        .signers([keypair, vaultKeypair])
        .rpc();
      console.log('✅ Initialized on-chain. Tx:', txSig);
      console.log('Explorer:', `https://explorer.solana.com/tx/${txSig}?cluster=${NETWORK}`);
    } catch (err: any) {
      console.error('❌ Failed to initialize project:', err.message || err);
      if (err.logs) console.error(err.logs.join('\n'));
    }
  }

  console.log('\nAll done.');
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});
