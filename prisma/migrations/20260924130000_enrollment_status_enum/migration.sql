-- Enrollment.status was created as TEXT ('active') in the init migration,
-- but the schema declares the EnrollmentStatus enum. Convert in place so
-- existing rows keep their value ('active' -> 'ACTIVE').

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Enrollment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Enrollment"
  ALTER COLUMN "status" TYPE "EnrollmentStatus"
  USING upper(trim("status"))::"EnrollmentStatus";
ALTER TABLE "Enrollment" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
