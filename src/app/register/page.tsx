"use client";

import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/academy-ui";
import { AuthLayout } from "@/components/auth-layout";
import { FormField } from "@/components/form-field";
// TODO(google-auth): re-enable once GOOGLE_CLIENT_ID/SECRET are set.
// import { GoogleButton } from "@/components/google-button";
import { registerSchema, type AuthValues } from "@/lib/auth";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { useRegisterLearner } from "@/hooks/auth/use-register";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { googleErrorMessage } from "@/lib/auth/redirects";

/**
 * Public sign-up — learners only. Instructors sign up through the
 * invite-only page at INSTRUCTOR_REGISTER_PATH.
 */
export default function Register() {
  // useSearchParams needs a Suspense boundary for static rendering.
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleError = googleErrorMessage(searchParams.get("error"));
  const registerLearner = useRegisterLearner();

  const learnerForm = useForm<AuthValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const submitLearnerForm = async (values: AuthValues) => {
    learnerForm.clearErrors("root");

    try {
      await registerLearner.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      router.push("/dashboard");
    } catch (error) {
      learnerForm.setError("root", {
        type: "server",
        message: getApiErrorMessage(
          error,
          "Unable to create your account. Please try again.",
        ),
      });
    }
  };

  return (
    <AuthLayout activePage="register">
      {googleError && (
        <div className="form-error" role="alert" data-testid="error-google">
          {googleError}
        </div>
      )}
      <span className="eyebrow">Start here</span>
      <h2>Make the next move.</h2>
      <p>Create a learner account and keep your progress in one place.</p>
      <form onSubmit={learnerForm.handleSubmit(submitLearnerForm)} noValidate>
        <FormField
          label="Your name"
          name="name"
          placeholder="Daniel Okafor"
          register={learnerForm.register}
          error={learnerForm.formState.errors.name?.message}
          autoComplete="name"
        />
        <FormField
          label="Email address"
          name="email"
          type="email"
          placeholder="daniel@example.com"
          register={learnerForm.register}
          error={learnerForm.formState.errors.email?.message}
          autoComplete="email"
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          placeholder="8 characters minimum"
          register={learnerForm.register}
          error={learnerForm.formState.errors.password?.message}
          autoComplete="new-password"
        />
        <FormField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          placeholder="Repeat your password"
          register={learnerForm.register}
          error={learnerForm.formState.errors.confirmPassword?.message}
          autoComplete="new-password"
        />
        {learnerForm.formState.errors.root?.message && (
          <div className="form-error" role="alert">
            {learnerForm.formState.errors.root.message}
          </div>
        )}
        <Button
          type="submit"
          testId="button-submit-auth"
          disabled={registerLearner.isPending}
        >
          {registerLearner.isPending ? (
            "Creating account..."
          ) : (
            <>
              Create my account <ArrowRight size={16} />
            </>
          )}
        </Button>
      </form>
      {/* TODO(google-auth): re-enable once GOOGLE_CLIENT_ID/SECRET are set.
      <div className="auth-divider">
        <span>or</span>
      </div>
      <GoogleButton flow="learner" errorPath="/register" />
      */}
      <div className="auth-switch">
        Already have an account?{" "}
        <Link href="/login" data-testid="link-sign-in">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
