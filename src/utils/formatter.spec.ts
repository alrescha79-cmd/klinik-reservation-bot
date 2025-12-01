import { formatPhoneNumber, parsePatientInput, generateQueueNumber, formatDate, formatTime } from '../utils/formatter';

describe('Formatter Utils', () => {
  describe('formatPhoneNumber', () => {
    it('should convert 08xx to 628xx', () => {
      expect(formatPhoneNumber('081234567890')).toBe('6281234567890');
    });

    it('should keep 62xx format', () => {
      expect(formatPhoneNumber('6281234567890')).toBe('6281234567890');
    });

    it('should add 62 prefix if missing', () => {
      expect(formatPhoneNumber('81234567890')).toBe('6281234567890');
    });

    it('should remove non-digit characters', () => {
      expect(formatPhoneNumber('+62 812-3456-7890')).toBe('6281234567890');
    });
  });

  describe('parsePatientInput', () => {
    it('should parse valid input correctly', () => {
      const input = 'Budi Santoso#1234567890123456#1990-05-15';
      const result = parsePatientInput(input);

      expect(result).toEqual({
        name: 'Budi Santoso',
        nik: '1234567890123456',
        birthDate: '1990-05-15',
      });
    });

    it('should return null for invalid format', () => {
      expect(parsePatientInput('Budi#12345')).toBeNull();
    });

    it('should return null for invalid NIK length', () => {
      expect(parsePatientInput('Budi#123456789012345#1990-05-15')).toBeNull();
    });

    it('should return null for invalid date format', () => {
      expect(parsePatientInput('Budi#1234567890123456#15-05-1990')).toBeNull();
    });

    it('should trim whitespace', () => {
      const input = ' Budi Santoso # 1234567890123456 # 1990-05-15 ';
      const result = parsePatientInput(input);

      expect(result).toEqual({
        name: 'Budi Santoso',
        nik: '1234567890123456',
        birthDate: '1990-05-15',
      });
    });
  });

  describe('generateQueueNumber', () => {
    it('should generate queue number with prefix and padded number', () => {
      expect(generateQueueNumber('A', 1)).toBe('A-001');
      expect(generateQueueNumber('U', 15)).toBe('U-015');
      expect(generateQueueNumber('G', 100)).toBe('G-100');
    });
  });

  describe('formatDate', () => {
    it('should format date to Indonesian locale', () => {
      const date = new Date('2025-01-15');
      const formatted = formatDate(date);

      expect(formatted).toContain('2025');
      expect(formatted).toContain('Januari');
    });
  });

  describe('formatTime', () => {
    it('should format time to HH:mm', () => {
      const date = new Date('2025-01-15T14:30:00');
      const formatted = formatTime(date);

      expect(formatted).toMatch(/\d{2}[.:]\d{2}/);
    });
  });
});
