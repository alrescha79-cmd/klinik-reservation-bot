import prisma from '../../config/database';
import { DoctorInput, doctorSchema } from '../../utils/validation';

export interface DoctorSchedule {
  [day: string]: string[]; // e.g., { "senin": ["08:00", "12:00"], "selasa": ["13:00", "17:00"] }
}

export const doctorService = {
  /**
   * Create a new doctor
   */
  async create(input: DoctorInput) {
    // Validate input
    const validated = doctorSchema.parse(input);

    return prisma.doctor.create({
      data: {
        name: validated.name,
        specialty: validated.specialty,
        schedule: JSON.stringify(validated.schedule),
      },
    });
  },

  /**
   * Find doctor by ID
   */
  async findById(id: number) {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        reservations: {
          include: {
            patient: true,
          },
          orderBy: {
            reservationDate: 'desc',
          },
        },
      },
    });

    if (doctor) {
      return {
        ...doctor,
        schedule: JSON.parse(doctor.schedule) as DoctorSchedule,
      };
    }

    return null;
  },

  /**
   * Get all doctors
   */
  async findAll() {
    const doctors = await prisma.doctor.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return doctors.map((doctor) => ({
      ...doctor,
      schedule: JSON.parse(doctor.schedule) as DoctorSchedule,
    }));
  },

  /**
   * Find doctors by specialty
   */
  async findBySpecialty(specialty: string) {
    const doctors = await prisma.doctor.findMany({
      where: {
        specialty: {
          contains: specialty,
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return doctors.map((doctor) => ({
      ...doctor,
      schedule: JSON.parse(doctor.schedule) as DoctorSchedule,
    }));
  },

  /**
   * Update doctor
   */
  async update(id: number, data: Partial<DoctorInput>) {
    const updateData: any = { ...data };

    if (data.schedule) {
      updateData.schedule = JSON.stringify(data.schedule);
    }

    const doctor = await prisma.doctor.update({
      where: { id },
      data: updateData,
    });

    return {
      ...doctor,
      schedule: JSON.parse(doctor.schedule) as DoctorSchedule,
    };
  },

  /**
   * Delete doctor
   */
  async delete(id: number) {
    return prisma.doctor.delete({
      where: { id },
    });
  },

  /**
   * Get doctor schedule for a specific day
   */
  async getScheduleForDay(id: number, day: string): Promise<string[] | null> {
    const doctor = await this.findById(id);
    if (!doctor) return null;

    return doctor.schedule[day.toLowerCase()] || [];
  },

  /**
   * Seed initial doctors (for development)
   */
  async seed() {
    const existingDoctors = await prisma.doctor.count();
    if (existingDoctors > 0) {
      return; // Already seeded
    }

    const doctors = [
      {
        name: 'dr. Ani Wijaya',
        specialty: 'Umum',
        schedule: JSON.stringify({
          senin: ['08:00', '12:00'],
          selasa: ['08:00', '12:00'],
          rabu: ['08:00', '12:00'],
          kamis: ['08:00', '12:00'],
          jumat: ['08:00', '11:00'],
        }),
      },
      {
        name: 'dr. Budi Santoso',
        specialty: 'Gigi',
        schedule: JSON.stringify({
          senin: ['13:00', '17:00'],
          selasa: ['13:00', '17:00'],
          rabu: ['13:00', '17:00'],
          kamis: ['13:00', '17:00'],
        }),
      },
      {
        name: 'dr. Citra Dewi, Sp.A',
        specialty: 'Anak',
        schedule: JSON.stringify({
          senin: ['09:00', '13:00'],
          rabu: ['09:00', '13:00'],
          jumat: ['09:00', '13:00'],
        }),
      },
      {
        name: 'dr. Dedi Kurniawan, Sp.PD',
        specialty: 'Penyakit Dalam',
        schedule: JSON.stringify({
          selasa: ['08:00', '14:00'],
          kamis: ['08:00', '14:00'],
          sabtu: ['08:00', '12:00'],
        }),
      },
    ];

    for (const doctor of doctors) {
      await prisma.doctor.create({ data: doctor });
    }
  },
};

export default doctorService;
