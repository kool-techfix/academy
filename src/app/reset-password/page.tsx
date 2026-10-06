"use client";

import { ArrowRight } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/academy-ui";
import { AuthLayout } from "@/components/auth-layout";
import { FormField } from "@/components/form-field";
import {
  passwordResetErrorMessage,
  useResetPassword,
} from "@/hooks/auth/use-password-reset";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/auth";

export default function ResetPassword() {
  // useSearchParams needs a Suspense boundary for static rendering.
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

/**
 * Step 2 of the reset flow. The emailed link goes through Better Auth
 * (/api/auth/reset-password/:token), which checks the token and lands here
 * with `?token=…`, or with `?error=INVALID_TOKEN` if it is invalid/expired.
 */
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const linkError = searchParams.get("error");
  const resetPassword = useResetPassword();

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const submit = async ({ password }: ResetPasswordValues) => {
    if (!token) return;

    try {
      await resetPassword.mutateAsync({ token, newPassword: password });
      router.replace("/login?reset=success");
    } catch (error) {
      form.setError("root", {
        type: "server",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  if (linkError || !token) {
    return (
      <AuthLayout activePage="login">
        <span className="eyebrow">Reset password</span>
        <h2>This link can&apos;t be used.</h2>
        <div className="form-error" role="alert" data-testid="error-reset-link">
          {passwordResetErrorMessage(linkError ?? "INVALID_TOKEN")}
        </div>
        <Link
          href="/forgot-password"
          className="button button-primary"
          data-testid="link-request-new-reset"
        >
          Request a new link <ArrowRight size={16} />
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout activePage="login">
      <span className="eyebrow">Reset password</span>
      <h2>Choose a new password.</h2>
      <p>You&apos;ll be signed out on all devices once it&apos;s changed.</p>
      <form
        onSubmit={form.handleSubmit(submit)}
        noValidate
        data-testid="form-reset-password"
      >
        <FormField
          label="New password"
          name="password"
          type="password"
          placeholder="8 characters minimum"
          register={form.register}
          error={form.formState.errors.password?.message}
          autoComplete="new-password"
        />
        <FormField
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          placeholder="Repeat your new password"
          register={form.register}
          error={form.formState.errors.confirmPassword?.message}
          autoComplete="new-password"
        />
        {form.formState.errors.root?.message && (
          <div className="form-error" role="alert">
            {form.formState.errors.root.message}
          </div>
        )}
        <Button
          type="submit"
          testId="button-reset-password"
          disabled={resetPassword.isPending}
        >
          {resetPassword.isPending ? (
            "Saving..."
          ) : (
            <>
              Set new password <ArrowRight size={16} />
            </>
          )}
        </Button>
      </form>
      <div className="auth-switch">
        <Link href="/login" data-testid="link-back-to-login">
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
