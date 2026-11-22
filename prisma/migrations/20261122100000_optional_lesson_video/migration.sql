-- A lesson needs at least one of: YouTube link, lecture notes, note files.
-- The video link is no longer required on its own.
-- AlterTable
ALTER TABLE "Lesson" ALTER COLUMN "youtubeVideoLink" DROP NOT NULL;
