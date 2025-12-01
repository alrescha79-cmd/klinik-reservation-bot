import prisma from '../../config/database';
import { PatientInput, patientSchema } from '../../utils/validation';
import { formatPhoneNumber } from '../../utils/formatter';

export const patientService = {
  /**
   * Create a new patient
   */
  async create(input: PatientInput) {
    // Validate input
    const validated = patientSchema.parse(input);

    // Format phone number
    const phone = formatPhoneNumber(validated.phone);

    return prisma.patient.create({
      data: {
        name: validated.name,
        nik: validated.nik,
        phone: phone,
        birthDate: new Date(validated.birthDate),
        address: validated.address,
      },
    });
  },

  /**
   * Find patient by ID
   */
  async findById(id: number) {
    return prisma.patient.findUnique({
      where: { id },
      include: {
        reservations: {
          include: {
            doctor: true,
          },
          orderBy: {
            reservationDate: 'desc',
          },
        },
      },
    });
  },

  /**
   * Find patient by phone number
   */
  async findByPhone(phone: string) {
    const formattedPhone = formatPhoneNumber(phone);
    return prisma.patient.findUnique({
      where: { phone: formattedPhone },
    });
  },

  /**
   * Find patient by NIK
   */
  async findByNik(nik: string) {
    return prisma.patient.findUnique({
      where: { nik },
    });
  },

  /**
   * Get all patients
   */
  async findAll() {
    return prisma.patient.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  /**
   * Update patient
   */
  async update(id: number, data: Partial<PatientInput>) {
    const updateData: any = { ...data };

    if (data.birthDate) {
      updateData.birthDate = new Date(data.birthDate);
    }

    if (data.phone) {
      updateData.phone = formatPhoneNumber(data.phone);
    }

    return prisma.patient.update({
      where: { id },
      data: updateData,
    });
  },

  /**
   * Delete patient
   */
  async delete(id: number) {
    return prisma.patient.delete({
      where: { id },
    });
  },
};

export default patientService;
