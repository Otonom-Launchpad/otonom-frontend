/**
 * Anchor Program Integration for Solana Hackathon
 * 
 * This file provides a robust interface to connect to our Solana program
 * with professional error handling and compatibility fixes.
 */

import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, BN, web3, Idl } from '@coral-xyz/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { PROGRAM_ID } from '@/lib/solana-config';
import idlFile from '../lib/ofund-idl.json';
import { validateIdl } from '@/utils/validate-idl';
import * as sha256 from 'js-sha256';

// Connection configuration
const COMMITMENT = 'confirmed';

// Define the OtonomProgram type for use in our application
export type OtonomProgram = Program;

/**
 * Initialize Anchor program for interacting with our smart contract
 * @param wallet The connected wallet to use for transactions
 * @returns Initialized Anchor program or undefined if initialization fails
 */
export const initializeProgram = (wallet: WalletContextState) => {
  try {
    if (!wallet.publicKey) {
      console.error('[ANCHOR] No wallet public key available');
      return undefined;
    }

    console.log('[ANCHOR] Initializing with wallet:', wallet.publicKey.toString());
    console.log('[ANCHOR] Program ID:', PROGRAM_ID.toString());

    // Create connection to Solana network with proper configuration
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('devnet');
    console.log('[ANCHOR] Using RPC endpoint:', rpcUrl);
    const connection = new Connection(rpcUrl, { commitment: COMMITMENT, confirmTransactionInitialTimeout: 60000 });

    // Validate wallet methods exist
    if (!wallet.signTransaction || !wallet.signAllTransactions) {
      console.error('[ANCHOR] Wallet is missing required signing methods');
      return undefined;
    }

    // Create a compatible wallet adapter for Anchor
    const anchorWallet = {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
    };

    // Create Anchor provider with proper configuration
    const provider = new AnchorProvider(
      connection,
      anchorWallet,
      { commitment: COMMITMENT, preflightCommitment: COMMITMENT }
    );

    // Log IDL details for debugging
    console.log('[ANCHOR] Using IDL:', idlFile.name, 'with', idlFile.instructions.length, 'instructions');
    
    try {
      // Log important IDs for debugging
      console.log('[ANCHOR] Program ID from config:', PROGRAM_ID.toBase58());
      // `metadata` is not part of the generated IDL type. Cast to `any` to access it safely.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.log('[ANCHOR] Program ID from IDL:', (idlFile as any).metadata?.address || 'Not found in IDL');
      
      // Create a clean copy of the IDL to prevent any mutations
      const idlCopy = JSON.parse(JSON.stringify(idlFile));
      
      // Ensure we're dealing with proper PublicKey objects
      const programId = new PublicKey(PROGRAM_ID.toString());

      // Ensure required root fields exist; Anchor ≥0.31+ expects both
      // `address` and `types` top-level keys. Some older IDL dumps omit them.
      if (!idlCopy.address) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        idlCopy.address = programId.toBase58();
      }

      // Ensure an empty `types` array if missing to satisfy BorshAccountsCoder
      if (!('types' in idlCopy)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        idlCopy.types = [];
      }

      // Ensure an `accounts` array exists; some IDL dumps omit it entirely.
      if (!Array.isArray(idlCopy.accounts)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        idlCopy.accounts = [];
      }

      // Reconcile declared accounts with those referenced in instructions.
      // Some IDL generators leave only PascalCase variants in `accounts`
      // while instructions use camelCase (`mintAuthority`) or add PDA
      // variants (`mintAuthorityPda`). Anchor’s BorshAccountsCoder is strict;
      // every referenced name must appear in `idl.accounts` or it will throw
      // "Account not found". Here we clone a canonical struct when possible,
      // or create an empty placeholder to satisfy the discriminator check.
      if (Array.isArray(idlCopy.instructions)) {
        const declaredMap = new Map<string, any>();
        idlCopy.accounts.forEach((acc: any) => declaredMap.set(acc.name, acc));

        const toAdd: any[] = [];

        idlCopy.instructions.forEach((ix: any) => {
          ix.accounts?.forEach((acct: any) => {
            const refName: string = acct.name;
            if (!declaredMap.has(refName)) {
              const pascal = refName.charAt(0).toUpperCase() + refName.slice(1);
              const canonical = declaredMap.get(pascal);

              if (canonical) {
                toAdd.push({ ...canonical, name: refName });
              } else {
                // Minimal placeholder struct; fields are not required to
                // compute discriminators, only the name.
                toAdd.push({
                  name: refName,
                  type: { kind: 'struct', fields: [] },
                });
              }

              declaredMap.set(refName, true);
            }
          });
        });

        if (toAdd.length > 0) {
          idlCopy.accounts.push(...toAdd);
        }

        // Add discriminator field if missing (Anchor ≥0.30 requirement)
        idlCopy.accounts.forEach((acc: any) => {
          if (!acc.discriminator || !Array.isArray(acc.discriminator) || acc.discriminator.length !== 8) {
            const digest = (sha256 as any).digest(`account:${acc.name}`);
            acc.discriminator = Array.from(digest.slice(0, 8));
          }
        });

        // Debug: list reconciled account names
        console.log('[ANCHOR] Reconciled accounts:', idlCopy.accounts.map((a: any) => a.name));

        const mintAcc = idlCopy.accounts.find((a: any) => a.name === 'mintAuthority');
        console.log('[ANCHOR] mintAuthority account def:', mintAcc);
      }

      // Ensure every account struct also exists in idlCopy.types as required by
      // Anchor's BorshAccountsCoder (it looks up types by account name).
      if (Array.isArray(idlCopy.accounts)) {
        if (!Array.isArray(idlCopy.types)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          idlCopy.types = [];
        }

        const existingTypes = new Map<string, any>();
        idlCopy.types.forEach((t: any) => existingTypes.set(t.name, t));

        idlCopy.accounts.forEach((acc: any) => {
          if (!existingTypes.has(acc.name)) {
            // Push a shallow copy with name and type
            idlCopy.types.push({ name: acc.name, type: acc.type });
          }
        });
      }

      // Normalize primitive type divergence introduced in Anchor v0.31+: older
      // IDLs use the string literal "publicKey" while newer Anchor expects
      // "pubkey". Replace recursively so the coder recognises the field.
      const normalizePubkeyTypes = (node: any) => {
        if (!node) return;
        if (Array.isArray(node)) {
          node.forEach(normalizePubkeyTypes);
          return;
        }
        if (typeof node === 'object') {
          if (node.type === 'publicKey') {
            node.type = 'pubkey';
          } else if (typeof node.type === 'object') {
            normalizePubkeyTypes(node.type);
          }
          // Recurse over all nested properties
          Object.values(node).forEach(normalizePubkeyTypes);
        }
      };

      normalizePubkeyTypes(idlCopy.accounts);
      if (idlCopy.types) {
        normalizePubkeyTypes(idlCopy.types);
      }

      // ---------------- FULL IDL VALIDATION ----------------
      validateIdl(idlCopy);

      let anchorProgram: Program;
      try {
        // For Anchor ≥0.31, constructor signature is (idl, provider, coder?)
        anchorProgram = new Program(idlCopy as Idl, provider);
      } catch (primaryErr) {
        console.error('[ANCHOR] Program constructor failed:', primaryErr);
        throw primaryErr;
      }

      // Verify we can access methods on the program
      if (anchorProgram.methods) {
        console.log('[ANCHOR] Program successfully initialized:',
                    'Methods:', Object.keys(anchorProgram.methods).join(', '));
      }

      return anchorProgram;
    } catch (error) {
      console.error('[ANCHOR] Program initialization failed:', error);
      throw error;
    }
  } catch (error) {
    console.error('[ANCHOR] Initialization error:', error);
    return undefined;
  }
};

/**
 * Find the PDA for a user profile
 * 
 * @param userAddress The user's wallet address
 * @returns Object containing the PDA and bump seed
 */
export const findUserProfilePda = async (userAddress: PublicKey) => {
  console.log('[PDA] Finding user profile PDA for address:', userAddress.toString());
  try {
    const [pda, bump] = await PublicKey.findProgramAddress(
      [Buffer.from('user-profile'), userAddress.toBuffer()],
      PROGRAM_ID
    );
    console.log('[PDA] Found user profile at:', pda.toString(), 'with bump:', bump);
    return { pda, bump };
  } catch (error) {
    console.error('[PDA] Error finding user profile PDA:', error);
    throw error;
  }
};

/**
 * Find PDA for a project
 * @param projectName The name of the project
 * @returns Project PDA
 */
export const findProjectPda = async (projectName: string) => {
  console.log('[PDA] Finding project PDA for:', projectName);
  try {
    const [pda] = await PublicKey.findProgramAddress(
      [Buffer.from('project'), Buffer.from(projectName)],
      PROGRAM_ID
    );
    console.log('[PDA] Found project at:', pda.toString());
    return pda;
  } catch (error) {
    console.error('[PDA] Error finding project PDA:', error);
    throw error;
  }
};
