import { WASocket, proto } from '@whiskeysockets/baileys';
import logger from '../../utils/logger';
import { formatPhoneNumber, formatWAMessage, parsePatientInput } from '../../utils/formatter';
import { sendMessage } from '../baileys';
import { patientService } from '../../modules/patient/patient.service';
import { doctorService } from '../../modules/doctor/doctor.service';
import { poliService } from '../../modules/poli/poli.service';
import { reservationService } from '../../modules/reservation/reservation.service';

// User session state management
interface UserSession {
  state: string;
  data: Record<string, any>;
  timestamp: number;
}

const userSessions = new Map<string, UserSession>();

// Session timeout: 5 minutes
const SESSION_TIMEOUT = 5 * 60 * 1000;

/**
 * Get or create user session
 */
const getSession = (phone: string): UserSession => {
  const existing = userSessions.get(phone);
  if (existing && Date.now() - existing.timestamp < SESSION_TIMEOUT) {
    return existing;
  }
  const newSession: UserSession = { state: 'IDLE', data: {}, timestamp: Date.now() };
  userSessions.set(phone, newSession);
  return newSession;
};

/**
 * Update user session
 */
const updateSession = (phone: string, state: string, data: Record<string, any> = {}): void => {
  userSessions.set(phone, {
    state,
    data: { ...getSession(phone).data, ...data },
    timestamp: Date.now(),
  });
};

/**
 * Clear user session
 */
const clearSession = (phone: string): void => {
  userSessions.set(phone, { state: 'IDLE', data: {}, timestamp: Date.now() });
};

/**
 * Handle incoming messages
 */
export const handleMessage = async (
  sock: WASocket,
  message: proto.IWebMessageInfo
): Promise<void> => {
  try {
    // Get message content
    const msg = message.message;
    if (!msg) return;

    // Get sender JID
    const remoteJid = message.key?.remoteJid;
    if (!remoteJid) return;

    // Skip if it's a status broadcast
    if (remoteJid === 'status@broadcast') return;

    // Skip if it's from self
    if (message.key?.fromMe) return;

    // Extract text from various message types
    const text =
      msg.conversation ||
      msg.extendedTextMessage?.text ||
      msg.buttonsResponseMessage?.selectedButtonId ||
      msg.listResponseMessage?.singleSelectReply?.selectedRowId ||
      '';

    if (!text) return;

    // Get phone number
    const phone = remoteJid.replace('@s.whatsapp.net', '');

    logger.info(`Message from ${phone}: ${text}`);

    // Get user session
    const session = getSession(phone);

    // Process message based on state and command
    await processMessage(remoteJid, phone, text.trim(), session);
  } catch (error) {
    logger.error('Error handling message:', error);
  }
};

/**
 * Process message based on state and command
 */
const processMessage = async (
  jid: string,
  phone: string,
  text: string,
  session: UserSession
): Promise<void> => {
  const command = text.toUpperCase();

  // Handle state-based flows
  if (session.state !== 'IDLE') {
    await handleStatefulMessage(jid, phone, text, session);
    return;
  }

  // Handle main commands
  switch (command) {
    case 'MENU':
    case 'START':
    case 'MULAI':
    case 'HI':
    case 'HALO':
      await sendMessage(jid, formatWAMessage.welcome());
      break;

    case 'DAFTAR':
      await handleDaftar(jid, phone);
      break;

    case 'JADWAL':
      await handleJadwal(jid, phone);
      break;

    case 'JADWAL DOKTER':
      await handleJadwalDokter(jid, phone);
      break;

    case 'RESERVASI':
      await handleReservasi(jid, phone);
      break;

    case 'CEK ANTRIAN':
    case 'CEK':
    case 'ANTRIAN':
      await handleCekAntrian(jid, phone);
      break;

    case 'BATAL':
      await handleBatal(jid, phone);
      break;

    case 'BANTUAN':
    case 'HELP':
      await sendMessage(jid, formatWAMessage.help());
      break;

    default:
      // Check if user is registered
      const patient = await patientService.findByPhone(phone);
      if (patient) {
        await sendMessage(
          jid,
          `Halo *${patient.name}*! 👋\n\n${formatWAMessage.welcome()}`
        );
      } else {
        await sendMessage(jid, formatWAMessage.welcome());
      }
      break;
  }
};

/**
 * Handle stateful messages (multi-step flows)
 */
