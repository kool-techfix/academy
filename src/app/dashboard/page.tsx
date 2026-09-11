"use client";

import { ArrowRight, CheckCircle2, Play, Trophy } from "lucide-react";
import { LearnerCourseCard, ProgressBar } from "@/components/academy-ui";
import { Page } from "@/components/page-shell";
import { useLearnerRecentActivity } from "@/hooks/learner/use-dashboard";
import Link from "next/link";
import { useLearnerEnrollments } from "@/hooks/learner/use-enrollments";
import { useCurrentUser } from "@/hooks/auth/use-user";
import { useLearnerAllCourseProgress } from "@/hooks/learner/use-progress";
import { Loader } from "@/components/Loader";
import { getContinueLearningCourse } from "@/lib/course-progress";

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

  const dashboardLoading = enrollmentsLoading || progressLoading;

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
          <span className="eyebrow">Tuesday, 18 June 2024</span>
          <h1 style={{ marginTop: 12 }}>
            Keep the momentum,
            <br />
            {firstName}!
          </h1>
          <p>
            You are building the kind of practical knowledge that shows up in
            the work. Two focused sessions this week and you are on track.
          </p>
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
              href="/catalog"
              className="button button-primary"
              data-testid="link-resume-learning"
            >
              Browse courses <ArrowRight size={16} />
            </Link>
          )}
        </div>
        <div className="card stat-card" data-testid="card-learning-stats">
          <span className="eyebrow" style={{ color: "#696b39" }}>
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

          <small style={{ color: "#696b39" }}>
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
        <h2>Continue learning</h2>

        <Link
          href="/courses"
          className="button button-ghost"
          data-testid="link-see-all-courses"
        >
          See all courses <ArrowRight size={15} />
        </Link>
      </div>

      {dashboardLoading && <Loader message="Loading your courses..." />}

      {dashboardError && (
        <div className="card">
          <p>We couldn't load your courses. Please try again.</p>
        </div>
      )}

      {!dashboardLoading && !dashboardError && enrollments?.length === 0 && (
        <div className="card">
          <h3>No courses yet</h3>
          <p>You haven't enrolled in any courses yet.</p>

          <Link href="/catalog" className="button button-primary">
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
    <p style={{ color: "#77766f", fontSize: 13 }}>
      Loading your activity...
    </p>
  )}

  {activityError && (
    <p style={{ color: "#77766f", fontSize: 13 }}>
      We couldn't load your recent activity.
    </p>
  )}

  {!activityLoading &&
    !activityError &&
    recentActivity &&
    recentActivity.length === 0 && (
      <p style={{ color: "#77766f", fontSize: 13 }}>
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
        <div
          className="activity"
          key={item.id}
        >
          <div className="activity-marker">
            <Icon size={15} />
          </div>

          <div>
            <p>{item.text}</p>

            <span
              style={{
                color: "#77766f",
                fontSize: 12,
              }}
            >
              {item.course}
            </span>

            <time>
              {new Date(item.createdAt).toLocaleDateString()}
            </time>
          </div>
        </div>
      );
    })}
</section>
        <section className="card streak-card">
          <span className="eyebrow" style={{ color: "#7d4c48" }}>
            A useful habit
          </span>
          <h3 style={{ marginTop: 10 }}>Three days in a row.</h3>
          <p style={{ color: "#7d4c48", fontSize: 13 }}>
            Small, regular practice compounds. Keep your streak alive with one
            lesson today.
          </p>
          <div className="streak-days">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
              <div className="streak-day" key={`${day}-${index}`}>
                <span className={`streak-dot ${index < 3 ? "active" : ""}`} />
                {day}
              </div>
            ))}
          </div>
        </section>
      </div>
    </Page>
  );
}
