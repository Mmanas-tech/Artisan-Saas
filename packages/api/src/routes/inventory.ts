import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import {
  getInventoryByArtisan,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockItems,
  getTotalInventoryValue,
} from '@artisan/db';
import { addToSyncQueue } from '@artisan/db';

const router = Router();

router.use(authenticate);

router.get('/', (req: AuthRequest, res: Response) => {
  const items = getInventoryByArtisan(req.userId!);
  const totalValue = getTotalInventoryValue(req.userId!);
  const lowStock = getLowStockItems(req.userId!);

  res.json({ items, totalValue, lowStockCount: lowStock.length });
});

router.get('/:id', (req: AuthRequest, res: Response) => {
  const item = getInventoryItem(req.params.id);

  if (!item) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  if (item.artisanId !== req.userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  res.json(item);
});

router.post('/', (req: AuthRequest, res: Response) => {
  const { name, sku, quantity, unit, reorderLevel, price } = req.body;

  if (!name || quantity === undefined || !unit) {
    res.status(400).json({ error: 'Name, quantity, and unit required' });
    return;
  }

  const item = createInventoryItem({
    artisanId: req.userId!,
    name,
    sku: sku || `SKU-${Date.now()}`,
    quantity,
    unit,
    reorderLevel: reorderLevel || 0,
    price: price || 0,
  });

  addToSyncQueue({
    entityType: 'inventory',
    entityId: item.id,
    action: 'create',
    payload: item,
  });

  res.status(201).json(item);
});

router.patch('/:id', (req: AuthRequest, res: Response) => {
  const existing = getInventoryItem(req.params.id);

  if (!existing) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  if (existing.artisanId !== req.userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const updated = updateInventoryItem(req.params.id, req.body);

  if (updated) {
    addToSyncQueue({
      entityType: 'inventory',
      entityId: updated.id,
      action: 'update',
      payload: updated,
    });
  }

  res.json(updated);
});

router.delete('/:id', (req: AuthRequest, res: Response) => {
  const existing = getInventoryItem(req.params.id);

  if (!existing) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  if (existing.artisanId !== req.userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  deleteInventoryItem(req.params.id);

  addToSyncQueue({
    entityType: 'inventory',
    entityId: req.params.id,
    action: 'delete',
    payload: { id: req.params.id },
  });

  res.json({ message: 'Item deleted' });
});

export { router as inventoryRoutes };
