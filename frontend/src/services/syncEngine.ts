export type SyncAction = 'create' | 'update' | 'delete';
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict';
export type EntityType = 'inventory' | 'transaction' | 'listing' | 'coop';

export interface SyncQueueItem {
  id: string;
  entityType: EntityType;
  entityId: string;
  action: SyncAction;
  payload: Record<string, any>;
  timestamp: string;
  retryCount: number;
  status: SyncStatus;
}

export interface SyncResult {
  synced: number;
  failed: number;
  conflicts: number;
  timestamp: string;
}

export interface ConflictResolution {
  entityId: string;
  entityType: EntityType;
  resolution: 'local' | 'remote';
  mergedData?: Record<string, any>;
}

const STORAGE_KEY = 'artisan_sync_queue';
const MAX_RETRIES = 5;

let isOnlineStatusValue = typeof navigator !== 'undefined' ? navigator.onLine : true;
let syncInterval: ReturnType<typeof setInterval> | null = null;
let listeners: Array<(isOnline: boolean) => void> = [];
let memoryStore: SyncQueueItem[] = [];

function generateId(): string {
  return `sync-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function hasLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && window.localStorage !== undefined;
  } catch {
    return false;
  }
}

function getQueueFromStorage(): SyncQueueItem[] {
  if (hasLocalStorage()) {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
  return memoryStore;
}

function saveQueueToStorage(queue: SyncQueueItem[]): void {
  if (hasLocalStorage()) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error('Failed to save sync queue:', e);
    }
  } else {
    memoryStore = queue;
  }
}

export function getQueue(): SyncQueueItem[] {
  return getQueueFromStorage();
}

export function getPendingCount(): number {
  return getQueue().filter(item => item.status === 'pending').length;
}

export function addToQueue(data: {
  entityType: EntityType;
  entityId: string;
  action: SyncAction;
  payload: Record<string, any>;
}): SyncQueueItem {
  const queue = getQueue();

  const existing = queue.find(
    item => item.entityId === data.entityId && item.entityType === data.entityType && item.status === 'pending'
  );

  if (existing) {
    existing.action = data.action;
    existing.payload = data.payload;
    existing.timestamp = new Date().toISOString();
    existing.retryCount = 0;
    existing.status = 'pending';
    saveQueueToStorage(queue);
    return existing;
  }

  const item: SyncQueueItem = {
    id: generateId(),
    entityType: data.entityType,
    entityId: data.entityId,
    action: data.action,
    payload: data.payload,
    timestamp: new Date().toISOString(),
    retryCount: 0,
    status: 'pending',
  };

  queue.push(item);
  saveQueueToStorage(queue);
  return item;
}

export function removeFromQueue(id: string): void {
  const queue = getQueue().filter(item => item.id !== id);
  saveQueueToStorage(queue);
}

export function markSynced(id: string): void {
  const queue = getQueue();
  const item = queue.find(i => i.id === id);
  if (item) {
    item.status = 'synced';
    saveQueueToStorage(queue);
  }
}

export function markFailed(id: string): void {
  const queue = getQueue();
  const item = queue.find(i => i.id === id);
  if (item) {
    item.retryCount += 1;
    if (item.retryCount >= MAX_RETRIES) {
      item.status = 'failed';
    }
    saveQueueToStorage(queue);
  }
}

export function clearSynced(): void {
  const queue = getQueue().filter(item => item.status !== 'synced');
  saveQueueToStorage(queue);
}

export function clearAll(): void {
  saveQueueToStorage([]);
}

export function isOnline(): boolean {
  return isOnlineStatusValue;
}

export function onStatusChange(callback: (isOnline: boolean) => void): () => void {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
}

function setOnlineStatus(status: boolean): void {
  if (isOnlineStatusValue !== status) {
    isOnlineStatusValue = status;
    listeners.forEach(l => l(status));
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    setOnlineStatus(true);
    syncAll();
  });

  window.addEventListener('offline', () => {
    setOnlineStatus(false);
  });
}

export async function syncToServer(items: SyncQueueItem[]): Promise<SyncResult> {
  const result: SyncResult = {
    synced: 0,
    failed: 0,
    conflicts: 0,
    timestamp: new Date().toISOString(),
  };

  for (const item of items) {
    try {
      const response = await fetch('/api/sync/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          entityType: item.entityType,
          entityId: item.entityId,
          action: item.action,
          payload: item.payload,
          timestamp: item.timestamp,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.conflict) {
          const resolved = resolveConflict(item, data.serverData);
          if (resolved.resolution === 'local') {
            await pushToServer(item);
          }
          result.conflicts += 1;
        } else {
          markSynced(item.id);
          result.synced += 1;
        }
      } else if (response.status === 409) {
        const serverData = await response.json();
        const resolved = resolveConflict(item, serverData.data);
        if (resolved.resolution === 'local') {
          await pushToServer(item);
        }
        result.conflicts += 1;
      } else {
        markFailed(item.id);
        result.failed += 1;
      }
    } catch (error) {
      markFailed(item.id);
      result.failed += 1;
    }
  }

  return result;
}

async function pushToServer(item: SyncQueueItem): Promise<boolean> {
  try {
    const response = await fetch('/api/sync/resolve', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType: item.entityType,
        entityId: item.entityId,
        action: item.action,
        payload: item.payload,
        timestamp: item.timestamp,
      }),
    });

    if (response.ok) {
      markSynced(item.id);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function resolveConflict(local: SyncQueueItem, remoteData: Record<string, any>): ConflictResolution {
  const localTime = new Date(local.payload.last_updated || local.timestamp).getTime();
  const remoteTime = new Date(remoteData.last_updated || remoteData.timestamp).getTime();

  return {
    entityId: local.entityId,
    entityType: local.entityType,
    resolution: localTime >= remoteTime ? 'local' : 'remote',
    mergedData: localTime >= remoteTime ? local.payload : remoteData,
  };
}

export async function syncAll(): Promise<SyncResult> {
  if (!isOnlineStatusValue) {
    return { synced: 0, failed: 0, conflicts: 0, timestamp: new Date().toISOString() };
  }

  const queue = getQueue().filter(item => item.status === 'pending');

  if (queue.length === 0) {
    return { synced: 0, failed: 0, conflicts: 0, timestamp: new Date().toISOString() };
  }

  const queueToUpdate = getQueue();
  queueToUpdate.forEach(item => {
    if (item.status === 'pending') {
      item.status = 'syncing';
    }
  });
  saveQueueToStorage(queueToUpdate);

  return syncToServer(queue);
}

export function startAutoSync(intervalMs = 30000): void {
  stopAutoSync();
  syncInterval = setInterval(() => {
    if (isOnlineStatusValue) {
      syncAll();
    }
  }, intervalMs);
}

export function stopAutoSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

export function getSyncStats(): {
  total: number;
  pending: number;
  syncing: number;
  synced: number;
  failed: number;
} {
  const queue = getQueue();
  return {
    total: queue.length,
    pending: queue.filter(i => i.status === 'pending').length,
    syncing: queue.filter(i => i.status === 'syncing').length,
    synced: queue.filter(i => i.status === 'synced').length,
    failed: queue.filter(i => i.status === 'failed').length,
  };
}
