import { getDatabase } from '../index';
import type { User, CraftType } from '@artisan/shared';
import { v4 as uuid } from 'uuid';

export function getUserByPhone(phone: string): User | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone) as any;
  return row ? mapRowToUser(row) : null;
}

export function getUserById(id: string): User | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  return row ? mapRowToUser(row) : null;
}

export function createUser(data: {
  name: string;
  phone: string;
  craft: CraftType;
  lat: number;
  lng: number;
  district: string;
  state: string;
}): User {
  const db = getDatabase();
  const id = `did:artisan:${uuid()}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, name, phone, craft, lat, lng, district, state, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.name, data.phone, data.craft, data.lat, data.lng, data.district, data.state, now);

  return getUserById(id)!;
}

export function updateUser(id: string, data: Partial<{
  name: string;
  craft: CraftType;
  lat: number;
  lng: number;
  district: string;
  state: string;
  coopId: string;
}>): User | null {
  const db = getDatabase();
  const existing = getUserById(id);
  if (!existing) return null;

  const updates: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name); }
  if (data.craft !== undefined) { updates.push('craft = ?'); values.push(data.craft); }
  if (data.lat !== undefined) { updates.push('lat = ?'); values.push(data.lat); }
  if (data.lng !== undefined) { updates.push('lng = ?'); values.push(data.lng); }
  if (data.district !== undefined) { updates.push('district = ?'); values.push(data.district); }
  if (data.state !== undefined) { updates.push('state = ?'); values.push(data.state); }
  if (data.coopId !== undefined) { updates.push('coop_id = ?'); values.push(data.coopId); }

  if (updates.length === 0) return existing;

  values.push(id);
  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  return getUserById(id);
}

function mapRowToUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    craft: row.craft as CraftType,
    location: {
      lat: row.lat,
      lng: row.lng,
      district: row.district,
      state: row.state,
    },
    coopId: row.coop_id || undefined,
    kyc: {
      verified: row.kyc_verified === 1,
      aadharHash: row.aadhar_hash || undefined,
    },
    createdAt: row.created_at,
    ledgerProof: row.ledger_proof || undefined,
  };
}
