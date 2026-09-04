"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/academy-ui";
import { FormField } from "@/components/form-field";
import { Page } from "@/components/page-shell";
import { mockUser, getMockAuthMethod } from "@/lib/user";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
});
type ProfileValues = z.infer<typeof profileSchema>;

const accountSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });
type AccountValues = z.infer<typeof accountSchema>;
type ManagedAccountValues = { email: string };

function SavedMessage() {
  return (
    <span className="settings-saved">
      <Check size={14} /> Saved
    </span>
  );
}

export default function Settings() {
  const authMethod = getMockAuthMethod();
  const [profileSaved, setProfileSaved] = useState(false);
  const [accountSaved, setAccountSaved] = useState(false);
  const [notificationsSaved, setNotificationsSaved] = useState(false);
  const [reminders, setReminders] = useState(mockUser.reminders);
  const [frequency, setFrequency] = useState(mockUser.reminderFrequency);

  const profile = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: mockUser.name },
  });
  const account = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      email: mockUser.email,
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });
  const managedAccount = useForm<ManagedAccountValues>({
    defaultValues: { email: mockUser.email },
  });

  return (
    <Page>
      <Link
        href="/dashboard"
        className="row settings-back"
        data-testid="link-back-dashboard"
      >
        <ArrowLeft size={15} /> Back to my learning
      </Link>
      <div className="settings-head">
        <span className="eyebrow">Your account</span>
        <h1>Settings</h1>
        <p>Keep your learner details and preferences up to date.</p>
      </div>

      <div className="settings-layout">
        <section className="card settings-section">
          <div className="settings-section-heading">
            <div>
              <span className="settings-number">01</span>
              <div>
                <h2>Profile</h2>
                <p>The name used across your learning space.</p>
              </div>
            </div>
            {profileSaved && <SavedMessage />}
          </div>
          <form
            onSubmit={profile.handleSubmit(() => setProfileSaved(true))}
            noValidate
          >
            <FormField
              label="Full name"
              name="name"
              placeholder="Daniel Okafor"
              register={profile.register}
              error={profile.formState.errors.name?.message}
              autoComplete="name"
            />
            <p className="field-help">
              This is the name that will appear on your completion certificates.
            </p>
            <Button type="submit" testId="button-save-profile">
              Save profile
            </Button>
          </form>
        </section>

        <section className="card settings-section">
          <div className="settings-section-heading">
            <div>
              <span className="settings-number">02</span>
              <div>
                <h2>Account</h2>
                <p>How you sign in to KoolTech.</p>
              </div>
            </div>
            {accountSaved && <SavedMessage />}
          </div>
          {authMethod === "google" ? (
            <div className="managed-account">
              <FormField
                label="Email address"
                name="email"
                placeholder={mockUser.email}
                register={managedAccount.register}
                readOnly
                autoComplete="email"
              />
              <p className="field-help">
                Managed by your Google account. Update your email through
                Google.
              </p>
            </div>
          ) : (
            <form
              onSubmit={account.handleSubmit(() => setAccountSaved(true))}
              noValidate
            >
              <FormField
                label="Email address"
                name="email"
                type="email"
                placeholder={mockUser.email}
                register={account.register}
                error={account.formState.errors.email?.message}
                autoComplete="email"
              />
              <div className="settings-subform">
                <span className="eyebrow">Change password</span>
                <FormField
                  label="Current password"
                  name="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  register={account.register}
                  error={account.formState.errors.currentPassword?.message}
                  autoComplete="current-password"
                />
                <div className="settings-form-grid">
                  <FormField
                    label="New password"
                    name="newPassword"
                    type="password"
                    placeholder="8 characters minimum"
                    register={account.register}
                    error={account.formState.errors.newPassword?.message}
                    autoComplete="new-password"
                  />
                  <FormField
                    label="Confirm new password"
                    name="confirmNewPassword"
                    type="password"
                    placeholder="Repeat new password"
                    register={account.register}
                    error={account.formState.errors.confirmNewPassword?.message}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <Button type="submit" testId="button-save-account">
                Save account
              </Button>
            </form>
          )}
        </section>

        <section className="card settings-section">
          <div className="settings-section-heading">
            <div>
              <span className="settings-number">03</span>
              <div>
                <h2>Notifications</h2>
                <p>Choose how KoolTech keeps you moving.</p>
              </div>
            </div>
            {notificationsSaved && <SavedMessage />}
          </div>
          <div className="notification-control">
            <div>
              <strong>Lesson reminders</strong>
              <p>Get a gentle nudge when it is time to keep learning.</p>
            </div>
            <button
              type="button"
              className={`toggle ${reminders ? "on" : ""}`}
              role="switch"
              aria-checked={reminders}
              onClick={() => {
                setReminders(!reminders);
                setNotificationsSaved(false);
              }}
              data-testid="toggle-lesson-reminders"
            >
              <span />
              <span className="sr-only">{reminders ? "On" : "Off"}</span>
            </button>
          </div>
          {reminders && (
            <fieldset className="frequency-options">
              <legend>Reminder frequency</legend>
              <label>
                <input
                  type="radio"
                  name="frequency"
                  value="daily"
                  checked={frequency === "daily"}
                  onChange={() => {
                    setFrequency("daily");
                    setNotificationsSaved(false);
                  }}
                />{" "}
                Daily
              </label>
              <label>
                <input
                  type="radio"
                  name="frequency"
                  value="few-times"
                  checked={frequency === "few-times"}
                  onChange={() => {
                    setFrequency("few-times");
                    setNotificationsSaved(false);
                  }}
                />{" "}
                A few times a week
              </label>
            </fieldset>
          )}
          <Button
            onClick={() => setNotificationsSaved(true)}
            testId="button-save-notifications"
          >
            Save notifications
          </Button>
        </section>
      </div>
    </Page>
  );
}