const handleStatefulMessage = async (
  jid: string,
  phone: string,
  text: string,
  session: UserSession
): Promise<void> => {
  // Allow cancel or return to menu at any time
  const upperText = text.toUpperCase();
  if (upperText === 'BATAL' || upperText === 'CANCEL' || upperText === 'MENU') {
    clearSession(phone);
    if (upperText === 'MENU') {
      await sendMessage(jid, formatWAMessage.welcome());
    } else {
      await sendMessage(jid, '❌ Proses dibatalkan.\n\nKetik *MENU* untuk kembali ke menu utama.');
    }
    return;
  }

  switch (session.state) {
    case 'AWAITING_REGISTRATION':
      await processRegistration(jid, phone, text);
      break;

    case 'AWAITING_DOCTOR_SELECTION':
      await processDoctorSelection(jid, phone, text);
      break;

    case 'AWAITING_SCHEDULE_SELECTION':
      await processScheduleSelection(jid, phone, text);
      break;

    case 'AWAITING_DOCTOR_SCHEDULE_SELECTION':
      await processDoctorScheduleSelection(jid, phone, text);
      break;

    case 'AWAITING_DATE_SELECTION':
      await processDateSelection(jid, phone, text);
      break;

    case 'AWAITING_TIME_SELECTION':
      await processTimeSelection(jid, phone, text);
      break;

    case 'AWAITING_CANCEL_CONFIRMATION':
      await processCancelConfirmation(jid, phone, text);
      break;

    default:
      clearSession(phone);
      await sendMessage(jid, formatWAMessage.welcome());
      break;
  }
};

/**
 * Handle DAFTAR command
 */
const handleDaftar = async (jid: string, phone: string): Promise<void> => {
  // Check if already registered
  const existing = await patientService.findByPhone(phone);
  if (existing) {
    await sendMessage(
      jid,
      `✅ Anda sudah terdaftar!\n\n👤 Nama: *${existing.name}*\n🆔 NIK: ${existing.nik}\n\nKetik *RESERVASI* untuk membuat janji.`
    );
    return;
  }

  updateSession(phone, 'AWAITING_REGISTRATION');
  await sendMessage(jid, formatWAMessage.registrationPrompt());
};

/**
 * Process patient registration
 */
const processRegistration = async (
  jid: string,
  phone: string,
  text: string
): Promise<void> => {
  const parsed = parsePatientInput(text);

  if (!parsed) {
    await sendMessage(
      jid,
      formatWAMessage.error(
        'Format tidak valid!\n\nGunakan format:\n*Nama#NIK#Tanggal Lahir*\n\nContoh: Budi Santoso#1234567890123456#1990-05-15'
      )
    );
    return;
  }

  try {
    const patient = await patientService.create({
      name: parsed.name,
      nik: parsed.nik,
      phone: phone,
      birthDate: parsed.birthDate,
    });

    clearSession(phone);
    await sendMessage(jid, formatWAMessage.registrationSuccess(patient.name, patient.nik));
  } catch (error: any) {
    if (error.code === 'P2002') {
      await sendMessage(
        jid,
        formatWAMessage.error('NIK sudah terdaftar. Hubungi admin jika Anda merasa ini adalah kesalahan.')
      );
    } else {
      logger.error('Registration error:', error);
      await sendMessage(jid, formatWAMessage.error('Terjadi kesalahan. Silakan coba lagi.'));
    }
    clearSession(phone);
  }
};

/**
 * Handle JADWAL command (show Poli schedules)
 */
const handleJadwal = async (jid: string, phone: string): Promise<void> => {
  const polis = await poliService.findAll();

  if (polis.length === 0) {
    await sendMessage(jid, '📋 Belum ada data poli. Silakan hubungi admin.');
    return;
  }

  updateSession(phone, 'AWAITING_SCHEDULE_SELECTION', { polis });
  await sendMessage(jid, formatWAMessage.poliList(polis));
};

/**
 * Handle JADWAL DOKTER command (show Doctor schedules)
 */
const handleJadwalDokter = async (jid: string, phone: string): Promise<void> => {
  const doctors = await doctorService.findAll();

  if (doctors.length === 0) {
    await sendMessage(jid, '📋 Belum ada data dokter. Silakan hubungi admin.');
    return;
  }

  updateSession(phone, 'AWAITING_DOCTOR_SCHEDULE_SELECTION', { doctors });
  await sendMessage(jid, formatWAMessage.doctorList(doctors));
};

/**
 * Process schedule selection (for Poli)
 */
const processScheduleSelection = async (
  jid: string,
  phone: string,
  text: string
): Promise<void> => {
  const session = getSession(phone);
  const polis = session.data.polis || [];

  const selection = parseInt(text);
  if (isNaN(selection) || selection < 1 || selection > polis.length) {
    await sendMessage(
      jid,
      formatWAMessage.error(`Pilihan tidak valid. Balas dengan angka 1-${polis.length}.`)
    );
    return;
  }

  const selectedPoli = polis[selection - 1];
  clearSession(phone);

  await sendMessage(
    jid,
    formatWAMessage.poliScheduleDetail(
      selectedPoli.name,
      selectedPoli.description,
      selectedPoli.schedule
    )
  );
};

