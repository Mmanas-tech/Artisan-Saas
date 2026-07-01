import { truncateHash, formatTimestamp } from '../ceramic';

describe('ceramic service utilities', () => {
  describe('truncateHash', () => {
    it('truncates long hashes', () => {
      const hash = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
      const result = truncateHash(hash);
      expect(result).toBe('a1b2c3d4...m3n4o5p6');
    });

    it('uses custom char count', () => {
      const hash = 'a1b2c3d4e5f6g7h8';
      const result = truncateHash(hash, 4);
      expect(result).toBe('a1b2...g7h8');
    });

    it('returns original if too short', () => {
      const hash = 'abc123';
      const result = truncateHash(hash, 8);
      expect(result).toBe('abc123');
    });

    it('handles empty string', () => {
      expect(truncateHash('')).toBe('');
    });
  });

  describe('formatTimestamp', () => {
    it('formats ISO timestamp to readable date', () => {
      const ts = '2026-06-15T10:30:00.000Z';
      const result = formatTimestamp(ts);
      expect(result).toContain('2026');
      expect(result).toContain('Jun');
    });

    it('handles current timestamp', () => {
      const now = new Date().toISOString();
      const result = formatTimestamp(now);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });
});
