import { z } from 'zod';

export const patientSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  nik: z.string().length(16, 'NIK harus 16 digit').regex(/^\d+$/, 'NIK harus berupa angka'),
  phone: z.string().min(10, 'Nomor telepon tidak valid'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  address: z.string().optional(),
});

export const doctorSchema = z.object({
  name: z.string().min(2, 'Nama dokter minimal 2 karakter'),
  specialty: z.string().min(2, 'Spesialisasi harus diisi'),
  schedule: z.record(z.string(), z.array(z.string())), // { "senin": ["08:00", "12:00"], ... }
});

export const reservationSchema = z.object({
  patientId: z.number().positive(),
  doctorId: z.number().positive(),
  reservationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  reservationTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format waktu harus HH:mm'),
});

export type PatientInput = z.infer<typeof patientSchema>;
export type DoctorInput = z.infer<typeof doctorSchema>;
export type ReservationInput = z.infer<typeof reservationSchema>;
