"use client";

import { Suspense, useState } from "react";

import { ArrowRight } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/academy-ui";
import { AuthLayout } from "@/components/auth-layout";
import { FormField } from "@/components/form-field";
// TODO(google-auth): re-enable once GOOGLE_CLIENT_ID/SECRET are set.
// import { GoogleButton } from "@/components/google-button";

import {
  loginSchema,
  type AuthValues,
} from "@/lib/auth";

import { googleErrorMessage, homePathFor } from "@/lib/auth/redirects";
import { useLogin } from "@/hooks/auth/use-login";
import { getApiErrorMessage } from "@/lib/api/api-error";

export default function Login() {
  // useSearchParams needs a Suspense boundary for static rendering.
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const googleError = googleErrorMessage(useSearchParams().get("error"));

  const [success, setSuccess] = useState(false);

  const login = useLogin();

  const form = useForm<AuthValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (values: AuthValues) => {
    try {
      const { user } = await login.mutateAsync({
        email: values.email,
        password: values.password,
      });

      setSuccess(true);

      router.push(homePathFor(user));
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Unable to sign in. Please try again.",
      );

      form.setError("root", {
        type: "server",
        message,
      });
    }
  };

  return (
    <AuthLayout activePage="login">
      {success ? (
        <div
          className="form-success"
          data-testid="status-auth-success"
        >
          <strong>You are signed in.</strong>
          <br />
          Taking you to your learning home.
        </div>
      ) : (
        <>
          <span className="eyebrow">Welcome back</span>

          <h2>Good to see you.</h2>

          <p>
            Sign in to pick up exactly where you left off.
          </p>

          {googleError && (
            <div className="form-error" role="alert" data-testid="error-google">
              {googleError}
            </div>
          )}

          <form
            onSubmit={form.handleSubmit(handleLogin)}
            noValidate
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

            <FormField
              label="Password"
              name="password"
              type="password"
              placeholder="8 characters minimum"
              register={form.register}
              error={form.formState.errors.password?.message}
              autoComplete="current-password"
            />

            {form.formState.errors.root?.message && (
              <div
                className="form-error"
                role="alert"
              >
                {form.formState.errors.root.message}
              </div>
            )}

            <Button
              type="submit"
              testId="button-submit-auth"
              disabled={login.isPending}
            >
              {login.isPending ? (
                "Signing in..."
              ) : (
                <>
                  Sign in <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>

          {/* TODO(google-auth): re-enable once GOOGLE_CLIENT_ID/SECRET are set.
          <div className="auth-divider">
            <span>or</span>
          </div>

          <GoogleButton flow="learner" errorPath="/login" />
          */}

          <div className="auth-switch">
            New to KoolTech?{" "}
            <Link
              href="/register"
              data-testid="link-create-account"
            >
              Create an account
            </Link>
          </div>
        </>
      )}
    </AuthLayout>
  );
}