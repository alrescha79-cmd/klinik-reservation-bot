import prisma from '../../config/database';
import { ReservationInput, reservationSchema } from '../../utils/validation';
import { generateQueueNumber } from '../../utils/formatter';

export const reservationService = {
  /**
   * Create a new reservation
   */
  async create(input: ReservationInput) {
    // Validate input
    const validated = reservationSchema.parse(input);

    // Generate queue number
    const date = new Date(validated.reservationDate);
    const dateString = date.toISOString().split('T')[0].replace(/-/g, '');

    // Count existing reservations for this doctor on this date
    const existingCount = await prisma.reservation.count({
      where: {
        doctorId: validated.doctorId,
        reservationDate: date,
      },
    });

    // Get doctor for prefix
    const doctor = await prisma.doctor.findUnique({
      where: { id: validated.doctorId },
    });

    const prefix = doctor?.specialty.charAt(0).toUpperCase() || 'A';
    const queueNumber = generateQueueNumber(prefix, existingCount + 1);

    return prisma.reservation.create({
      data: {
        patientId: validated.patientId,
        doctorId: validated.doctorId,
        reservationDate: date,
        reservationTime: validated.reservationTime,
        queueNumber,
        status: 'pending',
      },
      include: {
        patient: true,
        doctor: true,
      },
    });
  },

  /**
   * Find reservation by ID
   */
  async findById(id: number) {
    return prisma.reservation.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
      },
    });
  },

  /**
   * Find reservations by patient ID
   */
  async findByPatient(patientId: number) {
    return prisma.reservation.findMany({
      where: { patientId },
      include: {
        doctor: true,
      },
      orderBy: {
        reservationDate: 'desc',
      },
    });
  },

  /**
   * Find reservations by doctor ID
   */
  async findByDoctor(doctorId: number) {
    return prisma.reservation.findMany({
      where: { doctorId },
      include: {
        patient: true,
      },
      orderBy: {
        reservationDate: 'desc',
      },
    });
  },

  /**
   * Find reservations by date
   */
  async findByDate(date: string) {
    const targetDate = new Date(date);

    return prisma.reservation.findMany({
      where: {
        reservationDate: targetDate,
      },
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: [
        { reservationTime: 'asc' },
        { queueNumber: 'asc' },
      ],
    });
  },

  /**
   * Find reservations by doctor and date
   */
  async findByDoctorAndDate(doctorId: number, date: string) {
    const targetDate = new Date(date);

    return prisma.reservation.findMany({
      where: {
        doctorId,
        reservationDate: targetDate,
      },
      include: {
        patient: true,
      },
      orderBy: [
        { reservationTime: 'asc' },
        { queueNumber: 'asc' },
      ],
    });
  },

  /**
   * Find reservation by queue number
   */
  async findByQueueNumber(queueNumber: string, date: string) {
    const targetDate = new Date(date);

    return prisma.reservation.findFirst({
      where: {
        queueNumber,
        reservationDate: targetDate,
      },
      include: {
        patient: true,
        doctor: true,
      },
    });
  },

  /**
   * Get all reservations
   */
  async findAll() {
    return prisma.reservation.findMany({
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: {
        reservationDate: 'desc',
      },
    });
  },

  /**
   * Update reservation status
   */
  async updateStatus(id: number, status: string) {
    return prisma.reservation.update({
      where: { id },
      data: { status },
      include: {
        patient: true,
        doctor: true,
      },
    });
  },

  /**
   * Confirm reservation
   */
  async confirm(id: number) {
    return this.updateStatus(id, 'confirmed');
  },

  /**
   * Complete reservation
   */
  async complete(id: number) {
    return this.updateStatus(id, 'completed');
  },

  /**
   * Cancel reservation
   */
  async cancel(id: number) {
    return this.updateStatus(id, 'cancelled');
  },

  /**
   * Reschedule reservation
   */
  async reschedule(id: number, newDate: string, newTime: string) {
    return prisma.reservation.update({
      where: { id },
      data: {
        reservationDate: new Date(newDate),
        reservationTime: newTime,
      },
      include: {
        patient: true,
        doctor: true,
      },
    });
  },

  /**
   * Delete reservation
   */
  async delete(id: number) {
    return prisma.reservation.delete({
      where: { id },
    });
  },

  /**
   * Get queue statistics for a doctor on a specific date
   */
  async getQueueStats(doctorId: number, date: string) {
    const targetDate = new Date(date);

    const reservations = await prisma.reservation.findMany({
      where: {
        doctorId,
        reservationDate: targetDate,
      },
    });

    const total = reservations.length;
    const pending = reservations.filter((r) => r.status === 'pending').length;
    const confirmed = reservations.filter((r) => r.status === 'confirmed').length;
    const completed = reservations.filter((r) => r.status === 'completed').length;
    const cancelled = reservations.filter((r) => r.status === 'cancelled').length;

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
    };
  },

  /**
   * Get today's reservations
   */
  async findToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.reservation.findMany({
      where: {
        reservationDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: [
        { reservationTime: 'asc' },
        { queueNumber: 'asc' },
      ],
    });
  },
};

export default reservationService;