/**
 * Process doctor schedule selection
 */
const processDoctorScheduleSelection = async (
  jid: string,
  phone: string,
  text: string
): Promise<void> => {
  const session = getSession(phone);
  const doctors = session.data.doctors || [];

  const selection = parseInt(text);
  if (isNaN(selection) || selection < 1 || selection > doctors.length) {
    await sendMessage(
      jid,
      formatWAMessage.error(`Pilihan tidak valid. Balas dengan angka 1-${doctors.length}.`)
    );
    return;
  }

  const selectedDoctor = doctors[selection - 1];
  clearSession(phone);

  await sendMessage(
    jid,
    formatWAMessage.doctorScheduleDetail(
      selectedDoctor.name,
      selectedDoctor.specialty,
      selectedDoctor.schedule
    )
  );
};

/**
 * Handle RESERVASI command
 */
const handleReservasi = async (jid: string, phone: string): Promise<void> => {
  // Check if registered
  const patient = await patientService.findByPhone(phone);
  if (!patient) {
    await sendMessage(
      jid,
      formatWAMessage.error('Anda belum terdaftar.\n\nKetik *DAFTAR* untuk mendaftar terlebih dahulu.')
    );
    return;
  }

  const doctors = await doctorService.findAll();
  if (doctors.length === 0) {
    await sendMessage(jid, '📋 Belum ada data dokter tersedia. Silakan hubungi admin.');
    return;
  }

  updateSession(phone, 'AWAITING_DOCTOR_SELECTION', { patientId: patient.id, doctors });
  await sendMessage(jid, formatWAMessage.doctorList(doctors));
};

/**
 * Process doctor selection
 */
const processDoctorSelection = async (
  jid: string,
  phone: string,
  text: string
): Promise<void> => {
  const session = getSession(phone);
  const doctors = session.data.doctors || [];

  const selection = parseInt(text);
  if (isNaN(selection) || selection < 1 || selection > doctors.length) {
    await sendMessage(
      jid,
      formatWAMessage.error(`Pilihan tidak valid. Balas dengan angka 1-${doctors.length}.`)
    );
    return;
  }

  const selectedDoctor = doctors[selection - 1];
  updateSession(phone, 'AWAITING_DATE_SELECTION', { doctorId: selectedDoctor.id, doctorName: selectedDoctor.name });

  // Show next 7 days
  const dates: string[] = [];
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  const dateList = dates
    .map((d, i) => {
      const dateObj = new Date(d);
      return `${i + 1}. ${dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`;
    })
    .join('\n');

  await sendMessage(
    jid,
    `👨‍⚕️ Dokter: *${selectedDoctor.name}*\n\n📅 Pilih tanggal:\n${dateList}\n\nBalas dengan *angka* untuk memilih tanggal.\nKetik *BATAL* atau *MENU* untuk kembali.`
  );

  updateSession(phone, 'AWAITING_DATE_SELECTION', { dates });
};

/**
 * Process date selection
 */
const processDateSelection = async (
  jid: string,
  phone: string,
  text: string
): Promise<void> => {
  const session = getSession(phone);

  // Generate dates again for validation
  const dates: string[] = [];
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  const selection = parseInt(text);
  if (isNaN(selection) || selection < 1 || selection > dates.length) {
    await sendMessage(jid, formatWAMessage.error(`Pilihan tidak valid. Balas dengan angka 1-${dates.length}.`));
    return;
  }

  const selectedDate = dates[selection - 1];
  updateSession(phone, 'AWAITING_TIME_SELECTION', { reservationDate: selectedDate });

  // Show available time slots
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
  const timeList = timeSlots.map((t, i) => `${i + 1}. ${t}`).join('\n');

  await sendMessage(
    jid,
    `📅 Tanggal: *${new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}*\n\n🕐 Pilih waktu:\n${timeList}\n\nBalas dengan *angka* untuk memilih waktu.\nKetik *BATAL* atau *MENU* untuk kembali.`
  );

  updateSession(phone, 'AWAITING_TIME_SELECTION', { timeSlots });
};

/**
 * Process time selection
 */
