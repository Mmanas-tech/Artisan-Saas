import {
  generateDID,
  signPayload,
  recordTransaction,
  getLedgerByDID,
  getLedgerEntry,
  verifySignature,
  configureCeramic,
  getCeramicEndpoint,
  clearLedger,
} from '../services/ceramic';

describe('CeramicService', () => {
  beforeEach(() => {
    clearLedger();
  });
  describe('generateDID', () => {
    it('generates a valid DID key pair', () => {
      const keyPair = generateDID();

      expect(keyPair.did).toMatch(/^did:key:z/);
      expect(keyPair.publicKeyBase58).toBeDefined();
      expect(keyPair.privateKeyBase58).toBeDefined();
      expect(keyPair.createdAt).toBeDefined();
    });

    it('generates unique DIDs', () => {
      const pair1 = generateDID();
      const pair2 = generateDID();

      expect(pair1.did).not.toBe(pair2.did);
      expect(pair1.privateKeyBase58).not.toBe(pair2.privateKeyBase58);
    });
  });

  describe('signPayload', () => {
    it('produces consistent hashes for same payload and key', () => {
      const keyPair = generateDID();
      const payload = { action: 'create', quantity: 10, name: 'Clay' };

      const hash1 = signPayload(payload, keyPair.publicKeyBase58);
      const hash2 = signPayload(payload, keyPair.publicKeyBase58);

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });

    it('produces different hashes for different payloads', () => {
      const keyPair = generateDID();

      const hash1 = signPayload({ quantity: 10 }, keyPair.publicKeyBase58);
      const hash2 = signPayload({ quantity: 20 }, keyPair.publicKeyBase58);

      expect(hash1).not.toBe(hash2);
    });

    it('produces different hashes for different keys', () => {
      const keyPair1 = generateDID();
      const keyPair2 = generateDID();
      const payload = { quantity: 10 };

      const hash1 = signPayload(payload, keyPair1.publicKeyBase58);
      const hash2 = signPayload(payload, keyPair2.publicKeyBase58);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('recordTransaction', () => {
    it('records a transaction and returns signed result', async () => {
      const keyPair = generateDID();
      const result = await recordTransaction(
        keyPair.did,
        'tx-test-001',
        'create',
        { name: 'Clay', quantity: 10 },
        keyPair.publicKeyBase58
      );

      expect(result.transactionId).toBe('tx-test-001');
      expect(result.action).toBe('create');
      expect(result.signatureHash).toMatch(/^[a-f0-9]{64}$/);
      expect(result.timestamp).toBeDefined();
    });

    it('can retrieve recorded entry by transaction ID', async () => {
      const keyPair = generateDID();
      await recordTransaction(
        keyPair.did,
        'tx-test-002',
        'sale',
        { amount: 500 },
        keyPair.publicKeyBase58
      );

      const entry = await getLedgerEntry('tx-test-002');
      expect(entry).not.toBeNull();
      expect(entry!.transactionId).toBe('tx-test-002');
      expect(entry!.action).toBe('sale');
    });
  });

  describe('getLedgerByDID', () => {
    it('returns entries for a specific DID', async () => {
      const keyPair = generateDID();
      await recordTransaction(
        keyPair.did,
        'tx-did-001',
        'create',
        { name: 'Wood' },
        keyPair.publicKeyBase58
      );
      await recordTransaction(
        keyPair.did,
        'tx-did-002',
        'update',
        { quantity: 5 },
        keyPair.publicKeyBase58
      );

      const entries = await getLedgerByDID(keyPair.did);
      expect(entries.length).toBeGreaterThanOrEqual(2);
      expect(entries.every((e) => e.did === keyPair.did)).toBe(true);
    });

    it('returns empty array for unknown DID', async () => {
      const entries = await getLedgerByDID('did:key:znonexistent');
      expect(entries).toEqual([]);
    });
  });

  describe('verifySignature', () => {
    it('returns valid true for a recorded transaction', async () => {
      const keyPair = generateDID();
      const payload = { name: 'Clay', quantity: 10 };
      await recordTransaction(
        keyPair.did,
        'tx-verify-001',
        'create',
        payload,
        keyPair.publicKeyBase58
      );

      const result = await verifySignature('tx-verify-001', keyPair.publicKeyBase58);
      expect(result.valid).toBe(true);
      expect(result.entry).not.toBeNull();
    });

    it('returns valid false for unknown transaction', async () => {
      const keyPair = generateDID();
      const result = await verifySignature('tx-unknown', keyPair.publicKeyBase58);
      expect(result.valid).toBe(false);
      expect(result.entry).toBeNull();
    });
  });

  describe('configureCeramic', () => {
    it('stores and retrieves ceramic endpoint', () => {
      configureCeramic('http://localhost:7007');
      expect(getCeramicEndpoint()).toBe('http://localhost:7007');
    });
  });
});
