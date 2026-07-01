import Database from 'better-sqlite3';
import path from 'path';
import { SCHEMA_SQL } from './schema';

const DB_PATH = process.env.DATABASE_URL?.replace('file:', '') || path.join(process.cwd(), 'packages/db/dev.db');

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('busy_timeout = 5000');
  }
  return db;
}

export function initializeDatabase(): Database.Database {
  const database = getDatabase();
  database.exec(SCHEMA_SQL);
  return database;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
