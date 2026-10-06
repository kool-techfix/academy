import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getOAuthState } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";

import { comparePassword, hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

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
