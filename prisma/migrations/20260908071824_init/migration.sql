-- AlterTable
ALTER TABLE "User" ADD COLUMN     "courseUpdatesNotification" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "learnerActivityNotification" BOOLEAN NOT NULL DEFAULT true;
