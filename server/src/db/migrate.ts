import { pool } from './pool';
import { migrate } from './schema';

async function runMigration() {
  console.log('Running database migration...');
  try {
    await migrate();
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
