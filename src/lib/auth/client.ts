"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

type GoogleFlow = "learner" | "instructor";

/**
 * Start "Continue with Google". `/auth/continue` then sends the user to the
 * right place for their (server-decided) role; failures come back to
 * `errorPath` with `?error=<code>`.
 */
export function signInWithGoogle(flow: GoogleFlow, errorPath: string) {
  return authClient.signIn.social({
    provider: "google",
    callbackURL: "/auth/continue",
    errorCallbackURL: errorPath,
    additionalData: { flow },
  });
}
