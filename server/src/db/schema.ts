import { pool } from './pool';

const SCHEMA = `
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";

  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    craft VARCHAR(50) NOT NULL DEFAULT 'other',
    lat DOUBLE PRECISION NOT NULL DEFAULT 0,
    lng DOUBLE PRECISION NOT NULL DEFAULT 0,
    district VARCHAR(100) NOT NULL DEFAULT '',
    state VARCHAR(100) NOT NULL DEFAULT '',
    coop_id UUID,
    kyc_verified BOOLEAN NOT NULL DEFAULT false,
    aadhar_hash VARCHAR(255),
    did VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ledger_proof VARCHAR(255)
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    quantity DOUBLE PRECISION NOT NULL DEFAULT 0,
    unit VARCHAR(20) NOT NULL DEFAULT 'kg',
    reorder_level DOUBLE PRECISION NOT NULL DEFAULT 0,
    price DOUBLE PRECISION NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    synced_to_blockchain BOOLEAN NOT NULL DEFAULT false,
    sync_status VARCHAR(20) NOT NULL DEFAULT 'pending'
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL,
    from_artisan_id UUID NOT NULL REFERENCES users(id),
    to_artisan_id UUID REFERENCES users(id),
    inventory_id UUID NOT NULL REFERENCES inventory(id),
    quantity DOUBLE PRECISION NOT NULL,
    amount DOUBLE PRECISION,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    voice_command TEXT,
    blockchain_hash VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
  );

  CREATE INDEX IF NOT EXISTS idx_inventory_artisan ON inventory(artisan_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_from ON transactions(from_artisan_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_inventory ON transactions(inventory_id);
  CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
`;

export async function migrate(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(SCHEMA);
    await client.query('COMMIT');
    console.log('Migrations complete.');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
