export type AuthMethod = 'email' | 'google';
export type UserRole = 'learner' | 'instructor';

export type MockUser = {
  name: string;
  email: string;
  authMethod: AuthMethod;
  reminders: boolean;
  reminderFrequency: 'daily' | 'few-times';
  role: UserRole;
};

export const mockUser: MockUser = {
  name: 'Daniel Okafor',
  email: 'daniel@example.com',
  authMethod: 'email',
  reminders: true,
  reminderFrequency: 'few-times',
  role: 'instructor',
};

export function getMockAuthMethod(): AuthMethod {
  return sessionStorage.getItem('kooltech-auth-method') === 'google' ? 'google' : mockUser.authMethod;
}

export function setMockAuthMethod(authMethod: AuthMethod) {
  sessionStorage.setItem('kooltech-auth-method', authMethod);
}

export function getMockUserRole(): UserRole {
  if (typeof window === "undefined") {
    return mockUser.role;
  }

  const role = sessionStorage.getItem("kooltech-user-role");

  return role === "learner" || role === "instructor"
    ? role
    : mockUser.role;
}

export function setMockUserRole(role: UserRole) {
  sessionStorage.setItem('kooltech-user-role', role);
}
