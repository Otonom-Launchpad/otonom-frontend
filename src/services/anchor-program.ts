/**
 * Anchor Program Integration for Solana Hackathon
 * 
 * This file provides a robust interface to connect to our Solana program
 * with professional error handling and compatibility fixes.
 */

import { 
  Connection, 
  PublicKey, 
  clusterApiUrl, 
  Transaction, 
  VersionedTransaction, 
  type Commitment as Web3Commitment // Alias for @solana/web3.js's Commitment TYPE
} from '@solana/web3.js';
import { 
  Program, 
  AnchorProvider, 
  BorshCoder,
  type Idl,
  type Wallet as AnchorWalletType, 
  type IdlTypes,
} from '@coral-xyz/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { PROGRAM_ID, COMMITMENT as SOLANA_COMMITMENT_LEVEL } from '@/lib/solana-config'; // COMMITMENT (string) from config
import { sha256 } from 'js-sha256';
import { validateIdl } from '@/utils/validate-idl';

// Define our program's specific IDL structure
export interface OtonomIdlMetadata {
  name: string; 
  version: string; 
  spec: string; 
  address?: string; // Program address, can be same as IDL root address or specific if needed. Optional here.
  origin?: string;
  chainId?: string;
}

// Make OtonomProgram explicitly extend Anchor's Idl type
export interface OtonomProgram extends Idl { 
  version: string;
  name: string;
  address: string; // Added: Anchor's base Idl type often requires a top-level address
  instructions: any[]; // Temporarily any[]
  accounts?: any[];    // Temporarily any[]
  types?: any[];       // Temporarily any[]
  events?: any[];      // Temporarily any[]
  errors?: any[];      // Temporarily any[]
  constants?: any[];   // Temporarily any[]
  metadata: OtonomIdlMetadata; 
  docs?: string[];
}

// Connection configuration
const COMMITMENT = 'confirmed'; // Restored local const

// Global/module-scoped variables for program, provider, coder, and IDL copy
let program: Program<OtonomProgram> | undefined;
let provider: AnchorProvider | undefined;
let coder: any | undefined; // BorshCoder<string, OtonomProgram> - temp 'any'
let idlCopy: OtonomProgram | undefined; // Will hold the processed IDL copy
const programIdPublicKey = new PublicKey(PROGRAM_ID);

let programInitializationPromise: Promise<Program<OtonomProgram>> | null = null;
let resolveProgramPromise: ((value: Program<OtonomProgram> | PromiseLike<Program<OtonomProgram>>) => void) | null = null;
let rejectProgramPromise: ((reason?: any) => void) | null = null;

/**
 * Initialize Anchor program for interacting with our smart contract
 * @param wallet The connected wallet to use for transactions
 * @returns A promise that resolves to the initialized Program instance
 */
