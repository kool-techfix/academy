import {
  AccountStatus,
  InstructorStatus,
  Role,
} from "@/generated/prisma/client";

import { HttpError } from "@/lib/server/http-error";
import {
  AdminRepository,
  type ModeratedUser,
} from "@/Repositories/AdminRepository";

type ModeratedRole = typeof Role.LEARNER | typeof Role.INSTRUCTOR;

/**
 * One status to show admins per user. Removal applies to any account;
 * otherwise instructors are described by their instructor status and
 * learners by their account status.
 */
function displayStatus(user: ModeratedUser) {
  if (user.accountStatus === AccountStatus.REMOVED) {
    return "REMOVED" as const;
  }

  if (user.role === Role.INSTRUCTOR) {
    return user.instructorStatus ?? InstructorStatus.PENDING;
  }

  return user.accountStatus;
}

function toAdminUser(user: ModeratedUser) {
  return { ...user, status: displayStatus(user) };
}

export class AdminUserService {
  constructor(private readonly adminRepository = new AdminRepository()) {}

  async getUsers(role?: ModeratedRole) {
    const users = await this.adminRepository.findUsers(role);

    return users.map(toAdminUser);
  }

  /**
   * Learner: account ACTIVE → SUSPENDED.
   * Instructor: APPROVED → SUSPENDED (their courses and history are kept).
   */
  async suspend(userId: string, reason: string) {
    const user = await this.getModeratableUser(userId);

    const updated =
      user.role === Role.INSTRUCTOR
        ? await this.adminRepository.updateUserModerationIf(
            userId,
            {
              instructorStatus: InstructorStatus.APPROVED,
              accountStatus: AccountStatus.ACTIVE,
            },
            {
              instructorStatus: InstructorStatus.SUSPENDED,
              moderationReason: reason,
            },
          )
        : await this.adminRepository.updateUserModerationIf(
            userId,
            { accountStatus: AccountStatus.ACTIVE },
            {
              accountStatus: AccountStatus.SUSPENDED,
              moderationReason: reason,
            },
          );

    if (!updated) {
      throw new HttpError(
        409,
        user.role === Role.INSTRUCTOR
          ? "Only approved instructors can be suspended"
          : "Only active learners can be suspended",
      );
    }

    return toAdminUser(updated);
  }

  /**
   * Permanently blocks sign-in without deleting enrollments, progress,
   * quiz attempts, or authored courses.
   */
  async remove(userId: string, reason: string) {
    await this.getModeratableUser(userId);

    const updated = await this.adminRepository.updateUserModerationIf(
      userId,
      { accountStatus: { not: AccountStatus.REMOVED } },
      {
        accountStatus: AccountStatus.REMOVED,
        moderationReason: reason,
      },
    );

    if (!updated) {
      throw new HttpError(409, "This account has already been removed");
    }

    return toAdminUser(updated);
  }

  /**
   * Undo a suspension. Removed accounts cannot be reinstated.
   */
  async reinstate(userId: string) {
    const user = await this.getModeratableUser(userId);

    const updated =
      user.role === Role.INSTRUCTOR
        ? await this.adminRepository.updateUserModerationIf(
            userId,
            {
              instructorStatus: InstructorStatus.SUSPENDED,
              accountStatus: AccountStatus.ACTIVE,
            },
            {
              instructorStatus: InstructorStatus.APPROVED,
              moderationReason: null,
            },
          )
        : await this.adminRepository.updateUserModerationIf(
            userId,
            { accountStatus: AccountStatus.SUSPENDED },
            {
              accountStatus: AccountStatus.ACTIVE,
              moderationReason: null,
            },
          );

    if (!updated) {
      throw new HttpError(409, "Only suspended accounts can be reinstated");
    }

    return toAdminUser(updated);
  }

  private async getModeratableUser(userId: string) {
    const user = await this.adminRepository.findUserById(userId);

    // Admin accounts are never moderated through this service.
    if (!user || user.role === Role.ADMIN) {
      throw new HttpError(404, "User not found");
    }

    return user;
  }
}
