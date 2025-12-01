# 🧪 Testing Guide

Panduan lengkap untuk testing WhatsApp Bot Reservasi Klinik/Puskesmas.

---

## 📋 Testing Strategy

### Testing Pyramid

```
        ╱╲
       ╱  ╲        E2E Tests
      ╱────╲       (Few, Slow, Expensive)
     ╱      ╲
    ╱────────╲     Integration Tests
   ╱          ╲    (Some, Medium Speed)
  ╱────────────╲
 ╱              ╲  Unit Tests
╱────────────────╲ (Many, Fast, Cheap)
```

**Distribution:**
- **70%** Unit Tests
- **20%** Integration Tests
- **10%** E2E Tests

---

## 🛠️ Testing Tools

- **Jest**: Test framework
- **Supertest**: HTTP testing
- **Prisma Mock**: Database mocking
- **ts-jest**: TypeScript support

---

## ⚙️ Setup

Testing sudah dikonfigurasi di `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

---

## 🧪 Unit Tests

### 1. Testing Utilities

**File: `src/utils/formatter.test.ts`**

```typescript
import { formatPhoneNumber, parsePatientInput } from './formatter';

describe('Formatter Utils', () => {
  describe('formatPhoneNumber', () => {
    it('should format Indonesian phone number', () => {
      expect(formatPhoneNumber('08123456789')).toBe('628123456789');
      expect(formatPhoneNumber('628123456789')).toBe('628123456789');
      expect(formatPhoneNumber('+628123456789')).toBe('628123456789');
    });

    it('should handle invalid input', () => {
      expect(formatPhoneNumber('')).toBe('');
      expect(formatPhoneNumber('abc')).toBe('abc');
    });
  });

  describe('parsePatientInput', () => {
    it('should parse valid patient input', () => {
      const result = parsePatientInput('Budi Santoso#1234567890123456#1990-05-15');
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('Budi Santoso');
      expect(result?.nik).toBe('1234567890123456');
      expect(result?.birthDate).toEqual(new Date('1990-05-15'));
    });

    it('should return null for invalid format', () => {
      expect(parsePatientInput('Invalid')).toBeNull();
      expect(parsePatientInput('Name#NIK')).toBeNull();
      expect(parsePatientInput('Name#NIK#InvalidDate')).toBeNull();
    });

    it('should trim whitespace', () => {
      const result = parsePatientInput('  Budi  #  1234567890123456  #  1990-05-15  ');
      
      expect(result?.name).toBe('Budi');
      expect(result?.nik).toBe('1234567890123456');
    });
  });
});
```

### 2. Testing Validators

**File: `src/utils/validation.test.ts`**

```typescript
import { patientSchema, doctorSchema, reservationSchema } from './validation';