export async function initializeProgram(wallet: WalletContextState): Promise<Program<OtonomProgram>> {
  console.log('[ANCHOR] initializeProgram called.');

  if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
    console.error('[ANCHOR] Wallet not fully initialized or connected.', {
      publicKey: !!wallet.publicKey,
      signTransaction: !!wallet.signTransaction,
      signAllTransactions: !!wallet.signAllTransactions,
    });
    if (programInitializationPromise && rejectProgramPromise) {
        rejectProgramPromise(new Error('Wallet not fully initialized or connected for program setup.'));
    }    
    programInitializationPromise = null; 
    resolveProgramPromise = null;
    rejectProgramPromise = null;
    return Promise.reject(new Error('Wallet not fully initialized or connected. Ensure wallet is connected and provides signing functions.'));
  }

  if (programInitializationPromise) {
    console.log('[ANCHOR] Program initialization already in progress or completed, returning existing promise.');
    return programInitializationPromise;
  }

  console.log('[ANCHOR] Starting new program initialization.');
  programInitializationPromise = new Promise<Program<OtonomProgram>>((resolve, reject) => {
    resolveProgramPromise = resolve;
    rejectProgramPromise = reject;

    (async () => {
      try {
        console.log('[ANCHOR] Inside Promise executor for program initialization.');
        if (!wallet.publicKey) { 
          console.error('[ANCHOR] initializeProgram (Promise executor): Wallet publicKey is null.');
          throw new Error('Wallet publicKey is null within promise executor.');
        }
        // Use the aliased SOLANA_COMMITMENT_LEVEL string VALUE from solana-config, cast to Web3Commitment TYPE
        const connection = new Connection(clusterApiUrl('devnet'), SOLANA_COMMITMENT_LEVEL as Web3Commitment);
        
        // Changed declaration to use 'as AnchorWalletType' on the object literal
        const anchorWallet = {
          publicKey: wallet.publicKey, 
          signTransaction: wallet.signTransaction as <T extends Transaction | VersionedTransaction>(tx: T) => Promise<T>,
          signAllTransactions: wallet.signAllTransactions as <T extends Transaction | VersionedTransaction>(txs: T[]) => Promise<T[]>,
        } as AnchorWalletType;

        // Use 'as any' for anchorWallet to bypass the incorrect type inference by TS for AnchorProvider's wallet argument.
        // The aliased SOLANA_COMMITMENT_LEVEL value from config (string) is cast to Web3Commitment TYPE for the provider's options.
        provider = new AnchorProvider(connection, anchorWallet as any, { commitment: SOLANA_COMMITMENT_LEVEL as Web3Commitment });
        console.log('[ANCHOR] Provider initialized within Promise executor.');

        // Fetch and parse the IDL JSON file
        const response = await fetch('/ofund-idl.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch IDL: ${response.statusText}`);
        }
        const rawIdl: OtonomProgram = await response.json(); // Assume OtonomProgram is a sufficiently typed Idl
        console.log('[ANCHOR] Raw IDL fetched successfully.');

        // Ensure critical fields are present and correct
        rawIdl.address = PROGRAM_ID.toString();

        // Ensure metadata is correctly populated
        rawIdl.metadata = rawIdl.metadata || {}; // Initialize if undefined
        rawIdl.metadata.name = rawIdl.metadata.name || rawIdl.name || "otonom_program";
        rawIdl.metadata.version = rawIdl.metadata.version || rawIdl.version || "0.1.0";
        rawIdl.metadata.spec = rawIdl.metadata.spec || "0.1.0"; // Default Anchor IDL spec version
        rawIdl.metadata.origin = rawIdl.metadata.origin || "anchor"; // Default origin
        rawIdl.metadata.address = rawIdl.metadata.address || rawIdl.address;

        console.log(`[ANCHOR] Ensured IDL address is set to: ${rawIdl.address}`);

        // Restore validateIdl call
        const idl = rawIdl;
        if (idl) {
          console.log('[ANCHOR_DEBUG] IDL object is defined, about to call validateIdl:', !!idl);
          validateIdl(idl); // This populates idl.types and idl.instructions[*].discriminator
          console.log('[ANCHOR] IDL validated and processed.');
        } else {
          console.error("[ANCHOR] Error: IDL is not defined after fetch.");
          reject(new Error("IDL is not defined after fetch."));
          return;
        }

        console.log('[ANCHOR_DEBUG] Validated IDL being used:', JSON.stringify(idl, null, 2));

        // Detailed inspection of idl.types
        if (idl.types) {
          const mintAuthorityType = idl.types.find(t => t.name === 'MintAuthority');
          if (mintAuthorityType && typeof mintAuthorityType === 'object' && 'type' in mintAuthorityType && (mintAuthorityType.type as any).kind === 'struct') {
            const structFields = ((mintAuthorityType.type as any).fields || []) as { name: string; type: any }[];
            const mintField = structFields.find(f => f.name === 'mint');
            console.log('[ANCHOR_DEBUG] idl.types - MintAuthority.mint field type:', mintField ? JSON.stringify(mintField.type) : 'MintAuthority or mint field not found in idl.types');
          } else {
            console.log('[ANCHOR_DEBUG] MintAuthority type not found or not a struct in idl.types');
          }
        } else {
          console.log('[ANCHOR_DEBUG] idl.types is undefined or empty');
        }

        // Detailed inspection of idl.accounts (raw structs)
        if (idl.accounts) {
          const mintAuthorityAccount = idl.accounts.find(acc => acc.name === 'MintAuthority');
          if (mintAuthorityAccount && mintAuthorityAccount.type.kind === 'struct') {
            const mintFieldInAccount = mintAuthorityAccount.type.fields.find((f: {name: string; type: any}) => f.name === 'mint');
            console.log('[ANCHOR_DEBUG] idl.accounts - MintAuthority.mint field type:', mintFieldInAccount ? JSON.stringify(mintFieldInAccount.type) : 'MintAuthority or mint field not found in idl.accounts');
          } else {
            console.log('[ANCHOR_DEBUG] MintAuthority account not found or not a struct in idl.accounts');
          }
        } else {
          console.log('[ANCHOR_DEBUG] idl.accounts is undefined or empty');
        }

        // Corrected debug log to inspect idl.types (assuming MintAuthority is types[0])
        // and its 'mint' field is fields[1]
        let mintFieldTypeForLog: string | IdlTypes<OtonomProgram> | object = 'idl.types not found or MintAuthority type not found'; // object for other complex types
        if (idl.types) {
          // Assuming IdlTypes<OtonomProgram> is the type for an element from idl.types (effectively IdlTypeDef)
          const mintAuthorityTypeDef: IdlTypes<OtonomProgram> | undefined = idl.types.find(t => t.name === 'MintAuthority') as IdlTypes<OtonomProgram> | undefined;

          // Check if the found type is a struct before accessing fields
          // The structure of IdlTypes (as IdlTypeDef) should have a 'type' property which in turn has 'kind' and 'fields'
          if (mintAuthorityTypeDef && typeof mintAuthorityTypeDef === 'object' && 'type' in mintAuthorityTypeDef && (mintAuthorityTypeDef.type as any).kind === 'struct') {
            // Assuming mintAuthorityTypeDef.type.fields exists and is an array.
            // Explicitly type 'f' to match the structure of an IdlField, with its 'type' as IdlTypes<OtonomProgram>.
            const structFields = (mintAuthorityTypeDef.type as any).fields as { name: string; type: IdlTypes<OtonomProgram> }[];
            const mintField = structFields.find(
              (f: { name: string; type: IdlTypes<OtonomProgram> }) => f.name === 'mint'
            );
            mintFieldTypeForLog = mintField ? mintField.type : 'mint field not found in MintAuthority';
          } else {
            mintFieldTypeForLog = 'MintAuthority type not found or not a struct';
          }
        }
        console.log('[ANCHOR_DEBUG] MintAuthority.mint field type in idl.types BEFORE new Program():',
            typeof mintFieldTypeForLog === 'string' ? mintFieldTypeForLog : JSON.stringify(mintFieldTypeForLog)
        );

        if (!idl.address || typeof idl.address !== 'string') {
          console.error("[ANCHOR] CRITICAL: Effective IDL is missing the 'address' field or it's not a string. Program ID:", PROGRAM_ID.toString());
          throw new Error("Effective IDL is missing a valid 'address' string field.");
        }
        if (!idl.metadata || typeof idl.metadata.address !== 'string') {
          console.error("[ANCHOR] CRITICAL: Effective IDL metadata is missing the 'address' field or it's not a string.");
          throw new Error("Effective IDL metadata is missing a valid 'address' string field.");
        }

        console.log('[ANCHOR] Using program address (from idl.address) for Program instantiation.');
        console.log("[ANCHOR] Provider object being passed to Program constructor:", provider);
        console.log("[ANCHOR] IDL object being passed to Program constructor and BorshCoder:", idl.name, idl.version);

        let programInstance: Program<OtonomProgram> | null = null; // Local variable for the instance
        programInstance = new (Program as any)(
          idl, 
          programIdPublicKey, 
          provider,
          new BorshCoder(idl) 
        ) as Program<OtonomProgram>;

        console.log('[ANCHOR] Program constructor called with full IDL, explicit BorshCoder, and ensured metadata.');

        // Ensure program is defined before using it or resolving the promise
        if (programInstance) {
          program = programInstance; // Assign to the module-level 'program' variable
          console.log('[ANCHOR] Program initialized successfully:', program.programId.toBase58());
          if (resolveProgramPromise) resolveProgramPromise(program); // Resolve the shared promise
        } else {
          // This case should ideally not be reached if the constructor succeeded and didn't throw,
          // or if it threw, it would be caught by the catch block below.
          const err = new Error('Program object is undefined after instantiation attempt without a thrown error.');
          console.error('[ANCHOR] CRITICAL:', err.message);
          if (rejectProgramPromise) rejectProgramPromise(err); // Reject the shared promise
        }
      } catch (error: any) { // Corrected catch block for the main try in IIFE
        console.error('[ANCHOR] Error during program initialization within IIFE:', error);
        if (rejectProgramPromise) rejectProgramPromise(error); // Reject the shared promise
        // Reset state to allow re-attempts for future calls to initializeProgram
        programInitializationPromise = null; 
        resolveProgramPromise = null;
        rejectProgramPromise = null;
      }
    })();
  });

  return programInitializationPromise;
}

