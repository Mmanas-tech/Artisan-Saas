import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getSyncQueue, removeSyncQueueItem, getSyncQueueCount, incrementRetryCount } from '@artisan/db';
import { SYNC_INTERVALS } from '@artisan/shared';

const router = Router();

router.use(authenticate);

router.get('/status', (req: AuthRequest, res: Response) => {
  const count = getSyncQueueCount();
  res.json({
    pendingCount: count,
    isOnline: true,
    lastSync: new Date().toISOString(),
  });
});

router.post('/batch', (req: AuthRequest, res: Response) => {
  const queue = getSyncQueue();
  const results: Array<{ id: string; status: 'synced' | 'failed' }> = [];

  for (const item of queue) {
    try {
      removeSyncQueueItem(item.id);
      results.push({ id: item.id, status: 'synced' });
    } catch {
      incrementRetryCount(item.id);
      if (item.retryCount >= SYNC_INTERVALS.MAX_RETRIES) {
        removeSyncQueueItem(item.id);
      }
      results.push({ id: item.id, status: 'failed' });
    }
  }

  res.json({
    synced: results.filter(r => r.status === 'synced').length,
    failed: results.filter(r => r.status === 'failed').length,
    results,
  });
});

export { router as syncRoutes };