describe('Validation Schemas', () => {
  describe('patientSchema', () => {
    it('should validate correct patient data', () => {
      const data = {
        name: 'Budi Santoso',
        nik: '1234567890123456',
        phone: '628123456789',
        birthDate: new Date('1990-05-15'),
      };

      const result = patientSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid NIK', () => {
      const data = {
        name: 'Budi',
        nik: '123', // Too short
        phone: '628123456789',
        birthDate: new Date('1990-05-15'),
      };

      const result = patientSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject short name', () => {
      const data = {
        name: 'B', // Too short
        nik: '1234567890123456',
        phone: '628123456789',
        birthDate: new Date('1990-05-15'),
      };

      const result = patientSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('doctorSchema', () => {
    it('should validate correct doctor data', () => {
      const data = {
        name: 'dr. Ani',
        specialty: 'Umum',
        schedule: {
          senin: ['08:00', '12:00'],
          rabu: ['08:00', '12:00'],
        },
      };

      const result = doctorSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('reservationSchema', () => {
    it('should validate correct reservation data', () => {
      const data = {
        patientId: 1,
        doctorId: 1,
        reservationDate: '2025-12-05',
        reservationTime: '09:00',
      };

      const result = reservationSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid time format', () => {
      const data = {
        patientId: 1,
        doctorId: 1,
        reservationDate: '2025-12-05',
        reservationTime: '25:00', // Invalid time
      };

      const result = reservationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
```

### 3. Testing Services

**File: `src/modules/patient/patient.service.test.ts`**

```typescript
import { PrismaClient } from '@prisma/client';
import { patientService } from './patient.service';

// Mock Prisma
jest.mock('@prisma/client');

const mockPrisma = {
  patient: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('Patient Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a patient', async () => {
      const mockData = {
        name: 'Budi Santoso',
        nik: '1234567890123456',
        phone: '628123456789',
        birthDate: new Date('1990-05-15'),
      };

      const mockResult = { id: 1, ...mockData, address: null, createdAt: new Date() };
      mockPrisma.patient.create.mockResolvedValue(mockResult);

      // Test implementation would depend on actual service
      // This is a template
    });
  });

  describe('findByPhone', () => {
    it('should find patient by phone', async () => {
      const mockResult = {
        id: 1,
        name: 'Budi',
        nik: '1234567890123456',
        phone: '628123456789',
        birthDate: new Date(),
        address: null,
        createdAt: new Date(),
      };

      mockPrisma.patient.findFirst.mockResolvedValue(mockResult);

      // Test actual service call
    });

    it('should return null if patient not found', async () => {
      mockPrisma.patient.findFirst.mockResolvedValue(null);

      // Test actual service call
    });
  });
});
```

---

## 🔗 Integration Tests

### 1. Testing API Endpoints

**File: `src/modules/patient/patient.integration.test.ts`**

```typescript
import request from 'supertest';
import app from '../../app';
import { prisma } from '../../app';

describe('Patient API Integration', () => {
  beforeAll(async () => {
    // Setup test database
    await prisma.$connect();
  });

  afterAll(async () => {
    // Cleanup
    await prisma.patient.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/patients', () => {
    it('should create a new patient', async () => {
      const newPatient = {
        name: 'Test User',
        nik: '9876543210987654',
        phone: '628999999999',
        birthDate: '1995-03-20',
      };

      const response = await request(app)
        .post('/api/patients')
        .send(newPatient)
        .expect(201);

      expect(response.body.patient).toBeDefined();
      expect(response.body.patient.name).toBe(newPatient.name);
      expect(response.body.patient.nik).toBe(newPatient.nik);
    });

    it('should return 400 for invalid data', async () => {
      const invalidPatient = {
        name: 'A', // Too short
        nik: '123', // Too short
        phone: '628999999999',
        birthDate: 'invalid-date',
      };

      await request(app)
        .post('/api/patients')
        .send(invalidPatient)
        .expect(400);
    });

    it('should return 400 for duplicate NIK', async () => {
      const patient = {
        name: 'Test User 2',
        nik: '1111111111111111',
        phone: '628888888888',
        birthDate: '1995-03-20',
      };

      // First creation
      await request(app).post('/api/patients').send(patient).expect(201);

      // Duplicate creation
      await request(app).post('/api/patients').send(patient).expect(400);
    });
  });

  describe('GET /api/patients', () => {
    it('should return all patients', async () => {
      const response = await request(app)
        .get('/api/patients')
        .expect(200);

      expect(response.body.patients).toBeDefined();
      expect(Array.isArray(response.body.patients)).toBe(true);
    });
  });

  describe('GET /api/patients/:id', () => {
    it('should return patient by id', async () => {
      // Create patient first
      const newPatient = {
        name: 'Find Me',
        nik: '2222222222222222',
        phone: '628777777777',
        birthDate: '1990-01-01',
      };

      const createResponse = await request(app)
        .post('/api/patients')
        .send(newPatient);

      const patientId = createResponse.body.patient.id;

      // Find patient
      const response = await request(app)
        .get(`/api/patients/${patientId}`)
        .expect(200);

      expect(response.body.patient.id).toBe(patientId);
      expect(response.body.patient.name).toBe(newPatient.name);
    });

    it('should return 404 for non-existent patient', async () => {
      await request(app)
        .get('/api/patients/99999')
        .expect(404);
    });
  });

  describe('PUT /api/patients/:id', () => {
    it('should update patient', async () => {
      // Create patient
      const newPatient = {
        name: 'Update Me',
        nik: '3333333333333333',
        phone: '628666666666',
        birthDate: '1990-01-01',
      };

      const createResponse = await request(app)
        .post('/api/patients')
        .send(newPatient);

      const patientId = createResponse.body.patient.id;

      // Update patient
      const updates = {
        name: 'Updated Name',
        address: 'New Address',
      };

      const response = await request(app)
        .put(`/api/patients/${patientId}`)
        .send(updates)
        .expect(200);

      expect(response.body.patient.name).toBe(updates.name);
      expect(response.body.patient.address).toBe(updates.address);
    });
  });

  describe('DELETE /api/patients/:id', () => {
    it('should delete patient', async () => {
      // Create patient
      const newPatient = {
        name: 'Delete Me',
        nik: '4444444444444444',
        phone: '628555555555',
        birthDate: '1990-01-01',
      };

      const createResponse = await request(app)
        .post('/api/patients')
        .send(newPatient);

      const patientId = createResponse.body.patient.id;

      // Delete patient
      await request(app)
        .delete(`/api/patients/${patientId}`)
        .expect(200);

      // Verify deletion
      await request(app)
        .get(`/api/patients/${patientId}`)
        .expect(404);
    });
  });
});
```

### 2. Testing Reservation Flow

**File: `src/modules/reservation/reservation.integration.test.ts`**

```typescript
import request from 'supertest';
import app from '../../app';
import { prisma } from '../../app';

describe('Reservation API Integration', () => {
  let patientId: number;
  let doctorId: number;

  beforeAll(async () => {
    await prisma.$connect();

    // Create test patient
    const patient = await prisma.patient.create({
      data: {
        name: 'Test Patient',
        nik: '5555555555555555',
        phone: '628444444444',
        birthDate: new Date('1990-01-01'),
      },
    });
    patientId = patient.id;

    // Create test doctor
    const doctor = await prisma.doctor.create({
      data: {
        name: 'dr. Test',
        specialty: 'Umum',
        schedule: { senin: ['08:00', '12:00'] },
      },
    });
    doctorId = doctor.id;
  });

  afterAll(async () => {
    await prisma.reservation.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.$disconnect();
  });

  it('should create reservation with queue number', async () => {
    const reservation = {
      patientId,
      doctorId,
      reservationDate: '2025-12-10',
      reservationTime: '09:00',
    };

    const response = await request(app)
      .post('/api/reservations')
      .send(reservation)
      .expect(201);

    expect(response.body.reservation).toBeDefined();
    expect(response.body.reservation.queueNumber).toMatch(/^[A-L]-\d{3}$/);
    expect(response.body.reservation.status).toBe('pending');
  });

  it('should generate sequential queue numbers', async () => {
    const date = '2025-12-15';

    // Create first reservation
    const res1 = await request(app)
      .post('/api/reservations')
      .send({ patientId, doctorId, reservationDate: date, reservationTime: '09:00' });

    // Create second reservation
    const res2 = await request(app)
      .post('/api/reservations')
      .send({ patientId, doctorId, reservationDate: date, reservationTime: '10:00' });

    const queue1 = res1.body.reservation.queueNumber;
    const queue2 = res2.body.reservation.queueNumber;

    // Extract numbers
    const num1 = parseInt(queue1.split('-')[1]);
    const num2 = parseInt(queue2.split('-')[1]);

    expect(num2).toBe(num1 + 1);
  });
});
```

---

## 🚀 E2E Tests

### Bot Message Flow Test

**File: `src/bot/bot.e2e.test.ts`**

```typescript
import { handleMessage } from './handlers/messageHandler';
import { proto } from '@whiskeysockets/baileys';

describe('Bot E2E Tests', () => {
  // Mock socket
  const mockSocket = {
    sendMessage: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle registration flow', async () => {
    const phone = '628111111111';
    const jid = `${phone}@s.whatsapp.net`;

    // Step 1: User sends "daftar"
    const message1: proto.IWebMessageInfo = {
      key: { remoteJid: jid, fromMe: false },
      message: { conversation: 'daftar' },
    };

    await handleMessage(mockSocket, message1);

    // Verify registration prompt sent
    expect(mockSocket.sendMessage).toHaveBeenCalledWith(
      jid,
      expect.objectContaining({
        text: expect.stringContaining('Format:'),
      })
    );

    // Step 2: User sends patient data
    const message2: proto.IWebMessageInfo = {
      key: { remoteJid: jid, fromMe: false },
      message: { conversation: 'Test User#6666666666666666#1990-01-01' },
    };

    await handleMessage(mockSocket, message2);

    // Verify success message
    expect(mockSocket.sendMessage).toHaveBeenCalledWith(
      jid,
      expect.objectContaining({
        text: expect.stringContaining('berhasil'),
      })
    );
  });

  it('should handle reservation flow', async () => {
    // Similar to registration flow test
    // Test complete reservation journey
  });
});
```

---

## 🎯 Test Coverage

### Run Coverage Report

```bash
npm test -- --coverage
```

### Coverage Targets

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### View Coverage Report

```bash
npm test -- --coverage
open coverage/lcov-report/index.html
```

---

## 🔧 Testing Best Practices

### 1. Test Naming

```typescript
// ✅ Good
it('should create patient with valid data', () => {});
it('should return 404 when patient not found', () => {});

// ❌ Bad
it('test1', () => {});
it('creates patient', () => {});
```

### 2. Arrange-Act-Assert Pattern

```typescript
it('should calculate total', () => {
  // Arrange
  const items = [10, 20, 30];
  
  // Act
  const total = calculateTotal(items);
  
  // Assert
  expect(total).toBe(60);
});
```

### 3. Test Independence

```typescript
// Each test should be independent
describe('Patient Service', () => {
  beforeEach(async () => {
    // Clean state before each test
    await prisma.patient.deleteMany();
  });
  
  it('test 1', () => {});
  it('test 2', () => {}); // Should not depend on test 1
});
```

### 4. Mock External Dependencies

```typescript
// Mock WhatsApp socket
jest.mock('./baileys', () => ({
  sendMessage: jest.fn(),
}));

// Mock database
jest.mock('@prisma/client');
```

---

## 🐛 Debugging Tests

### Run Single Test File

```bash
npm test -- patient.test.ts
```

### Run Single Test

```bash
npm test -- -t "should create patient"
```

### Watch Mode

```bash
npm test -- --watch
```

### Verbose Output

```bash
npm test -- --verbose
```

---

## 📊 Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

---

## ✅ Testing Checklist

- [ ] All utility functions have unit tests
- [ ] All services have unit tests
- [ ] All API endpoints have integration tests
- [ ] Critical user flows have E2E tests
- [ ] Coverage > 80%
- [ ] All tests pass before commit
- [ ] No test warnings or errors
- [ ] Tests run in CI/CD pipeline

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Guide](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)
