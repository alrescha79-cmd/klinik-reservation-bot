# 🏥 WhatsApp Bot Reservasi Klinik/Puskesmas

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-purple.svg)](https://www.prisma.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

Bot WhatsApp otomatis untuk sistem reservasi/pendaftaran pasien di Klinik atau Puskesmas. Dibangun dengan **Node.js**, **TypeScript**, **Baileys MD**, **Prisma ORM**, dan **Express.js**.

---

## ✨ Fitur Utama

- 🤖 **WhatsApp Bot Otomatis** - Berbasis Baileys Multi-Device
- 👤 **Pendaftaran Pasien** - Daftar pasien baru langsung via WhatsApp
- 👨‍⚕️ **Jadwal Dokter** - Tampilkan jadwal praktik dokter
- 📅 **Sistem Reservasi** - Buat reservasi dengan pilihan tanggal & waktu
- 🎫 **Nomor Antrian** - Generate nomor antrian otomatis
- 📊 **Cek Status** - Cek status reservasi dan antrian
- ❌ **Pembatalan** - Batalkan reservasi dengan mudah
- 🔌 **REST API** - Full API endpoints untuk integrasi
- 💾 **Database Support** - PostgreSQL, MySQL, atau SQLite
- 📝 **Logging** - Structured logging dengan Pino
- ✅ **Type-Safe** - Full TypeScript dengan strict mode

---

## 📋 Prerequisites

Sebelum memulai, pastikan sudah terinstall:

- **Node.js** >= 18.x
- **npm** atau **yarn**
- **Database**: PostgreSQL / MySQL / SQLite
- **Git**
- **Nomor WhatsApp** untuk bot

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/alrescha79-cmd/klinik-reservation-bot.git
cd klinik-reservation-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
DATABASE_URL="file:./dev.db"
ADMIN_PHONE="628xxxxxxxxx"
SESSION_FOLDER="./config/baileysSession"
NODE_ENV=development
```

### 4. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed initial data
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
```

### 6. Scan QR Code

Buka terminal, scan QR Code yang muncul dengan WhatsApp:
1. Buka **WhatsApp** di HP
2. Pergi ke **Settings** > **Linked Devices**
3. Tap **Link a Device**
4. Scan QR code di terminal

✅ Bot siap digunakan!

---

## 📱 Cara Menggunakan Bot

### Perintah WhatsApp

| Perintah | Fungsi |
|----------|--------|
| `menu`, `mulai`, `hi`, `halo` | Tampilkan menu utama |
| `daftar` | Pendaftaran pasien baru |
| `jadwal` | Lihat jadwal praktik dokter |
| `reservasi` | Buat reservasi/janji temu |
| `cek antrian`, `cek` | Cek status reservasi |
| `batal` | Batalkan reservasi |
| `bantuan`, `help` | Tampilkan bantuan |

### Flow Pendaftaran Pasien

1. Kirim pesan: **`daftar`**
2. Bot akan meminta data dengan format: `Nama#NIK#TanggalLahir`
3. Contoh: `Budi Santoso#1234567890123456#1990-05-15`
4. Bot konfirmasi pendaftaran berhasil

### Flow Reservasi

1. Kirim pesan: **`reservasi`**
2. Pilih dokter (balas dengan angka)
3. Pilih tanggal (balas dengan angka)
4. Pilih waktu (balas dengan angka)
5. Bot berikan nomor antrian (ex: `A-015`)

---

## 🔌 REST API

Server berjalan di `http://localhost:3000`

### Patient Endpoints

- `GET /api/patients` - List semua pasien
- `GET /api/patients/:id` - Detail pasien by ID
- `GET /api/patients/phone/:phone` - Detail pasien by phone
- `POST /api/patients` - Daftar pasien baru
- `PUT /api/patients/:id` - Update data pasien
- `DELETE /api/patients/:id` - Hapus pasien

### Doctor Endpoints

- `GET /api/doctors` - List semua dokter
- `GET /api/doctors/:id` - Detail dokter by ID
- `POST /api/doctors` - Tambah dokter baru
- `PUT /api/doctors/:id` - Update data dokter
- `DELETE /api/doctors/:id` - Hapus dokter
- `POST /api/doctors/seed` - Seed data dokter sample

### Reservation Endpoints

- `GET /api/reservations` - List semua reservasi
- `GET /api/reservations/:id` - Detail reservasi
- `GET /api/reservations/patient/:patientId` - Reservasi by patient
- `GET /api/reservations/doctor/:doctorId` - Reservasi by doctor
- `GET /api/reservations/date/:date` - Reservasi by date
- `POST /api/reservations` - Buat reservasi baru
- `PUT /api/reservations/:id` - Update reservasi
- `DELETE /api/reservations/:id` - Batalkan reservasi

**Lihat dokumentasi lengkap API**: [`docs/API.md`](./docs/API.md)

---

## 📁 Struktur Project

```
/src
 ├── app.ts                 # Express app configuration
 ├── server.ts              # Server entry point
 ├── bot/
 │    ├── index.ts          # Bot initialization
 │    ├── baileys.ts        # Baileys WhatsApp connection
 │    └── handlers/
 │         ├── messageHandler.ts  # Handle incoming messages
 │         └── eventHandler.ts    # Handle WA events
 ├── modules/
 │    ├── patient/
 │    │    ├── patient.controller.ts  # HTTP handlers
 │    │    ├── patient.service.ts     # Business logic
 │    │    └── patient.route.ts       # Route definitions
 │    ├── doctor/
 │    │    ├── doctor.controller.ts
 │    │    ├── doctor.service.ts
 │    │    └── doctor.route.ts
 │    └── reservation/
 │         ├── reservation.controller.ts
 │         ├── reservation.service.ts
 │         └── reservation.route.ts
 ├── prisma/
 │    ├── schema.prisma     # Database schema
 │    └── migrations/       # Database migrations
 ├── utils/
 │    ├── logger.ts         # Pino logger wrapper
 │    ├── formatter.ts      # Message formatters
 │    └── validation.ts     # Zod validation schemas
 └── config/
      ├── env.ts            # Environment configuration
      └── baileysSession/   # WhatsApp session storage
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

**Lihat panduan testing**: [`docs/TESTING.md`](./docs/TESTING.md)

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server with hot-reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm test             # Run tests
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (DB GUI)
```

### Development Tips

- Gunakan `npx prisma studio` untuk GUI database
- Log level bisa diubah di `.env` → `LOG_LEVEL=debug`
- Restart bot jika ada perubahan di `schema.prisma`
- Session WhatsApp disimpan di `config/baileysSession/`

**Lihat panduan development lengkap**: [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md)

---

## 🚀 Production Deployment

### Quick Deploy ke VPS

```bash
# Install dependencies
npm ci --production

# Setup database
npx prisma migrate deploy

# Build
npm run build

# Start with PM2
pm2 start dist/server.js --name wa-bot-klinik
```

### Docker Deployment

```bash
docker-compose up -d
```

**Lihat panduan deployment lengkap**: [`docs/PRODUCTION.md`](./docs/PRODUCTION.md)

---

## 📚 Documentation

Dokumentasi lengkap tersedia di folder [`/docs`](./docs):

- 📖 [**API Documentation**](./docs/API.md) - REST API endpoints & WhatsApp commands
- 🛠️ [**Development Guide**](./docs/DEVELOPMENT.md) - Setup development environment
- 🚀 [**Production Deployment**](./docs/PRODUCTION.md) - Deploy ke VPS/Cloud/Docker
- 🏗️ [**Architecture**](./docs/ARCHITECTURE.md) - System architecture & design patterns
- 🧪 [**Testing Guide**](./docs/TESTING.md) - Unit, integration, E2E testing

---

## 🗄️ Database Schema

```prisma
model Patient {
  id           Int           @id @default(autoincrement())
  name         String
  nik          String        @unique
  phone        String
  birthDate    DateTime
  address      String?
  createdAt    DateTime      @default(now())
  reservations Reservation[]
}

model Doctor {
  id           Int           @id @default(autoincrement())
  name         String
  specialty    String
  schedule     Json
  reservations Reservation[]
}

model Reservation {
  id              Int      @id @default(autoincrement())
  patientId       Int
  doctorId        Int
  reservationDate DateTime
  reservationTime String
  queueNumber     String
  status          String   @default("pending")
  createdAt       DateTime @default(now())
  
  patient Patient @relation(fields: [patientId], references: [id])
  doctor  Doctor  @relation(fields: [doctorId], references: [id])
}
```

---

## 🔐 Security

- ⚠️ Jangan commit `.env` ke repository
- ⚠️ Gunakan environment variables untuk credentials
- ⚠️ Untuk production, tambahkan rate limiting dan authentication
- ⚠️ Backup database secara berkala
- ⚠️ Backup WhatsApp session di `config/baileysSession/`

---

## 🐛 Troubleshooting

### Bot tidak merespon pesan?

1. Cek logs: Apakah ada error?
2. Pastikan `Message handler registered` muncul di log
3. Restart bot: `rs` di terminal nodemon
4. Clear session & scan ulang QR

### Database error?

```bash
# Reset database
npx prisma migrate reset

# Generate client ulang
npx prisma generate
```

### Port sudah digunakan?

```bash
# Ganti PORT di .env
PORT=3001

# Atau kill process
lsof -ti:3000 | xargs kill -9
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork repository
2. Create feature branch: `git checkout -b feature/nama-fitur`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/nama-fitur`
5. Submit Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👨‍💻 Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.x
- **WhatsApp API**: @whiskeysockets/baileys
- **Web Framework**: Express.js
- **ORM**: Prisma 6.x
- **Database**: PostgreSQL / MySQL / SQLite
- **Validation**: Zod
- **Logging**: Pino
- **Testing**: Jest
- **Process Manager**: PM2 (production)

---

## 🙏 Acknowledgments

- [Baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Express](https://expressjs.com/) - Fast, unopinionated web framework

---

## 📞 Support

Jika ada pertanyaan atau masalah:

1. Check [Documentation](./docs)
2. Review existing issues
3. Create new issue

---

<div align="center">

**⭐ Star this repo if you find it useful!**

Made with ❤️ for Indonesian Healthcare

</div>
