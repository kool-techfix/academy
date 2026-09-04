import {
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

type LoginInput = {
  email: string;
  password: string;
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

  async login(input: LoginInput) {
    const email = input.email.trim().toLowerCase();

    const user = await this.authRepository.findByEmail(email);

    if (!user || !user.passwordHash) {
      throw new Error("Invalid email or password");
    }

    const passwordIsValid = await comparePassword(
      input.password,
      user.passwordHash,
    );

    if (!passwordIsValid) {
      throw new Error("Invalid email or password");
    }

    if (
      user.role === Role.INSTRUCTOR &&
      user.instructorStatus !== InstructorStatus.APPROVED
    ) {
      if (user.instructorStatus === InstructorStatus.PENDING) {
        throw new Error(
          "Your instructor account is awaiting approval",
        );
      }

      if (user.instructorStatus === InstructorStatus.SUSPENDED) {
        throw new Error(
          "Your instructor account has been suspended",
        );
      }
    }

    return this.sanitizeUser(user);
  }

  private sanitizeUser(
    user: Awaited<ReturnType<AuthRepository["create"]>>,
  ) {
    const { passwordHash: _, ...safeUser } = user;

    return safeUser;
  }
}