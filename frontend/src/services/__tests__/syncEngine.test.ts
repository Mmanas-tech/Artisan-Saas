import {
  addToQueue,
  getQueue,
  getPendingCount,
  removeFromQueue,
  markSynced,
  markFailed,
  clearSynced,
  clearAll,
  resolveConflict,
  getSyncStats,
  type SyncQueueItem,
} from '../syncEngine';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
  clearAll();
  jest.clearAllMocks();
});

describe('SyncQueue', () => {
  it('starts with empty queue', () => {
    expect(getQueue()).toEqual([]);
    expect(getPendingCount()).toBe(0);
  });

  it('adds item to queue', () => {
    const item = addToQueue({
      entityType: 'inventory',
      entityId: 'item-1',
      action: 'create',
      payload: { name: 'Clay', quantity: 10 },
    });

    expect(item.id).toBeDefined();
    expect(item.entityType).toBe('inventory');
    expect(item.entityId).toBe('item-1');
    expect(item.action).toBe('create');
    expect(item.status).toBe('pending');
    expect(item.retryCount).toBe(0);

    const queue = getQueue();
    expect(queue.length).toBe(1);
    expect(getPendingCount()).toBe(1);
  });

  it('deduplicates pending items for same entity', () => {
    addToQueue({
      entityType: 'inventory',
      entityId: 'item-1',
      action: 'create',
      payload: { name: 'Clay', quantity: 10 },
    });

    addToQueue({
      entityType: 'inventory',
      entityId: 'item-1',
      action: 'update',
      payload: { name: 'Clay', quantity: 20 },
    });

    const queue = getQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].action).toBe('update');
    expect(queue[0].payload.quantity).toBe(20);
  });

  it('allows different entities', () => {
    addToQueue({
      entityType: 'inventory',
      entityId: 'item-1',
      action: 'create',
      payload: { name: 'Clay' },
    });

    addToQueue({
      entityType: 'transaction',
      entityId: 'tx-1',
      action: 'create',
      payload: { amount: 100 },
    });

    expect(getQueue().length).toBe(2);
  });

  it('removes item from queue', () => {
    const item = addToQueue({
      entityType: 'inventory',
      entityId: 'item-1',
      action: 'create',
      payload: { name: 'Clay' },
    });

    removeFromQueue(item.id);
    expect(getQueue().length).toBe(0);
    expect(getPendingCount()).toBe(0);
  });

  it('marks item as synced', () => {
    const item = addToQueue({
      entityType: 'inventory',
      entityId: 'item-1',
      action: 'create',
      payload: { name: 'Clay' },
    });

    markSynced(item.id);

    const queue = getQueue();
    expect(queue[0].status).toBe('synced');
    expect(getPendingCount()).toBe(0);
  });

  it('marks item as failed and increments retry count', () => {
    const item = addToQueue({
      entityType: 'inventory',
      entityId: 'item-1',
      action: 'create',
      payload: { name: 'Clay' },
    });

    markFailed(item.id);
    expect(getQueue()[0].retryCount).toBe(1);
    expect(getQueue()[0].status).toBe('pending');

    markFailed(item.id);
    expect(getQueue()[0].retryCount).toBe(2);
  });

  it('marks as failed after max retries', () => {
    const item = addToQueue({
      entityType: 'inventory',
      entityId: 'item-1',
      action: 'create',
      payload: { name: 'Clay' },
    });

    for (let i = 0; i < 5; i++) {
      markFailed(item.id);
    }

    expect(getQueue()[0].status).toBe('failed');
  });

  it('clears synced items', () => {
    const item1 = addToQueue({
      entityType: 'inventory',
      entityId: 'item-1',
      action: 'create',
      payload: { name: 'Clay' },
    });

    const item2 = addToQueue({
      entityType: 'inventory',
      entityId: 'item-2',
      action: 'create',
      payload: { name: 'Wood' },
    });

    markSynced(item1.id);
    clearSynced();

    const queue = getQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].id).toBe(item2.id);
  });

  it('clears all items', () => {
    addToQueue({
      entityType: 'inventory',
      entityId: 'item-1',
      action: 'create',
      payload: { name: 'Clay' },
    });

    addToQueue({
      entityType: 'inventory',
      entityId: 'item-2',
      action: 'create',
      payload: { name: 'Wood' },
    });

    clearAll();
    expect(getQueue().length).toBe(0);
  });

  it('returns correct sync stats', () => {
    const item1 = addToQueue({
      entityType: 'inventory',
      entityId: 'item-1',
      action: 'create',
      payload: { name: 'Clay' },
    });

    const item2 = addToQueue({
      entityType: 'inventory',
      entityId: 'item-2',
      action: 'create',
      payload: { name: 'Wood' },
    });

    addToQueue({
      entityType: 'inventory',
      entityId: 'item-3',
      action: 'create',
      payload: { name: 'Metal' },
    });

    markSynced(item1.id);
    for (let i = 0; i < 5; i++) {
      markFailed(item2.id);
    }

    const stats = getSyncStats();
    expect(stats.total).toBe(3);
    expect(stats.synced).toBe(1);
    expect(stats.pending).toBe(1);
    expect(stats.failed).toBe(1);
  });
});

describe('Conflict Resolution', () => {
  it('resolves in favor of newer local data', () => {
    const localItem: SyncQueueItem = {
      id: 'sync-1',
      entityType: 'inventory',
      entityId: 'item-1',
      action: 'update',
      payload: { name: 'Clay', quantity: 20, last_updated: '2024-01-15T12:00:00Z' },
      timestamp: '2024-01-15T12:00:00Z',
      retryCount: 0,
      status: 'pending',
    };

    const remoteData = {
      name: 'Clay',
      quantity: 15,
      last_updated: '2024-01-15T11:00:00Z',
    };

    const result = resolveConflict(localItem, remoteData);
    expect(result.resolution).toBe('local');
    expect(result.mergedData?.quantity).toBe(20);
  });

  it('resolves in favor of newer remote data', () => {
    const localItem: SyncQueueItem = {
      id: 'sync-1',
      entityType: 'inventory',
      entityId: 'item-1',
      action: 'update',
      payload: { name: 'Clay', quantity: 20, last_updated: '2024-01-15T11:00:00Z' },
      timestamp: '2024-01-15T11:00:00Z',
      retryCount: 0,
      status: 'pending',
    };

    const remoteData = {
      name: 'Clay',
      quantity: 15,
      last_updated: '2024-01-15T12:00:00Z',
    };

    const result = resolveConflict(localItem, remoteData);
    expect(result.resolution).toBe('remote');
    expect(result.mergedData?.quantity).toBe(15);
  });

  it('defaults to local when timestamps are equal', () => {
    const localItem: SyncQueueItem = {
      id: 'sync-1',
      entityType: 'inventory',
      entityId: 'item-1',
      action: 'update',
      payload: { name: 'Clay', quantity: 20, last_updated: '2024-01-15T12:00:00Z' },
      timestamp: '2024-01-15T12:00:00Z',
      retryCount: 0,
      status: 'pending',
    };

    const remoteData = {
      name: 'Clay',
      quantity: 15,
      last_updated: '2024-01-15T12:00:00Z',
    };

    const result = resolveConflict(localItem, remoteData);
    expect(result.resolution).toBe('local');
  });
});