/**
 * Get the initialized Anchor program instance
 * @returns A promise that resolves to the Program instance
 * @throws Error if the program is not initialized or initialization failed
 */
export async function getProgram(): Promise<Program<OtonomProgram>> {
  console.log('[ANCHOR] getProgram called.');
  if (program) {
    console.log('[ANCHOR] Program already initialized, returning existing instance.');
    return program;
  }
  if (programInitializationPromise) {
    console.log('[ANCHOR] Program initialization in progress, awaiting completion.');
    try {
      const p = await programInitializationPromise;
      console.log('[ANCHOR] Program initialization completed via getProgram, returning program.');
      return p;
    } catch (error) {
      console.error('[ANCHOR] Error during program initialization (awaited in getProgram):', error);
      // programInitializationPromise is reset to null inside its own catch block
      throw new Error('Program initialization failed.');
    }
  } else {
    console.error('[ANCHOR] Program not initialized and no initialization in progress. Call initializeProgram first.');
    throw new Error('Program not initialized. Call initializeProgram first with a valid wallet.');
  }
}

/**
 * Resets the program initialization state. 
 * Useful for tests or if the wallet disconnects and needs re-initialization.
 */
export function resetProgramInitialization(): void {
  console.log('[ANCHOR] Resetting program initialization state.');
  program = undefined;
  provider = undefined;
  programInitializationPromise = null;
  resolveProgramPromise = null;
  rejectProgramPromise = null;
}

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

