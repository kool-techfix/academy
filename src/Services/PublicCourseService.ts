import { CourseRepository } from "@/Repositories/CourseRepository";

export class PublicCourseService {
  constructor(
    private readonly courseRepository = new CourseRepository(),
  ) {}

  /**
   * Get all published courses available to the public.
   */
  async getPublishedCourses() {
    const courses = await this.courseRepository.findPublished();

    return courses.map(flattenAuthors);
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

    return flattenAuthors(course);
  }
}

/** Public shape: `authors: { id, name }[]` (matches PublicCourse on the client). */
function flattenAuthors<
  T extends { authors: { user: { id: string; name: string | null } }[] },
>(course: T) {
  return {
    ...course,
    authors: course.authors.map((author) => ({
      id: author.user.id,
      name: author.user.name,
    })),
  };
}