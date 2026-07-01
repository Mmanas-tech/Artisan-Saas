import { v4 as uuid } from 'uuid';
import { getDatabase, initializeDatabase } from './index';

const db = initializeDatabase();

const users = [
  { id: uuid(), name: 'Ravi Kumar', phone: '+919876543210', craft: 'ceramic', lat: 17.385, lng: 78.4867, district: 'Hyderabad', state: 'Telangana' },
  { id: uuid(), name: 'Priya Devi', phone: '+919876543211', craft: 'textile', lat: 13.0827, lng: 80.2707, district: 'Chennai', state: 'Tamil Nadu' },
  { id: uuid(), name: 'Asha Bai', phone: '+919876543212', craft: 'ceramic', lat: 12.9716, lng: 77.5946, district: 'Bangalore', state: 'Karnataka' },
  { id: uuid(), name: 'Jaya Shankar', phone: '+919876543213', craft: 'wood', lat: 16.5062, lng: 80.648, district: 'Guntur', state: 'Andhra Pradesh' },
  { id: uuid(), name: 'Neha Sharma', phone: '+919876543214', craft: 'metal', lat: 26.9124, lng: 75.7873, district: 'Jaipur', state: 'Rajasthan' },
];

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (id, name, phone, craft, lat, lng, district, state)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertInventory = db.prepare(`
  INSERT OR IGNORE INTO inventory (id, artisan_id, name, sku, quantity, unit, reorder_level, price)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const seedTransaction = db.transaction(() => {
  for (const user of users) {
    insertUser.run(user.id, user.name, user.phone, user.craft, user.lat, user.lng, user.district, user.state);

    const items = getItemsForCraft(user.craft);
    for (const item of items) {
      insertInventory.run(uuid(), user.id, item.name, item.sku, item.quantity, item.unit, item.reorderLevel, item.price);
    }
  }
});

function getItemsForCraft(craft: string) {
  const items: Record<string, Array<{ name: string; sku: string; quantity: number; unit: string; reorderLevel: number; price: number }>> = {
    ceramic: [
      { name: 'Clay - Red', sku: 'CLAY-RED-001', quantity: 50, unit: 'kg', reorderLevel: 20, price: 250 },
      { name: 'Clay - White', sku: 'CLAY-WHT-001', quantity: 30, unit: 'kg', reorderLevel: 15, price: 300 },
      { name: 'Glaze - Blue', sku: 'GLAZ-BLU-001', quantity: 12, unit: 'liters', reorderLevel: 5, price: 500 },
      { name: 'Pottery - Small', sku: 'POT-SML-001', quantity: 25, unit: 'pieces', reorderLevel: 10, price: 150 },
    ],
    textile: [
      { name: 'Cotton Yarn', sku: 'YRN-COT-001', quantity: 100, unit: 'kg', reorderLevel: 30, price: 180 },
      { name: 'Indigo Dye', sku: 'DYE-IND-001', quantity: 8, unit: 'liters', reorderLevel: 3, price: 800 },
      { name: 'Silk Thread', sku: 'THR-SLK-001', quantity: 20, unit: 'kg', reorderLevel: 10, price: 1200 },
    ],
    wood: [
      { name: 'Teak Wood', sku: 'WD-TEAK-001', quantity: 40, unit: 'kg', reorderLevel: 15, price: 400 },
      { name: 'Sandalwood', sku: 'WD-SNDL-001', quantity: 5, unit: 'kg', reorderLevel: 2, price: 2000 },
      { name: 'Wood Varnish', sku: 'VRN-SHD-001', quantity: 10, unit: 'liters', reorderLevel: 4, price: 350 },
    ],
    metal: [
      { name: 'Brass Sheet', sku: 'MTL-BRS-001', quantity: 25, unit: 'kg', reorderLevel: 10, price: 600 },
      { name: 'Copper Wire', sku: 'MTL-CPR-001', quantity: 15, unit: 'kg', reorderLevel: 5, price: 750 },
      { name: 'Tin Plates', sku: 'MTL-TIN-001', quantity: 30, unit: 'pieces', reorderLevel: 10, price: 100 },
    ],
    other: [
      { name: 'Raw Material A', sku: 'OTH-A-001', quantity: 20, unit: 'kg', reorderLevel: 8, price: 200 },
    ],
  };
  return items[craft] || items.other;
}

console.log('Seeding database...');
seedTransaction();
console.log(`Seeded ${users.length} users with inventory.`);
