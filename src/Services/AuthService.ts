/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  AccountStatus,
  AuthMethod,
  InstructorStatus,
  Role,
} from "@/generated/prisma/client";

import { comparePassword, hashPassword } from "@/lib/password";
import { AuthRepository } from "@/Repositories/AuthRepository";

type RegisterLearnerInput = {
  name: string;
  email: string;
  password: string;
};

type RegisterInstructorInput = {
  name: string;
  email: string;
  password: string;
  expertise: string;
};

type UpdateInstructorProfileInput = {
  name?: string;
  expertise?: string | null;
};

type UpdateInstructorNotificationsInput = {
  courseUpdatesNotification?: boolean;
  learnerActivityNotification?: boolean;
};

type UpdateProfileInput = {
  name?: string;
  certificateName?: string;
  expertise?: string | null;
};

type UpdateNotificationsInput = {
  courseUpdatesNotification?: boolean;
  learnerActivityNotification?: boolean;
};

type UpdateAccountInput = {
  email?: string;
  currentPassword?: string;
  newPassword?: string;
};

export class AuthService {
  private readonly authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  async registerLearner(input: RegisterLearnerInput) {
    const email = input.email.trim().toLowerCase();
    const name = input.name.trim();

    const existingUser = await this.authRepository.findByEmail(email);

    if (existingUser) {
      throw new Error("An account with this email already exists");
    }

    const passwordHash = await hashPassword(input.password);

    const user = await this.authRepository.create({
      name,
      email,
      passwordHash,
      role: Role.LEARNER,
      authMethod: AuthMethod.EMAIL,
    });

    return this.sanitizeUser(user);
  }

  async registerInstructor(input: RegisterInstructorInput) {
    const email = input.email.trim().toLowerCase();
    const name = input.name.trim();
    const expertise = input.expertise.trim();

    if (!expertise) {
      throw new Error("Expertise is required");
    }

    const existingUser = await this.authRepository.findByEmail(email);

    if (existingUser) {
      throw new Error("An account with this email already exists");
    }

    const passwordHash = await hashPassword(input.password);

    const user = await this.authRepository.create({
      name,
      email,
      passwordHash,
      role: Role.INSTRUCTOR,
      expertise,
      authMethod: AuthMethod.EMAIL,
      instructorStatus: InstructorStatus.PENDING,
    });

    return this.sanitizeUser(user);
  }

  /**
   * Account checks after Better Auth has verified the password. Instructors
   * who aren't approved yet may still sign in: they land on the status page.
   */
  async assertCanSignIn(emailInput: string) {
    const email = emailInput.trim().toLowerCase();

    const user = await this.authRepository.findByEmail(email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (user.accountStatus === AccountStatus.REMOVED) {
      throw new Error("This account has been removed");
    }

    if (user.accountStatus === AccountStatus.SUSPENDED) {
      throw new Error("Your account has been suspended");
    }

    return this.sanitizeUser(user);
  }

  async getInstructorSettings(instructorId: string) {
    const user = await this.authRepository.findSafeById(instructorId);

    if (!user) {
      throw new Error("Instructor not found");
    }

    if (user.role !== Role.INSTRUCTOR) {
      throw new Error("User is not an instructor");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      expertise: user.expertise,
      authMethod: user.authMethod,

      notifications: {
        courseUpdates: user.courseUpdatesNotification,

        learnerActivity: user.learnerActivityNotification,
      },
    };
  }

  async updateInstructorProfile(
    instructorId: string,
    input: UpdateInstructorProfileInput,
  ) {
    const user = await this.authRepository.findSafeById(instructorId);

    if (!user) {
      throw new Error("Instructor not found");
    }

    if (user.role !== Role.INSTRUCTOR) {
      throw new Error("User is not an instructor");
    }

    const updateData: {
      name?: string;
      expertise?: string | null;
    } = {};

    if (input.name !== undefined) {
      const name = input.name.trim();

      if (name.length < 2) {
        throw new Error("Full name must be at least 2 characters");
      }

      updateData.name = name;
    }

    if (input.expertise !== undefined) {
      const expertise = input.expertise?.trim();

      updateData.expertise = expertise || null;
    }

    const updatedUser = await this.authRepository.updateProfile(
      instructorId,
      updateData,
    );

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      expertise: updatedUser.expertise,
      authMethod: updatedUser.authMethod,
    };
  }

