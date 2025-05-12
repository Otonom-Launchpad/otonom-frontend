/* eslint-disable @typescript-eslint/no-explicit-any */
// Utility to validate and optionally auto-fix an Anchor IDL object before it is
// passed to `new Program()`. Throws an aggregated Error if unrecoverable issues
// are found. All diagnostics are logged with the [IDL_VALIDATE] prefix so they
// can be filtered easily in browser console.

import { Idl } from '@coral-xyz/anchor';
import * as sha256 from 'js-sha256';
import { Buffer } from 'buffer';

// Define a helper type for an account definition within the IDL's 'accounts' array.
type IdlAccountDefinition = NonNullable<Idl['accounts']>[number];
// Define a helper type for a type definition within the IDL's 'types' array.
type IdlTypeDef = NonNullable<Idl['types']>[number];

// Local interface to represent the expected structure of an IDL struct's type definition
interface LocalIdlStructType {
  kind: 'struct';
  fields: Array<{ name: string; docs?: string[]; type: any /* Represents IdlType */ }>;
}

export function validateIdl(idl: Idl): Idl {
  console.log('[IDL_VALIDATE] Starting IDL validation and auto-fixing process.');

  if (!idl) {
    console.error('[IDL_VALIDATE] IDL object is null or undefined.');
    throw new Error('IDL object is null or undefined.');
  }

  if (!idl.types) {
    idl.types = [];
  }
  console.log("[IDL_VALIDATE_DEBUG] Ensured idl.types is initialized. Current count: ", idl.types.length);

  if (!idl.accounts) {
    idl.accounts = [];
    console.log("[IDL_VALIDATE_DEBUG] Initialized idl.accounts as empty array as it was undefined.");
  } else {
    console.log(`[IDL_VALIDATE_DEBUG] Starting generation of idl.types from ${idl.accounts.length} accounts.`);
    idl.accounts.forEach((account: IdlAccountDefinition) => {
      if (account && account.name && 'type' in account && account.type != null) {
        const currentAccountType: any = account.type;
        if (
          typeof currentAccountType === 'object' && currentAccountType !== null &&
          'kind' in currentAccountType && currentAccountType.kind === 'struct' &&
          'fields' in currentAccountType && Array.isArray(currentAccountType.fields)
        ) {
          const structType = currentAccountType as LocalIdlStructType;

          const newTypeDef: IdlTypeDef = {
            name: account.name,
            type: { 
              kind: 'struct',
              fields: structType.fields.map((field) => {
                let transformedField = { ...field }; // Start with a copy
                if (
                  typeof field.type === 'object' &&
                  field.type !== null &&
                  'defined' in field.type &&
                  (field.type as any).defined === 'publicKey' // Check if it's { defined: "publicKey" }
                ) {
                  console.log(`[IDL_VALIDATE_TRANSFORM] Field '${field.name}' in type '${account.name}' of type '${JSON.stringify(field.type)}' will be TRANSFORMED to 'publicKey' for idl.types.`);
                  transformedField.type = 'publicKey'; // Transform to string "publicKey"
                } else {
                  console.log(`[IDL_VALIDATE_TRANSFORM_SKIP] Field '${field.name}' in type '${account.name}' of type '${JSON.stringify(field.type)}' will be copied as-is to idl.types.`);
                  // No transformation needed, field.type is already correct from the spread { ...field }
                }
                return transformedField;
              })
            }
          };

          idl.types!.push(newTypeDef);
          console.log(`[IDL_VALIDATE_DEBUG] Generated type for '${account.name}' from account definition and added to idl.types. Current idl.types count: ${idl.types!.length}`);
          
          // CRUCIAL CHANGE: Modify the account's type to be a string reference
          account.type = account.name as any; 
          console.log(`[IDL_VALIDATE_DEBUG] Changed account '${account.name}' type to string reference: "${account.name}"`);

        } else {
          const accountIndex = idl.accounts?.indexOf(account) ?? 'unknown';
          console.warn(`[IDL_VALIDATE_WARN] Account '${account.name}' (at index ${accountIndex}) has a 'type' property, but it's not a recognized struct. Type details: ${JSON.stringify(currentAccountType)}`);
        }
      } else {
        const accountIndex = idl.accounts?.indexOf(account) ?? 'unknown';
        let typeDetails = 'N/A';
        if (account && 'type' in account && account.type != null) typeDetails = JSON.stringify(account.type);
        else if (account && 'type' in account) typeDetails = "'type' property is null or undefined";
        else typeDetails = "'type' property is missing";
        console.warn(`[IDL_VALIDATE_WARN] Account '${account?.name || 'unknown'}' (at index ${accountIndex}) is missing a 'type' property or is malformed. Skipping type generation. Details: ${typeDetails}`);
      }
    });
    console.log(`[IDL_VALIDATE_DEBUG] Finished generating idl.types. Final idl.types count: ${idl.types!.length}.`);
  }

  // Post-generation validation
  if (idl.accounts) {
    idl.accounts.forEach((acc: IdlAccountDefinition, index: number) => {
      if (!acc.name) {
        console.error(`[IDL_VALIDATE_ERROR_POST_GEN] Account at index ${index} is missing a name.`);
      }

      // The first loop should convert .type to a string for struct accounts.
      // This check is for any accounts where .type might not be a string after that processing.
      const accAsAny = acc as any; // Use a variable for clarity and to appease linter

      if (typeof accAsAny.type !== 'string') {
        let typeDetail = 'unknown';
        try {
          typeDetail = JSON.stringify(accAsAny.type);
        } catch (e) {
          // Fallback if stringify fails (e.g., circular references, though unlikely for IDL types)
          typeDetail = String(accAsAny.type);
        }
        console.warn(
          `[IDL_VALIDATE_WARN_POST_GEN] Account '${acc.name}' (index ${index}) has a non-string 'type' property after initial processing: ${typeDetail}. ` +
          `This is expected if the account was defined with a primitive type (e.g., 'publicKey') directly in idl.accounts, which is not modified by the first loop. ` +
          `If this account was expected to be a struct processed by the first loop (and thus have its type as a string reference), this might indicate an issue.`
        );
      }
    });
  }

  if (idl.instructions) {
    idl.instructions.forEach(instruction => {
      if (instruction.accounts) {
        instruction.accounts.forEach(iAccount => {
          const typedIAccount = iAccount as any;
          if (!typedIAccount.type) {
            console.warn(`[IDL_VALIDATE_WARN] Instruction '${instruction.name}', account '${typedIAccount.name}' is missing our custom 'type' field. Defaulting to 'publicKey'.`);
            typedIAccount.type = "publicKey";
          } else if (typeof typedIAccount.type === 'object' && 'defined' in typedIAccount.type && typedIAccount.type.defined === '') {
            console.warn(`[IDL_VALIDATE_WARN] Instruction '${instruction.name}', account '${typedIAccount.name}' has an empty 'defined' in its custom 'type' field. Defaulting to 'publicKey'.`);
            typedIAccount.type = "publicKey";
          }
        });
      }
    });
  }

  console.log(`[IDL_VALIDATE] IDL validation and processing complete. Accounts: ${idl.accounts?.length || 0}, Generated Types: ${idl.types?.length || 0}`);
  return idl;
}

export const normalizeIdlTypesForAnchor = (idl: Idl): void => {
  console.warn('[ANCHOR] normalizeIdlTypesForAnchor called - THIS FUNCTION IS CURRENTLY DEPRECATED AND SHOULD NOT BE MODIFYING THE IDL FOR PROGRAM CONSTRUCTOR');
  if (idl.metadata) {
    console.log(`[ANCHOR_DEPRECATED_NORMALIZE] IDL Metadata (if any): ${JSON.stringify(idl.metadata)}`);
  } else {
    console.warn('[ANCHOR_DEPRECATED_NORMALIZE] IDL metadata is missing.');
  }
};
