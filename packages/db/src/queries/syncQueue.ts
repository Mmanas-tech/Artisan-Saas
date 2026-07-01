import { getDatabase } from '../index';
import type { SyncQueueItem } from '@artisan/shared';
import { v4 as uuid } from 'uuid';

export function addToSyncQueue(data: {
  entityType: SyncQueueItem['entityType'];
  entityId: string;
  action: SyncQueueItem['action'];
  payload: Record<string, unknown>;
}): SyncQueueItem {
  const db = getDatabase();
  const id = uuid();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO sync_queue (id, entity_type, entity_id, action, payload, timestamp, retry_count)
    VALUES (?, ?, ?, ?, ?, ?, 0)
  `).run(id, data.entityType, data.entityId, data.action, JSON.stringify(data.payload), now);

  return { id, ...data, payload: data.payload, timestamp: now, retryCount: 0 };
}

export function getSyncQueue(): SyncQueueItem[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM sync_queue ORDER BY timestamp ASC LIMIT 100').all() as any[];
  return rows.map(mapRowToQueueItem);
}

export function getSyncQueueCount(): number {
  const db = getDatabase();
  const result = db.prepare('SELECT COUNT(*) as count FROM sync_queue').get() as any;
  return result.count;
}

export function removeSyncQueueItem(id: string): boolean {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM sync_queue WHERE id = ?').run(id);
  return result.changes > 0;
}

export function incrementRetryCount(id: string): void {
  const db = getDatabase();
  db.prepare('UPDATE sync_queue SET retry_count = retry_count + 1 WHERE id = ?').run(id);
}

export function clearSyncQueue(): void {
  const db = getDatabase();
  db.prepare('DELETE FROM sync_queue').run();
}

function mapRowToQueueItem(row: any): SyncQueueItem {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    action: row.action,
    payload: JSON.parse(row.payload),
    timestamp: row.timestamp,
    retryCount: row.retry_count,
  };
}
