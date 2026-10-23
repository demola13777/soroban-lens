import { StrKey } from '@stellar/stellar-sdk';

/**
 * Contract id validation, shared so the indexer and `lens doctor` cannot drift.
 *
 * A Soroban contract id is a StrKey: 'C' followed by 55 base32 characters
 * (RFC 4648 alphabet, so A-Z and 2-7 — no 0, 1, 8 or 9), with a valid CRC16
 * checksum. Account ids use the same alphabet but start with 'G', which is the
 * mistake worth naming explicitly, because the RPC's own error is not obvious.
 */
export const CONTRACT_ID_PATTERN = /^C[A-Z2-7]{55}$/;

/** The hint used everywhere an invalid contract id is rejected. */
export const CONTRACT_ID_HINT =
  "A contract id is 'C' followed by 55 characters (A-Z, 2-7). Account ids start with 'G' and are not contracts. If an id has the right shape but fails its checksum, a character was probably mistyped.";

export function isContractId(value: string): boolean {
  return CONTRACT_ID_PATTERN.test(value) && StrKey.isValidContract(value);
}
/** Thrown before any network call when a configured contract id is malformed. */
export class InvalidContractIdError extends Error {
  readonly invalid: string[];
  constructor(invalid: string[]) {
    super(`not contract StrKeys: ${invalid.join(', ')}. ${CONTRACT_ID_HINT}`);
    this.name = 'InvalidContractIdError';
    this.invalid = invalid;
  }
}

/**
 * Reject malformed ids up front.
 *
 * An empty list is valid and means "every contract on the network", which is
 * the documented behaviour of `LENS_CONTRACT_IDS` being unset.
 */
export function assertContractIds(contractIds: readonly string[]): void {
  const invalid = contractIds.filter((id) => !isContractId(id));
  if (invalid.length > 0) throw new InvalidContractIdError(invalid);
}
