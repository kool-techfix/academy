import { api } from "@/lib/api/axios";

export type UserRole = "LEARNER" | "INSTRUCTOR";

export type InstructorStatus =
  | "PENDING"
  | "APPROVED"
  | "SUSPENDED";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  expertise: string | null;
  authMethod: "EMAIL" | "GOOGLE";
  instructorStatus: InstructorStatus | null;
  createdAt: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type LearnerRegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type InstructorRegisterInput = {
  name: string;
  email: string;
  password: string;
  expertise: string;
};

type AuthResponse = {
  message: string;
  user: AuthUser;
};

export const authApi = {
  async login(input: LoginInput): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      "/auth/login",
      input,
    );

    return response.data;
  },

  async registerLearner(
    input: LearnerRegisterInput,
  ): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      "/learner/auth/register",
      input,
    );

    return response.data;
  },

  async registerInstructor(
    input: InstructorRegisterInput,
  ): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      "/instructor/auth/register",
      input,
    );

    return response.data;
  },

  async getCurrentUser(): Promise<AuthUser> {
    const response = await api.get<{ user: AuthUser }>(
      "/auth/me",
    );

    return response.data.user;
  },

  async logout(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      "/auth/logout",
    );

    return response.data;
  },
};