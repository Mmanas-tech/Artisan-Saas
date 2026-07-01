const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export interface DIDInfo {
  did: string | null;
  publicKeyBase58: string | null;
}

export interface LedgerEntry {
  transactionId: string;
  action: string;
  inventoryId?: string;
  quantity?: number;
  amount?: number;
  signatureHash: string | null;
  ceramicStreamId: string | null;
  verified: boolean;
  timestamp: string;
  status: string;
}

export interface TransactionProof {
  transactionId: string;
  signatureHash: string | null;
  ceramicStreamId: string | null;
  verified: boolean;
  timestamp: string;
  status: string;
}

function getAuthHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function getDIDInfo(token: string): Promise<DIDInfo> {
  const response = await fetch(`${API_BASE}/ledger/did`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch DID info');
  }

  return response.json();
}

export async function generateDID(
  token: string
): Promise<{ did: string; publicKeyBase58: string; createdAt: string }> {
  const response = await fetch(`${API_BASE}/ledger/did`, {
    method: 'POST',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error('Failed to generate DID');
  }

  return response.json();
}

export async function recordTransaction(
  token: string,
  transactionId: string,
  action: string,
  payload: Record<string, unknown>
): Promise<{
  transactionId: string;
  signatureHash: string;
  ceramicStreamId: string | null;
  verified: boolean;
  timestamp: string;
}> {
  const response = await fetch(`${API_BASE}/ledger/record`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ transactionId, action, payload }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Failed to record transaction');
  }

  return response.json();
}

export async function getLedgerHistory(
  token: string
): Promise<{ entries: LedgerEntry[]; did: string | null }> {
  const response = await fetch(`${API_BASE}/ledger/history`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch ledger history');
  }

  return response.json();
}

export async function getTransactionProof(
  token: string,
  transactionId: string
): Promise<TransactionProof> {
  const response = await fetch(
    `${API_BASE}/ledger/proof/${transactionId}`,
    { headers: getAuthHeaders(token) }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch transaction proof');
  }

  return response.json();
}

export async function verifyTransaction(
  token: string,
  transactionId: string
): Promise<{ valid: boolean; entry: TransactionProof | null }> {
  const response = await fetch(
    `${API_BASE}/ledger/verify/${transactionId}`,
    { headers: getAuthHeaders(token) }
  );

  if (!response.ok) {
    throw new Error('Failed to verify transaction');
  }

  return response.json();
}

export async function configureCeramic(
  token: string,
  endpoint: string
): Promise<{ status: string; endpoint: string }> {
  const response = await fetch(`${API_BASE}/ledger/config`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ endpoint }),
  });

  if (!response.ok) {
    throw new Error('Failed to configure Ceramic');
  }

  return response.json();
}

export function truncateHash(hash: string, chars = 8): string {
  if (hash.length <= chars * 2 + 3) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
