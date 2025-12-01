# 🏗️ Architecture Documentation

Dokumentasi arsitektur WhatsApp Bot Reservasi Klinik/Puskesmas.

---

## 📐 High-Level Architecture

```
┌─────────────┐
│   WhatsApp  │
│    Users    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│      Baileys WhatsApp API       │
│  (Multi-Device Authentication)  │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│      Message Handlers          │
│  - Event Handler               │
│  - Message Handler             │
│  - Session Management          │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│     Business Logic Layer       │
│  (Services)                    │
│  - Patient Service             │
│  - Poli Service                │
│  - Doctor Service              │
│  - Reservation Service         │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│      Data Access Layer         │
│     (Prisma ORM)               │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│         Database               │
│  (PostgreSQL/MySQL/SQLite)     │
└────────────────────────────────┘

┌────────────────────────────────┐
│        REST API Layer          │
│  (Express.js Controllers)      │
│  - Patient Endpoints           │
│  - Poli Endpoints              │
│  - Doctor Endpoints            │
│  - Reservation Endpoints       │
└────────────────────────────────┘
```

---

## 🧩 Component Architecture

### 1. **Bot Layer** (`/src/bot`)

**Responsibilities:**
- WhatsApp connection management
- QR code handling
- Message routing
- Session state management
- Event handling

**Components:**
- `baileys.ts`: WhatsApp connection using Baileys library
- `handlers/messageHandler.ts`: Process incoming messages
- `handlers/eventHandler.ts`: Handle WhatsApp events
- `index.ts`: Bot initialization

**Flow:**
```
WhatsApp Message → Baileys Socket → Message Handler → 
Session Check → Command Router → Service Layer → Response
```

### 2. **Service Layer** (`/src/modules/*/service.ts`)

**Responsibilities:**
- Business logic
- Data validation
- Database operations through Prisma
- Error handling

**Pattern:**
```typescript
export const serviceModule = {
  async create(data) {
    // Validate
    // Transform
    // Save to DB via Prisma
    // Return result
  },
  async findAll() { },
  async findById(id) { },
  async update(id, data) { },
  async delete(id) { },
};
```

### 3. **Controller Layer** (`/src/modules/*/controller.ts`)

**Responsibilities:**
- HTTP request handling
- Input validation
- Response formatting
- Error handling

**Pattern:**
```typescript
export const controller = {
  async create(req: Request, res: Response) {
    try {
      const data = await service.create(req.body);
      res.json({ data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
```

### 4. **Route Layer** (`/src/modules/*/route.ts`)

**Responsibilities:**
- URL mapping
- Middleware attachment
- Route grouping

**Pattern:**
```typescript
const router = Router();
router.get('/', controller.findAll);
router.post('/', controller.create);
export default router;
```

### 5. **Data Layer** (`/prisma`)

**Responsibilities:**
- Database schema definition
- Migrations
- Type generation

---

## 🗄️ Database Schema

```prisma
┌──────────────┐         ┌──────────┐         ┌──────────────┐
│   Patient    │         │   Poli   │         │    Doctor    │
├──────────────┤         ├──────────┤         ├──────────────┤
│ id           │         │ id       │         │ id           │
│ name         │         │ name     │         │ name         │
│ nik          │         │ descrip. │         │ specialty    │
│ phone        │         │ schedule │         │ schedule     │
│ birthDate    │         │ isActive │         │ createdAt    │
│ address      │         │ createdAt│         └──────────────┘
│ createdAt    │         └─────┬────┘                │
└──────┬───────┘               │                     │
       │                       │                     │
       │       ┌───────────────┴─────────┐           │
       └───────┤     Reservation         ├───────────┘
               ├─────────────────────────┤
               │ id                      │
               │ patientId          (FK) │
               │ poliId             (FK) │
               │ doctorId (nullable)(FK) │
               │ reservationDate         │
               │ reservationTime         │
               │ queueNumber             │
               │ status                  │
               │ createdAt               │
               └─────────────────────────┘
```

