# 📚 API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
Saat ini API belum menggunakan authentication. Untuk production, disarankan menambahkan JWT atau API Key.

---

## 🏥 Patient Endpoints

### 1. Get All Patients
```http
GET /api/patients
```

**Response:**
```json
{
  "patients": [
    {
      "id": 1,
      "name": "Budi Santoso",
      "nik": "1234567890123456",
      "phone": "628123456789",
      "birthDate": "1990-05-15T00:00:00.000Z",
      "address": null,
      "createdAt": "2025-12-01T02:22:07.308Z"
    }
  ]
}
```

### 2. Get Patient by ID
```http
GET /api/patients/:id
```

**Response:**
```json
{
  "patient": {
    "id": 1,
    "name": "Budi Santoso",
    "nik": "1234567890123456",
    "phone": "628123456789",
    "birthDate": "1990-05-15T00:00:00.000Z",
    "address": null,
    "createdAt": "2025-12-01T02:22:07.308Z"
  }
}
```

### 3. Get Patient by Phone
```http
GET /api/patients/phone/:phone
```

**Response:**
```json
{
  "patient": {
    "id": 1,
    "name": "Budi Santoso",
    "nik": "1234567890123456",
    "phone": "628123456789",
    "birthDate": "1990-05-15T00:00:00.000Z",
    "address": null,
    "createdAt": "2025-12-01T02:22:07.308Z"
  }
}
```

### 4. Create Patient
```http
POST /api/patients
```

**Request Body:**
```json
{
  "name": "Budi Santoso",
  "nik": "1234567890123456",
  "phone": "628123456789",
  "birthDate": "1990-05-15",
  "address": "Jl. Contoh No. 123"
}
```

**Response:**
```json
{
  "patient": {
    "id": 1,
    "name": "Budi Santoso",
    "nik": "1234567890123456",
    "phone": "628123456789",
    "birthDate": "1990-05-15T00:00:00.000Z",
    "address": "Jl. Contoh No. 123",
    "createdAt": "2025-12-01T02:22:07.308Z"
  }
}
```

### 5. Update Patient
```http
PUT /api/patients/:id
```

**Request Body:**
```json
{
  "name": "Budi Santoso Updated",
  "address": "Jl. Baru No. 456"
}
```

### 6. Delete Patient
```http
DELETE /api/patients/:id
```

---

## 👨‍⚕️ Doctor Endpoints

### 1. Get All Doctors
```http
GET /api/doctors
```

**Response:**
```json
{
  "doctors": [
    {
      "id": 1,
      "name": "dr. Ani Wijaya, Sp.PD",
      "specialty": "Penyakit Dalam",
      "schedule": {
        "senin": ["08:00", "12:00"],
        "rabu": ["08:00", "12:00"],
        "jumat": ["08:00", "12:00"]
      }
    }
  ]
}
```

### 2. Get Doctor by ID
```http
GET /api/doctors/:id
```

### 3. Create Doctor
```http
POST /api/doctors
```

**Request Body:**
```json
{
  "name": "dr. Citra Dewi, Sp.A",
  "specialty": "Anak",
  "schedule": {
    "selasa": ["09:00", "15:00"],
    "kamis": ["09:00", "15:00"]
  }
}
```

### 4. Update Doctor
```http
PUT /api/doctors/:id
```

**Request Body:**
```json
{
  "name": "dr. Ani Wijaya, Sp.PD, FINASIM",
  "schedule": {
    "senin": ["08:00", "14:00"],
    "rabu": ["08:00", "14:00"],
    "jumat": ["08:00", "14:00"]
  }
}
```

### 5. Delete Doctor
```http
DELETE /api/doctors/:id
```

---

## 📅 Reservation Endpoints

### 1. Get All Reservations
```http
GET /api/reservations
```

