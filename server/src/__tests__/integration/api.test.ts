import { Pool } from 'pg';
import app from '../app';
import { migrate } from '../db/schema';

let pool: Pool;

beforeAll(async () => {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/artisan_saas_test',
  });
  await migrate();
});

afterAll(async () => {
  await pool?.end();
});

describe('Health Check', () => {
  it('GET /health returns ok', async () => {
    const res = await (await import('supertest')).default(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('Auth Routes', () => {
  it('POST /auth/request-otp returns otpId', async () => {
    const res = await (await import('supertest')).default(app)
      .post('/auth/request-otp')
      .send({ phone: '+919876543210' });

    expect(res.status).toBe(200);
    expect(res.body.otpId).toBeDefined();
    expect(res.body.message).toBe('OTP sent successfully');
  });

  it('POST /auth/request-otp fails without phone', async () => {
    const res = await (await import('supertest')).default(app)
      .post('/auth/request-otp')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Phone number required');
  });
});

describe('Inventory Routes', () => {
  let authToken: string;

  beforeAll(async () => {
    const otpRes = await (await import('supertest')).default(app)
      .post('/auth/request-otp')
      .send({ phone: '+919876543211' });

    const verifyRes = await (await import('supertest')).default(app)
      .post('/auth/verify-otp')
      .send({ otpId: otpRes.body.otpId, otp: '123456' });

    authToken = verifyRes.body.token;
  });

  it('GET /inventory requires auth', async () => {
    const res = await (await import('supertest')).default(app).get('/inventory');
    expect(res.status).toBe(401);
  });

  it('GET /inventory returns items for authenticated user', async () => {
    const res = await (await import('supertest')).default(app)
      .get('/inventory')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(typeof res.body.totalValue).toBe('number');
    expect(typeof res.body.lowStockCount).toBe('number');
  });

  it('POST /inventory creates an item', async () => {
    const res = await (await import('supertest')).default(app)
      .post('/inventory')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Clay - Red',
        sku: `TEST-CLAY-${Date.now()}`,
        quantity: 50,
        unit: 'kg',
        reorderLevel: 20,
        price: 250,
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Clay - Red');
    expect(res.body.quantity).toBe(50);
    expect(res.body.sync_status).toBe('pending');
  });

  it('POST /inventory validates required fields', async () => {
    const res = await (await import('supertest')).default(app)
      .post('/inventory')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('PATCH /inventory/:id updates an item', async () => {
    const createRes = await (await import('supertest')).default(app)
      .post('/inventory')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'To Update',
        sku: `UPDATE-${Date.now()}`,
        quantity: 10,
        unit: 'pieces',
      });

    const updateRes = await (await import('supertest')).default(app)
      .patch(`/inventory/${createRes.body.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ quantity: 25 });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.quantity).toBe(25);
    expect(updateRes.body.sync_status).toBe('pending');
  });

  it('DELETE /inventory/:id removes an item', async () => {
    const createRes = await (await import('supertest')).default(app)
      .post('/inventory')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'To Delete',
        sku: `DELETE-${Date.now()}`,
        quantity: 5,
        unit: 'kg',
      });

    const deleteRes = await (await import('supertest')).default(app)
      .delete(`/inventory/${createRes.body.id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toBe('Item deleted');
  });
});
