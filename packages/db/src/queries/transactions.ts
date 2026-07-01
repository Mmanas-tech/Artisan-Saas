import { getDatabase } from '../index';
import type { Transaction, TransactionType, SyncStatus } from '@artisan/shared';
import { v4 as uuid } from 'uuid';

export function getTransactionsByArtisan(artisanId: string, limit = 50): Transaction[] {
  const db = getDatabase();
  const rows = db.prepare(
    'SELECT * FROM transactions WHERE from_artisan_id = ? OR to_artisan_id = ? ORDER BY timestamp DESC LIMIT ?'
  ).all(artisanId, artisanId, limit) as any[];
  return rows.map(mapRowToTransaction);
}

export function getTransactionById(id: string): Transaction | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as any;
  return row ? mapRowToTransaction(row) : null;
}

export function createTransaction(data: {
  type: TransactionType;
  fromArtisanId: string;
  toArtisanId?: string;
  inventoryId: string;
  quantity: number;
  amount?: number;
  voiceCommand?: string;
}): Transaction {
  const db = getDatabase();
  const id = uuid();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO transactions (id, type, from_artisan_id, to_artisan_id, inventory_id, quantity, amount, timestamp, voice_command, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(id, data.type, data.fromArtisanId, data.toArtisanId || null, data.inventoryId, data.quantity, data.amount || null, now, data.voiceCommand || null);

  return getTransactionById(id)!;
}

export function getRecentTransactions(artisanId: string, limit = 10): Transaction[] {
  const db = getDatabase();
  const rows = db.prepare(
    'SELECT * FROM transactions WHERE from_artisan_id = ? ORDER BY timestamp DESC LIMIT ?'
  ).all(artisanId, limit) as any[];
  return rows.map(mapRowToTransaction);
}

function mapRowToTransaction(row: any): Transaction {
  return {
    id: row.id,
    type: row.type as TransactionType,
    fromArtisanId: row.from_artisan_id,
    toArtisanId: row.to_artisan_id || undefined,
    inventoryId: row.inventory_id,
    quantity: row.quantity,
    amount: row.amount || undefined,
    timestamp: row.timestamp,
    voiceCommand: row.voice_command || undefined,
    blockchainHash: row.blockchain_hash || undefined,
    status: row.status as SyncStatus,
  };
}
