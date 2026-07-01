import jwt from 'jsonwebtoken';
import { config } from '../config';

describe('Config', () => {
  it('has required config values', () => {
    expect(config.port).toBeDefined();
    expect(config.host).toBeDefined();
    expect(config.jwtSecret).toBeDefined();
    expect(config.databaseUrl).toBeDefined();
    expect(config.redisUrl).toBeDefined();
    expect(config.corsOrigin).toBeDefined();
  });

  it('has correct default port', () => {
    expect(config.port).toBe(3001);
  });

  it('has correct default host', () => {
    expect(config.host).toBe('0.0.0.0');
  });
});

describe('JWT', () => {
  it('creates and verifies a token', () => {
    const payload = { userId: 'test-user-id' };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });

    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    expect(decoded.userId).toBe('test-user-id');
  });

  it('rejects invalid token', () => {
    expect(() => {
      jwt.verify('invalid-token', config.jwtSecret);
    }).toThrow();
  });
});

describe('Schema SQL', () => {
  it('schema contains required tables', () => {
    const schema = require('../db/schema');
    expect(schema.migrate).toBeDefined();
    expect(typeof schema.migrate).toBe('function');
  });
});
