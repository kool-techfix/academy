import { CourseRepository } from "@/Repositories/CourseRepository";
import { LearnerAccessService } from "@/Services/LearnerAccessService";

export class LearnerCourseService {
  constructor(
    private readonly courseRepository = new CourseRepository(),
    private readonly access = new LearnerAccessService(),
  ) {}

  async getCourse(userId: string, courseId: string) {
    await this.access.assertEnrolled(userId, courseId);

    // Enrollment is checked above, so learners keep access to courses that
    // an admin removed after they enrolled.
    const course = await this.courseRepository.findPublishedById(courseId, {
      includeRemoved: true,
    });

    if (!course) {
      throw new Error("Course not found");
    }

    return {
      ...course,
      authors: course.authors.map((author) => ({
        id: author.user.id,
        name: author.user.name,
      })),
    };
  }
  async getPublishedCourses() {
    const courses = await this.courseRepository.findPublished();

    return courses.map((course) => ({
      ...course,
      authors: course.authors.map((author) => ({
        id: author.user.id,
        name: author.user.name,
      })),
    }));
  }
}