// Helper to normalize a single field or type definition recursively
const normalizeRecursive = (item: any): void => {
  if (!item || typeof item !== 'object') {
    return;
  }

  if (Array.isArray(item)) {
    item.forEach(normalizeRecursive); // If item is an array of fields/variants, recurse on each element
    return;
  }

  // Handles direct type specification: { type: 'publicKey' } or nested: { type: { vec: 'publicKey' } }
  if (item.type === 'publicKey') {
    item.type = 'pubkey';
  } else if (typeof item.type === 'object') { 
    normalizeRecursive(item.type); // Recurse on the type object itself (e.g. for item.type.vec)
  }

  // For structs: recurse on 'fields' array. Each element of 'fields' is an IdlField.
  if (item.kind === 'struct' && Array.isArray(item.fields)) {
    item.fields.forEach(normalizeRecursive); // Each field will be processed
  }

  // For enums: recurse on 'variants' array. Each element is an IdlEnumVariant.
  if (item.kind === 'enum' && Array.isArray(item.variants)) {
    item.variants.forEach((variant: any) => { // Added 'any' type for variant
      if (Array.isArray(variant.fields)) { // Struct-like variant with its own fields
        variant.fields.forEach(normalizeRecursive);
      }
    });
  }

  // For collection/wrapper types within a field definition (e.g., a field's type is { vec: 'publicKey' })
  // These are typically found when item is an object like { vec: 'publicKey' } or { option: { defined: 'MyType' } }
  if (item.hasOwnProperty('vec')) { // Check explicitly for property existence
    if (item.vec === 'publicKey') item.vec = 'pubkey';
    else normalizeRecursive(item.vec);
  }
  if (item.hasOwnProperty('option')) {
    if (item.option === 'publicKey') item.option = 'pubkey';
    else normalizeRecursive(item.option);
  }
  if (item.hasOwnProperty('array')) {
    if (Array.isArray(item.array) && item.array.length > 0) {
      if (item.array[0] === 'publicKey') item.array[0] = 'pubkey';
      else normalizeRecursive(item.array[0]);
    }
  }
  
  // For 'defined' types within a field (e.g. { defined: "MyStruct" })
  // If item.defined is an object (rare, usually a string), recurse. String names are resolved by Anchor.
  if (item.hasOwnProperty('defined') && typeof item.defined === 'object' && item.defined !== null) {
      normalizeRecursive(item.defined);
  }
};

export const normalizeIdlTypesForAnchor = (idl: OtonomProgram): void => {
  console.log('[ANCHOR] Normalizing IDL field types (publicKey -> pubkey)...');
  if (idl.accounts) {
    idl.accounts.forEach((account: NonNullable<OtonomProgram['accounts']>[number]) => { // Use NonNullable for element type
      // account is expected to be IdlAccountDef. Its 'type' property is IdlTypeDefTy (struct/enum definition)
      // Using 'as any' as a workaround for persistent linting issues with 'account'
      const accountWithType = account as any;
      if (accountWithType.type && accountWithType.type.kind === 'struct') {
        normalizeRecursive(accountWithType.type); // Pass the struct type definition (IdlTypeDefTy)
      } else if (accountWithType.type && accountWithType.type.kind === 'enum') { // Also handle enums if present
        normalizeRecursive(accountWithType.type); // Pass the enum type definition (IdlTypeDefTy)
      }
    });
  }
  if (idl.types) {
    idl.types.forEach((typeDef: NonNullable<OtonomProgram['types']>[number]) => { // Use NonNullable for element type
      // typeDef.type is IdlTypeDefTy (struct or enum definition)
      // Using 'as any' for consistency, though errors were on 'account'
      const typeDefWithDetails = typeDef as any;
      if (typeDefWithDetails.type) {
        normalizeRecursive(typeDefWithDetails.type); // Pass the struct or enum type definition (IdlTypeDefTy)
      }
    });
  }
  console.log('[ANCHOR] IDL field type normalization complete.');
};
