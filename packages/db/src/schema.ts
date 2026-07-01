export const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    craft TEXT NOT NULL DEFAULT 'other',
    lat REAL NOT NULL DEFAULT 0,
    lng REAL NOT NULL DEFAULT 0,
    district TEXT NOT NULL DEFAULT '',
    state TEXT NOT NULL DEFAULT '',
    coop_id TEXT,
    kyc_verified INTEGER NOT NULL DEFAULT 0,
    aadhar_hash TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    ledger_proof TEXT,
    FOREIGN KEY (coop_id) REFERENCES coops(id)
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    artisan_id TEXT NOT NULL,
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'kg',
    reorder_level REAL NOT NULL DEFAULT 0,
    price REAL NOT NULL DEFAULT 0,
    last_updated TEXT NOT NULL DEFAULT (datetime('now')),
    synced_to_blockchain INTEGER NOT NULL DEFAULT 0,
    sync_status TEXT NOT NULL DEFAULT 'pending',
    FOREIGN KEY (artisan_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    from_artisan_id TEXT NOT NULL,
    to_artisan_id TEXT,
    inventory_id TEXT NOT NULL,
    quantity REAL NOT NULL,
    amount REAL,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    voice_command TEXT,
    blockchain_hash TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    FOREIGN KEY (from_artisan_id) REFERENCES users(id),
    FOREIGN KEY (to_artisan_id) REFERENCES users(id),
    FOREIGN KEY (inventory_id) REFERENCES inventory(id)
  );

  CREATE TABLE IF NOT EXISTS coops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    rules TEXT NOT NULL DEFAULT '{"revenueShare":"proportional"}',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    leader_did TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS coop_members (
    coop_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    joined_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (coop_id, user_id),
    FOREIGN KEY (coop_id) REFERENCES coops(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS marketplace_listings (
    id TEXT PRIMARY KEY,
    artisan_id TEXT NOT NULL,
    inventory_id TEXT NOT NULL,
    quantity REAL NOT NULL,
    price REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    FOREIGN KEY (artisan_id) REFERENCES users(id),
    FOREIGN KEY (inventory_id) REFERENCES inventory(id)
  );

  CREATE TABLE IF NOT EXISTS micro_loans (
    id TEXT PRIMARY KEY,
    borrower_id TEXT NOT NULL,
    lender_id TEXT NOT NULL,
    principal REAL NOT NULL,
    interest_rate REAL NOT NULL,
    term INTEGER NOT NULL,
    collateral TEXT NOT NULL DEFAULT 'inventory',
    status TEXT NOT NULL DEFAULT 'pending',
    blockchain_proof TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (borrower_id) REFERENCES users(id),
    FOREIGN KEY (lender_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    payload TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    retry_count INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_inventory_artisan ON inventory(artisan_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_from ON transactions(from_artisan_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_inventory ON transactions(inventory_id);
  CREATE INDEX IF NOT EXISTS idx_listings_artisan ON marketplace_listings(artisan_id);
  CREATE INDEX IF NOT EXISTS idx_listings_status ON marketplace_listings(status);
  CREATE INDEX IF NOT EXISTS idx_sync_queue_timestamp ON sync_queue(timestamp);
  CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
`;
