"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/academy-ui";
import { AuthLayout } from "@/components/auth-layout";
import { FormField } from "@/components/form-field";
import {
  expertiseOptions,
  instructorRegisterSchema,
  registerSchema,
  type AuthValues,
  type InstructorRegisterValues,
} from "@/lib/auth";
import { setMockAuthMethod, setMockUserRole, type UserRole } from "@/lib/user";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [registrationRole, setRegistrationRole] = useState<UserRole>("learner");
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
  const selectedExpertise = instructorForm.watch("expertise");

  const continueWithGoogle = () => {
    setMockAuthMethod("google");
    setMockUserRole("learner");
    router.push("/dashboard");
  };

  const submitLearnerForm = () => {
    setMockAuthMethod("email");
    setMockUserRole("learner");
    setSuccess(true);
  };

  const submitInstructorForm = () => {
    setMockAuthMethod("email");
    setMockUserRole("instructor");
    router.push("/instructor");
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
          I'm a learner
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
          I'm an instructor
        </button>
      </div>
      {success ? (
        <div className="form-success" data-testid="status-auth-success">
          <strong>Your learner space is ready.</strong>
          <br />
          Taking you to your learning home.
        </div>
      ) : registrationRole === "instructor" ? (
        <>
          <span className="eyebrow">Teach with KoolTech</span>
          <h2>Share practical expertise.</h2>
          <p>
            Create an instructor account and start managing practical IT
            courses.
          </p>
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
            <Button type="submit" testId="button-submit-instructor-register">
              Create instructor account <ArrowRight size={16} />
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
            <Button type="submit" testId="button-submit-auth">
              Create my account <ArrowRight size={16} />
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
