import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { queryOne, query } from '../db/pool';
import {
  generateDID,
  recordTransaction,
  getLedgerByDID,
  getLedgerEntry,
  verifySignature,
  configureCeramic,
} from '../services/ceramic';

const router = Router();

router.use(authenticate);

const recordTransactionSchema = z.object({
  transactionId: z.string().uuid(),
  action: z.enum(['create', 'update', 'delete', 'sale', 'purchase', 'transfer']),
  payload: z.record(z.unknown()),
});

const ceramicConfigSchema = z.object({
  endpoint: z.string().url(),
});

router.post('/config', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = ceramicConfigSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
      return;
    }

    configureCeramic(parsed.data.endpoint);
    res.json({ status: 'configured', endpoint: parsed.data.endpoint });
  } catch (err) {
    res.status(500).json({ error: 'Failed to configure Ceramic' });
  }
});

router.post('/did', async (req: AuthRequest, res: Response) => {
  try {
    const user = await queryOne<{ id: string; did: string | null }>(
      'SELECT id, did FROM users WHERE id = $1',
      [req.userId]
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.did) {
      res.json({ did: user.did, existing: true });
      return;
    }

    const keyPair = generateDID();

    await query(
      'UPDATE users SET did = $1, ledger_proof = $2 WHERE id = $3',
      [keyPair.did, keyPair.publicKeyBase58, req.userId]
    );

    res.status(201).json({
      did: keyPair.did,
      publicKeyBase58: keyPair.publicKeyBase58,
      createdAt: keyPair.createdAt,
      existing: false,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate DID' });
  }
});

router.get('/did', async (req: AuthRequest, res: Response) => {
  try {
    const user = await queryOne<{ id: string; did: string | null; ledger_proof: string | null }>(
      'SELECT id, did, ledger_proof FROM users WHERE id = $1',
      [req.userId]
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      did: user.did || null,
      publicKeyBase58: user.ledger_proof || null,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch DID info' });
  }
});

router.post('/record', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = recordTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
      return;
    }

    const user = await queryOne<{ id: string; did: string | null; ledger_proof: string | null }>(
      'SELECT id, did, ledger_proof FROM users WHERE id = $1',
      [req.userId]
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!user.did || !user.ledger_proof) {
      res.status(400).json({ error: 'DID not generated. Call POST /ledger/did first.' });
      return;
    }

    const { transactionId, action, payload } = parsed.data;

    const tx = await queryOne<{ id: string }>(
      'SELECT id FROM transactions WHERE id = $1 AND from_artisan_id = $2',
      [transactionId, req.userId]
    );

    if (!tx) {
      res.status(404).json({ error: 'Transaction not found or not owned by user' });
      return;
    }

    const signed = await recordTransaction(
      user.did,
      transactionId,
      action,
      payload,
      user.ledger_proof
    );

    await query(
      'UPDATE transactions SET blockchain_hash = $1, status = $2 WHERE id = $3',
      [signed.signatureHash, 'confirmed', transactionId]
    );

    res.status(201).json({
      transactionId: signed.transactionId,
      action: signed.action,
      signatureHash: signed.signatureHash,
      ceramicStreamId: signed.ceramicStreamId || null,
      timestamp: signed.timestamp,
      verified: true,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record transaction' });
  }
});

router.get('/history', async (req: AuthRequest, res: Response) => {
  try {
    const user = await queryOne<{ id: string; did: string | null }>(
      'SELECT id, did FROM users WHERE id = $1',
      [req.userId]
    );

    if (!user?.did) {
      res.json({ entries: [], did: null });
      return;
    }

    const entries = await getLedgerByDID(user.did);

    const dbTxs = await query<{
      id: string;
      type: string;
      inventory_id: string;
      quantity: number;
      amount: number | null;
      timestamp: string;
      blockchain_hash: string | null;
      status: string;
    }>(
      `SELECT id, type, inventory_id, quantity, amount, timestamp, blockchain_hash, status
       FROM transactions WHERE from_artisan_id = $1 ORDER BY timestamp DESC`,
      [req.userId]
    );

    const merged = dbTxs.map((tx) => {
      const ledgerEntry = entries.find((e) => e.transactionId === tx.id);
      return {
        transactionId: tx.id,
        action: tx.type,
        inventoryId: tx.inventory_id,
        quantity: tx.quantity,
        amount: tx.amount,
        signatureHash: tx.blockchain_hash || ledgerEntry?.signatureHash || null,
        ceramicStreamId: ledgerEntry?.ceramicStreamId || null,
        verified: !!ledgerEntry,
        timestamp: tx.timestamp,
        status: tx.status,
      };
    });

    res.json({ entries: merged, did: user.did });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ledger history' });
  }
});

router.get('/verify/:transactionId', async (req: AuthRequest, res: Response) => {
  try {
    const user = await queryOne<{ id: string; did: string | null; ledger_proof: string | null }>(
      'SELECT id, did, ledger_proof FROM users WHERE id = $1',
      [req.userId]
    );

    if (!user?.did || !user.ledger_proof) {
      res.status(400).json({ error: 'DID not configured' });
      return;
    }

    const txId = String(req.params.transactionId);
    const result = await verifySignature(txId, user.ledger_proof);

    res.json({
      transactionId: txId,
      valid: result.valid,
      entry: result.entry
        ? {
            signatureHash: result.entry.signatureHash,
            ceramicStreamId: result.entry.ceramicStreamId || null,
            timestamp: result.entry.timestamp,
          }
        : null,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify transaction' });
  }
});

router.get('/proof/:transactionId', async (req: AuthRequest, res: Response) => {
  try {
    const txId = String(req.params.transactionId);
    const entry = await getLedgerEntry(txId);

    if (!entry) {
      const dbTx = await queryOne<{
        id: string;
        blockchain_hash: string | null;
        status: string;
        timestamp: string;
      }>(
        'SELECT id, blockchain_hash, status, timestamp FROM transactions WHERE id = $1',
        [txId]
      );

      if (!dbTx) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }

      res.json({
        transactionId: dbTx.id,
        signatureHash: dbTx.blockchain_hash || null,
        ceramicStreamId: null,
        verified: false,
        timestamp: dbTx.timestamp,
        status: dbTx.status,
      });
      return;
    }

    res.json({
      transactionId: entry.transactionId,
      signatureHash: entry.signatureHash,
      ceramicStreamId: entry.ceramicStreamId || null,
      verified: true,
      timestamp: entry.timestamp,
      status: 'confirmed',
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch proof' });
  }
});

export { router as ledgerRoutes };