### Relationships:
- **Patient** → **Reservation**: One-to-Many
- **Poli** → **Reservation**: One-to-Many
- **Doctor** → **Reservation**: One-to-Many (optional)
- **Reservation** belongs to one **Patient**, one **Poli**, and optionally one **Doctor**

---

## 🔄 Data Flow

### 1. WhatsApp Message Flow

```
User sends "daftar"
    ↓
Baileys receives message
    ↓
messageHandler.handleMessage()
    ↓
Check session state
    ↓
Route to handleDaftar()
    ↓
Update session: AWAITING_REGISTRATION
    ↓
Send registration prompt
    ↓
User sends: "Budi#1234#1990-01-01"
    ↓
processRegistration()
    ↓
Parse & validate input
    ↓
patientService.create()
    ↓
Prisma saves to database
    ↓
Send success message
    ↓
Clear session
```

### 2. API Request Flow

```
HTTP POST /api/patients
    ↓
Express routes to patientController.create
    ↓
Validate request body
    ↓
Call patientService.create()
    ↓
Prisma ORM executes INSERT
    ↓
Return created patient
    ↓
Controller formats response
    ↓
Send JSON response
```

---

## 🧠 Session Management

**Session State Machine:**

```
IDLE (default)
  ├─→ AWAITING_REGISTRATION
  ├─→ AWAITING_SCHEDULE_SELECTION (for Poli)
  ├─→ AWAITING_DOCTOR_SCHEDULE_SELECTION (for Doctor)
  ├─→ AWAITING_DOCTOR_SELECTION
  │     └─→ AWAITING_DATE_SELECTION
  │           └─→ AWAITING_TIME_SELECTION
  │                 └─→ IDLE (complete)
  └─→ AWAITING_CANCEL_CONFIRMATION
        └─→ IDLE (complete)
        
NOTE: User can type BATAL or MENU at any state to return to IDLE
```

**Session Storage:**
- In-memory Map: `userSessions: Map<phone, UserSession>`
- Timeout: 5 minutes of inactivity
- Data preserved: state, temporary data, timestamp

**Session Structure:**
```typescript
interface UserSession {
  state: string;           // Current conversation state
  data: Record<string, any>; // Temporary data (doctorId, dates, etc)
  timestamp: number;       // Last activity timestamp
}
```

---

## 🔌 Module Pattern

Each module follows consistent structure:

```
/modules
  /patient
    ├── patient.controller.ts  ─┐
    ├── patient.service.ts     ─┼─ Same pattern
    └── patient.route.ts       ─┘  for all modules
  /poli
    ├── poli.controller.ts
    ├── poli.service.ts
    └── poli.route.ts
  /doctor
    ├── doctor.controller.ts
    ├── doctor.service.ts
    └── doctor.route.ts
  /reservation
    ├── reservation.controller.ts
    ├── reservation.service.ts
    └── reservation.route.ts
```

**Benefits:**
- Easy to locate code
- Consistent patterns
- Scalable structure
- Clear separation of concerns

---

## 🛡️ Error Handling Strategy

### Layered Error Handling:

1. **Service Layer**: Catch database/business logic errors
2. **Controller Layer**: Catch HTTP-related errors
3. **Bot Handler**: Catch message processing errors
4. **Global Handler**: Catch uncaught exceptions

**Example:**
```typescript
// Service
try {
  return await prisma.patient.create({ data });
} catch (error) {
  if (error.code === 'P2002') {
    throw new Error('NIK already exists');
  }
  throw error;
}

// Controller
try {
  const patient = await service.create(data);
  res.json({ patient });
} catch (error) {
  res.status(400).json({ error: error.message });
}

// Bot Handler
try {
  await handleMessage(sock, message);
} catch (error) {
  logger.error('Message handler error:', error);
  await sendMessage(jid, 'Terjadi kesalahan. Silakan coba lagi.');
}
```

---

## 📝 Logging Architecture

**Logger Levels:**
```
ERROR   → Critical failures
WARN    → Warning conditions
INFO    → General information (default)
DEBUG   → Detailed debug info (dev only)
```

**Log Locations:**
- Development: Console output (colorized)
- Production: File + stdout (structured JSON)

