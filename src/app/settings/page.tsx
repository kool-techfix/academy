/* eslint-disable  react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { z } from "zod";

import { Button } from "@/components/academy-ui";
import { FormField } from "@/components/form-field";
import { Page } from "@/components/page-shell";

import {
  useSettings,
  useUpdateAccount,
  useUpdateNotifications,
  useUpdateProfile,
} from "@/hooks/use-settings";

const profileSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  certificateName: z
    .string()
    .min(2, "Certificate name must be at least 2 characters"),
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

function SavedMessage() {
  return (
    <span className="settings-saved">
      <Check size={14} /> Saved
    </span>
  );
}

export default function Settings() {
  const { data: settings, isLoading, isError } = useSettings();

  const updateProfile = useUpdateProfile();
  const updateAccount = useUpdateAccount();
  const updateNotifications = useUpdateNotifications();

  const [profileSaved, setProfileSaved] = useState(false);

  const [accountSaved, setAccountSaved] = useState(false);

  const [notificationsSaved, setNotificationsSaved] = useState(false);

  const [courseUpdates, setCourseUpdates] = useState(false);

  const [learnerActivity, setLearnerActivity] = useState(false);

  const profile = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      certificateName: "",
    },
  });

  const account = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  useEffect(() => {
    if (!settings) {
      return;
    }

    profile.reset({
      name: settings.name,
      certificateName: settings.certificateName ?? settings.name,
    });

    account.reset({
      email: settings.email,
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });

    setCourseUpdates(settings.courseUpdatesNotification);

    setLearnerActivity(settings.learnerActivityNotification);
  }, [settings, profile, account]);

  const handleProfileSubmit = async (data: ProfileValues) => {
    try {
      await updateProfile.mutateAsync(data);
      setProfileSaved(true);
    } catch {
      setProfileSaved(false);
    }
  };

  const handleAccountSubmit = async (data: AccountValues) => {
    try {
      await updateAccount.mutateAsync({
        email: data.email,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      account.reset({
        email: data.email,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });

      setAccountSaved(true);
    } catch {
      setAccountSaved(false);
    }
  };

  const handleNotificationsSubmit = async () => {
    try {
      await updateNotifications.mutateAsync({
        courseUpdatesNotification: courseUpdates,
        learnerActivityNotification: learnerActivity,
      });

      setNotificationsSaved(true);
    } catch {
      setNotificationsSaved(false);
    }
  };

  if (isLoading) {
    return (
      <Page>
        <div className="card">
          <p>Loading your settings...</p>
        </div>
      </Page>
    );
  }

  if (isError || !settings) {
    return (
      <Page>
        <div className="card">
          <span className="eyebrow">Your account</span>

          <h1 style={{ marginTop: 10 }}>Unable to load settings</h1>

          <p>We couldn&apos;t load your account settings. Please try again.</p>

          <Link href="/dashboard" className="button button-ghost">
            Back to my learning
          </Link>
        </div>
      </Page>
    );
  }

  const isGoogleAccount = settings.authMethod === "GOOGLE";

  return (
    <Page>
      <Link
        href="/dashboard"
        className="row settings-back"
        data-testid="link-back-dashboard"
      >
        <ArrowLeft size={15} />
        Back to my learning
      </Link>

      <div className="settings-head">
        <span className="eyebrow">Your account</span>

        <h1>Settings</h1>

        <p>Keep your learner details and preferences up to date.</p>
      </div>

      <div className="settings-layout">
        {/* Profile */}

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

          <form onSubmit={profile.handleSubmit(handleProfileSubmit)} noValidate>
            <FormField
              label="Full name"
              name="name"
              placeholder="Your full name"
              register={profile.register}
              error={profile.formState.errors.name?.message}
              autoComplete="name"
            />

            <FormField
              label="Name on certificates"
              name="certificateName"
              placeholder="As it should appear on certificates"
              register={profile.register}
              error={profile.formState.errors.certificateName?.message}
              autoComplete="name"
            />

            <p className="field-help">
              This is the name that will appear on your completion certificates.
            </p>

            <Button
              type="submit"
              disabled={updateProfile.isPending}
              testId="button-save-profile"
            >
              {updateProfile.isPending ? "Saving..." : "Save profile"}
            </Button>
          </form>
        </section>

        {/* Account */}

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

          {isGoogleAccount ? (
            <div className="managed-account">
              <FormField
                label="Email address"
                name="email"
                placeholder={settings.email}
                register={account.register}
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
              onSubmit={account.handleSubmit(handleAccountSubmit)}
              noValidate
            >
              <FormField
                label="Email address"
                name="email"
                type="email"
                placeholder={settings.email}
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

              <Button
                type="submit"
                disabled={updateAccount.isPending}
                testId="button-save-account"
              >
                {updateAccount.isPending ? "Saving..." : "Save account"}
              </Button>
            </form>
          )}
        </section>

        {/* Notifications */}

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
              <strong>Course updates</strong>

              <p>Get updates about courses you&apos;re enrolled in.</p>
            </div>

            <button
              type="button"
              className={`toggle ${courseUpdates ? "on" : ""}`}
              role="switch"
              aria-checked={courseUpdates}
              onClick={() => {
                setCourseUpdates(!courseUpdates);
                setNotificationsSaved(false);
              }}
              data-testid="toggle-course-updates"
            >
              <span />

              <span className="sr-only">{courseUpdates ? "On" : "Off"}</span>
            </button>
          </div>

          <div className="notification-control">
            <div>
              <strong>Learning activity</strong>

              <p>Get notifications about your learner activity.</p>
            </div>

            <button
              type="button"
              className={`toggle ${learnerActivity ? "on" : ""}`}
              role="switch"
              aria-checked={learnerActivity}
              onClick={() => {
                setLearnerActivity(!learnerActivity);
                setNotificationsSaved(false);
              }}
              data-testid="toggle-learner-activity"
            >
              <span />

              <span className="sr-only">{learnerActivity ? "On" : "Off"}</span>
            </button>
          </div>

          <Button
            onClick={handleNotificationsSubmit}
            disabled={updateNotifications.isPending}
            testId="button-save-notifications"
          >
            {updateNotifications.isPending ? "Saving..." : "Save notifications"}
          </Button>
        </section>
      </div>
    </Page>
  );
}
