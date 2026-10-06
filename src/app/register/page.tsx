"use client";

import { Suspense, useState } from "react";
import { ArrowRight } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/academy-ui";
import { AuthLayout } from "@/components/auth-layout";
import { FormField } from "@/components/form-field";
// TODO(google-auth): re-enable once GOOGLE_CLIENT_ID/SECRET are set.
// import { GoogleButton } from "@/components/google-button";
import {
  expertiseOptions,
  instructorRegisterSchema,
  registerSchema,
  type AuthValues,
  type InstructorRegisterValues,
} from "@/lib/auth";
import type { UserRole } from "@/lib/user";
import { getApiErrorMessage } from "@/lib/api/api-error";
import {
  useRegisterInstructor,
  useRegisterLearner,
} from "@/hooks/auth/use-register";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { googleErrorMessage, INSTRUCTOR_STATUS_PATH } from "@/lib/auth/redirects";

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
  const [success, setSuccess] = useState(false);
  const [registrationRole, setRegistrationRole] = useState<UserRole>(
    searchParams.get("role") === "instructor" ? "instructor" : "learner",
  );
  const registerLearner = useRegisterLearner();
  const registerInstructor = useRegisterInstructor();

  const learnerForm = useForm<AuthValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });
  const instructorForm = useForm<InstructorRegisterValues>({
    resolver: zodResolver(instructorRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      expertise: undefined,
      otherExpertise: "",
    },
  });
  const selectedExpertise = useWatch({
  control: instructorForm.control,
  name: "expertise",
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

  const submitInstructorForm = async (values: InstructorRegisterValues) => {
    instructorForm.clearErrors("root");

    const expertise =
      values.expertise === "Other" ? values.otherExpertise : values.expertise;

    if (!expertise) {
      instructorForm.setError("root", {
        type: "validation",
        message: "Please provide your area of expertise.",
      });
      return;
    }

    try {
      await registerInstructor.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
        expertise,
      });

      setSuccess(true);
      router.push(INSTRUCTOR_STATUS_PATH);
    } catch (error) {
      instructorForm.setError("root", {
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
      <div
        className="registration-role-switch"
        role="tablist"
        aria-label="Choose account type"
      >
        <button
          type="button"
          role="tab"
          aria-selected={registrationRole === "learner"}
          className={registrationRole === "learner" ? "active" : ""}
          onClick={() => {
            setRegistrationRole("learner");
            setSuccess(false);
          }}
          data-testid="tab-register-learner"
        >
          I&apos;m a learner
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={registrationRole === "instructor"}
          className={registrationRole === "instructor" ? "active" : ""}
          onClick={() => {
            setRegistrationRole("instructor");
            setSuccess(false);
          }}
          data-testid="tab-register-instructor"
        >
          I&apos;m an instructor
        </button>
      </div>
      {googleError && !success && (
        <div className="form-error" role="alert" data-testid="error-google">
          {googleError}
        </div>
      )}
      {success ? (
        <div className="form-success" data-testid="status-auth-success">
          {registrationRole === "instructor" ? (
            <>
              <strong>Your instructor account was created.</strong>
              <br />
              Your account is awaiting approval before you can manage courses.
            </>
          ) : (
            <>
              <strong>Your learner space is ready.</strong>
              <br />
              Taking you to your learning home.
            </>
          )}
        </div>
      ) : registrationRole === "instructor" ? (
        <>
          <span className="eyebrow">Teach with KoolTech</span>
          <h2>Share practical expertise.</h2>
          <p>
            Create an instructor account and start managing practical IT
            courses. Every application is reviewed before you can publish.
          </p>
          {/* TODO(google-auth): re-enable once GOOGLE_CLIENT_ID/SECRET are set.
          <div className="auth-step" data-testid="instructor-google-step">
            <strong>Verify your email with Google</strong>
            <span>
              Then tell us your area of expertise on the next screen.
            </span>
            <GoogleButton
              flow="instructor"
              errorPath="/register?role=instructor"
              label="Verify with Google"
              testId="button-instructor-google"
            />
          </div>
          <div className="auth-divider">
            <span>or sign up with email</span>
          </div>
          */}
          <form
            onSubmit={instructorForm.handleSubmit(submitInstructorForm)}
            noValidate
            data-testid="form-instructor-register"
          >
            <FormField
              label="Full name"
              name="name"
              placeholder="Amina Yusuf"
              register={instructorForm.register}
              error={instructorForm.formState.errors.name?.message}
              autoComplete="name"
            />
            <FormField
              label="Email address"
              name="email"
              type="email"
              placeholder="amina@example.com"
              register={instructorForm.register}
              error={instructorForm.formState.errors.email?.message}
              autoComplete="email"
            />
            <FormField
              label="Password"
              name="password"
              type="password"
              placeholder="8 characters minimum"
              register={instructorForm.register}
              error={instructorForm.formState.errors.password?.message}
              autoComplete="new-password"
            />
            <FormField
              label="Confirm password"
              name="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              register={instructorForm.register}
              error={instructorForm.formState.errors.confirmPassword?.message}
              autoComplete="new-password"
            />
            <div className="form-field">
              <label htmlFor="expertise">Area of expertise</label>
              <select
                id="expertise"
                aria-invalid={Boolean(
                  instructorForm.formState.errors.expertise,
                )}
                {...instructorForm.register("expertise")}
                data-testid="select-expertise"
              >
                <option value="">Select your primary domain</option>
                {expertiseOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {instructorForm.formState.errors.expertise && (
                <div className="field-error" data-testid="error-expertise">
                  {instructorForm.formState.errors.expertise.message}
                </div>
              )}
            </div>
            {selectedExpertise === "Other" && (
              <FormField
                label="Tell us your area of expertise"
                name="otherExpertise"
                placeholder="e.g. IT support operations"
                register={instructorForm.register}
                error={instructorForm.formState.errors.otherExpertise?.message}
                autoComplete="organization-title"
              />
            )}
            {instructorForm.formState.errors.root?.message && (
              <div className="form-error" role="alert">
                {instructorForm.formState.errors.root.message}
              </div>
            )}
            <Button
              type="submit"
              testId="button-submit-instructor-register"
              disabled={registerInstructor.isPending}
            >
              {registerInstructor.isPending ? (
                "Creating account..."
              ) : (
                <>
                  Create instructor account <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>
        </>
      ) : (
        <>
          <span className="eyebrow">Start here</span>
          <h2>Make the next move.</h2>
          <p>Create a learner account and keep your progress in one place.</p>
          <form
            onSubmit={learnerForm.handleSubmit(submitLearnerForm)}
            noValidate
          >
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
        </>
      )}
      <div className="auth-switch">
        Already have an account?{" "}
        <Link href="/login" data-testid="link-sign-in">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
