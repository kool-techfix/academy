import { CourseModerationStatus } from "@/generated/prisma/client";

import { HttpError } from "@/lib/server/http-error";
import { AdminRepository } from "@/Repositories/AdminRepository";

export class AdminCourseService {
  constructor(private readonly adminRepository = new AdminRepository()) {}

  async getCourses() {
    const courses = await this.adminRepository.findCourses();

    return courses.map(({ authors, ...course }) => ({
      ...course,
      instructors: authors.map((author) => author.user),
    }));
  }

  async getCourseForReview(courseId: string) {
    const course = await this.adminRepository.findCourseForReview(courseId);

    if (!course) {
      throw new HttpError(404, "Course not found");
    }

    const { authors, ...rest } = course;

    return {
      ...rest,
      instructors: authors.map((author) => author.user),
    };
  }

  /**
   * Mark a course as possibly violating platform requirements. The course
   * stays available; the flag and reason are for admin follow-up.
   */
  async flag(courseId: string, reason: string) {
    const course = await this.getModeration(courseId);

    if (course.moderationStatus === CourseModerationStatus.FLAGGED) {
      throw new HttpError(409, "Course is already flagged");
    }

    if (course.moderationStatus === CourseModerationStatus.REMOVED) {
      throw new HttpError(409, "Course has already been removed");
    }

    return this.adminRepository.updateCourseModeration(courseId, {
      moderationStatus: CourseModerationStatus.FLAGGED,
      moderationReason: reason,
    });
  }

  /**
   * Soft-remove: hidden from the catalog and closed to new enrollments.
   * Enrollments, progress, and quiz attempts are left untouched.
   */
  async remove(courseId: string, reason: string) {
    const course = await this.getModeration(courseId);

    if (course.moderationStatus === CourseModerationStatus.REMOVED) {
      throw new HttpError(409, "Course has already been removed");
    }

    return this.adminRepository.updateCourseModeration(courseId, {
      moderationStatus: CourseModerationStatus.REMOVED,
      moderationReason: reason,
    });
  }

  /**
   * Clear a flag or removal (e.g. after the issue was resolved).
   */
  async restore(courseId: string) {
    const course = await this.getModeration(courseId);

    if (course.moderationStatus === CourseModerationStatus.NONE) {
      throw new HttpError(409, "Course is not flagged or removed");
    }

    return this.adminRepository.updateCourseModeration(courseId, {
      moderationStatus: CourseModerationStatus.NONE,
      moderationReason: null,
    });
  }

  private async getModeration(courseId: string) {
    const course = await this.adminRepository.findCourseModeration(courseId);

    if (!course) {
      throw new HttpError(404, "Course not found");
    }

    return course;
  }
}
