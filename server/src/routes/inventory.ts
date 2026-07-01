import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { query, queryOne } from '../db/pool';
import { createInventorySchema, updateInventorySchema } from '../validators';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const items = await query(
      'SELECT * FROM inventory WHERE artisan_id = $1 ORDER BY last_updated DESC',
      [req.userId]
    );

    const valueResult = await queryOne<{ total: number }>(
      'SELECT COALESCE(SUM(quantity * price), 0) as total FROM inventory WHERE artisan_id = $1',
      [req.userId]
    );

    const lowStockResult = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM inventory WHERE artisan_id = $1 AND quantity <= reorder_level',
      [req.userId]
    );

    res.json({
      items,
      totalValue: valueResult?.total || 0,
      lowStockCount: lowStockResult?.count || 0,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const item = await queryOne(
      'SELECT * FROM inventory WHERE id = $1 AND artisan_id = $2',
      [req.params.id, req.userId]
    );

    if (!item) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createInventorySchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
      return;
    }

    const { name, sku, quantity, unit, reorderLevel, price } = parsed.data;

    const item = await queryOne(
      `INSERT INTO inventory (artisan_id, name, sku, quantity, unit, reorder_level, price, sync_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
      [req.userId, name, sku, quantity, unit, reorderLevel, price]
    );

    res.status(201).json(item);
  } catch (err) {
    if ((err as any).code === '23505') {
      res.status(409).json({ error: 'SKU already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create item' });
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = updateInventorySchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
      return;
    }

    const existing = await queryOne(
      'SELECT * FROM inventory WHERE id = $1 AND artisan_id = $2',
      [req.params.id, req.userId]
    );

    if (!existing) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    const fields = parsed.data;
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updates.push(`${dbKey} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    updates.push(`last_updated = NOW()`);
    updates.push(`sync_status = 'pending'`);

    values.push(req.params.id, req.userId);

    const item = await queryOne(
      `UPDATE inventory SET ${updates.join(', ')}
       WHERE id = $${paramIndex} AND artisan_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'DELETE FROM inventory WHERE id = $1 AND artisan_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );

    if (result.length === 0) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    res.json({ message: 'Item deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

export { router as inventoryRoutes };
