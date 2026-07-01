import * as SQLite from 'expo-sqlite';

export interface InventoryItem {
  id: string;
  artisan_id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  reorder_level: number;
  price: number;
  last_updated: string;
  sync_status: 'pending' | 'synced' | 'conflict';
}

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('artisan.db');
    await initDatabase(db);
  }
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      artisan_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sku TEXT NOT NULL,
      quantity REAL NOT NULL DEFAULT 0,
      unit TEXT NOT NULL DEFAULT 'kg',
      reorder_level REAL NOT NULL DEFAULT 0,
      price REAL NOT NULL DEFAULT 0,
      last_updated TEXT NOT NULL DEFAULT (datetime('now')),
      sync_status TEXT NOT NULL DEFAULT 'pending'
    );

    CREATE INDEX IF NOT EXISTS idx_inventory_artisan ON inventory(artisan_id);
  `);
}

export async function getAllInventory(artisanId: string): Promise<InventoryItem[]> {
  const database = await getDatabase();
  const items = await database.getAllAsync<InventoryItem>(
    'SELECT * FROM inventory WHERE artisan_id = ? ORDER BY last_updated DESC',
    [artisanId]
  );
  return items;
}

export async function insertInventory(item: Omit<InventoryItem, 'last_updated' | 'sync_status'>): Promise<InventoryItem> {
  const database = await getDatabase();
  const now = new Date().toISOString();

  await database.runAsync(
    `INSERT INTO inventory (id, artisan_id, name, sku, quantity, unit, reorder_level, price, last_updated, sync_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [item.id, item.artisan_id, item.name, item.sku, item.quantity, item.unit, item.reorder_level, item.price, now]
  );

  const inserted = await database.getFirstAsync<InventoryItem>(
    'SELECT * FROM inventory WHERE id = ?',
    [item.id]
  );

  return inserted!;
}

export async function updateInventory(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | null> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.quantity !== undefined) { fields.push('quantity = ?'); values.push(updates.quantity); }
  if (updates.unit !== undefined) { fields.push('unit = ?'); values.push(updates.unit); }
  if (updates.reorder_level !== undefined) { fields.push('reorder_level = ?'); values.push(updates.reorder_level); }
  if (updates.price !== undefined) { fields.push('price = ?'); values.push(updates.price); }

  if (fields.length === 0) return null;

  fields.push("last_updated = ?", "sync_status = 'pending'");
  values.push(now, id);

  await database.runAsync(
    `UPDATE inventory SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  return database.getFirstAsync<InventoryItem>(
    'SELECT * FROM inventory WHERE id = ?',
    [id]
  );
}

export async function deleteInventory(id: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.runAsync('DELETE FROM inventory WHERE id = ?', [id]);
  return result.changes > 0;
}

export async function getPendingSyncCount(): Promise<number> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM inventory WHERE sync_status = 'pending'"
  );
  return result?.count || 0;
}

export async function markSynced(ids: string[]): Promise<void> {
  const database = await getDatabase();
  for (const id of ids) {
    await database.runAsync(
      "UPDATE inventory SET sync_status = 'synced' WHERE id = ?",
      [id]
    );
  }
}
