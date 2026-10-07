"use client";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Play,
  Trophy,
} from "lucide-react";
import { LearnerCourseCard, ProgressBar } from "@/components/academy-ui";
import { Page } from "@/components/page-shell";
import {
  useLearnerRecentActivity,
  useLearnerStreak,
} from "@/hooks/learner/use-dashboard";
import Link from "next/link";
import { useLearnerEnrollments } from "@/hooks/learner/use-enrollments";
import { useCurrentUser } from "@/hooks/auth/use-user";
import { useLearnerAllCourseProgress } from "@/hooks/learner/use-progress";
import { Loader } from "@/components/Loader";
import { getContinueLearningCourse } from "@/lib/course-progress";
import { weekDays } from "@/lib/streak-date";

export default function Dashboard() {
  const {
    data: enrollments,
    isLoading: enrollmentsLoading,
    isError: enrollmentsError,
  } = useLearnerEnrollments();

  const {
    data: allProgress,
    isLoading: progressLoading,
    isError: progressError,
  } = useLearnerAllCourseProgress();

  const { data: streak, isLoading: isStreakLoading } = useLearnerStreak();

  const dashboardLoading =
    enrollmentsLoading || progressLoading || isStreakLoading;

  const dashboardError = enrollmentsError || progressError;

  const progressByCourseId = new Map(
    (allProgress ?? []).map((progress) => [progress.courseId, progress]),
  );

  const enrolledCourses =
    enrollments?.map((enrollment) => ({
      enrollment,
      progress: progressByCourseId.get(enrollment.courseId) ?? null,
    })) ?? [];

  const { data: user } = useCurrentUser();
  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";

  const continueCourse = getContinueLearningCourse(enrolledCourses);

  const resumeHref = continueCourse
    ? `/courses/${continueCourse.enrollment.courseId}`
    : null;

  const {
    data: recentActivity,
    isLoading: activityLoading,
    isError: activityError,
  } = useLearnerRecentActivity();

  const enrolledCourseCount = enrolledCourses.length;

  // Only claim "no courses" once enrollments have actually loaded.
  const hasNoCourses =
    !dashboardLoading && !dashboardError && enrollments?.length === 0;

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const inProgressCourseCount = enrolledCourses.filter(
    ({ progress }) =>
      progress !== null && progress.percentage > 0 && progress.percentage < 100,
  ).length;

  const completedCourseCount = enrolledCourses.filter(
    ({ progress }) => progress?.percentage === 100,
  ).length;

  const overallProgress =
    enrolledCourseCount === 0
      ? 0
      : Math.round(
          enrolledCourses.reduce(
            (total, { progress }) => total + (progress?.percentage ?? 0),
            0,
          ) / enrolledCourseCount,
        );

  return (
    <Page>
      <section className="dashboard-hero">
        <div className="welcome">
          <span className="eyebrow">{today}</span>
          {hasNoCourses ? (
            <>
              <h1 style={{ marginTop: 12 }}>
                Welcome,
                <br />
                {firstName}!
              </h1>
              <p>
                Pick your first course to get started. Short, practical lessons
                you can apply straight away, with progress tracked as you go.
              </p>
            </>
          ) : (
            <>
              <h1 style={{ marginTop: 12 }}>
                Keep the momentum,
                <br />
                {firstName}!
              </h1>
              <p>
                You are building the kind of practical knowledge that shows up
                in the work. A couple of focused sessions this week keeps you on
                track.
              </p>
            </>
          )}
          {resumeHref ? (
            <Link
              href={resumeHref}
              className="button button-primary"
              data-testid="link-resume-learning"
            >
              Resume learning <ArrowRight size={16} />
            </Link>
          ) : (
            <Link
              href="/courses"
              className="button button-primary"
              data-testid="link-browse-courses-hero"
            >
              Browse courses <ArrowRight size={16} />
            </Link>
          )}
        </div>
        <div className="card stat-card" data-testid="card-learning-stats">
          <span className="eyebrow" style={{ color: "var(--brand-green)" }}>
            Your learning
          </span>

          <div>
            <strong>{overallProgress}%</strong>
            <span> overall progress</span>
          </div>

          <ProgressBar
            value={overallProgress}
            label="Overall course progress"
          />

          <small style={{ color: "var(--brand-green)" }}>
            {enrolledCourseCount}{" "}
            {enrolledCourseCount === 1 ? "course" : "courses"} enrolled
            {" · "}
            {inProgressCourseCount} in progress
            {" · "}
            {completedCourseCount} completed
          </small>
        </div>
      </section>

      <div className="section-head">
        <h2>{hasNoCourses ? "Your courses" : "Continue learning"}</h2>

        {!hasNoCourses && (
          <Link
            href="/courses"
            className="button button-ghost"
            data-testid="link-see-all-courses"
          >
            See all courses <ArrowRight size={15} />
          </Link>
        )}
      </div>

      {dashboardLoading && <Loader message="Loading your courses..." />}

      {dashboardError && (
        <div className="card panel" role="alert">
          <p style={{ margin: 0 }}>
            We couldn&apos;t load your courses. Please refresh the page to try
            again.
          </p>
        </div>
      )}

      {hasNoCourses && (
        <div
          className="empty-state card dashboard-empty"
          data-testid="card-no-enrollments"
        >
          <div className="empty-icon">
            <BookOpen size={24} />
          </div>

          <h3>You haven&apos;t enrolled in a course yet</h3>

          <p>
            Browse the catalog, pick a course that fits what you want to learn,
            and it will show up here with your progress.
          </p>

          <Link
            href="/courses"
            className="button button-primary"
            data-testid="link-browse-courses"
          >
            Browse courses
            <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {!dashboardLoading &&
        !dashboardError &&
        enrollments &&
        enrollments.length > 0 && (
          <div className="course-grid">
            {enrolledCourses.map(({ enrollment, progress }, index) => (
              <LearnerCourseCard
                key={enrollment.id}
                enrollment={enrollment}
                progress={progress}
                index={index}
              />
            ))}
          </div>
        )}

      <div className="activity-grid">
        <section className="card panel">
          <div className="section-head">
            <h2>Recent activity</h2>
            <span className="eyebrow">Your trail</span>
          </div>

          {activityLoading && (
            <p style={{ color: "var(--brand-text-muted)", fontSize: 13 }}>
              Loading your activity...
            </p>
          )}

          {activityError && (
            <p style={{ color: "var(--brand-text-muted)", fontSize: 13 }}>
              We couldn&apos;t load your recent activity.
            </p>
          )}

          {!activityLoading &&
            !activityError &&
            recentActivity &&
            recentActivity.length === 0 && (
              <p style={{ color: "var(--brand-text-muted)", fontSize: 13 }}>
                No activity yet. Start learning to see your activity here.
              </p>
            )}

          {!activityLoading &&
            !activityError &&
            recentActivity &&
            recentActivity.length > 0 &&
            recentActivity.map((item) => {
              const Icon =
                item.type === "lesson_completed"
                  ? CheckCircle2
                  : item.type === "quiz_attempted"
                    ? Trophy
                    : Play;

              return (
                <div className="activity" key={item.id}>
                  <div className="activity-marker">
                    <Icon size={15} />
                  </div>

                  <div>
                    <p>{item.text}</p>

                    <span
                      style={{
                        color: "var(--brand-text-muted)",
                        fontSize: 12,
                      }}
                    >
                      {item.course}
                    </span>

                    <time>{new Date(item.createdAt).toLocaleDateString()}</time>
                  </div>
                </div>
              );
            })}
        </section>
        <section className="card streak-card">
          <span className="eyebrow" style={{ color: "var(--brand-red)" }}>
            A useful habit
          </span>

          <h3 style={{ marginTop: 10 }}>
            {streak?.currentStreak ?? 0}{" "}
            {streak?.currentStreak === 1 ? "day" : "days"} in a row.
          </h3>

          <p
            style={{
              color: "var(--brand-red)",
              fontSize: 13,
            }}
          >
            Small, regular practice compounds. Keep your streak alive with one
            lesson today.
          </p>

          <div className="streak-days">
            {weekDays.map((date) => {
              const dateKey = date.toISOString().slice(0, 10);

              const isActive = streak?.activeDays.includes(dateKey);

              return (
                <div className="streak-day" key={dateKey}>
                  <span className={`streak-dot ${isActive ? "active" : ""}`} />

                  {date
                    .toLocaleDateString("en-US", {
                      weekday: "short",
                    })
                    .slice(0, 1)}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </Page>
  );
}
