import { prisma } from "@/lib/prisma";

import {
  AccountStatus,
  CourseModerationStatus,
  CourseStatus,
  InstructorStatus,
  Role,
  type Prisma,
} from "@/generated/prisma/client";

const moderatedUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  expertise: true,
  instructorStatus: true,
  accountStatus: true,
  moderationReason: true,
  moderatedAt: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

const courseAuthorsInclude = {
  include: {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  },
} satisfies Prisma.Course$authorsArgs;

const questionSelect = {
  id: true,
  questionText: true,
  options: true,
  correctAnswer: true,
} satisfies Prisma.QuestionSelect;

export type ModeratedUser = Prisma.UserGetPayload<{
  select: typeof moderatedUserSelect;
}>;

type UserModerationUpdate = {
  instructorStatus?: InstructorStatus;
  accountStatus?: AccountStatus;
  moderationReason: string | null;
};

export class AdminRepository {
  /* ------------------------------ Dashboard ------------------------------ */

  async getDashboardCounts() {
    const [pendingInstructors, publishedCourses, flaggedCourses, learners] =
      await prisma.$transaction([
        prisma.user.count({
          where: {
            role: Role.INSTRUCTOR,
            instructorStatus: InstructorStatus.PENDING,
            accountStatus: { not: AccountStatus.REMOVED },
          },
        }),
        prisma.course.count({
          where: {
            status: CourseStatus.PUBLISHED,
            moderationStatus: { not: CourseModerationStatus.REMOVED },
          },
        }),
        prisma.course.count({
          where: { moderationStatus: CourseModerationStatus.FLAGGED },
        }),
        prisma.user.count({
          where: {
            role: Role.LEARNER,
            accountStatus: { not: AccountStatus.REMOVED },
          },
        }),
      ]);

    return { pendingInstructors, publishedCourses, flaggedCourses, learners };
  }

  /* -------------------------------- Users -------------------------------- */

  async findInstructors(status?: InstructorStatus) {
    return prisma.user.findMany({
      where: {
        role: Role.INSTRUCTOR,
        accountStatus: { not: AccountStatus.REMOVED },
        ...(status && { instructorStatus: status }),
      },
      select: moderatedUserSelect,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Learners and instructors only — admins are never listed or moderated.
   */
  async findUsers(role?: typeof Role.LEARNER | typeof Role.INSTRUCTOR) {
    return prisma.user.findMany({
      where: {
        role: role ?? { in: [Role.LEARNER, Role.INSTRUCTOR] },
      },
      select: moderatedUserSelect,
      orderBy: { createdAt: "desc" },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: moderatedUserSelect,
    });
  }

  /**
   * Conditional update: only applies if the user still matches `where`, so
   * two admins acting at once can't both approve (and double-email) a user.
   * Returns the updated user, or null if the precondition no longer held.
   */
  async updateUserModerationIf(
    id: string,
    where: Prisma.UserWhereInput,
    data: UserModerationUpdate,
  ) {
    const { count } = await prisma.user.updateMany({
      where: { id, ...where },
      data: { ...data, moderatedAt: new Date() },
    });

    if (count === 0) {
      return null;
    }

    return this.findUserById(id);
  }

  /* ------------------------------- Courses ------------------------------- */

  async findCourses() {
    return prisma.course.findMany({
      include: {
        authors: courseAuthorsInclude,
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Full course tree for review: modules → lessons + module quiz questions,
   * plus the final assessment.
   */
  async findCourseForReview(id: string) {
    return prisma.course.findUnique({
      where: { id },
      include: {
        authors: courseAuthorsInclude,
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                order: true,
                youtubeVideoLink: true,
                notesFileUrl: true,
              },
            },
            quiz: {
              select: {
                id: true,
                passScore: true,
                allowRetake: true,
                questions: { select: questionSelect },
              },
            },
          },
        },
        finalQuiz: {
          select: {
            id: true,
            passScore: true,
            allowRetake: true,
            questions: { select: questionSelect },
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });
  }

  async findCourseModeration(id: string) {
    return prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        moderationStatus: true,
      },
    });
  }

  async updateCourseModeration(
    id: string,
    data: {
      moderationStatus: CourseModerationStatus;
      moderationReason: string | null;
    },
  ) {
    return prisma.course.update({
      where: { id },
      data: {
        ...data,
        moderatedAt:
          data.moderationStatus === CourseModerationStatus.NONE
            ? null
            : new Date(),
      },
      select: {
        id: true,
        title: true,
        status: true,
        moderationStatus: true,
        moderationReason: true,
        moderatedAt: true,
      },
    });
  }
}
