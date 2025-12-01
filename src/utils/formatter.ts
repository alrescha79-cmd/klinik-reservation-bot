/**
 * Format tanggal ke format Indonesia
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format waktu ke format HH:mm
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Generate nomor antrian dengan format huruf + angka
 */
export const generateQueueNumber = (prefix: string, number: number): string => {
  return `${prefix}-${number.toString().padStart(3, '0')}`;
};

/**
 * Parse format input pasien: Nama#NIK#TanggalLahir
 */
export const parsePatientInput = (
  input: string
): { name: string; nik: string; birthDate: string } | null => {
  const parts = input.split('#').map((p) => p.trim());
  if (parts.length !== 3) return null;

  const [name, nik, birthDate] = parts;

  // Validasi NIK (16 digit)
  if (!/^\d{16}$/.test(nik)) return null;

  // Validasi format tanggal (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null;

  return { name, nik, birthDate };
};

/**
 * Format nomor telepon Indonesia
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove non-digits
  let cleaned = phone.replace(/\D/g, '');

  // Convert to 62 format
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }

  return cleaned;
};

/**
 * Format pesan WhatsApp
 */
export const formatWAMessage = {
  welcome: (): string => `
🏥 *Selamat Datang di Bot Reservasi ${process.env.CLINIC_NAME || 'Klinik'}*

Silakan pilih menu:
1️⃣ Ketik *DAFTAR* - Pendaftaran pasien baru
2️⃣ Ketik *JADWAL* - Lihat jadwal poli
2️⃣ Ketik *JADWAL DOKTER* - Lihat jadwal dokter
3️⃣ Ketik *RESERVASI* - Buat reservasi
4️⃣ Ketik *CEK ANTRIAN* - Cek status antrian
5️⃣ Ketik *BATAL* - Batalkan reservasi
6️⃣ Ketik *BANTUAN* - Bantuan

Ketik menu yang diinginkan.
`.trim(),

  registrationPrompt: (): string => `
📝 *Pendaftaran Pasien Baru*

Silakan kirim data Anda dengan format:
*Nama#NIK#Tanggal Lahir (YYYY-MM-DD)*

Contoh:
_Budi Santoso#1234567890123456#1990-05-15_

Ketik *BATAL* atau *MENU* untuk kembali.
`.trim(),

  registrationSuccess: (name: string, nik: string): string => `
✅ *Pendaftaran Berhasil!*

👤 Nama: *${name}*
🆔 NIK: ${nik}

Anda sekarang dapat membuat reservasi.
Ketik *RESERVASI* untuk membuat janji.
`.trim(),

  poliList: (
    polis: Array<{ id: number; name: string; description: string | null }>
  ): string => {
    const list = polis
      .map((p, i) => `${i + 1}. *${p.name}*${p.description ? ` - ${p.description}` : ''}`)
      .join('\n');

    return `
📋 *Daftar Poli*

${list}

Balas dengan *angka* untuk memilih poli.
Ketik *BATAL* atau *MENU* untuk kembali.
`.trim();
  },

  doctorList: (
    doctors: Array<{ id: number; name: string; specialty: string }>
  ): string => {
    const list = doctors
      .map((d, i) => `${i + 1}. *${d.name}* (${d.specialty})`)
      .join('\n');

    return `
📋 *Daftar Dokter*

${list}

Balas dengan *angka* untuk memilih dokter.
Ketik *BATAL* atau *MENU* untuk kembali.
`.trim();
  },

  poliScheduleDetail: (
    name: string,
    description: string | null,
    schedule: Record<string, string[]>
  ): string => {
    const dayNames: Record<string, string> = {
      senin: 'Senin',
      selasa: 'Selasa',
      rabu: 'Rabu',
      kamis: 'Kamis',
      jumat: 'Jumat',
      sabtu: 'Sabtu',
      minggu: 'Minggu',
    };

    const scheduleLines = Object.entries(schedule)
      .map(([day, times]) => {
        const dayName = dayNames[day.toLowerCase()] || day;
        const timeRange = times.length === 2 ? `${times[0]} - ${times[1]}` : times.join(', ');
        return `• ${dayName}: ${timeRange}`;
      })
      .join('\n');

    return `
🏥 *${name}*
${description ? `📝 ${description}` : ''}

📅 *Jadwal Buka:*
${scheduleLines || 'Jadwal belum tersedia'}

Ketik *MENU* untuk kembali ke menu utama.
`.trim();
  },

  doctorScheduleDetail: (
    name: string,
    specialty: string,
    schedule: Record<string, string[]>
  ): string => {
    const dayNames: Record<string, string> = {
      senin: 'Senin',
      selasa: 'Selasa',
      rabu: 'Rabu',
      kamis: 'Kamis',
      jumat: 'Jumat',
      sabtu: 'Sabtu',
      minggu: 'Minggu',
    };

    const scheduleLines = Object.entries(schedule)
      .map(([day, times]) => {
        const dayName = dayNames[day.toLowerCase()] || day;
        const timeRange = times.length === 2 ? `${times[0]} - ${times[1]}` : times.join(', ');
        return `• ${dayName}: ${timeRange}`;
      })
      .join('\n');

    return `
👨‍⚕️ *${name}*
🏥 Spesialisasi: ${specialty}

📅 *Jadwal Praktik:*
${scheduleLines || 'Jadwal belum tersedia'}

Ketik *MENU* untuk kembali ke menu utama.
`.trim();
  },

  reservationSuccess: (
    doctorName: string,
    date: string,
    time: string,
    queueNumber: string
  ): string => `
✅ *Reservasi Berhasil!*

👨‍⚕️ Dokter: *${doctorName}*
📅 Tanggal: ${date}
🕐 Waktu: ${time}
🎫 Nomor Antrian: *${queueNumber}*

Harap datang 15 menit sebelum jadwal.
Bawa KTP asli saat kunjungan.

Ketik *CEK ANTRIAN* untuk melihat status.
`.trim(),

  queueStatus: (
    queueNumber: string,
    doctorName: string,
    date: string,
    status: string
  ): string => `
📊 *Status Antrian*

🎫 Nomor: *${queueNumber}*
👨‍⚕️ Dokter: ${doctorName}
📅 Tanggal: ${date}
📌 Status: ${status}
`.trim(),

  error: (message: string): string => `
❌ *Error*

${message}

Ketik *BANTUAN* untuk panduan.
`.trim(),

  help: (): string => `
📖 *Panduan Penggunaan Bot*

*Menu Utama:*
• DAFTAR - Daftar sebagai pasien baru
• JADWAL - Lihat jadwal poli
• JADWAL DOKTER - Lihat jadwal praktik dokter
• RESERVASI - Buat reservasi/janji
• CEK ANTRIAN - Cek status antrian Anda
• BATAL - Batalkan reservasi

*Format Pendaftaran:*
Nama#NIK#TanggalLahir

*Contoh:*
Budi Santoso#1234567890123456#1990-05-15

*Bantuan:*
Hubungi admin: wa.me/${process.env.ADMIN_PHONE || '628123456789'}
`.trim(),
};
