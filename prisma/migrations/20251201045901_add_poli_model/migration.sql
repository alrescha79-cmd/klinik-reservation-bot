/*
  Warnings:

  - Added the required column `poliId` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Poli" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "schedule" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Create default Poli for existing reservations
INSERT INTO "Poli" ("id", "name", "description", "schedule", "isActive", "createdAt", "updatedAt")
VALUES (
  1,
  'Poli Umum',
  'Pelayanan kesehatan umum',
  '{"senin":["08:00","14:00"],"selasa":["08:00","14:00"],"rabu":["08:00","14:00"],"kamis":["08:00","14:00"],"jumat":["08:00","11:00"],"sabtu":["08:00","12:00"]}',
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reservation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "poliId" INTEGER NOT NULL,
    "doctorId" INTEGER,
    "reservationDate" DATETIME NOT NULL,
    "reservationTime" TEXT NOT NULL,
    "queueNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reservation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_poliId_fkey" FOREIGN KEY ("poliId") REFERENCES "Poli" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
-- Migrate existing reservations to default Poli (id=1)
INSERT INTO "new_Reservation" ("id", "patientId", "poliId", "doctorId", "reservationDate", "reservationTime", "queueNumber", "status", "createdAt", "updatedAt")
SELECT "id", "patientId", 1, "doctorId", "reservationDate", "reservationTime", "queueNumber", "status", "createdAt", "updatedAt" FROM "Reservation";
DROP TABLE "Reservation";
ALTER TABLE "new_Reservation" RENAME TO "Reservation";
CREATE INDEX "Reservation_patientId_idx" ON "Reservation"("patientId");
CREATE INDEX "Reservation_poliId_idx" ON "Reservation"("poliId");
CREATE INDEX "Reservation_doctorId_idx" ON "Reservation"("doctorId");
CREATE INDEX "Reservation_reservationDate_idx" ON "Reservation"("reservationDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Poli_name_key" ON "Poli"("name");
