"use client";

import { Suspense } from "react";
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
  type InstructorRegisterValues,
} from "@/lib/auth";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { useRegisterInstructor } from "@/hooks/auth/use-register";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  googleErrorMessage,
  INSTRUCTOR_REGISTER_PATH,
  INSTRUCTOR_STATUS_PATH,
} from "@/lib/auth/redirects";

/**
 * Invite-only instructor sign-up. Not linked from anywhere in the app — the
 * URL is shared directly with prospective instructors. Accounts still need
 * admin approval before they can manage courses.
 */
export default function InstructorRegister() {
  // useSearchParams needs a Suspense boundary for static rendering.
  return (
    <Suspense>
      <InstructorRegisterContent />
    </Suspense>
  );
}

function InstructorRegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleError = googleErrorMessage(searchParams.get("error"));
  const registerInstructor = useRegisterInstructor();

  const form = useForm<InstructorRegisterValues>({
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
    control: form.control,
    name: "expertise",
  });

  const submit = async (values: InstructorRegisterValues) => {
    form.clearErrors("root");

    const expertise =
      values.expertise === "Other" ? values.otherExpertise : values.expertise;

    if (!expertise) {
      form.setError("root", {
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

      router.push(INSTRUCTOR_STATUS_PATH);
    } catch (error) {
      form.setError("root", {
        type: "server",
        message: getApiErrorMessage(
          error,
          "Unable to create your account. Please try again.",
        ),
      });
    }
  };

  return (
    <AuthLayout activePage="register" registerHref={INSTRUCTOR_REGISTER_PATH}>
      {googleError && (
        <div className="form-error" role="alert" data-testid="error-google">
          {googleError}
        </div>
      )}
      <span className="eyebrow">Teach with KoolTech</span>
      <h2>Share practical expertise.</h2>
      <p>
        Create an instructor account and start managing practical IT courses.
        Every application is reviewed before you can publish.
      </p>
      {/* TODO(google-auth): re-enable once GOOGLE_CLIENT_ID/SECRET are set.
      <div className="auth-step" data-testid="instructor-google-step">
        <strong>Verify your email with Google</strong>
        <span>Then tell us your area of expertise on the next screen.</span>
        <GoogleButton
          flow="instructor"
          errorPath={INSTRUCTOR_REGISTER_PATH}
          label="Verify with Google"
          testId="button-instructor-google"
        />
      </div>
      <div className="auth-divider">
        <span>or sign up with email</span>
      </div>
      */}
      <form
        onSubmit={form.handleSubmit(submit)}
        noValidate
        data-testid="form-instructor-register"
      >
        <FormField
          label="Full name"
          name="name"
          placeholder="Amina Yusuf"
          register={form.register}
          error={form.formState.errors.name?.message}
          autoComplete="name"
        />
        <FormField
          label="Email address"
          name="email"
          type="email"
          placeholder="amina@example.com"
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
          autoComplete="new-password"
        />
        <FormField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          placeholder="Repeat your password"
          register={form.register}
          error={form.formState.errors.confirmPassword?.message}
          autoComplete="new-password"
        />
        <div className="form-field">
          <label htmlFor="expertise">Area of expertise</label>
          <select
            id="expertise"
            aria-invalid={Boolean(form.formState.errors.expertise)}
            {...form.register("expertise")}
            data-testid="select-expertise"
          >
            <option value="">Select your primary domain</option>
            {expertiseOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {form.formState.errors.expertise && (
            <div className="field-error" data-testid="error-expertise">
              {form.formState.errors.expertise.message}
            </div>
          )}
        </div>
        {selectedExpertise === "Other" && (
          <FormField
            label="Tell us your area of expertise"
            name="otherExpertise"
            placeholder="e.g. IT support operations"
            register={form.register}
            error={form.formState.errors.otherExpertise?.message}
            autoComplete="organization-title"
          />
        )}
        {form.formState.errors.root?.message && (
          <div className="form-error" role="alert">
            {form.formState.errors.root.message}
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
      <div className="auth-switch">
        Already have an account?{" "}
        <Link href="/login" data-testid="link-sign-in">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
