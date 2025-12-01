import prisma from '../../config/database';
import { PoliInput } from '../../utils/validation';

export interface PoliSchedule {
    [day: string]: string[]; // e.g., { "senin": ["08:00", "14:00"], "selasa": ["13:00", "17:00"] }
}

export const poliService = {
    /**
     * Create a new Poli
     */
    async create(input: PoliInput) {
        return prisma.poli.create({
            data: {
                name: input.name,
                description: input.description,
                schedule: JSON.stringify(input.schedule),
                isActive: input.isActive ?? true,
            },
        });
    },

    /**
     * Find Poli by ID
     */
    async findById(id: number) {
        const poli = await prisma.poli.findUnique({
            where: { id },
            include: {
                reservations: {
                    include: {
                        patient: true,
                        doctor: true,
                    },
                    orderBy: {
                        reservationDate: 'desc',
                    },
                },
            },
        });

        if (poli) {
            return {
                ...poli,
                schedule: JSON.parse(poli.schedule) as PoliSchedule,
            };
        }

        return null;
    },

    /**
     * Get all active Poli
     */
    async findAll(activeOnly: boolean = true) {
        const polis = await prisma.poli.findMany({
            where: activeOnly ? { isActive: true } : undefined,
            orderBy: {
                name: 'asc',
            },
        });

        return polis.map((poli) => ({
            ...poli,
            schedule: JSON.parse(poli.schedule) as PoliSchedule,
        }));
    },

    /**
     * Update Poli
     */
    async update(id: number, data: Partial<PoliInput>) {
        const updateData: any = { ...data };

        if (data.schedule) {
            updateData.schedule = JSON.stringify(data.schedule);
        }

        const poli = await prisma.poli.update({
            where: { id },
            data: updateData,
        });

        return {
            ...poli,
            schedule: JSON.parse(poli.schedule) as PoliSchedule,
        };
    },

    /**
     * Delete Poli (soft delete - set isActive to false)
     */
    async delete(id: number) {
        return prisma.poli.update({
            where: { id },
            data: { isActive: false },
        });
    },

    /**
     * Hard delete Poli (only if no reservations)
     */
    async hardDelete(id: number) {
        return prisma.poli.delete({
            where: { id },
        });
    },

    /**
     * Get Poli schedule for a specific day
     */
    async getScheduleForDay(id: number, day: string): Promise<string[] | null> {
        const poli = await this.findById(id);
        if (!poli) return null;

        return poli.schedule[day.toLowerCase()] || [];
    },

    /**
     * Seed common Poli types (for development)
     */
    async seed() {
        const existingPoli = await prisma.poli.count();
        if (existingPoli > 1) {
            // Already seeded (we have default Poli Umum from migration)
            return;
        }

        const commonPoli = [
            {
                name: 'Poli Gigi',
                description: 'Pelayanan kesehatan gigi dan mulut',
                schedule: JSON.stringify({
                    senin: ['08:00', '12:00'],
                    rabu: ['08:00', '12:00'],
                    jumat: ['08:00', '12:00'],
                }),
            },
            {
                name: 'Poli KIA',
                description: 'Kesehatan Ibu dan Anak',
                schedule: JSON.stringify({
                    senin: ['08:00', '13:00'],
                    selasa: ['08:00', '13:00'],
                    rabu: ['08:00', '13:00'],
                    kamis: ['08:00', '13:00'],
                    jumat: ['08:00', '11:00'],
                }),
            },
            {
                name: 'Poli Lansia',
                description: 'Pelayanan kesehatan lanjut usia',
                schedule: JSON.stringify({
                    selasa: ['08:00', '12:00'],
                    kamis: ['08:00', '12:00'],
                }),
            },
            {
                name: 'Poli TB',
                description: 'Pelayanan tuberkulosis',
                schedule: JSON.stringify({
                    senin: ['09:00', '12:00'],
                    rabu: ['09:00', '12:00'],
                }),
            },
            {
                name: 'Poli Imunisasi',
                description: 'Pelayanan imunisasi',
                schedule: JSON.stringify({
                    rabu: ['08:00', '11:00'],
                }),
            },
        ];

        for (const poli of commonPoli) {
            await prisma.poli.create({ data: poli });
        }
    },
};

export default poliService;
