"use client";

import { useMutation } from "@tanstack/react-query";

import { authClient } from "@/lib/auth/client";

/** Where the emailed link lands once Better Auth has checked the token. */
const RESET_PAGE_PATH = "/reset-password";

const RESET_ERROR_MESSAGES: Record<string, string> = {
  INVALID_TOKEN: "This reset link is invalid or has expired. Request a new one.",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters.",
  PASSWORD_TOO_LONG: "Password must be 128 characters or fewer.",
  TOO_MANY_REQUESTS: "Too many attempts. Please wait a minute and try again.",
};

export function passwordResetErrorMessage(code: string | null | undefined) {
  return (
    (code && RESET_ERROR_MESSAGES[code]) ??
    "Something went wrong. Please try again."
  );
}

type BetterAuthError = { code?: string; status?: number } | null;

function toError(error: BetterAuthError) {
  const code = error?.status === 429 ? "TOO_MANY_REQUESTS" : error?.code;

  return new Error(passwordResetErrorMessage(code));
}

/**
 * Step 1: email a reset link. Always "succeeds" for unknown emails too, so
 * the form never reveals whether an account exists.
 */
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: RESET_PAGE_PATH,
      });

      if (error) throw toError(error);
    },
  });
}

/** Step 2: set the new password with the token from the emailed link. */
export function useResetPassword() {
  return useMutation({
    mutationFn: async ({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) => {
      const { error } = await authClient.resetPassword({ token, newPassword });

      if (error) throw toError(error);
    },
  });
}
