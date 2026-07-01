import app from '../app';

describe('App Setup', () => {
  it('is an express application', () => {
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
    expect(typeof app.use).toBe('function');
  });

  it('has health route', async () => {
    const supertest = (await import('supertest')).default;
    const res = await supertest(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  it('returns 404 for unknown routes', async () => {
    const supertest = (await import('supertest')).default;
    const res = await supertest(app).get('/nonexistent');

    expect(res.status).toBe(404);
  });
});
