import { CourseRepository } from "@/Repositories/CourseRepository";

export class PublicCourseService {
  constructor(
    private readonly courseRepository = new CourseRepository(),
  ) {}

  /**
   * Get all published courses available to the public.
   */
  async getPublishedCourses() {
    return this.courseRepository.findPublished();
  }

  /**
   * Get one published course.
   */
  async getPublishedCourseById(courseId: string) {
    const course =
      await this.courseRepository.findPublishedById(courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    return course;
  }
}