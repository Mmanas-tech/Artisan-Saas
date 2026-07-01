import type { CraftType, Unit } from '../types';

export const CRAFT_TYPES: { value: CraftType; label: string; labelHi: string }[] = [
  { value: 'ceramic', label: 'Pottery & Ceramics', labelHi: 'मिट्टी के बर्तन' },
  { value: 'textile', label: 'Textiles & Weaving', labelHi: 'कपड़ा और बुनाई' },
  { value: 'wood', label: 'Woodwork', labelHi: 'लकड़ी का काम' },
  { value: 'metal', label: 'Metalwork', labelHi: 'धातु का काम' },
  { value: 'other', label: 'Other', labelHi: 'अन्य' },
];

export const UNITS: { value: Unit; label: string; labelHi: string }[] = [
  { value: 'kg', label: 'Kilograms', labelHi: 'किलोग्राम' },
  { value: 'pieces', label: 'Pieces', labelHi: 'टुकड़े' },
  { value: 'liters', label: 'Liters', labelHi: 'लीटर' },
  { value: 'meters', label: 'Meters', labelHi: 'मीटर' },
  { value: 'grams', label: 'Grams', labelHi: 'ग्राम' },
];

export const SYNC_INTERVALS = {
  ONLINE_CHECK_MS: 5000,
  AUTO_SYNC_MS: 300000, // 5 minutes
  RETRY_BACKOFF_MS: [1000, 2000, 4000, 8000, 16000],
  MAX_RETRIES: 5,
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    REQUEST_OTP: '/auth/request-otp',
    VERIFY_OTP: '/auth/verify-otp',
    REFRESH: '/auth/refresh',
  },
  INVENTORY: {
    BASE: '/inventory',
    BY_ID: (id: string) => `/inventory/${id}`,
  },
  VOICE: {
    TRANSCRIBE: '/voice/transcribe',
  },
  SYNC: {
    BATCH: '/sync/batch',
    STATUS: '/sync/status',
  },
  MARKETPLACE: {
    LISTINGS: '/marketplace/listings',
    BY_ID: (id: string) => `/marketplace/listings/${id}`,
  },
  COOPS: {
    BASE: '/coops',
    BY_ID: (id: string) => `/coops/${id}`,
  },
  LOANS: {
    BASE: '/loans',
    BY_ID: (id: string) => `/loans/${id}`,
    REPAY: (id: string) => `/loans/${id}/repay`,
  },
} as const;
