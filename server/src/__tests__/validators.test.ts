import { createInventorySchema, updateInventorySchema } from '../validators';

describe('Validators', () => {
  describe('createInventorySchema', () => {
    it('accepts valid inventory data', () => {
      const result = createInventorySchema.safeParse({
        name: 'Clay - Red',
        sku: 'CLAY-RED-001',
        quantity: 50,
        unit: 'kg',
        reorderLevel: 20,
        price: 250,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Clay - Red');
        expect(result.data.quantity).toBe(50);
        expect(result.data.unit).toBe('kg');
      }
    });

    it('rejects missing name', () => {
      const result = createInventorySchema.safeParse({
        sku: 'TEST-001',
        quantity: 10,
        unit: 'kg',
      });

      expect(result.success).toBe(false);
    });

    it('rejects invalid unit', () => {
      const result = createInventorySchema.safeParse({
        name: 'Test',
        sku: 'TEST-001',
        quantity: 10,
        unit: 'invalid',
      });

      expect(result.success).toBe(false);
    });

    it('rejects negative quantity', () => {
      const result = createInventorySchema.safeParse({
        name: 'Test',
        sku: 'TEST-001',
        quantity: -5,
        unit: 'kg',
      });

      expect(result.success).toBe(false);
    });

    it('uses defaults for optional fields', () => {
      const result = createInventorySchema.safeParse({
        name: 'Test',
        sku: 'TEST-001',
        quantity: 10,
        unit: 'pieces',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reorderLevel).toBe(0);
        expect(result.data.price).toBe(0);
      }
    });
  });

  describe('updateInventorySchema', () => {
    it('accepts partial updates', () => {
      const result = updateInventorySchema.safeParse({ quantity: 25 });
      expect(result.success).toBe(true);
    });

    it('accepts multiple fields', () => {
      const result = updateInventorySchema.safeParse({
        name: 'Updated Name',
        price: 300,
      });
      expect(result.success).toBe(true);
    });

    it('accepts empty object (no changes)', () => {
      const result = updateInventorySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('rejects invalid unit in update', () => {
      const result = updateInventorySchema.safeParse({ unit: 'invalid' });
      expect(result.success).toBe(false);
    });
  });
});
