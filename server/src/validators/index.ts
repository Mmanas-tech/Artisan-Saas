import { z } from 'zod';

export const createInventorySchema = z.object({
  name: z.string().min(1).max(255),
  sku: z.string().min(1).max(100),
  quantity: z.number().min(0),
  unit: z.enum(['kg', 'pieces', 'liters', 'meters', 'grams']),
  reorderLevel: z.number().min(0).optional().default(0),
  price: z.number().min(0).optional().default(0),
});

export const updateInventorySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  quantity: z.number().min(0).optional(),
  unit: z.enum(['kg', 'pieces', 'liters', 'meters', 'grams']).optional(),
  reorderLevel: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
});

export const requestOtpSchema = z.object({
  phone: z.string().min(10).max(15),
});

export const verifyOtpSchema = z.object({
  otpId: z.string().uuid(),
  otp: z.string().length(6),
});
