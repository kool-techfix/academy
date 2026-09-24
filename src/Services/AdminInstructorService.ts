import { InstructorStatus, Role } from "@/generated/prisma/client";

import { HttpError } from "@/lib/server/http-error";
import { AdminRepository } from "@/Repositories/AdminRepository";
import { InstructorEmailService } from "@/Services/InstructorEmailService";

export class AdminInstructorService {
  constructor(
    private readonly adminRepository = new AdminRepository(),
    private readonly instructorEmailService = new InstructorEmailService(),
  ) {}

  async getInstructors(status?: InstructorStatus) {
    return this.adminRepository.findInstructors(status);
  }

  /**
   * PENDING → APPROVED, then email the instructor.
   */
  async approve(instructorId: string) {
    await this.ensurePendingInstructor(instructorId);

    const instructor = await this.adminRepository.updateUserModerationIf(
      instructorId,
      { instructorStatus: InstructorStatus.PENDING },
      {
        instructorStatus: InstructorStatus.APPROVED,
        moderationReason: null,
      },
    );

    if (!instructor) {
      throw new HttpError(409, "This instructor is no longer pending review");
    }

    const emailSent = await this.trySendEmail(() =>
      this.instructorEmailService.sendApproval(instructor),
    );

    return { instructor, emailSent };
  }

  /**
   * PENDING → REJECTED with a reason, then email the instructor the reason.
   */
  async reject(instructorId: string, reason: string) {
    await this.ensurePendingInstructor(instructorId);

    const instructor = await this.adminRepository.updateUserModerationIf(
      instructorId,
      { instructorStatus: InstructorStatus.PENDING },
      {
        instructorStatus: InstructorStatus.REJECTED,
        moderationReason: reason,
      },
    );

    if (!instructor) {
      throw new HttpError(409, "This instructor is no longer pending review");
    }

    const emailSent = await this.trySendEmail(() =>
      this.instructorEmailService.sendRejection(instructor, reason),
    );

    return { instructor, emailSent };
  }

  private async ensurePendingInstructor(instructorId: string) {
    const user = await this.adminRepository.findUserById(instructorId);

    if (!user || user.role !== Role.INSTRUCTOR) {
      throw new HttpError(404, "Instructor not found");
    }

    if (user.instructorStatus !== InstructorStatus.PENDING) {
      throw new HttpError(409, "This instructor is no longer pending review");
    }
  }

  /**
   * The status change is already saved; an email failure is reported back
   * to the admin instead of undoing the decision.
   */
  private async trySendEmail(send: () => Promise<void>) {
    try {
      await send();
      return true;
    } catch (error) {
      console.error("Instructor moderation email failed:", error);
      return false;
    }
  }
}
