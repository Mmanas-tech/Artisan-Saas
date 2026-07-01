import { pool } from './pool';

const SEED_USERS = [
  { name: 'Lakshmi Devi', phone: '+919876543210', craft: 'pottery', lat: 13.0827, lng: 80.2707, district: 'Chennai', state: 'Tamil Nadu' },
  { name: 'Ravi Kumar', phone: '+919876543211', craft: 'woodwork', lat: 12.9716, lng: 77.5946, district: 'Bengaluru Urban', state: 'Karnataka' },
  { name: 'Priya Sharma', phone: '+919876543212', craft: 'textiles', lat: 26.9124, lng: 75.7873, district: 'Jaipur', state: 'Rajasthan' },
  { name: 'Arjun Singh', phone: '+919876543213', craft: 'metalwork', lat: 28.6139, lng: 77.209, district: 'Central Delhi', state: 'Delhi' },
  { name: 'Meena Bai', phone: '+919876543214', craft: 'basketry', lat: 23.0225, lng: 72.5714, district: 'Ahmedabad', state: 'Gujarat' },
];

const SEED_INVENTORY: Record<string, Array<{ name: string; sku: string; quantity: number; unit: string; reorderLevel: number; price: number }>> = {
  '+919876543210': [
    { name: 'Red Clay', sku: 'POT-CLAY-RED', quantity: 50, unit: 'kg', reorderLevel: 10, price: 25 },
    { name: 'Glaze Medium', sku: 'POT-GLZ-MED', quantity: 15, unit: 'liters', reorderLevel: 5, price: 120 },
    { name: 'Fired Pots', sku: 'POT-FIN-POT', quantity: 30, unit: 'pieces', reorderLevel: 10, price: 350 },
  ],
  '+919876543211': [
    { name: 'Teak Wood', sku: 'WD-TEAK-01', quantity: 25, unit: 'kg', reorderLevel: 5, price: 80 },
    { name: 'Sanding Paper', sku: 'WD-SND-01', quantity: 100, unit: 'pieces', reorderLevel: 20, price: 5 },
    { name: 'Wood Varnish', sku: 'WD-VRN-01', quantity: 10, unit: 'liters', reorderLevel: 3, price: 200 },
  ],
  '+919876543212': [
    { name: 'Raw Cotton', sku: 'TX-COT-RAW', quantity: 40, unit: 'kg', reorderLevel: 10, price: 60 },
    { name: 'Natural Dye', sku: 'TX-DYE-NAT', quantity: 20, unit: 'liters', reorderLevel: 5, price: 150 },
    { name: 'Silk Thread', sku: 'TX-THR-SLK', quantity: 5000, unit: 'meters', reorderLevel: 1000, price: 2 },
  ],
  '+919876543213': [
    { name: 'Copper Sheet', sku: 'MT-COP-SHT', quantity: 15, unit: 'kg', reorderLevel: 5, price: 300 },
    { name: 'Tin Ingot', sku: 'MT-TIN-ING', quantity: 10, unit: 'kg', reorderLevel: 3, price: 250 },
    { name: 'Brass Wire', sku: 'MT-BRS-WRE', quantity: 200, unit: 'meters', reorderLevel: 50, price: 8 },
  ],
  '+919876543214': [
    { name: 'Bamboo Strips', sku: 'BS-BAM-STR', quantity: 100, unit: 'pieces', reorderLevel: 30, price: 10 },
    { name: 'Cotton Rope', sku: 'BS-RPE-COT', quantity: 500, unit: 'meters', reorderLevel: 100, price: 3 },
  ],
};

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Seeding users...');
    for (const user of SEED_USERS) {
      const existing = await client.query('SELECT id FROM users WHERE phone = $1', [user.phone]);
      if (existing.rows.length > 0) continue;

      const result = await client.query(
        `INSERT INTO users (name, phone, craft, lat, lng, district, state)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [user.name, user.phone, user.craft, user.lat, user.lng, user.district, user.state]
      );
      const userId = result.rows[0].id;

      const inventory = SEED_INVENTORY[user.phone] || [];
      for (const item of inventory) {
        await client.query(
          `INSERT INTO inventory (artisan_id, name, sku, quantity, unit, reorder_level, price, sync_status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'synced')`,
          [userId, item.name, item.sku, item.quantity, item.unit, item.reorderLevel, item.price]
        );
      }
      console.log(`  Seeded ${user.name} (${user.craft}) with ${inventory.length} items`);
    }

    await client.query('COMMIT');
    console.log('Seed completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
