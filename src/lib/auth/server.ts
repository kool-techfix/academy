import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getOAuthState } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { after } from "next/server";

import { comparePassword, hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import {
  PASSWORD_RESET_EXPIRY_MINUTES,
  PasswordResetEmailService,
} from "@/Services/PasswordResetEmailService";

const passwordResetEmails = new PasswordResetEmailService();

/**
 * Send after the response: the reset request then takes the same time
 * whether or not the email belongs to an account (no account enumeration),
 * and a slow or failing mail server never breaks the request.
 */
function sendAfterResponse(label: string, send: () => Promise<void>) {
  after(async () => {
    try {
      await send();
    } catch (error) {
      console.error(`[email] Failed to send ${label}:`, error);
    }
  });
}

/**
 * Better Auth instance. Owns every session (email/password and Google).
 *
 * Account creation rules:
 * - Email/password accounts are created by our own register routes
 *   (/api/learner/auth/register, /api/instructor/auth/register), so Better
 *   Auth's public sign-up endpoint is disabled.
 * - The only users Better Auth creates itself come from Google. They are
 *   always learners; the role is fixed here on the server and can never be
 *   supplied by the client (every custom field is `input: false`).
 */
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 8,
    // Existing hashes are bcrypt; keep using it so no one has to reset.
    password: {
      hash: hashPassword,
      verify: ({ hash, password }) => comparePassword(password, hash),
    },
    // Forgot password → email link → /reset-password. Tokens live in the
    // Verification table, are single-use and expire after an hour.
    resetPasswordTokenExpiresIn: PASSWORD_RESET_EXPIRY_MINUTES * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      sendAfterResponse("password reset link", () =>
        passwordResetEmails.sendResetLink(user, url),
      );
    },
    onPasswordReset: async ({ user }) => {
      sendAfterResponse("password changed notice", () =>
        passwordResetEmails.sendPasswordChanged(user),
      );
    },
  },

  rateLimit: {
    // Better Auth rate-limits in production by default; tighten the
    // endpoints that send email or accept reset tokens.
    customRules: {
      "/request-password-reset": { window: 60, max: 3 },
      "/reset-password": { window: 60, max: 5 },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      prompt: "select_account",
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      // Not a trusted provider: Google must report the email as verified
      // before it is linked to an existing account. Better Auth also requires
      // the existing account's email to be verified, which blocks someone
      // pre-registering a victim's address with a password.
      trustedProviders: [],
    },
  },

  user: {
    additionalFields: {
      role: {
        type: ["LEARNER", "INSTRUCTOR", "ADMIN"],
        required: false,
        defaultValue: "LEARNER",
        input: false,
      },
      instructorStatus: {
        type: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"],
        required: false,
        input: false,
      },
      accountStatus: {
        type: ["ACTIVE", "SUSPENDED", "REMOVED"],
        required: false,
        defaultValue: "ACTIVE",
        input: false,
      },
      authMethod: {
        type: ["EMAIL", "GOOGLE"],
        required: false,
        defaultValue: "EMAIL",
        input: false,
      },
      certificateName: { type: "string", required: false, input: false },
      instructorApplicationStarted: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        // Runs only for Google sign-ups (email sign-up is disabled above).
        before: async (user) => {
          const state = await getOAuthState<{ flow?: unknown }>();
          // `flow` is client-supplied. It only decides whether we show the
          // instructor expertise form next; it never grants a role. The
          // account becomes an instructor (status PENDING) only when that
          // form is submitted, and only an admin can approve it.
          const startedInstructorSignUp = state?.flow === "instructor";

          return {
            data: {
              ...user,
              role: "LEARNER",
              instructorStatus: null,
              authMethod: "GOOGLE",
              certificateName: user.name,
              instructorApplicationStarted: startedInstructorSignUp,
            },
          };
        },
      },
    },
  },

  // Must be last: lets server actions/route handlers set auth cookies.
  plugins: [nextCookies()],
});