  async updateInstructorNotifications(
    instructorId: string,
    input: UpdateInstructorNotificationsInput,
  ) {
    const user = await this.authRepository.findSafeById(instructorId);

    if (!user) {
      throw new Error("Instructor not found");
    }

    if (user.role !== Role.INSTRUCTOR) {
      throw new Error("User is not an instructor");
    }

    const updatedUser = await this.authRepository.updateNotifications(
      instructorId,
      {
        ...(input.courseUpdatesNotification !== undefined && {
          courseUpdatesNotification: input.courseUpdatesNotification,
        }),

        ...(input.learnerActivityNotification !== undefined && {
          learnerActivityNotification: input.learnerActivityNotification,
        }),
      },
    );

    return {
      notifications: {
        courseUpdates: updatedUser.courseUpdatesNotification,

        learnerActivity: updatedUser.learnerActivityNotification,
      },
    };
  }

  async getUserSettings(userId: string) {
    const user = await this.authRepository.getSettingsById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await this.authRepository.findSafeById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const updateData: UpdateProfileInput = {};

    if (input.name !== undefined) {
      const name = input.name.trim();

      if (name.length < 2) {
        throw new Error("Full name must be at least 2 characters");
      }

      updateData.name = name;
    }

    if (input.certificateName !== undefined) {
      const certificateName = input.certificateName.trim();

      if (certificateName.length < 2) {
        throw new Error("Certificate name must be at least 2 characters");
      }

      updateData.certificateName = certificateName;
    }

    if (input.expertise !== undefined) {
      const expertise = input.expertise?.trim();

      updateData.expertise = expertise || null;
    }

    return this.authRepository.updateProfile(userId, updateData);
  }

  async updateNotifications(userId: string, input: UpdateNotificationsInput) {
    const user = await this.authRepository.findSafeById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const updateData: UpdateNotificationsInput = {};

    if (input.courseUpdatesNotification !== undefined) {
      updateData.courseUpdatesNotification = input.courseUpdatesNotification;
    }

    if (input.learnerActivityNotification !== undefined) {
      updateData.learnerActivityNotification =
        input.learnerActivityNotification;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error("No notification settings provided");
    }

    return this.authRepository.updateNotifications(userId, updateData);
  }

  async updateAccount(userId: string, input: UpdateAccountInput) {
    const user = await this.authRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.authMethod === AuthMethod.GOOGLE) {
      throw new Error(
        "Google-managed accounts cannot update email or password here",
      );
    }

    const updateData: {
      email?: string;
      passwordHash?: string;
    } = {};

    if (input.email !== undefined) {
      const email = input.email.trim().toLowerCase();

      if (!email) {
        throw new Error("Email is required");
      }

      if (email !== user.email) {
        const existingUser = await this.authRepository.findByEmail(email);

        if (existingUser && existingUser.id !== userId) {
          throw new Error("An account with this email already exists");
        }

        updateData.email = email;
      }
    }

    const hasCurrentPassword =
      input.currentPassword !== undefined && input.currentPassword.length > 0;

    const hasNewPassword =
      input.newPassword !== undefined && input.newPassword.length > 0;

    if (hasNewPassword && !hasCurrentPassword) {
      throw new Error("Current password is required to change your password");
    }

    if (hasCurrentPassword && !hasNewPassword) {
      throw new Error("New password is required to change your password");
    }

    if (hasNewPassword) {
      const currentHash = await this.authRepository.findPasswordHash(userId);

      if (!currentHash) {
        throw new Error("This account does not have a password");
      }

      const passwordIsValid = await comparePassword(
        input.currentPassword!,
        currentHash,
      );

      if (!passwordIsValid) {
        throw new Error("Current password is incorrect");
      }

      if (input.newPassword!.length < 8) {
        throw new Error("New password must be at least 8 characters");
      }

      updateData.passwordHash = await hashPassword(input.newPassword!);
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error("No account changes provided");
    }

    return this.authRepository.updateAccount(userId, updateData);
  }

  private sanitizeUser<T extends object>(user: T): Omit<T, "passwordHash"> {
    const { passwordHash: _, ...safeUser } = user as T & {
      passwordHash?: unknown;
    };

    return safeUser;
  }
}
