-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'REMOVED');

-- CreateEnum
CREATE TYPE "CourseModerationStatus" AS ENUM ('NONE', 'FLAGGED', 'REMOVED');

-- AlterEnum
ALTER TYPE "InstructorStatus" ADD VALUE 'REJECTED';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "moderatedAt" TIMESTAMP(3),
ADD COLUMN     "moderationReason" TEXT,
ADD COLUMN     "moderationStatus" "CourseModerationStatus" NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "moderatedAt" TIMESTAMP(3),
ADD COLUMN     "moderationReason" TEXT;
