/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { getApiErrorMessage } from "@/lib/api/api-error";

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
  expertise: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

const accountSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Enter a valid email"),

    // Required for any account change (email or password), so a hijacked
    // session can't take the account over.
    currentPassword: z
      .string()
      .min(1, "Enter your current password to change your email or password"),

    newPassword: z.string().optional(),

    confirmNewPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const hasNewPassword = !!data.newPassword;
    const hasConfirmation = !!data.confirmNewPassword;

    if (hasNewPassword && data.newPassword!.length < 8) {
      ctx.addIssue({
        code: "custom",
        message: "New password must be at least 8 characters",
        path: ["newPassword"],
      });
    }

    if (
      (hasNewPassword || hasConfirmation) &&
      data.newPassword !== data.confirmNewPassword
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmNewPassword"],
      });
    }
  });

type AccountValues = z.infer<typeof accountSchema>;

type ManagedAccountValues = {
  email: string;
};

function SavedMessage() {
  return (
    <span className="settings-saved">
      <Check size={14} /> Saved
    </span>
  );
}

export default function InstructorSettings() {
  const { data: settings, isLoading, isError } = useSettings();

  const updateAccount = useUpdateAccount();

  const updateProfile = useUpdateProfile();
  const updateNotifications = useUpdateNotifications();

  const [profileSaved, setProfileSaved] = useState(false);
  const [accountSaved, setAccountSaved] = useState(false);
  const [notificationsSaved, setNotificationsSaved] = useState(false);

  const [courseNotifications, setCourseNotifications] = useState(false);

  const [studentNotifications, setStudentNotifications] = useState(false);

  const profile = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      expertise: "",
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

  const managedAccount = useForm<ManagedAccountValues>({
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (!settings) {
      return;
    }

    profile.reset({
      name: settings.name,
      expertise: settings.expertise ?? "",
    });

    account.reset({
      email: settings.email,
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });

    managedAccount.reset({
      email: settings.email,
    });

    setCourseNotifications(settings.courseUpdatesNotification);

    setStudentNotifications(settings.learnerActivityNotification);
  }, [settings, profile, account, managedAccount]);

  const handleProfileSubmit = async (values: ProfileValues) => {
    setProfileSaved(false);

    try {
      await updateProfile.mutateAsync({
        name: values.name,
      });

      setProfileSaved(true);
    } catch {
      setProfileSaved(false);
    }
  };

  const handleNotificationsSave = async () => {
    setNotificationsSaved(false);

    try {
      await updateNotifications.mutateAsync({
        courseUpdatesNotification: courseNotifications,
        learnerActivityNotification: studentNotifications,
      });

      setNotificationsSaved(true);
    } catch {
      setNotificationsSaved(false);
    }
  };

  const handleAccountSubmit = async (values: AccountValues) => {
    setAccountSaved(false);

    try {
      await updateAccount.mutateAsync({
        email: values.email,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword || undefined,
      });

      setAccountSaved(true);

      account.reset({
        email: values.email,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (error) {
      setAccountSaved(false);
      account.setError("root", {
        message: getApiErrorMessage(error, "Couldn't update your account."),
      });
    }
  };

  if (isLoading) {
    return (
      <Page>
        <div className="settings-head">
          <span className="eyebrow">Instructor account</span>
          <h1>Settings</h1>
        </div>

        <div className="settings-layout">
          <section className="card settings-section">
            <div className="row">
              <Loader2 size={18} className="animate-spin" />
              Loading settings...
            </div>
          </section>
        </div>
      </Page>
    );
  }

  if (isError || !settings) {
    return (
      <Page>
        <Link
          href="/instructor"
          className="row settings-back"
          data-testid="link-back-dashboard"
        >
          <ArrowLeft size={15} />
          Back to instructor dashboard
        </Link>

        <div className="settings-head">
          <span className="eyebrow">Instructor account</span>
          <h1>Settings</h1>
          <p>We could not load your settings. Please try again.</p>
        </div>
      </Page>
    );
  }

  const authMethod = settings.authMethod;

  return (
    <Page>
      <Link
        href="/instructor"
        className="row settings-back"
        data-testid="link-back-dashboard"
      >
        <ArrowLeft size={15} />
        Back to instructor dashboard
      </Link>

      <div className="settings-head">
        <span className="eyebrow">Instructor account</span>

        <h1>Settings</h1>

        <p>
          Manage your instructor profile, account, and notification preferences.
        </p>
      </div>

      <div className="settings-layout">
        {/* ================= PROFILE ================= */}

        <section className="card settings-section">
          <div className="settings-section-heading">
            <div>
              <span className="settings-number">01</span>

              <div>
                <h2>Profile</h2>

                <p>
                  Manage how your name and expertise appear across your
                  instructor workspace.
                </p>
              </div>
            </div>

            {profileSaved && <SavedMessage />}
          </div>

          <form onSubmit={profile.handleSubmit(handleProfileSubmit)} noValidate>
            <FormField
              label="Full name"
              name="name"
              placeholder="Daniel Okafor"
              register={profile.register}
              error={profile.formState.errors.name?.message}
              autoComplete="name"
            />

            <p className="field-help">
              This name may be displayed to learners on the courses you create.
            </p>

            <FormField
              label="Expertise"
              name="expertise"
              placeholder="Frontend Development"
              register={profile.register as typeof profile.register}
            />

            <p className="field-help">
              Tell learners what area you specialize in.
            </p>

            <Button
              type="submit"
              testId="button-save-profile"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save profile"
              )}
            </Button>
          </form>
        </section>

        {/* ================= ACCOUNT ================= */}

        <section className="card settings-section">
          <div className="settings-section-heading">
            <div>
              <span className="settings-number">02</span>

              <div>
                <h2>Account</h2>

                <p>Manage how you sign in to your instructor account.</p>
              </div>
            </div>

            {accountSaved && <SavedMessage />}
          </div>

          {authMethod === "GOOGLE" ? (
            <div className="managed-account">
              <FormField
                label="Email address"
                name="email"
                placeholder={settings.email}
                register={managedAccount.register}
                readOnly
                autoComplete="email"
              />

              <p className="field-help">
                Your account is managed by Google. Update your email through
                your Google account.
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

              <FormField
                label="Current password"
                name="currentPassword"
                type="password"
                placeholder="Enter current password"
                register={account.register}
                error={account.formState.errors.currentPassword?.message}
                autoComplete="current-password"
              />

              <p className="field-help">
                Required to change your email or password. Changing either
                signs you out on your other devices.
              </p>

              <div className="settings-subform">
                <span className="eyebrow">Change password (optional)</span>

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

              {account.formState.errors.root?.message && (
                <div className="form-error" role="alert">
                  {account.formState.errors.root.message}
                </div>
              )}

              <Button
                type="submit"
                testId="button-save-account"
                disabled={updateAccount.isPending}
              >
                {updateAccount.isPending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save account"
                )}
              </Button>
            </form>
          )}
        </section>

        {/* ================= NOTIFICATIONS ================= */}

        <section className="card settings-section">
          <div className="settings-section-heading">
            <div>
              <span className="settings-number">03</span>

              <div>
                <h2>Notifications</h2>

                <p>
                  Choose which important instructor updates you want to receive.
                </p>
              </div>
            </div>

            {notificationsSaved && <SavedMessage />}
          </div>

          <div className="notification-control">
            <div>
              <strong>Course updates</strong>

              <p>
                Receive notifications about changes and activity related to your
                courses.
              </p>
            </div>

            <button
              type="button"
              className={`toggle ${courseNotifications ? "on" : ""}`}
              role="switch"
              aria-checked={courseNotifications}
              onClick={() => {
                setCourseNotifications(!courseNotifications);
                setNotificationsSaved(false);
              }}
              data-testid="toggle-course-notifications"
            >
              <span />

              <span className="sr-only">
                {courseNotifications ? "On" : "Off"}
              </span>
            </button>
          </div>

          <div className="notification-control">
            <div>
              <strong>Learner activity</strong>

              <p>
                Get notified about important learner activity in your courses.
              </p>
            </div>

            <button
              type="button"
              className={`toggle ${studentNotifications ? "on" : ""}`}
              role="switch"
              aria-checked={studentNotifications}
              onClick={() => {
                setStudentNotifications(!studentNotifications);
                setNotificationsSaved(false);
              }}
              data-testid="toggle-student-notifications"
            >
              <span />

              <span className="sr-only">
                {studentNotifications ? "On" : "Off"}
              </span>
            </button>
          </div>

          <Button
            onClick={handleNotificationsSave}
            testId="button-save-notifications"
            disabled={updateNotifications.isPending}
          >
            {updateNotifications.isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save notifications"
            )}
          </Button>
        </section>
      </div>
    </Page>
  );
}
