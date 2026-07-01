import { getDatabase } from '../index';
import type { InventoryItem, SyncStatus } from '@artisan/shared';
import { v4 as uuid } from 'uuid';

export function getInventoryByArtisan(artisanId: string): InventoryItem[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM inventory WHERE artisan_id = ? ORDER BY last_updated DESC').all(artisanId) as any[];
  return rows.map(mapRowToItem);
}

export function getInventoryItem(id: string): InventoryItem | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM inventory WHERE id = ?').get(id) as any;
  return row ? mapRowToItem(row) : null;
}

export function createInventoryItem(data: {
  artisanId: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  price: number;
}): InventoryItem {
  const db = getDatabase();
  const id = uuid();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO inventory (id, artisan_id, name, sku, quantity, unit, reorder_level, price, last_updated, sync_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(id, data.artisanId, data.name, data.sku, data.quantity, data.unit, data.reorderLevel, data.price, now);

  return getInventoryItem(id)!;
}

export function updateInventoryItem(id: string, data: Partial<{
  quantity: number;
  unit: string;
  reorderLevel: number;
  price: number;
  name: string;
}>): InventoryItem | null {
  const db = getDatabase();
  const existing = getInventoryItem(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updates: string[] = [];
  const values: any[] = [];

  if (data.quantity !== undefined) { updates.push('quantity = ?'); values.push(data.quantity); }
  if (data.unit !== undefined) { updates.push('unit = ?'); values.push(data.unit); }
  if (data.reorderLevel !== undefined) { updates.push('reorder_level = ?'); values.push(data.reorderLevel); }
  if (data.price !== undefined) { updates.push('price = ?'); values.push(data.price); }
  if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name); }

  updates.push('last_updated = ?', 'sync_status = ?');
  values.push(now, 'pending', id);

  db.prepare(`UPDATE inventory SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  return getInventoryItem(id);
}

export function deleteInventoryItem(id: string): boolean {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM inventory WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getLowStockItems(artisanId: string): InventoryItem[] {
  const db = getDatabase();
  const rows = db.prepare(
    'SELECT * FROM inventory WHERE artisan_id = ? AND quantity <= reorder_level ORDER BY quantity ASC'
  ).all(artisanId) as any[];
  return rows.map(mapRowToItem);
}

export function getTotalInventoryValue(artisanId: string): number {
  const db = getDatabase();
  const result = db.prepare(
    'SELECT COALESCE(SUM(quantity * price), 0) as total FROM inventory WHERE artisan_id = ?'
  ).get(artisanId) as any;
  return result.total;
}

function mapRowToItem(row: any): InventoryItem {
  return {
    id: row.id,
    artisanId: row.artisan_id,
    name: row.name,
    sku: row.sku,
    quantity: row.quantity,
    unit: row.unit,
    reorderLevel: row.reorder_level,
    price: row.price,
    lastUpdated: row.last_updated,
    syncedToBlockchain: row.synced_to_blockchain === 1,
    syncStatus: row.sync_status as SyncStatus,
  };
}
