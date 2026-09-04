"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/academy-ui";
import { AuthLayout } from "@/components/auth-layout";
import { FormField } from "@/components/form-field";
import { loginSchema, type AuthValues } from "@/lib/auth";
import { setMockAuthMethod } from "@/lib/user";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const form = useForm<AuthValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const continueWithGoogle = () => {
    setMockAuthMethod("google");
    router.push("/dashboard");
  };

  return (
    <AuthLayout activePage="login">
      {success ? (
        <div className="form-success" data-testid="status-auth-success">
          <strong>You are signed in.</strong>
          <br />
          Taking you to your learning home.
        </div>
      ) : (
        <>
          <span className="eyebrow">Welcome back</span>
          <h2>Good to see you.</h2>
          <p>Sign in to pick up exactly where you left off.</p>
          <form onSubmit={form.handleSubmit(() => setSuccess(true))} noValidate>
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
            <Button type="submit" testId="button-submit-auth">
              Sign in <ArrowRight size={16} />
            </Button>
          </form>
          <div className="auth-divider">
            <span>or</span>
          </div>
          <Button
            variant="secondary"
            onClick={continueWithGoogle}
            testId="button-continue-google"
          >
            <span className="google-mark" aria-hidden="true">
              G
            </span>{" "}
            Continue with Google
          </Button>
          <div className="auth-switch">
            New to KoolTech?{" "}
            <Link href="/register" data-testid="link-create-account">
              Create an account
            </Link>
          </div>
        </>
      )}
    </AuthLayout>
  );
}
