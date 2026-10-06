"use client";

import { ArrowRight } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/academy-ui";
import { AuthLayout } from "@/components/auth-layout";
import { FormField } from "@/components/form-field";
import {
  expertiseOptions,
  instructorExpertiseSchema,
  type InstructorExpertiseValues,
} from "@/lib/auth";

async function submitApplication(body: object) {
  const response = await fetch("/api/instructor/auth/application", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message ?? "Something went wrong. Please try again.");
  }

  return data as { redirectTo: string };
}

/** Step 2 of a Google instructor sign-up: area of expertise. */
export default function InstructorApplication() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const form = useForm<InstructorExpertiseValues>({
    resolver: zodResolver(instructorExpertiseSchema),
    defaultValues: { expertise: undefined, otherExpertise: "" },
  });
  const selectedExpertise = useWatch({
    control: form.control,
    name: "expertise",
  });

  const submit = async (values: InstructorExpertiseValues) => {
    form.clearErrors("root");

    try {
      const { redirectTo } = await submitApplication(values);
      router.replace(redirectTo);
    } catch (error) {
      form.setError("root", {
        type: "server",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const continueAsLearner = async () => {
    setLeaving(true);

    try {
      const { redirectTo } = await submitApplication({
        continueAsLearner: true,
      });
      router.replace(redirectTo);
    } catch (error) {
      setLeaving(false);
      form.setError("root", {
        type: "server",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <AuthLayout activePage="register">
      <span className="eyebrow">Email verified</span>
      <h2>One more step.</h2>
      <p>
        Tell us what you teach. We review every instructor application before
        you can manage courses.
      </p>
      <form
        onSubmit={form.handleSubmit(submit)}
        noValidate
        data-testid="form-instructor-application"
      >
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
          testId="button-submit-instructor-application"
          disabled={form.formState.isSubmitting || leaving}
        >
          {form.formState.isSubmitting ? (
            "Submitting..."
          ) : (
            <>
              Submit application <ArrowRight size={16} />
            </>
          )}
        </Button>
      </form>
      <div className="auth-switch">
        Changed your mind?{" "}
        <button
          type="button"
          className="link-button"
          onClick={continueAsLearner}
          disabled={form.formState.isSubmitting || leaving}
          data-testid="button-continue-as-learner"
        >
          Use this account as a learner
        </button>
      </div>
    </AuthLayout>
  );
}
