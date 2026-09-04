-- CreateEnum
CREATE TYPE "InstructorStatus" AS ENUM ('PENDING', 'APPROVED', 'SUSPENDED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "instructorStatus" "InstructorStatus";
