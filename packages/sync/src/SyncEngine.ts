import { getSyncQueue, removeSyncQueueItem, incrementRetryCount, addToSyncQueue } from '@artisan/db';
import type { SyncQueueItem } from '@artisan/shared';
import { SYNC_INTERVALS } from '@artisan/shared';

export interface SyncResult {
  synced: number;
  failed: number;
  conflicts: number;
  timestamp: string;
}

export interface ConflictResolution {
  entityId: string;
  entityType: string;
  resolution: 'local' | 'remote' | 'merged';
  mergedData?: Record<string, unknown>;
}

export class SyncEngine {
  private isOnline = true;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private onSyncComplete?: (result: SyncResult) => void;
  private onStatusChange?: (isOnline: boolean) => void;

  constructor(options?: {
    onSyncComplete?: (result: SyncResult) => void;
    onStatusChange?: (isOnline: boolean) => void;
  }) {
    this.onSyncComplete = options?.onSyncComplete;
    this.onStatusChange = options?.onStatusChange;
  }

  start(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.setOnline(true));
      window.addEventListener('offline', () => this.setOnline(false));
    }

    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.sync();
      }
    }, SYNC_INTERVALS.AUTO_SYNC_MS);
  }

  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', () => this.setOnline(true));
      window.removeEventListener('offline', () => this.setOnline(false));
    }
  }

  setOnline(isOnline: boolean): void {
    if (this.isOnline !== isOnline) {
      this.isOnline = isOnline;
      this.onStatusChange?.(isOnline);

      if (isOnline) {
        this.sync();
      }
    }
  }

  getIsOnline(): boolean {
    return this.isOnline;
  }

  async sync(): Promise<SyncResult> {
    const queue = getSyncQueue();
    let synced = 0;
    let failed = 0;
    let conflicts = 0;

    for (const item of queue) {
      try {
        const success = await this.processItem(item);

        if (success) {
          removeSyncQueueItem(item.id);
          synced++;
        } else {
          incrementRetryCount(item.id);
          if (item.retryCount >= SYNC_INTERVALS.MAX_RETRIES) {
            removeSyncQueueItem(item.id);
          }
          failed++;
        }
      } catch (error) {
        console.error('Sync error for item:', item.id, error);
        incrementRetryCount(item.id);
        failed++;
      }
    }

    const result: SyncResult = {
      synced,
      failed,
      conflicts,
      timestamp: new Date().toISOString(),
    };

    this.onSyncComplete?.(result);
    return result;
  }

  private async processItem(item: SyncQueueItem): Promise<boolean> {
    console.log(`[Sync] Processing ${item.action} on ${item.entityType}:${item.entityId}`);

    await new Promise(resolve => setTimeout(resolve, 100));

    return true;
  }

  addToQueue(data: {
    entityType: SyncQueueItem['entityType'];
    entityId: string;
    action: SyncQueueItem['action'];
    payload: Record<string, unknown>;
  }): void {
    addToSyncQueue(data);
  }

  resolveConflict(local: Record<string, unknown>, remote: Record<string, unknown>): ConflictResolution {
    const localTime = new Date(local.lastUpdated as string).getTime();
    const remoteTime = new Date(remote.lastUpdated as string).getTime();

    if (localTime >= remoteTime) {
      return {
        entityId: local.id as string,
        entityType: 'unknown',
        resolution: 'local',
      };
    }

    return {
      entityId: remote.id as string,
      entityType: 'unknown',
      resolution: 'remote',
    };
  }
}
