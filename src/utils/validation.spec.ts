import { patientSchema, doctorSchema, reservationSchema } from '../utils/validation';

describe('Validation Schemas', () => {
  describe('patientSchema', () => {
    it('should validate correct patient data', () => {
      const validPatient = {
        name: 'Budi Santoso',
        nik: '1234567890123456',
        phone: '081234567890',
        birthDate: '1990-05-15',
      };

      const result = patientSchema.safeParse(validPatient);
      expect(result.success).toBe(true);
    });

    it('should reject short name', () => {
      const invalidPatient = {
        name: 'B',
        nik: '1234567890123456',
        phone: '081234567890',
        birthDate: '1990-05-15',
      };

      const result = patientSchema.safeParse(invalidPatient);
      expect(result.success).toBe(false);
    });

    it('should reject invalid NIK length', () => {
      const invalidPatient = {
        name: 'Budi Santoso',
        nik: '12345678901234', // 14 digits
        phone: '081234567890',
        birthDate: '1990-05-15',
      };

      const result = patientSchema.safeParse(invalidPatient);
      expect(result.success).toBe(false);
    });

    it('should reject non-numeric NIK', () => {
      const invalidPatient = {
        name: 'Budi Santoso',
        nik: '123456789012345a',
        phone: '081234567890',
        birthDate: '1990-05-15',
      };

      const result = patientSchema.safeParse(invalidPatient);
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format', () => {
      const invalidPatient = {
        name: 'Budi Santoso',
        nik: '1234567890123456',
        phone: '081234567890',
        birthDate: '15-05-1990', // Wrong format
      };

      const result = patientSchema.safeParse(invalidPatient);
      expect(result.success).toBe(false);
    });
  });

  describe('doctorSchema', () => {
    it('should validate correct doctor data', () => {
      const validDoctor = {
        name: 'dr. Ani Wijaya',
        specialty: 'Umum',
        schedule: {
          senin: ['08:00', '12:00'],
          selasa: ['08:00', '12:00'],
        },
      };

      const result = doctorSchema.safeParse(validDoctor);
      expect(result.success).toBe(true);
    });

    it('should reject short specialty', () => {
      const invalidDoctor = {
        name: 'dr. Ani Wijaya',
        specialty: 'U',
        schedule: { senin: ['08:00'] },
      };

      const result = doctorSchema.safeParse(invalidDoctor);
      expect(result.success).toBe(false);
    });
  });

  describe('reservationSchema', () => {
    it('should validate correct reservation data', () => {
      const validReservation = {
        patientId: 1,
        doctorId: 1,
        reservationDate: '2025-01-15',
        reservationTime: '10:00',
      };

      const result = reservationSchema.safeParse(validReservation);
      expect(result.success).toBe(true);
    });

    it('should reject invalid time format', () => {
      const invalidReservation = {
        patientId: 1,
        doctorId: 1,
        reservationDate: '2025-01-15',
        reservationTime: '10:00:00', // Wrong format
      };

      const result = reservationSchema.safeParse(invalidReservation);
      expect(result.success).toBe(false);
    });

    it('should reject negative IDs', () => {
      const invalidReservation = {
        patientId: -1,
        doctorId: 1,
        reservationDate: '2025-01-15',
        reservationTime: '10:00',
      };

      const result = reservationSchema.safeParse(invalidReservation);
      expect(result.success).toBe(false);
    });
  });
});