**What to Log:**
- All incoming messages (info)
- State transitions (debug)
- Database operations (debug)
- Errors with stack trace (error)
- API requests (info)

---

## 🔐 Security Architecture

### 1. Input Validation
- Zod schemas at service layer
- Type checking via TypeScript
- Format validation (NIK, phone, date)

### 2. Data Sanitization
- Prisma parameterized queries (SQL injection prevention)
- Input trimming and normalization

### 3. Session Security
- 5-minute timeout
- Phone number as identifier (from WA)
- No persistent session storage

### 4. Database Security
- Connection pooling
- Prepared statements (Prisma)
- Limited user permissions

### 5. Environment Security
- `.env` not committed
- Sensitive data in environment variables
- Different configs for dev/prod

---

## 📊 Queue Number Generation

**Algorithm:**
```typescript
function generateQueueNumber(date: Date): string {
  const prefix = ['A', 'B', 'C', ...][date.getMonth()];
  const count = await countReservationsToday(date);
  const number = String(count + 1).padStart(3, '0');
  return `${prefix}-${number}`;
}
```

**Format:** `{LETTER}-{NUMBER}`
- Letter: Based on month (A=Jan, B=Feb, ...)
- Number: Sequential, 3 digits (001, 002, ...)

**Example:** `A-015` = 15th reservation in January

---

## 🔄 State Management

### Bot State (In-Memory)
```typescript
const userSessions = new Map<string, UserSession>();
```
- Ephemeral (resets on restart)
- Per-user isolation
- Automatic timeout

### Database State (Persistent)
```typescript
// Prisma handles connection state
// Auto-reconnect on connection loss
```

---

## 🚀 Scalability Considerations

### Current Limitations:
1. **Single Instance**: One bot = one WhatsApp number
2. **In-Memory Sessions**: Lost on restart
3. **SQLite**: Not suitable for high concurrency

### Scaling Strategies:

**Horizontal Scaling:**
- Multiple bot instances = Multiple WA numbers
- Load balancer for API endpoints
- Shared database (PostgreSQL/MySQL)

**Session Persistence:**
- Redis for session storage
- Distributed session management

**Database Scaling:**
- PostgreSQL with connection pooling
- Read replicas for heavy read operations
- Database indexing on frequently queried fields

**Caching Layer:**
- Redis for doctor schedules
- Cache frequently accessed data
- Reduce database load

---

## 🧪 Testing Architecture

### Unit Tests
- Service layer logic
- Utility functions
- Validators

### Integration Tests
- API endpoints
- Database operations
- Message handlers

### E2E Tests
- Full message flow
- User journeys
- API workflows

---

## 📦 Dependency Management

**Core Dependencies:**
- `@whiskeysockets/baileys`: WhatsApp connection
- `@prisma/client`: Database ORM
- `express`: HTTP server
- `zod`: Schema validation
- `pino`: Logging

**Development:**
- `typescript`: Type safety
- `ts-node`: TS execution
- `nodemon`: Auto-reload
- `jest`: Testing framework

---

## 🔮 Future Architecture Improvements

1. **Authentication**: JWT for API endpoints
2. **Authorization**: Role-based access control
3. **Caching**: Redis integration
4. **Queue System**: Bull for background jobs
5. **Microservices**: Separate bot and API services
6. **WebSocket**: Real-time updates
7. **Analytics**: Track usage patterns
8. **Multi-tenancy**: Support multiple clinics

---

## 📚 Design Patterns Used

1. **Module Pattern**: Organized code structure
2. **Service Pattern**: Business logic separation
3. **Repository Pattern**: Data access abstraction (via Prisma)
4. **Factory Pattern**: Session creation
5. **State Pattern**: Conversation flow management
6. **Singleton Pattern**: Single socket instance

---

## 🎯 Principles Followed

- **SOLID**: Single responsibility, Open/closed, etc.
- **DRY**: Don't Repeat Yourself
- **KISS**: Keep It Simple, Stupid
- **Separation of Concerns**: Clear layer boundaries
- **Convention over Configuration**: Consistent patterns
