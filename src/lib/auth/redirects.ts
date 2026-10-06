/**
 * Where a signed-in user belongs. Shared by the server guards, the Google
 * callback landing page and the login form, so every path agrees.
 */
export type HomePathUser = {
  role: string;
  instructorStatus?: string | null;
  instructorApplicationStarted?: boolean | null;
};

export const INSTRUCTOR_APPLICATION_PATH = "/instructor-application";
export const INSTRUCTOR_STATUS_PATH = "/instructor-status";

export function homePathFor(user: HomePathUser): string {
  if (user.role === "ADMIN") return "/admin";

  if (user.role === "INSTRUCTOR") {
    return user.instructorStatus === "APPROVED"
      ? "/instructor"
      : INSTRUCTOR_STATUS_PATH;
  }

  // Signed up with Google from the instructor form but hasn't submitted
  // their expertise yet.
  if (user.instructorApplicationStarted) return INSTRUCTOR_APPLICATION_PATH;

  return "/dashboard";
}

/** Friendly copy for the `?error=` codes Better Auth adds after Google sign-in. */
export function googleErrorMessage(code: string | null): string | null {
  if (!code) return null;

  switch (code) {
    case "access_denied":
      return "Google sign-in was cancelled. You can try again whenever you're ready.";
    case "account_not_linked":
      return "An account with this email already exists. Sign in with your email and password instead.";
    case "email_not_verified":
      return "Your Google email address isn't verified, so we can't use it to sign you in.";
    case "signup_disabled":
    case "unable_to_create_user":
      return "We couldn't create your account with Google. Please try again or use email and password.";
    default:
      return "Google sign-in didn't work. Please try again.";
  }
}
