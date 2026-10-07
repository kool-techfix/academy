/* eslint-disable @typescript-eslint/no-unused-vars */

import { CourseStatus, type Prisma } from "@/generated/prisma/client";

import { deleteObjectsBestEffort } from "@/lib/storage/r2";
import { COURSE_HAS_LEARNERS } from "@/lib/storage/errors";
import { CourseRepository } from "@/Repositories/CourseRepository";
import { EnrollmentRepository } from "@/Repositories/EnrollmentRepository";
import { LessonAttachmentRepository } from "@/Repositories/LessonAttachmentRepository";

export class CourseService {
  constructor(
    private readonly courseRepository = new CourseRepository(),
    private readonly enrollmentRepository = new EnrollmentRepository(),
    private readonly attachmentRepository = new LessonAttachmentRepository(),
  ) {}

  /**
   * Create a new course and assign the instructor as the owner.
   */
  async createCourse(
    instructorId: string,
    data: {
      title: string;
      description: string;
    },
  ) {
    return this.courseRepository.create({
      title: data.title,
      description: data.description,

      authors: {
        create: {
          userId: instructorId,
          role: "owner",
        },
      },
    });
  }

  /**
   * Get all courses authored by an instructor.
   */
  async getInstructorCourses(instructorId: string) {
    return this.courseRepository.findByInstructor(instructorId);
  }

  /**
   * Get one course.
   * Ensures the requesting instructor owns/is an author.
   */
  async getCourseById(instructorId: string, courseId: string) {
    await this.ensureInstructorHasAccess(instructorId, courseId);

    const course = await this.courseRepository.findById(courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    return course;
  }

  /**
   * Update a course.
   */
  async updateCourse(
    instructorId: string,
    courseId: string,
    data: {
      title?: string;
      description?: string;
    },
  ) {
    await this.ensureInstructorHasAccess(instructorId, courseId);

    return this.courseRepository.update(courseId, data);
  }

  /**
   * Delete a course.
   */
  async deleteCourse(instructorId: string, courseId: string) {
    await this.ensureInstructorHasAccess(instructorId, courseId);

    // Never wipe learners' enrollments and progress; unpublish instead.
    if ((await this.enrollmentRepository.countByCourse(courseId)) > 0) {
      throw new Error(COURSE_HAS_LEARNERS);
    }

    const storageKeys =
      await this.attachmentRepository.listStorageKeysByCourse(courseId);

    // Modules, lessons, quizzes, questions and attachment rows cascade.
    await this.courseRepository.delete(courseId);

    await deleteObjectsBestEffort(storageKeys);

    return {
      success: true,
    };
  }

  /**
   * Publish a course.
   */
  async publishCourse(instructorId: string, courseId: string) {
    const course = await this.getCourseById(instructorId, courseId);

    if (!course.title.trim()) {
      throw new Error("Course must have a title before it can be published");
    }

    if (!course.description.trim()) {
      throw new Error(
        "Course must have a description before it can be published",
      );
    }

    if (course.status === CourseStatus.PUBLISHED) {
      throw new Error("Course is already published");
    }

    return this.courseRepository.updateStatus(courseId, CourseStatus.PUBLISHED);
  }

  /**
   * Return a published course back to draft.
   */
  async unpublishCourse(
  instructorId: string,
  courseId: string,
) {
  const course = await this.getCourseById(
    instructorId,
    courseId,
  );

  if (course.status === CourseStatus.DRAFT) {
    throw new Error("Course is already unpublished");
  }

  return this.courseRepository.updateStatus(
    courseId,
    CourseStatus.DRAFT,
  );
}

  /**
   * Verify that the instructor is an author of this course.
   */
  private async ensureInstructorHasAccess(
    instructorId: string,
    courseId: string,
  ) {
    const isAuthor = await this.courseRepository.isAuthor(
      courseId,
      instructorId,
    );

    if (!isAuthor) {
      throw new Error("You do not have permission to access this course");
    }
  }
}
