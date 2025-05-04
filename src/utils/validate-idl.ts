/* eslint-disable @typescript-eslint/no-explicit-any */
// Utility to validate and optionally auto-fix an Anchor IDL object before it is
// passed to `new Program()`. Throws an aggregated Error if unrecoverable issues
// are found. All diagnostics are logged with the [IDL_VALIDATE] prefix so they
// can be filtered easily in browser console.

import * as sha256 from 'js-sha256';
import { Buffer } from 'buffer';

export function validateIdl(idl: any): void {
  const issues: string[] = [];

  if (!idl || typeof idl !== 'object') {
    throw new Error('[IDL_VALIDATE] IDL is not an object');
  }

  // ---- Ensure base arrays exist ----
  if (!Array.isArray(idl.accounts)) {
    console.warn('[IDL_VALIDATE] Missing accounts array – inserting empty []');
    // Anchor tolerates an empty list; initialise to avoid undefined errors
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    idl.accounts = [];
  }
  if (!Array.isArray(idl.types)) {
    // Types are optional but Anchor coder may lookup by account name
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    idl.types = [];
  }

  const accountNames = new Map<string, any>();

  // ---- Validate accounts ----
  idl.accounts.forEach((acc: any, idx: number) => {
    if (!acc || typeof acc !== 'object') {
      issues.push(`Account at index ${idx} is not an object`);
      return;
    }
    if (!acc.name || typeof acc.name !== 'string' || acc.name.trim().length === 0) {
      issues.push(`Account at index ${idx} has invalid name: ${JSON.stringify(acc.name)}`);
      return;
    }
    if (!acc.type || typeof acc.type !== 'object') {
      issues.push(`Account "${acc.name}" missing valid type property`);
    }
    // Check duplicates
    if (accountNames.has(acc.name)) {
      const existing = JSON.stringify(accountNames.get(acc.name));
      const current = JSON.stringify(acc);
      if (existing !== current) {
        issues.push(`Duplicate account definition with conflicting layout for "${acc.name}"`);
      }
      // Keep the first definition; skip this duplicate
      return;
    }
    accountNames.set(acc.name, acc);
  });

  // ---- Validate types ----
  const typeNames = new Set<string>();
  idl.types.forEach((t: any, idx: number) => {
    if (!t || typeof t !== 'object') {
      issues.push(`Type at index ${idx} is not an object`);
      return;
    }
    if (!t.name || typeof t.name !== 'string' || t.name.trim().length === 0) {
      issues.push(`Type at index ${idx} has invalid name`);
    }
    if (!t.type || typeof t.type !== 'object') {
      issues.push(`Type "${t.name}" missing type layout`);
    }
    if (typeNames.has(t.name)) {
      issues.push(`Duplicate type entry for "${t.name}"`);
    }
    typeNames.add(t.name);
  });

  // ---- Ensure we can compute discriminators just like Anchor ----
  if (Array.isArray(idl.accounts)) {
    idl.accounts.forEach((acc: any, idx: number) => {
      const discSource = `account:${acc?.name}`;
      // js-sha256 returns a 32-byte array; take first 8 per Anchor spec
      const digest = (sha256 as any).digest(discSource);
      const disc8 = Array.from(digest.slice(0, 8));

      // If discriminator is missing or malformed, populate/fix it
      if (
        !acc.discriminator ||
        !Array.isArray(acc.discriminator) ||
        acc.discriminator.length !== 8
      ) {
        acc.discriminator = disc8;
      }

      // Verify Buffer.from succeeds (same call Anchor will make)
      try {
        Buffer.from(acc.discriminator);
      } catch (err) {
        issues.push(
          `Invalid discriminator for account \"${acc?.name}\" (#${idx}): ${(err as Error).message}`
        );
      }
    });
  }

  // ---- Cross-check instruction account references ----
  if (Array.isArray(idl.instructions)) {
    idl.instructions.forEach((ix: any, ixIdx: number) => {
      ix.accounts?.forEach((acct: any, acctIdx: number) => {
        const ref = acct?.name;
        if (!accountNames.has(ref)) {
          issues.push(`Instruction "${ix.name}" (#${ixIdx}) references unknown account "${ref}" (param #${acctIdx})`);
        }
      });
    });
  }

  // ---- Final verdict ----
  if (issues.length > 0) {
    const message = `[IDL_VALIDATE] ${issues.length} issue(s) found:\n - ${issues.join('\n - ')}`;
    throw new Error(message);
  }

  console.log('[IDL_VALIDATE] IDL validation passed –', `${accountNames.size} accounts, ${typeNames.size} types`);
}
