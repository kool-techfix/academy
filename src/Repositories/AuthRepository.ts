import { randomUUID } from "node:crypto";

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

const CREDENTIAL_PROVIDER = "credential";

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
   * Create a new user. A password hash is stored on a Better Auth
   * "credential" account, which is what email/password sign-in checks.
   */
  async create(data: CreateUserInput) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          certificateName: data.name,
          role: data.role,
          expertise: data.expertise,
          instructorStatus: data.instructorStatus,
          authMethod: data.authMethod ?? AuthMethod.EMAIL,
        },
        omit: { passwordHash: true },
      });

      if (data.passwordHash) {
        await tx.account.create({
          data: {
            id: randomUUID(),
            accountId: user.id,
            providerId: CREDENTIAL_PROVIDER,
            userId: user.id,
            password: data.passwordHash,
          },
        });
      }

      return user;
    });
  }

  /** The bcrypt hash for email/password sign-in, if the user has one. */
  async findPasswordHash(userId: string) {
    const account = await prisma.account.findFirst({
      where: { userId, providerId: CREDENTIAL_PROVIDER },
      select: { password: true },
    });

    return account?.password ?? null;
  }

  async updatePasswordHash(userId: string, passwordHash: string) {
    await prisma.account.updateMany({
      where: { userId, providerId: CREDENTIAL_PROVIDER },
      data: { password: passwordHash },
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
        certificateName: true,
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
      certificateName?: string;
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
        certificateName: true,
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
  { passwordHash, ...data }: {
    email?: string;
    passwordHash?: string;
  },
) {
  if (passwordHash) {
    await this.updatePasswordHash(id, passwordHash);
  }

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
