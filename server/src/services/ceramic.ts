import { randomBytes, createHash } from 'crypto';

export interface DIDKeyPair {
  did: string;
  publicKeyBase58: string;
  privateKeyBase58: string;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  did: string;
  transactionId: string;
  action: string;
  payload: Record<string, unknown>;
  signatureHash: string;
  ceramicStreamId?: string;
  timestamp: string;
}

export interface SignedTransaction {
  transactionId: string;
  action: string;
  payload: Record<string, unknown>;
  signatureHash: string;
  ceramicStreamId?: string;
  timestamp: string;
}

const LEDGER_KEY = 'artisan_ceramic_ledger';

function generateBase58(bytes: Buffer): string {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = '';
  for (const byte of bytes) {
    result += alphabet[byte % alphabet.length];
  }
  return result;
}

let memoryLedger: LedgerEntry[] = [];

function getLocalLedger(): LedgerEntry[] {
  if (typeof globalThis.localStorage !== 'undefined') {
    try {
      const data = localStorage.getItem(LEDGER_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
  return memoryLedger;
}

function saveLocalLedger(entries: LedgerEntry[]): void {
  if (typeof globalThis.localStorage !== 'undefined') {
    try {
      localStorage.setItem(LEDGER_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error('Failed to save ledger:', e);
    }
  } else {
    memoryLedger = entries;
  }
}

let ceramicEndpoint: string | null = null;
let ceramicClient: { createStream: (data: unknown) => Promise<{ id: string }> } | null = null;

export function configureCeramic(endpoint: string): void {
  ceramicEndpoint = endpoint;
  ceramicClient = null;
}

export function clearLedger(): void {
  memoryLedger = [];
}

export function getCeramicEndpoint(): string | null {
  return ceramicEndpoint;
}

async function getClient(): Promise<typeof ceramicClient> {
  if (ceramicClient) return ceramicClient;
  if (!ceramicEndpoint) return null;

  try {
    const { CeramicClient } = await import('@ceramicnetwork/http-client');
    ceramicClient = new CeramicClient(ceramicEndpoint) as unknown as typeof ceramicClient;
    return ceramicClient;
  } catch (err) {
    console.warn('Ceramic client unavailable, using local fallback:', (err as Error).message);
    return null;
  }
}

export function generateDID(): DIDKeyPair {
  const privateKeyBytes = randomBytes(32);
  const publicKeyBytes = randomBytes(32);

  const didKey = `did:key:z${generateBase58(publicKeyBytes)}`;
  const publicKeyBase58 = generateBase58(publicKeyBytes);
  const privateKeyBase58 = generateBase58(privateKeyBytes);

  return {
    did: didKey,
    publicKeyBase58,
    privateKeyBase58,
    createdAt: new Date().toISOString(),
  };
}

export function signPayload(
  payload: Record<string, unknown>,
  keyBase58: string
): string {
  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  const keyHash = createHash('sha256').update(keyBase58).digest('hex').slice(0, 16);
  return createHash('sha256').update(`${canonical}:${keyHash}`).digest('hex');
}

export async function recordTransaction(
  did: string,
  transactionId: string,
  action: string,
  payload: Record<string, unknown>,
  publicKeyBase58: string
): Promise<SignedTransaction> {
  const signatureHash = signPayload(payload, publicKeyBase58);

  let ceramicStreamId: string | undefined;

  const client = await getClient();
  if (client) {
    try {
      const stream = await client.createStream({
        family: 'artisan-ledger',
        controllers: [did],
        data: {
          transactionId,
          action,
          payload,
          signatureHash,
          timestamp: new Date().toISOString(),
        },
      });
      ceramicStreamId = stream.id;
    } catch (err) {
      console.warn('Ceramic write failed, using local fallback:', (err as Error).message);
    }
  }

  const entry: LedgerEntry = {
    id: `ledger-${Date.now()}-${randomBytes(4).toString('hex')}`,
    did,
    transactionId,
    action,
    payload,
    signatureHash,
    ceramicStreamId,
    timestamp: new Date().toISOString(),
  };

  const ledger = getLocalLedger();
  ledger.push(entry);
  saveLocalLedger(ledger);

  return {
    transactionId,
    action,
    payload,
    signatureHash,
    ceramicStreamId,
    timestamp: entry.timestamp,
  };
}

export async function getLedgerByDID(did: string): Promise<LedgerEntry[]> {
  const client = await getClient();
  if (client) {
    try {
      const streams = await (client as unknown as { query: (q: unknown) => Promise<{ rows: Array<{ streamId: string; content: LedgerEntry }> }> }).query({
        controllers: [did],
        family: 'artisan-ledger',
      });

      if (streams?.rows?.length) {
        return streams.rows.map((row) => ({
          id: row.streamId,
          did: (row.content as LedgerEntry).did,
          transactionId: (row.content as LedgerEntry).transactionId,
          action: (row.content as LedgerEntry).action,
          payload: (row.content as LedgerEntry).payload,
          signatureHash: (row.content as LedgerEntry).signatureHash,
          ceramicStreamId: (row.content as LedgerEntry).ceramicStreamId,
          timestamp: (row.content as LedgerEntry).timestamp,
        }));
      }
    } catch (err) {
      console.warn('Ceramic query failed, using local fallback:', (err as Error).message);
    }
  }

  return getLocalLedger().filter((entry) => entry.did === did);
}

export async function getLedgerEntry(
  transactionId: string
): Promise<LedgerEntry | null> {
  const ledger = getLocalLedger();
  return ledger.find((entry) => entry.transactionId === transactionId) || null;
}

export async function verifySignature(
  transactionId: string,
  publicKeyBase58: string
): Promise<{ valid: boolean; entry: LedgerEntry | null }> {
  const entry = await getLedgerEntry(transactionId);
  if (!entry) return { valid: false, entry: null };

  const expectedHash = signPayload(entry.payload, publicKeyBase58);
  const valid = entry.signatureHash === expectedHash;

  return { valid, entry };
}
