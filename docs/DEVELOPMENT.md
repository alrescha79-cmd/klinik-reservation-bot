# 🛠️ Development Guide

Panduan lengkap untuk mengembangkan WhatsApp Bot Reservasi Klinik/Puskesmas.

---

## 📋 Prerequisites

Sebelum memulai development, pastikan sudah terinstall:

- **Node.js** >= 18.x
- **npm** atau **yarn**
- **PostgreSQL** / **MySQL** / **SQLite** (sesuai pilihan)
- **Git**
- **VS Code** (recommended) atau text editor lainnya

---

## 🚀 Setup Project

### 1. Clone Repository
```bash
git clone https://github.com/alrescha79-cmd/klinik-reservation-bot.git
cd klinik-reservation-bot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
cp .env.example .env
```

Edit `.env` sesuai konfigurasi lokal:
```env
PORT=3000
DATABASE_URL="file:./dev.db"
ADMIN_PHONE="628xxxxxxxxx"
SESSION_FOLDER="./config/baileysSession"
```

**Database URLs:**
- SQLite: `file:./dev.db`
- PostgreSQL: `postgresql://user:password@localhost:5432/clinic`
- MySQL: `mysql://user:password@localhost:3306/clinic`

### 4. Setup Database
```bash
# Generate Prisma Client
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

Server akan berjalan di `http://localhost:3000` dan akan auto-reload ketika ada perubahan file.

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
 │    │    ├── patient.controller.ts  # HTTP request handlers
 │    │    ├── patient.service.ts     # Business logic
 │    │    └── patient.route.ts       # Route definitions
 │    ├── doctor/
 │    └── reservation/
 ├── prisma/
 │    └── schema.prisma     # Database schema
 ├── utils/
 │    ├── logger.ts         # Logging utility
 │    ├── formatter.ts      # Message formatters
 │    └── validation.ts     # Zod schemas
 └── config/
      ├── env.ts            # Environment config
      └── baileysSession/   # WhatsApp session storage
```

---

## 🔧 Development Workflow

### 1. Membuat Modul Baru

Contoh membuat modul `appointment`:

```bash
mkdir -p src/modules/appointment
touch src/modules/appointment/appointment.controller.ts
touch src/modules/appointment/appointment.service.ts
touch src/modules/appointment/appointment.route.ts
```

**appointment.service.ts:**
```typescript
import { prisma } from '../../app';

export const appointmentService = {
  async create(data: any) {
    return await prisma.appointment.create({ data });
  },
  
  async findAll() {
    return await prisma.appointment.findMany();
  },
  
  // ... other methods
};
```

**appointment.controller.ts:**
```typescript
import { Request, Response } from 'express';
import { appointmentService } from './appointment.service';

