import { prisma } from "@/lib/prisma";
import { AuthMethod, Role, InstructorStatus } from "@/generated/prisma/client";

type CreateUserInput = {
  name: string;
  email: string;
  passwordHash?: string;
  role: Role;
  expertise?: string;
  instructorStatus?: InstructorStatus;
  authMethod?: AuthMethod;
};

export class AuthRepository {
  /**
   * Find a user by their email address.
   */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  /**
   * Find a user by their ID.
   */
  async findById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findSafeById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
      omit: {
        passwordHash: true,
      },
    });
  }

  /**
   * Create a new user.
   */
  async create(data: CreateUserInput) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role,
        expertise: data.expertise,
        instructorStatus: data.instructorStatus,
        authMethod: data.authMethod ?? AuthMethod.EMAIL,
      },
    });
  }

  async updateNotifications(
  id: string,
  data: {
    courseUpdatesNotification?: boolean;
    learnerActivityNotification?: boolean;
  },
) {
  return prisma.user.update({
    where: {
      id,
    },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      expertise: true,
      authMethod: true,
      courseUpdatesNotification: true,
      learnerActivityNotification: true,
    },
  });
}

  async getSettingsById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        expertise: true,
        authMethod: true,
        courseUpdatesNotification: true,
        learnerActivityNotification: true,
      },
    });
  }

  async updateProfile(
    id: string,
    data: {
      name?: string;
      expertise?: string | null;
    },
  ) {
    return prisma.user.update({
      where: {
        id,
      },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        expertise: true,
        authMethod: true,
        courseUpdatesNotification: true,
        learnerActivityNotification: true,
      },
    });
  }

  async updateAccount(
  id: string,
  data: {
    email?: string;
    passwordHash?: string;
  },
) {
  return prisma.user.update({
    where: {
      id,
    },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      expertise: true,
      authMethod: true,
      courseUpdatesNotification: true,
      learnerActivityNotification: true,
    },
  });
}
}
