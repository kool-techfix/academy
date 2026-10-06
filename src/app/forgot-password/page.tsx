"use client";

import { ArrowRight } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { Button } from "@/components/academy-ui";
import { AuthLayout } from "@/components/auth-layout";
import { FormField } from "@/components/form-field";
import { useRequestPasswordReset } from "@/hooks/auth/use-password-reset";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/auth";

/** Step 1 of the reset flow: ask for the account email. */
export default function ForgotPassword() {
  const requestReset = useRequestPasswordReset();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const submit = async ({ email }: ForgotPasswordValues) => {
    try {
      await requestReset.mutateAsync(email);
    } catch (error) {
      form.setError("root", {
        type: "server",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <AuthLayout activePage="login">
      {requestReset.isSuccess ? (
        <>
          <span className="eyebrow">Check your inbox</span>
          <h2>Reset link sent.</h2>
          <div className="form-success" data-testid="status-reset-requested">
            If an account exists for <strong>{form.getValues("email")}</strong>,
            we&apos;ve emailed a link to reset your password. It expires in 60
            minutes and can only be used once.
          </div>
          <p>
            Didn&apos;t get it? Check your spam folder, or{" "}
            <button
              type="button"
              className="link-button"
              onClick={() => requestReset.reset()}
              data-testid="button-try-again"
            >
              try again
            </button>
            .
          </p>
        </>
      ) : (
        <>
          <span className="eyebrow">Forgot password</span>
          <h2>Reset your password.</h2>
          <p>
            Enter the email you signed up with and we&apos;ll send you a link
            to choose a new password.
          </p>
          <form
            onSubmit={form.handleSubmit(submit)}
            noValidate
            data-testid="form-forgot-password"
          >
            <FormField
              label="Email address"
              name="email"
              type="email"
              placeholder="daniel@example.com"
              register={form.register}
              error={form.formState.errors.email?.message}
              autoComplete="email"
            />
            {form.formState.errors.root?.message && (
              <div className="form-error" role="alert">
                {form.formState.errors.root.message}
              </div>
            )}
            <Button
              type="submit"
              testId="button-send-reset-link"
              disabled={requestReset.isPending}
            >
              {requestReset.isPending ? (
                "Sending..."
              ) : (
                <>
                  Send reset link <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>
        </>
      )}
      <div className="auth-switch">
        Remembered it?{" "}
        <Link href="/login" data-testid="link-back-to-login">
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