export const appointmentController = {
  async create(req: Request, res: Response) {
    try {
      const appointment = await appointmentService.create(req.body);
      res.json({ appointment });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  
  // ... other handlers
};
```

**appointment.route.ts:**
```typescript
import { Router } from 'express';
import { appointmentController } from './appointment.controller';

const router = Router();

router.post('/', appointmentController.create);
router.get('/', appointmentController.findAll);

export default router;
```

Registrasi route di `src/app.ts`:
```typescript
import appointmentRoutes from './modules/appointment/appointment.route';
app.use('/api/appointments', appointmentRoutes);
```

### 2. Update Database Schema

Edit `prisma/schema.prisma`:
```prisma
model Appointment {
  id        Int      @id @default(autoincrement())
  title     String
  date      DateTime
  createdAt DateTime @default(now())
}
```

Jalankan migration:
```bash
npx prisma migrate dev --name add_appointment_model
```

### 3. Menambah Command Bot Baru

Edit `src/bot/handlers/messageHandler.ts`:

```typescript
// Tambahkan di switch statement
case 'APPOINTMENT':
  await handleAppointment(jid, phone);
  break;

// Implementasi handler
const handleAppointment = async (jid: string, phone: string): Promise<void> => {
  // Logic untuk handle appointment
  await sendMessage(jid, 'Fitur appointment');
};
```

---

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Menulis Test Baru

Buat file `*.test.ts` di folder yang sama dengan file yang akan ditest.

**Contoh: `patient.service.test.ts`:**
```typescript
import { patientService } from './patient.service';

describe('Patient Service', () => {
  it('should create a patient', async () => {
    const data = {
      name: 'Test User',
      nik: '1234567890123456',
      phone: '628123456789',
      birthDate: new Date('1990-01-01'),
    };
    
    const patient = await patientService.create(data);
    
    expect(patient).toBeDefined();
    expect(patient.name).toBe('Test User');
  });
});
```

---

## 🐛 Debugging

### Debug Mode
Tambahkan di `package.json`:
```json
{
  "scripts": {
    "dev:debug": "NODE_OPTIONS='--inspect' nodemon"
  }
}
```

Jalankan:
```bash
npm run dev:debug
```

Buka Chrome DevTools: `chrome://inspect`

### VS Code Debugging

Buat `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Bot",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "skipFiles": ["<node_internals>/**"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Logger Levels

```typescript
import logger from '../utils/logger';

logger.info('Informational message');
logger.warn('Warning message');
logger.error('Error message', error);
logger.debug('Debug message'); // Hanya muncul di development
```

---

## 📊 Database Management

### Prisma Studio (Database GUI)
```bash
npx prisma studio
```

Buka browser: `http://localhost:5555`

### Reset Database
```bash
npx prisma migrate reset
```

### Create Migration
```bash
npx prisma migrate dev --name your_migration_name
```

### Generate Prisma Client (setelah schema changes)
```bash
npx prisma generate
```

### View Database
```bash
# SQLite
sqlite3 prisma/dev.db

# PostgreSQL
psql -U username -d clinic

# MySQL
mysql -u username -p clinic
```

---

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port server | `3000` |
| `DATABASE_URL` | Connection string database | `file:./dev.db` |
| `ADMIN_PHONE` | Nomor admin untuk notifikasi | `628123456789` |
| `SESSION_FOLDER` | Folder penyimpanan session WA | `./config/baileysSession` |
| `NODE_ENV` | Environment mode | `development` |
| `LOG_LEVEL` | Level logging | `info` / `debug` |

---

## 🔄 Hot Reload

Nodemon akan auto-restart server ketika mendeteksi perubahan pada:
- `*.ts` files di folder `src/`
- `*.json` files

Konfigurasi di `nodemon.json`:
```json
{
  "watch": ["src"],
  "ext": "ts,json",
  "ignore": ["src/**/*.test.ts"],
  "exec": "ts-node src/server.ts"
}
```

---

## 📦 Package Management

### Install Package Baru
```bash
npm install package-name
npm install -D @types/package-name  # TypeScript types
```

### Update Dependencies
```bash
npm update
```

### Check Outdated Packages
```bash
npm outdated
```

---

## 🎨 Code Style & Linting

### ESLint (coming soon)
```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### Prettier (coming soon)
```bash
npm install -D prettier eslint-config-prettier
```

---

## 🔧 Common Issues

### 1. Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Atau ganti PORT di .env
PORT=3001
```

### 2. Prisma Client Not Generated
```bash
npx prisma generate
```

### 3. TypeScript Errors
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npx prisma generate
```

### 4. WhatsApp Session Invalid
```bash
# Hapus session dan scan QR ulang
rm -rf config/baileysSession/*
npm run dev
```

### 5. Database Locked (SQLite)
```bash
# Restart server
# Atau gunakan PostgreSQL/MySQL untuk multi-process
```

---

## 📚 Resources

- [Baileys Documentation](https://github.com/WhiskeySockets/Baileys)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Zod Documentation](https://zod.dev)

---

## 🤝 Contributing

1. Fork repository
2. Buat branch baru: `git checkout -b feature/nama-fitur`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push ke branch: `git push origin feature/nama-fitur`
5. Buat Pull Request

---

## 💡 Tips

- Gunakan `logger` untuk debugging, bukan `console.log`
- Selalu validasi input dengan Zod
- Tulis test untuk business logic penting
- Gunakan Prisma Studio untuk inspect database
- Restart bot jika ada perubahan di `schema.prisma`
- Backup database sebelum reset/migrate

---

## 🆘 Need Help?

- Baca dokumentasi di folder `/docs`
- Check existing issues
- Hubungi maintainer
