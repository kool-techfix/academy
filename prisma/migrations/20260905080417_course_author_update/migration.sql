-- DropForeignKey
ALTER TABLE "CourseAuthor" DROP CONSTRAINT "CourseAuthor_courseId_fkey";

-- AddForeignKey
ALTER TABLE "CourseAuthor" ADD CONSTRAINT "CourseAuthor_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