**Response:**
```json
{
  "reservations": [
    {
      "id": 1,
      "patientId": 1,
      "doctorId": 1,
      "reservationDate": "2025-12-05T00:00:00.000Z",
      "reservationTime": "09:00",
      "queueNumber": "A-001",
      "status": "pending",
      "createdAt": "2025-12-01T02:30:00.000Z",
      "patient": {
        "name": "Budi Santoso",
        "phone": "628123456789"
      },
      "doctor": {
        "name": "dr. Ani Wijaya, Sp.PD",
        "specialty": "Penyakit Dalam"
      }
    }
  ]
}
```

### 2. Get Reservation by ID
```http
GET /api/reservations/:id
```

### 3. Get Reservations by Patient
```http
GET /api/reservations/patient/:patientId
```

### 4. Get Reservations by Doctor
```http
GET /api/reservations/doctor/:doctorId
```

### 5. Get Reservations by Date
```http
GET /api/reservations/date/:date
```

**Example:**
```http
GET /api/reservations/date/2025-12-05
```

### 6. Create Reservation
```http
POST /api/reservations
```

**Request Body:**
```json
{
  "patientId": 1,
  "doctorId": 1,
  "reservationDate": "2025-12-05",
  "reservationTime": "09:00"
}
```

**Response:**
```json
{
  "reservation": {
    "id": 1,
    "patientId": 1,
    "doctorId": 1,
    "reservationDate": "2025-12-05T00:00:00.000Z",
    "reservationTime": "09:00",
    "queueNumber": "A-001",
    "status": "pending",
    "createdAt": "2025-12-01T02:30:00.000Z"
  }
}
```

### 7. Update Reservation Status
```http
PUT /api/reservations/:id
```

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Available Status:**
- `pending` - Menunggu konfirmasi
- `confirmed` - Dikonfirmasi
- `completed` - Selesai
- `cancelled` - Dibatalkan

### 8. Cancel Reservation
```http
DELETE /api/reservations/:id
```

---

## 🤖 WhatsApp Bot Commands

Bot WhatsApp menerima perintah berikut:

### 1. Menu / Bantuan
```
menu
start
mulai
hi
halo
bantuan
help
```

**Response:** Menampilkan menu utama dengan daftar perintah.

### 2. Pendaftaran Pasien
```
daftar
```

**Flow:**
1. Bot meminta format: `Nama#NIK#Tanggal Lahir`
2. User mengirim: `Budi Santoso#1234567890123456#1990-05-15`
3. Bot konfirmasi pendaftaran berhasil

### 3. Lihat Jadwal Dokter
```
jadwal
```

**Response:** Daftar dokter dengan spesialisasi dan jadwal praktik.

### 4. Buat Reservasi
```
reservasi
```

**Flow:**
1. Bot menampilkan daftar dokter
2. User pilih nomor dokter (1, 2, dst)
3. Bot tampilkan pilihan tanggal (7 hari ke depan)
4. User pilih nomor tanggal
5. Bot tampilkan pilihan waktu
6. User pilih nomor waktu
7. Bot konfirmasi reservasi + nomor antrian

### 5. Cek Antrian
```
cek antrian
cek
antrian
```

**Response:** Daftar reservasi aktif user dengan nomor antrian.

### 6. Batalkan Reservasi
```
batal
```

**Flow:**
1. Bot tampilkan reservasi aktif
2. User pilih nomor reservasi yang akan dibatalkan
3. Bot konfirmasi pembatalan

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Testing API with cURL

### Create Patient
```bash
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "nik": "9876543210987654",
    "phone": "628999999999",
    "birthDate": "1995-03-20"
  }'
```

### Get All Doctors
```bash
curl http://localhost:3000/api/doctors
```

### Create Reservation
```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "doctorId": 1,
    "reservationDate": "2025-12-05",
    "reservationTime": "09:00"
  }'
```

---

## Rate Limiting

⚠️ **Belum diimplementasikan**. Untuk production, disarankan menambahkan rate limiting menggunakan `express-rate-limit`.

## CORS

⚠️ **Belum diimplementasikan**. Untuk production yang perlu akses dari frontend, tambahkan CORS middleware.