const processTimeSelection = async (
  jid: string,
  phone: string,
  text: string
): Promise<void> => {
  const session = getSession(phone);
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

  const selection = parseInt(text);
  if (isNaN(selection) || selection < 1 || selection > timeSlots.length) {
    await sendMessage(jid, formatWAMessage.error(`Pilihan tidak valid. Balas dengan angka 1-${timeSlots.length}.`));
    return;
  }

  const selectedTime = timeSlots[selection - 1];

  try {
    // TEMPORARY: Use default Poli Umum (id=1) until Poli selection is implemented
    const reservation = await reservationService.create({
      patientId: session.data.patientId,
      poliId: 1, // Default to Poli Umum
      doctorId: session.data.doctorId,
      reservationDate: session.data.reservationDate,
      reservationTime: selectedTime,
    });

    clearSession(phone);

    await sendMessage(
      jid,
      formatWAMessage.reservationSuccess(
        session.data.doctorName,
        new Date(session.data.reservationDate).toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        selectedTime,
        reservation.queueNumber
      )
    );
  } catch (error) {
    logger.error('Reservation error:', error);
    clearSession(phone);
    await sendMessage(jid, formatWAMessage.error('Terjadi kesalahan saat membuat reservasi. Silakan coba lagi.'));
  }
};

/**
 * Handle CEK ANTRIAN command
 */
const handleCekAntrian = async (jid: string, phone: string): Promise<void> => {
  const patient = await patientService.findByPhone(phone);
  if (!patient) {
    await sendMessage(
      jid,
      formatWAMessage.error('Anda belum terdaftar.\n\nKetik *DAFTAR* untuk mendaftar.')
    );
    return;
  }

  const reservations = await reservationService.findByPatient(patient.id);
  const activeReservations = reservations.filter((r) => r.status === 'pending' || r.status === 'confirmed');

  if (activeReservations.length === 0) {
    await sendMessage(jid, '📭 Tidak ada reservasi aktif.\n\nKetik *RESERVASI* untuk membuat janji.');
    return;
  }

  let message = '📋 *Reservasi Aktif Anda:*\n\n';
  activeReservations.forEach((r, i) => {
    message += `${i + 1}. 🎫 *${r.queueNumber}*\n`;
    if (r.doctor) {
      message += `   👨‍⚕️ ${r.doctor.name}\n`;
    }
    message += `   📅 ${new Date(r.reservationDate).toLocaleDateString('id-ID')}\n`;
    message += `   🕐 ${r.reservationTime}\n`;
    message += `   📌 Status: ${r.status}\n\n`;
  });

  await sendMessage(jid, message);
};

/**
 * Handle BATAL command
 */
const handleBatal = async (jid: string, phone: string): Promise<void> => {
  const patient = await patientService.findByPhone(phone);
  if (!patient) {
    await sendMessage(
      jid,
      formatWAMessage.error('Anda belum terdaftar.\n\nKetik *DAFTAR* untuk mendaftar.')
    );
    return;
  }

  const reservations = await reservationService.findByPatient(patient.id);
  const activeReservations = reservations.filter((r) => r.status === 'pending' || r.status === 'confirmed');

  if (activeReservations.length === 0) {
    await sendMessage(jid, '📭 Tidak ada reservasi aktif untuk dibatalkan.');
    return;
  }

  updateSession(phone, 'AWAITING_CANCEL_CONFIRMATION', { reservations: activeReservations });

  let message = '🗑️ *Pilih reservasi yang ingin dibatalkan:*\n\n';
  activeReservations.forEach((r, i) => {
    const doctorName = r.doctor ? r.doctor.name : 'Dokter Jaga';
    message += `${i + 1}. 🎫 ${r.queueNumber} - ${doctorName} (${new Date(r.reservationDate).toLocaleDateString('id-ID')})\n`;
  });
  message += '\nBalas dengan *angka* untuk memilih.\nKetik *BATAL* untuk membatalkan proses.';

  await sendMessage(jid, message);
};

/**
 * Process cancel confirmation
 */
const processCancelConfirmation = async (
  jid: string,
  phone: string,
  text: string
): Promise<void> => {
  const session = getSession(phone);
  const reservations = session.data.reservations || [];

  const selection = parseInt(text);
  if (isNaN(selection) || selection < 1 || selection > reservations.length) {
    await sendMessage(jid, formatWAMessage.error(`Pilihan tidak valid. Balas dengan angka 1-${reservations.length}.`));
    return;
  }

  const selectedReservation = reservations[selection - 1];

  try {
    await reservationService.cancel(selectedReservation.id);
    clearSession(phone);
    await sendMessage(
      jid,
      `✅ Reservasi *${selectedReservation.queueNumber}* berhasil dibatalkan.\n\nKetik *MENU* untuk kembali ke menu utama.`
    );
  } catch (error) {
    logger.error('Cancel error:', error);
    clearSession(phone);
    await sendMessage(jid, formatWAMessage.error('Terjadi kesalahan saat membatalkan reservasi.'));
  }
};
